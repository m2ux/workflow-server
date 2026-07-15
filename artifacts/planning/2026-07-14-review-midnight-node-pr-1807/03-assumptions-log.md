# Assumptions Log

> Review midnight-node PR #1807 (local env usability fixes) · #1468 · updated 2026-07-15

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | L | The operative specification is rsporny's comment [#issuecomment-4767302657](https://github.com/midnightntwrk/midnight-node/issues/1468#issuecomment-4767302657) (five usability concerns), not issue #1468's empty feature-request template body — the PR body itself points at that comment as the source. | Code: PR body links the comment; issue body is a blank template | Validated |
| DP-2 | Design Philosophy | Problem Interpretation | L | In review mode the "problem" is the review task itself, so this classifies as inventive-improvement (a quality gate on existing tooling) rather than adopting the PR's own fix framing. | — | Open (review-mode convention; not code-resolvable) |
| DP-3 | Design Philosophy | Complexity Assessment | M | Complexity is moderate rather than simple because the from-genesis seed-wiring blocker is a cross-boundary functional claim needing verification against Rust node code (`node/src/command.rs`) outside the PR diff. | Code: at head `98dd8e11`, `SEED_PHRASE` occurs only in 9 compose YAMLs with no consumer in `.rs`/`.sh`/`.toml`/`Dockerfile`; node reads seeds only from `*_seed_file` path fields ([`command.rs:223-275`](../../../../../work/midnight-node/2026-07-14-review-midnight-node-pr-1807/node/src/command.rs#L223), [`midnight_cfg/mod.rs:50-65`](../../../../../work/midnight-node/2026-07-14-review-midnight-node-pr-1807/node/src/cfg/midnight_cfg/mod.rs#L50)). Cross-boundary gap is genuine. | Validated (cross-boundary gap confirmed → moderate complexity holds) |
| DP-4 | Design Philosophy | Workflow Path | L | Requirements elicitation and research add no value and are skipped — review mode fixes the path headlessly and the spec plus prior findings are already in hand. | — | Validated (forced by review-mode `set-review-mode-path`) |
| PL-1 | Plan & Prepare | Scope Decisions | M | The merge-readiness cap holds at request-changes even though the red-CI blocker went stale at head `98dd8e11`: the seed-wiring blocker still stands unaddressed, so `unaddressed-blocker-caps-rating` still precludes approve/comment. | — | Open (verdict policy; not code-resolvable) |
| PL-2 | Plan & Prepare | Scope Decisions | L | Findings are divided along the PR's authored surface (changed-files list); out-of-diff evidence (`node/src/command.rs`, `contract-compiler/Dockerfile`) attaches as cross-boundary/pre-existing context, not as PR findings. | Convention: review-mode Consolidated Review Format authored-surface rule | Validated |
| PL-3 | Plan & Prepare | Task Breakdown | L | Review-mode plan tasks are the review activities to execute (implementation-analysis, code review, test-suite review, consolidated summary), not source edits — the retrospective plan is reference-only. | Convention: review-mode artifact table (`wp-plan.md` = retrospective plan) | Validated |
| PL-4 | Plan & Prepare | Test Strategy | L | No forward test plan is authored; the substantive test assessment is the downstream test-suite review that grades the PR's existing coverage and gaps. | Convention: create-test-plan skip-conditions + review-mode artifact table | Validated |

## Open Assumptions

### DP-2: Review-mode framing as inventive-improvement
**Assumption:** In review mode the "problem" is the review task itself, so this classifies as inventive-improvement (a quality gate on existing tooling) rather than adopting the PR's own fix framing.  
**Decision space:** (a) inventive-improvement — the review is a quality gate on existing tooling; (b) adopt the PR's own defect-fix framing — treat the review as inheriting the PR's problem type.  
**Why not code-resolvable:** this is a review-mode classification convention, not a fact the codebase can settle.  
**Agent's position:** inventive-improvement — the review assesses merge-readiness of existing tooling; it does not itself repair a defect.  
**Reversibility:** easily-reversible (classification is metadata; no downstream artifact hard-depends on it)

### PL-1: Rating cap holds at request-changes despite the stale red-CI blocker
**Assumption:** The merge-readiness cap stays at request-changes even though one of the two original blockers (red `Local Environment Tests` CI) is resolved at head `98dd8e11`, because the seed-wiring blocker still stands unaddressed.  
**Decision space:** (a) Hold at request-changes — one Confirmed blocker still precludes approve/comment (`unaddressed-blocker-caps-rating`); (b) Relax toward comment-only — if the seed gap is judged non-blocking or is dispositioned as an accepted trade-off/deferred follow-up by the maintainers.  
**Why not code-resolvable:** the cap is a verdict-policy judgment about merge-readiness, not a fact the code can settle; the seed gap's *existence* is code-confirmed, but whether it blocks merge is a maintainer decision.  
**Technical context:** Seed-wiring blocker confirmed HOLDS at `98dd8e11` ([15-local-environment-tooling.md](15-local-environment-tooling.md) Blocker 1); red-CI blocker confirmed STALE (all checks green). Effective Confirmed blocker count 2→1.  
**Agent's position:** Hold at request-changes — a from-genesis network that silently never finalizes is a real, unaddressed correctness gap; the framing (provisioning-location trade-off) is for the recommendation, not grounds to lift the cap.  
**Reversibility:** easily-reversible (the final rating is rendered in the consolidated review; the cap is a ceiling, not a forced verdict)

## Ticket Completeness (review mode)

Assessment of issue [#1468](https://github.com/midnightntwrk/midnight-node/issues/1468) across five issue-quality dimensions. The issue body is an unfilled feature-request template; the operative spec is rsporny's comment [#issuecomment-4767302657](https://github.com/midnightntwrk/midnight-node/issues/1468#issuecomment-4767302657). These gaps are tracked findings for the review, independent of any ticket refactor.

| Dimension | Judgment | Gap |
|-----------|----------|-----|
| Problem statement | Present but weak | Conveyed by the title and rsporny's comment; the issue body itself is an empty template with no captured problem statement. |
| Goal | Present but weak | Inferable (fork chosen network in CI; enable from-genesis; fix dispatch/docs) but not stated as a goal in the ticket body. |
| Scope | Missing | No scope boundary; the five comment bullets are a wishlist, not a scoped deliverable. PR #1807 addresses a subset. |
| Acceptance criteria | Missing | None in the ticket or comment; the PR "Ready" checkbox is the only proxy. |
| User stories | Missing | None. |

`ticket_gaps_documented` = true.

## Wrap-Up

Populated at work-package completion.
