"""Bring an epic or an initiative up to date with delivered work.

Usage:
  python3 update.py issue-943.json --prs prs.json [--tick AC1,AC3] [--fix fixed-943.md]
  python3 update.py issue-936.json --epics issue-943.json issue-937.json ... [--tick AC10] [--fix fixed-936.md]

issue-943.json is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json

A pull request delivers the tasks its title names: [I07:E00:W01], or [I07:E00:(W01,W02)] for tasks
delivered together.

An epic's row is delivered when its task id links a pull request or commit. A task that a merged
pull request names gets its id linked to that pull request, the latest merged when several name it.
A row already linked elsewhere is reported, not changed, and open pull requests are reported as in
flight. An initiative's row is delivered when its epic issue, given by --epics, is closed. A row
whose Outcomes says "moved to" counts as delivered here.

Reported for each acceptance criterion:
  - ready to verify: unticked, and every row citing it is delivered;
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

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?\]')
PR_REF = re.compile(r'^\[I(\d\d):E(\d\d):(?:(W\d\d)|\((W\d\d(?:, ?W\d\d)*)\))\]')
TICKED = re.compile(r'^- \[[xX]\] ')


def pr_tasks(title: str) -> tuple[str, str, list[str]] | None:
    m = PR_REF.match(title)
    if not m:
        return None
    return m[1], m[2], [m[3]] if m[3] else re.findall(r'W\d\d', m[4])


def epic_delivery(rows, initiative, epic, prs, report):
    merged: dict[str, list] = {}
    for pr in prs:
        ref = pr_tasks(pr['title'])
        if not ref or ref[:2] != (initiative, epic):
            continue
        for task in ref[2]:
            if pr.get('merged_at'):
                merged.setdefault(task, []).append(pr)
            elif pr.get('state') == 'open':
                report['in flight'].append(f"{task}: #{pr['number']}")
    for r in rows:
        task = LINK.sub(r'\1', r[0])
        found = sorted(merged.get(task, []), key=lambda p: p['merged_at'])
        existing = LINK.fullmatch(r[0])
        if found and not existing:
            r[0] = f"[{task}]({found[-1]['html_url']})"
            report['linked'].append(f"{task} → #{found[-1]['number']}")
        elif found and existing[2] not in {p['html_url'] for p in found}:
            report['conflict'].append(f"{task} links {existing[2]}, but #{found[-1]['number']} names it")
    return {LINK.sub(r'\1', r[0]): bool(LINK.fullmatch(r[0])) for r in rows}


def initiative_delivery(rows, header, epics, report):
    at = header.index('Issue')
    delivered = {}
    for r in rows:
        number = re.search(r'#(\d+)', r[at] if at < len(r) else '')
        state = epics.get(int(number[1])) if number else None
        if state is None:
            report['note'].append(f'{r[0]}: no --epics issue for {r[at] if at < len(r) else "(no issue)"}')
        delivered[r[0]] = state == 'closed'
    return delivered


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue')
    parser.add_argument('--prs', help='epic: pull requests as JSON lines')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--fix', help='write the updated body here')
    args = parser.parse_args()

    issue = json.loads(Path(args.issue).read_text())
    m = PREFIX.match(issue['title'])
    if not m:
        sys.exit(f"title has no [Ixx] or [Ixx:Eyy] prefix: {issue['title']}")
    initiative, epic = m[1], m[2]
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    by_name = {h: lines for h, lines in sections}
    wb = by_name.get('Work Breakdown', [])
    start = next((i for i, l in enumerate(wb) if l.startswith('|')), None)
    if start is None:
        sys.exit('Work Breakdown has no table')
    end = start
    while end < len(wb) and wb[end].startswith('|'):
        end += 1
    header, rows = cells(wb[start]), [cells(l) for l in wb[start + 2:end]]
    outcomes = header.index('Outcomes') if 'Outcomes' in header else None
    if outcomes is None:
        sys.exit('Work Breakdown has no Outcomes column; run format.py first')

    report = {k: [] for k in ('linked', 'conflict', 'in flight', 'ready to verify', 'ticked early',
                              'ticked', 'note')}
    if epic:
        if not args.prs:
            sys.exit('an epic needs --prs')
        prs = [json.loads(l) for l in Path(args.prs).read_text().splitlines() if l.strip()]
        delivered = epic_delivery(rows, initiative, epic, prs, report)
    else:
        epics = {}
        for path in args.epics:
            e = json.loads(Path(path).read_text())
            epics[e['number']] = e['state']
        delivered = initiative_delivery(rows, header, epics, report)
    for r in rows:
        if 'moved to' in r[outcomes]:
            delivered[LINK.sub(r'\1', r[0])] = True

    citing: dict[int, list[str]] = {}
    for r in rows:
        listed = OUTCOMES.search(r[outcomes])
        for n in re.findall(r'AC(\d+)', listed[1]) if listed else []:
            citing.setdefault(int(n), []).append(LINK.sub(r'\1', r[0]))

    ac_lines = by_name.get('Acceptance Criteria', [])
    ticked, ready = {}, set()
    for line in ac_lines:
        a = AC.match(line)
        if a:
            ticked[int(a[1])] = bool(TICKED.match(line))
    for n, is_ticked in ticked.items():
        rows_for = citing.get(n, [])
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

    kind = 'epic' if epic else 'initiative'
    print(f"#{issue['number']} {kind} ({issue['state']})")
    for name, items in report.items():
        for item in items:
            print(f'  {name}: {item}')
    open_rows = [t for t, d in delivered.items() if not d]
    open_criteria = [f'AC{n}' for n, t in ticked.items() if not t]
    if open_rows or open_criteria:
        print('  closable: no (' + ', '.join(filter(None, [
            'undelivered ' + ', '.join(open_rows) if open_rows else '',
            'unticked ' + ', '.join(open_criteria) if open_criteria else ''])) + ')')
    else:
        print('  closable: yes')

    if args.fix:
        changed = report['linked'] or report['ticked']
        if report['linked']:
            wb[start:end] = [wb[start], wb[start + 1]] + [row(r) for r in rows]
        for section in sections:
            if section[0] == 'Work Breakdown':
                section[1] = wb
            elif section[0] == 'Acceptance Criteria':
                section[1] = ac_lines
        Path(args.fix).write_text(join_sections(preamble, sections) if changed else body)
    return 0


if __name__ == '__main__':
    sys.exit(main())
