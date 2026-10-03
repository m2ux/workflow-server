"""Summarise a project board as a standup: a paragraph for management on what the window
accomplished, then what completed, what is in progress, and what is next.

Usage:
  python3 progress.py --items items.json --prs prs.json [--since 2026-09-25] [--initiative [owner/repo:]I08]
      [--initiatives issue-946.json ...] [--summary summary.txt]

items.json is the board's items with the Status field, as board.py reads them; each item carries
its issue whole, body included, and the script exits when no item carries Status. prs.json holds
pull requests as JSON lines, as sync.py reads them, from as many repositories as the board spans:
a pull request is known by its URL, and cites an issue as board.py reads a citation. --initiatives
gives initiative issues off the board, as `gh api repos/{owner}/{repo}/issues/946` returns them:
they place their epics and describe their work as a board initiative does, and hold no Status.
--summary gives a plain-language paragraph of what the window accomplished, for management; its
whitespace runs collapse to single spaces, so it prints as one line.

The board's Status is the source. Each repository numbers its own initiatives, and an initiative's
epics and task issues may live in other repositories, so an item's place follows the links, the
first link read deciding where more than one does. Repository names match in any case.
  - An epic belongs to the initiative whose Work Breakdown links it, or else to the initiative of
    its number in its own repository.
  - A task issue belongs to the epic whose row links it, or else to the epic of its reference in
    its own repository, or else to the epic whose pull request cites it, and stands for the pull
    requests that cite it.
  - A pull request titled with an epic's reference counts towards that epic when it lives in the
    epic's repository or its initiative's, the epic's own first. A row whose id links a pull
    request reads it by URL, whatever its title or repository.
Sections, lines grouped under the epic they belong to:
  Initiatives  each initiative an item under Completed or In progress works for: its title's name
               and subtitle, the one-line outcome the agent-engineering title states. One neither
               on the board nor given with --initiatives is reported, to be fetched and given.
An item works for the initiative its epic belongs to and for the one its epic's title names in the
epic's repository.
  Completed    items Done whose issue closed in the window: an initiative, an epic, or a task issue
               under its epic. Under each epic, the tasks whose row id links a pull request merged
               in the window, and each other pull request counting towards the epic, merged in the
               window, that cites none of the epic's task issues listed.
  In progress  epics and task issues In Progress or In Review, each epic with its open pull
               requests that cite none of its task issues In Progress or In Review, ready for
               review (In Review) or draft, or else, with no line under it, its next task.
  Next         epics and task issues Ready, ranked by priority label (a larger number first;
               no label after every number), then by reference; the first five, and a count of
               the rest. An epic names its next task.
An epic's next task is its first undelivered task whose dependencies are delivered and whose linked
task issue, if it has one, is on the board and not In Progress or In Review. A task is undelivered
while every pull request its id links is open. A task issue that
belongs to an epic which names its task as next is not listed again.

The window opens at the start of --since in local time, by default a week before today.
--initiative limits the summary to the items working for one initiative; where its number names
initiatives in several repositories it takes the repository too, and where it names none it exits
with the choices. An epic summarised whose Work Breakdown the scripts cannot read, or that has none,
is summarised without its tasks.

Printed: the summary as Slack markup, for pasting into a channel: a *bold* heading with the
--summary paragraph, when given, set off by blank lines, and the board's link beneath, *bold*
sections, each issue or pull request by its bare URL, and a key to the reference letters and marks
last. Each initiative, and each issue or pull request under Completed, In progress and Next, opens
with the mark of its state. An initiative, and a group's heading, is done when its issue is Done,
or closed if off the board; in review when In Review; else in progress. Its lines are done; in
progress, in review or draft; and an epic's next task and each Next item are ready. Unresolved
dependencies, unreadable epics, pull requests without a repository and worked initiatives not given
print to stderr.
"""
import argparse
import json
import re
import sys
from collections import Counter
from collections.abc import Callable
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

from board import Board, Key, PREFIX, PULL_REF, cites, key_of, label, linked_issue, pages, status_of
from format import LINK, cell, epic_name, id_cell, phrase
from sync import PR_REF, PULL_URL, Unreadable, pull_requests

PRIORITY = re.compile(r'^priority: ([1-9]\d*)$')
SHOWN = 5
DONE, WORKING, REVIEW, DRAFT, READY = '✅', '🔄', '👀', '📝', '▶️'
MARK = {'In Progress': WORKING, 'In Review': REVIEW}
ACTIVE = tuple(MARK)
KEY = ['*Key*', 'I=Initiative, E=Epic, W=Work Item',
       f'{DONE} done · {WORKING} in progress · {REVIEW} in review · {DRAFT} draft · {READY} ready']
BOARD_API = re.compile(r'api\.github\.com/(users|orgs)/([^/]+)/projectsV2/(\d+)')
Scope = tuple[str, str]  # an initiative: its repository, lowercased, and its number


def week_before(today: date) -> date:
    return today - timedelta(days=7)


def tags(title: str) -> tuple[str, str, str] | None:
    m = PREFIX.match(title)
    return (m[1], m[2] or '', m[3] or '') if m else None


def reference(i: str, e: str = '', w: str = '') -> str:
    return ':'.join(f'{p}{n}' for p, n in zip('IEW', (i, e, w)) if n)


def subtitle(title: str) -> str:
    """An agent-engineering title's subtitle: the outcome after the name's colon."""
    rest = PREFIX.sub('', title).strip()
    return rest.split(': ', 1)[1].strip() if ': ' in rest else ''


def task_name(r: list[str], header: list[str]) -> str:
    return phrase(LINK.sub(r'\1', cell(header, r, 'Description')))


def pr_title(pr: dict) -> str:
    return PR_REF.sub('', pr['title']).strip()


def board_link(items: list[dict]) -> str:
    """The board's web page, from the API address its items carry."""
    found = next((m for i in items if (m := BOARD_API.search(i.get('project_url') or ''))), None)
    return f'https://github.com/{found[1]}/{found[2]}/projects/{found[3]}' if found else ''


class Summary(Board):
    """A board whose bodies are read as far as they allow: one without a Work Breakdown it can read
    has no rows, and report() notes why for an epic the summary covers."""

    def __init__(self, *args):
        super().__init__(*args)
        self.why: dict[Key, str] = {}

    def table(self, key: Key) -> tuple[list[str], dict[str, list[str]]]:
        if key not in self.tables:
            try:
                super().table(key)
            except Unreadable as unreadable:
                self.tables[key], self.why[key] = ([], {}), str(unreadable)
            else:
                if not self.tables[key][0]:
                    self.why[key] = 'no Work Breakdown'
        return self.tables[key]

    def report(self, key: Key) -> None:
        self.table(key)
        if key in self.why:
            self.unresolved.append(f"{label(key, self.home)} {self.issues[key]['title']}: {self.why[key]}")


class Section:
    """Lines grouped under the epic, or initiative, they belong to. A group is (initiative, epic,
    repository, issue number), the number 0 for a group whose epic is not on the board. Its heading
    carries the mark of its issue's state."""

    def __init__(self, issues: dict[Key, dict], mark: Callable[[Key], str]):
        self.issues = issues
        self.mark = mark
        self.groups: dict[tuple[str, str, str, int], list[str]] = {}

    def group(self, g: tuple[str, str, str, int]) -> list[str]:
        return self.groups.setdefault(g, [])

    def render(self) -> list[str]:
        out = []
        for (i, e, repo, number), lines in sorted(self.groups.items(), key=lambda kv: (*kv[0][:2], kv[0][2].lower())):
            issue = self.issues.get((repo, number))
            head = f"*{reference(i, e)} {epic_name(issue['title'])}*" if issue else f'*{repo} {reference(i, e)}*'
            out.append(f"{self.mark((repo, number))} {head}" + (f" — {issue['html_url']}" if issue else ''))
            out.extend(f'    {line}' for line in lines)
        return out or ['• Nothing']


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True, help="the board's items, fetched with the Status field")
    parser.add_argument('--prs', required=True, help='pull requests as JSON lines')
    parser.add_argument('--since', help='the first day of the window, YYYY-MM-DD')
    parser.add_argument('--initiative', help='only this initiative, e.g. I08 or owner/repo:I08')
    parser.add_argument('--initiatives', nargs='*', default=[], help='initiative issues off the board, as JSON')
    parser.add_argument('--summary', help="a plain-language paragraph of the window's accomplishments")
    args = parser.parse_args()
    since = date.fromisoformat(args.since) if args.since else week_before(date.today())
    after = datetime.combine(since, time()).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    only = only_repo = None
    if args.initiative:
        m = re.fullmatch(r'(?:([^/:\s]+/[^/:\s]+):)?I?(\d{1,2})', args.initiative.strip(), re.IGNORECASE)
        if not m:
            sys.exit(f'--initiative {args.initiative}: not an initiative reference such as I08 or owner/repo:I08')
        only_repo, only = (m[1] or '').lower() or None, m[2].zfill(2)

    items = [i for i in pages(args.items)
             if i.get('content_type') == 'Issue' and (i.get('content') or {}).get('repository_url')]
    if items and not any(f.get('name') == 'Status' for i in items for f in i.get('fields', [])):
        sys.exit("the items carry no Status field; fetch them with fields=<the board's Status field id>")
    issues = {key_of(i['content']): i['content'] for i in items}
    status = {key_of(i['content']): status_of(i) for i in items}
    for path in args.initiatives:
        given = json.loads(Path(path).read_text())
        if (t := tags(given['title'])) and not t[1]:
            issues.setdefault(key_of(given), given)
    prs = pull_requests(args.prs)
    unresolved: list[str] = []
    home = Counter(k[0] for k in issues).most_common(1)[0][0] if issues else ''
    board = Summary(issues, unresolved, home, prs)
    canonical = {(k[0].lower(), k[1]): k for k in issues}

    def on_board(key: Key | None) -> Key | None:
        """The board's key for an issue a link names, whatever case the link writes."""
        return canonical.get((key[0].lower(), key[1])) if key else None

    tagged = {k: t for k, issue in issues.items() if (t := tags(issue['title']))}
    initiatives = {k: t for k, t in tagged.items() if not t[1]}
    epics = {k: t for k, t in tagged.items() if t[1] and not t[2]}
    tasks = {k: t for k, t in tagged.items() if t[2]}

    initiative_issue: dict[Scope, Key] = {}
    scope_of_epic: dict[Key, Scope] = {}
    epic_ids: dict[Scope, dict[str, Key]] = {}
    for k, t in sorted(initiatives.items()):
        scope = (k[0].lower(), t[0])
        initiative_issue[scope] = k
        header, rows = board.table(k)
        for rid, r in rows.items():
            if (ek := on_board(linked_issue(id_cell(header, r)))) in epics:
                scope_of_epic.setdefault(ek, scope)
                epic_ids.setdefault(scope, {})[rid] = ek
    for ek, t in sorted(epics.items()):
        scope = scope_of_epic.setdefault(ek, (ek[0].lower(), t[0]))
        epic_ids.setdefault(scope, {}).setdefault(f'E{t[1]}', ek)

    epic_of: dict[Key, Key] = {}
    for ek in sorted(epics):
        header, rows = board.table(ek)
        for r in rows.values():
            if (tk := on_board(linked_issue(id_cell(header, r)))) in tasks:
                epic_of.setdefault(tk, ek)
    by_reference = {(ek[0].lower(), *t[:2]): ek for ek, t in epics.items()}
    for tk, t in tasks.items():
        if tk not in epic_of and (ek := by_reference.get((tk[0].lower(), *t[:2]))):
            epic_of[tk] = ek
    def epic_for(k: Key) -> Key | None:
        return k if k in epics else epic_of.get(k)

    def group_of(k: Key) -> tuple[str, str, str, int]:
        if k in initiatives:
            return tagged[k][0], '', k[0], k[1]
        ek = epic_for(k)
        return (*epics[ek][:2], ek[0], ek[1]) if ek else (*tagged[k][:2], k[0], 0)

    def scopes_of(k: Key) -> set[Scope]:
        """The initiatives an item works for: the one its epic belongs to, and the one its epic's
        title names in the epic's repository."""
        if k in initiatives:
            return {(k[0].lower(), tagged[k][0])}
        ek = epic_for(k)
        return {scope_of_epic[ek], (ek[0].lower(), epics[ek][0])} if ek else {(k[0].lower(), tagged[k][0])}

    if only:
        scopes = set().union(*(scopes_of(k) for k in tagged))
        chosen = {s for s in scopes if s[1] == only and (only_repo is None or s[0] == only_repo)}
        choices = ', '.join(f'{r}:I{n}' for r, n in sorted(chosen or scopes))
        if not chosen:
            sys.exit(f'--initiative {args.initiative} matches no initiative the board works for: {choices}')
        if len(chosen) > 1:
            sys.exit(f'--initiative I{only} names initiatives in several repositories: {choices}')
        tagged = {k: t for k, t in tagged.items() if scopes_of(k) & chosen}

    # A pull request counts towards the epic of its reference in its own repository, else in the
    # repository of the initiative holding such an epic.
    epics_by_reference: dict[tuple[str, str], list[Key]] = {}
    for ek, t in sorted(epics.items()):
        epics_by_reference.setdefault(t[:2], []).append(ek)
    by_url = {p['html_url']: p for p in prs}
    prs_of: dict[Key, list[dict]] = {}
    for p in by_url.values():
        if not (m := PR_REF.match(p['title'])):
            continue
        if not (found := PULL_REF.search(p.get('html_url') or '')):
            unresolved.append(f"pull request #{p['number']} {p['title']}: no repository in its URL")
            continue
        where = found[1].lower()
        candidates = epics_by_reference.get(m.groups(), [])
        chosen_epic = next((ek for ek in candidates if ek[0].lower() == where), None) or next(
            (ek for ek in candidates if scope_of_epic[ek][0] == where), None)
        if chosen_epic:
            prs_of.setdefault(chosen_epic, []).append(p)
    for ek, named_prs in prs_of.items():
        for tk in tasks:
            if tk not in epic_of and any(cites(p, tk) for p in named_prs):
                epic_of[tk] = ek
    owned: dict[Key, dict[str, Key]] = {}
    for tk, ek in epic_of.items():
        owned.setdefault(ek, {})[f'W{tasks[tk][2]}'] = tk

    def within(stamp: str | None) -> bool:
        return (stamp or '') >= after

    def done(k) -> bool:
        return status.get(k) == 'Done' and within(issues[k].get('closed_at'))

    def next_task(ek: Key, header: list[str], rows: dict[str, list[str]]) -> tuple[set[Key], str] | None:
        """The epic's next task: the task issues that stand for it, and the line naming it."""
        ref = reference(*epics[ek])
        for tid, r in rows.items():
            backing = on_board(linked_issue(id_cell(header, r)))
            if linked_issue(id_cell(header, r)) and (not backing or status.get(backing) in ACTIVE):
                continue
            if not board.row_delivered(ek, tid, ref) and board.met(
                    cell(header, r, 'Depends on'), ek, epic_ids.get(scope_of_epic[ek], {}), f'{ref}:{tid}'):
                return {t for t in (backing, owned.get(ek, {}).get(tid)) if t}, f'{tid} {task_name(r, header)}'
        return None

    def mark(k: Key) -> str:
        """The mark of an initiative's or epic's state: done when Done, or closed if off the board;
        in review when In Review; else in progress."""
        closed = k not in status and issues.get(k, {}).get('state') == 'closed'
        return DONE if status.get(k) == 'Done' or closed else MARK.get(status.get(k), WORKING)

    completed = Section(issues, mark)
    progress = Section(issues, mark)
    ready = []
    worked: set[Scope] = set()
    named_next: set[Key] = set()

    def add(section: Section, k: Key, line: str | None = None) -> None:
        group = section.group(group_of(k))
        if line:
            group.append(line)
        worked.update(scopes_of(k))

    for k in tagged:
        if k in initiatives and done(k):
            add(completed, k)
    for k in tagged:
        if k not in tasks:
            continue
        line = f"W{tasks[k][2]} {epic_name(issues[k]['title'])} — {issues[k]['html_url']}"
        if done(k):
            add(completed, k, f'{DONE} {line}')
        elif status.get(k) in ACTIVE:
            add(progress, k, f'{MARK[status[k]]} {line}')
        elif status.get(k) == 'Ready':
            ready.append((k, ''))
    for ek in sorted((k for k in tagged if k in epics), key=group_of):
        board.report(ek)
        header, rows = board.table(ek)
        named = prs_of.get(ek, [])
        task_issues = {n for r in rows.values() if (n := on_board(linked_issue(id_cell(header, r))))} | set(owned.get(ek, {}).values())

        def listed(pr: dict, shown) -> bool:
            return any(shown(n) and cites(pr, n) for n in task_issues)

        linked = set()
        for tid, r in rows.items():
            for found in LINK.finditer(id_cell(header, r)):
                pr = by_url.get(found[2]) if PULL_URL.search(found[2]) else None
                if not pr:
                    continue
                linked.add(pr['html_url'])
                if within(pr.get('merged_at')):
                    add(completed, ek, f"{DONE} {tid} {task_name(r, header)} — {pr['html_url']}")
        for pr in named:
            if within(pr.get('merged_at')) and pr['html_url'] not in linked and not listed(pr, done):
                add(completed, ek, f"{DONE} {pr_title(pr)} — {pr['html_url']}")
        if done(ek):
            add(completed, ek)

        if status.get(ek) in ACTIVE:
            add(progress, ek)
            group = progress.group(group_of(ek))
            for pr in named:
                if pr.get('state') == 'open' and not listed(pr, lambda n: status.get(n) in ACTIVE):
                    state = DRAFT if pr.get('draft') else REVIEW
                    group.append(f"{state} {pr_title(pr)} — {pr['html_url']}")
            if not group and (task := next_task(ek, header, rows)):
                named_next |= task[0]
                group.append(f'{READY} {task[1]}')
        elif status.get(ek) == 'Ready':
            task = next_task(ek, header, rows)
            if task:
                named_next |= task[0]
            ready.append((ek, f'next {task[1]}' if task else ''))

    context = []
    for scope in sorted(worked, key=lambda s: (s[1], s[0])):
        if not (k := initiative_issue.get(scope)):
            unresolved.append(f'I{scope[1]} in {scope[0]}: its initiative is not on the board; '
                              'give its issue with --initiatives')
            continue
        title = issues[k]['title']
        context.append(f"{mark(k)} *{reference(initiatives[k][0])} {epic_name(title)}:* "
                       f"{subtitle(title)} — {issues[k]['html_url']}")

    def rank(entry: tuple[Key, str]) -> tuple:
        k = entry[0]
        levels = [int(matched.group(1)) for l in issues[k].get('labels', [])
                  if (matched := PRIORITY.fullmatch(l['name']))]
        return (-max(levels) if levels else 0), tagged[k], k[0].lower()

    ready = sorted((e for e in ready if e[0] not in named_next), key=rank)
    upcoming = [f"{READY} *{reference(*tagged[k])} {epic_name(issues[k]['title'])}*" + (f', {task}' if task else '')
                + f" — {issues[k]['html_url']}" for k, task in ready[:SHOWN]]
    if len(ready) > SHOWN:
        upcoming.append(f'…and {len(ready) - SHOWN} more ready')

    scope_label = f'{only_repo}:I{only}' if only_repo else f'I{only}' if only else ''
    heading = f"*Progress since {since:%a} {since.day} {since:%b}*" + (f' — {scope_label}' if scope_label else '')
    paragraph = ' '.join(Path(args.summary).read_text().split()) if args.summary else ''
    link = board_link(items)
    print('\n'.join([heading, *(['', paragraph, ''] if paragraph else []), *([f'Board: {link}'] if link else []),
                     '', '*Initiatives*', *(context or ['• Nothing']),
                     '', '*Completed*', *completed.render(),
                     '', '*In progress*', *progress.render(),
                     '', '*Next*', *(upcoming or ['• Nothing']),
                     '', *KEY]))
    for note in dict.fromkeys(unresolved):
        print(f'unresolved: {note}', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
