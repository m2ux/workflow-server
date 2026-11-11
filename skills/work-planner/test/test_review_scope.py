"""Review scope admits only evidenced unrelated debt with a saved arising issue outside findings, and keeps every actual finding subject to strict disposition checks."""
import ast
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


def functions(source):
    """Each top-level function's source and the names it calls."""
    tree = ast.parse(source)
    return {node.name: (ast.get_source_segment(source, node),
                        {call.func.id if isinstance(call.func, ast.Name) else call.func.attr
                         for call in ast.walk(node) if isinstance(call, ast.Call)})
            for node in tree.body if isinstance(node, ast.FunctionDef)}


def reaches(graph, start, target):
    seen, todo = set(), [start]
    while todo:
        name = todo.pop()
        if name == target:
            return True
        if name in graph and name not in seen:
            seen.add(name)
            todo.extend(graph[name][1])
    return False


def membership(case):
    """Review Scope over the fixture's evidence: exclusion needs earlier existence, independence
    from every changed function and a saved arising issue; anything short of that is a finding."""
    context = CASES['contexts'][case['context']]
    if 'unavailable' in context:
        return 'finding'
    before, after = functions(context['before']), functions(context['after'])
    fault = case['fault']
    if before.get(fault, (None,))[0] != after[fault][0]:
        return 'finding'
    probe = next(p for p in context['probes'] if p['function'] == fault)
    observed = observe(context, 'before', probe)
    if 'error' not in observed or observed != observe(context, 'after', probe):
        return 'finding'
    changed = [name for name in after if before.get(name, (None,))[0] != after[name][0]]
    if any(reaches(after, name, fault) for name in changed):
        return 'finding'
    return 'excluded' if (case['issue'] or {}).get('saved') else 'finding'


def resolve(case, disposition):
    """A hot-fix review record placing the case where its evidence admits it."""
    pull, record = hotfix_pr()
    if membership(case) == 'excluded':
        record['scope'] += (f" Excluded: {case['observation']} Unchanged at {CASES['before_revision']} and "
                            f"{CASES['head_revision']}; no changed caller reaches {case['fault']}. "
                            f"Arising issue {case['issue']['html_url']}.")
    else:
        record['findings'] = [dict(description=case['observation'], severity=case['severity'],
                                   disposition=disposition, ticket='https://example.test/issues/82')]
    return pull, record


class ReviewScope(unittest.TestCase):
    def test_fixture_evidence_establishes_each_cases_membership(self):
        for key, case in CASES['cases'].items():
            with self.subTest(case=key):
                self.assertEqual(membership(case), case['membership'])

    def test_introduced_defects_and_affected_caller_risks_are_findings(self):
        kinds = {'A': 'introduced defect', 'B': 'affected-caller risk', 'F': 'introduced documentation defect'}
        for key in kinds:
            with self.subTest(case=key, kind=kinds[key]):
                self.assertEqual(membership(CASES['cases'][key]), 'finding')

    def test_only_evidenced_unrelated_debt_with_a_saved_issue_leaves_the_findings(self):
        self.assertEqual(membership(CASES['cases']['C']), 'excluded')
        self.assertEqual(membership(CASES['cases']['D']), 'finding')
        self.assertEqual(membership(CASES['cases']['E']), 'finding')

    def test_a_defect_relabelled_as_unrelated_keeps_its_finding_and_fails_review(self):
        saved = {'saved': True, 'html_url': 'https://example.test/issues/83', 'number': 83}
        for key in ('A', 'B', 'D', 'E', 'F'):
            original = CASES['cases'][key]
            case = dict(original, membership='excluded', issue=original['issue'] if key == 'D' else saved)
            with self.subTest(case=key):
                pull, record = resolve(case, 'deferred')
                self.assertEqual(len(record['findings']), 1)
                self.assertIsNotNone(check(pull, [record]))

    def test_resolved_membership_passes_only_when_every_finding_is_fixed(self):
        for key, case in CASES['cases'].items():
            with self.subTest(case=key):
                pull, record = resolve(case, 'open')
                if case['membership'] == 'excluded':
                    self.assertIsNone(check(pull, [record]))
                    self.assertIn(case['issue']['html_url'], record['scope'])
                    continue
                self.assertIsNotNone(check(pull, [record]))
                record['findings'][0].update(disposition='fixed', evidence='https://example.test/commit/' + '5' * 40)
                self.assertIsNone(check(pull, [record]))

    def test_integration_review_dispositions_and_missing_links(self):
        expected = {('blocking', 'open'): 'unresolved blocking', ('blocking', 'deferred'): 'unresolved blocking',
                    ('nonblocking', 'open'): 'needs a disposition',
                    ('nonblocking', 'deferred'): None, ('blocking', 'fixed'): None, ('nonblocking', 'fixed'): None}
        for (severity, disposition), problem in expected.items():
            with self.subTest(severity=severity, disposition=disposition):
                pull, record = reviewed_pr()
                link = 'evidence' if disposition == 'fixed' else 'ticket'
                finding = dict(description='In-scope defect', severity=severity, disposition=disposition)
                record['findings'] = [finding]
                if problem:
                    finding[link] = 'https://example.test/issues/84'
                    self.assertIn(problem, check(pull, [record]))
                    continue
                self.assertIn('lacks linked evidence or ticket', check(pull, [record]))
                finding[link] = 'https://example.test/issues/84'
                self.assertIsNone(check(pull, [record]))

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
