"""The renumber refusal of a map that moves an identifier delivered work carries.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, pr, run, url

NOTHING_WRITTEN = 'Nothing was written.'


def renumber(files: dict[str, str], *args: str, prs: list[dict] = ()) -> tuple[int, str, dict[str, str]]:
    """renumber.py over the named files, with the pull requests as JSON lines when given; returns
    its exit status, its output and each file as it stands afterwards."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        for name, text in files.items():
            (root / name).write_text(text)
        extra = []
        if prs:
            (root / 'prs.json').write_text('\n'.join(json.dumps(p) for p in prs))
            extra = ['--prs', str(root / 'prs.json')]
        resolved = [str(root / a) if a in files else a for a in args]
        done = run('renumber.py', *resolved, *extra)
        return done.returncode, done.stdout + done.stderr, {n: (root / n).read_text() for n in files}


class DeliveredTasks(unittest.TestCase):
    """Task mode: a row whose id links a pull request or commit keeps its number."""

    def body(self, first: str) -> str:
        return epic_body((first, 'Produce', ''), ('W02', 'Consume', 'W01'), ('W03', 'Extend', 'W02'))

    def test_a_map_moving_a_row_linking_a_pull_request_is_refused(self):
        body = self.body(f"[W01]({url('pull', 950)})")
        code, out, after = renumber({'E01.md': body}, '--initiative', '07', '--epic', '1',
                                    '--own', 'E01.md', '--tasks', '1:2,2:1')
        self.assertNotEqual(code, 0)
        self.assertIn('work a pull request names keeps its number: E01:W01', out)
        self.assertIn(NOTHING_WRITTEN, out)
        self.assertEqual(after['E01.md'], body)

    def test_a_map_moving_a_row_linking_a_commit_is_refused(self):
        body = self.body('[W01](https://github.com/o/r/commit/abc1234)')
        code, out, after = renumber({'E01.md': body}, '--initiative', '07', '--epic', '1',
                                    '--own', 'E01.md', '--tasks', '1:3,3:1')
        self.assertNotEqual(code, 0)
        self.assertIn('E01:W01', out)
        self.assertEqual(after['E01.md'], body)

    def test_a_refusal_writes_no_file_it_was_given(self):
        body = self.body(f"[W01]({url('pull', 950)})")
        other = 'Consumes I07 E01 W01 and E01:W02.\n'
        code, _, after = renumber({'E01.md': body, 'E02.md': other}, '--initiative', '07', '--epic', '1',
                                  '--own', 'E01.md', '--tasks', '1:2,2:1', 'E02.md')
        self.assertNotEqual(code, 0)
        self.assertEqual(after['E02.md'], other)

    def test_a_map_moving_only_undelivered_rows_is_applied(self):
        body = self.body(f"[W01]({url('pull', 950)})")
        code, out, after = renumber({'E01.md': body}, '--initiative', '07', '--epic', '1',
                                    '--own', 'E01.md', '--tasks', '2:3,3:2')
        self.assertEqual(code, 0, out)
        self.assertIn('| W03 | Consume | AC1 | W01 |', after['E01.md'])
        self.assertIn('| W02 | Extend | AC1 | W03 |', after['E01.md'])
        self.assertIn(f"[W01]({url('pull', 950)})", after['E01.md'])

    def test_a_row_linking_its_task_issue_is_free_to_move(self):
        body = self.body(f"[W01]({url('issues', 637)})")
        code, out, after = renumber({'E01.md': body}, '--initiative', '07', '--epic', '1',
                                    '--own', 'E01.md', '--tasks', '1:2,2:1')
        self.assertEqual(code, 0, out)
        self.assertIn(f"[W02]({url('issues', 637)})", after['E01.md'])


class DeliveredEpics(unittest.TestCase):
    """Epic mode: an epic a pull request title names keeps its number."""

    TEXT = 'E00 feeds E01, and I07:E01 W02 consumes E00 W01. I03 E01 belongs elsewhere.\n'

    def test_a_map_moving_an_epic_a_pull_request_names_is_refused(self):
        for pull in (pr(950, '[I07:E01] Work'), pr(951, '[I07:E01] Work', merged='2026-09-01T00:00:00Z')):
            with self.subTest(state=pull['state']):
                code, out, after = renumber({'I07.md': self.TEXT}, '--initiative', '07', '--map', '0:1,1:0',
                                            'I07.md', prs=[pull])
                self.assertNotEqual(code, 0)
                self.assertIn('work a pull request names keeps its number: E01', out)
                self.assertIn(NOTHING_WRITTEN, out)
                self.assertEqual(after['I07.md'], self.TEXT)

    def test_a_pull_request_of_another_initiative_names_no_epic_here(self):
        code, out, after = renumber({'I07.md': self.TEXT}, '--initiative', '07', '--map', '0:1,1:0',
                                    'I07.md', prs=[pr(950, '[I03:E01] Work')])
        self.assertEqual(code, 0, out)
        self.assertIn('E01 feeds E00', after['I07.md'])
        self.assertIn('I03 E01 belongs elsewhere', after['I07.md'])

    def test_an_initiative_pull_request_naming_no_epic_holds_no_number(self):
        code, out, after = renumber({'I07.md': self.TEXT}, '--initiative', '07', '--map', '0:1,1:0',
                                    'I07.md', prs=[pr(950, '[I07] Work')])
        self.assertEqual(code, 0, out)
        self.assertIn('E01 feeds E00', after['I07.md'])


if __name__ == '__main__':
    unittest.main()
