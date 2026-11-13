"""An agent review record's scope notes waive no finding: every finding meets its disposition rules."""
import sys
import unittest

from fixtures import SCRIPTS
sys.path.insert(0, str(SCRIPTS))
from agent_review import check
from test_agent_review import hotfix_pr, reviewed_pr

SEVERITIES = ('blocking', 'nonblocking')


class ReviewScope(unittest.TestCase):
    def test_integration_review_dispositions_and_missing_links(self):
        expected = {('blocking', 'open'): 'unresolved', ('nonblocking', 'open'): 'unresolved',
                    ('blocking', 'deferred'): 'invalid', ('nonblocking', 'deferred'): 'invalid',
                    ('blocking', 'fixed'): None, ('nonblocking', 'fixed'): None}
        for (severity, disposition), problem in expected.items():
            with self.subTest(severity=severity, disposition=disposition):
                pull, record = reviewed_pr()
                finding = dict(description='In-scope defect', severity=severity, disposition=disposition)
                record['findings'] = [finding]
                if problem:
                    finding['ticket'] = 'https://example.test/issues/84'
                    self.assertIn(problem, check(pull, [record]))
                    continue
                self.assertIn('lacks linked evidence', check(pull, [record]))
                finding['evidence'] = 'https://example.test/commit/84'
                self.assertIsNone(check(pull, [record]))

    def test_scope_annotations_cannot_waive_an_open_or_deferred_hotfix_finding(self):
        for severity in SEVERITIES:
            for disposition in ('open', 'deferred'):
                with self.subTest(severity=severity, disposition=disposition):
                    pull, record = hotfix_pr()
                    record['scope'] += ' Exclusion requested; source comparison is recorded separately.'
                    record['findings'] = [dict(description='Reviewed defect', severity=severity,
                                               disposition=disposition, ticket='https://example.test/issues/80')]
                    self.assertIsNotNone(check(pull, [record]))

    def test_every_fixed_hotfix_finding_requires_linked_evidence(self):
        for severity in SEVERITIES:
            pull, record = hotfix_pr()
            finding = dict(description='Reviewed defect', severity=severity, disposition='fixed')
            record['findings'] = [finding]
            self.assertIn('linked evidence', check(pull, [record]))
            finding['evidence'] = 'https://example.test/commit/' + '3' * 40
            self.assertIsNone(check(pull, [record]))

    def test_exclusion_evidence_uses_the_existing_scope_and_findings_shape(self):
        pull, record = hotfix_pr()
        before_keys = set(record)
        record['scope'] += ' Observation C: source revisions and call paths at https://example.test/review/C; arising issue https://example.test/issues/80.'
        self.assertIsNone(check(pull, [record]))
        self.assertEqual(set(record), before_keys)
        self.assertEqual(record['findings'], [])

    def test_scope_annotations_do_not_waive_a_blocking_integration_finding(self):
        pull, record = reviewed_pr()
        record['scope'] += ' Claimed unrelated observation is in the collection.'
        record['findings'] = [dict(description='Affected caller risk', severity='blocking',
                                   disposition='open')]
        self.assertIn('unresolved', check(pull, [record]))

    def test_scope_notes_do_not_establish_current_review_identity(self):
        pull, record = hotfix_pr()
        record['scope'] += ' Exclusions have tickets and source evidence.'
        pull['head']['sha'] = '4' * 40
        self.assertIn('stale', check(pull, [record]))
