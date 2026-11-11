"""The helpers progress.py shares with board.py, sync.py and format.py, the title tags board.py owns,
the completion and issue identity it reaches through sync.py, and the title-tag, pull-request home and
epic pull-request title patterns every script reaches through their one definition in sync.py.
"""
import ast
import importlib.util
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, issue, links as held_links, pr, run

sys.path.insert(0, str(SCRIPTS))
import board  # noqa: E402
import sync  # noqa: E402
from board import Board, is_initiative, tags  # noqa: E402
from statuses import status_of  # noqa: E402
from format import cell, description, phrase  # noqa: E402
from sync import Unreadable, attach_links, issue_done, issue_key, links_issue  # noqa: E402


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


class TitleTags(unittest.TestCase):
    def test_each_level_reads_its_numbers(self):
        for title, parsed in (('[I17] Separation: Skills split', ('17', '', '')),
                              ('[I17:E02] Skill Separation', ('17', '02', '')),
                              ('[I17:E02:W17] Board script owns title tag parsing', ('17', '02', '17'))):
            with self.subTest(title=title):
                self.assertEqual(tags(title), parsed)

    def test_a_hotfix_or_plain_title_has_no_tags(self):
        for title in ('[F03] Reject bad keys', 'Reject bad keys', '', 'Fix [I17:E02] later'):
            with self.subTest(title=title):
                self.assertIsNone(tags(title))

    def test_only_an_initiative_tag_names_an_initiative(self):
        self.assertTrue(is_initiative(issue(1, '[I17] Separation')))
        for title in ('[I17:E02] Skill Separation', '[I17:E02:W17] Board', '[F03] Fix', 'Plain'):
            with self.subTest(title=title):
                self.assertFalse(is_initiative(issue(1, title)))

    def test_the_queue_reaches_the_initiative_test_board_owns(self):
        queue = loaded(SCRIPTS / 'board-queue.py')
        self.assertIs(queue.is_initiative, board.is_initiative)
        self.assertFalse(queue.is_initiative(issue(1, '[I01:W02] Malformed')))


class CompletionAndIdentity(unittest.TestCase):
    def test_board_reaches_the_single_implementations_in_sync(self):
        self.assertIs(board.issue_done, sync.issue_done)
        self.assertIs(board.issue_key, sync.issue_key)
        for copy in ('completed', 'key_of'):
            with self.subTest(copy=copy):
                self.assertFalse(hasattr(board, copy))

    def test_only_closed_as_completed_is_done(self):
        self.assertTrue(issue_done(issue(1, 'T', state='closed')))
        self.assertFalse(issue_done(issue(1, 'T')))
        self.assertFalse(issue_done({**issue(1, 'T', state='closed'), 'state_reason': 'not_planned'}))

    def test_identity_is_repository_and_number(self):
        self.assertEqual(issue_key(issue(12, 'T', repo='o/s')), ('o/s', 12))
        self.assertNotEqual(issue_key(issue(12, 'T', repo='o/s')), issue_key(issue(12, 'T')))


def literals(path: Path) -> set[str]:
    """Every string constant the script's source holds."""
    return {node.value for node in ast.walk(ast.parse(path.read_text()))
            if isinstance(node, ast.Constant) and isinstance(node.value, str)}


def loaded(path: Path):
    """The script loaded as a module under a name of its own."""
    spec = importlib.util.spec_from_file_location('shared_' + path.stem.replace('-', '_'), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class SharedPatterns(unittest.TestCase):
    patterns = {'title tag': sync.PREFIX, 'pull-request home': sync.PULL_REF, 'epic pull-request title': sync.PR_REF}

    def test_each_pattern_is_written_in_one_script(self):
        for name, pattern in self.patterns.items():
            with self.subTest(pattern=name):
                homes = [p.name for p in sorted(SCRIPTS.glob('*.py')) if pattern.pattern in literals(p)]
                self.assertEqual(homes, ['sync.py'])

    def test_every_script_matching_a_pattern_holds_its_definition(self):
        for path in sorted(SCRIPTS.glob('*.py')):
            held = [value for value in vars(loaded(path)).values() if isinstance(value, re.Pattern)]
            for name, pattern in self.patterns.items():
                with self.subTest(script=path.name, pattern=name):
                    self.assertTrue(all(value is pattern for value in held if value.pattern == pattern.pattern))

    def test_tag_parsing_and_pull_request_homes_import_the_definitions(self):
        self.assertIs(board.PREFIX, sync.PREFIX)
        for script, name in (('progress.py', 'PREFIX'), ('progress.py', 'PULL_REF'), ('board-queue.py', 'PULL_REF'),
                             ('deliver.py', 'PR_REF'), ('renumber.py', 'PR_REF')):
            with self.subTest(script=script, name=name):
                self.assertIs(getattr(loaded(SCRIPTS / script), name), getattr(sync, name))


if __name__ == '__main__':
    unittest.main()
