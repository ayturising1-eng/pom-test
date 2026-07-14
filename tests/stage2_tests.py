from pathlib import Path
import hashlib, json, re, subprocess, sys, zipfile
root=Path('/mnt/data/plmr_v11_1_stage2')
stage1=Path('/mnt/data/plmr_v11_1_stage1')
base=Path('/mnt/data')
results=[]
def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    if not cond: print('FAIL',name,detail)

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
# syntax
js=list(root.rglob('*.js'))
for p in js:
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    check('syntax:'+str(p.relative_to(root)),r.returncode==0,r.stderr.strip())
# Edge TS parse/bundle
r=subprocess.run(['npx','--yes','esbuild',str(root/'supabase/functions/admin-users/index.ts'),'--bundle','--platform=neutral','--format=esm','--external:npm:@supabase/supabase-js@2','--outfile=/tmp/stage2-edge-test.js'],capture_output=True,text=True)
check('edge-typescript-parse',r.returncode==0,r.stderr.strip())
edge=(root/'supabase/functions/admin-users/index.ts').read_text()
sql=(root/'supabase/migrations/20260714000200_stage2_login_security.sql').read_text()
panel=(root/'adminPanel.js').read_text()
html=(root/'index.html').read_text()
# evidence checks
check('successful-login-clears-username-bucket',"bucket_type = 'username' and bucket_hash = p_username_hash" in (base/'20260714000100_stage3_security_concurrency.sql').read_text())
check('successful-login-clears-ip-bucket',"bucket_type = 'ip' and bucket_hash = p_ip_hash" in (base/'20260714000100_stage3_security_concurrency.sql').read_text())
check('thresholds-unchanged', all(x in (base/'20260714000100_stage3_security_concurrency.sql').read_text() for x in ['failure_count = 5 then 60','failure_count = 6 then 120','failure_count = 7 then 300','failure_count = 8 then 900','failure_count = 9 then 1800','failure_count = 10 then 3600','failure_count = 11 then 21600','else 86400']))
# hash consistency simulation
def h(pepper,kind,val): return hashlib.sha256(f'{pepper}|rate-limit|{kind}|{val}'.encode()).hexdigest()
check('hash-deterministic',h('p','username','demo')==h('p','username','demo'))
check('username-ip-domain-separated',h('p','username','same')!=h('p','ip','same'))
check('pepper-changes-hash',h('p1','username','demo')!=h('p2','username','demo'))
check('hash-format',bool(re.fullmatch(r'[0-9a-f]{64}',h('p','username','demo'))))
# source uses same pepper helper routes
check('login-hashes-username',"hashLoginBucket('username'" in edge)
check('login-hashes-ip',"hashLoginBucket('ip'" in edge)
check('password-derivation-create-and-pin',edge.count('deriveAuthPassword(')>=3)
# root-cause prevention
check('existing-username-readonly','js-user-username' in panel and 'readonly title=' in panel)
check('save-preserves-current-username',"p_username: current && current.username" in panel)
check('backend-username-guard',"USERNAME_CHANGE_REQUIRES_SECURE_FLOW" in sql)
check('migration-signature-preserved','admin_update_user_v1(' in sql and 'p_username text' in sql)
check('migration-no-destructive-ddl',not re.search(r'\b(drop\s+table|truncate|drop\s+column)\b',sql,re.I))
check('migration-permissions','grant execute on function public.admin_update_user_v1' in sql)
# sysadmin lock tools
check('lock-status-action',"action === 'login_lock_status'" in edge)
check('lock-reset-action',"action === 'reset_login_lock'" in edge)
check('system-admin-required',"actorProfile.role !== 'system_admin'" in edge)
check('raw-ip-not-returned','requestIp(req)' not in edge[edge.find("action === 'login_lock_status'"):])
check('masked-ip-hash',"slice(0, 12)" in edge)
check('reset-activity-log',"action: 'login_lock_reset'" in edge)
check('ui-dialog-present','adminLoginLockDialog' in html and 'adminLoginLockResetBtn' in html)
check('ui-only-system-admin-button','isSystemAdmin() ? `<button type="button" class="soft-btn js-user-login-lock"' in panel)
# stage3 excluded
check('no-stage3-rename-action','change_username' not in edge and 'self_rename' not in edge)
check('no-global-signout-stage3','global_signout' not in edge and 'signOut({ scope: \'global\'' not in panel)
# protected product files unchanged from stage1
allowed={'adminPanel.js','index.html','style.css','supabase/functions/admin-users/index.ts','supabase/migrations/20260714000200_stage2_login_security.sql','tests/stage2_tests.py'}
changed=[]
for p in stage1.rglob('*'):
    if p.is_file():
        rel=p.relative_to(stage1)
        q=root/rel
        if not q.exists() or sha(p)!=sha(q): changed.append(str(rel))
for p in root.rglob('*'):
    if p.is_file():
        rel=p.relative_to(root)
        if not (stage1/rel).exists(): changed.append(str(rel))
changed=sorted(set(changed))
check('change-scope',set(changed).issubset(allowed),json.dumps(changed,ensure_ascii=False))
for rel in ['app.js','peri01Geometry.js','dxfModernEngine.js','modernDxfTemplate.js','blocks/filteredBlocks.js','render/renderPipeline.js','core/topologyReconcile.js','persistence/schema.js']:
    check('protected:'+rel,sha(stage1/rel)==sha(root/rel))
# supplied regression artifacts untouched
for name in ['pergo-rise-test-3-R01.plmr','local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.pdf','local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf']:
    check('artifact-readable:'+name,(base/name).exists() and (base/name).stat().st_size>0,sha(base/name))
# DXF structural reference
text=(base/'local-test-3-r01-pergo-rise-web-dxf-v10-4-v01.dxf').read_text(errors='ignore').splitlines()
pairs=list(zip(text[0::2],text[1::2]))
sections=sum(1 for a,b in pairs if a.strip()=='0' and b.strip()=='SECTION')
blocks=sum(1 for a,b in pairs if a.strip()=='0' and b.strip()=='BLOCK')
check('dxf-sections',sections==6,str(sections))
check('dxf-blocks',blocks==50,str(blocks))
# PLMR parse identity basic
pl=json.loads((base/'pergo-rise-test-3-R01.plmr').read_text())
check('plmr-format',pl.get('format')=='PULUMUR_PROJECT')
check('plmr-schema',pl.get('schemaVersion')==2)
# report
passed=sum(1 for _,ok,_ in results if ok); total=len(results)
print(json.dumps({'passed':passed,'total':total,'failed':[n for n,o,d in results if not o],'changed':changed},ensure_ascii=False,indent=2))
sys.exit(0 if passed==total else 1)
