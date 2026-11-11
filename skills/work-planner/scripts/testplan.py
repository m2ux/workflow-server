"""Test Plan, as artifacts/test-plan.md states it: the rows of a pull request body's Test Plan section,
whether the plan has passed, and the criteria it claims.

Usage: testplan.py pull.json

The plan is readable when the body holds one Test Plan section, outside fenced code, whose only
table has the columns Test, Description, Coverage and Pass, in that order, with no row of another
width. The command reads a REST pull request record and prints a finding naming the pull request
when its plan is absent or unreadable, exiting 1; a readable plan prints nothing and exits 0.
"""
import argparse
import json
import re
from pathlib import Path
from typing import NamedTuple

from format import LINK, TICK, cells, cited, done_mark, split_sections

COLUMNS = ['Test', 'Description', 'Coverage', 'Pass']
DIVIDER = re.compile(r':?-{3,}:?')
FENCE = re.compile(r' {0,3}(`{3,}|~{3,})')
EVIDENCE = re.compile(r'https?://[^/\s?#]+(?:[/?#][^\s]*)?')


class Row(NamedTuple):
    """One Test Plan row, a cell for each column."""
    test: str
    description: str
    coverage: str
    result: str


def rows(body: str) -> list[Row] | None:
    """The Test Plan table's rows. None when the section is absent or unreadable."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    plans = [lines for heading, lines in sections if heading == 'Test Plan']
    if len(plans) != 1:
        return None
    lines = plans[0]
    if any(FENCE.match(line) for line in lines):
        return None
    at = [index for index, line in enumerate(lines) if line.startswith('|')]
    if not at or at[-1] - at[0] + 1 != len(at):
        return None
    table = [lines[index] for index in at]
    if len(table) < 2 or cells(table[0]) != COLUMNS:
        return None
    if len(cells(table[1])) != len(COLUMNS) or not all(DIVIDER.fullmatch(c) for c in cells(table[1])):
        return None
    found = []
    for line in table[2:]:
        parsed = cells(line)
        if len(parsed) != len(COLUMNS):
            return None
        found.append(Row(*parsed))
    return found


def ticked(result: str) -> bool:
    """Whether a Pass cell carries a tick linked to its web evidence."""
    link = LINK.fullmatch(result)
    return bool(link and done_mark(link[1]) == TICK and EVIDENCE.fullmatch(link[2]))


def passed(body: str) -> bool:
    """Whether the plan has passed: it has a check, and every check's result is a tick linked to its
    evidence."""
    checks = [r.result for r in rows(body) or [] if r.test.strip()]
    return bool(checks) and all(ticked(result) for result in checks)


def claims(body: str) -> tuple[set[int], set[int], set[int]]:
    """The criteria the plan names, those a check observes, and those whose every observing check
    carries a tick linked to its evidence. An unreadable plan claims none."""
    named, observed, incomplete = set(), set(), set()
    for r in rows(body) or []:
        acs = set(cited(r.coverage))
        named |= acs
        if r.test.strip():
            observed |= acs
            if not ticked(r.result):
                incomplete |= acs
    return named, observed, observed - incomplete


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('record', type=Path)
    record = json.loads(parser.parse_args().record.read_text())
    if rows(record.get('body') or '') is not None:
        return 0
    label = record.get('html_url') or f"#{record.get('number', '?')}"
    print(f'{label}: unreadable test plan')
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
