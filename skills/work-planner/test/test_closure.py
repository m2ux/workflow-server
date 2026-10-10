"""Completion requires every Development-linked pull request to have merged."""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import issue, pr, run, url

MERGED = '2026-10-10T12:00:00Z'
BODY = '## Acceptance Criteria\n\n- [x] **AC1.** Holds.\n'


class Closure(unittest.TestCase):
    def check(self, links, pulls, **changes):
        record = issue(2, 'Standalone: Work', body=changes.pop('body', BODY))
        evidence = {'repo': 'o/r', 'number': 2, 'complete': True,
                    'auto_close_issues': False, 'pull_requests': links}
        evidence.update(changes)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'issue.json').write_text(json.dumps(record))
            (root / 'development.json').write_text(json.dumps(evidence))
            (root / 'prs.json').write_text('\n'.join(json.dumps(p) for p in pulls))
            return run('closure.py', '--issue', str(root / 'issue.json'),
                       '--development', str(root / 'development.json'), '--prs', str(root / 'prs.json'))

    def test_every_linked_pr_must_merge(self):
        links = [url('pull', 9), url('pull', 10)]
        pulls = [pr(9, 'First', merged=MERGED), pr(10, 'Second')]
        blocked = self.check(links, pulls)
        self.assertEqual(blocked.returncode, 1)
        self.assertIn(f'{links[1]}: not merged (open)', blocked.stdout)
        pulls[1] = pr(10, 'Second', merged=MERGED)
        self.assertEqual(self.check(links, pulls).returncode, 0)

    def test_a_closed_unmerged_pr_blocks(self):
        result = self.check([url('pull', 9)], [pr(9, 'Abandoned', state='closed')])
        self.assertEqual(result.returncode, 1)
        self.assertIn('not merged (closed)', result.stdout)

    def test_a_draft_blocks(self):
        result = self.check([url('pull', 9)], [pr(9, 'Draft', draft=True)])
        self.assertEqual(result.returncode, 1)
        self.assertIn('not merged (draft)', result.stdout)

    def test_same_number_in_different_repositories_is_distinct(self):
        links = [url('pull', 9), url('pull', 9, 'o/other')]
        pulls = [pr(9, 'Local', merged=MERGED), pr(9, 'Other', repo='o/other')]
        result = self.check(links, pulls)
        self.assertEqual(result.returncode, 1)
        self.assertIn('o/other/pull/9: not merged', result.stdout)

    def test_unlinked_prs_do_not_block(self):
        result = self.check([url('pull', 9)], [pr(9, 'Linked', merged=MERGED), pr(10, 'Unlinked')])
        self.assertEqual(result.returncode, 0)

    def test_titles_and_branches_do_not_filter_linked_prs(self):
        result = self.check([url('pull', 9)], [pr(9, 'No epic prefix', base='other', head='arbitrary')])
        self.assertEqual(result.returncode, 1)

    def test_missing_pr_evidence_blocks(self):
        result = self.check([url('pull', 9)], [])
        self.assertEqual(result.returncode, 1)
        self.assertIn('evidence is missing', result.stdout)

    def test_incomplete_link_list_blocks(self):
        for complete in (False, None, 'true'):
            with self.subTest(complete=complete):
                self.assertEqual(self.check([], [], complete=complete).returncode, 1)

    def test_enabled_or_unknown_auto_closing_blocks(self):
        for setting in (True, None, 'false', 0):
            with self.subTest(setting=setting):
                result = self.check([], [], auto_close_issues=setting)
                self.assertEqual(result.returncode, 1)
                self.assertIn('auto-closing is not confirmed disabled', result.stdout)

    def test_evidence_for_another_issue_blocks(self):
        self.assertEqual(self.check([], [], number=3).returncode, 1)
        self.assertEqual(self.check([], [], repo='o/other').returncode, 1)

    def test_an_explicitly_empty_development_field_permits_normal_closure(self):
        self.assertEqual(self.check([], []).returncode, 0)

    def test_missing_or_invalid_link_list_blocks(self):
        for links in (None, {}, ['not-a-pr-url']):
            with self.subTest(links=links):
                self.assertEqual(self.check(links, []).returncode, 1)

    def test_unticked_or_absent_criteria_block(self):
        self.assertEqual(self.check([], [], body=BODY.replace('[x]', '[ ]')).returncode, 1)
        self.assertEqual(self.check([], [], body='').returncode, 1)

    def test_duplicate_rest_records_block_ambiguous_evidence(self):
        result = self.check([url('pull', 9)], [pr(9, 'First'), pr(9, 'First', merged=MERGED)])
        self.assertEqual(result.returncode, 1)
        self.assertIn('duplicate pull request evidence', result.stdout)

    def test_unreadable_snapshot_blocks(self):
        result = run('closure.py', '--issue', '/nonexistent/issue.json',
                     '--development', '/nonexistent/development.json', '--prs', '/nonexistent/prs.json')
        self.assertEqual(result.returncode, 1)
        self.assertIn('unreadable evidence', result.stdout)
