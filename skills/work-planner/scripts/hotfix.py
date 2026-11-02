"""A hot-fix's identity and lifecycle, as artifacts/hotfix-body.md and artifacts/hotfix.md state them.

An issue whose title opens with [F00] is a hot-fix, and it carries the priority: 10 label. Its board
status, the pull requests that deliver it and the state of its delivery unit are read here, and the
scripts that place, survey, record, check or report a hot-fix call these functions.
"""
import re

HOTFIX = re.compile(r'^\[(F\d\d)\]')
PRIORITY = 'priority: 10'
OFF_BOARD = 'off the board'
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


def delivering_pulls(prs: list[dict], key: Key, tag: str, base: str) -> list[dict]:
    """The pull requests delivering a hot-fix: titled with its tag, in its repository, into its default
    branch base, with a Development link to it, by number."""
    from sync import links_issue, pr_repo  # sync imports format, which imports this module
    return sorted((p for p in prs if base and hotfix_tag(p) == tag and pr_repo(p).lower() == key[0].lower()
                   and ((p.get('base') or {}).get('ref') or '') == base and links_issue(p, key)),
                  key=lambda p: p['number'])


def unit_state(issue: dict, held: str | None, delivering: list[dict]) -> str | None:
    """Where an open hot-fix's Delivery Unit stands: unrecorded once a delivering pull request has
    merged, running while one is open, hold while In Progress, unit while Ready, and None otherwise."""
    if issue['state'] != 'open':
        return None
    if any(p.get('merged_at') for p in delivering):
        return 'unrecorded'
    if any((p.get('state') or 'open') == 'open' for p in delivering):
        return 'running'
    return {'In Progress': 'hold', 'Ready': 'unit'}.get(held)
