---
name: initiative-planning
description: >-
  Plans and maintains a house initiative on GitHub: an [Ixx] initiative issue, its [Ixx:Eyy] epics
  and [Ixx:Eyy:Wzz] tasks, written from the house body templates, with a planning record on the
  engineering branch. Plan mode raises or restructures an initiative, runs review passes against its
  goal, for consistency and for dependency order, and renumbers epics and tasks so numbers follow
  run order. Review mode checks existing issues against the templates and fixes them. Use when the
  user asks to raise, plan or restructure an initiative or epic, to review an initiative, to check an
  issue's format or bring it into the house layout, to check or fix dependencies or ordering, to
  renumber epics or tasks, or to fold review findings into issues.
---

# Initiative Planning

An initiative is one issue that states a goal and lists its epics. Each epic is an issue with its own
tasks. Issues are the plan. A planning record on the `engineering` branch holds the evidence, the
decisions and each review.

## Modes

Read the file for the mode the request calls for:

- **Plan mode** — raise, plan or restructure an initiative or epic; review a plan against its goal;
  check dependencies; renumber; fold findings in: `references/plan-mode.md`.
- **Review mode** — check existing issues against the templates and fix them:
  `references/review-mode.md`.

## House scheme

| Level | Title | Labels |
| --- | --- | --- |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, a `theme:*` |
| Epic | `[I07:E00] Name: Subtitle` | `type:epic`, a `theme:*` |
| Task | `[I07:E00:W01] Name: subtitle` | `type:task` |

- **Numbers.** `I` is the initiative number, `E` the epic within it, and `W` the task within the
  epic. Initiatives and epics count from `00`. Tasks count from `W01`; `W00` holds preparatory work
  that must land before the first real task.
- **Titles.** The prefix separates levels with colons (`[I07:E00:W01]`), then a short name, a
  colon, and a subtitle stating the outcome. Match the capitalisation of recent titles in the same
  initiative. References inside bodies and tables use a space (`E01 W03`, `I05 E00 W02`), which is
  the form the scripts read.
- **Order.** Epics are numbered in the order they run, and tasks in the order they can start. This
  holds for every plan this skill writes. `deps.py` reports it as advisory, because older
  initiatives predate it.
- **Outcomes.** A Work Breakdown row's **Outcomes** cell says what the row does and ends with the
  acceptance criteria it delivers: `… → AC2, AC5`. An epic's rows cite the epic's criteria, and an
  initiative's rows the initiative's. Every criterion is delivered by at least one row, so an agent
  working a task knows which criteria it must meet.
- **Task issues.** A task is a row in its epic's table. It gets its own `[Ixx:Eyy:Wzz]` issue only
  when it needs discussion or evidence of its own; its row then links that issue.
- **Bodies.** Every body follows its template in `templates/`: `initiative.md`, `epic.md`,
  `task.md`. Keep the section order, the table columns and the fixed sentences. Fill each `{{…}}`
  and delete a section the template marks as optional when it has nothing to say.
- **Check current practice.** Before relying on the scheme, read one recent initiative and one epic.
  Find the next initiative number by listing titles:
  `gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'`.
- **Labels.** Besides the type and theme, add `enhancement`, `bug`, `tech-debt`, `workflows` and a
  `priority: *` as they apply. Only labels that exist:
  `gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'`.

## Commands

GitHub goes through REST only, with full host permissions and token variables unset. `gh` resolves
`{owner}/{repo}` from the git remote of the directory it runs in, so run these inside a checkout of
the repository that holds the issues:

```bash
unset GH_TOKEN GITHUB_TOKEN; gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
unset GH_TOKEN GITHUB_TOKEN; gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
unset GH_TOKEN GITHUB_TOKEN; gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
unset GH_TOKEN GITHUB_TOKEN; gh api repos/{owner}/{repo}/issues/943 > issue-943.json
unset GH_TOKEN GITHUB_TOKEN; gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
unset GH_TOKEN GITHUB_TOKEN; gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
unset GH_TOKEN GITHUB_TOKEN; gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
unset GH_TOKEN GITHUB_TOKEN; gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed --jq .state
```

Bodies always go through a file with `-F body=@file`. Never inline them, which avoids quoting and the
workspace's dynamic-shell restrictions. Keep these files in a working directory outside the
repository.

The scripts in `scripts/` run under the sandbox, invoked by the absolute path of the workspace
checkout's `scripts/sbx`. `<workspace>` in the mode files stands for that checkout.

## Rules

- **Decisions.** Ask them one at a time, each with a recommended option, and record each answer in
  the planning record and the affected issues.
- **Measured claims.** A count or a chain comes from a command's output, never from a hand count.
- **Bodies may carry history.** Issue and PR bodies may state the before-state. The planning record
  records how the plan evolved.
- **Other initiatives.** Editing another initiative's issue needs the user's explicit approval.
