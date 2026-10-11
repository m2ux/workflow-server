"""Temporary corpus trees and server checkouts, a stub guard runner, and a runner for edit_guard.py
over them. Git reads no global or system configuration, so every repository is hermetic."""
import json
import os
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPTS = HERE.parent / 'scripts'
EDIT_GUARD = SCRIPTS / 'edit_guard.py'
STUB = HERE / 'stub_check_all.py'
BASE_PREFIX = 'workflow-canon-base-'
GIT_ENV = {'GIT_CONFIG_GLOBAL': os.devnull, 'GIT_CONFIG_NOSYSTEM': '1',
           'GIT_AUTHOR_NAME': 'Fixture', 'GIT_AUTHOR_EMAIL': 'fixture@example.com',
           'GIT_COMMITTER_NAME': 'Fixture', 'GIT_COMMITTER_EMAIL': 'fixture@example.com'}


def git(folder: Path, *args: str) -> str:
    run = subprocess.run(['git', *args], cwd=folder, capture_output=True, text=True,
                         env={**os.environ, **GIT_ENV})
    if run.returncode != 0:
        raise RuntimeError(f'git {" ".join(args)} failed in {folder}: {run.stderr}')
    return run.stdout.strip()


class Repo:
    """A git repository on branch main."""

    def __init__(self, path: Path):
        self.path = path
        path.mkdir(parents=True, exist_ok=True)
        git(path, 'init', '--quiet', '--initial-branch=main')

    def write(self, rel: str, text: str) -> Path:
        path = self.path / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def commit(self, message: str = 'Change') -> str:
        git(self.path, 'add', '--all')
        git(self.path, 'commit', '--quiet', '--allow-empty', '-m', message)
        return self.head()

    def head(self) -> str:
        return git(self.path, 'rev-parse', 'HEAD')

    def ref(self, name: str, commit: str) -> None:
        """Point refs/remotes/origin/<name> at commit."""
        git(self.path, 'update-ref', f'refs/remotes/origin/{name}', commit)

    def branch(self, name: str, commit: str) -> None:
        git(self.path, 'checkout', '--quiet', '-b', name, commit)

    def worktrees(self) -> int:
        return git(self.path, 'worktree', 'list', '--porcelain').count('worktree ')


class Corpus(Repo):
    """A corpus tree: a repository holding corpus/<workflow>/ definitions."""

    def __init__(self, path: Path):
        super().__init__(path)
        self.write('corpus/demo/workflow.yaml', 'id: demo\n')
        self.write('corpus/demo/activities/start.yaml', 'id: start\nsteps:\n  - one\n')
        self.write('scripts/tool.yaml', 'id: tool\n')

    def file(self, rel: str) -> Path:
        return self.path / 'corpus' / 'demo' / rel


def hook_input(file_path: str | Path, cwd: str | Path | None = None, tool: str = 'Edit') -> str:
    return json.dumps({'session_id': 'fixture', 'hook_event_name': 'PostToolUse', 'tool_name': tool,
                       'cwd': str(cwd or os.getcwd()),
                       'tool_input': {'file_path': str(file_path)}, 'tool_response': {}})


class Workspace(unittest.TestCase):
    """Each test gets a corpus tree, a committed server checkout, a cache folder, a call log and its
    own TMPDIR, and every hook run asserts that it left no branch-point checkout behind."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix='edit-guard-test-')).resolve()
        self.addCleanup(shutil.rmtree, self.tmp, ignore_errors=True)
        self.corpus = Corpus(self.tmp / 'corpus-tree')
        self.server = Repo(self.tmp / 'server')
        self.server.write('guards/check-all.ts', '// stand-in\n')
        self.server.commit('Server')
        self.cache = self.tmp / 'cache'
        self.log = self.tmp / 'calls.log'
        self.temp = self.tmp / 'temp'
        self.temp.mkdir()

    def stub(self, *options: str) -> str:
        return shlex.join([sys.executable, str(STUB), '--log', str(self.log), *options])

    def hook(self, stdin: str, *, server: Path | None = None, guards: str | None = None,
             stub: tuple[str, ...] = (), cache: Path | None = None,
             raw_args: tuple[str, ...] | None = None) -> subprocess.CompletedProcess:
        """edit_guard.py on stdin, with the stub runner unless guards or raw_args say otherwise."""
        args = raw_args if raw_args is not None else (
            '--server', str(server or self.server.path),
            '--guards', guards if guards is not None else self.stub(*stub),
            '--cache', str(cache or self.cache))
        run = subprocess.run([sys.executable, str(EDIT_GUARD), *args], input=stdin,
                             capture_output=True, text=True,
                             env={**os.environ, **GIT_ENV, 'TMPDIR': str(self.temp),
                                  'PYTHONDONTWRITEBYTECODE': '1'})
        self.assertIn(run.returncode, (0, 2), run.stderr)
        self.assertEqual(self.corpus.worktrees(), 1, 'a branch-point worktree is left registered')
        self.assertEqual([p.name for p in self.temp.iterdir() if p.name.startswith(BASE_PREFIX)], [],
                         'a branch-point checkout is left on disk')
        return run

    def edit(self, rel: str, **kwargs) -> subprocess.CompletedProcess:
        """The hook after an Edit of corpus/demo/<rel>."""
        return self.hook(hook_input(self.corpus.file(rel)), **kwargs)

    def calls(self) -> list[str]:
        """The roots the stub ran over, in order: the corpus tree as 'tree', and a branch point's
        checkout under this test's TMPDIR as 'base'."""
        if not self.log.exists():
            return []
        base = str(self.temp / BASE_PREFIX)
        return ['base' if line.startswith(base) else 'tree' if line == str(self.corpus.path) else line
                for line in self.log.read_text().splitlines()]

    def from_workflows(self) -> str:
        """Commit the corpus tree, point origin/workflows at it, and cut a feature branch there."""
        commit = self.corpus.commit('Base')
        self.corpus.ref('workflows', commit)
        self.corpus.branch('feature', commit)
        return commit
