# Deliver Mode

Starts the work a theme board makes available. It advances the board, merges each open pull request whose test plan has passed, stands a completed epic in review on the board, holds each available unit with a planning record, and dispatches one session per unit to plan, implement, open its pull request, merge it when its test plan has passed, hoist arising issues, and defer the technical debt its validation finds.

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
- [Guidelines](../guidelines.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Planning Record](../artifacts/planning-record.md)
- [Delivery Brief](../artifacts/delivery-brief.md)
- [Plan Change](../artifacts/plan-change.md)
- [Hoist Mode](hoist-mode.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)
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
   - Continue to the fetch step only after it returns a complete applied queue.
   - Report an unavailable dependency, and a queue decision it recorded rather than asked, before dispatch. An incomplete queue means no initiative is under way, so the run has no work to offer.
   - Carry the [change list](../artifacts/plan-change.md#change-list) it returns into the report step.
3. **Fetch.**
   Run [Read Board State](../artifacts/board.md#read-board-state) with the selected board identity to obtain its current items and Status field.
   - Run [Fetch All Initiative Pull Requests](../artifacts/pull-request.md#fetch-all-initiative-pull-requests) for the [repositories](../artifacts/board.md#repositories) Read Board State returned.
   - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) with those records.
   - Use the pull request records in Plan Available Work; the issue links serve the merge and delivery steps.
   - Run [Read Board Configuration](../artifacts/board.md#read-board-configuration).
   - Run [Read Board Assignee](../artifacts/board.md#read-board-assignee) for the assignee.
4. **Survey.**
   - Run [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) for each candidate epic with its current initiative and epic bodies and all prerequisite issue and base-merge records.
   - Pass its confirmed result to [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases).
   - Read the project branches and each epic's bases through [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches).
   - Call [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) with the board items, pull requests, complete issue-link snapshot, project checkout, epic bases and selected record date.
   - Resolve any missing issue through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
   - Repeat Plan Available Work with every resolved off-board issue while retaining the other inputs.
   - For delivery discrepancies:
     - Run [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) for the affected initiative and epics.
     - Resume the survey with its returned records.
   - Handle the returned availability findings:
     - **Held work.**
       - Carry each `hold` line to the confirm step, with the record it links and whether a session is still running.
     - **Blocked work.**
       - Report a `blocked` line without asking. Its dependencies decide when it becomes available.
   - Use the returned [Work Units](../artifacts/delivery-plan.md#work-units) as the units of confirmation and dispatch.
5. **Merge.**
   Follow [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests) for each `merge` line, with the project checkout.
   - Run [Task Merge](../protocols/task-merge.md) for each confirmed merge result, with the selected board identity.
6. **Confirm.**
   Show each `unit` line, with its tasks, coverage, record folder, branch, base and worktree, and each `hold` line with the record it links and whether a session is still running.
   - Confirm the units to dispatch and the rows to release as one [Interview](../guidelines.md#modes). Dispatch only the units the user confirms. No session starts until the user confirms the set of units.
   - This mode reads no clock and reclaims nothing on its own, so a row the user leaves stays held.
   - For each released row:
     - Run [Release Task Rows](../artifacts/epic-issue-body.md#release-task-rows).
     - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - Run [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) again with refreshed board items, pull request records, complete issue-link snapshot, project checkout, epic-base names, every resolved off-board issue file, and the record date when supplied.
     - Confirm the units it returns before any of them is dispatched.
   - No plan change after this step is put to the user. Each follows [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy).
7. **Hold.**
   For each confirmed unit, before its session starts:
   - Read the component each of the unit's rows declares from the work-item file the planning record that registered it holds, before a reservation replaces the row's link.
   - Add its record with [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record), named as the `unit` line gives it.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
   - Run [Reserve Task Rows](../artifacts/epic-issue-body.md#reserve-task-rows) for the unit's tasks.
   - Run [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the body it writes.
   - Set each task issue of the unit, where one exists, to In Progress and its epic with [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status).
   - Retain the queue decisions returned by the completed advance step.
   - A unit's record exists, its row carries that record's link, and the body is patched, before its session starts. A session is never dispatched for a row another one holds.
   - A held row stays held while its session plans and implements. The pull request's link replaces the record's link, which frees the row.
8. **Dispatch.**
   - Confirm each corpus-changing epic has its [Corpus Audit](../artifacts/epic-issue-body.md#corpus-audit) criterion, whose row is that epic's last.
   - Keep that audit row a unit of its own, joined to no other row, so it is confirmed and held like any other before a session starts for it.

   For each held unit:
   - Run [Create Task Worktree](../artifacts/delivery-branches.md#create-task-worktree).
   - Call [Populate Delivery Brief](../artifacts/delivery-brief.md#populate-delivery-brief) with the confirmed unit, the component each of its rows declares, reserved folder, worktrees, test obligations, selected board identity, this run's allowance and [Run Delivery Session](#run-delivery-session) as the supplied execution procedure.
   - Resolve any returned gap before dispatch.
   - The agent running this mode starts each unit through the sub-agent dispatch of the session it was called from, and that dispatch is the only way a unit's session starts.
   - When that session provides no sub-agent dispatch, this mode reports that and stops before any unit begins.
   - The sub-agent works in the unit's worktree, reads the brief, and has the engineering worktree in reach for the planning record.
   - Leave the dispatched session running its Run Delivery Session procedure. The calling mode continues to the report step without waiting for unit completion; the dispatched session owns the implementation, debt and arising-issue work its brief carries.
   - A unit works on the branch [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) names, cut from the epic base, as [Task Branches](../artifacts/delivery-branches.md#task-branches) defines.
9. **Report.**
   Each pull request merged, and each left open by a conflict; each epic moved to In Review; each review pull request updated; each unit dispatched, with its record, branch, worktree and the session started for it; each row left held; each blocked row and what blocks it.
   - Report the run's [change list](../artifacts/plan-change.md#change-list) as a list of its own, so each plan change this run applied, and each it held for the user, is read in one place.

### Run Delivery Session

The confirmed unit carried from its supplied brief through implementation and delivery.

1. **Read the brief.**
   Read the supplied [Delivery Brief](../artifacts/delivery-brief.md).
   - Use its confirmed unit, criteria, tests, selected branch and bases, worktree, planning-folder identity and change allowance.
   - Return missing context before starting.
2. **Confirm the reservation.**
   Confirm the supplied reserved folder exists and its rows remain held for this session before changing its worktree.
3. **Plan.**
   Call [Populate Work Item](../artifacts/work-item.md#populate-work-item) for each task with its reserved file path, scope, design, component, criteria and test requirements from the confirmed delivery brief, so the component the plan was checked against is the one this file declares.
   - Add any further file the work needs, as [Layout](../artifacts/planning-record.md#layout) describes.
4. **Link the work items.**
   Register each returned work-item file through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record). The row retains its folder link while reserved.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
5. **Match the tests to the criteria.**
   Check the returned work item's test row against each criterion the unit's Coverage carries and [Test Coverage](../artifacts/pull-request-body.md#test-coverage).
   - Resolve a missing test before implementation.
6. **Implement.**
   Deliver the work in the worktree, with every test the work item names, as [Tables](../artifacts/issue-body.md#tables) state.
   - Group the unit's rows by the component each declares, and give each group to the sub-agent dispatch this session provides when the unit has more than one group.
   - Give each sub-agent the unit's worktree, its group's work items, and the criteria those rows' Coverage names.
   - A sub-agent writes the files its work items name, runs the tests they name, and commits nothing.
   - A plan change a sub-agent meets returns to this session, which holds the allowance the brief names.
   - Write a file two groups reach — a shared test, an index, a manifest — in this session.
   - Stage and commit each returning group's own files, then run the unit's tests once every group has returned.
   - A unit of one group, and a session with no sub-agent dispatch, is delivered by this session.
7. **Open the pull request.**
   Open the unit's pull request with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), so the title, the base, the Test Plan, and the issue links meet [Titles](../artifacts/pull-request-body.md#titles), [Branches](../artifacts/delivery-branches.md#branches), [Test Coverage](../artifacts/pull-request-body.md#test-coverage), and [Issue Links](../artifacts/pull-request.md#issue-links).
   - Run [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository, where the session holds no confirmed setting.
   - Supply that setting and the unit's task issue, where one exists, so the pull request opens linked to it.
   - Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) for the unit's tasks.
   - Run [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
8. **Merge.**
   Record check results with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request), following [Test Plan](../artifacts/pull-request-body.md#test-plan).
   - Follow [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests) for the task pull request, with the unit's worktree as the project checkout.
   - On a confirmed merge, run [Task Merge](../protocols/task-merge.md) with that merge result, the unit's current task and epic evidence, and the board identity the brief names.
   - Resume the defer step when recording returns; a merge or recording blocker remains explicit.
9. **Classify and defer the debt.**
   Classify the technical debt this unit's validation finds — running its tests, auditing the definitions it changed, reviewing its pull request — which decides where it is fixed.
   - **Blocking.**
     - The unit's own criteria cannot be verified without it, so the unit fixes it, whatever its size.
   - **Trivial.**
     - It blocks nothing and needs no work item of its own, so the unit fixes it.
   - **Non-trivial.**
     - It blocks nothing and would warrant a work item of its own, so the unit defers it and the epic in hand keeps the scope it was planned with.
   - The session's own classification decides.
   - For each deferred item:
     - Create it as a standalone issue through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - Run [Hoist Mode](hoist-mode.md) with that issue identity, the allowance the brief names, and its placement as a new task in this initiative's [deferred-debt epic](../artifacts/initiative-issue-body.md#deferred-debt).
     - Where the initiative has no such epic, the placement raises it as a new epic, carrying the criterion its initiative row covers.
     - Run [Record Plan Change](../artifacts/plan-change.md#record-plan-change) with the placement it returns.
   - Resume the arising-issues step with each saved placement or reported blocker.
10. **Arising issues.**
    Create each issue that arose during delivery as a standalone issue with [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), with no agent-engineering prefix.
    - Run [Hoist Mode](hoist-mode.md) with those new issue identities and the allowance the brief names, after the pull request is open and epic delivery is recorded.
    - Run [Record Plan Change](../artifacts/plan-change.md#record-plan-change) with each placement it applied and each it held.
11. **Report the changes.**
    Register the session's [change list](../artifacts/plan-change.md#change-list) in its planning folder through [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record).
    - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
    - Return the list with the delivery session result, so the user reads each plan change this session applied and each it held.

## Outcomes

- **Available work started.**
  The user has each confirmed unit of the theme board in a session, with a planning record held for that session.
- **Parallel where the plan allows it.**
  The units offered are those of the epics planned to start together, and an epic planned for later is not offered while they run.
  Within a unit, work that can proceed together does.
- **Passed work merged.**
  Each open pull request whose test plan has passed is merged, and one a conflict blocks stays open with the conflict named.
- **Review visible on the board.**
  The user sees each completed epic in review on its theme board, with its review pull request ready once its delivery evidence passes.
- **Holds left to the user.**
  A row a session holds is released only when the user says so, and a blocked row is named with what blocks it.
- **One session for each unit.**
  Each confirmed unit has its own session, and a row another session holds is not given a second one.
- **Delivery that runs unattended.**
  Once the user has confirmed the units, each session delivers its work, places what arises and defers what it cannot carry, without a further question.
- **Plan changes applied and reported.**
  The user reads what delivery changed in the plan, and work needing an initiative is left open for them to decide.

## Guidance

- **Allowance.**
  This mode's runs, and every session they dispatch, apply each kind in [Change Kinds](../artifacts/plan-change.md#change-kinds). A change outside them is held and reported.
