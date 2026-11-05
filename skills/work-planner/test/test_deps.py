"""deps.py checks the task graph and proposes the rows that can share a pull request.

Run from the skill directory: python3 -m unittest discover -s test
"""
import io
import os
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from copy import deepcopy
from pathlib import Path

from fixtures import SCRIPTS, epic_body, initiative_body, lane_table, work_item

sys.path.insert(0, str(SCRIPTS))
from deps import (check_initiative, contention, epic_dependencies, epic_priority,  # noqa: E402
                  is_directory, main, normalise)


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


UNJOINED_EPIC = (
    '## Work Breakdown\n\n'
    '| Task | Description | Coverage | Depends on | Joins | Done |\n'
    '| --- | --- | --- | --- | --- | --- |\n'
    '| W01 | One | AC1 | | | |\n'
    '| W02 | Two | AC1 | W01 | | |\n'
    '| W03 | Three | AC1 | | | |\n'
)

OPEN = 'or name exactly these rows on one record line with why they stay split'


def breakdown(*rows: tuple[str, str, str, str, str]) -> str:
    """An epic body whose Work Breakdown holds rows of (task, coverage, depends on, joins, done)."""
    lines = ['## Work Breakdown', '', '| Task | Description | Coverage | Depends on | Joins | Lane | Done |',
             '| --- | --- | --- | --- | --- | --- | --- |']
    lines += [f'| {task} | Work | {coverage} | {depends} | {joins} | | {done} |'
              for task, coverage, depends, joins, done in rows]
    return '\n'.join(lines + [''])


def joins_section(text: str) -> list[str]:
    """The lines the joins section prints."""
    section = text.split('--- joins: candidate units, rows of one epic extending one component\n')[1]
    return section.split('\n\n')[0].splitlines()


def check(body: str, components: dict[str, str], *records: str) -> tuple[int, str]:
    """Run the check over one epic E06, a work item per component given, and each record."""
    bodies = [('E06', body)] + [(f'E06:{task}', work_item(path)) for task, path in components.items()]
    bodies += [(f'R{index}', record) for index, record in enumerate(records)]
    with tempfile.TemporaryDirectory() as directory:
        args = []
        for name, text in bodies:
            path = Path(directory) / f'{name}.md'
            path.write_text(text)
            args.append(f'{"R" if name.startswith("R") else name}={path}')
        output = io.StringIO()
        with redirect_stdout(output):
            code = main(args)
    return code, output.getvalue()


class TaskLanes(unittest.TestCase):
    """The raw task-table cell supplies each row's lane, including rows without work items."""

    table = staticmethod(lane_table)

    def test_joined_rows_require_lane_data_in_standalone_check(self):
        body = '| Task | Description | Coverage | Depends on | Joins | Done |\n| --- | --- | --- | --- | --- | --- |\n| W01 | One | AC1 | | W02 | |\n| W02 | Two | AC2 | | W01 | |\n'
        code, text = run([('E06', body)])
        self.assertEqual(code, 1, text)
        self.assertIn('missing Lane data: E06:W01, E06:W02', text)

    def test_equal_indexed_joined_rows_pass_without_work_items(self):
        code, text = run([('E06', self.table(('W01', 'W02', '2'), ('W02', 'W01', '2')))])
        self.assertEqual(code, 0, text)
        self.assertIn('--- problems\nnone', text)
        self.assertIn('not checked, no component read: E06:W01, E06:W02', text)

    def test_all_empty_joined_rows_pass(self):
        code, text = run([('E06', self.table(('W01', 'W02', ''), ('W02', 'W01', '')))])
        self.assertEqual(code, 0, text)

    def test_different_indexed_joined_rows_fail_and_name_each_lane(self):
        code, text = run([('E06', self.table(('W01', 'W02', '2'), ('W02', 'W01', '3')))])
        self.assertEqual(code, 1)
        self.assertIn('joined unit has different Lane cells: E06:W01 = 2; E06:W02 = 3', text)
        self.assertIn('move a lane or unjoin the rows', text)

    def test_indexed_and_empty_joined_rows_fail_and_name_each_lane(self):
        code, text = run([('E06', self.table(('W01', 'W02', '2'), ('W02', 'W01', '')))])
        self.assertEqual(code, 1)
        self.assertIn('E06:W01 = 2; E06:W02 = empty', text)

    def test_transitive_join_names_every_member_once(self):
        code, text = run([('E06', self.table(('W01', 'W02', '2'), ('W02', 'W01, W03', '2'),
                                           ('W03', 'W02', '3')))])
        self.assertEqual(code, 1)
        self.assertIn('E06:W01 = 2; E06:W02 = 2; E06:W03 = 3', text)
        self.assertEqual(text.count('joined unit has different Lane cells'), 1)

    def test_joined_rows_in_different_epics_compare_their_table_lanes(self):
        code, text = run([('E05', self.table(('W01', 'E06:W01', '2'), ('W02', '', ''))),
                          ('E06', self.table(('W01', 'E05:W01', '3'), ('W02', '', '')))])
        self.assertEqual(code, 1)
        self.assertIn('E05:W01 = 2; E06:W01 = 3', text)

    def test_a_malformed_joined_cell_is_reported_without_a_fake_empty_lane(self):
        code, text = run([('E06', self.table(('W01', 'W02', '2'), ('W02', 'W01', '`2`')))])
        self.assertEqual(code, 1)
        self.assertIn('E06:W02: Lane must be a bare decimal index or empty', text)
        self.assertNotIn('joined unit has different Lane cells', text)

    def test_independent_rows_can_have_different_lanes(self):
        code, text = run([('E06', self.table(('W01', '', '2'), ('W02', '', '3'), ('W03', '', '')))])
        self.assertEqual(code, 0, text)

    def test_a_malformed_lane_fails_even_without_joins_or_work_item_links(self):
        for lane in ('`2`', '[2](https://example.test/lane)', 'lane 2', '2 lanes'):
            with self.subTest(lane=lane):
                code, text = run([('E06', self.table(('W01', '', lane)))])
                self.assertEqual(code, 1)
                self.assertIn('E06:W01: Lane must be a bare decimal index or empty', text)

    def test_work_item_lane_prose_supplies_no_lane_data(self):
        body = self.table(('W01', 'W02', ''), ('W02', 'W01', ''))
        code, text = run([('E06', body),
                          ('E06:W01', work_item('a.py') + '**Lane:** 2\n'),
                          ('E06:W02', work_item('b.py') + '**Lane:** 3\n')])
        self.assertEqual(code, 0, text)
        self.assertNotIn('not checked, no component read', text)


class JoinedEpicScope(unittest.TestCase):
    """The CLI refuses joins outside one epic before deriving epic priorities."""

    @staticmethod
    def cli(*bodies: tuple[str, str]) -> subprocess.CompletedProcess:
        with tempfile.TemporaryDirectory() as directory:
            args = []
            for name, body in bodies:
                path = Path(directory) / f'{name}.md'
                path.write_text(body)
                args.append(f'{name}={path}')
            return subprocess.run([sys.executable, str(SCRIPTS / 'deps.py'), *args],
                                  capture_output=True, text=True, timeout=10)

    def test_pinned_reciprocal_cross_epic_joins_exit_before_priorities(self):
        result = self.cli(('E05', breakdown(('W01', 'AC1', '', 'E06:W01', ''))),
                          ('E06', breakdown(('W01', 'AC1', '', 'E05:W01', ''))))
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('E05:W01: Joins names E06:W01 outside its epic', result.stdout)
        self.assertIn('E06:W01: Joins names E05:W01 outside its epic', result.stdout)
        self.assertNotIn('--- epic priority', result.stdout)
        self.assertEqual(result.stderr, '')

    def test_cross_epic_joins_with_initiative_skip_whole_epic_derivation(self):
        initiative = ('| Epic | Description | Depends on | Done |\n'
                      '| --- | --- | --- | --- |\n| E05 | One | | |\n| E06 | Two | | |\n')
        result = self.cli(('I', initiative),
                          ('E05', breakdown(('W01', 'AC1', '', 'E06:W01', ''))),
                          ('E06', breakdown(('W01', 'AC1', '', 'E05:W01', ''))))
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('outside its epic', result.stdout)
        self.assertNotIn('--- epic priority', result.stdout)
        self.assertNotIn('initiative E05:', result.stdout)
        self.assertEqual(result.stderr, '')

    def test_one_way_cross_epic_join_names_owner_and_target(self):
        result = self.cli(('E05', breakdown(('W01', 'AC1', '', 'E06:W01', ''))),
                          ('E06', breakdown(('W01', 'AC2', '', '', ''))))
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('E05:W01: Joins names E06:W01 outside its epic', result.stdout)
        self.assertNotIn('--- epic priority', result.stdout)
        self.assertEqual(result.stderr, '')

    def test_unknown_cross_epic_join_retains_unknown_row_diagnostic(self):
        result = self.cli(('E05', breakdown(('W01', 'AC1', '', 'E06:W01', ''))))
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('E05:W01: Joins names E06:W01 outside its epic', result.stdout)
        self.assertIn('E05:W01: Joins names unknown task E06:W01', result.stdout)
        self.assertEqual(result.stderr, '')

    def test_same_epic_qualified_and_local_joins_keep_priority_output(self):
        for left, right in [('W02', 'W01'), ('E05:W02', 'E05:W01')]:
            with self.subTest(left=left, right=right):
                result = self.cli(('E05', breakdown(('W01', 'AC1', '', left, ''),
                                                    ('W02', 'AC2', '', right, ''))))
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn('--- problems\nnone', result.stdout)
                self.assertIn('--- epic priority', result.stdout)
                self.assertEqual(result.stderr, '')

    def test_same_epic_lane_and_dependency_diagnostics_remain(self):
        body = TaskLanes.table(('W01', 'W02', '2'), ('W02', 'W01', '3'))
        body = body.replace('| W02 | Work | AC1 | | W01', '| W02 | Work | AC1 | W09 | W01')
        result = self.cli(('E05', body))
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('joined unit has different Lane cells', result.stdout)
        self.assertIn('E05:W02: cannot resolve E05:W09', result.stdout)
        self.assertIn('--- epic priority', result.stdout)
        self.assertEqual(result.stderr, '')


class CandidateUnits(unittest.TestCase):
    """Rows of one epic declaring one component are proposed as one unit."""

    SPECIMEN = breakdown(('W01', 'AC1', '', '', ''), ('W02', 'AC2', 'W01', '', ''),
                         ('W03', 'AC3', '', '', ''), ('W04', 'AC4', '', '', ''),
                         ('W05', 'AC5', '', '', ''), ('W06', 'AC6', '', '', ''))
    COMPONENTS = {'W01': 'a.py', 'W02': 'a.py', 'W03': 'b.py', 'W04': 'b.py',
                  'W05': 'c.py', 'W06': 'd.py'}

    def test_rows_declaring_one_component_are_a_candidate_with_the_edge_to_drop(self):
        code, text = check(self.SPECIMEN, self.COMPONENTS)
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), [
            'E06:W01, E06:W02 extend a.py: name each other in Joins, dropping the dependency of '
            f'E06:W02 on E06:W01, {OPEN}',
            f'E06:W03, E06:W04 extend b.py: name each other in Joins {OPEN}',
        ])

    def test_independent_rows_declaring_different_components_draw_no_finding(self):
        code, text = check(breakdown(('W05', 'AC5', '', '', ''), ('W06', 'AC6', '', '', '')),
                           {'W05': 'c.py', 'W06': 'd.py'})
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), ['none'])

    def test_a_joined_candidate_leaves_the_section(self):
        code, text = check(breakdown(('W01', 'AC1', '', 'W02', ''), ('W02', 'AC2', '', 'W01', '')),
                           {'W01': 'a.py', 'W02': 'a.py'})
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), ['none'])

    def test_a_delivered_row_joins_no_candidate(self):
        code, text = check(breakdown(('W01', '', '', '', '✓'), ('W02', 'AC2', '', '', '')),
                           {'W01': 'a.py', 'W02': 'a.py'})
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), ['none'])

    def test_a_path_through_a_row_outside_splits_by_rule(self):
        code, text = check(breakdown(('W01', 'AC1', '', '', ''), ('W02', 'AC2', 'W01', '', ''),
                                     ('W03', 'AC3', 'W02', '', '')),
                           {'W01': 'a.py', 'W02': 'b.py', 'W03': 'a.py'})
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), [
            'E06:W01, E06:W03 extend a.py: split by rule, E06:W03 needs E06:W02, which needs E06:W01'])

    def test_a_joined_row_needing_another_through_a_row_outside_their_unit_is_a_problem(self):
        code, text = check(breakdown(('W01', 'AC1', '', 'W03', ''), ('W02', 'AC2', 'W01', '', ''),
                                     ('W03', 'AC3', 'W02', 'W01', '')), {})
        self.assertEqual(code, 1)
        self.assertIn('E06:W03: joins E06:W01, but needs E06:W02, which needs E06:W01', text)


class UnitAccounting(unittest.TestCase):
    """A candidate left split is answered by one record line, and a unit holds six criteria."""

    SPLIT = breakdown(('W01', 'AC1', '', '', ''), ('W02', 'AC2', '', '', ''), ('W03', 'AC3', '', '', ''))
    COMPONENTS = {'W01': 'a.py', 'W02': 'a.py', 'W03': 'a.py'}

    def test_one_line_naming_the_candidate_rows_accounts_for_it(self):
        code, text = check(self.SPLIT, self.COMPONENTS,
                           '- **E06:W01, E06:W02, E06:W03.** Split: each lands a separate release.\n')
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), ['none'])

    def test_a_line_naming_only_some_of_its_rows_accounts_for_none(self):
        code, text = check(self.SPLIT, self.COMPONENTS, '- **E06:W01 and E06:W02.** Split.\n')
        self.assertEqual(joins_section(text), [
            f'E06:W01, E06:W02, E06:W03 extend a.py: name each other in Joins {OPEN}'])

    def test_a_line_naming_rows_besides_accounts_for_none(self):
        code, text = check(self.SPLIT, self.COMPONENTS,
                           '- E06:W01, E06:W02, E06:W03 and E06:W04 are separate.\n')
        self.assertEqual(len(joins_section(text)), 1)

    def test_a_seven_criterion_candidate_is_split_by_rule(self):
        code, text = check(breakdown(('W01', 'AC1, AC2, AC3', '', '', ''),
                                     ('W02', 'AC4, AC5, AC6', '', '', ''), ('W03', 'AC7', '', '', '')),
                           self.COMPONENTS)
        self.assertEqual(code, 0, text)
        self.assertEqual(joins_section(text), [
            'E06:W01, E06:W02, E06:W03 extend a.py: split by rule, 7 criteria exceed the bound of 6'])

    def test_a_six_criterion_candidate_is_open(self):
        code, text = check(breakdown(('W01', 'AC1, AC2, AC3', '', '', ''),
                                     ('W02', 'AC4, AC5, AC6', '', '', '')), {'W01': 'a.py', 'W02': 'a.py'})
        self.assertEqual(joins_section(text), [f'E06:W01, E06:W02 extend a.py: name each other in Joins {OPEN}'])

    def test_a_joined_unit_over_the_bound_is_a_problem(self):
        code, text = check(breakdown(('W01', 'AC1, AC2, AC3, AC4', '', 'W02', ''),
                                     ('W02', 'AC5, AC6, AC7', '', 'W01', '')), {})
        self.assertEqual(code, 1)
        self.assertIn('E06:W01, E06:W02: joined unit covers 7 criteria, more than the bound of 6', text)

    def test_a_lone_row_over_the_bound_joins_nothing(self):
        code, text = check(breakdown(('W01', 'AC1, AC2, AC3, AC4, AC5, AC6, AC7', '', '', '')), {})
        self.assertEqual(code, 0, text)
        self.assertNotIn('joined unit', text)


class DirectoryComponents(unittest.TestCase):
    """A component is one file, so a work item declaring a directory is a problem."""

    BODY = breakdown(('W01', 'AC1', '', '', ''), ('W02', 'AC2', '', '', ''))

    def test_a_component_ending_in_a_slash_is_a_problem(self):
        code, text = check(self.BODY, {'W01': 'workspace:skills/scripts/', 'W02': 'workspace:skills/a.py'})
        self.assertEqual(code, 1)
        self.assertIn('E06:W01: work item declares directory workspace:skills/scripts/; '
                      'a component is one file', text)
        self.assertIn('not checked, no component read: E06:W01', text)

    def test_a_component_carrying_a_glob_is_a_problem(self):
        code, text = check(self.BODY, {'W01': 'workspace:skills/**', 'W02': 'workspace:skills/a.py'})
        self.assertEqual(code, 1)
        self.assertIn('E06:W01: work item declares directory workspace:skills/**', text)

    def test_a_component_naming_a_directory_in_the_checkout_is_a_problem(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory) / 'skills' / 'scripts').mkdir(parents=True)
            (Path(directory) / 'skills' / 'scripts' / 'a.py').write_text('')
            here = Path.cwd()
            os.chdir(directory)
            try:
                self.assertTrue(is_directory('workspace:skills/scripts'))
                self.assertFalse(is_directory('workspace:skills/scripts/a.py'))
                self.assertFalse(is_directory('workspace:config/branches'))
            finally:
                os.chdir(here)


class RecordFiles(unittest.TestCase):
    """A planning-record file the check cannot read."""

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
        '| Task | Description | Coverage | Depends on | Joins | Lane | Done |\n'
        '| --- | --- | --- | --- | --- | --- | --- |\n'
        '| [W01](https://example.test/pull/950), [W01](https://example.test/pull/960)'
        ' | Server and corpus | AC1 | | | | ✓ |\n'
        '| [W02](https://example.test/pull/970) | One tree | AC2 | W01 | W03 | | |\n'
        '| W03 | Not yet open | AC3 | W01 | W02 | | |\n'
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
