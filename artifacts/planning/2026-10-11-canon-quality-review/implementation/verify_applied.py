"""Check that each retained recommendation actually changed an entry it scopes.

A recommendation is evidenced when at least one entry in its scope differs from
the reviewed revision. A recommendation whose every scoped entry is byte-identical
to the base was not applied, whatever a commit message claims.
"""

import json
import re
import subprocess
from pathlib import Path

CORPUS = Path('/home/mike1/projects/dev/workflow-server/.worktrees/workflow/technique-vocabulary')
BASE = 'e70b4477'
CATALOG = 'corpus/canon/resources/anti-patterns.md'
PRINCIPLES = 'corpus/canon/resources/design-principles.md'


def show(ref: str, path: str) -> str:
    return subprocess.run(['git', 'show', f'{ref}:{path}'], cwd=CORPUS, capture_output=True, text=True, check=True).stdout


def entries(text: str, pattern: str) -> dict[str, str]:
    matches = list(re.finditer(pattern, text, re.M))
    out = {}
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out[m.group(2)] = text[m.end():end].strip()
    return out


AP_HEADING = r'^### ((?:AP|MR)-\d+)\. (\S+)$'
DP_HEADING = r'^## (\d+)\. (.+)$'
base_ap = entries(show(BASE, CATALOG), AP_HEADING)
head_ap = entries((CORPUS / CATALOG).read_text(), AP_HEADING)
base_dp = entries(show(BASE, PRINCIPLES), DP_HEADING)
head_dp = entries((CORPUS / PRINCIPLES).read_text(), DP_HEADING)

ap_name = {m.group(1): m.group(2) for m in re.finditer(AP_HEADING, show(BASE, CATALOG), re.M)}
ap_name.update({f'MR-{int(k.split("-")[1]):02d}': v for k, v in list(ap_name.items()) if k.startswith('MR-')})
dp_name = {f'DP-{int(m.group(1)):02d}': m.group(2) for m in re.finditer(DP_HEADING, show(BASE, PRINCIPLES), re.M)}

RETIRED = {'local-rule-as-note', 'artifact-name-in-io', 'no-shadow-audit-pass'}

unevidenced = []
for rec in json.loads((Path(__file__).resolve().parent / 'recommendations.json').read_text()):
    if rec['metadata'].startswith('Rejected'):
        continue
    evidence = False
    scoped = []
    for eid in rec['entries']:
        if eid in ap_name:
            name = ap_name[eid]
            scoped.append(name)
            if name in RETIRED or name not in head_ap or base_ap[name] != head_ap[name]:
                evidence = True
        elif eid in dp_name:
            name = dp_name[eid]
            scoped.append(name)
            if base_dp.get(name) != head_dp.get(name):
                evidence = True
    if not evidence:
        unevidenced.append((rec['id'], scoped))

print(f'unevidenced={len(unevidenced)}')
for rid, scoped in unevidenced:
    print(f'  {rid}: {scoped}')
