"""Decide which initiatives and epics on a theme board are Ready or In Progress.

Usage:
  python3 advance.py --items items.json --prs prs.json --board users/{owner}/projectsV2/9
      --fields fields.json --out board/ --assignee m2ux [--others issue-750.json ...]

items.json is the board's items with the Status field, as board.py reads them. prs.json is as
sync.py reads it. fields.json is the board's fields. An issue the rows depend on that is not on
the board is given with --others.

The moves are the Advance mode rules. Printed: the gh call for each Status and assignee change,
an order line for each kind when nothing is In Progress and no initiative has a priority, an ask
line for an initiative In Progress with no priority, a tie line when labelled initiatives share
the highest rank, a wait line for an open pull request, a next line for epics, and, once the
queue is current, a begin line for the epic issue to begin.
--unplanned names an initiative the user left with no priority. It returns to Backlog once its
open pull requests have completed, and its epics return with it. Initiatives with the same
priority number run together. A priority is a positive integer with no maximum.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

from board import Board, assignee_calls, key_of, label, linked_issue, open_questions, option_name, pages, rows, status_of
from format import cell, id_cell, row_id
from sync import PR_REF, Unreadable, pull_requests

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
RANK = re.compile(r'^priority: ([1-9]\d*)$')
PULL_HOME = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
PLACED = ('Backlog', 'Ready', 'In Progress')


def label_names(issue: dict) -> set[str]:
    return {item['name'] for item in issue.get('labels') or []}


def rank(issue: dict) -> int | None:
    """The initiative's priority. A larger number is higher. Two labels count as the larger."""
    found = [int(matched.group(1)) for name in label_names(issue) if (matched := RANK.fullmatch(name))]
    return max(found) if found else None


def tags(title: str) -> tuple[str, str, str] | None:
    matched = PREFIX.match(title)
    return (matched[1], matched[2] or '', matched[3] or '') if matched else None


def is_initiative(issue: dict) -> bool:
    parsed = tags(issue['title'])
    return bool(parsed) and not parsed[1]


def pending(prs: list[dict], tag: str, repos: set[str]) -> list[str]:
    """Open pull requests of an initiative, in its repository or an epic's."""
    found = []
    for pr in prs:
        matched = PR_REF.match(pr.get('title') or '')
        if pr.get('state') != 'open' or not matched or matched[1] != tag:
            continue
        home = PULL_HOME.search(pr.get('html_url') or '')
        if home and home[1].lower() not in repos:
            continue
        found.append(pr.get('html_url') or pr['title'])
    return found


def epic_rows(board: Board, key: tuple[str, int], why: str) -> list[tuple[str, tuple[str, int] | None, str]]:
    """An initiative's epic rows: row id, issue key, Depends on cell."""
    try:
        header, body = rows(board.issues[key])
    except Unreadable as exc:
        board.unresolved.append(f'{why}: {exc}')
        return []
    return [(row_id(ident), linked_issue(ident), cell(header, row, 'Depends on'))
            for row in body if (ident := id_cell(header, row))]


def partial(board: Board, key: tuple[str, int], why: str) -> bool:
    """Whether an open epic has a delivered task row."""
    issue = board.issues.get(key)
    if issue is None or issue['state'] != 'open':
        return False
    try:
        _, tasks = board.table(key)
    except Unreadable as exc:
        board.unresolved.append(f'{why}: {exc}')
        return False
    return any(board.row_delivered(key, task, why) for task in tasks)


def is_next(board: Board, initiative: tuple[str, int], epic: tuple[str, int] | None, depends: str,
            epics: dict[str, tuple[str, int]], why: str) -> bool:
    issue = board.issues.get(epic) if epic else None
    if issue is None or issue['state'] != 'open' or open_questions(issue):
        return False
    return board.met(depends, initiative, epics, why)


class Queue:
    def __init__(self, issues: dict, status: dict, prs: list[dict], home: str, unplanned: set):
        self.issues = issues
        self.status = status
        self.prs = prs
        self.home = home
        self.unplanned = unplanned
        self.shelved: set = set()
        self.board = Board(issues, [], home, prs)
        self.wanted: dict = {}
        self.notes: list[str] = []
        self.children: dict = {}
        self.parents: dict = {}

    def line(self, key: tuple[str, int]) -> str:
        return f"{label(key, self.home)} {self.issues[key]['title']}"

    def place(self, key: tuple[str, int], new: str) -> None:
        if self.status.get(key) != new:
            self.wanted[key] = new

    def load(self, key: tuple[str, int]) -> list[tuple[str, tuple[str, int], str]]:
        if key in self.children:
            return self.children[key]
        rows_of = []
        epics: dict[str, tuple[str, int]] = {}
        for row_name, epic_key, depends in epic_rows(self.board, key, self.line(key)):
            if epic_key is None or epic_key not in self.issues:
                self.board.unresolved.append(f'{self.line(key)} {row_name}: its issue is not given')
                continue
            if epic_key not in self.status:
                self.board.unresolved.append(f'{self.line(key)} {row_name}: its issue is not on the board')
                continue
            epics[row_name.split(':')[0]] = epic_key
            rows_of.append((row_name, epic_key, depends))
            self.parents[epic_key] = key
        self.children[key] = (rows_of, epics)
        return self.children[key]

    def repos(self, key: tuple[str, int]) -> set[str]:
        rows_of, _ = self.load(key)
        return {key[0].lower(), *(epic[0].lower() for _, epic, _ in rows_of)}

    def activate(self, key: tuple[str, int]) -> None:
        """Partly completed epics are In Progress, and the next unstarted epics are Ready."""
        rows_of, epics = self.load(key)
        for row_name, epic_key, depends in rows_of:
            held = self.status.get(epic_key)
            if held in ('In Review', 'Done') or self.issues[epic_key]['state'] != 'open':
                continue
            why = f'{self.line(key)} {row_name}'
            if partial(self.board, epic_key, why):
                self.place(epic_key, 'In Progress')
            elif held == 'In Progress':
                continue
            elif is_next(self.board, key, epic_key, depends, epics, why):
                self.place(epic_key, 'Ready')
            elif held == 'Ready':
                self.place(epic_key, 'Backlog')

    def park(self) -> None:
        """A Ready epic whose initiative is not In Progress, and was not just returned there, goes Backlog."""
        for epic_key, parent in self.parents.items():
            final = self.wanted.get(parent, self.status.get(parent))
            if final == 'In Progress':
                continue
            if self.wanted.get(epic_key, self.status.get(epic_key)) == 'Ready':
                self.place(epic_key, 'Backlog')

    def shelve(self, key: tuple[str, int]) -> None:
        """The initiative and its open epics return to Backlog."""
        self.place(key, 'Backlog')
        self.shelved.add(key)
        rows_of, _ = self.load(key)
        for _row_name, epic_key, _depends in rows_of:
            issue = self.issues.get(epic_key)
            if issue and issue['state'] == 'open' and self.status.get(epic_key) != 'Done':
                self.place(epic_key, 'Backlog')

    def pulls(self, key: tuple[str, int]) -> list[str]:
        return pending(self.prs, tags(self.issues[key]['title'])[0], self.repos(key))

    def final(self, key: tuple[str, int]) -> str | None:
        return self.wanted.get(key, self.status.get(key))

    def begins(self) -> list[str]:
        """The first Ready epic of each initiative that is In Progress."""
        found = []
        running = [key for key, issue in self.issues.items()
                   if is_initiative(issue) and issue['state'] == 'open' and key in self.status
                   and self.final(key) == 'In Progress']
        for key in sorted(running):
            rows_of, _epics = self.load(key)
            for _row_name, epic_key, _depends in rows_of:
                if self.final(epic_key) == 'Ready':
                    found.append(f'  begin {self.line(epic_key)}')
                    break
        return found

    def ready_names(self, key: tuple[str, int]) -> list[str]:
        rows_of, _epics = self.load(key)
        return [row_name for row_name, epic_key, _depends in rows_of
                if self.wanted.get(epic_key, self.status.get(epic_key)) == 'Ready']

    def order(self, keys: list[tuple[str, int]]) -> None:
        """The initiatives the user maps when the board has no priority and nothing In Progress."""
        found = [key for key in keys if self.status.get(key) not in ('Done', 'In Review')]
        body = ', '.join(self.line(key) for key in sorted(found)) or 'none'
        self.notes.append(f'  order: {body}')

    def place_sets(self, keys: list[tuple[str, int]]) -> None:
        """The highest number runs together. The next number waits in Ready together."""
        labelled = [key for key in keys if rank(self.issues[key]) is not None
                    and self.status.get(key) not in ('Done', 'In Review') and key not in self.shelved]
        if not labelled:
            return
        levels = sorted({rank(self.issues[key]) for key in labelled}, reverse=True)
        active = [key for key in labelled if rank(self.issues[key]) == levels[0]]
        nxt = [key for key in labelled if len(levels) > 1 and rank(self.issues[key]) == levels[1]]
        rest = [key for key in labelled if key not in active and key not in nxt]

        def waiting(key: tuple[str, int]) -> bool:
            return (self.wanted.get(key, self.status.get(key)) == 'In Progress' and bool(self.pulls(key)))

        for key in active:
            self.place(key, 'In Progress')
            self.activate(key)
            if names := self.ready_names(key):
                self.notes.append(f"  next {self.line(key)}: {', '.join(names)}")
        for key in nxt:
            if waiting(key):
                self.notes.append(f"  wait {self.line(key)}: open pull request {', '.join(self.pulls(key))}")
                continue
            self.place(key, 'Ready')
        for key in rest:
            if waiting(key):
                self.notes.append(f"  wait {self.line(key)}: open pull request {', '.join(self.pulls(key))}")
                continue
            if self.wanted.get(key, self.status.get(key)) in ('In Progress', 'Ready'):
                self.shelve(key)

    def decide(self) -> None:
        open_initiatives = [key for key, issue in self.issues.items()
                            if is_initiative(issue) and issue['state'] == 'open' and key in self.status]
        for key in open_initiatives:
            self.load(key)
        for key in open_initiatives:
            if rank(self.issues[key]) is None and self.status.get(key) == 'Ready':
                self.shelve(key)
        labelled = [key for key in open_initiatives if rank(self.issues[key]) is not None]
        if not labelled:
            self.order(open_initiatives)
            self.park()
            return
        in_progress = [key for key in open_initiatives if self.status.get(key) == 'In Progress']
        for key in in_progress:
            if rank(self.issues[key]) is not None or key in self.unplanned:
                continue
            self.notes.append(f'  ask {self.line(key)}: priority')
        for key in in_progress:
            if key not in self.unplanned or rank(self.issues[key]) is not None:
                continue
            if urls := self.pulls(key):
                self.notes.append(f"  wait {self.line(key)}: open pull request {', '.join(urls)}")
            else:
                self.shelve(key)
        self.place_sets(open_initiatives)
        self.park()


def named_keys(specs: list[str], issues: dict, status: dict, flag: str) -> set:
    """Issues named to a repeatable flag, as a number or owner/repo#number."""
    found = set()
    for spec in specs:
        if '#' in spec:
            repo, number = spec.rsplit('#', 1)
            key = (repo, int(number))
            if key not in issues:
                sys.exit(f'--{flag} {spec} is not on the board')
            found.add(key)
            continue
        matches = [key for key in issues if key in status and key[1] == int(spec)]
        if len(matches) != 1:
            sys.exit(f'--{flag} {spec} matches {len(matches)} issues')
        found.add(matches[0])
    return found


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items')
    parser.add_argument('--prs')
    parser.add_argument('--board')
    parser.add_argument('--fields')
    parser.add_argument('--out')
    parser.add_argument('--assignee')
    parser.add_argument('--others', nargs='*', default=[])
    parser.add_argument('--unplanned', action='append', default=[])
    args = parser.parse_args()
    for name in ('items', 'prs', 'board', 'fields', 'out', 'assignee'):
        if not getattr(args, name):
            sys.exit(f'--{name} is required')

    issues = {}
    for path in args.others:
        given = json.loads(Path(path).read_text())
        issues[key_of(given)] = given
    status, item_ids = {}, {}
    for item in pages(args.items):
        content = item.get('content') or {}
        if item.get('content_type') != 'Issue' or not content.get('repository_url'):
            continue
        key = key_of(content)
        issues[key] = content
        status[key] = status_of(item)
        item_ids[key] = item['id']
    home = Counter(key[0] for key in issues).most_common(1)[0][0] if issues else ''
    queue = Queue(issues, status, pull_requests(args.prs), home,
                  named_keys(args.unplanned, issues, status, 'unplanned'))
    queue.decide()

    field = next((item for item in pages(args.fields) if item.get('name') == 'Status'), None)
    if not field:
        sys.exit('the board has no Status field')
    options = {option_name(option['name']): option['id'] for option in field.get('options', [])}
    missing = [name for name in PLACED if name not in options]
    if missing:
        sys.exit(f"the board's Status field lacks {', '.join(missing)}")
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    bodies = {}
    for name in PLACED:
        path = out / f"status-{name.lower().replace(' ', '-')}.json"
        path.write_text(json.dumps({'fields': [{'id': field['id'], 'value': options[name]}]}))
        bodies[name] = path

    print(f"{args.board}: Status field {field['id']}")
    current = todo = 0
    governed = [key for key, issue in issues.items() if key in status and (is_initiative(issue) or key in queue.parents)]
    for key in sorted(governed):
        title = queue.line(key)
        new = queue.wanted.get(key)
        if new is None or new == status.get(key):
            current += 1
            continue
        calls = assignee_calls(key, new, issues[key], args.assignee)
        body = bodies[new]
        print(f"  set {title}: {status.get(key) or 'no Status'} → {new}: "
              f'gh api --method PATCH {args.board}/items/{item_ids[key]} --input {body}')
        for call in calls:
            print(f'  assign {title} ({new}): {call}')
        todo += 1
    for note in queue.notes:
        print(note)
    for note in dict.fromkeys(queue.board.unresolved):
        print(f'  unresolved: {note}')
    open_question = any(note.strip().startswith(('order', 'ask')) for note in queue.notes)
    settled = not todo and not open_question
    print(f'  current: {current}, to do: {todo}' + ('' if not settled else ' (the queue is current)'))
    if settled:
        for line in queue.begins():
            print(line)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as exc:
        sys.exit(str(exc))
