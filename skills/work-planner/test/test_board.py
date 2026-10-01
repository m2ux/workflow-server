"""The assignees board.py gives an issue for its Status, and an initiative's Status once its
criteria are ticked.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, initiative_body, issue, item, run, url

sys.path.insert(0, str(SCRIPTS))
from board import assignee_calls  # noqa: E402

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
            root.write_text(json.dumps(initiative))
            epic_path.write_text(json.dumps(epic))
            fields.write_text(json.dumps(board_fields(*statuses)))
            items.write_text(json.dumps(on_board))
            pulls.write_text('')
            done = run('board.py', str(root), '--epics', str(epic_path), '--prs', str(pulls),
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


if __name__ == '__main__':
    unittest.main()
