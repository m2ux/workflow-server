"""Current integration review evidence gates board and user handoff."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import SCRIPTS, issue, pr, run
sys.path.insert(0, str(SCRIPTS))
from agent_review import check, epic_check


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
