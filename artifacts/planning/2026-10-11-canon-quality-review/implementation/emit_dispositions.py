"""Emit one implementation disposition row per reconciled candidate."""

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORPUS = Path('/home/mike1/projects/dev/workflow-server/.worktrees/workflow/technique-vocabulary')
BASE = 'e70b44778f71d9d699f746f78a16b892531c82d3'

LANDED = {
    '19b2ee0a': [f'AS-{n:02d}' for n in range(1, 8)],
    '787f82e2': ['AS-08', 'AS-09', 'AS-10'] + [f'AS-{n:02d}' for n in range(12, 17)] + [f'AS-{n:02d}' for n in range(18, 25)],
    '9ea3be34': [f'AE-{n:02d}' for n in range(1, 9)] + [f'AE-{n:02d}' for n in range(10, 22)],
    '8a19f735': ['AE-16'] + [f'AE-{n:02d}' for n in range(23, 29)],
    'df2643ef': [f'AC-{n:02d}' for n in range(1, 11)] + ['AC-12', 'AC-22', 'AC-23'],
    '7f005bb5': ['AC-11'] + [f'AC-{n:02d}' for n in range(13, 22)],
    '5a73004a': [f'PD-{n:02d}' for n in range(1, 12)] + [f'PD-{n:02d}' for n in range(13, 20)],
    '4d333ca0': ['AS-11', 'AS-17', 'AE-09', 'AE-22'],
}

commits = {}
for sha in LANDED:
    subject = subprocess.run(['git', 'log', '-1', '--format=%s', sha], cwd=CORPUS, capture_output=True, text=True, check=True)
    commits[sha] = subject.stdout.strip()

placement = {}
for sha, ids in LANDED.items():
    for rid in ids:
        placement.setdefault(rid, []).append(sha)

recommendations = json.loads((ROOT / 'recommendations.json').read_text())
names = {}
for match in re.finditer(r'^### (AP-\d+)\. (\S+)$', (CORPUS / 'corpus/canon/resources/anti-patterns.md').read_text(), re.M):
    names[match.group(2)] = match.group(1)

rows = []
for rec in recommendations:
    rid = rec['id']
    parts = [p.strip() for p in rec['metadata'].split('·')]
    where = placement.get(rid)
    if where:
        landed = ', '.join(f'`{sha}`' for sha in where)
    else:
        landed = 'no corpus change'
    rows.append((rid, parts[0], parts[1], parts[2] if len(parts) > 2 else '—', ', '.join(rec['entries']), landed))

assert len(rows) == 95, len(rows)
assert sum(1 for r in rows if r[5] != 'no corpus change') == 93

lines = ['| Candidate | Disposition | Kind | Priority | Reviewed entries | Landed in |', '| --- | --- | --- | --- | --- | --- |']
lines += [f'| {rid} | {disp} | {kind} | {pri} | {entries} | {landed} |' for rid, disp, kind, pri, entries, landed in rows]
(ROOT / 'dispositions-table.md').write_text('\n'.join(lines) + '\n')

print(f'rows={len(rows)} applied={sum(1 for r in rows if r[5] != "no corpus change")}')
for sha, subject in sorted(commits.items()):
    print(f'{sha}  {subject}')
