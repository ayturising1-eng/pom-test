(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const CONFIG = window.PulumurSupabaseConfig || {};
  const ProjectState = window.PulumurProjectState;
  const supabaseFactory = window.supabase;

  const ui = {
    authGate: $('authGate'), loginForm: $('loginForm'), loginUsername: $('loginUsername'), loginPassword: $('loginPassword'),
    rememberMe: $('rememberMe'), savePassword: $('savePassword'), loginBtn: $('loginBtn'), authMessage: $('authMessage'),
    loginUsernameLabel: $('loginUsernameLabel'), loginPasswordLabel: $('loginPasswordLabel'),
    rememberMeLabel: $('rememberMeLabel'), savePasswordLabel: $('savePasswordLabel'), authNote: $('authNote'),
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
    conflictDialog: $('projectConflictDialog'), conflictMessage: $('projectConflictMessage'),
    conflictReloadBtn: $('projectConflictReloadBtn'), conflictRevisionBtn: $('projectConflictRevisionBtn'),
    conflictCopyBtn: $('projectConflictCopyBtn'), conflictCancelBtn: $('projectConflictCancelBtn'),
    backendWarningBanner: $('backendWarningBanner')
  };

  const TEXT = {
    tr: {
      authLoading: 'Oturum kontrol ediliyor…', loginBusy: 'Giriş yapılıyor…', loginFailed: 'Kullanıcı adı veya PIN kodu hatalı.',
      loginUsername: 'Kullanıcı Adı', loginPassword: 'PIN Kodu', rememberMe: 'Beni hatırla', savePassword: 'PIN Kodumu kaydet',
      authNote: 'Kullanıcı adı ve 4 haneli PIN kodu yönetici tarafından tanımlanır. PIN kaydı desteklenen cihazlarda tarayıcının parola yöneticisiyle yapılır.',
      profileMissing: 'Kullanıcı profili bulunamadı. Yönetici profil kaydını kontrol etmeli.',
      setupMissing: 'Altyapı hazır değil. Supabase kurulumunu kontrol et.',
      newProject: 'Yeni proje', unsaved: 'Kaydedilmedi', saving: 'Kaydediliyor…', saved: 'Kaydedildi',
      saveFailed: 'Proje kaydedilemedi.', projectNameRequired: 'Projeyi kaydetmek için Proje alanını doldur.',
      openFailed: 'Proje açılamadı.', loadingProjects: 'Projeler yükleniyor…', noProjects: 'Kayıtlı proje bulunamadı.',
      confirmDiscard: 'Kaydedilmemiş değişiklikler var. Devam edilsin mi?', projectOpened: 'Proje açıldı:',
      projectCreated: 'Yeni proje kaydedildi:', projectUpdated: 'Proje güncellendi:', loginRequired: 'Oturum açman gerekiyor.',
      open: 'Aç', revisions: 'Revizyonlar', unknownUser: 'Kullanıcı', unknownCompany: 'Firma',
      historical: 'Geçmiş revizyon', historicalEdited: 'Geçmiş revizyon düzenlendi — yeni revizyon olarak kaydedilebilir', historicalSaveBlocked: 'Geçmiş revizyon doğrudan güncel kaydın üzerine yazılamaz.',
      revisionRequired: 'Önce projeyi kaydet.', revisionCreating: 'Revizyon oluşturuluyor…', revisionCreated: 'Yeni revizyon oluşturuldu:',
      revisionFailed: 'Revizyon oluşturulamadı.', revisionLoading: 'Revizyonlar yükleniyor…', noRevisions: 'Revizyon bulunamadı.',
      revisionOpened: 'Geçmiş revizyon açıldı:', currentRevisionOpened: 'Güncel revizyon açıldı:', current: 'Güncel', history: 'Geçmiş',
      confirmRevision: 'Mevcut çalışma kaydedilecek ve yeni revizyon oluşturulacak.', saveBeforeRevisionFailed: 'Mevcut çalışma kaydedilemediği için revizyon oluşturulmadı.',
      readOnly: 'Salt okunur', noWritePermission: 'Bu kullanıcı yalnız görüntüleme yetkisine sahip.',
      deleteProject: 'Sil', deleteProjectConfirm: 'Bu proje ve tüm revizyonları kalıcı olarak silinecek. Devam edilsin mi?',
      projectDeleted: 'Proje ve revizyonları silindi:', deleteProjectFailed: 'Proje silinemedi.', systemAdminRequired: 'Bu işlem yalnız Sistem Yöneticisi tarafından yapılabilir.',
      roleSystemAdmin: 'Sistem Yöneticisi', roleCompanyAdmin: 'Firma Yöneticisi', roleDesigner: 'Tasarımcı', organizationInactive: 'Firma hesabı pasif.', licenseExpired: 'Firma lisans süresi sona ermiş.', licenseNotStarted: 'Firma lisansı henüz başlamamış.',
      sessionRevoked: 'PIN değişikliği nedeniyle oturum kapatıldı. Lütfen tekrar giriş yap.', loginRateLimited: 'Çok fazla hatalı deneme yapıldı. Geçici kilit süresi dolunca tekrar dene.',
      conflictTitle: 'Bu proje başka bir sekmede değiştirildi. Yerel çalışman otomatik olarak ezilmedi.',
      conflictReload: 'Sunucudakini yükle', conflictRevision: 'Yerel çalışmayı yeni revizyon yap', conflictCopy: 'Yerel çalışmayı kopya olarak kaydet',
      conflictCancelled: 'Çakışma çözülmedi; yerel değişiklikler korunuyor.', changesDuringSave: 'Kayıt tamamlandı; kayıt sırasında yapılan yeni değişiklikler henüz kaydedilmedi.',
      historicalRevisionHint: 'Bu geçmiş çalışma, güncel kaydı ezmeden yeni revizyon olarak oluşturulacak.',
      backendMigrationWarning: 'Supabase Aşama 3 migration kurulumu eksik veya eski. Giriş uyumluluk modunda çalışıyor; merkezi limitler ve güvenli proje kaydı için SQL migrationlarını uygula.',
      backendTemporaryWarning: 'Supabase bağlantısı geçici olarak doğrulanamadı. Yerel güvenlik limitleri kullanılmaya devam ediyor.',
      recoveryFound: 'Kaydedilmemiş bir kurtarma kaydı bulundu. Bu çalışmayı geri yüklemek ister misin?',
      recoveryRestored: 'Kurtarma kaydı geri yüklendi. Değişiklikler henüz buluta kaydedilmedi.'
    },
    en: {
      authLoading: 'Checking session…', loginBusy: 'Signing in…', loginFailed: 'Incorrect username or PIN.',
      loginUsername: 'Username', loginPassword: 'PIN Code', rememberMe: 'Remember me', savePassword: 'Save my PIN',
      authNote: 'The username and 4-digit PIN are assigned by the company administrator. PIN saving uses the browser password manager on supported devices.',
      profileMissing: 'User profile was not found. The administrator must check the profile record.',
      setupMissing: 'Infrastructure is not ready. Check the Supabase setup.',
      newProject: 'New project', unsaved: 'Not saved', saving: 'Saving…', saved: 'Saved',
      saveFailed: 'The project could not be saved.', projectNameRequired: 'Fill the Project field before saving.',
      openFailed: 'The project could not be opened.', loadingProjects: 'Loading projects…', noProjects: 'No saved projects found.',
      confirmDiscard: 'There are unsaved changes. Continue?', projectOpened: 'Project opened:',
      projectCreated: 'New project saved:', projectUpdated: 'Project updated:', loginRequired: 'You need to sign in.',
      open: 'Open', revisions: 'Revisions', unknownUser: 'User', unknownCompany: 'Company',
      historical: 'Historical revision', historicalEdited: 'Historical revision edited — can be saved as a new revision', historicalSaveBlocked: 'A historical revision cannot overwrite the current project.',
      revisionRequired: 'Save the project first.', revisionCreating: 'Creating revision…', revisionCreated: 'New revision created:',
      revisionFailed: 'The revision could not be created.', revisionLoading: 'Loading revisions…', noRevisions: 'No revisions found.',
      revisionOpened: 'Historical revision opened:', currentRevisionOpened: 'Current revision opened:', current: 'Current', history: 'History',
      confirmRevision: 'The current work will be saved and a new revision will be created.', saveBeforeRevisionFailed: 'The revision was not created because the current work could not be saved.',
      readOnly: 'Read only', noWritePermission: 'This user has view-only permission.',
      deleteProject: 'Delete', deleteProjectConfirm: 'This project and all of its revisions will be permanently deleted. Continue?',
      projectDeleted: 'Project and revisions deleted:', deleteProjectFailed: 'The project could not be deleted.', systemAdminRequired: 'This action is available only to the System Administrator.',
      roleSystemAdmin: 'System Administrator', roleCompanyAdmin: 'Company Administrator', roleDesigner: 'Designer', organizationInactive: 'The company account is inactive.', licenseExpired: 'The company license has expired.', licenseNotStarted: 'The company license has not started yet.',
      sessionRevoked: 'Your session was closed because the PIN changed. Sign in again.', loginRateLimited: 'Too many incorrect attempts. Try again after the temporary lock expires.',
      conflictTitle: 'This project changed in another tab. Your local work was not overwritten.',
      conflictReload: 'Load server version', conflictRevision: 'Save local work as a new revision', conflictCopy: 'Save local work as a copy',
      conflictCancelled: 'The conflict is unresolved; local changes are preserved.', changesDuringSave: 'Save completed; changes made during the save are still unsaved.',
      historicalRevisionHint: 'This historical work will become a new revision without overwriting the current project.',
      backendMigrationWarning: 'The Supabase Stage 3 migration is missing or outdated. Sign-in is running in compatibility mode; apply the SQL migrations for central limits and safe project saving.',
      backendTemporaryWarning: 'The Supabase backend could not be verified temporarily. Local safety limits remain active.',
      recoveryFound: 'An unsaved recovery snapshot was found. Restore this work?',
      recoveryRestored: 'The recovery snapshot was restored. The changes are not saved to the cloud yet.'
    }
  };

  let client = null;
  let currentSession = null;
  let currentProfile = null;
  let currentOrganization = null;
  let projectRows = [];
  let dirty = false;
  let dirtyGeneration = 0;
  let authBusy = false;
  let authEpoch = 0;
  let explicitLoginInProgress = false;
  let suppressDirty = false;
  let historicalMode = false;
  let historicalCurrentRevision = 1;
  let revisionContext = null;
  let revisionRows = [];
  let conflictResolver = null;
  let recoveryPromptedForUser = null;
  let backendWarningCode = '';

  // Shared auth bridge for admin operations. It exposes only the active session
  // token in memory; nothing is written to localStorage by this bridge.
  window.PulumurCloudAuth = Object.freeze({
    getSession: () => currentSession,
    getAccessToken: () => String(currentSession && currentSession.access_token || ''),
  });

  const REMEMBER_KEY = 'plmr_auth_remember';
  const SESSION_ONLY_KEY = 'plmr_auth_session_only';
  const SAVED_USERNAME_KEY = 'plmr_auth_username';
  const SAVE_PASSWORD_KEY = 'plmr_auth_save_password';

  function language() {
    return $('languageSelect') && $('languageSelect').value === 'en' ? 'en' : 'tr';
  }

  function t(key) {
    return (TEXT[language()] && TEXT[language()][key]) || TEXT.tr[key] || key;
  }

  function updateBackendWarning(code, detail = '') {
    backendWarningCode = String(code || '');
    if (!ui.backendWarningBanner) return;
    if (!backendWarningCode) {
      ui.backendWarningBanner.hidden = true;
      ui.backendWarningBanner.textContent = '';
      return;
    }
    ui.backendWarningBanner.hidden = false;
    ui.backendWarningBanner.textContent = backendWarningCode === 'migration'
      ? t('backendMigrationWarning')
      : (detail || t('backendTemporaryWarning'));
  }

  function syncBackendStatus(status) {
    const normalized = status || {};
    if (window.PulumurRuntimeMonitor) window.PulumurRuntimeMonitor.setBackendStatus(normalized);
    if (normalized.migrationRequired || normalized.migration_required || normalized.rateLimitMode === 'memory-fallback' || normalized.rate_limit_mode === 'memory-fallback') {
      updateBackendWarning('migration');
    } else if (backendWarningCode === 'migration') {
      updateBackendWarning('');
    }
  }

  async function probeBackendHealth() {
    if (!window.PulumurAdminUsersApi || typeof window.PulumurAdminUsersApi.health !== 'function') return null;
    try {
      const health = await window.PulumurAdminUsersApi.health();
      const status = window.PulumurBackendCompatibility
        ? window.PulumurBackendCompatibility.applyHealth(health)
        : health;
      syncBackendStatus(status);
      return status;
    } catch (error) {
      if (window.PulumurRuntimeMonitor) window.PulumurRuntimeMonitor.record('backend.health', error);
      updateBackendWarning('temporary');
      return null;
    }
  }

  function currentUserId() {
    return String(currentSession && currentSession.user && currentSession.user.id || '');
  }

  function scheduleRecoverySnapshot() {
    if (!window.PulumurRecovery || !ProjectState || !currentSession || suppressDirty) return;
    try {
      const record = getRecord();
      window.PulumurRecovery.schedule(currentUserId(), ProjectState.createSnapshot(), {
        projectCode: record.projectCode,
        revisionNo: record.revisionNo
      });
    } catch (error) {
      if (window.PulumurRuntimeMonitor) window.PulumurRuntimeMonitor.record('recovery.schedule', error);
    }
  }

  async function clearRecoverySnapshot() {
    if (!window.PulumurRecovery) return;
    const userId = currentUserId();
    if (userId) await window.PulumurRecovery.clear(userId);
  }

  async function restoreRecoveryIfAvailable() {
    if (!window.PulumurRecovery || !ProjectState || !currentSession) return;
    const userId = currentUserId();
    if (!userId || recoveryPromptedForUser === userId) return;
    recoveryPromptedForUser = userId;
    const record = await window.PulumurRecovery.latest(userId);
    if (!record || !record.snapshot) return;
    if (!window.confirm(t('recoveryFound'))) return;
    suppressDirty = true;
    try {
      ProjectState.restoreSnapshot(record.snapshot, { resetZoom: false, resetHistory: true });
      dirty = true;
      dirtyGeneration += 1;
      refreshProjectHeader();
      setStatus(t('recoveryRestored'));
    } finally {
      suppressDirty = false;
    }
  }

  function applyLoginLanguage() {
    if (ui.loginUsernameLabel) ui.loginUsernameLabel.textContent = t('loginUsername');
    if (ui.loginPasswordLabel) ui.loginPasswordLabel.textContent = t('loginPassword');
    if (ui.rememberMeLabel) ui.rememberMeLabel.textContent = t('rememberMe');
    if (ui.savePasswordLabel) ui.savePasswordLabel.textContent = t('savePassword');
    if (ui.authNote) ui.authNote.textContent = t('authNote');
  }

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase();
  }

  function rememberPreference() {
    return localStorage.getItem(REMEMBER_KEY) !== '0';
  }

  async function storeBrowserCredential(username, password) {
    if (!username || !password || !navigator.credentials || typeof window.PasswordCredential !== 'function') return;
    try {
      const credential = new window.PasswordCredential({ id: username, password, name: username });
      await navigator.credentials.store(credential);
    } catch (error) {
      console.warn('Browser password manager could not store the credential.', error);
    }
  }

  async function restoreLoginPreferences() {
    const remember = rememberPreference();
    if (ui.rememberMe) ui.rememberMe.checked = remember;
    if (ui.savePassword) ui.savePassword.checked = localStorage.getItem(SAVE_PASSWORD_KEY) === '1';
    const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY) || '';
    if (ui.loginUsername && savedUsername) ui.loginUsername.value = savedUsername;
    if (!ui.savePassword || !ui.savePassword.checked || !navigator.credentials) return;
    try {
      const credential = await navigator.credentials.get({ password: true, mediation: 'optional' });
      if (credential && credential.type === 'password') {
        if (ui.loginUsername && !ui.loginUsername.value) ui.loginUsername.value = credential.id || '';
        if (ui.loginPassword && !ui.loginPassword.value) ui.loginPassword.value = credential.password || '';
      }
    } catch (error) {
      console.warn('Browser password manager could not restore the credential.', error);
    }
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
      : { projectId: null, projectCode: null, revisionNo: 1, serverVersion: null };
  }

  function canWriteProjects() {
    return Boolean(currentProfile && ['system_admin', 'company_admin', 'designer'].includes(currentProfile.role));
  }

  function isSystemAdmin() {
    return Boolean(currentProfile && currentProfile.role === 'system_admin');
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
    if (ui.newRevisionBtn) ui.newRevisionBtn.disabled = !record.projectId || !writable;
    if (ui.revisionHistoryBtn) ui.revisionHistoryBtn.disabled = !record.projectId;
  }

  function markDirty() {
    if (suppressDirty || !currentSession || !canWriteProjects()) return;
    dirty = true;
    dirtyGeneration += 1;
    setSaveState(historicalMode ? t('historicalEdited') : t('unsaved'), historicalMode ? 'history' : 'dirty');
    window.setTimeout(scheduleRecoverySnapshot, 0);
  }

  function markClean(expectedGeneration = null) {
    if (expectedGeneration !== null && expectedGeneration !== dirtyGeneration) {
      dirty = true;
      setSaveState(t('unsaved'), 'dirty');
      setStatus(t('changesDuringSave'));
      refreshProjectHeader();
      return false;
    }
    dirty = false;
    refreshProjectHeader();
    void clearRecoverySnapshot();
    return true;
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
    if (/SESSION_REVOKED/i.test(raw)) return t('sessionRevoked');
    if (/LOGIN_RATE_LIMITED|HTTP_429/i.test(raw)) return t('loginRateLimited');
    if (/LOGIN_RATE_LIMIT_UNAVAILABLE|BACKEND_SCHEMA_OUTDATED/i.test(raw)) return t('backendMigrationWarning');
    if (/PROJECT_VERSION_CONFLICT/i.test(raw)) return t('conflictTitle');
    if (/SYSTEM_ADMIN_REQUIRED/i.test(raw)) return t('systemAdminRequired');
    if (/ORGANIZATION_INACTIVE/i.test(raw)) return t('organizationInactive');
    if (/LICENSE_EXPIRED/i.test(raw)) return t('licenseExpired');
    if (/LICENSE_NOT_STARTED/i.test(raw)) return t('licenseNotStarted');
    if (/INVALID_LOGIN|Invalid login credentials/i.test(raw)) return t('loginFailed');
    if (/PIN_PEPPER_MISSING|FUNCTION_SECRETS_MISSING/i.test(raw)) {
      return language() === 'en'
        ? 'The PLMR_PIN_PEPPER Edge Function secret is missing.'
        : 'Edge Function içinde PLMR_PIN_PEPPER gizli değeri eksik.';
    }
    if (/AUTH_REQUIRED/i.test(raw)) {
      return language() === 'en'
        ? 'Your login session could not be found. Sign out and sign in again.'
        : 'Oturum bilgisi bulunamadı. Çıkış yapıp tekrar giriş yap.';
    }
    if (/AUTH_INVALID/i.test(raw)) {
      return language() === 'en'
        ? 'Your login session is no longer valid. Sign out and sign in again.'
        : 'Oturum süresi dolmuş veya geçersiz. Çıkış yapıp tekrar giriş yap.';
    }
    if (/Invalid JWT|Missing authorization header|HTTP_401/i.test(raw)) {
      return language() === 'en'
        ? 'The Edge Function rejected the authorization header. Check the function logs and session.'
        : 'Edge Function yetkilendirme bilgisini reddetti. Fonksiyon loglarını ve oturumu kontrol et.';
    }
    if (/FUNCTION_NETWORK_ERROR|Failed to fetch|NetworkError/i.test(raw)) {
      return language() === 'en'
        ? 'The Edge Function could not be reached. Check the network and Supabase project URL.'
        : 'Edge Function bağlantısı kurulamadı. İnternet bağlantısını ve Supabase proje adresini kontrol et.';
    }
    if (/HTTP_404|NOT_FOUND/i.test(raw)) {
      return language() === 'en'
        ? 'The admin-users Edge Function was not found. Deploy it with the exact name admin-users.'
        : 'admin-users Edge Function bulunamadı. Fonksiyonu tam olarak admin-users adıyla Deploy et.';
    }
    if (/relation .* does not exist|column .* does not exist|function .* does not exist|permission denied|row-level security/i.test(raw)) {
      return t('setupMissing');
    }
    return raw || t(fallbackKey);
  }

  async function functionErrorDetail(error) {
    if (!error) return '';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const payload = await error.context.json();
        if (payload && payload.error) return String(payload.error);
      }
    } catch (_) {}
    return String(error.message || error || '');
  }

  async function loadProfile() {
    if (!currentSession || !currentSession.user) throw new Error(t('loginRequired'));
    const userId = currentSession.user.id;
    const profileResult = await client
      .from('profiles')
      .select('id, organization_id, username, full_name, role, language, user_code, next_project_number, is_active')
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

    const displayName = currentProfile.full_name || currentProfile.username || t('unknownUser');
    const username = currentProfile.username ? `@${currentProfile.username}` : '';
    if (ui.cloudUserName) ui.cloudUserName.textContent = `${displayName}${username ? ` · ${username}` : ''}`;
    if (ui.cloudCompanyCode) ui.cloudCompanyCode.textContent = currentOrganization.name || t('unknownCompany');
    refreshRoleUi();
  }

  async function loadEffectiveLimits() {
    if (!client || !window.PulumurLimits) return false;
    const result = await client.rpc('get_effective_app_limits_v1');
    if (result.error) {
      const compatibility = window.PulumurBackendCompatibility;
      if (compatibility && compatibility.isMissingFeatureError(result.error)) {
        const status = compatibility.markFallback('central_limits', result.error);
        syncBackendStatus(status);
        return false;
      }
      if (window.PulumurRuntimeMonitor) window.PulumurRuntimeMonitor.record('backend.central_limits', result.error);
      updateBackendWarning('temporary');
      return false;
    }
    const values = {};
    (result.data || []).forEach(row => {
      if (row && row.limit_key) values[row.limit_key] = Number(row.limit_value);
    });
    window.PulumurLimits.set(values);
    if (window.PulumurBackendCompatibility) {
      syncBackendStatus(window.PulumurBackendCompatibility.update({ centralLimits: true }));
    }
    return true;
  }

  async function handleAuthenticated(session) {
    currentSession = session;
    setAuthMessage(t('authLoading'), false);
    try {
      await loadProfile();
      await loadEffectiveLimits();
      setAppAccess(true);
      setAuthMessage('', false);
      refreshProjectHeader();
      if (window.PulumurActivity) await window.PulumurActivity.identify();
      // V10.5: Recovery disabled by default
      // await restoreRecoveryIfAvailable();
    } catch (error) {
      console.error(error);
      setAppAccess(false);
      setAuthMessage(friendlyError(error, 'profileMissing'), true);
    }
  }

  async function handleSignedOut() {
    if (window.PulumurRecovery) window.PulumurRecovery.cancel();
    currentSession = null;
    currentProfile = null;
    currentOrganization = null;
    if (ui.cloudUserName) ui.cloudUserName.textContent = '-';
    if (ui.cloudCompanyCode) ui.cloudCompanyCode.textContent = '-';
    dirty = false;
    historicalMode = false;
    historicalCurrentRevision = 1;
    revisionContext = null;
    revisionRows = [];
    if (ProjectState && typeof ProjectState.setRecord === 'function') ProjectState.setRecord({});
    setAppAccess(false);
    setAuthMessage('', false);
    if (ui.loginPassword) ui.loginPassword.value = '';
    const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY) || '';
    if (ui.loginUsername && savedUsername) ui.loginUsername.value = savedUsername;
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (authBusy) return;
    const username = normalizeUsername(ui.loginUsername && ui.loginUsername.value);
    const pin = String(ui.loginPassword && ui.loginPassword.value || '').trim();
    if (!username || !/^\d{4}$/.test(pin)) {
      setAuthMessage(t('loginFailed'), true);
      return;
    }
    authBusy = true;
    explicitLoginInProgress = true;
    const loginEpoch = ++authEpoch;
    if (ui.loginBtn) ui.loginBtn.disabled = true;
    setAuthMessage(t('loginBusy'), false);
    try {
      if (!window.PulumurAdminUsersApi) throw new Error('ADMIN_USERS_API_MISSING');
      const result = await window.PulumurAdminUsersApi.invoke('login', { username, pin }, { auth: false });
      if (result.backend_warning || result.rate_limit_mode === 'memory-fallback') {
        const status = window.PulumurBackendCompatibility
          ? window.PulumurBackendCompatibility.markFallback('pin_rate_limit')
          : { migrationRequired: true, rateLimitMode: 'memory-fallback' };
        syncBackendStatus(status);
      }
      const sessionData = result.session || {};
      const expectedUserId = String(result.user_id || '').trim();
      const expectedUsername = normalizeUsername(result.username || username);
      if (!sessionData.access_token || !sessionData.refresh_token || !expectedUserId) throw new Error('INVALID_LOGIN');

      await client.auth.signOut({ scope: 'local' }).catch(() => {});
      if (loginEpoch !== authEpoch) return;

      const sessionResult = await client.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      });
      const authenticatedSession = sessionResult.data && sessionResult.data.session;
      if (sessionResult.error || !authenticatedSession) throw sessionResult.error || new Error('INVALID_LOGIN');
      if (String(authenticatedSession.user && authenticatedSession.user.id || '') !== expectedUserId) {
        await client.auth.signOut({ scope: 'local' }).catch(() => {});
        throw new Error('LOGIN_IDENTITY_MISMATCH');
      }

      const remember = Boolean(ui.rememberMe && ui.rememberMe.checked);
      localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
      if (remember) {
        localStorage.setItem(SAVED_USERNAME_KEY, username);
        sessionStorage.removeItem(SESSION_ONLY_KEY);
      } else {
        localStorage.removeItem(SAVED_USERNAME_KEY);
        sessionStorage.setItem(SESSION_ONLY_KEY, '1');
      }

      const savePin = Boolean(ui.savePassword && ui.savePassword.checked);
      localStorage.setItem(SAVE_PASSWORD_KEY, savePin ? '1' : '0');
      if (savePin) await storeBrowserCredential(username, pin);

      await handleAuthenticated(authenticatedSession);
      if (!currentProfile || normalizeUsername(currentProfile.username) !== expectedUsername) {
        await client.auth.signOut({ scope: 'local' }).catch(() => {});
        throw new Error('LOGIN_PROFILE_MISMATCH');
      }
      if (window.PulumurActivity) {
        await window.PulumurActivity.log('site_login', { detail: { remembered: remember } });
      }
    } catch (error) {
      console.error(error);
      setAuthMessage(friendlyError(error, 'loginFailed'), true);
    } finally {
      explicitLoginInProgress = false;
      authBusy = false;
      if (ui.loginBtn) ui.loginBtn.disabled = false;
    }
  }

  function projectPayload(snapshot) {
    const model = snapshot && snapshot.projectModel ? snapshot.projectModel : {};
    const metadata = model.metadata || {};
    const limits = window.PulumurLimits && typeof window.PulumurLimits.get === 'function' ? window.PulumurLimits.get() : { maxProjectFileMb: 10 };
    const byteSize = new Blob([JSON.stringify(snapshot)]).size;
    if (byteSize > limits.maxProjectFileMb * 1024 * 1024) throw new Error(`PROJECT_SIZE_LIMIT:${limits.maxProjectFileMb}MB`);
    return {
      project_name: String(metadata.project || '').trim(),
      customer_name: String(metadata.customer || '').trim() || null,
      product_type: 'PERGO_RISE',
      project_data: snapshot,
      app_version: snapshot.appVersion || '10.4',
      schema_version: Number(snapshot.schemaVersion) || 2
    };
  }

  function snapshotWithRecord(rawSnapshot, record) {
    if (!window.PulumurProjectModel || !window.PulumurProjectSchema) throw new Error('PROJECT_MODEL_NOT_READY');
    const model = window.PulumurProjectModel.normalize(rawSnapshot && rawSnapshot.projectModel);
    model.revisionInfo = {
      projectId: record && record.projectId ? String(record.projectId) : null,
      projectCode: record && record.projectCode ? String(record.projectCode) : null,
      revisionNo: Math.max(1, Math.round(Number(record && record.revisionNo) || 1)),
      serverVersion: Number.isInteger(Number(record && record.serverVersion)) && Number(record.serverVersion) > 0
        ? Number(record.serverVersion)
        : null
    };
    return window.PulumurProjectSchema.createEnvelope(model, { appVersion: '10.4' });
  }

  function normalizeRpcRow(data) {
    if (Array.isArray(data)) return data[0] || null;
    return data || null;
  }

  function chooseConflictAction() {
    if (!ui.conflictDialog) return Promise.resolve('cancel');
    if (ui.conflictMessage) ui.conflictMessage.textContent = t('conflictTitle');
    if (ui.conflictReloadBtn) ui.conflictReloadBtn.textContent = t('conflictReload');
    if (ui.conflictRevisionBtn) ui.conflictRevisionBtn.textContent = t('conflictRevision');
    if (ui.conflictCopyBtn) ui.conflictCopyBtn.textContent = t('conflictCopy');
    return new Promise(resolve => {
      conflictResolver = resolve;
      if (!ui.conflictDialog.open) ui.conflictDialog.showModal();
    });
  }

  function finishConflictAction(action) {
    if (ui.conflictDialog && ui.conflictDialog.open) ui.conflictDialog.close();
    const resolve = conflictResolver;
    conflictResolver = null;
    if (resolve) resolve(action || 'cancel');
  }

  async function resolveVersionConflict(record, saveGeneration) {
    const action = await chooseConflictAction();
    if (action === 'reload') {
      await openProjectById(record.projectId, { force: true });
      return;
    }
    if (action === 'copy') {
      ProjectState.setRecord({ projectId: null, projectCode: null, revisionNo: 1, serverVersion: null });
      historicalMode = false;
      dirty = true;
      await saveCurrentProject();
      return;
    }
    if (action !== 'revision') {
      setStatus(t('conflictCancelled'));
      return;
    }

    const snapshot = ProjectState.createSnapshot();
    const payload = projectPayload(snapshot);
    const latestResult = await client.from('projects')
      .select('id, project_code, current_revision, server_version')
      .eq('id', record.projectId)
      .single();
    if (latestResult.error) throw latestResult.error;
    const latest = latestResult.data;
    const result = await client.rpc('create_revision_from_history_v1', {
      p_project_id: record.projectId,
      p_source_revision: Math.max(1, Number(record.revisionNo) || 1),
      p_expected_server_version: Number(latest.server_version),
      p_project_name: payload.project_name,
      p_customer_name: payload.customer_name,
      p_product_type: payload.product_type,
      p_project_data: payload.project_data,
      p_app_version: payload.app_version,
      p_schema_version: payload.schema_version,
      p_change_note: language() === 'en' ? 'Conflict-resolved local revision' : 'Çakışmadan korunan yerel revizyon'
    });
    if (result.error) throw result.error;
    const row = normalizeRpcRow(result.data);
    ProjectState.setRecord({
      projectId: row.id,
      projectCode: row.project_code,
      revisionNo: row.current_revision,
      serverVersion: Number(row.server_version)
    });
    historicalMode = false;
    historicalCurrentRevision = row.current_revision;
    const clean = markClean(saveGeneration);
    setStatus(clean
      ? `${t('revisionCreated')} ${row.project_code} / R${String(row.current_revision).padStart(2, '0')}`
      : t('changesDuringSave'));
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
    const saveGeneration = dirtyGeneration;
    setSaveState(t('saving'), 'saving');
    if (ui.saveCloudProjectBtn) ui.saveCloudProjectBtn.disabled = true;

    try {
      if (!record.projectId) {
        const rpcResult = await client.rpc('create_project_v2', {
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

        ProjectState.setRecord({
          projectId: row.id,
          projectCode: row.project_code,
          revisionNo: row.current_revision || 1,
          serverVersion: Number(row.server_version) || 1
        });
        const finalSnapshot = ProjectState.createSnapshot();
        const finalPayload = projectPayload(finalSnapshot);
        const syncResult = await client.rpc('save_project_v2', {
          p_project_id: row.id,
          p_expected_server_version: Number(row.server_version) || 1,
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
          revisionNo: synced.current_revision || row.current_revision || 1,
          serverVersion: Number(synced.server_version) || Number(row.server_version) || 1
        });
        historicalMode = false;
        historicalCurrentRevision = synced.current_revision || 1;
        const clean = markClean(saveGeneration);
        if (!silent) setStatus(clean ? `${t('projectCreated')} ${row.project_code}` : t('changesDuringSave'));
        if (window.PulumurActivity) {
          void window.PulumurActivity.log('project_create', {
            projectId: row.id, projectCode: row.project_code, revisionNo: row.current_revision || 1,
            detail: { project_name: finalPayload.project_name, customer_name: finalPayload.customer_name }
          });
        }
      } else {
        const snapshot = ProjectState.createSnapshot();
        const updatePayload = projectPayload(snapshot);
        if (!Number.isInteger(Number(record.serverVersion)) || Number(record.serverVersion) < 1) {
          throw new Error('PROJECT_VERSION_TOKEN_MISSING');
        }
        const updateResult = await client.rpc('save_project_v2', {
          p_project_id: record.projectId,
          p_expected_server_version: Number(record.serverVersion),
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
          revisionNo: row.current_revision || record.revisionNo || 1,
          serverVersion: Number(row.server_version)
        });
        historicalMode = false;
        historicalCurrentRevision = row.current_revision || record.revisionNo || 1;
        const clean = markClean(saveGeneration);
        if (!silent) setStatus(clean ? `${t('projectUpdated')} ${row.project_code}` : t('changesDuringSave'));
        if (window.PulumurActivity) {
          void window.PulumurActivity.log('project_save', {
            projectId: row.id, projectCode: row.project_code, revisionNo: row.current_revision || record.revisionNo || 1,
            detail: { project_name: updatePayload.project_name, customer_name: updatePayload.customer_name }
          });
        }
      }
      return true;
    } catch (error) {
      setSaveState(t('unsaved'), 'error');
      if (/PROJECT_VERSION_CONFLICT/i.test(String(error && error.message || '')) && !silent) {
        try {
          await resolveVersionConflict(getRecord(), saveGeneration);
        } catch (conflictError) {
          console.error(conflictError);
          window.alert(friendlyError(conflictError, 'saveFailed'));
        }
      } else if (!silent) {
        console.error(error);
        window.alert(friendlyError(error, 'saveFailed'));
      }
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
    const allowDelete = isSystemAdmin();
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
          ${allowDelete ? `<button type="button" class="danger-btn project-delete-btn" data-project-id="${escapeHtml(row.id)}">${escapeHtml(t('deleteProject'))}</button>` : ''}
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
    ui.projectsTableBody.querySelectorAll('.project-delete-btn').forEach(button => {
      button.addEventListener('click', () => deleteProjectById(button.dataset.projectId));
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
      .select('id, project_code, customer_name, project_name, product_type, current_revision, server_version, app_version, schema_version, created_at, updated_at')
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(500);
    if (result.error) throw result.error;
    projectRows = result.data || [];
    renderProjects();
  }

  async function deleteProjectById(projectId) {
    if (!isSystemAdmin()) {
      window.alert(t('systemAdminRequired'));
      return;
    }
    const row = projectRows.find(item => String(item.id) === String(projectId));
    if (!row) return;
    const label = [row.project_code, row.customer_name, row.project_name].filter(Boolean).join(' · ');
    if (!window.confirm(`${t('deleteProjectConfirm')}\n\n${label}`)) return;

    try {
      const result = await client.rpc('delete_project_v1', { p_project_id: projectId });
      if (result.error) throw result.error;

      const currentRecord = getRecord();
      if (String(currentRecord.projectId || '') === String(projectId)) {
        dirty = false;
        startNewProject();
      }

      projectRows = projectRows.filter(item => String(item.id) !== String(projectId));
      renderProjects();
      setStatus(`${t('projectDeleted')} ${row.project_code}`);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('project_delete', {
          projectId: null,
          projectCode: row.project_code,
          revisionNo: row.current_revision || 1,
          detail: {
            deleted_project_id: row.id,
            project_name: row.project_name,
            customer_name: row.customer_name
          }
        });
      }
    } catch (error) {
      console.error(error);
      window.alert(friendlyError(error, 'deleteProjectFailed'));
    }
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

  async function openProjectById(projectId, options = {}) {
    if (!options.force && dirty && !window.confirm(t('confirmDiscard'))) return;
    try {
      const result = await client
        .from('projects')
        .select('id, project_code, customer_name, project_name, product_type, current_revision, server_version, project_data, app_version, schema_version, created_at, updated_at')
        .eq('id', projectId)
        .single();
      if (result.error) throw result.error;
      const row = result.data;
      if (!row || !row.project_data) throw new Error(t('openFailed'));

      suppressDirty = true;
      const record = {
        projectId: row.id,
        projectCode: row.project_code,
        revisionNo: row.current_revision || 1,
        serverVersion: Number(row.server_version) || 1
      };
      const snapshot = snapshotWithRecord(JSON.parse(JSON.stringify(row.project_data)), record);
      ProjectState.restoreSnapshot(snapshot, { resetZoom: true, resetHistory: true });
      ProjectState.setRecord(record);
      historicalMode = false;
      historicalCurrentRevision = row.current_revision || 1;
      dirty = false;
      refreshProjectHeader();
      if (ui.projectsDialog && ui.projectsDialog.open) ui.projectsDialog.close();
      if (ui.revisionsDialog && ui.revisionsDialog.open) ui.revisionsDialog.close();
      setStatus(`${t('currentRevisionOpened')} ${row.project_code} / R${String(row.current_revision || 1).padStart(2, '0')}`);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('project_open', {
          projectId: row.id, projectCode: row.project_code, revisionNo: row.current_revision || 1,
          detail: { project_name: row.project_name, customer_name: row.customer_name }
        });
      }
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
    if (ui.revisionFromValue) ui.revisionFromValue.textContent = `R${String(record.revisionNo || 1).padStart(2, '0')}`;
    if (ui.revisionToValue) ui.revisionToValue.textContent = `R${String((historicalMode ? historicalCurrentRevision : record.revisionNo || 1) + 1).padStart(2, '0')}`;
    if (ui.revisionChangeNote) ui.revisionChangeNote.value = '';
    if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = historicalMode ? t('historicalRevisionHint') : t('confirmRevision');
    if (ui.newRevisionDialog && !ui.newRevisionDialog.open) ui.newRevisionDialog.showModal();
    window.setTimeout(() => ui.revisionChangeNote && ui.revisionChangeNote.focus(), 20);
  }

  async function createNewRevision(event) {
    event.preventDefault();
    if (!canWriteProjects()) { window.alert(t('noWritePermission')); return; }
    const record = getRecord();
    if (!record.projectId) return;
    if (!Number.isInteger(Number(record.serverVersion)) || Number(record.serverVersion) < 1) {
      window.alert(t('openFailed'));
      return;
    }
    if (ui.newRevisionConfirmBtn) ui.newRevisionConfirmBtn.disabled = true;
    if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = t('revisionCreating');
    const saveGeneration = dirtyGeneration;
    try {
      const snapshot = ProjectState.createSnapshot();
      const payload = projectPayload(snapshot);
      if (!payload.project_name) throw new Error(t('projectNameRequired'));
      const rpcName = historicalMode ? 'create_revision_from_history_v1' : 'create_revision_v2';
      const args = {
        p_project_id: record.projectId,
        p_expected_server_version: Number(record.serverVersion),
        p_project_name: payload.project_name,
        p_customer_name: payload.customer_name,
        p_product_type: payload.product_type,
        p_project_data: payload.project_data,
        p_app_version: payload.app_version,
        p_schema_version: payload.schema_version,
        p_change_note: String(ui.revisionChangeNote && ui.revisionChangeNote.value || '').trim() || null
      };
      if (historicalMode) args.p_source_revision = Math.max(1, Number(record.revisionNo) || 1);
      const result = await client.rpc(rpcName, args);
      if (result.error) throw result.error;
      const row = normalizeRpcRow(result.data);
      if (!row || !row.id) throw new Error(t('revisionFailed'));

      ProjectState.setRecord({
        projectId: row.id,
        projectCode: row.project_code,
        revisionNo: row.current_revision,
        serverVersion: Number(row.server_version)
      });
      historicalMode = false;
      historicalCurrentRevision = row.current_revision;
      const clean = markClean(saveGeneration);

      if (ui.newRevisionDialog && ui.newRevisionDialog.open) ui.newRevisionDialog.close();
      refreshProjectHeader();
      setStatus(clean
        ? `${t('revisionCreated')} ${row.project_code} / R${String(row.current_revision).padStart(2, '0')}`
        : t('changesDuringSave'));
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('revision_create', {
          projectId: row.id, projectCode: row.project_code, revisionNo: row.current_revision,
          detail: { change_note: String(ui.revisionChangeNote && ui.revisionChangeNote.value || '').trim() || null }
        });
      }
    } catch (error) {
      if (/PROJECT_VERSION_CONFLICT/i.test(String(error && error.message || ''))) {
        if (ui.newRevisionDialog && ui.newRevisionDialog.open) ui.newRevisionDialog.close();
        try {
          await resolveVersionConflict(record, saveGeneration);
        } catch (conflictError) {
          console.error(conflictError);
          window.alert(friendlyError(conflictError, 'revisionFailed'));
        }
      } else {
        console.error(error);
        if (ui.newRevisionMessage) ui.newRevisionMessage.textContent = friendlyError(error, 'revisionFailed');
        window.alert(friendlyError(error, 'revisionFailed'));
      }
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
        .select('id, project_code, project_name, customer_name, current_revision, server_version, updated_at')
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
      const record = {
        projectId: revisionContext.id,
        projectCode: revisionContext.project_code,
        revisionNo: Number(row.revision_no) || 1,
        serverVersion: Number(revisionContext.server_version) || 1
      };
      const snapshot = snapshotWithRecord(JSON.parse(JSON.stringify(row.project_data)), record);
      ProjectState.restoreSnapshot(snapshot, { resetZoom: true, resetHistory: true });
      ProjectState.setRecord(record);
      historicalMode = true;
      historicalCurrentRevision = currentRevision;
      dirty = false;
      refreshProjectHeader();
      if (ui.projectsDialog && ui.projectsDialog.open) ui.projectsDialog.close();
      if (ui.revisionsDialog && ui.revisionsDialog.open) ui.revisionsDialog.close();
      setStatus(`${t('revisionOpened')} ${revisionContext.project_code} / R${String(row.revision_no).padStart(2, '0')}`);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('revision_open', {
          projectId: revisionContext.id, projectCode: revisionContext.project_code, revisionNo: row.revision_no,
          detail: { historical: true }
        });
      }
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
      if (target.closest('#cloudProjectBar') || target.closest('#projectsDialog') || target.closest('#newRevisionDialog') || target.closest('#revisionsDialog') || target.closest('#authGate')) return;
      if (['generateBtn', 'pdfBtn', 'previewBtn', 'fitPreviewBtn', 'expandPreviewBtn', 'helpBtn', 'installBtn', 'projectExportBtn', 'previewProjectExportBtn', 'projectImportBtn'].includes(target.id)) return;
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
    if (ui.loginPassword) ui.loginPassword.addEventListener('input', () => {
      ui.loginPassword.value = ui.loginPassword.value.replace(/\D/g, '').slice(0, 4);
    });
    if (ui.loginForm) ui.loginForm.addEventListener('submit', submitLogin);
    if (ui.logoutBtn) ui.logoutBtn.addEventListener('click', async () => {
      if (dirty && !window.confirm(t('confirmDiscard'))) return;
      if (window.PulumurActivity) {
        await window.PulumurActivity.log('site_logout');
        await window.PulumurActivity.end();
      }
      sessionStorage.removeItem(SESSION_ONLY_KEY);
      await client.auth.signOut({ scope: 'local' });
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
    if (ui.conflictReloadBtn) ui.conflictReloadBtn.addEventListener('click', () => finishConflictAction('reload'));
    if (ui.conflictRevisionBtn) ui.conflictRevisionBtn.addEventListener('click', () => finishConflictAction('revision'));
    if (ui.conflictCopyBtn) ui.conflictCopyBtn.addEventListener('click', () => finishConflictAction('copy'));
    if (ui.conflictCancelBtn) ui.conflictCancelBtn.addEventListener('click', () => finishConflictAction('cancel'));
    if (ui.conflictDialog) ui.conflictDialog.addEventListener('cancel', event => {
      event.preventDefault();
      finishConflictAction('cancel');
    });
    if ($('languageSelect')) $('languageSelect').addEventListener('change', () => {
      applyLoginLanguage();
      refreshProjectHeader();
      if (backendWarningCode) updateBackendWarning(backendWarningCode);
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
    if (window.PulumurActivity) void window.PulumurActivity.init(client);
    bindUi();
    applyLoginLanguage();
    await restoreLoginPreferences();
    void probeBackendHealth();
    setAuthMessage(t('authLoading'), false);

    client.auth.onAuthStateChange((_event, session) => {
      const eventEpoch = authEpoch;
      window.setTimeout(async () => {
        if (explicitLoginInProgress || eventEpoch !== authEpoch) return;
        if (session && !rememberPreference() && sessionStorage.getItem(SESSION_ONLY_KEY) !== '1') {
          await client.auth.signOut({ scope: 'local' });
          return;
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
    if (sessionResult.data.session && !rememberPreference() && sessionStorage.getItem(SESSION_ONLY_KEY) !== '1') {
      await client.auth.signOut({ scope: 'local' });
      await handleSignedOut();
    } else if (sessionResult.data.session) {
      await handleAuthenticated(sessionResult.data.session);
    } else {
      await handleSignedOut();
    }
  }

  init().catch(error => {
    console.error(error);
    setAppAccess(false);
    setAuthMessage(friendlyError(error, 'loginFailed'), true);
  });
})();
