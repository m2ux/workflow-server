---
name: initiative-planning
description: >-
  Plans and maintains a house initiative on GitHub: an [Ixx] initiative issue, its [Ixx:Eyy] epics
  and [Ixx:Eyy:Wzz] tasks, written from the house body templates, with a planning record on the
  engineering branch. Plan mode raises or restructures an initiative, runs review passes against its
  goal, for consistency and for dependency order, and renumbers epics and tasks so numbers follow
  run order. Review mode checks existing issues against the templates and fixes them. Update mode
  records delivered work: links each delivered task to its pull request, ticks the criteria that
  now hold, closes what is complete, and updates the initiative's project board. Hoist mode finds
  orphan issues and brings each one the user chooses into an existing or new initiative, epic or
  task, closing an orphan whose detail the taking issue cites. Progress mode summarises the project
  board as a standup in Slack markup: a paragraph for management on what the window accomplished,
  then what completed, what is in progress and what is next. Use
  when the user asks to raise, plan or restructure an initiative or epic, to review an initiative,
  to check an issue's format or bring it into the house layout, to check or fix dependencies or
  ordering, to renumber epics or tasks, to fold review findings into issues, to update an
  initiative or epic with completed work, to hoist or triage orphan issues into initiatives, or for
  a progress summary, standup or status update.
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
- **Update mode** — record delivered work: link tasks to their pull requests, tick criteria that
  hold, close complete task issues, epics and initiatives, and update the initiative's project
  board: `references/update-mode.md`.
- **Hoist mode** — find orphan issues, offer each a placement in an existing or new initiative,
  epic or task, and migrate or subsume the ones the user places: `references/hoist-mode.md`.
- **Progress mode** — summarise the project board as a standup for a Slack channel: a paragraph
  for management on what the window accomplished, then what completed, what is in progress and
  what is next: `references/progress-mode.md`.

Every mode also reads `references/work-breakdown.md`, the guide to the Work Breakdown tables: their
columns, numbering, references and delivery.

## House scheme

| Level | Title | Labels |
| --- | --- | --- |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, a `theme:*` |
| Epic | `[I07:E00] Name: Subtitle` | `type:epic`, a `theme:*` |
| Task | `[I07:E00:W01] Name: Subtitle` | `type:task` |
| Standalone issue | `Name: Subtitle`, with no prefix | no `type:*` |

- **Numbers.** `I` is the initiative number, `E` the epic within it, and `W` the task within the
  epic. Initiatives and epics count from `00`, and tasks from `W01`.
- **Titles.** The prefix separates levels with colons (`[I07:E00:W01]`), then a short name, a
  colon, and a subtitle stating the outcome; a standalone issue's title is the same without the
  prefix. The name is two or three words and the subtitle a
  succinct summary of at most ten, both in title case: `[I07:E06] Reliability Evaluation: Briefs,
  Measures and the Thresholds That Define Reliable`.
- **Bodies.** Every body follows its template in `templates/`: `initiative.md`, `epic.md`,
  `task.md`, and `issue.md` for a standalone issue outside any initiative. A task or standalone
  issue has an epic's structure without the Work Breakdown table. Keep the section order and the
  table columns. Fill each `{{…}}` and delete a section the template marks as optional when it has
  nothing to say. What a body leaves out is in the Work Breakdown guide.
- **Next number.** Find the next initiative number by listing titles:
  `gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'`.
- **Labels.** Besides the type and theme, add `enhancement`, `bug`, `tech-debt`, `workflows` and a
  `priority: *` as they apply. Only labels that exist:
  `gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'`.

## Commands

GitHub goes through REST only, with full host permissions. Once per session, before the first `gh`
call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login; where shell state does not
persist between commands, confirm instead that neither is set in the shell profile. `gh` resolves
`{owner}/{repo}` from the git remote of the directory it runs in, so run these inside a checkout of
the repository that holds the issues:

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
gh api repos/{owner}/{repo}/issues/943 > issue-943.json
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

Bodies always go through a file with `-F body=@file`. Never inline them, which avoids quoting and the
workspace's dynamic-shell restrictions. Keep these files in a working directory outside the
repository.

The scripts in `scripts/` run under the sandbox, invoked by the absolute path of the workspace
checkout's `scripts/sbx`. `<workspace>` in the mode files stands for that checkout. Their tests are
in `test/`: `cd <workspace>/skills/initiative-planning && <workspace>/scripts/sbx python3 -m unittest
discover -s test`.

## Rules

- **Decisions.** Ask them one at a time, each with a recommended option, and record each answer in
  the affected issues and, when there is one, the planning record.
- **Measured claims.** A count or a chain comes from a command's output, never from a hand count.
- **Bodies state the plan as it is.** No body carries change narrative:
  nothing moved, renumbered, replaced, discharged or formerly anything. How the plan evolved goes in
  the planning record and in commit and pull request bodies.
- **Other initiatives.** Editing another initiative's issue needs the user's explicit approval.
