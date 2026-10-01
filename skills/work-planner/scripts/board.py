"""Bring an initiative's theme board up to date with its issues.

Usage:
  python3 board.py issue-936.json --epics issue-943.json ... --tasks issue-637.json ... --prs prs.json
      --board users/{owner}/projectsV2/9 --fields fields.json --items items.json --out board/
      --assignee m2ux
      [--others issue-750.json ...]

Issue files are as `gh api repos/{owner}/{repo}/issues/943` returns them, and prs.json as update.py
reads it. A board's fields and items are as the REST API returns them, pages concatenated:
  gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
  gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=<Status field id>" > items.json
An organization's board is under orgs/{owner} in place of users/{owner}.

The board covers the initiative, every epic its Work Breakdown links, and every task issue
an epic row links, in whichever repository each lives. An issue is known by its repository and
number, so an epic another repository holds is tracked like one of the initiative's own, and two
repositories' issues of one number stay apart. An item already on the board for an issue those
bodies cite, closed other than as completed (an issue a task subsumed), is removed. Each issue's
Status, first match wins:
  Done         closed as completed
  (removed)    closed any other way
  In Review    an open pull request ready for review names it: its title names the epic by the
               initiative's row id, and for a task issue its title or body also cites the issue
  In Progress  an open draft pull request names it, or it is an epic with a delivered row
  Ready        every dependency in its row is delivered and it has no Open questions
  Backlog      otherwise
An open initiative is In Progress when any epic is Done, In Review or In Progress, Ready when any
epic is Ready, and Backlog otherwise.

The board's Status field offers Backlog, Ready, In Progress and Done. In Review is optional: on a
board whose Status lacks it, an issue In Review is set In Progress.

A dependency is delivered when its task row is, or its issue is closed as completed. A task row is
delivered when its id links a pull request or commit, or a task issue closed as completed. A bare
#750 names an issue in the repository of the issue whose row cites it. A dependency on an issue not
given (another initiative's epic, #750) is reported unresolved and read as undelivered; give that
issue with --others to resolve it. An issue outside the initiative's repository prints as
owner/repo#number.

An issue from Ready on is assigned to the --assignee user, and one in Backlog has no assignee.

Printed: the gh call for each issue to add, item to remove, Status to set and assignee to add or
remove. A Status write sends the body file written under --out. Run the calls, fetch the issues and
items again and re-run: the board is current when nothing is left to do.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from format import LINK, cell, has_pull, id_cell, row_id, split_sections
from update import PR_REF, Unreadable, pull_requests, table

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PULL_REF = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
ISSUE_REF = re.compile(r'github\.com/([^/]+/[^/]+)/issues/(\d+)$')
RANGE = re.compile(r'^W(\d\d)[–-]W(\d\d)$')
TASK_REF = re.compile(r'(?:^|:)(W\d\d)$')
STATUSES = ('Backlog', 'Ready', 'In Progress', 'Done')
OPTIONAL = {'In Review': 'In Progress'}


def pages(path: str) -> list:
    """A paginated REST response: JSON arrays written one after another."""
    text, decoder, items, i = Path(path).read_text(), json.JSONDecoder(), [], 0
    while True:
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            return items
        page, i = decoder.raw_decode(text, i)
        items.extend(page)


Key = tuple[str, int]


def key_of(issue: dict) -> Key:
    """An issue's identity across repositories: its owner/repo and number."""
    return issue['repository_url'].split('/repos/', 1)[1], issue['number']


def label(key: Key, home: str) -> str:
    return f'#{key[1]}' if key[0] == home else f'{key[0]}#{key[1]}'


def load(paths: list[str]) -> dict[Key, dict]:
    return {key_of(i): i for i in (json.loads(Path(p).read_text()) for p in paths)}


def completed(issue: dict) -> bool:
    return issue['state'] == 'closed' and issue.get('state_reason') == 'completed'


def open_questions(issue: dict) -> bool:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    return any(l.strip() for h, lines in sections if h == 'Open questions' for l in lines)


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


def cites(pr: dict, key: Key) -> bool:
    """Whether a pull request's title or body cites the issue: by its URL or owner/repo#number, or
    as a bare #number from the issue's own repository. Repository names match in any case."""
    repo, number = key
    text = f"{pr['title']}\n{pr.get('body') or ''}"
    if re.search(rf'(?<![\w.-]){re.escape(repo)}(?:/issues/|#){number}\b', text, re.IGNORECASE):
        return True
    home = PULL_REF.search(pr.get('html_url') or '')
    return bool(home) and home[1].lower() == repo.lower() and bool(re.search(rf'(?<![\w/.-])#{number}\b', text))


def option_name(name) -> str | None:
    """A single-select option's name, which REST gives as a string or as {raw, html}."""
    return name['raw'] if isinstance(name, dict) else name


def status_of(item: dict) -> str | None:
    """A board item's Status, None where it has none."""
    value = next((f.get('value') for f in item.get('fields', []) if f.get('name') == 'Status'), None)
    return option_name(value and value.get('name'))


class Board:
    def __init__(self, issues: dict[Key, dict], unresolved: list[str], home: str):
        self.issues = issues
        self.unresolved = unresolved
        self.home = home
        self.tables: dict[Key, tuple[list[str], dict[str, list[str]]]] = {}

    def table(self, key: Key) -> tuple[list[str], dict[str, list[str]]]:
        """An issue's Work Breakdown header, and its rows by id."""
        if key not in self.tables:
            header, body = rows(self.issues[key])
            self.tables[key] = header, {i: r for r in body if (i := row_id(id_cell(header, r)))}
        return self.tables[key]

    def row_delivered(self, key: Key, task: str, why: str) -> bool:
        header, found = self.table(key)
        r = found.get(task)
        if r is None:
            self.unresolved.append(f'{why}: {label(key, self.home)} has no row {task}')
            return False
        ident = id_cell(header, r)
        issue = linked_issue(ident)
        if issue is None:
            return has_pull(ident)
        return self.issue_delivered(issue, why)

    def issue_delivered(self, key: Key, why: str) -> bool:
        if key not in self.issues:
            self.unresolved.append(f'{why}: {label(key, self.home)} not given')
            return False
        return completed(self.issues[key])

    def met(self, cell: str, home: Key, epics: dict[str, Key], why: str) -> bool:
        """Whether every dependency in a Depends on cell is delivered. home is the issue whose table
        holds the row, and the repository a bare #750 is read against; epics maps the initiative's
        Eyy ids to their issues."""
        for entry in (e.strip() for e in cell.split(',') if e.strip()):
            link = LINK.fullmatch(entry)
            text, url = (link[1], link[2]) if link else (entry, '')
            found = issue_url(url)
            span = RANGE.match(text)
            task = TASK_REF.search(text)
            if span:
                ok = all(self.row_delivered(home, f'W{n:02d}', why)
                         for n in range(int(span[1]), int(span[2]) + 1))
            elif re.fullmatch(r'W\d\d', text):
                ok = self.row_delivered(home, text, why)
            elif re.fullmatch(r'#\d+', text):
                ok = self.issue_delivered((home[0], int(text[1:])), why)
            else:
                key = found or epics.get(text.split(':')[0])
                if key is None:
                    self.unresolved.append(f'{why}: {text} links no issue')
                    ok = False
                elif task and key not in self.issues:
                    self.unresolved.append(f'{why}: {label(key, self.home)} not given')
                    ok = False
                elif task:
                    ok = self.row_delivered(key, task[1], why)
                else:
                    ok = self.issue_delivered(key, why)
            if not ok:
                return False
        return True


def assignee_calls(key: Key, status: str, issue: dict, login: str) -> list[str]:
    """The calls that give an issue at this Status its assignees: the user from Ready on, and nobody
    in Backlog."""
    repo, number = key
    held = [a['login'] for a in issue.get('assignees') or []]
    path = f'repos/{repo}/issues/{number}/assignees'
    if status == 'Backlog':
        return [f"gh api --method DELETE {path} -f 'assignees[]={who}'" for who in held]
    if login not in held:
        return [f"gh api --method POST {path} -f 'assignees[]={login}'"]
    return []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('initiative')
    parser.add_argument('--epics', nargs='*', default=[])
    parser.add_argument('--tasks', nargs='*', default=[])
    parser.add_argument('--others', nargs='*', default=[], help='issues outside the initiative its rows depend on')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--board', help='the board path, e.g. users/m2ux/projectsV2/9')
    parser.add_argument('--fields', help="the board's fields")
    parser.add_argument('--items', help="the board's items, fetched with the Status field")
    parser.add_argument('--out', help='directory for the Status body files')
    parser.add_argument('--assignee', help='the user assigned to every issue from Ready on')
    args = parser.parse_args()
    for name in ('prs', 'board', 'fields', 'items', 'out', 'assignee'):
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
    unresolved: list[str] = []
    board = Board(issues, unresolved, home)

    header, epic_rows = rows(initiative)
    epic_ids = {row_id(id_cell(header, r)): n for r in epic_rows if (n := linked_issue(id_cell(header, r)))}
    status: dict[Key, str | None] = {}

    def pr_status(epic_key: str, cite: Key | None = None) -> str | None:
        """In Review for an open pull request ready for review naming the issue, In Progress for an
        open draft, None for neither."""
        found = set()
        for p in prs:
            ref = PR_REF.match(p['title'])
            if p.get('state') != 'open' or not ref or ref.groups() != (tag, epic_key):
                continue
            if cite is None or cites(p, cite):
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
            task_issue = linked_issue(id_cell(task_header, tr))
            if task_issue is not None and task_issue not in tasks:
                unresolved.append(f'E{epic_key}:{tid}: task issue {label(task_issue, home)} is not given with --tasks')
                continue
            delivered_any |= board.row_delivered(number, tid, f'E{epic_key}:{tid}')
            if task_issue is None:
                continue
            t = tasks[task_issue]
            if t['state'] == 'closed':
                status[task_issue] = 'Done' if completed(t) else None
            elif found := pr_status(epic_key, task_issue):
                status[task_issue] = found
            elif not open_questions(t) and board.met(cell(task_header, tr, 'Depends on'), number, epic_ids, f'E{epic_key}:{tid}'):
                status[task_issue] = 'Ready'
            else:
                status[task_issue] = 'Backlog'
        if epic['state'] == 'closed':
            status[number] = 'Done' if completed(epic) else None
        elif (found := pr_status(epic_key)) == 'In Review':
            status[number] = 'In Review'
        elif found or delivered_any:
            status[number] = 'In Progress'
        elif not open_questions(epic) and board.met(cell(header, r, 'Depends on'), root, epic_ids, f'E{epic_key}'):
            status[number] = 'Ready'
        else:
            status[number] = 'Backlog'

    epic_status = [status.get(n) for n in epic_ids.values()]
    if initiative['state'] == 'closed':
        status[root] = 'Done' if completed(initiative) else None
    elif any(s in ('Done', 'In Review', 'In Progress') for s in epic_status):
        status[root] = 'In Progress'
    elif 'Ready' in epic_status:
        status[root] = 'Ready'
    else:
        status[root] = 'Backlog'

    field = next((f for f in pages(args.fields) if f.get('name') == 'Status'), None)
    if not field:
        sys.exit('the board has no Status field')
    options = {option_name(o['name']): o['id'] for o in field.get('options', [])}
    missing = [s for s in STATUSES if s not in options]
    if missing:
        sys.exit(f"the board's Status field lacks {', '.join(missing)}")
    for wanted, fallback in OPTIONAL.items():
        if wanted not in options:
            status = {k: fallback if s == wanted else s for k, s in status.items()}
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    for name, option in options.items():
        body = {'fields': [{'id': field['id'], 'value': option}]}
        (out / f"status-{name.lower().replace(' ', '-')}.json").write_text(json.dumps(body))

    on_board = {}
    for item in pages(args.items):
        content = item.get('content') or {}
        if item.get('content_type') == 'Issue' and content.get('repository_url'):
            key = key_of(content)
            on_board[key] = (item['id'], status_of(item))
            if key not in status and content['state'] == 'closed' and not completed(content):
                issues.setdefault(key, content)
                cited = re.compile(rf"{re.escape(content['html_url'])}\b")
                if any(cited.search(i.get('body') or '') for i in (initiative, *epics.values(), *tasks.values())):
                    status[key] = None

    print(f"{args.board}: Status field {field['id']}")
    current, todo = 0, 0
    for key, wanted in sorted(status.items()):
        title = f"{label(key, home)} {issues[key]['title']}"
        held = on_board.get(key)
        calls = [] if wanted is None else assignee_calls(key, wanted, issues[key], args.assignee)
        if wanted is None and held:
            print(f'  remove {title} (closed, not completed): '
                  f'gh api --method DELETE {args.board}/items/{held[0]}')
        elif wanted and not held:
            print(f'  add {title} ({wanted}): '
                  f"gh api --method POST {args.board}/items -f type=Issue -F id={issues[key]['id']}")
        elif wanted and held[1] != wanted:
            body = out / f"status-{wanted.lower().replace(' ', '-')}.json"
            print(f"  set {title}: {held[1] or 'no Status'} → {wanted}: "
                  f'gh api --method PATCH {args.board}/items/{held[0]} --input {body}')
        elif not calls:
            current += 1
            continue
        for call in calls:
            print(f'  assign {title} ({wanted}): {call}')
        todo += 1
    for note in dict.fromkeys(unresolved):
        print(f'  unresolved: {note}')
    print(f'  current: {current}, to do: {todo}' + ('' if todo else ' (the board is current)'))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
