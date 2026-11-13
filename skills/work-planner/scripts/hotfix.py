"""A hot-fix's identity and lifecycle, as artifacts/hotfix-body.md and artifacts/hotfix.md state them.

An issue whose title opens with [F00] is a hot-fix, and it carries the priority: 10 label. Its
Overview names the long-lived branch it fixes in one Target: line. This module supplies the hot-fix
kind to the script registry, kinds.py: each operation of its Kind interface, with the inputs and
results that interface states, reads a hot-fix's tag, labels, body faults, target, the pull request
body sections carrying a Target: line, board status, linking and delivering pull requests, the
state of its delivery unit and the agent review rule for its pull request. The module defines no
other public name, and only the registry imports it.
"""
import re

from kinds import OFF_BOARD, Key, Review, Tips
from priority import label as _label

_TAG = re.compile(r'^\[(F\d\d)\]')
_PRIORITY = 10
_TARGET = re.compile(r'^Target: `([^`\s]+)`\s*$')
_ITEM = re.compile(r'^(?:[-*+]|\d+[.)])\s')
_TARGET_FIELD = re.compile(r'^\s*Target:', re.I)


def tag(item: dict) -> str | None:
    """The [F00] tag an issue's or pull request's title opens with, which makes an issue a hot-fix."""
    matched = _TAG.match(item.get('title') or '')
    return matched[1] if matched else None


def labels(issue: dict) -> list[str]:
    """The priority label for priority 10, which a hot-fix carries beside type:hot-fix and its theme."""
    return [_label(_PRIORITY)]


def faults(issue: dict) -> list[str]:
    """The conditions of a hot-fix body that no other kind carries, each the issue fails: one Target:
    line, no open question, and an Acceptance Criteria section holding a criterion. format.py reports
    these beside its own checks."""
    from format import split_sections  # format imports this module
    found = []
    named = _targets(issue)
    if len(named) != 1:
        found.append(f'{len(named) or "no"} Target: lines in the Overview; it names one target branch')
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    if any(line.strip() for heading, lines in sections if heading == 'Open Questions' for line in lines):
        found.append('open questions remain')
    for heading, lines in sections:
        if heading == 'Acceptance Criteria' and not any(_ITEM.match(line) for line in lines):
            found.append('no acceptance criterion')
    return found


def board_status(issue: dict, held: str | None, delivering: list[dict]) -> str | None:
    """The status Board Status gives a hot-fix holding held, with its delivering pull requests: Done
    when closed as completed, OFF_BOARD when closed otherwise; when open, In Review while a delivering
    pull request is open and ready for review, In Progress while one is an open draft or the hot-fix
    holds In Progress or In Review, else Ready."""
    if issue['state'] == 'closed':
        return 'Done' if issue.get('state_reason') == 'completed' else OFF_BOARD
    pending = [p for p in delivering if (p.get('state') or 'open') == 'open' and not p.get('merged_at')]
    if any(not p.get('draft') for p in pending):
        return 'In Review'
    return 'In Progress' if pending or held in ('In Progress', 'In Review') else 'Ready'


def _targets(issue: dict) -> list[str]:
    """The branch each Target: line of the issue's Overview names, in order, outside fenced code."""
    from format import prose, split_sections  # format imports this module
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    lines = prose(next((lines for heading, lines in sections if heading == 'Overview'), []))
    return [found[1] for line in lines if (found := _TARGET.match(line))]


def target(issue: dict) -> str:
    """The branch a hot-fix fixes, or '' unless its Overview names exactly one."""
    named = _targets(issue)
    return named[0] if len(named) == 1 else ''


def issue_fields(body: str) -> list[str]:
    """Each section of a pull request body holding a Target: line, in any form and outside fenced code,
    the field a hot-fix's Overview carries."""
    from format import prose, split_sections  # format imports this module
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    held = [heading for heading, lines in sections if any(_TARGET_FIELD.match(line) for line in prose(lines))]
    return list(dict.fromkeys(held))


def linking_pulls(prs: list[dict], key: Key) -> list[dict]:
    """The pull requests whose Development field links the hot-fix, by number."""
    from sync import links_issue  # sync imports format, which imports this module
    return sorted((p for p in prs if links_issue(p, key)), key=lambda p: p['number'])


def delivery_fault(pull: dict, key: Key, issue: dict) -> str:
    """Why the pull request does not deliver the hot-fix, or '' when it does: its title opens with the
    hot-fix's tag, it lives in the hot-fix's repository, its base is the hot-fix's target, and its
    Development field links the hot-fix."""
    from sync import links_issue, pr_repo  # sync imports format, which imports this module
    fixed, branch = tag(issue), target(issue)
    base = (pull.get('base') or {}).get('ref') or ''
    if tag(pull) != fixed:
        return f'its title does not open with [{fixed}]'
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
    merged, running while any linking pull request is open, hold while In Progress, unit while Ready,
    and None otherwise."""
    if issue['state'] != 'open':
        return None
    if any(p.get('merged_at') for p in delivering):
        return 'unrecorded'
    if any((p.get('state') or 'open') == 'open' and not p.get('merged_at') for p in linking):
        return 'running'
    return {'In Progress': 'hold', 'Ready': 'unit'}.get(held)


def review(tips: Tips) -> Review:
    """The agent review rule for a hot-fix's pull request: a record is current while it names the pull
    request's head SHA and, as base_ref, its base branch, so a target moving on leaves the review
    current and a retarget does not."""
    return Review({'head': tips.head, 'base_ref': tips.base_ref})
