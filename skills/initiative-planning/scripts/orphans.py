"""List the tracker's hoist candidates, and the open initiatives and epics they could join.

Usage:
  python3 orphans.py issues.json

issues.json is every issue in the repository as `gh api --paginate
"repos/{owner}/{repo}/issues?state=all&per_page=100"` returns it: the pages' arrays one after
another. Pull requests are skipped.

A house issue is one whose title starts with an [Ixx], [Ixx:Eyy] or [Ixx:Eyy:Wzz] prefix; an open
issue without one is standalone, and every standalone issue is a hoist candidate. An orphan is one
that no open house issue's body links, by URL or by #n; one that only closed house issues cite is
still an orphan, and the listing names those citers. A cited standalone issue is one that open house
issues link, as a reference or in prose, though it sits outside the structure; the listing names
the issues citing it.

Printed: each orphan, then each cited standalone issue, with its labels, the house issues citing
it, and any planning folder its body links (a tree or blob link into a planning folder of markdown
files), then each open initiative and epic with its theme labels, as the placements a hoist can
offer. A candidate with planning is subsumed and closed when hoisted. Planning linked only from
comments is not listed.
"""
import argparse
import json
import re
import sys
from pathlib import Path

HOUSE = re.compile(r'^\[I\d\d(?::E\d\d(?::W\d\d)?)?\] ')
PLANNING = re.compile(r'https://github\.com/[^)\s]*/(?:tree|blob)/[^)\s]*planning/[^)\s]*')


def pages(text: str) -> list[dict]:
    """Every issue in a file of concatenated JSON arrays."""
    decoder, items, i = json.JSONDecoder(), [], 0
    while i < len(text):
        if text[i].isspace():
            i += 1
            continue
        page, i = decoder.raw_decode(text, i)
        items += page if isinstance(page, list) else [page]
    return items


def cited(body: str, repo: str) -> set[int]:
    """The issue numbers a body links, by URL within the repository or by #n."""
    found = {int(n) for n in re.findall(rf'github\.com/{re.escape(repo)}/issues/(\d+)', body)}
    return found | {int(n) for n in re.findall(r'(?<![\w/&])#(\d+)\b', body)}


def labels(issue: dict) -> list[str]:
    return [l['name'] if isinstance(l, dict) else l for l in issue.get('labels', [])]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issues', help='every issue, as the paginated REST listing returns them')
    args = parser.parse_args()

    issues = [i for i in pages(Path(args.issues).read_text()) if 'pull_request' not in i]
    if not issues:
        print('no issues')
        return 1
    repo = re.search(r'github\.com/([^/]+/[^/]+)/issues/', issues[0]['html_url'])[1]
    house = [i for i in issues if HOUSE.match(i['title'])]
    live = set().union(*(cited(i['body'] or '', repo) for i in house if i['state'] == 'open'))
    closed_citers: dict[int, list[int]] = {}
    live_citers: dict[int, list[int]] = {}
    for i in house:
        into = closed_citers if i['state'] == 'closed' else live_citers
        for n in cited(i['body'] or '', repo):
            into.setdefault(n, []).append(i['number'])

    standalone = sorted((i for i in issues if i['state'] == 'open' and not HOUSE.match(i['title'])),
                        key=lambda i: i['number'])
    for heading, group, citers, which in (
            ('orphans', [i for i in standalone if i['number'] not in live], closed_citers, 'closed '),
            ('cited standalone issues', [i for i in standalone if i['number'] in live], live_citers, '')):
        print(f'--- {heading} ({len(group)})')
        for i in group:
            by = citers.get(i['number'])
            note = f'  cited by {which}{", ".join(f"#{n}" for n in sorted(by))}' if by else ''
            print(f"#{i['number']} {i['title']}  [{', '.join(labels(i))}]{note}")
            for url in dict.fromkeys(PLANNING.findall(i['body'] or '')):
                print(f'    planning: {url}')
        print()

    print('--- open initiatives and epics')
    for i in sorted((i for i in house if i['state'] == 'open' and not re.match(r'^\[I\d\d:E\d\d:W', i['title'])),
                    key=lambda i: i['title']):
        themes = [l for l in labels(i) if l.startswith('theme:')]
        print(f"#{i['number']} {i['title']}  [{', '.join(themes)}]")
    return 0


if __name__ == '__main__':
    sys.exit(main())
