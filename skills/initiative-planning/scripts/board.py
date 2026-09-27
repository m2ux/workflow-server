"""Find an initiative's project board, and bring the board's Status up to date with its issues.

Usage:
  python3 board.py --find issue-936.json 2=items-2.json 7=items-7.json ...
  python3 board.py issue-936.json --epics issue-943.json ... --tasks issue-637.json ... --prs prs.json
      --board users/{owner}/projectsV2/2 --fields fields.json --items items.json --out board/
      [--others issue-750.json ...]

Issue files are as `gh api repos/{owner}/{repo}/issues/943` returns them, and prs.json as update.py
reads it. A board's fields and items are as the REST API returns them, pages concatenated:
  gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" > fields.json
  gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100&fields=<Status field id>" > items.json
An organization's board is under orgs/{owner} in place of users/{owner}.

--find prints the boards, of those given, holding an item for the initiative issue, and exits 1
unless exactly one does.

Otherwise the board covers the initiative, every epic its Work Breakdown links, and every task issue
an epic row links. Each issue's Status, first match wins:
  Done         closed as completed
  (removed)    closed any other way
  In Review    an open pull request names it: its title names the epic, and for a task issue its
               title or body also cites the issue
  In Progress  an epic with a delivered row
  Ready        every dependency in its row is delivered and it has no Open questions
  Backlog      otherwise
An open initiative is In Progress when any epic is Done, In Review or In Progress, Ready when any
epic is Ready, and Backlog otherwise.

A dependency is delivered when its task row is, or its issue is closed as completed. A task row is
delivered when its id links a pull request or commit, or a task issue closed as completed. A
dependency on an issue not given (another initiative's epic, #750) is reported unresolved and read
as undelivered; give that issue with --others to resolve it.

Printed: the gh call for each issue to add, item to remove and Status to set. A Status write sends
the body file written under --out. Run the calls, fetch the items again and re-run: the board is
current when nothing is left to do.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from format import LINK, cells, split_sections
from update import PR_REF, ISSUE_URL, table

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
RANGE = re.compile(r'^W(\d\d)[–-]W(\d\d)$')
TASK_REF = re.compile(r'(?:^|:)(W\d\d)$')
STATUSES = ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done')


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


def load(paths: list[str]) -> dict[int, dict]:
    return {i['number']: i for i in (json.loads(Path(p).read_text()) for p in paths)}


def completed(issue: dict) -> bool:
    return issue['state'] == 'closed' and issue.get('state_reason') == 'completed'


def open_questions(issue: dict) -> bool:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    return any(l.strip() for h, lines in sections if h == 'Open questions' for l in lines)


def rows(issue: dict) -> tuple[list[str], list[list[str]]]:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    _, _, _, grid = table(sections)
    return (grid[0], grid[2:]) if grid else ([], [])


def linked_issue(cell: str) -> int | None:
    link = LINK.fullmatch(cell)
    found = ISSUE_URL.search(link[2]) if link else None
    return int(found[1]) if found else None


class Board:
    def __init__(self, issues: dict[int, dict], unresolved: list[str]):
        self.issues = issues
        self.unresolved = unresolved
        self.tables: dict[int, dict[str, list[str]]] = {}

    def table(self, number: int) -> dict[str, list[str]]:
        """An issue's Work Breakdown rows by id, with the header under ''."""
        if number not in self.tables:
            header, body = rows(self.issues[number])
            self.tables[number] = {'': header, **{LINK.sub(r'\1', r[0]): r for r in body}}
        return self.tables[number]

    def row_delivered(self, number: int, task: str, why: str) -> bool:
        r = self.table(number).get(task)
        if r is None:
            self.unresolved.append(f'{why}: #{number} has no row {task}')
            return False
        issue = linked_issue(r[0])
        if issue is None:
            return bool(LINK.fullmatch(r[0]))
        return self.issue_delivered(issue, why)

    def issue_delivered(self, number: int, why: str) -> bool:
        if number not in self.issues:
            self.unresolved.append(f'{why}: #{number} not given')
            return False
        return completed(self.issues[number])

    def met(self, cell: str, home: int, epics: dict[str, int], why: str) -> bool:
        """Whether every dependency in a Depends on cell is delivered. home is the issue whose table
        holds the row; epics maps the initiative's Eyy ids to their issues."""
        for entry in (e.strip() for e in cell.split(',') if e.strip()):
            link = LINK.fullmatch(entry)
            text, url = (link[1], link[2]) if link else (entry, '')
            found = ISSUE_URL.search(url)
            span = RANGE.match(text)
            task = TASK_REF.search(text)
            if span:
                ok = all(self.row_delivered(home, f'W{n:02d}', why)
                         for n in range(int(span[1]), int(span[2]) + 1))
            elif re.fullmatch(r'W\d\d', text):
                ok = self.row_delivered(home, text, why)
            elif re.fullmatch(r'#\d+', text):
                ok = self.issue_delivered(int(text[1:]), why)
            else:
                number = int(found[1]) if found else epics.get(text.split(':')[0])
                if number is None:
                    self.unresolved.append(f'{why}: {text} links no issue')
                    ok = False
                elif task and number not in self.issues:
                    self.unresolved.append(f'{why}: #{number} not given')
                    ok = False
                elif task:
                    ok = self.row_delivered(number, task[1], why)
                else:
                    ok = self.issue_delivered(number, why)
            if not ok:
                return False
        return True


def find(initiative_path: str, boards: list[str]) -> int:
    issue = json.loads(Path(initiative_path).read_text())
    holding = []
    for spec in boards:
        number, path = spec.split('=', 1)
        if any(i.get('content_type') == 'Issue' and i['content'].get('number') == issue['number']
               and i['content'].get('repository_url') == issue['repository_url'] for i in pages(path)):
            holding.append(number)
    print(f"#{issue['number']} is on board {', '.join(holding)}" if holding else f"#{issue['number']} is on no board given")
    return 0 if len(holding) == 1 else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('initiative')
    parser.add_argument('boards', nargs='*', help='--find: N=items-N.json for each board')
    parser.add_argument('--find', action='store_true', help='print the boards holding the initiative')
    parser.add_argument('--epics', nargs='*', default=[])
    parser.add_argument('--tasks', nargs='*', default=[])
    parser.add_argument('--others', nargs='*', default=[], help='issues outside the initiative its rows depend on')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--board', help='the board path, e.g. users/m2ux/projectsV2/2')
    parser.add_argument('--fields', help="the board's fields")
    parser.add_argument('--items', help="the board's items, fetched with the Status field")
    parser.add_argument('--out', help='directory for the Status body files')
    args = parser.parse_args()
    if args.find:
        return find(args.initiative, args.boards)
    for name in ('prs', 'board', 'fields', 'items', 'out'):
        if not getattr(args, name):
            sys.exit(f'--{name} is required')

    initiative = json.loads(Path(args.initiative).read_text())
    m = PREFIX.match(initiative['title'])
    if not m or m[2]:
        sys.exit(f"not an initiative: {initiative['title']}")
    tag = m[1]
    epics, tasks = load(args.epics), load(args.tasks)
    issues = {**load(args.others), **tasks, **epics, initiative['number']: initiative}
    prs = [json.loads(l) for l in Path(args.prs).read_text().splitlines() if l.strip()]
    unresolved: list[str] = []
    board = Board(issues, unresolved)

    header, epic_rows = rows(initiative)
    epic_ids = {LINK.sub(r'\1', r[0]): n for r in epic_rows if (n := linked_issue(r[0]))}
    status: dict[int, str | None] = {}

    def depends(header: list[str], r: list[str]) -> str:
        column = header.index('Depends on') if 'Depends on' in header else None
        return r[column] if column is not None and column < len(r) else ''

    def in_review(epic_key: str, cite: int | None = None) -> bool:
        for p in prs:
            ref = PR_REF.match(p['title'])
            if p.get('state') != 'open' or not ref or ref.groups() != (tag, epic_key):
                continue
            text = f"{p['title']}\n{p.get('body') or ''}"
            if cite is None or re.search(rf'#{cite}\b|/issues/{cite}\b', text):
                return True
        return False

    for r in epic_rows:
        number = linked_issue(r[0])
        if number is None or number not in epics:
            unresolved.append(LINK.sub(r'\1', r[0]) + ': its issue is not given with --epics')
            continue
        epic = epics[number]
        epic_key = PREFIX.match(epic['title'])[2]
        task_header = board.table(number)['']
        delivered_any = False
        for tid, tr in board.table(number).items():
            if not tid:
                continue
            task_issue = linked_issue(tr[0])
            delivered_any |= board.row_delivered(number, tid, f'E{epic_key}:{tid}')
            if task_issue is None:
                continue
            if task_issue not in tasks:
                unresolved.append(f'E{epic_key}:{tid}: task issue #{task_issue} is not given with --tasks')
                continue
            t = tasks[task_issue]
            if t['state'] == 'closed':
                status[task_issue] = 'Done' if completed(t) else None
            elif in_review(epic_key, task_issue):
                status[task_issue] = 'In Review'
            elif not open_questions(t) and board.met(depends(task_header, tr), number, epic_ids, f'E{epic_key}:{tid}'):
                status[task_issue] = 'Ready'
            else:
                status[task_issue] = 'Backlog'
        if epic['state'] == 'closed':
            status[number] = 'Done' if completed(epic) else None
        elif in_review(epic_key):
            status[number] = 'In Review'
        elif delivered_any:
            status[number] = 'In Progress'
        elif not open_questions(epic) and board.met(depends(header, r), initiative['number'], epic_ids, f'E{epic_key}'):
            status[number] = 'Ready'
        else:
            status[number] = 'Backlog'

    epic_status = [status.get(n) for n in epic_ids.values()]
    if initiative['state'] == 'closed':
        status[initiative['number']] = 'Done' if completed(initiative) else None
    elif any(s in ('Done', 'In Review', 'In Progress') for s in epic_status):
        status[initiative['number']] = 'In Progress'
    elif 'Ready' in epic_status:
        status[initiative['number']] = 'Ready'
    else:
        status[initiative['number']] = 'Backlog'

    field = next((f for f in pages(args.fields) if f.get('name') == 'Status'), None)
    if not field:
        sys.exit('the board has no Status field')
    options = {o['name']['raw'] if isinstance(o['name'], dict) else o['name']: o['id'] for o in field.get('options', [])}
    missing = [s for s in STATUSES if s not in options]
    if missing:
        sys.exit(f"the board's Status field lacks {', '.join(missing)}")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for name, option in options.items():
        body = {'fields': [{'id': field['id'], 'value': option}]}
        (out / f"status-{name.lower().replace(' ', '-')}.json").write_text(json.dumps(body))

    on_board = {}
    for item in pages(args.items):
        content = item.get('content') or {}
        if item.get('content_type') == 'Issue' and content.get('repository_url') == initiative['repository_url']:
            value = next((f.get('value') for f in item.get('fields', []) if f.get('id') == field['id']), None)
            name = value and value.get('name')
            on_board[content['number']] = (item['id'], name['raw'] if isinstance(name, dict) else name)

    print(f"{args.board}: Status field {field['id']}")
    current, todo = 0, 0
    for number, wanted in sorted(status.items()):
        title = issues[number]['title']
        held = on_board.get(number)
        if wanted is None and held:
            print(f'  remove #{number} {title} (closed, not completed): '
                  f'gh api --method DELETE {args.board}/items/{held[0]}')
        elif wanted and not held:
            print(f'  add #{number} {title} ({wanted}): '
                  f"gh api --method POST {args.board}/items -f type=Issue -F id={issues[number]['id']}")
        elif wanted and held[1] != wanted:
            body = out / f"status-{wanted.lower().replace(' ', '-')}.json"
            print(f"  set #{number} {title}: {held[1] or 'no Status'} → {wanted}: "
                  f'gh api --method PATCH {args.board}/items/{held[0]} --input {body}')
        else:
            current += 1
            continue
        todo += 1
    for note in dict.fromkeys(unresolved):
        print(f'  unresolved: {note}')
    print(f'  current: {current}, to do: {todo}' + ('' if todo else ' (the board is current)'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
