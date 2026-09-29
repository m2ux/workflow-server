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
- **Example values.**
  Substitute the real ones:
  - `936` an initiative issue, `943` and `937` its epics, `637` a task issue, `874` an orphan, `946` an initiative off the board;
  - `950` a pull request, `I07` and `I08` initiative numbers;
  - board `2`, and `411749936` its Status field id.

## Issues

### Fetch issue

The issue whole, as JSON, for the scripts that read issues.

```bash
gh api repos/{owner}/{repo}/issues/943 > issue-943.json
```

### Fetch body

The issue's body alone, for [Check dependencies](#check-dependencies), the renumber scripts and an original-body comment.

```bash
gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
```

### Fetch all issues

Every issue in the repository, the pages' arrays one after another. Pull requests are included; the scripts skip them.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" > issues.json
```

### List initiative titles

Every initiative, epic and task title, for finding the next initiative number.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'
```

### Find initiative issue

The issue number of an initiative, by its title's prefix.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("[I08]")) | .number'
```

### Fetch comments

```bash
gh api --paginate repos/{owner}/{repo}/issues/874/comments
```

### Create issue

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
```

### Patch body

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
```

### Retitle issue

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
```

### List labels

The labels that exist in the repository.

```bash
gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'
```

### Add labels

```bash
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
```

### Remove label

```bash
gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
```

### Comment on issue

A one-line comment inline, anything longer from a file.

```bash
gh api --method POST repos/{owner}/{repo}/issues/637/comments -f body='Delivered by #950.' --jq .html_url
gh api --method POST repos/{owner}/{repo}/issues/874/comments -F body=@comment-874.md --jq .html_url
```

### Close as completed

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

### Close as not planned

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/874 -f state=closed -f state_reason=not_planned --jq .state
```

## Pull requests

### Fetch initiative pull requests

The pull requests that name one initiative.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json
```

### Fetch all initiative pull requests

The pull requests that name any initiative, appending those of each further repository with `>>`.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' > prs.json
gh api --paginate "repos/{owner}/{other}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' >> prs.json
```

### Retitle pull request

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose' --jq .title
```

## Project boards

### List boards

The owner's open boards, by number and title.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | [.number, .title] | @tsv'
```

### Fetch board items

A board's items, for [Find board](#find-board).

```bash
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100" > items-2.json
```

### Fetch board fields

```bash
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" > fields.json
```

### Find Status field

The id of the board's Status field.

```bash
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

### Fetch board items with Status

A board's items with the Status field's value, which carry each issue whole.

```bash
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100&fields=411749936" > items.json
```

## Scripts

### Check dependencies

Checks the task dependency graph across the epics given, including dependencies listed twice or already implied, and Join pairs. With `I=` it checks the initiative's Depends on cells against the epics. It reads bodies from [Fetch body](#fetch-body), or local drafts.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
```

### Renumber epics

Renumbers the initiative's epics by the map given.

- It rewrites files in place, and rewrites only this initiative's prefixed references in the bodies given after `--outside` (other initiatives' issues). Links keep their targets.
- It refuses a map that collides or that renumbers delivered work: a task whose id links its pull request, or an epic a pull request in `--prs` names.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --prs prs.json --map 6:0,0:1 live-*.md
```

### Renumber tasks

Renumbers one epic's tasks, here E01's: `E01 Wxx` and `E01:Wxx` everywhere, and bare `Wxx` inside E01's own body. It rewrites and refuses as [Renumber epics](#renumber-epics) does.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
```

### Check format

Checks one issue against its template, read from `templates/`, including that every criterion is delivered by a Work Breakdown row.

- An epic's check takes its initiative's JSON, which lists the epic issues its references link to.
- An initiative's takes each epic's JSON with `--epic`, whose title names its row.
- `--fix` writes the body with the mechanical fixes made.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-936.json --epic issue-943.json --epic issue-937.json --fix fixed-936.md
```

### List orphans

Lists the hoist candidates from [Fetch all issues](#fetch-all-issues), and the open initiatives and epics they could join.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/orphans.py issues.json
```

### Match pull requests

Reports an epic's delivery state against the pull requests that name it.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json
```

### Update task issue

Records the pull request that delivered a task issue, ticks its criteria, and reports whether it is closable.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
```

### Update epic

Links each row to the pull request that delivered it, with the task issues fetched after closing.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json --tasks issue-637.json --link W01=950,W02=950 --fix fixed-943.md
```

### Tick criteria

Ticks confirmed criteria on an epic or an initiative. It refuses a criterion that is not ready to verify.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
```

### Update initiative

Reports the initiative's delivery state against its epics, with the epic JSON fetched after closing.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-936.json --epics issue-943.json issue-937.json
```

### Find board

Names the board holding the initiative, from each board's [Fetch board items](#fetch-board-items).

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py --find issue-936.json 2=items-2.json 7=items-7.json
```

### Plan board changes

Derives each issue's Status and prints the call for each issue to add, item to remove and Status to set. Give an issue it reports unresolved with `--others`.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --board users/{owner}/projectsV2/2 --fields fields.json --items items.json --out board/
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

```bash
cd <workspace>/skills/work-planner && <workspace>/scripts/sbx python3 -m unittest discover -s test
```
