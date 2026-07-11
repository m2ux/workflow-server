# Assumptions Log

> workflow-design issue #160 retrospective follow-ups · #160 · updated 2026-07-03

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence (RE-n for requirements refinement).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RE-1 | Requirements Refinement | Schema Construct Choice / Checkpoint Necessity | M | #2 fix mechanism is per-assumption dynamic checkpoint id (`assumption-decision-{current_assumption.id}`) rather than a batched single decision — dynamic ids preserve per-assumption granularity and the one-question-at-a-time rule, whereas batching collapses granularity and conflicts with that rule | User | Confirmed: adopt option (A) per-assumption dynamic checkpoint id `assumption-decision-{current_assumption.id}`, CONDITIONAL on impact-analysis (RE-5) confirming the engine resolves a templated loop-body checkpoint id; if unsupported, fall back to (C) engine-side per-iteration namespacing. Do NOT adopt batched (B). |
| RE-2 | Requirements Refinement | Activity Boundaries / Technique Selection | M | #3 High-tier verification is a NEW dedicated technique bound to a NEW `08-quality-review` step (verify High findings before remediation; lighter pass over surviving Mediums), rather than folding the verification into the existing `audit-fix-cycle` loop — a first-class step makes the invariant structural and inspectable | User | Confirmed: new dedicated verification step + technique (e.g. `verify-high-findings`) in `08-quality-review.yaml` that independently verifies each High finding BEFORE remediation, with a lighter pass over surviving Mediums. Not folded into `audit-fix-cycle`. |
| RE-3 | Requirements Refinement | Rule Scope | L | #3 adds one `08-quality-review` activity rule stating High-tier findings must be independently verified before driving remediation, backing the new step per the workflow's "encode critical constraints as structure" rule | User | Confirmed: ADD an explicit `quality-review` activity rule ("High findings must be independently verified before they drive remediation"), structurally backed by the RE-2 step. |
| RE-4 | Requirements Refinement | Schema Construct Choice | L | #4 reconciliation flips the `enforcement-confirmed` disposition so the recorded option reflects the shipped structural action (relabel/default so `accept-text-only` genuinely means "no structural change" and structural enforcement is recorded when it ships), rather than leaving the label divergent | User | Confirmed: relabel + re-default `enforcement-confirmed` so the recorded disposition matches what actually ships — `accept-text-only` genuinely = no structural change; structural enforcement recorded when delivered. |
| RE-5 | Requirements Refinement | Schema Construct Choice | — | Engine/schema supports checkpoint-id resolution for a loop-body checkpoint whose id is templated per iteration | Impact-analysis (pending) | Tracked for impact-analysis: verify whether the loader/engine resolves a per-iteration templated checkpoint id. Evidence gathered so far — `src/loaders/workflow-loader.ts:265` matches by exact static `c.id === checkpointId`, so a literal lookup will NOT find a templated id per iteration unless the loader interpolates it. Gates RE-1's (A)-vs-(C) branch. |

## Open Assumptions

*(None — all four interviewed assumptions resolved Confirmed; their outcomes live in the Log rows above. RE-5 is a code/impact-analysis verification item, not a stakeholder-open assumption.)*

## Impact-Analysis Follow-Ups

- **RE-5 — engine support for templated loop-body checkpoint ids.** Before committing RE-1's option (A), verify in impact-analysis whether the loader/engine resolves a per-iteration templated checkpoint id (`assumption-decision-{current_assumption.id}`). Evidence: `src/loaders/workflow-loader.ts:265` matches by exact static `c.id === checkpointId`. If unsupported, RE-1 falls back to option (C) engine-side per-iteration namespacing.

## Wrap-Up

4 assumptions interviewed — all confirmed (accept). No corrections, no deferrals.
- RE-1 (#2): per-assumption dynamic checkpoint id (A), gated on RE-5 engine-support check → else (C).
- RE-2 (#3): dedicated `verify-high-findings` step + technique, pre-remediation, lighter Medium pass.
- RE-3 (#3): add the "High findings independently verified before remediation" activity rule, step-backed.
- RE-4 (#4): relabel + re-default `enforcement-confirmed` so disposition matches shipped enforcement.
- Takeaway: RE-1's own bug (static loop-body checkpoint id → replay collision) manifested live during this very interview loop, empirically confirming the #2 problem statement.
