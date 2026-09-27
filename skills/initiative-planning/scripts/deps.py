"""Check the task dependency graph of an initiative's epics.

Usage:
  python3 deps.py E00=bodies/epic-00.md E01=bodies/epic-01.md ...

Each file is an epic issue body holding the house Work Breakdown table:
  | Task | Work | PR | Depends on | Can Accompany |

A dependency is a task in the same epic (W03), a task in another epic (E01 W02), a range in the same
epic (W04–W09), or an external issue (#750). Reports unknown references, backward references (a task
depending on a later task in its epic, or an epic depending on a later epic), cycles, each task's
level (0 = can start now), numbering that does not follow level, and the longest chains.
Exit status 1 when any problem is found.
"""
import re
import sys
from pathlib import Path

ROW = re.compile(r'^\| W\d\d \|')
RANGE = re.compile(r'W(\d\d)[–-]W(\d\d)')


def parse(epics: dict[str, Path]) -> dict[str, tuple[str, list[str], list[str]]]:
    tasks = {}
    for epic, path in epics.items():
        for line in path.read_text().splitlines():
            if not ROW.match(line):
                continue
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            wid, work, _pr, deps, accompany = (cells + [''] * 5)[:5]
            dep_list = []
            for d in (x.strip() for x in deps.split(',') if x.strip()):
                rng = RANGE.fullmatch(d)
                if rng:
                    dep_list += [f'{epic} W{i:02d}' for i in range(int(rng[1]), int(rng[2]) + 1)]
                elif d.startswith(('E', '#')):
                    dep_list.append(d)
                else:
                    dep_list.append(f'{epic} {d}')
            acc = [a if a.startswith('E') else f'{epic} {a}'
                   for a in (x.strip() for x in accompany.split(',') if x.strip())]
            tasks[f'{epic} {wid}'] = (work, dep_list, acc)
    return tasks


def main(argv: list[str]) -> int:
    epics = {}
    for arg in argv:
        name, _, path = arg.partition('=')
        epics[name] = Path(path)
    tasks = parse(epics)
    problems = []

    for key, (_, deps, acc) in tasks.items():
        epic, wid = key.split()
        for d in deps:
            if d.startswith('#'):
                continue
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

    def visit(n: str, path: list[str]) -> None:
        if state.get(n) == 1:
            problems.append('cycle: ' + ' -> '.join(path + [n]))
            return
        if state.get(n) == 2:
            return
        state[n] = 1
        for m in graph[n]:
            visit(m, path + [n])
        state[n] = 2

    for n in graph:
        visit(n, [])
    if any(p.startswith('cycle') for p in problems):
        print('\n'.join(problems))
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
                problems.append(f'{b} (level {lv(b)}) is numbered after {a} (level {lv(a)})')

    print('--- problems')
    print('\n'.join(problems) if problems else 'none')
    print('\n--- levels (0 = can start now)')
    for n in sorted(tasks, key=lambda k: (lv(k), k)):
        print(lv(n), n, '-', tasks[n][0][:70])

    top = max(level.values(), default=0)

    def chains(n: str) -> list[list[str]]:
        preds = [m for m in graph[n] if level[m] == level[n] - 1]
        return [[n]] if not preds else [c + [n] for m in preds for c in chains(m)]

    print(f'\n--- longest chains ({top + 1} steps)')
    for end in sorted(k for k, v in level.items() if v == top):
        for c in chains(end):
            print(' -> '.join(c))
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
