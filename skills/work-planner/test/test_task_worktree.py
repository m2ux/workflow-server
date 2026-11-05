"""Retained preparations validate and preserve real Git task worktrees."""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import git, repository, run


class RetainedTaskWorktree(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.project = self.root / 'project'
        self.head = repository(self.project, 'workspace')
        self.unit = self.root / 'task with spaces'
        self.branch = 'i07/e00/w01-work'
        git(self.project, 'worktree', 'add', str(self.unit), '-b', self.branch, self.head)

    def check(self, **changes):
        values = {'project': self.project, 'worktree': self.unit,
                  'branch': self.branch, 'head': self.head, **changes}
        args = [arg for name, value in values.items() for arg in (f'--{name}', str(value))]
        return run('delivery-branches.py', *args)

    def test_a_prepared_worktree_is_reused_after_capacity_returns(self):
        before = git(self.project, 'worktree', 'list', '--porcelain')
        for _ in range(2):
            checked = self.check()
            self.assertEqual(checked.returncode, 0, checked.stderr)
            self.assertEqual(json.loads(checked.stdout), {
                'worktree': str(self.unit), 'branch': self.branch, 'head': self.head})
        self.assertEqual(git(self.project, 'worktree', 'list', '--porcelain'), before)

    def test_a_foreign_repository_is_rejected(self):
        other = self.root / 'other'
        repository(other, 'workspace')
        checked = self.check(project=other)
        self.assertEqual(checked.returncode, 1)
        self.assertIn('not registered', checked.stderr)
        self.assertEqual(git(self.unit, 'rev-parse', 'HEAD'), self.head)

    def test_a_branch_mismatch_preserves_the_checkout(self):
        git(self.unit, 'switch', '-c', 'another-task')
        checked = self.check()
        self.assertEqual(checked.returncode, 1)
        self.assertIn('recorded branch', checked.stderr)
        self.assertEqual(git(self.unit, 'branch', '--show-current'), 'another-task')

    def test_a_revision_mismatch_preserves_the_commit(self):
        git(self.unit, 'commit', '--allow-empty', '-m', 'task state')
        actual = git(self.unit, 'rev-parse', 'HEAD')
        checked = self.check()
        self.assertEqual(checked.returncode, 1)
        self.assertIn('preparation head', checked.stderr)
        self.assertEqual(git(self.unit, 'rev-parse', 'HEAD'), actual)

    def test_detached_head_is_rejected(self):
        git(self.unit, 'checkout', '--detach', self.head)
        checked = self.check()
        self.assertEqual(checked.returncode, 1)
        self.assertIn('recorded branch', checked.stderr)

    def test_tracked_changes_are_preserved(self):
        content = self.unit / 'config' / 'branches'
        content.write_text('workspace\nmain\n')
        checked = self.check()
        self.assertEqual(checked.returncode, 1)
        self.assertIn('tracked or untracked changes', checked.stderr)
        self.assertEqual(content.read_text(), 'workspace\nmain\n')

    def test_untracked_changes_are_preserved(self):
        content = self.unit / 'work.txt'
        content.write_text('held work\n')
        checked = self.check()
        self.assertEqual(checked.returncode, 1)
        self.assertIn('tracked or untracked changes', checked.stderr)
        self.assertEqual(content.read_text(), 'held work\n')

    def test_a_full_recorded_revision_is_required(self):
        checked = self.check(head='HEAD')
        self.assertEqual(checked.returncode, 1)
        self.assertIn('full commit SHA', checked.stderr)
