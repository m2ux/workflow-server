"""pull_request_body.py: a pull request body checked against the Template, or against Review Body for an
epic review, each finding naming its section, as Validate Pull Request Body states it.
"""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS

sys.path.insert(0, str(SCRIPTS))
from pull_request_body import findings  # noqa: E402

EVIDENCE = 'https://github.com/o/r/blob/engineering/record.md#t1'
PLAN = ['## Test Plan', '', '| Test | Description | Coverage | Pass |', '| --- | --- | --- | --- |',
        f'| T1 | Check | AC1 | [✓]({EVIDENCE}) |', '']
TASK = ['## Overview', '', 'Delivers the check.', '', '## Changes', '', 'One change.', '',
        '### Body Checks', '', '- **Checks a body.**', '  Before it publishes.', '', *PLAN,
        '## References', '', '- **R1.** [Source](https://example.com) — the source.']
REVIEW = ['## Overview', '', 'The base.', '', '## Changes', '', '### Area', '', '- **Does.**', '  It.', '',
          '## References', '', '- **R1.** [#2](https://github.com/o/r/pull/2) — a task merge.']


def body(lines: list[str]) -> str:
    return '\n'.join(lines) + '\n'


def without(lines: list[str], heading: str) -> list[str]:
    """The lines with one section and its content removed."""
    start = lines.index(heading)
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('## ')), len(lines))
    return lines[:start] + lines[end:]


class TaskBody(unittest.TestCase):
    def test_a_body_the_template_lays_out_has_no_finding(self):
        self.assertEqual(findings(body(TASK)), [])

    def test_optional_sections_may_be_absent(self):
        self.assertEqual(findings(body(without(TASK, '## References'))), [])

    def test_a_target_line_is_reported_in_its_section(self):
        lines = TASK[:3] + ['Target: `workspace`', ''] + TASK[3:]
        self.assertEqual(findings(body(lines)), ['Overview: hot-fix issue field the template does not carry'])

    def test_a_target_line_in_any_form_or_section_is_reported_once_per_section(self):
        changes = TASK.index('## Changes') + 2
        lines = (TASK[:3] + ['Target: workspace', '', 'target: `main`', ''] + TASK[3:changes]
                 + ['Target: `workspace`', ''] + TASK[changes:])
        self.assertEqual(findings(body(lines)), ['Overview: hot-fix issue field the template does not carry',
                                                 'Changes: hot-fix issue field the template does not carry'])

    def test_a_fenced_target_line_is_a_specimen(self):
        lines = TASK[:3] + ['```text', 'Target: `workspace`', '```', ''] + TASK[3:]
        self.assertEqual(findings(body(lines)), [])

    def test_an_issue_only_section_is_reported_by_name(self):
        lines = TASK[:4] + ['## Problem', '', '- **Broken.**', '  Evidence.', ''] + TASK[4:]
        self.assertEqual(findings(body(lines)), ['extra section: Problem'])

    def test_a_missing_test_plan_is_reported_by_name(self):
        self.assertEqual(findings(body(without(TASK, '## Test Plan'))), ['required section missing: Test Plan'])

    def test_an_unreadable_test_plan_is_reported_by_name(self):
        lines = [line for line in TASK if not line.startswith('|')]
        lines.insert(lines.index('## Test Plan') + 2, '- [x] Check')
        self.assertEqual(findings(body(lines)), ['Test Plan: unreadable test plan'])

    def test_text_before_the_first_section_and_misplaced_or_repeated_sections_are_reported(self):
        plan = TASK.index('## Test Plan')
        moved = TASK[plan:plan + len(PLAN)] + TASK[:plan] + TASK[plan + len(PLAN):]
        self.assertEqual(findings(body(moved)), ['section out of order: Test Plan'])
        self.assertEqual(findings(body(['Preface.', ''] + TASK)), ['text before the first section'])
        self.assertEqual(findings(body(TASK + ['', '## References', ''])), ['repeated section: References'])


class ReviewBody(unittest.TestCase):
    def test_an_epic_review_holds_overview_changes_and_references(self):
        self.assertEqual(findings(body(REVIEW), review=True), [])
        self.assertEqual(findings(body(without(REVIEW, '## References')), review=True),
                         ['required section missing: References'])

    def test_an_epic_review_carries_no_test_plan(self):
        lines = REVIEW[:11] + PLAN + REVIEW[11:]
        self.assertEqual(findings(body(lines), review=True), ['extra section: Test Plan'])
        self.assertEqual(findings(body(without(REVIEW, '## Changes')), review=True),
                         ['required section missing: Changes'])


class Command(unittest.TestCase):
    def run_on(self, text: str, *flags: str) -> subprocess.CompletedProcess:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory, 'body.md')
            path.write_text(text)
            return subprocess.run([sys.executable, str(SCRIPTS / 'pull_request_body.py'), str(path), *flags],
                                  capture_output=True, text=True, cwd=directory)

    def test_a_clean_body_prints_nothing_and_exits_zero(self):
        result = self.run_on(body(TASK))
        self.assertEqual((result.returncode, result.stdout), (0, ''))

    def test_each_finding_prints_with_the_file_and_exits_one(self):
        result = self.run_on(body(without(TASK, '## Test Plan')))
        self.assertEqual(result.returncode, 1)
        self.assertTrue(result.stdout.endswith('body.md: required section missing: Test Plan\n'))

    def test_the_review_flag_holds_the_body_to_review_body(self):
        self.assertEqual(self.run_on(body(REVIEW), '--review').returncode, 0)
        self.assertEqual(self.run_on(body(REVIEW)).returncode, 1)


if __name__ == '__main__':
    unittest.main()
