"""Write a theme board's Status field, within one mode's jurisdiction.

Three modes decide a board's Status, and each owns a part of it. Sync mode decides what delivery
settles: Done, In Review, In Progress, and the Ready a task's dependencies earn. Advance mode
decides the queue: which initiatives and epics are Backlog, Ready or In Progress. Deliver mode
decides what a dispatch settles: the In Progress a held row and its epic take, and the In Review a
completed epic takes. Each plans its own statuses and hands them here, which reads the board's
items, writes the option body files, renders the gh call for every change, and refuses a change the
calling mode does not own.

DELIVERY refuses moving an initiative or an epic between Ready and Backlog.
QUEUE refuses In Review, Done and any task.
DISPATCH refuses every Status but In Progress and In Review, a task set In Review, and a removal.

A Status write sends the body file written under the out directory.
"""
import json
import re
import sys
from pathlib import Path

DELIVERY, QUEUE, DISPATCH = 'delivery', 'queue', 'dispatch'
STATUSES = ('Backlog', 'Ready', 'In Progress', 'Done')
PLACED = ('Backlog', 'Ready', 'In Progress')
DECIDED = ('In Review', 'Done')
DISPATCHED = ('In Progress', 'In Review')
OPTIONAL = {'In Review': 'In Progress'}
TASK = re.compile(r'^\[I\d\d:E\d\d:W\d\d\]')

Key = tuple[str, int]


class Jurisdiction(Exception):
    """A Status change the calling mode does not own."""


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


def key_of(issue: dict) -> Key:
    """An issue's identity across repositories: its owner/repo and number."""
    return issue['repository_url'].split('/repos/', 1)[1], issue['number']


def label(key: Key, home: str) -> str:
    return f'#{key[1]}' if key[0] == home else f'{key[0]}#{key[1]}'


def option_name(name) -> str | None:
    """A single-select option's name, which REST gives as a string or as {raw, html}."""
    return name['raw'] if isinstance(name, dict) else name


def status_of(item: dict) -> str | None:
    """A board item's Status, None where it has none."""
    value = next((f.get('value') for f in item.get('fields', []) if f.get('name') == 'Status'), None)
    return option_name(value and value.get('name'))


def board_items(path: str):
    """Each issue on the board: its key, item id, Status and the issue itself."""
    for item in pages(path):
        content = item.get('content') or {}
        if item.get('content_type') == 'Issue' and content.get('repository_url'):
            yield key_of(content), item['id'], status_of(item), content


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


class StatusField:
    """A board's Status field: its id, its options, and the body file each Status is written with."""

    def __init__(self, fields: str, out: str, required: tuple[str, ...]):
        field = next((f for f in pages(fields) if f.get('name') == 'Status'), None)
        if not field:
            sys.exit('the board has no Status field')
        self.id = field['id']
        self.options = {option_name(o['name']): o['id'] for o in field.get('options', [])}
        missing = [name for name in required if name not in self.options]
        if missing:
            sys.exit(f"the board's Status field lacks {', '.join(missing)}")
        directory = Path(out).resolve()
        directory.mkdir(parents=True, exist_ok=True)
        self.bodies = {}
        for name, option in self.options.items():
            path = directory / f"status-{name.lower().replace(' ', '-')}.json"
            path.write_text(json.dumps({'fields': [{'id': self.id, 'value': option}]}))
            self.bodies[name] = path

    def settle(self, wanted: str | None) -> str | None:
        """The Status written for one decided, falling back where the board lacks that option."""
        return OPTIONAL.get(wanted, wanted) if wanted and wanted not in self.options else wanted


class Changes:
    """The calls one mode's Status decisions make, refusing any the mode does not own.

    `suffix` closes the count when nothing is left to do.
    """

    def __init__(self, scope: str, board: str, field: StatusField, login: str, suffix: str):
        self.scope = scope
        self.board = board
        self.field = field
        self.login = login
        self.suffix = suffix
        self.lines: list[str] = []
        self.current = self.todo = 0

    def owns(self, key: Key, issue: dict, held: str | None, wanted: str | None, home: str) -> None:
        """Refuse a change outside this mode's jurisdiction."""
        task = bool(TASK.match(issue.get('title') or ''))
        name = label(key, home)
        if self.scope == QUEUE:
            if wanted in DECIDED:
                raise Jurisdiction(f'{name}: the queue does not set {wanted}')
            if task:
                raise Jurisdiction(f'{name}: the queue does not move a task')
        elif self.scope == DISPATCH:
            if wanted not in DISPATCHED:
                raise Jurisdiction(f'{name}: a dispatch sets {" and ".join(DISPATCHED)}, '
                                   f'not {wanted or "a removal"}')
            if task and wanted == 'In Review':
                raise Jurisdiction(f'{name}: a dispatch does not set a task In Review')
        elif not task and held != wanted and {held, wanted} <= {'Ready', 'Backlog'}:
            raise Jurisdiction(f'{name}: delivery does not move an initiative or an epic '
                               f'between Ready and Backlog')

    def place(self, key: Key, title: str, issue: dict, held: str | None, wanted: str | None,
              item_id: str | None, home: str) -> None:
        """Record one issue's place: a wanted of None removes it, an item_id of None adds it."""
        self.owns(key, issue, held, wanted, home)
        calls = [] if wanted is None else assignee_calls(key, wanted, issue, self.login)
        if wanted is None and item_id:
            self.lines.append(f'  remove {title} (closed, not completed): '
                              f'gh api --method DELETE {self.board}/items/{item_id}')
        elif wanted and not item_id:
            self.lines.append(f'  add {title} ({wanted}): '
                              f"gh api --method POST {self.board}/items -f type=Issue -F id={issue['id']}")
        elif wanted and held != wanted:
            self.lines.append(f"  set {title}: {held or 'no Status'} → {wanted}: "
                              f'gh api --method PATCH {self.board}/items/{item_id} '
                              f'--input {self.field.bodies[wanted]}')
        elif not calls:
            self.current += 1
            return
        for call in calls:
            self.lines.append(f'  assign {title} ({wanted}): {call}')
        self.todo += 1

    def report(self, notes: list[str] = (), unresolved: list[str] = (), asking: bool = False) -> int:
        """Print the header, every call, the mode's notes, what is unresolved, and the count."""
        print(f'{self.board}: Status field {self.id}')
        for line in self.lines:
            print(line)
        for note in notes:
            print(note)
        for note in dict.fromkeys(unresolved):
            print(f'  unresolved: {note}')
        print(f'  current: {self.current}, to do: {self.todo}'
              + ('' if self.todo or asking else self.suffix))
        return 0

    @property
    def id(self) -> str:
        return self.field.id
