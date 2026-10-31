# Epic delivery branch contract

User selected A: task → epic base → long-lived branch.

## Rules

- Each task PR targets the corresponding epic base, rooted in its configured long-lived target.
- Dependent tasks start after prerequisite delivery into the epic base. Cross-epic prerequisites require completed epics with all bases merged.
- Each completed epic integrates independently after validation, current-head-and-base review and required human approval. All bases must merge before epic closure. Initiative closure still requires its own criteria and completed epics.
- Task branches do not target preceding task branches or initiative integration branches. A dependency remains a start gate; it does not require a PR stack.

## Reconciliation

- I11 AC12 states the routing contract and is unchecked pending evidence against the current contract. E10 also covers AC12; E05 historical delivery remains intact.
- I11 AC16 states dependency-ordered start from the epic base.
- E10 W02/AC10 checks the branch contract, including routes and dependency-start verification; existing criterion and task IDs are preserved.
- E05 #1172 remains a closed historical delivery record; a supersession comment identifies Overview, Proposal, W01/W02 and AC5/AC6 as the historical contract. No historical PR is reclassified as failing.
- REQ-F025/F026 carry this contract with original provenance and a link to this decision. F04 is reconciled at plan level; implementation evidence remains outstanding.

## Verification

- Existing issue IDs, task dependencies, Joins and completion cells retained.
- Before/after snapshots retained alongside this record.
- Published bodies match fresh live readbacks.
