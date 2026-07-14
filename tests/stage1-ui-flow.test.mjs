import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class ClassList {
  constructor() { this.values = new Set(); }
  toggle(name, force) {
    if (force === undefined) {
      if (this.values.has(name)) this.values.delete(name); else this.values.add(name);
    } else if (force) this.values.add(name); else this.values.delete(name);
  }
  contains(name) { return this.values.has(name); }
}

class Element {
  constructor(id = '') {
    this.id = id;
    this.textContent = '';
    this.value = '';
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.open = false;
    this.innerHTML = '';
    this.classList = new ClassList();
    this.dataset = {};
    this.listeners = new Map();
    this.focused = false;
  }
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() { this.focused = true; }
  closest() { return null; }
  reset() {}
}

const elements = new Map();
function get(id) {
  if (!elements.has(id)) elements.set(id, new Element(id));
  return elements.get(id);
}

const keepRadio = new Element('keep'); keepRadio.value = 'keep'; keepRadio.checked = true;
const allRadio = new Element('all'); allRadio.value = 'all';
const deleteForm = get('adminDeleteUserForm');
deleteForm.querySelector = selector => {
  if (selector.includes('[value="keep"]')) return keepRadio;
  if (selector.includes(':checked')) return keepRadio.checked ? keepRadio : (allRadio.checked ? allRadio : null);
  return null;
};

get('languageSelect').value = 'tr';
get('adminDeleteLastAdminConfirm').hidden = true;
get('adminDeleteConfirmUsername').disabled = true;

const apiCalls = [];
let confirmResult = true;
const client = {
  rpc: async name => {
    if (name === 'admin_list_organizations_v1') return { data: [], error: null };
    if (name === 'admin_list_users_v1') return { data: [], error: null };
    return { data: [], error: null };
  },
};

const windowObject = {
  PulumurAdminUsersApi: {
    invoke: async (action, payload) => {
      apiCalls.push({ action, payload });
      return { ok: true, activityLogRecorded: true };
    },
  },
  PulumurActivity: { touch: async () => {} },
  confirm: () => confirmResult,
  setTimeout: fn => { fn(); return 1; },
  alert: () => {},
};

let source = fs.readFileSync(new URL('../adminPanel.js', import.meta.url), 'utf8');
const initCall = "  init().catch(error => console.error('Admin panel init failed', error));";
assert.ok(source.includes(initCall));
source = source.replace(initCall, `
  window.__stage1Hooks = {
    setState(value) {
      currentUser = value.currentUser;
      currentProfile = value.currentProfile;
      users = value.users;
      organizations = value.organizations || [];
      client = value.client;
      busy = false;
    },
    openDeleteDialog,
    submitDeleteUser,
    closeDeleteDialog,
    getState() { return { deleteTargetUserId, deleteRequiresLastAdminConfirmation, busy }; }
  };`);

const context = vm.createContext({
  console,
  document: { getElementById: get },
  window: windowObject,
  setTimeout: windowObject.setTimeout,
  Date,
  Promise,
});
vm.runInContext(source, context, { filename: 'adminPanel.js' });
const hooks = windowObject.__stage1Hooks;
assert.ok(hooks);

const systemAdmin = { id: 'sys-1', role: 'system_admin', organization_id: 'org-system', is_active: true };
const companyAdmin = { id: 'admin-1', role: 'company_admin', organization_id: 'org-1', is_active: true, username: 'sibel', full_name: 'Sibel', project_count: 0 };
const designer = { id: 'designer-1', role: 'designer', organization_id: 'org-1', is_active: true, username: 'designer', full_name: 'Designer', project_count: 2 };

hooks.setState({ currentUser: { id: 'sys-1' }, currentProfile: systemAdmin, users: [systemAdmin, companyAdmin, designer], client });
hooks.openDeleteDialog('admin-1', 'Sibel');
assert.equal(get('adminDeleteUserDialog').open, true);
assert.equal(get('adminDeleteLastAdminConfirm').hidden, false);
assert.equal(get('adminDeleteConfirmUsername').disabled, false);
assert.match(get('adminDeleteUserWarning').textContent, /son aktif firma yöneticisidir/i);
assert.match(get('adminDeleteConfirmPrompt').textContent, /sibel/);

get('adminDeleteConfirmUsername').value = 'wrong';
await hooks.submitDeleteUser({ preventDefault() {} });
assert.equal(apiCalls.length, 0);
assert.equal(get('adminDeleteUserMessage').classList.contains('is-error'), true);
assert.match(get('adminDeleteUserMessage').textContent, /kullanıcı adını/i);

get('adminDeleteConfirmUsername').value = 'SIBEL';
keepRadio.checked = true; allRadio.checked = false;
await hooks.submitDeleteUser({ preventDefault() {} });
assert.equal(apiCalls.length, 1);
assert.equal(apiCalls[0].action, 'delete_user');
assert.equal(apiCalls[0].payload.userId, 'admin-1');
assert.equal(apiCalls[0].payload.deleteProjects, false);
assert.equal(apiCalls[0].payload.confirmLastCompanyAdmin, true);
assert.equal(apiCalls[0].payload.confirmationUsername, 'sibel');
assert.equal(get('adminDeleteUserDialog').open, false);

hooks.setState({ currentUser: { id: 'sys-1' }, currentProfile: systemAdmin, users: [systemAdmin, designer], client });
hooks.openDeleteDialog('designer-1', 'Designer');
keepRadio.checked = false; allRadio.checked = true;
assert.equal(get('adminDeleteLastAdminConfirm').hidden, true);
await hooks.submitDeleteUser({ preventDefault() {} });
assert.equal(apiCalls.length, 2);
assert.equal(apiCalls[1].payload.deleteProjects, true);
assert.equal(apiCalls[1].payload.confirmLastCompanyAdmin, false);

get('adminDeleteUserDialog').open = false;
hooks.setState({ currentUser: { id: 'admin-1' }, currentProfile: companyAdmin, users: [companyAdmin, designer], client });
hooks.openDeleteDialog('designer-1', 'Designer');
assert.equal(get('adminDeleteUserDialog').open, false, 'company admin must not open delete dialog');

get('adminDeleteUserDialog').open = false;
hooks.setState({ currentUser: { id: 'sys-1' }, currentProfile: systemAdmin, users: [systemAdmin], client });
hooks.openDeleteDialog('sys-1', 'Root');
assert.equal(get('adminDeleteUserDialog').open, false);
assert.match(get('adminPanelMessage').textContent, /sistem yöneticisi hesabı silinemez/i);

console.log('PASS stage1-ui-flow: strong confirmation, project modes, system-only access and protected accounts');
