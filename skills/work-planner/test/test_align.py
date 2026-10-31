"""Alignment repairs, unreadable evidence and reference visibility fixtures."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import run

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
from align import check_references, repair_plan, reference_repositories
from sync import plan_rows, test_plan_agreement

LEGACY = """## Overview

Keep this wording.

## Test Plan

- [x] **T1.** First check [✓](https://github.com/o/r/blob/engineering/test.md#first)
- [ ] **T2.** Second check

| Test | Criteria |
| --- | --- |
| T1 | AC1, AC2 |
| T2 | AC3 |
| | AC4 |

## References

Keep this reference.
"""
CURRENT = '## Test Plan\n\n| Test | Description | Coverage | Pass |\n| --- | --- | --- | --- |\n| T1 | Check | AC1 | |\n'


class PlanRepair(unittest.TestCase):
    def test_conversion_preserves_descriptions_coverage_result_and_surroundings(self):
        body, changed, findings = repair_plan(LEGACY)
        self.assertTrue(changed)
        self.assertEqual(findings, [])
        self.assertIn('Keep this wording.', body)
        self.assertIn('Keep this reference.', body)
        self.assertEqual(plan_rows(body), [('T1', 'AC1, AC2', '[✓](https://github.com/o/r/blob/engineering/test.md#first)'), ('T2', 'AC3', ''), ('', 'AC4', '')])
        self.assertIn('Second check', body)
        self.assertNotIn('- [x]', body)

    def test_current_plan_is_byte_preserved(self):
        self.assertEqual(repair_plan(CURRENT), (CURRENT, False, []))

    def test_conversion_is_idempotent(self):
        body, _, _ = repair_plan(LEGACY)
        self.assertEqual(repair_plan(body), (body, False, []))

    def test_checked_entry_without_evidence_remains_pending(self):
        body, changed, findings = repair_plan(LEGACY.replace(' [✓](https://github.com/o/r/blob/engineering/test.md#first)', ''))
        self.assertTrue(changed)
        self.assertEqual(plan_rows(body)[0][2], '')
        self.assertIn('lacks linked evidence', findings[0])

    def test_unchecked_link_does_not_become_passed(self):
        body, _, _ = repair_plan(LEGACY.replace('- [x]', '- [ ]'))
        self.assertEqual(plan_rows(body)[0][2], '')

    def test_ambiguous_or_incomplete_plans_are_unchanged(self):
        examples = [LEGACY.replace('| T2 |', '| T3 |'), LEGACY.replace('**T2.**', '**T1.**'), LEGACY.replace('| T2 | AC3 |', '| T2 | AC3 | extra |'), LEGACY.replace('## References', 'Unexpected prose.\n\n## References'), LEGACY + '\n## Test Plan\n']
        for original in examples:
            with self.subTest(original=original):
                body, changed, findings = repair_plan(original)
                self.assertEqual(body, original)
                self.assertFalse(changed)
                self.assertTrue(findings)

    def test_command_names_converted_pull_request(self):
        with tempfile.TemporaryDirectory() as tmp:
            source, output = Path(tmp)/'pr.json', Path(tmp)/'body.md'
            source.write_text(json.dumps({'number': 950, 'html_url': 'https://github.com/o/r/pull/950', 'body': LEGACY}))
            result = run('align.py', 'plan', str(source), '--fix', str(output))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('https://github.com/o/r/pull/950: converted test plan', result.stdout)
            self.assertIsNotNone(plan_rows(output.read_text()))


class UnreadablePlan(unittest.TestCase):
    def report(self, body):
        report = {'disagreement': []}
        test_plan_agreement([['[W01](https://github.com/o/r/pull/950)', 'AC1']], ['Task', 'Coverage'], {950: {'body': body}}, report)
        return report['disagreement']

    def test_malformed_plans_are_not_reported_as_missing_observations(self):
        for body in ['', LEGACY, CURRENT.replace('| --- | --- | --- | --- |', '| bogus |'), CURRENT.replace('| T1 | Check | AC1 | |', '| T1 | AC1 |'), CURRENT.replace('Coverage', 'Criteria')]:
            with self.subTest(body=body):
                self.assertEqual(self.report(body), ['#950: unreadable test plan'])

    def test_unobserved_criterion_is_a_distinct_finding(self):
        self.assertEqual(self.report(CURRENT.replace('| T1 |', '| |')), ['#950 W01: AC1 covered and no test observes it'])


class Visibility(unittest.TestCase):
    def issue(self, body='## References\n\n- [Source](https://github.com/o/private/blob/main/file.md)'):
        return {'html_url': 'https://github.com/o/public/issues/1', 'body': body}

    def metadata(self, destination=False, reference=True):
        return [{'full_name': 'o/public', 'private': destination}, {'full_name': 'o/private', 'private': reference}]

    def test_private_reference_on_public_issue_is_reported(self):
        self.assertEqual(check_references(self.issue(), self.metadata()), ['References: private repository o/private cited by public issue'])

    def test_public_reference_is_clear(self):
        self.assertEqual(check_references(self.issue(), self.metadata(reference=False)), [])

    def test_private_destination_is_clear(self):
        self.assertEqual(check_references(self.issue(), self.metadata(destination=True)), [])

    def test_missing_reference_visibility_is_unresolved(self):
        self.assertEqual(check_references(self.issue(), self.metadata()[:1]), ['References: o/private visibility unavailable'])

    def test_missing_destination_visibility_is_unresolved(self):
        self.assertEqual(check_references(self.issue(), []), ['destination repository visibility unavailable'])

    def test_non_reference_sections_are_excluded_and_names_deduplicated(self):
        body = '## Overview\nhttps://github.com/other/secret\n## References\nhttps://github.com/O/PRIVATE/blob/main/a\nhttps://github.com/o/private/issues/2\n## Notes\nhttps://github.com/other/secret'
        self.assertEqual(reference_repositories(self.issue(body)), ('o/public', ['o/private']))

    def test_api_issue_identity_is_supported(self):
        record = self.issue()
        record['url'] = 'https://api.github.com/repos/o/public/issues/1'
        del record['html_url']
        self.assertEqual(reference_repositories(record)[0], 'o/public')

    def test_command_reports_visibility_finding(self):
        with tempfile.TemporaryDirectory() as tmp:
            source, metadata = Path(tmp)/'issue.json', Path(tmp)/'repos.json'
            source.write_text(json.dumps(self.issue()))
            metadata.write_text(json.dumps(self.metadata()))
            result = run('align.py', 'references', str(source), '--repositories', str(metadata))
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('private repository o/private cited by public issue', result.stdout)
