"""Bring a task, an epic or an initiative up to date with delivered work.

Usage:
  python3 sync.py issue-637.json --prs prs.json [--pr 950] [--tick AC1 --fix fixed-637.md]
  python3 sync.py issue-943.json --prs prs.json --links links.json [--tasks issue-637.json ...] [--link W01=950,W01=951,W02=950] [--project <checkout> --revision origin/i07/e00/main [--revision origin/i07/e00/workflows ...]] [--tick AC1 --fix fixed-943.md]
  python3 sync.py issue-936.json --epics issue-943.json issue-937.json ...
  python3 sync.py --names --project <checkout> --revision <revision>

The long-lived branch names are the ones config/branches states at the commit --revision resolves to, in the
repository --project locates. Which worktree --project is, and what its working files hold, choose nothing.
An epic sync names each of its epic bases as a --revision. The run reports the configuration path, the
resolved commit and the repository as the source of each statement it reads. An absent, empty or unreadable
statement, and a revision resolving to no commit, are reported unevaluable with that source. Statements that
disagree across the epic bases are each reported unevaluable with their source and names, and none is
selected. An epic sync with unevaluable names, or given no --project, reports each epic check that reads the
long-lived branches as not checked, and the epic is not closable.

With --names it reads one --revision and prints the long-lived branch names one per line, and the source on
standard error. Unevaluable names print unevaluable: with the source and why, and exit 1.

Each issue file is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. prs.json holds
pull requests as JSON lines, as the REST API returns them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json

links.json holds the closing issue references GitHub holds for those pull requests, as Fetch Pull
Request Issue Links writes them: an array of {repo, number, closingIssuesReferences: [{repo, number}]}.
An epic given --prs is given --links with them, and that file is where the issue a
pull request links is read.

A pull request's title names the epic it works on: [I07:E00] Purpose. Which of the epic's tasks it
delivers is read from its changes against the tasks' Descriptions, and recorded by linking each task's
id to it with --link.

Task issue ([I07:E00:W01]): --pr names the pull request that delivers it, open or merged, whose title
names the task's epic. Its criteria are ready to verify while that pull request is open, since the
evidence is what the pull request and its planning record carry. The task is delivered, and so
closable, once that pull request has merged.
Closed epics have their Work Breakdown normalized to the current columns before delivery is read;
--fix holds the normalized body for publication. Ambiguous tables are refused. Linked merged pull
requests with no prefix or a matching initiative/task prefix report the owning epic title to publish
and fetch again. A title naming another initiative or epic remains a conflict.

Epic: --link links each named task's id to a pull request naming the epic, open or merged, and refuses one that does not name this epic. An id repeats once for each pull request it links, one per long-lived branch; the row keeps the deliveries it links in place and gains each named one it lacks. A row whose id links its task issue links the pull request instead, and an existing delivery link is preserved; further work needs another task. A task is delivered when a linked pull request has merged, or its id links a commit. A linked pull request whose title names another epic is reported as a conflict and still delivers the task once it has merged. A linked pull request absent from the given pull requests is reported and does not deliver the task. A row that links a task issue and no pull request is delivered when that issue, given by --tasks, is closed as completed. An open pull request does not deliver the task. Done carries a tick when the row is delivered and every criterion its Coverage names is ticked. A row that links a merged pull request while a criterion its Coverage names is unticked is unmet, and its Done cell stays empty. Reported: a merged pull request naming the epic that no row links as unmatched, an open one no row links as in flight, other than a pull request whose head is an epic base, a linked pull request whose Development field does not link the task's issue as uncited, a review pull request that does not link the epic's issue as uncited, unmet coverage, a test plan disagreement, a row linked to a pull request naming another epic, rows sharing a pull request that do not name each other in Joins, work started while Open Questions remain, and an open review pull request whose References differ from the task pull requests merged into its base, naming both sets.
Initiative: a row is delivered when the epic issue its id links, given by --epics, is closed as
completed, and Done carries a tick then. A criterion is verified by the automated test it names, or
confirmed by the user where it names none. The initiative is closable once every criterion is ticked
and every epic row is delivered. Initiatives group and track their epics; delivery branches belong
to epics and tasks.

Reported for each acceptance criterion of a task, epic or initiative:
  - ready to verify: unticked after automatic evidence, and every row citing it is delivered (for a task issue, its pull
    request is open or merged);
  - ticked early: ticked while a row citing it is undelivered (for a task issue, while it has no
    pull request).
Epic criteria also tick automatically when their covering rows are delivered and every observing
check in their linked pull requests has passed. Each covering row needs an observation, and only
its Coverage can receive evidence. Existing criterion ticks are preserved.
--tick ticks the named criteria in the body written to --fix, and refuses one not ready to verify.
Tick a criterion only once it is confirmed to hold. A task is closable when every criterion is ticked
and every row is delivered. An epic is closable when those hold and every epic base its pull requests
target has merged into its long-lived branch. A pull request whose head is an epic base
merges that base and is not a task delivery. Each such base still unmerged is reported unmerged, naming
an open pull request that merges it when one is open. A draft is named draft. When a task has merged
into an epic base and the epic is not yet complete, that base is reported draft.

The closable report establishes normal delivery readiness. Completing the issue also requires the Development-link and repository-setting gate in closure.py.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import NamedTuple

from format import Review, Template, AC, LINK, TICK, cell, cells, done_mark, id_cell, join_sections, row, row_id, split_sections

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PR_REF = re.compile(r'^\[I(\d\d):E(\d\d)\]')
TICKED = re.compile(r'^- \[[xX]\] ')
ISSUE_URL = re.compile(r'/issues/(\d+)$')
PULL_URL = re.compile(r'/pull/(\d+)$')
PULL_HOME = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
BELONGS = re.compile(r'\b(?:belongs? to|left to|owned by)\s+(W\d\d)\b', re.IGNORECASE)
LONG_LIVED: tuple[str, ...] = ()


def attach_links(prs: list[dict], path: str) -> None:
    """Give each pull request the closing issue references GitHub holds for it.

    The file is what Fetch Pull Request Issue Links writes: an array of
    {repo, number, closingIssuesReferences: [{repo, number}]}. A pull request the file does not
    name holds no link."""
    held = {(entry.get('repo', '').lower(), entry['number']): entry.get('closingIssuesReferences') or []
            for entry in json.loads(Path(path).read_text())}
    for pr in prs:
        pr['closingIssuesReferences'] = held.get((pr_repo(pr).lower(), pr['number']), [])


def links_issue(pr: dict, key: tuple[str, int]) -> bool:
    """Whether the issue is among the pull request's closing issue references, which is what its
    Development field shows. Repository names match in any case."""
    repo, number = key
    return any(ref.get('number') == number and (ref.get('repo') or '').lower() == repo.lower()
               for ref in pr.get('closingIssuesReferences') or [])


def issue_key(issue: dict) -> tuple[str, int]:
    """The issue as repository and number, the form links_issue matches."""
    return issue['repository_url'].split('/repos/', 1)[1], issue['number']


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


def delivery_branch(pr: dict, initiative: str) -> str:
    """The long-lived branch a pull request delivers to: its base, or the branch its epic base names."""
    ref = (pr.get('base') or {}).get('ref') or ''
    return epic_base(ref, initiative) or ref


def compose_id(task: str, text: str, pulls: list[dict], by_url: dict, initiative: str) -> str:
    """Link one delivery per long-lived branch: the deliveries the row holds stay in place, and each
    named pull request the row lacks follows them."""
    named = {}
    for pr in pulls:
        branch = delivery_branch(pr, initiative)
        if pr['html_url'] not in named and branch in named.values():
            sys.exit(f'{task}: names two deliveries on {branch or "that branch"}; '
                     'further work needs another task')
        named.setdefault(pr['html_url'], branch)
    held = []
    for _, href in LINK.findall(text):
        if '/pull/' not in href and '/commit/' not in href:
            continue
        held.append(href)
        if href in named:
            continue
        other = by_url.get(href)
        if other is None or delivery_branch(other, initiative) in named.values():
            branch = delivery_branch(other, initiative) if other else ''
            sys.exit(f'{task}: already links a delivery on {branch or "that branch"}; '
                     'further work needs another task')
    return ', '.join(f'[{task}]({href})' for href in [*held, *(url for url in named if url not in held)])


def epic_delivery(rows, header, named, links, task_paths, initiative, epic, report, prs):
    delivered, by_pr = {}, {}
    given = {p['number']: p for p in prs}
    by_url = {p['html_url']: p for p in prs}
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
            pulls = []
            for number in links[task]:
                pr = named.get(number)
                if not pr:
                    sys.exit(f'--link {task}={number}: no pull request naming this epic')
                pulls.append(pr)
            linked = compose_id(task, r[at], pulls, by_url, initiative)
            if linked != r[at].strip():
                r[at] = linked
                numbers = ', '.join(f'#{n}' for n in dict.fromkeys(links[task]))
                report['linked'].append(f"{task} → {numbers}")
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
            key = issue_key(task_issue)
            for number in pulls:
                pr = named.get(number)
                if pr and not links_issue(pr, key):
                    report['uncited'].append(
                        f"#{number} does not link {task} #{task_issue['number']}")
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


def unmerged_epic_bases(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Epic bases this epic's task pull requests target that have not merged.

    A base is associated when a pull request naming this epic targets it or names it as head. It has merged when a
    pull request with that head and its long-lived branch as its base has merged. An
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
        if long_lived:
            associated.add((repo, head))
        if long_lived and base == long_lived:
            key = (repo, head)
            if pr.get('merged_at'):
                merged.add(key)
            elif pr.get('state') == 'open':
                opened.setdefault(key, (pr['number'], bool(pr.get('draft'))))
    return pending_refs(associated, merged, opened, home)


def draft_bases(prs: list[dict], initiative: str, epic: str, home: str) -> list[str]:
    """Epic bases a merged task targets while no pull request merges that base.

    The first task merged into a base is what opens the draft. A base that already has an open
    pull request, draft or ready, or that has merged into its long-lived branch, is not listed."""
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
        if epic_base(head, initiative, epic) == base and (pr.get('merged_at') or pr.get('state') == 'open'):
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


def unlinked_reviews(prs: list[dict], initiative: str, epic: str, key: tuple[str, int]) -> list[str]:
    """Review pull requests whose Development field does not link the epic's issue.

    A review pull request's head is this epic's base. One that closed without merging delivers
    nothing and is left out."""
    lines = []
    for pr in sorted(prs, key=lambda p: p['number']):
        head = (pr.get('head') or {}).get('ref') or ''
        if not epic_base(head, initiative, epic):
            continue
        if (pr.get('merged_at') or pr.get('state') == 'open') and not links_issue(pr, key):
            lines.append(f"#{pr['number']} does not link E{epic} #{key[1]}")
    return lines


def cited(text: str) -> list[int]:
    """The acceptance criteria an Coverage cell names."""
    return [int(n) for n in re.findall(r'\bAC(\d+)', text)]


def plan_rows(body: str) -> list[tuple[str, str, str]] | None:
    """Rows of the Test Plan table as (Test, Coverage, Pass). None when that table is absent."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    plans = [item for heading, item in sections if heading == 'Test Plan']
    if len(plans) != 1:
        return None
    lines = plans[0]
    if any(re.match(r' {0,3}(`{3,}|~{3,})', line) for line in lines):
        return None
    table = [line for line in lines if line.startswith('|')]
    if len(table) < 2:
        return None
    header = cells(table[0])
    if header != ['Test', 'Description', 'Coverage', 'Pass']:
        return None
    if len(cells(table[1])) != len(header) or not all(
            re.fullmatch(r':?-{3,}:?', c) for c in cells(table[1])):
        return None
    found = []
    for line in table[2:]:
        parsed = cells(line)
        if len(parsed) != len(header):
            return None
        found.append((cell(header, parsed, 'Test'), cell(header, parsed, 'Coverage'), cell(header, parsed, 'Pass')))
    return found


def plan_claims(body: str) -> tuple[set[int], set[int], set[int]]:
    """Named, observed and passed criteria; every observing check must pass."""
    named, observed, incomplete = set(), set(), set()
    for test, coverage, mark in plan_rows(body) or []:
        acs = set(cited(coverage))
        named |= acs
        if test.strip():
            observed |= acs
            link = LINK.fullmatch(mark)
            if not (link and done_mark(link[1]) == TICK
                    and re.fullmatch(r'https?://[^/\s?#]+(?:[/?#][^\s]*)?', link[2])):
                incomplete |= acs
    return named, observed, observed - incomplete


def passed_criteria(rows, header, by_number) -> set[int]:
    """Criteria supported by every covering task's linked delivery observations.

    A linked check contributes only to its task's Coverage. Every observing check
    must pass in a merged pull request, and each covering task needs an observation.
    Missing pull requests and unreadable plans supply no verifiable evidence.
    """
    supported, incomplete = set(), set()
    for r in rows:
        scope = set(cited(cell(header, r, 'Coverage')))
        observed = set()
        for _, href in LINK.findall(id_cell(header, r)):
            pull = PULL_URL.search(href)
            if not pull:
                continue
            pr = by_number.get(int(pull[1]))
            if not pr or plan_rows(pr.get('body') or '') is None:
                incomplete |= scope
                continue
            _named, checks, passed = plan_claims(pr.get('body') or '')
            observed |= checks & scope
            incomplete |= scope & (checks - passed if pr.get('merged_at') else checks)
        supported |= observed
        incomplete |= scope - observed
    return supported - incomplete


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


def plan_agreement(rows, header, by_number, report):
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
        if plan_rows(pr.get('body') or '') is None:
            report['disagreement'].append(f'#{number}: unreadable test plan')
            continue
        named, observed, _passed = plan_claims(pr.get('body') or '')
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


class Branches(NamedTuple):
    """The long-lived branch names one config/branches statement declares, and its source.

    problem is empty when the statement is readable and names a branch; otherwise it says why the
    names are unevaluable, and names is empty."""
    names: tuple[str, ...]
    source: str
    problem: str = ''


# The epic checks that read the long-lived branch names, named when a run cannot read them.
LONG_LIVED_CHECKS = ('epic-base pull requests set apart from task deliveries', 'unmerged epic bases',
                     'draft epic bases', 'review pull request References', 'review pull request issue links')


def git(project: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(['git', '-C', project, *args], capture_output=True, text=True)


def read_branches(project: str, revision: str) -> Branches:
    """The long-lived branches config/branches states at the commit revision resolves to.

    The checkout locates the repository and nothing more: its working files, and which of the
    repository's worktrees it is, do not choose the names. The source names the configuration path,
    the resolved commit and the repository's shared git directory, which every worktree of it
    resolves to; for a revision that resolves to no commit it names the revision. An absent, empty
    or unreadable statement, and a revision resolving to no commit, leave the names unevaluable."""
    common = git(project, 'rev-parse', '--path-format=absolute', '--git-common-dir')
    repository = common.stdout.strip() if common.returncode == 0 else project
    resolved = git(project, 'rev-parse', '--verify', '--quiet', '--end-of-options', f'{revision}^{{commit}}')
    if resolved.returncode != 0:
        return Branches((), f'config/branches at {revision} in {repository}',
                        'is unreadable: the revision resolves to no commit')
    commit = resolved.stdout.strip()
    source = f'config/branches at {commit} in {repository}'
    kind = git(project, 'cat-file', '-t', f'{commit}:config/branches')
    if kind.returncode != 0:
        return Branches((), source, 'is absent')
    if kind.stdout.strip() != 'blob':
        return Branches((), source, f'is unreadable: a {kind.stdout.strip()}, not a file')
    stated = subprocess.run(['git', '-C', project, 'cat-file', 'blob', f'{commit}:config/branches'],
                            capture_output=True)
    try:
        text = stated.stdout.decode('utf-8') if stated.returncode == 0 else None
    except UnicodeDecodeError:
        return Branches((), source, 'is unreadable: not UTF-8 text')
    if text is None:
        return Branches((), source, 'is unreadable')
    names = tuple(sorted({line.strip() for line in text.splitlines() if line.strip()}))
    if not names:
        return Branches((), source, 'names no branch')
    return Branches(names, source)


def long_lived_names(project: str, revision: str) -> Branches:
    """The long-lived branches config/branches states at revision, exiting on unevaluable names.

    The exit message is prefixed unevaluable: and names the source and why."""
    branches = read_branches(project, revision)
    if branches.problem:
        sys.exit(f'unevaluable: {branches.source} {branches.problem}')
    return branches


def epic_base_declarations(project: str, revisions: list[str]) -> tuple[tuple[str, ...], list[str], list[str]]:
    """The long-lived names an epic's base commits declare, the sources they agree from, and what is unevaluable.

    Each revision is read at its own commit, and revisions resolving to one commit are one source.
    The names are evaluable when every statement is readable and every one states the same names.
    Statements that disagree are each reported with their source and names, and none is selected.
    Evaluable names come with one source line each; otherwise the names are empty."""
    read: dict[str, Branches] = {}
    for revision in revisions:
        branches = read_branches(project, revision)
        read.setdefault(branches.source, branches)
    unevaluable = [f'{b.source} {b.problem}' for b in read.values() if b.problem]
    readable = [b for b in read.values() if not b.problem]
    if len({b.names for b in readable}) > 1:
        unevaluable += [f"{b.source} states {', '.join(b.names)}" for b in readable]
        return (), [], unevaluable
    if unevaluable:
        return (), [b.source for b in readable], unevaluable
    return readable[0].names, [b.source for b in readable], []


def list_long_lived(project: str, revisions: list[str]) -> int:
    """Print the long-lived branch names, one per line, and their source on standard error."""
    if not (project and revisions):
        sys.exit('--names needs --project and --revision')
    if len(revisions) > 1:
        sys.exit('--names reads one --revision')
    branches = long_lived_names(project, revisions[0])
    for name in branches.names:
        print(name)
    print(f'source: {branches.source}', file=sys.stderr)
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
    grid = [cells(l) for l in lines[start:end]]
    if 'Task' in grid[0]:
        for r in grid[2:]:
            ident = id_cell(grid[0], r)
            found = LINK.findall(ident)
            if len({text for text, _ in found}) > 1:
                raise Unreadable(f'{row_id(ident)}: every link on a task row names that row; resolve the others')
            if len({href for _, href in found}) < len(found):
                raise Unreadable(f'{row_id(ident)}: a task row links each delivery once; resolve the repeated links')
    return lines, start, end, grid


def normalize_closed_table(issue, sections, report):
    """Normalize a closed epic's table using the shared format rules before delivery reads it."""
    review = Review(issue)
    review.kind = 'epic'
    for section in sections:
        if section[0] != 'Work Breakdown':
            continue
        fixed = review.fix_table(section[1], Template('epic').columns)
        if review.decide:
            raise Unreadable('; '.join(review.decide))
        section[1] = fixed
        report['normalized'].extend(review.fixed)


def title_repairs(rows, header, prs, initiative, epic, report):
    """Report merged deliveries the rows link, --link included, needing their owning epic prefix for publication and readback."""
    linked = {href for r in rows for _, href in LINK.findall(id_cell(header, r))}
    for pr in prs:
        if pr['html_url'] not in linked or not pr.get('merged_at'):
            continue
        prefix = PREFIX.match(pr['title'])
        if prefix and (prefix[1] != initiative or prefix[2] not in (None, epic)):
            continue
        if PR_REF.match(pr['title']):
            continue
        purpose = pr['title'][prefix.end():].lstrip() if prefix else pr['title']
        report['retitle'].append(f"#{pr['number']} → [I{initiative}:E{epic}] {purpose}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue', nargs='?')
    parser.add_argument('--prs', help='task or epic: pull requests as JSON lines')
    parser.add_argument('--links', help='epic: the closing issue references its pull requests hold')
    parser.add_argument('--pr', type=int, help='task issue: the pull request that delivered it')
    parser.add_argument('--link', default='', help='epic: task ids to link to pull requests, open or merged, an id once for each, e.g. W01=950,W01=951,W02=950')
    parser.add_argument('--tasks', nargs='*', default=[], help='epic: its task issues as JSON')
    parser.add_argument('--epics', nargs='*', default=[], help='initiative: its epic issues as JSON')
    parser.add_argument('--tick', default='', help='criteria to tick, e.g. AC1,AC3')
    parser.add_argument('--project', default='', help='any checkout of the repository whose config/branches states the long-lived branch names')
    parser.add_argument('--revision', action='append', default=[], help='a commit config/branches is read at: for an epic, each of its epic bases, e.g. origin/i07/e00/main; repeat for several')
    parser.add_argument('--names', action='store_true', help='print the long-lived branch names, one per line')
    parser.add_argument('--fix', help='write the body here')
    args = parser.parse_args()
    if args.names:
        return list_long_lived(args.project, args.revision)
    if not args.issue:
        sys.exit('an issue file is required')
    if bool(args.project) != bool(args.revision):
        sys.exit('--project and --revision go together')
    global LONG_LIVED
    sources, unevaluable = [], ['long-lived branches not given']
    if args.project:
        LONG_LIVED, sources, unevaluable = epic_base_declarations(args.project, args.revision)
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
    if kind == 'epic' and args.prs and not args.links:
        sys.exit('--prs needs --links, which holds the issue each pull request links')
    prs = pull_requests(args.prs) if args.prs else []
    if args.links:
        attach_links(prs, args.links)
    named = for_epic(prs, initiative, epic) if epic else {}
    links: dict[str, list[int]] = {}
    for k, v in (x.split('=') for x in args.link.split(',') if x.strip()):
        links.setdefault(k.strip(), []).append(int(v))
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    report = {k: [] for k in ('normalized', 'retitle', 'linked', 'unmatched', 'conflict', 'in flight', 'uncited', 'ready to verify',
                              'unmet', 'disagreement', 'ticked early', 'ticked', 'done', 'cleared', 'open questions', 'note', 'unplaced', 'unmerged', 'draft', 'references', 'source', 'unevaluable', 'not checked')}
    report['source'].extend(sources)
    if kind == 'epic' or args.project:
        report['unevaluable'].extend(unevaluable)
    if kind == 'epic' and not LONG_LIVED:
        report['not checked'].extend(LONG_LIVED_CHECKS)
    tag, heading, label, ready_key = 'AC', 'Acceptance Criteria', AC, 'ready to verify'

    if kind == 'epic' and issue['state'] == 'closed':
        normalize_closed_table(issue, sections, report)
    lines, start, end, grid = table(sections)
    delivered: dict[str, bool] = {}
    verifiable: dict[str, bool] = {}
    citing: dict[int, list[str]] = {}
    rows = []
    if kind == 'task':
        pr = named.get(args.pr) if args.pr else None
        if args.pr and not pr:
            sys.exit(f'--pr {args.pr}: no pull request naming I{initiative}:E{epic}')
        merged = bool(pr and pr.get('merged_at'))
        if pr:
            report['linked'].append(f"{task} {'delivered by' if merged else 'in flight on'} "
                                    f"#{pr['number']}")
        delivered[task] = merged
        verifiable[task] = bool(pr)
    else:
        if grid is None or 'Coverage' not in grid[0]:
            sys.exit('Work Breakdown has no Coverage column; run format.py first')
        header, rows = grid[0], grid[2:]
        if kind == 'epic':
            delivered = epic_delivery(rows, header, named, links, args.tasks, initiative, epic, report, prs)
            title_repairs(rows, header, prs, initiative, epic, report)
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
    # A task's evidence is its pull request, which is readable while that pull request is open; an
    # epic's and an initiative's is what their rows have delivered.
    observable = verifiable if kind == 'task' else delivered
    evidenced = passed_criteria(rows, header, {p['number']: p for p in prs}) if kind == 'epic' else set()
    for n, is_ticked in ticked.items():
        rows_for = [task] if kind == 'task' else citing.get(n, [])
        done = bool(rows_for) and all(observable.get(t) for t in rows_for)
        if not is_ticked and done:
            ready.add(n)
            if n not in evidenced:
                report[ready_key].append(f"{tag}{n} ({', '.join(rows_for)})")
        if is_ticked and not done:
            pending = [t for t in rows_for if not observable.get(t)] or ['no row cites it']
            why = 'has no pull request' if kind == 'task' else 'undelivered'
            report['ticked early'].append(f"{tag}{n} ({', '.join(pending)} {why})")

    to_tick = {int(t.strip()[len(tag):]) for t in args.tick.split(',') if t.strip()}
    refused = sorted(to_tick - ready)
    if refused:
        sys.exit(f'{ready_key.replace("ready to", "not ready to")}, so not ticked: '
                 + ', '.join(f'{tag}{n}' for n in refused))
    to_tick |= ready & evidenced
    for i, line in enumerate(ac_lines):
        a = label.match(line)
        if a and int(a[1]) in to_tick:
            ac_lines[i] = '- [x] ' + line[6:]
            ticked[int(a[1])] = True
            report['ticked'].append(f'{tag}{a[1]}')

    if kind == 'epic' and rows:
        by_number = {p['number']: p for p in prs}
        unmet_coverage(rows, header, by_number, ticked, report)
        plan_agreement(rows, header, by_number, report)

    done_changed = False
    if kind != 'task' and rows:
        done_changed = sync_done(rows, header, delivered, ticked, kind, report)

    open_rows = [t for t, d in delivered.items() if not d]
    open_criteria = [f'{tag}{n}' for n, t in ticked.items() if not t]
    branches = ''
    epic_ready = kind == 'epic' and not open_criteria and not open_rows
    if epic_ready:
        if not LONG_LIVED:
            branches = 'long-lived branches unevaluable'
        else:
            home = issue['repository_url'].split('/repos/', 1)[1]
            report['unmerged'].extend(unmerged_epic_bases(prs, initiative, epic, home))
            if report['unmerged']:
                branches = 'unmerged ' + ', '.join(report['unmerged'])
    if kind == 'epic' and args.prs and LONG_LIVED:
        home = issue['repository_url'].split('/repos/', 1)[1]
        if not epic_ready:
            report['draft'].extend(draft_bases(prs, initiative, epic, home))
        report['references'].extend(review_references(prs, initiative, epic, home))
        report['uncited'].extend(unlinked_reviews(prs, initiative, epic, issue_key(issue)))
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
        Path(args.fix).write_text(join_sections(preamble, sections) if rewrite or report['ticked'] or report['normalized'] else body)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
