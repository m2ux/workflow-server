"""Bring a task, an epic or an initiative up to date with delivered work.

Usage:
  python3 sync.py issue-637.json --prs prs.json [--pr 950] [--tick AC1 --fix fixed-637.md]
  python3 sync.py issue-943.json --prs prs.json [--tasks issue-637.json ...] [--link W01=950,W02=950] [--tick AC1 --fix fixed-943.md]
  python3 sync.py issue-936.json --epics issue-943.json issue-937.json ... --prs prs.json
  python3 sync.py --names --project <main> --initiative 07 --refs heads.txt

With --names it prints the long-lived branch names of --project, one per line. Where .project is absent, the names are the ones --initiative's integration branches in --refs carry. Where neither yields a name, it reports the names unevaluable.

Each issue file is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json

A pull request's title names the epic it works on: [I07:E00] Purpose. Which of the epic's tasks it
delivers is read from its changes against the tasks' Descriptions, and recorded by linking each task's
id to it with --link.

Task issue ([I07:E00:W01]): delivered by the merged pull request --pr names, whose title names the
task's epic.
Epic: --link links each named task's id to a pull request naming the epic, open or merged, and refuses one that does not name this epic. A row whose id links its task issue links the pull request instead, and a further pull request is linked after the ones already there. A task is delivered when a linked pull request has merged, or its id links a commit. A linked pull request whose title names another epic is reported as a conflict and still delivers the task once it has merged. A linked pull request absent from the given pull requests is reported and does not deliver the task. A row that links a task issue and no pull request is delivered when that issue, given by --tasks, is closed as completed. An open pull request does not deliver the task. Done carries a tick when the row is delivered and every criterion its Coverage names is ticked. A row that links a merged pull request while a criterion its Coverage names is unticked is unmet, and its Done cell stays empty. Reported: a merged pull request naming the epic that no row links as unmatched, an open one no row links as in flight, other than a pull request whose head is an epic base, a linked pull request whose body names the task's issue after no closing keyword as uncited, unmet coverage, a test plan disagreement, a row linked to a pull request naming another epic, rows sharing a pull request that do not name each other in Joins, work started while Open Questions remain, and an open review pull request whose References differ from the task pull requests merged into its base, naming both sets.
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
an open pull request that merges it when one is open. A draft is named draft. When a task has merged
into an epic base and the epic is not yet complete, that base is reported draft.
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
BELONGS = re.compile(r'\b(?:belongs? to|left to|owned by)\s+(W\d\d)\b', re.IGNORECASE)
KEYWORD = r'\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b:?\s+'
INTEGRATION = re.compile(r'^(?:refs/heads/)?i(\d\d)/([^/]+)$')
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


def closes(pr: dict, key: tuple[str, int]) -> bool:
    """Whether a pull request's body names the issue after a closing keyword, which is what fills
    its Development field. The issue is named as cites names it, in the body alone."""
    repo, number = key
    qualified = rf'(?:https?://github\.com/)?{re.escape(repo)}(?:/issues/|#){number}\b'
    home = PULL_HOME.search(pr.get('html_url') or '')
    if home and home[1].lower() == repo.lower():
        qualified = rf'(?:{qualified}|#{number}\b)'
    return bool(re.search(KEYWORD + qualified, pr.get('body') or '', re.IGNORECASE))


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
    row_tasks = {row_id(r[at]) for r in rows}
    for task, issue in sorted(by_task.items()):
        if task not in row_tasks:
            report['unplaced'].append(f"{task} #{issue['number']}")
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
                if pr and not closes(pr, key):
                    report['uncited'].append(
                        f"#{number} does not link {task} #{task_issue['number']} with a closing keyword")
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
                 opened: dict[tuple[str, str], tuple[int, bool]], home: str) -> list[str]:
    """Refs associated and not merged, naming an open pull request that would merge one.

    A draft pull request is named draft. Any other open pull request is named open."""
    pending = []
    for repo, ref in sorted(associated - merged):
        name = ref if not repo or repo.lower() == home.lower() else f'{repo}:{ref}'
        number, is_draft = opened.get((repo, ref), (0, False))
        if number:
            pending.append(f'{name} (#{number} {"draft" if is_draft else "open"})')
        else:
            pending.append(name)
    return pending


def unmerged_bases(prs: list[dict], initiative: str, home: str) -> list[str]:
    """Integration branches this initiative's pull requests target that have not merged.

    A branch is associated when a pull request naming one of its epics targets it, or targets an
    epic base cut from it. It has merged when a pull request with that head and the long-lived
    branch as its base has merged. An open pull request that would merge it is named on the report line."""
    associated: set[tuple[str, str]] = set()
    merged: set[tuple[str, str]] = set()
    opened: dict[tuple[str, str], tuple[int, bool]] = {}
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
                opened.setdefault(key, (pr['number'], bool(pr.get('draft'))))
    return pending_refs(associated, merged, opened, home)


def unmerged_epic_bases(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Epic bases this epic's task pull requests target that have not merged.

    A base is associated when a pull request naming this epic targets it. It has merged when a
    pull request with that head and the initiative integration branch as its base has merged. An
    open pull request that would merge it is named on the report line."""
    associated: set[tuple[str, str]] = set()
    merged: set[tuple[str, str]] = set()
    opened: dict[tuple[str, str], tuple[int, bool]] = {}
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
                opened.setdefault(key, (pr['number'], bool(pr.get('draft'))))
    return pending_refs(associated, merged, opened, home)


def draft_bases(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Epic bases a merged task targets while no pull request merges that base.

    The first task merged into a base is what opens the draft. A base that already has an open
    pull request, draft or ready, or that has merged into the integration branch, is not listed."""
    landed: set[tuple[str, str]] = set()
    covered: set[tuple[str, str]] = set()
    for pr in prs:
        repo = pr_repo(pr)
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        title = PR_REF.match(pr.get('title') or '')
        if not title or title.groups() != (initiative, epic):
            continue
        if pr.get('merged_at') and epic_base(base, initiative, epic):
            landed.add((repo, base))
        if epic_base(head, initiative, epic) and (pr.get('merged_at') or pr.get('state') == 'open'):
            covered.add((repo, head))
    pending = []
    for repo, ref in sorted(landed - covered):
        pending.append(ref if not repo or repo.lower() == home.lower() else f'{repo}:{ref}')
    return pending


def pull_numbers(found: set[int]) -> str:
    return ', '.join(f'#{n}' for n in sorted(found)) or 'none'


def references(body: str, repo: str) -> set[int]:
    """The pull requests a body's References section cites, by URL in repo or as a bare number."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    text = '\n'.join(next((l for h, l in sections if h == 'References'), []))
    found = {int(n) for n in re.findall(rf'github\.com/{re.escape(repo)}/pull/(\d+)', text, re.IGNORECASE)} if repo else set()
    return found | {int(n) for n in re.findall(r'(?<![\w/.-])#(\d+)\b', text)}


def review_references(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Open review pull requests whose References differ from the merges into their base.

    A review pull request's head is an epic base, and the task pull requests merged into that base
    are what its References cite. A difference is one line naming the cited set and the merged set."""
    landed: dict[tuple[str, str], set[int]] = {}
    reviews = []
    for pr in prs:
        repo = pr_repo(pr)
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        title = PR_REF.match(pr.get('title') or '')
        if not title or title.groups() != (initiative, epic):
            continue
        if pr.get('merged_at') and epic_base(base, initiative, epic):
            landed.setdefault((repo, base), set()).add(pr['number'])
        if epic_base(head, initiative, epic) and pr.get('state') == 'open':
            reviews.append(pr)
    lines = []
    for pr in sorted(reviews, key=lambda p: p['number']):
        repo = pr_repo(pr)
        key = (repo, (pr.get('head') or {}).get('ref') or '')
        merged, cites = landed.get(key, set()), references(pr.get('body') or '', repo)
        if cites == merged:
            continue
        name = key[1] if not repo or repo.lower() == home.lower() else f'{repo}:{key[1]}'
        lines.append(f"{name} (#{pr['number']}) cites {pull_numbers(cites)}; merged {pull_numbers(merged)}")
    return lines


def cited(text: str) -> list[int]:
    """The acceptance criteria an Coverage cell names."""
    return [int(n) for n in re.findall(r'\bAC(\d+)', text)]


def plan_rows(body: str) -> list[tuple[str, str, str]] | None:
    """Rows of the Test Plan table as (Test, Coverage, Pass). None when that table is absent."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    lines = next((item for heading, item in sections if heading == 'Test Plan'), None)
    if lines is None:
        return None
    table = [line for line in lines if line.startswith('|')]
    if len(table) < 2:
        return None
    header = cells(table[0])
    if 'Test' not in header or 'Coverage' not in header or 'Pass' not in header:
        return None
    found = []
    for line in table[2:]:
        parsed = cells(line)
        found.append((cell(header, parsed, 'Test'), cell(header, parsed, 'Coverage'), cell(header, parsed, 'Pass')))
    return found


def plan_claims(body: str) -> tuple[set[int], set[int]]:
    """Criteria a test plan's Coverage column names, and those a row with a Test cell names. An empty Test cell names its criteria and observes none."""
    named, observed = set(), set()
    for test, coverage, _mark in plan_rows(body) or []:
        acs = set(cited(coverage))
        named |= acs
        if test.strip():
            observed |= acs
    return named, observed


def prose_lines(body: str) -> str:
    """The body with fenced blocks and table rows left out, so a sentence is read once."""
    lines, fence = [], False
    for line in (body or '').replace('\r\n', '\n').split('\n'):
        if line.startswith('```'):
            fence = not fence
            continue
        if fence or line.startswith('|'):
            continue
        lines.append(line)
    return '\n'.join(lines)


def assignments(body: str) -> list[tuple[int, str]]:
    """Criteria a sentence assigns to a task when it says the criterion belongs to, is left to, or is owned by that task."""
    found, seen = [], set()
    for sentence in re.split(r'(?<=[.!?])\s+', prose_lines(body)):
        previous = 0
        for match in BELONGS.finditer(sentence):
            task = 'W' + match.group(1)[1:]
            for number in cited(sentence[previous:match.start()]):
                key = (number, task)
                if key not in seen:
                    seen.add(key)
                    found.append(key)
            previous = match.end()
    return found


def test_plan_agreement(rows, header, by_number, report):
    """A linked pull request's test plan against the Coverage of the rows it delivers."""
    at = header.index('Task')
    coverage: dict[str, set[int]] = {}
    by_pr: dict[int, list[str]] = {}
    for r in rows:
        task = row_id(r[at])
        coverage[task] = set(cited(cell(header, r, 'Coverage')))
        for found in LINK.finditer(r[at]):
            pull = PULL_URL.search(found[2])
            if not pull:
                continue
            tasks = by_pr.setdefault(int(pull[1]), [])
            if task not in tasks:
                tasks.append(task)
    owners: dict[int, list[str]] = {}
    for task, acs in coverage.items():
        for number in acs:
            given = owners.setdefault(number, [])
            if task not in given:
                given.append(task)
    for number, tasks in sorted(by_pr.items()):
        pr = by_number.get(number)
        if not pr:
            continue
        named, observed = plan_claims(pr.get('body') or '')
        union = set().union(*(coverage[task] for task in tasks))
        label = ', '.join(tasks)
        verb = 'does' if len(tasks) == 1 else 'do'
        noun = 'row' if len(tasks) == 1 else 'rows'
        for ac in sorted(named - union):
            report['disagreement'].append(
                f'#{number} {label}: AC{ac} named, which the {noun} {verb} not cover')
        for task in tasks:
            for ac in sorted(coverage[task] - named):
                report['disagreement'].append(f'#{number} {task}: AC{ac} covered and named by no test')
            for ac in sorted((coverage[task] & named) - observed):
                report['disagreement'].append(f'#{number} {task}: AC{ac} covered and no test observes it')
        for ac, task in assignments(pr.get('body') or ''):
            given = owners.get(ac, [])
            if task in given:
                continue
            who = ', '.join(given) if given else 'no row'
            report['disagreement'].append(
                f'#{number} {task}: AC{ac} assigned to {task}, which the table gives to {who}')


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


def integration_names(refs: list[str], initiative: str) -> tuple[str, ...]:
    """Long-lived names an initiative's integration branches carry.

    An integration branch is iNN/<name>. i01/workflows names workflows."""
    found = set()
    for line in refs:
        ref = line.strip()
        if '\t' in ref:
            ref = ref.split('\t', 1)[1].strip()
        matched = INTEGRATION.fullmatch(ref)
        if matched and matched[1] == initiative:
            found.add(matched[2])
    return tuple(sorted(found))


def long_lived_names(project: str, refs: list[str] | None = None, initiative: str = '') -> tuple[str, ...]:
    """The long-lived branches of a checkout.

    Where .project exists, its subfolder names. Where it does not, the names the initiative's
    integration branches carry. The call exits when the directory exists and has no subfolders,
    and when the directory is absent and no integration branch names one."""
    root = Path(project) / '.project'
    if root.is_dir():
        names = tuple(sorted(p.name for p in root.iterdir() if p.is_dir() and not p.name.startswith('.')))
        if not names:
            sys.exit(f'{root} has no subfolders')
        return names
    derived = integration_names(refs or [], initiative)
    if not derived:
        sys.exit('unevaluable: no .project directory under '
                 f'{project} and no integration branch names the long-lived branches')
    return derived


def list_long_lived(project: str, refs_path: str, initiative: str) -> int:
    """Print the long-lived branch names, one per line."""
    if not project:
        sys.exit('--names needs --project')
    refs = Path(refs_path).read_text().splitlines() if refs_path else []
    for name in long_lived_names(project, refs, initiative):
        print(name)
    return 0


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
    parser.add_argument('issue', nargs='?')
    parser.add_argument('--prs', help='task or epic: pull requests as JSON lines')
    parser.add_argument('--pr', type=int, help='task issue: the pull request that delivered it')
    parser.add_argument('--link', default='', help='epic: task ids to link to pull requests, open or merged, e.g. W01=950,W02=950')
    parser.add_argument('--tasks', nargs='*', default=[], help='epic: its task issues as JSON')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--project', default='', help='checkout the long-lived branch names are read from')
    parser.add_argument('--names', action='store_true', help='print the long-lived branch names, one per line')
    parser.add_argument('--refs', default='', help='branch heads, one per line, read when .project is absent')
    parser.add_argument('--initiative', default='', help='initiative number, as 07, whose integration branches name the long-lived branches')
    parser.add_argument('--fix', help='write the body here')
    args = parser.parse_args()
    if args.names:
        return list_long_lived(args.project, args.refs, args.initiative)
    if not args.issue:
        sys.exit('an issue file is required')
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
                              'unmet', 'disagreement', 'ticked early', 'ticked', 'done', 'cleared', 'open questions', 'note', 'unplaced', 'unmerged', 'draft', 'references')}
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
        by_number = {p['number']: p for p in prs}
        unmet_coverage(rows, header, by_number, ticked, report)
        test_plan_agreement(rows, header, by_number, report)

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
    if kind == 'epic' and args.prs and LONG_LIVED:
        home = issue['repository_url'].split('/repos/', 1)[1]
        if not epic_ready:
            report['draft'].extend(draft_bases(prs, initiative, epic, home))
        report['references'].extend(review_references(prs, initiative, epic, home))
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
