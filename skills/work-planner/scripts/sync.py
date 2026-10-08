"""Bring a task, an epic or an initiative up to date with delivered work.

Usage:
  python3 sync.py issue-637.json --prs prs.json [--pr 950] [--tick AC1 --fix fixed-637.md]
  python3 sync.py issue-943.json --prs prs.json [--tasks issue-637.json ...] [--link W01=950,W02=950] [--tick AC1 --fix fixed-943.md]
  python3 sync.py issue-936.json --epics issue-943.json issue-937.json ... --prs prs.json

Each issue file is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json

A pull request's title names the epic it works on: [I07:E00] Purpose. Which of the epic's tasks it
delivers is read from its changes against the tasks' Descriptions, and recorded by linking each task's
id to it with --link.

Task issue ([I07:E00:W01]): delivered by the merged pull request --pr names, whose title names the
task's epic.
Epic: --link links each named task's id to a pull request naming the epic, open or merged, and refuses one that does not name this epic. A row whose id links its task issue links the pull request instead, and a further pull request is linked after the ones already there. A task is delivered when a linked pull request has merged, or its id links a commit. A linked pull request whose title names another epic is reported as a conflict and still delivers the task once it has merged. A linked pull request absent from the given pull requests is reported and does not deliver the task. A row that links a task issue and no pull request is delivered when that issue, given by --tasks, is closed as completed. An open pull request does not deliver the task. Done carries a tick when the row is delivered and every criterion its Coverage names is ticked. A row that links a merged pull request while a criterion its Coverage names is unticked is unmet, and its Done cell stays empty. Reported: a merged pull request naming the epic that no row links as unmatched, an open one no row links as in flight, other than a pull request whose head is an epic base, a linked pull request that does not cite the task's issue as uncited, unmet coverage, a row linked to a pull request naming another epic, rows sharing a pull request that do not name each other in Joins, and work started while Open Questions remain.
Initiative: a row is delivered when the epic issue its id links, given by --epics, is closed as
completed, and Done carries a tick then. A criterion is verified by the automated test it names, or
confirmed by the user where it names none. The initiative is closable once every criterion is ticked
and every integration branch its pull requests target has merged into its long-lived branch. A pull
request that targets an integration branch, or an epic base cut from one, associates that integration
branch. --prs supplies those pull requests; without it an initiative whose criteria are all ticked is
not closable. Each integration branch still unmerged is reported unmerged, naming an open pull request
that merges it when one is open.

Reported for each acceptance criterion of a task, epic or initiative:
  - ready to verify: unticked, and every row citing it is delivered (for a task issue, the task);
  - ticked early: ticked while a row citing it is undelivered.
--tick ticks the named criteria in the body written to --fix, and refuses one not ready to verify.
Tick a criterion only once it is confirmed to hold. A task is closable when every criterion is ticked
and every row is delivered. An epic is closable when those hold and every epic base its pull requests
target has merged into the initiative's integration branch. A pull request whose head is an epic base
merges that base and is not a task delivery. Each such base still unmerged is reported unmerged, naming
an open pull request that merges it when one is open.
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
PULL_HOME = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
LONG_LIVED: tuple[str, ...] = ()


def cites(pr: dict, key: tuple[str, int]) -> bool:
    """Whether a pull request's title or body cites the issue: by its URL or owner/repo#number, or
    as a bare #number from the issue's own repository. Repository names match in any case."""
    repo, number = key
    text = f"{pr['title']}\n{pr.get('body') or ''}"
    if re.search(rf'(?<![\w.-]){re.escape(repo)}(?:/issues/|#){number}\b', text, re.IGNORECASE):
        return True
    home = PULL_HOME.search(pr.get('html_url') or '')
    return bool(home) and home[1].lower() == repo.lower() and bool(re.search(rf'(?<![\w/.-])#{number}\b', text))


def issue_done(issue: dict) -> bool:
    return issue['state'] == 'closed' and issue.get('state_reason') == 'completed'


def load_issues(paths: list[str]) -> list[dict]:
    return [json.loads(Path(path).read_text()) for path in paths]


def completed(paths: list[str]) -> dict[int, bool]:
    states = {}
    for path in paths:
        issue = json.loads(Path(path).read_text())
        states[issue['number']] = issue['state'] == 'closed' and issue.get('state_reason') == 'completed'
    return states


def for_epic(prs: list[dict], initiative: str, epic: str) -> dict[int, dict]:
    """The pull requests whose titles name this epic, by number.

    A pull request whose head is an epic base merges that base and is not a task delivery."""
    named = {}
    for p in prs:
        matched = PR_REF.match(p['title'])
        if not matched or matched.groups() != (initiative, epic):
            continue
        if epic_base((p.get('head') or {}).get('ref') or '', initiative, epic):
            continue
        named[p['number']] = p
    return named


def compose_id(task: str, text: str, url: str) -> str:
    """The task's id linking url. A pull request replaces the planning-record link. Pull requests and commits already linked stay. An issue link is dropped."""
    kept, seen = [], set()
    for found in LINK.finditer(text):
        href = found[2]
        if ISSUE_URL.search(href) or href in seen:
            continue
        if '/pull/' not in href and '/commit/' not in href:
            continue
        seen.add(href)
        kept.append(f'[{task}]({href})')
    if url not in seen:
        kept.append(f'[{task}]({url})')
    return ', '.join(kept)


def epic_delivery(rows, header, named, links, task_paths, initiative, epic, report, prs):
    delivered, by_pr = {}, {}
    given = {p['number']: p for p in prs}
    issues = load_issues(task_paths)
    by_number = {issue['number']: issue for issue in issues}
    by_task = {}
    for issue in issues:
        title = PREFIX.match(issue['title'])
        if title and title[1] == initiative and title[2] == epic and title[3]:
            by_task[f'W{title[3]}'] = issue
    at = header.index('Task')
    for r in rows:
        task = row_id(r[at])
        if task in links:
            pr = named.get(links[task])
            if not pr:
                sys.exit(f'--link {task}={links[task]}: no pull request naming this epic')
            linked = compose_id(task, r[at], pr['html_url'])
            if linked != r[at].strip():
                r[at] = linked
                report['linked'].append(f"{task} → #{pr['number']}")
        ident = r[at]
        joins = set(re.findall(r'W\d\d', cell(header, r, 'Joins')))
        pulls, commits, issue_numbers = [], False, []
        for found in LINK.finditer(ident):
            if '/commit/' in found[2]:
                commits = True
            pull = PULL_URL.search(found[2])
            if pull:
                number = int(pull[1])
                pulls.append(number)
                by_pr.setdefault(number, []).append((task, joins))
                if number not in given:
                    report['note'].append(f'{task} links #{number}, which is not among the pull requests given')
                elif number not in named:
                    report['conflict'].append(f'{task} links #{number}, whose title does not name this epic')
            elif (issue := ISSUE_URL.search(found[2])):
                issue_numbers.append(int(issue[1]))
        landed = commits or any(given.get(number, {}).get('merged_at') for number in pulls)
        if not pulls and not commits and issue_numbers:
            number = issue_numbers[0]
            if number not in by_number:
                report['note'].append(f'{task}: no --tasks issue for #{number}')
            landed = issue_done(by_number[number]) if number in by_number else False
            report['note'].append(f'{task} links task issue #{number}; link its pull request')
        task_issue = by_task.get(task)
        if task_issue:
            repo = task_issue['repository_url'].split('/repos/', 1)[1]
            key = (repo, task_issue['number'])
            for number in pulls:
                pr = named.get(number)
                if pr and not cites(pr, key):
                    report['uncited'].append(f"#{number} does not cite {task} #{task_issue['number']}")
        delivered[task] = landed
    for number, group in by_pr.items():
        apart = [f'{a}+{b}' for a, ja in group for b, _ in group if a < b and b not in ja]
        if apart:
            report['conflict'].append(f"#{number} delivers tasks that do not name each other in Joins: {', '.join(apart)}")
    for number, pr in sorted(named.items()):
        if number in by_pr:
            continue
        if pr.get('merged_at'):
            report['unmatched'].append(f"#{number} {pr['title']}")
        elif pr.get('state') == 'open':
            report['in flight'].append(f"#{number} {pr['title']}")
    return delivered


def unmet_coverage(rows, header, by_number, ticked, report):
    """A delivered task whose Coverage criteria are still unticked."""
    at = header.index('Task')
    for r in rows:
        task = row_id(r[at])
        numbers = []
        for found in LINK.finditer(r[at]):
            pull = PULL_URL.search(found[2])
            if pull and by_number.get(int(pull[1]), {}).get('merged_at'):
                numbers.append(int(pull[1]))
        if not numbers:
            continue
        open_acs = [n for n in cited(cell(header, r, 'Coverage')) if not ticked.get(n)]
        if open_acs:
            prs = ', '.join(f'#{n}' for n in numbers)
            acs = ', '.join(f'AC{n}' for n in open_acs)
            report['unmet'].append(f'{task} ({prs}): {acs} unticked')


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


def integration_branch(ref: str, initiative: str) -> bool:
    """Whether ref is this initiative's integration branch for a long-lived branch."""
    prefix = f'i{initiative}/'
    return ref.startswith(prefix) and ref[len(prefix):] in LONG_LIVED


def epic_base(ref: str, initiative: str, epic: str | None = None) -> str | None:
    """The long-lived branch when ref is an epic base of this initiative, else None.

    When epic is given, the base must be that epic's. An epic base is iNN/eYY/<branch>."""
    prefix = f'i{initiative}/'
    if not ref.startswith(prefix):
        return None
    parts = ref[len(prefix):].split('/')
    if len(parts) != 2 or parts[1] not in LONG_LIVED:
        return None
    name = parts[0]
    if len(name) != 3 or name[0] != 'e' or not name[1:].isdigit():
        return None
    if epic is not None and name[1:] != epic:
        return None
    return parts[1]


def pr_repo(pr: dict) -> str:
    home = PULL_HOME.search(pr.get('html_url') or '')
    return home[1] if home else ''


def pending_refs(associated: set[tuple[str, str]], merged: set[tuple[str, str]],
                 opened: dict[tuple[str, str], int], home: str) -> list[str]:
    """Refs associated and not merged, naming an open pull request that would merge one."""
    pending = []
    for repo, ref in sorted(associated - merged):
        name = ref if not repo or repo.lower() == home.lower() else f'{repo}:{ref}'
        number = opened.get((repo, ref))
        pending.append(f'{name} (#{number} open)' if number else name)
    return pending


def unmerged_bases(prs: list[dict], initiative: str, home: str) -> list[str]:
    """Integration branches this initiative's pull requests target that have not merged.

    A branch is associated when a pull request naming one of its epics targets it, or targets an
    epic base cut from it. It has merged when a pull request with that head and the long-lived
    branch as its base has merged. An open pull request that would merge it is named on the report line."""
    associated: set[tuple[str, str]] = set()
    merged: set[tuple[str, str]] = set()
    opened: dict[tuple[str, str], int] = {}
    for pr in prs:
        repo = pr_repo(pr)
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        title = PR_REF.match(pr.get('title') or '')
        if title and title[1] == initiative and integration_branch(base, initiative):
            associated.add((repo, base))
        long_lived = epic_base(base, initiative) if title and title[1] == initiative else None
        if long_lived:
            associated.add((repo, f'i{initiative}/{long_lived}'))
        if integration_branch(head, initiative) and head == f'i{initiative}/{base}':
            key = (repo, head)
            if pr.get('merged_at'):
                merged.add(key)
            elif pr.get('state') == 'open':
                opened.setdefault(key, pr['number'])
    return pending_refs(associated, merged, opened, home)


def unmerged_epic_bases(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Epic bases this epic's task pull requests target that have not merged.

    A base is associated when a pull request naming this epic targets it. It has merged when a
    pull request with that head and the initiative integration branch as its base has merged. An
    open pull request that would merge it is named on the report line."""
    associated: set[tuple[str, str]] = set()
    merged: set[tuple[str, str]] = set()
    opened: dict[tuple[str, str], int] = {}
    for pr in prs:
        repo = pr_repo(pr)
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        title = PR_REF.match(pr.get('title') or '')
        if not title or title.groups() != (initiative, epic):
            continue
        if epic_base(base, initiative, epic):
            associated.add((repo, base))
        long_lived = epic_base(head, initiative, epic)
        if long_lived and base == f'i{initiative}/{long_lived}':
            key = (repo, head)
            if pr.get('merged_at'):
                merged.add(key)
            elif pr.get('state') == 'open':
                opened.setdefault(key, pr['number'])
    return pending_refs(associated, merged, opened, home)


def cited(text: str) -> list[int]:
    """The acceptance criteria an Coverage cell names."""
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
            acs = cited(cell(header, r, 'Coverage'))
            complete = bool(delivered.get(name)) and all(ticked.get(n) for n in acs)
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
        else:
            report['cleared'].append(name)
    return changed


def long_lived_names(project: str) -> tuple[str, ...]:
    """The long-lived branches: the subfolder names of .project in that checkout."""
    root = Path(project) / '.project'
    if not root.is_dir():
        sys.exit(f'no .project directory under {project}')
    names = tuple(sorted(p.name for p in root.iterdir() if p.is_dir() and not p.name.startswith('.')))
    if not names:
        sys.exit(f'{root} has no subfolders')
    return names


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
    parser.add_argument('--link', default='', help='epic: task ids to link to pull requests, open or merged, e.g. W01=950,W02=950')
    parser.add_argument('--tasks', nargs='*', default=[], help='epic: its task issues as JSON')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--project', default='', help='checkout whose .project subfolders are the long-lived branches')
    parser.add_argument('--fix', help='write the body here')
    args = parser.parse_args()
    global LONG_LIVED
    if args.project:
        LONG_LIVED = long_lived_names(args.project)
    elif Path('.project').is_dir():
        LONG_LIVED = long_lived_names('.')
    if (args.tick or args.link) and not args.fix:
        sys.exit('--tick and --link need --fix, which holds the body')

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
    report = {k: [] for k in ('linked', 'unmatched', 'conflict', 'in flight', 'uncited', 'ready to verify',
                              'unmet', 'ticked early', 'ticked', 'done', 'cleared', 'open questions', 'note', 'unmerged')}
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
        if grid is None or 'Coverage' not in grid[0]:
            sys.exit('Work Breakdown has no Coverage column; run format.py first')
        header, rows = grid[0], grid[2:]
        if kind == 'epic':
            delivered = epic_delivery(rows, header, named, links, args.tasks, initiative, epic, report, prs)
            questions = next((l for h, l in sections if h == 'Open Questions'), [])
            open_named = any(p.get('state') == 'open' for p in named.values())
            started = any(delivered.values()) or open_named or report['unmatched']
            if started and any(l.strip() for l in questions):
                report['open questions'].append('work has started while questions remain; resolve them '
                                                'in plan mode, since their answers may reshape the epic')
        else:
            delivered = initiative_delivery(rows, header, completed(args.epics), report)
        for r in rows:
            name = row_id(id_cell(header, r))
            for n in cited(cell(header, r, 'Coverage')):
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

    if kind == 'epic' and rows:
        unmet_coverage(rows, header, {p['number']: p for p in prs}, ticked, report)

    done_changed = False
    if kind != 'task' and rows:
        done_changed = sync_done(rows, header, delivered, ticked, kind, report)

    open_rows = [t for t, d in delivered.items() if not d] if kind != 'initiative' else []
    open_criteria = [f'{tag}{n}' for n, t in ticked.items() if not t]
    branches = ''
    epic_ready = kind == 'epic' and not open_criteria and not open_rows
    if (kind == 'initiative' and not open_criteria) or epic_ready:
        if kind == 'initiative' and not args.prs:
            branches = 'integration branches not given'
        elif not LONG_LIVED:
            branches = 'long-lived branches not given'
        elif args.prs:
            home = issue['repository_url'].split('/repos/', 1)[1]
            pending = (unmerged_bases(prs, initiative, home) if kind == 'initiative'
                       else unmerged_epic_bases(prs, initiative, epic, home))
            report['unmerged'].extend(pending)
            if report['unmerged']:
                branches = 'unmerged ' + ', '.join(report['unmerged'])
    print(f"#{issue['number']} {kind} ({issue['state']})")
    for name, items in report.items():
        for item in items:
            print(f'  {name}: {item}')
    reasons = [f"undelivered {', '.join(open_rows)}" if open_rows else '',
               f"unticked {', '.join(open_criteria)}" if open_criteria else '',
               branches]
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
