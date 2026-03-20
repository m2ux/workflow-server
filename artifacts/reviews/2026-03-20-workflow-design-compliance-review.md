# Compliance Review: workflow-design

**Date:** 2026-03-20
**Workflow:** workflow-design v1.2.0
**Files audited:** 21 (1 workflow.toon, 9 activity .toon, 2 skill .toon, 5 resource .md, 4 README.md)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 3 |
| **Total** | **8** |

All 12 TOON files pass schema validation. The workflow demonstrates strong structural design — formal constructs are used extensively (checkpoints, conditions, loops, transitions, modeOverrides, entryActions, artifacts), and the modular file organization follows established conventions. Findings center on text inconsistencies, unnecessary friction in review mode, and a few rules lacking structural enforcement.

---

## Schema Expressiveness Findings

**Overall: Strong.** The workflow uses formal schema constructs extensively:

- 28 checkpoints (23 base + 5 mode-specific) with well-defined options and effects
- Conditional transitions using `condition.schema.json` (context-and-literacy, scope-and-structure, requirements-refinement)
- `modeOverrides` with `skipSteps`, `skipActivities`, `transitionOverride` on 6 activities
- `entryActions` with `validate` on 2 activities (content-drafting, impact-analysis)
- `exitActions` with `log` on validate-and-commit
- `loops` with `forEach` on content-drafting
- `artifacts[]` on quality-review (review mode)
- Step-level `condition` on validate-and-commit steps (generate-readme, update-readme)

No findings of prose that should be formal constructs. Descriptions stay within `description`, `problem`, and `recognition` fields.

---

## Convention Conformance Findings

| Convention | Status | Notes |
|------------|--------|-------|
| File naming | PASS | `NN-name.toon` for activities/skills, `NN-name.md` for resources |
| Folder structure | PASS | `activities/`, `skills/`, `resources/` with README.md in each |
| Version format | PASS | All use `X.Y.Z` semantic versioning |
| Modular content | PASS | No inline activities in workflow.toon |
| Checkpoint structure | PASS | All checkpoints have id, name, message, options with effects |
| Transition patterns | PASS | Sequential workflow with `initialActivity` and transitions |
| Skill structure | PASS | Both skills have id, version, capability, protocol, rules |
| README completeness | PASS | Root + 3 subfolder READMEs present |

One text inconsistency found — see H-01.

---

## Rule Enforcement Findings

Audited all 14 workflow-level rules and 20 activity-level rules.

| Rule | Enforcement | Status |
|------|-------------|--------|
| 1. No prose where construct exists | `expressiveness-confirmed` checkpoint | Structurally enforced |
| 2. Never modify schemas | Text only | **Text-only** (M-01) |
| 3. Present approach before implementation | `file-approach-confirmed` checkpoint | Structurally enforced |
| 4. One question at a time | 8 separate checkpoints | Structurally enforced |
| 5. All TOON files pass validation | `validation-passed` checkpoint + validation step | Structurally enforced |
| 6. Content-reducing updates need approval | `preservation-confirmed` + `preservation-check` checkpoints | Structurally enforced |
| 7. Convention over invention | `conformance-confirmed` checkpoint | Structurally enforced |
| 8. Modular over inline | Text only; checked during conformance pass | **Partial** (M-01) |
| 9. Encode constraints as structure | `enforcement-confirmed` checkpoint | Structurally enforced |
| 10. Format literacy before content | `format-literacy` checkpoint + transition condition | Structurally enforced |
| 11. Complete scope before execution | `scope-confirmed` checkpoint + variable gate | Structurally enforced |
| 12. Corrections must persist | Text only | **Text-only** (M-01) |
| 13. Non-destructive updates | `preservation-confirmed` + `preservation-check` checkpoints | Structurally enforced |
| 14. Complete documentation structure | Steps only, no validate action | **Partial** (M-01) |

11 of 14 rules have full structural enforcement. 3 have text-only or partial enforcement.

---

## Anti-Pattern Findings

Scanned against all 23 anti-patterns from resource 02.

| # | Anti-Pattern | Status |
|---|--------------|--------|
| 1–8 | Structural + Interaction | All PASS |
| 9–16 | Schema Expressiveness | All PASS |
| 17–18 | Execution (premature, recommend-only) | PASS |
| 19 | Text-only rules | **PARTIAL MATCH** — 3 rules text-only |
| 20–23 | Execution (destructive, syntax, informal, defending) | All PASS |

1 partial match out of 23 anti-patterns.

---

## Schema Validation Results

| File | Status |
|------|--------|
| workflow.toon | PASS |
| activities/01-intake.toon | PASS |
| activities/02-context-and-literacy.toon | PASS |
| activities/03-requirements-refinement.toon | PASS |
| activities/04-pattern-analysis.toon | PASS |
| activities/05-impact-analysis.toon | PASS |
| activities/06-scope-and-structure.toon | PASS |
| activities/07-content-drafting.toon | PASS |
| activities/08-quality-review.toon | PASS |
| activities/09-validate-and-commit.toon | PASS |
| skills/00-workflow-design.toon | PASS |
| skills/01-toon-authoring.toon | PASS |

12/12 files pass.

---

## Detailed Findings

### H-01: Description text says "13 design principles" — should be 14

**Severity:** High
**Principle violated:** #5 Convention Conformance, #8 Corrections Must Persist

The workflow description, review checkpoint message, and skills README reference "13 design principles" while the authoritative source (resource 00) and root README list 14 principles. The workflow.toon `rules[14]` array contains 14 entries. The 14th principle ("Complete Documentation Structure") was added without updating all text references.

**Files affected:**
- `workflow.toon` line 5 — description says "13 design principles"
- `activities/01-intake.toon` line 40 — review checkpoint message says "13 design principles"
- `skills/README.md` line 7 — says "encodes the 13 design principles"

**Fix:** Replace "13" with "14" in all three locations.

---

### M-01: Three workflow rules lack structural enforcement

**Severity:** Medium
**Principle violated:** #10 Encode Constraints as Structure

| Rule | Current | Recommendation |
|------|---------|----------------|
| Rule 2: "Never modify schemas" | Text only | Add `validate` entry action on context-and-literacy |
| Rule 12: "Corrections must persist" | Text only | Consider cross-cutting variable + checkpoint verification |
| Rule 14: "README required" | Partial (steps) | Add `validate` action on validate-and-commit to verify README existence |

---

### M-02: Review mode intake checkpoint is unnecessary friction

**Severity:** Medium
**Principle violated:** Efficient construct usage

The `review-scope-confirmed` checkpoint asks "Shall I proceed?" when the user's intent is already clear from invoking review mode.

**File:** `activities/01-intake.toon` lines 37–50

**Fix:** Remove the `review-scope-confirmed` checkpoint. Keep the review scope presentation step without blocking.

---

### M-03: Review mode inherits irrelevant checkpoints from context-and-literacy

**Severity:** Medium
**Principle violated:** #10 Encode Constraints as Structure

The review mode override for context-and-literacy skips steps and sets a `transitionOverride` but does not override checkpoints. The `format-literacy` checkpoint fires but is irrelevant in review mode (no content will be drafted). The `constructs-confirmed` checkpoint is partially relevant but its message is phrased for design mode.

**File:** `activities/02-context-and-literacy.toon` lines 16–22

**Fix:** Add checkpoint overrides in review mode — skip `format-literacy` entirely and adapt `constructs-confirmed` to review context.

---

### M-04: Duplicate fix-issues decision across two activities

**Severity:** Medium
**Principle violated:** #3 One Question at a Time

Both `review-disposition` (quality-review) and `report-saved` (validate-and-commit) ask whether to fix issues. The user answers the same question twice.

**Files:** `activities/08-quality-review.toon` lines 46–71, `activities/09-validate-and-commit.toon` lines 32–44

**Fix:** Remove the `report-saved` checkpoint from validate-and-commit review mode. The quality-review `review-disposition` checkpoint is sufficient; validate-and-commit should transition based on the `user_wants_fixes` variable.

---

### M-05: validate-and-commit review step describes wrong git target

**Severity:** Medium
**Principle violated:** #5 Convention Conformance

The `commit-report` step says "engineering submodule" but `.engineering/artifacts/reviews/` is a regular directory in the parent repo — not a submodule.

**File:** `activities/09-validate-and-commit.toon` line 30

**Fix:** Change "engineering submodule" to "parent repository."

---

### L-01: context_to_preserve items could be partially formalized

**Severity:** Low

26+ items in `context_to_preserve` across activities are not declared as formal `variables[]`. Items like `commit_hash` and `validation_results` could benefit from formalization to enable condition/transition usage.

---

### L-02: Some checkpoints omit explicit required/blocking fields

**Severity:** Low

Many checkpoints don't explicitly declare `required: true` and `blocking: true` in TOON files (validator passes with defaults). Explicit declaration improves clarity.

---

### L-03: Base intake checkpoint lacks review option

**Severity:** Low

The base `mode-confirmation` checkpoint offers only "create" and "update" options. No "review" option exists. Low risk since recognition patterns activate review mode before this checkpoint fires.
