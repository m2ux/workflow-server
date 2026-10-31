"""Explicit test-plan repair and reference-visibility checks over GitHub snapshots.

Usage: align.py plan pull.json --fix body.md
       align.py repositories issue.json
       align.py references issue.json --repositories repositories.json

Repository snapshots are a JSON array of REST repository records. Missing visibility
is a finding. Repair writes only unambiguous conversions; existing current plans
are unchanged. A checked list item without linked result evidence stays pending.
"""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

from format import cells, join_sections, row, split_sections
from sync import plan_rows

CHECK = re.compile(r'^- \[([ xX])\] \*\*(T\d+)\.\*\* (.+)$')
RESULT = re.compile(r'\[(✓|Pass|Passed)\]\((https?://[^\s)]+)\)', re.I)
URL = re.compile(r'https://github\.com/([^/\s)<>]+)/([^/\s)#?<>]+)', re.I)


def repair_plan(body):
    """Return a converted body and findings; ambiguity leaves the body intact."""
    if plan_rows(body) is not None:
        return body, False, []
    preamble, sections = split_sections(body.replace('\r\n', '\n'))
    plans = [lines for heading, lines in sections if heading == 'Test Plan']
    if len(plans) != 1:
        return body, False, ['unreadable test plan: expected one Test Plan section']
    lines = plans[0]
    table = [line for line in lines if line.startswith('|')]
    if len(table) < 3 or cells(table[0]) != ['Test', 'Criteria'] or not all(
            re.fullmatch(r':?-{3,}:?', c) for c in cells(table[1])):
        return body, False, ['unreadable test plan: expected checked list and Test | Criteria table']
    checks = {}
    for line in lines:
        if not line.strip() or line.startswith('|'):
            continue
        match = CHECK.fullmatch(line)
        if not match or match[2] in checks:
            return body, False, ['unreadable test plan: ambiguous checklist or extra content']
        checks[match[2]] = (match[1].lower() == 'x', match[3])
    rows, seen, findings = [], set(), []
    for line in table[2:]:
        values = cells(line)
        if len(values) != 2:
            return body, False, ['unreadable test plan: malformed coverage row']
        test, coverage = values
        if test and (test not in checks or test in seen):
            return body, False, ['unreadable test plan: checklist and table ids disagree']
        seen.add(test)
        checked, description = checks.get(test, (False, ''))
        evidence = list(RESULT.finditer(description))
        if len(evidence) > 1:
            return body, False, ['unreadable test plan: ambiguous result evidence']
        mark = f'[✓]({evidence[0][2]})' if checked and evidence else ''
        if checked and not evidence:
            findings.append(f'{test}: checked result lacks linked evidence; Pass remains pending')
        rows.append(row([test, description.replace('|', '&#124;'), coverage, mark]))
    if set(checks) != seen - {''}:
        return body, False, ['unreadable test plan: checklist and table ids disagree']
    lines[:] = ['', '| Test | Description | Coverage | Pass |', '| --- | --- | --- | --- |', *rows, '']
    return join_sections(preamble, sections), True, findings


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
    parser.add_argument('operation', choices=['plan', 'repositories', 'references'])
    parser.add_argument('record', type=Path)
    parser.add_argument('--fix', type=Path)
    parser.add_argument('--repositories', type=Path)
    args = parser.parse_args()
    record = json.loads(args.record.read_text())
    label = record.get('html_url') or f"#{record.get('number', '?')}"
    if args.operation == 'repositories':
        destination, targets = reference_repositories(record)
        for name in sorted(set(targets) | ({destination} if destination else set())):
            print(name)
        return 0
    if args.operation == 'references':
        if not args.repositories:
            parser.error('references requires --repositories')
        findings = check_references(record, json.loads(args.repositories.read_text()))
    else:
        if not args.fix:
            parser.error('plan requires --fix')
        body, converted, findings = repair_plan(record.get('body') or '')
        args.fix.write_text(body)
        print(f'{label}: ' + ('converted test plan' if converted else 'test plan unchanged'))
    for finding in findings:
        print(f'{label}: {finding}')
    return 1 if findings else 0


if __name__ == '__main__':
    raise SystemExit(main())
