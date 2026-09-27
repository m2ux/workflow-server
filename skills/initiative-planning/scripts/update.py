"""Bring a task, an epic or an initiative up to date with delivered work.

Usage:
  python3 update.py issue-637.json --prs prs.json [--tick AC1 --fix fixed-637.md]
  python3 update.py issue-943.json --prs prs.json [--tasks issue-637.json ...] [--tick AC1,AC3 --fix fixed-943.md]
  python3 update.py issue-936.json --epics issue-943.json issue-937.json ... [--tick AC10 --fix fixed-936.md]

Each issue file is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json

A pull request delivers the tasks its title names: [I07:E00:W01], or [I07:E00:(W01,W02)] for tasks
that Join each other.

Task issue ([I07:E00:W01]): delivered when a merged pull request names it.
Epic: a row whose id links a task issue is delivered when that issue, given by --tasks, is closed
as completed; a merged pull request naming it is reported, since the task issue records it. Any
other row is delivered when its id links a pull request or commit. A task that a merged pull
request names gets its id linked to it, the latest merged when several name it; a row already
linked elsewhere is reported, not changed. Open pull requests are reported as in flight, and a
grouped title naming tasks that do not Join each other is reported. An epic whose work has started
while its Open questions section remains is reported.
Initiative: a row is delivered when the epic issue its id links, given by --epics, is closed as
completed. Its goals are met through its epics' criteria and are not ticked, so the initiative is
closable once every epic is delivered.
A row whose Outcomes says "moved to" counts as delivered.

Reported for each acceptance criterion:
  - ready to verify: unticked, and every row citing it is delivered (for a task issue, the task);
  - ticked early: ticked while a row citing it is undelivered.
--tick ticks the named criteria in the body written to --fix, and refuses one not ready to verify.
Tick only criteria confirmed to hold. The issue is closable when every criterion is ticked and every
row is delivered.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from format import AC, LINK, OUTCOMES, cells, join_sections, row, split_sections

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PR_REF = re.compile(r'^\[I(\d\d):E(\d\d):(?:(W\d\d)|\((W\d\d(?:, ?W\d\d)*)\))\]')
TICKED = re.compile(r'^- \[[xX]\] ')
ISSUE_URL = re.compile(r'/issues/(\d+)$')


def pr_tasks(title: str) -> tuple[str, str, list[str]] | None:
    m = PR_REF.match(title)
    if not m:
        return None
    return m[1], m[2], [m[3]] if m[3] else re.findall(r'W\d\d', m[4])


def completed(paths: list[str]) -> dict[int, bool]:
    states = {}
    for path in paths:
        issue = json.loads(Path(path).read_text())
        states[issue['number']] = issue['state'] == 'closed' and issue.get('state_reason') == 'completed'
    return states


def merged_for(prs, initiative, epic, report, joins=None, only=None):
    """Merged pull requests per task of one epic; open ones and ungrouped groups are reported."""
    merged: dict[str, list] = {}
    for pr in prs:
        ref = pr_tasks(pr['title'])
        if not ref or ref[:2] != (initiative, epic):
            continue
        group = ref[2]
        if joins is not None and len(group) > 1:
            apart = [f'{a}+{b}' for a in group for b in group if a < b and b not in joins.get(a, set())]
            if apart:
                report['conflict'].append(f"#{pr['number']} groups tasks that do not Join: {', '.join(apart)}")
        for task in group:
            if only and task != only:
                continue
            if pr.get('merged_at'):
                merged.setdefault(task, []).append(pr)
            elif pr.get('state') == 'open':
                report['in flight'].append(f"{task}: #{pr['number']}")
    return {t: sorted(p, key=lambda x: x['merged_at']) for t, p in merged.items()}


def epic_delivery(rows, header, merged, tasks, report):
    join = header.index('Join') if 'Join' in header else None
    delivered = {}
    for r in rows:
        task = LINK.sub(r'\1', r[0])
        found = merged.get(task, [])
        existing = LINK.fullmatch(r[0])
        issue = ISSUE_URL.search(existing[2]) if existing else None
        if issue:
            number = int(issue[1])
            if number not in tasks:
                report['note'].append(f'{task}: no --tasks issue for #{number}')
            if found and not tasks.get(number):
                report['task issue'].append(f"{task}: #{number} delivered by #{found[-1]['number']}; "
                                            'update and close the task issue')
            delivered[task] = bool(tasks.get(number))
            continue
        if found and not existing:
            r[0] = f"[{task}]({found[-1]['html_url']})"
            report['linked'].append(f"{task} → #{found[-1]['number']}")
        elif found and existing[2] not in {p['html_url'] for p in found}:
            report['conflict'].append(f"{task} links {existing[2]}, but #{found[-1]['number']} names it")
        delivered[task] = bool(LINK.fullmatch(r[0]))
    return delivered


def initiative_delivery(rows, epics, report):
    delivered = {}
    for r in rows:
        epic = LINK.sub(r'\1', r[0])
        link = LINK.fullmatch(r[0])
        issue = ISSUE_URL.search(link[2]) if link else None
        if not issue or int(issue[1]) not in epics:
            report['note'].append(f'{epic}: its id links no issue given by --epics')
        delivered[epic] = bool(issue) and epics.get(int(issue[1]), False)
    return delivered


def table(sections):
    lines = next((l for h, l in sections if h == 'Work Breakdown'), None)
    if lines is None:
        return None, None, None, None
    start = next((i for i, l in enumerate(lines) if l.startswith('|')), None)
    if start is None:
        sys.exit('Work Breakdown has no table')
    end = start
    while end < len(lines) and lines[end].startswith('|'):
        end += 1
    return lines, start, end, [cells(l) for l in lines[start:end]]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue')
    parser.add_argument('--prs', help='task or epic: pull requests as JSON lines')
    parser.add_argument('--tasks', nargs='*', default=[], help='epic: its task issues as JSON')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--fix', help='write the updated body here')
    args = parser.parse_args()
    if args.tick and not args.fix:
        sys.exit('--tick needs --fix, which holds the ticked body')

    issue = json.loads(Path(args.issue).read_text())
    m = PREFIX.match(issue['title'])
    if not m:
        sys.exit(f"title has no [Ixx], [Ixx:Eyy] or [Ixx:Eyy:Wzz] prefix: {issue['title']}")
    initiative, epic, task = m[1], m[2], m[3] and f'W{m[3]}'
    kind = 'task' if task else 'epic' if epic else 'initiative'
    if kind == 'initiative' and args.tick:
        sys.exit("an initiative's goals are met through its epics and are not ticked")
    if kind != 'initiative' and not args.prs:
        sys.exit(f'a {kind} needs --prs')
    prs = [json.loads(l) for l in Path(args.prs).read_text().splitlines() if l.strip()] if args.prs else []
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    report = {k: [] for k in ('linked', 'task issue', 'conflict', 'in flight', 'ready to verify',
                              'ticked early', 'ticked', 'open questions', 'note')}

    lines, start, end, grid = table(sections)
    delivered: dict[str, bool] = {}
    citing: dict[int, list[str]] = {}
    rows = []
    if kind == 'task':
        found = merged_for(prs, initiative, epic, report, only=task).get(task, [])
        if found:
            report['linked'].append(f"{task} delivered by #{found[-1]['number']}")
        delivered[task] = bool(found)
    else:
        if grid is None or 'Outcomes' not in grid[0]:
            sys.exit('Work Breakdown has no Outcomes column; run format.py first')
        header, rows = grid[0], grid[2:]
        outcomes = header.index('Outcomes')
        if kind == 'epic':
            joins = {}
            if 'Join' in header:
                at = header.index('Join')
                for r in rows:
                    joins[LINK.sub(r'\1', r[0])] = set(re.findall(r'W\d\d', r[at] if at < len(r) else ''))
            merged = merged_for(prs, initiative, epic, report, joins)
            delivered = epic_delivery(rows, header, merged, completed(args.tasks), report)
            questions = next((l for h, l in sections if h == 'Open questions'), [])
            started = any(delivered.values()) or report['in flight']
            if started and any(l.strip() for l in questions):
                report['open questions'].append('work has started while questions remain; resolve them '
                                                'in plan mode, since their answers may reshape the epic')
        else:
            delivered = initiative_delivery(rows, completed(args.epics), report)
        for r in rows:
            name = LINK.sub(r'\1', r[0])
            if 'moved to' in r[outcomes]:
                delivered[name] = True
            listed = OUTCOMES.search(r[outcomes])
            for n in re.findall(r'AC(\d+)', listed[1]) if listed else []:
                citing.setdefault(int(n), []).append(name)

    ac_lines = next((l for h, l in sections if h == 'Acceptance Criteria'), [])
    ticked, ready = {}, set()
    for line in ac_lines:
        a = AC.match(line)
        if a:
            ticked[int(a[1])] = bool(TICKED.match(line))
    for n, is_ticked in ticked.items():
        rows_for = [task] if kind == 'task' else citing.get(n, [])
        done = bool(rows_for) and all(delivered.get(t) for t in rows_for)
        if not is_ticked and done:
            ready.add(n)
            report['ready to verify'].append(f"AC{n} ({', '.join(rows_for)})")
        if is_ticked and not done:
            pending = [t for t in rows_for if not delivered.get(t)] or ['no row cites it']
            report['ticked early'].append(f"AC{n} ({', '.join(pending)} undelivered)")

    to_tick = {int(t.strip()[2:]) for t in args.tick.split(',') if t.strip()}
    refused = sorted(to_tick - ready)
    if refused:
        sys.exit('not ready to verify, so not ticked: ' + ', '.join(f'AC{n}' for n in refused))
    for i, line in enumerate(ac_lines):
        a = AC.match(line)
        if a and int(a[1]) in to_tick:
            ac_lines[i] = '- [x] ' + line[6:]
            ticked[int(a[1])] = True
            report['ticked'].append(f'AC{a[1]}')

    print(f"#{issue['number']} {kind} ({issue['state']})")
    for name, items in report.items():
        for item in items:
            print(f'  {name}: {item}')
    open_rows = [t for t, d in delivered.items() if not d]
    open_criteria = [f'AC{n}' for n, t in ticked.items() if not t]
    reasons = [f"undelivered {', '.join(open_rows)}" if open_rows else '',
               f"unticked {', '.join(open_criteria)}" if open_criteria else '']
    print('  closable: ' + ('no (' + ', '.join(filter(None, reasons)) + ')' if any(reasons) else 'yes'))

    if args.fix:
        if report['linked'] and kind != 'task':
            lines[start + 2:end] = [row(r) for r in rows]
        changed = (report['linked'] and kind != 'task') or report['ticked']
        Path(args.fix).write_text(join_sections(preamble, sections) if changed else body)
    return 0


if __name__ == '__main__':
    sys.exit(main())
