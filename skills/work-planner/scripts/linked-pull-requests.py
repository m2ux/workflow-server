"""Add to a pull-request collection every pull request the plan links, whatever its title.

Usage:
  python3 linked-pull-requests.py --prs prs.json --issues issue-936.json issue-943.json ...
  python3 linked-pull-requests.py --prs prs.json --issues items.json

prs.json holds pull requests as JSON lines, as the REST API returns them and sync.py reads them. Each
--issues file holds issues as the REST API returns them: one issue, concatenated pages, or a board's
items as Fetch Board Items with Status saves them, each carrying its issue whole. Pull requests among
them are skipped.

A pull request is linked when a Work Breakdown row's id cell links it, or when an issue's Development
field names it, open, closed or merged, in whichever repository it lives. Each linked pull request the
collection lacks is read with `gh api repos/{owner}/{repo}/pulls/{number}` and appended to prs.json
as one JSON line, so the collection holds it whatever its title carries.

The Development field is read in batches of one `gh api graphql` call, and each missing pull request
costs one REST call, so the script runs where `gh` reaches the tracker. A relation or pull request the
tracker could not read is named, nothing is appended, and the run exits 1.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from development import ISSUE, Key, read, records, report
from format import cells, hrefs, id_cell, split_sections
from sync import issue_key, pr_repo

PULL = re.compile(r'^https://github\.com/([^/]+/[^/]+)/pull/(\d+)$')


def plan_issues(paths: list[str]) -> list[dict]:
    """The issues the files hold, a board item unwrapped to its issue, pull requests left out."""
    found = []
    for path in paths:
        for record in records(path):
            if 'content_type' in record:
                record = record.get('content') if record['content_type'] == 'Issue' else None
            if record and record.get('repository_url') and 'pull_request' not in record:
                found.append(record)
    return found


def row_pulls(body: str) -> list[Key]:
    """The pull requests the Work Breakdown rows' id cells link."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    table = [line for heading, lines in sections if heading == 'Work Breakdown'
             for line in lines if line.startswith('|')]
    if len(table) < 3:
        return []
    header = cells(table[0])
    return [(m[1], int(m[2])) for line in table[2:] for href in hrefs(id_cell(header, cells(line)))
            if (m := PULL.match(href))]


def fetch(key: Key) -> tuple[dict | None, str]:
    """One pull request as the REST API returns it, or what kept it from arriving."""
    repo, number = key
    out = subprocess.run(['gh', 'api', f'repos/{repo}/pulls/{number}'], capture_output=True, text=True)
    try:
        pull = json.loads(out.stdout)
    except json.JSONDecodeError:
        pull = None
    if out.returncode == 0 and isinstance(pull, dict) and pull.get('number') == number:
        return pull, ''
    reported = pull.get('message') if isinstance(pull, dict) else None
    return None, (reported or out.stderr or out.stdout).strip()[:400] or f'gh exited {out.returncode}'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--prs', required=True, help='the pull-request collection, as JSON lines, appended to')
    parser.add_argument('--issues', required=True, nargs='+', help='the plan\'s issues, as REST issues or board items')
    args = parser.parse_args()

    issues = plan_issues(args.issues)
    if not issues:
        sys.exit('no issues in the supplied files')
    keys = list(dict.fromkeys(issue_key(i) for i in issues))
    held, unreadable = read(ISSUE, keys)
    if unreadable:
        return report(unreadable, 'issue')
    linked = [key for i in issues for key in row_pulls(i.get('body') or '')]
    linked += [(p['repository']['nameWithOwner'], p['number']) for key in keys for p in held[key]]
    given = {(pr_repo(p).lower(), p['number']) for p in records(args.prs)}
    missing: dict[Key, Key] = {}
    for repo, number in linked:
        if (repo.lower(), number) not in given:
            missing.setdefault((repo.lower(), number), (repo, number))

    pulls, failed = [], {}
    for key in missing.values():
        pull, reason = fetch(key)
        if pull is None:
            failed[key] = reason
        else:
            pulls.append(pull)
    if failed:
        return report(failed, 'pull request')
    if pulls:
        path = Path(args.prs)
        text = path.read_text()
        lead = '\n' if text and not text.endswith('\n') else ''
        path.write_text(text + lead + ''.join(json.dumps(p) + '\n' for p in pulls))
    print(f'{len(keys)} issue(s), {len(pulls)} linked pull request(s) added')
    return 0


if __name__ == '__main__':
    sys.exit(main())
