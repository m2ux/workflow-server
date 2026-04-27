# Intake (Update Mode) — Work Package Workflow Remediation

**Date:** 2026-04-26
**Activity:** `intake`
**Mode:** update (`is_update_mode = true`, `is_review_mode = false`, `user_wants_fixes = true`)
**Target workflow:** `work-package` v3.7.0
**Change request source:** `03-quality-review.md` (this planning folder) — 21 audit findings (5H / 9M / 7L)
**Worker:** `worker-intake-update`

---

## 1. Load Existing Workflow (step: load-existing-workflow)

Loaded `workflows/work-package/workflow.toon` and enumerated subdirectories. The current structural snapshot is:

| Dimension | Count | Notes |
|---|---:|---|
| Workflow files (root) | 4 | `workflow.toon`, `README.md`, `REVIEW-MODE.md`, plus subfolders |
| Activities | 14 | `01-start-work-package` … `14-codebase-comprehension` |
| Skills | 24 | `00-review-code` … `23-reconcile-assumptions` |
| Resources | 28 | `01-readme.md` … `28-pr-review-response.md` (`02-readme.md` is a deprecated redirect) |
| README files | 4 | root + `activities/` + `skills/` + `resources/` |
| Variables declared | 70 | enumerated in `workflow.toon variables[]` |
| Modes | 1 | `review` mode (activates on `is_review_mode`) |
| Initial activity | `start-work-package` | — |
| Workflow version | 3.7.0 | (README still says 3.6.1 — finding 5.1) |
| Schema validation | 39/39 PASS | (`scripts/validate-workflow-toon.ts`) |

Activity sequence (from `activities/*.toon`): `start-work-package → design-philosophy → (requirements-elicitation?) → (research?) → implementation-analysis → plan-prepare → assumptions-review → implement → post-impl-review → validate → strategic-review → submit-for-review → complete`, with `codebase-comprehension` as a sub-flow reached from `design-philosophy` / `assumptions-review`.

Primary skill: `meta/workflow-orchestrator`.

## 2. Parse Change Request (step: parse-change-request)

The change request is the compliance report at `03-quality-review.md`. It does not request *new* features — it requests **remediation of existing audit findings**. Categorized against the schema constructs touched:

### A. Structural rule rewrites (Principle 10 — high severity, 5 items)

| # | Target | Current form | Schema construct(s) to use |
|---|---|---|---|
| 10.1 | `workflow.toon rules[1]` (blocking-checkpoint enforcement) | text-only critical rule | Move to loader/runtime documentation; remove from workflow `rules[]`. |
| 10.2 | `workflow.toon rules[7]` (ORCHESTRATION MODEL) | 4-sentence prose rule, also duplicated in `README.md:328-334` | Remove from `rules[]`; reference once from `README.md` only. |
| 10.3 | `activities/01-start-work-package.toon rules[1]` (Atlassian PREREQUISITE) | text-only | Encode as `entryActions[].validate` on Jira-conditioned steps OR add `condition: jira_cloud_id != null` on `verify-jira-issue` step. |
| 10.4 | `activities/08-implement.toon rules[1]` (SYMBOL VERIFICATION) | text-only | Add a self-review checkpoint with a symbol-provenance question, OR a `validate` exit action. |
| 10.5 | `activities/14-codebase-comprehension.toon rules[7]` (SUFFICIENCY RULE) | restates control-flow that is already a `condition:` | Verify the existing `condition: has_open_questions == true` covers it; if so, delete the rule (anti-pattern 24 — protocol restatement). |

**Operation type per item:** `modify activity` (10.3, 10.4, 10.5) and `change workflow metadata` (10.1, 10.2 — workflow.toon rules array).

### B. Variable declarations (Principle 4 / 10 — medium, 1 finding covering 8+ variables)

Finding 4.4: 10 variables interpolated in messages but not declared. `workflow.toon variables[]` must add:
1. `current_branch` (string)
2. `existing_pr_number` (string)
3. `jira_issue_key` (string)
4. `comprehension_artifact_path` (string)
5. `block_path` (string)
6. `block_line_range` (string)
7. `change_block_index_path` (string)
8. `artifact_name` (string)
9. Plus document `plan` as a complex object variable with `task_count`, `tasks` sub-shape, and `current_assumption` with `id`, `statement`.

**Operation type:** `change workflow metadata` (additions to `workflow.toon variables[]`).

### C. Skill rule refactors (Principle 4 — medium, 2 items)

| # | Target | Action |
|---|---|---|
| 4.1 + 4.2 | `skills/03-create-issue.toon:43-50` `tool-usage` rule | Convert single semicolon-joined string into a grouped `tool-usage[]` array (anti-pattern 26 — flat prefix keys). |
| 4.3 | `skills/22-build-comprehension.toon:86` `tool-usage` rule | Move into the `architecture-survey` step description (anti-pattern 29 — single-step rule). |

**Operation type:** `modify skill`.

### D. Cross-level rule duplication (anti-pattern 27 — medium, 1 item)

`activities/14-codebase-comprehension.toon` rules 1-3 duplicate `skills/22-build-comprehension.toon` rules `persistent-artifacts`, `augment-not-replace`. Delete the activity-level duplicates; keep them only in the skill where the behavior is enforced.

**Operation type:** `modify activity`.

### E. Documentation drift (Principle 5 / 14 — medium, 3 items)

| # | File | Change |
|---|---|---|
| 5.1 | `workflows/work-package/README.md:3` | Version `3.6.1` → `3.7.0` (header line). |
| 5.2 | `workflows/work-package/REVIEW-MODE.md:131-141` | Activity IDs `issue-management`, `update-pr` → `start-work-package`, `submit-for-review`. |
| 5.5 / 9.2 | `workflows/work-package/resources/README.md:13` | Mark `02-readme.md` as deprecated or remove the row. |

**Operation type:** `modify resource` / `modify README`.

### F. Low-priority cleanup (7 items)

| # | Target | Change |
|---|---|---|
| 5.3 | `README.md:6` | Reconcile "fourteen activities" claim with the activity table (13 vs 14 inconsistency). |
| 5.4 | `skills/README.md:5,31` | Reconcile "24" vs "25" skill-count inconsistency. |
| 8.1 | n/a | Soft observation; no change required. |
| 9.1 | `resources/02-readme.md` | Resolve duplicate `id: readme` — give it `readme-deprecated` or delete the file. |
| 9.2 | `resources/README.md` | Remove or annotate the `02 readme-v2` row. |
| 4.5 | `activities/13-complete.toon` | Optionally model terminal state with explicit `transitions[].to: workflow-end`. |
| Tool-Skill-Doc | `01-start-work-package.toon:16` + `skills/03-create-issue.toon:19,29` | Consolidate the Atlassian `cloudId` prerequisite into one authoritative location (folds into 10.3 above). |

### Summary table

| Bucket | Files affected (count) | Operation types |
|---|---:|---|
| A — Principle 10 rule restructures | 4 (`workflow.toon`, 3 activities) | metadata + activity edits |
| B — Variable declarations | 1 (`workflow.toon`) | metadata edit |
| C — Skill rule refactors | 2 (skills 03, 22) | skill edits |
| D — Cross-level duplication | 1 (activity 14) | activity edit |
| E — Doc drift (medium) | 3 (`README.md`, `REVIEW-MODE.md`, `resources/README.md`) | docs edit |
| F — Low-priority cleanup | up to 5 (READMEs, resources/02, activity 13) | docs + resource edits |
| **Total distinct files** | **~14** | |

**Net impact:** mostly metadata/text edits, no new activities, no new skills, no new resources, no transition-graph changes.

## 3. Present Current Structure (step: present-current-structure)

For impact-analysis baseline:

- **Activity graph** is preserved as-is. No additions, deletions, or reorderings. Two activities receive rule-array edits (`08-implement`, `14-codebase-comprehension`); one receives an `entryAction` or `condition` addition (`01-start-work-package`).
- **Skill graph** is preserved as-is. Two skills (`03-create-issue`, `22-build-comprehension`) get rule-array refactors.
- **Resource set:** one resource (`02-readme.md`) is either renamed-by-id or deleted. `resources/README.md` is updated to reflect this. Other resources are untouched.
- **Variables:** `workflow.toon variables[]` grows by 8 declarations (no removals). Total variable count goes from 70 → 78.
- **Workflow rules:** `workflow.toon rules[]` shrinks by up to 2 entries (rule 1 + rule 7 may be removed and migrated to `README.md` / loader docs). Total goes from 7 → 5 (or 7 → 6 if only one is removed).
- **READMEs:** root README, `skills/README.md`, `resources/README.md` get text edits. `REVIEW-MODE.md` gets an ID rename.
- **Schema validation:** must still pass post-edit (`39/39`). All changes are within existing schema constructs.

Tentative scope manifest (to be finalized in `scope-and-structure` activity):

```
modify  workflows/work-package/workflow.toon            (rules[], variables[])
modify  workflows/work-package/README.md                (version header, activity-count text)
modify  workflows/work-package/REVIEW-MODE.md           (activity IDs)
modify  workflows/work-package/activities/01-start-work-package.toon  (entryAction or condition for Jira)
modify  workflows/work-package/activities/08-implement.toon           (symbol-verification structural enforcement)
modify  workflows/work-package/activities/14-codebase-comprehension.toon (delete duplicated rules; possibly delete sufficiency-rule)
modify  workflows/work-package/skills/03-create-issue.toon            (tool-usage[] grouped form)
modify  workflows/work-package/skills/22-build-comprehension.toon     (move single-step rule into step description)
modify  workflows/work-package/skills/README.md                       (skill count reconciliation)
modify  workflows/work-package/resources/README.md                    (deprecated row for 02-readme.md)
modify-or-delete  workflows/work-package/resources/02-readme.md       (resolve duplicate id or delete)
optional-modify  workflows/work-package/activities/13-complete.toon   (terminal-state expressiveness)
```

13 files modified, 0–1 deleted, 0 added. Scope manifest will be confirmed in the `scope-and-structure` activity per Principle 2.

---

## Outcome (intake)

- Operation classified: **update** (existing workflow remediation).
- `workflow_id = work-package`, `target_workflow_id = work-package`, `is_update_mode = true`.
- Design intent extracted: apply the 21 audit findings from `03-quality-review.md`, prioritized H → M → L. The 5 high-severity items require design judgment (each text-only rule has a reason for being prose); the 14 M/L items are mostly mechanical doc/variable hygiene.
- Variables to preserve into next activity: `target_workflow_id`, `workflow_id`, `is_update_mode`, `planning_folder_path`, `review_findings_count`, `user_wants_fixes`.

Next activity per workflow definition: `context-and-literacy` (already completed in this session for review mode; will likely re-enter in update-mode shape to confirm format/construct literacy for editing).
