"""Decide which initiatives and epics on a theme board are Ready or In Progress.

Usage:
  python3 advance.py --items items.json --prs prs.json --board users/{owner}/projectsV2/9
      --fields fields.json --out board/ --assignee m2ux [--others issue-750.json ...]

items.json is the board's items with the Status field, as board.py reads them. prs.json is as
sync.py reads it. fields.json is the board's fields. An issue the rows depend on that is not on
the board is given with --others.

One ordinary initiative, and one labelled bug or tech-debt, may be In Progress per repository.
The highest-priority open initiative of that kind is the choice. Priority, highest first, is
priority: highest, high, medium, low, lowest, and a tie breaks toward the lower initiative number.
An initiative In Review is not a choice and does not fill the slot. When none of that kind is In
Progress, the choice moves to Ready and every other Ready initiative of that kind moves to
Backlog. When a lower one is In Progress and a pull request of it is open, it stays and the swap
waits. When no pull request of it is open, it moves to Ready and the choice moves to In Progress.

A partly completed epic has a delivered task row and is not closed as completed. On the initiative
that is In Progress, a partly completed epic is In Progress, and an epic that is next moves to
Ready: its Depends on cell is delivered and its Open Questions section is empty. Any other Ready
epic of it moves to Backlog. On an initiative this run moves from In Progress to Ready, a partly
completed epic stays Ready, and an epic that was In Progress, In Review or Ready moves to Ready.
A Ready epic of any other initiative moves to Backlog.

Nothing moves while an open initiative has no priority label. Printed: the gh call for each Status
and assignee change, a wait line for a swap held by an open pull request, and a next line naming
the epics a Ready initiative would start with.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

from board import Board, assignee_calls, key_of, label, linked_issue, open_questions, option_name, pages, rows, status_of
from format import cell, id_cell, row_id
from progress import PRIORITY
from sync import Unreadable, pull_requests

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PENDING = re.compile(r'^\[I(\d\d)(?::E\d\d)?\]')
PULL_HOME = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
DEBT = {'bug', 'tech-debt'}
PLACED = ('Backlog', 'Ready', 'In Progress')


def label_names(issue: dict) -> set[str]:
    return {item['name'] for item in issue.get('labels') or []}


def rank(issue: dict) -> int | None:
    found = [PRIORITY[name] for name in label_names(issue) if name in PRIORITY]
    return min(found) if found else None


def kind(issue: dict) -> str:
    return 'debt' if label_names(issue) & DEBT else 'ordinary'


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
        matched = PENDING.match(pr.get('title') or '')
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
    def __init__(self, issues: dict, status: dict, prs: list[dict], home: str):
        self.issues = issues
        self.status = status
        self.prs = prs
        self.home = home
        self.board = Board(issues, [], home, prs)
        self.wanted: dict = {}
        self.notes: list[str] = []
        self.demoted: set = set()
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

    def demote(self, key: tuple[str, int]) -> None:
        """The initiative returns to Ready, and the epics that had left Backlog return with it."""
        self.place(key, 'Ready')
        self.demoted.add(key)
        rows_of, _ = self.load(key)
        for row_name, epic_key, _ in rows_of:
            issue = self.issues[epic_key]
            if issue['state'] != 'open' or self.status.get(epic_key) == 'Done':
                continue
            why = f'{self.line(key)} {row_name}'
            if partial(self.board, epic_key, why) or self.status.get(epic_key) in ('In Progress', 'In Review', 'Ready'):
                self.place(epic_key, 'Ready')

    def coming(self, key: tuple[str, int]) -> None:
        """The epics a Ready initiative would start, named and not moved."""
        rows_of, epics = self.load(key)
        nxt = [row_name for row_name, epic_key, depends in rows_of
               if not partial(self.board, epic_key, f'{self.line(key)} {row_name}')
               and is_next(self.board, key, epic_key, depends, epics, f'{self.line(key)} {row_name}')]
        if nxt:
            self.notes.append(f"  next {self.line(key)}: {', '.join(nxt)}")

    def park(self) -> None:
        """A Ready epic whose initiative is not In Progress, and was not just returned there, goes Backlog."""
        for epic_key, parent in self.parents.items():
            if parent in self.demoted:
                continue
            final = self.wanted.get(parent, self.status.get(parent))
            if final == 'In Progress':
                continue
            if self.wanted.get(epic_key, self.status.get(epic_key)) == 'Ready':
                self.place(epic_key, 'Backlog')

    def release(self, keys: list[tuple[str, int]], keep: set) -> None:
        """Every Ready initiative in the group except those kept goes back to Backlog."""
        for key in keys:
            if key in keep:
                continue
            if self.wanted.get(key, self.status.get(key)) == 'Ready':
                self.place(key, 'Backlog')

    def group(self, keys: list[tuple[str, int]]) -> None:
        keys.sort(key=lambda key: (rank(self.issues[key]), int(tags(self.issues[key]['title'])[0]), key[1]))
        choice = keys[0]
        incumbents = [key for key in keys if self.status.get(key) == 'In Progress' and key != choice]
        held = {key: pending(self.prs, tags(self.issues[key]['title'])[0], self.repos(key)) for key in incumbents}
        blockers = [key for key, urls in held.items() if urls]
        if blockers:
            for key in blockers:
                self.notes.append(f"  wait {self.line(key)}: open pull request {', '.join(held[key])}")
            for key in incumbents:
                if key not in blockers:
                    self.demote(key)
            if self.status.get(choice) == 'In Progress':
                self.activate(choice)
            self.release(keys, set(blockers) | self.demoted | ({choice} if self.status.get(choice) == 'In Progress' else set()))
            return
        if incumbents:
            for key in incumbents:
                self.demote(key)
            self.place(choice, 'In Progress')
            self.activate(choice)
            self.release(keys, self.demoted | {choice})
            return
        if self.status.get(choice) == 'In Progress':
            self.activate(choice)
            self.release(keys, {choice})
            return
        self.place(choice, 'Ready')
        self.coming(choice)
        self.release(keys, {choice})

    def decide(self) -> None:
        open_initiatives = [key for key, issue in self.issues.items()
                            if is_initiative(issue) and issue['state'] == 'open' and key in self.status]
        missing = [key for key in open_initiatives if rank(self.issues[key]) is None]
        if missing:
            for key in sorted(missing):
                self.notes.append(f'  hold {self.line(key)}: no priority')
            self.notes.append('  blocked: priorities')
            return
        groups: dict[tuple[str, str], list] = {}
        for key in open_initiatives:
            if self.status.get(key) in ('Done', 'In Review'):
                continue
            groups.setdefault((key[0].lower(), kind(self.issues[key])), []).append(key)
        for key in open_initiatives:
            self.load(key)
        for keys in groups.values():
            self.group(keys)
        self.park()
        for key, issue in self.issues.items():
            if is_initiative(issue) and self.wanted.get(key, self.status.get(key)) == 'Ready':
                if any(note.startswith(f'  next {self.line(key)}:') for note in self.notes):
                    continue
                self.coming(key)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items')
    parser.add_argument('--prs')
    parser.add_argument('--board')
    parser.add_argument('--fields')
    parser.add_argument('--out')
    parser.add_argument('--assignee')
    parser.add_argument('--others', nargs='*', default=[])
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
    queue = Queue(issues, status, pull_requests(args.prs), home)
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
    blocked = any(note.strip() == 'blocked: priorities' for note in queue.notes)
    for key in sorted(governed):
        title = queue.line(key)
        new = queue.wanted.get(key)
        if blocked or new is None or new == status.get(key):
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
    print(f'  current: {current}, to do: {todo}' + ('' if todo else ' (the queue is current)'))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as exc:
        sys.exit(str(exc))
