"""List the tracker's orphan issues, and the open initiatives and epics they could join.

Usage:
  python3 orphans.py issues.json

issues.json is every issue in the repository as `gh api --paginate
"repos/{owner}/{repo}/issues?state=all&per_page=100"` returns it: the pages' arrays one after
another. Pull requests are skipped.

A house issue is one whose title starts with an [Ixx], [Ixx:Eyy] or [Ixx:Eyy:Wzz] prefix. An orphan
is an open issue without that prefix that no open house issue's body links, by URL or by #n. An
orphan that only closed house issues cite is still an orphan, and the listing names those citers.

Printed: each orphan with its labels, any closed house issue citing it, and any planning folder its
body links (a tree or blob link into a planning folder of markdown files), then each
open initiative and epic with its theme labels, as the placements a hoist can offer. An orphan with
planning is subsumed and closed when hoisted. Planning linked only from comments is not listed.
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
    for i in house:
        if i['state'] == 'closed':
            for n in cited(i['body'] or '', repo):
                closed_citers.setdefault(n, []).append(i['number'])

    orphans = sorted((i for i in issues if i['state'] == 'open' and not HOUSE.match(i['title'])
                      and i['number'] not in live), key=lambda i: i['number'])
    print(f'--- orphans ({len(orphans)})')
    for i in orphans:
        also = closed_citers.get(i['number'])
        note = f'  cited by closed {", ".join(f"#{n}" for n in sorted(also))}' if also else ''
        print(f"#{i['number']} {i['title']}  [{', '.join(labels(i))}]{note}")
        for url in dict.fromkeys(PLANNING.findall(i['body'] or '')):
            print(f'    planning: {url}')

    print('\n--- open initiatives and epics')
    for i in sorted((i for i in house if i['state'] == 'open' and not re.match(r'^\[I\d\d:E\d\d:W', i['title'])),
                    key=lambda i: i['title']):
        themes = [l for l in labels(i) if l.startswith('theme:')]
        print(f"#{i['number']} {i['title']}  [{', '.join(themes)}]")
    return 0


if __name__ == '__main__':
    sys.exit(main())
