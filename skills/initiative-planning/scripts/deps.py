"""Check the task dependency graph of an initiative's epics.

Usage:
  python3 deps.py E00=bodies/epic-00.md E01=bodies/epic-01.md ...

Each file is an epic issue body holding the house Work Breakdown table:
  | Task | Outcomes | Depends on | Can Accompany | PR |
Cells are read by column name, so the column order does not matter.

A dependency is one of:
  W03             a task in the same epic
  W04–W09         a range of tasks in the same epic
  E01 W02         a task in another epic
  E01             every task in another epic
  #750            an external issue, not checked
  I05 E00 W02     another initiative's epic or task, not checked
Markdown links are read by their text, so [E00](https://…/issues/704) is E00.

Problems (exit status 1): unknown references, a task depending on itself or a later task in its epic,
an epic depending on a later epic, and cycles.
Advisory: task numbers that do not follow the order tasks can start.
Also printed: each task's level (0 = can start now) and the longest chains.
"""
import re
import sys
from pathlib import Path

ROW = re.compile(r'^\| W\d\d \|')
LINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')
RANGE = re.compile(r'W(\d\d)[–-]W(\d\d)')
TASK = re.compile(r'E\d\d W\d\d')
EPIC = re.compile(r'E\d\d')
EXTERNAL = re.compile(r'#\d+|I\d\d E\d\d( W\d\d)?')
MAX_CHAINS = 10


def cells(line: str) -> list[str]:
    return [c.strip() for c in LINK.sub(r'\1', line).strip().strip('|').split('|')]


def parse(epics: dict[str, Path]) -> tuple[dict, list[str]]:
    rows = {}
    for epic, path in epics.items():
        header: list[str] = []
        for line in path.read_text().splitlines():
            if line.startswith('| Task |'):
                header = cells(line)
            elif ROW.match(line):
                row = dict(zip(header, cells(line)))
                wid = row.get('Task', '')
                rows[f'{epic} {wid}'] = (row.get('Outcomes', ''), row.get('Depends on', ''),
                                         row.get('Can Accompany', ''))

    problems = []
    tasks = {}
    for key, (outcomes, deps, accompany) in rows.items():
        epic = key.split()[0]
        dep_list = []
        for d in (x.strip() for x in deps.split(',') if x.strip()):
            rng = RANGE.fullmatch(d)
            if rng:
                dep_list += [f'{epic} W{i:02d}' for i in range(int(rng[1]), int(rng[2]) + 1)]
            elif EXTERNAL.fullmatch(d):
                continue
            elif TASK.fullmatch(d):
                dep_list.append(d)
            elif EPIC.fullmatch(d):
                own = [k for k in rows if k.startswith(d + ' ')]
                if not own:
                    problems.append(f'{key}: depends on epic {d}, which was not given or has no tasks')
                dep_list += own
            elif re.fullmatch(r'W\d\d', d):
                dep_list.append(f'{epic} {d}')
            else:
                problems.append(f'{key}: unreadable dependency {d!r}')
        acc = []
        for a in (x.strip() for x in accompany.split(',') if x.strip()):
            acc.append(a if a.startswith('E') else f'{epic} {a}')
        tasks[key] = (outcomes, dep_list, acc)
    return tasks, problems


def main(argv: list[str]) -> int:
    epics = {}
    for arg in argv:
        name, _, path = arg.partition('=')
        epics[name] = Path(path)
    tasks, problems = parse(epics)
    advisory = []

    for key, (_, deps, acc) in tasks.items():
        epic, wid = key.split()
        for d in deps:
            if d not in tasks:
                problems.append(f'{key}: unknown dependency {d}')
                continue
            de, dw = d.split()
            if de == epic and dw >= wid:
                problems.append(f'{key}: depends on {d}, not an earlier task in its epic')
            if de > epic:
                problems.append(f'{key}: depends on later epic {d}')
        for a in acc:
            if a not in tasks:
                problems.append(f'{key}: unknown accompany {a}')

    graph = {k: [d for d in v[1] if d in tasks] for k, v in tasks.items()}
    state: dict[str, int] = {}
    cyclic = False

    def visit(n: str, path: list[str]) -> None:
        nonlocal cyclic
        if state.get(n) == 1:
            problems.append('cycle: ' + ' -> '.join(path + [n]))
            cyclic = True
            return
        if state.get(n) == 2:
            return
        state[n] = 1
        for m in graph[n]:
            visit(m, path + [n])
        state[n] = 2

    for n in graph:
        visit(n, [])
    print('--- problems')
    print('\n'.join(problems) if problems else 'none')
    if cyclic:
        return 1

    level: dict[str, int] = {}

    def lv(n: str) -> int:
        if n not in level:
            level[n] = 1 + max((lv(m) for m in graph[n]), default=-1)
        return level[n]

    for epic in epics:
        own = sorted(k for k in tasks if k.startswith(epic + ' '))
        for a, b in zip(own, own[1:]):
            if lv(b) < lv(a):
                advisory.append(f'{b} (level {lv(b)}) is numbered after {a} (level {lv(a)})')

    print('\n--- advisory: numbering against start order')
    print('\n'.join(advisory) if advisory else 'none')
    print('\n--- levels (0 = can start now)')
    for n in sorted(tasks, key=lambda k: (lv(k), k)):
        print(lv(n), n, '-', tasks[n][0][:70])

    top = max(level.values(), default=0)
    ends = sorted(k for k, v in level.items() if v == top)

    def chains(n: str) -> list[list[str]]:
        preds = [m for m in graph[n] if level[m] == level[n] - 1]
        return [[n]] if not preds else [c + [n] for m in preds for c in chains(m)]

    found = [c for end in ends for c in chains(end)]
    shared = set(found[0]).intersection(*found[1:]) if found else set()
    print(f'\n--- longest chains: {len(found)}, each of {top + 1} steps')
    print('on every chain:', ', '.join(sorted(shared)) or 'none')
    for c in found[:MAX_CHAINS]:
        print(' -> '.join(c))
    if len(found) > MAX_CHAINS:
        print(f'... {len(found) - MAX_CHAINS} more')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
