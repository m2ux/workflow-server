# Compliance Review: prism

**Date:** 2026-03-22
**Workflow:** prism v2.0.0
**Files audited:** 92 (13 activities, 13 skills, 62 resources, 4 other)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 3 |
| Medium   | 4 |
| Low      | 2 |
| Pass     | 14 principles, 20 anti-patterns |

The prism workflow v2.0.0 update adds 6 new pipeline modes with correct structural patterns (activities, skills, resources, transitions). The new `select-mode` elicitation flow is well-gated. Three high-severity issues require attention: a stale workflow description, a stale interaction rule, and documentation not updated to reflect the v2.0.0 changes.

---

## Schema Expressiveness Findings

### E-01 (Medium): Conditional logic as prose in `dispute-pass` step `select-prism-pair`

**File:** `activities/07-dispute-pass.toon`, step `select-prism-pair`
**Issue:** The step description contains conditional branching — "If target_type is 'code', select l12... If target_type is 'general', select l12_universal..." — that should use a `decision` construct with branches and conditions.
**Schema construct:** `decisions[].branches[]` with `condition.type: simple, variable: target_type`
**Recommendation:** Replace the prose step with a decision that has two branches (code → l12+identity, general → l12_universal+claim), each setting prism_a and prism_b via `setVariable` effects.

### E-02 (Medium): Conditional steps without formal conditions in `smart-pass`

**File:** `activities/11-smart-pass.toon`, steps `fill-knowledge` and `run-dispute`
**Issue:** Both steps have `required: false` and describe their skip conditions in prose ("Skip if no questions extracted", "Skip if analysis output is insufficient"). The schema provides `steps[].condition` for this. The `adaptive-pass` activity correctly uses conditions on its steps — `smart-pass` should follow the same pattern.
**Recommendation:** Add `condition` fields: `fill-knowledge` → condition on questions extracted (variable check), `run-dispute` → condition on analysis output length.

### E-03 (Medium): Iteration as prose in `subsystem-pass`

**File:** `activities/08-subsystem-pass.toon`, step `execute-per-subsystem`
**Issue:** The step description says "For each subsystem, create a FRESH worker with the assigned prism resource" — this is iteration that should be a `loop` construct with `type: forEach, variable: current_subsystem, over: subsystem_assignments`.
**Recommendation:** Convert the step into a `loops[]` entry with per-iteration steps.

### E-04 (Medium): Missing artifact declaration for elicited prompt

**File:** `activities/00-select-mode.toon`
**Issue:** The `elicit-goals` step writes `analysis-prompt.md` to the planning folder but the activity has no `artifacts[]` declaration for this file.
**Recommendation:** Add an artifact entry: `{ id: analysis-prompt, name: "analysis-prompt.md", location: planning, description: "..." }`.

---

## Convention Conformance Findings

| Convention | Status | Notes |
|---|---|---|
| File naming (NN-name.toon) | Pass | All 12 new files follow convention |
| Folder structure | Pass | activities/, skills/, resources/ present |
| Version format (X.Y.Z) | Pass | All versions are semver |
| Field ordering | Pass | Consistent with existing prism files |
| Transition patterns | Pass | All conditional transitions before default |
| Checkpoint structure | Pass | confirm-prompt has id, name, message, options with effects |
| Skill structure | Pass | All new skills have id, version, capability, protocol, rules |
| Modular content | Pass | No inline content in workflow.toon |

---

## Rule Enforcement Findings

### R-01 (High): Rule "MINIMAL INTERACTION" is stale

**File:** `workflow.toon`, rule 7
**Current text:** "This workflow has at most one user checkpoint (pipeline mode confirmation in select-mode)"
**Actual state:** `select-mode` now has TWO checkpoints: `confirm-prompt` (gated on `prompt_was_elicited`) and `confirm-mode` (gated on `pipeline_mode notExists`). The rule text is incorrect.
**Recommendation:** Update to: "This workflow has at most two user checkpoints in select-mode: prompt review (when the prompt was elicited) and pipeline mode confirmation (when pipeline_mode is not pre-set). Both are conditional — callers providing analysis_prompt and/or pipeline_mode bypass all checkpoints. All execution after select-mode is fully automated."

### R-02 (Text-only): Isolation model rule lacks structural enforcement

**File:** `workflow.toon`, rule 1
**Rule:** "Each analytical pass MUST be dispatched to a FRESH sub-agent (do NOT use Task resume)"
**Enforcement:** Text-only. No `validate` action or condition prevents an agent from using Task `resume`. This is a pre-existing issue and the most critical rule in the workflow.
**Note:** Structural enforcement is difficult here since the constraint is about how the agent invokes the Task tool, not a variable state. Accepted as text-only.

---

## Anti-Pattern Findings

### AP-11 (Medium): Conditional logic as prose (anti-pattern #11)

Matches E-01 and E-02 above. `dispute-pass` and `smart-pass` encode conditional branching in step descriptions instead of using `decision` or `condition` constructs.

---

## Content Integrity Findings

### C-01 (High): Stale workflow description

**File:** `workflow.toon`, line 4
**Issue:** The description says "adaptive depth escalation (error resilience -> optimization -> evolution -> API surface -> synthesis)" which incorrectly describes the behavioral pipeline, not adaptive depth escalation. This is a copy-paste error from the original description.
**Recommendation:** Replace the parenthetical with "(SDL → L12 → full-prism based on signal quality)".

### C-02 (High): Documentation not updated for v2.0.0 changes

**Files:** `prism/README.md`, `prism/skills/README.md`, `prism/resources/README.md`
**Issue:** These files still reflect the pre-v2.0.0 state. They are missing:
- 6 new pipeline modes in the modes table, prompt guide, and file structure
- 6 new activities (07-12) in the activity table
- 6 new skills (07-12) in the skills table
- 3 new resources (62-64) in the resource catalog
- The elicitation flow in the workflow overview
- Updated variable count (29)
**Recommendation:** Update all three READMEs to reflect the complete v2.0.0 state.

---

## Schema Validation Results

| File | Status | Notes |
|---|---|---|
| workflow.toon | Pass | Valid TOON, variables[29] count correct |
| 00-select-mode.toon | Pass | steps[5], checkpoints[2], transitions[7] counts correct |
| 07-dispute-pass.toon | Pass | Valid structure |
| 08-subsystem-pass.toon | Pass* | *Iteration should be a loop construct (E-03) |
| 09-verified-pass.toon | Pass | Valid structure |
| 10-reflect-pass.toon | Pass | Valid structure |
| 11-smart-pass.toon | Pass* | *Steps should have conditions (E-02) |
| 12-adaptive-pass.toon | Pass | Conditions correctly used on steps |
| 07-12 skills | Pass | All valid TOON |
| 62-64 resources | Pass | Valid markdown with YAML frontmatter |

---

## Recommended Fixes (by priority)

| # | Severity | Fix | Files |
|---|---|---|---|
| 1 | High | Fix stale workflow description (C-01) | workflow.toon |
| 2 | High | Update MINIMAL INTERACTION rule text (R-01) | workflow.toon |
| 3 | High | Update all READMEs for v2.0.0 (C-02) | README.md, skills/README.md, resources/README.md |
| 4 | Medium | Add decision construct for prism pair selection (E-01) | 07-dispute-pass.toon |
| 5 | Medium | Add step conditions for conditional steps (E-02) | 11-smart-pass.toon |
| 6 | Medium | Convert iteration to loop construct (E-03) | 08-subsystem-pass.toon |
| 7 | Medium | Add artifact declaration for analysis-prompt.md (E-04) | 00-select-mode.toon |
