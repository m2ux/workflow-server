"""Validate a retained task worktree against its recorded preparation.

Usage:
  python3 delivery-branches.py --project PROJECT --worktree WORKTREE
      --branch TASK_BRANCH --head PREPARED_HEAD
"""
import argparse
import json
import os
import re
import subprocess
from pathlib import Path


def git(checkout: Path, *args: str) -> str:
    result = subprocess.run(['git', '-C', str(checkout), *args], text=True,
                            capture_output=True, env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'})
    if result.returncode:
        raise ValueError(result.stderr.strip() or 'Git could not read the worktree')
    return result.stdout.strip()


def validate(project: Path, worktree: Path, branch: str, head: str) -> dict:
    """A registered, clean task checkout at its recorded branch and full revision."""
    project, worktree = project.resolve(), worktree.resolve()
    if not re.fullmatch(r'(?:[0-9a-f]{40}|[0-9a-f]{64})', head, re.IGNORECASE):
        raise ValueError('preparation head must be a full commit SHA')
    records = []
    for record in git(project, 'worktree', 'list', '--porcelain', '-z').split('\0\0'):
        fields = dict(field.partition(' ')[::2] for field in record.split('\0') if field)
        if 'worktree' in fields:
            records.append(fields)
    registered = next((record for record in records
                       if Path(record['worktree']).resolve() == worktree), None)
    if registered is None:
        raise ValueError('task worktree is not registered to the project repository')
    common = ('rev-parse', '--path-format=absolute', '--git-common-dir')
    if git(project, *common) != git(worktree, *common):
        raise ValueError('task worktree belongs to another repository')
    if registered.get('branch') != f'refs/heads/{branch}':
        raise ValueError('task worktree is not on its recorded branch')
    actual = git(worktree, 'rev-parse', 'HEAD')
    if actual != head.lower():
        raise ValueError('task worktree is not at its recorded preparation head')
    if git(worktree, 'status', '--porcelain', '--untracked-files=all'):
        raise ValueError('task worktree has tracked or untracked changes')
    return {'worktree': str(worktree), 'branch': branch, 'head': actual}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True, type=Path)
    parser.add_argument('--worktree', required=True, type=Path)
    parser.add_argument('--branch', required=True)
    parser.add_argument('--head', required=True)
    args = parser.parse_args()
    try:
        result = validate(args.project, args.worktree, args.branch, args.head)
    except (OSError, ValueError) as error:
        parser.exit(1, f'task worktree: {error}\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
