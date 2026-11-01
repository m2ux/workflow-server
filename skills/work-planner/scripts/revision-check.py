"""Run an instrument at the commit a supplied revision resolves to, in a checkout the run owns.

Usage:
  python3 revision-check.py --project <checkout> --revision <branch-tag-or-commit> -- <command> [args...]

The revision resolves to one commit first, so a branch or tag that moves during the run does not
change what the instrument sees. A detached checkout of that commit is created in a new temporary
directory, the command runs at its top level, and the checkout is removed whether the command
passes or fails. Detaching lets the commit be checked out while a branch at it is checked out
elsewhere.

The first line of standard output is {"revision": <commit>, "checkout": <path>}; the instrument's
own output follows. Exit status is the instrument's, whatever it is. A checkout that cannot be
removed is reported on standard error with its path, and the instrument's status stands.

The helper's own failures exit 125, as `git bisect run` reserves it, each with one line on standard
error naming the cause: a usage error, `revision not found:`, `checkout not created:`, or
`command not started:`. The first three come before any output; a command that cannot start is
reported after the first line, once its checkout exists. Worktrees the run did not create are left
as they are.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HELPER_FAILURE = 125


class Parser(argparse.ArgumentParser):
    """Arguments whose usage errors exit with the helper's own status."""

    def error(self, message: str):
        self.print_usage(sys.stderr)
        self.exit(HELPER_FAILURE, f'{self.prog}: error: {message}\n')


def git(project: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(['git', *args], cwd=project, capture_output=True, text=True)


def resolve(project: str, revision: str) -> str | None:
    """The commit a branch, tag or commit names, or None when it names none."""
    found = git(project, 'rev-parse', '--verify', '--quiet', '--end-of-options', f'{revision}^{{commit}}')
    return found.stdout.strip() if found.returncode == 0 else None


def remove(project: str, root: Path, tree: Path) -> str | None:
    """Remove the run's own checkout and its directory; the reason it could not, or None."""
    removed = git(project, 'worktree', 'remove', '--force', str(tree))
    if removed.returncode != 0:
        return removed.stderr.strip() or f'git worktree remove exited {removed.returncode}'
    shutil.rmtree(root, ignore_errors=True)
    return f'directory remains: {root}' if root.exists() else None


def main() -> int:
    parser = Parser(description=__doc__.splitlines()[0])
    parser.add_argument('--project', required=True, help='any checkout of the repository')
    parser.add_argument('--revision', required=True, help='branch, tag or commit to verify')
    parser.add_argument('command', nargs=argparse.REMAINDER, help='the instrument, after --')
    args = parser.parse_args()

    command = args.command[1:] if args.command[:1] == ['--'] else args.command
    if not command:
        parser.error('no command supplied after --')

    commit = resolve(args.project, args.revision)
    if commit is None:
        print(f'revision not found: {args.revision}', file=sys.stderr)
        return HELPER_FAILURE

    root = Path(tempfile.mkdtemp(prefix='revision-check-'))
    tree = root / commit[:12]
    added = git(args.project, 'worktree', 'add', '--detach', str(tree), commit)
    if added.returncode != 0:
        shutil.rmtree(root, ignore_errors=True)
        print(f'checkout not created: {added.stderr.strip()}', file=sys.stderr)
        return HELPER_FAILURE

    status = HELPER_FAILURE
    try:
        print(json.dumps({'revision': commit, 'checkout': str(tree)}), flush=True)
        try:
            code = subprocess.run(command, cwd=tree).returncode
            status = code if code >= 0 else 128 - code
        except OSError as error:
            print(f'command not started: {error}', file=sys.stderr)
    finally:
        failure = remove(args.project, root, tree)
        if failure:
            print(f'checkout not removed: {tree}: {failure}', file=sys.stderr)
    return status


if __name__ == '__main__':
    sys.exit(main())
