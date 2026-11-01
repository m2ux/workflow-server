"""Add or remove one pull request in an issue's Development relation, and read the result back.

Usage:
  python3 development-link.py add --issue owner/repo#637 --pull owner/repo#950
  python3 development-link.py remove --issue owner/repo#637 --pull owner/repo#950

The issue and the pull request may sit in different repositories. Each node id is read through REST,
and the mutation, addCloseIssueReferences or removeCloseIssueReferences, is written to a query file
and sent with `gh api graphql -F query=@file`, so no command carries a GraphQL variable.

The issue's relation is read before the write, and both ends after it, through the batched read
the link captures run. An add holds when the issue lists the pull request exactly once, the pull
request lists the issue, and every other link on the issue stands; a repeated add holds the same
way. A removal holds when neither end lists the other and every other link on the issue stands.
Repository names match in any case, as the tracker resolves them.

Exit 0 prints the verified relation from both ends. Exit 1 prints `failed:` with the operation,
the step and the tracker's error, or `discrepancy:` with the relation read back. An unreadable
relation is a failed readback, never an empty link set. The script calls `gh` itself, so it runs
where `gh` reaches the tracker.
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

from development import ISSUE, PULL_REQUEST, End, Key, read

MUTATIONS = {'add': 'addCloseIssueReferences', 'remove': 'removeCloseIssueReferences'}
SUBJECT = re.compile(r'([\w.-]+/[\w.-]+)#(\d+)')


class Failed(Exception):
    """A step that did not complete, with what the tracker said."""

    def __init__(self, step: str, error: str):
        super().__init__(f'{step}: {error}')


def subject(text: str) -> Key:
    match = SUBJECT.fullmatch(text)
    if not match:
        raise argparse.ArgumentTypeError(f'{text!r} is not owner/repo#number')
    return match[1], int(match[2])


def same(key: Key) -> Key:
    """The key repository names compare by, in any case."""
    return key[0].lower(), key[1]


def name(key: Key) -> str:
    return f'{key[0]}#{key[1]}'


def error(out: subprocess.CompletedProcess) -> str:
    """The tracker's error: each GraphQL error message, or what gh printed."""
    try:
        errors = json.loads(out.stdout).get('errors') or []
    except (json.JSONDecodeError, AttributeError):
        errors = []
    messages = [e.get('message', '') for e in errors if isinstance(e, dict)]
    text = '; '.join(m for m in messages if m) or (out.stderr or out.stdout).strip()
    return text[:400] or f'gh exited {out.returncode}'


def gh(step: str, *args: str) -> dict | str:
    """The tracker's answer to one gh call, or the failure of that step."""
    out = subprocess.run(['gh', 'api', *args], capture_output=True, text=True)
    if out.returncode != 0:
        raise Failed(step, error(out))
    try:
        answer = json.loads(out.stdout)
    except json.JSONDecodeError:
        return out.stdout.strip()
    if isinstance(answer, dict) and answer.get('errors'):
        raise Failed(step, error(out))
    return answer


def node_id(kind: str, key: Key) -> str:
    noun = 'issue' if kind == 'issues' else 'pull request'
    found = gh(f'node id of {noun} {name(key)}', f'repos/{key[0]}/{kind}/{key[1]}', '--jq', '.node_id')
    if not isinstance(found, str) or not found:
        raise Failed(f'node id of {noun} {name(key)}', 'no node id returned')
    return found


def mutate(operation: str, issue: str, pull: str, path: Path) -> None:
    mutation = MUTATIONS[operation]
    path.write_text(f'mutation {{\n  {mutation}(input: {{issueId: "{issue}", pullRequestIds: ["{pull}"]}}) '
                    f'{{ issue {{ number }} }}\n}}\n')
    answer = gh(mutation, 'graphql', '-F', f'query=@{path}')
    data = answer.get('data') if isinstance(answer, dict) else None
    if not (data or {}).get(mutation):
        raise Failed(mutation, 'no result returned')


def relation(end: End, key: Key) -> list[Key]:
    """Every link one end holds, or the failed readback."""
    def send(path: Path) -> dict:
        return gh('readback', 'graphql', '-F', f'query=@{path}')
    noun = 'issue' if end is ISSUE else 'pull request'
    held, unreadable = read(end, [key], send)
    if unreadable:
        raise Failed('readback', f'{noun} {name(key)} unreadable: {unreadable[key]}')
    return [(node['repository']['nameWithOwner'], node['number']) for node in held[key]]


def link(operation: str, issue: Key, pull: Key) -> list[str]:
    """The write, then the problems the readback finds; an empty list is a verified relation."""
    before = relation(ISSUE, issue)
    issue_node, pull_node = node_id('issues', issue), node_id('pulls', pull)
    with tempfile.TemporaryDirectory() as tmp:
        mutate(operation, issue_node, pull_node, Path(tmp, 'mutation.graphql'))
    by_issue, by_pull = relation(ISSUE, issue), relation(PULL_REQUEST, pull)
    others = Counter(same(k) for k in before if same(k) != same(pull))
    expected = others + (Counter({same(pull): 1}) if operation == 'add' else Counter())
    problems = []
    if Counter(same(k) for k in by_issue) != expected:
        problems.append(f'issue {name(issue)} holds {listing(by_issue)}, expected {listing(list(expected.elements()))}')
    if (same(issue) in {same(k) for k in by_pull}) != (operation == 'add'):
        problems.append(f'pull request {name(pull)} holds {listing(by_pull)}')
    print(f'issue {name(issue)}: {listing(by_issue)}')
    print(f'pull request {name(pull)}: {listing(by_pull)}')
    return problems


def listing(keys: list[Key]) -> str:
    return ', '.join(name(k) for k in keys) or 'none'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('operation', choices=sorted(MUTATIONS))
    parser.add_argument('--issue', required=True, type=subject, help='the issue, as owner/repo#number')
    parser.add_argument('--pull', required=True, type=subject, help='the pull request, as owner/repo#number')
    args = parser.parse_args()
    attempt = f'{args.operation} {name(args.pull)} -> {name(args.issue)}'
    try:
        problems = link(args.operation, args.issue, args.pull)
    except Failed as failure:
        print(f'failed: {attempt}: {failure}')
        return 1
    for problem in problems:
        print(f'discrepancy: {attempt}: {problem}')
    if problems:
        return 1
    print(f'verified: {attempt}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
