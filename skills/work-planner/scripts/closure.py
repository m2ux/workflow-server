"""Check one issue's criteria and Development links before completing it.

Usage:
  python3 closure.py --issue issue.json --development development.json

issue.json is the issue as `gh api repos/{owner}/{repo}/issues/943` writes it. development.json is
the snapshot links-by-issue.py writes from that file: the repository its issues belong to, and each
issue number mapped to the pull requests its Development field holds, open, closed and merged, each
as {repo, number, state}. Both are fields GitHub exposes; the gate takes no other input. A snapshot
of another repository's issues is unreadable evidence, since its numbers name other issues.

An issue the snapshot maps to an empty array has an empty Development field, which adds no pull
request requirement. An issue the snapshot holds no entry for never had its links read, which is
missing evidence and blocks. links-by-issue.py writes no snapshot when a relation is unreadable, so
an absent or unreadable file blocks too.

Exit 0 permits closure only after the caller's normal delivery checks also pass. Exit 1 names each
blocker: acceptance criteria missing or unticked, or a linked pull request that has not merged,
including a closed one. A title or branch name supplies no Development link.
"""
import argparse
import json
import sys
from pathlib import Path

from board import criteria_met
from sync import issue_key

UNCAPTURED = 'Development links not captured'


def snapshot(path: str, repository: str) -> dict[str, list[dict] | None]:
    """The issue links of the snapshot links-by-issue.py wrote for repository, or ValueError for a
    snapshot of another shape or another repository."""
    held = json.loads(Path(path).read_text())
    issues = held.get('issues') if isinstance(held, dict) else None
    if not isinstance(issues, dict) or not isinstance(held.get('repository'), str) or not all(
            isinstance(k, str) and k.isdigit() for k in issues) or not all(
            isinstance(link, dict) and {'repo', 'number', 'state'} <= link.keys()
            for links in issues.values() if isinstance(links, list) for link in links):
        raise ValueError(f'{path} is not an issue-links file: a repository and its issue numbers '
                         'mapped to {repo, number, state} lists')
    if held['repository'].lower() != repository.lower():
        raise ValueError(f"the Development snapshot holds {held['repository']} issues, not {repository}")
    return issues


def blockers(issue: dict, links: list[dict] | None) -> list[str]:
    """What keeps one issue's evidence from supporting its closure, from the links snapshot read."""
    if not isinstance(links, list):
        return [UNCAPTURED]
    reasons = [] if criteria_met(issue) else ['acceptance criteria are missing or unticked']
    reasons += [f'{link["repo"]}#{link["number"]} not merged ({str(link["state"]).lower()})'
                for link in links if link['state'] != 'MERGED']
    return reasons


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--issue', required=True, help='the issue, as the REST API returns it')
    parser.add_argument('--development', required=True, help='the snapshot links-by-issue.py wrote')
    args = parser.parse_args()
    try:
        issue = json.loads(Path(args.issue).read_text())
        repository, number = issue_key(issue)
        reasons = blockers(issue, snapshot(args.development, repository).get(str(number)))
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        print(f'closure blocked: unreadable evidence ({exc})')
        return 1
    for reason in reasons:
        print(f'closure blocked: {reason}')
    if reasons:
        return 1
    print('closure gate: passed; normal delivery checks must also pass')
    return 0


if __name__ == '__main__':
    sys.exit(main())
