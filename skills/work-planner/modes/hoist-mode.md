# Hoist Mode

Brings the chosen standalone issues into the agent-engineering structure, or leaves them open according to the user's decision.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Fetch

Run [Fetch All Issues](../artifacts/issue.md#fetch-all-issues "ƒ") for every issue.

### 2. List Candidates

- Run [List Orphans](../artifacts/placement.md#list-orphans "ƒ") with the complete issue collection.

- Use its candidates and available destinations for triage.

### 3. Triage

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for each candidate's body and discussion, with the initiative and epic bodies whose themes or criteria it touches.

#### Placement Options

- For each option, use the fetched evidence and planning-record references.

- Identify an existing task, a new task, a new epic, a new initiative, a hot-fix, or Leave for the orphan and candidate destinations in [Placement Inputs](../artifacts/placement.md#placement-inputs).
- Offer a hot-fix only for an orphan that meets the hot-fix [Definition](../artifacts/hotfix-body.md#definition), with the theme board it joins and its [target](../artifacts/hotfix-body.md#target): the declared long-lived branch the orphan's evidence places the defect on, the repository's default branch where it is declared and the evidence names no other.

- Populate the placement meeting [Fields](../artifacts/placement.md#fields) and [Disposition Conditions](../artifacts/placement.md#disposition-conditions).

- Retain [Placement Result](../artifacts/placement.md#placement-result) for the placement decision and application steps.

#### Option Order

- Order the provided options best first, with Leave last.

### 4. Decide Each Placement

- Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy "ƒ") for each orphan's best option that changes the plan, with the allowance the caller supplied.

- Confirm an automatic option as it stands, and Apply [Record Plan Change](../artifacts/plan-change.md#record-plan-change "ƒ") with that option.
- A held option is settled as [Held Change](../artifacts/plan-change.md#held-change) states, leaving the orphan where it is.

- An option put to the user is offered as an [Interview](../guidelines.md#modes). The grounding paragraph says what the orphan asks and where it fits.

- Leave is last.
- Placing an orphan in another initiative's issue needs that answer as its approval.

- A caller naming the placement, settled with the user before the hoist, has it applied rather than offered again.

### 5. Apply

#### Confirmed Destination

- Use each confirmed placement and its current source and destination records.

##### 1. Apply Confirmed Destination

- Execute only the branch matching [Confirmed Placement](../artifacts/placement.md#confirmed-placement):

###### Existing Task

- Add the orphan's outcomes to the task criteria.
- Add its design to Proposal.
- When they exceed the epic's criteria, add epic criteria cited by the task row.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the affected bodies.

###### New Task

- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ") with the confirmed task scope, current epic context and output path.
- Add the epic criteria the row's Coverage needs where the orphan's outcomes exceed the epic's, as [Destination Work](../artifacts/placement.md#destination-work) states.
- Leave the row's Task cell holding the row id alone until the work is planned and the row gains its work-item file, as [Task Delivery](../artifacts/epic-issue-body.md#task-delivery) states.
- Number the row where it can start, and keep its row id for the result.
- When movable rows change number, Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") with the affected initiative and epic drafts and confirmed numbering map.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the checked bodies.

###### New Epic

- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ"), carrying the orphan's work in a task row, and keep its row id for the result.
- Apply [Draft Initiative Issue Body](../artifacts/initiative-issue-body.md#draft-initiative-issue-body "ƒ") with the covering row.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the epic.
- Link its issue in the initiative row.

###### New Initiative Destination

- Apply [Populate Initiative Issue Body](../artifacts/initiative-issue-body.md#populate-initiative-issue-body "ƒ") from the orphan's scoped problem and confirmed goal.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the populated initiative body.

###### Hot-Fix Destination

- Apply [Select Tracker Number](../artifacts/issue.md#select-tracker-number "ƒ") in [Repository](../artifacts/hotfix.md#repository) using the hot-fix prefix letter to select a number for the source issue identified by [Hot-fix Identity](../artifacts/hotfix.md#hot-fix-identity).

- Apply [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels "ƒ") with the labels hot-fix [Titles](../artifacts/hotfix-body.md#titles) name.

- Retain the [hot-fix number](../artifacts/hotfix.md#hot-fix-number) for rewriting and saving the issue's body, title and labels. After the rewrite, the hot-fix status step below follows its [placement](../artifacts/placement.md#disposition-conditions).
- Use the source issue as the destination with disposition Kept. The rewrite branch below supplies its hot-fix body and keeps the issue open.

###### Leave

- Use the source issue as the destination with disposition Leave. The rewrite branch below supplies its standalone body and keeps the issue open.

##### 2. Retain Saved Placement

Retain [Placement Result](../artifacts/placement.md#placement-result) with the saved destination, identities of all affected bodies and confirmed disposition, including the destination initiative, epic and new row id for a new task or new epic, and the number for a hot-fix. Use the saved destination in exactly one disposition below.

#### Kept or Left Issue

- After the destination is saved, use the provided destination and source records, including a new task’s row id. Run exactly one disposition: this rewrite for a kept or left issue, or the transfer branch below for work taken by another issue.

##### 1. Populate Selected Body

- Select the destination kind and evidence/design from [Rewrite Inputs](../artifacts/placement.md#rewrite-inputs).

###### Initiative Body

- For an initiative, Apply [Populate Initiative Issue Body](../artifacts/initiative-issue-body.md#populate-initiative-issue-body "ƒ").

###### Hot-Fix Body

- For a hot-fix, populate its body as follows.

- Populate the standalone [Template](../artifacts/standalone-body.md#template) for [Hot-fix Identity](../artifacts/hotfix-body.md#hot-fix-identity) at the destination in [Output Body](../artifacts/hotfix-body.md#output-body).
- The work must meet [Definition](../artifacts/hotfix-body.md#definition).
- The title must meet the shared [Titles](../artifacts/issue-body.md#titles) conditions and the hot-fix [Titles](../artifacts/hotfix-body.md#titles).
- Name the confirmed [Target](../artifacts/hotfix-body.md#target) in the Overview.
- Populate the Problem and Proposal from [Defect Evidence](../artifacts/hotfix-body.md#defect-evidence), meeting [Problem and Proposal](../artifacts/issue-body.md#problem-and-proposal).
- All populated fields must meet [Fields](../artifacts/hotfix-body.md#fields).

- Retain the populated [Output Body](../artifacts/hotfix-body.md#output-body) for publication.

- A hot-fix belongs to no initiative or epic, and names no Depends on or Joins.
- It sits on its theme's board.
- Its priority 10, which its [Titles](../artifacts/hotfix-body.md#titles) label carries, ranks it nowhere: the queue places it by its [Board Status](../artifacts/hotfix.md#board-status), outside the priority sets.

###### Standalone Body

- For a standalone issue, Apply [Populate Standalone Body](../artifacts/standalone-body.md#populate-standalone-body "ƒ").

###### Common Body Content

- Carry evidence into Problem and design into Proposal.
- Pass a hot-fix its supplied number, theme label and target.

##### 2. Validate and Save Body

- Apply [Check Round of Edits](../artifacts/issue-body.md#check-round-of-edits "ƒ") with the populated body and selected kind conditions before publishing.
- Resolve findings.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the validated body, title and labels, a hot-fix's being every label its [Titles](../artifacts/hotfix-body.md#titles) name.

##### 3. Settle Hot-fix Status

For a hot-fix, Apply [Settle Hot-fix Board Status](../artifacts/hotfix.md#settle-hot-fix-board-status "ƒ") with the confirmed theme board and the saved issue.

##### 4. Retain Saved Identity

Retain [Saved Orphan](../artifacts/placement.md#saved-orphan) with the saved identity and a hot-fix’s settled board item.

#### Transferred Work

- For work taken by another issue, keep the work tracked by that taking issue and use the provided source/destination records:

##### 1. Transfer Tracked Work

- Transfer the work in [Transfer Inputs](../artifacts/placement.md#transfer-inputs) to the taking issue.
- Make each outcome a criterion of one invariant.
- Put the design in Proposal.
- Cite the orphan and any planning record in References.

##### 2. Prepare Closure Comment

Prepare the comment file naming the taking epic and row, or the taking task issue, for example `Tracked in [I07:E01](…/issues/937) W04.` The closure operation records it once.

##### 3. Close Transferred Orphan

- Use the orphan identity, confirmed destination evidence and closure comment file; retain the orphan’s body.

- Confirm [Transfer Evidence](../artifacts/issue.md#transfer-evidence) establishes that the destination contains the work and cites the source issue in [Identity](../artifacts/issue.md#identity).

- Apply [Comment on Issue](../artifacts/issue.md#comment-on-issue "ƒ") with the destination reference and [Comment](../artifacts/issue.md#comment).

- Run [Close as Not Planned](../artifacts/issue.md#close-as-not-planned "ƒ"), retaining the issue's body.

- Run [Fetch Tracker Issue](../artifacts/issue.md#fetch-tracker-issue "ƒ") to confirm its state and reason.

- Retain the confirmed [State](../artifacts/issue.md#state) and reason after the saved issue is read back.
- Retain [Saved Orphan](../artifacts/placement.md#saved-orphan) with the confirmed closure or blocker.

#### Review Continuation

- Resume review.

### 6. Review

- Apply [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body "ƒ") on every issue the hoist changed or created.
- Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") on each initiative that gained a task or epic.
- Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy "ƒ") with each finding and resolve it as provided: an automatic correction is applied, and a held one is settled as [Held Change](../artifacts/plan-change.md#held-change) states.
- Apply [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections "ƒ") with confirmed body corrections.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the corrected bodies.
- Apply [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body "ƒ") again with the saved affected bodies.
- Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") again with the saved affected bodies.
- Report any unresolved finding.

### 7. Report

- Report each orphan's placement, the issues changed, created or closed, and the orphans left.

- Provide the [change list](../artifacts/plan-change.md#change-list) with it, so the caller reports each placement this mode made and each it held.

## Outcomes

- **Each orphan placed.**
  The user has each chosen standalone issue joined to an initiative, epic or task, made a [hot-fix](../artifacts/hotfix-body.md), or left open.
- **Cited work included.**
  A standalone issue an agent-engineering issue cites is placed, or taken into the issue that already carries that work.
- **The decision respected.**
  An orphan moves on the user's word, or on the allowance its caller supplied, and work needing a decision outside that allowance stays where it is.
