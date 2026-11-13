"""hotfix.py: a hot-fix's identity, labels, target, board status, delivering pull requests, delivery unit state and agent
review rule, each reached through the Kind interface the module supplies, which is all it exports.
"""
import ast
import inspect
import sys
import unittest

from fixtures import SCRIPTS, hotfix_body, issue, pr
from fixtures import hotfix as hotfix_issue

sys.path.insert(0, str(SCRIPTS))
import hotfix as module  # noqa: E402
from kinds import OFF_BOARD, Kind, Tips, interface  # noqa: E402
from priority import label as priority_label  # noqa: E402

KIND = interface('hot-fix')
tag, labels, faults, target = KIND.tag, KIND.labels, KIND.faults, KIND.target
board_status, linking_pulls, delivery_fault = KIND.board_status, KIND.linking_pulls, KIND.delivery_fault
delivering_pulls, unit_state, review = KIND.delivering_pulls, KIND.unit_state, KIND.review

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
        self.assertEqual(tag(hotfix()), 'F04')
        self.assertIsNone(tag(issue(5, 'Key Validation: Reject Bad Keys', labels=('type:hot-fix',))))
        self.assertIsNone(tag(issue(6, '[I07] Canon Walk: Definitions Checked')))


class Exports(unittest.TestCase):
    def test_the_module_defines_only_its_kind_interface(self):
        tree = ast.parse(inspect.getsource(module))
        defined = {node.name for node in tree.body if isinstance(node, ast.FunctionDef)}
        defined |= {target.id for node in tree.body if isinstance(node, ast.Assign)
                    for target in node.targets if isinstance(target, ast.Name)}
        public = {name for name in defined if not name.startswith('_')}
        interface_names = {name for name, member in vars(Kind).items()
                           if inspect.isfunction(member) and not name.startswith('_')}
        self.assertEqual(public, interface_names)


class Labels(unittest.TestCase):
    def test_a_hot_fix_carries_priority_ten_beside_its_type_and_theme(self):
        self.assertEqual(labels(hotfix()), ['priority: 10'])

    def test_its_priority_label_is_the_one_work_priority_builds_for_ten(self):
        self.assertEqual(labels(hotfix()), [priority_label(10)])
        self.assertIs(vars(module)['_label'], priority_label)


class Target(unittest.TestCase):
    def test_the_overview_names_the_target_in_one_line(self):
        self.assertEqual(target(hotfix(aim='workspace')), 'workspace')
        self.assertEqual(faults(hotfix(aim='workspace')), [])

    def test_no_line_or_several_name_no_target(self):
        self.assertEqual(target(hotfix(aim=None)), '')
        twice = hotfix()
        twice['body'] = twice['body'].replace('Target: `main`', 'Target: `main`\n\nTarget: `workspace`')
        self.assertIn('2 Target: lines in the Overview; it names one target branch', faults(twice))
        self.assertEqual(target(twice), '')

    def test_a_tilde_fence_hides_its_target_line_and_its_headings(self):
        fenced = hotfix()
        fenced['body'] = fenced['body'].replace('Target: `main`', 'Target: `main`\n\n~~~\n## Problem\nTarget: `workspace`\n~~~')
        self.assertEqual(target(fenced), 'main')

    def test_a_target_line_in_fenced_code_names_nothing(self):
        fenced = hotfix()
        fenced['body'] = fenced['body'].replace('Target: `main`', 'Target: `main`\n\n```\nTarget: `workspace`\n```')
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


class Review(unittest.TestCase):
    def test_a_record_naming_the_head_and_base_branch_is_current(self):
        self.assertEqual(review(Tips('a' * 40, 'b' * 40, 'main')).current, {'head': 'a' * 40, 'base_ref': 'main'})


class ThroughTheRegistry(unittest.TestCase):
    """Each operation of the Kind interface, reached as a general script reaches it."""

    def setUp(self):
        self.kind = interface('hot-fix')

    def test_identity_target_and_faults(self):
        self.assertEqual(self.kind.tag(hotfix()), 'F04')
        self.assertIsNone(self.kind.tag(issue(6, '[I07] Canon Walk: Definitions Checked')))
        self.assertEqual(self.kind.target(hotfix(aim='workspace')), 'workspace')
        self.assertEqual(self.kind.target(hotfix(aim=None)), '')
        self.assertEqual(self.kind.faults(hotfix()), [])
        self.assertEqual(self.kind.faults(hotfix(aim=None)),
                         ['no Target: lines in the Overview; it names one target branch'])

    def test_board_status(self):
        self.assertEqual(self.kind.board_status(hotfix(), None, [pr(951, '[F04] Fix', base='main')]), 'In Review')
        self.assertEqual(self.kind.board_status(hotfix('closed', 'not_planned'), 'Ready', []), OFF_BOARD)

    def test_linking_and_delivering_pull_requests(self):
        pulls = [linked(pr(951, '[F04] Fix', base='main'), 4), linked(pr(952, '[F04] Fix', base='workspace'), 4)]
        self.assertEqual([p['number'] for p in self.kind.linking_pulls(pulls, KEY)], [951, 952])
        self.assertEqual([p['number'] for p in self.kind.delivering_pulls(pulls, KEY, hotfix())], [951])
        self.assertEqual(self.kind.delivery_fault(pulls[1], KEY, hotfix()), 'its base is workspace, not the target main')

    def test_unit_state(self):
        merged = [pr(951, '[F04] Fix', MERGED, base='main')]
        self.assertEqual(self.kind.unit_state(hotfix(), 'Ready', merged, merged), 'unrecorded')
        self.assertEqual(self.kind.unit_state(hotfix(), 'Ready', [], []), 'unit')


if __name__ == '__main__':
    unittest.main()
