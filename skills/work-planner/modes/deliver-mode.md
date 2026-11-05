# Deliver Mode

Keeps an authorized theme-board scope moving through delivery while eligible work and execution capacity permit it.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Board](../artifacts/board.md)
- [Advance Mode](advance-mode.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Epic](../artifacts/epic.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Delivery Plan](../artifacts/delivery-plan.md)
- [Dispatch Batch](../artifacts/dispatch-batch.md)
- [Unit Dispatch](../protocols/unit-dispatch.md)
- [Issue](../artifacts/issue.md)
- [Task Merge](../protocols/task-merge.md)
- [Hot-fix](../artifacts/hotfix.md)
- [Guidelines](../guidelines.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Planning Record](../artifacts/planning-record.md)
- [Delivery Brief](../artifacts/delivery-brief.md)
- [Plan Change](../artifacts/plan-change.md)
- [Hoist Mode](hoist-mode.md)
- [Agent Review](../artifacts/agent-review.md)
- [Work Item](../artifacts/work-item.md)
- [Pull Request Body](../artifacts/pull-request-body.md)
- [Issue Body](../artifacts/issue-body.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Select.**
   Run [Select Project Board](../artifacts/board.md#select-project-board) with the requested theme or board identity.
   - Use its returned owner and board number throughout this run.
2. **Establish the authorization.**
   Record the user's requested board, initiative, epic or unit boundary and requested lane as the [run authorization](../artifacts/dispatch-batch.md#authorization).
   - An explicit delivery request supplies that authorization; retain any narrower scope already established in this session.
   - Resolve a missing scope decision through the [Interview](../guidelines.md#modes) before starting work.
   - Authorization covers successive eligible units within that boundary. Expanding it requires a new user decision.
   - Run [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy) for each plan change with this run's allowance, retaining its applied or held result for the change list.
   - Retain the run's authorization, session inventory and [preparations](../artifacts/dispatch-batch.md#preparations) in working files outside the repository for every refill round.
3. **Coordinate delivery.**
   Run [Refill Delivery Capacity](#refill-delivery-capacity) with the authorization, project checkout, engineering worktree, run allowance and [Run Delivery Session](#run-delivery-session) as the supplied worker procedure.
   - Keep the calling session as coordinator until that procedure returns its completion or stable blockers.
4. **Report.**
   Report each merged pull request, unresolved conflict, epic in review, review pull request update and running or finished unit, with its record, branches, worktrees and observed session.
   - Include each held or blocked unit, what it waits on and any unavailable execution capacity.
   - Report the run's [change list](../artifacts/plan-change.md#change-list) as a list of its own, including applied and held changes.

### Refill Delivery Capacity

The continuing coordinator for one authorized delivery scope.

1. **Advance.**
   Run [Advance Mode](advance-mode.md) for the selected board, with this run's [allowance](../artifacts/plan-change.md#allowance).
   - Continue only with its complete applied live queue; a Backlog epic starts no work regardless of the requested scope.
   - Report an unavailable dependency or a queue decision recorded rather than asked before dispatch.
   - Carry its returned change list into the run's report.
   - A blocker affecting one unit stays with that unit; independent admitted work continues. An incomplete queue returns as a scope-wide blocker.
2. **Fetch.**
   Run [Read Board State](../artifacts/board.md#read-board-state) for current board items and Status.
   - Run [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests) for its [repositories](../artifacts/board.md#repositories) and items.
   - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) with those records.
   - Run [Read Board Configuration](../artifacts/board.md#read-board-configuration) and [Read Board Assignee](../artifacts/board.md#read-board-assignee).
   - Return a scope-wide fetch failure with its missing evidence before selecting a batch.
3. **Survey.**
   Run [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) for each authorized epic the queue places Ready or In Progress, with current initiative, epic, prerequisite and base-merge records.
   - Pass each confirmed result and the project checkout to [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases).
   - Run [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches) in the project checkout for the project and each epic, at the revision [Branches](../artifacts/delivery-branches.md#branches) names.
   - Call [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) with current items, pull requests, complete issue links, project checkout, evaluated revision, epic bases, engineering worktree, resolved off-board issues and selected record date, requesting its dispatch export.
     - Retain the authorized requested lane on every survey; a survey unable to apply that lane returns an evidence blocker.
     - Resolve each missing issue through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) and repeat the survey with that record and the other current inputs.
       - Retain an unavailable row dependency as that unit's blocker and continue with independently verified units.
     - Resolve delivery discrepancies through [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) with the affected initiative, epic and task records, then repeat the survey with its results.
   - Reconcile each held record with actual harness sessions and the retained inventory, resuming the existing session when available and reporting an absent session without creating a duplicate.
   - Release a hold only when the user explicitly requested it:
     - Run [Release Task Rows](../artifacts/epic-issue-body.md#release-task-rows) with the engineering worktree and publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), or run [Release Hot-fix Hold](../artifacts/hotfix.md#release-hot-fix-hold) for a hot-fix.
     - Repeat the survey with refreshed items and delivery evidence after a release.
   - Retain held, blocked, undeclared and unresolved findings for the report.
4. **Record merge results.**
   For each authorized `merge` line, follow [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests) with the project checkout and its unit checkout.
   - Run [Task Merge](../protocols/task-merge.md) with each confirmed merge and selected board identity.
   - For an authorized `unrecorded` line, read the merged pull request through [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) and run Task Merge with that result.
   - Return to advance after a recorded merge; its queue, dependencies and available units require fresh evidence.
   - Retain a merge or required-review blocker with its unit and continue with independent work.
5. **Select the batch.**
   Resume each retained preparation still admitted by current delivery evidence through [Unit Dispatch](../protocols/unit-dispatch.md), with its selected batch, current evidence, retained context, project and engineering checkouts, run allowance and supplied worker procedure, while free slots permit it.
   - Retain its returned continuation or observed session, removing a started preparation from the pending set.
   - Observe current harness sessions and free capacity, then run [Plan Dispatch Batch](../artifacts/dispatch-batch.md#plan-dispatch-batch) with the fixed authorization, current dispatch export, survey board and requested lane, observed inventory, free slots and admitted preparations awaiting capacity.
   - Report an evidence error and return without dispatching from that batch.
   - For `dispatch`, continue to start units.
   - For `wait`, continue to await progress.
   - For `stop`, return the delivery results and remaining holds, blockers and review boundaries.
6. **Start units.**
   Follow [Unit Dispatch](../protocols/unit-dispatch.md) for each selected unit with the batch, current evidence, project and engineering checkouts, run allowance and supplied worker procedure.
   - Retain every returned session identity in the observed inventory before another selection.
   - Retain a capacity-only continuation as this run's preparation for the next refill round.
   - Return to advance after a failed start, with its held record and blocker retained.
   - Coordinate issue-body writes, engineering publications and epic-base updates serially across the coordinator and workers, refreshing their affected records before each write.
7. **Await progress.**
   Keep the coordinator active while scoped workers execute or admitted work awaits a capacity event.
   - Wait for a worker result, a harness capacity event or user steering, while providing progress updates.
   - On a worker result, retain its actual delivery, validation, merge and plan-change evidence; a session finishing does not establish delivery by itself.
   - Reconcile the session's observed state and actual free slots.
   - Return to advance with the same authorization and fresh delivery evidence, refilling without another unit confirmation.

### Run Delivery Session

The authorized unit carried from its supplied brief through implementation and delivery.

**Runs in:** the unit checkout.

1. **Read the brief.**
   Read the supplied [Delivery Brief](../artifacts/delivery-brief.md).
   - Use its authorized unit, criteria, tests, each task branch with its base and worktree, planning-folder identity and change allowance.
   - Return missing context before starting.
2. **Confirm the reservation.**
   Confirm the supplied reserved folder exists and the unit remains held for this session before changing its worktree: its rows' reservations for a unit of rows, or the hold a hot-fix's [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.
3. **Plan.**
   Call [Populate Work Item](../artifacts/work-item.md#populate-work-item) for each task with its reserved file path, scope, design, component, criteria and test requirements from the confirmed delivery brief, so the component the plan was checked against is the one this file declares.
   - Add any further file the work needs, as [Layout](../artifacts/planning-record.md#layout) describes.
4. **Link the work items.**
   Register each returned work-item file through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record). A reserved row retains its folder link.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
5. **Match the tests to the criteria.**
   Check the returned work item's test row against each criterion the unit's Coverage carries and [Test Coverage](../artifacts/pull-request-body.md#test-coverage).
   - Resolve a missing test before implementation.
6. **Implement.**
   Deliver the work in the worktree, with every test the work item names, as [Tables](../artifacts/issue-body.md#tables) state.
   - Group the unit's work items by the component each declares, and give each group to the sub-agent dispatch this session provides when the unit has more than one group and [actual free slots](../artifacts/dispatch-batch.md#session-inventory) permit it.
   - Give each sub-agent the unit's worktree, its group's work items, and the criteria those work items cover.
   - A sub-agent writes the files its work items name, runs the tests they name, and commits nothing.
   - A plan change a sub-agent meets returns to this session, which holds the allowance the brief names.
   - Write a file two groups reach — a shared test, an index, a manifest — in this session.
   - Stage and commit each returning group's own files, then run the unit's tests once every group has returned.
   - A group with no available sub-agent capacity is delivered by this session, as is a unit of one group.
7. **Open the pull request.**
   Open the unit's pull request from each task branch its work changes into its base with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), from a body [Populate Pull Request Body](../artifacts/pull-request-body.md#populate-pull-request-body) writes with the unit's change, tasks, criteria and validation evidence, so the title, the base, the Test Plan, and the issue links meet [Titles](../artifacts/pull-request-body.md#titles), [Branches](../artifacts/delivery-branches.md#branches), [Test Coverage](../artifacts/pull-request-body.md#test-coverage), and [Issue Links](../artifacts/pull-request.md#issue-links).
   - Run [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository, where the session holds no confirmed setting.
   - Supply that setting and the unit's task issue, where one exists, so the pull request opens linked to it.
   - A hot-fix unit's title carries its prefix, so its [delivering pull request](../artifacts/hotfix.md#delivering-pull-request) opens as a draft.
   - For a unit of rows:
     - Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) for the unit's task rows, with the project checkout and the fetched epic bases.
     - Run [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
8. **Fix the debt.**
   Fix the technical debt this unit's validation finds, as [Debt](../artifacts/delivery-plan.md#debt) states.
   - Carry each item that Debt leaves outside the unit's change into the arising-issues step.
   - Continue to the review step for a hot-fix unit, and to the merge step otherwise.
9. **Review a hot-fix.**
   For a hot-fix unit, complete the review cycle its draft [delivering pull request](../artifacts/hotfix.md#delivering-pull-request) waits on.
   - Run [Produce Agent Review](../artifacts/agent-review.md#produce-agent-review) with the pull request's fresh metadata, the unit checkout, its criteria, validation evidence and planning destination.
   - Register and publish its returned record through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) and [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record).
   - Link that published record from the pull request body through [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request).
   - Run [Ready Hot-fix Pull Request](../artifacts/pull-request.md#ready-hot-fix-pull-request) with the pull request and the published records.
   - For each returned finding, fix it on the task branch and repeat this step from Produce Agent Review, until Ready Hot-fix Pull Request returns none.
   - A finding the session cannot fix within its allowance stops it before the merge step. The hot-fix stays held and its pull request a draft, and the session returns each open finding in its result.
10. **Merge.**
   Record check results with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), following [Test Plan](../artifacts/pull-request-body.md#test-plan).
   - Follow [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests) for the task pull request, with the project checkout and the unit checkout.
   - On a confirmed merge, run [Task Merge](../protocols/task-merge.md) in the project checkout with that merge result, the unit's current task and epic evidence, and the board identity the brief names.
   - Resume the arising-issues step when recording returns; a merge or recording blocker remains explicit.
11. **Arising issues.**
    Create each issue that arose during delivery as a standalone issue with [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), with no agent-engineering prefix.
    - Run [Hoist Mode](hoist-mode.md) in the project checkout with those new issue identities and the allowance the brief names, after the pull request is open and epic delivery is recorded.
    - Run [Record Plan Change](../artifacts/plan-change.md#record-plan-change) with each placement it applied and each it held.
12. **Report the changes.**
    Register the session's [change list](../artifacts/plan-change.md#change-list) in its planning folder through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record).
    - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
    - Return the list with the delivery session result, so the user reads each plan change this session applied and each it held.

## Outcomes

- **Available work started.**
  The user has each authorized available unit of the theme board in a session, with a planning record held for that session.
- **Parallel where the plan allows it.**
  The user has the epics the plan starts together under way at once, and within a unit, work that can proceed together does.
- **Passed work merged.**
  Each open pull request whose test plan has passed is merged, and one a conflict blocks stays open with the conflict named.
- **Review visible on the board.**
  The user sees each completed epic in review on its theme board, with its review pull request ready once its delivery evidence passes.
- **Held work visible.**
  The user sees existing sessions, held records and the evidence each blocked unit needs.
- **One session for each unit.**
  Each authorized unit has its own observed delivery session.
- **Delivery that runs unattended.**
  The authorized scope continues through newly eligible units while capacity permits, including independent work beside blockers and required review.
- **Plan changes applied and reported.**
  The user reads what delivery changed in the plan, and work needing an initiative is left open for them to decide.

## Guidance

- **Allowance.**
  This mode's runs, and every session they dispatch, apply each kind in [Change Kinds](../artifacts/plan-change.md#change-kinds). A change outside them is held and reported.
