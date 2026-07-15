# Review midnight-node PR #1807 (local env usability fixes) - Review Plan

> plan · MEDIUM · Ready · 2-3h agentic + separate human review · 2026-07-15

## Overview

### Problem & Scope

Review scope, success criteria, and merge-readiness cap: [design philosophy](02-design-philosophy.md#success-criteria). Do not restate them here. This is a **retrospective review plan** (review mode) — it sequences the review work to be executed, not new implementation.

## Inputs

- [Prior Feedback Triage](01-prior-feedback-triage.md#rating-cap) — two Confirmed blocker-class concerns set `rating_cap` = request-changes; five prior threads dispositioned.
- [Design Philosophy](02-design-philosophy.md#workflow-path-decision) — inventive-improvement, moderate; review track direct to implementation-analysis, elicitation/research skipped.
- [Assumptions Log](03-assumptions-log.md#open-assumptions) — DP-3 (seed-wiring drives complexity) and DP-2 (review-mode framing) open into this phase.
- [Local-environment Tooling comprehension](15-local-environment-tooling.md#deep-dive-sections) — head-anchored verification of both blockers at `98dd8e11`; from-genesis pass-through design and seed-contract gap.
- [Portfolio Synthesis](portfolio-synthesis.md#bearing-on-the-review) — the seed fix is a "where does provisioning live" trade-off, not a one-line wiring change.

## Proposed Approach

### Solution Design

Review-mode approach: adjudicate PR #1807's merge-readiness at authoritative head `98dd8e11` by (1) re-anchoring the two prior blocker-class concerns to current head, (2) independently reviewing the PR's own changed surface for correctness, safety, and completeness, and (3) rendering a consolidated verdict under the request-changes cap. Comprehension is already complete; the remaining work is the independent code/test review and the consolidated summary.

The review divides along the authored surface: findings on the PR's changed-files list (7 root-level files, `local-environment/src/**`, `.github/workflows/fork-network.yml`, `changes/**`, `docs/**`) are PR findings; findings on out-of-diff files (`node/src/command.rs`, `contract-compiler/Dockerfile`) attach as cross-boundary/pre-existing context supporting the blocker adjudication.

Two head-drift reconciliations frame the verdict:
- **Seed-wiring blocker HOLDS** at `98dd8e11` — `SEED_PHRASE` set in 9 compose YAMLs, no consumer anywhere; node reads only `*_SEED_FILE` paths → from-genesis validators boot with empty keystores → chain never finalizes. Framed as a design trade-off (seed-provisioning location), not a one-liner.
- **Red-CI blocker is STALE** — at `98dd8e11` all checks incl. `Local Environment Tests` are green; the `jq` pin that failed at `bec726a650` is gone. Effective blocker count 2→1.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Anchor findings to current head `98dd8e11` | Authoritative; catches the CI-blocker drift | Requires re-verifying prior line numbers/claims | **Selected** |
| Carry prior findings forward from `bec726a650` unchanged | Faster | Would report a resolved CI blocker as live; stale line numbers | Rejected |
| Treat the seed gap as a one-line wiring fix recommendation | Simple | Misrepresents a trust-boundary/coupling trade-off as trivial | Rejected — frame as provisioning-location decision |

### Design Decisions

- **Rating cap held at request-changes** even though one of the two original blockers went stale: the seed-wiring blocker still stands unaddressed, so an approve/comment verdict remains precluded (`unaddressed-blocker-caps-rating`).
- **Cross-boundary evidence is in-scope for adjudication** but rendered as pre-existing/out-of-diff context, since `node/src/command.rs` is not on the PR's authored surface.
- **Non-blocking nits are carried forward, not gated**: prettier printWidth-80 violation on the new `throw`, no CI lints `local-environment` TS, `collectUnsetComposeVars` regex edge cases (`${VAR:-default}`/`$$VAR`), zero package tests.

### Assumptions

Assumptions underlying the approach: [assumptions log](03-assumptions-log.md). Do not restate them here.

## Review Tasks

Review-mode tasks are the review activities to execute — the artifacts to produce — not source edits.

### Task 1: Implementation-analysis baseline
**Goal:** Establish the PR's pre-change baseline state and confirm the diff surface against head `98dd8e11`.
**Deliverables:**
- `implementation-analysis.md` — pre-change baseline of the `local-environment` from-genesis path and the two blocker sites, with the changed-files list.

### Task 2: Independent code review
**Goal:** Review the PR's changed surface for correctness, safety, and completeness; grade each finding on the classification scale.
**Deliverables:**
- `code-review.md` — findings for `run.ts`, `index.ts`, `types.ts`, `fork-network.yml`, docs/change files; seed-wiring blocker written up as a provisioning-location trade-off with head-anchored evidence; prettier and regex-precision nits recorded.

### Task 3: Test-suite review
**Goal:** Assess test coverage of the changed behavior and document gaps.
**Deliverables:**
- `test-suite-review.md` — coverage gaps for the `local-environment` package (zero automated tests; from-genesis path untested), each graded.

### Task 4: Consolidated review + verdict
**Goal:** Combine all findings into the Consolidated Review Format and render the merge-readiness verdict under the request-changes cap.
**Deliverables:**
- `review-summary.md` — Prior Feedback Triage, Code Review, Test Review tables (Source/Severity/Disposition), Action Items, Overall Rating ≤ request-changes, attribution footer; each of the five rsporny concerns mapped to a disposition.

## Success Criteria

Success criteria: [design philosophy](02-design-philosophy.md#success-criteria). Add ONLY review-task acceptance items not homed there: every finding names a file on the authored surface (out-of-diff findings grouped as pre-existing); every `Source` link validated against `98dd8e11` before inclusion.

## Testing Strategy

Test-design principles and coverage assessment: [test plan](test-plan.md). This review produces a test-suite *review* (gap assessment of the PR's tests), not a new test plan for new code.

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Carrying stale line numbers/claims from `bec726a650` into the summary | MEDIUM | MEDIUM | Re-validate every `Source` link against `98dd8e11` before inclusion (review-mode Source-column rule) |
| Reporting the resolved CI blocker as live | MEDIUM | LOW | Comprehension already re-anchored it to `98dd8e11` (green); render as resolved/stale, not blocking |
| Framing the seed fix as a trivial wiring change | MEDIUM | MEDIUM | Portfolio synthesis frames it as a provisioning-location trade-off; code review carries that framing |

**Status:** Ready for review execution
