"""Bring a task, a hot-fix, an epic or an initiative up to date with delivered work.

Usage:
  python3 sync.py issue-637.json --prs prs.json [--pr 950] [--tick AC1 --fix fixed-637.md]
  python3 sync.py issue-943.json --prs prs.json --links links.json [--tasks issue-637.json ...] [--link W01=950,W01=951,W02=950] [--project <checkout> --revision origin/i07/e00/main [--revision origin/i07/e00/workflows ...]] [--tick AC1 --fix fixed-943.md]
  python3 sync.py issue-936.json --epics issue-943.json issue-937.json ... [--prs prs.json]
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
pull requests as JSON lines, as the REST API returns them: each one whose title names the initiative,
and each one a row or a Development link of its issues names whatever its title, as Read Initiative
Pull Requests fetches them:
  gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
  python3 linked-pull-requests.py --prs prs.json --issues issue-936.json issue-943.json issue-637.json

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
Hot-fix issue ([F00]): read as a task issue whose --pr is the pull request of its repository that
delivers it, as hotfix.delivering_pulls tests it against --links and the target the hot-fix's
Target: line names; a --pr that does not deliver it is refused with the condition it fails.
Closed epics have their Work Breakdown normalized to the current columns before delivery is read;
--fix holds the normalized body for publication. Ambiguous tables are refused. Linked merged pull
requests with no prefix or a matching initiative/task prefix report the owning epic title to publish
and fetch again. A title naming another initiative or epic remains a conflict. An epic or initiative
sync reports retitle for every pull request, linked or not, whose title names an epic of the initiative
by a task id, [I07:E00:W01], with the [I07:E00] title it takes.

Epic: --link links each named task's id to a pull request naming the epic, open or merged, and refuses one that does not name this epic. An id repeats once for each pull request it links, one per long-lived branch; the row keeps the deliveries it links in place and gains each named one it lacks. A row whose id links its task issue links the pull request instead, and an existing delivery link is preserved; further work needs another task. A task is delivered when a linked pull request has merged, or its id links a commit. A linked pull request whose title names another epic is reported as a conflict and still delivers the task once it has merged. A linked pull request absent from the given pull requests is reported and does not deliver the task. A row that links a task issue and no pull request is delivered when that issue, given by --tasks, is closed as completed; one whose task issue is not given is unchecked, keeps its Done cell, is reported unchanged, and leaves the epic not closable. An open pull request does not deliver the task. Done carries a tick when the row is delivered and every criterion its Coverage names is ticked. A row that links a merged pull request while a criterion its Coverage names is unticked is unmet, and its Done cell stays empty. Reported: a merged pull request naming the epic that no row links as unmatched, an open one no row links as in flight, other than a pull request whose head is an epic base, a linked pull request whose Development field does not link the task's issue as uncited, a review pull request that does not link the epic's issue as uncited, unmet coverage, a test plan disagreement, a row linked to a pull request naming another epic, rows sharing a pull request that do not name each other in Joins, work started while Open Questions remain, an open review pull request whose References differ from the task pull requests merged into its base, naming both sets, and an open review pull request whose Changes names a path in a code span that is absent from its head commit, naming that path. A span less any #anchor or :line suffix names a path when it is a component <branch>:<path> for the review's base, or holds a directory and either carries an extension or opens with a top-level directory of the head, or is a bare name whose extension a file at the head carries. A path with a directory stands where the head holds a file or a directory at it, and a bare file name anywhere in the tree; a head commit the --project repository does not hold is reported unevaluable.
Initiative: a row is delivered when the epic issue its id links, given by --epics, is closed as
completed, and Done carries a tick then. A row whose epic issue is not given is unchecked: its Done
cell stands as it is, the run reports it unchanged, and the initiative is not closable. A criterion is
verified by the automated test it names, or confirmed by the user where it names none. The initiative
is closable once every criterion is ticked and every epic row is delivered. Initiatives group and track their epics; delivery branches belong
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
an open pull request that merges it when one is open. A draft is named draft. While the epic is not yet
complete, an epic base a merged task targets is reported draft when it holds a commit its long-lived
branch lacks and no open pull request merges it. The base is read at the --revision naming it and the
long-lived branch beside it on the same remote, so origin/i07/e00/main is compared with origin/main. A
base level with or behind its branch draws no draft line. A base no --revision names, one in another
repository, and one whose long-lived branch resolves to no commit are reported unevaluable instead.

The branch contract: a task pull request naming the epic targets one of its epic bases, and an
integration pull request, whose head is an epic base, targets the long-lived branch that base names.
An open or merged pull request off that route is reported target, naming where it goes and where it
belongs. A task branch's last hyphenated word names the long-lived branch it belongs to only where
another pull request naming the epic comes from a branch of the same stem ending in another long-lived
branch, as a unit changing several long-lived branches takes one task branch per base. Otherwise the
target names it, as main or i07/e01/main does; else every epic base is named as one of them. An epic
or initiative sync reports as no epic each pull request whose title opens with the initiative's id,
[I07, and names neither an epic as [I07:E00] nor a task as [I07:E00:W01]: a bare [I07], or an epic id
in any other form, such as [I07:E1]. Nothing reads it as delivery.

The closable report establishes normal delivery readiness. Completing the issue also requires the Development-link gate in closure.py.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import NamedTuple

from format import Review, Template, AC, LINK, TICK, cell, cells, done_mark, id_cell, join_sections, row, row_id, split_sections
from hotfix import delivering_pulls, delivery_fault, hotfix_tag

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
SINGLE = ('task', 'hot-fix')
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
            report['note'].append(f'{task} links task issue #{number}; link its pull request')
            if number not in by_number:
                report['unchanged'].append(f'{task}: its task issue #{number} is not given by --tasks, so its Done cell stands')
                continue
            landed = issue_done(by_number[number])
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
    """Each row's delivery by the epic issue its id links. A row whose issue is not among epics is left out."""
    delivered = {}
    for r in rows:
        ident = id_cell(header, r)
        epic = row_id(ident)
        link = LINK.fullmatch(ident.strip())
        issue = ISSUE_URL.search(link[2]) if link else None
        if not issue:
            report['note'].append(f'{epic}: its id links no issue')
            delivered[epic] = False
        elif int(issue[1]) not in epics:
            report['unchanged'].append(f'{epic}: its issue #{issue[1]} is not given by --epics, so its Done cell stands')
        else:
            delivered[epic] = epics[int(issue[1])]
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


def base_lead(project: str, revisions: list[str], ref: str, long_lived: str) -> tuple[int, str]:
    """The commits an epic base holds that its long-lived branch lacks, or why they cannot be read.

    The base is read at the --revision that names it, such as origin/i07/e00/main, and the long-lived
    branch beside it on the same remote, as origin/main. The second value is empty when the count is
    read; otherwise it says why, and the count is 0."""
    named = next((r for r in revisions if r == ref or r.endswith('/' + ref)), None)
    if named is None:
        return 0, 'no --revision names it'
    branch = named[:len(named) - len(ref)] + long_lived
    for revision in (named, branch):
        if git(project, 'rev-parse', '--verify', '--quiet', '--end-of-options', f'{revision}^{{commit}}').returncode:
            return 0, f'{revision} resolves to no commit'
    counted = git(project, 'rev-list', '--count', f'{branch}..{named}', '--')
    if counted.returncode:
        return 0, f'{branch}..{named} is unreadable'
    return int(counted.stdout.strip()), ''


def draft_bases(prs: list[dict], initiative: str, epic: str, home: str,
                project: str, revisions: list[str]) -> tuple[list[str], list[str]]:
    """Epic bases holding a commit their long-lived branch lacks, a merged task targeting each, while no
    open pull request merges it; and the bases whose commits cannot be compared, each with the reason.

    What the base carries decides the line, read against the long-lived branch as base_lead reads it.
    A base level with or behind its branch has nothing to review and is not listed, whether or not an
    earlier pull request merged it. A base in another repository than the checkout cannot be compared."""
    landed: dict[tuple[str, str], str] = {}
    covered: set[tuple[str, str]] = set()
    for pr in prs:
        repo = pr_repo(pr)
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        title = PR_REF.match(pr.get('title') or '')
        if not title or title.groups() != (initiative, epic):
            continue
        long_lived = epic_base(base, initiative, epic)
        if pr.get('merged_at') and long_lived:
            landed[(repo, base)] = long_lived
        if epic_base(head, initiative, epic) == base and pr.get('state') == 'open':
            covered.add((repo, head))
    drafts, unread = [], []
    for (repo, ref), long_lived in sorted(landed.items()):
        if (repo, ref) in covered:
            continue
        foreign = repo and repo.lower() != home.lower()
        name = f'{repo}:{ref}' if foreign else ref
        if foreign:
            ahead, problem = 0, f'is in {repo}, not the --project repository'
        else:
            ahead, problem = base_lead(project, revisions, ref, long_lived)
        if problem:
            unread.append(f'draft {name}: {problem}, so what it carries against {long_lived} is unread')
        elif ahead:
            drafts.append(name)
    return drafts, unread


def misrouted(prs: list[dict], initiative: str, epic: str) -> list[str]:
    """Open or merged pull requests naming this epic that leave the branch contract.

    A task pull request targets one of this epic's bases. An integration pull request, whose head is
    one of those bases, targets the long-lived branch the base names."""
    named = [pr for pr in sorted(prs, key=lambda p: p['number'])
             if (title := PR_REF.match(pr.get('title') or '')) and title.groups() == (initiative, epic)]
    heads = {(pr.get('head') or {}).get('ref') or '' for pr in named}
    lines = []
    for pr in named:
        if not pr.get('merged_at') and pr.get('state') != 'open':
            continue
        base = (pr.get('base') or {}).get('ref') or ''
        head = (pr.get('head') or {}).get('ref') or ''
        lived = epic_base(head, initiative, epic)
        if lived and base != lived:
            lines.append(f"#{pr['number']} merges {head} into {base or 'no base'}; it targets {lived}")
        elif not lived and not epic_base(base, initiative, epic):
            bases = ' or '.join(f'i{initiative}/e{epic}/{branch}' for branch in belongs(head, base, heads))
            lines.append(f"#{pr['number']} targets {base or 'no base'}; it targets "
                         f"{'one of ' if ' or ' in bases else ''}{bases}")
    return lines


def belongs(head: str, base: str, heads: set[str]) -> tuple[str, ...]:
    """The long-lived branches whose epic base an off-route task pull request belongs in.

    A task branch's last hyphenated word names a long-lived branch only for a unit changing several,
    which takes one task branch per base: another of the epic's task branches in heads shares its stem
    and ends in another long-lived branch. Otherwise a target that is a long-lived branch, or ends in
    one as another epic's base does, names that branch. Otherwise every long-lived branch is a candidate."""
    stem, _, word = head.rpartition('-')
    siblings = {other_word for other_stem, _, other_word in (other.rpartition('-') for other in heads)
                if other_stem == stem and other_word != word}
    if stem and word in LONG_LIVED and siblings & set(LONG_LIVED):
        return (word,)
    target = base.rsplit('/', 1)[-1]
    return (target,) if target in LONG_LIVED else LONG_LIVED


def initiative_titles(prs: list[dict], initiative: str):
    """Each pull request whose title carries this initiative's prefix, with that prefix, in number order."""
    for pr in sorted(prs, key=lambda p: p['number']):
        prefix = PREFIX.match(pr.get('title') or '')
        if prefix and prefix[1] == initiative:
            yield pr, prefix


def epicless(prs: list[dict], initiative: str) -> list[str]:
    """Pull requests whose title opens with the initiative's id, as [I07 does, and names no epic as
    [I07:E00] or a task as [I07:E00:W01]: a bare [I07], or an epic id in any other form."""
    lines = []
    for pr in sorted(prs, key=lambda p: p['number']):
        title = pr.get('title') or ''
        prefix = PREFIX.match(title)
        if re.match(rf'\[I{initiative}(?!\d)', title) and not (prefix and prefix[2]):
            lines.append(f"#{pr['number']} {title}")
    return lines


def task_titled(prs: list[dict], initiative: str) -> list[str]:
    """Pull requests whose title names an epic by a task id, each with the title it takes."""
    return [f"#{pr['number']} → [I{initiative}:E{prefix[2]}] {pr['title'][prefix.end():].lstrip()}"
            for pr, prefix in initiative_titles(prs, initiative) if prefix[2] and prefix[3]]


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


# A code span that may name a path: no whitespace or pattern characters, less a #anchor or :line suffix.
NAMED_SPAN = re.compile(r'`([^`\s*?{}<>]+?)(?:#[^`\s]*|:\d+(?:-\d+)?)?`')
EXTENSION = re.compile(r'[^/]\.([A-Za-z][A-Za-z0-9]*)$')


def named_files(body: str) -> list[str]:
    """The code spans a body's Changes section holds that may name paths, in order, each once."""
    _, sections = split_sections((body or '').replace('\r\n', '\n'))
    text = '\n'.join(next((l for h, l in sections if h == 'Changes'), []))
    return list(dict.fromkeys(m.removeprefix('./').lstrip('/') for m in NAMED_SPAN.findall(text)))


def head_path(span: str, long_lived: str, extensions: set[str], roots: set[str]) -> str | None:
    """The path a Changes span names at the head of the base for long_lived, or None for a span naming none there.

    A component <branch>:<path> names its path on that branch. A span with a directory names a path when
    its last segment carries an extension or its first segment is a top-level directory at the head, so
    a branch such as i07/e00/main names nothing. A bare name is a file name only when its extension is
    one a file at the head carries, so a dotted code name such as board.Outputs names nothing."""
    branch, colon, path = span.partition(':')
    if colon and '/' not in branch:
        return path.lstrip('/') if branch == long_lived else None
    extension = EXTENSION.search(span)
    if '/' in span:
        return span if extension or span.split('/', 1)[0] in roots else None
    return span if extension and extension[1] in extensions else None


def review_changes(prs: list[dict], initiative: str, epic: str, home: str,
                   project: str) -> tuple[list[str], list[str]]:
    """Open review pull requests whose Changes name a file absent from the head of the base they front.

    A review pull request's head is an epic base, and its head commit is read in the repository
    project locates. A span names a path as head_path decides; a path with a directory stands where the
    head holds a file or a directory at that path, and a bare file name stands anywhere in the tree.
    Returns a line per absent path, and an unevaluable line per review whose head commit is not given
    or not held."""
    absent, unevaluable = [], []
    for pr in sorted(prs, key=lambda p: p['number']):
        head = pr.get('head') or {}
        if not (epic_base(head.get('ref') or '', initiative, epic) and pr.get('state') == 'open'):
            continue
        paths = named_files(pr.get('body') or '')
        if not paths:
            continue
        repo = pr_repo(pr)
        name = head['ref'] if not repo or repo.lower() == home.lower() else f"{repo}:{head['ref']}"
        sha = head.get('sha') or ''
        tree = git(project, 'ls-tree', '-r', '--name-only', '--end-of-options', sha) if sha else None
        if tree is None or tree.returncode != 0:
            why = f'head {sha} is not held in {project}' if sha else 'has no head commit'
            unevaluable.append(f"{name} (#{pr['number']}) Changes paths: {why}")
            continue
        files = set(tree.stdout.splitlines())
        names = {f.rsplit('/', 1)[-1] for f in files}
        extensions = {n.rsplit('.', 1)[-1] for n in names if '.' in n}
        held = files | {f.rsplit('/', depth)[0] for f in files for depth in range(1, f.count('/') + 1)}
        roots = {f.split('/', 1)[0] for f in files if '/' in f}
        long_lived = epic_base(head['ref'], initiative, epic)
        for span in paths:
            path = head_path(span, long_lived, extensions, roots)
            if path is not None and path.rstrip('/') not in (held if '/' in path else names):
                absent.append(f"{name} (#{pr['number']}) names {span}, absent at {sha[:9]}")
    return absent, unevaluable


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
    """Set a tick on each complete row, and clear it on each row that is not. A row absent from delivered keeps
    its Done cell. Returns whether any changed."""
    if 'Done' not in header:
        return False
    at = header.index('Done')
    changed = False
    for r in rows:
        name = row_id(id_cell(header, r))
        if name not in delivered:
            continue
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
                     'draft epic bases', 'review pull request References', 'review pull request Changes paths',
                     'review pull request issue links', 'pull request targets')


def git(project: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(['git', '-C', project, *args], capture_output=True, text=True)


def origin_repository(project: str) -> str:
    """The owner/name the checkout's origin remote URL ends in, whatever its form: scp-like with any
    host alias, ssh:// or https. '' when the checkout has no origin."""
    url = git(project, 'remote', 'get-url', 'origin').stdout.strip().rstrip('/')
    found = re.search(r'([^/:\s]+)/([^/:\s]+?)(?:\.git)?$', url)
    return f'{found[1]}/{found[2]}' if found else ''


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
    hotfix = hotfix_tag(issue)
    if not m and not hotfix:
        sys.exit(f"title has no [Ixx], [Ixx:Eyy], [Ixx:Eyy:Wzz] or [F00] prefix: {issue['title']}")
    if hotfix:
        initiative, epic, task, kind = None, None, hotfix, 'hot-fix'
    else:
        initiative, epic, task = m[1], m[2], m[3] and f'W{m[3]}'
        kind = 'task' if task else 'epic' if epic else 'initiative'
    if kind != 'initiative' and not args.prs:
        sys.exit(f'a {kind} needs --prs')
    if kind in ('epic', 'hot-fix') and args.prs and not args.links:
        sys.exit('--prs needs --links, which holds the issue each pull request links')
    prs = pull_requests(args.prs) if args.prs else []
    if args.links:
        attach_links(prs, args.links)
    if kind == 'hot-fix':
        named = {p['number']: p for p in delivering_pulls(prs, issue_key(issue), issue)}
    else:
        named = for_epic(prs, initiative, epic) if epic else {}
    links: dict[str, list[int]] = {}
    for k, v in (x.split('=') for x in args.link.split(',') if x.strip()):
        links.setdefault(k.strip(), []).append(int(v))
    body = (issue.get('body') or '').replace('\r\n', '\n')
    preamble, sections = split_sections(body)
    report = {k: [] for k in ('normalized', 'retitle', 'linked', 'unmatched', 'conflict', 'in flight', 'uncited', 'ready to verify',
                              'unmet', 'disagreement', 'ticked early', 'ticked', 'done', 'cleared', 'open questions', 'note', 'unchanged', 'unplaced', 'unmerged', 'draft', 'references', 'changes', 'target', 'no epic', 'source', 'unevaluable', 'not checked')}
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
    if kind in SINGLE:
        pr = named.get(args.pr) if args.pr else None
        if args.pr and not pr and kind == 'hot-fix':
            home = issue_key(issue)[0].lower()
            given = next((p for p in prs if p['number'] == args.pr and pr_repo(p).lower() == home), None)
            sys.exit(f'--pr {args.pr}: does not deliver {task}: '
                     + (delivery_fault(given, issue_key(issue), issue) if given else f'it is not among --prs for {home}'))
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
    observable = verifiable if kind in SINGLE else delivered
    evidenced = passed_criteria(rows, header, {p['number']: p for p in prs}) if kind == 'epic' else set()
    for n, is_ticked in ticked.items():
        rows_for = [task] if kind in SINGLE else citing.get(n, [])
        done = bool(rows_for) and all(observable.get(t) for t in rows_for)
        if not is_ticked and done:
            ready.add(n)
            if n not in evidenced:
                report[ready_key].append(f"{tag}{n} ({', '.join(rows_for)})")
        # A row this run was not given evidence for is unchecked, which shows no tick early.
        pending = [t for t in rows_for if t in observable and not observable[t]] if rows_for else ['no row cites it']
        if is_ticked and pending:
            why = 'has no pull request' if kind in SINGLE else 'undelivered'
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
    if kind not in SINGLE and rows:
        done_changed = sync_done(rows, header, delivered, ticked, kind, report)

    open_rows = [t for t, d in delivered.items() if not d]
    unchecked = [name for r in rows if (name := row_id(id_cell(header, r))) not in delivered]
    open_criteria = [f'{tag}{n}' for n, t in ticked.items() if not t]
    branches = ''
    epic_ready = kind == 'epic' and not open_criteria and not open_rows and not unchecked
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
            drafts, unread = draft_bases(prs, initiative, epic, home, args.project, args.revision)
            report['draft'].extend(drafts)
            report['unevaluable'].extend(unread)
        report['references'].extend(review_references(prs, initiative, epic, home))
        absent, unread = review_changes(prs, initiative, epic, home, args.project)
        report['changes'].extend(absent)
        report['unevaluable'].extend(unread)
        report['uncited'].extend(unlinked_reviews(prs, initiative, epic, issue_key(issue)))
        report['target'].extend(misrouted(prs, initiative, epic))
    if kind not in SINGLE:
        report['no epic'].extend(epicless(prs, initiative))
        report['retitle'].extend(line for line in task_titled(prs, initiative) if line not in report['retitle'])
    print(f"#{issue['number']} {kind} ({issue['state']})")
    for name, items in report.items():
        for item in items:
            print(f'  {name}: {item}')
    reasons = [f"undelivered {', '.join(open_rows)}" if open_rows else '',
               f"unchecked {', '.join(unchecked)}" if unchecked else '',
               f"unticked {', '.join(open_criteria)}" if open_criteria else '',
               branches]
    print('  closable: ' + ('no (' + ', '.join(filter(None, reasons)) + ')' if any(reasons) else 'yes'))

    if args.fix:
        rewrite = bool(report['linked']) and kind not in SINGLE or done_changed
        if rewrite:
            lines[start + 2:end] = [row(r) for r in rows]
        Path(args.fix).write_text(join_sections(preamble, sections) if rewrite or report['ticked'] or report['normalized'] else body)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Unreadable as unreadable:
        sys.exit(str(unreadable))
