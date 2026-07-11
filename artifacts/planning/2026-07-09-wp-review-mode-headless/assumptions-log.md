# Assumptions Log

> work-package review-mode-headless · #(design session, no issue) · updated 2026-07-09

## Log

One row per assumption, updated in place.

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements Refinement | Checkpoint Necessity | M | Each in-scope checkpoint's recommended default (`proceed-with-gaps`, `accept-research`, `rationale-confirmed`, `issue-recorded`, `{recommended_strategic_option}`, `post-review`) is the always-correct choice in review mode — a reviewer at the gate would pick the same option, so auto-advancing loses no decision — because review mode records/carries findings rather than blocking on them. | User (delegated design guidance + `dimension-confirmed → confirmed`) | Confirmed |
| RR-2 | Requirements Refinement | Variable State | L | `autoAdvanceMs = 30000` is the right timer for every auto-advancing review-mode checkpoint, matching the workflow's existing 30000ms convention (`classification-and-path-confirmed`) rather than the shorter 15000 used by `context-scope-declaration`. | User (delegated design guidance) | Confirmed |
| RR-3 | Requirements Refinement | Schema Construct Choice | M | For `research-assumption-interview` and `analysis-assumption-interview`, the review-mode gate must go on the enclosing `forEach` loop (`condition: is_review_mode != true`), NOT the ref site — because both are `ref: assumption-interview` and that shared fragment already carries a `condition` (`has_open_assumptions == true`), which the fragment resolver forbids doubling (`src/loaders/fragment-resolver.ts` L127–131). Gating the loop keeps the shared fragment generic vs. baking mode semantics into it. | Code: `src/loaders/fragment-resolver.ts:127-131`; `workflow.yaml:33-38` (fragment carries condition) | Validated |
| RR-4 | Requirements Refinement | Activity Boundaries | L | `jira-project-selection` (start-work-package) never fires in review mode, so it needs no change — because it is gated `issue_platform == jira` inside the issue-*creation* branch, and review mode references an existing PR/issue (no issue creation). | Code: `activities/01-start-work-package.yaml:234-254` (creation-branch gating) | Validated |
| RR-5 | Requirements Refinement | Technique Selection / Rule Scope | L | No new technique, workflow rule, schema field, or engine change is required — because `defaultOption` + `autoAdvanceMs` (auto-advance via the server-enforced timer) is the already-sanctioned exception to `checkpoint-discipline-explicit-user-decision`, and the workflow already uses it for 6 checkpoints. | Code: existing auto-advance checkpoints (`02` `classification-and-path-confirmed`, `04` `context-scope-declaration`); intake feasibility confirmation | Validated |
| RR-6 | Requirements Refinement | Checkpoint Necessity | H | Auto-advancing `review-summary-approval → post-review` is acceptable, even though its recommended option has an outward-facing side effect (posts the consolidated review as a comment on the GitHub PR via `update-pr::render`). It is the single non-idempotent, externally-visible auto-resolution in the design. | User | Corrected: `review-summary-approval` stays INTERACTIVE — the sole prompt guarding the outward-facing post-to-PR; it is NOT auto-advanced. Everything else in review mode is headless. |

## Wrap-Up

Six design assumptions surfaced, all resolved — no open assumptions remain. RR-1, RR-2 confirmed via the delegated design guidance and the `dimension-confirmed` confirmation; RR-3, RR-4, RR-5 validated against the workflow source; RR-6 corrected by the user: `review-summary-approval` is **excluded** from headless treatment and stays interactive as the single confirmation before the consolidated review is posted to the GitHub PR. No deferred assumptions (`has_deferred_assumptions = false`).
