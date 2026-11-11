"""Read positive issue priority labels."""
import re

RANK = re.compile(r'^priority: ([1-9]\d*)$')


def rank(issue: dict) -> int | None:
    """The largest valid priority label, or None when the issue is unranked."""
    found = [int(match[1]) for label in issue.get('labels') or []
             if (match := RANK.fullmatch(label['name']))]
    return max(found) if found else None
