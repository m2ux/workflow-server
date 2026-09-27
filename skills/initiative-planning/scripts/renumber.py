"""Renumber an initiative's epics across its issue bodies.

Usage:
  python3 renumber.py --initiative 07 --map 6:0,0:1,3:2,2:3 FILE...

Rewrites every epic reference (E06, E06 W02, I07 E06) in each file in place, following the map of
old to new epic numbers. A reference to another initiative's epic (I03 E00, I00 E07) is left as it
is. Epics absent from the map keep their number. Prints the count of references rewritten per file.

After running: re-sort the initiative's Work Breakdown table by epic number, update each issue
title's [Ixx Eyy] prefix, and grep the prose for references a human wording carries (E00 W01–W05).
"""
import argparse
import re
from pathlib import Path

REF = re.compile(r'\bE(\d\d)\b')
OTHER = re.compile(r'I(\d\d) $')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--initiative', required=True, help='two-digit initiative number, e.g. 07')
    parser.add_argument('--map', required=True, help='old:new epic numbers, e.g. 6:0,0:1')
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    mapping = {}
    for pair in args.map.split(','):
        old, new = pair.split(':')
        mapping[int(old)] = int(new)

    for name in args.files:
        path = Path(name)
        text = path.read_text()
        count = 0

        def repl(m: re.Match) -> str:
            nonlocal count
            before = OTHER.search(text[max(0, m.start() - 4):m.start()])
            if before and before.group(1) != args.initiative:
                return m.group(0)
            old = int(m.group(1))
            if old not in mapping:
                return m.group(0)
            count += 1
            return f'E{mapping[old]:02d}'

        out = REF.sub(repl, text)
        path.write_text(out)
        print(f'{name}: {count} references rewritten')


if __name__ == '__main__':
    main()
