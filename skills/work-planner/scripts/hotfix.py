"""A hot-fix's identity and lifecycle, as artifacts/hotfix-body.md and artifacts/hotfix.md state them.

An issue whose title opens with [F00] is a hot-fix, and it carries the priority: 10 label. Its board
status, the pull requests that deliver it and the state of its delivery unit are read here, and the
scripts that place, survey, record, check or report a hot-fix call these functions.
"""
import re

HOTFIX = re.compile(r'^\[(F\d\d)\]')
PRIORITY = 'priority: 10'
OFF_BOARD = 'off the board'
DEFAULT_BASE = '(default branch)'
Key = tuple[str, int]


def hotfix_tag(item: dict) -> str | None:
    """The [F00] tag an issue's or pull request's title opens with, which makes an issue a hot-fix."""
    matched = HOTFIX.match(item.get('title') or '')
    return matched[1] if matched else None


def is_hotfix(issue: dict) -> bool:
    return hotfix_tag(issue) is not None


def board_status(issue: dict, held: str | None) -> str | None:
    """The status Board Status gives a hot-fix holding held: Done when closed as completed, OFF_BOARD
    when closed otherwise, In Progress when open and In Progress or In Review, else Ready."""
    if issue['state'] == 'closed':
        return 'Done' if issue.get('state_reason') == 'completed' else OFF_BOARD
    return 'In Progress' if held in ('In Progress', 'In Review') else 'Ready'


def default_branch(pull: dict) -> str:
    """The default branch of the repository a pull request targets, as its REST record names it."""
    return ((pull.get('base') or {}).get('repo') or {}).get('default_branch') or ''


def linking_pulls(prs: list[dict], key: Key) -> list[dict]:
    """The pull requests whose Development field links the hot-fix, by number."""
    from sync import links_issue  # sync imports format, which imports this module
    return sorted((p for p in prs if links_issue(p, key)), key=lambda p: p['number'])


def delivery_fault(pull: dict, key: Key, tag: str) -> str:
    """Why the pull request does not deliver the hot-fix, or '' when it does: its title opens with the
    hot-fix's tag, it lives in the hot-fix's repository, its base is that repository's default
    branch, and its Development field links the hot-fix."""
    from sync import links_issue, pr_repo  # sync imports format, which imports this module
    target = ((pull.get('base') or {}).get('ref') or '')
    if hotfix_tag(pull) != tag:
        return f'its title does not open with [{tag}]'
    if pr_repo(pull).lower() != key[0].lower():
        return f'it lives in {pr_repo(pull)}, not {key[0]}'
    if not (base := default_branch(pull)) or target != base:
        return f"its base is {target or 'unknown'}, not the default branch {base or 'unknown'}"
    if not links_issue(pull, key):
        return f'its Development field does not link #{key[1]}'
    return ''


def delivering_pulls(prs: list[dict], key: Key, tag: str) -> list[dict]:
    """The pull requests that deliver the hot-fix, as delivery_fault tests each, by number."""
    return sorted((p for p in prs if not delivery_fault(p, key, tag)), key=lambda p: p['number'])


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
