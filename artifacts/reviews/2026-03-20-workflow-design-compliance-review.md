# Compliance Review: workflow-design

**Date:** 2026-03-20
**Workflow:** workflow-design v1.1.0
**Files audited:** 20 (1 workflow, 9 activities, 2 skills, 5 resources, 4 READMEs)
**Schema validation:** 12/12 TOON files pass

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 2 |
| Medium   | 4 |
| Low      | 3 |
| **Total** | **10** |

Anti-pattern scan: 1 violation (AP #12), 1 partial (AP #19).
Design principles: 11/13 compliant, 1 partially compliant (P8), 1 not structurally enforceable (P2 behavioral).

---

## Critical Findings

### F1. Impact-analysis activity is unreachable (orphaned)

**Files:** `workflow.toon`, `05-impact-analysis.toon`
**Principle:** P2 (Define Complete Scope), P7 (Confirm Before Irreversible Changes)

No activity in the transition chain routes to `impact-analysis`. The transitions are:

```
intake → context-and-literacy → requirements-refinement → pattern-analysis → scope-and-structure → ...
```

In update mode, `pattern-analysis` is in `skipActivities`, so the engine follows `requirements-refinement` → skip `pattern-analysis` → `scope-and-structure`. The `impact-analysis` activity defines a transition FROM itself (`to: scope-and-structure`) but nothing ever transitions TO it.

**Impact:** In update mode, the entire content preservation and integrity checking pipeline (5 steps, 2 checkpoints) is bypassed. Principle 7 is structurally unenforceable.

**Fix:** Add a conditional transition from `requirements-refinement` to `impact-analysis` when `is_update_mode == true`, making `impact-analysis` the default path in update mode and `pattern-analysis` the path otherwise.

---

## High Findings

### F2. Missing `artifacts[]` declaration for compliance report

**Files:** `08-quality-review.toon`, `09-validate-and-commit.toon`
**Principle:** P4 (Maximize Schema Expressiveness)
**Anti-pattern:** #12 ("This produces a report" buried in description)

The compliance report produced in review mode is described only in step prose. It should use the `artifacts[]` field with proper `id`, `name`, `location`, and `action` values.

**Fix:** Add `artifacts[]` entries to the quality-review and validate-and-commit review mode overrides.

### F3. Design principle count inconsistency (13 vs 14)

**Files:** `resources/00-design-principles.md`, `README.md`, `08-quality-review.toon`, `resources/04-review-mode-guide.md`, `skills/README.md`
**Principle:** P5 (Convention Over Invention)

| Source | Count |
|--------|-------|
| `resources/00-design-principles.md` (title) | 13 |
| `resources/00-design-principles.md` (content) | 13 (lists 1-13) |
| `README.md` | 14 |
| `08-quality-review.toon` review step | 14 |
| `resources/04-review-mode-guide.md` | 13 |
| `skills/README.md` | 13 |

The 14th principle (README documentation completeness) exists as rule #14 in `workflow.toon` and in the README table but was never added to resource 00.

**Fix:** Add Principle 14 to resource 00 and update all references to "14 design principles".

---

## Medium Findings

### F4. Missing `artifactLocation` for review report output

**Files:** `workflow.toon`
**Principle:** P4 (Maximize Schema Expressiveness)

`artifactLocations` only declares `workflows: workflows/`. Review mode saves to `.engineering/artifacts/reviews/` but this path is not declared.

**Fix:** Add a `reviews` artifact location and a `planning` location (per work-package workflow pattern).

### F5. impact-analysis "update mode only" rule lacks structural enforcement

**Files:** `05-impact-analysis.toon`
**Principle:** P10 (Encode Constraints as Structure)

Rule "This activity is only executed in update mode" should be a `validate` entry action, not text. Moot if F1 conditional transition is applied, but defense-in-depth recommends both.

### F6. "Corrections must persist" (Principle 8) is text-only

**Files:** `workflow.toon` (rule 12)
**Principle:** P10 (Encode Constraints as Structure)

The only design principle with no structural enforcement. No variable tracks corrections and no checkpoint verifies compliance with previous corrections.

### F7. Multiple activity-level rules are text-only

**Files:** Multiple activity TOON files
**Principle:** P10 (Encode Constraints as Structure)

8 activity-level rules can be violated without structural consequence. Highest-risk: "Read at least two existing workflows", "Do not assume answers", "Commit to the workflows worktree, not the main repository".

---

## Low Findings

### F8. activities/README.md omits `read-schema-documentation` step

**Files:** `activities/README.md`

Context and Literacy documentation lists 5 steps; the TOON file has 6. Step `read-schema-documentation` is missing.

### F9. skills/README.md protocol step counts are inaccurate

**Files:** `skills/README.md`

| Skill | Phase | README | Actual |
|-------|-------|--------|--------|
| workflow-design | context-loading | 4 | 5 |
| toon-authoring | read-reference | 2 | 3 |
| toon-authoring | plan-content | 2 | 3 |
| toon-authoring | validate | 2 | 3 |

### F10. `artifactLocations` uses abbreviated format

**Files:** `workflow.toon`

The `workflows` entry uses shorthand `workflows: workflows/` rather than the full object form `{ path: "workflows/", gitignored: false }`.

---

## Schema Validation Results

| File | Status |
|------|--------|
| workflow.toon | Pass |
| 01-intake.toon | Pass |
| 02-context-and-literacy.toon | Pass |
| 03-requirements-refinement.toon | Pass |
| 04-pattern-analysis.toon | Pass |
| 05-impact-analysis.toon | Pass |
| 06-scope-and-structure.toon | Pass |
| 07-content-drafting.toon | Pass |
| 08-quality-review.toon | Pass |
| 09-validate-and-commit.toon | Pass |
| 00-workflow-design.toon (skill) | Pass |
| 01-toon-authoring.toon (skill) | Pass |

---

## Rule-to-Structure Audit Summary

### Workflow-Level Rules (14)

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | Never use prose where a formal schema construct exists | Structurally enforced (`expressiveness-confirmed` checkpoint) |
| 2 | Never modify schemas during workflow creation | Text-only (behavioral, acceptable) |
| 3 | Present approach before implementation | Structurally enforced (`file-approach-confirmed` checkpoint) |
| 4 | One question at a time | Structurally enforced (8 separate checkpoints) |
| 5 | All TOON files must pass schema validation | Structurally enforced (`validation-passed` checkpoint + validate action) |
| 6 | Content-reducing updates require explicit approval | Structurally enforced (`preservation-check` + `preservation-confirmed` checkpoints) |
| 7 | Convention over invention | Structurally enforced (`conformance-confirmed` checkpoint) |
| 8 | Modular over inline | Partially enforced (conformance check) |
| 9 | Encode critical constraints as structure | Structurally enforced (`enforcement-confirmed` checkpoint) |
| 10 | Format literacy before content | Structurally enforced (`format-literacy` checkpoint + transition condition) |
| 11 | Define complete scope before execution | Structurally enforced (`scope-confirmed` checkpoint + validate action) |
| 12 | Corrections must persist | **Text-only** |
| 13 | Non-destructive updates | Structurally enforced (`preservation-check` checkpoint) |
| 14 | README documentation completeness | Partially enforced (procedural steps) |

### Anti-Pattern Scan Summary

21/23 anti-patterns: No violation.
1 violation: AP #12 (prose artifact for compliance report).
1 partial: AP #19 (some text-only rules for critical constraints).
