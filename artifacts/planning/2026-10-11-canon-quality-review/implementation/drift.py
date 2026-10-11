"""Measure how far the canon moved on origin/workflows since the reviewed revision.

The upstream Fires-on index adds one line to every unit, so a whole-body
comparison reports every entry as changed. The operative text is the Detect /
Do not flag / Fix triad and the intro sentence; that is what this compares.
"""

import json
import re
import subprocess
from pathlib import Path

CORPUS = Path('/home/mike1/projects/dev/workflow-server/.worktrees/workflow/technique-vocabulary')
BASE = 'e70b4477'
UPSTREAM = 'origin/workflows'
CATALOG = 'corpus/canon/resources/anti-patterns.md'
PRINCIPLES = 'corpus/canon/resources/design-principles.md'
FIRES_ON = re.compile(r'^\*\*Fires on:\*\*.*$\n?', re.M)


def show(ref: str, path: str) -> str:
    return subprocess.run(['git', 'show', f'{ref}:{path}'], cwd=CORPUS, capture_output=True, text=True, check=True).stdout


def entries(text: str, pattern: str) -> dict[str, str]:
    matches = list(re.finditer(pattern, text, re.M))
    out = {}
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = FIRES_ON.sub('', text[m.end():end]).strip()
        out[m.group(2)] = re.sub(r'\n{2,}', '\n\n', body)
    return out


# Upstream promoted the four MR entries into AP numbering; match on name either way.
AP_HEADING = r'^### ((?:AP|MR)-\d+)\. (\S+)$'
base_ap = entries(show(BASE, CATALOG), AP_HEADING)
head_ap = entries(show(UPSTREAM, CATALOG), AP_HEADING)
base_dp = entries(show(BASE, PRINCIPLES), r'^## (\d+)\. (.+)$')
head_dp = entries(show(UPSTREAM, PRINCIPLES), r'^## (\d+)\. (.+)$')

added = sorted(set(head_ap) - set(base_ap))
removed = sorted(set(base_ap) - set(head_ap))
changed_ap = sorted(n for n in set(base_ap) & set(head_ap) if base_ap[n] != head_ap[n])
changed_dp = sorted(n for n in set(base_dp) & set(head_dp) if base_dp[n] != head_dp[n])

numbers = {m.group(1): m.group(2) for m in re.finditer(AP_HEADING, show(BASE, CATALOG), re.M)}
numbers.update({f'MR-{int(n.split("-")[1]):02d}': v for n, v in list(numbers.items()) if n.startswith('MR-')})
dp_numbers = {f'DP-{int(m.group(1)):02d}': m.group(2) for m in re.finditer(r'^## (\d+)\. (.+)$', show(BASE, PRINCIPLES), re.M)}
recs = json.loads((Path(__file__).resolve().parent / 'recommendations.json').read_text())
touched_ap, touched_dp = set(), set()
for rec in recs:
    if rec['metadata'].startswith('Rejected'):
        continue
    for eid in rec['entries']:
        if eid in numbers:
            touched_ap.add(numbers[eid])
        elif eid in dp_numbers:
            touched_dp.add(dp_numbers[eid])

collide_ap = sorted(touched_ap & set(changed_ap))
collide_dp = sorted(touched_dp & set(changed_dp))

print(f'base      {len(base_ap)} AP+MR / {len(base_dp)} DP')
print(f'upstream  {len(head_ap)} AP / {len(head_dp)} DP')
print(f'added     {added}')
print(f'removed   {removed}')
print(f'operative text changed upstream: {len(changed_ap)} AP / {len(changed_dp)} DP')
print(f'  AP: {changed_ap}')
print(f'  DP: {changed_dp}')
print(f'this work touched {len(touched_ap)} AP / {len(touched_dp)} DP')
print(f'TRUE COLLISIONS   {len(collide_ap)} AP: {collide_ap}')
print(f'TRUE COLLISIONS   {len(collide_dp)} DP: {collide_dp}')
