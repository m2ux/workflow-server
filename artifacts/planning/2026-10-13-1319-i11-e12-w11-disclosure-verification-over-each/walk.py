"""Each mode's retrieval, counted over one skill layout.

A reader selects a mode from SKILL.md, reads that mode file whole, and opens
the files it sends them to. This measures that traversal at depth one:

  M1  files opened: SKILL.md, the mode file, and each further file it cites
  M2  command specifications it cites that stand in the mode file, against
      those it reaches by a link out
  M3  lines loaded: the line count of the files M1 names

What counts as a command specification is the shared skill-file check's own
definition, imported from the checkout given, so one rule reads both layouts.

    python3 walk.py <check_skill_files.py> <skill directory>
"""

import importlib.util
import sys
from pathlib import Path


def load(path):
    spec = importlib.util.spec_from_file_location('check_skill_files', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def spec_anchors(check, path, cache):
    """The anchors of the command specifications a file states."""
    if path not in cache:
        if not path.is_file():
            cache[path] = (set(), 0)
        else:
            lines, _, headings = check.scan(path)
            cache[path] = ({check.anchor_of(title)
                            for _, title in check.specifications(headings)},
                           len(lines))
    return cache[path]


def walk(check, skill):
    entry = skill / 'SKILL.md'
    cache = {}
    _, entry_lines = spec_anchors(check, entry, cache)
    rows = []
    for mode in sorted((skill / 'references').glob('*-mode.md')):
        lines, fenced, headings = check.scan(mode)
        held = check.specification_spans(headings, len(lines))
        own, mode_lines = spec_anchors(check, mode, cache)
        opened = set()
        here = set()
        away = set()
        for index, target in check.targets(mode, lines, fenced):
            if index in held:
                continue
            name, _, fragment = target.partition('#')
            destination = (mode.parent / name).resolve() if name else mode
            if not destination.is_file():
                continue
            if destination != mode and destination != entry:
                opened.add(destination)
            if not fragment:
                continue
            anchor = check.anchor_of(fragment)
            if destination == mode:
                if anchor in own:
                    here.add(anchor)
            else:
                anchors, _ = spec_anchors(check, destination, cache)
                if anchor in anchors:
                    away.add((destination.name, anchor))
        loaded = entry_lines + mode_lines + sum(spec_anchors(check, f, cache)[1]
                                                for f in opened)
        holders = {}
        for name, _ in away:
            holders[name] = holders.get(name, 0) + 1
        rows.append((mode.name, 2 + len(opened), len(here), len(away), loaded,
                     sorted(f.name for f in opened), holders))
    return rows


def main(argv):
    check = load(Path(argv[1]).resolve())
    skill = Path(argv[2]).resolve()
    rows = walk(check, skill)
    print('mode\tM1_files\tM2_in_file\tM2_link_out\tM3_lines\tholders\topened')
    for name, files, here, away, loaded, opened, holders in rows:
        where = ','.join(f'{key}:{value}' for key, value in sorted(holders.items()))
        print(f'{name}\t{files}\t{here}\t{away}\t{loaded}\t{where}\t' + ','.join(opened))
    totals = [sum(row[index] for row in rows) for index in (1, 2, 3, 4)]
    print(f'TOTAL\t{totals[0]}\t{totals[1]}\t{totals[2]}\t{totals[3]}\t')


if __name__ == '__main__':
    main(sys.argv)
