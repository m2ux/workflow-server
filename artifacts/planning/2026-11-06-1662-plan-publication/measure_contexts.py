import json
import os
import subprocess
from pathlib import Path

out = Path('/tmp/deliver17-20261106/e05-overview')
table = json.loads((out/'symbols.json').read_text())
rows = [[cell.strip() for cell in line.strip('|').split('|')]
        for line in table['markdown'].splitlines()[2:]]
plan = {'Plan Mode', 'Procedure', '6. Publish', 'Parent Identity', 'Epic Publication', 'Saved Validation'}
catalogue = {'Work Planner Test Suite', 'What Is Under Test', 'Catalogue', 'Prose Tests', 'Coverage', 'Documents'}
selected = [row for row in rows if
            (row[2].endswith('test_plan_publication.py') and not row[0].startswith('File:')) or
            (row[0].startswith('Section:') and
             ((row[2].endswith('plan-mode.md') and row[1] in plan) or
              (row[2].endswith('README.md') and row[1] in catalogue)))]
assert len(selected) == 46, len(selected)
env = dict(os.environ, GITNEXUS_STORAGE_PATH='/tmp/deliver17-20261106/gitnexus-e05')
manifest = []
for index, row in enumerate(selected, 1):
    result = subprocess.run(['gitnexus','context','--uid',row[0],'--limit','200'],
                            env=env,capture_output=True,text=True)
    file = f'context-{index:02}.json'
    (out/file).write_text(result.stdout)
    (out/(file+'.stderr')).write_text(result.stderr)
    data = json.loads(result.stdout)
    assert result.returncode == 0 and data.get('status') == 'found', (row,result.stdout)
    lengths = {f'{side}.{kind}': len(values) for side in ('incoming','outgoing')
               for kind,values in data.get(side,{}).items() if isinstance(values,list)}
    manifest.append(dict(uid=row[0],name=row[1],file=row[2],output=file,
                         counts=lengths,processes=len(data.get('processes',[])),
                         cap=200,staleness=data.get('staleness','not emitted by CLI')))
(out/'context-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Measured',len(manifest),'changed symbol contexts; maximum returned relationship collection:',
      max((n for entry in manifest for n in entry['counts'].values()),default=0))
print('Contexts reporting a process:',sum(bool(e['processes']) for e in manifest))
