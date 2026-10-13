"""Project and sandbox path boundaries, including linked worktrees."""

import os
from pathlib import Path
import tempfile
import subprocess
import unittest
from unittest.mock import patch

from contracts import Request
from policy import evaluate
import project_scripts
from redirect_fs_mutation import writable_roots


class PathTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.project = self.base / 'project with spaces'
        repository = self.base / 'repository'
        subprocess.run(['git', 'init', '-q', str(repository)], check=True)
        subprocess.run(['git', '-C', str(repository), '-c', 'user.name=Harness Test',
                        '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false',
                        'commit', '-q', '--allow-empty', '-m', 'Fixture'], check=True)
        subprocess.run(['git', '-C', str(repository), 'worktree', 'add', '-q', '-b', 'fixture',
                        str(self.project)], check=True)
        (self.project / 'script.py').write_text('pass')
        self.other = self.base / 'other'
        self.other.mkdir()
        (self.other / 'script.py').write_text('pass')
        (self.project / 'escape.py').symlink_to(self.other / 'script.py')
        self.addCleanup(patch.stopall)
        patch.object(project_scripts, 'PROJECTS_BASE', str(self.base)).start()
        patch.dict(os.environ, {'SBX_PROJECTS_BASE': str(self.base), 'SBX_EXTRA_ROOTS': ''}).start()

    def test_linked_worktree_script_and_symlink_escape(self):
        self.assertEqual(project_scripts.resolve_project_local_script('python3 script.py', str(self.project)),
                         str(self.project / 'script.py'))
        self.assertIsNone(project_scripts.resolve_project_local_script('python3 escape.py', str(self.project)))
        self.assertEqual(evaluate(Request('shell', 'python3 escape.py', str(self.project))).action, 'deny')

    def test_leading_cd_changes_script_location(self):
        command = f'cd "{self.project}" && python3 script.py'
        self.assertEqual(evaluate(Request('shell', command, str(self.other))).action, 'allow')

    def test_extra_roots_require_projects_boundary(self):
        with patch.dict(os.environ, {'SBX_EXTRA_ROOTS': f'{self.other}:/etc'}):
            roots = writable_roots(str(self.project))
        self.assertIn(str(self.project), roots)
        self.assertIn(str(self.other), roots)
        self.assertNotIn('/etc', roots)

    def test_mutation_outside_roots_delegates(self):
        self.assertEqual(evaluate(Request('shell', 'rm /etc/harness-test-fixture', str(self.project))).action, 'abstain')


if __name__ == '__main__':
    unittest.main()
