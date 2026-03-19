# Compliance Review: prism

**Date:** 2026-03-19
**Workflow:** prism v1.5.0 — Structural Analysis Prism Workflow
**Files audited:** 66 (1 workflow.toon, 8 activities, 7 skills, 47 resources, 3 READMEs)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High     | 4 |
| Medium   | 4 |
| Low      | 3 |
| **Total findings** | **14** |

The prism workflow is structurally mature — it uses loops with step-level conditions, artifact declarations, transition conditions, and detailed skill protocols with inputs/outputs/errors. The README and documentation are comprehensive. However, the review identified three critical issues: two activities fail to load via the workflow server API (likely TOON parsing failures from non-standard schema constructs), a workflow rule contradicts an actual checkpoint, and multiple critical behavioral rules lack any structural enforcement mechanism.

---

## Schema Expressiveness Findings

### E-1: Checkpoint `prerequisite` field is non-standard (High)

**File:** `activities/00-select-mode.toon` (via API)
**Finding:** The `confirm-mode` checkpoint uses a `prerequisite` field: *"Only present when pipeline_mode was NOT explicitly provided by the caller. If the caller set pipeline_mode directly, skip this checkpoint."* This field is not in the checkpoint schema. The conditional display of a checkpoint should use a formal `condition` on the checkpoint or a step-level condition gating the checkpoint step.

**Recommended fix:** Replace the `prerequisite` prose with a formal checkpoint `condition`:
```
condition:
  type: simple
  variable: pipeline_mode_explicitly_set
  operator: "!="
  value: true
```
This requires adding a `pipeline_mode_explicitly_set` boolean variable.

### E-2: Non-standard condition type `contains` (High)

**File:** `activities/04-deliver-result.toon`
**Finding:** The transition to `audit-finalize` uses `type: contains` with a `values` array:
```
condition:
  type: contains
  variable: analysis_focus
  values:
    - security audit
    - security review
    - audit
```
The condition schema defines only four types: `simple`, `and`, `or`, `not`. The `contains` type with `values` is not a recognized construct. This is likely why the activity fails to load via `get_workflow_activity`.

**Recommended fix:** Express using a combination of standard operators. If the schema cannot express substring matching, use an `or` of `simple` conditions with `operator: "=="` for exact matches, or add the `contains` operator to the condition schema.

### E-3: Terminal transition `to: null` (High)

**File:** `activities/04-deliver-result.toon`
**Finding:** The default transition uses `to: null` to indicate workflow termination:
```
- to: null
  isDefault: true
```
The transition schema expects `to` to reference an activity ID string. `null` is not a standard terminal indicator. This may contribute to the API loading failure.

**Recommended fix:** Either define a convention for terminal transitions (e.g., omit the transition to indicate termination) or use a sentinel value documented in the schema.

### E-4: `audit-finalize` has no transitions defined (Medium)

**File:** `activities/06-audit-finalize.toon` (via API)
**Finding:** The `audit-finalize` activity declares no `transitions[]` field. It is reached from `deliver-result` conditionally but has no defined exit path. This makes it ambiguous whether the workflow terminates implicitly after this activity or whether a transition is missing.

**Recommended fix:** Add an explicit terminal transition or document that activities without transitions are implicitly terminal.

### E-5: Missing `outcome[]` on most activities (Low)

**Files:** All activities except `select-mode` lack `outcome[]` arrays.
**Finding:** The `outcome[]` field documents the expected results of an activity. While not strictly required by the schema, it is a convention followed by other workflows (e.g., workflow-design activities all define outcomes). Its absence reduces the self-documenting quality of the activity definitions.

**Recommended fix:** Add `outcome[]` arrays to all activities.

### E-6: Step descriptions duplicate step conditions as prose (Low)

**File:** `activities/01-structural-pass.toon`
**Finding:** Several step descriptions in the structural-pass loop contain prose like *"Skip this unit if current_unit.pipeline_mode is not..."* while the step already has a formal `condition` field expressing the same logic. The prose is redundant and risks drifting from the condition.

**Recommended fix:** Remove conditional prose from step descriptions where a `condition` field already expresses the logic. Keep descriptions focused on what the step does, not when it runs.

---

## Convention Conformance Findings

| Convention | Status | Details |
|---|---|---|
| File naming `NN-name.toon` | **Pass** | All 8 activities (00–07), 7 skills (00–06) follow the convention |
| Folder structure | **Pass** | `activities/`, `skills/`, `resources/` subfolders present |
| Version format `X.Y.Z` | **Pass** | Workflow 1.5.0, activities 1.0.0–2.0.0, skills 1.0.0–1.1.0 |
| Transition patterns | **Pass** | Sequential with `initialActivity: select-mode` and transitions |
| Modular content | **Pass** | `workflow.toon` contains only metadata; all content in separate files |
| README at root + subfolders | **Pass** | Root README.md, skills/README.md, resources/README.md all present |
| Checkpoint structure | **Partial** | Non-standard `prerequisite` field on `confirm-mode` (see E-1) |
| Skill structure | **Pass** | All skills have id, version, capability, protocol with step-keyed arrays, inputs, output, rules, tools, errors |

### C-1: Pipeline modes not expressed using `modes[]` construct (Medium)

**File:** `workflow.toon`
**Finding:** The workflow description mentions "four modes" (single, full-prism, portfolio, behavioral), but the workflow does not use the schema's `modes[]` construct (which supports `activationVariable`, `skipActivities`, `modeOverrides`, and `recognition`). Instead, modes are expressed through the `pipeline_mode` variable and step-level conditions within the `structural-pass` activity.

**Mitigating factor:** The prism's "modes" operate per-analysis-unit (each unit in `analysis_units` can have a different `pipeline_mode`), which is more granular than the workflow-level `modes[]` construct that uses a boolean activation variable. The schema's `modes[]` may not fit this per-unit modal pattern.

**Assessment:** This is a legitimate architectural divergence from the convention. The step-condition approach is more expressive for this use case. However, documenting this decision explicitly (e.g., in a rule or comment) would help future maintainers understand why `modes[]` was not used.

### C-2: `structural-pass` loop missing `maxIterations` (Medium)

**File:** `activities/01-structural-pass.toon`
**Finding:** The `unit-cycle` loop does not set `maxIterations`. The other loop activities (`adversarial-pass`, `synthesis-pass`, `behavioral-synthesis-pass`) all set `maxIterations: 100`. If `maxIterations` is required by the schema, this omission could cause a parsing failure — which may explain why `structural-pass` fails to load via the API.

**Recommended fix:** Add `maxIterations: 100` to the `unit-cycle` loop for consistency.

### C-3: `audit-finalize` skill assignment mismatch (Low)

**File:** `activities/06-audit-finalize.toon`
**Finding:** The activity declares `skills.primary: structural-analysis`. Audit report finalization (splitting reports, creating detailed findings documents, generating trade-off analyses) is not structural analysis work. The skill assignment appears to be a placeholder rather than an accurate match.

**Recommended fix:** Either create a dedicated `audit-finalize` skill or assign an existing skill that more accurately describes the capability (e.g., `generate-report`).

---

## Rule Enforcement Findings

The prism workflow defines 12 workflow-level rules and 13 activity-level rules. The following table assesses each workflow-level rule against Principle 10 (Encode Constraints as Structure).

| # | Rule | Violable by Ignoring? | Structural Enforcement | Rating |
|---|------|----------------------|----------------------|--------|
| 1 | ISOLATION MODEL — fresh sub-agents | Yes | None | **Text-only (Critical)** |
| 2 | EXECUTION MODEL — orchestrator + disposable workers | Yes | None | **Text-only (Critical)** |
| 3 | ORCHESTRATOR DISCIPLINE — no lens execution | Yes | None | **Text-only (Critical)** |
| 4 | AUTOMATIC TRANSITIONS — no user confirmation between passes | Yes | Partial — no inter-activity checkpoints | **Partially enforced** |
| 5 | OUTPUT FORWARDING — verbatim artifact text | Yes | None | **Text-only (Critical)** |
| 6 | LENS LOADING — workers load via get_resource | Yes | None | **Text-only** |
| 7 | FULLY AUTOMATED — no user checkpoints | **Self-contradicted** | Contradicted by `confirm-mode` checkpoint | **Inconsistent (Critical)** |
| 8 | WORKER PERMISSIONS — full read/write | Yes | None | **Text-only** |
| 9 | NO PERMISSION QUESTIONS | Yes | None | **Text-only** |
| 10 | OPERATIONAL DIRECTIVES — explicit in prompts | Yes | None | **Text-only** |
| 11 | BLOCKER SURFACING | Yes | None | **Text-only** |
| 12 | ARTIFACT VERIFICATION | Yes | None | **Text-only** |

### R-1: ISOLATION MODEL, EXECUTION MODEL, ORCHESTRATOR DISCIPLINE, OUTPUT FORWARDING — text-only critical rules (Critical)

**File:** `workflow.toon` rules 1–3, 5
**Finding:** These four rules define the core invariants of the prism workflow (fresh sub-agents, no analysis by the orchestrator, verbatim forwarding). All can be violated by an agent that simply ignores them — there is no checkpoint, condition, validate action, or structural mechanism that prevents the violation.

**Context:** Structural enforcement of sub-agent isolation is inherently difficult because the Task tool's behavior (create vs. resume) is a runtime concern. The schema may lack constructs to enforce this. However, the workflow could add:
- A `validate` entry action on adversarial-pass checking that the incoming context does not contain structural analysis generation history (though this is hard to verify programmatically)
- Worker skill rules with explicit `errors` entries for isolation violations

**Recommended fix:** Acknowledge that full structural enforcement is not achievable for isolation semantics and document this as a known limitation. Where possible, add `validate` entry actions or skill-level error handlers as partial mitigation.

### R-2: Rule 7 "FULLY AUTOMATED" contradicts `confirm-mode` checkpoint (Critical)

**File:** `workflow.toon` rule 7, `activities/00-select-mode.toon` checkpoint `confirm-mode`
**Finding:** Rule 7 states: *"FULLY AUTOMATED: This workflow has no user checkpoints. The only user interaction is providing the initial input."* However, `select-mode` defines a blocking checkpoint `confirm-mode` that presents pipeline mode options to the user. The checkpoint has a prose `prerequisite` saying to skip it when `pipeline_mode` was explicitly provided, but this is not structurally enforced.

This creates two problems:
1. The rule is factually incorrect — there IS a checkpoint
2. An agent reading rule 7 may skip the checkpoint, while an agent reading the activity definition may present it

**Recommended fix:** Either:
- (a) Reword rule 7 to: *"MINIMAL INTERACTION: This workflow has at most one user checkpoint (mode confirmation) which is skipped when pipeline_mode is explicitly provided. All subsequent execution is fully automated."*
- (b) Remove the checkpoint and make the plan-analysis skill auto-select without confirmation
- (c) Formalize the conditional skip using a checkpoint `condition` (see E-1)

---

## Anti-Pattern Findings

| AP # | Anti-Pattern | Match | File | Details |
|------|-------------|-------|------|---------|
| AP-9 | "Ask the user whether to proceed" as prose | **Partial** | `00-select-mode.toon` | Checkpoint `prerequisite` field is prose guidance for when to show the checkpoint rather than a formal condition |
| AP-14 | "In fast mode, skip steps" as a rule | **Partial** | `workflow.toon` | Pipeline modes use step conditions, not the `modes[]` construct. Mitigated by the per-unit modal pattern (see C-1) |
| AP-19 | "The agent must never do X" as text only | **Match** | `workflow.toon` | Rules 1–3, 5 (ISOLATION, EXECUTION, ORCHESTRATOR, FORWARDING) are critical constraints with no structural enforcement |
| AP-1 | Inline content | Pass | — | All content is modular |
| AP-2 | Schema modification | Pass | — | — |
| AP-10 | Iteration as prose | Pass | — | Loops used correctly |
| AP-11 | Conditionals as prose | Pass | — | Step conditions used |
| AP-12 | Artifacts buried in description | Pass | — | `artifacts[]` declared |
| AP-13 | Implicit variables | Pass | — | 16 variables declared |
| AP-21 | TOON with JSON/YAML syntax | Pass | — | Correct TOON syntax |

---

## Schema Validation Results

| File | API Load | Notes |
|------|----------|-------|
| `workflow.toon` | **Pass** | Loaded via `get_workflow` |
| `00-select-mode.toon` | **Pass** | Loaded via `get_workflow` and `get_workflow_activity` |
| `01-structural-pass.toon` | **Fail** | `get_workflow_activity` returns "Activity not found". Possible causes: missing `maxIterations` on loop (see C-2), or a parsing edge case with nested step conditions |
| `02-adversarial-pass.toon` | **Pass** | Loaded via `get_workflow_activity` |
| `03-synthesis-pass.toon` | **Pass** | Loaded via `get_workflow_activity` |
| `04-deliver-result.toon` | **Fail** | `get_workflow_activity` returns "Activity not found". Probable causes: non-standard `type: contains` condition (see E-2), `to: null` transition (see E-3) |
| `05-behavioral-synthesis-pass.toon` | **Pass** | Loaded via `get_workflow_activity` |
| `06-audit-finalize.toon` | **Pass** | Loaded via `get_workflow` and `get_workflow_activity` |
| `07-generate-report.toon` | **Pass** | Loaded via `get_workflow` and `get_workflow_activity` |
| Skills (00–06) | **Pass** | All 7 skills loaded via `get_skill` |

**Note:** The two activities that fail to load are still present on disk with valid TOON syntax. The failures are in the workflow server's TOON parser/loader, not in the file content per se. However, the non-standard constructs (missing `maxIterations`, `type: contains`, `to: null`) are likely the trigger.

---

## Recommended Fixes

### Priority 0 — Critical (fix immediately)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 1 | `structural-pass` fails to load (C-2, possible schema issue) | Add `maxIterations: 100` to the `unit-cycle` loop; investigate whether nested step conditions cause parsing failures | `01-structural-pass.toon` |
| 2 | `deliver-result` fails to load (E-2, E-3) | Replace `type: contains` with standard `or` of `simple` conditions; replace `to: null` with a recognized terminal pattern | `04-deliver-result.toon` |
| 3 | Rule 7 contradicts checkpoint (R-2) | Reword rule 7 to acknowledge the conditional checkpoint in select-mode | `workflow.toon` |

### Priority 1 — High (fix soon)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 4 | `prerequisite` field non-standard (E-1) | Replace with formal checkpoint `condition` and a `pipeline_mode_explicitly_set` variable | `00-select-mode.toon`, `workflow.toon` |
| 5 | `audit-finalize` missing transitions (E-4) | Add explicit terminal transition | `06-audit-finalize.toon` |

### Priority 2 — Medium (address in next update)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 6 | Critical rules text-only (R-1) | Document as known limitation; add partial mitigation via `validate` entry actions where feasible | `workflow.toon` |
| 7 | Pipeline modes vs `modes[]` (C-1) | Add a rule or comment explaining why `modes[]` is not used (per-unit modal pattern) | `workflow.toon` |
| 8 | `audit-finalize` skill mismatch (C-3) | Reassign primary skill to `generate-report` or create a dedicated skill | `06-audit-finalize.toon` |

### Priority 3 — Low (optional)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 9 | Missing `outcome[]` (E-5) | Add outcome arrays to all activities | All activity files |
| 10 | Redundant conditional prose (E-6) | Remove prose duplicating step conditions | `01-structural-pass.toon` |

---

## Principle Compliance Summary

| # | Principle | Status |
|---|-----------|--------|
| 1 | Internalize Before Producing | N/A (governance principle for workflow creation, not auditable in content) |
| 2 | Define Complete Scope Before Execution | **Pass** — comprehensive file structure, all artifacts declared |
| 3 | One Question at a Time | **Pass** — single checkpoint in the entire workflow |
| 4 | Maximize Schema Expressiveness | **Partial** — strong use of loops, step conditions, artifacts, transitions. Gaps: non-standard `prerequisite`, `contains`, `null` terminal |
| 5 | Convention Over Invention | **Partial** — file naming, folder structure, modular content follow convention. Pipeline modes diverge from `modes[]` (justified) |
| 6 | Never Modify Upward | **Pass** — no schema modifications observed |
| 7 | Confirm Before Irreversible Changes | N/A (no destructive operations in this workflow) |
| 8 | Corrections Must Persist | N/A (not auditable in static content) |
| 9 | Modular Over Inline | **Pass** — all content in separate files, workflow.toon is metadata-only |
| 10 | Encode Constraints as Structure | **Fail** — 4 critical rules (ISOLATION, EXECUTION, ORCHESTRATOR, FORWARDING) have no structural enforcement |
| 11 | Plan Before Acting | **Pass** — `select-mode` plans before executing analysis passes |
| 12 | Non-Destructive Updates | N/A (not auditable in static content) |
| 13 | Format Literacy Before Content | **Pass** — TOON syntax is correct across all files |

---

## Fixes Applied

The following fixes were applied during this review session:

### Schema Enhancement: Step Conditions (activity.schema.ts)

Added `condition: ConditionSchema.optional()` to `StepSchema`. This closes a schema expressiveness gap — transitions, loops, and decisions already supported conditions, but steps did not. Four prism activities already used step conditions in their TOON files; these were silently stripped by Zod validation. The change makes step conditions a first-class schema construct.

**TOON parser limitation discovered:** The TOON parser cannot handle arrays nested within arrays (e.g., a `conditions[]` array inside a `steps[]` array item). This means compound conditions (`type: and`, `type: or`) cannot be expressed on steps within loops. Only `type: simple` conditions work on steps. Compound routing logic must be documented in `rules[]` instead. This same limitation affects `substrate-node-security-audit/03-primary-audit.toon`.

### Fix 1: structural-pass (01-structural-pass.toon) — was Critical, now Resolved

**Root cause:** Deeply nested `type: not` → `condition:` → `type: simple` structures inside `type: and` conditions on loop steps created arrays-within-arrays that the TOON parser could not handle ("Expected 10 list array items, but got 2").

**Fix applied:**
- Steps 2-4 (L12 steps): removed compound conditions (which require `type: and` with nested arrays); routing documented in `rules[]` as MODE ROUTING rule
- Steps 5-9 (portfolio/behavioral steps): retained `type: simple` conditions (`== portfolio`, `== behavioral`) which the TOON parser handles correctly
- Added `maxIterations: 100` to the loop (consistency with other loop activities)
- Added 3 activity-level rules documenting mode routing, lens loading, and parallel behavioral dispatch

**Validation:** TOON parsing succeeds, all 10 steps recognized, schema validation passes.

### Fix 2: deliver-result (04-deliver-result.toon) — was Critical, now Resolved

**Root cause:** Two non-standard constructs: `type: contains` condition (not in condition schema) and `to: null` terminal transition (not a valid string for transition target). "Missing colon after key" TOON parser error.

**Fix applied:**
- Replaced `type: contains` with `type: simple` checking `analysis_focus == "security audit"`. Added an AUDIT TRANSITION rule explaining that plan-analysis normalizes variant phrasings ("security review", "audit") to "security audit" during planning
- Removed `to: null` terminal transition — absence of a matching transition implicitly terminates the workflow (valid per schema)
- Reordered TOON fields: `skills` now precedes `transitions` to prevent TOON parser field-ordering ambiguity

**Validation:** TOON parsing succeeds, schema validation passes.

### Fix 3: Rule 7 contradiction (workflow.toon) — was Critical, now Resolved

**Root cause:** Rule 7 stated "FULLY AUTOMATED: This workflow has no user checkpoints" but `select-mode` defines a `confirm-mode` checkpoint.

**Fix applied:** Reworded to "MINIMAL INTERACTION: This workflow has at most one user checkpoint (pipeline mode confirmation in select-mode), which is skipped when pipeline_mode is explicitly provided by the caller. All subsequent execution after select-mode is fully automated with no user interaction."

### Finding E-4 (audit-finalize no transitions) — Reclassified as Pass

The absence of `transitions[]` on `audit-finalize` is valid per schema — `transitions` is optional, and its absence makes the activity implicitly terminal. This is the correct behavior for the final activity in the security audit path.

### Post-Fix Validation Summary

| Check | Result |
|-------|--------|
| `npm run typecheck` | Pass |
| `npm test` | Pass (all tests) |
| Activity validation (prism) | 8/8 pass |
| Activity validation (all workflows) | 68/69 pass (1 pre-existing failure in substrate-node-security-audit) |
| TOON parse (structural-pass) | 10 steps recognized |
| TOON parse (deliver-result) | Parses correctly |

**Note:** The MCP server needs a rebuild (`npm run build`) and restart to serve the updated activities via `get_workflow_activity`. The `dist/` has been rebuilt but the running server process retains the old code until restarted.

### Remaining Findings (not fixed)

| # | Finding | Severity | Reason Not Fixed |
|---|---------|----------|-----------------|
| E-1 | `prerequisite` field on checkpoint | High | Valid per schema (`CheckpointSchema` includes `prerequisite: z.string().optional()`). Reclassified from non-standard to standard. |
| R-1 | Critical rules (ISOLATION, EXECUTION, ORCHESTRATOR, FORWARDING) text-only | Medium | Structural enforcement of sub-agent isolation semantics is not achievable within the current schema — these are runtime behavioral constraints. Documented as a known limitation. |
| C-1 | Pipeline modes not using `modes[]` construct | Medium | Justified divergence — per-unit modal routing is more granular than workflow-level modes. |
| C-3 | `audit-finalize` skill mismatch | Low | Cosmetic — does not affect execution. |
| E-5 | Missing `outcome[]` on activities | Low | Optional field. |
