"""Check the task dependency graph of an initiative's epics.

Usage:
  python3 deps.py [I=bodies/initiative.md] E00=bodies/epic-00.md E01=bodies/epic-01.md ...

Each file is an epic issue body holding the agent-engineering Work Breakdown table:
  | Task | Description | Coverage | Depends on | Joins | Done |
A task's id links each pull request associated with it, open or merged:
  | [W01](https://…/pull/950), [W01](https://…/pull/960) | … | AC1 | | | |
A row is the task its Task cell opens with, however many deliveries that id links.
Cells are read by column name, so the column order does not matter.

A dependency is one of:
  W03             a task in the same epic
  W04–W09         a range of tasks in the same epic
  E01:W02         a task in another epic
  E01             every task in another epic
  #750            an external issue, not checked
  I05:E00:W02     another initiative's epic or task, not checked
Markdown links are read by their text, so [E01:W02](https://…/issues/937) is E01:W02.

Problems (exit status 1): a Task cell naming a second, different task id, unknown references,
a task depending on itself or a later task in its epic,
an epic depending on a later epic, cycles, a dependency listed twice, and a dependency that another
in the same cell already implies. The tasks a whole-epic dependency expands to are not reported as
implied or listed twice. Joins problems: a task joining one that does not join it back, and two joined
tasks where one depends on the other, directly or through a task outside the pair.
Also printed: each pair of tasks in an epic where neither depends on the other and the two do not
name each other in Joins, and each whole-epic dependency, with that epic's row count, the binding
row and its level, and the earliest row and its level. The binding row has the highest level in the
epic, and the earliest row the lowest. Where several share that level, the section names the lowest
task id.
With I=, the initiative's Depends on cells are checked: each epic's cell names exactly the other
epics required in full by every task or joined unit, less transitive epic dependencies, and names no task.
Another initiative's epic (I05:E00) or an issue (#750) may also be named.
Advisory: task numbers that do not follow the order tasks can start.
Also printed: each task's level (0 = can start now) and the longest chains.
"""
import re
import sys
from pathlib import Path

LINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')
RANGE = re.compile(r'W(\d\d)[–-]W(\d\d)')
TASK = re.compile(r'E\d\d:W\d\d')
EPIC = re.compile(r'E\d\d')
WID = re.compile(r'W\d\d')
EXTERNAL = re.compile(r'#\d+|I\d\d:E\d\d(?::W\d\d)?')
INITIATIVE_EPIC = re.compile(r'#\d+|I\d\d:E\d\d')
MAX_CHAINS = 10


def cells(line: str) -> list[str]:
    return [c.strip() for c in LINK.sub(r'\1', line).strip().strip('|').split('|')]


def parse(epics: dict[str, Path]) -> tuple[dict, list[str], dict, list[tuple[str, str]]]:
    rows = {}
    problems = []
    for epic, path in epics.items():
        header: list[str] = []
        for line in path.read_text().splitlines():
            if not line.startswith('|'):
                continue
            parsed = cells(line)
            if not header and 'Task' in parsed:
                header = parsed
                continue
            if not header or not parsed or parsed[0] == '---':
                continue
            row = dict(zip(header, parsed))
            cell = row.get('Task', '')
            head = WID.match(cell)
            if not head:
                continue
            wid = head[0]
            disagreeing = sorted({other for other in WID.findall(cell) if other != wid})
            if disagreeing:
                problems.append(f'{epic}:{wid}: Task cell also names {", ".join(disagreeing)}')
            rows[f'{epic}:{wid}'] = (row.get('Description', ''), row.get('Depends on', ''),
                                     row.get('Joins', ''))

    tasks = {}
    whole: dict[str, set[str]] = {}
    edges: list[tuple[str, str]] = []
    for key, (description, deps, accompany) in rows.items():
        epic = key.split(':')[0]
        dep_list = []
        whole[key] = set()
        for d in (x.strip() for x in deps.split(',') if x.strip()):
            rng = RANGE.fullmatch(d)
            if rng:
                dep_list += [f'{epic}:W{i:02d}' for i in range(int(rng[1]), int(rng[2]) + 1)]
            elif EXTERNAL.fullmatch(d):
                continue
            elif TASK.fullmatch(d):
                dep_list.append(d)
            elif EPIC.fullmatch(d):
                own = [k for k in rows if k.startswith(d + ':')]
                if not own:
                    problems.append(f'{key}: depends on epic {d}, which was not given or has no tasks')
                else:
                    dep_list += own
                    whole[key] |= set(own)
                    if (key, d) not in edges:
                        edges.append((key, d))
            elif re.fullmatch(r'W\d\d', d):
                dep_list.append(f'{epic}:{d}')
            else:
                problems.append(f'{key}: unreadable dependency {d!r}')
        acc = []
        for a in (x.strip() for x in accompany.split(',') if x.strip()):
            acc.append(a if a.startswith('E') else f'{epic}:{a}')
        tasks[key] = (description, dep_list, acc)
    return tasks, problems, whole, edges


def eligible_unjoined(tasks: dict, ancestors) -> list[str]:
    """Pairs in one epic that neither depends on the other and that do not name each other."""
    keys = sorted(tasks)
    lines = []
    for i, left in enumerate(keys):
        for right in keys[i + 1:]:
            if left.split(':')[0] != right.split(':')[0]:
                continue
            if right in ancestors(left) or left in ancestors(right):
                continue
            if right in tasks[left][2] and left in tasks[right][2]:
                continue
            lines.append(f'{left} and {right} can share a pull request and do not name each other')
    return lines


def whole_epic_lines(tasks: dict, edges: list[tuple[str, str]], level) -> list[str]:
    """Each whole-epic dependency, with the epic's row count, binding row and earliest row."""
    lines = []
    for dependent, epic in sorted(edges):
        own = sorted(k for k in tasks if k.startswith(epic + ':'))
        if not own:
            continue
        lo = min(level(k) for k in own)
        hi = max(level(k) for k in own)
        earliest = next(k for k in own if level(k) == lo)
        binding = next(k for k in own if level(k) == hi)
        lines.append(f'{dependent} depends on {epic} ({len(own)} rows), '
                     f'binding {binding} level {hi}, earliest {earliest} level {lo}')
    return lines


def epic_dependencies(tasks: dict) -> dict[str, set[str]]:
    """Whole-epic prerequisites shared by every consuming task and reciprocal joined unit."""
    own: dict[str, set[str]] = {}
    for task in tasks:
        own.setdefault(task.split(':')[0], set()).add(task)

    def prerequisites(task: str) -> set[str]:
        seen, pending = set(), [task]
        while pending:
            current = pending.pop()
            if current in seen or current not in tasks:
                continue
            seen.add(current)
            _, depends, joins = tasks[current]
            pending.extend(depends)
            pending.extend(other for other in joins if other in tasks and current in tasks[other][2])
        return seen - {task}

    reach = {task: prerequisites(task) for task in tasks}
    return {epic: {other for other, producers in own.items() if other != epic
                   and all(producers <= reach[task] for task in consumers)}
            for epic, consumers in own.items()}


def check_initiative(path: Path, tasks: dict) -> list[str]:
    """Compare initiative gates with prerequisites of whole epics."""
    needs = epic_dependencies(tasks)

    def reaches(epic: str, seen=None) -> set[str]:
        seen = set() if seen is None else seen
        for e in needs.get(epic, set()) - seen:
            seen.add(e)
            reaches(e, seen)
        return seen

    problems, header = [], []
    for line in path.read_text().splitlines():
        if not line.startswith('|'):
            continue
        parsed = cells(line)
        if not header and 'Epic' in parsed:
            header = parsed
            continue
        if not header or not parsed or parsed[0] == '---':
            continue
        r = dict(zip(header, parsed))
        epic = r.get('Epic', '')
        if not EPIC.fullmatch(epic):
            continue
        written = [x.strip() for x in r.get('Depends on', '').split(',') if x.strip()]
        other = [x for x in written if not (EPIC.fullmatch(x) or INITIATIVE_EPIC.fullmatch(x))]
        direct = needs.get(epic, set())
        needed = {d for d in direct if not any(d in reaches(o) for o in direct if o != d)}
        if other:
            problems.append(f'initiative {epic}: Depends on names more than epics ({", ".join(other)}); '
                            f'it should be {", ".join(sorted(needed)) or "empty"}')
        elif {x for x in written if EPIC.fullmatch(x)} != needed:
            overbroad = {x for x in written if EPIC.fullmatch(x)} - direct
            if overbroad:
                problems.append(f'initiative {epic}: overbroad whole-epic dependency '
                                f'{", ".join(sorted(overbroad))}; retain specific task dependencies')
            problems.append(f'initiative {epic}: Depends on should be {", ".join(sorted(needed)) or "empty"}, '
                            f'not {", ".join(written) or "empty"}')
    return problems


def main(argv: list[str]) -> int:
    epics, initiative = {}, None
    for arg in argv:
        name, _, path = arg.partition('=')
        if name == 'I':
            initiative = Path(path)
        else:
            epics[name] = Path(path)
    tasks, problems, whole, edges = parse(epics)
    advisory = []

    for key, (_, deps, acc) in tasks.items():
        epic, wid = key.split(':')
        for d in deps:
            if d not in tasks:
                problems.append(f'{key}: unknown dependency {d}')
                continue
            de, dw = d.split(':')
            if de == epic and dw >= wid:
                problems.append(f'{key}: depends on {d}, not an earlier task in its epic')
            if de > epic:
                problems.append(f'{key}: depends on later epic {d}')
        for a in acc:
            if a not in tasks:
                problems.append(f'{key}: Joins names unknown task {a}')

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
    if not cyclic:
        reach: dict[str, set[str]] = {}

        def ancestors(n: str) -> set[str]:
            if n not in reach:
                reach[n] = set()
                for m in graph[n]:
                    reach[n] |= {m} | ancestors(m)
            return reach[n]

        for key, (_, deps, _) in tasks.items():
            for d in sorted({d for d in deps if deps.count(d) > 1} - whole[key]):
                problems.append(f'{key}: {d} is listed twice')
            listed = [d for d in dict.fromkeys(deps) if d in tasks]
            for d in listed:
                by = next((o for o in listed if o != d and d in ancestors(o)), None)
                if by and d not in whole[key]:
                    problems.append(f'{key}: {d} is already implied by {by}')
        for key, (_, _, acc) in tasks.items():
            for a in acc:
                if a not in tasks:
                    continue
                if key not in tasks[a][2]:
                    problems.append(f'{key}: joins {a}, which does not join it back')
                if a in tasks[key][1]:
                    problems.append(f'{key}: joins {a} and depends on it; the shared pull request holds '
                                    'their order, so drop the dependency')
                via = next((x for x in ancestors(key) if x != a and a in ancestors(x)), None)
                if via:
                    problems.append(f'{key}: joins {a}, but needs {via}, which needs {a}')
        joins = eligible_unjoined(tasks, ancestors)
        if initiative:
            problems += check_initiative(initiative, tasks)
    print('--- problems')
    print('\n'.join(problems) if problems else 'none')
    if cyclic:
        return 1
    print('\n--- joins: eligible and not joined')
    print('\n'.join(joins) if joins else 'none')

    level: dict[str, int] = {}

    def lv(n: str) -> int:
        if n not in level:
            level[n] = 1 + max((lv(m) for m in graph[n]), default=-1)
        return level[n]

    for epic in epics:
        own = sorted(k for k in tasks if k.startswith(epic + ':'))
        for a, b in zip(own, own[1:]):
            if lv(b) < lv(a):
                advisory.append(f'{b} (level {lv(b)}) is numbered after {a} (level {lv(a)})')

    print('\n--- advisory: numbering against start order')
    print('\n'.join(advisory) if advisory else 'none')
    print('\n--- levels (0 = can start now)')
    for n in sorted(tasks, key=lambda k: (lv(k), k)):
        print(lv(n), n, '-', tasks[n][0][:70])
    print('\n--- whole epics')
    print('\n'.join(whole_epic_lines(tasks, edges, lv)) or 'none')

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
