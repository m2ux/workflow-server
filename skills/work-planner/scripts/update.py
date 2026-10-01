"""Bring a task, an epic or an initiative up to date with delivered work.

Usage:
  python3 update.py issue-637.json --prs prs.json [--pr 950] [--tick AC1 --fix fixed-637.md]
  python3 update.py issue-943.json --prs prs.json [--tasks issue-637.json ...] [--link W01=950,W02=950] [--tick AC1 --fix fixed-943.md]
  python3 update.py issue-936.json --epics issue-943.json issue-937.json ...

Each issue file is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json

A pull request's title names the epic it works on: [I07:E00] Purpose. Which of the epic's tasks it
delivers is read from its changes against the tasks' Descriptions, and recorded by linking each task's
id to it with --link.

Task issue ([I07:E00:W01]): delivered by the merged pull request --pr names, whose title names the
task's epic.
Epic: --link links each named task's id to a merged pull request naming the epic, and refuses a
pull request that is unmerged or names another epic, or a row linking a task issue. A further pull
request on a row is linked after the ones already there. A row whose id links a task issue is
delivered when that issue, given by --tasks, is closed as completed; any other row when its id links
a pull request or commit. Done carries a tick when the row is delivered and every criterion it cites is
ticked. Reported: merged pull requests naming the epic that no row links yet, open ones as in flight,
a row linked to a pull request naming another epic, rows sharing a pull request that do not Join
each other, and work started while Open questions remain.
Initiative: a row is delivered when the epic issue its id links, given by --epics, is closed as
completed, and Done carries a tick then. A criterion is verified by the automated test it names, or
confirmed by the user where it names none. The initiative is closable once every criterion is ticked.

Reported for each acceptance criterion of a task, epic or initiative:
  - ready to verify: unticked, and every row citing it is delivered (for a task issue, the task);
  - ticked early: ticked while a row citing it is undelivered.
--tick ticks the named criteria in the body written to --fix, and refuses one not ready to verify.
Tick a criterion only once it is confirmed to hold. A task or epic is closable when every criterion
is ticked and every row is delivered.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from format import AC, LINK, TICK, cell, cells, id_cell, join_sections, row, row_id, split_sections

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PR_REF = re.compile(r'^\[I(\d\d):E(\d\d)\]')
TICKED = re.compile(r'^- \[[xX]\] ')
ISSUE_URL = re.compile(r'/issues/(\d+)$')
PULL_URL = re.compile(r'/pull/(\d+)$')


def completed(paths: list[str]) -> dict[int, bool]:
    states = {}
    for path in paths:
        issue = json.loads(Path(path).read_text())
        states[issue['number']] = issue['state'] == 'closed' and issue.get('state_reason') == 'completed'
    return states


def for_epic(prs: list[dict], initiative: str, epic: str) -> dict[int, dict]:
    """The pull requests whose titles name this epic, by number."""
    return {p['number']: p for p in prs if (m := PR_REF.match(p['title'])) and m.groups() == (initiative, epic)}


def epic_delivery(rows, header, named, links, tasks, report):
    delivered, by_pr = {}, {}
    at = header.index('Task')
    for r in rows:
        task = row_id(r[at])
        if task in links:
            pr = named.get(links[task])
            issue = ISSUE_URL.search(m[2]) if (m := LINK.fullmatch(r[at].strip())) else None
            if issue:
                sys.exit(f'{task} links its task issue #{issue[1]}; that issue records its pull request')
            if not pr or not pr.get('merged_at'):
                sys.exit(f'--link {task}={links[task]}: no merged pull request naming this epic')
            urls = [found[2] for found in LINK.finditer(r[at])]
            if pr['html_url'] not in urls:
                link = f"[{task}]({pr['html_url']})"
                r[at] = link if not urls else f'{r[at]}, {link}'
                report['linked'].append(f"{task} → #{pr['number']}")
        ident = r[at]
        issue = ISSUE_URL.search(m[2]) if (m := LINK.fullmatch(ident.strip())) else None
        if issue:
            number = int(issue[1])
            if number not in tasks:
                report['note'].append(f'{task}: no --tasks issue for #{number}')
            delivered[task] = bool(tasks.get(number))
            continue
        joins = set(re.findall(r'W\d\d', cell(header, r, 'Join')))
        for found in LINK.finditer(ident):
            pull = PULL_URL.search(found[2])
            if not pull:
                continue
            number = int(pull[1])
            by_pr.setdefault(number, []).append((task, joins))
            if number not in named:
                report['conflict'].append(f'{task} links #{number}, whose title does not name this epic')
        delivered[task] = bool(LINK.search(ident))
    for number, group in by_pr.items():
        apart = [f'{a}+{b}' for a, ja in group for b, _ in group if a < b and b not in ja]
        if apart:
            report['conflict'].append(f"#{number} delivers tasks that do not Join: {', '.join(apart)}")
    for number, pr in sorted(named.items()):
        if pr.get('merged_at') and number not in by_pr:
            report['unmatched'].append(f"#{number} {pr['title']}")
        elif pr.get('state') == 'open':
            report['in flight'].append(f"#{number} {pr['title']}")
    return delivered


def initiative_delivery(rows, header, epics, report):
    delivered = {}
    for r in rows:
        ident = id_cell(header, r)
        epic = row_id(ident)
        link = LINK.fullmatch(ident.strip())
        issue = ISSUE_URL.search(link[2]) if link else None
        if not issue or int(issue[1]) not in epics:
            report['note'].append(f'{epic}: its id links no issue given by --epics')
        delivered[epic] = bool(issue) and epics.get(int(issue[1]), False)
    return delivered


def cited(text: str) -> list[int]:
    """The acceptance criteria an Acceptance Coverage cell names."""
    return [int(n) for n in re.findall(r'\bAC(\d+)', text)]


def sync_done(rows, header, delivered: dict[str, bool], ticked: dict[int, bool], kind: str, report) -> bool:
    """Set a tick on each complete row, and clear it on each row that is not. Returns whether any changed."""
    if 'Done' not in header:
        return False
    at = header.index('Done')
    changed = False
    for r in rows:
        name = row_id(id_cell(header, r))
        if kind == 'epic':
            acs = cited(cell(header, r, 'Acceptance Coverage'))
            complete = bool(delivered.get(name)) and bool(acs) and all(ticked.get(n) for n in acs)
        else:
            complete = bool(delivered.get(name))
        mark = TICK if complete else ''
        current = r[at] if at < len(r) else ''
        if current == mark:
            continue
        while len(r) <= at:
            r.append('')
        r[at] = mark
        changed = True
        if complete:
            report['done'].append(name)
    return changed


def pull_requests(path: str) -> list[dict]:
    """Pull requests written as JSON lines, as `gh api --paginate ... --jq '.[] | ...'` writes them."""
    return [json.loads(l) for l in Path(path).read_text().splitlines() if l.strip()]


class Unreadable(ValueError):
    """A body whose Work Breakdown the scripts cannot read."""


def table(sections):
    lines = next((l for h, l in sections if h == 'Work Breakdown'), None)
    if lines is None:
        return None, None, None, None
    start = next((i for i, l in enumerate(lines) if l.startswith('|')), None)
    if start is None:
        raise Unreadable('Work Breakdown has no table')
    end = start
    while end < len(lines) and lines[end].startswith('|'):
        end += 1
    return lines, start, end, [cells(l) for l in lines[start:end]]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue')
    parser.add_argument('--prs', help='task or epic: pull requests as JSON lines')
    parser.add_argument('--pr', type=int, help='task issue: the pull request that delivered it')
    parser.add_argument('--link', default='', help='epic: task ids to link to pull requests, e.g. W01=950,W02=950')
    parser.add_argument('--tasks', nargs='*', default=[], help='epic: its task issues as JSON')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--fix', help='write the updated body here')
    args = parser.parse_args()
    if (args.tick or args.link) and not args.fix:
        sys.exit('--tick and --link need --fix, which holds the updated body')

    issue = json.loads(Path(args.issue).read_text())
    m = PREFIX.match(issue['title'])
    if not m:
        sys.exit(f"title has no [Ixx], [Ixx:Eyy] or [Ixx:Eyy:Wzz] prefix: {issue['title']}")
    initiative, epic, task = m[1], m[2], m[3] and f'W{m[3]}'
    kind = 'task' if task else 'epic' if epic else 'initiative'
    if kind != 'initiative' and not args.prs:
        sys.exit(f'a {kind} needs --prs')
    prs = pull_requests(args.prs) if args.prs else []
    named = for_epic(prs, initiative, epic) if epic else {}
    links = {k.strip(): int(v) for k, v in (x.split('=') for x in args.link.split(',') if x.strip())}
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    report = {k: [] for k in ('linked', 'unmatched', 'conflict', 'in flight', 'ready to verify',
                              'ticked early', 'ticked', 'done', 'open questions', 'note')}
    tag, heading, label, ready_key = 'AC', 'Acceptance Criteria', AC, 'ready to verify'

    lines, start, end, grid = table(sections)
    delivered: dict[str, bool] = {}
    citing: dict[int, list[str]] = {}
    rows = []
    if kind == 'task':
        pr = named.get(args.pr) if args.pr else None
        if args.pr and not (pr and pr.get('merged_at')):
            sys.exit(f'--pr {args.pr}: no merged pull request naming I{initiative}:E{epic}')
        if pr:
            report['linked'].append(f"{task} delivered by #{pr['number']}")
        delivered[task] = bool(pr)
    else:
        if grid is None or 'Acceptance Coverage' not in grid[0]:
            sys.exit('Work Breakdown has no Acceptance Coverage column; run format.py first')
        header, rows = grid[0], grid[2:]
        if kind == 'epic':
            delivered = epic_delivery(rows, header, named, links, completed(args.tasks), report)
            questions = next((l for h, l in sections if h == 'Open questions'), [])
            started = any(delivered.values()) or report['in flight'] or report['unmatched']
            if started and any(l.strip() for l in questions):
                report['open questions'].append('work has started while questions remain; resolve them '
                                                'in plan mode, since their answers may reshape the epic')
        else:
            delivered = initiative_delivery(rows, header, completed(args.epics), report)
        for r in rows:
            name = row_id(id_cell(header, r))
            for n in cited(cell(header, r, 'Acceptance Coverage')):
                citing.setdefault(n, []).append(name)

    ac_lines = next((l for h, l in sections if h == heading), [])
    ticked, ready = {}, set()
    for line in ac_lines:
        a = label.match(line)
        if a:
            ticked[int(a[1])] = bool(TICKED.match(line))
    for n, is_ticked in ticked.items():
        rows_for = [task] if kind == 'task' else citing.get(n, [])
        done = bool(rows_for) and all(delivered.get(t) for t in rows_for)
        if not is_ticked and done:
            ready.add(n)
            report[ready_key].append(f"{tag}{n} ({', '.join(rows_for)})")
        if is_ticked and not done:
            pending = [t for t in rows_for if not delivered.get(t)] or ['no row cites it']
            report['ticked early'].append(f"{tag}{n} ({', '.join(pending)} undelivered)")

    to_tick = {int(t.strip()[len(tag):]) for t in args.tick.split(',') if t.strip()}
    refused = sorted(to_tick - ready)
    if refused:
        sys.exit(f'{ready_key.replace("ready to", "not ready to")}, so not ticked: '
                 + ', '.join(f'{tag}{n}' for n in refused))
    for i, line in enumerate(ac_lines):
        a = label.match(line)
        if a and int(a[1]) in to_tick:
            ac_lines[i] = '- [x] ' + line[6:]
            ticked[int(a[1])] = True
            report['ticked'].append(f'{tag}{a[1]}')

    done_changed = False
    if kind != 'task' and rows:
        done_changed = sync_done(rows, header, delivered, ticked, kind, report)

    print(f"#{issue['number']} {kind} ({issue['state']})")
    for name, items in report.items():
        for item in items:
            print(f'  {name}: {item}')
    open_rows = [t for t, d in delivered.items() if not d] if kind != 'initiative' else []
    open_criteria = [f'{tag}{n}' for n, t in ticked.items() if not t]
    reasons = [f"undelivered {', '.join(open_rows)}" if open_rows else '',
               f"unticked {', '.join(open_criteria)}" if open_criteria else '']
    print('  closable: ' + ('no (' + ', '.join(filter(None, reasons)) + ')' if any(reasons) else 'yes'))

    if args.fix:
        rewrite = bool(report['linked']) and kind != 'task' or done_changed
        if rewrite:
            lines[start + 2:end] = [row(r) for r in rows]
        Path(args.fix).write_text(join_sections(preamble, sections) if rewrite or report['ticked'] else body)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
