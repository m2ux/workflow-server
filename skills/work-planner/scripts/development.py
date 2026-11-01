"""Batched reads of GitHub's Development relation, from either end.

A subject is a pull request or an issue, keyed by its repository and number. Each batch of subjects
is one aliased GraphQL document, written to a file and sent with `gh api graphql -F query=@file`:
a GraphQL variable is a literal dollar sign, which the workspace shell denies, so the query travels
by file and carries every value inline. A relation longer than one page is read again from its end
cursor until the tracker reports no further page, so each subject's links are the whole field.

A subject's relation is read only when every page of it arrives whole. A subject is unreadable when,
on any page, the tracker returns no node for it, names it or anything beneath it in an error, sends
an error with no path or one naming only its repository, returns its relation, nodes, page
information or a linked node as null, or reports a further page with no cursor to read it. An
unreadable relation is missing evidence, never an empty link set: its pages already read are dropped
and its reason is reported.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Callable, NamedTuple

BATCH = 50
PAGE = 100

Key = tuple[str, int]


class End(NamedTuple):
    """One end of the relation: the subject field, the connection it holds and the fields of each
    linked node."""
    alias: str
    field: str
    connection: str
    arguments: str
    node: str


PULL_REQUEST = End('p', 'pullRequest', 'closingIssuesReferences', '',
                   'number repository { nameWithOwner }')
ISSUE = End('i', 'issue', 'closedByPullRequestsReferences', 'includeClosedPrs: true',
            'number state repository { nameWithOwner }')


def records(path: str) -> list[dict]:
    """Every record in a file of JSON values written one after another: JSON lines, concatenated
    REST pages, or a single object."""
    text, decoder, items, i = Path(path).read_text(), json.JSONDecoder(), [], 0
    while True:
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            return items
        value, i = decoder.raw_decode(text, i)
        items += value if isinstance(value, list) else [value]


def query(end: End, subjects: dict[Key, str | None]) -> str:
    """The aliased document reading one page of each subject's relation, from its cursor."""
    repos: dict[str, list[str]] = {}
    for (repo, number), cursor in subjects.items():
        arguments = [f'first: {PAGE}', *([end.arguments] if end.arguments else []),
                     *([f'after: "{cursor}"'] if cursor else [])]
        repos.setdefault(repo, []).append(
            f'    {end.alias}{number}: {end.field}(number: {number}) {{ number '
            f'{end.connection}({", ".join(arguments)}) {{ nodes {{ {end.node} }} '
            f'pageInfo {{ hasNextPage endCursor }} }} }}')
    blocks = []
    for n, (repo, lines) in enumerate(repos.items()):
        owner, name = repo.split('/', 1)
        blocks.append(f'  r{n}: repository(owner: "{owner}", name: "{name}") {{\n' + '\n'.join(lines) + '\n  }')
    return 'query {\n' + '\n'.join(blocks) + '\n}\n'


def gh(path: Path) -> dict:
    """The tracker's response to the query file. A failed call that carries no GraphQL errors, such
    as a rejected credential, ends the run with what gh reported, since no subject was read."""
    out = subprocess.run(['gh', 'api', 'graphql', '-F', f'query=@{path}'], capture_output=True, text=True)
    try:
        answer = json.loads(out.stdout)
    except json.JSONDecodeError:
        answer = None
    if not isinstance(answer, dict) or (out.returncode != 0 and not answer.get('errors')):
        reported = (answer or {}).get('message') if isinstance(answer, dict) else None
        sys.exit(f'GraphQL read failed: {(reported or out.stderr or out.stdout).strip()[:400] or f"gh exited {out.returncode}"}')
    return answer


def fault(end: End, node: dict | None, errors: list[tuple[tuple, str]], at: tuple[str, str]) -> str | None:
    """What keeps one page of a subject's relation from being whole, or None for a whole page.

    An error reaches the subject when its path is empty, names only the subject's repository, or
    runs through the subject's alias."""
    for path, message in errors:
        if path[:2] == at[:len(path[:2])]:
            return message or 'error without a message'
    if node is None:
        return 'not returned'
    relation = node.get(end.connection)
    if relation is None:
        return f'{end.connection} not returned'
    if relation.get('nodes') is None:
        return f'{end.connection} nodes not returned'
    if any(linked is None for linked in relation['nodes']):
        return f'a linked node in {end.connection} not returned'
    page = relation.get('pageInfo')
    if page is None or not isinstance(page.get('hasNextPage'), bool):
        return f'{end.connection} page information not returned'
    if page['hasNextPage'] and not page.get('endCursor'):
        return f'{end.connection} reports a further page with no cursor'
    return None


def read(end: End, keys: list[Key], send: Callable[[Path], dict] = gh) -> tuple[dict[Key, list[dict]], dict[Key, str]]:
    """Each subject's complete relation, and each unreadable subject with what the tracker said."""
    pending: dict[Key, str | None] = dict.fromkeys(keys)
    held: dict[Key, list[dict]] = {key: [] for key in pending}
    unreadable: dict[Key, str] = {}
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp, 'query.graphql')
        while pending:
            batch = dict(list(pending.items())[:BATCH])
            path.write_text(query(end, batch))
            response = send(path)
            repos = {repo: f'r{n}' for n, repo in enumerate(dict.fromkeys(repo for repo, _ in batch))}
            errors = [(tuple(error.get('path') or ()), error.get('message', ''))
                      for error in response.get('errors') or []]
            data = response.get('data') or {}
            for key in batch:
                repo_alias, alias = repos[key[0]], f'{end.alias}{key[1]}'
                node = (data.get(repo_alias) or {}).get(alias)
                reason = fault(end, node, errors, (repo_alias, alias))
                if reason:
                    unreadable[key] = reason
                    del pending[key]
                    continue
                relation = node[end.connection]
                held[key] += relation['nodes']
                if relation['pageInfo']['hasNextPage']:
                    pending[key] = relation['pageInfo']['endCursor']
                else:
                    del pending[key]
    for key in unreadable:
        del held[key]
    return held, unreadable


def report(unreadable: dict[Key, str], noun: str) -> int:
    """Name each unreadable relation; the exit status a capture returns."""
    for (repo, number), reason in unreadable.items():
        print(f'unreadable: {noun} {repo}#{number}: {reason}')
    return 1 if unreadable else 0
