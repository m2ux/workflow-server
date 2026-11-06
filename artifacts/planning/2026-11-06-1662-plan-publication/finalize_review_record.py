import json
from pathlib import Path

scratch=Path('/tmp/deliver17-20261106')
p=scratch/'e05-final-agent-review.json'
records=json.loads(p.read_text())
assert len(records)==1
r=records[0]
r['reviewed_at']='2026-11-06T11:55:37Z'
r['validation']=r['validation'].replace('revision581','revision 581').replace('in0.043s','in 0.043 seconds').replace('reports1004','reports 1004').replace('run,1003','run, 1003').replace('and1','and 1').replace('in44.927s','in 44.927 seconds').replace('reports59','reports 59').replace('and0','and 0').replace('includes280','includes 280').replace(':46',': 46').replace(',0 reported',', 0 reported').replace('measured15-edge','measured 15-edge')
metadata=json.loads((scratch/'e05-review-pr.json').read_text())
assert r['head']==metadata['head']['sha'] and r['base']==metadata['base']['sha']
p.write_text(json.dumps(records,indent=2)+'\n')
p=scratch/'e05-final-review.md'
p.write_text(p.read_text().replace('2026-11-06T11:54:20Z','2026-11-06T11:55:37Z'))
print('Current review identity and exact metadata tips agree; findings:',len(r['findings']))
