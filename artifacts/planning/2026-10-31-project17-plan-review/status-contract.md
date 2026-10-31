# Status contract reconciliation

User selected A: align with current reservation/readiness delivery, including the review gate.

## Scope and ownership

- E09 #1176 W03 retains AC2–AC3: initiative membership and current reservation or delivery-PR activity. W04 retains AC4–AC5: Ready eligibility and Backlog propagation. Task IDs, dependencies, Joins and completion cells are preserved.
- Ready eligibility includes a Ready or In Progress parent and met delivery/planning prerequisites. Historical delivery alone does not start another initiative.
- Backlog propagation covers unstarted descendants only. Done remains Done. Active reservations, delivery PRs and review handoffs require explicit reconciliation; a parent status change does not release work.
- Epic In Review requires completion and current integration head/base review evidence without blocking findings. Missing/stale review keeps a completed unmerged epic In Progress. Human approval remains a merge requirement.
- E17 owns review-gate implementation and corpus audit. I11 AC34 is qualified by that gate, returned to unchecked pending new evidence, and covered by E17 as well as the historically completed E15. AC36 identifies both head and base.

## Supersession

F01 stale single-initiative prose and F02 contradictory status requirements are reconciled in the current plan. Only E09 AC1 remains cancelled; its surviving criterion and task IDs are unchanged. The E15 completion signal remains necessary; E17 adds the review precondition. Historical E15 completion is preserved. F13 is reconciled at the plan level; implementation and evidence remain with E17.

The dated review findings and original requirement sources remain historical evidence. This explicit user decision governs the affected status and handoff requirements. Other source-contract findings, including F03, F04 and F17, remain pending.

## Verification

- Initiative format: no findings.
- Epic format: only existing cancelled-AC1 numbering gap and W03 whole-epic E08 dependency; no additional format finding.
- All criterion IDs preserved. Every E09 work-breakdown cell preserved.
- Before/after bodies are in snapshots/status-*-before.md and snapshots/status-*-after.md.
- This changes the plan, not runtime implementation or board placements. E09 W03/W04 and E17 still need delivery evidence.

## Checklist

- [x] Refresh live issues and inspect delivery behavior.
- [x] Reconcile authorized status and handoff requirements.
- [x] Validate wording, IDs, task ownership and format.
- [x] Publish issue bodies and verify exact fresh readbacks.
