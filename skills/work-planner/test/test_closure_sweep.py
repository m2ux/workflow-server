"""The closure sweep lists each closed issue its criteria or Development links do not support."""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import issue, run
from test_link_capture import issue_end, tracker

TICKED = '## Acceptance Criteria\n\n- [x] **AC1.** Holds.\n'
UNTICKED = '## Acceptance Criteria\n\n- [x] **AC1.** Holds.\n- [ ] **AC2.** Pending.\n'
DATE = '2026-10-10T12:00:00Z'


def closed(number: int, body: str = TICKED, reason: str = 'completed', repo: str = 'o/r') -> dict:
    record = issue(number, f'Work {number}', state='closed', closed=DATE, body=body, repo=repo)
    record['state_reason'] = reason
    return record


def link(number: int, state: str = 'MERGED', repo: str = 'o/r') -> dict:
    return {'repo': repo, 'number': number, 'state': state}


class Sweep(unittest.TestCase):
    def sweep(self, issues, development):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'issues.json').write_text(json.dumps(issues))
            (root / 'development.json').write_text(
                development if isinstance(development, str) else json.dumps(development))
            return run('closure-sweep.py', '--issues', str(root / 'issues.json'),
                       '--development', str(root / 'development.json'))

    def test_supported_closures_list_nothing(self):
        result = self.sweep([closed(2), closed(3)], {'2': [link(9)], '3': []})
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('0 closed issue(s) listed', result.stdout)

    def test_a_completed_issue_with_unticked_criteria_is_listed_with_its_reason(self):
        result = self.sweep([closed(2, UNTICKED)], {'2': []})
        self.assertEqual(result.returncode, 1)
        self.assertIn('unsupported: o/r#2 closed as completed: acceptance criteria are missing or unticked',
                      result.stdout)

    def test_a_completed_issue_without_criteria_is_listed(self):
        result = self.sweep([closed(2, '## Overview\n\nWork.\n')], {'2': []})
        self.assertIn('o/r#2 closed as completed: acceptance criteria are missing or unticked', result.stdout)

    def test_a_transferred_issue_is_listed_as_not_planned(self):
        result = self.sweep([closed(2, UNTICKED, 'not_planned')], {'2': []})
        self.assertEqual(result.returncode, 1)
        self.assertIn('o/r#2 closed as not_planned: acceptance criteria are missing or unticked', result.stdout)

    def test_an_unmerged_linked_pull_request_is_listed(self):
        development = {'2': [link(9), link(10, 'CLOSED'), link(11, 'OPEN', 'o/s')]}
        result = self.sweep([closed(2)], development)
        self.assertEqual(result.returncode, 1)
        self.assertIn('o/r#2 closed as completed: o/r#10 not merged (closed); o/s#11 not merged (open)',
                      result.stdout)
        self.assertNotIn('o/r#9 not merged', result.stdout)

    def test_an_issue_without_captured_links_is_unevaluable(self):
        for development in ({}, {'2': None}, {'2': 'none'}):
            with self.subTest(development=development):
                result = self.sweep([closed(2)], development)
                self.assertEqual(result.returncode, 1)
                self.assertIn('unevaluable: o/r#2 closed as completed: Development links not captured',
                              result.stdout)

    def test_a_missing_state_reason_is_named_unknown(self):
        result = self.sweep([closed(2, UNTICKED, None)], {'2': []})
        self.assertIn('o/r#2 closed as unknown:', result.stdout)

    def test_open_issues_and_pull_requests_are_skipped(self):
        pull = closed(4, '')
        pull['pull_request'] = {'url': 'https://api.github.com/repos/o/r/pulls/4'}
        result = self.sweep([issue(2, 'Open', body=UNTICKED), pull], {})
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_unreadable_evidence_blocks_the_sweep(self):
        for development in ('not json', '[]'):
            with self.subTest(development=development):
                result = self.sweep([closed(2)], development)
                self.assertEqual(result.returncode, 1)
                self.assertIn('sweep blocked: unreadable evidence', result.stdout)

    def test_issues_from_two_repositories_block_the_sweep(self):
        result = self.sweep([closed(2), closed(3, repo='o/s')], {'2': [], '3': []})
        self.assertEqual(result.returncode, 1)
        self.assertIn('the issues span o/r, o/s', result.stdout)

    def test_the_sweep_reads_the_issue_end_capture(self):
        """A repository holding a transferred and an unproven closure, captured by links-by-issue.py."""
        issues = [closed(2), closed(3, UNTICKED, 'not_planned'), closed(4), issue(5, 'Open')]
        relation = {('o/r', 950): [('o/r', 2)], ('o/r', 951): [('o/r', 4)]}
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            done, out = issue_end(root, tracker(root, relation, states={951: 'OPEN'}), issues)
            self.assertEqual(done.returncode, 0, done.stderr)
            result = run('closure-sweep.py', '--issues', str(root / 'issues.json'), '--development', str(out))
        self.assertEqual(result.returncode, 1)
        lines = result.stdout.splitlines()
        self.assertEqual(lines, [
            'unsupported: o/r#3 closed as not_planned: acceptance criteria are missing or unticked - Work 3',
            'unsupported: o/r#4 closed as completed: o/r#951 not merged (open) - Work 4',
            '2 closed issue(s) listed'])


if __name__ == '__main__':
    unittest.main()
