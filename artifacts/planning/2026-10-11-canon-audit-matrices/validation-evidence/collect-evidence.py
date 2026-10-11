import json
import shutil
from pathlib import Path

record = Path('/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices')
target = record / 'validation-evidence'
target.mkdir(exist_ok=True)
copied = []
names = ['author-disclosure-one-transcript.txt', 'author-disclosure-two-transcript.txt',
         'author-disclosure-three-transcript.txt', 'audit-disclosure-one-transcript.txt',
         'audit-disclosure-two-transcript.txt', 'audit-disclosure-three-transcript.txt',
         'canon-audit-unit-final.txt', 'canon-edit-guard-final.txt',
         'canon-summaries-final.txt', 'canon-corpus-final.txt', 'canon-generic-validator.txt',
         'canon-author-map-submit.txt', 'canon-links-final.json']
names += [path.name for pattern in ('qualify-*-transcript.txt',
          'qualify-*-measurements.json', 'baseline-*-transcript.txt')
          for path in Path('/tmp').glob(pattern)]
for name in names:
    source = Path('/tmp') / name
    if source.exists():
        shutil.copyfile(source, target / name)
        copied.append({'file': name, 'bytes': source.stat().st_size})
print(json.dumps(copied, indent=2))
