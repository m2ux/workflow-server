"""Write each issue's Development pull requests, read from the issue end.

Usage:
  python3 links-by-issue.py --issues issues.json --out issue-links.json

issues.json is one repository's issues as the REST API returns them: the concatenated pages
`gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100"` writes, or one issue as
`gh api repos/{owner}/{repo}/issues/943` writes it. Pull requests among them are skipped.

The output written to --out names the repository the issues belong to, and maps each issue number
to the pull requests its Development field holds, open, closed and merged, each as
{repo, number, state}; an issue with none maps to an empty array:
{"repository": "o/r", "issues": {"943": [...]}}.

Each batch of issues costs one `gh api graphql` call, so the script runs where `gh` reaches the
tracker. A relation the tracker could not read is named, nothing is written, and the run exits 1.
"""
import argparse
import json
import sys
from pathlib import Path

from development import ISSUE, read, records, report
from sync import issue_key


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--issues', required=True, help='one repository\'s issues, as REST pages or one issue')
    parser.add_argument('--out', required=True, help='the issue-keyed Development snapshot to write')
    args = parser.parse_args()

    keys = list(dict.fromkeys(issue_key(i) for i in records(args.issues) if 'pull_request' not in i))
    if not keys:
        sys.exit('no issues in the supplied collection')
    repos = sorted({repo for repo, _ in keys})
    if len(repos) > 1:
        sys.exit(f'the issues span {", ".join(repos)}; supply one repository\'s issues')
    held, unreadable = read(ISSUE, keys)
    if unreadable:
        return report(unreadable, 'issue')
    development = {str(number): [{'repo': p['repository']['nameWithOwner'], 'number': p['number'],
                                  'state': p['state']} for p in held[repo, number]]
                   for repo, number in keys}
    Path(args.out).write_text(json.dumps({'repository': repos[0], 'issues': development}, indent=2) + '\n')
    print(f'{len(development)} issue(s), {sum(len(v) for v in development.values())} link(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
