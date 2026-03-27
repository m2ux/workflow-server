# Compliance Review: work-package

**Date:** 2026-03-19
**Workflow:** work-package v3.4.0
**Files audited:** 39 TOON files (1 workflow, 14 activities, 24 skills)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 3 |
| Medium   | 5 |
| Low      | 5 |
| Pass     | 39 (schema validation) + 9 (convention) + 18 (anti-patterns clear) |

The work-package workflow is a mature, well-structured workflow with 56 declared variables, 14 activities, and 24 skills. Schema validation passes cleanly for all 39 TOON files. Convention conformance is strong — file naming, folder structure, versioning, and modularity all follow established patterns. The primary concerns are: (1) three supporting skill references point to skills that don't exist in the work-package skills directory, (2) four critical behavioral rules lack any structural enforcement mechanism, and (3) several step descriptions encode conditional logic, iteration, or variable assignment in prose rather than using the schema's formal constructs.

---

## Schema Expressiveness Findings

### F-001 — Complex conditional branching as prose in check-issue step
- **Severity:** High
- **File:** `activities/01-start-work-package.toon`, step `check-issue`
- **Description:** The step description encodes a 4-branch decision tree in prose: (1) no issue reference → present checkpoint, (2) issue key provided → detect platform format, (3) Jira path → resolve cloudId then verify, (4) GitHub path → verify via gh CLI. This is exactly the pattern `decisions[]` with `branches[].condition` was designed for.
- **Recommended fix:** Extract the conditional logic into a `decisions[]` block with branches keyed on `issue_platform` and `needs_issue_creation`. Keep the step description as a high-level summary; let the decision structure encode the branching.

### F-004 — Variable setting via prose instead of set action
- **Severity:** Medium
- **File:** `activities/02-design-philosophy.toon`, step `determine-path`
- **Description:** The step description states "Always set needs_comprehension to true" — this is an imperative variable assignment that should use `actions[].action: set` with `target: needs_comprehension` and `value: true`.
- **Recommended fix:** Add an `actions[]` entry: `{ action: set, target: needs_comprehension, value: true }`.

### F-005 — Workflow trigger via prose instead of triggers[]
- **Severity:** Medium
- **File:** `activities/09-post-impl-review.toon`, step `dispatch-prism`
- **Description:** The step description says "the orchestrator dispatches a fresh prism orchestrator sub-agent following the orchestrate-prism skill." This describes cross-workflow triggering — the schema's `triggers` construct (`triggers.workflow`, `.description`, `.passContext`) exists for exactly this purpose.
- **Recommended fix:** Add a `triggers` entry: `{ workflow: prism, description: "Dispatch full 3-pass prism structural analysis for complex work packages", passContext: true }`.

### F-006 — Iteration via prose instead of loops[]
- **Severity:** Medium
- **File:** `activities/10-validate.toon`, step `fix-failures`
- **Description:** The step description says "Analyze root cause of test/build/lint failures, fix, and re-run. Repeat until all pass." This is a while-loop pattern that should use `loops[]` with `type: while`, `condition: { variable: has_failures, operator: ==, value: true }`.
- **Recommended fix:** Add a `loops[]` entry modeling the fix-rerun cycle, or restructure the step into a doWhile loop with substeps for analyze, fix, and rerun.

### F-009 — Platform-conditional logic in activate-issue step prose
- **Severity:** Low
- **File:** `activities/01-start-work-package.toon`, step `activate-issue`
- **Description:** The description contains conditional logic for Jira vs GitHub platform handling. While a step condition is present (`issue_skipped != true`), the internal branching by `issue_platform` is encoded in prose. Could use `decisions[]` or be split into platform-specific substeps.
- **Recommended fix:** Consider splitting into `activate-issue-jira` and `activate-issue-github` substeps with conditions on `issue_platform`, or accept the prose as procedural guidance for a single atomic operation.

### F-010 — Conditional variable setting in evaluate-open-assumptions step prose
- **Severity:** Low
- **File:** `activities/07-assumptions-review.toon`, step `evaluate-open-assumptions`
- **Description:** The step says "If zero open assumptions remain, set has_open_assumptions to false and stakeholder_review_complete to true." This conditional set logic could use `actions[]` with a condition, but the logic depends on runtime analysis results rather than a declared variable state.
- **Recommended fix:** Add `actions[]` with `action: set` entries guarded by conditions where possible, or document as acceptable procedural logic since the condition depends on runtime content analysis.

### F-011 — Conditional logic in verify-commit-signatures step prose
- **Severity:** Low
- **File:** `activities/12-submit-for-review.toon`, step `verify-commit-signatures`
- **Description:** The description contains "If ANY commit shows 'N' (no signature), the agent MUST rebase and sign them" — a conditional operation encoded in prose. This could use a `decisions[]` block or step condition.
- **Recommended fix:** Accept as procedural detail since the condition depends on shell command output, or extract into a decision block that sets a `needs_signing` variable checked by a subsequent step.

---

## Convention Conformance Findings

### Passes

| Convention | Status | Details |
|-----------|--------|---------|
| File naming (activities) | ✅ Pass | All 14 activities follow `NN-name.toon` pattern |
| File naming (skills) | ✅ Pass | All 24 skills follow `NN-name.toon` pattern |
| File naming (resources) | ✅ Pass | All 28 resources follow `NN-name.md` pattern |
| Folder structure | ✅ Pass | `activities/`, `skills/`, `resources/` subfolders present |
| Version format | ✅ Pass | All versions use X.Y.Z semantic versioning |
| Checkpoint structure | ✅ Pass | All checkpoints have id, name, message, options with effects |
| Skill structure | ✅ Pass | All skills have id, version, capability; protocol uses step-keyed arrays |
| Modular content | ✅ Pass | No inline activities in workflow.toon; all content in separate files |
| Transition patterns | ✅ Pass | initialActivity defined; transitions use to, condition, isDefault |

### Findings

### F-003 — Supporting skill references to non-existent skills
- **Severity:** High
- **File:** Multiple activity files
- **Description:** Three supporting skill references point to skills not present in `work-package/skills/`:
  - `activities/01-start-work-package.toon` → `atlassian-operations` (not in skills/)
  - `activities/09-post-impl-review.toon` → `structural-analysis` (not in skills/)
  - `activities/14-codebase-comprehension.toon` → `portfolio-analysis` (not in skills/)
  These likely reference cross-workflow skills (meta workflow or prism workflow), but no formal cross-workflow skill reference mechanism is used. An agent loading the work-package workflow and attempting to resolve these skills locally would fail.
- **Recommended fix:** Either (a) include these skills in the work-package skills directory as wrappers/references, (b) adopt a qualified naming convention for cross-workflow references (e.g., `meta:atlassian-operations`, `prism:structural-analysis`), or (c) add a `crossWorkflowSkills[]` field to the activity schema.

### F-007 — required:true activity skippable via transition graph
- **Severity:** Medium
- **File:** `activities/05-implementation-analysis.toon`, `activities/14-codebase-comprehension.toon`
- **Description:** `implementation-analysis` is marked `required: true` but the transition graph from `codebase-comprehension` can skip directly to `plan-prepare` when `skip_optional_activities == true`. This bypasses implementation-analysis entirely, contradicting its `required: true` flag. Intentional for simple bug fixes (no pre-existing implementation to analyze), but the metadata is contradictory.
- **Recommended fix:** Either set `required: false` on implementation-analysis (since simple paths legitimately skip it), or add a transition from codebase-comprehension through implementation-analysis for all paths.

### F-008 — README PROGRESS RULE partially implemented in exitActions
- **Severity:** Medium
- **File:** `workflow.toon` (rule 12), various activity files
- **Description:** The workflow-level README PROGRESS RULE states "After each completed activity, the orchestrator MUST update the planning folder README.md." However, only 3 of 14 activities have corresponding exitActions mentioning README updates:
  - `06-plan-prepare.toon` ✅
  - `08-implement.toon` ✅
  - `09-post-impl-review.toon` ✅
  - Activities 01–05, 07, 10–14: no README update exitActions
  
  The rule is global but the structural implementation is partial. Activities like `design-philosophy`, `research`, `validate`, `strategic-review`, and `complete` produce artifacts that should be tracked in the README progress table but have no exitAction to trigger the update.
- **Recommended fix:** Add `exitActions` with README update messages to all activities that produce artifacts or change workflow state, or move the README update to a cross-cutting mechanism (e.g., workflow-level post-activity hook).

### F-012 — Transition coverage depends on checkpoint consistency
- **Severity:** Low
- **File:** `activities/14-codebase-comprehension.toon`
- **Description:** The transitions from `codebase-comprehension` handle three cases based on `needs_elicitation`, `needs_research`, and `skip_optional_activities`. The case where all three are false has no matching transition. This never occurs because the `design-philosophy` checkpoint always sets them as a consistent group, but the transition table doesn't independently guarantee coverage — it depends on upstream checkpoint correctness.
- **Recommended fix:** Either add a fourth transition as a fallback (e.g., default to `plan-prepare` when `skip_optional_activities` is false and both `needs_*` variables are false), or document the checkpoint coupling as a design invariant.

---

## Rule Enforcement Findings

### F-002 — Critical workflow rules with text-only enforcement
- **Severity:** High
- **Description:** Four critical rules define fundamental execution semantics but have no structural mechanism to prevent violation. An agent that ignores any of these rules would cause fundamental workflow breakdown.

### Workflow-Level Rules

| # | Rule (abbreviated) | Enforcement | Structural Mechanism |
|---|-------------------|-------------|---------------------|
| 1 | PREREQUISITE: Read AGENTS.md | ⚠️ Text-only | None — no `entryActions[].action: validate` |
| 2 | Must not proceed past checkpoints | ✅ Partially | `blocking: true` on critical checkpoints |
| 3 | Ask, don't assume | ⚠️ Text-only | None — behavioral guidance |
| 4 | Summarize, then proceed | ⚠️ Text-only | None — behavioral guidance |
| 5 | One task at a time | ✅ Partially | `forEach` loop in implement activity |
| 6 | Explicit approval | ✅ Partially | Checkpoints provide approval points |
| 7 | Decision points require user choice | ✅ Partially | Checkpoints + decisions provide some structure |
| 8 | **AUTOMATIC TRANSITION** | ⚠️ Text-only | Transitions are defined but "automatic" is not enforced |
| 9 | **EXECUTION MODEL** | ⚠️ Text-only | Orchestrator/worker pattern not schema-enforceable |
| 10 | **ORCHESTRATOR DISCIPLINE** | ⚠️ Text-only | No mechanism prevents orchestrator from executing steps |
| 11 | **CHECKPOINT YIELD** | ⚠️ Text-only | Context delivery in yields is behavioral |
| 12 | README PROGRESS | ✅ Partially | exitActions on 3/14 activities (see F-008) |

### Activity-Level Rules (summary)

| Activity | Rules | Enforcement |
|----------|-------|-------------|
| 01-start-work-package | 3 | All text-only (procedural protocols) |
| 02-design-philosophy | 4 | All text-only (path determination guidance) |
| 03-requirements-elicitation | 1 | Text-only (skill reference) |
| 04-research | 1 | Text-only (skill reference) |
| 05-implementation-analysis | 1 | Text-only (skill reference) |
| 06-plan-prepare | 1 | Text-only (skill reference) |
| 07-assumptions-review | 5 | All text-only (format, platform, skip rules) |
| 08-implement | 4 | All text-only (execution order, verification) |
| 09-post-impl-review | 7 | All text-only (entry procedures, review order) |
| 10-validate | 1 | Text-only (skill reference) |
| 11-strategic-review | 1 | Text-only (skill reference) |
| 12-submit-for-review | 1 | Text-only (skill reference) |
| 13-complete | 1 | Text-only (skill reference) |
| 14-codebase-comprehension | 10 | All text-only (tool selection, sufficiency rules) |

**Total:** 52 rules across workflow + activities. 7 text-only at workflow level, 40 text-only at activity level, 5 partially enforced at workflow level. **0 rules fully structurally enforced.**

### F-013 — ENTRY rules as text instead of entryActions
- **Severity:** Low
- **File:** `activities/09-post-impl-review.toon`
- **Description:** Three rules prefixed with "ENTRY:" describe actions that should happen upon activity entry: "Run git pull", "Parse git diff to extract changed files", "Create file index table." The activity has an `entryActions` field with only a log action. These ENTRY rules could be modeled as `entryActions[]` with `action: validate` or `action: set` to structurally ensure they execute.
- **Recommended fix:** Convert ENTRY-prefixed rules to `entryActions[]` entries: a `validate` action for git pull, a `set` action for populating changed files list, and a `log` or `message` action for the index table creation.

---

## Anti-Pattern Findings

| # | Anti-Pattern | Status | Location |
|---|-------------|--------|----------|
| 1 | Inline content in parent files | ✅ Clear | workflow.toon has no inline activities |
| 2 | Schema modification to match content | ✅ Clear | No evidence |
| 3 | Partial implementations | ✅ Clear | All constructs fully defined |
| 4 | New naming conventions without precedent | ✅ Clear | All naming follows established patterns |
| 5 | Skip/combine checkpoints | ✅ Clear | All checkpoints individually defined |
| 6 | Assumption-based execution | ✅ Clear | Assumption reconciliation loops prevent this |
| 7 | No scope re-verification | ✅ Clear | Strategic review serves this purpose |
| 8 | Multiple questions per message | ✅ Clear | Skill rule enforces one-question-per-turn |
| 9 | "Ask the user" as prose instead of checkpoint | ✅ Clear | User-facing questions use checkpoints |
| 10 | "Repeat for each" as prose instead of loop | ⚠️ Match | See F-006: `fix-failures` in validate activity |
| 11 | "If X then Y" as prose instead of decision/condition | ⚠️ Match | See F-001: `check-issue` in start-work-package; also F-009, F-010, F-011 |
| 12 | "This produces a report" buried instead of artifact | ✅ Clear | All artifacts properly declared in `artifacts[]` |
| 13 | "Track whether approved" implicitly instead of variable | ✅ Clear | All workflow-state variables declared in `variables[56]` |
| 14 | "In fast mode, skip steps" as rule instead of mode | ✅ Clear | Review mode uses `modeOverrides` properly |
| 15 | "First do X, then Y" as prose instead of protocol | ✅ Clear | Skills use `protocol` with step-keyed arrays |
| 16 | "This skill needs input" buried instead of inputs[] | ✅ Clear | All skills declare `inputs[]` properly |
| 17 | Starting implementation without presenting approach | ✅ Clear | design-philosophy → comprehension → plan-prepare before implement |
| 18 | Analysis without action | ✅ Clear | All analysis activities produce artifacts and drive transitions |
| 19 | Critical constraints as text-only rules | ⚠️ Match | See F-002: 4 critical behavioral rules are text-only |
| 20 | Content-reducing README updates without audit | ✅ Clear | No evidence |
| 21 | Writing TOON with JSON/YAML syntax | ✅ Clear | All files use proper TOON syntax |
| 22 | Work outside defined activities | ✅ Clear | Workflow covers inception to completion |
| 23 | Defending output when corrected | ✅ Clear | N/A for static workflow definition |

**Summary:** 20 clear, 3 matched (referencing existing findings F-001, F-002, F-006).

---

## Schema Validation Results

| File | Status |
|------|--------|
| `workflow.toon` | ✅ OK |
| `activities/01-start-work-package.toon` | ✅ OK |
| `activities/02-design-philosophy.toon` | ✅ OK |
| `activities/03-requirements-elicitation.toon` | ✅ OK |
| `activities/04-research.toon` | ✅ OK |
| `activities/05-implementation-analysis.toon` | ✅ OK |
| `activities/06-plan-prepare.toon` | ✅ OK |
| `activities/07-assumptions-review.toon` | ✅ OK |
| `activities/08-implement.toon` | ✅ OK |
| `activities/09-post-impl-review.toon` | ✅ OK |
| `activities/10-validate.toon` | ✅ OK |
| `activities/11-strategic-review.toon` | ✅ OK |
| `activities/12-submit-for-review.toon` | ✅ OK |
| `activities/13-complete.toon` | ✅ OK |
| `activities/14-codebase-comprehension.toon` | ✅ OK |
| `skills/00-review-code.toon` | ✅ OK |
| `skills/01-review-test-suite.toon` | ✅ OK |
| `skills/02-respond-to-pr-review.toon` | ✅ OK |
| `skills/03-create-issue.toon` | ✅ OK |
| `skills/04-classify-problem.toon` | ✅ OK |
| `skills/05-elicit-requirements.toon` | ✅ OK |
| `skills/06-research-knowledge-base.toon` | ✅ OK |
| `skills/07-analyze-implementation.toon` | ✅ OK |
| `skills/08-create-plan.toon` | ✅ OK |
| `skills/09-create-test-plan.toon` | ✅ OK |
| `skills/10-implement-task.toon` | ✅ OK |
| `skills/11-review-diff.toon` | ✅ OK |
| `skills/12-review-strategy.toon` | ✅ OK |
| `skills/13-review-assumptions.toon` | ✅ OK |
| `skills/14-manage-artifacts.toon` | ✅ OK |
| `skills/15-manage-git.toon` | ✅ OK |
| `skills/16-validate-build.toon` | ✅ OK |
| `skills/17-finalize-documentation.toon` | ✅ OK |
| `skills/18-update-pr.toon` | ✅ OK |
| `skills/19-conduct-retrospective.toon` | ✅ OK |
| `skills/20-summarize-architecture.toon` | ✅ OK |
| `skills/21-create-adr.toon` | ✅ OK |
| `skills/22-build-comprehension.toon` | ✅ OK |
| `skills/23-reconcile-assumptions.toon` | ✅ OK |

**Result:** 39/39 files pass TOON parsing. No syntax errors.

---

## Recommended Fixes

### High Priority

1. **F-003 — Resolve broken cross-workflow skill references.** Three supporting skill references (`atlassian-operations`, `structural-analysis`, `portfolio-analysis`) point to skills outside the work-package directory. Adopt qualified naming (e.g., `meta:atlassian-operations`) or create local wrapper skills. This is the most actionable fix — it directly prevents resolution failures.

2. **F-001 — Extract conditional branching from check-issue step.** The 4-branch platform detection and verification logic in `check-issue` should be modeled as a `decisions[]` block. This is the single largest prose-encoded decision tree in the workflow.

3. **F-002 — Evaluate structural enforcement for critical rules.** The four critical rules (AUTOMATIC TRANSITION, EXECUTION MODEL, ORCHESTRATOR DISCIPLINE, CHECKPOINT YIELD) define fundamental execution semantics. Consider whether any can be partially enforced through schema extensions (e.g., a `transitionMode: automatic` flag, an `executionModel` field, or `yieldContext: required` on checkpoints).

### Medium Priority

4. **F-006 — Model fix-failures iteration as a loop.** Add a `loops[]` entry to the validate activity for the fix-rerun cycle, matching the pattern already used in post-impl-review's `review-fix-cycle` loop.

5. **F-004 — Add set action for needs_comprehension.** Convert the prose instruction "Always set needs_comprehension to true" to an `actions[]` entry in the determine-path step.

6. **F-005 — Add triggers[] for prism dispatch.** Model the prism workflow dispatch in post-impl-review as a formal `triggers` entry.

7. **F-007 — Reconcile required flag with transition graph.** Either change `implementation-analysis` to `required: false` or add a transition path through it for all workflow paths.

8. **F-008 — Extend exitActions for README progress.** Add README update exitActions to all artifact-producing activities (design-philosophy, requirements-elicitation, research, implementation-analysis, validate, strategic-review, complete).

### Low Priority

9. **F-009, F-010, F-011 — Minor prose-encoded conditionals.** These are procedural details in step descriptions (platform branching, variable setting, commit signing). Converting to formal constructs would add structural clarity but the current prose is functionally adequate.

10. **F-012 — Add fallback transition from codebase-comprehension.** Add a fourth transition as a safety net for the case where variable combinations don't match any explicit condition.

11. **F-013 — Convert ENTRY rules to entryActions.** The three ENTRY-prefixed rules in post-impl-review would be better modeled as structural entryActions entries.
