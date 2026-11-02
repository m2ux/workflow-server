"""Decide which initiatives, epics and hot-fixes on a theme board are Ready or In Progress.

Usage:
  python3 board-queue.py --items items.json --prs prs.json --board users/{owner}/projectsV2/9
      --fields fields.json --out board/ --assignee m2ux [--others issue-750.json ...]
      [--unplanned 12 ...]

items.json is the board's items with the Status field, as board.py reads them. prs.json is as
sync.py reads it. fields.json is the board's fields. An issue the rows depend on that is not on
the board is given with --others.

--unplanned names an initiative the user left with no priority.

The moves and printed lines are the Fields of artifacts/board-queue.md, and each line is one row of
its Report Lines. Activity is read through board.py. The calls are rendered by statuses.py within
the QUEUE jurisdiction. Printed: the gh call for each Status and assignee change, each report line,
and each unresolved issue reference. It exits 1 where an unresolvable dependency stopped it placing
a row.

An open hot-fix, titled [F00], is Backlog while format.py's check of its title, labels and body
leaves anything to apply or decide. Otherwise it is Ready outside every priority set, keeps In
Progress once it holds it, and leaves In Review for In Progress; nothing waits on it and it waits on
nothing. A closed hot-fix is Done when closed as completed, and is removed from the board otherwise.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

from board import READY_UNDER, Board, Resolution, criteria_met, delivers, linked_issue, rows
from format import cell, id_cell, row_id
from hotfix import OFF_BOARD, board_status, is_hotfix
from statuses import PLACED, QUEUE, Changes, Jurisdiction, StatusField, board_items, key_of, label
from sync import Unreadable, pull_requests

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
RANK = re.compile(r'^priority: ([1-9]\d*)$')
PULL_HOME = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')


def label_names(issue: dict) -> set[str]:
    return {item['name'] for item in issue.get('labels') or []}


def rank(issue: dict) -> int | None:
    """The issue's priority. A larger number is higher. Two labels count as the larger."""
    found = [int(matched.group(1)) for name in label_names(issue) if (matched := RANK.fullmatch(name))]
    return max(found) if found else None


def tags(title: str) -> tuple[str, str, str] | None:
    matched = PREFIX.match(title)
    return (matched[1], matched[2] or '', matched[3] or '') if matched else None


def is_initiative(issue: dict) -> bool:
    parsed = tags(issue['title'])
    return bool(parsed) and not parsed[1]


def pending(prs: list[dict], tag: str, epics: set[str], repos: set[str]) -> list[str]:
    """Open delivery pull requests naming an epic the initiative lists, by its Eyy number, in its
    repository or an epic's."""
    found = []
    for pr in prs:
        if not any(delivers(pr, tag, epic) for epic in epics):
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


def handed_off(issue: dict, held: str | None) -> bool:
    """Whether an epic is past the queue: In Review, Done, closed, or open with every criterion
    ticked, which board.py places In Review or holds In Progress until its agent review passes."""
    return held in ('In Review', 'Done') or issue['state'] != 'open' or criteria_met(issue)


def active(board: Board, key: tuple[str, int], why: str) -> bool:
    """Whether an open epic has work under way, as Board.active reads it."""
    try:
        return board.active(key)
    except Unreadable as exc:
        board.unresolved.append(f'{why}: {exc}')
        return False


class Queue:
    def __init__(self, issues: dict, status: dict, prs: list[dict], home: str, unplanned: set):
        self.issues = issues
        self.status = status
        self.prs = prs
        self.home = home
        self.unplanned = unplanned
        self.shelved: set = set()
        self.waiting: set = set()
        self.board = Board(issues, [], home, prs)
        self.wanted: dict = {}
        self.unresolvable: list[str] = []
        self.removed: set = set()
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
        """Place one Ready or In Progress initiative's epics, as Epic Status in
        artifacts/board-queue.md states, and add its next line."""
        rows_of, epics = self.load(key)
        candidates, running = [], []
        for row_name, epic_key, depends in rows_of:
            if handed_off(self.issues[epic_key], held := self.status.get(epic_key)):
                continue
            why = f'{self.line(key)} {row_name}'
            if active(self.board, epic_key, why):
                self.place(epic_key, 'In Progress')
                running.append(epic_key)
            elif (answer := self.board.startable(key, epic_key, depends, epics, why)) is Resolution.MET:
                candidates.append(epic_key)
            elif answer is Resolution.UNRESOLVABLE:
                self.unresolvable.append(why)
                continue
            elif held in ('Ready', 'In Progress'):
                self.place(epic_key, 'Backlog')
        if key in self.waiting:
            return
        ranked = {epic_key: rank(self.issues[epic_key]) for epic_key in (*candidates, *running)}
        top = max((found for found in ranked.values() if found is not None), default=None)
        for epic_key in candidates:
            self.place(epic_key, 'Ready' if ranked[epic_key] is not None and ranked[epic_key] == top
                       else 'Backlog')
        if names := self.ready_names(key):
            self.notes.append(f"  next {self.line(key)}: {', '.join(names)}")

    def park(self) -> None:
        """A Ready epic whose initiative ends neither Ready nor In Progress goes Backlog. Of an
        initiative waiting on its epics' work, an epic not handed off is In Progress while active and
        Backlog otherwise."""
        for key, (rows_of, _epics) in self.children.items():
            waiting = key in self.waiting
            if not waiting and self.wanted.get(key, self.status.get(key)) in READY_UNDER:
                continue
            for row_name, epic_key, _depends in rows_of:
                held = self.wanted.get(epic_key, self.status.get(epic_key))
                if handed_off(self.issues[epic_key], held):
                    continue
                if waiting:
                    busy = active(self.board, epic_key, f'{self.line(key)} {row_name}')
                    self.place(epic_key, 'In Progress' if busy else 'Backlog')
                elif held == 'Ready':
                    self.place(epic_key, 'Backlog')

    def shelve(self, key: tuple[str, int]) -> None:
        """The initiative and its unstarted epics return to Backlog, and a closed epic keeps the
        Status it holds. An epic with work under way or In Review is named on a reconcile line,
        and the initiative and its epics stay where they stand until the user reconciles it."""
        self.shelved.add(key)
        rows_of, _ = self.load(key)
        unstarted, engaged = [], []
        for row_name, epic_key, _depends in rows_of:
            held = self.status.get(epic_key)
            if self.issues[epic_key]['state'] != 'open' or held == 'Done':
                continue
            if held == 'In Review':
                engaged.append(f'{row_name} (In Review)')
            elif criteria_met(self.issues[epic_key]):
                engaged.append(f'{row_name} (awaiting review)')
            elif active(self.board, epic_key, f'{self.line(key)} {row_name}'):
                engaged.append(f'{row_name} (work under way)')
            else:
                unstarted.append(epic_key)
        if engaged:
            self.notes.append(f"  reconcile {self.line(key)}: {', '.join(engaged)}")
            return
        self.place(key, 'Backlog')
        for epic_key in unstarted:
            self.place(epic_key, 'Backlog')

    def pulls(self, key: tuple[str, int]) -> list[str]:
        listed = {row_name.split(':')[0][1:] for row_name, _epic, _depends
                  in epic_rows(self.board, key, self.line(key))}
        return pending(self.prs, tags(self.issues[key]['title'])[0], listed, self.repos(key))

    def holding(self, key: tuple[str, int]) -> list[str]:
        """What holds an initiative In Progress, as board.py raises it: the open delivery pull requests
        naming an epic it lists, and each open listed epic In Review, awaiting its agent review, or
        holding a session's row with no such pull request."""
        found = []
        if urls := self.pulls(key):
            found.append(f"open pull request {', '.join(urls)}")
        tag = tags(self.issues[key]['title'])[0]
        rows_of, _ = self.load(key)
        for row_name, epic_key, _depends in rows_of:
            if self.issues[epic_key]['state'] != 'open':
                continue
            epic = row_name.split(':')[0][1:]
            if self.status.get(epic_key) == 'In Review':
                found.append(f'{row_name} In Review')
            elif criteria_met(self.issues[epic_key]):
                found.append(f'{row_name} awaiting review')
            elif (not pending(self.prs, tag, {epic}, self.repos(key))
                  and active(self.board, epic_key, f'{self.line(key)} {row_name}')):
                found.append(f'{row_name} held by a session')
        return found

    def wait(self, key: tuple[str, int]) -> bool:
        """Whether an initiative In Progress waits on what holds it, with a wait line naming it."""
        if self.wanted.get(key, self.status.get(key)) != 'In Progress' or not (found := self.holding(key)):
            return False
        self.waiting.add(key)
        self.notes.append(f"  wait {self.line(key)}: {'; '.join(found)}")
        return True

    def ready_names(self, key: tuple[str, int]) -> list[str]:
        rows_of, _epics = self.load(key)
        return [row_name for row_name, epic_key, _depends in rows_of
                if self.wanted.get(epic_key, self.status.get(epic_key)) == 'Ready']

    def unranked(self) -> None:
        """Add the rank lines, as Report Lines in artifacts/board-queue.md states."""
        for key, (rows_of, _epics) in sorted(self.children.items()):
            names = [row_name for row_name, epic_key, _depends in rows_of
                     if not handed_off(self.issues[epic_key], self.status.get(epic_key))
                     and rank(self.issues[epic_key]) is None]
            if names:
                self.notes.append(f"  rank {self.line(key)}: {', '.join(names)}")

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

        for key in active:
            self.place(key, 'In Progress')
            self.activate(key)
        for key in nxt:
            if not self.wait(key):
                self.place(key, 'Ready')
            self.activate(key)
        for key in rest:
            if self.wait(key):
                continue
            if self.wanted.get(key, self.status.get(key)) in ('In Progress', 'Ready'):
                self.shelve(key)

    def hotfixes(self) -> None:
        """Place each hot-fix on the board where hotfix.board_status puts it."""
        for key, issue in self.issues.items():
            if not is_hotfix(issue) or key not in self.status:
                continue
            wanted = board_status(issue, self.status.get(key))
            if wanted == OFF_BOARD:
                self.removed.add(key)
            else:
                self.place(key, wanted)

    def decide(self) -> None:
        self.hotfixes()
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
            self.unranked()
            return
        in_progress = [key for key in open_initiatives if self.status.get(key) == 'In Progress']
        for key in in_progress:
            if rank(self.issues[key]) is not None or key in self.unplanned:
                continue
            self.notes.append(f'  ask {self.line(key)}: priority')
        for key in in_progress:
            if key not in self.unplanned or rank(self.issues[key]) is not None:
                continue
            if not self.wait(key):
                self.shelve(key)
        self.place_sets(open_initiatives)
        self.park()
        self.unranked()


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
    for key, item_id, held, content in board_items(args.items):
        issues[key] = content
        status[key] = held
        item_ids[key] = item_id
    home = Counter(key[0] for key in issues).most_common(1)[0][0] if issues else ''
    queue = Queue(issues, status, pull_requests(args.prs), home,
                  named_keys(args.unplanned, issues, status, 'unplanned'))
    queue.decide()

    field = StatusField(args.fields, args.out, PLACED)
    changes = Changes(QUEUE, args.board, field, args.assignee, ' (the queue is current)')
    governed = [key for key, issue in issues.items()
                if key in status and (is_initiative(issue) or is_hotfix(issue) or key in queue.parents)]
    for key in sorted(governed):
        if key in queue.removed:
            changes.place(key, queue.line(key), issues[key], status.get(key), None, item_ids[key], home)
            continue
        new = queue.wanted.get(key)
        if new is None:
            changes.current += 1
            continue
        changes.place(key, queue.line(key), issues[key], status.get(key), new, item_ids[key], home)
    asking = any(note.strip().startswith(('order', 'ask')) for note in queue.notes)
    printed = changes.report(notes=queue.notes, unresolved=queue.board.unresolved,
                             asking=asking or bool(queue.unresolvable))
    return 1 if queue.unresolvable else printed


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (Unreadable, Jurisdiction) as refused:
        sys.exit(str(refused))
