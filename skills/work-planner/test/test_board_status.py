"""Board Status owns the proposed board change and the commands computing it, and Board Delivery and Hot-fix reach them with the decisions they gave.

The documented commands run from the artifact that now holds them, over fixtures whose
decisions the delivery, dispatch and queue scripts already gave: closure, review evidence,
reservation, absent items, dependency gates and each jurisdiction's refusals.
"""
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, hotfix, initiative_body, issue, item, links, pr, run, url
from test_board_queue import delivering, staged
from test_command_contracts import arguments
from test_kind_operations import operations

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker  # noqa: E402

STATUS = ROOT / 'artifacts' / 'board-status.md'
DELIVERY = ROOT / 'artifacts' / 'board-delivery.md'
HOTFIX = ROOT / 'artifacts' / 'hotfix.md'
OPTIONS = ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done')
FIELDS = [{'id': 7, 'name': 'Status', 'options': [{'name': name, 'id': n} for n, name in enumerate(OPTIONS, 1)]}]
RECORD = 'https://github.com/o/r/tree/engineering/artifacts/planning/2026-10-06-2-i01-e00-w01-go/'


def sections(path, level=2):
    """Each heading of the level, with the headings below it."""
    lines, _, headings = checker.scan(path)
    found, current = {}, None
    for _, depth, title in headings:
        if depth == level:
            current = found.setdefault(title, [])
        elif depth == level + 1 and current is not None:
            current.append(title)
    return found


def findings(path):
    """The shared checker's findings for one file, read against every file of the skill, as its run reads them."""
    paths = sorted(item for item in ROOT.rglob('*.md') if 'fixtures' not in item.relative_to(ROOT).parts)
    declared = {}
    cited, called = checker.citations(paths, declared)
    return checker.check(path, ROOT.parent, {}, cited, called, declared)


class Documented(unittest.TestCase):
    """Runs a command as the artifact holding it documents it."""

    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory(prefix='board status ')))

    def snapshot(self, name, value):
        path = self.root / name
        path.write_text(value if isinstance(value, str) else json.dumps(value))
        return str(path)

    def execute(self, document, heading, values):
        script, argv = arguments(document, heading, values)
        return run(script, *argv)


class DeliveryDecisions(Documented):
    """Compute Board Changes, run from Board Status, gives each item the Status delivery gave it."""

    def changes(self, epic, task, task_status='Backlog', prs=(), held=(), reviews=(), on_board=True,
                others=()):
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        for record, number in ((initiative, 11), (epic, 12), (task, 13)):
            record['id'] = number
            record['assignees'] = [{'login': 'me'}]
        rows = [{**item(initiative, 'In Progress'), 'id': 100}, {**item(epic, 'In Progress'), 'id': 101}]
        if on_board:
            rows.append({**item(task, task_status), 'id': 102})
        rows += [{**item(other, held_status), 'id': 110 + n} for n, (other, held_status) in enumerate(others)]
        return self.execute('board-status.md', 'Compute Board Changes', {
            'initiative-json-file': self.snapshot('initiative.json', initiative),
            'epic-json-file': self.snapshot('epic.json', epic),
            'task-json-file': self.snapshot('task.json', task),
            'pull-request-records-file': self.snapshot('prs.json', ''.join(json.dumps(p) + '\n' for p in prs)),
            'issue-link-snapshot-file': self.snapshot('links.json', list(held)),
            'review-records-file': self.snapshot('reviews.json', list(reviews)),
            'board-identity': 'users/o/projectsV2/9',
            'board-fields-file': self.snapshot('fields.json', FIELDS),
            'board-items-file': self.snapshot('items.json', rows),
            'output-directory': str(self.root / 'calls'),
            'assignee-login': 'me',
        })

    def epic(self, link='W01', depends=''):
        return issue(2, '[I01:E00] First: Epic', body=epic_body((link, 'Go', depends)))

    def test_closure_as_completed_is_done_and_any_other_closure_leaves_the_board(self):
        task = issue(3, '[I01:E00:W01] Go: Task', 'closed')
        dropped = issue(5, '[I01:E05] Dropped: Epic', 'closed')
        dropped['state_reason'] = 'not_planned'
        merged = pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z', base='i01/e00/workspace')
        done = self.changes(self.epic(f"[W01]({url('issues', 3)})"), task, prs=(merged,), held=(links(9, 3),),
                            others=((dropped, 'Ready'),))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → Done', done.stdout)
        self.assertIn('remove #5 [I01:E05] Dropped: Epic (closed, not completed)', done.stdout)

    def test_a_complete_epic_without_current_review_stays_in_progress_and_blocks_its_handoff(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 9)})", 'Go', ''))
                     .replace('- [ ] **AC1.**', '- [x] **AC1.**'))
        merged = pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')
        done = self.changes(epic, issue(3, '[I01:E99:W01] Elsewhere: Task'), prs=(merged,))
        self.assertEqual(done.returncode, 1, done.stderr)
        self.assertNotIn('→ In Review', done.stdout)
        self.assertIn('handoff blocked', done.stdout)

    def test_a_reserved_row_puts_its_task_in_progress_and_a_work_item_link_does_not(self):
        held = self.changes(self.epic(f'[W01]({RECORD})'), issue(3, '[I01:E00:W01] Go: Task'))
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → In Progress', held.stdout)
        free = self.changes(self.epic(f'[W01]({RECORD}w01.md)'), issue(3, '[I01:E00:W01] Go: Task'))
        self.assertNotIn('→ In Progress', free.stdout)

    def test_an_absent_item_is_added_and_takes_its_status_on_the_next_pass(self):
        task = issue(3, '[I01:E00:W01] Go: Task')
        first = self.changes(self.epic(f'[W01]({RECORD})'), task, on_board=False)
        self.assertIn('add #3 [I01:E00:W01] Go: Task (In Progress)', first.stdout)
        self.assertNotIn('set #3', first.stdout)
        refreshed = self.changes(self.epic(f'[W01]({RECORD})'), task, task_status=None)
        self.assertIn('set #3 [I01:E00:W01] Go: Task: no Status → In Progress', refreshed.stdout)

    def test_a_task_gated_on_an_unresolvable_entry_keeps_its_status_and_fails_the_run(self):
        done = self.changes(self.epic(depends='E05 (W04)'), issue(3, '[I01:E00:W01] Go: Task'),
                            task_status='Ready')
        self.assertEqual(done.returncode, 1)
        self.assertIn('cannot resolve E05 (W04)', done.stdout)
        self.assertNotIn('#3 [I01:E00:W01] Go: Task: Ready →', done.stdout)


class DispatchDecisions(Documented):
    """Compute Dispatch Status, run from Board Status, writes only what a dispatch owns."""

    def dispatch(self, records, progress='', review=''):
        rows = []
        for n, (record, status) in enumerate(records):
            record['id'] = 1000 + record['number']
            record['assignees'] = [{'login': 'me'}]
            rows.append({**item(record, status), 'id': 100 + n})
        return self.execute('board-status.md', 'Compute Dispatch Status', {
            'board-items-file': self.snapshot('items.json', rows),
            'board-identity': 'users/o/projectsV2/9',
            'board-fields-file': self.snapshot('fields.json', FIELDS),
            'output-directory': str(self.root / 'calls'),
            'assignee-login': 'me', 'held-issue-numbers': progress, 'complete-epic-numbers': review,
            'pull-request-records-file': self.snapshot('prs.json', ''),
            'review-records-file': self.snapshot('reviews.json', []),
        })

    def complete(self):
        epic = issue(943, '[I07:E00] Queue Plan: Work', body=epic_body(('W01', 'Work', '')))
        epic['body'] = epic['body'].replace('- [ ]', '- [x]')
        return epic

    def test_a_held_task_and_its_epic_go_in_progress(self):
        done = self.dispatch([(self.complete(), 'Ready'), (issue(637, '[I07:E00:W01] Work: Task'), 'Ready')],
                             progress='943,637')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('Ready → In Progress', done.stdout)
        self.assertEqual(done.stdout.count('→ In Progress'), 2)

    def test_in_review_without_current_review_evidence_is_refused_with_no_call(self):
        done = self.dispatch([(self.complete(), 'In Progress')], review='943')
        self.assertEqual(done.returncode, 1)
        self.assertIn('handoff blocked', done.stderr)
        self.assertNotIn('gh api', done.stdout)

    def test_an_issue_not_on_the_board_is_refused(self):
        done = self.dispatch([(self.complete(), 'Ready')], progress='944')
        self.assertEqual(done.returncode, 1)
        self.assertIn('not on the board: #944', done.stderr)
        self.assertNotIn('gh api', done.stdout)

    def test_a_task_set_in_review_is_refused(self):
        done = self.dispatch([(issue(637, '[I07:E00:W01] Work: Task'), 'In Progress')], review='637')
        self.assertNotEqual(done.returncode, 0)
        self.assertNotIn('gh api', done.stdout)


class HotfixDecisions(Documented):
    """The queue, documented in Board Queue and held to Board Status's jurisdiction, gives a hot-fix the
    status its own Board Status gives it, and Closure gives a closed one."""

    def queue(self, records, prs=()):
        rows = staged(*records)
        return self.execute('board-queue.md', 'Compute Board Queue', {
            'board-items-file': self.snapshot('items.json', rows),
            'pull-request-records-file': self.snapshot('prs.json', ''.join(json.dumps(p) + '\n' for p in prs)),
            'issue-link-snapshot-file': self.snapshot('links.json', [
                {'repo': 'o/r', 'number': p['number'], 'closingIssuesReferences': p['closingIssuesReferences']}
                for p in prs]),
            'board-identity': 'users/o/projectsV2/9',
            'board-fields-file': self.snapshot('fields.json', FIELDS),
            'output-directory': str(self.root / 'calls'),
            'assignee-login': 'me',
        })

    def test_closure_as_completed_is_done_and_any_other_closure_leaves_the_board(self):
        merged, dropped = hotfix(4, 'closed'), hotfix(5, 'closed')
        dropped['state_reason'] = 'not_planned'
        done = self.queue([(merged, 'In Progress'), (dropped, 'Ready')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('[F04] Key Validation: Reject Bad Keys: In Progress → Done', done.stdout)
        self.assertIn('remove #5 [F05] Key Validation: Reject Bad Keys (closed, not completed)', done.stdout)

    def test_a_ready_delivery_stands_it_in_review_a_draft_in_progress_and_a_hold_stays(self):
        done = self.queue([(hotfix(4), 'In Progress'), (hotfix(5), 'Ready'), (hotfix(6), 'In Progress')],
                          [delivering(951, 4), delivering(952, 5, draft=True)])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('[F04] Key Validation: Reject Bad Keys: In Progress → In Review', done.stdout)
        self.assertIn('[F05] Key Validation: Reject Bad Keys: Ready → In Progress', done.stdout)
        self.assertNotIn('#6', done.stdout)

    def test_missing_issue_links_are_refused(self):
        done = self.execute('board-queue.md', 'Compute Board Queue', {
            'board-items-file': self.snapshot('items.json', staged((hotfix(4), 'Ready'))),
            'pull-request-records-file': self.snapshot('prs.json', json.dumps(delivering(951, 4)) + '\n'),
            'issue-link-snapshot-file': self.snapshot('links.json', '{'),
            'board-identity': 'users/o/projectsV2/9',
            'board-fields-file': self.snapshot('fields.json', FIELDS),
            'output-directory': str(self.root / 'calls'),
            'assignee-login': 'me',
        })
        self.assertNotEqual(done.returncode, 0)
        self.assertNotIn('→ In Review', done.stdout)


class BoardStatusArtifact(unittest.TestCase):
    """Board Status holds the proposed change, its commands and its jurisdiction, as the installed model reads it."""

    def test_the_installed_model_reads_it_as_an_artifact_with_no_finding(self):
        self.assertEqual(checker.contract(STATUS, {}), checker.contract(DELIVERY, {}))
        self.assertEqual(findings(STATUS), [])

    def test_its_commands_compute_delivery_and_dispatch_changes(self):
        lines, _, headings = checker.scan(STATUS)
        specs = [title for _, title in checker.specifications(headings)]
        self.assertEqual(specs, ['Compute Board Changes', 'Compute Dispatch Status'])
        text = STATUS.read_text()
        self.assertIn('skills/work-planner/scripts/board.py', text)
        self.assertIn('skills/work-planner/scripts/deliver.py', text)

    def test_every_command_input_and_output_is_one_of_its_fields(self):
        fields = {checker.anchor_of(title) for title in sections(STATUS)['Fields']}
        lines, fenced, _ = checker.scan(STATUS)
        roles = {target for _, target, role, _ in checker.role_links(lines, fenced) if role in ('input', 'output')}
        self.assertTrue(roles)
        self.assertLessEqual({target.lstrip('#') for target in roles}, fields)
        self.assertLessEqual({'status-change', 'board-changes'}, fields)

    def test_its_guidance_holds_closure_item_status_and_write_jurisdiction(self):
        self.assertEqual(sections(STATUS)['Guidance'], ['Closure', 'Item Status', 'Write Jurisdiction'])
        self.assertEqual(list(sections(STATUS)), ['Commands', 'Fields', 'Guidance'])


class BoardDeliveryCallers(unittest.TestCase):
    """Board Delivery applies and confirms what Board Status computes."""

    def test_it_holds_no_command_or_status_rule_of_its_own(self):
        self.assertEqual(list(sections(DELIVERY)), ['Operations', 'Fields'])
        self.assertNotIn('python3', DELIVERY.read_text())

    def test_dispatch_and_review_statuses_come_from_board_status_and_are_read_back(self):
        found = operations(DELIVERY)
        self.assertEqual(set(found), {'Record Epic Review', 'Record Dispatch Status'})
        self.assertIn('Run [Compute Dispatch Status](board-status.md#compute-dispatch-status "ƒ")',
                      found['Record Dispatch Status'])
        self.assertIn('Apply [Record Dispatch Status](#record-dispatch-status "ƒ")', found['Record Epic Review'])
        for name, body in found.items():
            with self.subTest(operation=name):
                self.assertIn('(board.md#read-board-configuration "ƒ")', body)
                self.assertIn('[Confirmed Statuses](#confirmed-statuses)', body)

    def test_sync_runs_compute_board_changes_from_board_status(self):
        text = (ROOT / 'modes' / 'sync-mode.md').read_text()
        self.assertEqual(text.count('(../artifacts/board-status.md#compute-board-changes "ƒ")'), 3)

    def test_no_document_reaches_a_retired_target(self):
        retired = re.compile(r'board-delivery\.md#(status-changes|compute-board-changes|compute-dispatch-status'
                             r'|board-changes|dispatch-selection)')
        for path in sorted(ROOT.rglob('*.md')):
            with self.subTest(file=str(path.relative_to(ROOT))):
                self.assertIsNone(retired.search(path.read_text()))


class HotfixCaller(unittest.TestCase):
    """Hot-fix keeps its own lifecycle and takes the change and closure Board Status defines."""

    def test_its_settlement_applies_the_board_status_change(self):
        body = operations(HOTFIX)['Settle Hot-fix Board Status']
        self.assertIn('[status change](board-status.md#status-change)', body)
        self.assertIn('[Board Status](#board-status)', body)

    def test_a_closed_hot_fix_takes_closure_from_board_status(self):
        lines, _, headings = checker.scan(HOTFIX)
        start = next(index for index, _, title in headings if title == 'Board Status')
        guidance = '\n'.join(lines[start:checker.heading_end(headings, start, 3, len(lines))])
        self.assertIn('[Closure](board-status.md#closure)', guidance)
        self.assertNotIn('board-delivery.md', guidance)

    def test_the_write_jurisdiction_links_the_hot_fix_board_status(self):
        lines, _, headings = checker.scan(STATUS)
        start = next(index for index, _, title in headings if title == 'Write Jurisdiction')
        guidance = '\n'.join(lines[start:checker.heading_end(headings, start, 3, len(lines))])
        self.assertIn('a hot-fix, as its [Board Status](hotfix.md#board-status) gives it', guidance)

    def test_every_board_status_target_resolves(self):
        anchors = {checker.anchor_of(title) for _, _, title in checker.scan(STATUS)[2]}
        for path in sorted(ROOT.rglob('*.md')):
            for anchor in re.findall(r'board-status\.md#([a-z0-9-]+)', path.read_text()):
                with self.subTest(file=str(path.relative_to(ROOT)), anchor=anchor):
                    self.assertIn(anchor, anchors)


if __name__ == '__main__':
    unittest.main()
