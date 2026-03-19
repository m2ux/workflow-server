# Compliance Review: work-packages

**Date:** 2026-03-19
**Workflow:** work-packages v2.1.0 — Work Packages Workflow
**Files audited:** 9 (1 workflow.toon, 7 activities, 1 README.md)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 3 |
| Medium   | 3 |
| Low      | 3 |
| **Total findings** | **9** |

The work-packages workflow is structurally simpler than the other workflows (7 sequential activities, no workflow-specific skills, no resources). It functions as a planning coordinator that triggers the `work-package` workflow for each planned item. However, it has three high-severity issues: no declared variables despite referencing several in loops and context, checkpoint `transitionTo` placed at the wrong nesting level (silently stripped by validation), and loop `activities[]` referencing step IDs instead of activity IDs.

---

## Schema Validation Results

| File | Status |
|------|--------|
| All 7 activity .toon files | **Pass** (7/7) |
| workflow.toon | **Pass** |

All files pass TOON parsing and schema validation. However, validation success masks silent data loss — see E-1 and E-2 below.

---

## Schema Expressiveness Findings

### E-1: Checkpoint `transitionTo` at wrong nesting level — silently non-functional (High)

**Files:** `activities/03-analysis.toon`, `activities/04-package-planning.toon`
**Finding:** Checkpoint options place `transitionTo` directly on the option object:

```
options[2]:
  - id: proceed
    label: Context is correct, proceed
    transitionTo: package-planning
```

Per `CheckpointOptionSchema`, `transitionTo` must be inside an `effect` object:

```
options[2]:
  - id: proceed
    label: Context is correct, proceed
    effect:
      transitionTo: package-planning
```

Because `transitionTo` is at the wrong nesting level, Zod strips it as an unknown key during validation. The transition directives are silently lost — checkpoint options have no effects. The activity's default `transitions[]` are used instead, which happen to go to the same target, masking the bug.

**Impact:** Currently masked because default transitions match the intended `transitionTo` targets. Would become a functional bug if transition logic diverges.

**Recommended fix:** Move `transitionTo` inside `effect` objects on all affected checkpoint options.

### E-2: Loop `activities[]` references step IDs, not activity IDs (High)

**Files:** `activities/04-package-planning.toon`, `activities/07-implementation.toon`
**Finding:** Both loops reference step IDs in their `activities[]` field:

- `package-planning` loop: `activities: ["define-scope"]` — `define-scope` is a step in this activity, not a separate activity
- `implementation` loop: `activities: ["select-package"]` — `select-package` is a step in this activity, not a separate activity

The `LoopSchema.activities` field is described as "Activity IDs to execute in loop" — these should reference activity IDs (e.g., `package-planning`, `implementation`) or the field should be `steps` instead.

**Recommended fix:** Replace `activities[]` with `steps[]` referencing the step IDs to execute within each iteration, or restructure the loops to use the correct construct.

### E-3: User decision encoded as step description, not checkpoint (Medium)

**File:** `activities/03-analysis.toon`, step `determine-analysis-type`
**Finding:** The step says: *"Ask user: Is this continuing previous work or a new initiative?"* This is a user decision point expressed as prose. It should be a checkpoint with options (e.g., "Continuing previous work" / "New initiative") or a decision construct with conditions.

**Recommended fix:** Replace with a checkpoint or add a decision construct with branches for each analysis type.

### E-4: No variables declared (High)

**File:** `workflow.toon`
**Finding:** The workflow defines no `variables[]` section. However, activities reference variables throughout:
- Loops use `work_packages` and `remaining_packages` in `over` fields
- `context_to_preserve` references: `work_packages`, `remaining_packages`, `current_package`, `planning_folder_path`, `completed_packages`, `overall_progress`, `analysis_type`, `package_plans`, `dependency_map`, `priority_order`

These variables should be declared in the workflow's `variables[]` array with types and descriptions.

**Recommended fix:** Add a `variables[]` section to `workflow.toon` declaring all referenced variables.

---

## Convention Conformance Findings

| Convention | Status | Details |
|---|---|---|
| File naming `NN-name.toon` | **Pass** | All 7 activities follow convention |
| Folder structure | **Partial** | `activities/` exists; no `skills/` or `resources/` folders |
| Version format `X.Y.Z` | **Pass** | Workflow 2.1.0, activities 1.0.0–1.1.0 |
| README at root | **Pass** | Root README.md present |
| README in subfolders | **Fail** | No `activities/README.md` (see C-1) |
| Modular content | **Pass** | Workflow.toon is metadata-only |
| Checkpoint structure | **Partial** | Options lack `effect` wrappers (see E-1) |

### C-1: Missing subfolder READMEs (Medium)

**Finding:** No `activities/README.md`. Design principle 14 requires README.md at root and in each subfolder. The workflow has no `skills/` or `resources/` folders (since it uses only universal skills and has no resources), which is acceptable for a lightweight workflow. But the activities folder should have a README documenting the 7-activity sequence.

**Recommended fix:** Add `activities/README.md` with the activity sequence table.

### C-2: No workflow-specific skills (Medium)

**Finding:** All 7 activities use `workflow-execution` as their primary skill. No domain-specific skills are defined. This means:
- No protocol definitions for planning, analysis, or prioritization procedures
- No inputs/outputs declarations for activity data flow
- No tool specifications for what tools each activity needs
- No error handling for domain-specific failure modes

The workflow-execution universal skill is generic orchestration guidance. Activities like `package-planning`, `prioritization`, and `analysis` would benefit from dedicated skills with protocols.

**Recommended fix:** Create at least 2-3 workflow-specific skills: `plan-packages` (for package-planning), `prioritize-packages` (for prioritization), and `coordinate-implementation` (for implementation).

---

## Rule Enforcement Findings

| # | Rule | Violable? | Structural Enforcement | Rating |
|---|------|-----------|----------------------|--------|
| 1 | PREREQUISITE — read AGENTS.md | Yes | None | **Text-only** |
| 2 | Must not proceed past checkpoints | Yes | `blocking: true` on checkpoints | **Partially enforced** |
| 3 | Ask, don't assume | Yes | None | **Text-only** |
| 4 | User controls priorities | Yes | Priority checkpoint in prioritization | **Partially enforced** |
| 5 | Explicit approval | Yes | Blocking checkpoints | **Partially enforced** |

- **Activity-level rules:** 0 across all 7 activities
- No `artifactLocations` declared despite activities producing planning documents

---

## Anti-Pattern Findings

| AP # | Anti-Pattern | Match | File | Details |
|------|-------------|-------|------|---------|
| AP-9 | User interaction as prose | **Match** | 03-analysis.toon | "Ask user" in step without checkpoint (see E-3) |
| AP-13 | Implicit variables | **Match** | workflow.toon | 10+ variables referenced but undeclared (see E-4) |
| AP-16 | Skill inputs buried in description | **Match** | Multiple | No skills defined → no inputs declarations |
| AP-19 | Critical rules text-only | **Partial** | workflow.toon | Rules 1, 3 are text-only |

---

## Recommended Fixes

### Priority 1 — High (fix soon)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 1 | Checkpoint `transitionTo` at wrong level (E-1) | Move `transitionTo` inside `effect` object | `03-analysis.toon`, `04-package-planning.toon` |
| 2 | Loop `activities` references step IDs (E-2) | Change to `steps[]` or restructure | `04-package-planning.toon`, `07-implementation.toon` |
| 3 | No variables declared (E-4) | Add `variables[]` to workflow.toon | `workflow.toon` |

### Priority 2 — Medium (address in next update)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 4 | User decision as prose (E-3) | Add checkpoint or decision construct | `03-analysis.toon` |
| 5 | Missing activities/README.md (C-1) | Create README with activity sequence | `activities/README.md` |
| 6 | No workflow-specific skills (C-2) | Create domain-specific skills | `skills/` folder |

### Priority 3 — Low (optional)

| # | Finding | Fix | Files Affected |
|---|---------|-----|----------------|
| 7 | No resources | Add resource templates for planning docs | `resources/` folder |
| 8 | No `artifactLocations` | Declare planning artifact location | `workflow.toon` |
| 9 | All 5 rules text-only | Document as known limitation | — |

---

## Principle Compliance Summary

| # | Principle | Status |
|---|-----------|--------|
| 1 | Internalize Before Producing | N/A |
| 2 | Define Complete Scope Before Execution | **Partial** — activities defined but missing variables, skills, resources |
| 3 | One Question at a Time | **Pass** — checkpoints are atomic |
| 4 | Maximize Schema Expressiveness | **Fail** — checkpoint effects at wrong level, loops misuse activities field, user decision as prose, variables undeclared |
| 5 | Convention Over Invention | **Partial** — file naming correct but missing READMEs and subfolder structure |
| 6 | Never Modify Upward | **Pass** |
| 7 | Confirm Before Irreversible Changes | **Pass** — blocking checkpoints at all decisions |
| 8 | Corrections Must Persist | N/A |
| 9 | Modular Over Inline | **Pass** — all content in separate files |
| 10 | Encode Constraints as Structure | **Fail** — no variable declarations, no skill protocols, all rules text-only |
| 11 | Plan Before Acting | **Pass** — 5 planning activities precede implementation |
| 12 | Non-Destructive Updates | N/A |
| 13 | Format Literacy Before Content | **Pass** — all TOON files parse and validate |
