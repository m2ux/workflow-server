# Backlog PR Routing — Six Placeholder PRs

**Date:** 2026-08-01 · **Baseline:** `main@753727a1` / `workflows@46bc1811`

This folder is the engineering home for the six draft PRs that carry the remaining work from open issues #310–#359, routed per the liveness re-verification of 2026-08-01 (recorded on each issue) and the grouping analysis in the session that produced them. Each PR is opened as a **placeholder** with the Initial template variant; implementation follows later, per PR.

## The six PRs

| # | Branch | Base | Scope | Gate before work starts |
|---|--------|------|-------|-------------------------|
| 1 | `workflow/358-338-corpus-batch` | `workflows` | #358 top-20 whole-resource citation pairs (AP-134 verdicts); #338 W4 five content defects (#189 C3/F15 register); #338 W6 bullets 1–2 (ORCHESTRATION MODEL fragment conversion, fragment-body dedupe) | none — unblocked |
| 2 | `feat/when-merge-rule-fragments-ap134-guard` | `main` | condition_not_met extended to when-gated checkpoints (#189 C8 tail); fragment refs in activity-file rules (#338 W6 b3); citation-grain guard (#358) | none — direction already settled by the shipped schema (`when` survives; `condition` LEGACY) |
| 3 | `workflow/338-when-migration` | `workflows` | Migrate legacy structured step conditions to `when` on non-checkpoint steps; register kept sites (checkpoint / exists-shaped) | PR 2 merges first |
| 4 | `workflow/310-workflow-authoring-gitnexus` | `workflows` | Bind gitnexus-operations into workflow-authoring's four activities (#310 Part 1, retargeted from deprecated workflow-design) | none — unblocked |
| 5 | `workflow/317-checkpoint-contract` | `workflows` | #317 directions 1+3+4: reconcile present-before-any-resolution with the headless soft-gate licence (single home); self-attestation gates become interactive; outcome-clause consent audit | design directions confirmed at PR review (direction 2 — server-enforced timer — deliberately not taken) |
| 6 | `workflow/320-requirements-refinement-group-d` | `workflows` | #320 Group D F-items (F-7, F-8, F-12, F-13) + inventoried removals rows 10–21 (05-impact-analysis.md of `2026-07-27-requirements-refinement-design-fixes`) under the A-3/A-5/A-7 dispositions | A-3/A-5/A-7 + AP-80 (F-13) approved at PR review — the PR is the approval vehicle |

## Key facts feeding the scopes

- **Top-20 measurement** (whole-file citation pairs by resource body size, anti-patterns excluded): 20 pairs ≥ 5,531 chars across design-principles, tdd-concepts-rust, schema-construct-inventory, injection-pattern-catalog, severity-rubric, probe-catalog, subsystem-map, strategist, remediation-playbook, requirements-elicitation. 85 whole-citation pairs total at baseline.
- **The five W4 content defects** (from #189 C3 / F15): env-after-nice invalid shell in cargo-operations; RUST_TEST_THREADS budget claim scoped wrong (group rule vs check/clippy); create-issue step-1 scoping contradiction; run-suite vs foreground-only tension; design-philosophy checkpoint message interpolating a value its own options set.
- **when/condition merge direction**: the shipped schema marks structured `condition` LEGACY and prefers `when`; the last exclusive use of `condition` is checkpoint condition_not_met dismissal — PR 2 removes that exclusivity, PR 3 migrates the corpus (~67 `when` sites already exist; structured step conditions to migrate are the tail).
- **Not in any PR**: #338 W8 (B12 retire sweep — stays parked until a schema major is cut); #316 (deferred by its own text; revisit trigger not fired); #320 C-3 trace_token (needs fresh repro — emission is default-on since #64).

## Provenance

Scopes derive from: issues #310/#317/#320/#338/#358/#359 and their 2026-08-01 liveness-verification comments; #343 (delivery routing precedent); #189 evaluation report + fix-verification ledger (`2026-07-08-schema-technique-disclosure-review-repeat`); the #318 impact analysis (`2026-07-27-requirements-refinement-design-fixes/05-impact-analysis.md`); scope manifest of `2026-07-31-section-resource-grain-358-359`. Drafted with Claude Code (Fable 5).
