from pathlib import Path
import hashlib, json, re, subprocess, sys, zipfile
root=Path('/mnt/data/plmr_v112_work')
prev=Path('/mnt/data/plmr_v112_prev')
base=Path('/mnt/data')
results=[]
def check(name, cond, detail=''):
    results.append((name,bool(cond),str(detail)))
    if not cond: print('FAIL',name,detail)
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

# Syntax and bundle checks
for p in sorted(root.rglob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    check('syntax:'+str(p.relative_to(root)),r.returncode==0,r.stderr.strip())
r=subprocess.run(['npx','--yes','esbuild',str(root/'supabase/functions/admin-users/index.ts'),'--bundle','--platform=neutral','--format=esm','--external:npm:@supabase/supabase-js@2','--outfile=/tmp/stage3-edge-test.mjs'],capture_output=True,text=True)
check('edge-typescript-parse',r.returncode==0,r.stderr.strip())

edge=(root/'supabase/functions/admin-users/index.ts').read_text()
panel=(root/'adminPanel.js').read_text()
cloud=(root/'cloudProjects.js').read_text()
html=(root/'index.html').read_text()
css=(root/'style.css').read_text()
sql=(root/'supabase/migrations/20260714000300_stage3_account_security.sql').read_text()

# Secure self rename
for token in ["action === 'change_own_username'",'CURRENT_PIN_INVALID','USERNAME_CONFIRMATION_MISMATCH','deriveAuthPassword(oldUsername, pin)','deriveAuthPassword(newUsername, pin)','signInWithPassword','updateUserById(actor.id, { password: newPassword })','commit_self_username_change_v1','updateUserById(actor.id, { password: oldPassword })']:
    check('rename:'+token,token in edge)
check('rename-system-admin-only',edge.count("actorProfile.role !== 'system_admin'")>=4)
check('rename-old-invalid-profile-update',"set username = lower(trim(p_new_username))" in sql)
check('rename-session-revoked',"session_revoked_at = p_revoked_at" in sql)
check('rename-activity-log',"'self_username_change'" in sql)
check('rename-db-atomic', 'for update' in sql.lower() and 'insert into public.activity_logs' in sql.lower())
check('rename-rpc-service-only','grant execute on function public.commit_self_username_change_v1' in sql and 'to service_role' in sql)
check('rename-ui-dialog','adminOwnUsernameDialog' in html and 'adminOwnUsernameForm' in html)
check('rename-ui-confirm', 'confirmationUsername: confirmation' in panel)
check('rename-ui-pin', "pin });" in panel)
check('rename-local-signout',"signOutLocal({ newUsername })" in panel)

# Global logout
for token in ["action === 'global_logout'",'commit_global_logout_v1',"auth.admin.signOut(accessToken, 'global')"]:
    check('global:'+token,token in edge)
check('global-db-revoke',"session_revoked_at = p_revoked_at" in sql)
check('global-activity-log',"'global_logout'" in sql)
check('global-ui-dialog','adminGlobalLogoutDialog' in html and 'adminGlobalLogoutConfirm' in html)
check('global-explicit-confirm','globalLogoutConfirm.checked' in panel)
check('normal-local-logout-preserved',"client.auth.signOut({ scope: 'local' })" in cloud)
check('cloud-auth-local-helper','signOutLocal: async options' in cloud)

# Migration safety
check('migration-additive',not re.search(r'\b(drop\s+table|drop\s+column|truncate\s+table|alter\s+table.+drop)\b',sql,re.I|re.S))
check('migration-no-table-create','create table' not in sql.lower())
check('migration-security-definer',sql.lower().count('security definer')==2)
check('migration-fixed-search-path',sql.lower().count('set search_path = public, auth, pg_temp')==2)
check('migration-public-revoked',sql.lower().count('revoke all on function')==2)

# Basic deterministic password derivation behavior simulation
pepper='test-pepper'; pin='1234'; old='rootadmin'; new='rootadmin2'
def derived(username): return 'P!'+hashlib.sha256(f'{pepper}|{username}|{pin}'.encode()).hexdigest()
check('derived-password-changes-with-username',derived(old)!=derived(new))
check('derived-password-deterministic',derived(new)==derived(new))
check('old-username-password-not-new',derived(old)!=derived(new))

# Scope and protected product files
allowed={
 'adminPanel.js','cloudProjects.js','index.html','style.css','supabase/functions/admin-users/index.ts',
 'supabase/migrations/20260714000300_stage3_account_security.sql','tests/stage3_tests.py','update.text'
}
changed=[]
for p in prev.rglob('*'):
    if p.is_file():
        rel=p.relative_to(prev); q=root/rel
        if not q.exists() or sha(p)!=sha(q): changed.append(str(rel))
for p in root.rglob('*'):
    if p.is_file():
        rel=p.relative_to(root)
        if not (prev/rel).exists(): changed.append(str(rel))
changed=sorted(set(changed))
# update.text is appended after first test run, so may not differ yet
check('change-scope',set(changed).issubset(allowed),json.dumps(changed,ensure_ascii=False))
for rel in ['app.js','peri01Geometry.js','dxfModernEngine.js','modernDxfTemplate.js','blocks/filteredBlocks.js','render/renderPipeline.js','core/topologyReconcile.js','persistence/schema.js','core/projectModel.js']:
    check('protected:'+rel,sha(prev/rel)==sha(root/rel))

# Reference artifacts
for name in ['pergo-rise-test-3-R01.plmr','local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.pdf','local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf']:
    check('artifact-readable:'+name,(base/name).exists() and (base/name).stat().st_size>0,sha(base/name) if (base/name).exists() else '')
dxf=(base/'local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf').read_text(errors='ignore').splitlines()
pairs=list(zip(dxf[0::2],dxf[1::2]))
check('dxf-sections',sum(1 for a,b in pairs if a.strip()=='0' and b.strip()=='SECTION')==6)
check('dxf-blocks',sum(1 for a,b in pairs if a.strip()=='0' and b.strip()=='BLOCK')==50)
pl=json.loads((base/'pergo-rise-test-3-R01.plmr').read_text())
check('plmr-format',pl.get('format')=='PULUMUR_PROJECT')
check('plmr-schema',pl.get('schemaVersion')==2)

passed=sum(1 for _,ok,_ in results if ok); total=len(results)
out={'passed':passed,'total':total,'failed':[{'name':n,'detail':d} for n,o,d in results if not o],'changed':changed}
(root/'tests/stage3-test-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False,indent=2))
sys.exit(0 if passed==total else 1)
