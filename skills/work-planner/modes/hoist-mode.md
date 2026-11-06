# Hoist Mode

Brings the chosen standalone issues into the agent-engineering structure, or leaves them open according to the user's decision.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Placement](../artifacts/placement.md)
- [Hot-fix Body](../artifacts/hotfix-body.md)
- [Plan Change](../artifacts/plan-change.md)
- [Guidelines](../guidelines.md)
- [Issue Body](../artifacts/issue-body.md)
- [Dependency Graph](../artifacts/dependency-graph.md)

## Procedure

### 1. Fetch

Apply [Read Repository Issues](../artifacts/issue.md#read-repository-issues "ƒ") for every issue.

### 2. List Candidates

- Apply [Find Placement Candidates](../artifacts/placement.md#find-placement-candidates "ƒ") with the complete issue collection.

- Use its candidates and available destinations for triage.

### 3. Triage

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for each candidate's body and discussion, with the initiative and epic bodies whose themes or criteria it touches.

- Apply [Draft Issue Placement](../artifacts/placement.md#draft-issue-placement "ƒ") for each option with that evidence and planning-record references.
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

- Apply [Apply Issue Placement](../artifacts/placement.md#apply-issue-placement "ƒ") with each confirmed placement and its current source and destination records.

- After it returns the saved destination, run exactly one disposition procedure with the provided destination and source records, including a new task's row id: Apply [Rewrite Orphan Issue](../artifacts/placement.md#rewrite-orphan-issue "ƒ") for kept or left issues, or Apply [Subsume Orphan Work](../artifacts/placement.md#subsume-orphan-work "ƒ") for work taken by another issue.
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
