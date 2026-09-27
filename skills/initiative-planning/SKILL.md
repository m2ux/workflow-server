---
name: initiative-planning
description: >-
  Plans and maintains a house initiative on GitHub: an [Ixx] initiative issue, its [Ixx Eyy] epics
  and [Ixx Eyy Wzz] tasks, written from the house body templates, with a planning record on the
  engineering branch. Runs review passes against the initiative's goal, for consistency, and for
  dependency order, and renumbers epics and tasks so numbers follow run order. Use when the user asks
  to raise, plan or restructure an initiative or epic, to review an initiative, to check or fix
  dependencies or ordering, to renumber epics or tasks, or to fold review findings into issues.
---

# Initiative Planning

An initiative is one issue that states a goal and lists its epics. Each epic is an issue with its own
tasks. Issues are the plan. A planning record on the `engineering` branch holds the evidence, the
decisions and each review.

## House scheme

| Level | Title | Labels |
| --- | --- | --- |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, `enhancement`, a `theme:*` |
| Epic | `[I07 E00] Name: Subtitle` | `type:epic`, `enhancement`, a `theme:*` |
| Task | `[I07 E00 W01] Name: subtitle` | `type:task` |

- **Numbers.** `I` is the initiative number, `E` the epic within it, and `W` the task within the
  epic. Initiatives and epics count from `00`. Tasks count from `W01`; `W00` holds preparatory work
  that must land before the first real task.
- **Titles.** A short name, a colon, and a subtitle stating the outcome. Match the capitalisation
  of recent titles in the same initiative.
- **Order.** Epics are numbered in the order they run, and tasks in the order they can start.
- **Task issues.** A task is a row in its epic's table. It gets its own `[Ixx Eyy Wzz]` issue only
  when it needs discussion or evidence of its own; its row then links that issue.
- **Bodies.** Every body follows its template in `templates/`: `initiative.md`, `epic.md`,
  `task.md`. Keep the section order and the fixed sentences. Fill each `{{…}}` and delete a section
  the template marks as optional when it has nothing to say.
- **Check current practice.** Before relying on the scheme, read one recent initiative and one epic.
  Find the next initiative number by listing titles:
  `gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'`.
- **Labels.** Only labels that exist: `gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'`.

## Procedure

1. **Understand the request.** Interview the user one question at a time, each with a recommended
   option, until the goal and scope are clear.
2. **Gather evidence.** Measure the current state: counts, paths, file:line. Delegate broad sweeps to
   parallel sub-agents, and spot-check what they return before recording it.
3. **Planning record.**
   - Branch a worktree from `origin/engineering` and add
     `artifacts/planning/<yyyy-mm-dd>-<slug>/`.
   - `README.md` holds the problem, goals, design, decisions, reviews and open questions.
     `inventory.md` holds the evidence.
   - Open a draft PR against `engineering` for discussion. The user merges it.
4. **Draft bodies** from the templates, into local files in a working directory outside the
   repository. Those files are the source for every later edit.
5. **Create issues** so that every number exists before it is cited:
   1. the initiative, with placeholders such as `#E00` for its epics;
   2. the epics in dependency order, each citing the initiative and the epics created before it,
      with placeholders for any it cites that do not exist yet;
   3. patches replacing every remaining placeholder, in the initiative and in any epic that holds
      one. Grep the local files for `#E0` until none is left.
6. **Review.** Run the passes in `references/reviews.md`:
   - the goal pass, after drafting;
   - the consistency pass, after every round of edits;
   - the ordering pass, whenever tasks or dependencies change.

   Fold each finding in and record it in the planning record.
7. **Keep in step.** After each round, patch every changed issue, update the planning record and the
   discussion PR body, then commit and push. Titles change with renumbering.
8. **Deliver.** As work lands, keep each epic current:
   - **PR column:** the pull request or commit link, or `in flight` while it is open.
   - **Work cell:** append `— **done**` when the task lands, or `— **moved to [#nnn](…) Wzz**` when
     another issue takes it.
   - **Criteria:** tick each acceptance criterion when its outcome is observable.
   - **Where it stands:** record what landed and any figure that came out differently from the plan.
   - **Closing:** close an epic when every criterion is ticked, and the initiative when every epic is
     closed.

## Commands

GitHub goes through REST only, with full host permissions and token variables unset. `gh` resolves
`{owner}/{repo}` from the git remote of the directory it runs in, so run these inside a checkout of
the repository that holds the issues:

```bash
unset GH_TOKEN GITHUB_TOKEN; gh api --method POST repos/{owner}/{repo}/issues -f title='[I07 E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
unset GH_TOKEN GITHUB_TOKEN; gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
unset GH_TOKEN GITHUB_TOKEN; gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
```

Bodies always go through a file with `-F body=@file`. Never inline them, which avoids quoting and the
workspace's dynamic-shell restrictions. The scripts run under the sandbox, invoked by the absolute
path of the workspace checkout's `scripts/sbx`. `<workspace>` below stands for that checkout.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/deps.py E00=live-943.md E01=live-937.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/renumber.py --initiative 07 --map 6:0,0:1 live-*.md
```

## Rules

- **Dependencies.** Every dependency points to an earlier epic or an earlier task. **Depends on** is
  what must be true before the work starts.
- **Measured claims.** A count or a chain comes from a command's output, never from a hand count.
- **Decisions.** Ask them one at a time, and record each answer in the planning record and the
  affected issues.
- **Bodies may carry history.** Issue and PR bodies may state the before-state. The planning record
  records how the plan evolved.
- **Other initiatives.** Editing another initiative's issue needs the user's explicit approval.
- **The discussion PR.** Merging it is the user's call. After it merges, repoint the issue links to
  `engineering`.
