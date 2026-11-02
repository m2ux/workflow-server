"""A hot-fix's identity and lifecycle, as artifacts/hotfix-body.md and artifacts/hotfix.md state them.

An issue whose title opens with [F00] is a hot-fix, and it carries the priority: 10 label. Its
Overview names the long-lived branch it fixes in one Target: line. Its target, its hot-fix format
faults, its board status, the pull requests that deliver it and the state of its delivery unit are
read here, and the scripts that place, survey, record, check or report a hot-fix call these
functions.

Usage:
  python3 hotfix.py issue-874.json

Run on an issue, it prints each condition of the hot-fix Format the issue fails, as format_faults
reads it, and exits 1 when there is one. That is the one check of whether a hot-fix may stand Ready.
"""
import argparse
import json
import re
import sys
from pathlib import Path

HOTFIX = re.compile(r'^\[(F\d\d)\]')
PRIORITY = 'priority: 10'
OFF_BOARD = 'off the board'
TARGET = re.compile(r'^Target: `([^`\s]+)`\s*$')
TYPE = 'type:hot-fix'
CODE_SPAN = re.compile(r'(`+).*?\1')
ITEM = re.compile(r'^(?:[-*+]|\d+[.)])\s')
Key = tuple[str, int]


def hotfix_tag(item: dict) -> str | None:
    """The [F00] tag an issue's or pull request's title opens with, which makes an issue a hot-fix."""
    matched = HOTFIX.match(item.get('title') or '')
    return matched[1] if matched else None


def is_hotfix(issue: dict) -> bool:
    return hotfix_tag(issue) is not None


def hotfix_faults(issue: dict) -> list[str]:
    """The conditions of the hot-fix Format that no other kind carries, each the issue fails: one
    Target: line, no open question, and an Acceptance Criteria section holding a criterion. format.py
    reports these beside its own checks, which cover the rest of the Format."""
    from format import split_sections  # format imports this module
    faults = []
    named = targets(issue)
    if len(named) != 1:
        faults.append(f'{len(named) or "no"} Target: lines in the Overview; it names one target branch')
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    if any(line.strip() for heading, lines in sections if heading == 'Open Questions' for line in lines):
        faults.append('open questions remain')
    for heading, lines in sections:
        if heading == 'Acceptance Criteria' and not any(ITEM.match(line) for line in lines):
            faults.append('no acceptance criterion')
    return faults


def format_faults(issue: dict) -> list[str]:
    """Each condition of the hot-fix Format in artifacts/hotfix-body.md the issue fails, whatever its
    wording: the [F00] prefix, the labels its Titles name, the standalone sections with no text before
    the first, no unfilled {{...}} field in its prose outside code, every acceptance criterion a checkbox labelled **ACn.**, and
    the conditions hotfix_faults reads."""
    from format import AC, Template, prose, split_sections  # format imports this module
    faults = []
    if not is_hotfix(issue):
        faults.append('title has no [F00] prefix')
    labels = [l['name'] if isinstance(l, dict) else l for l in issue.get('labels') or []]
    faults += [f'no {wanted} label' for wanted in (TYPE, PRIORITY) if wanted not in labels]
    if not any(l.startswith('theme:') for l in labels):
        faults.append('no theme:* label')
    faults += [f'{l} beside {PRIORITY}' for l in labels if l.startswith('priority:') and l != PRIORITY]
    template = Template('hot-fix')
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    if '\n'.join(preamble).strip():
        faults.append('text before the first section')
    if any('{{' in CODE_SPAN.sub('', line) for line in prose(body.split('\n'))):
        faults.append('an unfilled {{...}} field')
    headings = [heading for heading, _ in sections]
    faults += [f'required section missing: {h}' for h in template.headings
               if h not in headings and h not in template.optional]
    faults += [f'extra section: {h}' for h in headings if h not in template.headings]
    lines = next((lines for heading, lines in sections if heading == 'Acceptance Criteria'), [])
    faults += [f'criterion not a checkbox labelled **ACn.**: {line.strip()}' for line in lines
               if ITEM.match(line) and not AC.match(line)]
    return faults + hotfix_faults(issue)


def board_status(issue: dict, held: str | None) -> str | None:
    """The status Board Status gives a hot-fix holding held: Done when closed as completed, OFF_BOARD
    when closed otherwise; when open, In Progress while it holds In Progress or In Review, else Ready
    once it has no format fault, and Backlog until then."""
    if issue['state'] == 'closed':
        return 'Done' if issue.get('state_reason') == 'completed' else OFF_BOARD
    if held in ('In Progress', 'In Review'):
        return 'In Progress'
    return 'Backlog' if format_faults(issue) else 'Ready'


def targets(issue: dict) -> list[str]:
    """The branch each Target: line of the issue's Overview names, in order, outside fenced code."""
    from format import prose, split_sections  # format imports this module
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    lines = prose(next((lines for heading, lines in sections if heading == 'Overview'), []))
    return [found[1] for line in lines if (found := TARGET.match(line))]


def target(issue: dict) -> str:
    """The branch a hot-fix fixes, or '' unless its Overview names exactly one."""
    named = targets(issue)
    return named[0] if len(named) == 1 else ''


def linking_pulls(prs: list[dict], key: Key) -> list[dict]:
    """The pull requests whose Development field links the hot-fix, by number."""
    from sync import links_issue  # sync imports format, which imports this module
    return sorted((p for p in prs if links_issue(p, key)), key=lambda p: p['number'])


def delivery_fault(pull: dict, key: Key, issue: dict) -> str:
    """Why the pull request does not deliver the hot-fix, or '' when it does: its title opens with the
    hot-fix's tag, it lives in the hot-fix's repository, its base is the hot-fix's target, and its
    Development field links the hot-fix."""
    from sync import links_issue, pr_repo  # sync imports format, which imports this module
    tag, branch = hotfix_tag(issue), target(issue)
    base = (pull.get('base') or {}).get('ref') or ''
    if hotfix_tag(pull) != tag:
        return f'its title does not open with [{tag}]'
    if pr_repo(pull).lower() != key[0].lower():
        return f'it lives in {pr_repo(pull)}, not {key[0]}'
    if not branch:
        return f'#{key[1]} names no target in one Target: line'
    if base != branch:
        return f"its base is {base or 'unknown'}, not the target {branch}"
    if not links_issue(pull, key):
        return f'its Development field does not link #{key[1]}'
    return ''


def delivering_pulls(prs: list[dict], key: Key, issue: dict) -> list[dict]:
    """The pull requests that deliver the hot-fix, as delivery_fault tests each, by number."""
    return sorted((p for p in prs if not delivery_fault(p, key, issue)), key=lambda p: p['number'])


def unit_state(issue: dict, held: str | None, linking: list[dict], delivering: list[dict]) -> str | None:
    """Where an open hot-fix's Delivery Unit stands: unrecorded once a delivering pull request has
    merged; running while a linking pull request other than a draft delivering one is open; draft
    while its open linking pull requests are draft delivering ones, awaiting its review cycle; hold
    while In Progress, unit while Ready, and None otherwise."""
    if issue['state'] != 'open':
        return None
    if any(p.get('merged_at') for p in delivering):
        return 'unrecorded'
    numbers = {p['number'] for p in delivering if p.get('draft')}
    opened = [p for p in linking if (p.get('state') or 'open') == 'open' and not p.get('merged_at')]
    if any(p['number'] not in numbers for p in opened):
        return 'running'
    if opened:
        return 'draft'
    return {'In Progress': 'hold', 'Ready': 'unit'}.get(held)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue', help='issue JSON as the REST API returns it')
    issue = json.loads(Path(parser.parse_args().issue).read_text())
    faults = format_faults(issue)
    print(f"#{issue.get('number')}: {'out of' if faults else 'in'} the hot-fix format")
    for fault in faults:
        print(f'  fault: {fault}')
    return 1 if faults else 0


if __name__ == '__main__':
    sys.exit(main())
