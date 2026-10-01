"""Run the corpus guards after an edit to a corpus definition file.

A Claude Code PostToolUse hook for Edit, Write and MultiEdit. It reads the hook's JSON on stdin and
acts only when tool_input.file_path is a corpus definition file:

  - The file sits under corpus/ in a corpus tree: a git top-level holding a corpus/ directory.
  - It is a workflow.yaml, a file under an activities/, routines/, techniques/ or resources/
    folder, or a README.

Every other path exits 0 before any guard runs. A relative path resolves against the input's cwd.

The guards run in the server checkout at <workspace>/.project/main, as
  tsx guards/check-all.ts --corpus-only --root <corpus tree>
The workspace is the folder holding this script's skill: <workspace>/skills/workflow-canon/scripts/
for the source, <workspace>/.claude/skills/workflow-canon/scripts/ for the deployed copy. tsx is
the first node_modules/.bin/tsx found in the server checkout or above it.

Usage:
  python3 edit_guard.py [--server DIR] [--guards CMD] < hook-input.json

  --server DIR   The server checkout to run the guards in, in place of <workspace>/.project/main.
  --guards CMD   The guard runner, split as a shell word list, in place of tsx guards/check-all.ts.
                 It runs in the server checkout with the check-all arguments above appended, and
                 answers in check-all's exit codes: 0 clean, 1 findings, 2 unmeasured.

Exit 0 when the path is not a corpus definition file, or when every guard is clean. Exit 2 when a
guard reports findings, with the guard output on stderr, which Claude Code returns to the agent.
Exit 2 also when the run cannot measure: unreadable input, no server checkout, no tsx, or a guard
that could not measure. No outcome exits with any other code.
"""
from __future__ import annotations

import argparse
import json
import shlex
import subprocess
import sys
from pathlib import Path

KIND_FOLDERS = {'activities', 'routines', 'techniques', 'resources'}
EXIT_PASS = 0
EXIT_BLOCK = 2


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


def git_top(path: Path) -> Path | None:
    """The git top-level holding path, or None when it is in no git work tree."""
    folder = path.parent
    while not folder.is_dir():
        folder = folder.parent
    run = subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=folder,
                         capture_output=True, text=True)
    return Path(run.stdout.strip()) if run.returncode == 0 else None


def corpus_tree(path: Path) -> Path | None:
    """The corpus tree holding path when path is a corpus definition file, else None."""
    if 'corpus' not in path.parts or not is_definition(path.parts):
        return None
    top = git_top(path)
    if top is None or not (top / 'corpus').is_dir():
        return None
    rel = path.relative_to(top).parts
    return top if rel[0] == 'corpus' and is_definition(rel) else None


def find_tsx(server: Path) -> Path:
    for folder in (server, *server.parents):
        tsx = folder / 'node_modules' / '.bin' / 'tsx'
        if tsx.exists():
            return tsx
    raise Unmeasured(f'no node_modules/.bin/tsx in {server} or above it')


def guard_command(server: Path, guards: str | None) -> list[str]:
    if guards:
        return shlex.split(guards)
    return [str(find_tsx(server)), 'guards/check-all.ts']


def run_guards(command: list[str], server: Path, tree: Path) -> subprocess.CompletedProcess:
    try:
        return subprocess.run([*command, '--corpus-only', '--root', str(tree)], cwd=server,
                              capture_output=True, text=True)
    except OSError as err:
        raise Unmeasured(f'could not start the guards: {err}') from err


def check(hook_input: dict, server: Path, guards: str | None) -> int:
    path = edited_path(hook_input)
    tree = corpus_tree(path) if path else None
    if tree is None:
        return EXIT_PASS
    if not server.is_dir() or not (guards or (server / 'guards' / 'check-all.ts').is_file()):
        raise Unmeasured(f'no server checkout at {server}')
    run = run_guards(guard_command(server, guards), server, tree)
    if run.returncode == 0:
        return EXIT_PASS
    if run.returncode == 1:
        sys.stderr.write(f'Corpus guards report findings in {tree} after editing {path}:\n')
    else:
        sys.stderr.write(f'Corpus guards could not measure {tree} (exit {run.returncode}):\n')
    sys.stderr.write(run.stdout + run.stderr)
    return EXIT_BLOCK


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--server', type=Path, default=None)
    parser.add_argument('--guards', default=None)
    args = parser.parse_args(argv)
    server = (args.server or workspace_of(Path(__file__)) / '.project' / 'main').resolve()
    try:
        hook_input = json.load(sys.stdin)
        return check(hook_input, server, args.guards)
    except Unmeasured as err:
        sys.stderr.write(f'Corpus guards cannot measure this edit: {err}.\n')
    except Exception as err:  # noqa: BLE001 — any failure is a run that could not measure
        sys.stderr.write(f'Corpus guards cannot measure this edit: {type(err).__name__}: {err}.\n')
    return EXIT_BLOCK


if __name__ == '__main__':
    sys.exit(main())
