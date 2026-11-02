"""hotfix.py: a hot-fix's identity, board status, delivering pull requests and delivery unit state.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest

from fixtures import SCRIPTS, issue, pr

sys.path.insert(0, str(SCRIPTS))
from hotfix import OFF_BOARD, board_status, delivering_pulls, hotfix_tag, is_hotfix, unit_state  # noqa: E402

KEY = ('o/r', 4)
MERGED = '2026-11-01T00:00:00Z'


def hotfix(state: str = 'open', reason: str | None = None) -> dict:
    found = issue(4, '[F04] Key Validation: Reject Bad Keys', state)
    if reason:
        found['state_reason'] = reason
    return found


def linked(record: dict, *numbers: int) -> dict:
    record['closingIssuesReferences'] = [{'repo': 'o/r', 'number': n} for n in numbers]
    return record


class Identity(unittest.TestCase):
    def test_the_prefix_alone_makes_a_hot_fix(self):
        self.assertEqual(hotfix_tag(hotfix()), 'F04')
        self.assertFalse(is_hotfix(issue(5, 'Key Validation: Reject Bad Keys', labels=('type:hot-fix',))))
        self.assertFalse(is_hotfix(issue(6, '[I07] Canon Walk: Definitions Checked')))


class BoardStatus(unittest.TestCase):
    def test_an_open_hot_fix_is_ready_unless_in_progress(self):
        for held, wanted in ((None, 'Ready'), ('Backlog', 'Ready'), ('Done', 'Ready'), ('Ready', 'Ready'),
                             ('In Progress', 'In Progress'), ('In Review', 'In Progress')):
            with self.subTest(held=held):
                self.assertEqual(board_status(hotfix(), held), wanted)

    def test_a_closed_hot_fix_is_done_or_off_the_board(self):
        self.assertEqual(board_status(hotfix('closed', 'completed'), 'In Progress'), 'Done')
        self.assertEqual(board_status(hotfix('closed', 'not_planned'), 'Ready'), OFF_BOARD)


class DeliveringPulls(unittest.TestCase):
    def test_only_a_prefixed_linked_pull_request_into_the_default_branch_delivers(self):
        pulls = [linked(pr(951, '[F04] Reject Bad Keys', base='main'), 4),
                 linked(pr(952, '[F04] Reject Bad Keys', base='workspace'), 4),
                 linked(pr(953, '[I07:E00] Other Work', base='main'), 4),
                 linked(pr(954, '[F09] Reject Bad Keys', base='main'), 4),
                 linked(pr(955, '[F04] Reject Bad Keys', base='main'), 7),
                 linked(pr(956, '[F04] Reject Bad Keys', base='main', repo='o/s'), 4)]
        self.assertEqual([p['number'] for p in delivering_pulls(pulls, KEY, 'F04', 'main')], [951])
        self.assertEqual(delivering_pulls(pulls, KEY, 'F04', ''), [])


class UnitState(unittest.TestCase):
    def test_a_merged_delivery_leaves_it_unrecorded_whatever_its_status(self):
        merged = [pr(951, '[F04] Reject Bad Keys', MERGED, base='main')]
        self.assertEqual(unit_state(hotfix(), 'Backlog', merged), 'unrecorded')

    def test_an_open_delivery_makes_it_running(self):
        self.assertEqual(unit_state(hotfix(), 'In Progress', [pr(951, '[F04] Reject Bad Keys')]), 'running')

    def test_with_no_delivery_in_progress_is_its_hold_and_ready_its_unit(self):
        self.assertEqual(unit_state(hotfix(), 'In Progress', []), 'hold')
        self.assertEqual(unit_state(hotfix(), 'Ready', []), 'unit')
        self.assertIsNone(unit_state(hotfix(), 'Backlog', []))
        self.assertIsNone(unit_state(hotfix('closed', 'completed'), 'Ready', []))


if __name__ == '__main__':
    unittest.main()
