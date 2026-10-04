# Work Breakdown Guide

How the Work Breakdown tables are written, read and kept current, what a plan or coverage report names, and what a Problem and a Proposal hold. Issue bodies carry the tables and nothing about them: the conventions live here.

## Tables

| Level | Columns |
| --- | --- |
| Initiative | `Epic \| Description \| Coverage \| Depends on \| Done` |
| Epic | `Task \| Description \| Coverage \| Depends on \| Joins \| Done` |

- **Done.**
  The last column. Its cell is empty while the row is open, and a tick, ✓, when the row is complete.
  - A task row is complete when it is delivered and every criterion its Coverage names is ticked.
  - An epic row is complete when its issue is closed as completed, which is when every one of its criteria is ticked and every one of its tasks is delivered.
  - A merged pull request that leaves any criterion its Coverage names unmet leaves that task's cell empty. The task takes further pull requests until they hold.
- **Row id.**
  - An initiative's row id is the epic, linked to its issue: `[E01](…/issues/937)`.
  - An epic's row id is the task, `W01`; `W00` holds preparatory work that must land before the first real task.
  - A task is a row, and gets its own `[Ixx:Eyy:Wzz]` issue only when it needs discussion or evidence of its own.
- **Description.**
  A short phrase naming what the row delivers, at most eight words, with no list, semicolon or detail.
  - In an epic: each detail is a criterion stating one invariant.
  - In an initiative: the phrase is the epic's title name, the part before the colon (`[I07:E01] Formal Specification: …` gives `Formal Specification`), so the table and the epic name the work alike.
- **Coverage.**
  The acceptance criteria the row delivers, `AC2, AC5`, and nothing else. Every criterion is delivered by at least one row.
  - In an epic: the epic's criteria the task must meet.
  - In an initiative: the initiative's criteria the epic serves, so each traces to its epics.
- **Depends on.**
  References only, with no prose, and only what no other entry in the cell already implies.
  - In an epic: what must be true before the task starts. An earlier task in the epic (`W03`, `W04–W09`), a task or the whole of an earlier epic (`[E01:W02](…)`, `[E01](…)`), or something outside the initiative (`#750`, `[I05:E00:W02](…)`).
  - In an initiative: epics only, never tasks. The other epics this epic's tasks depend on, less those another named epic already depends on (`[E02](…), [E04](…)`). [Check Dependencies](commands.md#check-dependencies) derives it from the epic tables.
- **Task grain.**
  - A task is one pull request's worth of work, and takes further pull requests when a merged one leaves it short of Done.
  - A task delivering more than three criteria that no other task delivers is split into tasks one pull request each can deliver.
  - A criterion several tasks deliver, such as a convention every grammar task follows, is shared and counts towards none of them.
- **Joins.**
  The tasks that can land in the same pull request as this one. Each lists the other, and neither depends on the other, directly or through a task outside the pair: the pull request holds their order.

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
  A pull request delivers one task, or a set of tasks that name each other in Joins. A further pull request on a task that is not yet Done delivers that same task, or tasks that name it in Joins.
- **Pull request titles.**
  - A pull request's title starts with the epic it works on: `[I07:E00] Purpose`.
  - [Sync Mode](sync-mode.md) finds an epic's pull requests by this prefix, and matches each one, open or merged, to the tasks it works on from its changes and the tasks' Descriptions.
- **Integration branches.**
  - Each long-lived branch an initiative changes has an integration branch, named for the initiative and that branch and cut from it.
  - **Example.**
    workflow-server's long-lived branches are `main`, `workflows` and `workspace`, and an integration branch cut from `main` is `i07/main`.
  - Every pull request delivering the initiative's work targets its integration branch, never the long-lived branch.
  - An integration branch takes its long-lived branch's later changes by merge, so the pull requests open against it keep their base.
  - Once every criterion is ticked, the pull request that merges an integration branch into its long-lived branch opens, and the initiative stays open until each such pull request has merged. Merging it is the user's call, so no part of an initiative with an unticked criterion reaches a long-lived branch.
- **Task ids.**
  - A task's id links each pull request associated with it, open or merged: `[W01](…/pull/950)`. A further pull request is linked after the ones already there: `[W01](…/pull/950), [W01](…/pull/960)`. A task with no pull request is plain.
  - The task is delivered when a linked pull request has merged, or its id links a commit.
  - A link to an open pull request does not deliver the task.
  - A linked pull request whose title names another epic delivers the task once it has merged. The mismatch is reported, and the row stays open while a criterion its Coverage names is unticked.
- **Tasks with their own issue.**
  - The row links the pull request, not the issue.
  - The pull request's body cites the issue by its URL.
  - The issue is closed as completed when the task is delivered and every criterion it cites is ticked.
- **Issues backing several tasks.**
  An issue backing several tasks, such as an investigation, is a reference: the epic cites it under References, no row id links it, and its title carries no agent-engineering prefix.
- **Work another issue takes.**
  It leaves the table. Its criteria go with it, or to another row that delivers them.

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
