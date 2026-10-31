# E16 evidence-capture task boundaries

User approved splitting the closure audit and revision helper and retaining only actual dependencies.

| Task | Coverage | Dependency | Record |
| --- | --- | --- | --- |
| W01 | AC1–AC3 | None | Existing epic row |
| W02 | AC4 | W01 | Existing epic row |
| W03 | AC5 | W02 | [Closure sweep](w03.md) |
| W04 | AC6 | None | [Revision helper](w04.md) |
| W05 | AC7 | W03, W04 | [Reachability audit](w05.md) |

W03 retains the closure concern from the original combined row. W04 is independent of capture. W05 owns the final all-script reachability verdict; each implementation owns its own specification and caller wiring. Criterion IDs and unchecked states are preserved. No E16 delivery PRs were found and the original rows had no reservations or PR links. No cross-epic edge or board-priority change is introduced.

See [pair decisions](joins.md). The existing W01/W02 work-item detail remains part of the broader F09 planning gap; this split does not claim full dispatch readiness.

## Verification

The epic format and task dependency check cover the revised body. The graph is W01 → W02 → W03 → W05, with independent W04 → W05. F15 is resolved in the plan; no implementation or completion is claimed.

Published body matches exact live readback.
