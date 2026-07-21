# Design Assumptions Log

**Workflow:** workflow-design (primary) / work-package (secondary)
**Mode:** Update
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Technique Selection | 2 | 1 | 1 | 0 | 0 |
| Checkpoint Necessity | 3 | 1 | 2 | 0 | 0 |
| Activity Boundaries | 1 | 1 | 0 | 0 | 0 |
| Rule Scope | 2 | 2 | 0 | 0 | 0 |
| Variable State | 2 | 0 | 1 | 0 | 1 |
| Schema Construct Choice | 1 | 1 | 0 | 0 | 0 |
| **Total** | **11** | **6** | **4** | **0** | **1** |

Gate 2 (`approve-to-commit`) accepted A-3, A-4, A-7, and A-11 as drafted; 1 row remains deferred; 6 rows were settled by direct audit against the current target-workflow files.

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

---

## Open Assumptions

None remaining. A-3, A-4, A-7, and A-11 were confirmed at Gate 2 (`approve-to-commit`, option `approved`) as drafted.

