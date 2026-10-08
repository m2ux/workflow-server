"""The helpers progress.py shares with board.py, sync.py and format.py.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, issue, links as held_links, pr, run

sys.path.insert(0, str(SCRIPTS))
from board import Board, status_of  # noqa: E402
from format import cell, description, phrase  # noqa: E402
from sync import Unreadable, attach_links, links_issue  # noqa: E402


class LinksIssue(unittest.TestCase):
    key = ('o/r', 12)

    def attached(self, *held: dict) -> dict:
        """The pull request, given the issue links the file holds."""
        record = pr(1, 'T')
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'links.json')
            path.write_text(json.dumps(list(held)))
            attach_links([record], str(path))
        return record

    def test_a_linked_issue_reads_as_linked(self):
        self.assertTrue(links_issue(self.attached(held_links(1, 12)), self.key))

    def test_another_repositorys_issue_of_that_number_links_nothing(self):
        self.assertFalse(links_issue(self.attached(held_links(1, 12, issue_repo='o/s')), self.key))

    def test_another_number_links_nothing(self):
        self.assertFalse(links_issue(self.attached(held_links(1, 120)), self.key))

    def test_a_pull_request_the_file_omits_links_nothing(self):
        self.assertFalse(links_issue(self.attached(), self.key))
        self.assertFalse(links_issue(self.attached(held_links(2, 12)), self.key))

    def test_repository_names_match_in_any_case(self):
        self.assertTrue(links_issue(self.attached(held_links(1, 12, repo='O/R', issue_repo='O/R')), self.key))


class Cells(unittest.TestCase):
    def test_cell_by_column_name(self):
        self.assertEqual(cell(['Task', 'Depends on'], ['W02', 'W01'], 'Depends on'), 'W01')

    def test_missing_column_or_short_row_is_empty(self):
        self.assertEqual(cell(['Task'], ['W02'], 'Depends on'), '')
        self.assertEqual(cell(['Task', 'Depends on'], ['W02'], 'Depends on'), '')

    def test_phrase_drops_the_criteria(self):
        self.assertEqual(phrase('Loader emits the tree → AC5, AC6'), 'Loader emits the tree')
        header = ['Task', 'Description', 'Coverage', 'Depends on', 'Joins', 'Done']
        self.assertEqual(description('| W01 | Loader emits the tree | AC5, AC6 | | | ✓ |', header),
                         'Loader emits the tree')
        self.assertEqual(description('| ✓ | W01 | Loader emits the tree | AC5 | | |',
                                     ['Done', 'Task', 'Description', 'Coverage', 'Depends on', 'Joins']),
                         'Loader emits the tree')

    def test_status_of_reads_either_name_shape(self):
        for name in ('Ready', {'raw': 'Ready', 'html': 'Ready'}):
            with self.subTest(name=name):
                self.assertEqual(status_of({'fields': [{'name': 'Status', 'value': {'name': name}}]}), 'Ready')
        self.assertIsNone(status_of({'fields': []}))


class UnreadableTable(unittest.TestCase):
    broken = issue(19, '[I02:E08] Broken: Epic', body='## Work Breakdown\n\nTBD\n')

    def test_board_raises_unreadable(self):
        board = Board({('o/r', 19): self.broken}, [], 'o/r')
        with self.assertRaises(Unreadable):
            board.table(('o/r', 19))

    def test_sync_exits_with_the_message(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, prs, held = Path(tmp, 'issue.json'), Path(tmp, 'prs.json'), Path(tmp, 'links.json')
            path.write_text(json.dumps(self.broken))
            prs.write_text('')
            held.write_text('[]')
            done = run('sync.py', str(path), '--prs', str(prs), '--links', str(held))
        self.assertNotEqual(done.returncode, 0)
        self.assertEqual(done.stderr.strip(), 'Work Breakdown has no table')


if __name__ == '__main__':
    unittest.main()
