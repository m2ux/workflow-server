"""hotfix.py: a hot-fix's identity, target, board status, delivering pull requests and delivery unit state.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest

from fixtures import SCRIPTS, hotfix_body, issue, pr
from fixtures import hotfix as hotfix_issue

sys.path.insert(0, str(SCRIPTS))
from hotfix import (OFF_BOARD, board_status, delivering_pulls, delivery_fault, hotfix_tag, is_hotfix,  # noqa: E402
                    linking_pulls, target, targets, unit_state)

KEY = ('o/r', 4)
MERGED = '2026-11-01T00:00:00Z'


def hotfix(state: str = 'open', reason: str | None = None, aim: str | None = 'main') -> dict:
    found = hotfix_issue(4, state, target=aim)
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


class Target(unittest.TestCase):
    def test_the_overview_names_the_target_in_one_line(self):
        self.assertEqual(target(hotfix(aim='workspace')), 'workspace')
        self.assertEqual(targets(hotfix(aim='workspace')), ['workspace'])

    def test_no_line_or_several_name_no_target(self):
        self.assertEqual(target(hotfix(aim=None)), '')
        twice = hotfix()
        twice['body'] = twice['body'].replace('Target: `main`', 'Target: `main`\n\nTarget: `workspace`')
        self.assertEqual(targets(twice), ['main', 'workspace'])
        self.assertEqual(target(twice), '')

    def test_a_tilde_fence_hides_its_target_line_and_its_headings(self):
        fenced = hotfix()
        fenced['body'] = fenced['body'].replace('Target: `main`', 'Target: `main`\n\n~~~\n## Problem\nTarget: `workspace`\n~~~')
        self.assertEqual(targets(fenced), ['main'])

    def test_a_target_line_in_fenced_code_names_nothing(self):
        fenced = hotfix()
        fenced['body'] = fenced['body'].replace('Target: `main`', 'Target: `main`\n\n```\nTarget: `workspace`\n```')
        self.assertEqual(targets(fenced), ['main'])
        self.assertEqual(target(fenced), 'main')

    def test_a_target_line_outside_the_overview_names_nothing(self):
        moved = hotfix(aim=None)
        moved['body'] = hotfix_body(None) + '\nTarget: `main`\n'
        self.assertEqual(target(moved), '')


class BoardStatus(unittest.TestCase):
    def test_an_open_hot_fix_with_no_open_delivery_is_ready_unless_in_progress(self):
        merged = [pr(951, '[F04] Reject Bad Keys', MERGED, base='main')]
        for held, wanted in ((None, 'Ready'), ('Backlog', 'Ready'), ('Done', 'Ready'), ('Ready', 'Ready'),
                             ('In Progress', 'In Progress'), ('In Review', 'In Progress')):
            for delivering in ([], merged):
                with self.subTest(held=held, merged=bool(delivering)):
                    self.assertEqual(board_status(hotfix(), held, delivering), wanted)

    def test_a_ready_delivering_pull_request_stands_it_in_review_and_a_draft_in_progress(self):
        ready = pr(951, '[F04] Reject Bad Keys', base='main')
        draft = pr(952, '[F04] Reject Bad Keys', base='main', draft=True)
        for held in (None, 'Ready', 'In Progress', 'In Review'):
            with self.subTest(held=held):
                self.assertEqual(board_status(hotfix(), held, [ready]), 'In Review')
                self.assertEqual(board_status(hotfix(), held, [draft]), 'In Progress')
                self.assertEqual(board_status(hotfix(), held, [draft, ready]), 'In Review')

    def test_a_closed_hot_fix_is_done_or_off_the_board(self):
        ready = [pr(951, '[F04] Reject Bad Keys', base='main')]
        self.assertEqual(board_status(hotfix('closed', 'completed'), 'In Progress', []), 'Done')
        self.assertEqual(board_status(hotfix('closed', 'completed'), 'In Review', ready), 'Done')
        self.assertEqual(board_status(hotfix('closed', 'not_planned'), 'Ready', ready), OFF_BOARD)
        self.assertEqual(board_status(hotfix('closed', 'completed', aim=None), 'Ready', []), 'Done')


class DeliveringPulls(unittest.TestCase):
    def test_only_a_prefixed_linked_pull_request_into_its_target_delivers(self):
        pulls = [linked(pr(951, '[F04] Reject Bad Keys', base='main'), 4),
                 linked(pr(952, '[F04] Reject Bad Keys', base='workspace'), 4),
                 linked(pr(953, '[I07:E00] Other Work', base='main'), 4),
                 linked(pr(954, '[F09] Reject Bad Keys', base='main'), 4),
                 linked(pr(955, '[F04] Reject Bad Keys', base='main'), 7),
                 linked(pr(956, '[F04] Reject Bad Keys', base='main', repo='o/s'), 4)]
        self.assertEqual([p['number'] for p in delivering_pulls(pulls, KEY, hotfix())], [951])
        self.assertEqual([p['number'] for p in delivering_pulls(pulls, KEY, hotfix(aim='workspace'))], [952])
        self.assertEqual(delivering_pulls([], KEY, hotfix()), [])
        self.assertEqual([p['number'] for p in linking_pulls(pulls, KEY)], [951, 952, 953, 954, 956])

    def test_the_fault_names_the_failed_condition(self):
        self.assertEqual(delivery_fault(linked(pr(953, '[I07:E00] Other', base='main'), 4), KEY, hotfix()),
                         'its title does not open with [F04]')
        self.assertEqual(delivery_fault(linked(pr(956, '[F04] Fix', base='main', repo='o/s'), 4), KEY, hotfix()),
                         'it lives in o/s, not o/r')
        self.assertEqual(delivery_fault(linked(pr(951, '[F04] Fix', base='main'), 4), KEY, hotfix(aim=None)),
                         '#4 names no target in one Target: line')
        self.assertEqual(delivery_fault(linked(pr(952, '[F04] Fix', base='workspace'), 4), KEY, hotfix()),
                         'its base is workspace, not the target main')
        self.assertEqual(delivery_fault(linked(pr(955, '[F04] Fix', base='main'), 7), KEY, hotfix()),
                         'its Development field does not link #4')


class UnitState(unittest.TestCase):
    def test_a_merged_delivery_leaves_it_unrecorded_whatever_its_status(self):
        merged = [pr(951, '[F04] Reject Bad Keys', MERGED, base='main')]
        self.assertEqual(unit_state(hotfix(), 'Backlog', merged, merged), 'unrecorded')

    def test_any_open_linking_pull_request_makes_it_running(self):
        stray = [pr(951, 'Unrelated Work', base='workspace')]
        self.assertEqual(unit_state(hotfix(), 'Ready', stray, []), 'running')

    def test_a_merged_pull_request_that_does_not_deliver_it_leaves_it_free(self):
        self.assertEqual(unit_state(hotfix(), 'Ready', [pr(951, 'Unrelated Work', MERGED)], []), 'unit')

    def test_with_no_delivery_in_progress_is_its_hold_and_ready_its_unit(self):
        self.assertEqual(unit_state(hotfix(), 'In Progress', [], []), 'hold')
        self.assertEqual(unit_state(hotfix(), 'Ready', [], []), 'unit')
        self.assertIsNone(unit_state(hotfix(), 'Backlog', [], []))
        self.assertIsNone(unit_state(hotfix('closed', 'completed'), 'Ready', [], []))

    def test_an_open_draft_delivering_pull_request_makes_it_running(self):
        draft = pr(951, '[F04] Reject Bad Keys', base='main', draft=True)
        for held in ('Ready', 'In Progress'):
            with self.subTest(held=held):
                self.assertEqual(unit_state(hotfix(), held, [draft], [draft]), 'running')


if __name__ == '__main__':
    unittest.main()
