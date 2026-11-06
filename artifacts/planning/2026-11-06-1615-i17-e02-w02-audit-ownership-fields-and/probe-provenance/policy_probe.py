from pathlib import Path
import copy,json,os,sys

root=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/workspace')
out=Path('/tmp/deliver17-20261106/e02-audit-preparation')
sys.path.insert(0,str(root/'skills/work-planner/test'))
from test_board_queue import initiative,epic,staged,queue_run,RECORD
from fixtures import url,pr

captures=[]
def capture(name,items,prs=None,unplanned=()):
    result=queue_run(copy.deepcopy(items),copy.deepcopy(prs),unplanned=unplanned)
    row=dict(name=name,items=items,prs=prs or [],unplanned=unplanned,returncode=result.returncode,stdout=result.stdout,stderr=result.stderr)
    captures.append(row)
    print(name,'exit',result.returncode)
    print(result.stdout)

def auto(priority='',epic_state='Backlog'):
    parent=initiative(1,'Current: Work',(f'[E00]({url("issues",2)})',''),priority=priority)
    return staged((parent,'In Progress'),(epic(2,'01:E00',('W01','Go','')),epic_state))
capture('automatic-order-before-answer',auto())
capture('automatic-order-saved-priority',auto('priority: 1'))
capture('automatic-order-converged-state',auto('priority: 1','Ready'))

def backlog(unplan=False,active='reservation'):
    low=initiative(1,'Low: Current',(f'[E00]({url("issues",3)})',''),(f'[E01]({url("issues",4)})',''),priority='' if unplan else 'priority: 2')
    high=initiative(2,'High: Next',(f'[E00]({url("issues",5)})',''),priority='priority: 5')
    task=f'[W01]({RECORD})' if active=='reservation' else 'W01'
    first=epic(3,'01:E00',(task,'Go',''))
    status='In Review' if active=='in-review' else 'In Progress'
    if active=='handoff':first['body']=first['body'].replace('- [ ] **AC1.**','- [x] **AC1.**')
    items=staged((low,'In Progress'),(high,'Backlog'),(first,status),(epic(4,'01:E01',('W01','Later','')),'Ready'),(epic(5,'02:E00',('W01','High','')),'Backlog'))
    prs=[]
    if active=='integration-only': prs=[pr(9,'[I01:E00] Integration',draft=True,head='i01/e00/main',base='main')]
    return items,prs
for kind in ('reservation','none','integration-only','handoff','in-review'):
    for unplan in (False,True):
        items,prs=backlog(unplan,kind)
        capture(('explicit-unplanned' if unplan else 'priority-displacement')+'-'+kind,items,prs,('1',) if unplan else ())
for held in ('Backlog','Ready','In Progress','In Review','Done'):
    low=initiative(1,'Low: Backlogged',(f'[E00]({url("issues",3)})',''),priority='')
    high=initiative(2,'High: Running',(f'[E00]({url("issues",5)})',''),priority='priority: 5')
    child=epic(3,'01:E00',(f'[W01]({RECORD})' if held=='In Progress' else 'W01','Go',''))
    capture('actual-backlog-parent-child-'+held.lower().replace(' ','-'),staged((low,'Backlog'),(high,'In Progress'),(child,held),(epic(5,'02:E00',('W01','High','')),'Ready')))
(out/'policy-observations.json').write_text(json.dumps(dict(revision='86df5e4c2ccc2516b46cb0be7cf89e1cc258480f',captures=captures),indent=2)+'\n')
