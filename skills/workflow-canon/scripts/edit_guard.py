"""Return to the agent each corpus guard failure its branch introduces, at the edit that causes it.

A Claude Code PostToolUse hook for Edit, Write and MultiEdit. It reads the hook's JSON on stdin and
acts only when tool_input.file_path is a corpus definition file:

  - The file sits under corpus/ in a corpus tree: a git top-level holding a corpus/ directory.
  - It is a workflow.yaml, a file under an activities/, routines/, techniques/ or resources/
    folder, or a README.

Every other path exits 0 before any guard runs. A relative path resolves against the input's cwd.

The guards run in the server checkout at <workspace>/.project/main, as
  tsx guards/check-all.ts --corpus-only --json --verbose --root <corpus tree>
The workspace is the folder holding this script's skill: <workspace>/skills/workflow-canon/scripts/
for the source, <workspace>/.claude/skills/workflow-canon/scripts/ for the deployed copy. tsx is
the first node_modules/.bin/tsx found in the server checkout or above it.

A failure counts only when the branch introduced it:

  - The guards run over the corpus tree as edited. When every guard is clean, the hook exits 0.
  - Otherwise they also run over the tree's branch point, as branch_point.py finds it, checked out
    in a temporary worktree. guard_report.py compares the two runs guard by guard.
  - The branch point's run is cached in <cache>/edit-guard-<branch point>-<server HEAD>.json, so it
    is paid once per branch point and server commit. A cached run that lacks a guard the edited
    tree's run reports is measured again. While the server checkout has uncommitted changes, its
    HEAD does not name the guards that run, so the branch point is measured on every edit and no
    run is cached.

Usage:
  python3 edit_guard.py [--server DIR] [--guards CMD] [--cache DIR] < hook-input.json

  --server DIR   The server checkout to run the guards in, in place of <workspace>/.project/main.
                 Its git HEAD keys the cache, and git status says whether it has uncommitted
                 changes.
  --guards CMD   The guard runner, split as a shell word list, in place of tsx guards/check-all.ts.
                 It runs in the server checkout with the check-all arguments above appended,
                 prints check-all's verbose report as guard_report.py reads it, and exits as
                 check-all does: 0 clean, 1 findings, 2 unmeasured.
  --cache DIR    Where branch-point runs are kept, in place of <server>/.guard-cache.

Exit 0 when the path is not a corpus definition file, when every guard is clean, or when every
failure is present at the branch point. Exit 2 when the branch introduced a failure, with the
failing guards' output on stderr, which Claude Code returns to the agent. Exit 2 also, with the
reason on stderr, when the run cannot measure: unreadable input, no server checkout, no tsx, a
server checkout with no git HEAD, no branch point, a branch point that cannot be checked out, a
runner that exits other than 0 or 1 while every guard row reads PASS, or a guard that could not
measure where its verdict decides the outcome. No outcome exits with any other code.
"""
from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

from branch_point import BranchPointError, branch_point, checked_out, git
from guard_report import GuardRun, delta, parse

KIND_FOLDERS = {'activities', 'routines', 'techniques', 'resources'}
EXIT_PASS = 0
EXIT_BLOCK = 2
RULE = '────'


class Unmeasured(Exception):
    """The run could not measure; its message says why."""


def workspace_of(script: Path) -> Path:
    """The workspace holding this script's skill, for the source or the deployed copy."""
    skills = script.resolve().parents[2]
    return skills.parent.parent if skills.parent.name == '.claude' else skills.parent


def edited_path(hook_input: dict) -> Path | None:
    """The edited file's absolute path, or None when the input names none."""
    raw = (hook_input.get('tool_input') or {}).get('file_path')
    if not raw:
        return None
    path = Path(raw)
    if not path.is_absolute():
        path = Path(hook_input.get('cwd') or Path.cwd()) / path
    return path.resolve()


def is_definition(parts: tuple[str, ...]) -> bool:
    """Whether a path's parts, from corpus/ down, name a corpus definition file."""
    name = parts[-1]
    return (name == 'workflow.yaml' or Path(name).stem == 'README'
            or any(part in KIND_FOLDERS for part in parts[:-1]))


def corpus_tree(path: Path) -> Path | None:
    """The corpus tree holding path when path is a corpus definition file, else None."""
    if 'corpus' not in path.parts or not is_definition(path.parts):
        return None
    folder = path.parent
    while not folder.is_dir():
        folder = folder.parent
    top = git(folder, 'rev-parse', '--show-toplevel')
    if top is None or not (Path(top) / 'corpus').is_dir():
        return None
    rel = path.relative_to(top).parts
    return Path(top) if rel[0] == 'corpus' and is_definition(rel) else None


def find_tsx(server: Path) -> Path:
    for folder in (server, *server.parents):
        tsx = folder / 'node_modules' / '.bin' / 'tsx'
        if tsx.exists():
            return tsx
    raise Unmeasured(f'no node_modules/.bin/tsx in {server} or above it')


class Guards:
    """The corpus guards of one server checkout, run over a corpus tree."""

    def __init__(self, server: Path, command: str | None):
        if not server.is_dir() or not (command or (server / 'guards' / 'check-all.ts').is_file()):
            raise Unmeasured(f'no server checkout at {server}')
        self.server = server
        self.command = shlex.split(command) if command else [str(find_tsx(server)),
                                                             'guards/check-all.ts']

    def run(self, tree: Path) -> tuple[int, str, dict[str, GuardRun]]:
        """check-all's exit code, its report, and each guard's run over tree."""
        args = [*self.command, '--corpus-only', '--json', '--verbose', '--root', str(tree)]
        # Node drops what a pipe has not yet taken when a script calls process.exit, so the report
        # goes to a file, which it writes in full.
        with tempfile.TemporaryFile('w+') as out, tempfile.TemporaryFile('w+') as err:
            try:
                code = subprocess.run(args, cwd=self.server, stdout=out, stderr=err).returncode
            except OSError as failure:
                raise Unmeasured(f'could not start the guards: {failure}') from failure
            out.seek(0)
            err.seek(0)
            report, errors = out.read(), err.read()
        runs = parse(report, tree, self.server)
        if not runs:
            raise Unmeasured(f'the guards reported no run over {tree} (exit {code}):\n'
                             f'{report}{errors}')
        if code not in (0, 1) and all(r.code == 0 for r in runs.values()):
            raise Unmeasured(f'every guard row reads PASS over {tree}, yet the guards ended with '
                             f'exit {code}, so the report is not the whole run:\n{report}{errors}')
        return code, report, runs


class BaseCache:
    """Branch-point runs, one file per branch point and server commit. A server checkout with
    uncommitted changes reads and writes none."""

    def __init__(self, folder: Path, server: Path):
        head = git(server, 'rev-parse', 'HEAD')
        status = git(server, 'status', '--porcelain')
        if not head or status is None:
            raise Unmeasured(f'cannot read the git HEAD and status of the server checkout {server}')
        self.folder = folder
        self.server_head = head
        self.committed = status == ''

    def path(self, commit: str) -> Path:
        return self.folder / f'edit-guard-{commit}-{self.server_head}.json'

    def read(self, commit: str, ids: set[str]) -> dict[str, GuardRun] | None:
        if not self.committed:
            return None
        try:
            stored = json.loads(self.path(commit).read_text())
            runs = {r['id']: GuardRun(**r) for r in stored['runs']}
        except (OSError, ValueError, KeyError, TypeError):
            return None
        return runs if ids <= runs.keys() else None

    def write(self, commit: str, runs: dict[str, GuardRun]) -> None:
        if not self.committed:
            return
        self.folder.mkdir(parents=True, exist_ok=True)
        kept = [{'id': r.id, 'code': r.code, 'keys': r.keys} for r in runs.values()]
        fd, tmp = tempfile.mkstemp(dir=self.folder, suffix='.tmp')
        with os.fdopen(fd, 'w') as out:
            json.dump({'runs': kept}, out)
        os.replace(tmp, self.path(commit))


def base_runs(guards: Guards, cache: BaseCache, tree: Path, commit: str,
              ids: set[str]) -> dict[str, GuardRun]:
    runs = cache.read(commit, ids)
    if runs is None:
        with checked_out(tree, commit) as base:
            _, _, runs = guards.run(base)
        cache.write(commit, runs)
    return runs


def section(gid: str, body: str) -> str:
    return f'{RULE} {gid} {RULE}\n{body.rstrip()}\n'


def check(hook_input: dict, server: Path, command: str | None, cache_dir: Path | None) -> int:
    path = edited_path(hook_input)
    tree = corpus_tree(path) if path else None
    if tree is None:
        return EXIT_PASS
    guards = Guards(server, command)
    code, report, head = guards.run(tree)
    if code == 0 and all(r.code == 0 for r in head.values()):
        return EXIT_PASS
    try:
        ref, commit = branch_point(tree)
        cache = BaseCache(cache_dir or server / '.guard-cache', server)
        base = base_runs(guards, cache, tree, commit, set(head))
    except BranchPointError as err:
        raise Unmeasured(f'{err}. The guards report, over the edited tree:\n{report}') from err
    found = delta(base, head)
    against = f'{ref} @ {commit[:12]}'
    if found.added:
        sys.stderr.write(f'Corpus guards: {len(found.added)} guard(s) fail on what this branch '
                         f'introduced against {against}, after editing {path}:\n\n')
        sys.stderr.write('\n'.join(section(g, b) for g, b in found.added.items()))
    if found.unmeasured:
        sys.stderr.write(f'Corpus guards cannot measure {len(found.unmeasured)} guard(s) over '
                         f'{tree} against {against}:\n\n')
        sys.stderr.write('\n'.join(section(g, b) for g, b in found.unmeasured.items()))
    return EXIT_BLOCK if found.added or found.unmeasured else EXIT_PASS


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--server', type=Path, default=None)
    parser.add_argument('--guards', default=None)
    parser.add_argument('--cache', type=Path, default=None)
    args = parser.parse_args(argv)
    server = (args.server or workspace_of(Path(__file__)) / '.project' / 'main').resolve()
    try:
        hook_input = json.load(sys.stdin)
        return check(hook_input, server, args.guards, args.cache)
    except Unmeasured as err:
        sys.stderr.write(f'Corpus guards cannot measure this edit: {err}\n')
    except Exception as err:  # noqa: BLE001 — any failure is a run that could not measure
        sys.stderr.write(f'Corpus guards cannot measure this edit: {type(err).__name__}: {err}\n')
    return EXIT_BLOCK


if __name__ == '__main__':
    sys.exit(main())
