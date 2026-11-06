"""Review scope keeps actual hot-fix findings subject to strict disposition checks."""
import json
import sys
import unittest
from pathlib import Path

from fixtures import SCRIPTS
sys.path.insert(0, str(SCRIPTS))
from agent_review import check
from test_agent_review import hotfix_pr, reviewed_pr

CASES = json.loads(Path(__file__).with_name('review-scope-cases.json').read_text())


def observe(context, revision, probe):
    namespace = {}
    exec(compile(context[revision], '<review-scope-fixture>', 'exec'), namespace)
    try:
        return {'value': namespace[probe['function']](*probe['args'])}
    except Exception as error:
        return {'error': type(error).__name__, 'message': str(error)}


class ReviewScope(unittest.TestCase):
    def test_changed_boundary_has_an_observable_failure(self):
        context = CASES['contexts']['r']; probe = context['probes'][0]
        self.assertEqual(observe(context, 'before', probe), {'value': True})
        self.assertEqual(observe(context, 'after', probe), {'value': False})

    def test_a_new_caller_exposes_an_unchanged_helpers_failure(self):
        context = CASES['contexts']['s']; caller, helper = context['probes']
        self.assertEqual(observe(context, 'before', caller), {'value': 100})
        self.assertEqual(observe(context, 'after', caller)['error'], 'ValueError')
        self.assertEqual(observe(context, 'before', helper), observe(context, 'after', helper))

    def test_unrelated_path_capture_keeps_its_fault_and_the_changed_callers_result(self):
        context = CASES['contexts']['t']; caller, legacy = context['probes']
        self.assertEqual(observe(context, 'before', caller), {'value': 'ok'})
        self.assertEqual(observe(context, 'after', caller), {'value': 'OK'})
        self.assertEqual(observe(context, 'before', legacy), observe(context, 'after', legacy))

    def test_scope_annotations_cannot_waive_an_open_or_deferred_hotfix_finding(self):
        for case in CASES['cases'].values():
            for disposition in ('open', 'deferred'):
                with self.subTest(context=case['context'], disposition=disposition):
                    pull, record = hotfix_pr()
                    record['scope'] += ' Exclusion requested; source comparison is recorded separately.'
                    record['findings'] = [dict(description=case['observation'], severity=case['severity'],
                                               disposition=disposition, ticket='https://example.test/issues/80')]
                    self.assertIsNotNone(check(pull, [record]))

    def test_every_fixed_hotfix_finding_requires_linked_evidence(self):
        for severity in ('blocking', 'nonblocking'):
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
                                   disposition='deferred', ticket='https://example.test/issues/81')]
        self.assertIn('blocking', check(pull, [record]))

    def test_scope_notes_do_not_establish_current_review_identity(self):
        pull, record = hotfix_pr()
        record['scope'] += ' Exclusions have tickets and source evidence.'
        pull['head']['sha'] = '4' * 40
        self.assertIn('stale', check(pull, [record]))
