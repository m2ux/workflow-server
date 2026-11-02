"""Bring an initiative's theme board up to date with its issues.

Usage:
  python3 board.py issue-936.json --epics issue-943.json ... --tasks issue-637.json ... --prs prs.json
      --links links.json --board users/{owner}/projectsV2/9 --fields fields.json --items items.json
      --out board/ --assignee m2ux
      [--others issue-750.json ...]

Issue files are as `gh api repos/{owner}/{repo}/issues/943` returns them, and prs.json as sync.py
reads it. links.json holds the closing issue references GitHub holds for those pull requests, as
Fetch Pull Request Issue Links writes them, and is where the issue a pull request links is read.
A board's fields and items are as the REST API returns them, pages concatenated:
  gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
  gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=<Status field id>" > items.json
An organization's board is under orgs/{owner} in place of users/{owner}.

The board covers the initiative, every epic its Work Breakdown links, and each task issue whose
title names a task of those epics or whose issue an epic row links, in whichever repository each
lives. An issue is known by its repository and number, so an epic another repository holds is tracked like one of the initiative's own, and two
repositories' issues of one number stay apart. Every item on the board whose issue is closed
other than as completed is removed, whether or not those bodies cite it. Each issue's Status, first
match wins:
  Done         closed as completed
  (removed)    closed any other way
  In Review    an open initiative whose criteria are all ticked; an epic with ticked criteria and
               current agent review
  In Progress  a task issue an open pull request, draft or ready, delivers: its title names the
               epic by the initiative's row id, and its Development field links the issue; a task
               whose row links the planning record a session holds it with; an active epic with a
               criterion unticked; an initiative an epic its table lists holds In Review or In
               Progress
  Ready        a task whose epic is Ready or In Progress, whose every dependency is delivered,
               and that has no Open Questions
  (unchanged)  a task gated on a dependency entry that cannot resolve
  Backlog      a task otherwise
An open epic is active when a task row links the planning record a session holds it with, or an
open pull request whose title names the epic is not the epic's integration pull request. A
delivered row is not activity. An inactive epic keeps Ready or Backlog, and In Progress or In
Review becomes Backlog; one not yet on the board is added at Backlog. An initiative no listed
epic holds In Progress or In Review keeps the Status it holds, In Review becoming In Progress,
and one not yet on the board is added at Backlog: Advance mode places and lowers initiatives.
An epic that has left the initiative's table is not read.

Only an initiative or an epic stands In Review. A task issue is In Progress while its pull request
is open, and Done once that pull request merges into the epic base and the issue closes as
completed. An open initiative is In Review when every acceptance criterion is ticked. An epic also
requires current published agent review evidence from --agent-reviews; a missing or failing review
holds it In Progress.

The board's Status field offers Backlog, Ready, In Progress and Done, and In Review optionally;
statuses.py holds the field, the option body files and the fallback for an option the board lacks.

A dependency within an epic is delivered when its task row is, or its issue is closed as completed. A dependency on another epic's task is met when that row is delivered and each output it delivered is available at the consumer's base, as Outputs verifies; the producer epic's other rows and its closure gate nothing. It gates the row naming it and leaves its siblings free. board.py reads no checkout, so an output in the consumer's own repository is unverified here, and a task naming its row stays in Backlog until its session holds it; an output another repository holds is available once it has reached its long-lived branch. An epic starts only after every prerequisite epic its initiative row names is completed. A task row is
delivered when a linked pull request has merged, or its id links a commit. A row that links a task
issue and no pull request is delivered when that issue is closed as completed. An open pull request
does not deliver the task. A bare #750 names an issue in the repository of the issue whose row cites it. An entry naming no row and
linking no issue, naming an issue not given (another initiative's epic, #750) or naming a row an
epic does not carry cannot resolve: the entry is named, the task it gates keeps the Status it
holds, and the run exits 1. Give the missing issue with --others to resolve it. An issue outside
the initiative's repository prints as owner/repo#number.

An issue from Ready on is assigned to the --assignee user, and one in Backlog has no assignee.

Printed: the gh call for each issue to add, item to remove, Status to set and assignee to add or
remove, which statuses.py renders within the DELIVERY jurisdiction. Run the calls, fetch the issues
and items again and re-run: the board is current when nothing is left to do.
"""
from agent_review import epic_check, integration, load_records

import argparse
import json
import re
import sys
from collections.abc import Iterable
from enum import Enum
from pathlib import Path
from typing import NamedTuple

from format import AC, LINK, cell, id_cell, reservation, row_id, split_sections
from statuses import (DELIVERY, STATUSES, Changes, Jurisdiction, Key, StatusField, board_items,
                      key_of, label)
from sync import PR_REF, TICKED, Unreadable, attach_links, git, links_issue, pull_requests, table

PREFIX = re.compile(r'^\[I(\d\d)(?::E(\d\d))?(?::W(\d\d))?\]')
PULL_REF = re.compile(r'github\.com/([^/]+/[^/]+)/pull/\d+')
ISSUE_REF = re.compile(r'github\.com/([^/]+/[^/]+)/issues/(\d+)$')
RANGE = re.compile(r'^W(\d\d)[–-]W(\d\d)$')
TASK_REF = re.compile(r'(?:^|:)(W\d\d)$')
REPO_OF = re.compile(r'github\.com/([^/]+/[^/]+)/(?:pull|commit)/')
EPIC_BASE = re.compile(r'^i\d\d/e\d\d/(?!w\d\d(?:-|$))([^/]+)$')
INITIATIVE_REF = re.compile(r'^i\d\d/')
REMOTE = 'origin'
UNPLACED, RETAINED = 'unplaced', 'retained'
READY_UNDER = ('Ready', 'In Progress')  # a parent Status under which a child can be Ready


def load(paths: list[str]) -> dict[Key, dict]:
    return {key_of(i): i for i in (json.loads(Path(p).read_text()) for p in paths)}


def completed(issue: dict) -> bool:
    return issue['state'] == 'closed' and issue.get('state_reason') == 'completed'


def criteria_met(issue: dict) -> bool:
    """Whether the issue has acceptance criteria and every one is ticked."""
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    lines = next((l for h, l in sections if h == 'Acceptance Criteria'), [])
    found = [TICKED.match(line) for line in lines if AC.match(line)]
    return bool(found) and all(found)


def open_questions(issue: dict) -> bool:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    return any(l.strip() for h, lines in sections if h == 'Open Questions' for l in lines)


def rows(issue: dict) -> tuple[list[str], list[list[str]]]:
    _, sections = split_sections((issue.get('body') or '').replace('\r\n', '\n'))
    _, _, _, grid = table(sections)
    return (grid[0], grid[2:]) if grid else ([], [])


def repo_of(url: str) -> str:
    """The owner/repo a pull request or commit URL names, or empty."""
    found = REPO_OF.search(url)
    return found[1] if found else ''


def issue_url(url: str) -> Key | None:
    found = ISSUE_REF.search(url)
    return (found[1], int(found[2])) if found else None


def linked_issue(cell: str) -> Key | None:
    link = LINK.fullmatch(cell)
    return issue_url(link[2]) if link else None


def delivers(pr: dict, tag: str, epic: str) -> bool:
    """Whether an open pull request carries task work to epic Ixx:Eyy: its title names the epic,
    and it is not the epic's integration pull request."""
    ref = PR_REF.match(pr.get('title') or '')
    return (pr.get('state') == 'open' and bool(ref) and ref.groups() == (tag, epic)
            and not integration(pr, tag, epic))


class Resolution(Enum):
    """How far a Depends on entry resolves. MET is delivered and UNMET is waiting on delivery that
    can still arrive. UNRESOLVABLE is a permanent condition: nothing the plan does next makes the
    entry readable, so a caller gating a row on it reports the entry rather than holding the row."""
    MET = 'met'
    UNMET = 'unmet'
    UNRESOLVABLE = 'unresolvable'


RESOLUTIONS = (Resolution.MET, Resolution.UNMET, Resolution.UNRESOLVABLE)
UNRESOLVABLE = 'cannot resolve'


def weakest(answers: Iterable[Resolution]) -> Resolution:
    """The least resolved of the answers, every one of them read, so each unresolvable entry of a
    cell is reported rather than only the first."""
    found = Resolution.MET
    for answer in answers:
        if RESOLUTIONS.index(answer) > RESOLUTIONS.index(found):
            found = answer
    return found


class Output(NamedTuple):
    """One output a delivered producer row carries: the delivery naming it, the repository holding
    it, its commit, the long-lived branch it lands on, and the pull request delivering it. The branch
    is empty for a linked commit, and for a pull request merged into a ref that is neither an epic
    base nor a long-lived branch, such as a task branch."""
    delivery: str
    repo: str
    identity: str
    branch: str
    pull: dict | None = None


def landing(base: str) -> str:
    """The long-lived branch a pull request merged into base lands on: the last segment of an epic
    base, the base itself outside the initiative namespace, and empty for any other initiative ref."""
    lived = EPIC_BASE.match(base)
    return lived[1] if lived else '' if INITIATIVE_REF.match(base) else base


def off_route(pull: dict) -> str:
    base = (pull.get('base') or {}).get('ref') or ''
    return f'it merged into {base}, which is neither an epic base nor a long-lived branch'


class Outputs:
    """Whether an output a producer row delivered is available at its consumer's base commit, read
    in the repository project locates.

    It is available when its commit is an ancestor of the consumer epic's base on the output's
    long-lived branch, as the remote holds it, or of that branch while the consumer has no base
    there; a linked commit is read against each base the consumer has. A merge into the producer's
    own base alone is not availability. Every reading is recorded in lines, naming the producer
    row, the output, the consumer commit and the answer. An output with no commit, one the checkout
    does not hold, one merged into a branch that is neither an epic base nor a long-lived branch, such
    as a task branch, or a reading with no project is unverified, and leaves the row unmet."""

    def __init__(self, project: str = ''):
        self.project = project
        self.lines: list[str] = []

    def commit(self, revision: str) -> str:
        done = git(self.project, 'rev-parse', '--verify', '--quiet', revision + '^{commit}')
        return done.stdout.strip() if done.returncode == 0 else ''

    def consumer(self, prefix: str, branch: str) -> list[tuple[str, str]]:
        """The (revision, commit) an output on branch is read against, or every consumer base for
        a commit on no named branch."""
        if not branch:
            if not prefix:
                return []
            done = git(self.project, 'for-each-ref', '--format=%(refname:short)', f'refs/remotes/{REMOTE}/{prefix}/')
            names = done.stdout.split() if done.returncode == 0 else []
            return [(name, found) for name in names if (found := self.commit(name))]
        for revision in ([f'{REMOTE}/{prefix}/{branch}'] if prefix else []) + [f'{REMOTE}/{branch}']:
            if found := self.commit(revision):
                return [(revision, found)]
        return []

    def read(self, output: Output, prefix: str, why: str) -> Resolution:
        """Whether output is available to the consumer whose branch prefix, such as i07/e01, is
        prefix, empty for an initiative."""
        named = f'{why}: {output.delivery}'
        if not self.project:
            self.lines.append(f'{named} unverified: no checkout to read it in')
            return Resolution.UNMET
        if not output.identity:
            self.lines.append(f'{named} unverified: it records no merge commit')
            return Resolution.UNMET
        if not self.commit(output.identity):
            self.lines.append(f'{named} unverified: {output.identity[:12]} is not in the checkout')
            return Resolution.UNMET
        if output.pull is not None and not output.branch:
            self.lines.append(f'{named} {output.identity[:12]} unverified: {off_route(output.pull)}')
            return Resolution.UNMET
        targets = self.consumer(prefix, output.branch)
        if not targets:
            place = '/'.join(part for part in (prefix, output.branch) if part)
            self.lines.append(f'{named} {output.identity[:12]} unverified: {REMOTE}/{place} resolves to no commit')
            return Resolution.UNMET
        held = [(revision, found) for revision, found in targets
                if git(self.project, 'merge-base', '--is-ancestor', output.identity, found).returncode == 0]
        revision, found = (held or targets)[0]
        self.lines.append(f"{named} {output.identity[:12]} {'available' if held else 'absent'} "
                          f'at {revision} {found[:12]}')
        return Resolution.MET if held else Resolution.UNMET


class Board:
    def __init__(self, issues: dict[Key, dict], unresolved: list[str], home: str, prs: list[dict] | None = None,
                 outputs: Outputs | None = None):
        self.issues = issues
        self.outputs = outputs or Outputs()
        self.unresolved = unresolved
        self.home = home
        self.pulls = {p['html_url']: p for p in prs or []}
        self.tables: dict[Key, tuple[list[str], dict[str, list[str]]]] = {}

    def table(self, key: Key) -> tuple[list[str], dict[str, list[str]]]:
        """An issue's Work Breakdown header, and its rows by id."""
        if key not in self.tables:
            header, body = rows(self.issues[key])
            self.tables[key] = header, {i: r for r in body if (i := row_id(id_cell(header, r)))}
        return self.tables[key]

    def active(self, key: Key) -> bool:
        """Whether an epic has work under way: a task row linking the planning record a session
        holds it with, or an open pull request delivering to it. Raises Unreadable for a table
        that cannot be read."""
        header, tasks = self.table(key)
        if any(reservation(id_cell(header, r)) for r in tasks.values()):
            return True
        ref = PR_REF.match(self.issues[key].get('title') or '')
        return bool(ref) and any(delivers(p, *ref.groups()) for p in self.pulls.values())

    def row_delivered(self, key: Key, task: str, why: str) -> Resolution:
        try:
            header, found = self.table(key)
        except Unreadable as exc:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {task}: {exc}')
            return Resolution.UNRESOLVABLE
        r = found.get(task)
        if r is None:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {task}: {label(key, self.home)} has no such row')
            return Resolution.UNRESOLVABLE
        ident = id_cell(header, r)
        pulls = commits = merged = False
        for found in LINK.finditer(ident):
            if '/commit/' in found[2]:
                commits = True
            elif '/pull/' in found[2]:
                pulls = True
                pr = self.pulls.get(found[2])
                if pr is None:
                    self.unresolved.append(f'{why}: {found[2]} is not in --prs')
                elif pr.get('merged_at'):
                    merged = True
        if commits or merged:
            return Resolution.MET
        if pulls:
            return Resolution.UNMET
        issue = linked_issue(ident)
        if issue is None:
            return Resolution.UNMET
        return self.issue_delivered(issue, why)

    def delivered_outputs(self, key: Key, task: str) -> list[Output]:
        """The outputs a delivered row carries: the merge commit of each merged pull request it
        links, on the long-lived branch its base names, and each commit it links."""
        header, found = self.table(key)
        outputs = []
        for link in LINK.finditer(id_cell(header, found[task])):
            href = link[2]
            repo = repo_of(href)
            if '/commit/' in href:
                outputs.append(Output(href, repo, href.rstrip('/').rsplit('/', 1)[-1], ''))
            elif (pr := self.pulls.get(href)) and pr.get('merged_at'):
                base = (pr.get('base') or {}).get('ref') or ''
                outputs.append(Output(label((repo, pr['number']), self.home), repo,
                                      pr.get('merge_commit_sha') or '', landing(base), pr))
        return outputs

    def integrated(self, output: Output, why: str) -> Resolution:
        """Whether an output another repository holds has reached its long-lived branch: it was
        delivered to that branch, or a pull request merging its epic base into the branch merged
        after it."""
        named = f'{why}: {output.delivery}'
        if output.pull is None:
            self.outputs.lines.append(f'{named} unverified: {output.repo} holds it on no named branch')
            return Resolution.UNMET
        if not output.branch:
            self.outputs.lines.append(f'{named} unverified: {off_route(output.pull)}')
            return Resolution.UNMET
        base = (output.pull.get('base') or {}).get('ref') or ''
        if base == output.branch:
            self.outputs.lines.append(f'{named} available on {output.repo} {output.branch}')
            return Resolution.MET
        merges = sorted(p['number'] for p in self.pulls.values()
                        if repo_of(p['html_url']) == output.repo
                        and (p.get('head') or {}).get('ref') == base
                        and (p.get('base') or {}).get('ref') == output.branch
                        and (p.get('merged_at') or '') >= output.pull['merged_at'])
        if merges:
            self.outputs.lines.append(f'{named} available on {output.repo} {output.branch} by '
                                      f'{label((output.repo, merges[0]), self.home)}')
            return Resolution.MET
        self.outputs.lines.append(f'{named} absent: {output.repo} {base} has not merged into {output.branch} since')
        return Resolution.UNMET

    def outputs_available(self, key: Key, task: str, home: Key, producer: str, why: str) -> Resolution:
        """Whether every output a delivered row of another epic carries is available to the row
        naming it: at the consumer's base where the consumer's repository holds the output, and on
        its long-lived branch where another repository does. producer is the entry as written."""
        outputs = [output._replace(delivery=f'{producer} {output.delivery}')
                   for output in self.delivered_outputs(key, task)]
        if not outputs:
            self.outputs.lines.append(f'{why}: {producer} unverified: it links no merged delivery or commit')
            return Resolution.UNMET
        found = PREFIX.match(self.issues.get(home, {}).get('title') or '')
        prefix = f'i{found[1]}/e{found[2]}' if found and found[2] else ''
        return weakest([self.outputs.read(output, prefix, why) if output.repo.lower() == home[0].lower()
                        else self.integrated(output, why) for output in outputs])

    def issue_delivered(self, key: Key, why: str) -> Resolution:
        if key not in self.issues:
            self.unresolved.append(f'{why}: {UNRESOLVABLE} {label(key, self.home)}: it is not given')
            return Resolution.UNRESOLVABLE
        return Resolution.MET if completed(self.issues[key]) else Resolution.UNMET

    def epic_prerequisites_met(self, key: Key, epics: dict[str, Key], why: str) -> Resolution:
        """Whether the whole epics an initiative row names as this one's prerequisites have reached
        their long-lived branches. Closed as completed is the delivery evidence sync records after
        an epic's bases merge. A row naming one task of another epic gates that row alone."""
        answers = []
        for parent, issue in self.issues.items():
            if not re.match(r'^\[I\d\d\]', issue.get('title') or ''):
                continue
            header, listed = self.table(parent)
            for item in listed.values():
                if linked_issue(id_cell(header, item)) == key:
                    answers.append(self.met(cell(header, item, 'Depends on'), parent, epics, why))
        return weakest(answers)

    def startable(self, initiative: Key, epic: Key, depends: str, epics: dict[str, Key],
                  why: str) -> Resolution:
        """How far the delivery and planning prerequisites of one unstarted epic resolve: the epic
        is open with no Open Questions, every entry of its initiative row's Depends on cell is
        delivered, and every prerequisite epic is completed. An unresolvable gate is the row's own
        answer, so a caller leaves the epic where it stands."""
        issue = self.issues.get(epic)
        if issue is None or issue['state'] != 'open' or open_questions(issue):
            return Resolution.UNMET
        return weakest([self.met(depends, initiative, epics, why),
                        self.epic_prerequisites_met(epic, epics, why)])

    def referenced_epics(self, key: Key, epics: dict[str, Key]) -> set[Key]:
        """The epics this one's rows name: those its task rows name outside it, and those its
        initiative row names. epics maps the initiative's Eyy ids to their issues."""
        header, tasks = self.table(key)
        cells = [cell(header, task, 'Depends on') for task in tasks.values()]
        for parent, issue in self.issues.items():
            if not re.match(r'^\[I\d\d\]', issue.get('title') or ''):
                continue
            head, listed = self.table(parent)
            cells += [cell(head, item, 'Depends on') for item in listed.values()
                      if linked_issue(id_cell(head, item)) == key]
        found = set()
        for entries in cells:
            for entry in (e.strip() for e in entries.split(',') if e.strip()):
                link = LINK.fullmatch(entry)
                text = link[1] if link else entry
                if re.fullmatch(r'W\d\d', text) or RANGE.fullmatch(text):
                    continue
                prerequisite = epics.get(text.split(':')[0]) or (issue_url(link[2]) if link else None)
                if prerequisite and prerequisite != key:
                    found.add(prerequisite)
        return found

    def met(self, cell: str, home: Key, epics: dict[str, Key], why: str) -> Resolution:
        """How far every dependency in a Depends on cell resolves. home is the issue whose table
        holds the row, and the repository a bare #750 is read against; epics maps the initiative's
        Eyy ids to their issues. Every entry is read, so a cell carrying two that cannot resolve
        names both."""
        answers = []
        for entry in (e.strip() for e in cell.split(',') if e.strip()):
            link = LINK.fullmatch(entry)
            text, url = (link[1], link[2]) if link else (entry, '')
            found = issue_url(url)
            span = RANGE.match(text)
            task = TASK_REF.search(text)
            if span:
                answer = weakest([self.row_delivered(home, f'W{n:02d}', why)
                                  for n in range(int(span[1]), int(span[2]) + 1)])
            elif re.fullmatch(r'W\d\d', text):
                answer = self.row_delivered(home, text, why)
            elif re.fullmatch(r'#\d+', text):
                answer = self.issue_delivered((home[0], int(text[1:])), why)
            else:
                key = found or epics.get(text.split(':')[0])
                if key is None:
                    self.unresolved.append(f'{why}: {UNRESOLVABLE} {text}: it names no row and links no issue')
                    answer = Resolution.UNRESOLVABLE
                elif task and key not in self.issues:
                    self.unresolved.append(f'{why}: {UNRESOLVABLE} {text}: {label(key, self.home)} is not given')
                    answer = Resolution.UNRESOLVABLE
                elif task:
                    answer = self.row_delivered(key, task[1], why)
                    if key != home and answer is Resolution.MET:
                        answer = self.outputs_available(key, task[1], home, text, why)
                else:
                    answer = self.issue_delivered(key, why)
            answers.append(answer)
        return weakest(answers)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('initiative')
    parser.add_argument('--epics', nargs='*', default=[])
    parser.add_argument('--tasks', nargs='*', default=[])
    parser.add_argument('--others', nargs='*', default=[], help='issues outside the initiative its rows depend on')
    parser.add_argument('--prs', help='pull requests as JSON lines')
    parser.add_argument('--agent-reviews', help='published agent review records as a JSON list')
    parser.add_argument('--links', help='the closing issue references those pull requests hold')
    parser.add_argument('--board', help='the board path, e.g. users/m2ux/projectsV2/9')
    parser.add_argument('--fields', help="the board's fields")
    parser.add_argument('--items', help="the board's items, fetched with the Status field")
    parser.add_argument('--out', help='directory for the Status body files')
    parser.add_argument('--assignee', help='the user assigned to every issue from Ready on')
    args = parser.parse_args()
    for name in ('prs', 'links', 'board', 'fields', 'items', 'out', 'assignee'):
        if not getattr(args, name):
            sys.exit(f'--{name} is required')

    initiative = json.loads(Path(args.initiative).read_text())
    m = PREFIX.match(initiative['title'])
    if not m or m[2]:
        sys.exit(f"not an initiative: {initiative['title']}")
    tag = m[1]
    root = key_of(initiative)
    home = root[0]
    epics, tasks = load(args.epics), load(args.tasks)
    issues = {**load(args.others), **tasks, **epics, root: initiative}
    prs = pull_requests(args.prs)
    reviews = load_records(args.agent_reviews)
    attach_links(prs, args.links)
    unresolved: list[str] = []
    unplaceable: list[str] = []
    review_blocked = False
    board = Board(issues, unresolved, home, prs)

    header, epic_rows = rows(initiative)
    epic_ids = {row_id(id_cell(header, r)): n for r in epic_rows if (n := linked_issue(id_cell(header, r)))}
    status: dict[Key, str | None] = {}
    task_epic: dict[Key, Key] = {}

    def pr_open(epic_key: str, cite: Key) -> bool:
        """Whether an open pull request, draft or ready, delivering to the epic links the issue."""
        return any(delivers(p, tag, epic_key) and links_issue(p, cite) for p in prs)

    for r in epic_rows:
        ident = id_cell(header, r)
        number = linked_issue(ident)
        if number is None or number not in epics:
            unresolved.append(row_id(ident) + ': its issue is not given with --epics')
            continue
        epic = epics[number]
        epic_key = row_id(ident)[1:]
        task_header, task_rows = board.table(number)
        for tid, tr in task_rows.items():
            ident = id_cell(task_header, tr)
            task_issue = linked_issue(ident)
            if task_issue is not None and task_issue not in tasks:
                unresolved.append(f'E{epic_key}:{tid}: task issue {label(task_issue, home)} is not given with --tasks')
                continue
            if task_issue is None:
                prefix = f'[I{tag}:E{epic_key}:{tid}]'
                found = [k for k, issue in tasks.items() if issue['title'].startswith(prefix)]
                if len(found) > 1:
                    unresolved.append(f'E{epic_key}:{tid}: {len(found)} task issues titled {prefix}')
                task_issue = found[0] if len(found) == 1 else None
            if task_issue is None:
                continue
            t = tasks[task_issue]
            if t['state'] == 'closed':
                status[task_issue] = 'Done' if completed(t) else None
            elif pr_open(epic_key, task_issue) or reservation(ident):
                status[task_issue] = 'In Progress'
            elif open_questions(t):
                status[task_issue] = 'Backlog'
            else:
                gates = weakest([board.epic_prerequisites_met(number, epic_ids, f'E{epic_key}:{tid}'),
                                 board.met(cell(task_header, tr, 'Depends on'), number, epic_ids,
                                           f'E{epic_key}:{tid}')])
                if gates is Resolution.UNRESOLVABLE:
                    unplaceable.append(f'E{epic_key}:{tid}')
                    continue
                status[task_issue] = 'Ready' if gates is Resolution.MET else 'Backlog'
            task_epic[task_issue] = number
        if epic['state'] == 'closed':
            status[number] = 'Done' if completed(epic) else None
        elif criteria_met(epic):
            problem = epic_check(epic, prs, reviews)
            status[number] = 'In Progress' if problem else 'In Review'
            if problem:
                review_blocked = True
                unresolved.append(f'{label(number, home)}: {problem}; handoff blocked')
        elif board.active(number):
            status[number] = 'In Progress'
        else:
            status[number] = UNPLACED

    epic_status = [status.get(n) for n in epic_ids.values()]
    if initiative['state'] == 'closed':
        status[root] = 'Done' if completed(initiative) else None
    elif criteria_met(initiative):
        status[root] = 'In Review'
    elif any(s in ('In Review', 'In Progress') for s in epic_status):
        status[root] = 'In Progress'
    else:
        status[root] = RETAINED

    field = StatusField(args.fields, args.out, STATUSES)
    status = {k: field.settle(s) for k, s in status.items()}

    on_board = {}
    for key, item_id, held, content in board_items(args.items):
        on_board[key] = (item_id, held)
        if key not in status and content['state'] == 'closed' and not completed(content):
            issues.setdefault(key, content)
            status[key] = None

    for key, wanted in list(status.items()):
        if wanted not in (UNPLACED, RETAINED):
            continue
        held_status = on_board[key][1] if key in on_board else None
        if held_status in ('Ready', 'Backlog') or (wanted == RETAINED and held_status == 'In Progress'):
            status[key] = held_status
        elif wanted == RETAINED and held_status == 'In Review':
            status[key] = 'In Progress'
        else:
            status[key] = 'Backlog'
    for task_key, epic_key in task_epic.items():
        if status.get(task_key) == 'Ready' and status.get(epic_key) not in READY_UNDER:
            status[task_key] = 'Backlog'

    changes = Changes(DELIVERY, args.board, field, args.assignee, ' (the board is current)')
    for key, wanted in sorted(status.items()):
        item_id, held = on_board.get(key, (None, None))
        changes.place(key, f"{label(key, home)} {issues[key]['title']}", issues[key],
                      held, wanted, item_id, home)
    printed = changes.report(unresolved=unresolved, asking=bool(unplaceable))
    return 1 if unplaceable or review_blocked else printed


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (Unreadable, Jurisdiction) as refused:
        sys.exit(str(refused))
