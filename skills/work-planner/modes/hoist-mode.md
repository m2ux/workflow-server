# Hoist Mode

Brings the chosen standalone issues into the agent-engineering structure, or leaves them open according to the user's decision.

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Placement](../artifacts/placement.md)
- [Plan Change](../artifacts/plan-change.md)
- [Guidelines](../guidelines.md)
- [Issue Body](../artifacts/issue-body.md)
- [Dependency Graph](../artifacts/dependency-graph.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Fetch.**
   Fetch every issue with [Read Repository Issues](../artifacts/issue.md#read-repository-issues).
2. **List candidates.**
   Call [Find Placement Candidates](../artifacts/placement.md#find-placement-candidates) with the complete issue collection.
   - Use its candidates and available destinations for triage.
3. **Triage.**
   Read each candidate's body and discussion through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue), with the initiative and epic bodies whose themes or criteria it touches.
   - Supply that evidence and planning-record references to [Draft Issue Placement](../artifacts/placement.md#draft-issue-placement) for each option.
   - Order the returned options best first, with Leave last.
4. **Decide each placement.**
   Run [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy) for each orphan's best option that changes the plan, with the allowance the caller supplied.
   - An automatic option is confirmed as it stands, and recorded through [Record Plan Change](../artifacts/plan-change.md#record-plan-change).
   - A held option is settled as [Held Change](../artifacts/plan-change.md#held-change) states, leaving the orphan where it is.
   - An option put to the user is offered as an [Interview](../guidelines.md#modes). The grounding paragraph says what the orphan asks and where it fits.
     - Leave is last.
     - Placing an orphan in another initiative's issue needs that answer as its approval.
   - A caller naming the placement, settled with the user before the hoist, has it applied rather than offered again.
5. **Apply.**
   Run [Apply Issue Placement](../artifacts/placement.md#apply-issue-placement) with each confirmed placement and its current source and destination records.
   - After it returns the saved destination, run exactly one disposition procedure with the returned destination and source records: [Rewrite Orphan Issue](../artifacts/placement.md#rewrite-orphan-issue) for kept or left issues, or [Subsume Orphan Work](../artifacts/placement.md#subsume-orphan-work) for work taken by another issue.
   - Resume review.
6. **Review.**
   - Run [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body) on every issue the hoist changed or created.
   - Run [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering) on each initiative that gained a task or epic.
   - Resolve each finding as [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy) returns it: an automatic correction is applied, and a held one is settled as [Held Change](../artifacts/plan-change.md#held-change) states.
   - Apply confirmed body corrections through [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections).
   - Publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
   - Repeat Validate Issue Body with the saved affected bodies.
   - Repeat Check Dependencies and Numbering with the saved affected bodies.
   - Report any unresolved finding.
7. **Report.**
   Report each orphan's placement, the issues changed, created or closed, and the orphans left.
   - Return the [change list](../artifacts/plan-change.md#change-list) with it, so the caller reports each placement this mode made and each it held.

## Outcomes

- **Each orphan placed.**
  The user has each chosen standalone issue joined to an initiative, epic or task, or left open.
- **Cited work included.**
  A standalone issue an agent-engineering issue cites is placed, or taken into the issue that already carries that work.
- **The decision respected.**
  An orphan moves on the user's word, or on the allowance its caller supplied, and work needing a decision outside that allowance stays where it is.
