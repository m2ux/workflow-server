# Design Assumptions Log

**Workflow:** workflow-design (primary) / work-package (secondary)
**Mode:** Update · Iterate lap 2
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Technique Selection | 3 | 1 | 1 | 0 | 0 |
| Checkpoint Necessity | 4 | 1 | 2 | 0 | 0 |
| Activity Boundaries | 2 | 2 | 0 | 0 | 0 |
| Rule Scope | 3 | 3 | 0 | 0 | 0 |
| Variable State | 2 | 0 | 1 | 0 | 1 |
| Schema Construct Choice | 2 | 1 | 0 | 0 | 0 |
| **Total** | **16** | **8** | **4** | **0** | **1** |

Lap-1 Gate 2 accepted A-3, A-4, A-7, and A-11 as drafted. Iterate lap 2 adds A-12–A-16; A-12 remains open for Gate 2. D-1 remains deferred.

---

## Log

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Technique Selection | H | audit | The `write-artifact` reference-resolution defect is structural, not per-caller: every current reference (15+ technique files across both workflows) is embedded protocol prose, never a bound `step.technique` in the referencing activity's own `steps[]`. | Seemed reasonable because the intake worker for this same session already reproduced it live against `intake-classification`. | ✅ Validated — `grep` across `workflow-design/techniques/*.md` confirms every `write-artifact` mention is a markdown link inside protocol prose (e.g. `persist-design-specification.md:30`, `intake-classification.md:89`, `impact-analysis.md:57`); `work-package/activities/15-codebase-comprehension.yaml` proves a direct `technique: manage-artifacts::write-artifact` step binding is schema-valid, so the fix is to bind it explicitly rather than reference it in prose. | None (confirms baseline for `impact-analysis`/`scope-and-draft`) |
| A-2 | Checkpoint Necessity | M | audit | `post-impl-review`'s `block-interview` is a bare `kind: checkpoint`, not wrapped in any `kind: loop`, so its one-item-at-a-time discipline is agent-behavior-only. | Matched the structural-inventory finding's own description. | ✅ Validated — direct read of `work-package/activities/10-post-impl-review.yaml`: `block-interview` (line ~42) is a standalone `kind: checkpoint` gated by `has_flagged_blocks == true`, with `defaultOption: issue-recorded` + `autoAdvanceMs: 30000`; the nearest `kind: loop` (`review-fix-cycle`, ~line 92) wraps different steps (`code-review`, `test-suite-review`), not `block-interview`. | None (confirms baseline; fix candidate: wrap in `forEach` + `breakCondition`) |
| A-3 | Checkpoint Necessity | M | confirmed | `switch-model-pre-impl` / `switch-model-post-impl` should be **deprecated** (not merely reclassified to soft/auto-advance). | Design brief lists deprecation as the candidate theme. | ✅ Confirmed at Gate 2 — deprecate/remove as drafted (not soften-in-place). | Accepted as drafted |
| A-4 | Checkpoint Necessity | M | confirmed | `analysis-confirmed` should be **removed outright**, replaced by the autonomous gap-fill-then-auto-proceed pattern already used in `codebase-comprehension`. | Design brief names this as the target pattern. | ✅ Confirmed at Gate 2 — remove gate; keep autonomous gap-fill pattern as drafted. | Accepted as drafted |
| A-5 | Activity Boundaries | M | audit | No retrospective finding requires adding, removing, or reordering an activity in either workflow. | Every bullet in the Update scope reads as an in-place step/technique/rule change. | ✅ Validated — cross-checked every bullet in [structural-inventory.md](structural-inventory.md#update-scope) against both workflows' Activities tables; none names an activity id absent from those tables. | None |
| A-6 | Rule Scope | L | audit | MR-1..MR-4 authoring-guidance items belong in `workflow-design/resources/anti-patterns.md` (guidance-only), not a new structural (checkpoint/condition/validate) rule. | That resource is the workflow's existing catalog of this exact class of finding. | ✅ Validated — `anti-patterns.md` already carries comparable write-time entries (e.g. lines 384, 1504); MR-1..MR-4 extend the same resource rather than introducing a new mechanism. | None |
| A-7 | Variable State | M | confirmed | `project_type` seeding lands as a new `start-work-package` step output, with its exact default/type left to `scope-and-draft`. | Design brief specifies *what* (seed at intake) but not the concrete step placement or schema. | ✅ Confirmed at Gate 2 — accept drafted `detect-project-type` / bag-seeding placement. | Accepted as drafted |
| A-8 | Schema Construct Choice | L | audit | The `block-interview` fix reuses the `forEach`/loop construct already present in the same activity file, rather than introducing a new loop or checkpoint kind. | Reuse-before-invent is the workflow-design authoring norm. | ✅ Validated — `work-package/activities/10-post-impl-review.yaml` already contains a `kind: loop` (`review-fix-cycle`, `doWhile`) in the same file, confirming loop constructs are an established, schema-valid pattern here. | None |
| A-9 | Rule Scope | H | audit | The transition-condition claim/registration mismatch fix is a workflow-content-only change (authoring canon), not an engine/schema change. | The user request and repository boundary rules scope this session to `workflow-design`/`work-package` content. | ✅ Validated — `AGENTS.md`/`CLAUDE.md` boundary rules forbid modifying `src/`/`schemas/` without explicit user direction, which was not given; the fix is confined to transition-authoring guidance. | None |
| A-10 | Variable State | L | audit | The `path_gating_complexity` vs. `problem_complexity` naming-ambiguity finding needs no active Gate 2 decision. | The finding explicitly self-classifies as "low-priority legibility fix," i.e. the disposition is already stated by its source. | ⏸️ Deferred — see [deferred-items.md#D-1](deferred-items.md#d-1). | Logged to deferred-items register |
| A-11 | Technique Selection | M | confirmed | This activity's own `update-assumptions-log` step (technique `work-package::review-assumptions::record`) declares an `assumption_decisions` input with no producer in `requirements-refinement`'s `steps[]` — no checkpoint in this activity collects per-assumption user decisions; they are batched to Gate 2 in a *later* activity. | Discovered while executing this very step (see `get_activity` bundle: input `assumption_decisions` marked `UNRESOLVED — no workflow variable, prior step output, or step-binding supplies it`). | ✅ Confirmed at Gate 2 — accept drafted producer/binding fix for `assumption_decisions` in `requirements-refinement`. | Accepted as drafted |
| A-12 | Checkpoint Necessity | H | open | After an in-activity post-update remedia loop clears findings by editing already-committed files, the flow must re-enter `validate-and-commit` (or an equivalent commit path) before treating the update as clean and transitioning to retrospective. | Post-update runs *after* commit today; remedia without re-commit would leave a clean audit against a dirty worktree, or an unclean catalog against a committed tree. Alternatives: (1) remedia → `validate-and-commit` → retrospective (skip re-audit or short-circuit when findings already 0); (2) embed commit inside the remedia loop; (3) skip in-activity remedia and always auto-intake for a full cycle when findings > 0. | Open — batched to Gate 2 | — |
| A-13 | Technique Selection | M | audit | Prefer migrating remaining `persist-report` activity binds to `work-package::manage-artifacts::write-artifact` with activity-appropriate bare filenames, retiring `persist-report` as a separate writer. | Matches lap-1 write-artifact migration and F-2's preferred option; activities already know the report name (`post-update-review.md` / `compliance-review.md`). | ✅ Validated — current `persist-report.md` Protocol §2 assumes a sibling bound `write-artifact` step that no call site declares; call sites in `08-quality-review.yaml`, `10-post-update-review.yaml`, and `09-validate-and-commit.yaml` bind `persist-report` only. Migration to direct binds removes the phantom handoff. | Spec prefers write-artifact migration |
| A-14 | Activity Boundaries | L | audit | Iterate still adds/removes/reorders **no** activities — only steps/conditions/transitions inside existing `post-update-review` (and a message edit on work-package `complete`). | Change request names files and gates, not new activity ids. | ✅ Validated — [structural-inventory.md](structural-inventory.md#update-scope) iterate bullets name `10-post-update-review.yaml`, `persist-report.md`, and `14-complete.yaml` only. | None |
| A-15 | Rule Scope | M | audit | Count-gating `persist-post-expressiveness` / `persist-post-conformance` is a structural `condition` copy of quality-review's gated persists — no new variable or technique required. | F-1 / P-1 already name the mirror pattern and variable ids. | ✅ Validated — `08-quality-review.yaml` `persist-expressiveness-findings` / `persist-conformance-findings` already use `expressiveness_finding_count` / `conformance_finding_count` `> 0` conditions; post-update audit steps already emit those counts. | None |
| A-16 | Schema Construct Choice | M | audit | The automatic remedia loop reuses `kind: loop` / `loopType: while` + `maxIterations` as in quality-review `audit-fix-cycle`, gated on a needs-fixes / findings-count variable — not a new loop kind. | Change request prefers quality-review-style remedia; QR already proves the construct. | ✅ Validated — `08-quality-review.yaml` `audit-fix-cycle` is `while` + `needs_audit_fixes == true` + `maxIterations: 3` with apply + re-audit + reassess. | Spec prefers mirror pattern |

---

## Open Assumptions

### A-12: Re-commit after post-update remedia
**Assumption:** Successful in-activity remedia that edits committed files must re-enter `validate-and-commit` (or equivalent) before retrospective.  
**Decision space:** (1) remedia → `validate-and-commit` → retrospective / short-circuit post-update; (2) commit inside remedia loop; (3) skip in-activity remedia and auto-intake whenever findings > 0.  
**Why not code-resolvable:** Chooses post-commit lifecycle shape (when the catalog is considered clean), not schema validity.  
**Technical context:** Today `post-update-review` follows `validate-and-commit`; disposition `iterate` returned to intake. Mandate forbids asking but does not name the commit boundary.  
**Agent's position:** Prefer (1) — keep QR-style remedia in-activity, then re-commit once, matching “fix then validate” elsewhere.  
**Reversibility:** path-committing
