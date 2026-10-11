"""Preserve actual CLI completion gates and their current coverage counts."""

import argparse
from collections import Counter
import json
from pathlib import Path
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('name')
parser.add_argument('--require-complete', action='store_true')
args = parser.parse_args()
record = Path(__file__).resolve().parents[1]
base = record / 'behavioral-qualification/current-generation'
skill_tree = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices')
command = skill_tree / 'skills/workflow-canon/scripts/audit_surface.py'
observations = []
for case in json.loads((base / 'coordinator-cases.json').read_text()):
    run = Path(case['run'])
    argv = [sys.executable, str(command), 'status', '--run', str(run), '--require', 'complete']
    result = subprocess.run(argv, cwd=skill_tree, capture_output=True, text=True)
    state = json.loads((run / 'audit-state.json').read_text())
    status = json.loads(result.stdout)
    observations.append({'run': str(run.relative_to(base)), 'command': argv,
        'cwd': str(skill_tree), 'exit_code': result.returncode,
        'stdout': result.stdout, 'stderr': result.stderr, 'status': status,
        'snapshot': state['snapshot'],
        'mappings': dict(Counter(value['status'] for value in state['mappings'].values())),
        'evaluations': dict(Counter(value['status'] for value in state['evaluations'].values())),
        'obligations': dict(Counter(value['kind'] for value in state['obligations'].values()))})
destination = Path(__file__).resolve().parent / (args.name + '.json')
assert not destination.exists(), 'Retain earlier gate observations under their existing names'
destination.write_text(json.dumps(observations, indent=2) + '\n')
for observation in observations:
    print(json.dumps({key: observation[key] for key in ('run', 'exit_code', 'mappings', 'evaluations', 'obligations')}))
if args.require_complete:
    assert all(item['exit_code'] == 0 and item['status']['complete'] for item in observations)
