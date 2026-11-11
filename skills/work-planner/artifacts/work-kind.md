# Work Kind

Each kind of work, as its [Registration](#registration) lists it, and the interface operations general files reach it through: each runs the operation the item's registered kind supplies, or the general route where the kind supplies none.

## Operations

### Release Hold

One held [kind unit](delivery-plan.md#kind-units) released on a requested hold release, providing the board result or a refusal naming the pull request that keeps the unit live.

#### 1. Select Release Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Release Hold operation, Apply that operation with the [Operation Inputs](#operation-inputs), the held unit's issue and the selected board, and provide its board result or refusal as the [Work Kind Result](#work-kind-result).
- When it lists none, provide the [Work Kind Result](#work-kind-result) `unsupplied`, leaving the hold as it stands.

### Record Dispatch Status

One dispatched item's board status held and confirmed, providing [Confirmed Statuses](board-delivery.md#confirmed-statuses).

#### 1. Select Dispatch Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Record Dispatch Status operation, Apply that operation with the [Operation Inputs](#operation-inputs): the issue, the requested status, the board identity and the refreshed board items.
- When it lists none, Apply [Record Dispatch Status](board-delivery.md#record-dispatch-status "ƒ") with the same [Operation Inputs](#operation-inputs).
- Provide the confirmed status or discrepancy the applied operation provides as the [Work Kind Result](#work-kind-result).

### Record Delivery

One issue brought to what its delivering pull request establishes, providing the saved identity and its delivery findings.

#### 1. Select Delivery Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Record Delivery operation, Apply that operation with the [Operation Inputs](#operation-inputs): the selected issue, its delivering pull request and the selected criterion ids, in the project checkout.
- Provide the saved identity and delivery findings it provides as the [Work Kind Result](#work-kind-result).
- When it lists none, provide the [Work Kind Result](#work-kind-result) `unsupplied`, recording nothing.

### Record Merge

One confirmed merge recorded on the issue it delivers, providing the saved identity and delivery findings whose closable result selects the issue's closure.

#### 1. Select Merge Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Record Merge operation, Apply that operation with the [Operation Inputs](#operation-inputs): the merge result and the complete issue-link snapshot.
- Provide the saved identity and delivery findings it provides as the [Work Kind Result](#work-kind-result).
- When it lists none, provide the [Work Kind Result](#work-kind-result) `unsupplied`, recording nothing.

### Settle Board Status

One issue's board item set where its kind places it, applying the [Status Change](board-status.md#status-change) that placement requires.

#### 1. Select Settlement Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Settle Board Status operation, Apply that operation with the [Operation Inputs](#operation-inputs): the board and the saved issue.
- Provide the settled board item it provides as the [Work Kind Result](#work-kind-result).
- When it lists none, provide the [Work Kind Result](#work-kind-result) `unsupplied`, changing no board item. The item takes the Status [Item Status](board-status.md#item-status) gives it.

### Populate Body

One issue body populated to its kind's template, providing the [Body](issue-body.md#body) at the output path.

#### 1. Select Population Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Populate Body operation, Apply that operation with the [Operation Inputs](#operation-inputs): the body's scope, evidence and design, any current body and the output path.
- When it lists none, populate the template the kind's body artifact Fields state from the same [Operation Inputs](#operation-inputs), meeting [Body](issue-body.md#body), at the output path.
- Provide the populated body as the [Work Kind Result](#work-kind-result).

### Review Before Merge

One pull request taken through the review its kind requires before merge, providing a ready [Review State](pull-request.md#review-state), a [Failure](pull-request.md#failure), or a held draft with its open findings.

#### 1. Select Review Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Review Before Merge operation, Apply that operation with the [Operation Inputs](#operation-inputs): the unit's draft pull request.
- Provide the review state, failure or hold it provides as the [Work Kind Result](#work-kind-result).
- When it lists none, provide the [Work Kind Result](#work-kind-result) `unsupplied`, reviewing nothing.

### Validate Body

One issue body checked against its kind's template and conditions, providing [Format Findings](issue-body.md#format-findings) and any corrected body.

#### 1. Select Validation Route

- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a Validate Body operation, Apply that operation with the [Operation Inputs](#operation-inputs): the issue record, its fetched related context and the output files.
- When it lists none, Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") with the same [Operation Inputs](#operation-inputs) and the [kind conditions](issue-body.md#kind-conditions) the kind's body artifact Fields state.
- Provide the findings and corrected body the applied operation provides as the [Work Kind Result](#work-kind-result).

## Fields

### Work Kind Definition

An issue type the [Registration](#registration) lists, with the artifacts holding it. A kind supplies an interface operation where its rules depart from the general route. Each interface operation in [Operations](#operations) states the inputs every kind's operation for it accepts and the result it provides.

### Registration

Each kind of work with what it is, then each artifact holding it, followed by the interface name of each operation that artifact supplies, linked to that operation. An artifact supplying none lists no name.

- **Proposal**  States the problem and the goal, with no Work Breakdown.
  - [Proposal](proposal.md)
  - [Proposal Body](proposal-body.md)  [Validate Body](proposal-body.md#validate-proposal-body "ƒ")
- **Initiative**  States a goal and lists its epics.
  - [Initiative](initiative.md)
  - [Initiative Issue Body](initiative-issue-body.md)  [Populate Body](initiative-issue-body.md#populate-initiative-issue-body "ƒ"), [Validate Body](initiative-issue-body.md#validate-initiative-body "ƒ")
- **Epic**  Lists its tasks in a Work Breakdown table.
  - [Epic](epic.md)
  - [Epic Issue Body](epic-issue-body.md)  [Populate Body](epic-issue-body.md#populate-epic-issue-body "ƒ"), [Validate Body](epic-issue-body.md#validate-epic-body "ƒ")
- **Task**  One pull request's worth of work.
  - [Task Body](task-body.md)
- **Standalone issue**  Work outside any initiative.
  - [Standalone Body](standalone-body.md)  [Populate Body](standalone-body.md#populate-standalone-body "ƒ")
- **Hot-fix**  A fix to a long-lived branch beside all queued work.
  - [Hot-fix](hotfix.md)  [Release Hold](hotfix.md#release-hot-fix-hold "ƒ"), [Record Dispatch Status](hotfix.md#record-hot-fix-dispatch-status "ƒ"), [Record Delivery](hotfix.md#record-hot-fix-delivery "ƒ"), [Record Merge](hotfix.md#record-hot-fix-merge "ƒ"), [Settle Board Status](hotfix.md#settle-hot-fix-board-status "ƒ"), [Review Before Merge](hotfix.md#review-hot-fix-before-merge "ƒ")
  - [Hot-fix Body](hotfix-body.md)  [Populate Body](hotfix-body.md#populate-hot-fix-body "ƒ")

### Operation Names

A kind's operation takes the interface name with the kind's name after its verb. eg `Settle Hot-fix Board Status` `Populate Standalone Body`

### Item Work Kind

The registered kind of the item an operation runs for: the kind of its issue, or of a delivery unit's issue or rows, or, for a body not yet saved, the kind the caller selects. eg `Epic`

### Operation Inputs

The inputs the caller supplies, as the selected interface operation names them, passed whole to the kind's operation or the general route.

### Work Kind Result

The result the applied operation provides, as the selected interface operation states it. `unsupplied` when the item's registered kind supplies no operation for an interface whose general route is its caller's own; the operation then changes nothing.
