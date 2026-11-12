# Work Kind

Each kind of work, as its [Registration](#registration) lists it, and the two operations several kinds supply: each step links each supplying kind's operation by name, then the general route for any other kind.

## Operations

### Populate Body

One issue body populated to its kind's template, providing the [Body](issue-body.md#body) at the output path.

#### 1. Select Population Route

- Use the [Operation Inputs](#operation-inputs): the body's scope, evidence and design, any current body and the output path, for the [Item Work Kind](#item-work-kind).
- For an initiative, Apply [Populate Initiative Issue Body](initiative-issue-body.md#populate-initiative-issue-body "ƒ") with them.
- For an epic, Apply [Populate Epic Issue Body](epic-issue-body.md#populate-epic-issue-body "ƒ") with them.
- For a standalone issue, Apply [Populate Standalone Body](standalone-body.md#populate-standalone-body "ƒ") with them.
- For a hot-fix, Apply [Populate Hot-fix Body](hotfix-body.md#populate-hot-fix-body "ƒ") with them.
- For any other kind, populate the template its body artifact's Fields state from them, meeting [Body](issue-body.md#body), at the output path.
- Provide the populated body.

### Validate Body

One issue body checked against its kind's template and conditions, providing [Format Findings](issue-body.md#format-findings) and any corrected body.

#### 1. Select Validation Route

- Use the [Operation Inputs](#operation-inputs): the issue record, its fetched related context and the output files, for the [Item Work Kind](#item-work-kind).
- For a proposal, Apply [Validate Proposal Body](proposal-body.md#validate-proposal-body "ƒ") with them.
- For an initiative, Apply [Validate Initiative Body](initiative-issue-body.md#validate-initiative-body "ƒ") with them.
- For an epic, Apply [Validate Epic Body](epic-issue-body.md#validate-epic-body "ƒ") with them.
- For any other kind, Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") with them and the [kind conditions](issue-body.md#kind-conditions) its body artifact's Fields state.
- Provide the findings and corrected body the applied operation provides.

## Fields

### Work Kind Definition

An issue type the [Registration](#registration) lists, with the artifacts holding it. A kind supplies a body operation where its rules depart from the general route. Each operation in [Operations](#operations) states the inputs every kind's operation for it accepts and the result it provides.

### Registration

Each kind of work with what it is, then each artifact holding it, followed by the name of each [Operations](#operations) entry that artifact supplies, linked to that operation. An artifact supplying none lists no name.

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
  - [Hot-fix](hotfix.md)
  - [Hot-fix Body](hotfix-body.md)  [Populate Body](hotfix-body.md#populate-hot-fix-body "ƒ")

### Operation Names

A kind's operation takes the Work Kind operation's name with the kind's name after its verb. eg `Populate Hot-fix Body` `Validate Proposal Body`

### Item Work Kind

The registered kind of the issue an operation runs for, or, for a body not yet saved, the kind the caller selects. eg `Epic`

### Operation Inputs

The inputs the caller supplies, as the selected operation names them, passed whole to the kind's operation or the general route.
