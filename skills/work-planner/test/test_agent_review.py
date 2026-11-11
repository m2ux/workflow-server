"""Current integration review evidence gates board and user handoff."""
import ast
import copy
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

from fixtures import SCRIPTS, issue, pr, run
sys.path.insert(0, str(SCRIPTS))
import kinds  # noqa: E402
from agent_review import check, epic_check  # noqa: E402


def reviewed_pr(tag='07:E00'):
    record = {'pull_request': 'https://github.com/o/r/pull/10',
              'head': 'a' * 40, 'base': 'b' * 40,
              'url': 'https://github.com/o/r/blob/engineering/review.json',
              'reviewer': 'delivery agent', 'reviewed_at': '2026-10-31T10:00:00Z',
              'scope': 'Complete target...head integration diff, definitions and callers.',
              'criteria': 'AC1–AC3 verified against behavior and regression fixtures.',
              'validation': 'Regression fixtures and planner suite passed.', 'findings': []}
    initiative, epic = tag.split(':E')
    pull = pr(10, f'[I{tag}] Integration', base='workspace',
              head=f'i{initiative}/e{epic}/workspace', draft=True,
              body=f"## References\n\n[Agent review]({record['url']})\n")
    pull['head']['sha'], pull['base']['sha'] = record['head'], record['base']
    return pull, record


def hotfix_pr():
    pull, record = reviewed_pr()
    pull['title'] = '[F04] Reject Bad Keys'
    record['base_ref'] = pull['base']['ref']
    return pull, record


class ValidatedTips(unittest.TestCase):
    """Both the general rule and a kind's rule hold a record current against the tips check validated."""

    def test_the_general_rule_holds_a_record_current_for_the_head_and_base_shas(self):
        pull, record = reviewed_pr()
        self.assertIsNone(check(pull, [record]))
        self.assertIsNone(check(pull, [{**record, 'base_ref': 'elsewhere'}]))
        self.assertIn('stale', check(pull, [{**record, 'head': 'c' * 40}]))
        self.assertIn('stale', check(pull, [{**record, 'base': 'c' * 40}]))

    def test_a_target_without_a_branch_is_refused_on_either_path(self):
        for pull, record in (reviewed_pr(), hotfix_pr()):
            with self.subTest(title=pull['title']):
                del pull['base']['ref']
                record.pop('base_ref', None)
                self.assertEqual(check(pull, [record]), 'missing current integration target branch')
                pull['base']['ref'] = ''
                self.assertEqual(check(pull, [record]), 'missing current integration target branch')

    def test_a_kind_rule_receives_the_validated_tips(self):
        received = []
        stand_in = types.ModuleType('stand_in')
        stand_in.tag = lambda item: 'Z01' if (item.get('title') or '').startswith('[Z01]') else None
        stand_in.review = lambda tips: received.append(tips) or kinds.Review({'head': tips.head}, lambda finding: '')
        pull, record = reviewed_pr()
        pull['title'] = '[Z01] Stand In'
        with mock.patch.dict(sys.modules, {'stand_in': stand_in}), \
                mock.patch.dict(kinds.KINDS, {'stand-in': 'stand_in'}):
            self.assertIsNone(check(pull, [record]))
        self.assertEqual(received, [kinds.Tips('a' * 40, 'b' * 40, 'workspace')])


class HotFixReview(unittest.TestCase):
    def test_a_record_written_from_the_pull_request_as_produce_says_passes(self):
        pull, published = hotfix_pr()
        record = {**{k: published[k] for k in ('pull_request', 'url', 'reviewer', 'reviewed_at', 'scope',
                                                 'criteria', 'validation', 'findings')},
                  'head': pull['head']['sha'], 'base': pull['base']['sha'], 'base_ref': pull['base']['ref']}
        self.assertIsNone(check(pull, [record]))

    def test_every_finding_is_fixed(self):
        pull, record = hotfix_pr()
        record['findings'] = [{'description': 'Follow-up', 'severity': 'nonblocking', 'disposition': 'deferred',
                               'ticket': 'https://github.com/o/r/issues/5'}]
        self.assertIn('unfixed finding', check(pull, [record]))
        record['findings'][0].update(disposition='fixed', evidence='https://github.com/o/r/commit/1')
        self.assertIsNone(check(pull, [record]))

    def test_a_changed_head_or_base_branch_makes_it_stale_and_a_moved_target_does_not(self):
        pull, record = hotfix_pr()
        self.assertIsNone(check(pull, [{**record, 'base': 'c' * 40}]))
        self.assertIn('stale', check(pull, [{**record, 'head': 'c' * 40}]))
        self.assertIn('stale', check(pull, [{**record, 'base_ref': 'main'}]))
        self.assertIn('stale', check(pull, [{k: v for k, v in record.items() if k != 'base_ref'}]))


class RegisteredKind(unittest.TestCase):
    def test_each_kind_supplies_its_own_currency_and_finding_rule(self):
        stand_in = types.ModuleType('stand_in')
        stand_in.tag = lambda item: 'Z01' if (item.get('title') or '').startswith('[Z01]') else None
        stand_in.review = lambda tips: kinds.Review(
            {'head': tips.head},
            lambda finding: 'a stand-in defers nothing' if finding.get('disposition') == 'deferred' else '')
        pull, record = hotfix_pr()
        pull['title'] = '[Z01] Stand In'
        deferred = [{'description': 'Follow-up', 'severity': 'nonblocking', 'disposition': 'deferred',
                     'ticket': 'https://github.com/o/r/issues/5'}]
        fixed = [{'description': 'Follow-up', 'severity': 'nonblocking', 'disposition': 'fixed',
                  'evidence': 'https://github.com/o/r/commit/1'}]
        with mock.patch.dict(sys.modules, {'stand_in': stand_in}), \
                mock.patch.dict(kinds.KINDS, {'stand-in': 'stand_in'}):
            self.assertEqual(check(pull, [{**record, 'findings': deferred}]), 'a stand-in defers nothing')
            self.assertIsNone(check(pull, [{**record, 'findings': fixed}]))
            self.assertIsNone(check(pull, [{**record, 'base': 'c' * 40, 'base_ref': 'main'}]))
            self.assertIn('stale', check(pull, [{**record, 'head': 'c' * 40}]))
            hot = {**pull, 'title': '[F04] Reject Bad Keys'}
            self.assertIn('stale', check(hot, [{**record, 'base_ref': 'main'}]))
            self.assertIn('unfixed finding', check(hot, [{**record, 'findings': deferred}]))
        self.assertIsNone(check(pull, [{**record, 'findings': deferred}]))
        self.assertIn('stale', check(pull, [{**record, 'base': 'c' * 40}]))

    def test_it_imports_no_kind_module_and_names_no_kind(self):
        source = (SCRIPTS / 'agent_review.py').read_text()
        imported = set()
        for node in ast.walk(ast.parse(source)):
            if isinstance(node, ast.ImportFrom):
                imported.add(node.module)
            elif isinstance(node, ast.Import):
                imported.update(alias.name for alias in node.names)
        self.assertIn('kinds', imported)
        self.assertFalse(imported & set(kinds.KINDS.values()))
        for kind in kinds.KINDS:
            self.assertNotIn(kind, source)
        self.assertNotRegex(source, r'(?i)hot.?fix|\[F\d|F00')


class AgentReview(unittest.TestCase):
    def setUp(self):
        self.pr, self.record = reviewed_pr()

    def test_reduced_snapshot_is_reported_without_crashing(self):
        self.pr['head'] = 'a' * 40
        self.assertIn('full REST', check(self.pr, [self.record]))

    def test_example_record_links_do_not_establish_publication(self):
        link = f"[Review]({self.record['url']})"
        for body in (f"```md\n{link}\n```", f"~~~md\n{link}\n~~~", f"`{link}`", '    ' + link, '<!--' + link + '-->'):
            self.pr['body'] = body
            self.assertIn('not linked', check(self.pr, [self.record]))

    def test_missing_review_blocks(self):
        self.assertIn('missing', check(self.pr, []))

    def test_changed_head_or_target_blocks(self):
        for key in ('head', 'base'):
            record = {**self.record, key: 'c' * 40}
            self.assertIn('stale', check(self.pr, [record]))

    def test_current_published_review_passes(self):
        self.assertIsNone(check(self.pr, [self.record]))

    def test_open_or_deferred_blocker_blocks(self):
        for disposition in ('open', 'deferred'):
            self.record['findings'] = [{'description': 'Missing guard', 'severity': 'blocking',
                                       'disposition': disposition, 'ticket': 'https://github.com/o/r/issues/1'}]
            self.assertIn('unresolved blocking', check(self.pr, [self.record]))

    def test_fixed_blocker_requires_evidence_and_current_review(self):
        self.record['findings'] = [{'description': 'Missing guard', 'severity': 'blocking',
                                   'disposition': 'fixed'}]
        self.assertIn('linked evidence', check(self.pr, [self.record]))
        self.record['findings'][0]['evidence'] = 'https://github.com/o/r/commit/' + 'a' * 40
        self.assertIsNone(check(self.pr, [self.record]))
        self.pr['head']['sha'] = 'c' * 40
        self.assertIn('stale', check(self.pr, [self.record]))

    def test_deferred_nonblocker_requires_ticket(self):
        self.record['findings'] = [{'description': 'Follow-up', 'severity': 'nonblocking',
                                   'disposition': 'deferred'}]
        self.assertIn('ticket', check(self.pr, [self.record]))
        self.record['findings'][0]['ticket'] = 'https://github.com/o/r/issues/1'
        self.assertIsNone(check(self.pr, [self.record]))

    def test_missing_scope_criteria_validation_or_link_blocks(self):
        for key in ('scope', 'criteria', 'validation', 'reviewer', 'reviewed_at', 'findings', 'url'):
            record = copy.deepcopy(self.record)
            del record[key]
            self.assertIsNotNone(check(self.pr, [record]), key)
        self.pr['body'] = ''
        self.assertIn('not linked', check(self.pr, [self.record]))

    def test_latest_same_revision_record_is_authoritative(self):
        blocked = {**self.record, 'findings': [{'description': 'Regression', 'severity': 'blocking', 'disposition': 'open'}]}
        self.assertIn('blocking', check(self.pr, [self.record, blocked]))

    def test_every_open_epic_integration_needs_review(self):
        epic = issue(943, '[I07:E00] Epic')
        self.assertIsNone(epic_check(epic, [self.pr], [self.record]))
        second = copy.deepcopy(self.pr)
        second['number'] = 11
        second['html_url'] = 'https://github.com/o/r/pull/11'
        second['base']['ref'] = 'main'
        second['head']['ref'] = 'i07/e00/main'
        self.assertIn('missing', epic_check(epic, [self.pr, second], [self.record]))

    def test_only_an_epic_title_stands_in_review_as_board_tags_reads_it(self):
        for title in ('[I07:E00:W01] Task', '[I07] Initiative', 'Untagged', '[F04] Fix'):
            with self.subTest(title=title):
                self.assertEqual(epic_check(issue(943, title), [self.pr], [self.record]),
                                 'a task does not stand In Review')
        with mock.patch('board.tags', return_value=('07', '00', '')):
            self.assertIsNone(epic_check(issue(943, 'Read through the title-tag owner'), [self.pr], [self.record]))

    def test_wrong_repository_or_task_pr_cannot_supply_review(self):
        epic = issue(943, '[I07:E00] Epic')
        self.pr['head']['ref'] = 'i07/e00/w01-task'
        self.assertIn('missing open', epic_check(epic, [self.pr], [self.record]))
        self.pr, self.record = reviewed_pr()
        self.pr['html_url'] = 'https://github.com/other/r/pull/10'
        self.assertIn('missing open', epic_check(epic, [self.pr], [self.record]))

    def test_handoff_check_cli_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            p, records = Path(tmp, 'pr.json'), Path(tmp, 'reviews.json')
            p.write_text(json.dumps(self.pr)); records.write_text(json.dumps([self.record]))
            done = run('agent_review.py', '--pr', str(p), '--agent-reviews', str(records))
            self.assertEqual(done.returncode, 0, done.stderr)
            self.pr['base']['sha'] = 'c' * 40
            p.write_text(json.dumps(self.pr))
            done = run('agent_review.py', '--pr', str(p), '--agent-reviews', str(records))
            self.assertNotEqual(done.returncode, 0)
            self.assertIn('stale', done.stdout)
