"""Validate published agent review evidence against a current integration pull request."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse


def load_records(path):
    """Read a list of review records; absent evidence is an empty list."""
    if not path:
        return []
    records = json.loads(Path(path).read_text())
    if not isinstance(records, list):
        raise ValueError('agent reviews must be a JSON list')
    return records


def web_url(value):
    return isinstance(value, str) and urlparse(value).scheme == 'https' and bool(urlparse(value).netloc)


def linked_record(body, url):
    """Find a rendered Markdown link outside fenced and inline code examples."""
    fence = None
    body = re.sub(r'<!--.*?-->', '', body or '', flags=re.S)
    for line in body.splitlines():
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                fence = None
            continue
        if marker:
            fence = marker[1]
            continue
        if line.startswith(('    ', '\t')):
            continue
        line = re.sub(r'(`+).*?\1', '', line)
        if re.search(r'(?<!!)\[[^]\n]+\]\(' + re.escape(url) + r'\)', line):
            return True
    return False


def check(pr, records):
    """Return a finding unless one complete, published review matches both current tips."""
    identity = pr.get('html_url')
    if not web_url(identity) or not all(isinstance(pr.get(k), dict) for k in ('head', 'base')):
        return 'full REST pull request metadata required'
    matching = [r for r in records if isinstance(r, dict) and r.get('pull_request') == identity]
    if not matching:
        return 'missing agent review'
    head, base = (pr.get('head') or {}).get('sha'), (pr.get('base') or {}).get('sha')
    if not all(isinstance(s, str) and re.fullmatch(r'[0-9a-f]{40}', s) for s in (head, base)):
        return 'missing current integration head or target SHA'
    current = [r for r in matching if r.get('head') == head and r.get('base') == base]
    if not current:
        return 'stale agent review: integration head or target changed'
    # The last record for this revision is authoritative, including a later blocking finding.
    record = current[-1]
    for name in ('reviewer', 'reviewed_at', 'scope', 'criteria', 'validation'):
        if not isinstance(record.get(name), str) or not record[name].strip():
            return f'incomplete agent review: {name}'
    url = record.get('url')
    if not web_url(url) or not linked_record(pr.get('body'), url):
        return 'agent review record is not linked from the pull request'
    findings = record.get('findings')
    if not isinstance(findings, list):
        return 'incomplete agent review: findings'
    for finding in findings:
        if not isinstance(finding, dict) or not str(finding.get('description') or '').strip():
            return 'invalid agent review finding'
        severity, disposition = finding.get('severity'), finding.get('disposition')
        if severity not in ('blocking', 'nonblocking') or disposition not in ('open', 'fixed', 'deferred'):
            return 'invalid finding severity or disposition'
        if severity == 'blocking' and disposition != 'fixed':
            return 'unresolved blocking agent review finding'
        if disposition == 'open':
            return 'agent review finding needs a disposition'
        if not web_url(finding.get('evidence' if disposition == 'fixed' else 'ticket')):
            return 'finding disposition lacks linked evidence or ticket'
    return None


def epic_check(epic, prs, records):
    """Require current evidence for every open integration PR belonging to the epic."""
    match = re.match(r'^\[I(\d\d):E(\d\d)\]', epic.get('title', ''))
    if not match or re.match(r'^\[I\d\d:E\d\d:W', epic.get('title', '')):
        return 'a dispatch does not set a task In Review'
    home = epic.get('html_url', '').split('/issues/')[0]
    prefix = f'i{match[1]}/e{match[2]}/'
    reviews = [p for p in prs if p.get('state') == 'open'
               and p.get('html_url', '').startswith(home + '/pull/')
               and (p.get('head') or {}).get('ref', '').startswith(prefix)
               and (p.get('head') or {}).get('ref') == prefix + (p.get('base') or {}).get('ref', '')]
    if not reviews:
        return 'missing open epic integration pull request'
    for pr in reviews:
        if problem := check(pr, records):
            return f"#{pr['number']}: {problem}"
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pr', required=True, help='fresh REST pull request JSON')
    parser.add_argument('--agent-reviews', required=True, help='published review records as a JSON list')
    args = parser.parse_args()
    problem = check(json.loads(Path(args.pr).read_text()), load_records(args.agent_reviews))
    print(problem or 'current agent review: no unresolved findings')
    return bool(problem)


if __name__ == '__main__':
    raise SystemExit(main())
