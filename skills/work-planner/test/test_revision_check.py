"""An instrument runs at the commit a branch or tag resolves to, and the run leaves no checkout.

Each case builds a repository whose branch and tag sit on different commits, runs the helper
against one of them, and compares `git worktree list` before and after.
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import run

GIT = ('git', '-c', 'user.email=t@t', '-c', 'user.name=T', '-c', 'init.defaultBranch=main')

# Prints the checkout's commit and the file it holds, then exits with the status given.
INSTRUMENT = (
    'import subprocess, sys; '
    'print(subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()); '
    'print(open("state.txt").read().strip()); '
    'sys.exit(int(sys.argv[1]))'
)


def git(cwd, *args):
    return subprocess.run(GIT + args, cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


class RevisionCheck(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name, 'repo')
        self.repo.mkdir()
        git(self.repo, 'init')
        self.commits = {}
        for state in ('tagged', 'branched', 'checked-out'):
            (self.repo / 'state.txt').write_text(state)
            git(self.repo, 'add', 'state.txt')
            git(self.repo, 'commit', '-m', state)
            self.commits[state] = git(self.repo, 'rev-parse', 'HEAD')
            if state == 'tagged':
                git(self.repo, 'tag', 'v1')
            if state == 'branched':
                git(self.repo, 'branch', 'feature')

    def tearDown(self):
        self.tmp.cleanup()

    def worktrees(self):
        return git(self.repo, 'worktree', 'list', '--porcelain')

    def check(self, revision, status=0):
        before = self.worktrees()
        result = run('revision-check.py', '--project', str(self.repo), '--revision', revision,
                     '--', sys.executable, '-c', INSTRUMENT, str(status))
        self.assertEqual(self.worktrees(), before, 'the run left a worktree behind')
        return result

    def assert_ran_at(self, result, state):
        lines = result.stdout.splitlines()
        header = json.loads(lines[0])
        self.assertEqual(header['revision'], self.commits[state])
        self.assertEqual(lines[1:3], [self.commits[state], state])
        self.assertFalse(Path(header['checkout']).exists())
        self.assertFalse(Path(header['checkout']).parent.exists())

    def test_a_passing_instrument_runs_at_the_branch_commit(self):
        result = self.check('feature')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_ran_at(result, 'branched')

    def test_a_failing_instrument_runs_at_the_tag_commit_and_keeps_its_status(self):
        result = self.check('v1', status=3)
        self.assertEqual(result.returncode, 3, result.stderr)
        self.assert_ran_at(result, 'tagged')

    def test_an_instrument_exiting_2_keeps_its_status(self):
        result = self.check('v1', status=2)
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assert_ran_at(result, 'tagged')
        self.assertEqual(result.stderr, '')

    def test_a_usage_error_is_a_helper_failure(self):
        result = run('revision-check.py', '--project', str(self.repo), '--revision', 'v1')
        self.assertEqual(result.returncode, 125)
        self.assertIn('no command supplied', result.stderr)
        self.assertEqual(result.stdout, '')

    def test_a_branch_checked_out_elsewhere_is_still_checked_out(self):
        result = self.check('main')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_ran_at(result, 'checked-out')

    def test_an_unknown_revision_creates_no_checkout(self):
        result = self.check('missing')
        self.assertEqual(result.returncode, 125)
        self.assertIn('revision not found: missing', result.stderr)
        self.assertEqual(result.stdout, '')

    def test_a_command_that_cannot_start_is_reported_and_cleaned_up(self):
        before = self.worktrees()
        result = run('revision-check.py', '--project', str(self.repo), '--revision', 'v1',
                     '--', str(Path(self.tmp.name, 'absent')))
        self.assertEqual(result.returncode, 125)
        self.assertIn('command not started', result.stderr)
        self.assertEqual(self.worktrees(), before)

    def test_worktrees_the_run_did_not_create_are_left_alone(self):
        kept = Path(self.tmp.name, 'kept')
        stale = Path(self.tmp.name, 'stale')
        git(self.repo, 'worktree', 'add', '--detach', str(kept), 'v1')
        git(self.repo, 'worktree', 'add', '--detach', str(stale), 'v1')
        shutil.rmtree(stale)
        result = self.check('feature')
        self.assertEqual(result.returncode, 0, result.stderr)
        listed = self.worktrees()
        self.assertIn(str(kept), listed)
        self.assertIn(str(stale), listed)


if __name__ == '__main__':
    unittest.main()
