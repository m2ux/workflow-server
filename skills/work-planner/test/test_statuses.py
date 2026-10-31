"""The jurisdiction each mode's Status changes are held to, and the calls they render.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, issue

sys.path.insert(0, str(SCRIPTS))
from statuses import DELIVERY, DISPATCH, PLACED, QUEUE, Changes, Jurisdiction, StatusField  # noqa: E402

HOME = 'o/r'
BOARD = 'users/o/projectsV2/9'
FIELD = [[{'id': 'F1', 'name': 'Status',
           'options': [{'id': o.lower(), 'name': o} for o in
                       ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done')]}]]


def field(tmp: str, options: tuple[str, ...] = PLACED) -> StatusField:
    path = Path(tmp, 'fields.json')
    path.write_text(json.dumps(FIELD[0]))
    return StatusField(str(path), str(Path(tmp, 'out')), options)


def changes(tmp: str, scope: str) -> Changes:
    return Changes(scope, BOARD, field(tmp), 'me', ' (current)')


def place(plan: Changes, item: dict, held: str | None, wanted: str | None) -> None:
    plan.place(('o/r', item['number']), item['title'], item, held, wanted, 'IT1', HOME)


EPIC = issue(2, '[I01:E00] First: Epic')
TASK = issue(3, '[I01:E00:W01] Go: Task')
INITIATIVE = issue(1, '[I01] First: Initiative')


class DeliveryJurisdiction(unittest.TestCase):
    def test_moving_an_epic_from_ready_to_backlog_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction) as refused:
                place(changes(tmp, DELIVERY), EPIC, 'Ready', 'Backlog')
        self.assertIn('between Ready and Backlog', str(refused.exception))

    def test_moving_an_initiative_from_backlog_to_ready_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction):
                place(changes(tmp, DELIVERY), INITIATIVE, 'Backlog', 'Ready')

    def test_an_epic_held_in_ready_and_left_there_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            place(changes(tmp, DELIVERY), EPIC, 'Ready', 'Ready')

    def test_an_epic_moving_into_in_review_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, DELIVERY)
            place(plan, EPIC, 'Ready', 'In Review')
        self.assertIn('Ready → In Review', plan.lines[0])

    def test_an_epic_moving_from_in_progress_to_backlog_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            place(changes(tmp, DELIVERY), EPIC, 'In Progress', 'Backlog')

    def test_a_task_moves_between_ready_and_backlog(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, DELIVERY)
            place(plan, TASK, 'Ready', 'Backlog')
        self.assertIn('Ready → Backlog', plan.lines[0])


class QueueJurisdiction(unittest.TestCase):
    def test_setting_in_review_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction) as refused:
                place(changes(tmp, QUEUE), EPIC, 'In Progress', 'In Review')
        self.assertIn('does not set In Review', str(refused.exception))

    def test_setting_done_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction):
                place(changes(tmp, QUEUE), INITIATIVE, 'In Progress', 'Done')

    def test_moving_a_task_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction) as refused:
                place(changes(tmp, QUEUE), TASK, 'Backlog', 'Ready')
        self.assertIn('does not move a task', str(refused.exception))

    def test_moving_an_initiative_between_ready_and_backlog_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, QUEUE)
            place(plan, INITIATIVE, 'Ready', 'Backlog')
        self.assertIn('Ready → Backlog', plan.lines[0])


class DispatchJurisdiction(unittest.TestCase):
    def test_a_held_row_moving_into_in_progress_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, DISPATCH)
            place(plan, TASK, 'Ready', 'In Progress')
        self.assertIn('Ready → In Progress', plan.lines[0])

    def test_a_complete_epic_moving_into_in_review_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, DISPATCH)
            place(plan, EPIC, 'In Progress', 'In Review')
        self.assertIn('In Progress → In Review', plan.lines[0])

    def test_setting_a_task_in_review_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction) as refused:
                place(changes(tmp, DISPATCH), TASK, 'In Progress', 'In Review')
        self.assertIn('does not set a task In Review', str(refused.exception))

    def test_setting_the_queue_is_refused(self):
        for wanted in ('Backlog', 'Ready'):
            with self.subTest(wanted=wanted):
                with tempfile.TemporaryDirectory() as tmp:
                    with self.assertRaises(Jurisdiction) as refused:
                        place(changes(tmp, DISPATCH), EPIC, 'In Progress', wanted)
                self.assertIn('a dispatch sets In Progress and In Review', str(refused.exception))

    def test_setting_done_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction):
                place(changes(tmp, DISPATCH), EPIC, 'In Review', 'Done')

    def test_removing_an_item_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(Jurisdiction) as refused:
                place(changes(tmp, DISPATCH), EPIC, 'In Progress', None)
        self.assertIn('not a removal', str(refused.exception))


class Rendering(unittest.TestCase):
    def test_a_status_change_sends_the_option_body_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, QUEUE)
            place(plan, EPIC, 'Backlog', 'In Progress')
            body = Path(tmp, 'out', 'status-in-progress.json')
            written = json.loads(body.read_text())
            self.assertIn(f'--method PATCH {BOARD}/items/IT1 --input {body}', plan.lines[0])
        self.assertEqual(written, {'fields': [{'id': 'F1', 'value': 'in progress'}]})

    def test_an_issue_already_at_its_status_and_assignee_counts_as_current(self):
        with tempfile.TemporaryDirectory() as tmp:
            plan = changes(tmp, QUEUE)
            held = dict(EPIC, assignees=[{'login': 'me'}])
            plan.place(('o/r', 2), 'E', held, 'In Progress', 'In Progress', 'IT1', HOME)
        self.assertEqual((plan.lines, plan.current, plan.todo), ([], 1, 0))

    def test_a_board_without_in_review_settles_it_as_in_progress(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'fields.json')
            path.write_text(json.dumps([{'id': 'F1', 'name': 'Status', 'options': [
                {'id': o.lower(), 'name': o} for o in PLACED + ('Done',)]}]))
            lacking = StatusField(str(path), str(Path(tmp, 'out')), PLACED)
        self.assertEqual(lacking.settle('In Review'), 'In Progress')
        self.assertEqual(lacking.settle('Done'), 'Done')


if __name__ == '__main__':
    unittest.main()
