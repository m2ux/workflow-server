"""Preserve the initial evaluation and reopen its disputed classification."""

import contextlib
import io
import json
import sys
from pathlib import Path

sys.path.insert(0, '/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/scripts')
from audit_common import cell_index, read_json, write_json
from audit_surface import main as cli

base = Path(__file__).resolve().parent
for repeat in (1, 2):
    run = base / ('round-' + str(repeat)) / 'audit-b'
    state = read_json(run / 'audit-state.json')
    archive = base / 'classification-review' / ('round-' + str(repeat))
    assert not archive.exists()
    write_json(archive / 'initial-state.json', state)
    cells = [key for key, pair in cell_index(state).items()
             if pair[1] == 'dp:1' and state['mappings'][key]['status'] == 'A']
    assert cells and all(state['evaluations'][key]['status'] == 'finding' for key in cells)
    write_json(archive / 'reset-cells.json', cells)
    for assignment, job in state['assignments'].items():
        if job['phase'] == 'obligations' and job['status'] in ('pending', 'partial'):
            with contextlib.redirect_stdout(io.StringIO()):
                assert cli(['retry', '--run', str(run), '--assignment', assignment,
                            '--reason', 'Independent band review requires renewed DP1 evaluation; preserve accepted evidence and release pending confirmations.']) == 0
    with contextlib.redirect_stdout(io.StringIO()):
        assert cli(['reset', '--run', str(run), '--items', str(archive / 'reset-cells.json'),
                    '--reason', 'Independent confirmation reproduces the inherited declaration conflict, but current source evidence does not establish runtime misrouting. Renew DP1 evaluation and its band through current mapping and independent verification; retain High severity and all other findings.']) == 0
    print(json.dumps({'run': str(run), 'reopened_applicable_cells': len(cells), 'original_evidence': str(archive)}))
