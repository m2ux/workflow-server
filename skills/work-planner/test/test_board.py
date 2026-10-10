"""The assignees board.py gives an issue for its Status, and an initiative's Status once its
criteria are ticked.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, epic_body, initiative_body, issue, item, links, pr, run, url

sys.path.insert(0, str(SCRIPTS))
from board import Board, assignee_calls  # noqa: E402

KEY = ('o/r', 12)
PATH = 'repos/o/r/issues/12/assignees'


def held(*logins):
    return {'assignees': [{'login': who} for who in logins]}


class AssigneeCalls(unittest.TestCase):
    def test_ready_unassigned_assigns_the_user(self):
        self.assertEqual(assignee_calls(KEY, 'Ready', held(), 'me'),
                         [f"gh api --method POST {PATH} -f 'assignees[]=me'"])

    def test_every_status_from_ready_on_assigns_the_user(self):
        for status in ('Ready', 'In Progress', 'In Review', 'Done'):
            self.assertEqual(len(assignee_calls(KEY, status, held('other'), 'me')), 1, status)

    def test_the_user_already_assigned_needs_nothing(self):
        self.assertEqual(assignee_calls(KEY, 'In Progress', held('me'), 'me'), [])

    def test_backlog_removes_every_assignee(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', held('me', 'other'), 'me'),
                         [f"gh api --method DELETE {PATH} -f 'assignees[]=me'",
                          f"gh api --method DELETE {PATH} -f 'assignees[]=other'"])

    def test_backlog_unassigned_needs_nothing(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', held(), 'me'), [])

    def test_an_issue_without_an_assignees_field_reads_as_unassigned(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', {}, 'me'), [])


class RequiredLinks(unittest.TestCase):
    def test_pull_requests_without_their_issue_links_are_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root, prs = Path(tmp, 'initiative.json'), Path(tmp, 'prs.json')
            root.write_text(json.dumps(issue(1, '[I01] First: Initiative', body=initiative_body())))
            prs.write_text('')
            done = run('board.py', str(root), '--prs', str(prs), '--board', 'users/o/projectsV2/9',
                       '--fields', str(prs), '--items', str(prs), '--out', str(Path(tmp, 'out')),
                       '--assignee', 'me')
        self.assertNotEqual(done.returncode, 0)
        self.assertEqual(done.stderr.strip(), '--links is required')


class EpicPrerequisites(unittest.TestCase):
    def test_cross_repository_task_waits_for_its_epic(self):
        upstream = issue(2, '[I02:E00] Producer: Work', repo='o/other',
                         body=epic_body((f"[W01]({url('pull', 9, 'o/other')})", 'Produce', '')))
        key = ('o/r', 3)
        dependency = f"[I02:E00:W01]({url('issues', 2, 'o/other')})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        pulls = [pr(9, '[I02:E00] Produce', merged='2026-01-01T00:00:00Z', repo='o/other')]
        board = Board({('o/other', 2): upstream, key: consumer}, [], 'o/r', pulls)
        self.assertFalse(board.epic_dependencies_met(key, {}, 'consumer'))
        upstream['state'], upstream['state_reason'] = 'closed', 'completed'
        self.assertTrue(board.epic_dependencies_met(key, {}, 'consumer'))

    def test_missing_prerequisite_is_reported_and_blocks(self):
        key = ('o/r', 3)
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(
            ('W01', 'Consume', f"[E00:W01]({url('issues', 2)})")))
        board = Board({key: consumer}, [], 'o/r')
        self.assertFalse(board.epic_dependencies_met(key, {}, 'consumer'))
        self.assertEqual(board.unresolved, ['consumer: #2 not given'])

    def test_local_task_dependency_uses_the_task_merge(self):
        key = ('o/r', 2)
        epic = issue(2, '[I01:E00] Local: Work', body=epic_body(
            (f"[W01]({url('pull', 9)})", 'Produce', ''), ('W02', 'Consume', 'W01')))
        board = Board({key: epic}, [], 'o/r', [pr(9, '[I01:E00] Produce', merged='2026-01-01T00:00:00Z')])
        self.assertTrue(board.epic_dependencies_met(key, {}, 'local'))
        self.assertTrue(board.met('W01', key, {}, 'local'))


def board_fields(*names: str) -> list[dict]:
    return [{'id': 7, 'name': 'Status', 'options': [{'name': name, 'id': n} for n, name in enumerate(names, start=1)]}]


class InitiativeStatus(unittest.TestCase):
    def planned(self, initiative: dict, epic: dict, *statuses: str, held: str = 'In Progress') -> str:
        initiative['id'], epic['id'] = 11, 12
        initiative['assignees'] = epic['assignees'] = [{'login': 'me'}]
        on_board = [item(initiative, held), item(epic, 'Done')]
        on_board[0]['id'], on_board[1]['id'] = 100, 101
        with tempfile.TemporaryDirectory() as tmp:
            root, epic_path = Path(tmp, 'initiative.json'), Path(tmp, 'epic.json')
            fields, items, pulls = Path(tmp, 'fields.json'), Path(tmp, 'items.json'), Path(tmp, 'prs.json')
            held_links = Path(tmp, 'links.json')
            root.write_text(json.dumps(initiative))
            epic_path.write_text(json.dumps(epic))
            fields.write_text(json.dumps(board_fields(*statuses)))
            items.write_text(json.dumps(on_board))
            pulls.write_text('')
            held_links.write_text('[]')
            done = run('board.py', str(root), '--epics', str(epic_path), '--prs', str(pulls),
                       '--links', str(held_links),
                       '--board', 'users/o/projectsV2/9', '--fields', str(fields), '--items', str(items),
                       '--out', str(Path(tmp, 'out')), '--assignee', 'me')
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def ticked(self, state: str = 'open') -> tuple[dict, dict]:
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        body = initiative_body((f"[E00]({url('issues', 2)})", '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        return issue(1, '[I01] First: Initiative', state, body=body), epic

    def test_ticked_criteria_move_an_open_initiative_to_in_review(self):
        initiative, epic = self.ticked()
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done')
        self.assertIn('set #1 [I01] First: Initiative: In Progress → In Review', out)

    def test_an_unticked_criterion_leaves_the_initiative_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done')
        self.assertNotIn('→ In Review', out)
        self.assertIn('to do: 0', out)

    def test_a_closed_initiative_is_done(self):
        initiative, epic = self.ticked('closed')
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done', held='In Review')
        self.assertIn('set #1 [I01] First: Initiative: In Review → Done', out)

    def test_in_review_falls_back_when_the_board_lacks_it(self):
        initiative, epic = self.ticked()
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'Done', held='Ready')
        self.assertIn('set #1 [I01] First: Initiative: Ready → In Progress', out)
        self.assertNotIn('In Review', out)

    def open_pair(self, initiative_status: str, epic_status: str, epic: dict | None = None,
                  pulls: str = '', held: tuple[dict, ...] = (), tasks: tuple[dict, ...] = (),
                  statuses: tuple[str, ...] = ('Backlog', 'Ready', 'In Progress', 'Done')) -> str:
        epic = epic or issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        initiative = issue(1, '[I01] First: Initiative',
                           body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        initiative['id'], epic['id'] = 11, 12
        if initiative_status != 'Backlog':
            initiative['assignees'] = [{'login': 'me'}]
        if epic_status != 'Backlog':
            epic['assignees'] = [{'login': 'me'}]
        on_board = [item(initiative, initiative_status), item(epic, epic_status)]
        on_board[0]['id'], on_board[1]['id'] = 100, 101
        for n, task in enumerate(tasks):
            task['id'] = 20 + n
            task['assignees'] = [{'login': 'me'}]
            on_board.append({**item(task, 'Backlog'), 'id': 200 + n})
        with tempfile.TemporaryDirectory() as tmp:
            root, epic_path = Path(tmp, 'initiative.json'), Path(tmp, 'epic.json')
            fields, items, prs = Path(tmp, 'fields.json'), Path(tmp, 'items.json'), Path(tmp, 'prs.json')
            held_links = Path(tmp, 'links.json')
            root.write_text(json.dumps(initiative))
            epic_path.write_text(json.dumps(epic))
            fields.write_text(json.dumps(board_fields(*statuses)))
            items.write_text(json.dumps(on_board))
            prs.write_text(pulls)
            held_links.write_text(json.dumps(list(held)))
            task_paths = []
            for n, task in enumerate(tasks):
                path = Path(tmp, f'task-{n}.json')
                path.write_text(json.dumps(task))
                task_paths.append(str(path))
            done = run('board.py', str(root), '--epics', str(epic_path), '--prs', str(prs),
                       '--links', str(held_links), *(['--tasks', *task_paths] if task_paths else []),
                       '--board', 'users/o/projectsV2/9', '--fields', str(fields), '--items', str(items),
                       '--out', str(Path(tmp, 'out')), '--assignee', 'me')
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_an_unstarted_epic_stays_in_backlog(self):
        out = self.open_pair('Backlog', 'Backlog')
        self.assertNotIn('→ Ready', out)
        self.assertIn('to do: 0', out)

    def test_a_ready_initiative_with_no_delivery_stays_ready(self):
        out = self.open_pair('Ready', 'Backlog')
        self.assertNotIn('→ Backlog', out)
        self.assertIn('to do: 0', out)

    def test_a_delivered_epic_leaves_in_review(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', '')))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        out = self.open_pair('In Progress', 'In Review', epic, merged)
        self.assertIn('set #2 [I01:E00] First: Epic: In Review → In Progress', out)

    def test_an_open_pull_request_with_an_unticked_criterion_leaves_the_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        open_pr = json.dumps(pr(9, '[I01:E00] Go')) + '\n'
        out = self.open_pair('Backlog', 'Backlog', epic, open_pr,
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('set #2 [I01:E00] First: Epic: Backlog → In Progress', out)
        self.assertNotIn('→ In Review', out)

    def test_ticked_criteria_move_an_open_epic_to_in_review(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', ''))
                     .replace('- [ ] **AC1.**', '- [x] **AC1.**'))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        out = self.open_pair('In Progress', 'In Progress', epic, merged,
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('set #2 [I01:E00] First: Epic: In Progress → In Review', out)

    def task_pair(self, held: tuple[dict, ...]) -> str:
        """An epic whose W01 links a task issue, and an open pull request naming the epic."""
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Go', '')))
        task = issue(3, '[I01:E00:W01] Go: Task')
        return self.open_pair('In Progress', 'In Progress', epic,
                              json.dumps(pr(9, '[I01:E00] Go')) + '\n', held=held, tasks=(task,),
                              statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))

    def test_a_pull_request_linking_the_task_issue_puts_it_in_review(self):
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → In Review', self.task_pair((links(9, 3),)))

    def test_a_pull_request_linking_nothing_leaves_the_task_issue_out_of_review(self):
        out = self.task_pair(())
        self.assertNotIn('→ In Review', out)
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → Ready', out)

    def test_a_ready_epic_with_a_delivered_row_stays_ready(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', '')))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        out = self.open_pair('Ready', 'Ready', epic, merged)
        self.assertNotIn('→ In Progress', out)
        self.assertIn('to do: 0', out)


if __name__ == '__main__':
    unittest.main()
