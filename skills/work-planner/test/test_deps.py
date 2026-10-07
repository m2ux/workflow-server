"""deps.py prints pairs that can share a pull request and do not name each other.

Run from the skill directory: python3 -m unittest discover -s test
"""
import io
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from fixtures import SCRIPTS, epic_body

sys.path.insert(0, str(SCRIPTS))
from deps import eligible_unjoined, main  # noqa: E402


def run(bodies: list[tuple[str, str]]) -> tuple[int, str]:
    with tempfile.TemporaryDirectory() as directory:
        args = []
        for name, body in bodies:
            path = Path(directory) / f'{name}.md'
            path.write_text(body)
            args.append(f'{name}={path}')
        output = io.StringIO()
        with redirect_stdout(output):
            code = main(args)
    return code, output.getvalue()


class EligibleUnjoined(unittest.TestCase):
    def test_skips_a_dependency_and_a_named_pair(self):
        def ancestors(name):
            return {'E06:W01'} if name == 'E06:W02' else set()

        tasks = {
            'E06:W01': ('a', [], []),
            'E06:W02': ('b', ['E06:W01'], []),
            'E06:W03': ('c', [], ['E06:W04']),
            'E06:W04': ('d', [], ['E06:W03']),
        }
        self.assertEqual(eligible_unjoined(tasks, ancestors), [
            'E06:W01 and E06:W03 can share a pull request and do not name each other',
            'E06:W01 and E06:W04 can share a pull request and do not name each other',
            'E06:W02 and E06:W03 can share a pull request and do not name each other',
            'E06:W02 and E06:W04 can share a pull request and do not name each other',
        ])

    def test_main_prints_the_section(self):
        body = (
            '## Work Breakdown\n\n'
            '| Task | Description | Coverage | Depends on | Joins | Done |\n'
            '| --- | --- | --- | --- | --- | --- |\n'
            '| W01 | One | AC1 | | | |\n'
            '| W02 | Two | AC1 | W01 | | |\n'
            '| W03 | Three | AC1 | | | |\n'
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'epic.md'
            path.write_text(body)
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([f'E06={path}'])
        text = output.getvalue()
        self.assertEqual(code, 0)
        self.assertIn('E06:W01 and E06:W03 can share a pull request and do not name each other', text)
        self.assertIn('E06:W02 and E06:W03 can share a pull request and do not name each other', text)
        self.assertNotIn('E06:W01 and E06:W02', text)


class WholeEpics(unittest.TestCase):
    def test_reports_an_unearned_whole_epic_edge(self):
        upstream = epic_body(
            ('W01', 'Finding roster', ''),
            ('W02', 'Train weights', 'W01'),
            ('W03', 'Publish model', 'W02'),
        )
        dependent = epic_body(('W01', 'Attribute intake', 'E01'))
        code, text = run([('E01', upstream), ('E02', dependent)])
        row = next(line for line in dependent.splitlines() if line.startswith('| W01 |'))
        self.assertEqual(code, 0)
        self.assertNotIn('E01:W03', row)
        self.assertNotIn('Publish model', row)
        self.assertIn(
            'E02:W01 depends on E01 (3 rows), binding E01:W03 level 2, earliest E01:W01 level 0',
            text)
        self.assertNotIn('already implied', text)

    def test_narrowed_edge_is_not_a_whole_epic(self):
        upstream = epic_body(
            ('W01', 'Finding roster', ''),
            ('W02', 'Train weights', 'W01'),
            ('W03', 'Publish model', 'W02'),
        )
        dependent = epic_body(('W01', 'Attribute intake', 'E01:W01'))
        code, text = run([('E01', upstream), ('E02', dependent)])
        self.assertEqual(code, 0)
        self.assertIn('--- whole epics\nnone', text)
        self.assertNotIn('depends on E01 (', text)
        self.assertIn('1 E02:W01', text)
