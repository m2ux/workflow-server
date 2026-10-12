import json, subprocess, pathlib

ROOT=pathlib.Path('/home/mike1/projects/dev/workflow-server')
PLAN=json.load(open('/tmp/i04-plan.json'))
PRS={p['number']:p for p in json.load(open('/tmp/i04-prs-flat.json'))}
def run(args,cwd=ROOT,check=True,data=None):
    r=subprocess.run(args,cwd=cwd,input=data,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    if check and r.returncode: raise RuntimeError(r.stdout.decode())
    return r
def git(*args):return run(['git',*args]).stdout
results=[]
for base,p in PLAN.items():
    for epic,numbers in sorted(p['groups'].items()):
        single=[f for f,o in p['files'].items() if o==[epic]]
        shared=[f for f,o in p['files'].items() if epic in o and len(o)>1]
        if not single and not shared:
            results.append({'base':base,'epic':epic,'status':'absorbed','prs':numbers});continue
        branch=f'i04/{epic}/{base}'
        wt=ROOT/'.worktrees'/branch
        run(['git','worktree','add','-b',branch,str(wt),p['target']])
        result={'base':base,'epic':epic,'branch':branch,'worktree':str(wt),'prs':numbers,'steps':[]}
        if single:
            patch=git('diff','--binary',p['ancestor'],p['source'],'--',*single)
            r=run(['git','apply','--3way'],wt,False,patch)
            result['steps'].append({'kind':'net-single-owner','exit':r.returncode,'output':r.stdout.decode()})
        if not run(['git','diff','--name-only','--diff-filter=U'],wt).stdout.strip():
            for n in numbers:
                sha=PRS[n]['merge_commit_sha']
                patch=git('diff','--binary',sha+'^1',sha,'--',*shared) if shared else b''
                if not patch:continue
                r=run(['git','apply','--3way'],wt,False,patch)
                result['steps'].append({'kind':f'shared-pr-{n}','exit':r.returncode,'output':r.stdout.decode()})
                if r.returncode:break
        result['conflicts']=run(['git','diff','--name-only','--diff-filter=U'],wt).stdout.decode().splitlines()
        results.append(result)
        pathlib.Path('/tmp/i04-build-results.json').write_text(json.dumps(results,indent=2))
        print(branch,'conflicts',result['conflicts'],flush=True)
pathlib.Path('/tmp/i04-build-results.json').write_text(json.dumps(results,indent=2))
