(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const ui = {
    openBtn: $('adminPanelBtn'), dialog: $('adminPanelDialog'), closeBtn: $('adminPanelCloseBtn'),
    title: $('adminPanelTitle'), subtitle: $('adminPanelSubtitle'), message: $('adminPanelMessage'),
    usersTab: $('adminUsersTab'), organizationsTab: $('adminOrganizationsTab'),
    usersPane: $('adminUsersPane'), organizationsPane: $('adminOrganizationsPane'),
    usersTitle: $('adminUsersTitle'), inviteTitle: $('adminInviteTitle'),
    inviteForm: $('adminInviteForm'), inviteOrgField: $('adminInviteOrgField'), inviteOrg: $('adminInviteOrg'),
    inviteFullName: $('adminInviteFullName'), inviteUsername: $('adminInviteUsername'),
    invitePassword: $('adminInvitePassword'), invitePasswordConfirm: $('adminInvitePasswordConfirm'),
    inviteRole: $('adminInviteRole'), inviteSubmit: $('adminInviteSubmit'),
    userFilterOrgField: $('adminUserFilterOrgField'), userFilterOrg: $('adminUserFilterOrg'),
    usersRefresh: $('adminUsersRefresh'), usersBody: $('adminUsersBody'), usersEmpty: $('adminUsersEmpty'),
    organizationsTitle: $('adminOrganizationsTitle'), organizationCreateForm: $('adminOrganizationCreateForm'),
    organizationName: $('adminOrganizationName'), organizationLicenseEnd: $('adminOrganizationLicenseEnd'),
    organizationMaxUsers: $('adminOrganizationMaxUsers'), organizationCreateSubmit: $('adminOrganizationCreateSubmit'),
    organizationsRefresh: $('adminOrganizationsRefresh'), organizationsBody: $('adminOrganizationsBody'),
    organizationsEmpty: $('adminOrganizationsEmpty'),
    passwordDialog: $('adminPasswordDialog'), passwordForm: $('adminPasswordForm'), passwordTitle: $('adminPasswordTitle'),
    passwordUser: $('adminPasswordUser'), passwordCloseBtn: $('adminPasswordCloseBtn'), passwordCancelBtn: $('adminPasswordCancelBtn'),
    newPassword: $('adminNewPassword'), newPasswordConfirm: $('adminNewPasswordConfirm'),
    passwordMessage: $('adminPasswordMessage'), passwordSubmit: $('adminPasswordSubmit')
  };

  const TEXT = {
    tr: {
      adminPanel: 'Yönetici Paneli', panelSubtitle: 'Firma, kullanıcı ve lisans yönetimi', users: 'Kullanıcılar', firms: 'Firmalar',
      inviteUser: 'Yeni Kullanıcı Oluştur', fullName: 'Ad Soyad', username: 'Kullanıcı Adı', role: 'Rol', firm: 'Firma',
      invite: 'Kullanıcı Oluştur', refresh: 'Yenile', userCode: 'Kod', status: 'Durum', projects: 'Projeler', actions: 'İşlemler',
      companyAdmin: 'Firma Yöneticisi', designer: 'Tasarımcı', systemAdmin: 'Sistem Yöneticisi', active: 'Aktif', passive: 'Pasif',
      save: 'Kaydet', password: 'Şifre Belirle', passwordAgain: 'Şifre Tekrar', newPassword: 'Yeni Şifre', noUsers: 'Kullanıcı bulunamadı.', loading: 'Yükleniyor…',
      createFirm: 'Yeni Firma Oluştur', firmName: 'Firma Adı', licenseEnd: 'Lisans Bitişi', maxUsers: 'Kullanıcı Limiti', create: 'Firma Oluştur',
      firmCode: 'Firma Kodu', license: 'Lisans', usage: 'Kullanım', noFirms: 'Firma bulunamadı.',
      inviteSuccess: 'Kullanıcı oluşturuldu.', userSaved: 'Kullanıcı güncellendi.', passwordSaved: 'Şifre güncellendi.',
      firmCreated: 'Firma oluşturuldu.', firmSaved: 'Firma güncellendi.', adminRequired: 'Bu ekran yalnız yöneticiler içindir.',
      setupMissing: 'Yönetici paneli altyapısı hazır değil. v8.9.1 SQL ve Edge Function kurulumunu tamamla.',
      confirmDeactivate: 'Bu kullanıcı pasifleştirilecek. Devam edilsin mi?', protectedUser: 'Bu hesap panelden değiştirilemez.',
      usernameHint: '3–32 karakter; küçük harf, rakam, nokta, tire veya alt çizgi.',
      inviteHelp: 'Kullanıcı adı ve ilk şifre yönetici tarafından belirlenir.',
      userLimitReached: 'Firmanın kullanıcı limiti doldu.', licenseExpired: 'Firma lisansı aktif değil.', usernameExists: 'Bu kullanıcı adı zaten kullanılıyor.',
      invalidUsername: 'Kullanıcı adı biçimi uygun değil.', passwordInvalid: 'Şifre 8–72 karakter olmalı.', passwordMismatch: 'Şifreler aynı değil.', lastAdmin: 'Firmada en az bir aktif firma yöneticisi kalmalı.',
      selfManagement: 'Kendi hesabını bu panelden değiştiremezsin.', functionMissing: 'admin-users Edge Function bulunamadı veya yayınlanmadı.',
      allFirms: 'Tüm firmalar', openPanel: 'Yönetim', close: 'Kapat', activeUsers: 'aktif kullanıcı'
    },
    en: {
      adminPanel: 'Admin Panel', panelSubtitle: 'Company, user and license management', users: 'Users', firms: 'Companies',
      inviteUser: 'Create New User', fullName: 'Full Name', username: 'Username', role: 'Role', firm: 'Company',
      invite: 'Create User', refresh: 'Refresh', userCode: 'Code', status: 'Status', projects: 'Projects', actions: 'Actions',
      companyAdmin: 'Company Administrator', designer: 'Designer', systemAdmin: 'System Administrator', active: 'Active', passive: 'Inactive',
      save: 'Save', password: 'Set Password', passwordAgain: 'Repeat Password', newPassword: 'New Password', noUsers: 'No users found.', loading: 'Loading…',
      createFirm: 'Create New Company', firmName: 'Company Name', licenseEnd: 'License End', maxUsers: 'User Limit', create: 'Create Company',
      firmCode: 'Company Code', license: 'License', usage: 'Usage', noFirms: 'No companies found.',
      inviteSuccess: 'User created.', userSaved: 'User updated.', passwordSaved: 'Password updated.',
      firmCreated: 'Company created.', firmSaved: 'Company updated.', adminRequired: 'This screen is for administrators only.',
      setupMissing: 'Admin infrastructure is not ready. Complete the v8.9.1 SQL and Edge Function setup.',
      confirmDeactivate: 'This user will be deactivated. Continue?', protectedUser: 'This account cannot be changed from the panel.',
      usernameHint: '3–32 characters; lowercase letters, numbers, dot, dash or underscore.',
      inviteHelp: 'The username and initial password are assigned by an administrator.',
      userLimitReached: 'The company user limit has been reached.', licenseExpired: 'The company license is not active.', usernameExists: 'This username is already in use.',
      invalidUsername: 'The username format is invalid.', passwordInvalid: 'Password must be 8–72 characters.', passwordMismatch: 'Passwords do not match.', lastAdmin: 'At least one active company administrator must remain.',
      selfManagement: 'You cannot change your own account from this panel.', functionMissing: 'The admin-users Edge Function was not found or has not been deployed.',
      allFirms: 'All companies', openPanel: 'Admin', close: 'Close', activeUsers: 'active users'
    }
  };

  let client = null;
  let currentUser = null;
  let currentProfile = null;
  let organizations = [];
  let users = [];
  let busy = false;
  let passwordTargetUserId = null;

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
    const raw = String((error && (error.message || error.error || error.details)) || error || '').trim();
    if (/ADMIN_REQUIRED|SYSTEM_ADMIN_REQUIRED|ORGANIZATION_ACCESS_DENIED/i.test(raw)) return t('adminRequired');
    if (/USER_LIMIT_REACHED/i.test(raw)) return t('userLimitReached');
    if (/LICENSE_EXPIRED|LICENSE_NOT_STARTED|ORGANIZATION_INACTIVE/i.test(raw)) return t('licenseExpired');
    if (/USERNAME_ALREADY_EXISTS|duplicate key.*username/i.test(raw)) return t('usernameExists');
    if (/USERNAME_INVALID/i.test(raw)) return t('invalidUsername');
    if (/PASSWORD_INVALID|PASSWORD_TOO_SHORT|PASSWORD_TOO_LONG/i.test(raw)) return t('passwordInvalid');
    if (/LAST_COMPANY_ADMIN_REQUIRED/i.test(raw)) return t('lastAdmin');
    if (/SELF_MANAGEMENT_NOT_ALLOWED/i.test(raw)) return t('selfManagement');
    if (/FunctionsHttpError|Failed to send a request|404|admin-users/i.test(raw)) return t('functionMissing');
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

  function setBusy(value) {
    busy = Boolean(value);
    [ui.inviteSubmit, ui.usersRefresh, ui.organizationCreateSubmit, ui.organizationsRefresh, ui.passwordSubmit].forEach(button => {
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
    if (ui.usersTitle) ui.usersTitle.textContent = t('users');
    if (ui.inviteTitle) ui.inviteTitle.textContent = t('inviteUser');
    if (ui.inviteSubmit) ui.inviteSubmit.textContent = t('invite');
    if (ui.passwordTitle) ui.passwordTitle.textContent = t('password');
    if (ui.passwordSubmit) ui.passwordSubmit.textContent = t('password');
    if (ui.usersRefresh) ui.usersRefresh.textContent = t('refresh');
    if (ui.organizationsTitle) ui.organizationsTitle.textContent = t('firms');
    if (ui.organizationCreateSubmit) ui.organizationCreateSubmit.textContent = t('create');
    if (ui.organizationsRefresh) ui.organizationsRefresh.textContent = t('refresh');
    if (ui.usersEmpty && !users.length) ui.usersEmpty.textContent = t('noUsers');
    if (ui.organizationsEmpty && !organizations.length) ui.organizationsEmpty.textContent = t('noFirms');
    document.querySelectorAll('[data-admin-i18n]').forEach(node => {
      const key = node.dataset.adminI18n;
      if (key) node.textContent = t(key);
    });
    if (ui.inviteUsername) ui.inviteUsername.title = t('usernameHint');
    populateOrganizationSelectors();
    renderUsers();
    renderOrganizations();
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
      organizations.forEach(org => rows.push(`<option value="${esc(org.id)}">${esc(org.company_code || '----')} · ${esc(org.name)}</option>`));
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
    ui.usersBody.innerHTML = users.map(user => {
      const protectedAccount = user.role === 'system_admin' || user.id === (currentUser && currentUser.id);
      const roleOptions = user.role === 'system_admin'
        ? `<option value="system_admin" selected>${esc(t('systemAdmin'))}</option>`
        : `<option value="company_admin" ${user.role === 'company_admin' ? 'selected' : ''}>${esc(t('companyAdmin'))}</option><option value="designer" ${user.role === 'designer' ? 'selected' : ''}>${esc(t('designer'))}</option>`;
      return `<tr data-user-id="${esc(user.id)}">
        <td class="admin-code-cell">${esc(user.company_code || '----')}.${esc(user.user_code || '----')}</td>
        <td><input class="admin-inline-input js-user-fullname" value="${esc(user.full_name || '')}" ${protectedAccount ? 'disabled' : ''}><small>@${esc(user.username || '-')}</small></td>
        <td><input class="admin-inline-input js-user-username" value="${esc(user.username || '')}" ${protectedAccount ? 'disabled' : ''}></td>
        <td><select class="admin-inline-select js-user-role" ${protectedAccount ? 'disabled' : ''}>${roleOptions}</select></td>
        <td><label class="admin-toggle"><input class="js-user-active" type="checkbox" ${user.is_active ? 'checked' : ''} ${protectedAccount ? 'disabled' : ''}><span>${esc(user.is_active ? t('active') : t('passive'))}</span></label></td>
        <td>${esc(user.project_count || 0)}</td>
        <td class="admin-row-actions">
          <button type="button" class="primary-btn js-user-save" ${protectedAccount ? 'disabled title="' + esc(t('protectedUser')) + '"' : ''}>${esc(t('save'))}</button>
          <button type="button" class="soft-btn js-user-password" data-user-id="${esc(user.id)}" data-user-name="${esc(user.full_name || user.username || '')}">${esc(t('password'))}</button>
        </td>
      </tr>`;
    }).join('');

    if (ui.usersEmpty) {
      ui.usersEmpty.hidden = users.length > 0;
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
  }

  function renderOrganizations() {
    if (!ui.organizationsBody) return;
    ui.organizationsBody.innerHTML = organizations.map(org => {
      const licenseState = org.license_end && org.license_end < new Date().toISOString().slice(0, 10) ? t('passive') : t('active');
      return `<tr data-organization-id="${esc(org.id)}">
        <td class="admin-code-cell">${esc(org.company_code || '----')}</td>
        <td><input class="admin-inline-input js-org-name" value="${esc(org.name || '')}"></td>
        <td><input class="admin-inline-input js-org-license" type="date" value="${esc(org.license_end || '')}"><small>${esc(licenseState)}</small></td>
        <td><input class="admin-inline-input js-org-limit" type="number" min="1" max="9999" value="${esc(org.max_users || 1)}"><small>${esc(org.active_user_count || 0)} / ${esc(org.user_count || 0)} ${esc(t('activeUsers'))}</small></td>
        <td><label class="admin-toggle"><input class="js-org-active" type="checkbox" ${org.is_active ? 'checked' : ''}><span>${esc(org.is_active ? t('active') : t('passive'))}</span></label></td>
        <td>${esc(org.project_count || 0)}</td>
        <td class="admin-row-actions"><button type="button" class="primary-btn js-org-save">${esc(t('save'))}</button></td>
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
  }

  async function inviteUser(event) {
    event.preventDefault();
    if (busy || !isAdmin()) return;
    const password = String(ui.invitePassword && ui.invitePassword.value || '');
    const passwordConfirm = String(ui.invitePasswordConfirm && ui.invitePasswordConfirm.value || '');
    if (password.length < 8 || password.length > 72) {
      setMessage(t('passwordInvalid'), true);
      return;
    }
    if (password !== passwordConfirm) {
      setMessage(t('passwordMismatch'), true);
      return;
    }
    setBusy(true);
    setMessage(t('loading'), false);
    try {
      const organizationId = isSystemAdmin() ? ui.inviteOrg.value : currentProfile.organization_id;
      const result = await client.functions.invoke('admin-users', {
        body: {
          action: 'create',
          organizationId,
          fullName: ui.inviteFullName.value.trim(),
          username: ui.inviteUsername.value.trim().toLowerCase(),
          password,
          role: ui.inviteRole.value,
          language: language()
        }
      });
      if (result.error) {
        let detail = '';
        try {
          if (result.error.context && typeof result.error.context.json === 'function') {
            const responseBody = await result.error.context.json();
            detail = responseBody && responseBody.error ? String(responseBody.error) : '';
          }
        } catch (_) {}
        throw new Error(detail || result.error.message || 'CREATE_USER_FAILED');
      }
      if (result.data && result.data.error) throw new Error(result.data.error);
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
        p_username: row.querySelector('.js-user-username').value.trim().toLowerCase(),
        p_role: row.querySelector('.js-user-role').value,
        p_is_active: Boolean(activeInput && activeInput.checked)
      });
      setMessage(t('userSaved'), false);
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
    const password = String(ui.newPassword && ui.newPassword.value || '');
    const confirm = String(ui.newPasswordConfirm && ui.newPasswordConfirm.value || '');
    if (password.length < 8 || password.length > 72) {
      if (ui.passwordMessage) ui.passwordMessage.textContent = t('passwordInvalid');
      return;
    }
    if (password !== confirm) {
      if (ui.passwordMessage) ui.passwordMessage.textContent = t('passwordMismatch');
      return;
    }
    setBusy(true);
    try {
      const result = await client.functions.invoke('admin-users', {
        body: { action: 'set_password', userId: passwordTargetUserId, password }
      });
      if (result.error) {
        let detail = '';
        try {
          if (result.error.context && typeof result.error.context.json === 'function') {
            const responseBody = await result.error.context.json();
            detail = responseBody && responseBody.error ? String(responseBody.error) : '';
          }
        } catch (_) {}
        throw new Error(detail || result.error.message || 'PASSWORD_UPDATE_FAILED');
      }
      if (result.data && result.data.error) throw new Error(result.data.error);
      setMessage(t('passwordSaved'), false);
      closePasswordDialog();
    } catch (error) {
      console.error(error);
      if (ui.passwordMessage) ui.passwordMessage.textContent = errorMessage(error);
    } finally {
      setBusy(false);
    }
  }

  async function createOrganization(event) {
    event.preventDefault();
    if (busy || !isSystemAdmin()) return;
    setBusy(true);
    try {
      await rpc('admin_create_organization_v1', {
        p_name: ui.organizationName.value.trim(),
        p_license_end: ui.organizationLicenseEnd.value || null,
        p_max_users: Number(ui.organizationMaxUsers.value) || 1
      });
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
      await loadOrganizations();
    } catch (error) {
      console.error(error);
      setMessage(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  }

  function showTab(tab) {
    const organizationsTab = tab === 'organizations' && isSystemAdmin();
    if (ui.usersPane) ui.usersPane.hidden = organizationsTab;
    if (ui.organizationsPane) ui.organizationsPane.hidden = !organizationsTab;
    if (ui.usersTab) ui.usersTab.classList.toggle('is-active', !organizationsTab);
    if (ui.organizationsTab) ui.organizationsTab.classList.toggle('is-active', organizationsTab);
  }

  async function openPanel() {
    if (!await loadContext()) {
      window.alert(t('adminRequired'));
      return;
    }
    applyLanguage();
    if (ui.organizationsTab) ui.organizationsTab.hidden = !isSystemAdmin();
    if (ui.organizationCreateForm) ui.organizationCreateForm.hidden = !isSystemAdmin();
    if (ui.inviteOrgField) ui.inviteOrgField.hidden = !isSystemAdmin();
    if (ui.userFilterOrgField) ui.userFilterOrgField.hidden = !isSystemAdmin();
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
    if (ui.openBtn) ui.openBtn.addEventListener('click', openPanel);
    if (ui.closeBtn) ui.closeBtn.addEventListener('click', () => ui.dialog && ui.dialog.close());
    if (ui.usersTab) ui.usersTab.addEventListener('click', () => showTab('users'));
    if (ui.organizationsTab) ui.organizationsTab.addEventListener('click', () => showTab('organizations'));
    if (ui.inviteForm) ui.inviteForm.addEventListener('submit', inviteUser);
    if (ui.passwordForm) ui.passwordForm.addEventListener('submit', submitPasswordChange);
    if (ui.passwordCloseBtn) ui.passwordCloseBtn.addEventListener('click', closePasswordDialog);
    if (ui.passwordCancelBtn) ui.passwordCancelBtn.addEventListener('click', closePasswordDialog);
    if (ui.usersRefresh) ui.usersRefresh.addEventListener('click', loadUsers);
    if (ui.userFilterOrg) ui.userFilterOrg.addEventListener('change', loadUsers);
    if (ui.organizationCreateForm) ui.organizationCreateForm.addEventListener('submit', createOrganization);
    if (ui.organizationsRefresh) ui.organizationsRefresh.addEventListener('click', loadOrganizations);
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
