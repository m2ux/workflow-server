from pathlib import Path
import json,sys
ROOT=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/workspace')
OUT=Path(__file__).resolve().parent
sys.path[:0]=[str(ROOT/'skills/work-planner/test'),str(ROOT/'skills/work-planner/scripts')]
from test_board_queue import initiative,epic,staged
from fixtures import pr,url
from deliver import ready_merges
from dispatch import inventory

parent=initiative(1,'Paused: Work',(f'[E00]({url("issues",2)})',''),priority='')
child=epic(2,'01:E00',(f'[W01]({url("pull",9)})','Go',''))
pull=pr(9,'[I01:E00] Task',head='i01/e00/w01-go',base='i01/e00/workspace',body='## Test Plan\n\n| Test | Description | Coverage | Pass |\n| --- | --- | --- | --- |\n| T1 | Captured regression | AC1 | ✓ |\n')
items=staged((parent,'Backlog'),(child,'Backlog'))
offers=ready_merges({('o/r',1):parent,('o/r',2):child},[pull],('workspace',),'o/r')
sessions=[]
for state in ('running','paused'):
    session=dict(unit='o/r#I01:E00:W01',session='observed-worker',state=state)
    try:result=sorted(inventory([session]));error=None
    except ValueError as exc:result=None;error=str(exc)
    sessions.append(dict(input=session,occupied=result,error=error))
captured=dict(revision='86df5e4c2ccc2516b46cb0be7cf89e1cc258480f',board_items=items,pull=pull,ready_merge_candidates=offers,session_inventory=sessions,limitation='Pure local function calls over captured inputs; no coordinator, worker, GitHub call, hold mutation or real merge ran.')
(OUT/'pause-observations.json').write_text(json.dumps(captured,indent=2)+'\n')
print('Backlog parent/epic merge candidates:',offers)
for row in sessions:print('Inventory',row['input']['state'],'occupied=',row['occupied'],'error=',row['error'])
