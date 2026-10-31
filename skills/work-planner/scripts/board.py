"""Bring an initiative's theme board up to date with its issues.

Usage:
  python3 board.py issue-936.json --epics issue-943.json ... --tasks issue-637.json ... --prs prs.json
      --links links.json --board users/{owner}/projectsV2/9 --fields fields.json --items items.json
      --out board/ --assignee m2ux
      [--others issue-750.json ...]

Issue files are as `gh api repos/{owner}/{repo}/issues/943` returns them, and prs.json as sync.py
reads it. links.json holds the closing issue references GitHub holds for those pull requests, as
Fetch Pull Request Issue Links writes them, and is where the issue a pull request links is read.
A board's fields and items are as the REST API returns them, pages concatenated:
  gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
  gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=<Status field id>" > items.json
An organization's board is under orgs/{owner} in place of users/{owner}.

The board covers the initiative, every epic its Work Breakdown links, and each task issue whose
title names a task of those epics or whose issue an epic row links, in whichever repository each
lives. An issue is known by its repository and number, so an epic another repository holds is tracked like one of the initiative's own, and two
repositories' issues of one number stay apart. An item already on the board for an issue those
bodies cite, closed other than as completed (an issue a task subsumed), is removed. Each issue's
Status, first match wins:
  Done         closed as completed
  (removed)    closed any other way
  In Review    a task issue an open pull request ready for review delivers: its title names the
               epic by the initiative's row id, and its Development field links the issue; an open
               epic or initiative whose criteria are all ticked
  In Progress  an open draft pull request links a task issue; a task whose row links the planning
               record a session holds it with; an epic with an open pull request and a criterion
               unticked
  Ready        a task whose epic is Ready or In Progress, whose every dependency is delivered,
               and that has no Open Questions
  (unchanged)  a task gated on a dependency entry that cannot resolve
  Backlog      a task otherwise
An epic with an open pull request and a criterion unticked is In Progress. With no open pull
request, Ready or Backlog already on the board is left as it stands. In Progress is left when a
row has been delivered or an epic is Done, and In Review then becomes In Progress. When work
has not started, an In Progress or In Review entry becomes Backlog. One not yet on the board is
In Progress when a row has been delivered or an epic is Done, and Backlog when work has not
started. Advance mode moves Ready, Backlog and, when no pull request is open, In Progress.

An open task issue is In Review when an open pull request ready for review links it. An open
epic or initiative is In Review when every acceptance criterion is ticked. An initiative is In
Progress when any epic is In Review or In Progress.

The board's Status field offers Backlog, Ready, In Progress and Done, and In Review optionally;
statuses.py holds the field, the option body files and the fallback for an option the board lacks.

A dependency within an epic is delivered when its task row is, or its issue is closed as completed. A dependency on another epic's task also requires that epic closed as completed, which gates the row naming it and leaves its siblings free. An epic starts only after every prerequisite epic its initiative row names is completed. A task row is
delivered when a linked pull request has merged, or its id links a commit. A row that links a task
issue and no pull request is delivered when that issue is closed as completed. An open pull request
does not deliver the task. A bare #750 names an issue in the repository of the issue whose row cites it. An entry naming no row and
linking no issue, naming an issue not given (another initiative's epic, #750) or naming a row an
epic does not carry cannot resolve: the entry is named, the task it gates keeps the Status it
holds, and the run exits 1. Give the missing issue with --others to resolve it. An issue outside
the initiative's repository prints as owner/repo#number.

An issue from Ready on is assigned to the --assignee user, and one in Backlog has no assignee.

Printed: the gh call for each issue to add, item to remove, Status to set and assignee to add or
remove, which statuses.py renders within the DELIVERY jurisdiction. Run the calls, fetch the issues
and items again and re-run: the board is current when nothing is left to do.
"""
import argparse
import json
import re
import sys
from collections.abc import Iterable
from enum import Enum
from pathlib import Path

from format import AC, LINK, cell, id_cell, reservation, row_id, split_sections
from statuses import (DELIVERY, STATUSES, Changes, Jurisdiction, Key, StatusField, board_items,
                      key_of, label)
from sync import PR_REF, TICKED, Unreadable, attach_links, links_issue, pull_requests, table

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PULL_REF = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
ISSUE_REF = re.compile(r'github\.com/([^/]+/[^/]+)/issues/(\d+)$')
RANGE = re.compile(r'^W(\d\d)[–-]W(\d\d)$')
TASK_REF = re.compile(r'(?:^|:)(W\d\d)$')
UNPLACED, STARTED = 'unplaced', 'started'


def load(paths: list[str]) -> dict[Key, dict]:
    return {key_of(i): i for i in (json.loads(Path(p).read_text()) for p in paths)}


def completed(issue: dict) -> bool:
    return issue['state'] == 'closed' and issue.get('state_reason') == 'completed'


def criteria_met(issue: dict) -> bool:
    """Whether the issue has acceptance criteria and every one is ticked."""
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    lines = next((l for h, l in sections if h == 'Acceptance Criteria'), [])
    found = [TICKED.match(line) for line in lines if AC.match(line)]
    return bool(found) and all(found)


def open_questions(issue: dict) -> bool:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    return any(l.strip() for h, lines in sections if h == 'Open Questions' for l in lines)


def rows(issue: dict) -> tuple[list[str], list[list[str]]]:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    _, _, _, grid = table(sections)
    return (grid[0], grid[2:]) if grid else ([], [])


def issue_url(url: str) -> Key | None:
    found = ISSUE_REF.search(url)
    return (found[1], int(found[2])) if found else None


def linked_issue(cell: str) -> Key | None:
    link = LINK.fullmatch(cell)
    return issue_url(link[2]) if link else None


class Resolution(Enum):
    """How far a Depends on entry resolves. MET is delivered and UNMET is waiting on delivery that
    can still arrive. UNRESOLVABLE is a permanent condition: nothing the plan does next makes the
    entry readable, so a caller gating a row on it reports the entry rather than holding the row."""
    MET = 'met'
    UNMET = 'unmet'
    UNRESOLVABLE = 'unresolvable'


RESOLUTIONS = (Resolution.MET, Resolution.UNMET, Resolution.UNRESOLVABLE)
UNRESOLVABLE = 'cannot resolve'


def weakest(answers: Iterable[Resolution]) -> Resolution:
    """The least resolved of the answers, every one of them read, so each unresolvable entry of a
    cell is reported rather than only the first."""
    found = Resolution.MET
    for answer in answers:
        if RESOLUTIONS.index(answer) > RESOLUTIONS.index(found):
            found = answer
    return found


class Board:
    def __init__(self, issues: dict[Key, dict], unresolved: list[str], home: str, prs: list[dict] | None = None):
        self.issues = issues
        self.unresolved = unresolved
        self.home = home
        self.pulls = {p['html_url']: p for p in prs or []}
        self.tables: dict[Key, tuple[list[str], dict[str, list[str]]]] = {}

    def table(self, key: Key) -> tuple[list[str], dict[str, list[str]]]:
        """An issue's Work Breakdown header, and its rows by id."""
        if key not in self.tables:
            header, body = rows(self.issues[key])
            self.tables[key] = header, {i: r for r in body if (i := row_id(id_cell(header, r)))}
        return self.tables[key]

    def row_delivered(self, key: Key, task: str, why: str) -> Resolution:
        try:
            header, found = self.table(key)
        except Unreadable as exc:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {task}: {exc}')
            return Resolution.UNRESOLVABLE
        r = found.get(task)
        if r is None:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {task}: {label(key, self.home)} has no such row')
            return Resolution.UNRESOLVABLE
        ident = id_cell(header, r)
        pulls = commits = merged = False
        for found in LINK.finditer(ident):
            if '/commit/' in found[2]:
                commits = True
            elif '/pull/' in found[2]:
                pulls = True
                pr = self.pulls.get(found[2])
                if pr is None:
                    self.unresolved.append(f'{why}: {found[2]} is not in --prs')
                elif pr.get('merged_at'):
                    merged = True
        if commits or merged:
            return Resolution.MET
        if pulls:
            return Resolution.UNMET
        issue = linked_issue(ident)
        if issue is None:
            return Resolution.UNMET
        return self.issue_delivered(issue, why)

    def issue_delivered(self, key: Key, why: str) -> Resolution:
        if key not in self.issues:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {label(key, self.home)}: it is not given')
            return Resolution.UNRESOLVABLE
        return Resolution.MET if completed(self.issues[key]) else Resolution.UNMET

    def epic_prerequisites_met(self, key: Key, epics: dict[str, Key], why: str) -> Resolution:
        """Whether the whole epics an initiative row names as this one's prerequisites have reached
        their long-lived branches. Closed as completed is the delivery evidence sync records after
        an epic's bases merge. A row naming one task of another epic gates that row alone."""
        answers = []
        for parent, issue in self.issues.items():
            if not re.match(r'^\[I\d\d\]', issue.get('title') or ''):
                continue
            header, listed = self.table(parent)
            for item in listed.values():
                if linked_issue(id_cell(header, item)) == key:
                    answers.append(self.met(cell(header, item, 'Depends on'), parent, epics, why))
        return weakest(answers)

    def referenced_epics(self, key: Key, epics: dict[str, Key]) -> set[Key]:
        """The epics this one's rows name: those its task rows name outside it, and those its
        initiative row names. epics maps the initiative's Eyy ids to their issues."""
        header, tasks = self.table(key)
        cells = [cell(header, task, 'Depends on') for task in tasks.values()]
        for parent, issue in self.issues.items():
            if not re.match(r'^\[I\d\d\]', issue.get('title') or ''):
                continue
            head, listed = self.table(parent)
            cells += [cell(head, item, 'Depends on') for item in listed.values()
                      if linked_issue(id_cell(head, item)) == key]
        found = set()
        for entries in cells:
            for entry in (e.strip() for e in entries.split(',') if e.strip()):
                link = LINK.fullmatch(entry)
                text = link[1] if link else entry
                if re.fullmatch(r'W\d\d', text) or RANGE.fullmatch(text):
                    continue
                prerequisite = epics.get(text.split(':')[0]) or (issue_url(link[2]) if link else None)
                if prerequisite and prerequisite != key:
                    found.add(prerequisite)
        return found

    def met(self, cell: str, home: Key, epics: dict[str, Key], why: str) -> Resolution:
        """How far every dependency in a Depends on cell resolves. home is the issue whose table
        holds the row, and the repository a bare #750 is read against; epics maps the initiative's
        Eyy ids to their issues. Every entry is read, so a cell carrying two that cannot resolve
        names both."""
        answers = []
        for entry in (e.strip() for e in cell.split(',') if e.strip()):
            link = LINK.fullmatch(entry)
            text, url = (link[1], link[2]) if link else (entry, '')
            found = issue_url(url)
            span = RANGE.match(text)
            task = TASK_REF.search(text)
            if span:
                answer = weakest([self.row_delivered(home, f'W{n:02d}', why)
                                  for n in range(int(span[1]), int(span[2]) + 1)])
            elif re.fullmatch(r'W\d\d', text):
                answer = self.row_delivered(home, text, why)
            elif re.fullmatch(r'#\d+', text):
                answer = self.issue_delivered((home[0], int(text[1:])), why)
            else:
                key = found or epics.get(text.split(':')[0])
                if key is None:
                    self.unresolved.append(f'{why}: {UNRESOLVABLE} {text}: it names no row and links no issue')
                    answer = Resolution.UNRESOLVABLE
                elif task and key not in self.issues:
                    self.unresolved.append(f'{why}: {UNRESOLVABLE} {text}: {label(key, self.home)} is not given')
                    answer = Resolution.UNRESOLVABLE
                elif task:
                    answer = weakest([Resolution.MET if key == home else self.issue_delivered(key, why),
                                      self.row_delivered(key, task[1], why)])
                else:
                    answer = self.issue_delivered(key, why)
            answers.append(answer)
        return weakest(answers)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('initiative')
    parser.add_argument('--epics', nargs='*', default=[])
    parser.add_argument('--tasks', nargs='*', default=[])
    parser.add_argument('--others', nargs='*', default=[], help='issues outside the initiative its rows depend on')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--links', help='the closing issue references those pull requests hold')
    parser.add_argument('--board', help='the board path, e.g. users/m2ux/projectsV2/9')
    parser.add_argument('--fields', help="the board's fields")
    parser.add_argument('--items', help="the board's items, fetched with the Status field")
    parser.add_argument('--out', help='directory for the Status body files')
    parser.add_argument('--assignee', help='the user assigned to every issue from Ready on')
    args = parser.parse_args()
    for name in ('prs', 'links', 'board', 'fields', 'items', 'out', 'assignee'):
        if not getattr(args, name):
            sys.exit(f'--{name} is required')

    initiative = json.loads(Path(args.initiative).read_text())
    m = PREFIX.match(initiative['title'])
    if not m or m[2]:
        sys.exit(f"not an initiative: {initiative['title']}")
    tag = m[1]
    root = key_of(initiative)
    home = root[0]
    epics, tasks = load(args.epics), load(args.tasks)
    issues = {**load(args.others), **tasks, **epics, root: initiative}
    prs = pull_requests(args.prs)
    attach_links(prs, args.links)
    unresolved: list[str] = []
    unplaceable: list[str] = []
    board = Board(issues, unresolved, home, prs)

    header, epic_rows = rows(initiative)
    epic_ids = {row_id(id_cell(header, r)): n for r in epic_rows if (n := linked_issue(id_cell(header, r)))}
    status: dict[Key, str | None] = {}
    task_epic: dict[Key, Key] = {}

    def pr_status(epic_key: str, cite: Key | None = None) -> str | None:
        """In Review for an open pull request ready for review linking the issue, In Progress for
        an open draft, None for neither."""
        found = set()
        for p in prs:
            ref = PR_REF.match(p['title'])
            if p.get('state') != 'open' or not ref or ref.groups() != (tag, epic_key):
                continue
            if cite is None or links_issue(p, cite):
                found.add('In Progress' if p.get('draft') else 'In Review')
        return 'In Review' if 'In Review' in found else 'In Progress' if found else None

    for r in epic_rows:
        ident = id_cell(header, r)
        number = linked_issue(ident)
        if number is None or number not in epics:
            unresolved.append(row_id(ident) + ': its issue is not given with --epics')
            continue
        epic = epics[number]
        epic_key = row_id(ident)[1:]
        task_header, task_rows = board.table(number)
        delivered_any = False
        for tid, tr in task_rows.items():
            ident = id_cell(task_header, tr)
            task_issue = linked_issue(ident)
            if task_issue is not None and task_issue not in tasks:
                unresolved.append(f'E{epic_key}:{tid}: task issue {label(task_issue, home)} is not given with --tasks')
                continue
            if task_issue is None:
                prefix = f'[I{tag}:E{epic_key}:{tid}]'
                found = [k for k, issue in tasks.items() if issue['title'].startswith(prefix)]
                if len(found) > 1:
                    unresolved.append(f'E{epic_key}:{tid}: {len(found)} task issues titled {prefix}')
                task_issue = found[0] if len(found) == 1 else None
            delivered_any |= board.row_delivered(number, tid, f'E{epic_key}:{tid}') is Resolution.MET
            if task_issue is None:
                continue
            t = tasks[task_issue]
            if t['state'] == 'closed':
                status[task_issue] = 'Done' if completed(t) else None
            elif found := pr_status(epic_key, task_issue):
                status[task_issue] = found
            elif reservation(ident):
                status[task_issue] = 'In Progress'
            elif open_questions(t):
                status[task_issue] = 'Backlog'
            else:
                gates = weakest([board.epic_prerequisites_met(number, epic_ids, f'E{epic_key}:{tid}'),
                                 board.met(cell(task_header, tr, 'Depends on'), number, epic_ids,
                                           f'E{epic_key}:{tid}')])
                if gates is Resolution.UNRESOLVABLE:
                    unplaceable.append(f'E{epic_key}:{tid}')
                    continue
                status[task_issue] = 'Ready' if gates is Resolution.MET else 'Backlog'
            task_epic[task_issue] = number
        if epic['state'] == 'closed':
            status[number] = 'Done' if completed(epic) else None
        elif criteria_met(epic):
            status[number] = 'In Review'
        elif pr_status(epic_key):
            status[number] = 'In Progress'
        elif delivered_any:
            status[number] = STARTED
        else:
            status[number] = UNPLACED

    epic_status = [status.get(n) for n in epic_ids.values()]
    if initiative['state'] == 'closed':
        status[root] = 'Done' if completed(initiative) else None
    elif criteria_met(initiative):
        status[root] = 'In Review'
    elif any(s in ('In Review', 'In Progress') for s in epic_status):
        status[root] = 'In Progress'
    elif any(s in ('Done', STARTED) for s in epic_status):
        status[root] = STARTED
    else:
        status[root] = UNPLACED

    field = StatusField(args.fields, args.out, STATUSES)
    status = {k: field.settle(s) for k, s in status.items()}

    on_board = {}
    for key, item_id, held, content in board_items(args.items):
        on_board[key] = (item_id, held)
        if key not in status and content['state'] == 'closed' and not completed(content):
            issues.setdefault(key, content)
            cited = re.compile(rf"{re.escape(content['html_url'])}\b")
            if any(cited.search(i.get('body') or '') for i in (initiative, *epics.values(), *tasks.values())):
                status[key] = None

    for key, wanted in list(status.items()):
        if wanted not in (UNPLACED, STARTED):
            continue
        held_status = on_board[key][1] if key in on_board else None
        if held_status in ('Ready', 'Backlog'):
            status[key] = held_status
        elif wanted == STARTED and (held_status in ('In Progress', 'In Review') or key not in on_board):
            status[key] = 'In Progress'
        else:
            status[key] = 'Backlog'
    for task_key, epic_key in task_epic.items():
        if status.get(task_key) == 'Ready' and status.get(epic_key) not in ('Ready', 'In Progress'):
            status[task_key] = 'Backlog'

    changes = Changes(DELIVERY, args.board, field, args.assignee, ' (the board is current)')
    for key, wanted in sorted(status.items()):
        item_id, held = on_board.get(key, (None, None))
        changes.place(key, f"{label(key, home)} {issues[key]['title']}", issues[key],
                      held, wanted, item_id, home)
    printed = changes.report(unresolved=unresolved, asking=bool(unplaceable))
    return 1 if unplaceable else printed


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (Unreadable, Jurisdiction) as refused:
        sys.exit(str(refused))
