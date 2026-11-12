"""board-queue.py over captured Advance boards: a saved answer settles the queue, and missing or
further evidence keeps it pending.
"""
import copy
import json
import re
import tempfile
import unittest
from pathlib import Path

from fixtures import run
from test_board_queue import FIELDS

CAPTURES = json.loads(Path(__file__).with_name('advance-captures.json').read_text())['captures']
BEFORE = 'automatic-order-before-answer'
SAVED = 'automatic-order-saved-priority'
CONVERGED = 'automatic-order-converged-state'


def compute(snapshot, unplanned=()):
    """Run board-queue.py over captured input, retaining its actual report and status."""
    with tempfile.TemporaryDirectory() as tmp:
        directory = Path(tmp)
        for name, data in (('items', snapshot['items']), ('fields', FIELDS), ('links', [])):
            (directory / f'{name}.json').write_text(json.dumps(data))
        (directory / 'prs.json').write_text(''.join(json.dumps(row) + '\n' for row in snapshot['prs']))
        extra = [arg for identity in (*snapshot['unplanned'], *unplanned) for arg in ('--unplanned', identity)]
        return run('board-queue.py', '--items', str(directory / 'items.json'),
                   '--prs', str(directory / 'prs.json'), '--links', str(directory / 'links.json'),
                   '--board', 'users/o/projectsV2/9', '--fields', str(directory / 'fields.json'),
                   '--out', str(directory / 'out'), '--assignee', 'me', *extra)


def complete(result):
    return result.returncode == 0 and not re.search(r'^\s+(?:order:|ask |unresolved:|invalid )', result.stdout, re.M)


def unranked(snapshot, labels):
    """The snapshot with a second running initiative carrying the given labels."""
    snapshot = copy.deepcopy(snapshot)
    another = copy.deepcopy(snapshot['items'][0])
    another['id'] = 104
    another['content'].update(number=4, id=1004, title='[I04] Other: Work', labels=labels,
                              html_url='https://github.com/o/r/issues/4',
                              body='## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n| --- | --- | --- | --- | --- |\n')
    snapshot['items'].append(another)
    return snapshot


class AdvanceQueue(unittest.TestCase):
    def test_the_board_before_an_answer_holds_a_pending_decision(self):
        self.assertFalse(complete(compute(CAPTURES[BEFORE])))

    def test_a_saved_answer_completes_the_queue(self):
        result = compute(CAPTURES[SAVED])
        self.assertTrue(complete(result), result.stdout)
        self.assertIn('Backlog → Ready', result.stdout)

    def test_a_further_unranked_initiative_stays_pending(self):
        result = compute(unranked(CAPTURES[SAVED], []))
        self.assertFalse(complete(result))
        self.assertIn('ask #4', result.stdout)

    def test_missing_dependency_evidence_stays_pending(self):
        snapshot = copy.deepcopy(CAPTURES[SAVED])
        body = snapshot['items'][0]['content']['body']
        snapshot['items'][0]['content']['body'] = body.replace('issues/2)', 'issues/99)')
        result = compute(snapshot)
        self.assertFalse(complete(result))
        self.assertIn('unresolved:', result.stdout)

    def test_an_unplanned_identity_settles_its_ask(self):
        snapshot = unranked(CAPTURES[BEFORE], [{'name': 'priority: 3'}])
        self.assertIn('ask #1', compute(snapshot).stdout)
        result = compute(snapshot, ('1',))
        self.assertTrue(complete(result), result.stdout)
        self.assertNotRegex(result.stdout, r'\b(?:order:|ask #)')

    def test_a_saved_priority_settles_its_ask(self):
        snapshot = unranked(CAPTURES[BEFORE], [{'name': 'priority: 3'}])
        snapshot['items'][0]['content']['labels'] = [{'name': 'priority: 3'}]
        result = compute(snapshot)
        self.assertTrue(complete(result), result.stdout)
        self.assertNotIn('ask #1', result.stdout)

    def test_captured_converged_snapshot_has_no_further_calls(self):
        result = compute(CAPTURES[CONVERGED])
        self.assertTrue(complete(result))
        self.assertIn('(the queue is current)', result.stdout)
        self.assertNotIn('gh api', result.stdout)


if __name__ == '__main__':
    unittest.main()
