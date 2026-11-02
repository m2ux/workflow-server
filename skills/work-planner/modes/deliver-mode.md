# Deliver Mode

Starts the work a theme board makes available. It advances the board, merges each open pull request whose test plan has passed, stands a completed epic in review on the board, holds each available unit with a planning record, and dispatches one session per unit to plan, implement, open its pull request, merge it when its test plan has passed, fix the technical debt its validation finds, and hoist arising issues.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Board](../artifacts/board.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Advance Mode](advance-mode.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Epic](../artifacts/epic.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Delivery Plan](../artifacts/delivery-plan.md)
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
   - Use its returned owner and board number for the following steps.
2. **Advance.**
   Run [Advance Mode](advance-mode.md) for the selected board, with the [allowance](../artifacts/plan-change.md#allowance) this run applies.
   - An epic starts only when the queue this step returns in this run places it Ready or In Progress. Its assignment comes from that queue, and an epic base is prepared only for such an epic. An epic that queue leaves in Backlog does not start, whatever the run was asked for.
   - That queue is computed from what this step reads live from the board and each open epic's priority label. No memory, summary or earlier note stands in for that read.
   - Continue to the fetch step only after it returns a complete applied queue.
   - Report an unavailable dependency, and a queue decision it recorded rather than asked, before dispatch. An incomplete queue means no initiative is under way, so the run has no work to offer.
   - Carry the [change list](../artifacts/plan-change.md#change-list) it returns into the report step.
3. **Fetch.**
   Run [Read Board State](../artifacts/board.md#read-board-state) with the selected board identity to obtain its current items and Status field.
   - Run [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests) for the [repositories](../artifacts/board.md#repositories) and items Read Board State returned.
   - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) with those records.
   - Use the pull request records in Plan Available Work; the issue links serve the merge and delivery steps.
   - Run [Read Board Configuration](../artifacts/board.md#read-board-configuration).
   - Run [Read Board Assignee](../artifacts/board.md#read-board-assignee) for the assignee.
4. **Survey.**
   - Run [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) for each epic that queue places Ready or In Progress, with its current initiative and epic bodies and all prerequisite issue and base-merge records.
   - Pass its confirmed result and the project checkout to [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases).
   - Read the project branches and each epic's bases through [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches) in the project checkout, at the revision [Branches](../artifacts/delivery-branches.md#branches) names for a read of one epic.
   - Call [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) with the board items, pull requests, complete issue-link snapshot, project checkout, the revision Branches names for a delivery survey, epic bases, engineering worktree and selected record date.
   - Resolve any missing issue through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
   - Repeat Plan Available Work with every resolved off-board issue while retaining the other inputs.
   - For delivery discrepancies:
     - Run [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) with the fetched initiative, epic and task issue JSON of the affected initiative.
     - Resume the survey with its returned records.
   - Handle the returned availability findings:
     - **Held work.**
       - Carry each `hold` line to the confirm step, with the record it links and whether a session is still running.
     - **Blocked work.**
       - Report a `blocked` line without asking. Its dependencies decide when it becomes available.
     - **Undeclared work.**
       - Report an `undeclared` line without asking. Its unit is offered once the row's work item names the long-lived branch of its component.
   - Use the returned [Work Units](../artifacts/delivery-plan.md#work-units) as the units of confirmation and dispatch.
5. **Merge.**
   Follow [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests) for each `merge` line, with the project checkout and the unit checkout holding its task branch.
   - Run [Task Merge](../protocols/task-merge.md) for each confirmed merge result, with the selected board identity.
   - For each `unrecorded` line:
     - Run [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state) for its merged pull request.
     - Run [Task Merge](../protocols/task-merge.md) with that merge result and the selected board identity.
6. **Confirm.**
   Show each `unit` line, with its tasks, coverage, record folder, and each branch with its base and worktree, and each `hold` line with the record it links and whether a session is still running.
   - Confirm the units to dispatch and the holds to release as one [Interview](../guidelines.md#modes). Dispatch only the units the user confirms. No session starts until the user confirms the set of units.
   - This mode reads no clock and reclaims nothing on its own, so a hold the user leaves stays held.
   - For each released hold:
     - **Released row.**
       - Run [Release Task Rows](../artifacts/epic-issue-body.md#release-task-rows) with the engineering worktree.
       - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - **Released hot-fix.**
       - Run [Release Hot-fix Hold](../artifacts/hotfix.md#release-hot-fix-hold) with the selected board identity and the hot-fix issue.
     - Run [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) again with refreshed board items, pull request records, complete issue-link snapshot, project checkout, evaluated revision, epic-base names, engineering worktree, every resolved off-board issue file, and the record date when supplied.
     - Confirm the units it returns before any of them is dispatched.
   - No plan change after this step is put to the user. Each follows [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy).
7. **Hold.**
   For each confirmed unit, before its session starts:
   - For a unit of rows, read the component each row declares from the work-item file the planning record that registered it holds, before a reservation replaces the row's link.
   - Add its record with [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record), named as the `unit` line gives it.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
   - **Unit of rows.**
     - Run [Reserve Task Rows](../artifacts/epic-issue-body.md#reserve-task-rows) for the unit's tasks, with the board items the latest Plan Available Work read.
     - Run [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the body it writes.
     - Set each task issue of the unit, where one exists, to In Progress and its epic with [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status).
     - A unit's record exists, its row carries that record's link, and the body is patched, before its session starts. A session is never dispatched for a row another one holds.
     - A held row stays held while its session plans and implements. The pull request's link replaces the record's link, which frees the row.
   - **Hot-fix unit.**
     - Run [Hold Hot-fix Unit](../artifacts/hotfix.md#hold-hot-fix-unit) with its issue, the selected board identity and the board items the latest Plan Available Work read.
   - Retain the queue decisions returned by the completed advance step.
8. **Dispatch.**
   - Confirm each epic carries every [Required Criteria](../artifacts/epic-issue-body.md#required-criteria) criterion its rows' changes bring, each with the declared row delivering it.
   - Keep each such row a unit of its own, joined to no other row, so it is confirmed and held like any other before a session starts for it.
   - Confirm the harness grants the [epic-base merge permission](../artifacts/pull-request.md#merge-permission). When it does not, report the setting that is absent and stop before any unit begins.

   For each held unit:
   - Run [Create Task Worktree](../artifacts/delivery-branches.md#create-task-worktree) in the project checkout for each branch the `unit` line names, with its base and worktree.
   - Call [Populate Delivery Brief](../artifacts/delivery-brief.md#populate-delivery-brief) with the confirmed unit, the component each of its rows declares or a [hot-fix unit](../artifacts/hotfix.md#delivery-unit)'s component, reserved folder, worktrees with the bases Create Task Worktree returned, the project checkout, test obligations, selected board identity, this run's allowance and [Run Delivery Session](#run-delivery-session) as the supplied execution procedure.
   - Resolve any returned gap before dispatch.
   - The agent running this mode starts each unit through the sub-agent dispatch of the session it was called from, and that dispatch is the only way a unit's session starts.
   - When that session provides no sub-agent dispatch, this mode reports that and stops before any unit begins.
   - The sub-agent works in the unit's worktree, reads the brief, and has the engineering worktree in reach for the planning record.
   - Leave the dispatched session running its Run Delivery Session procedure. The calling mode continues to the report step without waiting for unit completion; the dispatched session owns the implementation, debt and arising-issue work its brief carries.
   - A unit works on each branch [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) names, cut from its base, as [Task Branches](../artifacts/delivery-branches.md#task-branches) defines.
9. **Report.**
   Each pull request merged, and each left open by a conflict; each hot-fix merge recorded; each epic moved to In Review; each review pull request updated; each unit dispatched, with its record, branch, worktree and the session started for it; each row left held; each blocked row and what blocks it.
   - Report the run's [change list](../artifacts/plan-change.md#change-list) as a list of its own, so each plan change this run applied, and each it held for the user, is read in one place.

### Run Delivery Session

The confirmed unit carried from its supplied brief through implementation and delivery.

**Runs in:** the unit checkout.

1. **Read the brief.**
   Read the supplied [Delivery Brief](../artifacts/delivery-brief.md).
   - Use its confirmed unit, criteria, tests, each task branch with its base and worktree, planning-folder identity and change allowance.
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
   - Group the unit's work items by the component each declares, and give each group to the sub-agent dispatch this session provides when the unit has more than one group.
   - Give each sub-agent the unit's worktree, its group's work items, and the criteria those work items cover.
   - A sub-agent writes the files its work items name, runs the tests they name, and commits nothing.
   - A plan change a sub-agent meets returns to this session, which holds the allowance the brief names.
   - Write a file two groups reach — a shared test, an index, a manifest — in this session.
   - Stage and commit each returning group's own files, then run the unit's tests once every group has returned.
   - A unit of one group, and a session with no sub-agent dispatch, is delivered by this session.
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
  The user has each confirmed unit of the theme board in a session, with a planning record held for that session.
- **Parallel where the plan allows it.**
  The user has the epics the plan starts together under way at once, and within a unit, work that can proceed together does.
- **Passed work merged.**
  Each open pull request whose test plan has passed is merged, and one a conflict blocks stays open with the conflict named.
- **Review visible on the board.**
  The user sees each completed epic in review on its theme board, with its review pull request ready once its delivery evidence passes.
- **Holds left to the user.**
  A hold is released only when the user says so, and a blocked row is named with what blocks it.
- **One session for each unit.**
  Each confirmed unit has its own session, and a row another session holds is not given a second one.
- **Delivery that runs unattended.**
  Once the user has confirmed the units, each session delivers its work, fixes the debt it finds and places what arises, without a further question.
- **Plan changes applied and reported.**
  The user reads what delivery changed in the plan, and work needing an initiative is left open for them to decide.

## Guidance

- **Allowance.**
  This mode's runs, and every session they dispatch, apply each kind in [Change Kinds](../artifacts/plan-change.md#change-kinds). A change outside them is held and reported.
