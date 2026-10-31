# Producer availability for cross-epic starts

User selected A: require the named producer rows' delivered outputs to be available in the consumer base. The rule is recorded inline in I11, E10, the current source register and the branch contract. No priority, task ID, dependency edge, reservation or completion state changes.

## Contract

A cross-epic consumer starts only when its named producer rows are delivered and their required outputs are verified available at the pinned consumer-base commit. Record the producer row, delivery evidence, output identity and consumer commit; a merge into a separate producer base alone is insufficient. Unrelated producer rows and producer-epic closure are not additional start gates. Whole-epic dependencies exist only where the task graph establishes the all-rows relationship. Existing integration, review and human-approval requirements still apply.

## Ownership and fixtures

E10 W02 owns delivery prerequisite checks and the matching epic/delivery-branch instructions. Its existing whole-Work-Planner file envelope includes these paths. Cover: available output with unrelated producer tasks open; producer-base-only merge; missing/unreadable/stale output evidence; changed consumer revision; completed producer epic with output absent; and independent integration/review/human gates. The planning change does not implement or pass these runtime fixtures.

The current active cross-epic graph has E09 W03 consuming E08 W02 and E14 W11 consuming E10 W26. Both keep their producer-row references. Availability must be evidenced at delivery time; this review does not assert that a future consumer base already contains them. The full graph check has no active graph error or cycle; retained historical whole-epic edges and separate-pair gaps keep the full report nonzero.

## Source boundary

The current marked source and branch-contract record agree. The historical specification and earlier publication evidence retain their original text beneath their explicit applicability/provenance boundary. Runtime skill instructions requiring every prerequisite epic closed remain implementation work owned by E10 W02, rather than authority to restore that gate in the plan. F14 is resolved at plan level; F16's initiative evidence remains outstanding.

## Verification

I11 and E10 format checks pass. All 52 current source IDs retain their identities, and the machine-readable register matches the marked source. No task graph changes or priority changes are made. Published bodies and preserved metadata are verified by fresh readback.
