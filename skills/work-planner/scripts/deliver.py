"""Find the work available to dispatch on a theme board, set what a dispatch settles, and reserve
or release a task row.

Usage:
  python3 deliver.py --items items.json --prs prs.json --links links.json
      [--others issue-750.json ...]
      [--project . --revision origin/workspace] [--bases i07/e00/main,i07/e00/workflows]
      [--engineering .engineering] [--lane 2] [--date 2026-10-06]
      [--dispatch-plan available.json]
  python3 deliver.py --items items.json --board users/{owner}/projectsV2/9 --fields fields.json
      --out board/ --assignee m2ux [--progress 637,943] [--review 944]
  python3 deliver.py --epic issue-943.json --reserve W01 --items items.json [--records URL]
      [--date 2026-10-06] --fix fixed-943.md
  python3 deliver.py --epic issue-943.json --release W01 --engineering .engineering
      --fix fixed-943.md

items.json is the board's items with the Status field, as board.py reads them, and prs.json the pull
requests as sync.py reads them. links.json holds the closing issue references GitHub holds for those
pull requests, as Fetch Pull Request Issue Links writes them, and is where the task issues a pull
request links are read. An issue a row depends on that is not on the board is given with --others.

A task row's id says where its work stands: a link to a pull request or a commit is work in flight
or delivered, a link to a planning folder is work a session holds, and anything else is free. A row
is available when its epic admits units, as Work Units in artifacts/delivery-plan.md states, the
prerequisite epics its initiative row names are completed, its Done cell carries no tick, its id is
free, and every entry in its own Depends on cell is delivered. A row waits for what it names and for
nothing a sibling row names, so the rows of one epic start in the order that epic's own graph sets,
whatever its siblings wait on. An entry naming another epic's row is delivered when that row is and
each output it delivered is available at this epic's base in the repository --project locates, as
board.Outputs reads it; that epic's other rows and its closure gate nothing. Tasks that name each
other in Joins are one unit, and a unit is one session's work.

A unit's lane comes from the raw Lane cells of its epic task table, read by lane.read_lanes.
--lane names one opaque decimal index and admits that lane and unlaned units. Without --lane,
only unlaned units are offered. The filter preserves the admitted units' order. A hot-fix is
unlaned. Malformed cells and joined units with different lanes produce invalid lines and exit 1;
holds, blocked work and delivery evidence remain visible for every lane.

Printed: a unit line for each admitted available unit, naming its lane or unlaned, the record folder
its ids and Description give it, and a branch and worktree for each epic base it changes, suffixed with the base's long-lived name
when there are several; an unresolvable line for a row gated on a dependency entry nothing can
resolve, naming the entry; an undeclared line for a row of a unit in an epic of several bases whose
linked work item names no long-lived branch with an epic base, naming why; a hold line for each
reserved row; a blocked line for a free row whose dependencies are not delivered or whose joined
task is unavailable; an output line for each producer output a row naming another epic's row was
read for, naming the output, the consumer commit and whether it is available there; a merge line for
an open pull request, never a draft, that targets the epic base when its test plan has passed, or for an open
pull request titled with an open hot-fix's [F00], whose Development field links that hot-fix, that
targets the hot-fix's target when its test plan has passed and that target is one a unit line could
name; and an unresolved line for
an issue not given. A run that met an unresolvable entry, an undeclared row or hot-fix,
or an invalid lane unit exits 1.

The epic bases a unit changes are those whose long-lived branch its rows' work items name. A free
row links its work-item file, which --engineering, the checkout holding the planning records, gives
to read; the file's declaration line names the long-lived branch and the path of its component:
  **Component:** workspace:skills/work-planner/scripts/deliver.py
A unit of an epic with one base works on that base. A free row linking no work item is unplanned:
its session writes the work item after dispatch, so its unit works on every epic base.

Each open hot-fix, titled [F00], is printed as hotfix.unit_state reads its Delivery Unit in
artifacts/hotfix.md: a unit line, with every criterion it carries as coverage and the record folder
and branch its prefix and title name give it; a hold line; or an unrecorded line naming its merged
delivering pull requests. Its base is its target, the branch its Overview's Target: line names. A
hot-fix naming no target, or a hot-fix of --project's repository, as its origin remote names it,
whose target that repository's config/branches does not declare, is printed as an undeclared line
naming why, whatever its state, and is offered as no unit and no merge. A hot-fix of another repository has a target
--project cannot check: it is printed as an unresolved line, offered once a run whose --project
is a checkout of its repository finds its target declared, and does not fail the run.

--progress and --review name the issues a dispatch settles: the In Progress a held row and its epic
take, and the In Review a completed epic with current published agent review evidence takes. --prs
and --agent-reviews supply the current integration revisions and their review records. The calls are
rendered by statuses.py within the DISPATCH jurisdiction, which refuses any other Status and a
removal; every jurisdiction refuses a task set In Review.

--reserve and --release act on whole units: a call naming some rows of a unit and not the others is
refused. --reserve reads the epic's Status from --items and refuses a unit Work Units does not
admit. --reserve sets one record folder as the single link of every row in a unit, the folder the
unit's first task id and Description give it, which is the folder the unit line names. --release
frees each row by replacing that folder link with its work-item file link, the task id in lower case
inside the folder, and refuses a row whose folder in --engineering holds no such file or whose
README does not link it. Both write the body to --fix and refuse a row linking a pull request or
commit. The planning URL comes from --records or an existing planning link in the epic.
"""
from agent_review import epic_check, load_records

import argparse
import json
import re
import sys
from collections import Counter
from datetime import date as day
from pathlib import Path

from board import Board, Outputs, epic_state, in_flight, units
from deps import read_components
from lane import admits, check_unit, is_index, label as lane_label, read_lanes
from statuses import (DISPATCH, Key, STATUSES, Changes, StatusField, board_items,
                      key_of, label, pages, status_of)
from format import (AC, LINK, TICK, cell, done_mark, hrefs, id_cell, join_sections, reservation,
                    row, row_id, split_sections, title_name)
from hotfix import delivering_pulls, hotfix_tag, linking_pulls, target, unit_state
from sync import (Unreadable, attach_links, long_lived_names, origin_repository, plan_rows,
                  pull_requests, table)

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PR_TITLE = re.compile(r'^\[I(\d\d):E(\d\d)\]')
RECORD = re.compile(r'^(.*/artifacts/planning/)[^/]+/?$')
CRITERION = re.compile(r'AC\d+')
ISSUE_URL = re.compile(r'/issues/(\d+)$')
FOLDER = re.compile(r'/(?:tree|blob)/[^/]+/(.+?)/?$')
ON_BRANCH = re.compile(r'([^:/\s]+):\S')
STARTED = ('Ready', 'In Progress')
WORKTREES = '.worktrees'


def tags(title: str) -> tuple[str, str, str] | None:
    matched = PREFIX.match(title)
    return (matched[1], matched[2] or '', matched[3] or '') if matched else None


def is_epic(issue: dict) -> bool:
    parsed = tags(issue.get('title') or '')
    return bool(parsed) and bool(parsed[1]) and not parsed[2]


def slug(text: str, words: int = 4) -> str:
    """A short name of the work, from its Description: lowercase words separated by hyphens."""
    parts = re.sub(r'[^a-z0-9]+', ' ', text.lower()).split()
    return '-'.join(parts[:words])


def ident_tag(initiative: str, epic: str, task: str) -> str:
    return f'I{initiative}:E{epic}:{task}'


def epic_bases(refs: list[str], initiative: str, epic: str, names: tuple[str, ...]) -> list[str]:
    """The epic bases among refs whose long-lived segment is one of names, or any when names is empty."""
    found = []
    for ref in refs:
        matched = re.fullmatch(rf'i{initiative}/e{epic}/([^/]+)', ref)
        if matched and (not names or matched[1] in names):
            found.append(ref)
    return sorted(set(found))


def names(tag: str, text: str, ref: int, when: str) -> dict[str, str]:
    """The record folder and branch one unit's first task id and Description give it."""
    stem = tag.lower().replace(':', '-')
    short = slug(text)
    return {'folder': f'{when}-{ref}-{stem}' + (f'-{short}' if short else ''),
            'branch': tag.lower().replace(':', '/') + (f'-{short}' if short else '')}


def long_lived(base: str) -> str:
    """The long-lived branch an epic base is cut for, its last segment."""
    return base.rsplit('/', 1)[-1]


def changed_bases(unit: list[str], detail: dict, bases: list[str], checkout: str) -> tuple[list[str], list[str]]:
    """The epic bases a unit changes, as its rows' work items name their long-lived branches, and
    each row naming none of the bases with why. A unit of an epic with one base, or none, changes those.
    A row linking no work item is unplanned: its session writes the work item, so it changes every base."""
    if len(bases) <= 1:
        return bases, []
    items, missing = {}, []
    named = {long_lived(base) for base in bases}
    changed = set()
    for task in unit:
        path = detail[task]['item']
        if not path:
            changed |= named
        elif not checkout:
            missing.append(f'{task}: {path} needs --engineering to be read')
        else:
            items[task] = Path(checkout) / path
    components, problems = read_components(items)
    missing += problems
    for task, component in sorted(components.items()):
        branch = ON_BRANCH.match(component)
        if not branch:
            missing.append(f'{task}: component {component} names no long-lived branch')
        elif branch[1] not in named:
            missing.append(f'{task}: component {component} names {branch[1]}, which has no epic base')
        else:
            changed.add(branch[1])
    return ([] if missing else [base for base in bases if long_lived(base) in changed]), missing


def task_branches(branch: str, bases: list[str]) -> list[tuple[str, str, str]]:
    """The (branch, base, worktree) a unit works in for each epic base it changes: one base, or none,
    keeps the unit's branch; several give each base its own branch, suffixed with that base's long-lived name."""
    if len(bases) <= 1:
        return [(branch, bases[0] if bases else '', f'{WORKTREES}/{branch}')]
    found = []
    for base in bases:
        named = f'{branch}-{long_lived(base)}'
        found.append((named, base, f'{WORKTREES}/{named}'))
    return found


def branch_lines(branch: str, bases: list[str]) -> str:
    """The branch, base and worktree text of a unit line, one entry for each base."""
    return '; '.join(f'branch {name}' + (f', base {base}' if base else '') + f', worktree {worktree}'
                     for name, base, worktree in task_branches(branch, bases))


def target_fault(key: Key, issue: dict, lived: tuple[str, ...], repository: str) -> tuple[str, str]:
    """Why a hot-fix's target cannot be delivered to, as the line kind and its text, or ('', '') when
    it can: undeclared when it names no target, or when --project, a checkout of its repository,
    declares no such long-lived branch; unresolved when --project is a checkout of another
    repository. With no --project the target goes unchecked."""
    if not (base := target(issue)):
        return 'undeclared', 'its Overview names no target in one Target: line'
    if not lived:
        return '', ''
    if key[0].lower() != repository.lower():
        return 'unresolved', (f'its target {base} is unchecked: config/branches is read in '
                              f'{repository or "a checkout whose origin names no GitHub repository"}')
    if base not in lived:
        return 'undeclared', f'its target {base} is no long-lived branch config/branches declares'
    return '', ''


def hotfix_units(issues: dict, status: dict, prs: list[dict], home: str, when: str,
                 lived: tuple[str, ...], repository: str,
                 offers: list[dict] | None = None) -> tuple[list[str], int, int, int, int]:
    """The unit, hold and unrecorded line of each open hot-fix, by the state hotfix.unit_state
    reads, and the undeclared or unresolved line of each whose target target_fault refuses, whatever
    its state, with the count of each. A refused target offers no unit."""
    lines, available, undeclared, held, unrecorded = [], 0, 0, 0, 0
    for key in sorted(issues):
        issue = issues[key]
        tag = hotfix_tag(issue)
        if not tag or issue['state'] != 'open':
            continue
        where = f'{tag} {label(key, home)}'
        linking = linking_pulls(prs, key)
        delivering = delivering_pulls(linking, key, issue)
        state = unit_state(issue, status.get(key), linking, delivering)
        kind, why = target_fault(key, issue, lived, repository)
        if kind == 'undeclared':
            lines.append(f'  undeclared {where}: {why}')
            undeclared += 1
        elif kind == 'unresolved':
            lines.append(f'  unresolved: {where}: {why}')
        if state == 'unrecorded':
            numbers = ', '.join(f"#{p['number']}" for p in delivering if p.get('merged_at'))
            lines.append(f'  unrecorded {where}: {numbers} merged')
            unrecorded += 1
            continue
        if state == 'hold':
            lines.append(f'  hold {where}: In Progress')
            held += 1
            continue
        if state != 'unit' or kind:
            continue
        base = target(issue)
        name = names(tag, title_name(issue['title']), key[1], when)
        coverage = ', '.join(dict.fromkeys(f'AC{found[1]}' for line in (issue.get('body') or '').splitlines()
                                           if (found := AC.match(line))))
        lines.append(f'  unit {where}: unlaned, coverage {coverage or "none"}, record {name["folder"]}, '
                     f'{branch_lines(name["branch"], [base])}')
        if offers is not None:
            offers.append({'id': f'{key[0]}#{tag}', 'record': name['folder'],
                           'report': lines[-1].strip()})
        available += 1
    return lines, available, undeclared, held, unrecorded


def plan_passed(body: str) -> bool:
    """Whether every check's Pass result is a tick, plain or linked to its evidence."""
    rows = plan_rows(body)
    if not rows:
        return False
    checks = []
    for test, _coverage, mark in rows:
        if test.strip():
            link = LINK.fullmatch(mark)
            checks.append(link[1] if link else mark)
    return bool(checks) and all(done_mark(mark) == TICK for mark in checks)


def ready_merges(issues: dict, pulls: list[dict], names: tuple[str, ...], repository: str) -> list[str]:
    """Open pull requests, never a draft, whose test plan has passed: a task's into its epic base, and a hot-fix's
    into its target, when target_fault finds nothing against that target."""
    epics, hotfixes = {}, {}
    for key, issue in issues.items():
        parsed = tags(issue.get('title') or '')
        if parsed and parsed[1] and not parsed[2]:
            epics[(parsed[0], parsed[1])] = issue
        if (tag := hotfix_tag(issue)) and issue['state'] == 'open':
            hotfixes[key] = issue
    found = []
    for pull in pulls:
        if pull.get('draft') or pull.get('merged_at') or (pull.get('state') or 'open') != 'open':
            continue
        base = (pull.get('base') or {}).get('ref') or ''
        if tag := hotfix_tag(pull):
            if (any(delivering_pulls([pull], key, fixed) and not target_fault(key, fixed, names, repository)[0]
                    for key, fixed in hotfixes.items()) and plan_passed(pull.get('body') or '')):
                found.append((pull['number'], f"  merge #{pull['number']} {tag}: base {base}"))
            continue
        matched = PR_TITLE.match(pull.get('title') or '')
        if not matched:
            continue
        initiative, epic = matched[1], matched[2]
        if (initiative, epic) not in epics:
            continue
        segment = re.fullmatch(rf'i{initiative}/e{epic}/([^/]+)', base)
        if not segment or (names and segment[1] not in names):
            continue
        if not plan_passed(pull.get('body') or ''):
            continue
        found.append((pull['number'], f"  merge #{pull['number']} I{initiative}:E{epic}: base {base}"))
    return [line for _, line in sorted(found)]


def survey(args: argparse.Namespace) -> int:
    offers = []
    if args.dispatch_plan:
        Path(args.dispatch_plan).unlink(missing_ok=True)
    issues = {}
    for path in args.others:
        given = json.loads(Path(path).read_text())
        issues[key_of(given)] = given
    status = {}
    for item in pages(args.items):
        content = item.get('content') or {}
        if item.get('content_type') != 'Issue' or not content.get('repository_url'):
            continue
        key = key_of(content)
        issues[key] = content
        status[key] = status_of(item)
    home = Counter(key[0] for key in issues).most_common(1)[0][0] if issues else ''
    prs = pull_requests(args.prs) if args.prs else []
    if args.prs:
        attach_links(prs, args.links)
    if bool(args.project) != bool(args.revision):
        sys.exit('--project and --revision go together')
    declared = long_lived_names(args.project, args.revision) if args.project else None
    lived = declared.names if declared else ()
    repository = origin_repository(args.project) if declared else ''
    if declared:
        print(f'source: {declared.source}')
    given = [ref.strip() for ref in (args.bases or '').split(',') if ref.strip()]
    board = Board(issues, [], home, prs, Outputs(args.project))
    epics: dict[str, dict[str, tuple[str, int]]] = {}
    for key, issue in issues.items():
        parsed = tags(issue.get('title') or '')
        if parsed and parsed[1] and not parsed[2]:
            epics.setdefault(parsed[0], {})[f'E{parsed[1]}'] = key

    when = args.date or day.today().isoformat()
    available = held = waiting = unreadable = undeclared = invalid = 0
    for key in sorted(issues):
        issue = issues[key]
        if not is_epic(issue) or status.get(key) not in STARTED:
            continue
        initiative, epic, _ = tags(issue['title'])
        try:
            header, body, state, detail = epic_state(board, key, epics.get(initiative, {}))
        except Unreadable as exc:
            board.unresolved.append(str(exc))
            continue
        print(f'{label(key, home)} {status[key]}: [I{initiative}:E{epic}]')
        lanes, problems = read_lanes(issue.get('body') or '')
        malformed = {problem.partition(':')[0] for problem in problems}
        for problem in problems:
            print(f'  invalid I{initiative}:E{epic}:{problem}')
        for unit in units(header, body, state):
            states = {state[task] for task in unit}
            first = unit[0]
            tag = ident_tag(initiative, epic, first)
            ids = '+'.join(unit)
            lane, finding = check_unit(unit, lanes)
            invalid_lane = bool(malformed.intersection(unit))
            if not invalid_lane and finding:
                print(f'  invalid I{initiative}:E{epic}:{ids}: {finding}')
                invalid_lane = True
            invalid += invalid_lane
            if states <= {'done', 'running'}:
                continue
            if 'unresolvable' in states:
                for task in unit:
                    if state[task] == 'unresolvable':
                        print(f'  unresolvable I{initiative}:E{epic}:{task}: '
                              f'{detail[task]["cause"]} cannot resolve')
                        unreadable += 1
                continue
            if 'held' in states:
                for task in unit:
                    if state[task] == 'held':
                        print(f'  hold I{initiative}:E{epic}:{task}: {detail[task]["held"]}')
                        held += 1
                continue
            if states != {'free'}:
                reason = ('prerequisite epic not completed' if 'prerequisite' in states
                          else f'depends on {detail[first]["depends"]}' if state[first] == 'blocked'
                          else 'joined task ' + ', '.join(f'{t} {state[t]}' for t in unit if state[t] != 'free'))
                print(f'  blocked I{initiative}:E{epic}:{ids}: {reason}')
                waiting += 1
                continue
            if invalid_lane:
                continue
            if not admits(lane, args.lane):
                continue
            refs = [((p.get('base') or {}).get('ref') or '') for p in prs] + given
            bases, missing = changed_bases(unit, detail, epic_bases(refs, initiative, epic, lived),
                                           args.engineering)
            if missing:
                for why in missing:
                    print(f'  undeclared I{initiative}:E{epic}:{why}')
                undeclared += len(missing)
                continue
            name = names(tag, detail[first]['description'], detail[first]['issue'] or key[1], when)
            coverage = ', '.join(dict.fromkeys(c for task in unit
                                               for c in CRITERION.findall(detail[task]['coverage'])))
            where = branch_lines(name['branch'], bases)
            lane_name = lane_label(lane)
            report = (f'unit I{initiative}:E{epic}:{ids}: {lane_name}, coverage {coverage or "none"}, '
                      f'record {name["folder"]}, {where}')
            print(f'  {report}')
            offers.append({'id': f'{key[0]}#I{initiative}:E{epic}:{ids}',
                           'record': name['folder'], 'report': report})
            available += 1
    lines, found, unnamed, holding, unrecorded = hotfix_units(
        issues, status, prs, home, when, lived, repository, offers)
    for line in lines:
        print(line)
    available += found
    held += holding
    undeclared += unnamed
    for line in dict.fromkeys(board.outputs.lines):
        print(f'  output {line}')
    merging = ready_merges(issues, prs, lived, repository)
    for line in merging:
        print(line)
    for note in dict.fromkeys(board.unresolved):
        print(f'  unresolved: {note}')
    print(f'  available: {available}, held: {held}, blocked: {waiting}, '
          f'unresolvable: {unreadable}, undeclared: {undeclared}, merge: {len(merging)}, '
          f'unrecorded: {unrecorded}, invalid: {invalid}')
    if args.dispatch_plan:
        Path(args.dispatch_plan).write_text(json.dumps(offers, indent=2) + '\n')
    return 1 if unreadable or undeclared or invalid else 0


def place(args: argparse.Namespace) -> int:
    """Render the Status calls a dispatch settles, within the DISPATCH jurisdiction."""
    field = StatusField(args.fields, args.out, STATUSES)
    wanted: dict[int, str] = {}
    for given, status in ((args.progress, 'In Progress'), (args.review, 'In Review')):
        for number in (n.strip() for n in (given or '').split(',') if n.strip()):
            wanted[int(number)] = status
    on_board = {issue['number']: (key, item_id, held, issue)
                for key, item_id, held, issue in board_items(args.items)}
    absent = sorted(set(wanted) - set(on_board))
    if absent:
        sys.exit('not on the board: ' + ', '.join(f'#{n}' for n in absent))
    records = load_records(args.agent_reviews)
    prs = pull_requests(args.prs) if args.prs else []
    for number, status in wanted.items():
        if status == 'In Review':
            if problem := epic_check(on_board[number][3], prs, records):
                sys.exit(f'#{number}: {problem}; handoff blocked')
    home = Counter(key[0] for key, _, _, _ in on_board.values()).most_common(1)[0][0]
    changes = Changes(DISPATCH, args.board, field, args.assignee, ' (the board matches the dispatch)')
    for number in sorted(wanted):
        key, item_id, held, issue = on_board[number]
        changes.place(key, f"{label(key, home)} {issue['title']}", issue,
                      held, field.settle(wanted[number]), item_id, home)
    return changes.report()


def base_url(header: list[str], body: list[list[str]], given: str | None) -> str:
    """The planning records' URL: --records, or the record a row id already links."""
    for r in body:
        for href in hrefs(id_cell(header, r)):
            found = RECORD.match(href.rsplit('/', 1)[0] + '/') if href.endswith('.md') else RECORD.match(href)
            if found:
                return found[1].rstrip('/')
    if not given:
        sys.exit('--records is required: no row id links a planning record')
    return given.rstrip('/')


def whole_units(header: list[str], data: list[list[str]], wanted: list[str]) -> list[list[str]]:
    """The units the wanted tasks make, refusing a unit the call names only part of."""
    every = {row_id(id_cell(header, r)): '' for r in data if row_id(id_cell(header, r))}
    found = []
    for unit in units(header, data, every):
        named = [task for task in unit if task in wanted]
        if not named:
            continue
        if left := [task for task in unit if task not in wanted]:
            sys.exit(f"{', '.join(named)}: joined with {', '.join(left)}, which the call leaves out; "
                     'a unit is held and released whole')
        found.append(unit)
    return found


def record_file(checkout: str, folder: str, task: str) -> str:
    """Why the record the folder URL names, in the checkout, cannot be linked for the task, or ''."""
    found = FOLDER.search(folder)
    if not found:
        return f'{folder} names no path in the records checkout'
    record = Path(checkout) / found[1]
    name = f'{task.lower()}.md'
    if not (record / name).is_file():
        return f'the record {found[1]} holds no {name}'
    readme = record / 'README.md'
    if not readme.is_file() or not re.search(rf'\]\((?:\./)?{re.escape(name)}\)', readme.read_text()):
        return f'the README of {found[1]} does not link {name}'
    return ''


def edit(args: argparse.Namespace) -> int:
    issue = json.loads(Path(args.epic).read_text())
    parsed = tags(issue.get('title') or '')
    if not parsed or not parsed[1] or parsed[2]:
        sys.exit(f"title has no [Ixx:Eyy] prefix: {issue.get('title')}")
    initiative, epic, _ = parsed
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    lines, start, end, grid = table(sections)
    if grid is None:
        raise Unreadable('the body has no Work Breakdown section')
    header, data = grid[0], grid[2:]
    when = args.date or day.today().isoformat()
    at = header.index('Task') if 'Task' in header else 0
    wanted = [t.strip() for t in (args.reserve or args.release).split(',') if t.strip()]
    by_task = {row_id(id_cell(header, r)): r for r in data if row_id(id_cell(header, r))}
    for task in wanted:
        if task not in by_task:
            sys.exit(f'[I{initiative}:E{epic}] has no row {task}')
        if in_flight(id_cell(header, by_task[task])):
            sys.exit(f'{task}: its id links a pull request or a commit')
    if args.release and not args.engineering:
        sys.exit('--release needs --engineering, the checkout holding the planning records')
    if args.reserve:
        if not args.items:
            sys.exit('--reserve needs --items, the board items holding the epic Status')
        on_board = {key: status for key, _item, status, _content in board_items(args.items)}
        standing = on_board.get(key_of(issue), 'not on the board')
        if standing not in STARTED:
            sys.exit(f"#{issue['number']} [I{initiative}:E{epic}] is {standing or 'without a Status'}; "
                     'Work Units in artifacts/delivery-plan.md admits no unit of it')
    records = base_url(header, data, args.records) if args.reserve else ''
    changed = []
    for unit in whole_units(header, data, wanted):
        if args.reserve:
            for task in unit:
                if held := reservation(id_cell(header, by_task[task])):
                    sys.exit(f'{task}: already held by {held}')
            first = by_task[unit[0]]
            ident = id_cell(header, first)
            found = ISSUE_URL.search(next((href for href in hrefs(ident) if ISSUE_URL.search(href)), ''))
            ref = int(found[1]) if found else issue['number']
            name = names(ident_tag(initiative, epic, unit[0]),
                         cell(header, first, 'Description').split(' →', 1)[0].strip(), ref, when)
            url = f'{records}/{name["folder"]}/'
            for task in unit:
                by_task[task][at] = f'[{task}]({url})'
                changed.append(f'{task} → {url}')
        else:
            for task in unit:
                held = reservation(id_cell(header, by_task[task]))
                if not held:
                    sys.exit(f'{task}: its id links no planning folder')
                if problem := record_file(args.engineering, held, task):
                    sys.exit(f'{task}: {problem}')
                by_task[task][at] = f'[{task}]({held.rstrip("/")}/{task.lower()}.md)'
                changed.append(f'{task} released from {held}')
    lines[start + 2:end] = [row(r) for r in data]
    Path(args.fix).write_text(join_sections(preamble, sections))
    action = 'reserved' if args.reserve else 'released'
    print(f"#{issue['number']} [I{initiative}:E{epic}]")
    for note in changed:
        print(f'  {action}: {note}')
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', help='the board items with their Status, which a reservation also reads')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--links', help='the closing issue references those pull requests hold')
    parser.add_argument('--others', nargs='*', default=[], help='issues the rows depend on that are off the board')
    parser.add_argument('--epic', help='the epic whose row is reserved or released')
    parser.add_argument('--reserve', help='task ids to hold, e.g. W01,W02')
    parser.add_argument('--release', help='task ids to free, e.g. W01')
    parser.add_argument('--records', help='the URL of the planning records folder')
    parser.add_argument('--lane', help='the requested bare decimal lane index; omission admits only unlaned units')
    parser.add_argument('--date', help='the day the record is opened, today by default')
    parser.add_argument('--project', default='', help='any checkout of the repository whose config/branches states the long-lived branches')
    parser.add_argument('--revision', default='', help='the commit config/branches is read at, e.g. origin/workspace')
    parser.add_argument('--engineering', default='', help='the checkout holding the planning records each free row or released row links')
    parser.add_argument('--bases', default='', help='epic bases, comma-separated, e.g. i07/e00/main,i07/e00/workflows')
    parser.add_argument('--progress', help='issues to set In Progress, e.g. 637,943')
    parser.add_argument('--review', help='epics to set In Review, e.g. 943')
    parser.add_argument('--agent-reviews', help='published agent review records as a JSON list')
    parser.add_argument('--board', help='the board, e.g. users/{owner}/projectsV2/9')
    parser.add_argument('--fields', help="the board's fields")
    parser.add_argument('--out', help='directory for the Status body files')
    parser.add_argument('--assignee', help='the user assigned to every issue from Ready on')
    parser.add_argument('--fix', help='write the body here')
    parser.add_argument('--dispatch-plan', help='write the admitted units as JSON for dispatch batching')
    args = parser.parse_args()
    if args.lane is not None and not is_index(args.lane):
        parser.error('--lane must be a bare decimal index')
    actions = [name for name in ('reserve', 'release') if getattr(args, name)]
    if len(actions) > 1:
        sys.exit('--reserve and --release are one at a time')
    if args.epic or actions:
        if not (args.epic and actions and args.fix):
            sys.exit('--epic, one of --reserve or --release, and --fix go together')
        return edit(args)
    if not args.items:
        sys.exit('--items is required')
    if args.progress or args.review:
        for name in ('board', 'fields', 'out', 'assignee'):
            if not getattr(args, name):
                sys.exit(f'--{name} is required with --progress or --review')
        return place(args)
    if args.prs and not args.links:
        sys.exit('--prs needs --links, which holds the issue each pull request links')
    return survey(args)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
