# Compliance Review: prism-audit

**Date:** 2026-03-19
**Workflow:** prism-audit v1.0.0
**Files audited:** 7

| File | Type |
|------|------|
| `workflows/prism-audit/workflow.toon` | Workflow |
| `workflows/prism-audit/activities/00-scope-definition.toon` | Activity |
| `workflows/prism-audit/activities/01-prompt-generation.toon` | Activity |
| `workflows/prism-audit/activities/02-execute-analysis.toon` | Activity |
| `workflows/prism-audit/activities/03-audit-finalize.toon` | Activity |
| `workflows/prism-audit/activities/04-deliver-audit.toon` | Activity |
| `workflows/prism-audit/skills/00-compose-audit-prompt.toon` | Skill |

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 3 |
| Medium   | 4 |
| Low      | 2 |
| Pass     | 5 |

The prism-audit workflow is structurally sound — all 7 files parse correctly, file naming and versioning conventions are met, and the modular layout (no inline activities) is clean. The primary compliance gaps are in **schema expressiveness**: conditional logic, variable assignments, and error-recovery user prompts are encoded as prose descriptions rather than formal schema constructs. One **critical** finding exists: the TRIGGER ISOLATION constraint (preventing prism's built-in audit-finalize from firing) relies entirely on a text rule with no structural guard.

---

## Schema Expressiveness Findings

### C-01 — TRIGGER ISOLATION value constraint is text-only [Critical]

**Files:** `workflow.toon` (rule 3), `02-execute-analysis.toon` (rule 1)

The workflow's most critical behavioral constraint — that `analysis_focus` must NOT be set to the literal string `"security audit"` when triggering prism — is enforced only by a text rule. Violation causes prism's built-in `audit-finalize` activity to activate, duplicating the post-processing that `03-audit-finalize.toon` performs.

No schema construct prevents this: there is no value constraint, validation action, or condition that would reject the forbidden value. An agent can violate this rule by simply ignoring it.

**Construct gap:** The schema lacks a "variable value constraint" (e.g., `variables[].disallowedValues` or an `entryAction` with `validate` on the triggered workflow's input). This is a schema-level gap, not just a workflow authoring gap.

---

### H-01 — Checkpoint `adjust` option missing effect [High]

**File:** `00-scope-definition.toon`, checkpoint `confirm-scope`

The `adjust` option (line 38–39) has `id`, `label`, and `description` but no `effect` field. When the user selects "Adjust scope", no structural mechanism defines what happens — no `transitionTo` back to `collect-inputs`, no `setVariable` to record the choice. The agent must interpret the prose description and improvise.

The `accept` option is similarly missing an explicit effect, though the default transition (`to: prompt-generation`) covers the happy path. The `adjust` case has no fallback.

```
options[2]:
  - id: accept
    label: Proceed
    description: "Begin analysing the codebase and generating the audit prompt"
    # MISSING: effect: { transitionTo: prompt-generation }
  - id: adjust
    label: Adjust scope
    description: "Modify the target, description, or output path before proceeding"
    # MISSING: effect: { transitionTo: scope-definition }  (or loop-back mechanism)
```

---

### H-02 — Conditional logic as prose instead of step conditions [High]

5 instances across 4 files use "If X then Y" in step descriptions where a formal `condition` construct should be used.

| File | Step | Prose Pattern | Recommended Construct |
|------|------|---------------|----------------------|
| `00-scope-definition.toon` | `collect-inputs` | "If output_path is not specified, derive it..." | `condition: { type: "simple", variable: "output_path", operator: "notExists" }` with an actions block |
| `00-scope-definition.toon` | `index-codebase` | "If indexing fails... log a warning and continue" | Error handling via decision or step condition |
| `01-prompt-generation.toon` | `map-trust-boundaries` | "If GitNexus is available..." | `condition: { type: "simple", variable: "gitnexus_available", operator: "equals", value: true }` |
| `02-execute-analysis.toon` | `verify-completion` (loop) | "If verification fails, record the failure..." | Decision with branches for success/failure |
| `03-audit-finalize.toon` | `enrich-findings-with-graph` | "If GitNexus is available..." | Same as `map-trust-boundaries` — step condition on `gitnexus_available` |

The GitNexus availability check appears 3 times across files. A workflow-level variable `gitnexus_available` exists implicitly but is never declared in `variables[]`, compounding the issue (see M-02).

---

### H-03 — "Ask the user" in error recovery prose instead of checkpoint [High]

**File:** `00-compose-audit-prompt.toon`, errors section

```
no_security_characteristics:
    cause: "No security-relevant patterns found in the codebase"
    recovery: "Report this finding and ask the user whether to proceed with a generic structural analysis instead."
```

The recovery path describes a user decision point ("ask the user whether to proceed") but encodes it as prose in the skill's `errors` block rather than a checkpoint construct. This is anti-pattern #9. The decision (proceed with generic analysis vs. abort) should be a checkpoint in the calling activity (`01-prompt-generation.toon`) with options and effects.

---

### M-01 — Variable assignments in prose instead of step actions [Medium]

3 step descriptions mention setting workflow variables in prose rather than using the `actions` field with `set` action type.

| File | Step | Prose |
|------|------|-------|
| `01-prompt-generation.toon` | `write-prompt-artifact` | "Set audit_prompt to the prompt text and audit_prompt_path to the written file path" |
| `02-execute-analysis.toon` | `collect-results` (loop) | "Append to completed_analyses and all_analysis_artifact_paths" |
| `03-audit-finalize.toon` | `verify-artifacts` | "Set audit_report_path, detailed_findings_path, and trade_offs_path" |

These should use `actions: [{ action: "set", variable: "audit_prompt", value: "..." }]` or equivalent step actions.

---

### M-02 — Implied variable `gitnexus_available` not declared [Medium]

**Files:** `01-prompt-generation.toon`, `02-execute-analysis.toon`, `03-audit-finalize.toon`, `00-compose-audit-prompt.toon`

The variable `gitnexus_available` is referenced in conditional prose across 4 files and appears in the skill protocol (`map-trust-boundaries` step: "Record: ... gitnexus_available (boolean)"). However, it is never declared in `workflow.toon`'s `variables[]`. This variable should be declared as:

```
- name: gitnexus_available
  type: boolean
  description: "Whether GitNexus has indexed the target codebase"
  defaultValue: false
```

---

### M-03 — Checkpoint confirmation state not tracked as variable [Medium]

**File:** `00-scope-definition.toon`

The `confirm-scope` checkpoint captures a user decision (accept/adjust) but the result is not recorded in a workflow variable via a `setVariable` effect. If any downstream logic needs to know whether the scope was adjusted, there is no state to query. Recommended: add `effect: { setVariable: { scope_confirmed: true } }` to the `accept` option and track scope revision count.

---

### M-04 — No `outcome[]` defined on any activity [Medium]

All 5 activities lack `outcome[]` fields. The schema provides this construct to declare expected results, enabling the orchestrator to verify activity completion against defined criteria rather than relying on implicit success.

| Activity | Recommended Outcome |
|----------|-------------------|
| `scope-definition` | "Audit scope confirmed with validated target path and output directory" |
| `prompt-generation` | "Audit prompt written to audit_prompt_path with audit_scopes populated" |
| `execute-analysis` | "All audit scopes triggered and completed with results in completed_analyses" |
| `audit-finalize` | "Three audit deliverables written and cross-validated" |
| `deliver-audit` | "Audit results presented to user with all artifact paths reported" |

---

### L-01 — No entry/exit actions used [Low]

No activity uses `entryActions[]` or `exitActions[]`. Several lifecycle events would benefit from formal actions:

- `entryAction: validate` on `execute-analysis` to verify `audit_scopes` is non-empty before starting the loop
- `exitAction: log` on each activity for execution tracing
- `exitAction: validate` on `audit-finalize` to verify all three artifacts exist before transitioning to delivery

---

### L-02 — High text-only rule ratio [Low]

15 of 21 total rules (71%) across the workflow and its activities rely on text-only enforcement. See the Rule Enforcement Findings section for the full breakdown. While many of these are quality/process rules that are inherently difficult to enforce structurally, the ratio indicates opportunities for structural hardening.

---

## Convention Conformance Findings

| Convention | Status | Notes |
|------------|--------|-------|
| File naming: activities as `NN-name.toon` | **Pass** | All 5 activities follow `00-` through `04-` pattern |
| File naming: skills as `NN-name.toon` | **Pass** | `00-compose-audit-prompt.toon` |
| File naming: resources as `NN-name.md` | **N/A** | No resources present (see folder structure) |
| Folder structure: `activities/` present | **Pass** | |
| Folder structure: `skills/` present | **Pass** | |
| Folder structure: `resources/` present | **Fail** | No `resources/` subfolder exists. If no resources are needed, this is a minor gap. |
| Version format: X.Y.Z semantic versioning | **Pass** | All 7 files use `1.0.0` |
| Transition patterns: `initialActivity` + per-activity transitions | **Pass** | `initialActivity: scope-definition`; all non-terminal activities have `transitions[]` |
| Checkpoint structure: id, name, message, options with effects | **Partial** | Checkpoint has id, name, message, options — but options lack `effect` fields (see H-01) |
| Skill structure: id, version, capability; step-keyed protocol | **Pass** | Skill has all required fields; protocol uses step-keyed arrays |
| Modular content: no inline activities | **Pass** | `workflow.toon` references activities by ID only |

---

## Rule Enforcement Findings

### Workflow-level rules (8 rules)

| # | Rule (summary) | Enforcement | Notes |
|---|----------------|-------------|-------|
| 1 | EXECUTION MODEL — orchestrator/worker pattern | **Text-only** | No schema construct enforces delegation |
| 2 | ORCHESTRATOR DISCIPLINE — orchestrator must not do substantive work | **Text-only** | Agent could inline analysis |
| 3 | TRIGGER ISOLATION — analysis_focus must not be "security audit" | **Text-only** ⚠️ | **Critical** — violation causes duplicate audit-finalize |
| 4 | AUTOMATIC TRANSITIONS — dispatch next activity without user confirmation | **Partially structural** | `isDefault: true` transitions exist; but nothing prevents an agent from adding confirmation |
| 5 | PROMPT GENERATION — describes prompt-generation activity | **N/A** | Descriptive, not a constraint |
| 6 | MULTI-SCOPE SUPPORT — audit_scopes array drives iteration | **Structurally enforced** | `forEach` loop over `audit_scopes` in `02-execute-analysis.toon` |
| 7 | WORKER PERMISSIONS — full read/write | **Text-only** | No permission model in schema |
| 8 | ARTIFACT VERIFICATION — report path, size, validation | **Text-only** | Could be an `exitAction` with `validate` |

### Activity: 01-prompt-generation (4 rules)

| # | Rule (summary) | Enforcement |
|---|----------------|-------------|
| 1 | EVIDENCE-BASED DOMAINS — domains grounded in observed code | **Text-only** |
| 2 | RISK CALIBRATION — risk reflects exposure and blast radius | **Text-only** |
| 3 | PROMPT COMPLETENESS — self-contained prompt | **Text-only** |
| 4 | USER FOCUS INTEGRATION — audit_description reflected in prompt | **Text-only** |

### Activity: 02-execute-analysis (3 rules)

| # | Rule (summary) | Enforcement |
|---|----------------|-------------|
| 1 | TRIGGER ISOLATION (duplicate of workflow rule 3) | **Text-only** ⚠️ |
| 2 | PIPELINE MODE SELECTION — defaults to full-prism | **Partially structural** — `defaultValue: full-prism` in `variables[]` |
| 3 | SEQUENTIAL EXECUTION — one prism run at a time | **Partially structural** — `forEach` loop implies sequence |

### Activity: 03-audit-finalize (6 rules)

| # | Rule (summary) | Enforcement |
|---|----------------|-------------|
| 1 | REPORT SPLIT — REPORT.md is input | **N/A** — descriptive |
| 2 | DETAILED FINDING FORMAT — 5+1 fields per finding | **Text-only** |
| 3 | SEVERITY RUBRIC — Impact × Feasibility computation | **Text-only** |
| 4 | TRADE-OFF ANALYSIS REQUIREMENTS — falsifiable constraints | **Text-only** |
| 5 | REMEDIATION IMPACT COLUMN — Impact column in priority tables | **Text-only** |
| 6 | MULTI-SCOPE CONSOLIDATION — deduplicate across scopes | **Text-only** |

### Summary

| Enforcement Type | Count | Percentage |
|------------------|-------|------------|
| Text-only | 15 | 71% |
| Partially structural | 3 | 14% |
| Structurally enforced | 1 | 5% |
| N/A (descriptive) | 2 | 10% |

---

## Anti-Pattern Findings

| # | Anti-Pattern | Status | Location |
|---|-------------|--------|----------|
| 1 | Inline content in parent files | **Pass** | `workflow.toon` has no inline activities |
| 2 | Schema modification to match content | **Pass** | No evidence |
| 3 | Partial implementations | **Pass** | All activities and skill are complete |
| 4 | New naming conventions without precedent | **Pass** | Standard `NN-name.toon` throughout |
| 5 | Skip/combine checkpoints | **Pass** | Single checkpoint is appropriate for this workflow |
| 6 | Assumption-based execution | **Pass** | `scope-definition` collects required inputs |
| 7 | No scope re-verification | **Partial** | `adjust` option exists but has no structural loop-back effect (see H-01) |
| 8 | Multiple questions per message | **Pass** | Single checkpoint message |
| 9 | "Ask the user" as prose instead of checkpoint | **Match** | `00-compose-audit-prompt.toon` errors.no_security_characteristics.recovery: "ask the user whether to proceed" (see H-03) |
| 10 | "Repeat for each" as prose instead of loop | **Pass** | `execute-analysis` properly uses `forEach` loop |
| 11 | "If X then Y" as prose instead of decision/condition | **Match** | 5 instances across 4 files (see H-02) |
| 12 | Artifact in description instead of `artifacts[]` | **Pass** | All producible artifacts declared in `artifacts[]` |
| 13 | Implicit variable tracking instead of `variables[]` | **Match** | `gitnexus_available` used in 4 files but not declared (see M-02); checkpoint state not tracked (see M-03) |
| 14 | "In fast mode, skip steps" as rule instead of mode | **Pass** | No mode-related skipping |
| 15 | "First do X, then Y" as prose instead of protocol | **Pass** | Skill uses step-keyed protocol arrays |
| 16 | Skill input buried in description instead of `inputs[]` | **Pass** | Skill has proper `inputs[]` |
| 17 | Starting implementation without presenting approach | **Pass** | Scope confirmation checkpoint exists |
| 18 | Analysis without action | **Pass** | Post-processing and delivery activities present |
| 19 | Critical constraints as text-only rules | **Match** | TRIGGER ISOLATION (C-01), ORCHESTRATOR DISCIPLINE, SEVERITY RUBRIC |
| 20 | Content-reducing README updates without audit | **Pass** | N/A |
| 21 | Writing TOON with JSON/YAML syntax | **Pass** | All files use TOON syntax |
| 22 | Work outside defined activities | **Pass** | All work scoped to activities |
| 23 | Defending output when corrected | **Pass** | N/A (runtime behavior) |

**Anti-pattern match summary:** 4 matches, 1 partial, 18 passes

---

## Schema Validation Results

| File | Result |
|------|--------|
| `workflows/prism-audit/workflow.toon` | **Pass** |
| `workflows/prism-audit/activities/00-scope-definition.toon` | **Pass** |
| `workflows/prism-audit/activities/01-prompt-generation.toon` | **Pass** |
| `workflows/prism-audit/activities/02-execute-analysis.toon` | **Pass** |
| `workflows/prism-audit/activities/03-audit-finalize.toon` | **Pass** |
| `workflows/prism-audit/activities/04-deliver-audit.toon` | **Pass** |
| `workflows/prism-audit/skills/00-compose-audit-prompt.toon` | **Pass** |

All 7 files parse successfully via `@toon-format/toon` decoder.

---

## Recommended Fixes

Prioritised by severity and impact.

### Priority 1 — Critical

| # | Finding | Fix |
|---|---------|-----|
| 1 | **C-01:** TRIGGER ISOLATION is text-only | Add `entryAction: validate` on `02-execute-analysis.toon` that checks `analysis_focus` does not equal `"security audit"`. Alternatively, add a `condition` on the trigger step that validates the value. This is the single highest-risk gap in the workflow. |

### Priority 2 — High

| # | Finding | Fix |
|---|---------|-----|
| 2 | **H-01:** Checkpoint options missing effects | Add `effect: { transitionTo: prompt-generation }` to the `accept` option and a loop-back mechanism (e.g., `effect: { transitionTo: scope-definition }` or a dedicated adjustment loop) to the `adjust` option. |
| 3 | **H-02:** Conditional logic as prose (5 instances) | Add `condition` fields to the 5 affected steps. For the 3 GitNexus checks, declare `gitnexus_available` as a variable and use `condition: { type: "simple", variable: "gitnexus_available", operator: "equals", value: true }`. |
| 4 | **H-03:** "Ask the user" in error recovery | Add a checkpoint to `01-prompt-generation.toon` for the no-security-characteristics case, with options: "Proceed with generic analysis" / "Abort audit". |

### Priority 3 — Medium

| # | Finding | Fix |
|---|---------|-----|
| 5 | **M-02:** `gitnexus_available` not declared | Add to `workflow.toon` `variables[]`: `{ name: gitnexus_available, type: boolean, description: "...", defaultValue: false }`. |
| 6 | **M-01:** Variable assignments in prose | Add `actions` fields with `set` action type to the 3 affected steps. |
| 7 | **M-03:** Checkpoint state not tracked | Add `setVariable` effects to checkpoint options. |
| 8 | **M-04:** No `outcome[]` on activities | Add `outcome[]` to each activity defining expected completion criteria. |

### Priority 4 — Low

| # | Finding | Fix |
|---|---------|-----|
| 9 | **L-01:** No entry/exit actions | Add `entryAction: validate` and `exitAction: log` where appropriate (particularly on `execute-analysis` and `audit-finalize`). |
| 10 | **L-02:** Text-only rule ratio (71%) | Review each text-only rule for structural alternatives. Some (e.g., quality rules like EVIDENCE-BASED DOMAINS) are inherently text-only; others (e.g., ARTIFACT VERIFICATION) can be converted to `exitAction: validate`. |
| 11 | **Conv:** Missing `resources/` subfolder | Create `workflows/prism-audit/resources/` if resources are planned; otherwise document that none are needed. |
