"""Work Priority, as artifacts/work-priority.md states it: the rank a priority label gives, the label
a number names, and the execution-order key."""
import re

RANK = re.compile(r'^priority: ([1-9]\d*)$')


def rank(issue: dict) -> int | None:
    """The largest valid priority label, or None when the issue is unranked."""
    found = [int(match[1]) for label in issue.get('labels') or []
             if (match := RANK.fullmatch(label['name']))]
    return max(found) if found else None


def label(number: int) -> str:
    """The priority label naming a positive integer; any other value names none and is refused."""
    if isinstance(number, bool) or not isinstance(number, int) or number < 1:
        raise ValueError(f'a priority is a positive integer, not {number!r}')
    return f'priority: {number}'


def execution_key(initiative: dict | None, epic: dict | None,
                  initiative_order: tuple = (), epic_order: tuple = ()) -> tuple:
    """The key Execution Order sorts by: the initiative's rank, then initiative_order among equally
    ranked initiatives, then the epic's rank, then epic_order. A larger rank sorts first, and an
    absent or unranked issue sorts after every ranked one at its own level."""
    def level(issue: dict | None) -> int:
        return (rank(issue) or 0) if issue else 0

    return -level(initiative), initiative_order, -level(epic), epic_order
