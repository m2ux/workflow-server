"""Check the task dependency graph of an initiative's epics.

Usage:
  python3 deps.py [I=bodies/initiative.md] E00=bodies/epic-00.md E01=bodies/epic-01.md
                  [E00:W01=records/e00/w01.md ...] [R=records/joins.md ...]

An argument naming a row is that row's work item, a file whose declaration line names the one
component its implementation extends:
  **Component:** src/bundle/assembly.ts
A declared component is read without its link, a wrapping code span, a trailing full stop or a
leading ./, so two spellings of one path are one component. A value still carrying the template's
{{…}} placeholder declares none.

Each remaining file is an epic issue body holding the agent-engineering Work Breakdown table:
  | Task | Description | Coverage | Depends on | Joins | Done |
A task's id links each pull request associated with it, open or merged:
  | [W01](https://…/pull/950), [W01](https://…/pull/960) | … | AC1 | | | |
A row is the task its Task cell opens with, however many deliveries that id links.
A task id is a W and two digits, and the run names one in a Task cell that departs from it.
Cells are read by column name, so the column order does not matter.

A dependency is one of:
  W03             a task in the same epic
  W04–W09         a range of tasks in the same epic
  E01:W02         a task in another epic
  #750            an external issue, not checked
  I05:E00:W02     another initiative's epic or task, not checked
Markdown links are read by their text, so [E01:W02](https://…/issues/937) is E01:W02.

Problems (exit status 1): a Task cell naming a malformed or a second, different task id,
unknown references, a work item declaring no component or naming no row,
an unreadable work item, a task row naming an epic rather than the rows it consumes,
a task depending on itself or a later task in its epic,
an epic depending on a later epic, cycles, a dependency listed twice, and a dependency that another
in the same cell already implies. A named epic still reaches the rows it stands for, so one body
carrying the retired form is reported once rather than taking its initiative's gates down with it.
Joins problems: a task joining one that does not join it back, and
two joined tasks where one depends on the other, directly or through a task outside the pair.
Also printed: each pair of tasks in an epic where neither depends on the other, the two do not name
each other in Joins, and no R= record accounts for the pair. An empty Joins cell rests on such an
entry, so each line names both resolutions. A record accounts for a pair by naming both ids on one
of its lines; an R= file that cannot be read is a problem.
With I=, the initiative's Depends on cells are checked: each epic's cell names exactly the other
epics required in full by every task or joined unit, less transitive epic dependencies, and names no task.
Another initiative's epic (I05:E00) or an issue (#750) may also be named.
Advisory: task numbers that do not follow the order tasks can start.
Also printed: each pair of rows in different epics whose work items declare one component, every
row no component was read for, whether its work item was absent, unreadable or undeclared, so a
partial contention report names what it passed over, each
task's level (0 = can start now), the longest chains, and the proposed priority of each epic.
Epics sharing a priority number start together, so prerequisite depth sets the number and
contention separates it: an epic with no prerequisite epic carries the largest, and an epic
holding a row that contends with a row of an epic of the same depth takes the number below it,
its dependants following it down.
"""
import re
import sys
from pathlib import Path

LINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')
RANGE = re.compile(r'W(\d\d)[–-]W(\d\d)')
TASK = re.compile(r'E\d\d:W\d\d')
EPIC = re.compile(r'E\d\d')
WID = re.compile(r'W\d\d')
WID_SHAPED = re.compile(r'W\d+')
COMPONENT = re.compile(r'\*\*Component:\*\*\s*(.+?)\s*$')
PLACEHOLDER = re.compile(r'\{\{.*\}\}')
EXTERNAL = re.compile(r'#\d+|I\d\d:E\d\d(?::W\d\d)?')
INITIATIVE_EPIC = re.compile(r'#\d+|I\d\d:E\d\d')
MAX_CHAINS = 10


def cells(line: str) -> list[str]:
    return [c.strip() for c in LINK.sub(r'\1', line).strip().strip('|').split('|')]


def parse(epics: dict[str, Path]) -> tuple[dict, list[str], dict[str, set[str]]]:
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
            ids = WID_SHAPED.findall(cell)
            if not ids or not cell.startswith(ids[0]):
                continue
            wid = ids[0]
            malformed = sorted({i for i in ids if not WID.fullmatch(i)})
            if malformed:
                problems.append(f'{epic}: Task cell names malformed task id {", ".join(malformed)}')
            if wid in malformed:
                continue
            disagreeing = sorted({i for i in ids[1:] if i != wid and i not in malformed})
            if disagreeing:
                problems.append(f'{epic}:{wid}: Task cell also names {", ".join(disagreeing)}')
            rows[f'{epic}:{wid}'] = (row.get('Description', ''), row.get('Depends on', ''),
                                     row.get('Joins', ''))

    tasks = {}
    expanded: dict[str, set[str]] = {}
    for key, (description, deps, accompany) in rows.items():
        epic = key.split(':')[0]
        dep_list = []
        expanded[key] = set()
        for d in (x.strip() for x in deps.split(',') if x.strip()):
            rng = RANGE.fullmatch(d)
            if rng:
                dep_list += [f'{epic}:W{i:02d}' for i in range(int(rng[1]), int(rng[2]) + 1)]
            elif EXTERNAL.fullmatch(d):
                continue
            elif TASK.fullmatch(d):
                dep_list.append(d)
            elif EPIC.fullmatch(d):
                problems.append(f'{key}: names epic {d}; a task row names the rows it consumes')
                own = [k for k in rows if k.startswith(d + ':')]
                dep_list += own
                expanded[key] |= set(own)
            elif re.fullmatch(r'W\d\d', d):
                dep_list.append(f'{epic}:{d}')
            else:
                problems.append(f'{key}: cannot resolve {d}: it names no row and links no issue')
        acc = []
        for a in (x.strip() for x in accompany.split(',') if x.strip()):
            acc.append(a if a.startswith('E') else f'{epic}:{a}')
        tasks[key] = (description, dep_list, acc)
    return tasks, problems, expanded


def normalise(component: str) -> str:
    """One spelling of a declared component: the link text, without a wrapping code span, a
    trailing full stop or a leading `./`, so two spellings of one path are one component."""
    text = LINK.sub(r'\1', component).strip()
    if text.endswith('.'):
        text = text[:-1].strip()
    text = text.strip('`').strip()
    return text[2:] if text.startswith('./') else text


def read_components(items: dict[str, Path]) -> tuple[dict[str, str], list[str]]:
    """The component each work item declares, keyed by its row, and the items declaring none."""
    components, problems = {}, []
    for key, path in items.items():
        try:
            lines = path.read_text().splitlines()
        except OSError as error:
            problems.append(f'{key}: work item {path} is unreadable ({error.strerror})')
            continue
        declared = ''
        for line in lines:
            found = COMPONENT.match(line.strip())
            if found:
                declared = normalise(found[1])
                break
        if declared and not PLACEHOLDER.search(declared):
            components[key] = declared
        else:
            problems.append(f'{key}: work item declares no component')
    return components, problems


def contention(components: dict[str, str]) -> list[tuple[str, str]]:
    """Pairs of rows in different epics declaring one component."""
    keys = sorted(components)
    return [(left, right) for i, left in enumerate(keys) for right in keys[i + 1:]
            if left.split(':')[0] != right.split(':')[0] and components[left] == components[right]]


def recorded_pairs(paths: list[Path]) -> tuple[set[frozenset[str]], list[str]]:
    """The pairs a planning record accounts for. One line naming exactly two task ids accounts for
    that pair, which is the form a joins artifact takes. A line naming more is prose about several
    rows, not an account of any one pair, so it accounts for none."""
    found: set[frozenset[str]] = set()
    problems = []
    for path in paths:
        try:
            text = path.read_text(encoding='utf-8')
        except (OSError, UnicodeDecodeError) as error:
            problems.append(f'record {path} is unreadable ({error})')
            continue
        for line in text.splitlines():
            ids = set(TASK.findall(line))
            if len(ids) == 2:
                found.add(frozenset(ids))
    return found, problems


def eligible_unjoined(tasks: dict, ancestors, recorded: set[frozenset[str]] = frozenset()) -> list[str]:
    """Pairs in one epic that neither depends on the other, that do not name each other, and that
    no record given accounts for. Each line states both resolutions, so the Joins cell is read as
    the assertion it is rather than as the way to quiet the report."""
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
            if frozenset((left, right)) in recorded:
                continue
            lines.append(f'{left} and {right} can share a pull request: name each other in Joins, '
                         'or account for the pair in the planning record')
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


def epic_depth(needs: dict[str, set[str]], names: tuple[str, ...]) -> dict[str, int]:
    """Each epic's prerequisite depth, over the epics the needs place and the names given."""
    level: dict[str, int] = {}

    def lv(epic: str) -> int:
        if epic not in level:
            level[epic] = 1 + max((lv(other) for other in needs.get(epic, set())), default=-1)
        return level[epic]

    return {epic: lv(epic) for epic in {*needs, *names}}


def epic_priority(tasks: dict, names: tuple[str, ...] = (),
                  contending: set[tuple[str, str]] = frozenset()) -> dict[str, int]:
    """Each epic's proposed priority, over the epics the tasks place and the names given. Epics
    that can start together share a number, and a larger number is higher, so an epic with no
    prerequisite epic, one with no tasks among them, carries the largest. A contending pair does
    not share a number: the epic later in id order sequences after the other, and the epics
    depending on it follow it down."""
    needs = {epic: set(prerequisites) for epic, prerequisites in epic_dependencies(tasks).items()}
    pairs = {tuple(sorted(pair)) for pair in contending}
    sequenced: set[tuple[str, str]] = set()
    while True:
        depth = epic_depth(needs, names)
        clash = {(a, b) for a, b in pairs - sequenced
                 if a in depth and depth[a] == depth.get(b)}
        if not clash:
            break
        for a, b in clash:
            needs.setdefault(b, set()).add(a)
        sequenced |= clash
    return {epic: max(depth.values(), default=0) - found + 1 for epic, found in depth.items()}


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
    epics, items, records, initiative = {}, {}, [], None
    for arg in argv:
        name, _, path = arg.partition('=')
        if name == 'I':
            initiative = Path(path)
        elif name == 'R':
            records.append(Path(path))
        elif ':' in name:
            items[name] = Path(path)
        else:
            epics[name] = Path(path)
    tasks, problems, expanded = parse(epics)
    recorded, unreadable = recorded_pairs(records)
    problems += unreadable
    components, missing = read_components(items)
    problems += missing
    for key in sorted(components):
        if key not in tasks:
            problems.append(f'{key}: work item names no row in the epics given')
    components = {key: value for key, value in components.items() if key in tasks}
    advisory = []

    for key, (_, deps, acc) in tasks.items():
        epic, wid = key.split(':')
        for d in deps:
            if d not in tasks:
                problems.append(f'{key}: cannot resolve {d}: no epic given carries that row')
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
            for d in sorted({d for d in deps if deps.count(d) > 1} - expanded[key]):
                problems.append(f'{key}: {d} is listed twice')
            listed = [d for d in dict.fromkeys(deps) if d in tasks]
            for d in listed:
                by = next((o for o in listed if o != d and d in ancestors(o)), None)
                if by and d not in expanded[key]:
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
        joins = eligible_unjoined(tasks, ancestors, recorded)
        if initiative:
            problems += check_initiative(initiative, tasks)
    print('--- problems')
    print('\n'.join(problems) if problems else 'none')
    if cyclic:
        return 1
    print('\n--- joins: eligible pairs named in neither Joins nor a record')
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
    pairs = contention(components)
    unchecked = sorted(key for key in tasks if key not in components)
    print('\n--- component contention: rows of different epics extending one component')
    print('\n'.join(f'{left} and {right} both extend {components[left]}'
                    for left, right in pairs) or 'none')
    if unchecked:
        print('not checked, no component read:', ', '.join(unchecked))
    print('\n--- epic priority (epics sharing a number start together)')
    proposed = epic_priority(tasks, tuple(epics),
                             {(left.split(':')[0], right.split(':')[0]) for left, right in pairs})
    for epic in sorted(proposed, key=lambda e: (-proposed[e], e)):
        print(proposed[epic], epic)

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
