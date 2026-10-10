"""Check the Development links and repository setting before completing an issue.

Usage:
  python3 closure.py --issue issue.json --development development.json --prs prs.json

development.json records the issue's complete Development pull request list and the verified repository setting: {repo, number, complete, auto_close_issues, pull_requests: [URL, ...]}. complete is true only after every Development link has been read. auto_close_issues is false only after the issue repository's setting has been confirmed disabled. Missing evidence blocks. prs.json contains fresh REST pull request records as JSON lines, fetched by each linked URL.

Exit 0 permits closure only after the caller's normal delivery checks also pass. Exit 1 names each blocker. Every linked pull request must have merged, including a closed pull request. Acceptance criteria must all be ticked. A title or branch name supplies no Development link.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from board import criteria_met
from sync import issue_key, pull_requests

PULL = re.compile(r'https://github\.com/([^/]+/[^/]+)/pull/([1-9]\d*)/?$', re.IGNORECASE)


def blockers(issue: dict, development: dict, prs: list[dict]) -> list[str]:
    """Unmet closure conditions from the complete link list and current pull request records."""
    repo, number = issue_key(issue)
    reasons = []
    if (str(development.get('repo', '')).casefold(), development.get('number')) != (repo.casefold(), number):
        reasons.append('Development evidence belongs to another issue')
    if development.get('complete') is not True:
        reasons.append('Development links are not confirmed complete')
    if development.get('auto_close_issues') is not False:
        reasons.append('repository auto-closing is not confirmed disabled')
    links = development.get('pull_requests')
    if not isinstance(links, list):
        reasons.append('Development pull request list is missing or invalid')
        links = []
    records = {}
    for pr in prs:
        match = PULL.fullmatch(pr.get('html_url') or '')
        if match:
            key = (match[1].casefold(), int(match[2]))
            if key in records:
                reasons.append(f'{pr["html_url"]}: duplicate pull request evidence')
            records[key] = pr
    seen = set()
    for url in links:
        match = PULL.fullmatch(url) if isinstance(url, str) else None
        if not match:
            reasons.append(f'{url!r}: invalid Development pull request URL')
            continue
        key = (match[1].casefold(), int(match[2]))
        if key in seen:
            continue
        seen.add(key)
        pr = records.get(key)
        if pr is None:
            reasons.append(f'{url}: pull request evidence is missing')
        elif not pr.get('merged_at'):
            reasons.append(f'{url}: not merged ({"draft" if pr.get("draft") else pr.get("state", "unknown")})')
    if not criteria_met(issue):
        reasons.append('acceptance criteria are missing or unticked')
    return reasons


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--issue', required=True)
    parser.add_argument('--development', required=True)
    parser.add_argument('--prs', required=True)
    args = parser.parse_args()
    try:
        issue = json.loads(Path(args.issue).read_text())
        development = json.loads(Path(args.development).read_text())
        reasons = blockers(issue, development, pull_requests(args.prs))
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
