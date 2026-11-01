"""The closure gate passes on the issue and its Development links, the evidence GitHub exposes."""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import issue, run
from test_link_capture import issue_end, tracker

BODY = '## Acceptance Criteria\n\n- [x] **AC1.** Holds.\n'


def link(number: int, state: str = 'MERGED', repo: str = 'o/r') -> dict:
    return {'repo': repo, 'number': number, 'state': state}


class Closure(unittest.TestCase):
    def check(self, development, body=BODY, repository: str = 'o/r'):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'issue.json').write_text(json.dumps(issue(2, 'Standalone: Work', body=body)))
            (root / 'development.json').write_text(development if isinstance(development, str) else
                                                   json.dumps({'repository': repository, 'issues': development}))
            return run('closure.py', '--issue', str(root / 'issue.json'),
                       '--development', str(root / 'development.json'))

    def test_every_linked_pr_must_merge(self):
        blocked = self.check({'2': [link(9), link(10, 'OPEN')]})
        self.assertEqual(blocked.returncode, 1)
        self.assertIn('closure blocked: o/r#10 not merged (open)', blocked.stdout)
        self.assertNotIn('o/r#9', blocked.stdout)
        self.assertEqual(self.check({'2': [link(9), link(10)]}).returncode, 0)

    def test_a_closed_unmerged_pr_blocks(self):
        result = self.check({'2': [link(9, 'CLOSED')]})
        self.assertEqual(result.returncode, 1)
        self.assertIn('o/r#9 not merged (closed)', result.stdout)

    def test_same_number_in_different_repositories_is_distinct(self):
        result = self.check({'2': [link(9), link(9, 'OPEN', 'o/other')]})
        self.assertEqual(result.returncode, 1)
        self.assertIn('o/other#9 not merged (open)', result.stdout)
        self.assertNotIn('o/r#9 not merged', result.stdout)

    def test_an_empty_development_field_adds_no_requirement(self):
        result = self.check({'2': []})
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('closure gate: passed', result.stdout)

    def test_links_never_read_are_missing_evidence(self):
        for development in ({}, {'3': []}, {'2': None}, {'2': 'none'}):
            with self.subTest(development=development):
                result = self.check(development)
                self.assertEqual(result.returncode, 1)
                self.assertIn('closure blocked: Development links not captured', result.stdout)

    def test_a_snapshot_of_another_repository_blocks(self):
        result = self.check({'2': []}, repository='o/other')
        self.assertEqual(result.returncode, 1)
        self.assertIn('closure blocked: unreadable evidence (the Development snapshot holds o/other issues, '
                      'not o/r)', result.stdout)

    def test_a_snapshot_naming_the_repository_in_another_case_passes(self):
        result = self.check({'2': []}, repository='O/R')
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('closure gate: passed', result.stdout)

    def test_unticked_or_absent_criteria_block(self):
        for body in (BODY.replace('[x]', '[ ]'), ''):
            with self.subTest(body=body):
                result = self.check({'2': []}, body=body)
                self.assertEqual(result.returncode, 1)
                self.assertIn('acceptance criteria are missing or unticked', result.stdout)

    def test_unreadable_evidence_blocks(self):
        for development in ('not json', '[]', '{"2": []}',
                            '{"repository": "o/r", "issues": {"2": [{"state": "MERGED"}]}}'):
            with self.subTest(development=development):
                result = self.check(development)
                self.assertEqual(result.returncode, 1)
                self.assertIn('closure blocked: unreadable evidence', result.stdout)
        result = run('closure.py', '--issue', '/nonexistent/issue.json', '--development', '/nonexistent/development.json')
        self.assertEqual(result.returncode, 1)
        self.assertIn('unreadable evidence', result.stdout)

    def test_no_input_beyond_the_issue_and_its_links(self):
        result = run('closure.py', '--help')
        self.assertEqual(result.returncode, 0)
        flags = {word.strip('[],') for word in result.stdout.split() if word.startswith(('--', '[--'))}
        self.assertEqual(flags - {'--help'}, {'--issue', '--development'})


class DeliveredTask(unittest.TestCase):
    """A delivered task issue carried from the tracker through links-by-issue.py into the gate."""

    def gate(self, states: dict[int, str], unread: tuple[int, ...] = ()):
        delivered = issue(2, '[I01:E00] W01 Work', body=BODY)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            env = tracker(root, {('o/r', 950): [('o/r', 2)]}, states=states, unread=unread)
            done, out = issue_end(root, env, [delivered])
            (root / 'issue.json').write_text(json.dumps(delivered))
            return done, run('closure.py', '--issue', str(root / 'issue.json'), '--development', str(out))

    def test_a_delivered_task_passes_on_its_captured_links(self):
        done, result = self.gate({})
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(result.stdout.strip(), 'closure gate: passed; normal delivery checks must also pass')

    def test_an_open_delivery_keeps_the_task_open(self):
        _, result = self.gate({950: 'OPEN'})
        self.assertEqual(result.returncode, 1)
        self.assertIn('closure blocked: o/r#950 not merged (open)', result.stdout)

    def test_an_unread_relation_leaves_no_evidence_to_pass_on(self):
        done, result = self.gate({}, unread=(2,))
        self.assertEqual(done.returncode, 1)
        self.assertEqual(result.returncode, 1)
        self.assertIn('closure blocked: unreadable evidence', result.stdout)


if __name__ == '__main__':
    unittest.main()
