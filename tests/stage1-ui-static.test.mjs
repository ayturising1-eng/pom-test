import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const admin = fs.readFileSync(new URL('adminPanel.js', root), 'utf8');
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const css = fs.readFileSync(new URL('style.css', root), 'utf8');

for (const id of [
  'adminDeleteUserDialog', 'adminDeleteUserForm', 'adminDeleteUserWarning',
  'adminDeleteLastAdminConfirm', 'adminDeleteConfirmPrompt', 'adminDeleteConfirmUsername',
  'adminDeleteUserMessage', 'adminDeleteUserSubmit',
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing HTML id: ${id}`);
}
assert.match(html, /adminDeleteUserMessage[^>]+role="alert"[^>]+aria-live="assertive"/);
assert.match(css, /#adminDeleteUserDialog\s*\{[^}]*width:\s*min\(620px,[^}]*max-height:\s*calc\(100vh - 24px\)/s);
assert.match(css, /\.admin-delete-card\s*\{[^}]*width:\s*100%[^}]*box-sizing:\s*border-box/s);
assert.match(css, /\.admin-delete-message\.is-error\s*\{[^}]*color:\s*var\(--red\)/s);
assert.match(css, /\.admin-delete-confirm\[hidden\]\s*\{\s*display:\s*none/);

assert.match(admin, /function isLastActiveCompanyAdmin\(target\)/);
assert.match(admin, /target\.role === 'system_admin'/);
assert.match(admin, /target\.id === \(currentUser && currentUser\.id\)/);
assert.match(admin, /confirmLastCompanyAdmin:\s*deleteRequiresLastAdminConfirmation/);
assert.match(admin, /confirmationUsername:\s*deleteRequiresLastAdminConfirmation/);
assert.match(admin, /LAST_COMPANY_ADMIN_CONFIRMATION_REQUIRED/);
assert.match(admin, /if \(!userId \|\| !ui\.deleteDialog \|\| !isSystemAdmin\(\)\) return/);
assert.match(admin, /const deleteButton = isSystemAdmin\(\)/);
assert.match(admin, /activityLogRecorded === false/);

const keepMode = (html.match(/name="adminDeleteMode" value="keep"/g) || []).length;
const allMode = (html.match(/name="adminDeleteMode" value="all"/g) || []).length;
assert.equal(keepMode, 1);
assert.equal(allMode, 1);

console.log('PASS stage1-ui-static: modal structure, confirmation flow, protection and error presentation');
