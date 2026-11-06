# Failure Recovery Design

## Evidence and Scope

Source: `f819e3b68e32aa014c4ca58648ce674e542cf773`; both gaps are inherited from `2d2e223451815c2a8986bf2848bdd0dd7e4be58d`, not introduced by the operation inlining. The command-tag encoding correction does not alter their continuation.

- [Hot-fix readiness](https://github.com/m2ux/workflow-server/blob/f819e3b68e32aa014c4ca58648ce674e542cf773/skills/work-planner/modes/deliver-mode.md#verify-hot-fix-readiness) marks ready, then validates fresh metadata; its failure route promises draft state without explicitly restoring and confirming it.
- [Merge refusals](https://github.com/m2ux/workflow-server/blob/f819e3b68e32aa014c4ca58648ce674e542cf773/skills/work-planner/artifacts/pull-request.md#merge-delivery-pull-request) stops on harness denial, while [Epic Integration](https://github.com/m2ux/workflow-server/blob/f819e3b68e32aa014c4ca58648ce674e542cf773/skills/work-planner/protocols/epic-integration.md#3-merge-or-hand-off) sends a generic refusal back through readiness checks before unconditional success readback. Merge Permission describes a narrower task-to-epic-base allowance than these general delivery targets.

## Ownership

Deliver Mode owns the hot-fix repair continuation and uses the existing Mark Review Draft command plus fresh metadata readback. Pull Request owns merge-result classification and the actual permission contract. Epic Integration selects continuation from that result without duplicating permission rules or asserting success after a failure.

An initial validation failure and a failed post-ready validation both select explicit draft restoration when the PR is open and ready. Confirm draft with fresh metadata before repair or blocked handoff. If restoration fails or cannot be confirmed, retain that discrepancy explicitly; never state that the PR is draft merely because restoration was requested. A changed head invalidates the old agent-review evidence. No failing branch reaches merge or In Review publication.

Merge outcomes distinguish confirmed merge, required-human handoff, terminal harness denial and GitHub refusal. A harness denial has no GitHub response: preserve the open ready-and-verified result where that remains current, report the missing permission, stop same-run attempts and do not invent an approval request. A GitHub refusal may use the existing bounded retry only after refreshed head, target, review and checks permit it; repeated refusal terminates. A human handoff terminates merge attempts. Confirm merge commit/head/target only for a reported merge. Permission wording must describe existing authorization and observed harness capabilities without broadening either or changing protection settings.

## Units and Dependencies

Proposed E04 has one component per row. W01 changes Deliver Mode. W02 changes Pull Request; W03 changes Epic Integration. W02 and W03 join in one atomic PR, with reciprocal Joins and no dependency edge between them. Each unit consumes E01:W08, the activated style model, rather than a whole-epic gate. All lanes are empty, preserving the initiative's current unlaned units. Existing rows, identifiers, priorities and completion evidence remain intact.

E00 is closed and E02 scopes ownership-preserving separation. The user confirmed E04 at priority 6. Preserve this explicit decision. E02's audit must include these planned corrections and account for shared-file ownership before its generic/ownership fixes are split and dispatched; its current broad rows do not yet declare those components. No current E02 identifiers, criteria, priority or completion evidence change. Refresh contention when those implementation components are available, rather than asserting that the broad future audit has already produced a complete component map.

## Verification

| Scenario | Required observation |
| --- | --- |
| Invalid review before ready | No ready/merge write; explicit confirmed draft or discrepancy |
| Ready write followed by changed head | Draft restoration, fresh readback, old review rejected, repair selected |
| Ready write followed by invalid review | Same withdrawal, no merge or In Review |
| Draft restoration refused/readback disagrees | Unresolved restoration evidence reported, no draft-success assertion |
| Passing hot-fix evidence | Ready confirmed, normal merge route reached once |
| Harness denies merge | No GitHub response assumed; no same-run retry, approval request or success assertion |
| Human review required | Handoff once, no retry or success confirmation |
| GitHub refusal then refreshed admissible evidence | Existing bounded retry only, exact verified head/target |
| Repeated GitHub refusal | Open PR and blocker; no further attempt |
| Confirmed merge | Fresh merged-state/head/target/commit confirmation |

Tests must observe selected operations and their order, not merely check that document keywords exist. Use a bounded fixture-driven reader/executor for the changed routes, recording calls, writes and terminal results; never exercise a real merge. Pair source checks with fresh-context readings of failure and success branches at a pinned revision. Run document/contract/model checks and the full required fixing-PR suites. Keep pre-existing prerequisite-cycle limitations explicit until E02 supplies its repair.
