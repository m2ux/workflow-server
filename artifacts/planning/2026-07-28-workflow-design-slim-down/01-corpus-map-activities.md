All paths below are relative to the corpus root **`/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/`**. Schema at `/home/mike1/projects/dev/workflow-server/schemas/activity.schema.json`. All 9 activities pass `scripts/validate-activities.ts` (108 passed, 0 failed) — every finding below is semantic, not schema-invalid.

---

# PART A — Exhaustive inventory, 9 activities

Workflow-level context: `workflow-design/workflow.yaml` v1.30.0, 63 variables, `initialActivity: intake-and-context` (:265), `rules.activity` = 2 entries (:17, :18), `techniques.activity: [variable-binding]` (:20-21).

**No activity declares an activity-level `rules:` block.** Grep over `workflow-design/activities/*.yaml` returns zero `rules:` hits. The only `decisions:` block in the corpus is `08-quality-review.yaml:508`. The only `when:` (string-form) gates are the 8 in `10-post-update-review.yaml:172,179,183,187,196,200,210,213`; every other gate is a structured `condition:`.

## 01 — `intake-and-context`, v1.8.0, prefix `01`, `required: true`
No `techniques:` block. 16 steps, 16 top-level (no loops).

| # | id | kind | technique | condition |
|---|---|---|---|---|
| 1 | `bind-planning-folder-path` | action | — (`set planning_folder_path`, value-LESS + `message`, :9-12) | none |
| 2 | `intake-classification` | technique | `intake-classification` | none |
| 3 | `persist-structural-inventory` | technique | `work-package::manage-artifacts::write-artifact` (`structural-inventory.md`) | `or(operation_type==update, ==review)` :24-34 |
| 4 | `design-intent-batch` | **checkpoint** | — | `and(intent_needs_confirmation==true, update_seeded_from_review!=true)` :37-47 |
| 5 | `announce-certain-intent` | action | — (`message` only) | `and(intent_needs_confirmation==false, update_seeded_from_review!=true, operation_type!=review)` |
| 6 | `announce-certain-review-scope` | action | — (`set review_scope_confirmed=true` + `message`) | `and(operation_type==review, intent_needs_confirmation==false)` |
| 7 | `announce-review-seeded-update` | action | — (`message` only) | `update_seeded_from_review==true` |
| 8 | `announce-headless` | action | — (`message` only) | `headless_mode==true` |
| 9 | `announce-interactive` | action | — (`message` only) | `headless_mode==false` |
| 10 | `initialize-planning-folder` | technique | `workflow-engine::create-readme` (seed `workflow-design/readme-seed`) | `operation_type!=review` |
| 11 | `context-loading` | technique | `context-loading` | **none** |
| 12 | `persist-format-conventions` | technique | write-artifact (`format-conventions.md`) | **none** :175-181 |
| 13 | `persist-applicable-constructs` | technique | write-artifact (`applicable-constructs.md`) | `operation_type==create` |
| 14 | `present-problem-overview` | technique | `work-package::stakeholder-overview` + `message` | `operation_type!=review` |
| 15 | `auto-confirm-literacy` | action | — (`set format_literacy_confirmed=true`, `set schema_constructs_confirmed=true`) | `operation_type!=review` :210-216 |
| 16 | `clear-review-seed-flag` | action | — (`set update_seeded_from_review=false`) | `update_seeded_from_review==true` |

**Checkpoint** `design-intent-batch` (:35-88): `blocking: true`, **no** `defaultOption`, **no** `autoAdvanceMs`. 5 options, **all 5 carry `effect.setVariable`**: `confirm-intent` (`intent_needs_confirmation:false, review_scope_confirmed:true`), `confirm-create` (`operation_type:create,…`), `confirm-update` (`operation_type:update,…`), `wrong-review-target` (`review_scope_confirmed:false, intent_needs_confirmation:true`), `cancel-as-create` (`operation_type:create,…`).

**Transitions** (:235-260): `to: quality-review` if `and(operation_type==review, review_scope_confirmed==true)`; `to: requirements-refinement` if `and(format_literacy_confirmed==true, schema_constructs_confirmed==true)`, `isDefault: true`.
**Outcome**: 4 bullets (:261-266).

## 03 — `requirements-refinement`, v1.10.0, prefix `03`, `required: true`
`techniques: [scatter-gather]` (:6-7). 14 top-level steps, 18 including loop bodies.

| # | id | kind | technique | condition |
|---|---|---|---|---|
| 1 | `design-context` | **checkpoint** | — | `operation_type!=update` |
| 2 | `set-design-dimensions` | technique | `derive-design-dimensions` | **none** |
| 3 | `synthesize-update-specification` | technique | `synthesize-update-specification` | `operation_type==update` |
| 4 | `dimension-elicitation-loop` | **loop** `forEach current_dimension over design_dimensions`, `maxIterations: 12` | — | `operation_type!=update` |
| 4a | `prepare-dimension` | technique | `prepare-dimension` | none |
| 4b | `surface-dimension-questions` | action | — (`message` `{dimension_questions}`) | none |
| 4c | `capture-dimension` | technique | `capture-dimension` | none |
| 5 | `persist-specification` | technique | `persist-design-specification` | **none** |
| 6 | `persist-design-specification-artifact` | technique | write-artifact (`design-specification.md`) | **none** |
| 7 | `spec-confirmed` | **checkpoint** | — | **none** |
| 8 | `announce-specification` | action | — (`message` only) | none |
| 9 | `collect-assumptions` | technique | `work-package::review-assumptions::collect` | **none** |
| 10 | `reconcile-assumptions` | technique | `reconcile-design-assumptions` | **none** |
| 11 | `assumption-reconciliation` | **loop** `while has_resolvable_assumptions==true`, **no `maxIterations`** :101-113 | — | — |
| 11a | `reconcile-iteration` | technique | `reconcile-design-assumptions` | none |
| 12 | `announce-open-judgements` | action | — (`message` only) | `has_open_assumptions==true` |
| 13 | `seed-assumption-decisions` | action | — (`set assumption_decisions=[]` + `message`) | none |
| 14 | `update-assumptions-log` | technique | `work-package::review-assumptions::record` (`assumption_decisions`) | **none** |

**Checkpoints**: `design-context` (:9-26) `blocking:false`, `defaultOption: skip-context`, `autoAdvanceMs: 30000`, 2 options, **0 effects**. `spec-confirmed` (:73-85) `blocking:false`, `defaultOption: confirmed`, `autoAdvanceMs: 30000`, 2 options, **0 effects**.
**Transitions** (:138-146): `to: impact-analysis` if `operation_type==update`; `to: pattern-analysis`, `isDefault: true`, **no condition**.
**Outcome**: 2 bullets (:147-149).

## 04 — `pattern-analysis`, v1.3.1, prefix `04`, `required: false`
No `techniques:` block. 3 steps. **Zero conditions anywhere in the file.**

1. `pattern-analysis` — technique `pattern-analysis`
2. `persist-pattern-analysis` — write-artifact (`pattern-analysis.md`)
3. `patterns-confirmed` — **checkpoint** (:18-33): `blocking:false`, `defaultOption: adopt-all`, `autoAdvanceMs: 30000`, 3 options (`adopt-all`/`selective`/`diverge`), **0 effects**

**Transitions**: `to: scope-and-draft`, `isDefault: true`, no condition (:34-36). **Outcome**: 1 bullet.

## 05 — `impact-analysis`, v1.5.0, prefix `05`, `required: false`
No `techniques:` block. 4 steps.

1. `impact-analysis` — technique `impact-analysis` — `operation_type==update`
2. `persist-impact-analysis` — write-artifact (`impact-analysis.md`) — `operation_type==update`
3. `impact-no-removals` — action, `message` only — **`removal_count==0`** (:28-37)
4. `impact-and-preservation-confirmed` — **checkpoint** — `removal_count>0`; `blocking:false`, `defaultOption: confirmed`, `autoAdvanceMs: 30000`, 3 options (`confirmed`/`revise-impact`/`preserve`), **0 effects**

**Transitions**: `to: scope-and-draft`, `isDefault: true`, no condition. **Outcome**: 3 bullets (:62-65).

## 06 — `scope-and-draft`, v1.11.0, prefix `06`, `required: true`
`techniques: [scatter-gather]`. **18 top-level, 30 including loop bodies.**

| # | id | kind | technique | condition |
|---|---|---|---|---|
| 1 | `derive-workflows-target-path` | technique | `derive-workflows-target-path` | `operation_type!=review` |
| 2 | `ensure-workflow-worktree` | technique | `prepare-workflow-branch` | `operation_type!=review` |
| 3 | `scope-definition` | technique | `scope-definition` | none |
| 4 | `persist-scope-manifest` | technique | write-artifact (`scope-manifest.md`) | none |
| 5 | `scope-and-structure-confirmed` | **checkpoint** | — | none |
| 6 | `present-solution-overview` | technique | `work-package::stakeholder-overview` + `message` | none |
| 7 | `file-drafting-loop` | **loop** `forEach current_file over scope_manifest`, `maxIterations: 50` | — | `scope_manifest_confirmed==true` |
| 7a | `assemble-file-approach` | technique | `assemble-file-approach` | none |
| 7b | `persist-drafting-plan` | technique | write-artifact (`drafting-plan.md`) | none |
| 7c | `file-approach-confirmed` | **checkpoint** | — | `operation_type!=update` |
| 7d | `yaml-authoring` | technique | `yaml-authoring` | none |
| 7e | `review-drafted-file` | technique | `review-drafted-file` | none |
| 7f | `persist-file-review-note` | technique | write-artifact (`file-review-note.md`) | none |
| 7g | `file-review` | **checkpoint** | — | `operation_type!=update` |
| 7h | `preservation-check` | **checkpoint** | — | `and(operation_type==update, has_unflagged_removals==true)` |
| 8 | `review-draft-yaml` | technique | `review-draft-yaml` | none |
| 9 | `persist-draft-attestation` | technique | write-artifact (`draft-attestation.md`) | none |
| 10 | `verify-artifact-conforms` | technique | `verify-artifact-conforms` | none |
| 11 | `pre-attestation-audit-principles` | technique | `audit-principles` | `operation_type=="update"` |
| 12 | `pre-attestation-audit-anti-patterns` | technique | `audit-anti-patterns` | `operation_type=="update"` |
| 13 | `classify-pre-attestation-findings` | action | 4 value-LESS `set`s (`principle_finding_count`, `anti_pattern_finding_count`, `needs_audit_fixes`, `has_critical_finding`) | `operation_type=="update"` |
| 14 | `pre-attestation-fix-cycle` | **loop** `while needs_audit_fixes=="true"`, `maxIterations: 2` | — | — |
| 14a | `apply-pre-attestation-fixes` | technique | `apply-audit-fixes` | none |
| 14b | `re-audit-principles` | technique | `audit-principles` | none |
| 14c | `re-audit-anti-patterns` | technique | `audit-anti-patterns` | none |
| 14d | `reassess-pre-attestation-findings` | action | 4 value-LESS `set`s | none |
| 15 | `pre-attestation-findings-remain` | action | `message` only | `and(operation_type=="update", needs_audit_fixes=="true")` |
| 16 | `pre-attestation-blocker` | **checkpoint** | — | `has_critical_finding=="true"` |
| 17 | `draft-attestation` | **checkpoint** | — | `operation_type!=update` |
| 18 | `batch-review-attested` | **checkpoint** | — | `operation_type=="update"` |

**Checkpoints (7):**
- `scope-and-structure-confirmed` (:36-51) `blocking:false`, `defaultOption: confirmed`, `autoAdvanceMs:30000`, 2 opts; **`confirmed` has `effect.setVariable: scope_manifest_confirmed: true`** — the only soft checkpoint in the workflow whose default carries an effect.
- `file-approach-confirmed` (:86-103) `blocking:false`, default `confirmed`, 30000ms, 2 opts, **0 effects**.
- `file-review` (:118-138) `blocking:false`, default `accepted`, 30000ms, 3 opts, **0 effects**.
- `preservation-check` (:139-162) **`blocking` absent**, **no default**, **no autoAdvanceMs**, 3 opts (`proceed`/`preserve-more`/`rewrite`), **0 effects**.
- `pre-attestation-blocker` (:264-284) `blocking:true`, no default/auto, 2 opts: `redraft` → `effect.transitionTo: scope-and-draft` (self), `attest-with-deferral` → `setVariable has_critical_finding:false`.
- `draft-attestation` (:285-302) `blocking:false`, default `attested`, 30000ms, 2 opts, **0 effects**.
- `batch-review-attested` (:303-326) `blocking:false`, default `attested`, 30000ms, 4 opts, **0 effects**.

**Transitions**: `to: quality-review`, `isDefault: true`, no condition (:327-329). **Outcome**: 6 bullets (:330-336).

## 08 — `quality-review`, v1.13.1, prefix `08`, `required: true`
No `techniques:` block. **23 top-level, 40 including loop bodies.**

Top-level order:
1. `multi-target-review-loop` — **loop** `forEach target_workflow_id over target_workflow_ids`, `maxIterations: 20`, condition `operation_type==review`. Body (9): `load-all-workflow-files`(`reload-workflow`), `principle-compliance-audit`(`audit-principles`), `persist-principle-findings`(write-artifact `principle-findings.md`), `anti-pattern-scan`(`audit-anti-patterns`), `persist-anti-pattern-findings`(`anti-pattern-findings.md`), `schema-validation-check`(`audit-schema-validation`), `verify-high-findings-review`(`verify-high-findings`), `persist-verified-findings-review`(`verified-findings.md`), `compile-report`(`compile-report`). **All 9 unconditioned.**
2. `persist-compliance-report` — write-artifact `compliance-review.md`, `outputs.written_artifact: report_path` — `operation_type==review`
3. `review-disposition` — **checkpoint** — `operation_type==review`
4–8. `audit-expressiveness` → `persist-expressiveness-findings` → `expressiveness-clean` (action, msg) → `expressiveness-findings-flagged` (action, msg)
9–12. `audit-conformance` → `persist-conformance-findings` → `conformance-clean` → `conformance-findings-flagged`
13–16. `audit-rule-hygiene` → `persist-rule-hygiene-findings` → `rule-hygiene-clean` → `rule-hygiene-findings-flagged`
17–20. `audit-rule-enforcement` → `persist-enforcement-findings` → `enforcement-clean` → `enforcement-findings-flagged`
21. `verify-high-findings` (`verify-high-findings`)
22. `persist-verified-findings` (`verified-findings.md`)
23. `classify-audit-findings` — action, 2 value-LESS `set`s (`needs_audit_fixes`, `has_critical_finding`)
24. `audit-fix-cycle` — **loop** `while needs_audit_fixes==true`, `maxIterations: 3`. Body (8): `yaml-authoring`, `audit-schema-validation`, `apply-audit-fixes`, `re-audit-expressiveness`, `re-audit-conformance`, `re-audit-rule-hygiene`, `re-audit-rule-enforcement`, `reassess-audit-fixes` (2 value-LESS sets).

Every one of steps 4–23 carries the identical 2-clause gate `and(operation_type!=review, scope_manifest_confirmed==true)`; the `*-findings` persists and `*-clean`/`*-flagged` messages add a third clause on the respective `*_finding_count` (`>0` / `==0`). Full gate bodies at :109-119, :128-142, :146-159, :165-179, :186-196, :205-219, :223-236, :242-256, :263-273, :282-296, :300-313, :319-333, :340-350, :359-373, :377-390, :396-410, :417-427, :436-446, :449-459.

**Checkpoint (1)** `review-disposition` (:77-105): `blocking: true`, no default/auto, 3 opts — `fix-issues` (`setVariable operation_type:update, update_seeded_from_review:true` + `transitionTo: intake-and-context`), `report-only` (**no effect**), `selective-fixes` (**byte-identical effect to `fix-issues`**).
**Decisions (1)** `blocker-gate` "Critical Blocker Gate" (:508-522): branch `has-blocker` if `has_critical_finding==true` → `transitionTo: scope-and-draft`; branch `no-blocker` `isDefault: true`.
**Transitions**: `to: validate-and-commit`, `isDefault: true`, no condition (:523-525). **Outcome**: 4 bullets (:526-530).

## 09 — `validate-and-commit`, v1.8.1, prefix `09`, `required: true`
No `techniques:` block. 18 steps, no loops.

| # | id | kind | technique | condition |
|---|---|---|---|---|
| 1 | `save-compliance-report` | technique | write-artifact `compliance-review.md` → `report_path` | `operation_type==review` |
| 2 | `commit-report` | technique | `version-control::commit-regular-files` | `operation_type==review` |
| 3 | `run-schema-validation` | technique | `audit-schema-validation` | `operation_type!=review` |
| 4 | `validation-clean` | action (`message`) | — | `and(!=review, fail_count==0)` |
| 5 | `validation-passed` | **checkpoint** | — | `and(!=review, fail_count>0)` |
| 6 | `verify-scope-manifest` | technique | `scope-verification` | `operation_type!=review` |
| 7 | `scope-complete` | action (`message`) | — | `and(!=review, unaddressed_count==0)` |
| 8 | `scope-verified` | **checkpoint** | — | `and(!=review, unaddressed_count>0)` |
| 9 | `verify-planning-readme` | technique | `workflow-engine::verify-readme-conforms` | `operation_type!=review` |
| 10 | `readme-authoring` | technique | `readme-authoring` | `operation_type!=review` |
| 11 | `approve-to-commit` | **checkpoint** | — | `operation_type!=review` |
| 12 | `stage-and-commit` | technique | `version-control::commit-regular-files` | `operation_type!=review` |
| 13 | `verify-commit` | technique | `commit-verification` | **none** (:176-178) |
| 14 | `push-branch` | technique | `version-control::push-branch` | `operation_type!=review` |
| 15 | `compose-workflow-pr-description` | technique | `publish-workflow-pr` | `operation_type!=review` |
| 16 | `create-pr` | technique | `github-cli-protocol::create-pr` (`as_draft: true`) | `operation_type!=review` |
| 17 | `mark-ready` | technique | `github-cli-protocol::mark-ready` | `operation_type!=review` |
| 18 | `announce-completion` | action (`action: log`) | — | none |

**Checkpoints (3):** `validation-passed` (:54-77) `blocking:false`, default `proceed`, 30000ms, 2 opts, **0 effects**. `scope-verified` (:102-125) `blocking:false`, default `confirmed`, 30000ms, 2 opts, **0 effects**. `approve-to-commit` (:145-167) **`blocking: true`**, no default/auto, 3 opts — `approved` (**no effect**), `correct-assumptions` (`transitionTo: requirements-refinement`), `return-to-draft` (`transitionTo: scope-and-draft`).
**Transitions** (:230-238): `to: post-update-review` if `operation_type==update`; `to: retrospective`, `isDefault: true`, no condition. **Outcome**: 4 bullets.

## 10 — `post-update-review`, v1.10.0, prefix `10`, `required: true`
No `techniques:` block. **25 top-level, 35 including loop body.** The only activity using string-form `when:`.

1. `reload-updated-workflow` (`reload-workflow`) — none
2. `audit-expressiveness` — none
3. `persist-post-expressiveness` (`expressiveness-findings.md`) — `expressiveness_finding_count>0`
4. `audit-conformance` — none
5. `persist-post-conformance` (`conformance-findings.md`) — `conformance_finding_count>0`
6. `audit-principles` — none
7. `persist-post-principles` (`principle-findings.md`) — **none**
8. `audit-anti-patterns` — none
9. `persist-post-anti-patterns` (`anti-pattern-findings.md`) — **none**
10. `audit-schema-validation` — none
11. `scope-audit` (`scope-audit`) — none
12. `summarize-findings` — none
13. `save-review-snapshot` (`post-update-review.md` → `report_path`) — none
14. `post-update-clean` — action: `set needs_audit_fixes` (false), `set needs_recommit` (false), `message` — `review_findings_count==0`
15. `classify-post-update-fixes` — action: `set needs_audit_fixes` (true), `set needs_recommit` (true), `message` — `review_findings_count>0`
16. `post-update-remedia-cycle` — **loop** `while needs_audit_fixes==true`, `maxIterations: 3`. Body (10): `remedia-yaml-authoring`, `remedia-audit-schema`(`audit-schema-validation`), `remedia-apply-fixes`, `remedia-audit-expressiveness`, `remedia-audit-conformance`, `remedia-audit-principles`, `remedia-audit-anti-patterns`, `remedia-revalidate-schema`(`audit-schema-validation` **again**), `remedia-summarize`, `remedia-reassess`(1 value-LESS set).
17. `remedia-still-dirty` — action (`message`) — `needs_audit_fixes==true`
18. `republish-verify-scope-manifest` (`scope-verification`) — `when: needs_recommit == true`
19. `republish-verify-planning-readme` (`verify-readme-conforms`) — `when: needs_recommit == true`
20. `republish-stage-and-commit` (`commit-regular-files`) — `when: …`
21. `republish-verify-commit` (`commit-verification`) — `when: …`
22. `republish-push-branch` (`push-branch`) — `when: …`
23. `republish-pr-description` (`publish-workflow-pr`) — `when: …`
24. `republish-pull-request` (`create-pr`, `as_draft: false`) — `when: …`
25. `republish-complete` — action (`set needs_recommit` false + `message`) — `when: …`

**Checkpoints: none.**
**Transitions** (:220-243): `to: intake-and-context` if `needs_audit_fixes==true`; `to: retrospective` if `and(review_findings_count==0, needs_recommit==false, needs_audit_fixes==false)`, `isDefault: true`. **Outcome**: 3 bullets.

## 11 — `retrospective`, v1.1.0, prefix `11`, `required: true`
No `techniques:` block. 5 steps, no loops, **no checkpoints, no decisions, no `transitions:` block (terminal)**.

1. `create-completion-doc` (`create-completion-doc`) — `operation_type!=review`
2. `persist-completion-doc` — write-artifact **`bare_filename: completion.md`**, content `completion_document` — `operation_type!=review`
3. `conduct-retrospective` (`conduct-retrospective`) — **none**
4. `persist-retrospective` — write-artifact **`bare_filename: completion.md`**, content `retrospective_document` — **none**
5. `remove-session-worktree` (`work-package::manage-git::remove-worktree`, `component_name: workflows`) — `worktree_created==true`

**Outcome**: 3 bullets (:50-53).

## Aggregates
- **126 top-level steps; 169 including loop bodies.** Per activity: 16/16, 14/18, 3/3, 4/4, 18/30, 23/40, 18/18, 25/35, 5/5.
- **16 checkpoints.** 5 hard (`design-intent-batch`, `preservation-check`, `pre-attestation-blocker`, `review-disposition`, `approve-to-commit`), 11 soft with `defaultOption` + `autoAdvanceMs: 30000`.
- **6 loops** (2 forEach + 3 while + 1 forEach); `03:assumption-reconciliation` is the only loop **with no `maxIterations`**.
- **1 `decisions` block**, 4 branches total across the corpus (2 in `blocker-gate`).
- **19 activity-id reference sites**: 12 `transitions[].to`, 1 `decisions[].branches[].transitionTo`, 5 checkpoint `options[].effect.transitionTo`, 1 `workflow.yaml:265 initialActivity`.
- **27 `write-artifact` bind sites → 20 distinct bare filenames.** (#321's "17 produced artifacts" matches `workflow-design/resources/readme-seed.md:30-46` progress rows, of which only 12 are artifact links and 5 are activity milestones. The real artifact count is 20, or 22 counting `README.md` via `create-readme` and `assumptions-log.md` via `review-assumptions`.)

---

# PART B — Merge analysis for #321 (scope=01+03+04+05, draft=06, audit=08+10, land=09+11)

## B1. Steps that genuinely must stay ordered — named data dependency

| Ordered pair | Producer → consumer | Where the dependency is declared |
|---|---|---|
| `01:bind-planning-folder-path` → `06:derive-workflows-target-path` | `planning_folder_path` is the **sole input**; `target_path` = `<checkout>/.worktrees/{basename(planning_folder_path)}/` | `derive-workflows-target-path.md:12-14, :26-31` |
| `06:derive-workflows-target-path` → `06:ensure-workflow-worktree` → `06:scope-definition` | `target_path` → `workflow_branch`; `scope-definition` **step 1 is "Verify Edit Root"** and refuses to enumerate paths until `target_path` is checked out on `workflow_branch` | `prepare-workflow-branch.md:12-14, :30-36`; `scope-definition.md:30-33` |
| `01:intake-classification` → everything | sole producer of `operation_type`, `operation_type_ambiguous`, `change_request_clear`, `intent_needs_confirmation`, `headless_mode`, `workflow_id`, `target_workflow_id(s)`, `structural_inventory`, `change_category` | `intake-classification.md:12-62` |
| `01:intake-classification` → `03:synthesize-update-specification` | `structural_inventory` + `change_category` are declared **required inputs** of the update-mode synthesis | `synthesize-update-specification.md:16-22, :38` |
| `05:impact-analysis` → `06:preservation-check` | `has_unflagged_removals` is defined as "a removal **not already inventoried during impact analysis**" — the checkpoint message links `{impact_analysis_path}` as the comparison baseline | `review-drafted-file.md:34-36, :43`; `06:152` |
| `04:pattern-analysis` / `05:impact-analysis` → `06:scope-definition` | `scope-definition` step 4 assembles "a compact pattern-alignment table"; step 6 rule is "link impact analysis and design specification" | `scope-definition.md:43-45, :54` |
| `03:persist-specification` → `09:approve-to-commit` | Gate-2 message interpolates `{specification_path}`, `{assumptions_log}`, `{has_open_assumptions}` | `09:152` |
| `06:scope-definition` → `09:verify-scope-manifest` / `10:scope-audit` | both diff the committed change set against `{scope_manifest}` | `scope-audit.md:20-24` |
| `08:verify-high-findings` → `08:audit-fix-cycle` | rule `verify-before-remediation`: "Only findings that survive this pass … are eligible to drive fixes" | `verify-high-findings.md:49-51` |
| **`09:stage-and-commit` → `10:*`** | `reload-workflow`'s capability is literally "**Fresh post-commit** workflow definition as the audit baseline"; `scope-audit` step 1 lists "the **committed diff** on `{workflow_branch}`" | `reload-workflow.md:8`; `scope-audit.md:20`; `10-post-update-review.yaml:4` |

That last row is the one that breaks the proposal — see B4.

Ordering that is **habit, not dependency**: the 8 top-level audit passes in 08 (`audit-expressiveness` → `audit-conformance` → `audit-rule-hygiene` → `audit-rule-enforcement`) are mutually independent — each reads the drafted files and writes a disjoint `*_finding_count`; none consumes another's output. Same for 10's four audits. They can fan out in parallel. `08:classify-audit-findings` is the only join.

## B2. Pure ceremony — droppable

**Announce-only (`message`/`log`, no `set`, no artifact): 19 steps.**
`01:announce-certain-intent` (:89-108), `01:announce-review-seeded-update` (:128-137), `01:announce-headless` (:138-147), `01:announce-interactive` (:148-157), `03:announce-specification` (:86-90), `03:announce-open-judgements` (:114-123), `05:impact-no-removals` (:28-37), `08:expressiveness-clean` (:143-162), `08:expressiveness-findings-flagged` (:163-182), `08:conformance-clean` (:220-239), `08:conformance-findings-flagged` (:240-259), `08:rule-hygiene-clean` (:297-316), `08:rule-hygiene-findings-flagged` (:317-336), `08:enforcement-clean` (:374-393), `08:enforcement-findings-flagged` (:394-413), `09:validation-clean` (:38-53), `09:scope-complete` (:86-101), `09:announce-completion` (:225-229), `10:remedia-still-dirty` (:159-168).

The 8 in 08 are the worst: each pays a 3-clause `and` gate to emit "N findings" or "0 findings" that `verified-findings.md` already records. `AP-86 exception-only-verdict-tables` and `AP-101 no-caption-only-message` both apply.

**Provably-empty attestation pair: 2 steps.** `03:seed-assumption-decisions` sets `assumption_decisions: []` (:126-129) and `03:update-assumptions-log` (:132-137) passes that literal `[]` to `review-assumptions::record`. `assumption_decisions` has `defaultValue: []` (`workflow.yaml:45-48`) and **no other writer in the corpus**. The step's own message admits it: "empty decision list for record" (:131). Both steps are unconditional no-ops.

**Attestation checkpoints with zero recorded effect: 4.** `06:draft-attestation`, `06:batch-review-attested`, `06:file-approach-confirmed`, `06:file-review` — all `blocking:false`, all auto-advance in 30 s, **all zero `effect`**. The durable attestation is written by `06:persist-draft-attestation` + `review-draft-yaml.md:49-52`; the checkpoints record nothing. `AP-89 checkpoint-requires-decision`, whose discriminator is exactly "recorded effect", applies verbatim.

**Duplicate bind, not ceremony but pure waste: 9 steps.**
- `08:persist-compliance-report` (:62-76) and `09:save-compliance-report` (:7-21) are **identical**: same `bare_filename: compliance-review.md`, same `artifact_content: compliance_report`, same `outputs.written_artifact: report_path`, same `operation_type==review` gate. One is redundant (`AP-38(a)`).
- `10:republish-verify-scope-manifest`…`10:republish-pull-request` (:169-210) re-bind the exact 7-technique publish tail already bound at `09:78-224` (`scope-verification`, `verify-readme-conforms`, `commit-regular-files`, `commit-verification`, `push-branch`, `publish-workflow-pr`, `create-pr`). Under the proposed split these 8 steps sit in **`audit`** while the originals sit in **`land`** — the merge entrenches the duplication instead of resolving it.

**NOT ceremony — do not cut:** the 27 `write-artifact` steps look like persist-only boilerplate but each is the **contractually required bind site** its producing technique names ("Persist … via the calling activity's bound `manage-artifacts::write-artifact` step" — e.g. `persist-design-specification.md:30`, `impact-analysis.md:57`, `verify-high-findings.md:41`). Deleting them makes the producer technique unbindable. `review-draft-yaml.md:52` even audits for their presence ("confirm `manage-artifacts::write-artifact` … is a bound `steps[]` entry — not protocol-only prose").

## B3. Real decisions vs headless auto-resolution

`workflow.yaml:18` names the interactive set: Gate 1 `design-intent-batch`, Gate 2 `approve-to-commit`, safety gaps `preservation-check` and `review-disposition`. `headless_mode` defaults **true** (`workflow.yaml:41-44`).

**Real decisions — carry an effect and survive headless (4):**

| Checkpoint | Why real |
|---|---|
`01:design-intent-batch` | all 5 options mutate `operation_type` / `review_scope_confirmed` / `intent_needs_confirmation` (:54-88) |
`06:pre-attestation-blocker` | `redraft` → `transitionTo`, `attest-with-deferral` → `setVariable` (:274-284) |
`08:review-disposition` | `fix-issues`/`selective-fixes` → `setVariable` + `transitionTo` (:87-105) |
`09:approve-to-commit` | 2 of 3 options → `transitionTo` (:155-167) |

**Interactive but records nothing (1):** `06:preservation-check` (:139-162). It is the workflow's named content-safety gate, yet all 3 options carry **zero `effect`** — nothing distinguishes `proceed` from `preserve-more` in state. It is interactive only because `blocking`/`defaultOption`/`autoAdvanceMs` are all absent; that is accidental gating, not declared intent.

**Auto-resolve under headless (11):** `03:design-context`, `03:spec-confirmed`, `04:patterns-confirmed`, `05:impact-and-preservation-confirmed`, `06:scope-and-structure-confirmed`, `06:file-approach-confirmed`, `06:file-review`, `06:draft-attestation`, `06:batch-review-attested`, `09:validation-passed`, `09:scope-verified`. **Ten of the eleven have zero effect on any option** — pure `AP-89`. Three of them auto-resolve consequential situations:

- `05:impact-and-preservation-confirmed` auto-selects `confirmed` after 30 s, while `05:62-65` claims "every flagged removal is one the user consciously approved." Under the default `headless_mode`, nobody approved anything.
- `09:validation-passed` fires only when `fail_count>0` and auto-selects **`proceed` to commit** after 30 s — schema-invalid files commit unattended (:54-77).
- `09:scope-verified` fires only when `unaddressed_count>0` and auto-selects `confirmed` (:102-125), contradicting `09:241` "Nothing planned is left undone."

**The one consequential default: `06:scope-and-structure-confirmed`.** It is soft, auto-advances, and its default option sets `scope_manifest_confirmed: true` (:46-48). That variable gates the `file-drafting-loop` (:69-73) **and every one of the 20 non-review steps in 08** (`:117-119`, `:135-138`, … `:456-459`). Selecting the non-default `revise` leaves it false, which silently skips the entire drafting loop **and the entire audit activity** — `classify-audit-findings` never runs, `needs_audit_fixes` keeps its `false` default, `has_critical_finding` keeps `false`, `blocker-gate` takes `no-blocker`, and the session transitions to `validate-and-commit` and commits unaudited. This checkpoint is precisely the shape `scripts/check-review-mode-gating.ts:138-143` was written to catch, and it is the sole workflow-design entry in `scripts/review-mode-gating-baseline.json:7`.

**That guard no longer covers workflow-design at all.** `check-review-mode-gating.ts:151-152` skips any workflow that does not declare an `is_review_mode` variable; workflow-design uses `operation_type` and declares no `is_review_mode` (grep of `workflow-design/workflow.yaml` returns nothing). Running it confirms:

```
$ ./node_modules/.bin/tsx scripts/check-review-mode-gating.ts --root <corpus>
review-mode-gating: OK — 5 total, 6 baselined, 0 NEW, 1 fixed
  1 baselined entr(ies) no longer present — run --update-baseline to shrink the baseline
```

The stale entry is `workflow-design::scope-and-draft::scope-and-structure-confirmed`. So workflow-design currently has **zero** automated coverage for consequential-default friction, and the `<workflow>::<activity>::<checkpoint>` baseline key (`check-review-mode-gating.ts:41, :173`) means renaming `scope-and-draft` costs nothing there either.

## B4. Merged step counts and the ordering contradiction

| Merged activity | Source | Top-level steps | Incl. loop bodies |
|---|---|---|---|
| `scope` | 01+03+04+05 | 16+14+3+4 = **37** | 16+18+3+4 = **41** |
| `draft` | 06 | **18** | **30** |
| `audit` | 08+10 | 23+25 = **48** | 40+35 = **75** |
| `land` | 09+11 | 18+5 = **23** | 18+5 = **23** |
| **Total** | | **126** | **169** |

**The merge as specified moves zero steps and deletes zero steps.** 126 before, 126 after. It removes 8 activity files, 12 `transitions[].to` edges (7 of which become intra-activity), and 9 activity `outcome` blocks. Every token cost — the 32 KB `anti-patterns.md` load per `audit-anti-patterns` invocation (`audit-anti-patterns.md:28`; the file is 128,341 bytes), the 5 `audit-principles` bind sites, the 6 `audit-schema-validation` bind sites — is untouched.

**Contradiction 1 (fatal): `audit` = 08+10 straddles the commit in `land`.** The true execution order in update mode is `08 → 09(commit) → 10 → 11`, i.e. **audit → land → audit → land**. `10-post-update-review.yaml:4` is explicit ("**Post-commit** compliance audit"), `reload-workflow.md:8` requires a "**Fresh post-commit** workflow definition as the audit baseline", and `scope-audit.md:20` diffs "the **committed** diff on `{workflow_branch}`". A single linear `audit` activity followed by a single linear `land` cannot express this. The three ways out, all of which change the proposal:
1. Keep the 08-half in `audit` and move the 10-half into `land` after `stage-and-commit` — then `audit` = 23 steps, `land` = 48, and the "4 activities" framing survives but the names lie.
2. Make `land → audit` a back edge (already half-present at `09:231`) and put the whole 10-half behind a `post_commit == true` gate inside `audit` — 25 new gates on previously ungated steps.
3. Drop the post-commit audit entirely and rely on 06's pre-attestation passes — but those bind only `audit-principles` + `audit-anti-patterns` (`06:177-192`), not `audit-expressiveness`, `audit-conformance`, `audit-schema-validation`, or `scope-audit`, so 4 passes would be lost.

**Contradiction 2: 11 steps in 03+04 have no mode gate and currently rely on transition topology for review-mode exclusion.** In review mode `01:236` routes straight to `quality-review`, so 03 and 04 never execute. Merging them into `scope` puts them in the same linear step list as intake. `03:set-design-dimensions`, `03:persist-specification`, `03:persist-design-specification-artifact`, `03:spec-confirmed`, `03:announce-specification`, `03:collect-assumptions`, `03:reconcile-assumptions`, `03:seed-assumption-decisions`, `03:update-assumptions-log` (9 steps, **zero conditions**) plus all 3 of 04's steps (**zero conditions in the whole file**) = **12 steps that would run in review mode after the merge** unless 12 new `operation_type!=review` gates are added.

**Contradiction 3: 04 and 05 are mutually-exclusive branches; the merge makes them sequential.** `03:139` routes update→`impact-analysis`, `03:145` default→`pattern-analysis`. Linearising them means `pattern-analysis` (create-only, ungated) runs in update mode, and `05:impact-no-removals` becomes reachable in create mode. That step is gated only on `removal_count==0` (:28-37) — the `defaultValue` (`workflow.yaml:85-88`) — so in create mode it fires and emits `"Impact analysis complete — no content removals flagged ([impact analysis]({impact_analysis_path}))"` with `impact_analysis_path` still `""` (`workflow.yaml:125-128`). A latent bug that the merge makes unconditionally reachable.

**Contradiction 4: `01:announce-certain-review-scope` is load-bearing and looks like ceremony.** It is the only producer of `review_scope_confirmed=true` on the clear path (`:123-125`), and `01:236-247` gates the entire review branch on it. Cutting it as "announce-only" strands review mode. Related pre-existing dead end: selecting `wrong-review-target` at Gate 1 sets `review_scope_confirmed:false` **and** `intent_needs_confirmation:true` (:74-80), which suppresses `announce-certain-review-scope` (needs `intent_needs_confirmation==false`) — so the review transition's condition is false, and the `isDefault` transition's condition is also false because `auto-confirm-literacy` is gated `operation_type!=review` and both literacy flags default false (`workflow.yaml:198-205`). **No transition is satisfiable.**

**Contradiction 5 (pre-existing, exposed by the merge): `06:pre-attestation-fix-cycle` records fixes it never makes.** Loop body order is `apply-audit-fixes → re-audit-principles → re-audit-anti-patterns → reassess` (:223-247). `apply-audit-fixes.md:8, :24-26` is a **record**, not an edit ("Record `{fixes_applied}`: the file edited…"). 08's cycle correctly precedes it with `yaml-authoring` (:478-486) and 10's likewise (:126-134); 06's cycle has **no editing step at all**. Merging 08+10 without touching 06 leaves the one broken fix cycle in place.

**Contradiction 6: unbounded restart edge.** `10:220-226` transitions `to: intake-and-context` when `needs_audit_fixes==true` — i.e. after the 3-iteration remedia loop exhausts. There is no attempt counter anywhere in the 63 variables, so the whole 9-activity pass can re-enter indefinitely. Under the merge this becomes `audit → scope`, an unguarded cycle over 3 of the 4 activities. Compounding: `03:assumption-reconciliation` (:101-113) is the only `while` loop in the corpus **without `maxIterations`**.

**What an honest merge actually reduces:** deleting the 19 announce-only steps, the 2-step empty-attestation pair, the 10 zero-effect soft checkpoints, the duplicate `compliance-review.md` bind, and relocating (not duplicating) the 8-step republish tail yields roughly **86 top-level steps** — a 32 % cut. All of it comes from step deletion; none from activity merging.

## B5. References to activity ids that would disappear

Eight ids disappear (`intake-and-context`, `requirements-refinement`, `pattern-analysis`, `impact-analysis`, `quality-review`, `validate-and-commit`, `post-update-review`, `retrospective`); a ninth (`scope-and-draft`) survives only if #321 keeps the id rather than renaming it `draft`.

**Server-enforced graph edges.** `src/loaders/workflow-loader.ts:466-474` builds the legal-transition set from all three forms — `transitions[].to`, `decisions[].branches[].transitionTo`, and checkpoint `options[].effect.transitionTo` — and `src/utils/validation.ts:48` rejects any `next_activity` call outside it. `src/tools/workflow-tools.ts:438-440` throws `Activity not found: <id>` for an unknown id. Per `schemas/activity.schema.json:539` legality is "validated warn-only at `next_activity`" — so a stale `to:` does **not** fail load or `validate-activities.ts`; it fails at runtime, on the branch that takes it. Every site below must be rewritten by hand.

| Site | Current target | New target |
|---|---|---|
`workflow.yaml:265` `initialActivity` | `intake-and-context` | `scope` |
`01:236` `transitions[].to` | `quality-review` | `audit` |
`01:248` `transitions[].to` (isDefault) | `requirements-refinement` | **intra-activity — edge deleted**, becomes 12 step gates (B4/C2) |
`03:139` `transitions[].to` | `impact-analysis` | **intra-activity — deleted** |
`03:145` `transitions[].to` (isDefault) | `pattern-analysis` | **intra-activity — deleted** |
`04:35` `transitions[].to` (isDefault) | `scope-and-draft` | `draft` (collapses with next row) |
`05:60` `transitions[].to` (isDefault) | `scope-and-draft` | `draft` |
`06:278` checkpoint `pre-attestation-blocker.redraft.effect.transitionTo` | `scope-and-draft` (self) | `draft` (self) |
`06:328` `transitions[].to` (isDefault) | `quality-review` | `audit` |
`08:94` checkpoint `review-disposition.fix-issues.effect.transitionTo` | `intake-and-context` | `scope` |
`08:105` checkpoint `review-disposition.selective-fixes.effect.transitionTo` | `intake-and-context` | `scope` |
`08:519` `decisions.blocker-gate.has-blocker.transitionTo` | `scope-and-draft` | `draft` |
`08:524` `transitions[].to` (isDefault) | `validate-and-commit` | `land` |
`09:162` checkpoint `approve-to-commit.correct-assumptions.effect.transitionTo` | `requirements-refinement` | `scope` |
`09:167` checkpoint `approve-to-commit.return-to-draft.effect.transitionTo` | `scope-and-draft` | `draft` |
`09:231` `transitions[].to` | `post-update-review` | `audit` — **creates a `land → audit` back edge** (B4 contradiction 1) |
`09:237` `transitions[].to` (isDefault) | `retrospective` | **intra-activity — deleted** |
`10:221` `transitions[].to` | `intake-and-context` | `scope` (unguarded cycle, B4 contradiction 6) |
`10:227` `transitions[].to` (isDefault) | `retrospective` | **intra-activity — deleted** |

19 sites; 6 edges vanish into intra-activity sequence, 13 need retargeting.

**Conditions that reference variables whose only producer sits in a disappearing activity.** No `condition.variable` names an activity id (all gates are variable comparisons), but four gates depend on cross-activity producers that the merge relocates:
- `01:236-247` reads `review_scope_confirmed`, produced only by `01:123-125` and `01:56` — both inside `scope` after the merge, so the review branch out of `scope` must become a step-level gate, not a transition.
- `01:248-259` reads `format_literacy_confirmed` / `schema_constructs_confirmed`, set only by `01:210-223`. Once 01→03 is intra-activity these two variables have no consumer at all and become orphans (`impact-analysis.md:47` "Check for orphaned variables").
- Every non-review step in 08 (20 gates) reads `scope_manifest_confirmed`, produced only by `06:46-48` — a `draft → audit` cross-activity dependency that survives, but see B3.
- `10:227-243` reads `review_findings_count`, which in review mode is produced by `compile-report` **inside** `08:7-61`'s forEach and in update mode by `summarize-findings` at `10:70-72`. After the 08+10 merge both producers are in `audit` and the last-writer-wins hazard below becomes intra-activity.

**Non-YAML reference sites that break.** `workflow-design/README.md:13-21` (activity table with `#` prefixes), `:45-70` (mermaid graph naming all 9 ids), `:83`, `:168`, `:180-188` (file tree); `workflow-design/activities/README.md:13,21,29,37,45,53,61,69,77` (nine `### NN. Name` headings that the README anchors target); `workflow-design/techniques/TECHNIQUE.md:70` ("`verify-artifact-conforms` enforces the map at the end of **`scope-and-draft`**"); `workflow-design/techniques/README.md:37, :40`; `workflow-design/techniques/commit-verification.md:18`, which hard-codes six of 09's step ids (`verify-commit`, `push-branch`, `compose-workflow-pr-description`, `create-pr`, `mark-ready`, `announce-completion`) — and is also bound from `10:184-187` where none of those ids exist; `workflow-design/resources/readme-seed.md:30-46` (the `@` column carries 01/03/04/05/06/08/09/10/11) plus `:56` and `:60`, whose mode-exclusion map keys on "`@` `10`"; and `workflow-design/workflow.yaml:51, :87, :234`, whose variable descriptions name `requirements-refinement` and `impact-analysis`.

**Artifact filenames change.** `work-package/techniques/manage-artifacts/write-artifact.md:14, :44` and `work-package/techniques/manage-artifacts/TECHNIQUE.md:66-68` prefix every artifact with the **writing activity's `artifactPrefix`**, parsed from the filename by `src/loaders/workflow-loader.ts:83` and used to order activities via `localeCompare` at `:91-93`. Renumbering 9 files to 4 renames the first-mint prefix of all 20 artifacts (`06-scope-manifest.md` → `02-scope-manifest.md`, etc.). Existing planning folders survive via find-or-update (`write-artifact.md:39-41`), but `readme-seed.md`'s `@` column and every prefix-bearing reference must be regenerated.

---

# PART C — What the canon says about #321's numbers

1. **9 → 4 activities saves nothing on its own.** 126 top-level steps before, 126 after (B4). The savings live in the 19 announce-only steps, the 10 zero-effect soft checkpoints, the 2-step empty attestation pair, and the 9 duplicated publish/report binds — ~40 steps, none of which requires an activity merge.

2. **17 → 5 artifacts is measured against the wrong number.** 27 `write-artifact` bind sites produce **20** distinct bare filenames, 22 counting `README.md` and `assumptions-log.md`. "17" is the `readme-seed.md:30-46` progress-row count, and only 12 of those rows are artifacts.

3. **The canonical-home map already disagrees with the binds.** `workflow-design/techniques/TECHNIQUE.md:73-86` declares 12 homes. Two of them — `follow-ups.md` and `deferred-items.md` — have **zero bind sites** in any activity (no `bare_filename` match), yet `verify-artifact-conforms` enforces the map (`TECHNIQUE.md:70`). Conversely `drafting-plan.md`, `file-review-note.md`, `draft-attestation.md`, `completion.md`, and the six `*-findings.md` satellites are written but have no map row. The row says `compliance-report.md` while the binds write `compliance-review.md` / `post-update-review.md` (`resources/compliance-report.md:13`).

4. **The terminal artifact is named wrong at the only place that matters.** Every canon layer declares `COMPLETE.md` — `techniques/create-completion-doc.md:24`, `techniques/conduct-retrospective.md:18`, `resources/README.md:44`, `resources/completion-artifact.md:3,:10`, `README.md:134,:149,:168`, `readme-seed.md:46`. Both bind sites pass **`bare_filename: completion.md`** (`11-retrospective.yaml:20, :36`). Under `write-artifact.md`'s filename-keyed find-or-update this mints `11-completion.md`, and the seeded README's `[Close-out (COMPLETE.md)](COMPLETE.md)` never resolves. Also `11:persist-retrospective` is **ungated** while `11:persist-completion-doc` is `operation_type!=review`, so review mode writes a `completion.md` containing only the retrospective — contradicting `completion-artifact.md:10` ("the retrospective is a section of this document") and `conduct-retrospective.md:40` ("update in place — it is the single terminal artifact").

5. **The multi-target review loop overwrites its own output.** `08:7-61` writes `principle-findings.md`, `anti-pattern-findings.md`, and `verified-findings.md` **inside** the `forEach` over `target_workflow_ids` (max 20), all with fixed bare filenames — `write-artifact.md:39-41` updates in place, so a 3-target review leaves only target 3's satellites. `compile-report` (which sets `review_findings_count`, `compile-report.md:36`) is also inside the loop while `persist-compliance-report` (:62) is outside, so only the last target's report persists and `review-disposition`'s message "{review_findings_count} findings across {target_workflow_ids}" (:84) reports the last target's count as the total.

6. **Two `.md`-declared skips are not honoured by the YAML.** `context-loading.md:52-55` says persist `format-conventions.md` "When `{operation_type}` is `create` … Skip when `update` or `review`" — but `01:persist-format-conventions` (:175-181) carries **no condition**, while its sibling `01:persist-applicable-constructs` (:190-194) is correctly gated on `create`. And `09:verify-commit` (:176-178) is ungated, so in review mode `commit-verification.md:14` verifies "the commit on `{target_path}`" with `target_path` still `""` — 06 (the only producer, `:9-24`, both gated `operation_type!=review`) never runs in review mode.

7. **The token bill is explained by audit fan-out, not activity count.** `audit-anti-patterns.md:28` loads the full 128,341-byte catalogue on **every** invocation, and it has 5 bind sites (`06:pre-attestation-audit-anti-patterns`, `06:re-audit-anti-patterns` ×2 iterations, `08:anti-pattern-scan`, `10:audit-anti-patterns`, `10:remedia-audit-anti-patterns` ×3) plus a sixth load in `context-loading.md:37`. `audit-schema-validation` has 6 bind sites, up to 11 worst-case executions in update mode (08 ×3, 09 ×1, 10 ×1, 10 remedia ×2 per iteration ×3 — note `remedia-audit-schema` and `remedia-revalidate-schema` are the **same technique twice per iteration**, `10:130-131` and `10:148-149`). `audit-principles` has 5 bind sites.

8. **The 8-vs-3 High-findings gap is by design, and the design is applied to only one of three audit sites.** `verify-high-findings` — whose rule `refute-by-default` withdraws any High not independently re-derived (`verify-high-findings.md:45-51`) — is bound **only in 08** (`:49-50` and `:414-416`). Neither `06`'s pre-attestation pair nor `10`'s five post-commit passes runs it, so those feed raw findings straight into `apply-audit-fixes`. The bare two-agent sweep's 8 Highs are pre-verification counts; the full pass's 3 are post-verification. Any consolidation of 08+10 into one `audit` activity should bind `verify-high-findings` once for all passes — that is the single highest-value structural change available in the merge, and #321 as written does not mention it.
