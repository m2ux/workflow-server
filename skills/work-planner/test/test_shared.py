"""The helpers progress.py shares with board.py, update.py and format.py.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, issue, pr, run, url

sys.path.insert(0, str(SCRIPTS))
from board import Board, cites, status_of  # noqa: E402
from format import cell, description, phrase  # noqa: E402
from update import Unreadable  # noqa: E402


class Cites(unittest.TestCase):
    key = ('o/r', 12)

    def test_url_cites_from_any_repository(self):
        self.assertTrue(cites(pr(1, 'T', body=f"See {url('issues', 12)}", repo='o/s'), self.key))

    def test_owner_repo_number_cites_from_any_repository(self):
        self.assertTrue(cites(pr(1, 'T', body='See o/r#12', repo='o/s'), self.key))

    def test_bare_number_cites_from_the_same_repository(self):
        self.assertTrue(cites(pr(1, 'T', body='Closes #12'), self.key))

    def test_bare_number_from_another_repository_cites_nothing(self):
        self.assertFalse(cites(pr(1, 'T', body='Closes #12', repo='o/s'), self.key))

    def test_another_repositorys_reference_cites_nothing(self):
        self.assertFalse(cites(pr(1, 'T', body='See o/s#12'), self.key))

    def test_longer_number_cites_nothing(self):
        self.assertFalse(cites(pr(1, 'T', body='Closes #120'), self.key))

    def test_repository_whose_name_ends_the_same_cites_nothing(self):
        self.assertFalse(cites(pr(1, 'T', body='See xo/r#12'), self.key))
        self.assertFalse(cites(pr(1, 'T', body='See https://github.com/xo/r/issues/12'), self.key))

    def test_repository_names_match_in_any_case(self):
        self.assertTrue(cites(pr(1, 'T', body='Closes O/R#12', repo='o/s'), self.key))
        self.assertTrue(cites(pr(1, 'T', body='Closes #12', repo='O/R'), self.key))

    def test_pull_request_url_of_another_shape_still_reads(self):
        record = {**pr(1, 'T', body='Closes #12'), 'html_url': 'https://github.com/o/r/pull/1/'}
        self.assertTrue(cites(record, self.key))
        self.assertFalse(cites({**record, 'html_url': 'not a url'}, self.key))


class Cells(unittest.TestCase):
    def test_cell_by_column_name(self):
        self.assertEqual(cell(['Task', 'Depends on'], ['W02', 'W01'], 'Depends on'), 'W01')

    def test_missing_column_or_short_row_is_empty(self):
        self.assertEqual(cell(['Task'], ['W02'], 'Depends on'), '')
        self.assertEqual(cell(['Task', 'Depends on'], ['W02'], 'Depends on'), '')

    def test_phrase_drops_the_criteria(self):
        self.assertEqual(phrase('Loader emits the tree → AC5, AC6'), 'Loader emits the tree')
        done_last = ['Task', 'Description', 'Depends on', 'Join', 'Done']
        self.assertEqual(description('| W01 | Loader emits the tree → AC5 | | | ✓ |', done_last),
                         'Loader emits the tree')
        self.assertEqual(description('| ✓ | W01 | Loader emits the tree → AC5 | | |',
                                     ['Done', 'Task', 'Description', 'Depends on', 'Join']),
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

    def test_update_exits_with_the_message(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, prs = Path(tmp, 'issue.json'), Path(tmp, 'prs.json')
            path.write_text(json.dumps(self.broken))
            prs.write_text('')
            done = run('update.py', str(path), '--prs', str(prs))
        self.assertNotEqual(done.returncode, 0)
        self.assertEqual(done.stderr.strip(), 'Work Breakdown has no table')


if __name__ == '__main__':
    unittest.main()
