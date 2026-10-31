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

from fixtures import SCRIPTS, epic_body, initiative_body, work_item

sys.path.insert(0, str(SCRIPTS))
from deps import (check_initiative, contention, eligible_unjoined, epic_dependencies,  # noqa: E402
                  epic_priority, main, normalise)


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


RESOLUTIONS = 'can share a pull request: name each other in Joins, or account for the pair in the planning record'

UNJOINED_EPIC = (
    '## Work Breakdown\n\n'
    '| Task | Description | Coverage | Depends on | Joins | Done |\n'
    '| --- | --- | --- | --- | --- | --- |\n'
    '| W01 | One | AC1 | | | |\n'
    '| W02 | Two | AC1 | W01 | | |\n'
    '| W03 | Three | AC1 | | | |\n'
)


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
            f'E06:W01 and E06:W03 {RESOLUTIONS}',
            f'E06:W01 and E06:W04 {RESOLUTIONS}',
            f'E06:W02 and E06:W03 {RESOLUTIONS}',
            f'E06:W02 and E06:W04 {RESOLUTIONS}',
        ])

    def test_main_prints_the_section(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'epic.md'
            path.write_text(UNJOINED_EPIC)
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([f'E06={path}'])
        text = output.getvalue()
        self.assertEqual(code, 0)
        self.assertIn(f'E06:W01 and E06:W03 {RESOLUTIONS}', text)
        self.assertIn(f'E06:W02 and E06:W03 {RESOLUTIONS}', text)
        self.assertNotIn('E06:W01 and E06:W02', text)


class UnresolvableEntries(unittest.TestCase):
    """The verdict the dependency check gives an entry that cannot resolve."""

    def test_an_entry_naming_no_row_and_linking_no_issue_cannot_resolve(self):
        code, text = run([('E06', epic_body(('W01', 'One', ''), ('W02', 'Two', 'E05 (W04)')))])
        self.assertEqual(code, 1)
        self.assertIn("E06:W02: cannot resolve E05 (W04): it names no row and links no issue", text)

    def test_a_row_no_epic_given_carries_cannot_resolve(self):
        code, text = run([('E06', epic_body(('W01', 'One', ''), ('W02', 'Two', 'W07')))])
        self.assertEqual(code, 1)
        self.assertIn('E06:W02: cannot resolve E06:W07: no epic given carries that row', text)


class RecordedPairs(unittest.TestCase):
    """The planning-record entry an empty Joins cell rests on."""

    def check(self, record: str | None):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'epic.md'
            path.write_text(UNJOINED_EPIC)
            args = [f'E06={path}']
            if record is not None:
                joins = Path(directory) / 'joins.md'
                joins.write_text(record)
                args.append(f'R={joins}')
            output = io.StringIO()
            with redirect_stdout(output):
                code = main(args)
        return code, output.getvalue()

    def test_a_recorded_pair_leaves_the_section(self):
        _, text = self.check('- **E06:W01 and E06:W03.** Each row changes its own file.\n')
        self.assertNotIn('E06:W01 and E06:W03', text)
        self.assertIn(f'E06:W02 and E06:W03 {RESOLUTIONS}', text)

    def test_a_pair_in_neither_joins_nor_the_record_is_reported(self):
        _, text = self.check('- **E06:W01 and E06:W03.** Each row changes its own file.\n')
        self.assertIn(f'E06:W02 and E06:W03 {RESOLUTIONS}', text)

    def test_a_line_naming_more_than_a_pair_accounts_for_none(self):
        _, text = self.check('- Rows in this unit: E06:W01, E06:W02 and E06:W03.\n')
        self.assertIn(f'E06:W01 and E06:W03 {RESOLUTIONS}', text)
        self.assertIn(f'E06:W02 and E06:W03 {RESOLUTIONS}', text)

    def test_a_record_that_is_not_text_is_a_problem(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'epic.md'
            path.write_text(UNJOINED_EPIC)
            joins = Path(directory) / 'joins.md'
            joins.write_bytes(b'\xff\xfe E06:W01 and E06:W03')
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([f'E06={path}', f'R={joins}'])
        self.assertEqual(code, 1)
        self.assertIn('joins.md is unreadable', output.getvalue())

    def test_a_record_that_cannot_be_read_is_a_problem(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'epic.md'
            path.write_text(UNJOINED_EPIC)
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([f'E06={path}', f'R={Path(directory) / "absent.md"}'])
        self.assertEqual(code, 1)
        self.assertIn('absent.md is unreadable', output.getvalue())


class EpicNamedInATaskRow(unittest.TestCase):
    CHAIN = (('W01', 'Finding roster', ''), ('W02', 'Train weights', 'W01'),
             ('W03', 'Publish model', 'W02'))

    def test_a_task_row_naming_an_epic_is_a_problem(self):
        code, text = run([('E01', epic_body(*self.CHAIN)),
                          ('E02', epic_body(('W01', 'Attribute intake', 'E01')))])
        self.assertEqual(code, 1)
        self.assertIn('E02:W01: names epic E01; a task row names the rows it consumes', text)

    def test_the_producing_row_is_the_edge(self):
        code, text = run([('E01', epic_body(*self.CHAIN)),
                          ('E02', epic_body(('W01', 'Attribute intake', 'E01:W01')))])
        self.assertEqual(code, 0, text)
        self.assertIn('1 E02:W01', text)

    def test_a_prerequisite_chain_is_named_by_its_last_row(self):
        code, text = run([('I', initiative_body(('E00', ''), ('E01', 'E00'))),
                          ('E00', epic_body(*self.CHAIN)),
                          ('E01', epic_body(('W01', 'Consume the model', 'E00:W03')))])
        self.assertEqual(code, 0, text)

    def test_naming_a_row_its_sibling_implies_is_a_problem(self):
        code, text = run([('E00', epic_body(*self.CHAIN)),
                          ('E01', epic_body(('W01', 'Consume', 'E00:W01, E00:W03')))])
        self.assertEqual(code, 1)
        self.assertIn('E01:W01: E00:W01 is already implied by E00:W03', text)

    def test_the_named_epic_still_reaches_the_rows_it_stands_for(self):
        """A body carrying the retired form is reported once, not told to drop a correct gate."""
        code, text = run([('I', initiative_body(('E00', ''), ('E01', 'E00'))),
                          ('E00', epic_body(('W01', 'Output', ''))),
                          ('E01', epic_body(('W01', 'Consume all', 'E00')))])
        self.assertEqual(code, 1)
        self.assertIn('E01:W01: names epic E00; a task row names the rows it consumes', text)
        self.assertNotIn('Depends on should be empty', text)
        self.assertNotIn('overbroad', text)

    def test_naming_every_row_still_derives_the_initiative_edge(self):
        code, text = run([('I', initiative_body(('E00', ''), ('E01', 'E00'))),
                          ('E00', epic_body(('W01', 'Roster', ''), ('W02', 'Weights', ''))),
                          ('E01', epic_body(('W01', 'Consume both', 'E00:W01, E00:W02')))])
        self.assertEqual(code, 0, text)


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


class MalformedTaskIds(unittest.TestCase):
    """A task id is a W and two digits, and one that departs from it is named."""

    @staticmethod
    def table(*rows: str) -> str:
        return (
            '## Work Breakdown\n\n'
            '| Task | Description | Coverage | Depends on | Joins | Done |\n'
            '| --- | --- | --- | --- | --- | --- |\n'
            + ''.join(rows)
        )

    def test_a_malformed_head_is_named_and_yields_no_row(self):
        code, text = run([('E06', self.table(
            '| W010 | Too many digits | AC1 | | | |\n',
            '| W02 | Sound | AC2 | | | |\n',
        ))])
        self.assertEqual(code, 1)
        self.assertIn('E06: Task cell names malformed task id W010', text)
        self.assertNotIn('E06:W01 ', text)
        self.assertIn('0 E06:W02 - Sound', text)

    def test_a_short_head_is_named_rather_than_skipped(self):
        code, text = run([('E06', self.table('| W1 | Too few digits | AC1 | | | |\n'))])
        self.assertEqual(code, 1)
        self.assertIn('E06: Task cell names malformed task id W1', text)

    def test_a_malformed_later_id_is_named_and_keeps_its_row(self):
        code, text = run([('E06', self.table(
            '| [W01](https://example.test/pull/950), [W012](https://example.test/pull/960)'
            ' | Mistyped second link | AC1 | | | |\n',
        ))])
        self.assertEqual(code, 1)
        self.assertIn('E06: Task cell names malformed task id W012', text)
        self.assertNotIn('also names', text)
        self.assertIn('0 E06:W01 - Mistyped second link', text)

    def test_a_prose_cell_is_skipped_in_silence(self):
        code, text = run([('E06', self.table(
            '| Notes | A prose row | | | | |\n',
            '| W01 | Sound | AC1 | | | |\n',
        ))])
        self.assertEqual(code, 0)
        self.assertIn('--- problems\nnone', text)
        self.assertIn('0 E06:W01 - Sound', text)
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

    def test_every_producing_row_named_does_not_gate_an_independent_start(self):
        producer = epic_body(('W01', 'Output', ''), ('W02', 'Other output', ''))
        consumer = epic_body(('W01', 'Independent start', ''),
                             ('W02', 'Consume all', 'E00:W01, E00:W02'))
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
                  ('E01', epic_body(('W01', 'Consume', 'E00:W01'))),
                  ('E02', epic_body(('W01', 'Finish', 'E01:W01')))]
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


class ComponentContention(unittest.TestCase):
    BUNDLE = 'src/bundle/assembly.ts'

    def test_rows_of_different_epics_extending_one_component_are_paired(self):
        components = {'E08:W01': self.BUNDLE, 'E09:W01': self.BUNDLE, 'E09:W02': 'src/bundle/emit.ts'}
        self.assertEqual(contention(components), [('E08:W01', 'E09:W01')])

    def test_rows_of_one_epic_do_not_contend(self):
        components = {'E08:W01': self.BUNDLE, 'E08:W02': self.BUNDLE}
        self.assertEqual(contention(components), [])

    def test_the_contending_pair_is_printed(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E09', epic_body(('W01', 'Extend assembly again', ''))),
                          ('E08:W01', work_item(self.BUNDLE)),
                          ('E09:W01', work_item(self.BUNDLE))])
        self.assertEqual(code, 0, text)
        self.assertIn('E08:W01 and E09:W01 both extend src/bundle/assembly.ts', text)

    def test_the_epics_of_a_contending_pair_are_separated_by_a_number(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E09', epic_body(('W01', 'Extend assembly again', ''))),
                          ('E08:W01', work_item(self.BUNDLE)),
                          ('E09:W01', work_item(self.BUNDLE))])
        self.assertEqual(code, 0, text)
        self.assertIn('--- epic priority (epics sharing a number start together)\n2 E08\n1 E09', text)

    def test_epics_declaring_different_components_share_a_number(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E09', epic_body(('W01', 'Extend emit', ''))),
                          ('E08:W01', work_item(self.BUNDLE)),
                          ('E09:W01', work_item('src/bundle/emit.ts'))])
        self.assertEqual(code, 0, text)
        self.assertIn('--- component contention: rows of different epics extending one component\nnone',
                      text)
        self.assertIn('--- epic priority (epics sharing a number start together)\n1 E08\n1 E09', text)

    def test_one_path_spelt_two_ways_is_one_component(self):
        self.assertEqual(normalise('`src/a.ts`.'), 'src/a.ts')
        self.assertEqual(normalise('./src/a.ts'), 'src/a.ts')
        self.assertEqual(normalise('[src/a.ts](https://example.test/a)'), 'src/a.ts')
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E09', epic_body(('W01', 'Extend assembly again', ''))),
                          ('E08:W01', '**Component:** `src/a.ts`.\n'),
                          ('E09:W01', '**Component:** ./src/a.ts\n')])
        self.assertEqual(code, 0, text)
        self.assertIn('E08:W01 and E09:W01 both extend src/a.ts', text)

    def test_an_unreadable_work_item_is_a_problem(self):
        with tempfile.TemporaryDirectory() as directory:
            epic = Path(directory) / 'E08.md'
            epic.write_text(epic_body(('W01', 'Extend assembly', '')))
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([f'E08={epic}', f'E08:W01={directory}/gone/w01.md'])
        text = output.getvalue()
        self.assertEqual(code, 1)
        self.assertIn('E08:W01: work item', text)
        self.assertIn('is unreadable', text)
        self.assertIn('--- epic priority', text)

    def test_a_row_with_no_work_item_is_named_as_unchecked(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''), ('W02', 'Emit', 'W01'))),
                          ('E08:W01', work_item(self.BUNDLE))])
        self.assertEqual(code, 0, text)
        self.assertIn('not checked, no component read: E08:W02', text)

    def test_a_complete_set_of_work_items_names_nothing_as_unchecked(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E08:W01', work_item(self.BUNDLE))])
        self.assertEqual(code, 0, text)
        self.assertNotIn('not checked', text)

    def test_a_work_item_declaring_no_component_is_a_problem(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E08:W01', '## Overview\n\nWhat the task delivers.\n')])
        self.assertEqual(code, 1)
        self.assertIn('E08:W01: work item declares no component', text)
        self.assertIn('not checked, no component read: E08:W01', text)

    def test_a_work_item_still_carrying_the_placeholder_declares_none(self):
        placeholder = '**Component:** {{The one component this task implementation extends}}\n'
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E09', epic_body(('W01', 'Extend assembly again', ''))),
                          ('E08:W01', placeholder), ('E09:W01', placeholder)])
        self.assertEqual(code, 1)
        self.assertIn('E08:W01: work item declares no component', text)
        self.assertIn('E09:W01: work item declares no component', text)
        self.assertIn('--- component contention: rows of different epics extending one component\nnone',
                      text)
        self.assertIn('--- epic priority (epics sharing a number start together)\n1 E08\n1 E09', text)

    def test_a_work_item_naming_no_row_is_a_problem(self):
        code, text = run([('E08', epic_body(('W01', 'Extend assembly', ''))),
                          ('E08:W02', work_item(self.BUNDLE))])
        self.assertEqual(code, 1)
        self.assertIn('E08:W02: work item names no row in the epics given', text)


class EpicPriority(unittest.TestCase):
    def test_epics_with_no_prerequisite_epic_share_the_largest_number(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Other output', [], [])}
        self.assertEqual(epic_priority(tasks), {'E00': 1, 'E01': 1})

    def test_each_prerequisite_epic_takes_a_larger_number_than_its_dependant(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Consume', ['E00:W01'], []),
                 'E02:W01': ('Finish', ['E01:W01'], [])}
        self.assertEqual(epic_priority(tasks), {'E00': 3, 'E01': 2, 'E02': 1})

    def test_an_epic_with_no_tasks_carries_the_largest_number(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Consume', ['E00:W01'], [])}
        self.assertEqual(epic_priority(tasks, ('E00', 'E01', 'E02')), {'E00': 2, 'E01': 1, 'E02': 2})

    def test_a_contending_pair_does_not_share_a_number(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Other output', [], []),
                 'E02:W01': ('Consume', ['E01:W01'], [])}
        self.assertEqual(epic_priority(tasks), {'E00': 2, 'E01': 2, 'E02': 1})
        self.assertEqual(epic_priority(tasks, (), {('E00', 'E01')}),
                         {'E00': 3, 'E01': 2, 'E02': 1})

    def test_a_pair_a_prerequisite_already_separates_keeps_its_numbers(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Consume', ['E00:W01'], [])}
        self.assertEqual(epic_priority(tasks, (), {('E00', 'E01')}), {'E00': 2, 'E01': 1})

    def test_three_contending_epics_take_three_numbers(self):
        tasks = {'E00:W01': ('Output', [], []), 'E01:W01': ('Other', [], []),
                 'E02:W01': ('Another', [], [])}
        contending = {('E00', 'E01'), ('E00', 'E02'), ('E01', 'E02')}
        self.assertEqual(epic_priority(tasks, (), contending), {'E00': 3, 'E01': 2, 'E02': 1})

    def test_the_proposed_priority_is_printed_for_each_epic(self):
        code, text = run([('E00', epic_body(('W01', 'Output', ''))),
                          ('E01', epic_body(('W01', 'Consume', 'E00:W01')))])
        self.assertEqual(code, 0, text)
        self.assertIn('--- epic priority (epics sharing a number start together)\n2 E00\n1 E01', text)
