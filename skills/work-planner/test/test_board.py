"""The assignees board.py gives an issue for its Status.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest

from fixtures import SCRIPTS

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


if __name__ == '__main__':
    unittest.main()
