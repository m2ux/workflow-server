# Compliance Review: work-package

**Date:** 2026-03-19
**Workflow:** work-package v3.4.0 — Work Package Implementation Workflow
**Files audited:** 72 (1 workflow.toon, 14 activities, 24 skills, 27 resources, 5 READMEs, 1 REVIEW-MODE.md)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 4 |
| Low      | 4 |
| **Total findings** | **10** |

The work-package workflow is the most mature workflow in the repository — version 3.4.0 with 14 sequential activities, 42 variables, 24 skills, 27 resources, comprehensive checkpoint coverage, a review mode with 9 activity-level modeOverrides, and formal loops in multiple activities. All 14 activity files pass TOON parsing and schema validation. The findings are minor relative to the workflow's complexity: a resource index collision, a non-standard terminal transition sentinel, a few schema expressiveness gaps, and activity-level rules that are universally text-only.

---

## Schema Validation Results

| File | Status |
|------|--------|
| All 14 activity .toon files | **Pass** (14/14) |
| All 24 skill .toon files | **Pass** (loaded via API) |
| workflow.toon | **Pass** (loaded via API) |

No TOON parsing or schema validation failures.

---

## Schema Expressiveness Findings

### E-1: Iteration encoded in checkpoint prerequisite field (Medium)

**File:** `activities/09-post-impl-review.toon`, checkpoint `block-interview`
**Finding:** The `prerequisite` field contains: "Repeats for each entry in flagged_block_indices". This describes iteration — a loop construct — not a prerequisite condition. The checkpoint should be inside a `forEach` loop over `flagged_block_indices`.

**Recommended fix:** Add a `loop` with `type: forEach`, `variable: current_block`, `over: flagged_block_indices`, containing the block-interview checkpoint.

### E-2: User interaction in loop step without checkpoint (Medium)

**File:** `activities/14-codebase-comprehension.toon`, loop step `select-area`
**Finding:** The step description says "User selects which questions to investigate, or proposes new areas" — this implies user interaction but there is no corresponding checkpoint. User decision points should be expressed as checkpoints with options.

**Recommended fix:** Add a checkpoint inside the loop (e.g., `select-deep-dive-area`) before the `targeted-analysis` step.

### E-3: Conditional logic in step description instead of step condition (Low)

**File:** `activities/09-post-impl-review.toon`, step `architecture-summary`
**Finding:** The step description contains "Auto-decide whether an architecture summary is warranted" — conditional execution expressed as prose. Now that the schema supports step conditions (added in this session), this could be formalized.

**Recommended fix:** Add `condition: { type: simple, variable: skip_architecture_summary, operator: "!=", value: true }` to the step.

---

## Convention Conformance Findings

| Convention | Status | Details |
|---|---|---|
| File naming `NN-name.toon` | **Pass** | All 14 activities (01–14), 24 skills (00–23) follow convention |
| File naming `NN-name.md` | **Fail** | Resource index 19 collision (see C-1) |
| Folder structure | **Pass** | `activities/`, `skills/`, `resources/` present |
| Version format `X.Y.Z` | **Pass** | Workflow 3.4.0, activities use semantic versioning |
| README at root + subfolders | **Pass** | Root, activities/, skills/, resources/ READMEs present |
| Modes use `modes[]` construct | **Pass** | Review mode uses `activationVariable`, `skipActivities`, `recognition`, `resource` |
| Modular content | **Pass** | `workflow.toon` is metadata-only; all content in separate files |
| Checkpoint structure | **Pass** | All checkpoints have id, name, message, options with effects |
| Transition patterns | **Pass** | Sequential with `initialActivity` and transitions |

### C-1: Resource index collision at index 19 (High)

**Files:** `resources/19-architecture-summary.md` and `resources/19-pr-review-response.md`
**Finding:** Two resource files share index 19. The `list_workflow_resources` API returns both, but `get_resource` with `index: "19"` can only resolve to one. This means one of the two resources is unreachable via the standard API.

**Recommended fix:** Rename `19-pr-review-response.md` to `28-pr-review-response.md` (next available index) and update any skill references.

### C-2: `transitionOverride: "workflow-end"` is not a valid activity ID (High)

**File:** `activities/12-submit-for-review.toon`, review mode `modeOverrides`
**Finding:** The review mode's `transitionOverride` is set to `"workflow-end"`, which is not one of the 14 defined activity IDs. The transition schema requires `to` to be a string referencing an activity ID. `"workflow-end"` appears to be an informal sentinel for workflow termination, similar to the prism workflow's `to: null` issue.

**Recommended fix:** Either use the `complete` activity as the terminal target, or remove the `transitionOverride` and let the workflow terminate naturally when no transition matches.

### C-3: Checkpoint ID collision across activities (Low)

**Files:** `activities/04-research.toon` and `activities/05-implementation-analysis.toon`
**Finding:** Both activities define a checkpoint with ID `assumptions-review`. While checkpoint IDs are scoped to their activity, the collision can cause confusion in logging, state tracking, and debugging.

**Recommended fix:** Rename to `research-assumptions-review` and `analysis-assumptions-review` respectively.

---

## Rule Enforcement Findings

### Workflow-Level Rules (12 total)

| # | Rule | Violable? | Structural Enforcement | Rating |
|---|------|-----------|----------------------|--------|
| 1 | PREREQUISITE — read AGENTS.md | Yes | None | **Text-only** |
| 2 | Must not proceed past checkpoints without confirmation | Yes | `blocking: true` on checkpoints; checkpoint_pending protocol | **Partially enforced** |
| 3 | Ask, don't assume | Yes | None | **Text-only** |
| 4 | Summarize, then proceed | Yes | None | **Text-only** |
| 5 | One task at a time | Yes | `task-cycle` forEach loop in implement activity | **Partially enforced** |
| 6 | Explicit approval at checkpoints only | Yes | Blocking checkpoints at major decisions | **Partially enforced** |
| 7 | Decision points require user choice | Yes | Decisions + checkpoints with effect-wired options | **Partially enforced** |
| 8 | AUTOMATIC TRANSITION RULE | Yes | Transition table; validate_transition tool | **Partially enforced** |
| 9 | EXECUTION MODEL (orchestrator/worker) | Yes | Pattern declared; no runtime enforcement | **Text-only** |
| 10 | ORCHESTRATOR DISCIPLINE | Yes | None | **Text-only** |
| 11 | CHECKPOINT YIELD RULE (context field) | Yes | None | **Text-only** |
| 12 | README PROGRESS RULE | Yes | None | **Text-only** |

### Activity-Level Rules

- **Total across 14 activities:** 40 rules
- **Text-only:** 40 (100%)
- **Structurally enforced:** 0

All activity-level rules are procedural guidance (e.g., "load skill for protocol", "follow domain rules in skill"). None have dedicated structural enforcement mechanisms.

### R-1: README PROGRESS RULE lacks enforcement (Medium)

**File:** `workflow.toon`, rule 12
**Finding:** The rule requires the orchestrator to update the planning folder README.md after each activity — marking artifacts as complete, updating status. This is a critical traceability requirement with no structural enforcement. There is no exitAction, validate action, or checkpoint verifying that the README was updated before transitioning.

**Recommended fix:** Add an `exitAction` with `action: "validate"` on key activities that checks for README updates. Alternatively, add a `message` action as a reminder.

### R-2: CHECKPOINT YIELD RULE lacks enforcement (Medium)

**File:** `workflow.toon`, rule 11
**Finding:** When a checkpoint references generated content (analyses, findings, plans), the worker must include that content in the checkpoint yield's `context` field. Without this, the user sees a question without the content needed to answer it. This rule has no structural mechanism — the orchestrator cannot verify that context was included.

**Recommended fix:** This is inherently difficult to enforce structurally. Consider adding a `required_context` field to checkpoints that lists which artifacts or data must be included in the context.

---

## Anti-Pattern Findings

| AP # | Anti-Pattern | Match | File | Details |
|------|-------------|-------|------|---------|
| AP-5 | Checkpoint ID collision | **Partial** | 04-research, 05-implementation-analysis | Both use `assumptions-review` as checkpoint ID (see C-3) |
| AP-9 | User interaction as prose | **Match** | 14-codebase-comprehension | Loop step describes user selection without a checkpoint (see E-2) |
| AP-10 | Iteration as prose | **Match** | 09-post-impl-review | Checkpoint prerequisite describes iteration (see E-1) |
| AP-14 | Mode as rule text | **Pass** | — | Review mode correctly uses `modes[]` with `modeOverrides` |
| AP-19 | Critical rules text-only | **Partial** | workflow.toon | Rules 9-12 are critical behavioral constraints with text-only enforcement |
| AP-1 | Inline content | **Pass** | — | All content is modular |
| AP-12 | Artifacts buried in description | **Pass** | — | Activities declare artifacts where applicable |
| AP-13 | Implicit variables | **Pass** | — | 42 variables explicitly declared |
| AP-21 | TOON with JSON/YAML syntax | **Pass** | — | Correct TOON syntax across all files |

---

## Recommended Fixes

### Priority 1 — High (fix soon)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 1 | Resource index 19 collision (C-1) | Rename `19-pr-review-response.md` to `28-pr-review-response.md`; update skill references | `resources/19-pr-review-response.md`, referencing skills |
| 2 | `workflow-end` sentinel (C-2) | Replace with `complete` activity reference or remove transitionOverride | `activities/12-submit-for-review.toon` |

### Priority 2 — Medium (address in next update)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 3 | Iteration in checkpoint prerequisite (E-1) | Replace with forEach loop containing the checkpoint | `activities/09-post-impl-review.toon` |
| 4 | User interaction without checkpoint (E-2) | Add checkpoint inside comprehension loop | `activities/14-codebase-comprehension.toon` |
| 5 | README PROGRESS lacks enforcement (R-1) | Add exitAction validate on key activities | Multiple activity files |
| 6 | CHECKPOINT YIELD lacks enforcement (R-2) | Consider adding `required_context` to checkpoint schema | Schema + activity files |

### Priority 3 — Low (optional)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 7 | Conditional logic in step prose (E-3) | Add step `condition` using new schema field | `activities/09-post-impl-review.toon` |
| 8 | Checkpoint ID collision (C-3) | Rename to activity-scoped IDs | `activities/04-research.toon`, `activities/05-implementation-analysis.toon` |
| 9 | All 40 activity rules text-only | Document as known limitation | — |
| 10 | `validate` and `complete` have no checkpoints | Acceptable — validate is automated, complete is terminal | — |

---

## Principle Compliance Summary

| # | Principle | Status |
|---|-----------|--------|
| 1 | Internalize Before Producing | N/A |
| 2 | Define Complete Scope Before Execution | **Pass** — comprehensive file structure with 72 files |
| 3 | One Question at a Time | **Pass** — checkpoints are atomic across all activities |
| 4 | Maximize Schema Expressiveness | **Partial** — strong overall, gaps in E-1 (iteration as prose), E-2 (user interaction without checkpoint), E-3 (conditional prose) |
| 5 | Convention Over Invention | **Partial** — resource index collision (C-1), `workflow-end` sentinel (C-2) |
| 6 | Never Modify Upward | **Pass** |
| 7 | Confirm Before Irreversible Changes | **Pass** — blocking checkpoints at all major decisions |
| 8 | Corrections Must Persist | N/A |
| 9 | Modular Over Inline | **Pass** — exemplary modular structure |
| 10 | Encode Constraints as Structure | **Partial** — workflow rules are partially enforced via checkpoints, decisions, and loops; activity rules are universally text-only |
| 11 | Plan Before Acting | **Pass** — design-philosophy, implementation-analysis, and plan-prepare precede implementation |
| 12 | Non-Destructive Updates | N/A |
| 13 | Format Literacy Before Content | **Pass** — all TOON files pass parsing and validation |

---

## Fixes Applied

### Fix 1: Resource index 19 collision (C-1) — Resolved

**Root cause:** Two resource files shared index 19: `19-architecture-summary.md` and `19-pr-review-response.md`.

**Fix applied:** Renamed `19-pr-review-response.md` to `28-pr-review-response.md`. Updated the `respond-to-pr-review` skill (02-respond-to-pr-review.toon) to reference index "28" instead of "19" in both the protocol text and the resources[] array. Updated resources/README.md.

### Fix 2: `workflow-end` sentinel (C-2) — Resolved

**Root cause:** `submit-for-review` review mode used `transitionOverride: workflow-end`, which is not a valid activity ID.

**Fix applied:** Changed to `transitionOverride: complete`. The `complete` activity already has a review mode override that skips ADR/docs/finalize — making it the correct terminal path for review mode.

### Finding E-1 reclassified: iteration in checkpoint prerequisite — Schema limitation

The `block-interview` checkpoint's `prerequisite: "Repeats for each entry in flagged_block_indices"` describes loop semantics. However, the schema's `LoopSchema` only supports steps and activity references — not checkpoints. The `prerequisite` field (valid per `CheckpointSchema`) is the best available approximation. This is a schema limitation, not an authoring deficiency.

### Finding E-2 reclassified: user interaction in loop — Acceptable

The `select-area` step in the comprehension loop describes the worker presenting open questions. The user's decision is captured by the `comprehension-sufficient` checkpoint with options for "dive deeper", "explore a different area", or "sufficient". The interaction IS handled via the checkpoint mechanism.

### Post-Fix Validation

| Check | Result |
|-------|--------|
| Activity validation | 14/14 pass |
| Skill references | Index 28 resolves correctly |
| Transition target | `complete` is a valid activity ID with review modeOverride |
