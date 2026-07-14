import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  })
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function validUsername(value: string) {
  return /^[a-z0-9._-]{3,32}$/.test(value)
}

function validPin(value: string) {
  return /^\d{4}$/.test(value)
}

async function deriveAuthPassword(username: string, pin: string) {
  const pepper = Deno.env.get('PLMR_PIN_PEPPER') ?? ''
  if (!pepper) throw new Error('PIN_PEPPER_MISSING')
  const input = new TextEncoder().encode(`${pepper}|${username}|${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', input)
  const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return `P!${hex}`
}

async function hashLoginBucket(kind: 'username' | 'ip', value: string) {
  const pepper = Deno.env.get('PLMR_PIN_PEPPER') ?? ''
  if (!pepper) throw new Error('PIN_PEPPER_MISSING')
  const input = new TextEncoder().encode(`${pepper}|rate-limit|${kind}|${value}`)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

function requestIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return (forwarded || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown').slice(0, 128)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'FUNCTION_SECRETS_MISSING' }, 500)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, 400)
  }

  const action = text(body.action)
  if (action === 'health') return json({ ok: true, version: '11.2', function: 'admin-users' })

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Public login route. It accepts only username + 4-digit PIN and never exposes
  // the internal Supabase Auth email or derived password to the browser.
  if (action === 'login') {
    const username = text(body.username).toLowerCase()
    const pin = text(body.pin)
    let usernameHash = ''
    let ipHash = ''
    try {
      usernameHash = await hashLoginBucket('username', username.slice(0, 64))
      ipHash = await hashLoginBucket('ip', requestIp(req))
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
    }

    const preflight = await adminClient.rpc('pin_login_preflight_v1', {
      p_username_hash: usernameHash,
      p_ip_hash: ipHash,
    })
    if (preflight.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
    const preflightRow = Array.isArray(preflight.data) ? preflight.data[0] : preflight.data
    if (preflightRow && preflightRow.allowed === false) {
      const retryAfter = Math.max(1, Number(preflightRow.retry_after_seconds) || 60)
      return json({ error: 'LOGIN_RATE_LIMITED', retry_after_seconds: retryAfter }, 429, { 'Retry-After': String(retryAfter) })
    }

    const recordAttempt = async (success: boolean, reason: string) => {
      const result = await adminClient.rpc('record_pin_login_attempt_v1', {
        p_username_hash: usernameHash,
        p_ip_hash: ipHash,
        p_success: success,
        p_reason: reason,
      })
      if (result.error) throw new Error('LOGIN_RATE_LIMIT_UNAVAILABLE')
      return Array.isArray(result.data) ? result.data[0] : result.data
    }

    const failedLogin = async (reason: string) => {
      let rate: Record<string, unknown> | null = null
      try {
        rate = await recordAttempt(false, reason) as Record<string, unknown> | null
      } catch {
        return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
      }
      const retryAfter = Math.max(0, Number(rate?.retry_after_seconds) || 0)
      if (retryAfter > 0) {
        return json({ error: 'LOGIN_RATE_LIMITED', retry_after_seconds: retryAfter }, 429, { 'Retry-After': String(retryAfter) })
      }
      return json({ error: 'INVALID_LOGIN' }, 401)
    }

    if (!validUsername(username) || !validPin(pin)) {
      return await failedLogin('INVALID_FORMAT')
    }

    const profileResult = await adminClient
      .from('profiles')
      .select('id, organization_id, email, is_active, username, full_name, role')
      .eq('username', username)
      .maybeSingle()

    const profile = profileResult.data
    if (profileResult.error || !profile || profile.is_active !== true || !profile.email) {
      return await failedLogin('INVALID_IDENTITY')
    }

    const orgResult = await adminClient
      .from('organizations')
      .select('is_active, license_start, license_end')
      .eq('id', profile.organization_id)
      .maybeSingle()

    const organization = orgResult.data
    const today = new Date().toISOString().slice(0, 10)
    if (
      orgResult.error || !organization || organization.is_active !== true ||
      (organization.license_start && today < organization.license_start) ||
      (organization.license_end && today > organization.license_end)
    ) {
      return await failedLogin('ORGANIZATION_BLOCKED')
    }

    let password = ''
    try {
      password = await deriveAuthPassword(username, pin)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const loginResult = await authClient.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (loginResult.error || !loginResult.data.session) {
      return await failedLogin('INVALID_CREDENTIALS')
    }

    const authenticatedUserId = loginResult.data.user?.id ?? loginResult.data.session.user?.id ?? ''
    if (!authenticatedUserId || authenticatedUserId !== profile.id) {
      return await failedLogin('IDENTITY_MISMATCH')
    }

    try {
      await recordAttempt(true, 'LOGIN_SUCCESS')
    } catch {
      await authClient.auth.signOut().catch(() => {})
      return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
    }

    return json({
      ok: true,
      user_id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      role: profile.role,
      organization_id: profile.organization_id,
      session: {
        access_token: loginResult.data.session.access_token,
        refresh_token: loginResult.data.session.refresh_token,
      },
    })
  }

  if (!['create', 'set_pin', 'delete_user', 'delete_organization', 'login_lock_status', 'reset_login_lock', 'change_own_username', 'global_logout'].includes(action)) {
    return json({ error: 'ACTION_INVALID' }, 400)
  }

  // Admin routes require an authenticated user token.
  const authHeader = req.headers.get('Authorization') ?? ''
  const accessToken = authHeader.replace(/^Bearer\s+/i, '')
  if (!accessToken) return json({ error: 'AUTH_REQUIRED' }, 401)

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const userResult = await userClient.auth.getUser()
  const actor = userResult.data.user
  if (userResult.error || !actor) return json({ error: 'AUTH_INVALID' }, 401)

  const actorResult = await adminClient
    .from('profiles')
    .select('id, organization_id, role, is_active, username, full_name')
    .eq('id', actor.id)
    .single()

  const actorProfile = actorResult.data
  if (actorResult.error || !actorProfile || actorProfile.is_active !== true) {
    return json({ error: 'ADMIN_REQUIRED' }, 403)
  }
  if (!['system_admin', 'company_admin'].includes(actorProfile.role)) {
    return json({ error: 'ADMIN_REQUIRED' }, 403)
  }

  if (action === 'login_lock_status' || action === 'reset_login_lock') {
    if (actorProfile.role !== 'system_admin') {
      return json({ error: 'SYSTEM_ADMIN_REQUIRED' }, 403)
    }

    const targetUserId = text(body.userId)
    if (!targetUserId) return json({ error: 'USER_REQUIRED' }, 400)

    const targetResult = await adminClient
      .from('profiles')
      .select('id, organization_id, username, full_name, is_active')
      .eq('id', targetUserId)
      .single()

    const target = targetResult.data
    if (targetResult.error || !target) return json({ error: 'USER_NOT_FOUND' }, 404)

    let usernameHash = ''
    try {
      usernameHash = await hashLoginBucket('username', text(target.username).toLowerCase())
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
    }

    const auditResult = await adminClient
      .from('pin_login_audit')
      .select('ip_hash, success, reason, attempted_at')
      .eq('username_hash', usernameHash)
      .order('attempted_at', { ascending: false })
      .limit(50)

    if (auditResult.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
    const auditRows = auditResult.data ?? []
    const recentIpHashes = Array.from(new Set(auditRows.map(row => text(row.ip_hash)).filter(Boolean)))

    if (action === 'reset_login_lock') {
      const includeRecentIpBuckets = body.includeRecentIpBuckets !== false
      const deleteUsername = await adminClient
        .from('pin_login_buckets')
        .delete()
        .eq('bucket_type', 'username')
        .eq('bucket_hash', usernameHash)
      if (deleteUsername.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)

      let clearedIpBucketCount = 0
      if (includeRecentIpBuckets && recentIpHashes.length > 0) {
        const existingIpBuckets = await adminClient
          .from('pin_login_buckets')
          .select('bucket_hash')
          .eq('bucket_type', 'ip')
          .in('bucket_hash', recentIpHashes)
        if (existingIpBuckets.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
        clearedIpBucketCount = (existingIpBuckets.data ?? []).length
        const deleteIps = await adminClient
          .from('pin_login_buckets')
          .delete()
          .eq('bucket_type', 'ip')
          .in('bucket_hash', recentIpHashes)
        if (deleteIps.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
      }

      const logResult = await adminClient.from('activity_logs').insert({
        organization_id: target.organization_id,
        user_id: actor.id,
        username_snapshot: actorProfile.username,
        full_name_snapshot: actorProfile.full_name,
        action: 'login_lock_reset',
        detail: {
          target_user_id: target.id,
          target_username: target.username,
          cleared_username_bucket: true,
          cleared_recent_ip_bucket_count: clearedIpBucketCount,
        },
      })

      return json({
        ok: true,
        target: { id: target.id, username: target.username, full_name: target.full_name },
        clearedUsernameBucket: true,
        clearedRecentIpBucketCount: clearedIpBucketCount,
        logRecorded: !logResult.error,
      })
    }

    const usernameBucketResult = await adminClient
      .from('pin_login_buckets')
      .select('failure_count, window_started_at, last_attempt_at, locked_until')
      .eq('bucket_type', 'username')
      .eq('bucket_hash', usernameHash)
      .maybeSingle()
    if (usernameBucketResult.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)

    let ipBuckets: Array<Record<string, unknown>> = []
    if (recentIpHashes.length > 0) {
      const ipBucketResult = await adminClient
        .from('pin_login_buckets')
        .select('bucket_hash, failure_count, window_started_at, last_attempt_at, locked_until')
        .eq('bucket_type', 'ip')
        .in('bucket_hash', recentIpHashes)
      if (ipBucketResult.error) return json({ error: 'LOGIN_RATE_LIMIT_UNAVAILABLE' }, 503)
      ipBuckets = (ipBucketResult.data ?? []).map(row => ({
        hash_hint: text(row.bucket_hash).slice(0, 12),
        failure_count: row.failure_count,
        window_started_at: row.window_started_at,
        last_attempt_at: row.last_attempt_at,
        locked_until: row.locked_until,
      }))
    }

    return json({
      ok: true,
      target: { id: target.id, username: target.username, full_name: target.full_name, is_active: target.is_active },
      usernameBucket: usernameBucketResult.data ?? null,
      recentIpBuckets: ipBuckets,
      recentAttempts: auditRows.slice(0, 20).map(row => ({
        success: row.success,
        reason: row.reason,
        attempted_at: row.attempted_at,
        ip_hash_hint: text(row.ip_hash).slice(0, 12),
      })),
    })
  }

  if (action === 'global_logout') {
    if (actorProfile.role !== 'system_admin') return json({ error: 'SYSTEM_ADMIN_REQUIRED' }, 403)
    const revokedAt = new Date().toISOString()
    const commitResult = await adminClient.rpc('commit_global_logout_v1', {
      p_actor_id: actor.id,
      p_revoked_at: revokedAt,
    })
    if (commitResult.error) return json({ error: commitResult.error.message || 'SESSION_REVOCATION_FAILED' }, 500)

    const globalSignOut = await adminClient.auth.admin.signOut(accessToken, 'global')
    if (globalSignOut.error) {
      return json({ ok: true, sessionRevokedAt: revokedAt, refreshTokensRevoked: false, warning: 'GLOBAL_SIGNOUT_FAILED' })
    }
    return json({ ok: true, sessionRevokedAt: revokedAt, refreshTokensRevoked: true })
  }

  if (action === 'change_own_username') {
    if (actorProfile.role !== 'system_admin') return json({ error: 'SYSTEM_ADMIN_REQUIRED' }, 403)
    const oldUsername = text(actorProfile.username).toLowerCase()
    const newUsername = text(body.newUsername).toLowerCase()
    const confirmationUsername = text(body.confirmationUsername).toLowerCase()
    const pin = text(body.pin)
    if (!validUsername(newUsername)) return json({ error: 'USERNAME_INVALID' }, 400)
    if (!validPin(pin)) return json({ error: 'PIN_INVALID' }, 400)
    if (newUsername !== confirmationUsername) return json({ error: 'USERNAME_CONFIRMATION_MISMATCH' }, 400)
    if (newUsername === oldUsername) return json({ error: 'USERNAME_UNCHANGED' }, 409)

    const duplicateResult = await adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('username', newUsername)
      .neq('id', actor.id)
    if (duplicateResult.error) return json({ error: duplicateResult.error.message }, 400)
    if ((duplicateResult.count ?? 0) > 0) return json({ error: 'USERNAME_ALREADY_EXISTS' }, 409)

    const actorFullResult = await adminClient
      .from('profiles')
      .select('id, organization_id, email, username, full_name, role, is_active')
      .eq('id', actor.id)
      .single()
    const actorFull = actorFullResult.data
    if (actorFullResult.error || !actorFull || actorFull.is_active !== true || !actorFull.email) {
      return json({ error: 'USER_NOT_FOUND' }, 404)
    }

    let oldPassword = ''
    let newPassword = ''
    try {
      oldPassword = await deriveAuthPassword(oldUsername, pin)
      newPassword = await deriveAuthPassword(newUsername, pin)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
    }

    const verificationClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const verification = await verificationClient.auth.signInWithPassword({ email: actorFull.email, password: oldPassword })
    if (verification.error || !verification.data.session || verification.data.user?.id !== actor.id) {
      return json({ error: 'CURRENT_PIN_INVALID' }, 401)
    }
    await verificationClient.auth.signOut({ scope: 'local' }).catch(() => {})

    const authUpdate = await adminClient.auth.admin.updateUserById(actor.id, { password: newPassword })
    if (authUpdate.error) return json({ error: authUpdate.error.message || 'AUTH_PASSWORD_UPDATE_FAILED' }, 400)

    const revokedAt = new Date().toISOString()
    const commitResult = await adminClient.rpc('commit_self_username_change_v1', {
      p_actor_id: actor.id,
      p_old_username: oldUsername,
      p_new_username: newUsername,
      p_revoked_at: revokedAt,
    })

    if (commitResult.error) {
      const rollback = await adminClient.auth.admin.updateUserById(actor.id, { password: oldPassword })
      return json({
        error: rollback.error ? 'USERNAME_CHANGE_ROLLBACK_FAILED' : (commitResult.error.message || 'USERNAME_CHANGE_ROLLED_BACK'),
      }, 500)
    }

    let oldUsernameHash = ''
    let newUsernameHash = ''
    try {
      oldUsernameHash = await hashLoginBucket('username', oldUsername)
      newUsernameHash = await hashLoginBucket('username', newUsername)
      await adminClient.from('pin_login_buckets').delete().eq('bucket_type', 'username').eq('bucket_hash', oldUsernameHash)
      await adminClient.from('pin_login_buckets').delete().eq('bucket_type', 'username').eq('bucket_hash', newUsernameHash)
    } catch (_) {
      // The account change is committed. Bucket cleanup is best-effort and does not expose secrets.
    }

    const globalSignOut = await adminClient.auth.admin.signOut(accessToken, 'global')
    return json({
      ok: true,
      oldUsername,
      newUsername,
      sessionRevokedAt: revokedAt,
      activityLogRecorded: true,
      refreshTokensRevoked: !globalSignOut.error,
      warning: globalSignOut.error ? 'GLOBAL_SIGNOUT_FAILED' : null,
    })
  }

  if (action === 'delete_organization') {
    if (actorProfile.role !== 'system_admin') {
      return json({ error: 'SYSTEM_ADMIN_REQUIRED' }, 403)
    }

    const organizationId = text(body.organizationId)
    if (!organizationId) return json({ error: 'ORGANIZATION_REQUIRED' }, 400)
    if (organizationId === actorProfile.organization_id) {
      return json({ error: 'CURRENT_ORGANIZATION_PROTECTED' }, 409)
    }

    const organizationResult = await adminClient
      .from('organizations')
      .select('id, name, company_code')
      .eq('id', organizationId)
      .single()

    const organization = organizationResult.data
    if (organizationResult.error || !organization) {
      return json({ error: 'ORGANIZATION_NOT_FOUND' }, 404)
    }

    const usersResult = await adminClient
      .from('profiles')
      .select('id, role, username, full_name')
      .eq('organization_id', organizationId)

    if (usersResult.error) return json({ error: usersResult.error.message }, 400)
    const organizationUsers = usersResult.data ?? []
    if (organizationUsers.some(user => user.role === 'system_admin')) {
      return json({ error: 'SYSTEM_ADMIN_ORGANIZATION_PROTECTED' }, 409)
    }

    for (const target of organizationUsers) {
      const deleteUserResult = await adminClient.auth.admin.deleteUser(target.id, false)
      if (deleteUserResult.error) {
        return json({
          error: deleteUserResult.error.message || 'ORGANIZATION_USER_DELETE_FAILED',
          failed_user_id: target.id,
        }, 400)
      }
    }

    const deleteOrganizationResult = await adminClient
      .from('organizations')
      .delete()
      .eq('id', organizationId)

    if (deleteOrganizationResult.error) {
      return json({ error: deleteOrganizationResult.error.message || 'ORGANIZATION_DELETE_FAILED' }, 400)
    }

    await adminClient.from('activity_logs').insert({
      organization_id: null,
      user_id: actor.id,
      username_snapshot: actorProfile.username,
      full_name_snapshot: actorProfile.full_name,
      action: 'organization_delete',
      detail: {
        target_organization_id: organizationId,
        target_organization_name: organization.name,
        target_company_code: organization.company_code,
        deleted_user_count: organizationUsers.length,
      },
    })

    return json({
      ok: true,
      deletedOrganization: {
        id: organizationId,
        name: organization.name,
        company_code: organization.company_code,
      },
      deletedUserCount: organizationUsers.length,
    })
  }

  if (action === 'delete_user') {
    if (actorProfile.role !== 'system_admin') {
      return json({ error: 'SYSTEM_ADMIN_REQUIRED' }, 403)
    }
    const targetUserId = text(body.userId)
    const deleteProjects = body.deleteProjects === true
    const confirmLastCompanyAdmin = body.confirmLastCompanyAdmin === true
    const confirmationUsername = text(body.confirmationUsername).toLowerCase()
    if (!targetUserId) return json({ error: 'USER_REQUIRED' }, 400)
    if (targetUserId === actor.id) return json({ error: 'SELF_DELETE_NOT_ALLOWED' }, 409)

    const targetResult = await adminClient
      .from('profiles')
      .select('id, organization_id, role, username, full_name, is_active')
      .eq('id', targetUserId)
      .single()

    const target = targetResult.data
    if (targetResult.error || !target) return json({ error: 'USER_NOT_FOUND' }, 404)
    if (target.role === 'system_admin') return json({ error: 'SYSTEM_ADMIN_PROTECTED' }, 409)
    if (actorProfile.role === 'company_admin' && target.organization_id !== actorProfile.organization_id) {
      return json({ error: 'ORGANIZATION_ACCESS_DENIED' }, 403)
    }

    let lastCompanyAdminOverride = false
    if (target.role === 'company_admin' && target.is_active === true) {
      const otherAdminsResult = await adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', target.organization_id)
        .eq('role', 'company_admin')
        .eq('is_active', true)
        .neq('id', targetUserId)
      if (otherAdminsResult.error) return json({ error: otherAdminsResult.error.message }, 400)
      if ((otherAdminsResult.count ?? 0) < 1) {
        const expectedUsername = text(target.username).toLowerCase()
        if (!confirmLastCompanyAdmin || !expectedUsername || confirmationUsername !== expectedUsername) {
          return json({ error: 'LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED' }, 409)
        }
        lastCompanyAdminOverride = true
      }
    }

    const projectCountResult = await adminClient
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', targetUserId)
    if (projectCountResult.error) return json({ error: projectCountResult.error.message }, 400)
    const projectCount = projectCountResult.count ?? 0

    if (deleteProjects && projectCount > 0) {
      const deleteProjectsResult = await adminClient
        .from('projects')
        .delete()
        .eq('created_by', targetUserId)
      if (deleteProjectsResult.error) {
        return json({ error: deleteProjectsResult.error.message || 'PROJECT_DELETE_FAILED' }, 400)
      }
    }

    const deleteResult = await adminClient.auth.admin.deleteUser(targetUserId, false)
    if (deleteResult.error) {
      return json({ error: deleteResult.error.message || 'USER_DELETE_FAILED' }, 400)
    }

    // Auth user deletion cannot be rolled back safely. Record the audit row immediately
    // afterwards and report any logging failure explicitly to the admin UI.
    const activityLogResult = await adminClient.from('activity_logs').insert({
      organization_id: target.organization_id,
      user_id: actor.id,
      username_snapshot: actorProfile.username,
      full_name_snapshot: actorProfile.full_name,
      action: 'user_delete',
      detail: {
        target_user_id: targetUserId,
        target_username: target.username,
        target_full_name: target.full_name,
        target_role: target.role,
        target_organization_id: target.organization_id,
        delete_projects: deleteProjects,
        deleted_project_count: deleteProjects ? projectCount : 0,
        last_company_admin_override: lastCompanyAdminOverride,
        confirmation_method: lastCompanyAdminOverride ? 'exact_username' : null,
      },
    })

    return json({
      ok: true,
      deletedUser: {
        id: targetUserId,
        username: target.username,
        full_name: target.full_name,
      },
      deletedProjectCount: deleteProjects ? projectCount : 0,
      lastCompanyAdminOverride,
      activityLogRecorded: !activityLogResult.error,
      activityLogError: activityLogResult.error ? 'ACTIVITY_LOG_WRITE_FAILED' : null,
    })
  }

  if (action === 'set_pin') {
    const targetUserId = text(body.userId)
    const pin = text(body.pin)
    if (!targetUserId) return json({ error: 'USER_REQUIRED' }, 400)
    if (!validPin(pin)) return json({ error: 'PIN_INVALID' }, 400)

    const targetResult = await adminClient
      .from('profiles')
      .select('id, organization_id, role, username')
      .eq('id', targetUserId)
      .single()

    const target = targetResult.data
    if (targetResult.error || !target) return json({ error: 'USER_NOT_FOUND' }, 404)
    if (actorProfile.role === 'company_admin') {
      if (target.organization_id !== actorProfile.organization_id) {
        return json({ error: 'ORGANIZATION_ACCESS_DENIED' }, 403)
      }
      if (target.role === 'system_admin') {
        return json({ error: 'ADMIN_REQUIRED' }, 403)
      }
    }

    let password = ''
    try {
      password = await deriveAuthPassword(target.username, pin)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
    }

    const updateResult = await adminClient.auth.admin.updateUserById(targetUserId, { password })
    if (updateResult.error) {
      return json({ error: updateResult.error.message || 'PIN_UPDATE_FAILED' }, 400)
    }
    const revokeResult = await adminClient
      .from('profiles')
      .update({ session_revoked_at: new Date().toISOString() })
      .eq('id', targetUserId)
    if (revokeResult.error) {
      return json({ error: revokeResult.error.message || 'SESSION_REVOCATION_FAILED' }, 500)
    }
    return json({ ok: true })
  }

  const organizationId = text(body.organizationId)
  const fullName = text(body.fullName)
  const username = text(body.username).toLowerCase()
  const pin = text(body.pin)
  const role = text(body.role)
  const language = body.language === 'en' ? 'en' : 'tr'

  if (!organizationId) return json({ error: 'ORGANIZATION_REQUIRED' }, 400)
  if (!fullName) return json({ error: 'FULL_NAME_REQUIRED' }, 400)
  if (!validUsername(username)) return json({ error: 'USERNAME_INVALID' }, 400)
  if (!validPin(pin)) return json({ error: 'PIN_INVALID' }, 400)
  if (!['company_admin', 'designer'].includes(role)) return json({ error: 'ROLE_INVALID' }, 400)

  if (actorProfile.role === 'company_admin' && actorProfile.organization_id !== organizationId) {
    return json({ error: 'ORGANIZATION_ACCESS_DENIED' }, 403)
  }

  const orgResult = await adminClient
    .from('organizations')
    .select('id, name, company_code, is_active, license_start, license_end, max_users')
    .eq('id', organizationId)
    .single()

  const organization = orgResult.data
  if (orgResult.error || !organization) return json({ error: 'ORGANIZATION_NOT_FOUND' }, 404)
  if (organization.is_active !== true) return json({ error: 'ORGANIZATION_INACTIVE' }, 409)

  const today = new Date().toISOString().slice(0, 10)
  if (organization.license_start && today < organization.license_start) {
    return json({ error: 'LICENSE_NOT_STARTED' }, 409)
  }
  if (organization.license_end && today > organization.license_end) {
    return json({ error: 'LICENSE_EXPIRED' }, 409)
  }

  const [usernameResult, countResult] = await Promise.all([
    adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('username', username),
    adminClient.from('profiles').select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId).eq('is_active', true),
  ])

  if ((usernameResult.count ?? 0) > 0) return json({ error: 'USERNAME_ALREADY_EXISTS' }, 409)
  if ((countResult.count ?? 0) >= Number(organization.max_users ?? 0)) {
    return json({ error: 'USER_LIMIT_REACHED' }, 409)
  }

  const internalEmail = `plmr.${crypto.randomUUID().replaceAll('-', '')}@auth.pulumur.app`

  let password = ''
  try {
    password = await deriveAuthPassword(username, pin)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'PIN_PEPPER_MISSING' }, 500)
  }

  const createResult = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username,
      requested_role: role,
      organization_id: organizationId,
    },
  })

  const createdUser = createResult.data.user
  if (createResult.error || !createdUser) {
    return json({ error: createResult.error?.message || 'CREATE_USER_FAILED' }, 400)
  }

  const profileResult = await adminClient.rpc('provision_invited_user_v1', {
    p_actor_id: actor.id,
    p_user_id: createdUser.id,
    p_organization_id: organizationId,
    p_email: internalEmail,
    p_full_name: fullName,
    p_username: username,
    p_role: role,
    p_language: language,
  })

  if (profileResult.error) {
    await adminClient.auth.admin.deleteUser(createdUser.id)
    return json({ error: profileResult.error.message || 'PROFILE_CREATE_FAILED' }, 400)
  }

  return json({
    ok: true,
    user: Array.isArray(profileResult.data) ? profileResult.data[0] : profileResult.data,
    organization: {
      id: organization.id,
      name: organization.name,
      company_code: organization.company_code,
    },
  })
})
