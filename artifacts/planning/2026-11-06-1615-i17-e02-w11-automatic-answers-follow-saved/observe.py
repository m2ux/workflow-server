"""Offline operation receipts for an independent Advance procedure reading."""
import json
import sys
from pathlib import Path

ROOT = Path('/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w11-automatic-answers-follow-saved')
sys.path.insert(0, str(ROOT / 'skills/work-planner/test'))
from test_board_queue import queue_run

HERE = Path(__file__).resolve().parent
name, operation, *answer = sys.argv[1:]
scenario = json.loads((HERE / 'scenarios.json').read_text())[name]
path = HERE / f'reader-journal-{name}.json'
state = dict(events=[], current=scenario['initial']) if operation == 'start' else json.loads(path.read_text())
state['events'].append(dict(operation=operation, answer=answer))
if operation in ('start', 'Compute Board Queue'):
    snap = state['current']
    if snap is None:
        response = dict(error='board items unavailable')
    else:
        done = queue_run(snap['items'], snap['prs'], tuple(snap['unplanned']))
        response = dict(returncode=done.returncode, stdout=done.stdout, stderr=done.stderr)
        if operation == 'start':
            response.update(allowance=scenario['allowance'], captured_inputs=snap)
elif operation == 'Check Plan Change Autonomy':
    response = dict(disposition='automatic' if 'Re-prioritisation' in scenario['allowance'] else 'held', allowance=scenario['allowance'])
elif operation == 'Record Plan Change':
    response = dict(recorded=True, supplied_answer=answer)
elif operation == 'Ensure Repository Labels':
    response = dict(labels_available=True)
elif operation == 'Save Tracker Issue':
    response = dict(saved=scenario['save_ok'], error=None if scenario['save_ok'] else 'write refused')
elif operation == 'Read Board State':
    state['current'] = scenario['readback']
    response = dict(board_items=scenario['readback']['items'] if scenario['readback'] else None)
else:
    raise SystemExit(f'unsupported operation {operation}')
state['events'][-1]['response'] = response
path.write_text(json.dumps(state, indent=2) + '\n')
print(json.dumps(response, indent=2))
