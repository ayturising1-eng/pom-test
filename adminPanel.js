(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const ui = {
    openBtn: $('adminPanelBtn'), dialog: $('adminPanelDialog'), closeBtn: $('adminPanelCloseBtn'),
    title: $('adminPanelTitle'), subtitle: $('adminPanelSubtitle'), message: $('adminPanelMessage'),
    usersTab: $('adminUsersTab'), organizationsTab: $('adminOrganizationsTab'), activityTab: $('adminActivityTab'), limitsTab: $('adminLimitsTab'),
    usersPane: $('adminUsersPane'), organizationsPane: $('adminOrganizationsPane'), activityPane: $('adminActivityPane'), limitsPane: $('adminLimitsPane'),
    limitsTitle: $('adminLimitsTitle'), limitsSubtitle: $('adminLimitsSubtitle'), limitsForm: $('adminLimitsForm'), limitsGrid: $('adminLimitsGrid'), limitsNote: $('adminLimitsNote'), limitsReset: $('adminLimitsReset'), limitsSave: $('adminLimitsSave'),
    limitsScope: $('adminLimitsScope'), limitsScopeLabel: $('adminLimitsScopeLabel'), limitsAuditTitle: $('adminLimitsAuditTitle'),
    limitsAuditBody: $('adminLimitsAuditBody'), limitsAuditEmpty: $('adminLimitsAuditEmpty'),
    usersTitle: $('adminUsersTitle'), inviteTitle: $('adminInviteTitle'),
    inviteForm: $('adminInviteForm'), inviteOrgField: $('adminInviteOrgField'), inviteOrg: $('adminInviteOrg'),
    inviteFullName: $('adminInviteFullName'), inviteUsername: $('adminInviteUsername'),
    invitePassword: $('adminInvitePassword'), invitePasswordConfirm: $('adminInvitePasswordConfirm'),
    inviteRole: $('adminInviteRole'), inviteSubmit: $('adminInviteSubmit'),
    userFilterOrgField: $('adminUserFilterOrgField'), userFilterOrg: $('adminUserFilterOrg'), userSearch: $('adminUserSearch'),
    usersRefresh: $('adminUsersRefresh'), usersBody: $('adminUsersBody'), usersEmpty: $('adminUsersEmpty'),
    organizationsTitle: $('adminOrganizationsTitle'), organizationCreateForm: $('adminOrganizationCreateForm'),
    organizationName: $('adminOrganizationName'), organizationLicenseEnd: $('adminOrganizationLicenseEnd'),
    organizationMaxUsers: $('adminOrganizationMaxUsers'), organizationCreateSubmit: $('adminOrganizationCreateSubmit'),
    organizationsRefresh: $('adminOrganizationsRefresh'), organizationsBody: $('adminOrganizationsBody'),
    organizationsEmpty: $('adminOrganizationsEmpty'),
    activityTitle: $('adminActivityTitle'), activityOrgField: $('adminActivityOrgField'), activityOrg: $('adminActivityOrg'),
    activityFrom: $('adminActivityFrom'), activityTo: $('adminActivityTo'), activityRefresh: $('adminActivityRefresh'),
    summaryVisits: $('adminSummaryVisits'), summaryUsers: $('adminSummaryUsers'), summaryActions: $('adminSummaryActions'), summaryLast: $('adminSummaryLast'),
    sessionsBody: $('adminSessionsBody'), sessionsEmpty: $('adminSessionsEmpty'), activityBody: $('adminActivityBody'), activityEmpty: $('adminActivityEmpty'),
    deleteDialog: $('adminDeleteUserDialog'), deleteForm: $('adminDeleteUserForm'), deleteTitle: $('adminDeleteUserTitle'),
    deleteUserName: $('adminDeleteUserName'), deleteCloseBtn: $('adminDeleteUserCloseBtn'), deleteCancelBtn: $('adminDeleteUserCancelBtn'),
    deleteMessage: $('adminDeleteUserMessage'), deleteSubmit: $('adminDeleteUserSubmit'),
    deleteLastAdminConfirm: $('adminDeleteLastAdminConfirm'), deleteConfirmPrompt: $('adminDeleteConfirmPrompt'),
    deleteConfirmUsername: $('adminDeleteConfirmUsername'),
    passwordDialog: $('adminPasswordDialog'), passwordForm: $('adminPasswordForm'), passwordTitle: $('adminPasswordTitle'),
    passwordUser: $('adminPasswordUser'), passwordCloseBtn: $('adminPasswordCloseBtn'), passwordCancelBtn: $('adminPasswordCancelBtn'),
    newPassword: $('adminNewPassword'), newPasswordConfirm: $('adminNewPasswordConfirm'),
    passwordMessage: $('adminPasswordMessage'), passwordSubmit: $('adminPasswordSubmit'),
    loginLockDialog: $('adminLoginLockDialog'), loginLockForm: $('adminLoginLockForm'), loginLockTitle: $('adminLoginLockTitle'),
    loginLockUser: $('adminLoginLockUser'), loginLockCloseBtn: $('adminLoginLockCloseBtn'), loginLockCancelBtn: $('adminLoginLockCancelBtn'),
    loginLockResetBtn: $('adminLoginLockResetBtn'), loginLockSummary: $('adminLoginLockSummary'),
    loginLockAttempts: $('adminLoginLockAttempts'), loginLockMessage: $('adminLoginLockMessage'),
    ownSecurityCard: $('adminOwnSecurityCard'), ownSecurityTitle: $('adminOwnSecurityTitle'), ownSecuritySubtitle: $('adminOwnSecuritySubtitle'),
    changeOwnUsernameBtn: $('adminChangeOwnUsernameBtn'), globalLogoutBtn: $('adminGlobalLogoutBtn'),
    ownUsernameDialog: $('adminOwnUsernameDialog'), ownUsernameForm: $('adminOwnUsernameForm'), ownUsernameTitle: $('adminOwnUsernameTitle'), ownUsernameCurrent: $('adminOwnUsernameCurrent'),
    ownUsernameCloseBtn: $('adminOwnUsernameCloseBtn'), ownUsernameCancelBtn: $('adminOwnUsernameCancelBtn'), ownUsernameNew: $('adminOwnUsernameNew'), ownUsernamePin: $('adminOwnUsernamePin'),
    ownUsernameConfirm: $('adminOwnUsernameConfirm'), ownUsernameMessage: $('adminOwnUsernameMessage'), ownUsernameSubmitBtn: $('adminOwnUsernameSubmitBtn'),
    globalLogoutDialog: $('adminGlobalLogoutDialog'), globalLogoutForm: $('adminGlobalLogoutForm'), globalLogoutCloseBtn: $('adminGlobalLogoutCloseBtn'), globalLogoutCancelBtn: $('adminGlobalLogoutCancelBtn'),
    globalLogoutConfirm: $('adminGlobalLogoutConfirm'), globalLogoutMessage: $('adminGlobalLogoutMessage'), globalLogoutSubmitBtn: $('adminGlobalLogoutSubmitBtn')
  };

  const TEXT = {
    tr: {
      adminPanel: 'Yönetici Paneli', panelSubtitle: 'Firma, kullanıcı, lisans ve uygulama güvenlik ayarları', users: 'Kullanıcılar', firms: 'Firmalar', limits: 'Uygulama Limitleri', limitsSaved: 'Merkezi uygulama limitleri kaydedildi.', limitsReset: 'Seçilen kapsam varsayılan değerlere döndürüldü.', globalLimits: 'Genel varsayılanlar', limitScope: 'Kapsam', limitAudit: 'Limit Değişiklik Geçmişi', noLimitAudit: 'Limit değişiklik kaydı bulunamadı.',
      inviteUser: 'Yeni Kullanıcı Oluştur', fullName: 'Ad Soyad', username: 'Kullanıcı Adı', role: 'Rol', firm: 'Firma',
      invite: 'Kullanıcı Oluştur', refresh: 'Yenile', search: 'Ara', searchPlaceholder: 'Firma, ad veya kullanıcı adı', userCode: 'Kod', status: 'Durum', projects: 'Projeler', actions: 'İşlemler',
      companyAdmin: 'Firma Yöneticisi', designer: 'Tasarımcı', systemAdmin: 'Sistem Yöneticisi', active: 'Aktif', passive: 'Pasif',
      save: 'Kaydet', password: 'PIN Belirle', passwordAgain: 'PIN Kodu Tekrar', newPassword: 'Yeni PIN Kodu', noUsers: 'Kullanıcı bulunamadı.', loading: 'Yükleniyor…',
      createFirm: 'Yeni Firma Oluştur', firmName: 'Firma Adı', licenseEnd: 'Lisans Bitişi', maxUsers: 'Kullanıcı Limiti', create: 'Firma Oluştur',
      license: 'Lisans', usage: 'Kullanım', noFirms: 'Firma bulunamadı.',
      inviteSuccess: 'Kullanıcı oluşturuldu.', userSaved: 'Kullanıcı güncellendi.', passwordSaved: 'PIN kodu güncellendi.',
      firmCreated: 'Firma oluşturuldu.', firmSaved: 'Firma güncellendi.', firmDeleted: 'Firma ve bağlı test verileri silindi.', deleteFirm: 'Sil', deleteFirmConfirm: 'Bu firma; kullanıcıları, projeleri ve revizyonlarıyla birlikte kalıcı olarak silinecek. Devam edilsin mi?', currentFirmProtected: 'Giriş yaptığın sistem firmasını silemezsin.', adminRequired: 'Bu ekran yalnız yöneticiler içindir.',
      setupMissing: 'Yönetici paneli altyapısı hazır değil. Edge Function kurulumunu kontrol et.',
      confirmDeactivate: 'Bu kullanıcı pasifleştirilecek. Devam edilsin mi?', protectedUser: 'Bu hesap panelden değiştirilemez.',
      usernameHint: '3–32 karakter; küçük harf, rakam, nokta, tire veya alt çizgi.',
      inviteHelp: 'Kullanıcı adı ve 4 haneli ilk PIN kodu yönetici tarafından belirlenir.',
      userLimitReached: 'Firmanın kullanıcı limiti doldu.', licenseExpired: 'Firma lisansı aktif değil.', usernameExists: 'Bu kullanıcı adı zaten kullanılıyor.',
      invalidUsername: 'Kullanıcı adı biçimi uygun değil.', passwordInvalid: 'PIN kodu yalnızca 4 rakamdan oluşmalı.', passwordMismatch: 'PIN kodları aynı değil.', lastAdmin: 'Firmada en az bir aktif firma yöneticisi kalmalı.',
      selfManagement: 'Kendi hesabını bu panelden değiştiremezsin.', functionMissing: 'admin-users Edge Function bulunamadı. Supabase Edge Functions bölümünde admin-users adıyla Deploy et.', functionJwt: 'Yönetici oturumu doğrulanamadı. Sayfayı güncelle; devam ederse çıkış yapıp tekrar giriş yap.', functionNetwork: 'Edge Function bağlantısı kurulamadı. İnternet bağlantısını ve Supabase proje adresini kontrol et.', functionReady: 'admin-users Edge Function bağlantısı hazır.',
      allFirms: 'Tüm firmalar', openPanel: 'Yönetim', close: 'Kapat', activeUsers: 'aktif kullanıcı',
      activity: 'Kullanım Geçmişi', visitsTitle: 'Ziyaret Saatleri', actionsTitle: 'Kullanıcı İşlem Geçmişi',
      visits: 'Ziyaret', activeUserCount: 'Aktif kullanıcı', actionCount: 'İşlem', lastActivity: 'Son hareket',
      noSessions: 'Bu tarih aralığında ziyaret bulunamadı.', noActivity: 'Bu tarih aralığında işlem bulunamadı.',
      deleteUser: 'Sil', deleteTitle: 'Kullanıcıyı Sil', deleteWarning: 'Bu işlem kalıcıdır ve geri alınamaz.',
      deleteSuccess: 'Kullanıcı silindi.', deleteWithProjectsSuccess: 'Kullanıcı ve oluşturduğu projeler silindi.',
      lastAdminOverrideWarning: 'Bu kullanıcı firmadaki son aktif firma yöneticisidir. Silme işleminden sonra firmada aktif firma yöneticisi kalmayacaktır.',
      lastAdminConfirmPrompt: 'Devam etmek için hedef kullanıcı adını eksiksiz yaz:',
      lastAdminConfirmMismatch: 'Son firma yöneticisini silmek için hedef kullanıcı adını eksiksiz yazmalısın.',
      lastAdminConfirmationRequired: 'Bu hesap son aktif firma yöneticisidir. Güçlü kullanıcı adı onayı gereklidir.',
      selfDelete: 'Kendi hesabını silemezsin.', systemAdminProtected: 'Sistem yöneticisi hesabı silinemez.',
      deleteFailed: 'Kullanıcı silinemedi.', deleteLogWarning: 'Kullanıcı silindi ancak işlem günlüğü doğrulanamadı.', anonymous: 'Anonim ziyaret', durationMinute: 'dk', durationHour: 'sa',
      action_site_login: 'Giriş yaptı', action_site_logout: 'Çıkış yaptı', action_project_create: 'Proje oluşturdu',
      action_project_save: 'Projeyi kaydetti', action_project_open: 'Projeyi açtı', action_revision_create: 'Revizyon oluşturdu',
      action_revision_open: 'Eski revizyonu açtı', action_dxf_download: 'DXF indirdi', action_pdf_download: 'PDF indirdi',
      action_project_file_download: 'Proje dosyası indirdi', action_user_create: 'Kullanıcı oluşturdu',
      action_user_update: 'Kullanıcı güncelledi', action_pin_update: 'PIN değiştirdi', action_user_delete: 'Kullanıcı sildi',
      loginLock: 'Giriş Kilidi', loginLockTitle: 'Giriş Kilidi ve Deneme Geçmişi', loginLockReset: 'Kilidi Sıfırla', loginLockResetConfirm: 'Bu kullanıcının kullanıcı adı kilidi ve son giriş denemeleriyle ilişkili IP kilitleri sıfırlansın mı?', loginLockResetSuccess: 'Giriş kilidi sıfırlandı.', loginLockNoAttempts: 'Yakın tarihli giriş denemesi bulunamadı.', usernameLocked: 'Kullanıcı adı kilidi', recentIpLocks: 'İlişkili IP kilidi', failureCount: 'Başarısız deneme', lockedUntil: 'Kilit bitişi', notLocked: 'Kilitli değil', usernameChangeSecureOnly: 'Mevcut kullanıcı adı bu ekrandan değiştirilemez; güvenli kullanıcı adı değiştirme akışı gerekir.', action_login_lock_reset: 'Giriş kilidini sıfırladı', ownSecurity: 'Hesap Güvenliği', ownSecuritySubtitle: 'Sistem Yöneticisi hesabının kullanıcı adı ve oturum güvenliği.', changeOwnUsername: 'Kullanıcı Adımı Değiştir', globalLogout: 'Tüm Cihazlardan Çıkış Yap', usernameChangeWarning: 'Bu işlem tüm mevcut oturumları kapatır. Yeni kullanıcı adıyla tekrar giriş yapmanız gerekir.', currentPin: 'Mevcut PIN', newUsername: 'Yeni kullanıcı adı', confirmNewUsername: 'Yeni kullanıcı adını tekrar yaz', globalLogoutConfirmText: 'Tüm cihazlardaki oturumların kapatılmasını onaylıyorum.', usernameConfirmMismatch: 'Yeni kullanıcı adı onayı eşleşmiyor.', currentPinInvalid: 'Mevcut PIN doğrulanamadı.', usernameChanged: 'Kullanıcı adı değiştirildi. Yeni kullanıcı adıyla tekrar giriş yapın.', globalLogoutConfirmRequired: 'Tüm cihazlardan çıkış onayını işaretleyin.', globalLogoutFailed: 'Tüm cihazlardan çıkış işlemi tamamlanamadı.', action_self_username_change: 'Kendi kullanıcı adını değiştirdi', action_global_logout: 'Tüm cihazlardan çıkış yaptı',
      action_organization_create: 'Firma oluşturdu', action_organization_update: 'Firma güncelledi', action_organization_delete: 'Firma sildi'
    },
    en: {
      adminPanel: 'Admin Panel', panelSubtitle: 'Company, user, license and application safety settings', users: 'Users', firms: 'Companies', limits: 'Application Limits', limitsSaved: 'Central application limits saved.', limitsReset: 'The selected scope was restored to defaults.', globalLimits: 'Global defaults', limitScope: 'Scope', limitAudit: 'Limit Change History', noLimitAudit: 'No limit changes were found.',
      inviteUser: 'Create New User', fullName: 'Full Name', username: 'Username', role: 'Role', firm: 'Company',
      invite: 'Create User', refresh: 'Refresh', search: 'Search', searchPlaceholder: 'Company, name or username', userCode: 'Code', status: 'Status', projects: 'Projects', actions: 'Actions',
      companyAdmin: 'Company Administrator', designer: 'Designer', systemAdmin: 'System Administrator', active: 'Active', passive: 'Inactive',
      save: 'Save', password: 'Set PIN', passwordAgain: 'Repeat PIN', newPassword: 'New PIN', noUsers: 'No users found.', loading: 'Loading…',
      createFirm: 'Create New Company', firmName: 'Company Name', licenseEnd: 'License End', maxUsers: 'User Limit', create: 'Create Company',
      license: 'License', usage: 'Usage', noFirms: 'No companies found.',
      inviteSuccess: 'User created.', userSaved: 'User updated.', passwordSaved: 'PIN updated.',
      firmCreated: 'Company created.', firmSaved: 'Company updated.', firmDeleted: 'Company and its linked test data were deleted.', deleteFirm: 'Delete', deleteFirmConfirm: 'This company, its users, projects and revisions will be permanently deleted. Continue?', currentFirmProtected: 'You cannot delete the system company used by your active session.', adminRequired: 'This screen is for administrators only.',
      setupMissing: 'Admin infrastructure is not ready. Check the Edge Function setup.',
      confirmDeactivate: 'This user will be deactivated. Continue?', protectedUser: 'This account cannot be changed from the panel.',
      usernameHint: '3–32 characters; lowercase letters, numbers, dot, dash or underscore.',
      inviteHelp: 'The username and initial 4-digit PIN are assigned by an administrator.',
      userLimitReached: 'The company user limit has been reached.', licenseExpired: 'The company license is not active.', usernameExists: 'This username is already in use.',
      invalidUsername: 'The username format is invalid.', passwordInvalid: 'The PIN must contain exactly 4 digits.', passwordMismatch: 'PIN codes do not match.', lastAdmin: 'At least one active company administrator must remain.',
      selfManagement: 'You cannot change your own account from this panel.', functionMissing: 'The admin-users Edge Function was not found. Deploy it with the exact name admin-users.', functionJwt: 'The admin session could not be verified. Refresh the page; if it continues, sign out and sign in again.', functionNetwork: 'The Edge Function could not be reached. Check the network and Supabase project URL.', functionReady: 'The admin-users Edge Function is ready.',
      allFirms: 'All companies', openPanel: 'Admin', close: 'Close', activeUsers: 'active users',
      activity: 'Usage History', visitsTitle: 'Visit Hours', actionsTitle: 'User Activity History',
      visits: 'Visits', activeUserCount: 'Active users', actionCount: 'Actions', lastActivity: 'Last activity',
      noSessions: 'No visits were found in this date range.', noActivity: 'No activity was found in this date range.',
      deleteUser: 'Delete', deleteTitle: 'Delete User', deleteWarning: 'This action is permanent and cannot be undone.',
      deleteSuccess: 'User deleted.', deleteWithProjectsSuccess: 'User and created projects deleted.',
      lastAdminOverrideWarning: 'This user is the company’s last active company administrator. The company will have no active company administrator after deletion.',
      lastAdminConfirmPrompt: 'To continue, type the target username exactly:',
      lastAdminConfirmMismatch: 'Type the target username exactly to delete the last company administrator.',
      lastAdminConfirmationRequired: 'This account is the last active company administrator. Strong username confirmation is required.',
      selfDelete: 'You cannot delete your own account.', systemAdminProtected: 'The system administrator account cannot be deleted.',
      deleteFailed: 'The user could not be deleted.', deleteLogWarning: 'The user was deleted, but the activity log could not be verified.', anonymous: 'Anonymous visit', durationMinute: 'min', durationHour: 'h',
      action_site_login: 'Signed in', action_site_logout: 'Signed out', action_project_create: 'Created project',
      action_project_save: 'Saved project', action_project_open: 'Opened project', action_revision_create: 'Created revision',
      action_revision_open: 'Opened old revision', action_dxf_download: 'Downloaded DXF', action_pdf_download: 'Downloaded PDF',
      action_project_file_download: 'Downloaded project file', action_user_create: 'Created user',
      action_user_update: 'Updated user', action_pin_update: 'Changed PIN', action_user_delete: 'Deleted user',
      loginLock: 'Login Lock', loginLockTitle: 'Login Lock and Attempt History', loginLockReset: 'Reset Lock', loginLockResetConfirm: 'Reset this user’s username lock and IP locks linked to recent login attempts?', loginLockResetSuccess: 'Login lock reset.', loginLockNoAttempts: 'No recent login attempts were found.', usernameLocked: 'Username lock', recentIpLocks: 'Linked IP locks', failureCount: 'Failed attempts', lockedUntil: 'Locked until', notLocked: 'Not locked', usernameChangeSecureOnly: 'An existing username cannot be changed here; a secure username-change flow is required.', action_login_lock_reset: 'Reset login lock', ownSecurity: 'Account Security', ownSecuritySubtitle: 'Username and session security for the System Administrator account.', changeOwnUsername: 'Change My Username', globalLogout: 'Sign Out on All Devices', usernameChangeWarning: 'This closes all existing sessions. You must sign in again with the new username.', currentPin: 'Current PIN', newUsername: 'New username', confirmNewUsername: 'Type the new username again', globalLogoutConfirmText: 'I confirm that all sessions on every device will be closed.', usernameConfirmMismatch: 'The new username confirmation does not match.', currentPinInvalid: 'The current PIN could not be verified.', usernameChanged: 'Username changed. Sign in again with the new username.', globalLogoutConfirmRequired: 'Confirm signing out on every device.', globalLogoutFailed: 'Global sign-out could not be completed.', action_self_username_change: 'Changed own username', action_global_logout: 'Signed out on all devices',
      action_organization_create: 'Created company', action_organization_update: 'Updated company', action_organization_delete: 'Deleted company'
    }
  };

  let client = null;
  let currentUser = null;
  let currentProfile = null;
  let organizations = [];
  let users = [];
  let busy = false;
  let passwordTargetUserId = null;
  let deleteTargetUserId = null;
  let deleteRequiresLastAdminConfirmation = false;
  let loginLockTargetUserId = null;
  let usageSessions = [];
  let activityRows = [];
  let limitRows = [];
  let limitAuditRows = [];

  function language() {
    return $('languageSelect') && $('languageSelect').value === 'en' ? 'en' : 'tr';
  }

  function t(key) {
    return (TEXT[language()] && TEXT[language()][key]) || TEXT.tr[key] || key;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function setMessage(message, isError) {
    if (!ui.message) return;
    ui.message.textContent = message || '';
    ui.message.classList.toggle('is-error', Boolean(isError));
  }

  function errorMessage(error) {
    const raw = String((error && (error.message || error.error || error.details || error.code)) || error || '').trim();
    const status = Number(error && error.status || 0);
    if (/ADMIN_REQUIRED|SYSTEM_ADMIN_REQUIRED|ORGANIZATION_ACCESS_DENIED/i.test(raw)) return t('adminRequired');
    if (/USER_LIMIT_REACHED/i.test(raw)) return t('userLimitReached');
    if (/LICENSE_EXPIRED|LICENSE_NOT_STARTED|ORGANIZATION_INACTIVE/i.test(raw)) return t('licenseExpired');
    if (/USERNAME_ALREADY_EXISTS|duplicate key.*username/i.test(raw)) return t('usernameExists');
    if (/USERNAME_INVALID/i.test(raw)) return t('invalidUsername');
    if (/PIN_INVALID|PASSWORD_INVALID|PASSWORD_TOO_SHORT|PASSWORD_TOO_LONG/i.test(raw)) return t('passwordInvalid');
    if (/LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED/i.test(raw)) return t('lastAdminConfirmationRequired');
    if (/LAST_COMPANY_ADMIN_REQUIRED/i.test(raw)) return t('lastAdmin');
    if (/SELF_DELETE_NOT_ALLOWED/i.test(raw)) return t('selfDelete');
    if (/SYSTEM_ADMIN_PROTECTED/i.test(raw)) return t('systemAdminProtected');
    if (/CURRENT_ORGANIZATION_PROTECTED|SYSTEM_ADMIN_ORGANIZATION_PROTECTED/i.test(raw)) return t('currentFirmProtected');
    if (/SYSTEM_ADMIN_REQUIRED/i.test(raw)) return t('adminRequired');
    if (/SELF_MANAGEMENT_NOT_ALLOWED/i.test(raw)) return t('selfManagement');
    if (/USER_DELETE_FAILED|PROJECT_DELETE_FAILED/i.test(raw)) return t('deleteFailed');
    if (/LOGIN_RATE_LIMIT_UNAVAILABLE/i.test(raw)) return language() === 'en' ? 'Login security tables or RPC functions are unavailable.' : 'Giriş güvenliği tablolarına veya RPC fonksiyonlarına erişilemiyor.';
    if (/USERNAME_CHANGE_REQUIRES_SECURE_FLOW/i.test(raw)) return t('usernameChangeSecureOnly');
    if (/CURRENT_PIN_INVALID|INVALID_CURRENT_PIN/i.test(raw)) return t('currentPinInvalid');
    if (/USERNAME_CONFIRMATION_MISMATCH/i.test(raw)) return t('usernameConfirmMismatch');
    if (/GLOBAL_SIGNOUT_FAILED/i.test(raw)) return t('globalLogoutFailed');
    if (/PIN_PEPPER_MISSING/i.test(raw)) return language() === 'en' ? 'The PLMR_PIN_PEPPER secret is missing under Edge Functions > Secrets.' : 'Edge Functions > Secrets bölümünde PLMR_PIN_PEPPER eksik.';
    if (/FUNCTION_SECRETS_MISSING/i.test(raw)) return language() === 'en' ? 'Supabase function environment variables are missing.' : 'Supabase Edge Function sistem anahtarları bulunamadı.';
    if (/AUTH_REQUIRED|AUTH_INVALID/i.test(raw)) return `${t('functionJwt')} [${raw || 'AUTH_REQUIRED'} / HTTP ${status || 401} / V10.4]`;
    if (/Invalid JWT|Missing authorization header/i.test(raw) || status === 401) {
      return language() === 'en'
        ? 'Authorization was rejected. Sign out and sign in again; if it continues, check the Edge Function logs.'
        : 'Yetkilendirme reddedildi. Çıkış yapıp tekrar giriş yap; devam ederse Edge Function loglarını kontrol et.';
    }
    if (/FUNCTION_NETWORK_ERROR|Failed to fetch|NetworkError/i.test(raw) || status === 0) return t('functionNetwork');
    if (/HTTP_404|NOT_FOUND/i.test(raw) || status === 404) return t('functionMissing');
    if (/function .* does not exist|permission denied|relation .* does not exist/i.test(raw)) return t('setupMissing');
    return raw || t('setupMissing');
  }

  function isAdmin() {
    return Boolean(currentProfile && ['system_admin', 'company_admin'].includes(currentProfile.role));
  }

  function isSystemAdmin() {
    return Boolean(currentProfile && currentProfile.role === 'system_admin');
  }

  function roleLabel(role) {
    if (role === 'system_admin') return t('systemAdmin');
    if (role === 'company_admin') return t('companyAdmin');
    return t('designer');
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'tr-TR').format(date);
  }

  function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'tr-TR', {
      dateStyle: 'short', timeStyle: 'short'
    }).format(date);
  }

  function formatDuration(startValue, endValue) {
    const start = new Date(startValue || 0).getTime();
    const end = new Date(endValue || startValue || 0).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return '-';
    const minutes = Math.max(0, Math.round((end - start) / 60000));
    if (minutes < 60) return `${minutes} ${t('durationMinute')}`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} ${t('durationHour')} ${rest} ${t('durationMinute')}` : `${hours} ${t('durationHour')}`;
  }

  function actionLabel(action) {
    const raw = String(action || '-');
    const key = `action_${raw}`;
    const label = t(key);
    return label === key ? raw : label;
  }

  function activityDetail(detail) {
    if (!detail || typeof detail !== 'object') return '-';
    const parts = [];
    if (detail.project_name) parts.push(String(detail.project_name));
    if (detail.customer_name) parts.push(String(detail.customer_name));
    if (detail.change_note) parts.push(String(detail.change_note));
    if (detail.target_username) parts.push(`@${detail.target_username}`);
    if (detail.filename) parts.push(String(detail.filename));
    if (detail.deleted_project_count) parts.push(`${detail.deleted_project_count} ${t('projects').toLocaleLowerCase()}`);
    return parts.length ? parts.join(' · ') : '-';
  }

  function isoDayStart(value, fallbackDaysAgo) {
    const date = value ? new Date(`${value}T00:00:00`) : new Date(Date.now() - fallbackDaysAgo * 86400000);
    return date.toISOString();
  }

  function isoDayEnd(value) {
    const date = value ? new Date(`${value}T00:00:00`) : new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }

  function setBusy(value) {
    busy = Boolean(value);
    [ui.inviteSubmit, ui.usersRefresh, ui.organizationCreateSubmit, ui.organizationsRefresh, ui.passwordSubmit, ui.activityRefresh, ui.deleteSubmit, ui.limitsSave, ui.limitsReset, ui.ownUsernameSubmitBtn, ui.globalLogoutSubmitBtn].forEach(button => {
      if (button) button.disabled = busy;
    });
  }

  async function loadContext() {
    if (!client) return false;
    const userResult = await client.auth.getUser();
    if (userResult.error || !userResult.data.user) {
      currentUser = null;
      currentProfile = null;
      if (ui.openBtn) ui.openBtn.hidden = true;
      return false;
    }
    currentUser = userResult.data.user;
    const profileResult = await client.from('profiles')
      .select('id, organization_id, username, full_name, role, is_active')
      .eq('id', currentUser.id)
      .single();
    if (profileResult.error || !profileResult.data || profileResult.data.is_active !== true) {
      currentProfile = null;
      if (ui.openBtn) ui.openBtn.hidden = true;
      return false;
    }
    currentProfile = profileResult.data;
    if (ui.openBtn) ui.openBtn.hidden = !isAdmin();
    return isAdmin();
  }

  function applyLanguage() {
    if (ui.openBtn) ui.openBtn.textContent = t('openPanel');
    if (ui.title) ui.title.textContent = t('adminPanel');
    if (ui.subtitle) ui.subtitle.textContent = t('panelSubtitle');
    if (ui.usersTab) ui.usersTab.textContent = t('users');
    if (ui.organizationsTab) ui.organizationsTab.textContent = t('firms');
    if (ui.activityTab) ui.activityTab.textContent = t('activity');
    if (ui.limitsTab) ui.limitsTab.textContent = t('limits');
    if (ui.limitsTitle) ui.limitsTitle.textContent = t('limits');
    if (ui.limitsScopeLabel) ui.limitsScopeLabel.textContent = t('limitScope');
    if (ui.limitsAuditTitle) ui.limitsAuditTitle.textContent = t('limitAudit');
    if (ui.limitsSave) ui.limitsSave.textContent = language() === 'en' ? 'Save Limits' : 'Limitleri Kaydet';
    if (ui.limitsReset) ui.limitsReset.textContent = language() === 'en' ? 'Restore Defaults' : 'Varsayılana Sıfırla';
    renderLimits();
    if (ui.usersTitle) ui.usersTitle.textContent = t('users');
    if (ui.inviteTitle) ui.inviteTitle.textContent = t('inviteUser');
    if (ui.inviteSubmit) ui.inviteSubmit.textContent = t('invite');
    if (ui.passwordTitle) ui.passwordTitle.textContent = t('password');
    if (ui.passwordSubmit) ui.passwordSubmit.textContent = t('password');
    if (ui.usersRefresh) ui.usersRefresh.textContent = t('refresh');
    if (ui.userSearch) ui.userSearch.placeholder = t('searchPlaceholder');
    if (ui.organizationsTitle) ui.organizationsTitle.textContent = t('firms');
    if (ui.organizationCreateSubmit) ui.organizationCreateSubmit.textContent = t('create');
    if (ui.organizationsRefresh) ui.organizationsRefresh.textContent = t('refresh');
    if (ui.activityTitle) ui.activityTitle.textContent = t('activity');
    if (ui.activityRefresh) ui.activityRefresh.textContent = t('refresh');
    if ($('adminVisitsTitle')) $('adminVisitsTitle').textContent = t('visitsTitle');
    if ($('adminActionsTitle')) $('adminActionsTitle').textContent = t('actionsTitle');
    if ($('adminSummaryVisitsLabel')) $('adminSummaryVisitsLabel').textContent = t('visits');
    if ($('adminSummaryUsersLabel')) $('adminSummaryUsersLabel').textContent = t('activeUserCount');
    if ($('adminSummaryActionsLabel')) $('adminSummaryActionsLabel').textContent = t('actionCount');
    if ($('adminSummaryLastLabel')) $('adminSummaryLastLabel').textContent = t('lastActivity');
    if (ui.deleteTitle) ui.deleteTitle.textContent = t('deleteTitle');
    if ($('adminDeleteUserWarning')) $('adminDeleteUserWarning').textContent = t('deleteWarning');
    if (ui.deleteSubmit) ui.deleteSubmit.textContent = language() === 'en' ? 'Delete Permanently' : 'Kalıcı Olarak Sil';
    if (ui.usersEmpty && !users.length) ui.usersEmpty.textContent = t('noUsers');
    if (ui.organizationsEmpty && !organizations.length) ui.organizationsEmpty.textContent = t('noFirms');
    document.querySelectorAll('[data-admin-i18n]').forEach(node => {
      const key = node.dataset.adminI18n;
      if (key) node.textContent = t(key);
    });
    if (ui.inviteUsername) ui.inviteUsername.title = t('usernameHint');
    if (ui.ownSecurityTitle) ui.ownSecurityTitle.textContent = t('ownSecurity');
    if (ui.ownSecuritySubtitle) ui.ownSecuritySubtitle.textContent = t('ownSecuritySubtitle');
    if (ui.changeOwnUsernameBtn) ui.changeOwnUsernameBtn.textContent = t('changeOwnUsername');
    if (ui.globalLogoutBtn) ui.globalLogoutBtn.textContent = t('globalLogout');
    if (ui.ownUsernameTitle) ui.ownUsernameTitle.textContent = t('changeOwnUsername');
    if ($('adminOwnUsernameWarning')) $('adminOwnUsernameWarning').textContent = t('usernameChangeWarning');
    if ($('adminOwnUsernameNewLabel')) $('adminOwnUsernameNewLabel').textContent = t('newUsername');
    if ($('adminOwnUsernamePinLabel')) $('adminOwnUsernamePinLabel').textContent = t('currentPin');
    if ($('adminOwnUsernameConfirmLabel')) $('adminOwnUsernameConfirmLabel').textContent = t('confirmNewUsername');
    if ($('adminGlobalLogoutConfirmText')) $('adminGlobalLogoutConfirmText').textContent = t('globalLogoutConfirmText');
    if (ui.ownUsernameSubmitBtn) ui.ownUsernameSubmitBtn.textContent = t('changeOwnUsername');
    if ($('adminGlobalLogoutTitle')) $('adminGlobalLogoutTitle').textContent = t('globalLogout');
    if (ui.globalLogoutSubmitBtn) ui.globalLogoutSubmitBtn.textContent = t('globalLogout');
    populateOrganizationSelectors();
    renderUsers();
    renderOrganizations();
    renderUsageSessions();
    renderActivityRows();
  }

  async function rpc(name, args) {
    const result = await client.rpc(name, args || {});
    if (result.error) throw result.error;
    return result.data || [];
  }

  async function loadOrganizations() {
    if (!isAdmin()) return;
    if (ui.organizationsEmpty) {
      ui.organizationsEmpty.hidden = false;
      ui.organizationsEmpty.textContent = t('loading');
    }
    organizations = await rpc('admin_list_organizations_v1');
    populateOrganizationSelectors();
    renderOrganizations();
  }

  function populateOrganizationSelectors() {
    const makeOptions = (includeAll) => {
      const rows = [];
      if (includeAll) rows.push(`<option value="">${esc(t('allFirms'))}</option>`);
      organizations.forEach(org => rows.push(`<option value="${esc(org.id)}">${esc(org.name)}</option>`));
      return rows.join('');
    };

    if (ui.inviteOrg) {
      const previous = ui.inviteOrg.value;
      ui.inviteOrg.innerHTML = makeOptions(false);
      if (previous && organizations.some(org => org.id === previous)) ui.inviteOrg.value = previous;
      else if (currentProfile && !isSystemAdmin()) ui.inviteOrg.value = currentProfile.organization_id;
    }
    if (ui.userFilterOrg) {
      const previous = ui.userFilterOrg.value;
      ui.userFilterOrg.innerHTML = makeOptions(isSystemAdmin());
      if (previous && (previous === '' || organizations.some(org => org.id === previous))) ui.userFilterOrg.value = previous;
      else if (currentProfile && !isSystemAdmin()) ui.userFilterOrg.value = currentProfile.organization_id;
    }
    if (ui.activityOrg) {
      const previous = ui.activityOrg.value;
      ui.activityOrg.innerHTML = makeOptions(isSystemAdmin());
      if (previous && (previous === '' || organizations.some(org => org.id === previous))) ui.activityOrg.value = previous;
      else if (currentProfile && !isSystemAdmin()) ui.activityOrg.value = currentProfile.organization_id;
    }
    if (ui.limitsScope) {
      const previous = ui.limitsScope.value;
      ui.limitsScope.innerHTML = `<option value="">${esc(t('globalLimits'))}</option>${organizations.map(org => `<option value="${esc(org.id)}">${esc(org.name)}</option>`).join('')}`;
      if (previous && organizations.some(org => org.id === previous)) ui.limitsScope.value = previous;
    }
  }

  async function loadUsers() {
    if (!isAdmin()) return;
    if (ui.usersEmpty) {
      ui.usersEmpty.hidden = false;
      ui.usersEmpty.textContent = t('loading');
    }
    const orgId = ui.userFilterOrg ? ui.userFilterOrg.value || null : null;
    users = await rpc('admin_list_users_v1', { p_organization_id: orgId });
    renderUsers();
  }

  function renderUsers() {
    if (!ui.usersBody) return;
    const query = String(ui.userSearch && ui.userSearch.value || '').trim().toLocaleLowerCase(language() === 'en' ? 'en-US' : 'tr-TR');
    const visibleUsers = !query ? users : users.filter(user => {
      const haystack = [
        user.organization_name, user.full_name, user.username, roleLabel(user.role),
        user.is_active ? t('active') : t('passive')
      ].map(value => String(value || '').toLocaleLowerCase(language() === 'en' ? 'en-US' : 'tr-TR')).join(' ');
      return haystack.includes(query);
    });

    ui.usersBody.innerHTML = visibleUsers.map(user => {
      const protectedAccount = user.role === 'system_admin' || user.id === (currentUser && currentUser.id);
      const roleOptions = user.role === 'system_admin'
        ? `<option value="system_admin" selected>${esc(t('systemAdmin'))}</option>`
        : `<option value="company_admin" ${user.role === 'company_admin' ? 'selected' : ''}>${esc(t('companyAdmin'))}</option><option value="designer" ${user.role === 'designer' ? 'selected' : ''}>${esc(t('designer'))}</option>`;
      const deleteButton = isSystemAdmin()
        ? `<button type="button" class="danger-btn js-user-delete" data-user-id="${esc(user.id)}" data-user-name="${esc(user.full_name || user.username || '')}" ${protectedAccount ? 'disabled title="' + esc(t('protectedUser')) + '"' : ''}>${esc(t('deleteUser'))}</button>`
        : '';
      return `<tr data-user-id="${esc(user.id)}">
        <td class="admin-company-cell"><strong>${esc(user.organization_name || '-')}</strong></td>
        <td><input class="admin-inline-input js-user-fullname" value="${esc(user.full_name || '')}" ${protectedAccount ? 'disabled' : ''}><small>@${esc(user.username || '-')}</small></td>
        <td><input class="admin-inline-input js-user-username" value="${esc(user.username || '')}" readonly title="${esc(t('usernameChangeSecureOnly'))}"></td>
        <td><select class="admin-inline-select js-user-role" ${protectedAccount ? 'disabled' : ''}>${roleOptions}</select></td>
        <td><label class="admin-toggle"><input class="js-user-active" type="checkbox" ${user.is_active ? 'checked' : ''} ${protectedAccount ? 'disabled' : ''}><span>${esc(user.is_active ? t('active') : t('passive'))}</span></label></td>
        <td>${esc(user.project_count || 0)}</td>
        <td class="admin-row-actions">
          <button type="button" class="primary-btn js-user-save" ${protectedAccount ? 'disabled title="' + esc(t('protectedUser')) + '"' : ''}>${esc(t('save'))}</button>
          <button type="button" class="soft-btn js-user-password" data-user-id="${esc(user.id)}" data-user-name="${esc(user.full_name || user.username || '')}">${esc(t('password'))}</button>
          ${isSystemAdmin() ? `<button type="button" class="soft-btn js-user-login-lock" data-user-id="${esc(user.id)}" data-user-name="${esc(user.full_name || user.username || '')}">${esc(t('loginLock'))}</button>` : ''}
          ${deleteButton}
        </td>
      </tr>`;
    }).join('');

    if (ui.usersEmpty) {
      ui.usersEmpty.hidden = visibleUsers.length > 0;
      ui.usersEmpty.textContent = t('noUsers');
    }
    ui.usersBody.querySelectorAll('.js-user-active').forEach(input => {
      input.addEventListener('change', () => {
        const label = input.closest('.admin-toggle') && input.closest('.admin-toggle').querySelector('span');
        if (label) label.textContent = input.checked ? t('active') : t('passive');
      });
    });
    ui.usersBody.querySelectorAll('.js-user-save').forEach(button => button.addEventListener('click', () => saveUserRow(button.closest('tr'))));
    ui.usersBody.querySelectorAll('.js-user-password').forEach(button => button.addEventListener('click', () => openPasswordDialog(button.dataset.userId, button.dataset.userName)));
    ui.usersBody.querySelectorAll('.js-user-delete').forEach(button => button.addEventListener('click', () => openDeleteDialog(button.dataset.userId, button.dataset.userName)));
    ui.usersBody.querySelectorAll('.js-user-login-lock').forEach(button => button.addEventListener('click', () => openLoginLockDialog(button.dataset.userId, button.dataset.userName)));
  }

  function renderOrganizations() {
    if (!ui.organizationsBody) return;
    ui.organizationsBody.innerHTML = organizations.map(org => {
      const licenseState = org.license_end && org.license_end < new Date().toISOString().slice(0, 10) ? t('passive') : t('active');
      return `<tr data-organization-id="${esc(org.id)}">
        <td><input class="admin-inline-input js-org-name" value="${esc(org.name || '')}"></td>
        <td><input class="admin-inline-input js-org-license" type="date" value="${esc(org.license_end || '')}"><small>${esc(licenseState)}</small></td>
        <td><input class="admin-inline-input js-org-limit" type="number" min="1" max="9999" value="${esc(org.max_users || 1)}"><small>${esc(org.active_user_count || 0)} / ${esc(org.user_count || 0)} ${esc(t('activeUsers'))}</small></td>
        <td><label class="admin-toggle"><input class="js-org-active" type="checkbox" ${org.is_active ? 'checked' : ''}><span>${esc(org.is_active ? t('active') : t('passive'))}</span></label></td>
        <td>${esc(org.project_count || 0)}</td>
        <td class="admin-row-actions">
          <button type="button" class="primary-btn js-org-save">${esc(t('save'))}</button>
          <button type="button" class="danger-btn js-org-delete" data-org-name="${esc(org.name || '')}" ${currentProfile && org.id === currentProfile.organization_id ? 'disabled title="' + esc(t('currentFirmProtected')) + '"' : ''}>${esc(t('deleteFirm'))}</button>
        </td>
      </tr>`;
    }).join('');
    if (ui.organizationsEmpty) {
      ui.organizationsEmpty.hidden = organizations.length > 0;
      ui.organizationsEmpty.textContent = t('noFirms');
    }
    ui.organizationsBody.querySelectorAll('.js-org-active').forEach(input => input.addEventListener('change', () => {
      const label = input.closest('.admin-toggle') && input.closest('.admin-toggle').querySelector('span');
      if (label) label.textContent = input.checked ? t('active') : t('passive');
    }));
    ui.organizationsBody.querySelectorAll('.js-org-save').forEach(button => button.addEventListener('click', () => saveOrganizationRow(button.closest('tr'))));
    ui.organizationsBody.querySelectorAll('.js-org-delete').forEach(button => button.addEventListener('click', () => deleteOrganizationRow(button.closest('tr'), button.dataset.orgName)));
  }

  async function inviteUser(event) {
    event.preventDefault();
    if (busy || !isAdmin()) return;
    const pin = String(ui.invitePassword && ui.invitePassword.value || '').trim();
    const pinConfirm = String(ui.invitePasswordConfirm && ui.invitePasswordConfirm.value || '').trim();
    if (!/^\d{4}$/.test(pin)) {
      setMessage(t('passwordInvalid'), true);
      return;
    }
    if (pin !== pinConfirm) {
      setMessage(t('passwordMismatch'), true);
      return;
    }
    setBusy(true);
    setMessage(t('loading'), false);
    try {
      const organizationId = isSystemAdmin() ? ui.inviteOrg.value : currentProfile.organization_id;
      if (!window.PulumurAdminUsersApi) throw new Error('ADMIN_USERS_API_MISSING');
      const created = await window.PulumurAdminUsersApi.invoke('create', {
        organizationId,
        fullName: ui.inviteFullName.value.trim(),
        username: ui.inviteUsername.value.trim().toLowerCase(),
        pin,
        role: ui.inviteRole.value,
        language: language()
      });
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('user_create', { detail: {
          target_username: created && created.user && created.user.username || ui.inviteUsername.value.trim().toLowerCase(),
          target_full_name: created && created.user && created.user.full_name || ui.inviteFullName.value.trim(),
          target_role: ui.inviteRole.value,
          target_organization_id: organizationId
        }, organizationId });
      }
      ui.inviteForm.reset();
      populateOrganizationSelectors();
      setMessage(t('inviteSuccess'), false);
      await Promise.all([loadOrganizations(), loadUsers()]);
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  async function saveUserRow(row) {
    if (!row || busy) return;
    const activeInput = row.querySelector('.js-user-active');
    const current = users.find(item => item.id === row.dataset.userId);
    if (current && current.is_active && activeInput && !activeInput.checked && !window.confirm(t('confirmDeactivate'))) return;
    setBusy(true);
    try {
      await rpc('admin_update_user_v1', {
        p_user_id: row.dataset.userId,
        p_full_name: row.querySelector('.js-user-fullname').value.trim(),
        p_username: current && current.username || row.querySelector('.js-user-username').value.trim().toLowerCase(),
        p_role: row.querySelector('.js-user-role').value,
        p_is_active: Boolean(activeInput && activeInput.checked)
      });
      setMessage(t('userSaved'), false);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('user_update', { detail: {
          target_user_id: row.dataset.userId,
          target_username: current && current.username || row.querySelector('.js-user-username').value.trim().toLowerCase(),
          target_full_name: row.querySelector('.js-user-fullname').value.trim(),
          target_role: row.querySelector('.js-user-role').value,
          target_active: Boolean(activeInput && activeInput.checked)
        }, organizationId: current && current.organization_id || null });
      }
      await Promise.all([loadOrganizations(), loadUsers()]);
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function openPasswordDialog(userId, userName) {
    if (!userId || !ui.passwordDialog) return;
    passwordTargetUserId = userId;
    if (ui.passwordUser) ui.passwordUser.textContent = userName || t('username');
    if (ui.newPassword) ui.newPassword.value = '';
    if (ui.newPasswordConfirm) ui.newPasswordConfirm.value = '';
    if (ui.passwordMessage) ui.passwordMessage.textContent = t('passwordInvalid');
    ui.passwordDialog.showModal();
    window.setTimeout(() => ui.newPassword && ui.newPassword.focus(), 0);
  }

  function closePasswordDialog() {
    passwordTargetUserId = null;
    if (ui.passwordDialog && ui.passwordDialog.open) ui.passwordDialog.close();
  }

  async function submitPasswordChange(event) {
    event.preventDefault();
    if (!passwordTargetUserId || busy) return;
    const pin = String(ui.newPassword && ui.newPassword.value || '').trim();
    const confirm = String(ui.newPasswordConfirm && ui.newPasswordConfirm.value || '').trim();
    if (!/^\d{4}$/.test(pin)) {
      if (ui.passwordMessage) ui.passwordMessage.textContent = t('passwordInvalid');
      return;
    }
    if (pin !== confirm) {
      if (ui.passwordMessage) ui.passwordMessage.textContent = t('passwordMismatch');
      return;
    }
    setBusy(true);
    try {
      if (!window.PulumurAdminUsersApi) throw new Error('ADMIN_USERS_API_MISSING');
      await window.PulumurAdminUsersApi.invoke('set_pin', { userId: passwordTargetUserId, pin });
      if (window.PulumurActivity) {
        const target = users.find(item => item.id === passwordTargetUserId);
        void window.PulumurActivity.log('pin_update', { detail: { target_user_id: passwordTargetUserId }, organizationId: target && target.organization_id || null });
      }
      setMessage(t('passwordSaved'), false);
      closePasswordDialog();
    } catch (error) {
      console.error(error);
      if (ui.passwordMessage) ui.passwordMessage.textContent = errorMessage(error);
    } finally {
      setBusy(false);
    }
  }

  function isLastActiveCompanyAdmin(target) {
    if (!target || target.role !== 'company_admin' || target.is_active !== true) return false;
    return !users.some(user =>
      user.id !== target.id &&
      user.organization_id === target.organization_id &&
      user.role === 'company_admin' &&
      user.is_active === true
    );
  }

  function setDeleteMessage(message, isError) {
    if (!ui.deleteMessage) return;
    ui.deleteMessage.textContent = message || '';
    ui.deleteMessage.classList.toggle('is-error', Boolean(isError));
  }

  function openDeleteDialog(userId, userName) {
    if (!userId || !ui.deleteDialog || !isSystemAdmin()) return;
    const target = users.find(item => item.id === userId);
    if (!target) return;
    if (target.id === (currentUser && currentUser.id) || target.role === 'system_admin') {
      setMessage(target.role === 'system_admin' ? t('systemAdminProtected') : t('selfDelete'), true);
      return;
    }

    deleteTargetUserId = userId;
    deleteRequiresLastAdminConfirmation = isLastActiveCompanyAdmin(target);
    if (ui.deleteUserName) ui.deleteUserName.textContent = userName || t('username');
    const warning = $('adminDeleteUserWarning');
    if (warning) {
      const count = Number(target.project_count || 0);
      const projectText = language() === 'en'
        ? `This action is permanent. This user has ${count} project(s).`
        : `Bu işlem kalıcıdır. Kullanıcının ${count} projesi bulunuyor.`;
      warning.textContent = deleteRequiresLastAdminConfirmation
        ? `${projectText} ${t('lastAdminOverrideWarning')}`
        : projectText;
    }

    if (ui.deleteLastAdminConfirm) ui.deleteLastAdminConfirm.hidden = !deleteRequiresLastAdminConfirmation;
    if (ui.deleteConfirmPrompt) {
      ui.deleteConfirmPrompt.textContent = `${t('lastAdminConfirmPrompt')} ${target.username}`;
    }
    if (ui.deleteConfirmUsername) {
      ui.deleteConfirmUsername.value = '';
      ui.deleteConfirmUsername.disabled = !deleteRequiresLastAdminConfirmation;
    }
    setDeleteMessage('', false);
    const keepOption = ui.deleteForm && ui.deleteForm.querySelector('input[name="adminDeleteMode"][value="keep"]');
    if (keepOption) keepOption.checked = true;
    ui.deleteDialog.showModal();
    window.setTimeout(() => {
      if (deleteRequiresLastAdminConfirmation && ui.deleteConfirmUsername) ui.deleteConfirmUsername.focus();
    }, 0);
  }

  function closeDeleteDialog() {
    deleteTargetUserId = null;
    deleteRequiresLastAdminConfirmation = false;
    if (ui.deleteConfirmUsername) {
      ui.deleteConfirmUsername.value = '';
      ui.deleteConfirmUsername.disabled = true;
    }
    if (ui.deleteLastAdminConfirm) ui.deleteLastAdminConfirm.hidden = true;
    setDeleteMessage('', false);
    if (ui.deleteDialog && ui.deleteDialog.open) ui.deleteDialog.close();
  }

  async function submitDeleteUser(event) {
    event.preventDefault();
    if (!deleteTargetUserId || busy || !isSystemAdmin()) return;
    const target = users.find(item => item.id === deleteTargetUserId);
    if (!target) {
      setDeleteMessage(t('deleteFailed'), true);
      return;
    }
    if (target.id === (currentUser && currentUser.id) || target.role === 'system_admin') {
      setDeleteMessage(target.role === 'system_admin' ? t('systemAdminProtected') : t('selfDelete'), true);
      return;
    }

    const confirmationUsername = String(ui.deleteConfirmUsername && ui.deleteConfirmUsername.value || '').trim().toLowerCase();
    if (deleteRequiresLastAdminConfirmation && confirmationUsername !== String(target.username || '').trim().toLowerCase()) {
      setDeleteMessage(t('lastAdminConfirmMismatch'), true);
      if (ui.deleteConfirmUsername) ui.deleteConfirmUsername.focus();
      return;
    }

    const mode = ui.deleteForm && ui.deleteForm.querySelector('input[name="adminDeleteMode"]:checked');
    const deleteProjects = Boolean(mode && mode.value === 'all');
    const confirmText = language() === 'en'
      ? `Permanently delete ${target.full_name || target.username || 'this user'}${deleteProjects ? ' and all projects created by this user' : ''}?`
      : `${target.full_name || target.username || 'Bu kullanıcı'}${deleteProjects ? ' ve oluşturduğu tüm projeler' : ''} kalıcı olarak silinsin mi?`;
    if (!window.confirm(confirmText)) return;

    setBusy(true);
    setDeleteMessage(t('loading'), false);
    try {
      if (!window.PulumurAdminUsersApi) throw new Error('ADMIN_USERS_API_MISSING');
      const result = await window.PulumurAdminUsersApi.invoke('delete_user', {
        userId: deleteTargetUserId,
        deleteProjects,
        confirmLastCompanyAdmin: deleteRequiresLastAdminConfirmation,
        confirmationUsername: deleteRequiresLastAdminConfirmation ? confirmationUsername : ''
      });
      closeDeleteDialog();
      const successMessage = deleteProjects ? t('deleteWithProjectsSuccess') : t('deleteSuccess');
      setMessage(result && result.activityLogRecorded === false ? `${successMessage} ${t('deleteLogWarning')}` : successMessage, Boolean(result && result.activityLogRecorded === false));
      await Promise.all([loadOrganizations(), loadUsers()]);
      if (window.PulumurActivity) void window.PulumurActivity.touch();
      return result;
    } catch (error) {
      console.error(error);
      const rawError = String((error && (error.message || error.error || error.code)) || error || '');
      if (/LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED/i.test(rawError)) {
        deleteRequiresLastAdminConfirmation = true;
        if (ui.deleteLastAdminConfirm) ui.deleteLastAdminConfirm.hidden = false;
        if (ui.deleteConfirmPrompt) ui.deleteConfirmPrompt.textContent = `${t('lastAdminConfirmPrompt')} ${target.username}`;
        if (ui.deleteConfirmUsername) {
          ui.deleteConfirmUsername.disabled = false;
          ui.deleteConfirmUsername.focus();
        }
        const warning = $('adminDeleteUserWarning');
        if (warning && !warning.textContent.includes(t('lastAdminOverrideWarning'))) {
          warning.textContent = `${warning.textContent} ${t('lastAdminOverrideWarning')}`.trim();
        }
      }
      setDeleteMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function formatLockDate(value) {
    if (!value) return t('notLocked');
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(language() === 'en' ? 'en-US' : 'tr-TR');
  }

  function setLoginLockMessage(message, isError) {
    if (!ui.loginLockMessage) return;
    ui.loginLockMessage.textContent = message || '';
    ui.loginLockMessage.classList.toggle('is-error', Boolean(isError));
  }

  function renderLoginLockStatus(status) {
    const usernameBucket = status && status.usernameBucket;
    const ipBuckets = status && Array.isArray(status.recentIpBuckets) ? status.recentIpBuckets : [];
    const attempts = status && Array.isArray(status.recentAttempts) ? status.recentAttempts : [];
    if (ui.loginLockSummary) {
      ui.loginLockSummary.innerHTML = `
        <div class="admin-security-summary-row"><strong>${esc(t('usernameLocked'))}</strong><span>${esc(usernameBucket && usernameBucket.locked_until ? formatLockDate(usernameBucket.locked_until) : t('notLocked'))}</span></div>
        <div class="admin-security-summary-row"><strong>${esc(t('failureCount'))}</strong><span>${esc(usernameBucket && usernameBucket.failure_count || 0)}</span></div>
        <div class="admin-security-summary-row"><strong>${esc(t('recentIpLocks'))}</strong><span>${esc(ipBuckets.filter(row => row.locked_until).length)}</span></div>`;
    }
    if (ui.loginLockAttempts) {
      ui.loginLockAttempts.innerHTML = attempts.length ? attempts.map(row => `<div class="admin-security-attempt ${row.success ? 'is-success' : 'is-failure'}"><span>${esc(formatLockDate(row.attempted_at))}</span><strong>${esc(row.reason || '-')}</strong><span>IP ${esc(row.ip_hash_hint || '-')}</span></div>`).join('') : `<p class="admin-empty-state">${esc(t('loginLockNoAttempts'))}</p>`;
    }
  }

  async function openLoginLockDialog(userId, userName) {
    if (!isSystemAdmin() || !userId || !ui.loginLockDialog || busy) return;
    loginLockTargetUserId = userId;
    if (ui.loginLockTitle) ui.loginLockTitle.textContent = t('loginLockTitle');
    if (ui.loginLockUser) ui.loginLockUser.textContent = userName || '';
    if (ui.loginLockResetBtn) ui.loginLockResetBtn.textContent = t('loginLockReset');
    setLoginLockMessage(t('loading'), false);
    if (ui.loginLockSummary) ui.loginLockSummary.innerHTML = '';
    if (ui.loginLockAttempts) ui.loginLockAttempts.innerHTML = '';
    ui.loginLockDialog.showModal();
    try {
      const status = await window.PulumurAdminUsersApi.invoke('login_lock_status', { userId });
      renderLoginLockStatus(status);
      setLoginLockMessage('', false);
    } catch (error) {
      console.error(error);
      setLoginLockMessage(errorMessage(error), true);
    }
  }

  function closeLoginLockDialog() {
    loginLockTargetUserId = null;
    if (ui.loginLockDialog && ui.loginLockDialog.open) ui.loginLockDialog.close();
  }

  async function resetLoginLock(event) {
    event.preventDefault();
    if (!isSystemAdmin() || !loginLockTargetUserId || busy) return;
    if (!window.confirm(t('loginLockResetConfirm'))) return;
    setBusy(true);
    setLoginLockMessage(t('loading'), false);
    try {
      const result = await window.PulumurAdminUsersApi.invoke('reset_login_lock', {
        userId: loginLockTargetUserId,
        includeRecentIpBuckets: true
      });
      setLoginLockMessage(result && result.logRecorded === false ? `${t('loginLockResetSuccess')} ${t('deleteLogWarning')}` : t('loginLockResetSuccess'), false);
      const status = await window.PulumurAdminUsersApi.invoke('login_lock_status', { userId: loginLockTargetUserId });
      renderLoginLockStatus(status);
    } catch (error) {
      console.error(error);
      setLoginLockMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function openOwnUsernameDialog() {
    if (!isSystemAdmin() || !ui.ownUsernameDialog) return;
    if (ui.ownUsernameCurrent) ui.ownUsernameCurrent.textContent = `@${currentProfile.username}`;
    if (ui.ownUsernameNew) ui.ownUsernameNew.value = '';
    if (ui.ownUsernamePin) ui.ownUsernamePin.value = '';
    if (ui.ownUsernameConfirm) ui.ownUsernameConfirm.value = '';
    if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = '';
    ui.ownUsernameDialog.showModal();
    window.setTimeout(() => ui.ownUsernameNew && ui.ownUsernameNew.focus(), 0);
  }

  function closeOwnUsernameDialog() {
    if (ui.ownUsernameDialog && ui.ownUsernameDialog.open) ui.ownUsernameDialog.close();
  }

  async function submitOwnUsernameChange(event) {
    event.preventDefault();
    if (!isSystemAdmin() || busy) return;
    const newUsername = String(ui.ownUsernameNew && ui.ownUsernameNew.value || '').trim().toLowerCase();
    const confirmation = String(ui.ownUsernameConfirm && ui.ownUsernameConfirm.value || '').trim().toLowerCase();
    const pin = String(ui.ownUsernamePin && ui.ownUsernamePin.value || '').trim();
    if (!/^[a-z0-9._-]{3,32}$/.test(newUsername)) { if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = t('invalidUsername'); return; }
    if (!/^\d{4}$/.test(pin)) { if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = t('passwordInvalid'); return; }
    if (newUsername !== confirmation) { if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = t('usernameConfirmMismatch'); return; }
    if (newUsername === String(currentProfile.username || '').toLowerCase()) { if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = t('usernameChangeSecureOnly'); return; }
    setBusy(true);
    if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = t('loading');
    try {
      const result = await window.PulumurAdminUsersApi.invoke('change_own_username', { newUsername, confirmationUsername: confirmation, pin });
      closeOwnUsernameDialog();
      if (window.PulumurCloudAuth && typeof window.PulumurCloudAuth.signOutLocal === 'function') {
        await window.PulumurCloudAuth.signOutLocal({ newUsername });
      } else if (client && client.auth) {
        await client.auth.signOut({ scope: 'local' });
      }
      return result;
    } catch (error) {
      console.error(error);
      if (ui.ownUsernameMessage) ui.ownUsernameMessage.textContent = errorMessage(error);
    } finally { setBusy(false); }
  }

  function openGlobalLogoutDialog() {
    if (!isSystemAdmin() || !ui.globalLogoutDialog) return;
    if (ui.globalLogoutConfirm) ui.globalLogoutConfirm.checked = false;
    if (ui.globalLogoutMessage) ui.globalLogoutMessage.textContent = '';
    ui.globalLogoutDialog.showModal();
  }

  function closeGlobalLogoutDialog() {
    if (ui.globalLogoutDialog && ui.globalLogoutDialog.open) ui.globalLogoutDialog.close();
  }

  async function submitGlobalLogout(event) {
    event.preventDefault();
    if (!isSystemAdmin() || busy) return;
    if (!ui.globalLogoutConfirm || !ui.globalLogoutConfirm.checked) {
      if (ui.globalLogoutMessage) ui.globalLogoutMessage.textContent = t('globalLogoutConfirmRequired');
      return;
    }
    setBusy(true);
    if (ui.globalLogoutMessage) ui.globalLogoutMessage.textContent = t('loading');
    try {
      await window.PulumurAdminUsersApi.invoke('global_logout', {});
      closeGlobalLogoutDialog();
      if (window.PulumurCloudAuth && typeof window.PulumurCloudAuth.signOutLocal === 'function') {
        await window.PulumurCloudAuth.signOutLocal({ clearSavedUsername: false });
      } else if (client && client.auth) {
        await client.auth.signOut({ scope: 'local' });
      }
    } catch (error) {
      console.error(error);
      if (ui.globalLogoutMessage) ui.globalLogoutMessage.textContent = errorMessage(error);
    } finally { setBusy(false); }
  }

  function renderUsageSummary() {
    const identifiedUsers = new Set(usageSessions.filter(row => row.user_id).map(row => row.user_id));
    const latestValues = [];
    usageSessions.forEach(row => { if (row.last_seen_at) latestValues.push(row.last_seen_at); });
    activityRows.forEach(row => { if (row.created_at) latestValues.push(row.created_at); });
    latestValues.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (ui.summaryVisits) ui.summaryVisits.textContent = String(usageSessions.length);
    if (ui.summaryUsers) ui.summaryUsers.textContent = String(identifiedUsers.size);
    if (ui.summaryActions) ui.summaryActions.textContent = String(activityRows.length);
    if (ui.summaryLast) ui.summaryLast.textContent = latestValues.length ? formatDateTime(latestValues[0]) : '-';
  }

  function renderUsageSessions() {
    if (!ui.sessionsBody) return;
    ui.sessionsBody.innerHTML = usageSessions.map(row => {
      const company = row.organization_name
        ? `${row.company_code || '----'} · ${row.organization_name}`
        : t('anonymous');
      const user = row.full_name || row.username || t('anonymous');
      return `<tr>
        <td>${esc(formatDateTime(row.started_at))}</td>
        <td>${esc(formatDateTime(row.last_seen_at))}</td>
        <td>${esc(formatDuration(row.started_at, row.ended_at || row.last_seen_at))}</td>
        <td>${esc(company)}</td>
        <td>${esc(user)}${row.username ? `<small>@${esc(row.username)}</small>` : ''}</td>
        <td>${esc(row.page_views || 1)}</td>
        <td>${esc(row.action_count || 0)}</td>
      </tr>`;
    }).join('');
    if (ui.sessionsEmpty) {
      ui.sessionsEmpty.hidden = usageSessions.length > 0;
      ui.sessionsEmpty.textContent = t('noSessions');
    }
    renderUsageSummary();
  }

  function renderActivityRows() {
    if (!ui.activityBody) return;
    ui.activityBody.innerHTML = activityRows.map(row => {
      const company = row.organization_name
        ? `${row.company_code || '----'} · ${row.organization_name}`
        : '-';
      const user = row.full_name || row.username || '-';
      const project = row.project_code
        ? `${row.project_code}${row.revision_no ? ` / R${String(row.revision_no).padStart(2, '0')}` : ''}`
        : '-';
      return `<tr>
        <td>${esc(formatDateTime(row.created_at))}</td>
        <td>${esc(company)}</td>
        <td>${esc(user)}${row.username ? `<small>@${esc(row.username)}</small>` : ''}</td>
        <td><span class="admin-action-badge">${esc(actionLabel(row.action))}</span></td>
        <td class="admin-code-cell">${esc(project)}</td>
        <td class="admin-detail-cell">${esc(activityDetail(row.detail))}</td>
      </tr>`;
    }).join('');
    if (ui.activityEmpty) {
      ui.activityEmpty.hidden = activityRows.length > 0;
      ui.activityEmpty.textContent = t('noActivity');
    }
    renderUsageSummary();
  }

  async function loadActivityHistory() {
    if (!isAdmin()) return;
    if (ui.sessionsEmpty) {
      ui.sessionsEmpty.hidden = false;
      ui.sessionsEmpty.textContent = t('loading');
    }
    if (ui.activityEmpty) {
      ui.activityEmpty.hidden = false;
      ui.activityEmpty.textContent = t('loading');
    }
    const organizationId = ui.activityOrg ? ui.activityOrg.value || null : null;
    const from = isoDayStart(ui.activityFrom && ui.activityFrom.value, 7);
    const to = isoDayEnd(ui.activityTo && ui.activityTo.value);
    const [sessionData, logData] = await Promise.all([
      rpc('admin_list_usage_sessions_v1', {
        p_organization_id: organizationId,
        p_from: from,
        p_to: to,
        p_limit: 1000
      }),
      rpc('admin_list_activity_logs_v1', {
        p_organization_id: organizationId,
        p_from: from,
        p_to: to,
        p_limit: 2000
      })
    ]);
    usageSessions = sessionData || [];
    activityRows = logData || [];
    renderUsageSessions();
    renderActivityRows();
  }

  async function deleteOrganizationRow(row, organizationName) {
    if (busy || !isSystemAdmin() || !row) return;
    const organizationId = row.dataset.organizationId;
    if (!organizationId) return;
    if (currentProfile && organizationId === currentProfile.organization_id) {
      setMessage(t('currentFirmProtected'), true);
      return;
    }

    const message = `${organizationName || t('firm')}\n\n${t('deleteFirmConfirm')}`;
    if (!window.confirm(message)) return;

    setBusy(true);
    setMessage(t('loading'), false);
    try {
      if (!window.PulumurAdminUsersApi) throw new Error('ADMIN_USERS_API_MISSING');
      const result = await window.PulumurAdminUsersApi.invoke('delete_organization', { organizationId });
      setMessage(t('firmDeleted'), false);
      await Promise.all([loadOrganizations(), loadUsers()]);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('organization_delete', {
          detail: {
            target_organization_id: organizationId,
            target_organization_name: organizationName || null,
            deleted_user_count: result && result.deletedUserCount || 0
          },
          organizationId: null
        });
      }
    } catch (error) {
      console.error(error);
      setMessage(friendlyError(error, 'setupMissing'), true);
    } finally {
      setBusy(false);
    }
  }

  async function createOrganization(event) {
    event.preventDefault();
    if (busy || !isSystemAdmin()) return;
    setBusy(true);
    try {
      const createdOrg = await rpc('admin_create_organization_v1', {
        p_name: ui.organizationName.value.trim(),
        p_license_end: ui.organizationLicenseEnd.value || null,
        p_max_users: Number(ui.organizationMaxUsers.value) || 1
      });
      if (window.PulumurActivity) {
        const org = Array.isArray(createdOrg) ? createdOrg[0] : createdOrg;
        void window.PulumurActivity.log('organization_create', { detail: {
          organization_id: org && org.id || null,
          company_code: org && org.company_code || null,
          organization_name: org && org.name || ui.organizationName.value.trim()
        }, organizationId: org && org.id || null });
      }
      ui.organizationCreateForm.reset();
      ui.organizationMaxUsers.value = '5';
      setMessage(t('firmCreated'), false);
      await loadOrganizations();
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  async function saveOrganizationRow(row) {
    if (!row || busy || !isSystemAdmin()) return;
    setBusy(true);
    try {
      await rpc('admin_update_organization_v1', {
        p_organization_id: row.dataset.organizationId,
        p_name: row.querySelector('.js-org-name').value.trim(),
        p_is_active: row.querySelector('.js-org-active').checked,
        p_license_end: row.querySelector('.js-org-license').value || null,
        p_max_users: Number(row.querySelector('.js-org-limit').value) || 1,
        p_enabled_products: ['PERGO_RISE']
      });
      setMessage(t('firmSaved'), false);
      if (window.PulumurActivity) {
        void window.PulumurActivity.log('organization_update', { detail: {
          organization_id: row.dataset.organizationId,
          organization_name: row.querySelector('.js-org-name').value.trim(),
          active: row.querySelector('.js-org-active').checked,
          license_end: row.querySelector('.js-org-license').value || null,
          max_users: Number(row.querySelector('.js-org-limit').value) || 1
        }, organizationId: row.dataset.organizationId });
      }
      await loadOrganizations();
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  const LIMIT_LABELS = {
    maxSystems: { tr: 'Poz / sistem sayısı', en: 'Positions / systems' },
    maxRaysPerSystem: { tr: 'Poz başına ray', en: 'Rails per position' },
    maxFrontPosts: { tr: 'Ön dikme', en: 'Front posts' },
    maxSideSupportsPerView: { tr: 'Yan destek / görünüş', en: 'Side supports / view' },
    maxProducts: { tr: 'Toplam ürün', en: 'Total products' },
    maxSegmentsPerView: { tr: 'Duvar / parapet parçası / görünüş', en: 'Wall / parapet segments / view' },
    historySteps: { tr: 'Geri Al / İleri Al adımı', en: 'Undo / redo steps' },
    maxProjectFileMb: { tr: '.plmr dosya boyutu (MB)', en: '.plmr file size (MB)' }
  };

  function renderLimits() {
    if (!ui.limitsGrid) return;
    const byKey = Object.fromEntries(limitRows.map(row => [row.limit_key, row]));
    const fallbackValues = window.PulumurLimits ? window.PulumurLimits.get() : {};
    const fallbackCaps = window.PulumurLimits ? window.PulumurLimits.hardCaps || {} : {};
    const fallbackMins = window.PulumurLimits ? window.PulumurLimits.minimums || {} : {};
    ui.limitsGrid.innerHTML = Object.keys(LIMIT_LABELS).map(key => {
      const label = LIMIT_LABELS[key][language()] || LIMIT_LABELS[key].tr;
      const row = byKey[key] || {};
      const value = Number(row.limit_value ?? fallbackValues[key] ?? 0);
      const minimum = Number(row.minimum_value ?? fallbackMins[key] ?? 0);
      const cap = Number(row.hard_cap ?? fallbackCaps[key] ?? 9999);
      const source = row.source === 'company'
        ? (language() === 'en' ? 'Company override' : 'Firma istisnası')
        : (language() === 'en' ? 'Global' : 'Genel');
      const modifier = row.updated_by_name ? ` · ${esc(row.updated_by_name)} · ${esc(formatDateTime(row.updated_at))}` : '';
      return `<label><span>${esc(label)}</span><input type="number" data-limit-key="${esc(key)}" min="${minimum}" max="${cap}" step="1" value="${value}"><small>${source} · ${language() === 'en' ? 'Hard cap' : 'Mutlak tavan'}: ${cap}${modifier}</small></label>`;
    }).join('');

    if (ui.limitsAuditBody) {
      ui.limitsAuditBody.innerHTML = limitAuditRows.map(row => `<tr>
        <td>${esc(formatDateTime(row.changed_at))}</td>
        <td>${esc(row.organization_name || t('globalLimits'))}</td>
        <td>${esc((LIMIT_LABELS[row.limit_key] && (LIMIT_LABELS[row.limit_key][language()] || LIMIT_LABELS[row.limit_key].tr)) || row.limit_key)}</td>
        <td>${esc(row.old_value == null ? '-' : row.old_value)}</td>
        <td>${esc(row.new_value == null ? '-' : row.new_value)}</td>
        <td>${esc(row.changed_by_name || '-')}</td>
      </tr>`).join('');
    }
    if (ui.limitsAuditEmpty) {
      ui.limitsAuditEmpty.hidden = limitAuditRows.length > 0;
      ui.limitsAuditEmpty.textContent = t('noLimitAudit');
    }
  }

  async function loadLimits() {
    if (!isSystemAdmin()) return;
    const organizationId = ui.limitsScope && ui.limitsScope.value ? ui.limitsScope.value : null;
    const [rows, audit] = await Promise.all([
      rpc('admin_list_app_limits_v1', { p_organization_id: organizationId }),
      rpc('admin_list_app_limit_audit_v1', { p_organization_id: organizationId, p_limit: 200 })
    ]);
    limitRows = rows || [];
    limitAuditRows = audit || [];
    renderLimits();
  }

  async function refreshOwnEffectiveLimits() {
    if (!window.PulumurLimits) return;
    const rows = await rpc('get_effective_app_limits_v1');
    const values = {};
    (rows || []).forEach(row => { values[row.limit_key] = Number(row.limit_value); });
    window.PulumurLimits.set(values);
  }

  async function saveLimits(event) {
    if (event) event.preventDefault();
    if (!isSystemAdmin() || !ui.limitsGrid || busy) return;
    const organizationId = ui.limitsScope && ui.limitsScope.value ? ui.limitsScope.value : null;
    setBusy(true);
    try {
      const changes = Array.from(ui.limitsGrid.querySelectorAll('[data-limit-key]')).map(input => rpc('admin_set_app_limit_v1', {
        p_limit_key: input.dataset.limitKey,
        p_limit_value: Number(input.value),
        p_organization_id: organizationId
      }));
      await Promise.all(changes);
      await Promise.all([loadLimits(), refreshOwnEffectiveLimits()]);
      setMessage(t('limitsSaved'), false);
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  async function resetLimits() {
    if (!isSystemAdmin() || busy) return;
    const organizationId = ui.limitsScope && ui.limitsScope.value ? ui.limitsScope.value : null;
    setBusy(true);
    try {
      await rpc('admin_reset_app_limits_v1', { p_organization_id: organizationId });
      await Promise.all([loadLimits(), refreshOwnEffectiveLimits()]);
      setMessage(t('limitsReset'), false);
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function showTab(tab) {
    const organizationsTab = tab === 'organizations' && isSystemAdmin();
    const activityTab = tab === 'activity' && isSystemAdmin();
    const limitsTab = tab === 'limits' && isSystemAdmin();
    const usersTab = !organizationsTab && !activityTab && !limitsTab;
    if (ui.usersPane) ui.usersPane.hidden = !usersTab;
    if (ui.organizationsPane) ui.organizationsPane.hidden = !organizationsTab;
    if (ui.activityPane) ui.activityPane.hidden = !activityTab;
    if (ui.limitsPane) ui.limitsPane.hidden = !limitsTab;
    if (ui.usersTab) ui.usersTab.classList.toggle('is-active', usersTab);
    if (ui.organizationsTab) ui.organizationsTab.classList.toggle('is-active', organizationsTab);
    if (ui.activityTab) ui.activityTab.classList.toggle('is-active', activityTab);
    if (ui.limitsTab) ui.limitsTab.classList.toggle('is-active', limitsTab);
    if (limitsTab) {
      setBusy(true);
      loadLimits()
        .catch(error => { console.error(error); setMessage(errorMessage(error), true); })
        .finally(() => setBusy(false));
    }
    if (activityTab) {
      setBusy(true);
      loadActivityHistory()
        .catch(error => { console.error(error); setMessage(errorMessage(error), true); })
        .finally(() => setBusy(false));
    }
  }

  async function openPanel() {
    if (!await loadContext()) {
      window.alert(t('adminRequired'));
      return;
    }
    applyLanguage();
    if (ui.organizationsTab) ui.organizationsTab.hidden = !isSystemAdmin();
    if (ui.activityTab) ui.activityTab.hidden = !isSystemAdmin();
    if (ui.limitsTab) ui.limitsTab.hidden = !isSystemAdmin();
    if (ui.organizationCreateForm) ui.organizationCreateForm.hidden = !isSystemAdmin();
    if (ui.ownSecurityCard) ui.ownSecurityCard.hidden = !isSystemAdmin();
    if (ui.inviteOrgField) ui.inviteOrgField.hidden = !isSystemAdmin();
    if (ui.userFilterOrgField) ui.userFilterOrgField.hidden = !isSystemAdmin();
    if (ui.activityOrgField) ui.activityOrgField.hidden = !isSystemAdmin();
    if (ui.activityFrom && !ui.activityFrom.value) {
      const fromDate = new Date(Date.now() - 6 * 86400000);
      ui.activityFrom.value = fromDate.toISOString().slice(0, 10);
    }
    if (ui.activityTo && !ui.activityTo.value) ui.activityTo.value = new Date().toISOString().slice(0, 10);
    showTab('users');
    if (ui.dialog && !ui.dialog.open) ui.dialog.showModal();
    setBusy(true);
    setMessage(t('loading'), false);
    try {
      await loadOrganizations();
      await loadUsers();
      setMessage('', false);
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function bind() {
    [ui.invitePassword, ui.invitePasswordConfirm, ui.newPassword, ui.newPasswordConfirm, ui.ownUsernamePin].forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
      });
    });
    if (ui.openBtn) ui.openBtn.addEventListener('click', openPanel);
    if (ui.closeBtn) ui.closeBtn.addEventListener('click', () => ui.dialog && ui.dialog.close());
    if (ui.usersTab) ui.usersTab.addEventListener('click', () => showTab('users'));
    if (ui.organizationsTab) ui.organizationsTab.addEventListener('click', () => showTab('organizations'));
    if (ui.activityTab) ui.activityTab.addEventListener('click', () => showTab('activity'));
    if (ui.limitsTab) ui.limitsTab.addEventListener('click', () => showTab('limits'));
    if (ui.limitsForm) ui.limitsForm.addEventListener('submit', saveLimits);
    if (ui.limitsReset) ui.limitsReset.addEventListener('click', resetLimits);
    if (ui.limitsScope) ui.limitsScope.addEventListener('change', () => {
      setBusy(true);
      loadLimits().catch(error => setMessage(errorMessage(error), true)).finally(() => setBusy(false));
    });
    if (ui.inviteForm) ui.inviteForm.addEventListener('submit', inviteUser);
    if (ui.passwordForm) ui.passwordForm.addEventListener('submit', submitPasswordChange);
    if (ui.loginLockForm) ui.loginLockForm.addEventListener('submit', resetLoginLock);
    if (ui.loginLockCloseBtn) ui.loginLockCloseBtn.addEventListener('click', closeLoginLockDialog);
    if (ui.loginLockCancelBtn) ui.loginLockCancelBtn.addEventListener('click', closeLoginLockDialog);
    if (ui.changeOwnUsernameBtn) ui.changeOwnUsernameBtn.addEventListener('click', openOwnUsernameDialog);
    if (ui.ownUsernameForm) ui.ownUsernameForm.addEventListener('submit', submitOwnUsernameChange);
    if (ui.ownUsernameCloseBtn) ui.ownUsernameCloseBtn.addEventListener('click', closeOwnUsernameDialog);
    if (ui.ownUsernameCancelBtn) ui.ownUsernameCancelBtn.addEventListener('click', closeOwnUsernameDialog);
    if (ui.globalLogoutBtn) ui.globalLogoutBtn.addEventListener('click', openGlobalLogoutDialog);
    if (ui.globalLogoutForm) ui.globalLogoutForm.addEventListener('submit', submitGlobalLogout);
    if (ui.globalLogoutCloseBtn) ui.globalLogoutCloseBtn.addEventListener('click', closeGlobalLogoutDialog);
    if (ui.globalLogoutCancelBtn) ui.globalLogoutCancelBtn.addEventListener('click', closeGlobalLogoutDialog);
    if (ui.passwordCloseBtn) ui.passwordCloseBtn.addEventListener('click', closePasswordDialog);
    if (ui.passwordCancelBtn) ui.passwordCancelBtn.addEventListener('click', closePasswordDialog);
    if (ui.deleteForm) ui.deleteForm.addEventListener('submit', submitDeleteUser);
    if (ui.deleteCloseBtn) ui.deleteCloseBtn.addEventListener('click', closeDeleteDialog);
    if (ui.deleteCancelBtn) ui.deleteCancelBtn.addEventListener('click', closeDeleteDialog);
    if (ui.usersRefresh) ui.usersRefresh.addEventListener('click', loadUsers);
    if (ui.userFilterOrg) ui.userFilterOrg.addEventListener('change', loadUsers);
    if (ui.userSearch) ui.userSearch.addEventListener('input', renderUsers);
    if (ui.organizationCreateForm) ui.organizationCreateForm.addEventListener('submit', createOrganization);
    if (ui.organizationsRefresh) ui.organizationsRefresh.addEventListener('click', loadOrganizations);
    if (ui.activityRefresh) ui.activityRefresh.addEventListener('click', () => {
      setBusy(true);
      loadActivityHistory().catch(error => setMessage(errorMessage(error), true)).finally(() => setBusy(false));
    });
    if (ui.activityOrg) ui.activityOrg.addEventListener('change', () => {
      if (ui.activityPane && !ui.activityPane.hidden) void loadActivityHistory();
    });
    if ($('languageSelect')) $('languageSelect').addEventListener('change', applyLanguage);
  }

  async function init() {
    client = window.PulumurSupabase;
    if (!client) {
      window.setTimeout(init, 100);
      return;
    }
    bind();
    applyLanguage();
    await loadContext();
    client.auth.onAuthStateChange(() => window.setTimeout(loadContext, 0));
  }

  init().catch(error => console.error('Admin panel init failed', error));
})();
