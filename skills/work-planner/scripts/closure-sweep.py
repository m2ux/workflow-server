"""List each closed issue its own evidence does not support, with the reason it was closed.

Usage:
  python3 closure-sweep.py --issues issues.json --issue-links issue-links.json

issues.json is one repository's issues as the REST API returns them, the collection
links-by-issue.py reads; the sweep audits every closed issue it holds, so the collection sets the
audit's scope. issue-links.json is the file links-by-issue.py writes from that collection: each issue
number mapped to its Development pull requests as {repo, number, state}. Any other shape, such as
the single-issue Development snapshot closure.py reads, is refused. Pull requests among the issues
and open issues are skipped.

A closed issue is listed when its acceptance criteria are missing or unticked, or when a pull
request its Development field holds has not merged. Each listed issue carries its state reason:
completed, not_planned, or whatever reason the tracker recorded. Each line is one of:

  unsupported:  closed for any reason but not_planned, and its evidence does not support it
  unevaluable:  the file holds no link list for it; its links were never read, so it is missing
                evidence and never treated as having none
  not planned:  closed as not_planned with evidence that would not support completion; listed
                apart, after the findings, since the work was never claimed done

The sweep reads files only; it makes no network call and changes no issue. Exit 0 means no closed
issue is unsupported or unevaluable. Exit 1 means at least one is, or the evidence is unreadable.
"""
import argparse
import json
import sys
from pathlib import Path

from board import criteria_met
from development import records
from sync import issue_key


UNCAPTURED = 'Development links not captured'
KINDS = ('unsupported', 'unevaluable', 'not planned')


def findings(issue: dict, links: list[dict] | None) -> list[str]:
    """What keeps one closed issue's evidence from supporting its closure."""
    if not isinstance(links, list):
        return [UNCAPTURED]
    reasons = [] if criteria_met(issue) else ['acceptance criteria are missing or unticked']
    reasons += [f'{link["repo"]}#{link["number"]} not merged ({str(link.get("state")).lower()})'
                for link in links if link.get('state') != 'MERGED']
    return reasons


def kind(issue: dict, reasons: list[str]) -> str:
    if reasons == [UNCAPTURED]:
        return 'unevaluable'
    return 'not planned' if issue.get('state_reason') == 'not_planned' else 'unsupported'


def sweep(issues: list[dict], links: dict[str, list[dict]]) -> list[tuple[str, dict, list[str]]]:
    """Each closed issue with what its evidence lacks: findings in number order, then not-planned closures."""
    closed = {i['number']: i for i in issues if 'pull_request' not in i and i.get('state') == 'closed'}
    listed = ((closed[n], findings(closed[n], links.get(str(n)))) for n in sorted(closed))
    found = [(kind(issue, reasons), issue, reasons) for issue, reasons in listed if reasons]
    return sorted(found, key=lambda entry: entry[0] == 'not planned')


def issue_links(path: str) -> dict[str, list[dict]]:
    """The file links-by-issue.py writes, or ValueError for any other shape."""
    links = json.loads(Path(path).read_text())
    entries = links.values() if isinstance(links, dict) else ()
    if not isinstance(links, dict) or not all(isinstance(k, str) and k.isdigit() for k in links) or not all(
            isinstance(link, dict) and {'repo', 'number', 'state'} <= link.keys()
            for held in entries if isinstance(held, list) for link in held):
        raise ValueError(f'{path} is not an issue-links file: issue numbers mapped to {{repo, number, state}} lists')
    return links


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--issues', required=True, help='the closed issues to audit, as REST pages')
    parser.add_argument('--issue-links', required=True, help='the file links-by-issue.py wrote')
    args = parser.parse_args()
    try:
        issues = records(args.issues)
        links = issue_links(args.issue_links)
        repos = sorted({issue_key(i)[0] for i in issues if 'pull_request' not in i})
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f'sweep blocked: unreadable evidence ({exc})')
        return 1
    if len(repos) > 1:
        print(f'sweep blocked: the issues span {", ".join(repos)}; supply one repository\'s issues')
        return 1
    listed = sweep(issues, links)
    for label, issue, reasons in listed:
        repo, number = issue_key(issue)
        print(f'{label}: {repo}#{number} closed as {issue.get("state_reason") or "unknown"}: '
              f'{"; ".join(reasons)} - {issue.get("title", "")}')
    counts = {k: sum(1 for label, _, _ in listed if label == k) for k in KINDS}
    print(', '.join(f'{n} {k}' for k, n in counts.items()))
    return 1 if counts['unsupported'] or counts['unevaluable'] else 0


if __name__ == '__main__':
    sys.exit(main())
