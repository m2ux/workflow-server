"""Find a corpus tree's branch point, and check it out beside the tree.

The branch point is the nearest of the merge-bases of the tree's HEAD with origin/workflows and with
each origin/iNN/workflows integration branch: the one with the fewest commits between it and HEAD.
A branch cut from an initiative's integration branch measures against that branch, and every other
branch against origin/workflows. The remote-tracking refs are read as they stand; nothing is fetched.
"""
from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

INTEGRATION = re.compile(r'^refs/remotes/origin/(?:workflows|i\d\d/workflows)$')


class BranchPointError(Exception):
    """The branch point cannot be found or checked out; the message says why."""


def git(tree: Path, *args: str) -> str | None:
    """A git command's trimmed stdout in tree, or None when it fails."""
    run = subprocess.run(['git', *args], cwd=tree, capture_output=True, text=True)
    return run.stdout.strip() if run.returncode == 0 else None


def integration_refs(tree: Path) -> list[str]:
    listing = git(tree, 'for-each-ref', '--format=%(refname)', 'refs/remotes/origin/') or ''
    return sorted(ref for ref in listing.splitlines() if INTEGRATION.match(ref))


def branch_point(tree: Path) -> tuple[str, str]:
    """The nearest integration ref's short name and its merge-base with HEAD."""
    refs = integration_refs(tree)
    if not refs:
        raise BranchPointError(f'{tree} has no origin/workflows or origin/iNN/workflows ref')
    candidates = []
    for ref in refs:
        base = git(tree, 'merge-base', 'HEAD', ref)
        if base:
            distance = int(git(tree, 'rev-list', '--count', f'{base}..HEAD') or 0)
            candidates.append((distance, ref, base))
    if not candidates:
        raise BranchPointError(f'HEAD of {tree} has no merge-base with {", ".join(refs)}')
    _, ref, base = min(candidates)
    return ref.removeprefix('refs/remotes/'), base


@contextmanager
def checked_out(tree: Path, commit: str) -> Iterator[Path]:
    """A detached worktree of tree's repository at commit, removed on exit."""
    holder = Path(tempfile.mkdtemp(prefix='workflow-canon-base-'))
    path = holder / 'tree'
    added = subprocess.run(['git', 'worktree', 'add', '--detach', '--quiet', str(path), commit],
                           cwd=tree, capture_output=True, text=True)
    try:
        if added.returncode != 0:
            raise BranchPointError(f'could not check out {commit[:12]}: {added.stderr.strip()}')
        yield path
    finally:
        if added.returncode == 0:
            subprocess.run(['git', 'worktree', 'remove', '--force', str(path)], cwd=tree,
                           capture_output=True)
        shutil.rmtree(holder, ignore_errors=True)
