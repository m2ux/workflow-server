# Work-Package Workflow Compliance Review

**Date:** 2026-03-20
**Workflow:** `work-package` v3.4.0
**Reviewer:** workflow-design (review mode)
**Scope:** Full compliance audit against 14 design principles, 23 anti-patterns, and schema validation

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 5 |
| Medium | 4 |
| Low | 4 |
| **Total** | **13** |

**Schema Validation:** All 39 TOON files pass validation (1 workflow, 14 activities, 24 skills).

The work-package workflow is structurally mature and demonstrates strong schema expressiveness. Formal constructs (steps, checkpoints, decisions, loops, transitions, conditions, modes, modeOverrides, artifacts, variables) are used extensively and appropriately. The primary category of findings is **documentation drift** — the README.md files have fallen out of sync with the TOON definitions following recent workflow updates to v3.4.0.

---

## Schema Validation Results

```
✅ workflow.toon — valid (ID: work-package, Version: 3.4.0, Activities: 14)
✅ 14/14 activity TOON files — valid
✅ 24/24 skill TOON files — valid
```

No schema validation errors detected. All files conform to their respective schemas (workflow.schema.json, activity.schema.json, skill.schema.json).

---

## Principle Compliance Findings

### Principle 4 — Maximize Schema Expressiveness

**F-01 | Medium | Checkpoint prerequisite fields use prose instead of formal conditions**

Several checkpoints use a `prerequisite` string field containing prose descriptions like `"Only present when on_feature_branch is true"` rather than formal condition objects. While the schema validator accepts this (the field is not schema-enforced), it means the conditional presentation logic is not machine-interpretable.

Affected checkpoints:
- `branch-check` in start-work-package: `"Only present when on_feature_branch is true"`
- `pr-check` in start-work-package: `"Only present when pr_exists is true"`
- `platform-selection` in start-work-package: `"Only present when needs_issue_creation is true"`
- `jira-project-selection` in start-work-package: `"Only present when issue_platform is jira"`
- `issue-type-selection` in start-work-package: `"Only present when needs_issue_creation is true"`
- `issue-review` in start-work-package: `"Only present when needs_issue_creation is true"`
- `pr-creation` in start-work-package: `"Only present when issue_cancelled is false"`
- `comment-review` in assumptions-review: `"Only present when issue_platform is set"`
- `stakeholder-response` in assumptions-review: `"Only present when has_open_assumptions is true"`
- `feedback-triage` in assumptions-review: `"Only present when has_stakeholder_comment is true"`
- `block-interview` in post-impl-review: `"Repeats for each entry in flagged_block_indices"`
- `comprehension-sufficient` in codebase-comprehension: `"Only present when has_open_questions is true"`

**Recommendation:** If the schema supported a formal `condition` field on checkpoints (like transitions and decision branches), these should use it. Since the schema currently does not, document this as a future schema enhancement opportunity.

---

### Principle 10 — Encode Constraints as Structure

**F-02 | Medium | Critical orchestrator behavioral rules lack structural enforcement**

Five workflow-level rules describe critical behavioral constraints but rely entirely on text:

| Rule | Content | Structural Enforcement |
|------|---------|----------------------|
| Rule 8 | AUTOMATIC TRANSITION RULE | None — text-only orchestrator guidance |
| Rule 9 | EXECUTION MODEL | None — text-only pattern description |
| Rule 10 | ORCHESTRATOR DISCIPLINE | None — text-only constraint |
| Rule 11 | CHECKPOINT YIELD RULE | None — text-only worker constraint |
| Rule 12 | README PROGRESS RULE | Partial — exitActions on activities provide reminders |

These rules govern the inter-agent orchestrator/worker protocol and are fundamental to correct execution. However, they describe cross-agent behavioral contracts that cannot be expressed through the current schema construct set (checkpoints, conditions, validate actions operate within a single agent's execution). The README PROGRESS RULE is partially enforced via `exitActions` on each activity.

**Recommendation:** Accept as inherent schema limitation. Consider whether the schema could add a `protocol` or `agentContract` construct at the workflow level for future enforcement. The existing text rules are well-written and comprehensive.

---

### Principle 14 — Complete Documentation Structure

**F-03 | High | README.md version mismatch**

The root `README.md` header says `v3.3.0` but the `workflow.toon` declares `version: 3.4.0`.

**File:** `README.md` line 3
**Fix:** Update README header to `v3.4.0`.

---

**F-04 | High | README variable count discrepancy**

The README heading says "Variables (52)" but `workflow.toon` declares `variables[56]` containing 56 variable entries. The README Variables section also omits the `target_path` variable from the Core Identifiers table.

**File:** `README.md` line 239, line 245
**Fix:** Update heading to "Variables (56)" and add `target_path` to the Core Identifiers table.

---

**F-05 | High | README checkpoint counts don't match TOON definitions**

The Activities Summary table in the README lists checkpoint counts that diverge from the actual TOON definitions:

| Activity | README Count | Actual Count | Discrepancy |
|----------|-------------|--------------|-------------|
| 02 Design Philosophy | 5 | 1 | README overcounts by 4 |
| 06 Plan & Prepare | 4 | 2 | README overcounts by 2 |
| 08 Implement | 2 | 4 | README undercounts by 2 |
| 09 Post-Impl Review | 5 | 3 | README overcounts by 2 |
| 11 Strategic Review | 2 | 1 | README overcounts by 1 |
| 12 Submit for Review | 3 | 2 | README overcounts by 1 |

**File:** `README.md` lines 84–99
**Fix:** Reconcile checkpoint counts with the actual TOON definitions.

---

**F-06 | High | README rules appendix lists 9 rules but TOON has 12**

The `workflow.toon` declares `rules[12]` with 12 rules. The README Appendix: Workflow Rules section lists only 9 rules and includes two rules ("Never reference gitignored artifacts" and "Artifacts in planning and reviews locations are gitignored") that do not appear in the TOON. Meanwhile, the TOON's AUTOMATIC TRANSITION RULE, EXECUTION MODEL, ORCHESTRATOR DISCIPLINE, CHECKPOINT YIELD RULE, and README PROGRESS RULE are omitted from the appendix.

**File:** `README.md` lines 324–336
**Fix:** Synchronize the README rules appendix with the actual `workflow.toon` rules array.

---

**F-07 | High | README artifact locations table marks planning as gitignored but TOON does not**

The README Appendix: Artifact Locations marks `planning` and `reviews` as "Gitignored: yes", but the `workflow.toon` `artifactLocations` section has no `gitignored` field — and the JSON representation from get_workflow shows `"gitignored": false` for all locations.

**File:** `README.md` lines 341–346
**Fix:** Remove incorrect "Gitignored" column values or add the `gitignored` field to the TOON if the intent is for these to be gitignored.

---

### Convention Conformance

**F-08 | Low | Resource file numbering gap and count discrepancy**

The `resources/README.md` lists 26 resources. The actual file listing shows 28 resource files (01–28). The numbering has gaps (no `02-*.md`) and the README omits entries for resources 26 (assumption-reconciliation) and 27 (gitnexus-reference). Entry 02 (`02-readme.md`) exists on disk but is not listed in the README.

**File:** `resources/README.md`
**Fix:** Update the resource README to include all 28 resource files.

---

**F-09 | Low | Skills README count discrepancy**

The `skills/README.md` header says "23 workflow-specific + 2 universal" (25 total). The actual skills directory contains 24 files (00–23). The README skills table only lists 22 entries (missing `reconcile-assumptions` skill 23). Additionally, the 3 cross-workflow skill references (`structural-analysis` from prism, `atlassian-operations` from meta, `portfolio-analysis` from prism) are not documented.

**File:** `skills/README.md`
**Fix:** Add `reconcile-assumptions` (23) to the table and document the 3 cross-workflow skill references.

---

## Anti-Pattern Scan Results

| # | Anti-Pattern | Status | Notes |
|---|-------------|--------|-------|
| 1 | Inline content in parent files | Clean | All activities, skills, resources in separate files |
| 2 | Schema modification | Clean | No schema changes |
| 3 | Partial implementation | Clean | Scope fully addressed |
| 4 | New naming conventions | Clean | Follows NN-name.toon convention |
| 5 | Combined checkpoints | Clean | Each checkpoint is atomic |
| 6 | Assumption-based execution | Clean | Has elicitation, clarification steps |
| 7 | Completion without verification | Clean | Has validate and strategic-review activities |
| 8 | Multiple questions per message | Clean | One question per checkpoint |
| 9 | User decision as prose | Clean | All user decisions use checkpoints |
| 10 | Iteration as prose | Clean | Uses loops (6 instances) |
| 11 | Conditional logic as prose | Clean | Uses decisions and transition conditions |
| 12 | Artifact buried in description | Clean | Uses artifacts[] construct |
| 13 | Implicit state tracking | Clean | Variables declared with types and defaults |
| 14 | Mode skip as rule text | Clean | Uses modes with skipActivities and modeOverrides |
| 15 | Procedure as prose | Clean | Skills use protocol with step-keyed bullets |
| 16 | Inputs buried in description | Clean | Skills use inputs[] |
| 17 | Implementing without planning | Clean | Plan-prepare precedes implement |
| 18 | Recommendations without action | Clean | Activities have concrete steps |
| **19** | **Critical rules as text only** | **Finding** | **See F-02 — orchestrator rules lack structural enforcement** |
| 20 | Content-reducing updates | N/A | Review mode |
| 21 | Wrong TOON syntax | Clean | All files pass validation |
| 22 | Work outside workflow | Clean | All work flows through activities |
| 23 | Defending output | N/A | Process concern |

**Result:** 1 finding (anti-pattern #19, mapped to F-02). 20 clean, 2 not applicable.

---

## Additional Structural Findings

**F-10 | Medium | Assumption reconciliation loop duplicated verbatim across 6 activities**

The same loop structure (`assumption-reconciliation`, type: while, condition: `has_resolvable_assumptions == true`, maxIterations: 100, 3 steps: targeted-analysis, update-assumptions-and-artifact, reclassify-resolvability) is duplicated verbatim in:
- `design-philosophy`
- `requirements-elicitation`
- `research`
- `implementation-analysis`
- `plan-prepare`
- `implement`

This creates maintenance risk — a change to the reconciliation protocol requires updating 6 activity files.

**Recommendation:** Consider whether the schema could support a shared loop reference or whether this should be factored into the `reconcile-assumptions` skill's protocol. The duplication is not a schema violation but is a maintenance concern.

---

**F-11 | Medium | Missing defaultValue on `needs_further_discussion` variable**

The variable `needs_further_discussion` (type: boolean) does not declare a `defaultValue`, unlike all other boolean variables which default to `false`. This means the variable is `undefined` until explicitly set, which could cause unexpected behavior in the assumptions-review transition condition `needs_further_discussion == true`.

**File:** `workflow.toon` line 181
**Fix:** Add `defaultValue: false`.

---

**F-12 | Low | Potential duplicate architecture summary creation**

Both `post-impl-review` (step: `architecture-summary`, required: false) and `strategic-review` (step: `create-architecture-summary`, required: true) produce `architecture-summary.md`. The artifact prefixing convention produces different files (`09-architecture-summary.md` vs `11-architecture-summary.md`), so there is no file collision. However, the semantic overlap is worth reviewing to determine whether both are intentionally kept.

---

**F-13 | Low | Activities README diverges from TOON definitions**

The `activities/README.md` describes checkpoints, steps, and flows that don't fully match the actual TOON files. For example:
- Design Philosophy README shows 5 checkpoints (`problem-classified`, `workflow-path`, `design-philosophy-doc`, `assumptions-review`) but the TOON has 1 (`classification-and-path`)
- Implement README shows 2 checkpoints (`task-complete`, `assumption-review`) but the TOON has 4 (`switch-model-pre-impl`, `confirm-implementation`, `implementation-assumptions-review`, `switch-model-post-impl`)
- Some step names and ordering differ from the TOON

This is the same documentation drift pattern as F-05 but in the activities README.

**File:** `activities/README.md`
**Fix:** Regenerate the activities README from the current TOON definitions.

---

## Compliance Summary by Principle

| # | Principle | Compliance | Findings |
|---|-----------|-----------|----------|
| 1 | Internalize Before Producing | Compliant | — |
| 2 | Define Complete Scope | Compliant | — |
| 3 | One Question at a Time | Compliant | — |
| 4 | Maximize Schema Expressiveness | Partial | F-01 (checkpoint prerequisites as prose) |
| 5 | Convention Over Invention | Compliant | — |
| 6 | Never Modify Upward | Compliant | — |
| 7 | Confirm Before Irreversible Changes | Compliant | — |
| 8 | Corrections Must Persist | Compliant | — |
| 9 | Modular Over Inline | Compliant | — |
| 10 | Encode Constraints as Structure | Partial | F-02 (orchestrator rules text-only) |
| 11 | Non-Destructive Updates | N/A | Review mode |
| 12 | Plan Before Acting | Compliant | — |
| 13 | Format Literacy Before Content | Compliant | All TOON files valid |
| 14 | Complete Documentation Structure | Non-Compliant | F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-13 |

---

## Recommended Fix Priority

1. **Immediate (High):** F-03 through F-07 — Synchronize root README.md with workflow.toon v3.4.0 (version, variable count, checkpoint counts, rules appendix, artifact locations)
2. **Soon (Medium):** F-11 — Add missing defaultValue to `needs_further_discussion`
3. **Backlog (Medium):** F-01, F-02, F-10 — Schema expressiveness and structural enforcement gaps (may require schema evolution)
4. **Backlog (Low):** F-08, F-09, F-12, F-13 — Subfolder README updates and minor structural cleanup
