"""Reference-visibility checks over GitHub snapshots.

Usage: align.py repositories issue.json
       align.py references issue.json --repositories repositories.json

Repository snapshots are a JSON array of REST repository records. Missing visibility
is a finding.
"""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

from format import split_sections

URL = re.compile(r'https://github\.com/([^/\s)<>]+)/([^/\s)#?<>]+)', re.I)


def repository_name(url):
    match = URL.match(url or '')
    return f'{match[1]}/{match[2]}'.removesuffix('.git').lower() if match else None


def reference_repositories(issue):
    """Repositories from the destination issue and its References section only."""
    destination = repository_name(issue.get('html_url') or issue.get('url'))
    if not destination:
        api = urlparse(issue.get('url', '')).path.split('/')
        if len(api) >= 4 and api[1] == 'repos':
            destination = '/'.join(api[2:4]).lower()
    _, sections = split_sections(issue.get('body') or '')
    references = '\n'.join('\n'.join(lines) for heading, lines in sections if heading == 'References')
    targets = sorted({f'{m[1]}/{m[2]}'.removesuffix('.git').lower() for m in URL.finditer(references)})
    return destination, targets


def check_references(issue, repositories):
    destination, targets = reference_repositories(issue)
    visibility = {r['full_name'].lower(): r.get('private') for r in repositories}
    if not destination or not isinstance(visibility.get(destination), bool):
        return ['destination repository visibility unavailable']
    if visibility[destination]:
        return []
    findings = []
    for target in targets:
        private = visibility.get(target)
        if not isinstance(private, bool):
            findings.append(f'References: {target} visibility unavailable')
        elif private:
            findings.append(f'References: private repository {target} cited by public issue')
    return findings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['repositories', 'references'])
    parser.add_argument('record', type=Path)
    parser.add_argument('--repositories', type=Path)
    args = parser.parse_args()
    record = json.loads(args.record.read_text())
    label = record.get('html_url') or f"#{record.get('number', '?')}"
    if args.operation == 'repositories':
        destination, targets = reference_repositories(record)
        for name in sorted(set(targets) | ({destination} if destination else set())):
            print(name)
        return 0
    if not args.repositories:
        parser.error('references requires --repositories')
    findings = check_references(record, json.loads(args.repositories.read_text()))
    for finding in findings:
        print(f'{label}: {finding}')
    return 1 if findings else 0


if __name__ == '__main__':
    raise SystemExit(main())
