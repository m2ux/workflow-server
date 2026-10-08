# Commands

Every command the skill runs, one spec per operation. The mode files name a spec by linking to it.

- **Session.**
  Once per session, before the first `gh` call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login. Where shell state does not persist between commands, confirm instead that neither is set in the shell profile.
- **Repository.**
  `gh` resolves `{owner}/{repo}` from the git remote of the directory it runs in, so run `gh` commands inside a checkout of the repository that holds the issues. `{other}` is a further repository the board's issues live in.
- **Bodies.**
  - Bodies and long comments always go through a file (`-F body=@file`), never inline, which avoids quoting.
  - **Example.**  workflow-server's dynamic-shell restrictions deny a body inlined in the command.
  - Keep these files in a working directory outside the repository.
- **Scripts.**
  Scripts run under `sbx`, invoked by its absolute path from `<workspace>`, the checkout holding this skill.
- **Boards.**
  A project board sits under `users/{owner}`, or `orgs/{owner}` when `gh api repos/{owner}/{repo} --jq .owner.type` is `Organization`.
- **Example values.**  Substitute the real ones:
  - `936` an initiative issue, `943` and `937` its epics, `637` a task issue, `874` an orphan, `946` an initiative off the board, `960` a proposal;
  - `950` a pull request, `I07` and `I08` initiative numbers;
  - board `9`, workflow-server's Canon theme, and `419167630` its Status field id;
  - `1` the Initiative Template board, `13` a board copied from it;
  - `14` the Proposals Template, `15` the Proposals board;
  - `m2ux` the user.
  - `<main>` the main working tree. A linked worktree passes that path.

## Issues

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

### Fetch All Issues

Saves every issue in the repository; the scripts skip the pull requests among them.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" > issues.json
```

### List Initiative Titles

Lists every numbered initiative, epic and task title, for finding the next initiative number. A proposal has no prefix, so it is not listed.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I[0-9]'
```

### Find Initiative Issue

Prints an initiative's issue number, found by its title's prefix.

```bash
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("[I08]")) | .number'
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

### List Labels

Lists the labels that exist in the repository.

```bash
gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'
```

### Create Label

Creates a label. A proposal needs `type:proposal` when [List Labels](#list-labels) does not show it.

```bash
gh api --method POST repos/{owner}/{repo}/labels -f name='type:proposal' -f color='1D76DB' -f description='A goal proposed as an initiative' --jq .name
```

### Add Labels

Adds labels to an issue.

```bash
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
```

### Remove Label

Removes one label from an issue.

```bash
gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
```

### Comment on Issue

Posts a comment: one line inline, anything longer from a file.

```bash
gh api --method POST repos/{owner}/{repo}/issues/637/comments -f body='Delivered by #950.' --jq .html_url
gh api --method POST repos/{owner}/{repo}/issues/874/comments -F body=@comment-874.md --jq .html_url
```

### Close as Completed

Closes an issue whose work is done.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

### Close as Not Planned

Closes an issue whose work another issue tracks.

```bash
gh api --method PATCH repos/{owner}/{repo}/issues/874 -f state=closed -f state_reason=not_planned --jq .state
```

## Sources

### Fetch Source

Saves a source an initiative's References mark, for the alignment the [Goal Pass](review-passes.md#goal-pass) runs. A path in the checkout is read where it sits. A blob permalink is read at the commit it pins, below. Any other URL is fetched with the harness's web fetch. A source that returns nothing is a finding the [Sources](review-criteria.md#sources) criteria name, and the review states it rather than passing over the criteria it binds.

```bash
gh api repos/{owner}/{repo}/contents/docs/spec.md?ref=4a217fe6 --jq .content | base64 -d > source-R1.md
```

## Pull Requests

### Fetch Pull Request

Appends one pull request, as one JSON line, to the file [Match Pull Requests](#match-pull-requests) reads. A row that links a number that file does not hold is fetched this way.

```bash
gh api repos/{owner}/{repo}/pulls/439 --jq . >> prs.json
```

### Fetch Initiative Pull Requests

Saves the pull requests that name one initiative, its epic pull requests and the integration pull requests titled `[I07] Name`.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
```

### Fetch All Initiative Pull Requests

Saves the pull requests that name any initiative, appending each further repository's with `>>`.

```bash
gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' > prs.json
gh api --paginate "repos/{owner}/{other}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I"))' >> prs.json
```

### Fetch Pull Request Issue Links

Saves the issue each pull request links, which [Sync Epic](#sync-epic) and [Sync Initiative](#sync-initiative) read as `--links`.

- Run it on the `prs.json` a fetch above wrote, and again after [Link Pull Request to Issue](#link-pull-request-to-issue) sets a link.
- The first call writes the query from the node ids `prs.json` carries, so the query names the pull requests already fetched and no number is typed out.
- Each entry is a pull request and the issues GitHub holds as its closing references, which is what its Development field shows.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py --links-query --prs prs.json > links.graphql
gh api graphql -F query=@links.graphql --jq '[.data.nodes[] | {repo: .repository.nameWithOwner, number, closingIssuesReferences: [.closingIssuesReferences.nodes[] | {repo: .repository.nameWithOwner, number}]}]' > links.json
```

### Retitle Pull Request

Replaces a pull request's title.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose' --jq .title
```

### Retarget Pull Request

Points a pull request at another base branch, such as its epic's base branch.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f base='i07/e00/main' --jq .base.ref
```

### Fetch Pull Request Files

Saves the paths a pull request changes, for the measurement [Understand Mode](understand-mode.md#procedure) bounds to them.

```bash
gh api --paginate repos/{owner}/{repo}/pulls/950/files --jq '.[].filename' > changed-files.txt
```

### Patch Pull Request Body

Replaces a pull request's body.

- The file is the whole body. The issue a pull request delivers is linked on the pull request itself, so this call leaves that link standing.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -F body=@pr-950.md --jq .html_url
```

### Update Review Pull Request

Adds a merged task pull request's change to the review pull request that merges the epic base it landed in.

- Run it after [Sync Epic](#sync-epic), on the session that merged, as the [Work Breakdown Guide](work-breakdown.md#review-pull-request) states.
- The first call prints the review pull request's number, by the epic base as head. It prints nothing while no pull request merges that base, and the base opens as a draft first.
- The second writes the current body to a file. The unit's change goes under Changes, beneath the heading for its area or a new one, and its pull request is appended to References as the next R number.
- The third replaces the body with that file.

```bash
gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:i07/e00/main" --jq '.[0].number'
gh api repos/{owner}/{repo}/pulls/980 --jq .body > review-980.md
gh api --method PATCH repos/{owner}/{repo}/pulls/980 -F body=@review-980.md --jq .html_url
```

### Merge Pull Request

Merges a task pull request into its epic base.

- Run it when every check's Pass cell in the pull request's test plan carries a tick, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. [Update Integration Branch](#update-integration-branch) and [Update Epic Base](#update-epic-base) have run first.
- A refusal is followed by [Update Task Branch](#update-task-branch), then this command again. A conflict in that update leaves the pull request open. Report it.
- The merge method is a merge commit.

```bash
gh api --method PUT repos/{owner}/{repo}/pulls/950/merge -f merge_method='merge' --jq .merged
```

### Create Integration Branch

Cuts an initiative's integration branch from the tip of a long-lived branch on the remote.

- Run inside a checkout of the repository, with full host permissions.
- The push refuses a branch that already exists.

```bash
git fetch origin main && git push origin origin/main:refs/heads/i07/main
```

### Create Epic Base

Cuts an epic's base branch from the tip of the initiative's integration branch on the remote.

- Run inside a checkout of the repository, with full host permissions.
- The push refuses a branch that already exists.
- The base is the one the [Work Breakdown Guide](work-breakdown.md#delivery) names for that long-lived branch.

```bash
git fetch origin i07/main && git push origin origin/i07/main:refs/heads/i07/e00/main
```

### List Epic Bases

Prints one epic's base branch names, one per line.

- A base is `i07/e00/<name>` whose `<name>` is a long-lived branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- [Find Available Work](#find-available-work) takes these names as `--bases`.

```bash
git ls-remote --heads origin 'refs/heads/i07/e00/*' | cut -f2 | sed 's|refs/heads/||'
```

### List Long-Lived Branches

Prints the long-lived branch names, one per line.

- The names are as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- `--project` is the main working tree. Where it has a `.project` directory, that directory's subfolders are the names.
- Where it does not, `--refs` is the repository's heads, one per line, as `git ls-remote --heads origin` prints them, and `--initiative` is the initiative number, as `07`. An integration branch `i07/workflows` names `workflows`.
- Where neither yields a name, the command prints `unevaluable:` and names what is missing, and exits 1.

```bash
git ls-remote --heads origin > heads.txt && cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py --names --project <main> --initiative 07 --refs heads.txt
```

### Update Integration Branch

Merges a long-lived branch into the initiative integration branch.

- Run it from the main working tree, before [Update Epic Base](#update-epic-base), as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- A conflict stops the merge. The task pull request stays open, and the conflict is reported.

```bash
git fetch origin main i07/main && git worktree add --detach .worktrees/i07-main origin/i07/main && git -C .worktrees/i07-main merge --no-edit origin/main && git -C .worktrees/i07-main push origin HEAD:refs/heads/i07/main && git worktree remove .worktrees/i07-main
```

### Update Epic Base

Merges an initiative integration branch into the epic base.

- Run it from the main working tree, after [Update Integration Branch](#update-integration-branch) and before [Merge Pull Request](#merge-pull-request), as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- A conflict stops the merge. The task pull request stays open, and the conflict is reported.

```bash
git fetch origin i07/main i07/e00/main && git worktree add --detach .worktrees/i07-e00-main origin/i07/e00/main && git -C .worktrees/i07-e00-main merge --no-edit origin/i07/main && git -C .worktrees/i07-e00-main push origin HEAD:refs/heads/i07/e00/main && git worktree remove .worktrees/i07-e00-main
```

### Update Task Branch

Merges the epic base into the unit's task branch.

- Run it in the unit's worktree when [Merge Pull Request](#merge-pull-request) is refused, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- Then run [Merge Pull Request](#merge-pull-request) again.
- A conflict stops the update. The pull request stays open, and the conflict is reported.

```bash
git fetch origin i07/e00/main && git merge --no-edit origin/i07/e00/main && git push origin HEAD:refs/heads/i07/e00/w01-queue-plan
```

### Open Task Pull Request

Opens the pull request that delivers a unit's work into its epic base.

- Run it in the unit's worktree once the work is pushed, as [Deliver Mode](deliver-mode.md#brief) states.
- The title is the epic's prefix and the unit's purpose: `[I07:E00] Purpose`.
- The head is the unit's task branch and the base is the epic base it was cut from, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- The body is drafted from the [pull request template](../templates/pull-request.md), with its Test Plan filled as [Deliver Mode](deliver-mode.md#rules) states under Tests.
- [Link Pull Request to Issue](#link-pull-request-to-issue) links each task issue the unit delivers once it is open, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links. A unit whose tasks carry no issue of their own links nothing.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='[I07:E00] Purpose' -f head='i07/e00/w01-queue-plan' -f base='i07/e00/main' -F body=@body.md --jq .html_url
```

### Open Integration Pull Request

Opens the pull request that merges an integration branch into its long-lived branch.

- Run it when [Sync Initiative](#sync-initiative) reports that branch unmerged. The initiative stays open until the pull request merges.
- The title is the initiative's prefix and name: `[I07] Name`.
- The body is drafted from the [pull request template](../templates/pull-request.md).
- [Link Pull Request to Issue](#link-pull-request-to-issue) links the initiative's issue once it is open, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='[I07] Name' -f head='i07/main' -f base='main' -F body=@body.md --jq .html_url
```

### Open Epic Pull Request

Opens the pull request that merges an epic base into its initiative integration branch.

- Run it when [Sync Epic](#sync-epic) reports a draft line, or reports that branch unmerged and names no pull request. The epic stays open until the pull request merges.
- The title is the epic's prefix and name: `[I07:E00] Name`.
- The head is the epic base and the base is the integration branch it was cut from, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- The body is drafted from the [pull request template](../templates/pull-request.md), in the shape [Review pull request](work-breakdown.md#review-pull-request) gives it: Overview, Changes and References, with no Test Plan. [Update Review Pull Request](#update-review-pull-request) carries each later merge into it.
- A draft line opens it as a draft, with `-F draft=true`. An unmerged base that names no pull request omits that field, so the pull request opens ready for review.
- [Link Pull Request to Issue](#link-pull-request-to-issue) links the epic's issue once it is open, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='[I07:E00] Name' -f head='i07/e00/main' -f base='i07/main' -F draft=true -F body=@body.md --jq .html_url
```

### Link Pull Request to Issue

Links a pull request to the issue it delivers. GitHub shows that link in the pull request's Development field and in the issue's Linked pull requests field, which the project board reads.

- Run it once the pull request is open, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.
- The first two calls print the node ids REST holds for the issue and the pull request.
- `link.graphql` carries the mutation with those ids written into it. The query sits in a file because a GraphQL variable needs a `$`, which the [Bash rules](../../../rules/bash-composition.md#github-cli) deny on the command line.
- One call takes one issue and up to ten pull requests, and sets both views of the link.
- The link is stored on the pull request, so [Patch Pull Request Body](#patch-pull-request-body) and [Update Review Pull Request](#update-review-pull-request) leave it standing. It holds on any base branch and on a pull request that has merged.
- A link set in error is unset by `removeCloseIssueReferences`, which takes the same input.

```bash
gh api repos/{owner}/{repo}/issues/637 --jq .node_id
gh api repos/{owner}/{repo}/pulls/950 --jq .node_id
gh api graphql -F query=@link.graphql --jq '.data.addCloseIssueReferences.issue.number'
```

`link.graphql`:

```graphql
mutation {
  addCloseIssueReferences(input: {issueId: "I_kwDOABCD12", pullRequestIds: ["PR_kwDOABCD34"]}) {
    issue { number }
  }
}
```

## Project Boards

### Find Theme Board

Prints the number of the open board for one theme, by the theme's name that opens its title.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title | startswith("Canon: ")) | .number'
```

### Create Board

Copies the Initiative Template into a new open board, links the copy to the repository, and prints the new board's number.

- The template is the open board titled `Initiative Template`. The copy carries its Status options: Backlog, Ready, In Progress, In Review and Done.
- The title is the new board's title: a theme board's title from [Themes and Boards](../SKILL.md#themes-and-boards).
- The copy's JSON is one project, and `.number` is the new board.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Initiative Template") | .number'
gh project copy 1 --source-owner {owner} --target-owner {owner} --title 'Canon: Definitions Checked Against the Design Canon' --format json --jq .number
gh project link 13 --owner {owner} --repo {repo}
```

### Create Proposals Board

Copies the Proposals Template into a new open board, links the copy to the repository, and prints the new board's number.

- The template is the open board titled `Proposals Template`. The copy carries its Status options, listed under Proposals in [Themes and Boards](../SKILL.md#themes-and-boards).
- The title is `Proposals`.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Proposals Template") | .number'
gh project copy 14 --source-owner {owner} --target-owner {owner} --title 'Proposals' --format json --jq .number
gh project link 15 --owner {owner} --repo {repo}
```

### Find Proposals Board

Prints the number of the open board titled `Proposals`.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Proposals") | .number'
```

### Fetch Board Fields

Saves a board's fields.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" > fields.json
```

### Find Status Field

Prints the id of a board's Status field.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

### Fetch Board Items with Status

Saves a board's items with their Status, each carrying its issue whole.

```bash
gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=419167630" > items.json
```

### Fetch Board Item

Reads one board item, including its Status. The item list can lag a write. This read is what confirms a status just set.

```bash
gh api "users/{owner}/projectsV2/9/items/1001?fields=419167630"
```

### Add Issue to Board

Adds an issue to a board and prints the new item's id. The issue's `id` comes from [Fetch Issue](#fetch-issue), not its number.

```bash
gh api --method POST users/{owner}/projectsV2/13/items -f type=Issue -F id=3040123456 --jq .id
```

### Set Item Status

Sets one board item's Status. The body names the Status field id and the option id, both taken from [Fetch Board Fields](#fetch-board-fields): `{"fields":[{"id":419167630,"value":"OPTION"}]}`.

```bash
gh api --method PATCH users/{owner}/projectsV2/13/items/1001 --input status-backlog.json --jq .id
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

## Sessions

### Create Task Worktree

Cuts the worktree and branch one unit's session works in, from the epic's base branch.

- The worktree, the branch and the base are the ones [Find Available Work](#find-available-work) names, with the branch following the [Work Breakdown Guide](work-breakdown.md#delivery).
- When the unit line names several bases, cut from the one for the long-lived branch the unit changes.
- Run it in the checkout of the repository the work changes.

```bash
git fetch origin i07/e00/main && git worktree add .worktrees/i07-e00-w01 -b i07/e00/w01-queue-plan origin/i07/e00/main
```

### Create Pull Request Worktree

Cuts the worktree [Understand Mode](understand-mode.md#procedure) measures a pull request in, at its head commit.

- Run it in the checkout of the repository the pull request changes.
- The worktree is detached at the head commit, so the graph reads the change as the reviewer meets it.

```bash
git fetch origin pull/950/head && git worktree add --detach .worktrees/review-950 FETCH_HEAD
```

## Graph

Every graph command runs in the worktree [Create Pull Request Worktree](#create-pull-request-worktree) cut, and prints JSON carrying a `staleness` block. A block reporting the index behind sends the run back to [Index Repository](#index-repository), as [Understand Mode](understand-mode.md#rules) states under Fresh index.

### Index Status

Reports whether the repository is indexed, and how far behind the index sits.

```bash
gitnexus status
```

### Index Repository

Indexes the repository, which an unindexed or behind repository needs before any measurement.

```bash
gitnexus analyze
```

### Change Surface

Reports the symbols a pull request's diff touches and the flows they sit in, against the base branch.

- `--base-ref` is the pull request's base, so the surface is the change rather than the branch's whole history.

```bash
gitnexus detect-changes --scope compare --base-ref main
```

### Symbol Context

Reports one symbol's callers, its callees and the flows it sits in, each with the file it sits in.

- Run it for each symbol [Change Surface](#change-surface) names. The files group into the areas the component diagram draws.

```bash
gitnexus context reserveRow
```

### Flow Trace

Reports one flow's symbols in step order, the structure a sequence diagram is drawn from.

- The flow is one [Change Surface](#change-surface) names. `process_symbols` carries each symbol's `step_index`, its file and its lines.

```bash
gitnexus query --query "Queue Placement" --limit 1
```

## Scripts

### Check Dependencies

Checks the task dependency graph across the epics given, and with `I=` the initiative's Depends on cells.

- It also reports dependencies listed twice or already implied, and Joins pairs.
- It prints each pair of tasks in an epic where neither depends on the other and the two do not name each other in Joins.
- It prints each whole-epic dependency with that epic's row count, the binding row and its level, and the earliest row and its level.
- It reads bodies from [Fetch Body](#fetch-body), or local drafts.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deps.py I=live-936.md E00=live-943.md E01=live-937.md
```

### Renumber Epics

Renumbers an initiative's epics by the map given, in the files given.

- It rewrites files in place, and rewrites only this initiative's prefixed references in the bodies given after `--outside` (other initiatives' issues). Links keep their targets.
- It refuses a map that collides or that renumbers work a pull request names: a task whose id links a pull request, open or merged, or an epic a pull request in `--prs` names.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --prs prs.json --map 6:0,0:1 live-*.md
```

### Renumber Tasks

Renumbers one epic's tasks by the map given, in the files given.

- It renumbers `E01 Wxx` and `E01:Wxx` everywhere, and bare `Wxx` inside E01's own body.
- It rewrites and refuses as [Renumber Epics](#renumber-epics) does.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/renumber.py --initiative 07 --epic 1 --own live-937.md --tasks 7:3,3:5 live-*.md
```

### Check Format

Checks one issue against its template, and with `--fix` writes the body with the mechanical fixes made.

- It reads the format from `templates/`, and checks that every criterion is delivered by a Work Breakdown row.
- An epic's check takes its initiative's JSON, which lists the epic issues its references link to.
- An initiative's takes each epic's JSON with `--epic`, whose title names its row.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-943.json --initiative issue-936.json --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/format.py issue-936.json --epic issue-943.json --epic issue-937.json --fix fixed-936.md
```

### List Orphans

Lists the hoist candidates, and the open initiatives and epics they could join.

- It reads [Fetch All Issues](#fetch-all-issues).

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/orphans.py issues.json
```

### Match Pull Requests

Reports an epic's delivery state against the pull requests that name it.

- A merged pull request no row links is unmatched, and an open one no row links is in flight.
- A row that links a merged pull request while a criterion its Coverage names is unticked is unmet.
- A linked pull request whose title names another epic is a conflict, and it delivers the task once it has merged.
- A linked pull request absent from the given pull requests is reported and does not deliver the task. [Fetch Pull Request](#fetch-pull-request) appends it, and the command is run again.
- `--links` is the file [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links) writes for those pull requests, which every call given `--prs` carries.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json
```

### Sync Task Issue

Records the pull request that delivered a task issue, ticks its criteria, and reports whether it is closable.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
```

### Sync Epic

Links each named task's id to a pull request naming the epic, open or merged, and ticks Done on a row once it is complete.

- It reports the same delivery state as [Match Pull Requests](#match-pull-requests).
- It reports each disagreement between a linked pull request's test plan and the rows it delivers, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Test plan.
- A row whose id links its task issue links the pull request instead.
- A task is delivered as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- A pull request whose head is an epic base merges that base, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, and is not matched to a task.
- It takes the epic's task issues, and the issue links from [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links). A linked pull request that does not link a task's issue, and a review pull request that does not link the epic's issue, are reported uncited, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.
- A task issue whose id is not a row is reported unplaced, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- When a task has merged into an epic base and the epic is not yet complete, that base is reported draft, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- It reports a review pull request whose References differ from the task pull requests merged into its base, naming both sets, as the [Work Breakdown Guide](work-breakdown.md#review-pull-request) states.
- When every row is delivered and every criterion is ticked, an epic base its pull requests target that has not merged is reported unmerged. A draft pull request is named draft. The epic is closable as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- `--project` is `<main>`, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. Without those subfolders, an epic or initiative that would otherwise be closable is not.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tasks issue-637.json --link W01=950,W02=950 --project <main> --fix fixed-943.md
```

### Tick Criteria

Ticks confirmed criteria on an epic or an initiative, refusing any not ready to verify, and ticks Done on a row once it is complete.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
```

### Sync Initiative

Reports an initiative's delivery state against its epics, and ticks Done on an epic row whose issue is closed as completed.

- It takes the epic JSON fetched after closing, the pull requests from [Fetch Initiative Pull Requests](#fetch-initiative-pull-requests), and their issue links from [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links).
- An integration pull request that does not link the initiative's issue is reported uncited, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links.
- It reads each pull request's base and head ref. A pull request that targets an integration branch, or an epic base cut from one, associates that integration branch.
- It reports closable as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. An integration branch with no merged pull request is reported unmerged.
- Without the pull requests, an initiative whose criteria are all ticked is not closable.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json --prs prs.json --links links.json --project <main>
```

### Plan Board Changes

Derives each issue's Status and assignees, and prints the call for each issue to add, item to remove, Status to set and assignee to add or remove.

- Give an issue it reports unresolved with `--others`.
- `--assignee` is the user [Find User](#find-user) prints.
- An open initiative or epic whose criteria are all ticked is In Review. An epic with an open pull request and a criterion unticked is In Progress.
- An initiative or an epic with no open pull request and unticked criteria keeps Ready or Backlog, and keeps In Progress when delivery has started. In Review then becomes In Progress. One not yet on the board is added at Backlog, or at In Progress when delivery has started. [Advance Mode](advance-mode.md#rules) sets the queue.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --board users/{owner}/projectsV2/9 --fields fields.json --items items.json --out board/ --assignee m2ux
```

### Plan Queue

Decides which initiatives and epics on a theme board move between Backlog, Ready and In Progress, and prints the call for each Status and assignee change.

- The rules are [Advance Mode](advance-mode.md).
- `--items` is [Fetch Board Items with Status](#fetch-board-items-with-status). `--prs` is [Fetch All Initiative Pull Requests](#fetch-all-initiative-pull-requests).
- `--assignee` is the user [Find User](#find-user) prints.
- Give an issue it reports unresolved with `--others`.
- `--unplanned` names an initiative the user left with no priority, as a number or `owner/repo#number`.
- An `order` line lists the initiatives for a parallel work map. The same priority number runs together.
- An `ask` line names an initiative In Progress with no priority label.
- An `order` or `ask` line is a question. The queue is not finished while one is printed. After the answer, fetch the items again and run the command again.
- A `wait` line names an open pull request. That initiative stays In Progress. The highest set still moves to In Progress.
- A `next` line names epics, as the Report rule in [Advance Mode](advance-mode.md#rules) says.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/advance.py --items items.json --prs prs.json --board users/{owner}/projectsV2/9 --fields fields.json --out board/ --assignee m2ux
```

### Find Available Work

Reports each unit of work a theme board makes available, each row a session holds, and each row its dependencies block.

- The rules are [Deliver Mode](deliver-mode.md).
- `--items` is [Fetch Board Items with Status](#fetch-board-items-with-status). `--prs` is [Fetch All Initiative Pull Requests](#fetch-all-initiative-pull-requests).
- Give an issue it reports unresolved with `--others`.
- `--project` is `<main>`, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. A base whose last segment is not one of those subfolders is ignored.
- `--bases` is the list [List Epic Bases](#list-epic-bases) prints for the board's epics, comma-separated.
- A `unit` line names the tasks of one session's work, their coverage, and the record folder, branch, base and worktree their ids and Description give them. One base is `base i07/e00/main`. Several are `bases i07/e00/main i07/e00/workflows`.
- A `hold` line names a row a session holds, and the record it links.
- A `blocked` line names a free row whose dependencies are undelivered, or whose joined task is unavailable.
- A `merge` line names an open pull request whose test plan has passed, and the epic base it targets. [Deliver Mode](deliver-mode.md) merges it on the run.
- `--date` opens the records on another day than today.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --items items.json --prs prs.json --project <main> --bases i07/e00/main,i07/e00/workflows
```

### Reserve Row

Holds each named task row for one session, by appending its record folder's link to the row id.

- It refuses a row already held, and one whose id links a pull request or a commit.
- `--records` is the URL of the planning records folder, needed when no row id in the epic links a record.
- The folder is the one [Find Available Work](#find-available-work) names, and `--date` is the day it is opened.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --reserve W01,W02 --records https://github.com/{owner}/{repo}/tree/engineering/artifacts/planning --fix fixed-943.md
```

### Record Work Item

Points a held task row at the work item its session wrote, ahead of the record folder's link.

- It refuses a row that no session holds, and one whose id already links that file.
- The hold stands until the row links its pull request, which [Sync Epic](#sync-epic) writes.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --item W01 --fix fixed-943.md
```

### Release Row

Frees each named task row, by dropping the record folder's link from the row id.

- It refuses a row that no session holds.
- A row whose id then links nothing carries the bare task id.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --release W01 --fix fixed-943.md
```

### Summarise Progress

Prints the standup from [Fetch Board Items with Status](#fetch-board-items-with-status) and [Fetch All Initiative Pull Requests](#fetch-all-initiative-pull-requests).

- `--since` opens the window on another date than a week before today.
- `--initiative I08` limits it to one initiative, or `owner/repo:I08` where that number names initiatives in several repositories.
- `--initiatives` gives the initiatives off the board, each from [Fetch Issue](#fetch-issue).
- `--summary` gives the paragraph for management.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --initiatives issue-946.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --since 2026-09-21 --initiative I08 --summary summary.txt
```

### Run Tests

Runs the skill's script tests.

```bash
cd <workspace>/skills/work-planner && <workspace>/scripts/sbx python3 -m unittest discover -s test
```
