# Commands

Every command that several of the skill's procedures run, one spec per operation. A procedure names a spec by linking to it.

## GitHub Issues

### Fetch Issue

Saves an issue whole, as JSON, for the scripts that read issues.

```bash
gh api repos/{owner}/{repo}/issues/943 > issue-943.json
```

### Fetch Body

Saves an issue's body alone, for [Check Dependencies](#check-dependencies), the renumber scripts and an original-body comment.

```bash
gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
```

### List Initiative Titles

Lists every numbered initiative, epic and task title, for finding the next initiative number. A proposal has no prefix, so it is not listed.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I[0-9]'
```

### Find User

Prints the login `gh` runs as, the user assigned to work from Ready on.

```bash
gh api user --jq .login
```

### Fetch Comments

Prints an issue's comments.

```bash
gh api --paginate repos/{owner}/{repo}/issues/874/comments
```

### Create Issue

Creates an issue from a body file, with its title and labels, and prints its number.

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
```

### Patch Body

Replaces an issue's body from a file.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
```

### Retitle Issue

Replaces an issue's title.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
```

### Add Labels

Adds labels to an issue.

```bash
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
```

### Comment on Issue

Posts a comment: one line inline, anything longer from a file.

```bash
gh api --method POST repos/{owner}/{repo}/issues/637/comments -f body='Delivered by #950.' --jq .html_url
gh api --method POST repos/{owner}/{repo}/issues/874/comments -F body=@comment-874.md --jq .html_url
```

### Close as Completed

Closes an issue whose normal delivery checks and [Issue Closure](work-breakdown.md#issue-closure) pass.

- Refresh the evidence with [Capture Issue Development](work-breakdown.md#capture-issue-development) immediately before this call. Use absolute evidence paths when changing directory, and the issue's repository and number in the REST path.
- The closure gate must exit 0 before the PATCH executes. A sync report of closable supplies the normal delivery check, not permission to skip this gate.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/closure.py --issue /tmp/issue-943.json --development /tmp/development-943.json --prs /tmp/development-prs-943.json && gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

### Development Access

Reads and edits GitHub Development links through authenticated GitHub or an available supported tool.

- Follow [GitHub's sidebar linking procedure](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue). The issue's Development sidebar supports selecting pull requests across repositories.
- Read the actual field, including every page and state; record repository and number for each link. A missing tool or inaccessible field is a blocker, not an empty link set.
- Confirm the [Issue Closure](work-breakdown.md#issue-closure) repository prerequisite before linking or merging. Observe the repository setting, or obtain the user's explicit confirmation; an absent API field is unknown.
- After a link edit, re-read the field to verify it. Removing a link follows [Issue Closure](work-breakdown.md#issue-closure).

## GitHub Pull Requests

### Fetch Pull Request

Appends one pull request, as one JSON line, to the file [Match Pull Requests](sync-mode.md#match-pull-requests) reads. A row that links a number that file does not hold is fetched this way.

```bash
gh api repos/{owner}/{repo}/pulls/439 --jq . >> prs.json
```

### Fetch Initiative Pull Requests

Saves the task and epic pull requests that name one initiative's epics.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
```

### Fetch Pull Request Issue Links

Saves each pull request's Development-linked issues as a JSON array for the scripts' `--links` input.

- Read every pull request in `prs.json` through [Development Access](#development-access), and repeat after a link changes.
- Save one entry per pull request in `links.json`, with every linked issue's repository and number. An observed empty field uses an empty array. An unreadable field leaves the fetch incomplete.

```json
[
  {
    "repo": "owner/repo",
    "number": 950,
    "closingIssuesReferences": [{"repo": "owner/repo", "number": 637}]
  }
]
```

### Retarget Pull Request

Points a pull request at another base branch, such as its epic's base branch.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f base='i07/e00/main' --jq .base.ref
```

## GitHub Project Boards

### Fetch Board Fields

Saves a board's fields.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
```

### Set Item Status

Sets one board item's Status. The body names the Status field id and the option id, both taken from [Fetch Board Fields](#fetch-board-fields): `{"fields":[{"id":419167630,"value":"OPTION"}]}`.

```bash
gh api --method PATCH users/{owner}/projectsV2/13/items/1001 --input status-backlog.json --jq .id
```

## Git

### List Epic Bases

Prints one epic's base branch names, one per line.

- A base is `i07/e00/<name>` whose `<name>` is a long-lived branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- [Find Available Work](deliver-mode.md#find-available-work) takes these names as `--bases`.

```bash
git ls-remote --heads origin 'refs/heads/i07/e00/*' | cut -f2 | sed 's|refs/heads/||'
```

### Update Task Branch

Merges the epic base into the unit's task branch.

- Run it in the unit's worktree when [Merge Pull Request](work-breakdown.md#merge-pull-request) is refused, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- Then run [Merge Pull Request](work-breakdown.md#merge-pull-request) again.
- A conflict stops the update. The pull request stays open, and the conflict is reported.

```bash
git fetch origin i07/e00/main && git merge --no-edit origin/i07/e00/main && git push origin HEAD:refs/heads/i07/e00/w01-queue-plan
```

## Planning records

### Add Planning Record

Adds the folder for one planning record on the long-lived engineering worktree.

- The path is `artifacts/planning/<yyyy-mm-dd>[-<ref>]-<slug>/`. The date is the day the record is opened.
- `<ref>` is the bare number of the issue or the pull request the record is for. A record for ad hoc work, which has neither, has no ref segment.
- The slug is lowercase words separated by hyphens, a short name of the work.
- The folder's files are the [planning layout](planning-layout.md).
- Edits are made on that worktree. The engineering branch takes no further worktree and no branch.

```bash
mkdir -p artifacts/planning/<yyyy-mm-dd>[-<ref>]-<slug>
```

## Graph

### Graph Conventions

Every graph command runs in the worktree [Create Pull Request Worktree](understand-mode.md#create-pull-request-worktree) cut, and prints JSON carrying a `staleness` block. A block reporting the index behind sends the run back to [Index Repository](understand-mode.md#index-repository), as [Understand Mode](understand-mode.md#rules) states under Fresh index.

## Scripts

### Check Dependencies

Checks the task dependency graph across the epics given, and with `I=` the initiative's Depends on cells.

- Initiative edges follow the [whole-epic prerequisite rule](work-breakdown.md#tables); narrower dependencies stay in the task graph.

- It also reports dependencies listed twice or already implied, and Joins pairs.
- It prints each pair of tasks in an epic where neither depends on the other and the two do not name each other in Joins.
- It prints each whole-epic dependency with that epic's row count, the binding row and its level, and the earliest row and its level.
- It reads bodies from [Fetch Body](#fetch-body), or local drafts.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
```

### Renumber Tasks

Renumbers one epic's tasks by the map given, in the files given.

- It renumbers `E01 Wxx` and `E01:Wxx` everywhere, and bare `Wxx` inside E01's own body.
- It rewrites and refuses as [Renumber Epics](review-passes.md#renumber-epics) does.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
```

### Check Format

Checks one issue against its template, and with `--fix` writes the body with the mechanical fixes made.

- It reads the format from `templates/`, and checks that every criterion is delivered by a Work Breakdown row.
- An epic's check takes its initiative's JSON, which lists the epic issues its references link to.
- An initiative's takes each epic's JSON with `--epic`, whose title names its row.
- An epic's check also takes `--prs` and `--corpus`, the long-lived branch the corpus lives on, which report a [corpus epic](work-breakdown.md#corpus-audit) whose criteria omit the audit. The reach is read from the base of each pull request naming the epic, through an epic base or an initiative branch. Without both, the reach is unevaluable and nothing is reported.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-943.json --initiative issue-936.json --prs prs.json --corpus workflows --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-936.json --epic issue-943.json --epic issue-937.json --fix fixed-936.md
```

### Delivery State

Shared report meanings and inputs for matching pull requests and syncing epics.

- A merged pull request no row links is unmatched, and an open one no row links is in flight.
- A row that links a merged pull request while a criterion its Coverage names is unticked is unmet.
- A linked pull request whose title names another epic is a conflict, and it delivers the task once it has merged.
- A linked pull request absent from the given pull requests is reported and does not deliver the task. [Fetch Pull Request](#fetch-pull-request) appends it, and the command is run again.
- `--links` is the file [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links) writes for those pull requests, which every call given `--prs` carries.

### Sync Task Issue

Records the pull request that delivers a task issue, open or merged, ticks its criteria, and reports whether it is closable.

- Its criteria are ready to verify while that pull request is open, since the evidence is what the pull request and its planning record carry. Ticking them is what lets the pull request merge, as [Task Merge](work-breakdown.md#task-merge) states.
- The task is delivered, and so closable, once that pull request has merged.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
```

### Sync Epic

Links each named task's id to a pull request naming the epic, open or merged, and ticks Done on a row once it is complete.

- It reports [Delivery State](#delivery-state).
- It reports each disagreement between a linked pull request's test plan and the rows it delivers, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Test plan.
- A row whose id links its task issue links the pull request instead.
- A task is delivered as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- A pull request whose head is an epic base merges that base, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, and is not matched to a task.
- It takes the epic's task issues, and the issue links from [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links). A linked pull request that does not link a task's issue, and a review pull request that does not link the epic's issue, are reported uncited, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.
- A task issue whose id is not a row is reported unplaced, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- When a task has merged into an epic base and the epic is not yet complete, that base is reported draft, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- It reports a review pull request whose References differ from the task pull requests merged into its base, naming both sets, as the [Work Breakdown Guide](work-breakdown.md#review-pull-request) states.
- When every row is delivered and every criterion is ticked, an epic base its pull requests target that has not merged is reported unmerged. A draft pull request is named draft. The epic is closable as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- `--project` is a checkout of the project, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. Without those names, an epic that would otherwise be closable is not.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tasks issue-637.json --link W01=950,W02=950 --project <checkout> --fix fixed-943.md
```

### Sync Initiative

Reports an initiative's delivery state against its epics, and ticks Done on an epic row whose issue is closed as completed.

- It takes each epic's JSON fetched after closing and reports closable as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- An open, missing or cancelled epic keeps its row undelivered, including when all initiative criteria are ticked.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json
```
