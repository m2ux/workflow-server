"""Summarise a project board as a standup: what completed, what is in progress, and what is next.

Usage:
  python3 progress.py --items items.json --prs prs.json [--since 2026-09-25] [--initiative [owner/repo:]I08]

items.json is the board's items with the Status field, as board.py reads them; each item carries
its issue whole, body included, and the script exits when no item carries Status. prs.json holds
pull requests as JSON lines, as update.py reads them, from as many repositories as the board spans:
a pull request is known by its URL, and cites an issue as board.py reads a citation.

The board's Status is the source. Each repository numbers its own initiatives, and an initiative's
epics and task issues may live in other repositories, so an item's place follows the links:
  - an epic belongs to the initiative whose Work Breakdown links it, or else to the initiative of
    its number in its own repository;
  - a task issue belongs to the epic whose row links it, or else to the epic of its reference in
    its own repository, and stands for the pull requests that cite it;
  - a pull request titled with an epic's reference counts towards that epic when it lives in the
    epic's repository or its initiative's, the epic's own first.
Lines group under the epic they belong to:
  Completed    items Done whose issue closed in the window: an initiative, an epic, or a task issue
               under its epic. Under each epic, the tasks whose row id links a pull request merged
               in the window, and each other pull request counting towards the epic, merged in the
               window, that cites none of the epic's task issues listed.
  In progress  epics and task issues In Progress or In Review, each epic with its open pull
               requests that cite none of its task issues In Progress or In Review, ready for
               review (In Review) or draft, or else, with no line under it, its next task.
  Next         epics and task issues Ready, ranked by priority label (highest, high, medium or
               none, low, lowest), then by reference; the first five, and a count of the rest. An
               epic names its next task.
An epic's next task is its first undelivered task whose dependencies are delivered and whose linked
task issue, if it has one, is on the board and not In Progress or In Review. A task issue an epic
names as its next task is not listed again.

The window opens at the start of --since in local time, by default a week before today.
--initiative limits the summary to one initiative; where its number names initiatives in several
repositories, it takes the repository too. An epic whose Work Breakdown the scripts cannot read, or
that has none, is summarised without its tasks.

Printed: the summary as Slack markup, for pasting into a channel: a *bold* heading with the board's
link beneath, *bold* sections, bullets, and each issue or pull request by its bare URL. Unresolved
dependencies, unreadable epics and pull requests without a repository print to stderr.
"""
import argparse
import re
import sys
from collections import Counter
from datetime import date, datetime, time, timedelta, timezone

from board import Board, Key, PREFIX, PULL_REF, cites, key_of, label, linked_issue, pages, rows, status_of
from format import LINK, cell, epic_name, phrase
from update import PR_REF, PULL_URL, Unreadable, pull_requests

PRIORITY = {'priority: highest': 0, 'priority: high': 1, 'priority: medium': 2,
            'priority: low': 4, 'priority: lowest': 5}
UNRANKED = 2
SHOWN = 5
ACTIVE = ('In Progress', 'In Review')
BOARD_API = re.compile(r'api\.github\.com/(users|orgs)/([^/]+)/projectsV2/(\d+)')


def week_before(today: date) -> date:
    return today - timedelta(days=7)


def tags(title: str) -> tuple[str, str, str] | None:
    m = PREFIX.match(title)
    return (m[1], m[2] or '', m[3] or '') if m else None


def reference(i: str, e: str = '', w: str = '') -> str:
    return ':'.join(f'{p}{n}' for p, n in zip('IEW', (i, e, w)) if n)


def task_name(r: list[str], header: list[str]) -> str:
    return phrase(LINK.sub(r'\1', cell(header, r, 'Description')))


def pr_title(pr: dict) -> str:
    return PR_REF.sub('', pr['title']).strip()


def links(issue: dict) -> list[Key]:
    """The issues a body's Work Breakdown row ids link, read without reporting a body it cannot read."""
    try:
        return [k for r in rows(issue)[1] if (k := linked_issue(r[0]))]
    except Unreadable:
        return []


def board_link(items: list[dict]) -> str:
    """The board's web page, from the API address its items carry."""
    found = next((m for i in items if (m := BOARD_API.search(i.get('project_url') or ''))), None)
    return f'https://github.com/{found[1]}/{found[2]}/projects/{found[3]}' if found else ''


class Summary(Board):
    """A board whose epics are read as far as their bodies allow: an epic without a Work Breakdown
    it can read has no rows, and is reported unresolved."""

    def table(self, key: Key) -> tuple[list[str], dict[str, list[str]]]:
        if key in self.tables:
            return self.tables[key]
        try:
            header, rows = super().table(key)
        except Unreadable as unreadable:
            header, rows, why = [], {}, str(unreadable)
        else:
            why = '' if header else 'no Work Breakdown'
        if why:
            self.unresolved.append(f"{label(key, self.home)} {self.issues[key]['title']}: {why}")
        self.tables[key] = header, rows
        return header, rows


class Section:
    """Lines grouped under the epic, or initiative, they belong to. A group is (initiative, epic,
    repository, issue number), the number 0 for a group whose epic is not on the board."""

    def __init__(self, issues: dict[Key, dict]):
        self.issues = issues
        self.groups: dict[tuple[str, str, str, int], dict] = {}

    def group(self, g: tuple[str, str, str, int]) -> dict:
        return self.groups.setdefault(g, {'note': '', 'lines': []})

    def render(self) -> list[str]:
        out = []
        for (i, e, repo, number), g in sorted(self.groups.items()):
            issue = self.issues.get((repo, number))
            head = f"*{reference(i, e)} {epic_name(issue['title'])}*" if issue else f'*{repo} {reference(i, e)}*'
            note = f", {g['note']}" if g['note'] else ''
            out.append(f"• {head}{note}" + (f" — {issue['html_url']}" if issue else ''))
            out.extend(f'    ◦ {line}' for line in g['lines'])
        return out or ['• Nothing']


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True, help="the board's items, fetched with the Status field")
    parser.add_argument('--prs', required=True, help='pull requests as JSON lines')
    parser.add_argument('--since', help='the first day of the window, YYYY-MM-DD')
    parser.add_argument('--initiative', help='only this initiative, e.g. I08 or owner/repo:I08')
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
    unresolved: list[str] = []
    home = Counter(k[0] for k in issues).most_common(1)[0][0] if issues else ''
    board = Summary(issues, unresolved, home)

    def repo(k: Key) -> str:
        return k[0].lower()

    tagged = {k: t for k, issue in issues.items() if (t := tags(issue['title']))}
    initiatives = {k: t for k, t in tagged.items() if not t[1]}
    epics = {k: t for k, t in tagged.items() if t[1] and not t[2]}
    tasks = {k: t for k, t in tagged.items() if t[2]}

    # An epic's initiative: the one whose Work Breakdown links it, else its number's in its repository.
    initiative_of: dict[Key, tuple[str, str]] = {}
    epic_ids: dict[tuple[str, str], dict[str, Key]] = {}
    for k, t in initiatives.items():
        for ek in links(issues[k]):
            if ek in epics:
                initiative_of[ek] = (repo(k), t[0])
                epic_ids.setdefault((repo(k), t[0]), {})[f'E{epics[ek][1]}'] = ek
    for ek, t in epics.items():
        scope = initiative_of.setdefault(ek, (repo(ek), t[0]))
        epic_ids.setdefault(scope, {}).setdefault(f'E{t[1]}', ek)

    # A task issue's epic: the one whose row links it, else its reference's in its repository.
    by_reference = {(repo(ek), t[0], t[1]): ek for ek, t in epics.items()}
    epic_of: dict[Key, Key] = {}
    for ek in epics:
        for tk in links(issues[ek]):
            if tk in tasks:
                epic_of.setdefault(tk, ek)
    for tk, t in tasks.items():
        if tk not in epic_of and (ek := by_reference.get((repo(tk), t[0], t[1]))):
            epic_of[tk] = ek

    def group_of(k: Key) -> tuple[str, str, str, int]:
        t = tagged[k]
        if k in initiatives:
            return t[0], '', repo(k), k[1]
        ek = k if k in epics else epic_of.get(k)
        return (t[0], t[1], repo(ek), ek[1]) if ek else (t[0], t[1], repo(k), 0)

    def scope_of(k: Key) -> tuple[str, str]:
        if k in initiatives:
            return repo(k), tagged[k][0]
        ek = k if k in epics else epic_of.get(k)
        return initiative_of[ek] if ek else (repo(k), tagged[k][0])

    if only:
        scopes = {scope_of(k) for k, t in tagged.items() if t[0] == only}
        if only_repo is None and len({s[0] for s in scopes}) > 1:
            sys.exit(f'--initiative I{only} names initiatives in several repositories: '
                     + ', '.join(f'{r}:I{only}' for r, _ in sorted(scopes)))
        tagged = {k: t for k, t in tagged.items() if scope_of(k) in scopes
                  and (only_repo is None or scope_of(k)[0] == only_repo)}

    # A pull request counts towards the epic of its reference in its own repository, else in the
    # repository of the initiative that holds such an epic.
    prs_of: dict[Key, list[dict]] = {}
    for p in {p['html_url']: p for p in pull_requests(args.prs)}.values():
        if not (m := PR_REF.match(p['title'])):
            continue
        if not (found := PULL_REF.search(p.get('html_url') or '')):
            unresolved.append(f"pull request #{p['number']} {p['title']}: no repository in its URL")
            continue
        where = found[1].lower()
        candidates = [ek for ek, t in epics.items() if t[:2] == m.groups()]
        chosen = next((ek for ek in candidates if repo(ek) == where), None) or next(
            (ek for ek in candidates if initiative_of[ek][0] == where), None)
        if chosen:
            prs_of.setdefault(chosen, []).append(p)
    by_url = {p['html_url']: p for ps in prs_of.values() for p in ps}

    def within(stamp: str | None) -> bool:
        return (stamp or '') >= after

    def done(k) -> bool:
        return status.get(k) == 'Done' and within(issues[k].get('closed_at'))

    def next_task(ek: Key, header: list[str], rows: dict[str, list[str]]) -> tuple[Key | None, str] | None:
        """The epic's next task: its linked task issue, if any, and the line naming it."""
        ref = reference(*tagged[ek])
        for tid, r in rows.items():
            backing = linked_issue(r[0])
            if backing and (backing not in issues or status.get(backing) in ACTIVE):
                continue
            if not board.row_delivered(ek, tid, ref) and board.met(
                    cell(header, r, 'Depends on'), ek, epic_ids.get(initiative_of[ek], {}), f'{ref}:{tid}'):
                return backing, f'{tid} {task_name(r, header)}'
        return None

    completed, progress, ready = Section(issues), Section(issues), []
    named_next: set[Key] = set()
    for k, t in tagged.items():
        if k in initiatives and done(k):
            completed.group(group_of(k))['note'] = 'initiative complete'
    for k, t in tagged.items():
        if k not in tasks:
            continue
        line = f"W{t[2]} {epic_name(issues[k]['title'])} — {issues[k]['html_url']}"
        if done(k):
            completed.group(group_of(k))['lines'].append(line)
        elif status.get(k) in ACTIVE:
            progress.group(group_of(k))['lines'].append(f"{status[k]}: {line}")
        elif status.get(k) == 'Ready':
            ready.append((k, ''))
    for ek in sorted((k for k in tagged if k in epics), key=group_of):
        g = group_of(ek)
        header, rows = board.table(ek)
        named = prs_of.get(ek, [])
        task_issues = {n for r in rows.values() if (n := linked_issue(r[0]))}
        task_issues |= {tk for tk, e in epic_of.items() if e == ek}

        def listed(pr: dict, shown) -> bool:
            return any(shown(n) and cites(pr, n) for n in task_issues)

        linked = set()
        for tid, r in rows.items():
            link = LINK.fullmatch(r[0])
            pr = by_url.get(link[2]) if link and PULL_URL.search(link[2]) else None
            if pr:
                linked.add(pr['html_url'])
                if within(pr.get('merged_at')):
                    completed.group(g)['lines'].append(f"{tid} {task_name(r, header)} — {pr['html_url']}")
        for pr in named:
            if within(pr.get('merged_at')) and pr['html_url'] not in linked and not listed(pr, done):
                completed.group(g)['lines'].append(f"{pr_title(pr)} — {pr['html_url']}")
        if done(ek):
            completed.group(g)['note'] = 'epic complete'

        if status.get(ek) in ACTIVE:
            group = progress.group(g)
            group['note'] = 'in review' if status[ek] == 'In Review' else ''
            for pr in named:
                if pr.get('state') == 'open' and not listed(pr, lambda n: status.get(n) in ACTIVE):
                    state = 'Draft' if pr.get('draft') else 'In Review'
                    group['lines'].append(f"{state}: {pr_title(pr)} — {pr['html_url']}")
            if not group['lines'] and (task := next_task(ek, header, rows)):
                named_next.add(task[0])
                group['lines'].append(f'Next: {task[1]}')
        elif status.get(ek) == 'Ready':
            task = next_task(ek, header, rows)
            if task:
                named_next.add(task[0])
            ready.append((ek, f'next {task[1]}' if task else ''))

    def rank(entry: tuple[Key, str]) -> tuple:
        k = entry[0]
        levels = [PRIORITY[l['name']] for l in issues[k].get('labels', []) if l['name'] in PRIORITY]
        return min(levels, default=UNRANKED), tagged[k], repo(k)

    ready = sorted((e for e in ready if e[0] not in named_next), key=rank)
    upcoming = []
    for k, task in ready[:SHOWN]:
        upcoming.append(f"• *{reference(*tagged[k])} {epic_name(issues[k]['title'])}*"
                        + (f', {task}' if task else '') + f" — {issues[k]['html_url']}")
    if len(ready) > SHOWN:
        upcoming.append(f'…and {len(ready) - SHOWN} more ready')

    named = f"{only_repo}:I{only}" if only_repo else f'I{only}' if only else ''
    heading = f"*Progress since {since:%a} {since.day} {since:%b}*" + (f' — {named}' if named else '')
    link = board_link(items)
    print('\n'.join([heading, *([f'Board: {link}'] if link else []), '', '*Completed*', *completed.render(),
                     '', '*In progress*', *progress.render(), '', '*Next*', *(upcoming or ['• Nothing'])]))
    for note in dict.fromkeys(unresolved):
        print(f'unresolved: {note}', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
