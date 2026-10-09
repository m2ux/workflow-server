"""Find the work available to dispatch on a theme board, and reserve or release a task row.

Usage:
  python3 deliver.py --items items.json --prs prs.json [--others issue-750.json ...] [--date 2026-10-06]
  python3 deliver.py --epic issue-943.json --reserve W01 [--records URL] [--date 2026-10-06] --fix fixed-943.md
  python3 deliver.py --epic issue-943.json --item W01 --fix fixed-943.md
  python3 deliver.py --epic issue-943.json --release W01 --fix fixed-943.md

items.json is the board's items with the Status field, as board.py reads them, and prs.json the pull
requests as sync.py reads them. An issue a row depends on that is not on the board is given with
--others.

A task row's id says where its work stands: a link to a pull request or a commit is work in flight or
delivered, a link to a planning folder is work a session holds, and anything else is free. A row is
available when its epic is Ready or In Progress, its Done cell carries no tick, its id is free, and
every entry in its Depends on cell is delivered. Tasks that name each other in Joins are one unit, and
a unit is one session's work.

Printed: a unit line for each available unit, with the record folder, branch and worktree its ids and
Description give it; a hold line for each reserved row; a blocked line for a free row whose
dependencies are not delivered or whose joined task is unavailable; a merge line for an open pull
request that targets the epic base when its test plan has passed; and an unresolved line for an
issue not given.

--reserve appends the record folder's link to each named row's id, which holds the work. --item adds
the work item the session wrote in that record, ahead of the folder's link, so the hold stands until
the row links its pull request. --release drops the folder's link. Each writes the body to --fix, and
refuses a row whose id links a pull request or a commit. The folder's URL is --records, or the
planning record an id in the epic already links.
"""
import argparse
import json
import re
import sys
from collections import Counter
from datetime import date as day
from pathlib import Path

from board import Board, key_of, label, pages, rows, status_of
from format import LINK, TICK, cell, done_mark, id_cell, join_sections, row, row_id, split_sections
from sync import Unreadable, long_lived_names, plan_rows, pull_requests, table

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PR_TITLE = re.compile(r'^\[I(\d\d):E(\d\d)\]')
RECORD = re.compile(r'^(.*/artifacts/planning/)[^/]+/?$')
TASK = re.compile(r'W\d\d')
CRITERION = re.compile(r'AC\d+')
ISSUE_URL = re.compile(r'/issues/(\d+)$')
STARTED = ('Ready', 'In Progress')
WORKTREES = '.worktrees'


def tags(title: str) -> tuple[str, str, str] | None:
    matched = PREFIX.match(title)
    return (matched[1], matched[2] or '', matched[3] or '') if matched else None


def is_epic(issue: dict) -> bool:
    parsed = tags(issue.get('title') or '')
    return bool(parsed) and bool(parsed[1]) and not parsed[2]


def hrefs(ident: str) -> list[str]:
    return [found[2] for found in LINK.finditer(ident)]


def in_flight(ident: str) -> bool:
    """Whether the id links a pull request or a commit, which is work already under way."""
    return any('/pull/' in href or '/commit/' in href for href in hrefs(ident))


def reservation(ident: str) -> str | None:
    """The planning folder the id links, which holds the work. A file in a record is not one."""
    return next((href for href in hrefs(ident)
                 if '/artifacts/planning/' in href and not href.endswith('.md')), None)


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
    """The record folder, branch and worktree one unit's first task id and Description give it."""
    stem = tag.lower().replace(':', '-')
    short = slug(text)
    return {'folder': f'{when}-{ref}-{stem}' + (f'-{short}' if short else ''),
            'branch': tag.lower().replace(':', '/') + (f'-{short}' if short else ''),
            'worktree': f'{WORKTREES}/{stem}'}


def joined(header: list[str], body: list[list[str]]) -> dict[str, set[str]]:
    """The tasks each row names in Joins, by task id."""
    found = {}
    for r in body:
        ident = id_cell(header, r)
        task = row_id(ident)
        if task:
            found[task] = set(TASK.findall(cell(header, r, 'Joins')))
    return found


def units(header: list[str], body: list[list[str]], state: dict[str, str]) -> list[list[str]]:
    """The rows grouped into units: tasks that name each other in Joins are one unit."""
    links = joined(header, body)
    seen, found = set(), []
    for task in links:
        if task in seen:
            continue
        unit, queue = [], [task]
        while queue:
            current = queue.pop(0)
            if current in seen or current not in state:
                continue
            seen.add(current)
            unit.append(current)
            queue += sorted(other for other in links.get(current, ())
                            if current in links.get(other, set()))
        found.append(sorted(unit))
    return found


def epic_state(board: Board, key: tuple[str, int], epics: dict[str, tuple[str, int]]) -> tuple:
    """Each row's state, its Description, its Coverage, and the issue its id links."""
    header, body = rows(board.issues[key])
    if not header:
        raise Unreadable(f'{label(key, board.home)} has no Work Breakdown table')
    state, detail = {}, {}
    for r in body:
        ident = id_cell(header, r)
        task = row_id(ident)
        if not task:
            continue
        held = reservation(ident)
        if done_mark(cell(header, r, 'Done')) == TICK:
            state[task] = 'done'
        elif in_flight(ident):
            state[task] = 'running'
        elif held:
            state[task] = 'held'
        elif not board.met(cell(header, r, 'Depends on'), key, epics, f'{label(key, board.home)} {task}'):
            state[task] = 'blocked'
        else:
            state[task] = 'free'
        found = ISSUE_URL.search(next((href for href in hrefs(ident) if ISSUE_URL.search(href)), ''))
        detail[task] = {'description': cell(header, r, 'Description').split(' →', 1)[0].strip(),
                        'coverage': cell(header, r, 'Coverage'), 'held': held,
                        'issue': int(found[1]) if found else None,
                        'depends': cell(header, r, 'Depends on')}
    return header, body, state, detail


def plan_passed(body: str) -> bool:
    """Whether the body has a Test Plan table and every check's Pass cell carries a tick."""
    rows = plan_rows(body)
    if not rows:
        return False
    checks = [mark for test, _coverage, mark in rows if test.strip()]
    return bool(checks) and all(done_mark(mark) == TICK for mark in checks)


def ready_merges(issues: dict, pulls: list[dict], names: tuple[str, ...]) -> list[str]:
    """Open pull requests that target the epic base and whose test plan has passed."""
    epics = {}
    for issue in issues.values():
        parsed = tags(issue.get('title') or '')
        if parsed and parsed[1] and not parsed[2]:
            epics[(parsed[0], parsed[1])] = issue
    found = []
    for pull in pulls:
        if pull.get('draft') or pull.get('merged_at') or (pull.get('state') or 'open') != 'open':
            continue
        matched = PR_TITLE.match(pull.get('title') or '')
        if not matched:
            continue
        initiative, epic = matched[1], matched[2]
        if (initiative, epic) not in epics:
            continue
        base = (pull.get('base') or {}).get('ref') or ''
        segment = re.fullmatch(rf'i{initiative}/e{epic}/([^/]+)', base)
        if not segment or (names and segment[1] not in names):
            continue
        if not plan_passed(pull.get('body') or ''):
            continue
        found.append((pull['number'], f"  merge #{pull['number']} I{initiative}:E{epic}: base {base}"))
    return [line for _, line in sorted(found)]


def survey(args: argparse.Namespace) -> int:
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
    lived = long_lived_names(args.project) if args.project else ()
    given = [ref.strip() for ref in (args.bases or '').split(',') if ref.strip()]
    board = Board(issues, [], home, prs)
    epics: dict[str, dict[str, tuple[str, int]]] = {}
    for key, issue in issues.items():
        parsed = tags(issue.get('title') or '')
        if parsed and parsed[1] and not parsed[2]:
            epics.setdefault(parsed[0], {})[f'E{parsed[1]}'] = key

    when = args.date or day.today().isoformat()
    available = held = waiting = 0
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
        for unit in units(header, body, state):
            states = {state[task] for task in unit}
            first = unit[0]
            tag = ident_tag(initiative, epic, first)
            ids = '+'.join(unit)
            if states <= {'done', 'running'}:
                continue
            if 'held' in states:
                for task in unit:
                    if state[task] == 'held':
                        print(f'  hold I{initiative}:E{epic}:{task}: {detail[task]["held"]}')
                        held += 1
                continue
            if states != {'free'}:
                reason = (f'depends on {detail[first]["depends"]}' if state[first] == 'blocked'
                          else 'joined task ' + ', '.join(f'{t} {state[t]}' for t in unit if state[t] != 'free'))
                print(f'  blocked I{initiative}:E{epic}:{ids}: {reason}')
                waiting += 1
                continue
            name = names(tag, detail[first]['description'], detail[first]['issue'] or key[1], when)
            coverage = ', '.join(dict.fromkeys(c for task in unit
                                               for c in CRITERION.findall(detail[task]['coverage'])))
            refs = [((p.get('base') or {}).get('ref') or '') for p in prs] + given
            bases = epic_bases(refs, initiative, epic, lived)
            base = (f', base {bases[0]}' if len(bases) == 1
                    else ', bases ' + ' '.join(bases) if bases else '')
            print(f'  unit I{initiative}:E{epic}:{ids}: coverage {coverage or "none"}, '
                  f'record {name["folder"]}, branch {name["branch"]}{base}, worktree {name["worktree"]}')
            available += 1
    merging = ready_merges(issues, prs, lived)
    for line in merging:
        print(line)
    for note in dict.fromkeys(board.unresolved):
        print(f'  unresolved: {note}')
    print(f'  available: {available}, held: {held}, blocked: {waiting}, merge: {len(merging)}')
    return 0


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
    wanted = [t.strip() for t in (args.reserve or args.item or args.release).split(',') if t.strip()]
    records = base_url(header, data, args.records) if args.reserve else ''
    changed = []
    for task in wanted:
        r = next((r for r in data if row_id(id_cell(header, r)) == task), None)
        if r is None:
            sys.exit(f'[I{initiative}:E{epic}] has no row {task}')
        ident = id_cell(header, r)
        if in_flight(ident):
            sys.exit(f'{task}: its id links a pull request or a commit')
        held = reservation(ident)
        if args.reserve:
            if held:
                sys.exit(f'{task}: already held by {held}')
            found = ISSUE_URL.search(next((href for href in hrefs(ident) if ISSUE_URL.search(href)), ''))
            ref = int(found[1]) if found else issue['number']
            name = names(ident_tag(initiative, epic, task),
                         cell(header, r, 'Description').split(' →', 1)[0].strip(), ref, when)
            url = f'{records}/{name["folder"]}/'
            r[at] = (f'{ident}, ' if ident.strip() and LINK.search(ident) else '') + f'[{task}]({url})'
            changed.append(f'{task} → {url}')
        elif args.item:
            if not held:
                sys.exit(f'{task}: its id links no planning folder')
            url = f'{held.rstrip("/")}/{task.lower()}.md'
            if url in hrefs(ident):
                sys.exit(f'{task}: its id already links {url}')
            r[at] = f'[{task}]({url}), ' + ident.strip()
            changed.append(f'{task} → {url}')
        else:
            if not held:
                sys.exit(f'{task}: its id links no planning folder')
            kept = [f'[{text}]({href})' for text, href in LINK.findall(ident) if href != held]
            r[at] = ', '.join(kept) if kept else task
            changed.append(f'{task} released from {held}')
    lines[start + 2:end] = [row(r) for r in data]
    Path(args.fix).write_text(join_sections(preamble, sections))
    action = 'reserved' if args.reserve else 'planned' if args.item else 'released'
    print(f"#{issue['number']} [I{initiative}:E{epic}]")
    for note in changed:
        print(f'  {action}: {note}')
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', help='the board items with their Status')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--others', nargs='*', default=[], help='issues the rows depend on that are off the board')
    parser.add_argument('--epic', help='the epic whose row is reserved or released')
    parser.add_argument('--reserve', help='task ids to hold, e.g. W01,W02')
    parser.add_argument('--item', help='task ids whose work item the record now holds, e.g. W01')
    parser.add_argument('--release', help='task ids to free, e.g. W01')
    parser.add_argument('--records', help='the URL of the planning records folder')
    parser.add_argument('--date', help='the day the record is opened, today by default')
    parser.add_argument('--project', default='', help='checkout whose main working tree states the long-lived branches in config/branches')
    parser.add_argument('--bases', default='', help='epic bases, comma-separated, e.g. i07/e00/main,i07/e00/workflows')
    parser.add_argument('--fix', help='write the body here')
    args = parser.parse_args()
    actions = [name for name in ('reserve', 'item', 'release') if getattr(args, name)]
    if len(actions) > 1:
        sys.exit('--reserve, --item and --release are one at a time')
    if args.epic or actions:
        if not (args.epic and actions and args.fix):
            sys.exit('--epic, one of --reserve, --item or --release, and --fix go together')
        return edit(args)
    if not args.items:
        sys.exit('--items is required')
    return survey(args)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
