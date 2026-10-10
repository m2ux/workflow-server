# Work Breakdown Guide

How the Work Breakdown tables are written, read and kept current, what a plan or coverage report names, and what a Problem and a Proposal hold. Issue bodies carry the tables and nothing about them: the conventions live here.

## Tables

| Level | Columns |
| --- | --- |
| Initiative | `Epic \| Description \| Coverage \| Depends on \| Done` |
| Epic | `Task \| Description \| Coverage \| Depends on \| Joins \| Done` |

- **Done.**
  The last column. Its cell is empty while the row is open, and a tick, ✓, when the row is complete.
  - A task row is complete when it is delivered, as [Task ids](#task-delivery) defines, and every criterion its Coverage names is ticked.
  - An epic row is complete when its issue is closed as completed under [Issue Closure](#issue-closure).
- **Row id.**
  - An initiative's row id is the epic, linked to its issue: `[E01](…/issues/937)`.
  - An epic's row id is the task, `W01`. What it links is [Task ids](#task-delivery). `W00` holds preparatory work that must land before the first real task.
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
  - In an epic, a task row names the rows it depends on. An earlier task in the epic (`W03`, `W04–W09`), a row of an earlier epic (`[E01:W02](…)`), or something outside the initiative (`#750`, `[I05:E00:W02](…)`).
  - A task row names a whole epic (`[E01](…)`) only when every row of that epic must hold before the task starts, which is when the task consumes an output every row of the epic produces. The dependency is the row that produces the output the task consumes.
  - Planning completes cross-epic dependencies to rows before any issue of the epic is created. Both tables exist, and each edge names the row that produces what the dependent row consumes.
  - In an initiative: epics only, never tasks. Name a prerequisite epic only when every task or joined unit in the dependent epic requires every task in that prerequisite epic, directly or through its dependencies. The consumed output and the work producing it establish that requirement. Dependencies on selected tasks remain in the task tables; omit initiative edges another named whole-epic prerequisite already implies. [Check Dependencies](commands.md#check-dependencies) checks this against the task graph.
  - Dependencies identify the outputs a task consumes. When implementation can start also follows [Epic prerequisites](#epic-prerequisites).
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
  A task pull request delivers one task, or a set of tasks that name each other in Joins.
- **Other pull requests.**
  A pull request outside epic delivery targets a long-lived branch. An open stacked pull request is retargeted to its long-lived branch when its base merges.
- **Pull request titles.**
  - A pull request's title starts with the epic it works on: `[I07:E00] Purpose`.
  - [Sync Mode](sync-mode.md) finds an epic's pull requests by this prefix, and matches each one, open or merged, to the tasks it works on from its changes and the tasks' Descriptions.
  - The pull request that merges an epic base carries the same prefix. Its head is the epic base, which is how [Sync Mode](sync-mode.md) tells it from a task pull request.
- **Issue links.**
  - [Link Pull Request to Issue](commands.md#link-pull-request-to-issue) links a pull request to the issue it delivers, once that pull request is open. GitHub shows the link in the pull request's Development field and in the issue's Linked pull requests field, which the project board reads.
  - A task pull request links the task's issue, and a review pull request links its epic's issue.
  - The link is addressed by issue, so a pull request whose work carries no issue links nothing. A task pull request delivering rows that have no issue of their own is the whole of what stays unlinked.
  - The link is stored on the pull request. It holds on any base branch and on a pull request that has merged, and a later body edit leaves it standing.
  - [Issue closure](#issue-closure) governs when a linked issue closes.
  - The field is the whole of the relation: neither body links the other. The pull request's References carry its sources, and the issue it delivers is not among them.
  - [Sync Epic](commands.md#sync-epic), [Plan Board Changes](commands.md#plan-board-changes) and [Summarise Progress](commands.md#summarise-progress) read the links GitHub holds, from [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links). Sync reports a pull request that links no issue as uncited.
- **Long-lived branches.**
  - A project states its long-lived branches in `config/branches` at its root, one name per line. A run from a linked worktree reads the statement its main working tree holds.
  - A missing or empty `config/branches` leaves the names unevaluable. Report it and obtain the project's branch names before creating delivery branches.
  - **Example.**
    workflow-server's `config/branches` names `docker`, `main`, `workflows` and `workspace`.
- **Initiatives.**
  An initiative groups and tracks its epics, with no branch or delivery pull request. Its delivery checks require every epic to be closed as completed; completion follows [Issue Closure](#issue-closure).
- **Epic bases.**
  - Each long-lived branch an epic changes has a base branch, named for the initiative, the epic and that branch, and cut from that long-lived branch once [Epic prerequisites](#epic-prerequisites) hold.
  - **Example.**
    An epic base cut from `main` is `i07/e00/main`.
  - Every pull request delivering the epic's tasks targets that epic base.
  - When the first task merges into an epic base, the pull request that merges that base into its long-lived branch opens as a draft, as [Review pull request](#review-pull-request) states.
  - [Epic merge](#epic-merge) delivers each completed epic. The epic stays open until every base has merged into its long-lived branch.

### Epic Prerequisites

An epic starts implementation only when every prerequisite epic named by its task rows or its initiative row is closed as completed, after all of that prerequisite's bases have merged into their long-lived branches. A dependency on one task of another epic waits for that entire epic's delivery. Task-level references retain which output is consumed; initiative rows follow the dependency rule in [Tables](#tables).

Check these prerequisites before marking an unstarted epic Ready, cutting its bases, or dispatching a task, including when the board already says Ready or In Progress.

### Issue Closure

Work Planner closes an issue as completed only after its normal delivery checks pass, all its criteria are verified and ticked, and every pull request currently linked in its Development field has merged. This applies to tasks, epics, initiatives and standalone issues.

- **Repository prerequisite.**
  GitHub's **Auto-close issues with merged linked pull requests** setting is disabled in repositories participating in delivery. Confirm this with [Capture Issue Development](commands.md#capture-issue-development) before linking or merging a delivery pull request. An enabled or unknown setting leaves those actions blocked until configuration is confirmed; changing repository settings requires explicit authorization.
- **Complete link set.**
  Capture every Development-linked pull request, across repositories and all states. The issue's Development field supplies membership; titles, branch names, body mentions and a list filtered to one initiative do not establish completeness. An explicitly empty field adds no pull request requirement.
- **Every merge.**
  An open, draft, closed without merge, or unreadable linked pull request keeps the issue open. An abandoned or incorrectly linked pull request needs the user's decision before its Development link is removed. A replacement pull request does not remove the requirement on a link still present.
- **Final check.**
  [Check Issue Closure](commands.md#check-issue-closure) checks a fresh Development snapshot, the confirmed setting, the issue's criteria and fresh REST records for every linked pull request. [Close as Completed](commands.md#close-as-completed) runs that gate before writing the issue state. A changed link set requires another check.

### Missing Branches

For each long-lived branch the epic's tasks change:

- Once [Epic prerequisites](#epic-prerequisites) hold, cut a missing epic base from the long-lived branch with [Create Epic Base](commands.md#create-epic-base).

### Review Pull Request

When [Sync Epic](commands.md#sync-epic) reports a draft line, or an unmerged base with no open pull request, open that base with [Open Epic Pull Request](commands.md#open-epic-pull-request) as a draft and leave the epic open. The user marks the draft ready when the epic is complete. An agent leaves a draft pending that action.

- **The body states the branch.**
  - Overview is one paragraph on what the base carries. Changes holds one heading per area, with a bullet per functional change. References cites each task pull request merged into that base.
  - It carries no Test Plan, since it delivers no task of its own, and no statement about what the epic has yet to deliver. The epic's Work Breakdown is where delivery state is read.
- **Each task merge updates it.**
  The session that merged a task pull request runs [Update Review Pull Request](commands.md#update-review-pull-request) after [Sync Epic](commands.md#sync-epic), adding its unit's change under Changes and its pull request under References.
- **References are measured against the merges.**
  [Sync Epic](commands.md#sync-epic) compares the pull requests a review body cites with the task pull requests merged into that base, and reports a difference naming both sets.

### Epic Merge

[Sync Mode](sync-mode.md) and [Deliver Mode](deliver-mode.md) merge a ready epic pull request with [Merge Epic Pull Request](commands.md#merge-epic-pull-request), without asking for further confirmation, once all these conditions hold:

- The repository prerequisite in [Issue closure](#issue-closure) is confirmed.
- Every task is delivered, every epic criterion is verified and ticked, and the epic has no open questions or unresolved delivery discrepancies.
- The user has marked the draft ready, and its head and target are the epic base and corresponding long-lived branch.
- [Update Epic Base](commands.md#update-epic-base) has brought in the current target, the criteria still hold on that result, and [Fetch Merge Readiness](commands.md#fetch-merge-readiness) confirms required checks and repository review requirements pass for the current head.
- The review body describes the complete branch and cites its task merges. [Understand Mode](understand-mode.md) supplies its architecture overview before the merge.

A draft, conflict, failed or pending check, unmet criterion, or repository review requirement leaves the pull request open with the blocker reported. A changed head requires fresh verification. A merge refusal returns to the readiness checks; a repeated refusal is reported without retrying.

- After each successful merge, fetch the pull request again to confirm its merged state and commit, then re-run [Sync Epic](commands.md#sync-epic) with fresh pull requests and the issue.
- Close the epic only after every base has merged and [Issue closure](#issue-closure) passes, then sync its initiative. Initiative completion does not gate an epic's merge.

### Task Delivery

- **Task branches.**
  - A unit's task branch is cut from the epic base [Find Available Work](commands.md#find-available-work) names for it, for the long-lived branch the unit changes, named for its initiative, epic and first task in lowercase separated by slashes, and hyphenated with a slug of at most four words from its Description when one exists: `i01/e02/w04-write-defaults`.
  - Every pull request delivering the unit's work is opened from this branch.
- **Test plan.**
  A task pull request carries a [Test Plan](#test-plan).
- **Task ids.**
  - An unreserved task awaiting its pull request links its file in the planning record: `[W01](…/w01.md)`. The file name is the task id in lower case.
  - Each task row has one link. A reserved task links only its planning folder: `[W01](…/2026-10-06-943-i07-e00-w01-queue-plan/)`. The folder's README links the work-item file. Releasing the reservation points the row to that file.
  - Once a pull request is open, its link replaces the planning link: `[W01](…/pull/950)`. Further delivery work gets another task row under [Task grain](#tables). Joined rows each link their shared pull request.
  - The task is delivered when a linked pull request has merged, or its id links a commit.
  - A link to an open pull request does not deliver the task.
  - A linked pull request whose title names another epic delivers the task once it has merged. The mismatch is reported, and the row stays open while a criterion its Coverage names is unticked.
- **Tasks with their own issue.**
  - A task issue belongs to one epic. Its title carries that epic's prefix.
  - When that epic's table has no row for its id, [Sync Epic](commands.md#sync-epic) reports it unplaced, and the row is added as [Unplaced](#unplaced) states. Once the row exists, that epic's planning manages the issue.
  - The row links the pull request, not the issue.
  - The pull request's Development field links the issue as [Delivery](#delivery) states under Issue links.
  - A delivered task issue completes through [Issue Closure](#issue-closure).
- **Issues backing several tasks.**
  An issue backing several tasks, such as an investigation, is a reference: the epic cites it under References, no row id links it, and its title carries no agent-engineering prefix.
- **Work another issue takes.**
  It leaves the table. Its criteria go with it, or to another row that delivers them.

### Test Plan

- **Table.**
  The pull request's Test Plan section contains only one table, with columns Test, Description, Coverage and Pass, in that order.
- **Columns.**
  - Test names the id.
  - Description briefly names the check.
  - Coverage names the criteria the check observes, `AC1, AC3`, and is empty when the check observes none.
  - A row whose Test cell is empty names a criterion no check observes, and its Pass cell is empty.
  - Pass is empty while a check awaits a result. A recorded result uses ✓ when the check ran and held, or an accurate label such as Partial, Fail or Not run.
- **Evidence.**
  - Test procedures, tested revisions, observations, limitations and supporting evidence belong in the work's published planning document.
  - Each recorded result in Pass links to its relevant section in that document, using the result as link text: `[✓](URL#check)` or `[Partial](URL#check)`.
  - Verify that each evidence link is accessible to the pull request's readers and resolves to the intended section before publishing the body.
- **Completion.**
  The test plan has passed when every row with a Test id carries ✓ as its result. Partial, failed and unexecuted checks remain incomplete.
- **Coverage agreement.**
  [Sync Epic](commands.md#sync-epic) compares each linked pull request's test plan with the Coverage of the rows that pull request delivers. Each disagreement names the pull request and the row, and the sync goes on to link, tick and mark Done.
  - A criterion the plan names that those rows do not cover.
  - A criterion a row covers that no test-plan row names.
  - A criterion a row covers that a test-plan row names with an empty Test cell, reported as unobserved.
  - A sentence that names a criterion and says it belongs to, is left to, or is owned by a task the table gives to another row.

### Test Coverage

- Every criterion a unit's Coverage names has an observing test in its work item and pull request. A criterion no test can observe remains in the [Coverage Report](#coverage-reports) and in a test-plan row with an empty Test cell.
- The criterion selects the test kind: a unit test for one component, an integration test for a seam between components, and an end-to-end or system test for running-system behaviour. Apply [Coverage Reports](#coverage-reports) when evaluating that evidence.
- An instrument that does not exist yet is work the task carries, as [Verified](review-criteria.md#verified) defines. Use the project's own system test where it can observe the criterion.
- Write one [Test Plan](#test-plan) row per check, in execution order, followed by any unobserved criteria. Every criterion in the unit's Coverage appears in at least one row.

### Task Merge

Merge each open task pull request whose [Test Plan](#test-plan) has passed, both on a delivery run that finds it and in the session that opened it, without further confirmation.

1. **Check.**
   Confirm the repository prerequisite in [Issue Closure](#issue-closure) and the task pull request's epic base.
2. **Update and merge.**
   Run [Update Epic Base](commands.md#update-epic-base), then [Merge Pull Request](commands.md#merge-pull-request). If refused, run [Update Task Branch](commands.md#update-task-branch) and retry the merge. A conflict or repeated refusal leaves the pull request open with the blocker reported.
3. **Record delivery.**
   Fetch the merged pull request, then run [Sync Task Issue](commands.md#sync-task-issue) for its task issues and [Sync Epic](commands.md#sync-epic). Verify criteria before ticking them, patch changed issue bodies, and complete eligible issues through [Close as Completed](commands.md#close-as-completed).
4. **Update the review.**
   Follow [Review pull request](#review-pull-request), opening a reported draft and updating its body for the merge.
5. **Complete the epic.**
   Follow [Epic Merge](#epic-merge) when the epic is complete. A task merge alone does not sync the initiative or the board.

### Unplaced

When [Sync Epic](commands.md#sync-epic) reports a task issue unplaced, [Plan Mode](plan-mode.md) adds its row, then the sync runs again.

## Work Item

One file per task, named for the task id in lower case, `w01.md`. The record's README links each file. The epic table follows [Task ids](#task-delivery).

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
