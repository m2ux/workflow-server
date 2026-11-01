"""Write the issue-link snapshot for a pull-request collection, read from the pull-request end.

Usage:
  python3 links-by-pull-request.py --prs prs.json --out links.json

prs.json holds pull requests as JSON lines, as the REST API returns them and sync.py reads them, from
any number of repositories. The snapshot written to --out is what every script's --links reads: an
array of {repo, number, closingIssuesReferences: [{repo, number}]}, one entry for each pull request
in the collection, its linked issues or an empty array.

Each batch of pull requests costs one `gh api graphql` call, so the script runs where `gh` reaches
the tracker. A relation the tracker could not read is named, no snapshot is written, and the run
exits 1.
"""
import argparse
import json
import sys
from pathlib import Path

from development import PULL_REQUEST, read, records, report
from sync import pr_repo


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--prs', required=True, help='the pull requests, as JSON lines')
    parser.add_argument('--out', required=True, help='the issue-link snapshot to write')
    args = parser.parse_args()

    keys = list(dict.fromkeys((pr_repo(p), p['number']) for p in records(args.prs)))
    if not keys:
        sys.exit('no pull requests in the supplied collection')
    if any(not repo for repo, _ in keys):
        sys.exit('a pull request names no repository in its html_url')
    held, unreadable = read(PULL_REQUEST, keys)
    if unreadable:
        return report(unreadable, 'pull request')
    snapshot = [{'repo': repo, 'number': number,
                 'closingIssuesReferences': [{'repo': i['repository']['nameWithOwner'], 'number': i['number']}
                                             for i in held[repo, number]]}
                for repo, number in keys]
    Path(args.out).write_text(json.dumps(snapshot, indent=2) + '\n')
    print(f'{len(snapshot)} pull request(s), {sum(len(e["closingIssuesReferences"]) for e in snapshot)} link(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
