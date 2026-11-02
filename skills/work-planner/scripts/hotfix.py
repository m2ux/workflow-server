"""A hot-fix's identity and lifecycle, as artifacts/hotfix-body.md and artifacts/hotfix.md state them.

An issue whose title opens with [F00] is a hot-fix, and it carries the priority: 10 label. Its
Overview names the long-lived branch it fixes in one Target: line. Its target, board status, the pull
requests that deliver it and the state of its delivery unit are read here, and the scripts that
place, survey, record, check or report a hot-fix call these functions.
"""
import re

HOTFIX = re.compile(r'^\[(F\d\d)\]')
PRIORITY = 'priority: 10'
OFF_BOARD = 'off the board'
TARGET = re.compile(r'^Target: `([^`\s]+)`\s*$')
Key = tuple[str, int]


def hotfix_tag(item: dict) -> str | None:
    """The [F00] tag an issue's or pull request's title opens with, which makes an issue a hot-fix."""
    matched = HOTFIX.match(item.get('title') or '')
    return matched[1] if matched else None


def is_hotfix(issue: dict) -> bool:
    return hotfix_tag(issue) is not None


def formatted(issue: dict) -> bool:
    """Whether the hot-fix's title, labels and body meet the hot-fix format: format.py's check of it
    leaves nothing to apply or decide."""
    from format import Review  # format imports this module
    review = Review(issue)
    review.run()
    return not (review.apply or review.decide)


def board_status(issue: dict, held: str | None) -> str | None:
    """The status Board Status gives a hot-fix holding held: Done when closed as completed, OFF_BOARD
    when closed otherwise, Backlog when open and out of the hot-fix format, In Progress when open and
    In Progress or In Review, else Ready."""
    if issue['state'] == 'closed':
        return 'Done' if issue.get('state_reason') == 'completed' else OFF_BOARD
    if not formatted(issue):
        return 'Backlog'
    return 'In Progress' if held in ('In Progress', 'In Review') else 'Ready'


def targets(issue: dict) -> list[str]:
    """The branch each Target: line of the issue's Overview names, in order."""
    from format import split_sections  # format imports this module
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    lines = next((lines for heading, lines in sections if heading == 'Overview'), [])
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
    merged, running while any linking pull request is open, hold while In Progress, unit while Ready,
    and None otherwise."""
    if issue['state'] != 'open':
        return None
    if any(p.get('merged_at') for p in delivering):
        return 'unrecorded'
    if any((p.get('state') or 'open') == 'open' and not p.get('merged_at') for p in linking):
        return 'running'
    return {'In Progress': 'hold', 'Ready': 'unit'}.get(held)
