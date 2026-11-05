"""Check the task dependency graph of an initiative's epics.

Usage:
  python3 deps.py [I=bodies/initiative.md] E00=bodies/epic-00.md E01=bodies/epic-01.md
                  [E00:W01=records/e00/w01.md ...] [R=records/joins.md ...]

An argument naming a row is that row's work item, a file whose declaration line names the one
component its implementation extends:
  **Component:** main:src/bundle/assembly.ts
A declared component is read without its link, a wrapping code span, a trailing full stop or a
leading ./, so two spellings of one path are one component. A value still carrying the template's
{{…}} placeholder declares none. A component is one file: a value ending in /, carrying a glob, or
naming a directory under the working directory declares a directory, which is a problem.

Each remaining file is an epic issue body holding the agent-engineering Work Breakdown table:
  | Task | Description | Coverage | Depends on | Joins | Lane | Done |
A task's id links each pull request associated with it, open or merged:
  | [W01](https://…/pull/950), [W01](https://…/pull/960) | … | AC1 | | | | |
A row is the task its Task cell opens with, however many deliveries that id links.
A task id is a W and two digits, and the run names one in a Task cell that departs from it.
Cells are read by column name, so the column order does not matter.
A Lane cell holds a bare decimal index or is empty. Each joined unit carries one index
across all its rows or has every Lane cell empty; each malformed or differing cell is a problem.

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
Joins problems: a task joining a row outside its epic, one that does not join it back, two joined tasks where one depends
on the other, a joined task needing another through a task outside their unit, and a joined unit
whose rows cover more than six criteria.
Also printed: each candidate unit, the undelivered rows of one epic whose work items declare one
component, that its rows do not join and no R= record line names exactly. An open candidate names
both resolutions and each direct edge a join drops. A candidate is split by rule, and printed with
its reason, where its rows cover more than six criteria or a path between two of them runs through
a row outside it. An R= file that cannot be read is a problem.
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

from lane import check_unit, read_lanes

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
CRITERION = re.compile(r'AC\d+')
BRANCH = re.compile(r'^[^:/]+:')
MAX_CHAINS = 10
UNIT_BOUND = 6


def cells(line: str) -> list[str]:
    return [c.strip() for c in LINK.sub(r'\1', line).strip().strip('|').split('|')]


def parse(epics: dict[str, Path]) -> tuple[dict, list[str], dict[str, set[str]], dict[str, set[str]],
                                           set[str]]:
    """The tasks, the problems their cells carry, the rows each named epic stood for, the criteria
    each row's Coverage names, and the rows whose Done cell is filled."""
    rows = {}
    problems = []
    criteria: dict[str, set[str]] = {}
    delivered: set[str] = set()
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
            criteria[f'{epic}:{wid}'] = set(CRITERION.findall(row.get('Coverage', '')))
            if row.get('Done', ''):
                delivered.add(f'{epic}:{wid}')

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
    return tasks, problems, expanded, criteria, delivered


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
        if not declared or PLACEHOLDER.search(declared):
            problems.append(f'{key}: work item declares no component')
        elif is_directory(declared):
            problems.append(f'{key}: work item declares directory {declared}; a component is one file')
        else:
            components[key] = declared
    return components, problems


def is_directory(component: str) -> bool:
    """Whether a declared component names a directory: its path ends in `/`, carries a glob, or is
    a directory under the working directory, where the command runs."""
    path = BRANCH.sub('', component, count=1)
    return path.endswith('/') or '*' in path or Path(path or '.').is_dir()


def contention(components: dict[str, str]) -> list[tuple[str, str]]:
    """Pairs of rows in different epics declaring one component."""
    keys = sorted(components)
    return [(left, right) for i, left in enumerate(keys) for right in keys[i + 1:]
            if left.split(':')[0] != right.split(':')[0] and components[left] == components[right]]


def recorded_units(paths: list[Path]) -> tuple[set[frozenset[str]], list[str]]:
    """The row sets a planning record accounts for: each line naming two or more task ids accounts
    for the candidate unit holding exactly those rows."""
    found: set[frozenset[str]] = set()
    problems = []
    for path in paths:
        try:
            text = path.read_text(encoding='utf-8')
        except (OSError, UnicodeDecodeError) as error:
            problems.append(f'record {path} is unreadable ({error})')
            continue
        for line in text.splitlines():
            ids = frozenset(TASK.findall(line))
            if len(ids) > 1:
                found.add(ids)
    return found, problems


def joined_units(tasks: dict) -> dict[str, frozenset[str]]:
    """Each task's joined unit: the tasks reached through pairs that name each other in Joins."""
    units: dict[str, frozenset[str]] = {}
    for task in sorted(tasks):
        if task in units:
            continue
        unit, pending = set(), [task]
        while pending:
            current = pending.pop()
            if current in unit or current not in tasks:
                continue
            unit.add(current)
            pending.extend(other for other in tasks[current][2]
                           if other in tasks and current in tasks[other][2])
        for member in unit:
            units[member] = frozenset(unit)
    return units


def covered(rows, criteria: dict[str, set[str]]) -> set[str]:
    """The criteria a set of rows covers together."""
    return set().union(*(criteria.get(row, set()) for row in rows))


def outside_path(rows: frozenset[str], ancestors) -> tuple[str, str, str] | None:
    """A path between two of the rows through a task outside them, as (needer, via, needed)."""
    for needer in sorted(rows):
        for via in sorted(ancestors(needer) - rows):
            needed = next((row for row in sorted(rows) if row in ancestors(via)), None)
            if needed:
                return needer, via, needed
    return None


def candidate_units(tasks: dict, components: dict[str, str], criteria: dict[str, set[str]],
                    delivered: set[str], ancestors,
                    recorded: set[frozenset[str]] = frozenset()) -> list[str]:
    """Each candidate unit, the undelivered rows of one epic declaring one component, that its rows
    do not join and no record line names exactly. An open candidate names both resolutions and
    each direct edge a join drops; one the criterion bound or an outside path splits is split by
    rule and says why."""
    groups: dict[tuple[str, str], set[str]] = {}
    for row, component in components.items():
        if row in tasks and row not in delivered:
            groups.setdefault((row.split(':')[0], component), set()).add(row)
    units = joined_units(tasks)
    lines = []
    for (_, component), members in sorted(groups.items()):
        rows = frozenset(members)
        if len(rows) < 2 or rows in recorded or all(rows <= units[row] for row in rows):
            continue
        head = f'{", ".join(sorted(rows))} extend {component}'
        count = len(covered(rows, criteria))
        barred = outside_path(rows, ancestors)
        if count > UNIT_BOUND:
            lines.append(f'{head}: split by rule, {count} criteria exceed the bound of {UNIT_BOUND}')
        elif barred:
            lines.append(f'{head}: split by rule, {barred[0]} needs {barred[1]}, which needs {barred[2]}')
        else:
            edges = [f'{row} on {other}' for row in sorted(rows) for other in tasks[row][1] if other in rows]
            drop = f', dropping the dependency of {"; ".join(edges)},' if edges else ''
            lines.append(f'{head}: name each other in Joins{drop} or name exactly these rows on one '
                         'record line with why they stay split')
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
    tasks, problems, expanded, criteria, delivered = parse(epics)
    lanes: dict[str, str | None] = {}
    malformed_rows = set()
    for epic, path in epics.items():
        values, malformed = read_lanes(path.read_text())
        lanes.update({f'{epic}:{wid}': value for wid, value in values.items()})
        problems += [f'{epic}:{problem}' for problem in malformed]
        malformed_rows.update(f'{epic}:{problem.partition(":")[0]}' for problem in malformed)
    units = joined_units(tasks)
    for unit in sorted({u for u in units.values() if len(u) > 1}, key=sorted):
        if not unit.intersection(malformed_rows):
            _, finding = check_unit(unit, lanes)
            if finding:
                problems.append(finding)
    recorded, unreadable = recorded_units(records)
    problems += unreadable
    components, missing = read_components(items)
    problems += missing
    for key in sorted(components):
        if key not in tasks:
            problems.append(f'{key}: work item names no row in the epics given')
    components = {key: value for key, value in components.items() if key in tasks}
    advisory = []
    unsupported_joins = False

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
            if a.split(':')[0] != epic:
                problems.append(f'{key}: Joins names {a} outside its epic; a joined unit belongs to one epic')
                unsupported_joins = True
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
                via = next((x for x in sorted(ancestors(key) - units[key]) if a in ancestors(x)), None)
                if via:
                    problems.append(f'{key}: joins {a}, but needs {via}, which needs {a}')
        for unit in sorted({u for u in units.values() if len(u) > 1}, key=sorted):
            count = len(covered(unit, criteria))
            if count > UNIT_BOUND:
                problems.append(f'{", ".join(sorted(unit))}: joined unit covers {count} criteria, '
                                f'more than the bound of {UNIT_BOUND}')
        joins = candidate_units(tasks, components, criteria, delivered, ancestors, recorded)
        if initiative and not unsupported_joins:
            problems += check_initiative(initiative, tasks)
    print('--- problems')
    print('\n'.join(problems) if problems else 'none')
    if cyclic or unsupported_joins:
        return 1
    print('\n--- joins: candidate units, rows of one epic extending one component')
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
