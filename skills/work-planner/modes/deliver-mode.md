# Deliver Mode

Keeps an authorized theme-board scope moving through delivery while eligible work and execution capacity permit it.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Select

- Apply [Select Project Board](../artifacts/board.md#select-project-board "ƒ") with the requested theme or board identity.

- Use its provided owner and board number throughout this run.

### 2. Establish the Authorization

- Record the user's requested board, initiative, epic or unit boundary and requested lane as the [run authorization](../artifacts/dispatch-batch.md#authorization).

- Take the optional lane index afresh from this request, following [Admission](../artifacts/lane.md#admission); a request naming none supplies none.
- An explicit delivery request supplies that authorization; retain any narrower scope already established in this session.
- Resolve a missing scope decision through the [Interview](../guidelines.md#modes) before starting work.
- Authorization covers successive eligible units within that boundary. Expanding it requires a new user decision.
- Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy "ƒ") for each plan change with this run's allowance, retaining its applied or held result for the change list.
- Retain the run's authorization, session inventory and [preparations](../artifacts/dispatch-batch.md#preparations) in working files outside the repository for every refill round.

### 3. Coordinate Delivery

- Follow [Refill Delivery Capacity](#refill-delivery-capacity "ƒ") with the authorization, project checkout, engineering worktree, run allowance and the supplied worker procedure: each worker must Follow [Run Delivery Session](#run-delivery-session "ƒ").

- Keep the calling session as coordinator until that procedure returns its completion or stable blockers.

### 4. Report

- Report each merged pull request, unresolved conflict, epic in review, review pull request update and running or finished unit, using [Report Lines](../artifacts/delivery-plan.md#report-lines) for survey results and [Session Inventory](../artifacts/dispatch-batch.md#session-inventory) for execution state.

- Include each held or blocked unit, what it waits on and any unavailable execution capacity.
- Report the run's [change list](../artifacts/plan-change.md#change-list) as a list of its own, including applied and held changes.

### Refill Delivery Capacity

The continuing coordinator for one authorized delivery scope.

#### 1. Advance

- Follow [Advance Mode](advance-mode.md "ƒ") for the selected board, with this run's [allowance](../artifacts/plan-change.md#allowance).

- Continue only with its complete applied live queue; a Backlog epic starts no work regardless of the requested scope.
- Report an unavailable dependency or a queue decision recorded rather than asked before dispatch.
- Carry its provided change list into the run's report.
- A blocker affecting one unit stays with that unit; independent admitted work continues. An incomplete queue returns as a scope-wide blocker.

#### 2. Fetch

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for current board items and Status.

- Apply [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests "ƒ") for its [repositories](../artifacts/board.md#repositories) and items.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") with those records.
- Apply [Read Board Configuration](../artifacts/board.md#read-board-configuration "ƒ") and Run [Find User](../artifacts/board.md#find-user "ƒ").
- Provide a scope-wide fetch failure with its missing evidence before selecting a batch.

#### 3. Survey

- Apply [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites "ƒ") for each authorized epic the queue places Ready or In Progress, with current initiative, epic, prerequisite and base-merge records.

- Apply [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases "ƒ") with each confirmed result and the project checkout.
- Apply [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches "ƒ") in the project checkout for the project and each epic, at the revision [Branches](../artifacts/delivery-branches.md#branches) names.

- Run [Compute Available Work](../artifacts/delivery-plan.md#compute-available-work "ƒ") for the selected board and the authorization’s requested lane in the project checkout, using the selected record date and requesting a dispatch export.

- Retain the authorized requested lane on every survey; a survey unable to apply that lane returns an evidence blocker.

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for each missing issue and repeat the survey with that record and the other current inputs.

- Retain an unavailable row dependency as that unit's blocker and continue with independently verified units.

- For delivery discrepancies, Apply [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence "ƒ") for the selected repositories and initiative against current issue records, then repeat this survey with its refreshed evidence before selecting a dispatch batch.

- Reconcile each held record with actual harness sessions and the retained inventory, resuming the existing session when available and reporting an absent session without creating a duplicate.

##### Requested Hold Release

- Release a hold only when the user explicitly requested it.

###### Task Row Hold

- For a task-row hold, Run [Release Row](../artifacts/epic-issue-body.md#release-row "ƒ") with the engineering worktree, then Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.

###### Hot-Fix Hold

- For a hot-fix hold:

- Apply [Capture Issue Development](../artifacts/issue.md#capture-issue-development "ƒ") for [Hot-fix Identity](../artifacts/hotfix.md#hot-fix-identity).
- Refuse the release while its [Delivery Unit](../artifacts/hotfix.md#delivery-unit) is running or unrecorded, and provide the pull request that makes it so to the caller.

- Apply [Place Issue on Board](../artifacts/board.md#place-issue-on-board "ƒ") with the board in [Board Evidence](../artifacts/hotfix.md#board-evidence), the hot-fix issue and Ready.

- Retain [Board Result](../artifacts/hotfix.md#board-result) with the saved item and Status.

##### Survey Continuation

- Repeat the survey with refreshed items and delivery evidence after a release.

- Retain held, blocked, undeclared and unresolved findings for the report.

#### 4. Record Merge Results

- For each authorized `merge` line, Apply [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests "ƒ") with the project checkout and its unit checkout.

- Follow [Task Merge](../protocols/task-merge.md "ƒ") with each confirmed merge and selected board identity.
- For an authorized `unrecorded` line, Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for the merged pull request and Follow [Task Merge](../protocols/task-merge.md "ƒ") with that result.
- Return to advance after a recorded merge; its queue, dependencies and available units require fresh evidence.
- Retain a merge or required-review blocker with its unit and continue with independent work.

#### 5. Select the Batch

- For each retained preparation still admitted by current delivery evidence, Follow [Unit Dispatch](../protocols/unit-dispatch.md "ƒ") with its selected batch, current evidence, retained context, project and engineering checkouts, run allowance and supplied worker procedure, while free slots permit it.

- Retain its provided continuation or observed session, removing a started preparation from the pending set.
- Observe current harness sessions and free capacity, then Run [Compute Dispatch Batch](../artifacts/dispatch-batch.md#compute-dispatch-batch "ƒ") for the fixed authorization and current survey, including admitted preparations awaiting capacity.
- Report an evidence error and stop without dispatching from that batch.
- For `dispatch`, continue to start units.
- For `wait`, continue to await progress.
- For `stop`, provide the delivery results and remaining holds, blockers and review boundaries.

#### 6. Start Units

- Follow [Unit Dispatch](../protocols/unit-dispatch.md "ƒ") for each selected unit with the batch, current evidence, project and engineering checkouts, run allowance and supplied worker procedure.

- Retain every provided session identity in the observed inventory before another selection.
- Retain a capacity-only continuation as this run's preparation for the next refill round.
- Return to advance after a failed start, with its held record and blocker retained.
- Coordinate issue-body writes, engineering publications and epic-base updates serially across the coordinator and workers, refreshing their affected records before each write.

#### 7. Await Progress

- Keep the coordinator active while scoped workers execute or admitted work awaits a capacity event.

- Wait for a worker result, a harness capacity event or user steering, while providing progress updates.
- On a worker result, retain its actual delivery, validation, merge and plan-change evidence; a session finishing does not establish delivery by itself.
- Reconcile the session's observed state and actual free slots.
- Return to advance with the same authorization and fresh delivery evidence, refilling without another unit confirmation.

### Run Delivery Session

The authorized unit carried from its supplied brief through implementation and delivery.

#### 1. Read the Brief

- Read the supplied [Delivery Brief](../artifacts/delivery-brief.md).

- Use its authorized unit, criteria, tests, each task branch with its base and worktree, planning-folder identity and change allowance.
- Provide missing context before starting.

#### 2. Confirm the Reservation

Confirm the supplied reserved folder exists and the unit remains held for this session before changing its worktree: its rows' reservations for a unit of rows, or the hold a hot-fix's [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.

#### 3. Plan

- Apply [Populate Work Item](../artifacts/work-item.md#populate-work-item "ƒ") for each task with its reserved file path, scope, design, component, criteria and test requirements from the confirmed delivery brief, so the component the plan was checked against is the one this file declares.

- Add any further file the work needs, as [Layout](../artifacts/planning-record.md#layout) describes.

#### 4. Link the Work Items

- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with each provided work-item file. A reserved row retains its folder link.

- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder.

#### 5. Match the Tests to the Criteria

- Check the provided work item's test row against each criterion the unit's Coverage carries and [Test Coverage](../artifacts/pull-request-body.md#test-coverage).

- Resolve a missing test before implementation.

#### 6. Implement

- Deliver each task branch in the unit checkout its [Work Identity](../artifacts/delivery-brief.md#work-identity) names, with every test the work item names, as [Tables](../artifacts/issue-body.md#tables) state.

- Group the unit's work items by the component each declares, and give each group to the sub-agent dispatch this session provides when the unit has more than one group and [actual free slots](../artifacts/dispatch-batch.md#session-inventory) permit it.
- Give each sub-agent the unit's worktree, its group's work items, and the criteria those work items cover.
- A sub-agent writes the files its work items name, runs the tests they name, and commits nothing.
- A plan change a sub-agent meets returns to this session, which holds the allowance the brief names.
- Write a file two groups reach — a shared test, an index, a manifest — in this session.
- Stage and commit each returning group's own files, then run the unit's tests once every group has provided.
- A group with no available sub-agent capacity is delivered by this session, as is a unit of one group.

#### 7. Open the Pull Request

- Use the unit’s change, tasks, criteria and validation evidence.

- Populate the [Template](../artifacts/pull-request-body.md#template) from [Change Evidence](../artifacts/pull-request-body.md#change-evidence), retaining applicable content in [Current Body](../artifacts/pull-request-body.md#current-body) and writing to [Output Body](../artifacts/pull-request-body.md#output-body). For an epic review, Apply [Populate Review Body](../artifacts/pull-request-body.md#populate-review-body "ƒ").
- All populated fields must meet [Fields](../artifacts/pull-request-body.md#fields).

- Verify each result link against [Test Plan](../artifacts/pull-request-body.md#test-plan) before publishing the body.

- Retain the [complete body file](../artifacts/pull-request-body.md#output-body) and any [unresolved evidence](../artifacts/pull-request-body.md#unresolved-evidence) links for publication.

- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the provided body to open the unit's pull request from each task branch its work changes into its base. The title, the base, the Test Plan, and the issue links must meet [Titles](../artifacts/pull-request-body.md#titles), [Branches](../artifacts/delivery-branches.md#branches), [Test Coverage](../artifacts/pull-request-body.md#test-coverage), and [Issue Links](../artifacts/pull-request.md#issue-links).

- Apply [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close "ƒ") for the repository, where the session holds no confirmed setting.
- Supply that setting and the unit's task issue, where one exists, so the pull request opens linked to it.
- A hot-fix unit's title carries its prefix, so its [delivering pull request](../artifacts/hotfix.md#delivering-pull-request) opens as a draft.

- For a unit of rows:

- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") for the unit's task rows, with the project checkout and the fetched epic bases.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.

#### 8. Fix the Debt

- A unit, including a hot-fix, fixes every debt item its validation finds, from running its tests, auditing the definitions it changed and reviewing its pull request, on its task branch, so its open pull request carries each fix before it merges.
- Debt in code outside the unit's change is an issue of its own, arising from the delivery.

- Carry each item outside the unit's change into the arising-issues step.
- Continue to the review step for a hot-fix unit, and to the merge step otherwise.

#### 9. Review a Hot-Fix

- For a hot-fix unit, complete the review cycle its draft [delivering pull request](../artifacts/hotfix.md#delivering-pull-request) waits on.

- Apply [Produce Agent Review](../artifacts/agent-review.md#produce-agent-review "ƒ") for the resulting head with fresh metadata and updated validation evidence.
- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with its provided record, then Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") with that record.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") to link that published record from the pull request body.

##### Verify Hot-Fix Readiness

- Use the pull request and published review records.

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for its full metadata.
- If metadata is unreadable or the pull request is closed, retain [Failure](../artifacts/pull-request.md#failure), report the unresolved current state and stop before repair or merge.

- Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ") with that metadata and [Published Reviews](../artifacts/pull-request.md#published-reviews).
- On a finding, continue directly to Restore Hot-Fix Draft below.

- For a draft with passing evidence, Run [Mark Review Ready](../artifacts/pull-request.md#mark-review-ready "ƒ") with the node id its metadata names.
- On a failed ready write, retain its failure and continue directly to Restore Hot-Fix Draft below.

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") again with the same identity.
- On an unreadable or closed result, retain the unresolved current-state failure and stop before repair or merge.
- Run [Validate Agent Review](../artifacts/agent-review.md#validate-agent-review "ƒ") again with that fresh metadata and the same published records.
- On a finding or a draft readback, retain the changed revision or readiness failure and continue directly to Restore Hot-Fix Draft below.
- Only a confirmed open, ready pull request with passing current review evidence provides [Review State](../artifacts/pull-request.md#review-state) and continues to the merge step.

##### Restore Hot-Fix Draft

- Retain every review or readiness finding.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") with the same identity before selecting restoration.
- If metadata is unreadable or the pull request is closed, provide the unresolved restoration discrepancy as [Failure](../artifacts/pull-request.md#failure) and stop before repair or merge.
- For an open, ready pull request, Run [Mark Review Draft](../artifacts/pull-request.md#mark-review-draft "ƒ") with its identity.
- After a selected restoration write, including a failed write, Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") with the same identity.
- If the restoration write failed, metadata is unreadable, or the readback is closed or ready, provide the unresolved restoration discrepancy as [Failure](../artifacts/pull-request.md#failure) and stop before repair or merge. Report draft state only when the readback confirms it.
- With a successful selected write and confirmed open draft, or a confirmed open draft requiring no write, continue to Repair Hot-Fix Findings below.

##### Repair Hot-Fix Findings

- For each provided finding, fix it on the task branch and repeat this step from Produce Agent Review, until review validation and ready-state readback provide no finding.
- A finding the session cannot fix within its allowance stops it before the merge step. Retain the hold, the confirmed draft readback and each open finding in the session result.

#### 10. Merge

- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with check results, following [Test Plan](../artifacts/pull-request-body.md#test-plan).

- Apply [Merge Task Pull Requests](../artifacts/pull-request.md#merge-task-pull-requests "ƒ") for the task pull request, with the project checkout and the unit checkout.
- On a confirmed merge, Follow [Task Merge](../protocols/task-merge.md "ƒ") in the project checkout with that merge result, the unit's current task and epic evidence, and the board identity the brief names.
- Resume the arising-issues step when recording returns; a merge or recording blocker remains explicit.

#### 11. Arising Issues

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") for each issue that arose during delivery as a standalone issue with no agent-engineering prefix, following [Standalone Issues](../artifacts/board.md#standalone-issues).

- Follow [Hoist Mode](hoist-mode.md "ƒ") in the project checkout with those new issue identities and the allowance the brief names, after the pull request is open and epic delivery is recorded.
- Apply [Record Plan Change](../artifacts/plan-change.md#record-plan-change "ƒ") with each placement it applied and each it held.

#### 12. Report the Changes

- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") with the session's [change list](../artifacts/plan-change.md#change-list) and its planning folder.

- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder.
- Provide the list with the delivery session result, so the user reads each plan change this session applied and each it held.

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
