import json,pathlib,subprocess,os
root=pathlib.Path('/home/mike1/projects/dev/workflow-server')
plan=json.load(open('/tmp/i04-plan.json'));results=json.load(open('/tmp/i04-build-results.json'))
names={'e00':'Wrong Records','e01':'Missing Checks','e03':'Worker Continuation','e04':'Coverage Walk','e05':'Inline Gates','e06':'Declared Shapes','e09':'Unspent Inputs'}
def run(a,cwd=root,data=None,check=True,env=None):
 r=subprocess.run(a,cwd=cwd,input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=env)
 if check and r.returncode:raise RuntimeError(r.stderr.decode()+r.stdout.decode())
 return r
def git(*a,**kw):return run(['git',*a],**kw).stdout.decode().strip()
for r in results:
 if 'worktree' not in r:continue
 wt=r['worktree'];git('diff','--cached','--check',cwd=wt)
 if git('diff','--cached','--name-only',cwd=wt):
  msg=f"[I04:{r['epic'].upper()}] {names[r['epic']]} on {r['base']}\n\nPreserve the surviving epic changes from the I04 integration tree on the current long-lived branch.\n\nSource task PRs: "+', '.join('#'+str(n) for n in r['prs'])+'\n'
  run(['git','commit','-F','-'],wt,msg.encode())
 r['head']=git('rev-parse','HEAD',cwd=wt)
pathlib.Path('/tmp/i04-build-results.json').write_text(json.dumps(results,indent=2))
validation={}
for base,p in plan.items():
 expected=git('merge-tree','--write-tree',p['target'],p['source']).splitlines()[0]
 current=p['target'];conflicts=[]
 for r in results:
  if r['base']!=base or 'head' not in r:continue
  merged=run(['git','merge-tree','--write-tree',current,r['head']],check=False)
  lines=merged.stdout.decode().splitlines();tree=lines[0]
  if merged.returncode:
   paths=sorted(set(line.split('\t',1)[1] for line in lines[1:] if '\t' in line and line.split('\t')[0].split()[-1] in ['1','2','3']))
   conflicts.append({'epic':r['epic'],'paths':paths,'output':merged.stdout.decode()})
   idx='/tmp/i04-aggregate-'+base+'.index';pathlib.Path(idx).unlink(missing_ok=True)
   env=dict(os.environ,GIT_INDEX_FILE=idx)
   git('read-tree',tree,env=env)
   for f in paths:
    entry=git('ls-tree',expected,'--',f)
    if entry:
     mode,kind,sha=entry.split('\t')[0].split();git('update-index','--add','--cacheinfo',mode,sha,f,env=env)
    else:git('update-index','--force-remove',f,env=env)
   tree=git('write-tree',env=env)
  current=run(['git','commit-tree',tree,'-p',current,'-p',r['head']],data=b'I04 aggregate verification\n').stdout.decode().strip()
 validation[base]={'expected_tree':expected,'aggregate_commit':current,'aggregate_tree':git('rev-parse',current+'^{tree}'),'overlap_resolutions':conflicts,'remaining_diff':git('diff','--stat',expected,current)}
 print(base,'overlaps',[(c['epic'],c['paths']) for c in conflicts],'remaining diff',validation[base]['remaining_diff'],flush=True)
pathlib.Path('/tmp/i04-validation.json').write_text(json.dumps(validation,indent=2))
