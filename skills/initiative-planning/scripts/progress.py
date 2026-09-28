"""Summarise a project board as a standup: what completed, what is in progress, and what is next.

Usage:
  python3 progress.py --items items.json --prs prs.json [--since 2026-09-25] [--initiative I08]

items.json is the board's items with the Status field, as board.py reads them; each item carries
its issue whole, body included. prs.json holds pull requests as JSON lines, as update.py reads them.

The board's Status is the source. Lines group under the epic they belong to:
  Completed    items Done whose issue closed on or after --since: an initiative, an epic, or a task
               issue under its epic. Under each epic, the tasks whose row id links a pull request
               merged on or after --since, and each such pull request naming the epic that no row
               links and that cites none of the epic's task issues.
  In progress  epics and task issues In Progress or In Review, each epic with the open pull
               requests naming it, ready for review or draft, or else its next task.
  Next         epics and task issues Ready, ranked by priority label (highest, high, medium or
               none, low, lowest), then by reference; the first five, and a count of the rest. An
               epic names its next task.
An epic's next task is its first undelivered task whose dependencies are delivered.
--since defaults to the start of the previous working day. --initiative limits the summary to one
initiative.

Printed: the summary as Slack markup, for pasting into a channel: *bold* headings, bullets, and each
issue or pull request by its bare URL. Unresolved dependencies print to stderr.
"""
import argparse
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

from board import Board, PREFIX, key_of, linked_issue, pages
from format import LINK
from update import PR_REF

PRIORITY = {'priority: highest': 0, 'priority: high': 1, 'priority: medium': 2,
            'priority: low': 4, 'priority: lowest': 5}
UNRANKED = 2
SHOWN = 5
PULL_URL = re.compile(r'/pull/\d+$')


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


def name(title: str) -> str:
    """A house title's name: the part between the prefix and the first colon."""
    return title.split('] ', 1)[-1].split(':', 1)[0]


def task_name(r: list[str], header: list[str]) -> str:
    column = header.index('Description') if 'Description' in header else None
    text = r[column] if column is not None and column < len(r) else ''
    return re.sub(r'\s*→.*$', '', LINK.sub(r'\1', text)).strip()


def pr_title(pr: dict) -> str:
    return PR_REF.sub('', pr['title']).strip()


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
            label = reference((i, e, ''))
            head = f"*{label} {name(issue['title'])}*" if issue else f'*{label}*'
            note = f", {g['note']}" if g['note'] else ''
            out.append(f"• {head}{note}" + (f" — {issue['html_url']}" if issue else ''))
            out.extend(f'    ◦ {line}' for line in g['lines'])
        return out or ['• Nothing']


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True, help="the board's items, fetched with the Status field")
    parser.add_argument('--prs', required=True, help='pull requests as JSON lines')
    parser.add_argument('--since', help='completed on or after this date, YYYY-MM-DD')
    parser.add_argument('--initiative', help='only this initiative, e.g. I08')
    args = parser.parse_args()
    since = date.fromisoformat(args.since) if args.since else previous_working_day(date.today())
    after = since.isoformat()
    only = args.initiative.upper().removeprefix('I') if args.initiative else None

    items = [i for i in pages(args.items) if i.get('content_type') == 'Issue']
    issues = {key_of(i['content']): i['content'] for i in items}
    status = {}
    for item in items:
        value = next((f.get('value') for f in item.get('fields', []) if f.get('name') == 'Status'), None)
        label = value and value.get('name')
        status[key_of(item['content'])] = label['raw'] if isinstance(label, dict) else label
    prs = [json.loads(l) for l in Path(args.prs).read_text().splitlines() if l.strip()]
    by_url = {p['html_url']: p for p in prs}
    unresolved: list[str] = []
    home = next(iter(issues))[0] if issues else ''
    board = Board(issues, unresolved, home)

    tagged = {k: t for k, issue in issues.items() if (t := tags(issue['title'])) and (only is None or t[0] == only)}
    headers = {(t[0], t[1]): issues[k] for k, t in tagged.items() if not t[2]}
    epic_ids: dict[str, dict] = {}
    for k, t in tagged.items():
        if t[1] and not t[2]:
            epic_ids.setdefault(t[0], {})[f'E{t[1]}'] = k

    def done(k) -> bool:
        return status.get(k) == 'Done' and (issues[k].get('closed_at') or '') >= after

    def cites(pr: dict, number: int) -> bool:
        return bool(re.search(rf'#{number}\b|/issues/{number}\b', f"{pr['title']}\n{pr.get('body') or ''}"))

    def next_task(k, t, header: list[str], rows: dict[str, list[str]]) -> str:
        """The epic's first undelivered task whose dependencies are delivered."""
        column = header.index('Depends on') if 'Depends on' in header else None
        for tid, r in rows.items():
            cell = r[column] if column is not None and column < len(r) else ''
            if not board.row_delivered(k, tid, reference(t)) and board.met(
                    cell, k, epic_ids.get(t[0], {}), f'{reference(t)}:{tid}'):
                return f'{tid} {task_name(r, header)}'
        return ''

    completed, progress, ready = Section(), Section(), []
    for k, t in sorted(tagged.items(), key=lambda kv: kv[1]):
        i, e, w = t
        issue = issues[k]
        if not e:
            if done(k):
                completed.group(i, '')['note'] = 'initiative complete'
            continue
        if w:
            line = f"W{w} {name(issue['title'])} — {issue['html_url']}"
            if done(k):
                completed.group(i, e)['lines'].append(line)
            elif status.get(k) in ('In Progress', 'In Review'):
                progress.group(i, e)['lines'].append(f"{status[k]}: {line}")
            elif status.get(k) == 'Ready':
                ready.append((issue, t, ''))
            continue

        header, rows = board.table(k)
        named = [p for p in prs if (m := PR_REF.match(p['title'])) and m.groups() == (i, e)]
        task_issues = [n for r in rows.values() if (n := linked_issue(r[0]))]
        linked = set()
        for tid, r in rows.items():
            link = LINK.fullmatch(r[0])
            pr = by_url.get(link[2]) if link and PULL_URL.search(link[2]) else None
            if pr:
                linked.add(pr['number'])
                if (pr.get('merged_at') or '') >= after:
                    completed.group(i, e)['lines'].append(f"{tid} {task_name(r, header)} — {pr['html_url']}")
        for pr in named:
            if (pr.get('merged_at') or '') >= after and pr['number'] not in linked \
                    and not any(cites(pr, n[1]) for n in task_issues):
                completed.group(i, e)['lines'].append(f"{pr_title(pr)} — {pr['html_url']}")
        if done(k):
            completed.group(i, e)['note'] = 'epic complete'

        if status.get(k) in ('In Progress', 'In Review'):
            group = progress.group(i, e)
            group['note'] = 'in review' if status[k] == 'In Review' else ''
            for pr in named:
                if pr.get('state') == 'open':
                    state = 'Draft' if pr.get('draft') else 'In review'
                    group['lines'].append(f"{state}: {pr_title(pr)} — {pr['html_url']}")
            if not group['lines'] and (task := next_task(k, t, header, rows)):
                group['lines'].append(f'Next: {task}')
        elif status.get(k) == 'Ready':
            task = next_task(k, t, header, rows)
            ready.append((issue, t, f'next {task}' if task else ''))

    def rank(entry) -> tuple:
        issue, t, _ = entry
        levels = [PRIORITY[l['name']] for l in issue.get('labels', []) if l['name'] in PRIORITY]
        return min(levels, default=UNRANKED), t

    ready.sort(key=rank)
    upcoming = [f"• *{reference(t)} {name(issue['title'])}*" + (f', {task}' if task else '')
                + f" — {issue['html_url']}" for issue, t, task in ready[:SHOWN]]
    if len(ready) > SHOWN:
        upcoming.append(f'…and {len(ready) - SHOWN} more ready')

    heading = f"*Progress since {since.strftime('%a %-d %b')}*" + (f' — I{only}' if only else '')
    print('\n'.join([heading, '', '*Completed*', *completed.render(headers), '', '*In progress*',
                     *progress.render(headers), '', '*Next*', *(upcoming or ['• Nothing'])]))
    for note in dict.fromkeys(unresolved):
        print(f'unresolved: {note}', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
