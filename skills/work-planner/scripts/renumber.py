"""Renumber an initiative's epics, or one epic's tasks, across its issue bodies.

Epics:
  python3 renumber.py --initiative 07 [--prs prs.json] --map 6:0,0:1,3:2,2:3 FILE...

  Rewrites every epic reference (E06, E06 W02, E06:W02, I07 E06, I07:E06) in each file, following
  the map of old to new epic numbers. A link keeps its target: an epic's issue does not change when
  its number does.

Tasks:
  python3 renumber.py --initiative 07 --epic 1 --own E01.md --tasks 7:3,2:4 FILE...

  Rewrites every reference to the epic's tasks (E01 W07, E01:W07, I07:E01:W07) in each file, and
  bare task references (W07) in the epic's own body, --own, where a bare number is unambiguous.
  --own is rewritten whether or not it is also listed among FILE.

In both modes a reference to another initiative (I03 E00, I03:E00) is left as it is, and numbers
absent from the map keep theirs. Files of other initiatives go after --outside: in them only a
reference carrying this initiative's prefix (I07 E01 W03, I07:E01:W03) is rewritten, since an
unprefixed one means their own initiative. A bare task number right after a link ([I00 E01](…) W05)
belongs to the linked epic and is left as it is. Files are rewritten in place. A map that sends two numbers to one,
or onto a number it leaves out, is refused and nothing is written. So is a map that renumbers
work a pull request names: a task whose id in --own links a pull request or commit, open or merged,
or an epic a pull request
in --prs names ([I07:E00] Purpose), since that is how its delivery is found. prs.json holds pull
requests as JSON lines, as update.py takes them.

After running: re-sort the renumbered table, update each affected issue title, check every range
the script prints (a renumbered W04–W09 may not be contiguous), and grep the prose for references it
cannot see.
"""
import argparse
import json
import re
import sys
from pathlib import Path

EPIC_REF = re.compile(r'\bE(\d\d)\b')
PR_REF = re.compile(r'^\[I(\d\d):E(\d\d)\]')
DELIVERED_ROW = re.compile(r'^\| (?:\[[ xX]\] \| )?\[W(\d\d)\]\([^)]*/(?:pull|commit)/', re.MULTILINE)
TASK_REF = re.compile(r'\bE(\d\d)([ :])W(\d\d)\b')
BARE_TASK = re.compile(r'(?<!E\d\d )(?<!E\d\d:)(?<!\) )\bW(\d\d)\b')
TABLE_ROW = re.compile(r'^\| (?:\[[ xX]\] \| )?\[?W(\d\d)\b', re.MULTILINE)
RANGE = re.compile(r'W\d\d[–-]W\d\d')
INITIATIVE = re.compile(r'I(\d\d)[ :]$')


def parse_map(text: str) -> dict[int, int]:
    mapping = {}
    for pair in text.split(','):
        old, new = pair.split(':')
        mapping[int(old)] = int(new)
    return mapping


def refuse_clashes(mapping: dict[int, int], present: set[int], what: str) -> None:
    targets = list(mapping.values())
    clashes = {t for t in targets if targets.count(t) > 1}
    clashes |= {t for t in targets if t in present and t not in mapping}
    if clashes:
        sys.exit(f'map sends {what} onto {sorted(clashes)}: each target must be unique and must not '
                 'be a number the map leaves out. Nothing was written.')


def other_initiative(text: str, start: int, initiative: str, outside: bool = False) -> bool:
    """Whether a reference at start belongs to another initiative than this one."""
    before = INITIATIVE.search(text[max(0, start - 4):start])
    if outside:
        return not before or before.group(1) != initiative
    return bool(before) and before.group(1) != initiative


def renumber_epics(texts: dict[str, str], initiative: str, mapping: dict[int, int],
                    outside: set[str]) -> dict[str, str]:
    present = {int(m[1]) for name, t in texts.items() for m in EPIC_REF.finditer(t)
               if not other_initiative(t, m.start(), initiative, name in outside)}
    refuse_clashes(mapping, present, 'epics')
    out = {}
    for name, text in texts.items():
        count = 0

        def repl(m: re.Match) -> str:
            nonlocal count
            old = int(m[1])
            if other_initiative(text, m.start(), initiative, name in outside) or old not in mapping:
                return m[0]
            count += 1
            return f'E{mapping[old]:02d}'

        out[name] = EPIC_REF.sub(repl, text)
        print(f'{name}: {count} references rewritten')
    return out


def renumber_tasks(texts: dict[str, str], initiative: str, epic: int, own: str,
                   mapping: dict[int, int], outside: set[str]) -> dict[str, str]:
    present = {int(n) for n in TABLE_ROW.findall(texts[own])}
    refuse_clashes(mapping, present, 'tasks')
    out = {}
    for name, text in texts.items():
        count = 0

        def qualified(m: re.Match) -> str:
            nonlocal count
            if other_initiative(text, m.start(), initiative, name in outside) or int(m[1]) != epic:
                return m[0]
            old = int(m[3])
            if old not in mapping:
                return m[0]
            count += 1
            return f'E{epic:02d}{m[2]}W{mapping[old]:02d}'

        def bare(m: re.Match) -> str:
            nonlocal count
            old = int(m[1])
            if old not in mapping:
                return m[0]
            count += 1
            return f'W{mapping[old]:02d}'

        text = TASK_REF.sub(qualified, text)
        if name == own:
            text = BARE_TASK.sub(bare, text)
        out[name] = text
        print(f'{name}: {count} references rewritten')
        for line in text.splitlines():
            if RANGE.search(line) and (name == own or re.search(rf'E{epic:02d}[ :]W', line)):
                print(f'  check range: {line.strip()[:110]}')
    return out


def named_epics(path: str, initiative: str) -> set[int]:
    """The epics of the initiative that pull request titles name."""
    epics = set()
    for line in Path(path).read_text().splitlines():
        m = PR_REF.match(json.loads(line)['title']) if line.strip() else None
        if m and m[1] == initiative:
            epics.add(int(m[2]))
    return epics


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--initiative', required=True, help='two-digit initiative number, e.g. 07')
    parser.add_argument('--map', help='epic mode: old:new epic numbers, e.g. 6:0,0:1')
    parser.add_argument('--epic', type=int, help='task mode: the epic whose tasks are renumbered')
    parser.add_argument('--own', help="task mode: the epic's own body file")
    parser.add_argument('--tasks', help='task mode: old:new task numbers, e.g. 7:3,2:4')
    parser.add_argument('--prs', help='epic mode: pull requests as JSON lines; an epic they name keeps its number')
    parser.add_argument('files', nargs='*')
    parser.add_argument('--outside', nargs='*', default=[], help="other initiatives' issue bodies")
    args = parser.parse_args()

    task_mode = args.tasks is not None
    if task_mode == (args.map is not None):
        sys.exit('give either --map (epics) or --epic, --own and --tasks (tasks)')
    if task_mode and (args.epic is None or not args.own):
        sys.exit('task mode needs --epic and --own')

    moved = {o for o, n in parse_map(args.tasks or args.map).items() if o != n}
    if task_mode:
        delivered = {int(w) for w in DELIVERED_ROW.findall(Path(args.own).read_text())}
        held = sorted(f'E{args.epic:02d}:W{o:02d}' for o in moved if o in delivered)
    else:
        epics = named_epics(args.prs, args.initiative) if args.prs else set()
        held = sorted(f'E{o:02d}' for o in moved if o in epics)
    if held:
        sys.exit(f'work a pull request names keeps its number: {", ".join(held)}. Nothing was written.')

    names = list(dict.fromkeys(args.files + ([args.own] if task_mode else [])))
    names += [n for n in args.outside if n not in names]
    texts = {name: Path(name).read_text() for name in names}
    outside = set(args.outside)
    if task_mode:
        out = renumber_tasks(texts, args.initiative, args.epic, args.own, parse_map(args.tasks), outside)
    else:
        out = renumber_epics(texts, args.initiative, parse_map(args.map), outside)
    for name, text in out.items():
        Path(name).write_text(text)


if __name__ == '__main__':
    main()
