"""Reconcile actual first-pass Audit names with the fixed source reference."""

import json
from pathlib import Path
import sys

skill = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon')
sys.path.insert(0, str(skill / 'test'))
from score_qualification import covers
from audit_state import gate

record = Path(__file__).resolve().parents[1]
base = record / 'behavioral-qualification/current-generation'
expected = json.loads((skill / 'test/fixtures/audit-qualification/expected-outcomes.json').read_text())
results = []
for repeat in (1, 2):
    state = json.loads((base / 'classification-review' / ('round-' + str(repeat)) / 'initial-state.json').read_text())
    findings = gate(state)['findings']
    matches = {item['id']: [finding['id'] for finding in findings if covers(finding, item, state)] for item in expected['findings']}
    controls = []
    for item in expected['findings']:
        if not item['criterion'].startswith('dp:'):
            continue
        for entry in ('1', '2', 'Unrelated principle'):
            fake = {'entry': entry, 'location': item['source'] + ':' + str(item['lines'][0])}
            controls.append({'entry': entry, 'criterion': item['criterion'], 'rejected': not covers(fake, item, state)})
    results.append({'round': repeat, 'matches': matches, 'negative_controls': controls,
                    'pass': all(len(ids) == 1 for ids in matches.values()) and all(item['rejected'] for item in controls)})
print(json.dumps(results, indent=2))
if '--require-pass' in sys.argv:
    assert all(item['pass'] for item in results)
