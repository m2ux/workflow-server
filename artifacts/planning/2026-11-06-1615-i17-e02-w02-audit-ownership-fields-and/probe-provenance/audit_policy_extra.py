from pathlib import Path
import json,sys,re
root=Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/workspace')
out=Path('/tmp/deliver17-20261106/e02-audit-preparation')
sys.path[:0]=[str(root/'skills/work-planner/test'),str(root/'skills/work-planner/scripts')]
from test_agent_review import hotfix_pr
from agent_review import check
captures=[]
for name,where,disposition in [('no-findings','none',''),('in-scope-fixed','finding','fixed'),('unrelated-deferred-in-findings','finding','deferred'),('unrelated-linked-outside-findings','scope','')]:
    pull,record=hotfix_pr()
    finding=dict(description='Unrelated pre-existing observation' if 'unrelated' in name else 'Affected caller defect',severity='nonblocking',disposition=disposition,ticket='https://github.com/o/r/issues/5',evidence='https://github.com/o/r/commit/'+'a'*40)
    if where=='finding':record['findings']=[finding]
    if where=='scope':record['scope']+=' Outside the reviewed change: unrelated prior debt recorded in https://github.com/o/r/issues/5.'
    captures.append(dict(name=name,pull=pull,record=record,result=check(pull,[record])))
(out/'agent-review-observations.json').write_text(json.dumps(dict(revision='86df5e4c2ccc2516b46cb0be7cf89e1cc258480f',captures=captures),indent=2)+'\n')
for x in captures:print(x['name'],repr(x['result']))
text=(root/'skills/work-planner/artifacts/architecture-overview.md').read_text()
component=text.split('flowchart LR',1)[1].split(chr(96)*3,1)[0]
nodes=re.findall(r'^\s+(\w+)(?=\[|\(\[)',component,re.M)
print('structural template nodes',nodes)
(out/'diagram-observations.json').write_text(json.dumps(dict(revision='86df5e4c2ccc2516b46cb0be7cf89e1cc258480f',template_component_nodes=nodes,count=len(nodes),minimum_source='Five to ten elements.',limitation='This measures the actual source template; it does not execute graph tooling or establish a new diagram policy.'),indent=2)+'\n')
