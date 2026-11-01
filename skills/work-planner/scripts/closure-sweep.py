"""List each closed issue its own evidence does not support, with the reason it was closed.

Usage:
  python3 closure-sweep.py --issues issues.json --development development.json

issues.json is one repository's issues as the REST API returns them, the collection
links-by-issue.py reads. development.json is the snapshot links-by-issue.py writes from that
collection: each issue number mapped to its Development pull requests as {repo, number, state}.
Pull requests among the issues and open issues are skipped.

A closed issue is listed when its acceptance criteria are missing or unticked, or when a pull
request its Development field holds has not merged. Each listed issue carries its state reason:
completed, not_planned, or whatever reason the tracker recorded. A closed issue the snapshot holds
no link list for is unevaluable: its links were never read, so it is named as missing evidence and
never treated as having none.

The sweep reads files only; it makes no network call and changes no issue. Exit 0 means every
closed issue is supported by its evidence. Exit 1 means at least one issue is listed or
unevaluable.
"""
import argparse
import json
import sys
from pathlib import Path

from board import criteria_met
from development import records
from sync import issue_key


UNCAPTURED = 'Development links not captured'


def findings(issue: dict, links: list[dict] | None) -> list[str]:
    """What keeps one closed issue's evidence from supporting its closure."""
    if not isinstance(links, list):
        return [UNCAPTURED]
    reasons = [] if criteria_met(issue) else ['acceptance criteria are missing or unticked']
    reasons += [f'{link["repo"]}#{link["number"]} not merged ({str(link.get("state")).lower()})'
                for link in links if link.get('state') != 'MERGED']
    return reasons


def sweep(issues: list[dict], development: dict[str, list[dict]]) -> list[tuple[dict, list[str]]]:
    """Each closed issue with what its evidence lacks, in number order."""
    closed = {i['number']: i for i in issues if 'pull_request' not in i and i.get('state') == 'closed'}
    listed = ((closed[n], findings(closed[n], development.get(str(n)))) for n in sorted(closed))
    return [(issue, reasons) for issue, reasons in listed if reasons]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--issues', required=True, help='one repository\'s issues, as REST pages')
    parser.add_argument('--development', required=True, help='the snapshot links-by-issue.py wrote')
    args = parser.parse_args()
    try:
        issues = records(args.issues)
        development = json.loads(Path(args.development).read_text())
        if not isinstance(development, dict):
            raise ValueError('the Development snapshot is not keyed by issue number')
        repos = sorted({issue_key(i)[0] for i in issues if 'pull_request' not in i})
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f'sweep blocked: unreadable evidence ({exc})')
        return 1
    if len(repos) > 1:
        print(f'sweep blocked: the issues span {", ".join(repos)}; supply one repository\'s issues')
        return 1
    listed = sweep(issues, development)
    for issue, reasons in listed:
        repo, number = issue_key(issue)
        kind = 'unevaluable' if reasons == [UNCAPTURED] else 'unsupported'
        print(f'{kind}: {repo}#{number} closed as {issue.get("state_reason") or "unknown"}: '
              f'{"; ".join(reasons)} - {issue.get("title", "")}')
    print(f'{len(listed)} closed issue(s) listed')
    return 1 if listed else 0


if __name__ == '__main__':
    sys.exit(main())
