"""Summarise a project board as a standup: what completed, what is in progress, and what is next.

Usage:
  python3 progress.py --items items.json --prs prs.json [--since 2026-09-25] [--initiative I08]

items.json is the board's items with the Status field, as board.py reads them; each item carries
its issue whole, body included, and the script exits when no item carries Status. prs.json holds
pull requests as JSON lines, as update.py reads them, from as many repositories as the board spans:
a pull request is known by its URL, and cites an issue as board.py reads a citation.

The board's Status is the source. Lines group under the epic they belong to. A row's task issue is
the one its id links. A task issue listed, which is one titled with the epic's reference, stands
for the pull requests that cite it:
  Completed    items Done whose issue closed in the window: an initiative, an epic, or a task issue
               under its epic. Under each epic, the tasks whose row id links a pull request merged
               in the window, and each such pull request naming the epic that no row links and
               that cites no task issue listed.
  In progress  epics and task issues In Progress or In Review, each epic with the open pull
               requests naming it that cite no task issue listed, ready for review (In Review) or
               draft, or else its next task.
  Next         epics and task issues Ready, ranked by priority label (highest, high, medium or
               none, low, lowest), then by reference; the first five, and a count of the rest. An
               epic names its next task.
An epic's next task is its first undelivered task whose dependencies are delivered and whose task
issue, if it has one, is on the board and not In Progress or In Review. A task issue an epic names
as its next task is not listed again.

The window opens at the start of --since in local time, by default the previous working day.
--initiative limits the summary to one initiative. An epic whose Work Breakdown the scripts cannot
read, or that has none, is summarised without its tasks.

Printed: the summary as Slack markup, for pasting into a channel: *bold* headings, bullets, and each
issue or pull request by its bare URL. Unresolved dependencies and unreadable epics print to stderr.
"""
import argparse
import re
import sys
from collections import Counter
from datetime import date, datetime, time, timedelta, timezone

from board import Board, Key, PREFIX, cites, key_of, label, linked_issue, pages, status_of
from format import LINK, cell, epic_name, phrase
from update import PR_REF, PULL_URL, Unreadable, pull_requests

PRIORITY = {'priority: highest': 0, 'priority: high': 1, 'priority: medium': 2,
            'priority: low': 4, 'priority: lowest': 5}
UNRANKED = 2
SHOWN = 5
ACTIVE = ('In Progress', 'In Review')


def previous_working_day(today: date) -> date:
    day = today - timedelta(days=1)
    while day.weekday() >= 5:
        day -= timedelta(days=1)
    return day


def tags(title: str) -> tuple[str, str, str] | None:
    m = PREFIX.match(title)
    return (m[1], m[2] or '', m[3] or '') if m else None


def reference(t: tuple[str, str, str]) -> str:
    return ':'.join(f'{p}{n}' for p, n in zip('IEW', t) if n)


def task_name(r: list[str], header: list[str]) -> str:
    return phrase(LINK.sub(r'\1', cell(header, r, 'Description')))


def pr_title(pr: dict) -> str:
    return PR_REF.sub('', pr['title']).strip()


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
    """Lines grouped under the epic, or initiative, they belong to."""

    def __init__(self):
        self.groups: dict[tuple[str, str], dict] = {}

    def group(self, i: str, e: str) -> dict:
        return self.groups.setdefault((i, e), {'note': '', 'lines': []})

    def render(self, headers: dict[tuple[str, str], dict]) -> list[str]:
        out = []
        for (i, e), g in sorted(self.groups.items()):
            issue = headers.get((i, e))
            ref = reference((i, e, ''))
            head = f"*{ref} {epic_name(issue['title'])}*" if issue else f'*{ref}*'
            note = f", {g['note']}" if g['note'] else ''
            out.append(f"• {head}{note}" + (f" — {issue['html_url']}" if issue else ''))
            out.extend(f'    ◦ {line}' for line in g['lines'])
        return out or ['• Nothing']


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True, help="the board's items, fetched with the Status field")
    parser.add_argument('--prs', required=True, help='pull requests as JSON lines')
    parser.add_argument('--since', help='the first day of the window, YYYY-MM-DD')
    parser.add_argument('--initiative', help='only this initiative, e.g. I08')
    args = parser.parse_args()
    since = date.fromisoformat(args.since) if args.since else previous_working_day(date.today())
    after = datetime.combine(since, time()).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    only = None
    if args.initiative:
        m = re.fullmatch(r'I?(\d{1,2})', args.initiative.strip(), re.IGNORECASE)
        if not m:
            sys.exit(f'--initiative {args.initiative}: not an initiative reference such as I08')
        only = m[1].zfill(2)

    items = [i for i in pages(args.items)
             if i.get('content_type') == 'Issue' and (i.get('content') or {}).get('repository_url')]
    if items and not any(f.get('name') == 'Status' for i in items for f in i.get('fields', [])):
        sys.exit("the items carry no Status field; fetch them with fields=<the board's Status field id>")
    issues = {key_of(i['content']): i['content'] for i in items}
    status = {key_of(i['content']): status_of(i) for i in items}
    prs = pull_requests(args.prs)
    by_url = {p['html_url']: p for p in prs}
    by_epic: dict[tuple[str, str], list[dict]] = {}
    for p in by_url.values():
        if m := PR_REF.match(p['title']):
            by_epic.setdefault(m.groups(), []).append(p)
    unresolved: list[str] = []
    home = Counter(k[0] for k in issues).most_common(1)[0][0] if issues else ''
    board = Summary(issues, unresolved, home)

    tagged, epic_ids, task_keys = {}, {}, {}
    for k, issue in issues.items():
        if not (t := tags(issue['title'])):
            continue
        if t[1] and not t[2]:
            epic_ids.setdefault(t[0], {})[f'E{t[1]}'] = k
        if t[2]:
            task_keys.setdefault(t[:2], {})[f'W{t[2]}'] = k
        if only is None or t[0] == only:
            tagged[k] = t
    headers = {(t[0], t[1]): issues[k] for k, t in tagged.items() if not t[2]}

    def within(stamp: str | None) -> bool:
        return (stamp or '') >= after

    def done(k) -> bool:
        return status.get(k) == 'Done' and within(issues[k].get('closed_at'))

    def next_task(k, t, header: list[str], rows: dict[str, list[str]]) -> tuple[str, str] | None:
        """The epic's next task: its id and the line naming it."""
        for tid, r in rows.items():
            backing = linked_issue(r[0])
            if backing and (backing not in issues or status.get(backing) in ACTIVE):
                continue
            if not board.row_delivered(k, tid, reference(t)) and board.met(
                    cell(header, r, 'Depends on'), k, epic_ids.get(t[0], {}), f'{reference(t)}:{tid}'):
                return tid, f'{tid} {task_name(r, header)}'
        return None

    completed, progress, ready = Section(), Section(), []
    named_next: set[tuple[str, str, str]] = set()
    # Task issues sort before their epic, so an epic sees the lines its task issues gave.
    for k, t in sorted(tagged.items(), key=lambda kv: (kv[1][0], kv[1][1], not kv[1][2], kv[1][2])):
        i, e, w = t
        issue = issues[k]
        if not e:
            if done(k):
                completed.group(i, '')['note'] = 'initiative complete'
            continue
        if w:
            line = f"W{w} {epic_name(issue['title'])} — {issue['html_url']}"
            if done(k):
                completed.group(i, e)['lines'].append(line)
            elif status.get(k) in ACTIVE:
                progress.group(i, e)['lines'].append(f"{status[k]}: {line}")
            elif status.get(k) == 'Ready':
                ready.append((issue, t, ''))
            continue

        header, rows = board.table(k)
        named = by_epic.get((i, e), [])
        task_issues = {n for r in rows.values() if (n := linked_issue(r[0]))}
        task_issues |= set(task_keys.get((i, e), {}).values())

        def listed(pr: dict, shown) -> bool:
            return any(shown(n) and cites(pr, n) for n in task_issues)

        linked = set()
        for tid, r in rows.items():
            link = LINK.fullmatch(r[0])
            pr = by_url.get(link[2]) if link and PULL_URL.search(link[2]) else None
            if pr:
                linked.add(pr['html_url'])
                if within(pr.get('merged_at')):
                    completed.group(i, e)['lines'].append(f"{tid} {task_name(r, header)} — {pr['html_url']}")
        for pr in named:
            if within(pr.get('merged_at')) and pr['html_url'] not in linked and not listed(pr, done):
                completed.group(i, e)['lines'].append(f"{pr_title(pr)} — {pr['html_url']}")
        if done(k):
            completed.group(i, e)['note'] = 'epic complete'

        if status.get(k) in ACTIVE:
            group = progress.group(i, e)
            group['note'] = 'in review' if status[k] == 'In Review' else ''
            for pr in named:
                if pr.get('state') == 'open' and not listed(pr, lambda n: status.get(n) in ACTIVE):
                    state = 'Draft' if pr.get('draft') else 'In Review'
                    group['lines'].append(f"{state}: {pr_title(pr)} — {pr['html_url']}")
            if not group['lines'] and (task := next_task(k, t, header, rows)):
                named_next.add((i, e, task[0][1:]))
                group['lines'].append(f'Next: {task[1]}')
        elif status.get(k) == 'Ready':
            task = next_task(k, t, header, rows)
            if task:
                named_next.add((i, e, task[0][1:]))
            ready.append((issue, t, f'next {task[1]}' if task else ''))

    def rank(entry) -> tuple:
        issue, t, _ = entry
        levels = [PRIORITY[l['name']] for l in issue.get('labels', []) if l['name'] in PRIORITY]
        return min(levels, default=UNRANKED), t

    ready = sorted((r for r in ready if r[1] not in named_next), key=rank)
    upcoming = [f"• *{reference(t)} {epic_name(issue['title'])}*" + (f', {task}' if task else '')
                + f" — {issue['html_url']}" for issue, t, task in ready[:SHOWN]]
    if len(ready) > SHOWN:
        upcoming.append(f'…and {len(ready) - SHOWN} more ready')

    heading = f"*Progress since {since:%a} {since.day} {since:%b}*" + (f' — I{only}' if only else '')
    print('\n'.join([heading, '', '*Completed*', *completed.render(headers), '', '*In progress*',
                     *progress.render(headers), '', '*Next*', *(upcoming or ['• Nothing'])]))
    for note in dict.fromkeys(unresolved):
        print(f'unresolved: {note}', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
