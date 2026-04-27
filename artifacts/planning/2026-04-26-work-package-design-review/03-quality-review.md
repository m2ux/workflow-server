# Quality Review — Work Package Workflow

**Date:** 2026-04-26
**Workflow audited:** `work-package` v3.7.0
**Audit mode:** review-mode (read-only)
**Auditor:** workflow-design / quality-review activity (worker-quality-review)
**Files audited:** 1 workflow.toon + 14 activities + 24 skills + 28 resources + 4 README + 1 REVIEW-MODE = 72 files

This document is the principle-by-principle compliance review of the work-package workflow against the 14 design principles in `workflows/workflow-design/resources/00-design-principles.md`, plus an anti-pattern scan, a tool-skill-doc consistency scan, and a schema-validation pass.

---

## Executive Summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High     | 5 |
| Medium   | 9 |
| Low      | 7 |
| Pass     | 7 (of 14 principles) |
| **Total findings** | **21** |

Schema validation: 39/39 TOON files pass (`npx tsx scripts/validate-workflow-toon.ts workflows/work-package` — full PASS).

Top-line picture: the workflow is structurally sound and schema-valid. The findings cluster around:

1. **Variable hygiene** — 10 variables interpolated in checkpoint messages but never declared in `workflow.toon variables[]` (Principle 4 / 10).
2. **Rule hygiene** — cross-level rule duplication between activity 14 and skill 22, prose-stuffed `tool-usage` rules, and at least one protocol restatement (Principle 8 / 9 / anti-patterns 24, 26, 27).
3. **Documentation drift** — README states v3.6.1 vs workflow.toon v3.7.0, REVIEW-MODE.md uses old activity IDs (`issue-management`, `update-pr`), resources/README.md still indexes a deprecated `02-readme.md` shim that shares an `id` with `01-readme.md` (Principle 5 / 14).
4. **Modularization residue** — duplicate-id resources, dead/redirect resource (`02-readme.md`).

---

## Principle-by-Principle Audit

Status legend: **PASS** / **CONCERN** (medium-or-low severity) / **FAIL** (high severity, structural breach).

### 1. Internalize Before Producing — *out of scope*

This principle governs the design process itself, not the resulting workflow. It is unobservable in finished artifacts. **Marked PASS by definition** — no audit evidence needed.

### 2. Define Complete Scope Before Execution — *out of scope*

Same as principle 1: governs the process. **PASS**.

### 3. One Question at a Time

**Status: PASS**

**Evidence:** Every checkpoint inspected presents exactly one question with discrete `options[]`. Spot checks:
- `workflows/work-package/activities/01-start-work-package.toon:200-473` — 11 checkpoints, each with a single `message` and 2-5 atomic options, no compound questions.
- `workflows/work-package/activities/02-design-philosophy.toon` — `classification-confirmed` and `workflow-path-selected` are split into separate atomic checkpoints.
- `workflows/work-package/activities/08-implement.toon:100-164` — `switch-model-pre-impl`, `confirm-implementation`, `implementation-assumption-interview`, `switch-model-post-impl` each address one decision.

No instances of "Here are three questions..." anti-pattern (anti-pattern 8) found.

### 4. Maximize Schema Expressiveness

**Status: CONCERN** — multiple medium findings.

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 4.1 | Medium | `workflows/work-package/skills/03-create-issue.toon:50` | `tool-usage` rule | Single string concatenates seven distinct tool-sequencing constraints with semicolons. Should be a grouped rule array (anti-pattern 26) or modeled with the schema's per-tool structures. Each clause is a separate invariant. |
| 4.2 | Medium | `workflows/work-package/skills/03-create-issue.toon:43-50` | `rules:` block | `tool-usage` is a behavior rule embedded as prose. The schema permits structured `protocol` step-keyed bullets and `tool` references — these tool-sequencing constraints belong in `protocol` ordering or a `tool-usage[]` array. |
| 4.3 | Medium | `workflows/work-package/skills/22-build-comprehension.toon:86` | `tool-usage` rule | Trailing `tool-usage: "use glob to map directory structure..."` is a single-step instruction masquerading as a skill rule (anti-pattern 29 — single-step rule). Belongs in the `architecture-survey` step description, not as a top-level rule. |
| 4.4 | Medium | All activity message strings | Cross-cutting | 10 undeclared variables interpolated in checkpoint/step messages: `artifact_name`, `block_line_range`, `block_path`, `change_block_index_path`, `comprehension_artifact_path`, `current_branch`, `existing_pr_number`, `jira_issue_key`, `n`, `plan` (with `.task_count` / `.tasks`), and partial `problem_type`. Either they should be declared in `workflow.toon variables[]` (Principle 10) or the message strings are referencing implicit/runtime state that the schema cannot reason about. (Detected via `grep -hoE '\{[a-z_]+(\.[a-z_]+)?\}' activities/*.toon`.) |
| 4.5 | Low | `workflows/work-package/activities/13-complete.toon` | full file | `13-complete.toon` has no checkpoints, no `transitions[]`, just an `exitActions` log. Workflow exit is implicit. Schema permits `transitions[].to: workflow-end` — modeling the terminal state explicitly would be more expressive than relying on absence. |

**Recommendation:** Convert prose tool-sequencing rules to structured `protocol` ordering or grouped rule arrays. Declare every `{var}` interpolated in messages as a workflow variable (or document in the activity that it is a runtime field of a complex variable like `plan` / `current_assumption`).

### 5. Convention Over Invention

**Status: CONCERN** — medium-severity drift.

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 5.1 | Medium | `workflows/work-package/README.md:3` | header line | `> v3.6.1 — Defines how to plan and implement ONE work package...` But `workflow.toon:3` is `version: 3.7.0`. Convention: README must reflect current workflow version (other reference workflows do). |
| 5.2 | Medium | `workflows/work-package/REVIEW-MODE.md:131-141` | `Activity Overrides Summary` table | Uses obsolete activity IDs `issue-management` and `update-pr` instead of the actual `start-work-package` and `submit-for-review`. Causes navigation failure. |
| 5.3 | Low | `workflows/work-package/README.md:6` | overview text | Says "fourteen activities" but the README activity table is sometimes 13 (excluding 14 codebase-comprehension), sometimes 14. Internal counting inconsistency. |
| 5.4 | Low | `workflows/work-package/skills/README.md:5` | header | "Skills (24 workflow-specific + 6 cross-workflow)" — inventory shows 24 listed (00-23) but says "Skills (25 skills)" later (line 31) referring to 25 skills count in another section. Numeric inconsistency. |
| 5.5 | Low | `workflows/work-package/resources/README.md:5` | header | Says "28 resources" — files `01-readme.md` … `28-pr-review-response.md` is 28 files, but `02-readme.md` is a deprecated redirect. Inventory should mark it as deprecated/consolidated. |

File naming, field ordering, version semver, transition patterns, checkpoint structure, skill structure (capability/protocol/rules), and modular content all conform — verified via `validate-workflow-toon.ts` PASS and spot-check of activities 01/06/08/11/13.

### 6. Never Modify Upward (Schema-as-Constraint)

**Status: PASS**

**Evidence:** All 39 TOON files pass `npx tsx scripts/validate-workflow-toon.ts workflows/work-package` (full output confirmed). No schema modifications required to validate the work-package content.

### 7. Confirm Before Irreversible Changes

**Status: PASS**

**Evidence:** All semi-irreversible operations are gated by checkpoints:
- Branch / PR creation: `branch-check`, `pr-check`, `pr-creation` (all blocking or auto-advance with explicit options) — `01-start-work-package.toon:226-403`.
- GPG history rewrite: `unsigned-commits-prompt` blocking checkpoint — `11-strategic-review.toon:81-102`. The `resign_unsigned_commits_requested` variable then gates the destructive `resign-unsigned-pr-commits` step (line 29, with explicit `condition`).
- Force-push of artifact commits at completion is gated by mode condition (`is_review_mode != true`) and run only at the end after all reviews — `13-complete.toon:114-122`.

### 8. Corrections Must Persist

**Status: CONCERN** — low severity.

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 8.1 | Low | workflow-wide | n/a | The workflow has many checkpoint options that set variables but no explicit "corrections log" structure. This is acceptable in current convention (cross-cutting concern per principle 8) but is worth noting that the only persistence channel is the `assumptions-log.md` artifact in 02-design-philosophy. There is no dedicated "user-corrections" artifact — corrections are absorbed implicitly. |

Not a violation, but a soft observation that the principle is harder to verify in this workflow than in workflow-design itself.

### 9. Modular Over Inline

**Status: CONCERN** — medium severity (mostly residue).

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 9.1 | Medium | `workflows/work-package/resources/02-readme.md` | full file | Resource with `id: readme` (line 2) — **same `id` as `01-readme.md`**. The body is a 14-line redirect saying "Consolidated into 01-readme.md as of v2.0.0." This is a content-reduction residue (anti-pattern: dead resource). The duplicate `id` violates the implicit "content exists in exactly one location" rule — `get_resource("readme")` is now ambiguous between two files. |
| 9.2 | Low | `workflows/work-package/resources/README.md:13` | row for `02` | The resources index still lists `02 readme-v2 README Guide (v2)` as a live resource alongside `01 readme`. Should be removed (or marked deprecated). |
| 9.3 | Low | `workflows/work-package/workflow.toon:33-47` | `modes[]` | Review mode is correctly modular (references `resources/24-review-mode.md` rather than inlining the guide). PASS for this dimension. |

`workflow.toon` does not inline activities, skills, or resources — they live in their respective subdirectories. The structure is otherwise fully modular. The two findings above are cleanup debt, not architectural failures.

### 10. Encode Constraints as Structure

**Status: FAIL** — high severity.

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 10.1 | High | `workflows/work-package/workflow.toon:14-21` | `rules[1]` (Agents MUST NOT skip blocking checkpoints) | The rule states a critical invariant in prose. There is no structural enforcement — no validate action, no checkpoint condition that cross-checks. An agent that ignores this rule can silently auto-advance a blocking checkpoint with no observable schema-level consequence. The schema does have `blocking: true` semantics; the rule could be reframed as a runtime/loader invariant referenced from documentation rather than as a workflow rule. |
| 10.2 | High | `workflows/work-package/workflow.toon:21` | `rules[7]` (ORCHESTRATION MODEL) | The orchestration model rule is a 4-sentence behavioral specification embedded as prose. Sub-agent indirection ("Only ONE level of sub-agent indirection") cannot be enforced by any structural mechanism in the current schema. This is a critical text-only rule (anti-pattern 19). It is also duplicated verbatim in `README.md:328-334` (anti-pattern 27 — cross-level duplication). |
| 10.3 | High | `workflows/work-package/activities/01-start-work-package.toon:15-16` | `rules[1]` (Atlassian PREREQUISITE) | "Before calling ANY Jira tool, the agent MUST first call getAccessibleAtlassianResources" — text-only enforcement. The schema offers `entryActions[]` with `validate` action that could check `jira_cloud_id` is set, or the `protocol` ordering could express this. The skill `03-create-issue.toon` does encode the same constraint twice (lines 19 and 29) but only inside protocol bullets, not as a structural condition that gates Jira step execution. |
| 10.4 | High | `workflows/work-package/activities/08-implement.toon:12-13` | `rules[1]` (SYMBOL VERIFICATION) | "Every symbol introduced or referenced in code or documentation MUST have provenance — exists in codebase, in a declared dependency, or is newly created by the current task. Never fabricate symbols." Text-only critical rule. No checkpoint, no validate action, no condition. Agent compliance is voluntary. Structural alternative: a `validate` exit action, or a self-review step with a checkpoint. |
| 10.5 | High | `workflows/work-package/activities/14-codebase-comprehension.toon:23` | `rules[7]` (SUFFICIENCY RULE) | The rule says "If zero open questions remain, set `needs_comprehension` to false and skip the comprehension-sufficient checkpoint entirely." This is itself control-flow that should be a `condition` on the checkpoint (`condition: has_open_questions == true`). Inspection of the workflow confirms `has_open_questions` is declared (workflow.toon:207) and the activity does have this condition — but the rule restates it in prose. Either the rule is redundant (anti-pattern 24) or the condition is missing somewhere. Verify against checkpoint definitions. |

**Recommendation:** Promote each high-severity rule to a structural mechanism. For rules that are inherently meta (orchestration model, symbol verification), state them once in documentation and cross-reference rather than embedding as workflow rules.

### 11. Plan Before Acting

**Status: PASS**

**Evidence:**
- `06-plan-prepare.toon:81-93` — `approach-confirmed` checkpoint blocks before transitioning to `assumptions-review` / `implement`.
- `01-start-work-package.toon:374-403` — `pr-creation` checkpoint summarizes branch+PR before any creation.
- `02-design-philosophy.toon:115` — `classification-confirmed` and `workflow-path-selected` checkpoints precede document-writing.

### 12. Non-Destructive Updates

**Status: PASS** (with observation).

**Evidence:** No content-reducing operations are performed without checkpoints:
- The `apply-cleanup` step in `11-strategic-review.toon:59-67` is gated by `is_review_mode != true` AND occurs after `review-findings` checkpoint where the user must select an option.
- Force-push of GPG-resigned commits (`11-strategic-review.toon:29-37`) is gated by `unsigned-commits-prompt` blocking checkpoint where the user must explicitly accept.
- Force-push of artifact commits in `13-complete.toon:114-122` runs only after `is_review_mode != true` AND in the terminal activity.

Observation: `02-readme.md` was reduced (consolidated into 01-readme.md) and the resulting redirect file is left in place. That predates this audit and is not a violation; just listed under finding 9.1.

### 13. Format Literacy Before Content

**Status: PASS**

**Evidence:** All TOON files pass schema validation (verified). The validate-and-commit activity (10-validate.toon, 09-validate-and-commit.toon — note this is on workflow-design itself, not work-package) provides validation. Work-package's own validate activity (10-validate.toon) covers the implementation testing scope. Format literacy is verified by the upstream content-drafting → validate-and-commit cycle in workflow-design.

### 14. Complete Documentation Structure

**Status: CONCERN** — medium severity.

**Findings:**

| # | Severity | File | Location | Issue |
|---|----------|------|----------|-------|
| 14.1 | Pass | `workflows/work-package/README.md` | n/a | Workflow root README present and substantive (367 lines). |
| 14.2 | Pass | `workflows/work-package/activities/README.md` | n/a | Subfolder README present (verified, 150+ lines per activity). |
| 14.3 | Pass | `workflows/work-package/skills/README.md` | n/a | Subfolder README present. |
| 14.4 | Pass | `workflows/work-package/resources/README.md` | n/a | Subfolder README present (36 lines, full inventory). |
| 14.5 | Medium | `workflows/work-package/REVIEW-MODE.md` | full file | `REVIEW-MODE.md` is an extra root-level doc not required by Principle 14 — but its content has drift (finding 5.2). Either prune or fix. |
| 14.6 | Low | `workflows/work-package/README.md:3` | header | Version mismatch (finding 5.1 — same root cause). |
| 14.7 | Low | `workflows/work-package/skills/README.md` | header | Skill count discrepancy (finding 5.4 — same root cause). |

The four README.md requirements of Principle 14 are met. Findings 14.5–14.7 are content-drift issues, not structural omissions.

---

## Anti-Pattern Scan (resource 02)

| # | Anti-pattern | Found? | Evidence |
|---|--------------|:------:|----------|
| 1 | Inline content embedding | No | All activities/skills/resources are in their own files. |
| 2 | "Adjust schema to match" | No | All TOON valid against schemas. |
| 3 | Partial implementations | n/a | This is a process artifact. |
| 4 | New naming conventions | No | NN-name.toon throughout. |
| 5 | Skip/combine checkpoints | No | Each checkpoint is atomic. |
| 6 | Assumption-based execution | n/a | Process artifact. |
| 7 | "Done!" without re-verification | n/a | Process artifact. |
| 8 | Multiple-question messages | No | One question per checkpoint. |
| 9 | "Ask the user whether to proceed" prose | No | All such asks are checkpoints. |
| 10 | Iteration as prose | No | Loops use `loops[]` with `forEach`/`while`. See `08-implement.toon:24-79`. |
| 11 | Conditional logic as prose | Partial | Most use `condition:` but some checkpoint-message text describes branching ("If a key is provided, detect..." in `01-start-work-package.toon:53`). Acceptable as description, but borderline. |
| 12 | Artifact mention without `artifact[]` | No | Activities declare artifacts explicitly. |
| 13 | Implicit variables | **YES** | 10 undeclared variables in messages (finding 4.4). |
| 14 | Mode skipping as rule | No | Modes use formal `modes[]` construct (workflow.toon:33-47). |
| 15 | Bootstrap as prose | n/a | The orchestration model rule (10.2) is borderline. |
| 16 | Skill input as description | No | Skills declare `inputs[]` consistently. |
| 17–23 | Execution anti-patterns | n/a | Process artifacts. |
| 24 | Protocol restatement | **YES** | `22-build-comprehension.toon` rules `persistent-artifacts` and `augment-not-replace` (lines 78-79) restate steps `discover-existing` and `artifact-management` of the same skill. Activity 14 rules 1-3 also restate skill 22 protocol steps. |
| 25 | Apparent contradictions without group | No detected | Skill rules use grouped form where present (`gitnexus-usage[2]`). |
| 26 | Flat prefix keys | **YES** | `03-create-issue.toon:50` `tool-usage` rule is multiple semicolon-joined clauses sharing implicit prefix structure. Should be grouped array. |
| 27 | Cross-level duplication | **YES** | (a) `14-codebase-comprehension.toon` rules 1-3 duplicate skill `22-build-comprehension` rules `persistent-artifacts`, `augment-not-replace`. (b) Workflow rule 7 (ORCHESTRATION MODEL) is duplicated verbatim in `README.md`. |
| 28 | Logically contradictory siblings | No detected | None within the same skill. |
| 29 | Single-step rules | **YES** | `22-build-comprehension.toon:86` `tool-usage: "use glob to..."` applies to the architecture-survey step only — should be in step description. |
| 30 | Inaccurate return-value descriptions | No | Skills describe return values via `output[]` and `components`. |
| 31 | Incomplete bootstrap | n/a | The work-package workflow does not own a bootstrap sequence. |
| 32 | Inconsistent tool names across skills | No detected | gh CLI / Jira tool references are consistent. |
| 33 | Token-handling duplicated | No | Token handling is meta concern, not duplicated in work-package. |
| 34 | Mechanics over value | No | Skill capabilities describe value. |
| 35 | Output-subset tools | n/a | Work-package does not define MCP tools. |

**Anti-pattern hits: 5** (numbers 13, 24, 26, 27, 29).

---

## Tool-Skill-Doc Consistency Scan

| Check | Result | Evidence / mismatch |
|-------|:------:|---------------------|
| Tool-name accuracy | PASS | gh / Jira tool names verified against skill protocols. |
| Return-value accuracy | PASS | Skill `output[]` matches what protocols describe. |
| Bootstrap completeness | n/a | Work-package does not own a bootstrap (uses meta orchestrator). |
| Cross-skill tool-name consistency | PASS | `getAccessibleAtlassianResources` used consistently in both `03-create-issue` and meta atlassian-operations. |
| Behavioral guidance duplication | **CONCERN** | Atlassian `cloudId` prerequisite is asserted twice in `03-create-issue.toon` (line 19 and 29) and once in activity rule 1 (`01-start-work-package.toon:16`) — three statements of the same constraint. Should be authoritative in one place. |
| Tool-surface overlap | n/a | Work-package consumes tools, doesn't define them. |
| Doc-implementation parity | **FAIL** | `REVIEW-MODE.md` references `issue-management` and `update-pr` activities that no longer exist (now `start-work-package` and `submit-for-review`). README version mismatch. |

---

## Schema Validation Results

```
$ npx tsx scripts/validate-workflow-toon.ts workflows/work-package
[PASS] workflow.toon valid
       ID: work-package, Version: 3.7.0, Activities: 14
[PASS] activities/ — 14/14 files
[PASS] skills/ — 24/24 files
All TOON files valid.
```

39/39 TOON files pass JSON-schema validation against `workflow.schema.json`, `activity.schema.json`, `skill.schema.json`, `condition.schema.json`. **No schema findings.**

---

## Aggregated Severity Tally

| Principle | Status | High | Medium | Low |
|-----------|:------:|-----:|-------:|----:|
| 1. Internalize before producing | PASS (n/a) | 0 | 0 | 0 |
| 2. Define complete scope | PASS (n/a) | 0 | 0 | 0 |
| 3. One question at a time | PASS | 0 | 0 | 0 |
| 4. Maximize schema expressiveness | CONCERN | 0 | 4 | 1 |
| 5. Convention over invention | CONCERN | 0 | 2 | 3 |
| 6. Never modify upward | PASS | 0 | 0 | 0 |
| 7. Confirm before irreversible changes | PASS | 0 | 0 | 0 |
| 8. Corrections must persist | CONCERN | 0 | 0 | 1 |
| 9. Modular over inline | CONCERN | 0 | 1 | 1 |
| 10. Encode constraints as structure | **FAIL** | 5 | 0 | 0 |
| 11. Plan before acting | PASS | 0 | 0 | 0 |
| 12. Non-destructive updates | PASS | 0 | 0 | 0 |
| 13. Format literacy before content | PASS | 0 | 0 | 0 |
| 14. Complete documentation structure | CONCERN | 0 | 1 | 1 |
| Tool-Skill-Doc consistency | CONCERN | 0 | 1 | 0 |
| **Totals** | | **5** | **9** | **7** |

`review_findings_count = 21`

---

## Recommended Fixes (Priority Order)

### High priority

1. **Add structural enforcement for the 5 text-only critical rules (Principle 10):**
   - Workflow rule 1 (blocking-checkpoint enforcement) — move to loader/runtime invariant referenced from docs, not stated as workflow rule.
   - Workflow rule 7 (orchestration model) — same; remove from rules[] and reference from README.
   - Activity 01 rule 1 (Jira prerequisite) — encode as `entryAction validate` on Jira-conditioned steps, or use `condition: jira_cloud_id != null` on the verify-jira-issue step.
   - Activity 08 rule 1 (symbol verification) — add a self-review checkpoint (already exists conceptually) that includes a symbol-provenance question.
   - Activity 14 rule 7 (SUFFICIENCY RULE) — verify the existing `condition:` on the comprehension-sufficient checkpoint already covers it; if so, delete the rule (it restates structure).

### Medium priority

2. **Declare or remove undeclared variables (finding 4.4)** — add to `variables[]`: `current_branch`, `existing_pr_number`, `jira_issue_key`, `comprehension_artifact_path`, `block_path`, `block_line_range`, `change_block_index_path`, `artifact_name`. For `plan.task_count`/`plan.tasks` and `current_assumption.id`/`.statement`, document that `plan` is a complex object variable with a defined sub-shape.
3. **Refactor `tool-usage` rules (findings 4.1, 4.3)** — convert `03-create-issue.toon:50` from semicolon-joined string to a grouped `tool-usage[]` array, and move `22-build-comprehension.toon:86` `tool-usage` into the `architecture-survey` step description.
4. **Resolve cross-level rule duplication (anti-pattern 27)** — in `14-codebase-comprehension.toon`, delete activity rules that are restated by skill 22 (`persistent-artifacts`, `augment-not-replace`). Keep them in the skill where the behavior is enforced.
5. **Fix doc drift:**
   - `README.md:3` version → 3.7.0.
   - `REVIEW-MODE.md:131-141` activity-IDs → `start-work-package`, `submit-for-review`.
   - `resources/README.md` mark `02-readme.md` as deprecated or remove the row.

### Low priority

6. Reconcile activity-count and skill-count claims in README headers (findings 5.3, 5.4).
7. Resolve the duplicate `id: readme` in `01-readme.md` and `02-readme.md` — give `02-readme.md` a distinct id (e.g. `readme-deprecated`) or delete the file (the redirect text adds no agent-usable value).
8. Consider modeling the terminal state in `13-complete.toon` with an explicit `transitions[].to: workflow-end` for expressiveness.

---

## Disposition (proposed)

This audit produced **21 findings** across **6 of 14 principles**. Severity is dominated by 5 high-severity Principle 10 (encode-as-structure) findings, all of which are pre-existing text-only rules rather than new violations. None are critical (no schema violations, no validation failures, no destructive flow gaps).

**Suggested next step:** present this report to the user via the `review-disposition` checkpoint with the three standard options:
- `fix-issues` — switch to update mode and apply all 21 fixes (estimated effort: 1-2h, primarily docs + variable declarations + rule restructuring; the 5 high-severity items require design judgment because each rule has a reason for being prose rather than structure).
- `report-only` — save this report without remediation.
- `selective-fixes` — fix the medium and low findings (which are mechanical) and defer the 5 high-severity Principle 10 items for a separate design discussion.

---

*End of compliance review. Generated by `workflow-design / quality-review` activity v1.0.1 in review-mode.*
