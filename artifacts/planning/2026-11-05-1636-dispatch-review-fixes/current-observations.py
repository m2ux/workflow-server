import json
import sys
from pathlib import Path

source=Path('/home/mike1/projects/dev/md-composer/.worktrees/workflow-server/skill/1636-dispatch-review-fixes')
sys.path.insert(0,str(source/'skills/work-planner/scripts'))
from dispatch import batch, check_start

board='users/o/projectsV2/7'
auth={'board':board,'scope':['*'],'lane':None}
def unit(tag):
    return {'id':'o/r#I07:E00:'+tag,'record':'captured-'+tag.lower(),'report':'captured unit '+tag}
def evidence(u):
    return {'unit':u['id'],'published_record':u['record'],
            'reserved_record':u['record'],'reservation_verified':True}
u1,u2,u3=unit('W01'),unit('W02'),unit('W03')
selected=batch(auth,[u1,u2,u3],[],3,board)
run=[{'scope':'run','reason':'Captured missing sub-agent dispatch capability'}]
out={}
out['run_before_hold']=batch(auth,[u1,u2,u3],[],3,board,blockers=run)
try:
    check_start(selected,u1['id'],evidence(u1),[],3,run)
except ValueError as e:
    out['run_before_hold_start']=str(e)
running=[{'unit':u1['id'],'session':'captured-worker-1','state':'running'}]
out['run_mid_round_refill']=batch(auth,[u2,u3],running,2,board,blockers=run)
try:
    check_start(selected,u3['id'],evidence(u3),running,2,run)
except ValueError as e:
    out['run_mid_round_next_start']=str(e)
blocked=[{'scope':'unit','id':u1['id'],'reason':'Captured missing required criterion'}]
out['unit_then_independent']=batch(auth,[u1,u2],[],1,board,blockers=blocked)
try:
    check_start(selected,u1['id'],evidence(u1),[],0)
except ValueError as e:
    out['capacity_start']=str(e)
out['capacity_wait']=batch(auth,[],[],0,board,preparations=[u1])
out['capacity_resume']=check_start(selected,u1['id'],evidence(u1),[],1)
out['capacity_after_running']=batch(auth,[],running,0,board)
assert out['run_before_hold']['action']=='stop'
assert out['run_mid_round_refill']['action']=='stop'
assert out['unit_then_independent']['units']==[u2]
assert out['capacity_wait']['action']=='wait' and out['capacity_resume']==u1
print(json.dumps(out,indent=2))
