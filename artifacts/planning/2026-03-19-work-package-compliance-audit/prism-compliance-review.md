# Compliance Review: prism

**Date:** 2026-03-19
**Workflow:** prism v1.6.0
**Files audited:** 15

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 5 |
| Medium   | 6 |
| Low      | 3 |
| Pass     | 15 (schema validation) |

The prism workflow is structurally mature — all 15 files parse cleanly, activities and skills follow naming conventions, and the core flow (select-mode → structural-pass → adversarial/behavioral/report → deliver-result) is properly wired with transitions and conditions. However, there are two critical gaps where the schema's formal constructs are not used for the workflow's most important invariants: (1) three steps in the structural-pass loop lack `condition` fields for mode routing despite sibling steps having them, and (2) the isolation model — the core invariant of the entire workflow — relies entirely on prose rules with no structural enforcement. Five high-severity findings cover unused `modes[]` construct, undeclared variables, undeclared artifacts, and text-only enforcement of critical behavioral constraints.

---

## Schema Expressiveness Findings

### Critical

#### SE-01: Missing step conditions in 01-structural-pass loop (Anti-pattern #11)

**File:** `activities/01-structural-pass.toon`
**Location:** Loop `unit-cycle`, steps `load-lens`, `execute-lens`, `write-structural-artifact`

These three steps describe mode-conditional execution in prose:

> "Runs for single and full-prism pipeline modes only — skip for portfolio and behavioral units."

But they lack `condition` fields. The six sibling steps in the same loop (`select-portfolio-lenses`, `execute-portfolio`, `write-portfolio-artifacts`, `dispatch-behavioral-lenses`, `collect-behavioral-paths`, `report-unit-paths`) all have proper `condition` fields or execute unconditionally by design. This inconsistency means mode routing for single/full-prism units is text-enforced while portfolio/behavioral routing is structurally enforced.

**Expected fix:** Add `condition` fields to all three steps:

```
condition:
  type: or
  conditions[2]:
    - type: simple
      variable: current_unit.pipeline_mode
      operator: "=="
      value: single
    - type: simple
      variable: current_unit.pipeline_mode
      operator: "=="
      value: full-prism
```

#### SE-02: Workflow modes not using `modes[]` construct (Anti-pattern #14)

**File:** `workflow.toon`

The workflow description states: *"Supports four modes: single-pass L12, 3-pass Full Prism, multi-lens portfolio analysis, and 4+1 behavioral pipeline."* The schema provides a purpose-built `modes[]` construct with `id`, `name`, `activationVariable`, `skipActivities`, and `skipSteps` — designed exactly for this pattern. Instead, mode routing is implemented via the `pipeline_mode` string variable, step conditions, and transition conditions.

This is not a functional defect (the variable + conditions approach works), but it bypasses the schema's self-documenting mode construct. An agent inspecting `modes[]` would instantly understand the workflow's operational variants; with the current approach, mode behavior must be reconstructed from scattered conditions and prose rules.

### High

#### SE-03: Undeclared variable `gitnexus_available`

**File:** `activities/01-structural-pass.toon`, step `check-gitnexus`

> "Set a gitnexus_available flag for the current unit."

This flag is used by step descriptions to indicate GitNexus availability but is not declared in `workflow.toon`'s `variables[]`. All workflow state should be declared.

#### SE-04: Missing artifact declarations for portfolio and behavioral modes

**File:** `activities/01-structural-pass.toon`

The `artifacts[]` array declares only `structural-analysis` (for single/full-prism modes). The following artifacts produced by the same activity are not declared:

- `portfolio-{lens-name}.md` (portfolio mode, per-lens output)
- `portfolio-synthesis.md` (portfolio mode, cross-lens synthesis)
- `behavioral-errors.md`, `behavioral-costs.md`, `behavioral-changes.md`, `behavioral-promises.md` (behavioral mode)

Step descriptions reference these artifact paths in detail (anti-pattern #12), but the `artifacts[]` field is the formal mechanism.

#### SE-05: Step `apply-plan` uses prose instead of step actions

**File:** `activities/00-select-mode.toon`, step `apply-plan`

> "After checkpoint confirmation, apply the selected pipeline_mode and any lens selections to workflow state variables."

This describes variable assignment which maps to step `actions[]` with action type `set`. The schema's action system (`set`, `validate`, `log`, `emit`) exists precisely to express lifecycle behavior formally.

#### SE-06: Undeclared variable `unit_output_dir`

**Files:** `activities/01-structural-pass.toon`, `activities/02-adversarial-pass.toon`, `activities/03-synthesis-pass.toon`, `activities/05-behavioral-synthesis-pass.toon`

Multiple step descriptions reference `{unit_output_dir}` as a resolved path (e.g., "Write the analysis to {unit_output_dir}/structural-analysis.md"). This variable is computed in step `resolve-unit-output` but never declared in `workflow.toon`'s `variables[]`. While it may be intended as a transient step output, the workflow's variable model doesn't distinguish declared from derived state.

#### SE-07: Checkpoint prerequisite is prose, not a formal condition

**File:** `activities/00-select-mode.toon`, checkpoint `confirm-mode`

The `prerequisite` field contains:

> "Only present when pipeline_mode was NOT explicitly provided by the caller. If the caller set pipeline_mode directly, skip this checkpoint."

This is a prose description of a condition that could be expressed as:

```
condition:
  type: simple
  variable: pipeline_mode
  operator: notExists
```

The `prerequisite` field is a schema-defined free-text field, so this is technically valid TOON. But the condition could also be encoded in the formal condition system for machine-interpretable evaluation.

### Medium

#### SE-08: Formatting and voice rules in generate-report and deliver-result are text-only

**Files:** `activities/07-generate-report.toon` (6 rules), `activities/04-deliver-result.toon` (3 rules)

Nine rules govern output formatting (methodology stripping, finding voice, hyperlink formats, anchor generation, severity inheritance, traceability, multi-unit consolidation, core finding promotion, count accuracy). These are inherently difficult to encode structurally since they constrain prose output quality. Flagged for awareness — these are the expected text-only rules in a well-designed workflow.

#### SE-09: Loops in three activities lack `maxIterations`

**Files:** `activities/02-adversarial-pass.toon`, `activities/03-synthesis-pass.toon`, `activities/05-behavioral-synthesis-pass.toon`

The `unit-cycle` loop in `01-structural-pass.toon` sets `maxIterations: 100`. The analogous loops in the adversarial, synthesis, and behavioral-synthesis activities omit this field. While the `forEach` loop type is bounded by the collection size, `maxIterations` serves as a safety bound and its inconsistent application suggests an oversight.

### Low

#### SE-10: Redundant prose in conditioned steps

**Files:** `activities/02-adversarial-pass.toon`, `activities/03-synthesis-pass.toon`, `activities/05-behavioral-synthesis-pass.toon`

Steps that have `condition` fields also describe the same condition in their `description` text (e.g., "Skip this unit if current_unit.pipeline_mode is not 'full-prism'"). This is harmless duplication — the condition is structurally enforced — but violates DRY and creates a maintenance risk if conditions change without updating descriptions.

#### SE-11: `unit_output_subdir` referenced implicitly

**File:** `activities/01-structural-pass.toon`

Artifact name patterns reference `{unit_output_subdir}` (e.g., `"{unit_output_subdir}structural-analysis.md"`). This is a property of `current_unit` objects built by the plan-analysis skill, not a standalone variable. The implicit reference is understandable but not self-documenting.

---

## Convention Conformance Findings

| Convention | Status | Notes |
|---|---|---|
| Activity file naming (NN-name.toon) | **PASS** | All 8 activities follow the pattern |
| Skill file naming (NN-name.toon) | **PASS** | All 7 skills follow the pattern |
| Resource file naming (NN-name.md) | **PASS** | All 49 resources follow the pattern |
| Folder structure (activities/, skills/, resources/) | **PASS** | All three subdirectories present |
| Semantic versioning (X.Y.Z) | **PASS** | All 15 files use valid semver |
| initialActivity set | **PASS** | `initialActivity: select-mode` |
| Sequential transitions | **PASS** | All activities define transitions or are terminal |
| No inline activities | **PASS** | workflow.toon references activities by ID only |
| Checkpoint structure | **PASS** | Single checkpoint has id, name, message, options with effects |
| Skill structure (id, version, capability, protocol) | **PASS** | All 7 skills have required fields |
| Activity numbering continuity | **MEDIUM** | Gap: 05 → 07 (no activity 06) |

### CF-01: Activity numbering gap

**Files:** `activities/` directory

Activity files are numbered 00 through 07 but 06 is missing. This suggests a deleted or renamed activity. While not a functional issue, sequential numbering gaps can confuse agents or tools that assume contiguous numbering.

---

## Rule Enforcement Findings

### Workflow-Level Rules (12 rules)

| # | Rule (abbreviated) | Enforcement | Severity |
|---|---|---|---|
| 1 | ISOLATION MODEL — fresh sub-agent per pass | **Text-only** | Critical |
| 2 | EXECUTION MODEL — orchestrator with disposable workers | **Text-only** | High |
| 3 | ORCHESTRATOR DISCIPLINE — orchestrator must not analyze | **Text-only** | High |
| 4 | AUTOMATIC TRANSITIONS — no user confirmation between passes | **Partial** — no checkpoints defined after select-mode | Medium |
| 5 | OUTPUT FORWARDING — verbatim pass output, no summarization | **Text-only** | High |
| 6 | LENS LOADING — workers load via get_resource | **Partial** — skills declare resources[] and tools | Medium |
| 7 | MINIMAL INTERACTION — at most one checkpoint | **Partial** — only one checkpoint is defined structurally | Medium |
| 8 | WORKER PERMISSIONS — full read/write | **Text-only** | Medium |
| 9 | NO PERMISSION QUESTIONS — no deferral to user | **Text-only** | Medium |
| 10 | OPERATIONAL DIRECTIVES — explicit section in worker prompts | **Text-only** | Medium |
| 11 | BLOCKER SURFACING — structured blocker format | **Text-only** | Low |
| 12 | ARTIFACT VERIFICATION — report path, size, status | **Text-only** | Medium |

### Activity-Level Rules (17 rules across 5 activities)

| Activity | Rule (abbreviated) | Enforcement |
|---|---|---|
| 01-structural-pass | MODE ROUTING — which steps run per mode | **Text-only** (3 steps lack conditions) |
| 01-structural-pass | LENS LOADING — resource 00, portfolio per skill | **Text-only** |
| 01-structural-pass | PARALLEL BEHAVIORAL — up to 4 concurrent | **Text-only** (no parallel construct) |
| 02-adversarial-pass | Fresh context isolation | **Text-only** |
| 02-adversarial-pass | Must load adversarial lens | **Text-only** |
| 03-synthesis-pass | Must load synthesis lens | **Text-only** |
| 04-deliver-result | Finding ID hyperlinks | **Text-only** |
| 04-deliver-result | Artifact path hyperlinks | **Text-only** |
| 04-deliver-result | Anchor generation | **Text-only** |
| 05-behavioral-synthesis | Must load behavioral synthesis lens | **Text-only** |
| 05-behavioral-synthesis | Label prior artifacts | **Text-only** |
| 07-generate-report | Methodology stripping | **Text-only** |
| 07-generate-report | Finding voice | **Text-only** |
| 07-generate-report | Severity inheritance | **Text-only** |
| 07-generate-report | Core finding promotion | **Text-only** |
| 07-generate-report | Traceability requirement | **Text-only** |
| 07-generate-report | Multi-unit consolidation | **Text-only** |

**Summary:** Of 29 total rules, 22 are text-only, 4 are partially enforced by structural absence (no extra checkpoints, resources declared), and 3 are structurally redundant with conditions. The workflow's most critical invariant (isolation model) and most complex routing logic (mode routing) are entirely text-enforced.

---

## Anti-Pattern Findings

| # | Anti-Pattern | Status | Location | Severity |
|---|---|---|---|---|
| 1 | Inline content in parent files | **Clear** | — | — |
| 2 | Schema modification to match content | **Clear** | — | — |
| 3 | Partial implementations | **Clear** | — | — |
| 4 | New naming conventions without precedent | **Clear** | — | — |
| 5 | Skip/combine checkpoints | **Clear** | — | — |
| 6 | Assumption-based execution | **Clear** | — | — |
| 7 | No scope re-verification | **Clear** | — | — |
| 8 | Multiple questions per message | **Clear** | — | — |
| 9 | "Ask the user" as prose instead of checkpoint | **Clear** | — | — |
| 10 | "Repeat for each" as prose instead of loop | **Clear** | — | — |
| 11 | "If X then Y" as prose instead of condition | **MATCH** | 01-structural-pass: steps `load-lens`, `execute-lens`, `write-structural-artifact` | Critical |
| 12 | Artifact in description, not artifacts[] | **MATCH** | 01-structural-pass: portfolio/behavioral artifacts undeclared | High |
| 13 | Implicit variable, not variables[] | **MATCH** | 01-structural-pass: `gitnexus_available` undeclared; `unit_output_dir` undeclared | High |
| 14 | Mode as rule instead of modes[] | **MATCH** | workflow.toon: 4 modes exist but `modes[]` not used | High |
| 15 | Prose instead of protocol | **Clear** | — | — |
| 16 | Input in description, not inputs[] | **Clear** | — | — |
| 17 | Starting without presenting approach | **Clear** | — | — |
| 18 | Analysis without action | **Clear** | — | — |
| 19 | Critical constraints as text-only rules | **MATCH** | workflow.toon: ISOLATION MODEL, EXECUTION MODEL, ORCHESTRATOR DISCIPLINE | Critical |
| 20 | Content-reducing README updates | **N/A** | — | — |
| 21 | TOON with JSON/YAML syntax | **Clear** | — | — |
| 22 | Work outside defined activities | **Clear** | — | — |
| 23 | Defending output when corrected | **N/A** | — | — |

**Summary:** 5 anti-patterns matched out of 23 checked. 18 clear, 2 not applicable. The matched anti-patterns cluster around the structural-pass activity and workflow-level mode/rule design.

---

## Schema Validation Results

| File | Result |
|---|---|
| `workflow.toon` | **PASS** |
| `activities/00-select-mode.toon` | **PASS** |
| `activities/01-structural-pass.toon` | **PASS** |
| `activities/02-adversarial-pass.toon` | **PASS** |
| `activities/03-synthesis-pass.toon` | **PASS** |
| `activities/04-deliver-result.toon` | **PASS** |
| `activities/05-behavioral-synthesis-pass.toon` | **PASS** |
| `activities/07-generate-report.toon` | **PASS** |
| `skills/00-structural-analysis.toon` | **PASS** |
| `skills/01-full-prism.toon` | **PASS** |
| `skills/02-portfolio-analysis.toon` | **PASS** |
| `skills/03-plan-analysis.toon` | **PASS** |
| `skills/04-orchestrate-prism.toon` | **PASS** |
| `skills/05-behavioral-pipeline.toon` | **PASS** |
| `skills/06-generate-report.toon` | **PASS** |

All 15 files parsed successfully with `@toon-format/toon` decoder.

---

## Recommended Fixes

Prioritized by severity and effort:

### Priority 1 — Critical (structural correctness)

1. **Add step conditions to `load-lens`, `execute-lens`, `write-structural-artifact`** in `01-structural-pass.toon`. Use an `or` condition matching `current_unit.pipeline_mode == "single"` or `current_unit.pipeline_mode == "full-prism"`. This aligns these steps with the 6 sibling steps that already have conditions. *Estimated effort: small.*

2. **Evaluate `modes[]` adoption** for the 4 pipeline modes. Define `modes[]` in `workflow.toon` with `activationVariable: pipeline_mode` and map each mode to its `skipActivities` (e.g., single mode skips adversarial-pass, synthesis-pass, behavioral-synthesis-pass). This makes mode behavior inspectable without reading step conditions. *Estimated effort: medium — requires mapping all mode-dependent behavior.*

### Priority 2 — High (completeness)

3. **Declare `gitnexus_available`** as a boolean variable in `workflow.toon`'s `variables[]` with `defaultValue: false`.

4. **Declare all artifact variants** in `01-structural-pass.toon`'s `artifacts[]`: add entries for portfolio per-lens artifacts, portfolio-synthesis, and the 4 behavioral artifacts. Use `condition` to associate each with its pipeline mode.

5. **Add step `actions`** to `apply-plan` in `00-select-mode.toon` to structurally encode the variable assignments performed after checkpoint confirmation.

6. **Declare `unit_output_dir`** in `workflow.toon`'s `variables[]` as a derived string variable.

### Priority 3 — Medium (consistency)

7. **Add `maxIterations: 100`** to the forEach loops in `02-adversarial-pass.toon`, `03-synthesis-pass.toon`, and `05-behavioral-synthesis-pass.toon` for consistency with `01-structural-pass.toon`.

8. **Renumber or document the activity gap** (05 → 07). Either introduce a placeholder explanation or renumber `07-generate-report.toon` to `06-generate-report.toon`.

9. **Convert checkpoint prerequisite** in `00-select-mode.toon` from prose to a formal condition on the `pipeline_mode` variable (e.g., `operator: notExists`).

### Priority 4 — Low (cleanup)

10. **Remove redundant prose** from step descriptions in activities where the `condition` field already encodes the same logic (02, 03, 05).
