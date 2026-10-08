# Work Breakdown Guide

How the Work Breakdown tables are written, read and kept current, what a plan or coverage report names, and what a Problem and a Proposal hold. Issue bodies carry the tables and nothing about them: the conventions live here.

## Tables

| Level | Columns |
| --- | --- |
| Initiative | `Epic \| Description \| Coverage \| Depends on \| Done` |
| Epic | `Task \| Description \| Coverage \| Depends on \| Joins \| Done` |

- **Done.**
  The last column. Its cell is empty while the row is open, and a tick, ✓, when the row is complete.
  - A task row is complete when it is delivered, as [Task ids](#delivery) defines, and every criterion its Coverage names is ticked.
  - An epic row is complete when its issue is closed as completed, which is when every one of its criteria is ticked, every one of its tasks is delivered, and each of its base branches has merged into the initiative's integration branch.
- **Row id.**
  - An initiative's row id is the epic, linked to its issue: `[E01](…/issues/937)`.
  - An epic's row id is the task, `W01`. What it links is [Task ids](#delivery). `W00` holds preparatory work that must land before the first real task.
  - A task is a row, and gets its own `[Ixx:Eyy:Wzz]` issue only when it needs discussion or evidence of its own.
- **Description.**
  A short phrase naming what the row delivers, at most eight words, with no list, semicolon or detail.
  - In an epic: each detail is a criterion stating one invariant.
  - In an initiative: the phrase is the epic's title name, the part before the colon (`[I07:E01] Formal Specification: …` gives `Formal Specification`), so the table and the epic name the work alike.
- **Coverage.**
  The acceptance criteria the row delivers, `AC2, AC5`, and nothing else. Every criterion is delivered by at least one row.
  - In an epic: the epic's criteria the task must meet. A complete task's cell is empty.
  - In an initiative: the initiative's criteria the epic serves, so each traces to its epics.
- **Depends on.**
  References only, with no prose, and only what no other entry in the cell already implies.
  - In an epic: what must be true before the task starts. An earlier task in the epic (`W03`, `W04–W09`), a task or the whole of an earlier epic (`[E01:W02](…)`, `[E01](…)`), or something outside the initiative (`#750`, `[I05:E00:W02](…)`).
  - In an initiative: epics only, never tasks. The other epics this epic's tasks depend on, less those another named epic already depends on (`[E02](…), [E04](…)`). [Check Dependencies](commands.md#check-dependencies) derives it from the epic tables.
- **Task grain.**
  - A task is one pull request's worth of work.
  - A criterion a merged pull request left unticked belongs to a further task. The further task depends on the delivered task, and its Coverage is that criterion. Criteria one pull request can deliver share one further task. The delivered task's Coverage omits each criterion a further task adopts.
  - A task delivering more than three criteria is split into tasks one pull request each can deliver.
  - A task covers at least one acceptance criterion, as [One row](review-criteria.md#one-row) defines.
  - Every test the work calls for accompanies that task. The content steers which kinds those are, including the project's system test when the work is something that test can exercise. A failure in any test the task carries keeps the task open. None of those tests is a later row.
  - Reusable routines, techniques, and resources are specced, created, and tested before an activity binds them. The grain of an existing resource is in that work.
  - When the behaviour a wired activity produces differs from the behaviour the work expected, that task changes the routine, technique, or resource, and the tests that cover the change, until fit, form, and function hold.
- **Joins.**
  The tasks that share one pull request. Each names the other, and neither depends on the other, directly or through a task outside the pair: the pull request holds their order.
  - Planning completes Joins before any issue of the epic is created. Compare every pair of tasks in the epic where neither depends on the other, directly or through another task.
  - A pair that shares a pull request names each other.
  - A pair that does not is named in the planning record, with why.
  - An empty cell is a task that shares no pull request, and only once that record names every such pair.
  - [Check Dependencies](commands.md#check-dependencies) prints each eligible pair that does not name each other.

## Coverage Reports

- **Unobservable items.**
  An item a test cannot observe is named in the plan or the coverage report. It stays in the report.
- **The check matches the criterion.**
  - A file or string check counts as coverage only when the criterion is a fact about that file.
  - A criterion about a run is covered by a run that shows it.
- **The specified set.**
  A coverage report lists every acceptance criterion the work under review is specified to cover.

## Numbering

Epics are numbered in the order they run, and tasks in the order they can start, so every dependency points to an earlier epic or an earlier task. [Check Dependencies](commands.md#check-dependencies) reports numbering that does not follow start order as advisory, because older initiatives predate the rule.

Work a pull request names keeps its number: an epic once a pull request names it, and a task once its id links a pull request, open or merged. Renumbering touches only a task whose id links no pull request, and an epic no pull request names.

## References

Tables write references with colons (`E01:W03`, `I05:E00:W02`), the form the scripts read, and link every epic reference to its epic's issue: `[E01:W03](…/issues/937)`. Prose uses a space (`E01 W03`).

## Delivery

- **Pull request scope.**
  A pull request delivers one task, or a set of tasks that name each other in Joins.
- **Pull request titles.**
  - A pull request's title starts with the epic it works on: `[I07:E00] Purpose`.
  - [Sync Mode](sync-mode.md) finds an epic's pull requests by this prefix, and matches each one, open or merged, to the tasks it works on from its changes and the tasks' Descriptions.
  - The pull request that merges an epic base carries the same prefix. Its head is the epic base, which is how [Sync Mode](sync-mode.md) tells it from a task pull request.
- **Long-lived branches.**
  - A project's long-lived branches are the subfolder names of `.project` in the main working tree. A linked worktree uses that tree.
  - **Example.**
    workflow-server's `.project` subfolders are `docker`, `main` and `workflows`.
- **Integration branches.**
  - Each long-lived branch an initiative changes has an integration branch, named for the initiative and that branch and cut from it.
  - **Example.**
    An integration branch cut from `main` is `i07/main`.
  - An epic base is cut from the integration branch, and the pull request that merges that base targets it.
  - [Deliver Mode](deliver-mode.md) merges the long-lived branch into the integration branch before it merges that branch into an epic base, so the epic base takes the long-lived branch's later changes.
  - Once every criterion is ticked, the pull request that merges an integration branch into its long-lived branch opens, and the initiative stays open until each such pull request has merged. Merging it is the user's call, so no part of an initiative with an unticked criterion reaches a long-lived branch.
- **Epic bases.**
  - Each long-lived branch an epic changes has a base branch, named for the initiative, the epic and that branch, and cut from the initiative's integration branch for it.
  - **Example.**
    An epic base cut from `i07/main` is `i07/e00/main`.
  - Every pull request delivering the epic's tasks targets that base, never the integration branch or the long-lived branch.
  - [Deliver Mode](deliver-mode.md) merges the integration branch into the epic base after that, then merges the task pull request. When that merge is refused, it updates the task branch from the epic base and merges again. A conflict in that update leaves the pull request open.
  - Once every task is delivered and every criterion is ticked, moving the epic to In Review opens the pull request that merges each base into its integration branch, and the epic stays open until each such pull request has merged. Merging it is the reviewer's call, so no part of an epic with an unticked criterion or an undelivered task reaches an integration branch.
- **Task branches.**
  - A unit's task branch is cut from the epic base [Find Available Work](commands.md#find-available-work) names for it, for the long-lived branch the unit changes, named for its initiative, epic and first task in lowercase separated by slashes, and hyphenated with a slug of at most four words from its Description when one exists: `i01/e02/w04-write-defaults`.
  - Every pull request delivering the unit's work is opened from this branch.
- **Test plan.**
  - A task pull request carries its test plan as the checked list in its body. Each table row whose Test cell names a check has one box with the same id. A row whose Test cell is empty has no box.
  - An item has passed when it has been run and it held, and its box is ticked to record that.
  - The test plan has passed when every box is ticked.
  - [Deliver Mode](deliver-mode.md) merges the pull request in the order Epic bases states, when the test plan has passed. The pull request stays open while a box is unticked.
  - After that merge, Deliver Mode syncs that epic and its task issues. It does not sync the initiative or the board.
- **Task ids.**
  - Until a pull request is open, the id links that task's file in the planning record: `[W01](…/w01.md)`. The file name is the task id in lower case.
  - A session that holds the task adds its record folder's link, which is the hold: `[W01](…/w01.md), [W01](…/2026-10-06-943-i07-e00-w01-queue-plan/)`. [Deliver Mode](deliver-mode.md) writes and reads it.
  - Once a pull request is open, the id links that pull request and the planning-record links are gone: `[W01](…/pull/950)`. A further pull request is linked after the ones already there: `[W01](…/pull/950), [W01](…/pull/960)`.
  - The task is delivered when a linked pull request has merged, or its id links a commit.
  - A link to an open pull request does not deliver the task.
  - A linked pull request whose title names another epic delivers the task once it has merged. The mismatch is reported, and the row stays open while a criterion its Coverage names is unticked.
- **Tasks with their own issue.**
  - A task issue belongs to one epic. Its title carries that epic's prefix.
  - When that epic's table has no row for its id, [Sync Epic](commands.md#sync-epic) reports it and [Plan Mode](plan-mode.md) adds the row. Once the row exists, that epic's planning manages the issue.
  - The row links the pull request, not the issue.
  - The pull request's body cites the issue by its URL.
  - The issue is closed as completed when the task is delivered and every criterion it cites is ticked.
- **Issues backing several tasks.**
  An issue backing several tasks, such as an investigation, is a reference: the epic cites it under References, no row id links it, and its title carries no agent-engineering prefix.
- **Work another issue takes.**
  It leaves the table. Its criteria go with it, or to another row that delivers them.

## Work item

One file per task, named for the task id in lower case, `w01.md`. The record's README links each file. The epic table's task id links that file until a pull request is open.

The file uses the epic template's Overview, Problem, Proposal, and Work Breakdown. It carries no acceptance criteria and no joins.

- **Overview.**
  One paragraph on what the task delivers and why.
- **Problem.**
  The friction, as a Problem is written for an epic.
- **Proposal.**
  The design, as a Proposal is written for an epic. The first part of it states the scene. A list of items is a bulleted list.
- **Work Breakdown.**
  A table decomposes the task into the parts of the work, such as analysis, plan, implementation, review, and test. A row is one part. The columns are the part and its description. The test row names the checks the content calls for, including the project's system test when the work is something that test can exercise.
- **The work only.**
  The file names no other task, and it carries no coverage, dependency, or join. Those stay in the epic table.

## Problem and Proposal

- **Friction.**
  A Problem states the friction as it is now. Its evidence is a count or a code link for that friction.
- **Plan ids.**
  A Problem or a Proposal names no epic, task, or acceptance criterion of its own initiative. That work has not happened, and the Work Breakdown table is where those references live.
- **Evidence that may be cited.**
  A boundary with a sibling epic is plain language. Code, a merged pull request, and an issue outside this initiative may be cited.

## Rules

- **Order.**
  An initiative or epic body does not narrate the order work runs in, why, or how the tables work. Depends on states the order, and this guide states the rest.
- **Chains and reviews.**
  Longest chains, ordering reviews and their reasons go in the planning record.
- **Change.**
  How the plan changed is left out, as the skill's [Rules](../SKILL.md#rules) state.
