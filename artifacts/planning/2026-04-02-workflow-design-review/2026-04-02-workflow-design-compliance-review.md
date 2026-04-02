# Compliance Review: workflow-design

**Date:** 2026-04-02  
**Workflow:** workflow-design v1.2.0  
**Files audited:** 22 (1 workflow.toon, 10 activities, 2 skills, 5 resources, 4 README.md)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 4 |
| Low      | 2 |
| Pass     | 8 |

Overall: the workflow is **schema-valid**, **modular**, and **review mode** is coherently wired (`skipActivities`, `context-and-literacy` → `quality-review`). The main gaps are **tool documentation accuracy** in `00-workflow-design.toon` and **missing structural confirmation** for review-mode intake.

## Intake scope (review mode)

**Target:** `workflow-design` (self-review).  
**Structure:** `initialActivity: intake` → activities linked via per-activity `transitions` (no root-level `transitions` in `workflow.toon`, consistent with e.g. `prism`).

| Metric | Count |
|--------|------:|
| Activity files | 10 |
| Skill files | 2 |
| Resource files | 5 |
| Checkpoints (all activities, approximate) | 25+ |
| Activity transition edges | 10+ |

## Schema Expressiveness Findings

| ID | Location | Finding | Recommendation |
|----|----------|---------|----------------|
| E1 | `activities/01-intake.toon` — steps `present-review-scope` | Step text asks the user to confirm review scope, but **no checkpoint** fires when `is_review_mode == true` (only `mode-confirmation` and `change-request-confirmed`, both gated off in review mode). | Add a blocking checkpoint (e.g. `review-scope-confirmed`) conditioned on `is_review_mode`, with options that set or confirm `target_workflow_id` / scope. |
| E2 | `workflow.toon` — variable `target_workflow_id` | Description says “For update mode” only; review mode also requires this variable. | Extend description to include review mode. |

## Convention Conformance Findings

| ID | Check | Result |
|----|--------|--------|
| C1 | File naming (`NN-name.toon` / `NN-name.md`) | Pass |
| C2 | Folder layout (`activities/`, `skills/`, `resources/`) | Pass |
| C3 | README.md at root and in subfolders | Pass |
| C4 | Semantic versions (`X.Y.Z`) | Pass |
| C5 | Modular workflow root (no inline activities) | Pass |

## Rule Enforcement Findings

| ID | Rule / principle | Assessment |
|----|------------------|------------|
| R1 | Workflow `rules[14]` (e.g. encode constraints as structure) | Largely **text-only** at workflow level; partial structural backing appears in later activities (checkpoints, conditions). Expected tradeoff; not unique to this workflow. |
| R2 | Cross-level duplication (anti-pattern 27) | **Medium:** Workflow rules overlap thematically with `skills/00-workflow-design.toon` `rules` (e.g. formal vs prose, modular layout, schema immutability). Consider single authoritative tier or explicit cross-references to reduce drift. |
| R3 | Design principles doc (`resources/00-design-principles.md`) — Principle 1 | **Low:** Enforcement cites `format-literacy` / `constructs-confirmed`; in **review mode** those checkpoints are skipped and execution jumps `context-and-literacy` → `quality-review`. Behavior is intentional per `04-review-mode-guide.md`; the principles doc could note the review-mode shortcut. |

## Anti-Pattern Findings

| AP # | Name | Location | Notes |
|------|------|----------|-------|
| 30 | Inaccurate tool return / param docs | `skills/00-workflow-design.toon` → `tools.get_skill` | Documents parameter `skill_id`. Server tool **`get_skill` takes `step_id`** (and requires `next_activity` first). |
| 32 | Inconsistent tool naming across skills | `skills/00-workflow-design.toon` vs cross-workflow `execute-activity` | Workflow-design skill uses `get_skill` with wrong params; global execute-activity protocol emphasizes **`get_skill` with `step_id`** — same name, but workflow-design’s param list is still wrong. Align param docs with `resource-tools.ts`. |
| — | Nonexistent tool | `skills/00-workflow-design.toon` → `tools.list_resources` | **`list_resources` is not implemented** in workflow-server (`src/`). Remove or replace with the actual discovery pattern (e.g. `get_workflow` + resource indices from skills). |

## Schema Validation Results

| File | Result |
|------|--------|
| `workflow.toon` | Pass (`loadWorkflow`) |
| All `activities/*.toon` | Pass |
| All `skills/*.toon` | Pass |

Command: `npx tsx scripts/validate-workflow-toon.ts workflows/workflow-design` — exit code 0.

## Tool–Skill–Doc Consistency Findings

| ID | Check | Result |
|----|--------|--------|
| T1 | `get_skill` accuracy | **Fail** — wrong parameters documented (see AP 30). |
| T2 | `list_resources` | **Fail** — tool not present in server implementation. |
| T3 | `get_workflow` / `next_activity` | Pass at high level; descriptions omit `session_token` (understandable for brevity). |
| T4 | `08-quality-review.toon` description | **Low** — Says “Four review passes”; review-mode guide describes **six** audit categories (adds validation + tool-skill-doc). Consider aligning wording. |

## Recommended Fixes (prioritized)

1. **High:** Update `skills/00-workflow-design.toon` `tools` section: fix `get_skill` params to `step_id` (and note session + `next_activity` prerequisite); remove or replace `list_resources`.
2. **High:** Add review-mode **scope confirmation checkpoint** in `01-intake.toon` so “confirm target workflow” is structurally enforced.
3. **Medium:** Resolve workflow vs skill **rule duplication** (keep one authoritative layer or add “see workflow rules” pointers).
4. **Medium:** Align `08-quality-review` activity description with review-mode audit passes (or explicitly say “four passes” applies only to create/update drafting path).
5. **Low:** Update `target_workflow_id` variable description for review mode; add review-mode footnote to `00-design-principles.md` Principle 1.

---

*Generated as part of Workflow Design Workflow — Review Mode (target: workflow-design).*
