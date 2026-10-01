# Commands

Every command the skill runs, one spec per operation. The mode files name a spec by linking to it.

- **Session.**
  Once per session, before the first `gh` call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login. Where shell state does not persist between commands, confirm instead that neither is set in the shell profile.
- **Repository.**
  `gh` resolves `{owner}/{repo}` from the git remote of the directory it runs in, so run `gh` commands inside a checkout of the repository that holds the issues. `{other}` is a further repository the board's issues live in.
- **Bodies.**
  - Bodies and long comments always go through a file (`-F body=@file`), never inline, which avoids quoting and the workspace's dynamic-shell restrictions.
  - Keep these files in a working directory outside the repository.
- **Scripts.**
  Scripts run under `sbx`, invoked by its absolute path from `<workspace>`, the checkout holding this skill.
- **Boards.**
  A project board sits under `users/{owner}`, or `orgs/{owner}` when `gh api repos/{owner}/{repo} --jq .owner.type` is `Organization`.
- **Example values.**  Substitute the real ones:
  - `936` an initiative issue, `943` and `937` its epics, `637` a task issue, `874` an orphan, `946` an initiative off the board;
  - `950` a pull request, `I07` and `I08` initiative numbers;
  - board `9`, the Canon theme's, and `419167630` its Status field id;
  - `m2ux` the user.

## Issues

### Fetch issue

Saves an issue whole, as JSON, for the scripts that read issues.

```bash
gh api repos/{owner}/{repo}/issues/943 > issue-943.json
```

### Fetch body

Saves an issue's body alone, for [Check dependencies](#check-dependencies), the renumber scripts and an original-body comment.

```bash
gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
```

### Fetch all issues

Saves every issue in the repository; the scripts skip the pull requests among them.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" > issues.json
```

### List initiative titles

Lists every initiative, epic and task title, for finding the next initiative number.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'
```

### Find initiative issue

Prints an initiative's issue number, found by its title's prefix.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("[I08]")) | .number'
```

### Find user

Prints the login `gh` runs as, the user assigned to work from Ready on.

```bash
gh api user --jq .login
```

### Fetch comments

Prints an issue's comments.

```bash
gh api --paginate repos/{owner}/{repo}/issues/874/comments
```

### Create issue

Creates an issue from a body file, with its title and labels, and prints its number.

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
```

### Patch body

Replaces an issue's body from a file.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
```

### Retitle issue

Replaces an issue's title.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
```

### List labels

Lists the labels that exist in the repository.

```bash
gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'
```

### Add labels

Adds labels to an issue.

```bash
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
```

### Remove label

Removes one label from an issue.

```bash
gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
```

### Comment on issue

Posts a comment: one line inline, anything longer from a file.

```bash
gh api --method POST repos/{owner}/{repo}/issues/637/comments -f body='Delivered by #950.' --jq .html_url
gh api --method POST repos/{owner}/{repo}/issues/874/comments -F body=@comment-874.md --jq .html_url
```

### Close as completed

Closes an issue whose work is done.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

### Close as not planned

Closes an issue whose work another issue tracks.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/874 -f state=closed -f state_reason=not_planned --jq .state
```

## Pull requests

### Fetch initiative pull requests

Saves the pull requests that name one initiative.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json
```

### Fetch all initiative pull requests

Saves the pull requests that name any initiative, appending each further repository's with `>>`.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' > prs.json
gh api --paginate "repos/{owner}/{other}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' >> prs.json
```

### Retitle pull request

Replaces a pull request's title.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose' --jq .title
```

### Retarget pull request

Points a pull request at another base branch, such as its initiative's integration branch.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f base='i07/main' --jq .base.ref
```

### Patch pull request body

Replaces a pull request's body.

- The file is the whole body. When the task has its own issue, the body cites that issue by its URL.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -F body=@pr-950.md --jq .html_url
```

### Create integration branch

Cuts an initiative's integration branch from the tip of a long-lived branch on the remote.

- Run inside a checkout of the repository, with full host permissions.
- The push refuses a branch that already exists.

```bash
git fetch origin main && git push origin origin/main:refs/heads/i07/main
```

### Open integration pull request

Opens the pull request that merges an integration branch into its long-lived branch, once the initiative closes.

- The title is the initiative's prefix and name: `[I07] Name`.
- The body lists the initiative's pull requests the branch carries.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='[I07] Name' -f head='i07/main' -f base='main' -F body=@body.md --jq .html_url
```

## Project boards

### Find theme board

Prints the number of the open board for one theme, by the theme's name that opens its title.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title | startswith("Canon: ")) | .number'
```

### Fetch board fields

Saves a board's fields.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
```

### Find Status field

Prints the id of a board's Status field.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

### Fetch board items with Status

Saves a board's items with their Status, each carrying its issue whole.

```bash
gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=419167630" > items.json
```

## Scripts

### Check dependencies

Checks the task dependency graph across the epics given, and with `I=` the initiative's Depends on cells.

- It also reports dependencies listed twice or already implied, and Joins pairs.
- It reads bodies from [Fetch body](#fetch-body), or local drafts.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
```

### Renumber epics

Renumbers an initiative's epics by the map given, in the files given.

- It rewrites files in place, and rewrites only this initiative's prefixed references in the bodies given after `--outside` (other initiatives' issues). Links keep their targets.
- It refuses a map that collides or that renumbers work a pull request names: a task whose id links a pull request, open or merged, or an epic a pull request in `--prs` names.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --prs prs.json --map 6:0,0:1 live-*.md
```

### Renumber tasks

Renumbers one epic's tasks by the map given, in the files given.

- It renumbers `E01 Wxx` and `E01:Wxx` everywhere, and bare `Wxx` inside E01's own body.
- It rewrites and refuses as [Renumber epics](#renumber-epics) does.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
```

### Check format

Checks one issue against its template, and with `--fix` writes the body with the mechanical fixes made.

- It reads the format from `templates/`, and checks that every criterion is delivered by a Work Breakdown row.
- An epic's check takes its initiative's JSON, which lists the epic issues its references link to.
- An initiative's takes each epic's JSON with `--epic`, whose title names its row.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-936.json --epic issue-943.json --epic issue-937.json --fix fixed-936.md
```

### List orphans

Lists the hoist candidates, and the open initiatives and epics they could join.

- It reads [Fetch all issues](#fetch-all-issues).

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/orphans.py issues.json
```

### Match pull requests

Reports an epic's delivery state against the pull requests that name it.

- A merged pull request no row links is unmatched, and an open one no row links is in flight.
- A row that links a merged pull request while a criterion its Coverage names is unticked is unmet.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json
```

### Sync task issue

Records the pull request that delivered a task issue, ticks its criteria, and reports whether it is closable.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
```

### Sync epic

Links each named task's id to a pull request naming the epic, open or merged, and ticks Done on a row once it is complete.

- It reports the same delivery state as [Match pull requests](#match-pull-requests).
- A row whose id links its task issue links the pull request instead.
- A task is delivered as the [Work Breakdown guide](work-breakdown.md#delivery) defines.
- It takes the epic's task issues. A linked pull request that does not cite a task's issue is reported uncited.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --tasks issue-637.json --link W01=950,W02=950 --fix fixed-943.md
```

### Tick criteria

Ticks confirmed criteria on an epic or an initiative, refusing any not ready to verify, and ticks Done on a row once it is complete.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
```

### Sync initiative

Reports an initiative's delivery state against its epics, and ticks Done on an epic row whose issue is closed as completed.

- It takes the epic JSON fetched after closing.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json
```

### Plan board changes

Derives each issue's Status and assignees, and prints the call for each issue to add, item to remove, Status to set and assignee to add or remove.

- Give an issue it reports unresolved with `--others`.
- `--assignee` is the user [Find user](#find-user) prints.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --board users/{owner}/projectsV2/9 --fields fields.json --items items.json --out board/ --assignee m2ux
```

### Summarise progress

Prints the standup from [Fetch board items with Status](#fetch-board-items-with-status) and [Fetch all initiative pull requests](#fetch-all-initiative-pull-requests).

- `--since` opens the window on another date than a week before today.
- `--initiative I08` limits it to one initiative, or `owner/repo:I08` where that number names initiatives in several repositories.
- `--initiatives` gives the initiatives off the board, each from [Fetch issue](#fetch-issue).
- `--summary` gives the paragraph for management.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --initiatives issue-946.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08 --summary summary.txt
```

### Run tests

Runs the skill's script tests.

```bash
cd <workspace>/skills/work-planner && <workspace>/scripts/sbx python3 -m unittest discover -s test
```
