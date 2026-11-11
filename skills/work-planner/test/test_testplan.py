"""testplan.py: the rows of a Test Plan section, whether the plan has passed, and the criteria it claims, as Test Plan states them.
"""
import sys
import unittest

from fixtures import SCRIPTS

sys.path.insert(0, str(SCRIPTS))
from testplan import Row, claims, passed, rows  # noqa: E402

EVIDENCE = 'https://github.com/o/r/blob/engineering/record.md#t1'


def plan(*lines: str, heading: str = '## Test Plan') -> str:
    return '\n'.join(['## Overview', '', 'Work.', '', heading, '',
                      '| Test | Description | Coverage | Pass |', '| --- | --- | --- | --- |', *lines,
                      '', '## References', '', '- **R1.** Source.'])


class Rows(unittest.TestCase):
    def test_a_current_plan_reads_into_its_four_columns(self):
        body = plan(f'| T1 | First check | AC1, AC2 | [✓]({EVIDENCE}) |', '| | Unobserved | AC3 | |')
        self.assertEqual(rows(body), [Row('T1', 'First check', 'AC1, AC2', f'[✓]({EVIDENCE})'),
                                      Row('', 'Unobserved', 'AC3', '')])

    def test_windows_line_endings_read_the_same(self):
        body = plan('| T1 | Check | AC1 | ✓ |')
        self.assertEqual(rows(body.replace('\n', '\r\n')), rows(body))

    def test_a_plan_with_no_rows_reads_as_empty(self):
        self.assertEqual(rows(plan()), [])

    def test_an_absent_or_unreadable_section_reads_as_none(self):
        current = plan('| T1 | Check | AC1 | |')
        for name, body in {
            'absent': '## Overview\n\nWork.',
            'empty': '',
            'repeated': current + '\n\n## Test Plan\n',
            'other heading': plan('| T1 | Check | AC1 | |', heading='## Tests'),
            'fenced': current.replace('## Test Plan\n', '## Test Plan\n\n```markdown\n') + '\n```',
            'tilde fenced': current.replace('## Test Plan\n', '## Test Plan\n\n~~~\n') + '\n~~~',
            'old columns': current.replace('| Description | Coverage | Pass |', '| Criteria |'),
            'renamed column': current.replace('Coverage', 'Criteria'),
            'bad divider': current.replace('| --- | --- | --- | --- |', '| bogus |'),
            'short divider': current.replace('| --- | --- | --- | --- |', '| --- | --- | --- |'),
            'short row': current.replace('| T1 | Check | AC1 | |', '| T1 | AC1 |'),
            'second table': current.replace('| T1 | Check | AC1 | |',
                                            '| T1 | Check | AC1 | |\n\n| A | B | C | D |\n| --- | --- | --- | --- |'),
            'checked list': '## Test Plan\n\n- [x] **T1.** Check\n\n| Test | Criteria |\n| --- | --- |\n| T1 | AC1 |',
        }.items():
            with self.subTest(body=name):
                self.assertIsNone(rows(body))


class Passed(unittest.TestCase):
    def test_every_check_ticked_and_linked_to_evidence_has_passed(self):
        for mark in (f'[✓]({EVIDENCE})', '[✓](http://example.com/result)'):
            with self.subTest(mark=mark):
                self.assertTrue(passed(plan(f'| T1 | Check | AC1 | {mark} |', '| | Unobserved | AC2 | |')))

    def test_any_other_result_leaves_the_plan_incomplete(self):
        for mark in ('', '✓', '[✓]()', '[✓](#result)', '[✓](file:///tmp/result)', 'Partial', 'Fail', 'Not run',
                     '✓ Partial', f'[Partial]({EVIDENCE})'):
            with self.subTest(mark=mark):
                self.assertFalse(passed(plan(f'| T1 | Check | AC1 | [✓]({EVIDENCE}) |',
                                             f'| T2 | Check | AC2 | {mark} |')))

    def test_passed_and_claims_share_one_rule(self):
        """A plan has passed exactly when every criterion its checks observe is claimed as passed."""
        for marks in ((f'[✓]({EVIDENCE})',), ('✓',), (f'[✓]({EVIDENCE})', '✓'), (f'[✓]({EVIDENCE})', 'Fail')):
            body = plan(*(f'| T{n} | Check | AC{n} | {mark} |' for n, mark in enumerate(marks, 1)))
            with self.subTest(marks=marks):
                _named, observed, ok = claims(body)
                self.assertEqual(passed(body), observed == ok)

    def test_a_plan_with_no_check_or_no_plan_has_not_passed(self):
        for body in (plan(), plan('| | Unobserved | AC1 | |'), '', plan('| T1 | AC1 |')):
            with self.subTest(body=body):
                self.assertFalse(passed(body))


class Claims(unittest.TestCase):
    def test_named_observed_and_passed_criteria(self):
        body = plan(f'| T1 | Check | AC1, AC2 | [✓]({EVIDENCE}) |', '| T2 | Check | AC3 | Fail |',
                    '| | Unobserved | AC4 | |')
        self.assertEqual(claims(body), ({1, 2, 3, 4}, {1, 2, 3}, {1, 2}))

    def test_a_criterion_passes_only_when_every_observing_check_does(self):
        body = plan(f'| T1 | Check | AC1 | [✓]({EVIDENCE}) |', '| T2 | Check | AC1 | |')
        self.assertEqual(claims(body), ({1}, {1}, set()))

    def test_a_pass_claims_a_criterion_only_with_a_linked_tick_to_web_evidence(self):
        for mark in ('✓', '[✓]()', '[✓](#result)', '[✓](file:///tmp/result)', '[✓](https://)',
                     '[✓](https://example.com/bad target)', f'[Pass]({EVIDENCE})'):
            with self.subTest(mark=mark):
                self.assertEqual(claims(plan(f'| T1 | Check | AC1 | {mark} |'))[2], set())
        for mark in (f'[✓]({EVIDENCE})', '[✓](http://example.com/result)'):
            with self.subTest(mark=mark):
                self.assertEqual(claims(plan(f'| T1 | Check | AC1 | {mark} |'))[2], {1})

    def test_an_unreadable_plan_claims_nothing(self):
        self.assertEqual(claims(plan('| T1 | AC1 |')), (set(), set(), set()))


if __name__ == '__main__':
    unittest.main()
