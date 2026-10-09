"""deps.py prints pairs that can share a pull request and do not name each other.

Run from the skill directory: python3 -m unittest discover -s test
"""
import io
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from copy import deepcopy
from pathlib import Path

from fixtures import SCRIPTS, epic_body, initiative_body

sys.path.insert(0, str(SCRIPTS))
from deps import check_initiative, eligible_unjoined, epic_dependencies, main  # noqa: E402


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


class TaskCells(unittest.TestCase):
    """A row is the task its Task cell opens with, however many deliveries that id links."""

    SPELLINGS = (
        '## Work Breakdown\n\n'
        '| Task | Description | Coverage | Depends on | Joins | Done |\n'
        '| --- | --- | --- | --- | --- | --- |\n'
        '| [W01](https://example.test/pull/950), [W01](https://example.test/pull/960)'
        ' | Server and corpus | AC1 | | | ✓ |\n'
        '| [W02](https://example.test/pull/970) | One tree | AC2 | W01 | W03 | |\n'
        '| W03 | Not yet open | AC3 | W01 | W02 | |\n'
    )

    def test_every_spelling_names_one_row(self):
        code, text = run([('E06', self.SPELLINGS)])
        self.assertEqual(code, 0)
        self.assertIn('--- problems\nnone', text)
        self.assertIn('0 E06:W01 - Server and corpus', text)
        self.assertIn('1 E06:W02 - One tree', text)
        self.assertIn('1 E06:W03 - Not yet open', text)

    def test_a_dependency_and_a_joins_entry_resolve_to_a_doubly_linked_row(self):
        code, text = run([('E06', self.SPELLINGS)])
        self.assertEqual(code, 0)
        self.assertNotIn('unknown', text)
        self.assertIn('E06:W01 -> E06:W02', text)

    def test_reports_a_cell_whose_links_disagree(self):
        body = (
            '## Work Breakdown\n\n'
            '| Task | Description | Coverage | Depends on | Joins | Done |\n'
            '| --- | --- | --- | --- | --- | --- |\n'
            '| [W01](https://example.test/pull/950), [W02](https://example.test/pull/960)'
            ' | Two ids | AC1 | | | |\n'
        )
        code, text = run([('E06', body)])
        self.assertEqual(code, 1)
        self.assertIn('E06:W01: Task cell also names W02', text)


class InitiativeDependencies(unittest.TestCase):
    def check(self, producer, consumer, gate):
        return run([('I', initiative_body(('E00', ''), ('E01', gate))),
                    ('E00', producer), ('E01', consumer)])

    def test_partial_output_does_not_gate_the_whole_epic(self):
        producer = epic_body(('W01', 'Shared output', ''), ('W02', 'Independent output', ''))
        consumer = epic_body(('W01', 'Consume shared output', 'E00:W01'), ('W02', 'Continue', 'W01'))
        code, text = self.check(producer, consumer, '')
        self.assertEqual(code, 0, text)
        self.assertIn('E00:W01 -> E01:W01 -> E01:W02', text)
        code, text = self.check(producer, consumer, 'E00')
        self.assertEqual(code, 1)
        self.assertIn('overbroad whole-epic dependency E00', text)
        self.assertIn('Depends on should be empty', text)

    def test_every_consumer_requires_every_producer_transitively(self):
        producer = epic_body(('W01', 'Prepare', ''), ('W02', 'Complete output', 'W01'))
        consumer = epic_body(('W01', 'Consume complete output', 'E00:W02'), ('W02', 'Continue', 'W01'))
        code, text = self.check(producer, consumer, 'E00')
        self.assertEqual(code, 0, text)
        code, text = self.check(producer, consumer, '')
        self.assertEqual(code, 1)
        self.assertIn('Depends on should be E00', text)

    def test_only_a_later_task_needs_even_a_single_task_epic(self):
        producer = epic_body(('W01', 'Output', ''))
        consumer = epic_body(('W01', 'Independent start', ''), ('W02', 'Consume', 'E00:W01'))
        code, text = self.check(producer, consumer, '')
        self.assertEqual(code, 0, text)

    def test_whole_epic_task_edge_does_not_gate_an_independent_start(self):
        producer = epic_body(('W01', 'Output', ''), ('W02', 'Other output', ''))
        consumer = epic_body(('W01', 'Independent start', ''), ('W02', 'Consume all', 'E00'))
        code, text = self.check(producer, consumer, '')
        self.assertEqual(code, 0, text)

    def test_reciprocal_join_requires_the_combined_prerequisites(self):
        tasks = {'E00:W01': ('Output', [], []), 'E00:W02': ('Other output', [], []),
                 'E01:W01': ('First half', ['E00:W01'], ['E01:W02']),
                 'E01:W02': ('Second half', ['E00:W02'], ['E01:W01'])}
        self.assertEqual(epic_dependencies(tasks), {'E00': set(), 'E01': {'E00'}})
        tasks['E01:W02'] = ('Separate task', ['E00:W02'], [])
        self.assertEqual(epic_dependencies(tasks), {'E00': set(), 'E01': set()})

    def test_redundant_transitive_whole_epic_gate_is_reported(self):
        bodies = [('I', initiative_body(('E00', ''), ('E01', 'E00'), ('E02', 'E00, E01'))),
                  ('E00', epic_body(('W01', 'Output', ''))),
                  ('E01', epic_body(('W01', 'Consume', 'E00'))),
                  ('E02', epic_body(('W01', 'Finish', 'E01')))]
        code, text = run(bodies)
        self.assertEqual(code, 1)
        self.assertIn('initiative E02: Depends on should be E01', text)
        self.assertNotIn('overbroad', text)

    def test_repeated_checks_preserve_corrected_gates_and_task_edges(self):
        tasks = {'E00:W01': ('Shared output', [], []),
                 'E00:W02': ('Independent output', [], []),
                 'E01:W01': ('Consume shared output', ['E00:W01'], ['E01:W02']),
                 'E01:W02': ('Joined work', [], ['E01:W01'])}
        original = deepcopy(tasks)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'initiative.md'
            body = initiative_body(('E00', ''), ('E01', ''))
            path.write_text(body)
            first = (epic_dependencies(tasks), check_initiative(path, tasks))
            second = (epic_dependencies(tasks), check_initiative(path, tasks))
            self.assertEqual(first, ({'E00': set(), 'E01': set()}, []))
            self.assertEqual(second, first)
            self.assertEqual(tasks, original)
            self.assertEqual(path.read_text(), body)
