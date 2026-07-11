(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const CONFIG = window.PulumurSupabaseConfig || {};
  const ProjectState = window.PulumurProjectState;
  const supabaseFactory = window.supabase;

  const ui = {
    authGate: $('authGate'), loginForm: $('loginForm'), loginEmail: $('loginEmail'), loginPassword: $('loginPassword'),
    loginBtn: $('loginBtn'), forgotPasswordBtn: $('forgotPasswordBtn'), authMessage: $('authMessage'),
    cloudProjectBar: $('cloudProjectBar'), cloudProjectCode: $('cloudProjectCode'), cloudRevision: $('cloudRevision'),
    cloudSaveState: $('cloudSaveState'), cloudUserName: $('cloudUserName'), cloudCompanyCode: $('cloudCompanyCode'), cloudRoleBadge: $('cloudRoleBadge'),
    newCloudProjectBtn: $('newCloudProjectBtn'), saveCloudProjectBtn: $('saveCloudProjectBtn'),
    newRevisionBtn: $('newRevisionBtn'), openCloudProjectsBtn: $('openCloudProjectsBtn'), revisionHistoryBtn: $('revisionHistoryBtn'), logoutBtn: $('logoutBtn'),
    projectsDialog: $('projectsDialog'), projectsSearch: $('projectsSearch'), projectsTableBody: $('projectsTableBody'),
    projectsEmpty: $('projectsEmpty'), projectsRefreshBtn: $('projectsRefreshBtn'), projectsCloseBtn: $('projectsCloseBtn'),
    newRevisionDialog: $('newRevisionDialog'), newRevisionForm: $('newRevisionForm'), newRevisionCloseBtn: $('newRevisionCloseBtn'),
    newRevisionCancelBtn: $('newRevisionCancelBtn'), newRevisionConfirmBtn: $('newRevisionConfirmBtn'),
    revisionFromValue: $('revisionFromValue'), revisionToValue: $('revisionToValue'), revisionChangeNote: $('revisionChangeNote'),
    newRevisionMessage: $('newRevisionMessage'), revisionsDialog: $('revisionsDialog'), revisionsCloseBtn: $('revisionsCloseBtn'),
    revisionsProjectCode: $('revisionsProjectCode'), revisionsTableBody: $('revisionsTableBody'), revisionsEmpty: $('revisionsEmpty'),
    passwordUpdateDialog: $('passwordUpdateDialog'), passwordUpdateForm: $('passwordUpdateForm'),
    newPassword: $('newPassword'), newPasswordConfirm: $('newPasswordConfirm'), passwordUpdateMessage: $('passwordUpdateMessage')
  };

  const TEXT = {
    tr: {
      authLoading: 'Oturum kontrol ediliyor…', loginBusy: 'Giriş yapılıyor…', loginFailed: 'E-posta veya şifre hatalı.',
      profileMissing: 'Kullanıcı profili bulunamadı. Yönetici profil kaydını kontrol etmeli.',
      setupMissing: 'Altyapı hazır değil. v8.9.0 SQL dosyasını Supabase SQL Editor’da çalıştır.',
      resetSent: 'Şifre sıfırlama bağlantısı e-posta adresine gönderildi.', emailRequired: 'Önce e-posta adresini yaz.',
      newProject: 'Yeni proje', unsaved: 'Kaydedilmedi', saving: 'Kaydediliyor…', saved: 'Kaydedildi',
      saveFailed: 'Proje kaydedilemedi.', projectNameRequired: 'Projeyi kaydetmek için Proje alanını doldur.',
      openFailed: 'Proje açılamadı.', loadingProjects: 'Projeler yükleniyor…', noProjects: 'Kayıtlı proje bulunamadı.',
      confirmDiscard: 'Kaydedilmemiş değişiklikler var. Devam edilsin mi?', projectOpened: 'Proje açıldı:',
      projectCreated: 'Yeni proje kaydedildi:', projectUpdated: 'Proje güncellendi:', loginRequired: 'Oturum açman gerekiyor.',
      recovery: 'Yeni şifreni belirle.', passwordMismatch: 'Şifreler aynı değil.', passwordShort: 'Şifre en az 8 karakter olmalı.',
      passwordUpdated: 'Şifre güncellendi.', open: 'Aç', revisions: 'Revizyonlar', unknownUser: 'Kullanıcı', unknownCompany: 'Firma',
      historical: 'Geçmiş revizyon', historicalEdited: 'Geçmiş revizyon düzenlendi — kaydedilemez', historicalSaveBlocked: 'Geçmiş revizyon doğrudan kaydedilemez. Güncel revizyonu aç.',
      revisionRequired: 'Önce projeyi kaydet.', revisionCreating: 'Revizyon oluşturuluyor…', revisionCreated: 'Yeni revizyon oluşturuldu:',
      revisionFailed: 'Revizyon oluşturulamadı.', revisionLoading: 'Revizyonlar yükleniyor…', noRevisions: 'Revizyon bulunamadı.',
      revisionOpened: 'Geçmiş revizyon açıldı:', currentRevisionOpened: 'Güncel revizyon açıldı:', current: 'Güncel', history: 'Geçmiş',
      confirmRevision: 'Mevcut çalışma kaydedilecek ve yeni revizyon oluşturulacak.', saveBeforeRevisionFailed: 'Mevcut çalışma kaydedilemediği için revizyon oluşturulmadı.',
      readOnly: 'Salt okunur', noWritePermission: 'Bu kullanıcı yalnız görüntüleme yetkisine sahip.',
      roleSystemAdmin: 'Sistem Yöneticisi', roleCompanyAdmin: 'Firma Yöneticisi', roleDesigner: 'Tasarımcı', organizationInactive: 'Firma hesabı pasif.', licenseExpired: 'Firma lisans süresi sona ermiş.', licenseNotStarted: 'Firma lisansı henüz başlamamış.'
    },
    en: {
      authLoading: 'Checking session…', loginBusy: 'Signing in…', loginFailed: 'Incorrect email or password.',
      profileMissing: 'User profile was not found. The administrator must check the profile record.',
      setupMissing: 'Infrastructure is not ready. Run the v8.9.0 SQL file in Supabase SQL Editor.',
      resetSent: 'A password reset link was sent to the email address.', emailRequired: 'Enter the email address first.',
      newProject: 'New project', unsaved: 'Not saved', saving: 'Saving…', saved: 'Saved',
      saveFailed: 'The project could not be saved.', projectNameRequired: 'Fill the Project field before saving.',
      openFailed: 'The project could not be opened.', loadingProjects: 'Loading projects…', noProjects: 'No saved projects found.',
      confirmDiscard: 'There are unsaved changes. Continue?', projectOpened: 'Project opened:',
      projectCreated: 'New project saved:', projectUpdated: 'Project updated:', loginRequired: 'You need to sign in.',
      recovery: 'Set your new password.', passwordMismatch: 'Passwords do not match.', passwordShort: 'Password must be at least 8 characters.',
      passwordUpdated: 'Password updated.', open: 'Open', revisions: 'Revisions', unknownUser: 'User', unknownCompany: 'Company',
      historical: 'Historical revision', historicalEdited: 'Historical revision edited — cannot be saved', historicalSaveBlocked: 'A historical revision cannot be saved directly. Open the current revision.',
      revisionRequired: 'Save the project first.', revisionCreating: 'Creating revision…', revisionCreated: 'New revision created:',
      revisionFailed: 'The revision could not be created.', revisionLoading: 'Loading revisions…', noRevisions: 'No revisions found.',
      revisionOpened: 'Historical revision opened:', currentRevisionOpened: 'Current revision opened:', current: 'Current', history: 'History',
      confirmRevision: 'The current work will be saved and a new revision will be created.', saveBeforeRevisionFailed: 'The revision was not created because the current work could not be saved.',
      readOnly: 'Read only', noWritePermission: 'This user has view-only permission.',
      roleSystemAdmin: 'System Administrator', roleCompanyAdmin: 'Company Administrator', roleDesigner: 'Designer', organizationInactive: 'The company account is inactive.', licenseExpired: 'The company license has expired.', licenseNotStarted: 'The company license has not started yet.'
    }
  };

  let client = null;
  let currentSession = null;
  let currentProfile = null;
  let currentOrganization = null;
  let projectRows = [];
  let dirty = false;
  let authBusy = false;
  let suppressDirty = false;
  let historicalMode = false;
  let historicalCurrentRevision = 1;
  let revisionContext = null;
  let revisionRows = [];

  function language() {
    return $('languageSelect') && $('languageSelect').value === 'en' ? 'en' : 'tr';
  }

  function t(key) {
    return (TEXT[language()] && TEXT[language()][key]) || TEXT.tr[key] || key;
  }

  function setAuthMessage(message, isError) {
    if (!ui.authMessage) return;
    ui.authMessage.textContent = message || '';
    ui.authMessage.classList.toggle('is-error', Boolean(isError));
  }

  function setSaveState(label, mode) {
    if (!ui.cloudSaveState) return;
    ui.cloudSaveState.textContent = label;
    ui.cloudSaveState.dataset.state = mode || '';
  }

  function getRecord() {
    return ProjectState && typeof ProjectState.getRecord === 'function'
      ? ProjectState.getRecord()
      : { projectId: null, projectCode: null, revisionNo: 1 };
  }

  function canWriteProjects() {
    return Boolean(currentProfile && ['system_admin', 'company_admin', 'designer'].includes(currentProfile.role));
  }

  function roleLabel(role) {
    const map = {
      system_admin: 'roleSystemAdmin',
      company_admin: 'roleCompanyAdmin',
      designer: 'roleDesigner',
    };
    return t(map[role] || 'roleDesigner');
  }

  function refreshRoleUi() {
    const role = currentProfile && currentProfile.role ? currentProfile.role : 'designer';
    const writable = canWriteProjects();
    document.body.classList.toggle('cloud-readonly', Boolean(currentSession) && !writable);
    if (ui.cloudRoleBadge) {
      ui.cloudRoleBadge.dataset.role = role;
      ui.cloudRoleBadge.textContent = roleLabel(role);
    }
  }

  function refreshProjectHeader() {
    const record = getRecord();
    if (ui.cloudProjectCode) ui.cloudProjectCode.textContent = record.projectCode || t('newProject');
    if (ui.cloudRevision) ui.cloudRevision.textContent = `R${String(record.revisionNo || 1).padStart(2, '0')}`;

    const writable = canWriteProjects();
    refreshRoleUi();

    if (historicalMode) {
      setSaveState(dirty ? t('historicalEdited') : t('historical'), 'history');
    } else if (!writable) {
      setSaveState(t('readOnly'), 'history');
    } else if (!dirty) {
      setSaveState(record.projectId ? t('saved') : t('unsaved'), record.projectId ? 'saved' : 'new');
    }

    if (ui.newCloudProjectBtn) ui.newCloudProjectBtn.disabled = !writable;
    if (ui.saveCloudProjectBtn) ui.saveCloudProjectBtn.disabled = historicalMode || !writable;
    if (ui.newRevisionBtn) ui.newRevisionBtn.disabled = historicalMode || !record.projectId || !writable;
    if (ui.revisionHistoryBtn) ui.revisionHistoryBtn.disabled = !record.projectId;
  }

  function markDirty() {
    if (suppressDirty || !currentSession || !canWriteProjects()) return;
    dirty = true;
    setSaveState(historicalMode ? t('historicalEdited') : t('unsaved'), historicalMode ? 'history' : 'dirty');
  }

  function markClean() {
    dirty = false;
    refreshProjectHeader();
  }

  function setAppAccess(allowed) {
    document.body.classList.toggle('auth-ready', Boolean(allowed));
    document.body.classList.toggle('auth-locked', !allowed);
    document.body.classList.remove('auth-pending');
    if (ui.cloudProjectBar) ui.cloudProjectBar.hidden = !allowed;
    if (!allowed) {
      document.body.classList.remove('cloud-readonly');
      currentProfile = null;
      currentOrganization = null;
      projectRows = [];
    }
  }

  function friendlyError(error, fallbackKey) {
    const raw = String((error && error.message) || '').trim();
    if (/READ_ONLY_USER/i.test(raw)) return t('noWritePermission');
    if (/ORGANIZATION_INACTIVE/i.test(raw)) return t('organizationInactive');
    if (/LICENSE_EXPIRED/i.test(raw)) return t('licenseExpired');
    if (/LICENSE_NOT_STARTED/i.test(raw)) return t('licenseNotStarted');
    if (/relation .* does not exist|column .* does not exist|function .* does not exist|permission denied|row-level security/i.test(raw)) {
      return t('setupMissing');
    }
    if (/Invalid login credentials/i.test(raw)) return t('loginFailed');
    return raw || t(fallbackKey);
  }

  async function loadProfile() {
    if (!currentSession || !currentSession.user) throw new Error(t('loginRequired'));
    const userId = currentSession.user.id;
    const profileResult = await client
      .from('profiles')
      .select('id, organization_id, username, email, full_name, role, language, user_code, next_project_number, is_active')
      .eq('id', userId)
      .single();
    if (profileResult.error) throw profileResult.error;
    if (!profileResult.data || profileResult.data.is_active === false) throw new Error(t('profileMissing'));
    currentProfile = profileResult.data;

    const orgResult = await client
      .from('organizations')
      .select('id, name, slug, company_code, is_active, license_start, license_end, max_users, enabled_products')
      .eq('id', currentProfile.organization_id)
      .single();
    if (orgResult.error) throw orgResult.error;
    currentOrganization = orgResult.data;
    const today = new Date().toISOString().slice(0, 10);
    if (currentOrganization.is_active === false) throw new Error('ORGANIZATION_INACTIVE');
    if (currentOrganization.license_start && today < currentOrganization.license_start) throw new Error('LICENSE_NOT_STARTED');
    if (currentOrganization.license_end && today > currentOrganization.license_end) throw new Error('LICENSE_EXPIRED');

    const displayName = currentProfile.full_name || currentProfile.username || currentSession.user.email || t('unknownUser');
    const username = currentProfile.username ? `@${currentProfile.username}` : '';
    if (ui.cloudUserName) ui.cloudUserName.textContent = `${displayName}${username ? ` · ${username}` : ''}`;
    const companyCode = currentOrganization.company_code || '----';
    const userCode = currentProfile.user_code || '----';
    if (ui.cloudCompanyCode) ui.cloudCompanyCode.textContent = `${currentOrganization.name || t('unknownCompany')} · ${companyCode}.${userCode}`;
    refreshRoleUi();
  }

  async function handleAuthenticated(session) {
    currentSession = session;
    setAuthMessage(t('authLoading'), false);
    try {
      await loadProfile();
      setAppAccess(true);
      setAuthMessage('', false);
      refreshProjectHeader();
    } catch (error) {
      console.error(error);
      setAppAccess(false);
      setAuthMessage(friendlyError(error, 'profileMissing'), true);
    }
  }

  async function handleSignedOut() {
    currentSession = null;
    dirty = false;
    historicalMode = false;
    historicalCurrentRevision = 1;
    revisionContext = null;
    revisionRows = [];
    if (ProjectState && typeof ProjectState.setRecord === 'function') ProjectState.setRecord({});
    setAppAccess(false);
    setAuthMessage('', false);
    if (ui.loginPassword) ui.loginPassword.value = '';
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (authBusy) return;
    const email = String(ui.loginEmail && ui.loginEmail.value || '').trim();
    const password = String(ui.loginPassword && ui.loginPassword.value || '');
    if (!email || !password) {
      setAuthMessage(t('loginFailed'), true);
      return;
    }
    authBusy = true;
    if (ui.loginBtn) ui.loginBtn.disabled = true;
    setAuthMessage(t('loginBusy'), false);
    try {
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      await handleAuthenticated(result.data.session);
    } catch (error) {
      console.error(error);
      setAuthMessage(friendlyError(error, 'loginFailed'), true);
    } finally {
      authBusy = false;
      if (ui.loginBtn) ui.loginBtn.disabled = false;
    }
  }

  async function requestPasswordReset() {
    const email = String(ui.loginEmail && ui.loginEmail.value || '').trim();
    if (!email) {
      setAuthMessage(t('emailRequired'), true);
      if (ui.loginEmail) ui.loginEmail.focus();
      return;
    }
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const result = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (result.error) throw result.error;
      setAuthMessage(t('resetSent'), false);
    } catch (error) {
      console.error(error);
      setAuthMessage(friendlyError(error, 'loginFailed'), true);
    }
  }

  async function submitPasswordUpdate(event) {
    event.preventDefault();
    const password = String(ui.newPassword && ui.newPassword.value || '');
    const confirm = String(ui.newPasswordConfirm && ui.newPasswordConfirm.value || '');
    if (password.length < 8) {
      ui.passwordUpdateMessage.textContent = t('passwordShort');
      return;
    }
    if (password !== confirm) {
      ui.passwordUpdateMessage.textContent = t('passwordMismatch');
      return;
    }
    const result = await client.auth.updateUser({ password });
    if (result.error) {
      ui.passwordUpdateMessage.textContent = friendlyError(result.error, 'loginFailed');
      return;
    }
    ui.passwordUpdateMessage.textContent = t('passwordUpdated');
    window.setTimeout(() => ui.passwordUpdateDialog && ui.passwordUpdateDialog.close(), 700);
  }

  function projectPayload(snapshot) {
    const metadata = snapshot.metadata || {};
    return {
      project_name: String(metadata.projectName || '').trim(),
      customer_name: String(metadata.customerName || '').trim() || null,
      product_type: 'PERGO_RISE',
      project_data: snapshot,
      app_version: snapshot.appVersion || '8.9.0',
      schema_version: Number(snapshot.schemaVersion) || 1
    };
  }

  function normalizeRpcRow(data) {
    if (Array.isArray(data)) return data[0] || null;
    return data || null;
  }

  async function saveCurrentProject(options = {}) {
    const silent = options.silent === true;
    if (!currentSession) {
      if (!silent) window.alert(t('loginRequired'));
      return false;
    }
    if (!canWriteProjects()) {
      if (!silent) window.alert(t('noWritePermission'));
      return false;
    }
    if (historicalMode) {
      if (!silent) window.alert(t('historicalSaveBlocked'));
      return false;
    }
    if (!ProjectState || typeof ProjectState.createSnapshot !== 'function') {
      if (!silent) window.alert(t('saveFailed'));
      return false;
    }

    const firstSnapshot = ProjectState.createSnapshot();
    const payload = projectPayload(firstSnapshot);
    if (!payload.project_name) {
      if (!silent) window.alert(t('projectNameRequired'));
      const projectInput = $('project');
      if (projectInput) projectInput.focus();
      return false;
    }

    const record = getRecord();
    setSaveState(t('saving'), 'saving');
    if (ui.saveCloudProjectBtn) ui.saveCloudProjectBtn.disabled = true;

    try {
      if (!record.projectId) {
        const rpcResult = await client.rpc('create_project_v1', {
          p_project_name: payload.project_name,
          p_customer_name: payload.customer_name,
          p_product_type: payload.product_type,
          p_project_data: payload.project_data,
          p_app_version: payload.app_version,
          p_schema_version: payload.schema_version
        });
        if (rpcResult.error) throw rpcResult.error;
        const row = normalizeRpcRow(rpcResult.data);
        if (!row || !row.id || !row.project_code) throw new Error(t('saveFailed'));

        ProjectState.setRecord({ projectId: row.id, projectCode: row.project_code, revisionNo: row.current_revision || 1 });
        const finalSnapshot = ProjectState.createSnapshot();
        const finalPayload = projectPayload(finalSnapshot);
        const syncResult = await client.rpc('save_project_v1', {
          p_project_id: row.id,
          p_project_name: finalPayload.project_name,
          p_customer_name: finalPayload.customer_name,
          p_product_type: finalPayload.product_type,
          p_project_data: finalPayload.project_data,
          p_app_version: finalPayload.app_version,
          p_schema_version: finalPayload.schema_version
        });
        if (syncResult.error) throw syncResult.error;
        const synced = normalizeRpcRow(syncResult.data) || row;
        ProjectState.setRecord({
          projectId: synced.id || row.id,
          projectCode: synced.project_code || row.project_code,
          revisionNo: synced.current_revision || row.current_revision || 1
        });
        historicalMode = false;
        historicalCurrentRevision = synced.current_revision || 1;
        markClean();
        if (!silent) setStatus(`${t('projectCreated')} ${row.project_code}`);
      } else {
        const snapshot = ProjectState.createSnapshot();
        const updatePayload = projectPayload(snapshot);
        const updateResult = await client.rpc('save_project_v1', {
          p_project_id: record.projectId,
          p_project_name: updatePayload.project_name,
          p_customer_name: updatePayload.customer_name,
          p_product_type: updatePayload.product_type,
          p_project_data: updatePayload.project_data,
          p_app_version: updatePayload.app_version,
          p_schema_version: updatePayload.schema_version
        });
        if (updateResult.error) throw updateResult.error;
        const row = normalizeRpcRow(updateResult.data);
        if (!row || !row.id) throw new Error(t('saveFailed'));
        ProjectState.setRecord({
          projectId: row.id,
          projectCode: row.project_code,
          revisionNo: row.current_revision || record.revisionNo || 1
        });
        historicalMode = false;
        historicalCurrentRevision = row.current_revision || record.revisionNo || 1;
        markClean();
        if (!silent) setStatus(`${t('projectUpdated')} ${row.project_code}`);
      }
      return true;
    } catch (error) {
      console.error(error);
      setSaveState(t('unsaved'), 'error');
      if (!silent) window.alert(friendlyError(error, 'saveFailed'));
      return false;
    } finally {
      refreshProjectHeader();
    }
  }

  function setStatus(message) {
    const status = $('statusText');
    if (status) status.textContent = message;
  }

  function startNewProject() {
    if (!canWriteProjects()) { window.alert(t('noWritePermission')); return; }
    if (dirty && !window.confirm(t('confirmDiscard'))) return;
    suppressDirty = true;
    const reset = $('resetBtn');
    if (reset) reset.click();
    if (ProjectState && typeof ProjectState.setRecord === 'function') ProjectState.setRecord({});
    dirty = false;
    historicalMode = false;
    historicalCurrentRevision = 1;
    revisionContext = null;
    revisionRows = [];
    refreshProjectHeader();
    setStatus(t('newProject'));
    window.setTimeout(() => {
      suppressDirty = false;
      dirty = false;
      refreshProjectHeader();
    }, 80);
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'tr-TR', {
      dateStyle: 'short', timeStyle: 'short'
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function filteredProjects() {
    const query = String(ui.projectsSearch && ui.projectsSearch.value || '').trim().toLocaleLowerCase(language() === 'en' ? 'en-US' : 'tr-TR');
    if (!query) return projectRows;
    return projectRows.filter(row => [row.project_code, row.customer_name, row.project_name, row.product_type, row.updated_at]
      .some(value => String(value || '').toLocaleLowerCase(language() === 'en' ? 'en-US' : 'tr-TR').includes(query)));
  }

  function renderProjects() {
    if (!ui.projectsTableBody) return;
    const rows = filteredProjects();
    ui.projectsTableBody.innerHTML = rows.map(row => `
      <tr>
        <td class="project-code-cell">${escapeHtml(row.project_code)}</td>
        <td>${escapeHtml(row.customer_name || '-')}</td>
        <td>${escapeHtml(row.project_name || '-')}</td>
        <td>R${String(row.current_revision || 1).padStart(2, '0')}</td>
        <td>${escapeHtml(formatDate(row.updated_at))}</td>
        <td class="project-actions-cell">
          <button type="button" class="primary-btn project-open-btn" data-project-id="${escapeHtml(row.id)}">${escapeHtml(t('open'))}</button>
          <button type="button" class="soft-btn project-revisions-btn" data-project-id="${escapeHtml(row.id)}">${escapeHtml(t('revisions'))}</button>
        </td>
      </tr>`).join('');
    if (ui.projectsEmpty) {
      ui.projectsEmpty.hidden = rows.length > 0;
      ui.projectsEmpty.textContent = t('noProjects');
    }
    ui.projectsTableBody.querySelectorAll('.project-open-btn').forEach(button => {
      button.addEventListener('click', () => openProjectById(button.dataset.projectId));
    });
    ui.projectsTableBody.querySelectorAll('.project-revisions-btn').forEach(button => {
      button.addEventListener('click', () => showRevisions(button.dataset.projectId));
    });
  }

  async function loadProjects() {
    if (!currentSession) return;
    if (ui.projectsEmpty) {
      ui.projectsEmpty.hidden = false;
      ui.projectsEmpty.textContent = t('loadingProjects');
    }
    if (ui.projectsTableBody) ui.projectsTableBody.innerHTML = '';
    const result = await client
      .from('projects')
      .select('id, project_code, customer_name, project_name, product_type, current_revision, app_version, schema_version, created_at, updated_at')
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(500);
    if (result.error) throw result.error;
    projectRows = result.data || [];
    renderProjects();
  }

  async function showProjects() {
    try {
      if (ui.projectsDialog && !ui.projectsDialog.open) ui.projectsDialog.showModal();
      await loadProjects();
      if (ui.projectsSearch) ui.projectsSearch.focus();
    } catch (error) {
      console.error(error);
      if (ui.projectsEmpty) {
        ui.projectsEmpty.hidden = false;
        ui.projectsEmpty.textContent = friendlyError(error, 'openFailed');
      }
    }
  }

  async function openProjectById(projectId) {
    if (dirty && !window.confirm(t('confirmDiscard'))) return;
    try {
      const result = await client
        .from('projects')
        .select('id, project_code, customer_name, project_name, product_type, current_revision, project_data, app_version, schema_version, created_at, updated_at')
        .eq('id', projectId)
        .single();
      if (result.error) throw result.error;
      const row = result.data;
      if (!row || !row.project_data) throw new Error(t('openFailed'));

      suppressDirty = true;
      const snapshot = JSON.parse(JSON.stringify(row.project_data));
      snapshot.record = {
        projectId: row.id,
        projectCode: row.project_code,
        revisionNo: row.current_revision || 1
      };
      ProjectState.restoreSnapshot(snapshot, { resetZoom: true });
      ProjectState.setRecord(snapshot.record);
      historicalMode = false;
      historicalCurrentRevision = row.current_revision || 1;
      dirty = false;
      refreshProjectHeader();
      if (ui.projectsDialog && ui.projectsDialog.open) ui.projectsDialog.close();
      if (ui.revisionsDialog && ui.revisionsDialog.open) ui.revisionsDialog.close();
      setStatus(`${t('currentRevisionOpened')} ${row.project_code} / R${String(row.current_revision || 1).padStart(2, '0')}`);
    } catch (error) {
      console.error(error);
      window.alert(friendlyError(error, 'openFailed'));
    } finally {
      suppressDirty = false;
    }
  }

  function openNewRevisionDialog() {
    if (!canWriteProjects()) { window.alert(t('noWritePermission')); return; }
    const record = getRecord();
    if (!record.projectId) {
      window.alert(t('revisionRequired'));
      return;
    }
    if (historicalMode) {
      window.alert(t('historicalSaveBlocked'));
      return;
    }
    if (ui.revisionFromValue) ui.revisionFromValue.textContent = `R${String(record.revisionNo || 1).padStart(2, '0')}`;
    if (ui.revisionToValue) ui.revisionToValue.textContent = `R${String((record.revisionNo || 1) + 1).padStart(2, '0')}`;
    if (ui.revisionChangeNote) ui.revisionChangeNote.value = '';
    if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = t('confirmRevision');
    if (ui.newRevisionDialog && !ui.newRevisionDialog.open) ui.newRevisionDialog.showModal();
    window.setTimeout(() => ui.revisionChangeNote && ui.revisionChangeNote.focus(), 20);
  }

  async function createNewRevision(event) {
    event.preventDefault();
    if (!canWriteProjects()) { window.alert(t('noWritePermission')); return; }
    const recordBeforeSave = getRecord();
    if (!recordBeforeSave.projectId || historicalMode) return;
    if (ui.newRevisionConfirmBtn) ui.newRevisionConfirmBtn.disabled = true;
    if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = t('revisionCreating');
    try {
      const saved = await saveCurrentProject({ silent: true });
      if (!saved) throw new Error(t('saveBeforeRevisionFailed'));
      const record = getRecord();
      const result = await client.rpc('create_revision_v1', {
        p_project_id: record.projectId,
        p_change_note: String(ui.revisionChangeNote && ui.revisionChangeNote.value || '').trim() || null
      });
      if (result.error) throw result.error;
      const row = normalizeRpcRow(result.data);
      if (!row || !row.id) throw new Error(t('revisionFailed'));

      ProjectState.setRecord({
        projectId: row.id,
        projectCode: row.project_code,
        revisionNo: row.current_revision
      });
      historicalMode = false;
      historicalCurrentRevision = row.current_revision;
      dirty = false;

      if (ui.newRevisionDialog && ui.newRevisionDialog.open) ui.newRevisionDialog.close();
      refreshProjectHeader();
      setStatus(`${t('revisionCreated')} ${row.project_code} / R${String(row.current_revision).padStart(2, '0')}`);
    } catch (error) {
      console.error(error);
      if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = friendlyError(error, 'revisionFailed');
      window.alert(friendlyError(error, 'revisionFailed'));
    } finally {
      if (ui.newRevisionConfirmBtn) ui.newRevisionConfirmBtn.disabled = false;
      refreshProjectHeader();
    }
  }

  async function loadRevisions(projectId) {
    if (ui.revisionsEmpty) {
      ui.revisionsEmpty.hidden = false;
      ui.revisionsEmpty.textContent = t('revisionLoading');
    }
    if (ui.revisionsTableBody) ui.revisionsTableBody.innerHTML = '';

    const [projectResult, revisionsResult] = await Promise.all([
      client.from('projects')
        .select('id, project_code, project_name, customer_name, current_revision, updated_at')
        .eq('id', projectId)
        .single(),
      client.from('project_revisions')
        .select('id, project_id, revision_no, change_note, app_version, schema_version, created_at')
        .eq('project_id', projectId)
        .order('revision_no', { ascending: false })
    ]);
    if (projectResult.error) throw projectResult.error;
    if (revisionsResult.error) throw revisionsResult.error;
    revisionContext = projectResult.data;
    revisionRows = revisionsResult.data || [];
    renderRevisions();
  }

  function renderRevisions() {
    if (!ui.revisionsTableBody) return;
    const currentRevision = Number(revisionContext && revisionContext.current_revision) || 1;
    if (ui.revisionsProjectCode) ui.revisionsProjectCode.textContent = revisionContext ? revisionContext.project_code : '-';
    ui.revisionsTableBody.innerHTML = revisionRows.map(row => {
      const isCurrent = Number(row.revision_no) === currentRevision;
      return `
        <tr>
          <td><strong>R${String(row.revision_no || 1).padStart(2, '0')}</strong> <span class="${isCurrent ? 'revision-current-badge' : 'revision-history-badge'}">${escapeHtml(isCurrent ? t('current') : t('history'))}</span></td>
          <td>${escapeHtml(row.change_note || '-')}</td>
          <td>${escapeHtml(formatDate(row.created_at))}</td>
          <td>${escapeHtml(row.app_version || '-')}</td>
          <td class="revision-actions"><button type="button" class="${isCurrent ? 'primary-btn' : 'soft-btn'} revision-open-btn" data-revision-no="${escapeHtml(row.revision_no)}">${escapeHtml(t('open'))}</button></td>
        </tr>`;
    }).join('');
    if (ui.revisionsEmpty) {
      ui.revisionsEmpty.hidden = revisionRows.length > 0;
      ui.revisionsEmpty.textContent = t('noRevisions');
    }
    ui.revisionsTableBody.querySelectorAll('.revision-open-btn').forEach(button => {
      button.addEventListener('click', () => openRevision(Number(button.dataset.revisionNo)));
    });
  }

  async function showRevisions(projectId) {
    if (!projectId) {
      window.alert(t('revisionRequired'));
      return;
    }
    try {
      if (ui.revisionsDialog && !ui.revisionsDialog.open) ui.revisionsDialog.showModal();
      await loadRevisions(projectId);
    } catch (error) {
      console.error(error);
      if (ui.revisionsEmpty) {
        ui.revisionsEmpty.hidden = false;
        ui.revisionsEmpty.textContent = friendlyError(error, 'revisionFailed');
      }
    }
  }

  async function openRevision(revisionNo) {
    if (!revisionContext || !revisionContext.id) return;
    if (dirty && !window.confirm(t('confirmDiscard'))) return;
    const currentRevision = Number(revisionContext.current_revision) || 1;
    if (Number(revisionNo) === currentRevision) {
      await openProjectById(revisionContext.id);
      return;
    }
    try {
      const result = await client
        .from('project_revisions')
        .select('project_id, revision_no, project_data, app_version, schema_version, change_note, created_at')
        .eq('project_id', revisionContext.id)
        .eq('revision_no', revisionNo)
        .single();
      if (result.error) throw result.error;
      const row = result.data;
      if (!row || !row.project_data) throw new Error(t('openFailed'));

      suppressDirty = true;
      const snapshot = JSON.parse(JSON.stringify(row.project_data));
      snapshot.record = {
        projectId: revisionContext.id,
        projectCode: revisionContext.project_code,
        revisionNo: Number(row.revision_no) || 1
      };
      ProjectState.restoreSnapshot(snapshot, { resetZoom: true });
      ProjectState.setRecord(snapshot.record);
      historicalMode = true;
      historicalCurrentRevision = currentRevision;
      dirty = false;
      refreshProjectHeader();
      if (ui.projectsDialog && ui.projectsDialog.open) ui.projectsDialog.close();
      if (ui.revisionsDialog && ui.revisionsDialog.open) ui.revisionsDialog.close();
      setStatus(`${t('revisionOpened')} ${revisionContext.project_code} / R${String(row.revision_no).padStart(2, '0')}`);
    } catch (error) {
      console.error(error);
      window.alert(friendlyError(error, 'openFailed'));
    } finally {
      suppressDirty = false;
    }
  }

  function bindDirtyTracking() {
    document.addEventListener('input', event => {
      if (event.target && event.target.closest && event.target.closest('.input-panel')) markDirty();
    }, true);
    document.addEventListener('change', event => {
      if (!event.target || !event.target.closest) return;
      if (event.target.id === 'languageSelect') return;
      if (event.target.closest('.input-panel')) markDirty();
      if (event.target.id === 'projectImportInput') window.setTimeout(markDirty, 50);
    }, true);
    document.addEventListener('click', event => {
      const target = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!target) return;
      if (target.closest('#cloudProjectBar') || target.closest('#projectsDialog') || target.closest('#newRevisionDialog') || target.closest('#revisionsDialog') || target.closest('#passwordUpdateDialog') || target.closest('#authGate')) return;
      if (['generateBtn', 'pdfBtn', 'previewBtn', 'fitPreviewBtn', 'expandPreviewBtn', 'helpBtn', 'installBtn', 'projectExportBtn', 'projectImportBtn'].includes(target.id)) return;
      if (target.value === 'cancel') return;
      if (target.closest('.input-panel') || target.closest('.preview-canvas') || target.closest('.modal')) {
        window.setTimeout(markDirty, 0);
      }
    }, true);
    window.addEventListener('beforeunload', event => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function bindUi() {
    if (ui.loginForm) ui.loginForm.addEventListener('submit', submitLogin);
    if (ui.forgotPasswordBtn) ui.forgotPasswordBtn.addEventListener('click', requestPasswordReset);
    if (ui.logoutBtn) ui.logoutBtn.addEventListener('click', async () => {
      if (dirty && !window.confirm(t('confirmDiscard'))) return;
      await client.auth.signOut();
    });
    if (ui.newCloudProjectBtn) ui.newCloudProjectBtn.addEventListener('click', startNewProject);
    if (ui.saveCloudProjectBtn) ui.saveCloudProjectBtn.addEventListener('click', () => saveCurrentProject());
    if (ui.newRevisionBtn) ui.newRevisionBtn.addEventListener('click', openNewRevisionDialog);
    if (ui.openCloudProjectsBtn) ui.openCloudProjectsBtn.addEventListener('click', showProjects);
    if (ui.revisionHistoryBtn) ui.revisionHistoryBtn.addEventListener('click', () => showRevisions(getRecord().projectId));
    if (ui.projectsRefreshBtn) ui.projectsRefreshBtn.addEventListener('click', loadProjects);
    if (ui.projectsCloseBtn) ui.projectsCloseBtn.addEventListener('click', () => ui.projectsDialog && ui.projectsDialog.close());
    if (ui.projectsSearch) ui.projectsSearch.addEventListener('input', renderProjects);
    if (ui.newRevisionForm) ui.newRevisionForm.addEventListener('submit', createNewRevision);
    if (ui.newRevisionCloseBtn) ui.newRevisionCloseBtn.addEventListener('click', () => ui.newRevisionDialog && ui.newRevisionDialog.close());
    if (ui.newRevisionCancelBtn) ui.newRevisionCancelBtn.addEventListener('click', () => ui.newRevisionDialog && ui.newRevisionDialog.close());
    if (ui.revisionsCloseBtn) ui.revisionsCloseBtn.addEventListener('click', () => ui.revisionsDialog && ui.revisionsDialog.close());
    if (ui.passwordUpdateForm) ui.passwordUpdateForm.addEventListener('submit', submitPasswordUpdate);
    if ($('languageSelect')) $('languageSelect').addEventListener('change', () => {
      refreshProjectHeader();
      renderProjects();
      renderRevisions();
    });
    bindDirtyTracking();
  }

  async function init() {
    if (!CONFIG.url || !CONFIG.publishableKey || !supabaseFactory || typeof supabaseFactory.createClient !== 'function' || !ProjectState) {
      setAppAccess(false);
      setAuthMessage('Supabase bağlantı bileşeni yüklenemedi.', true);
      return;
    }
    client = supabaseFactory.createClient(CONFIG.url, CONFIG.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    window.PulumurSupabase = client;
    bindUi();
    setAuthMessage(t('authLoading'), false);

    client.auth.onAuthStateChange((event, session) => {
      window.setTimeout(async () => {
        if (event === 'PASSWORD_RECOVERY' && ui.passwordUpdateDialog) {
          ui.passwordUpdateMessage.textContent = t('recovery');
          ui.passwordUpdateDialog.showModal();
        }
        if (session) await handleAuthenticated(session);
        else await handleSignedOut();
      }, 0);
    });

    const sessionResult = await client.auth.getSession();
    if (sessionResult.error) {
      setAppAccess(false);
      setAuthMessage(friendlyError(sessionResult.error, 'loginFailed'), true);
      return;
    }
    if (sessionResult.data.session) await handleAuthenticated(sessionResult.data.session);
    else await handleSignedOut();
  }

  init().catch(error => {
    console.error(error);
    setAppAccess(false);
    setAuthMessage(friendlyError(error, 'loginFailed'), true);
  });
})();
