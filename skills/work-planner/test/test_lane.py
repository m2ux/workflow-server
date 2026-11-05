"""Lane's raw-cell, assignment, consistency and admission contracts."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, lane_table

sys.path.insert(0, str(SCRIPTS))
from lane import admits, assign_lanes, check_unit, is_index, label, read_lanes


class LaneOperations(unittest.TestCase):
    table = staticmethod(lane_table)

    def test_reader_retains_indices_and_empty_cells_by_row(self):
        body = self.table(('W01', '', ' 02 '), ('[W02](https://example.test/pull/1)', '', ''),
                          ('W03', '', '0'))
        self.assertEqual(read_lanes(body), ({'W01': '02', 'W02': None, 'W03': '0'}, []))

    def test_reader_uses_column_names_and_ignores_non_task_rows(self):
        body = ('| Lane | Task | Description |\n| --- | --- | --- |\n'
                '| 7 | W01 | Work |\n| prose | Notes | Guidance |\n')
        self.assertEqual(read_lanes(body), ({'W01': '7'}, []))

    def test_reader_keeps_lane_data_inside_its_task_table(self):
        body = self.table(('W01', '', '2')) + '\n| Task | Notes |\n| --- | --- |\n| W02 | 9 |\n'
        self.assertEqual(read_lanes(body), ({'W01': '2'}, []))

    def test_reader_reports_malformed_cells_without_an_empty_value(self):
        for lane in ('`2`', '**2**', '[2](https://example.test/lane)', 'lane 2', '2 lanes', '-2', '2.0'):
            with self.subTest(lane=lane):
                lanes, problems = read_lanes(self.table(('W01', '', lane), ('W02', '', '')))
                self.assertEqual(lanes, {'W02': None})
                self.assertEqual(len(problems), 1)
                self.assertIn('W01: Lane must be a bare decimal index or empty', problems[0])
                self.assertIn(repr(lane), problems[0])

    def test_a_missing_cell_is_not_an_empty_lane(self):
        body = self.table() + '| W01 | Work | AC1 | | |\n'
        self.assertEqual(read_lanes(body), ({}, ['W01: missing Lane cell']))

    def test_assignment_preserves_other_content_and_clears_indices(self):
        before = 'Before\n\n' + self.table(('W01', 'W02', '02'), ('W02', 'W01', '02')) + '\nAfter\n'
        after = assign_lanes(before, {'W01': None, 'W02': '0'})
        self.assertEqual(after, before.replace('| 02 |', '|  |', 1).replace('| 02 |', '| 0 |', 1))
        self.assertEqual(read_lanes(after), ({'W01': None, 'W02': '0'}, []))

    def test_assignment_refuses_unknown_or_malformed_rows(self):
        body = self.table(('W01', '', '2'))
        for mapping in ({'W99': '2'}, {'W01': 2}, {'W01': '`2`'}, {'W01': ''}):
            with self.subTest(mapping=mapping), self.assertRaises(ValueError):
                assign_lanes(body, mapping)
        with self.assertRaises(ValueError):
            assign_lanes(self.table(('W010', '', '2')), {'W01': '3'})

    def test_missing_and_mixed_unit_assignments_are_findings(self):
        self.assertEqual(check_unit(['W02', 'W01'], {'W01': '02', 'W02': '02'}), ('02', None))
        self.assertIn('missing Lane data: W02', check_unit(['W02'], {})[1])
        self.assertIn('W01 = 02; W02 = 2', check_unit(['W02', 'W01'], {'W01': '02', 'W02': '2'})[1])
        self.assertEqual(check_unit(['W01'], {'W01': None}), (None, None))

    def test_request_admission_preserves_index_spelling(self):
        for lane, requested, expected in [(None, None, True), (None, '2', True), ('2', None, False),
                                           ('2', '2', True), ('02', '2', False), ('0', '0', True)]:
            self.assertEqual(admits(lane, requested), expected)
        for invalid in ('', 'lane 2', '-2', '٢'):
            self.assertFalse(is_index(invalid))
            with self.assertRaises(ValueError):
                admits(None, invalid)
        self.assertEqual(label('02'), 'lane 02')
        self.assertEqual(label(None), 'unlaned')

    def test_cli_assignment_and_admission(self):
        with tempfile.TemporaryDirectory() as tmp:
            body, mapping, output = [Path(tmp) / name for name in ('body.md', 'map.json', 'out.md')]
            body.write_text(self.table(('W01', 'W02', ''), ('W02', 'W01', '')))
            mapping.write_text(json.dumps({'W01': '02', 'W02': '02'}))
            def run(*args):
                return subprocess.run([sys.executable, str(SCRIPTS / 'lane.py'), *map(str, args)],
                                      capture_output=True, text=True)
            result = run('assign', body, '--map', mapping, '--out', output)
            self.assertEqual(result.returncode, 0, result.stderr)
            for requested, admitted in [('02', True), ('2', False)]:
                result = run('admit', output, '--unit', 'W01,W02', '--lane', requested)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(result.stdout)['admitted'], admitted)
            mapping.write_text('{"W99": "2"}')
            before = output.read_text()
            result = run('assign', body, '--map', mapping, '--out', output)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(output.read_text(), before)

    def test_admission_reports_unrelated_fault_without_rejecting_valid_unit(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'body.md'
            path.write_text(self.table(('W01', '', '`2`'), ('W02', '', '02')))
            result = subprocess.run([sys.executable, str(SCRIPTS / 'lane.py'), 'admit', str(path),
                                     '--unit', 'W02', '--lane', '02'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1, result.stderr)
            report = json.loads(result.stdout)
            self.assertTrue(report['admitted'])
            self.assertIn('W01: Lane must', report['problems'][0])

    def test_writer_accepts_reader_table_forms_and_preserves_line_endings(self):
        for ending in ('\n', '\r\n'):
            body = ending.join(['| Task | Lane', '| --- | ---', '| W01 | 02', ''])
            self.assertEqual(read_lanes(body), ({'W01': '02'}, []))
            updated = assign_lanes(body, {'W01': '0'})
            self.assertEqual(updated, body.replace('W01 | 02', 'W01 | 0 '))
            self.assertEqual(read_lanes(updated), ({'W01': '0'}, []))
