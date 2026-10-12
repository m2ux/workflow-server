"""Resolve the conflicts the upstream Fires-on index creates against a rewritten entry.

The index inserted a `**Fires on:**` line directly above `**Detect:**`, so a
commit that rewrites Detect conflicts on adjacency alone. In diff3 form such a
hunk has an upstream side equal to the base plus that line. Those resolve to the
line plus this branch's text.

A hunk whose upstream side differs from the base otherwise is one both sides
rewrote. It is left in place: which wording survives is a judgment, not a merge.

Usage: resolve_fires_on.py <file> [<file>...]
"""

import re
import sys
from pathlib import Path

START = re.compile(r'^<<<<<<< ')
BASE = re.compile(r'^\|\|\|\|\|\|\| ')
MID = re.compile(r'^=======$')
END = re.compile(r'^>>>>>>> ')
FIRES_ON = re.compile(r'^\*\*Fires on:\*\*')


def split_fires_on(ours: list[str]) -> tuple[list[str], list[str]]:
    """Return the Fires-on lines, and the rest with their trailing blank removed."""
    fires, rest = [], []
    index = 0
    while index < len(ours):
        if FIRES_ON.match(ours[index]):
            fires.append(ours[index])
            if index + 1 < len(ours) and ours[index + 1].strip() == '':
                fires.append(ours[index + 1])
                index += 1
        else:
            rest.append(ours[index])
        index += 1
    return fires, rest


def resolve(path: Path) -> tuple[int, int, list[int]]:
    lines = path.read_text().splitlines(keepends=True)
    out, auto, left, remaining = [], 0, 0, []
    index = 0
    while index < len(lines):
        if not START.match(lines[index]):
            out.append(lines[index])
            index += 1
            continue
        start_line = index + 1
        ours, base, theirs, section = [], [], [], 'ours'
        index += 1
        while index < len(lines) and not END.match(lines[index]):
            if BASE.match(lines[index]):
                section = 'base'
            elif MID.match(lines[index]):
                section = 'theirs'
            else:
                {'ours': ours, 'base': base, 'theirs': theirs}[section].append(lines[index])
            index += 1
        index += 1  # consume the >>>>>>> line

        fires, rest = split_fires_on(ours)
        if fires and rest == base:
            out.extend(fires + theirs)
            auto += 1
        else:
            out.append('<<<<<<< HEAD\n')
            out.extend(ours)
            out.append('||||||| base\n')
            out.extend(base)
            out.append('=======\n')
            out.extend(theirs)
            out.append('>>>>>>> incoming\n')
            left += 1
            remaining.append(start_line)
    path.write_text(''.join(out))
    return auto, left, remaining


total_auto = total_left = 0
for name in sys.argv[1:]:
    path = Path(name)
    auto, left, remaining = resolve(path)
    total_auto += auto
    total_left += left
    print(f'{path.name}: auto={auto} manual={left} at={remaining}')
print(f'TOTAL auto={total_auto} manual={total_left}')
