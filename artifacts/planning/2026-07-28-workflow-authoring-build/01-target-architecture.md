# `workflow-authoring` v1.0.0 — target architecture (build specification)

Authoritative build spec for the new workflow tree `SRV/workflows/workflow-authoring/`. Self-contained: everything needed to author `workflow.yaml` and the four activity YAMLs is here.

`SRV = /home/mike1/projects/dev/workflow-server`. Bare `file:line` cites are `SRV`-relative. `AP:` cites are `workflow-design/resources/anti-patterns.md`; `DP:` is `workflow-design/resources/design-principles.md`. During coexistence the four criteria homes are cited cross-workflow as `workflow-design/<home>#<anchor>`; the prefix is stripped when that tree is deleted.

**Registration takes nothing but the directory.** `listWorkflowsWithDiagnostics` does `readdir` + `isDirectory` (`src/loaders/workflow-loader.ts:375-390`); activities are discovered by `readdir` of `activities/` (`:63`, `:567`) and matched against `/^(\d+)-(.+)\.ya?ml$/` (`src/loaders/filename-utils.ts:6-10`) — a non-matching filename is silently skipped (`workflow-loader.ts:68-69`). `workflow.yaml` does **not** enumerate activities; its only activity reference is `initialActivity`. There is no registry, index or manifest to edit.

**Filename id segment must equal the declared `id:`.** `getActivity` matches the YAML `id` (`workflow-loader.ts:426-428`) while `readActivityRaw` — the path `get_activity` actually uses — matches the filename-derived id (`:570`), and no validator compares the two. Prefix ordering is `localeCompare` (`:91-93`), so the sparse `01/06/08/09` set orders correctly.

---

## 1. `workflow.yaml`

### 1.1 Header

```yaml
$schema: ../../schemas/workflow.schema.json
id: workflow-authoring
version: 1.0.0
title: Workflow Authoring Workflow
description: Guide agents through creating, updating, or reviewing workflow definitions.
author: m2ux
tags:
  - workflow-creation
  - workflow-review
  - workflow-authoring
  - schema-validation
  - design-principles
  - elicitation
  - conventions
initialActivity: intake-and-context
```

`id` equals the directory name in 15 of 15 sibling workflows; every sibling `title` ends in "Workflow"; new workflows start at `1.0.0` (`codebase-wiki`, `ponytail`). `$schema` is the same relative depth as every sibling. `id` must not collide with a technique **group** directory name (`workflow-engine`, `manage-artifacts`, `version-control`, `review-assumptions`), because `::` refs resolve as path segments (`src/loaders/technique-loader.ts:227`, `:586`) — `workflow-authoring` is clear. `description` is written in positive present and states capability only; it never describes what the predecessor did (AP-41, `DP:81`).

### 1.2 `rules`

```yaml
rules:
  activity:
    - Corrections must persist — record corrections and verify compliance at every subsequent checkpoint
    - >-
      A checkpoint that declares neither `defaultOption` nor `autoAdvanceMs` requires a user
      response and must never be answered on the user's behalf. When `{headless_mode}` is true,
      a checkpoint declaring both resolves to its `defaultOption` without presentation.
```

The second entry replaces `workflow-design/workflow.yaml:18`, whose enumeration of checkpoint ids (`design-intent-batch`, `approve-to-commit`, `preservation-check`, `review-disposition`) is a live AP-107 `bind-site-is-orchestration-truth` exposure (`AP:1390`): the bind site is orchestration truth, so the rule states the runtime invariant the schema does not encode and names no gate. Headless semantics live here **once** (AP-22 `single-rule-authority`, `AP:346`).

**`rules.universal` is not declared.** It is optional (`src/schema/workflow.schema.ts:55`) and dual-audience — the same directive both orchestrator and worker must follow. Nothing in this workflow qualifies: the headless directive is orchestrator-facing only. `get_activity` injects `rules.activity` + `rules.universal` (`src/tools/workflow-tools.ts:890-905`), so an absent bucket costs nothing and adds no per-dispatch bytes.

**No activity declares `rules:`.** AP-69 `no-activity-prose-rules` (`AP:918`) is zero-tolerance — its carve-out is literally "N/A — activity `rules:` should be empty" (`:924`). Two schema facts make prose the worst option anyway: activity `rules[]` items are `type: string` with no `{ref}` variant (contrast `RuleEntrySchema`, `src/schema/workflow.schema.ts:38-43`), so they cannot be fragment-deduped; and no server code reads them.

### 1.3 `techniques`

```yaml
techniques:
  activity:
    - variable-binding
```

No activity declares an activity-level `techniques:` block. `workflow-design`'s two `techniques: [scatter-gather]` blocks (`03:6-7`, `06:6-7`) were bound at no step and are not reproduced — `scripts/check-activity-technique-overlap.ts:74` is hard-zero (AP-36).

### 1.4 `variables[]` — 42 entries

**Resolution of the contested count: 42.** The plan's 41 is arithmetically wrong; `06-verification`'s M-1 is right, and `verified_findings` is the missing addition. Three grounds:

1. **The plan's own admission criterion admits it.** §4.4 declares the added list as "each read by a gate, message, `set` or **input deviation**". `08:2 record-fixes` binds `apply-audit-fixes` with `selected_findings: verified_findings` — an input deviation by definition — and `09:2 compile-register` reads it again.
2. **Without the declaration the build fails a hard-zero guard.** The only `verified_findings*` name in today's `workflow.yaml` is `verified_findings_path` (`:169`), which §4.4 deletes. `scripts/check-binding-fidelity.ts:474-481` seeds producers from `workflow.yaml variables[]` (`:250-258`), so a surviving `{verified_findings}` read with no declaration is a NEW hard violation — and the new tree must be 0-NEW from its first commit, with no baseline to inherit.
3. **It is the only payload that must survive a back edge.** It is produced at `09:1` and consumed at `08:2`, i.e. read *after* the `09 → quality-review` remediation transition, in an activity whose own steps never produce it. Cross-transition survival is exactly what a session-bag declaration buys.

Arithmetic: `63 existing − 32 deleted + 11 added = 42`, with 2 of the 31 survivors renamed in place. Dropping `pass_count` (below) does not change the total — it was already inside the deleted 32.

**The one inclusion rule** (M-1 asked for it explicitly): a value is declared in `workflow.yaml variables[]` **iff** the orchestration layer reads or writes it — a step `when`, a checkpoint `condition`, a checkpoint or action `message`, an `action: set` target, a `forEach` collection or its loop variable, an `outputs.*` remap target — **or** it is read at a bind site under a name other than its producing technique's declared Output name. Every other value is **technique-local**: it flows technique `## Outputs` → technique `## Inputs` by name and is never declared at workflow level.

Technique-local set, stated so a builder does not add them: `change_brief`, `open_judgements`, `impact_analysis`, `change_constraints`, `structural_inventory`, `file_count`, `findings_register`, `audit_findings`, `coverage_ledger`, `base_ref`, `surface_files`, `changed_files`, `known_finding_keys`, `consumer_surface`, `reference_workflows`. `write-artifact`'s `artifact_content:` slot is a **generic parameter of a shared op** that must be remapped at every bind in the corpus; remapping into it is not an input deviation in the sense above, which is why `change_brief` and `findings_register` stay technique-local while `scope_manifest` is declared (a `forEach` collection reads it) and `current_file` is declared (it is a loop variable). None of `audit_findings` / `coverage_ledger` carries a `defaultValue` anywhere, at workflow level or technique level: for a findings bag, `defaultValue: []` makes an unproduced sweep indistinguishable from a clean one, which is AP-128's own failure shape (`AP:1688`).

#### Retained (29 unchanged + 2 renamed)

| # | name | type | defaultValue | description (one line, AP-126) |
|---|---|---|---|---|
| 1 | `planning_folder_path` | string | — | Absolute path to this workflow planning folder. |
| 2 | `operation_type` | string | — | The classified operation for the request — create, update, or review. |
| 3 | `operation_type_ambiguous` | boolean | `false` | True when intake cannot confidently classify create vs update vs review from the request alone. |
| 4 | `change_request_clear` | boolean | `true` | In update mode, true when the change request is clear enough to proceed without Gate 1 clarification. |
| 5 | `intent_needs_confirmation` | boolean | `false` | Composite gap flag for Gate 1 — true when mode is ambiguous, the update change request is unclear, and/or review. |
| 6 | `headless_mode` | boolean | `true` | When true, soft mid-flow gates auto-resolve without presentation. |
| 7 | `open_finding_count` | number | `0` | Count of open findings on the decision surface. **Renamed** from `review_findings_count` (`:53`). |
| 8 | `update_seeded_from_review` | boolean | `false` | True when update mode was entered from a review-mode fix disposition. |
| 9 | `removal_count` | number | `0` | Count of content removals inventoried for this change. **Description rewritten** — the live text at `:87` names its producer (AP-126). |
| 10 | `fail_count` | number | `0` | Count of YAML files that failed schema validation. |
| 11 | `total_count` | number | `0` | Total scope-manifest items checked. |
| 12 | `addressed_count` | number | `0` | Scope-manifest items confirmed addressed. |
| 13 | `unaddressed_count` | number | `0` | Scope-manifest items still unaddressed. |
| 14 | `change_brief_path` | string | `""` | Absolute path to the persisted change-brief artifact. **Renamed** from `specification_path` (`:109`). |
| 15 | `impact_analysis_path` | string | `""` | Absolute path to the persisted impact-analysis artifact. |
| 16 | `scope_manifest_path` | string | `""` | Absolute path to the persisted scope-manifest artifact. |
| 17 | `report_path` | string | `""` | Absolute path to the persisted findings register. |
| 18 | `review_scope_confirmed` | boolean | `false` | In review mode, whether the user confirmed the audit target set. |
| 19 | `target_workflow_id` | string | — | The workflow id currently being authored, updated or audited. **Description rewritten** — the live text at `:191` is an unterminated sentence naming its loop (M-k). |
| 20 | `target_workflow_ids` | array | — | Ordered list of workflow ids in scope for this run, one or more. |
| 21 | `workflow_id` | string | — | The id of the workflow being created or updated. |
| 22 | `scope_manifest_confirmed` | boolean | `false` | Whether the complete file manifest has been confirmed. |
| 23 | `scope_manifest` | array | — | List of files to create, modify or remove with full paths and actions. |
| 24 | `current_file` | object | — | The file currently being drafted. |
| 25 | `has_unflagged_removals` | boolean | `false` | True when drafting detects removals absent from the impact inventory. |
| 26 | `has_critical_finding` | boolean | `false` | Whether any finding is Critical severity — a schema-invalid or structurally broken construct that must not be committed. |
| 27 | `target_path` | string | `""` | Worktree path for edits, builds and PR operations. |
| 28 | `worktree_created` | boolean | `false` | True when a dedicated worktree at `target_path` was created or reused by this run. |
| 29 | `workflow_branch` | string | `""` | The feature branch in the workflows repo carrying this change. |
| 30 | `pr_url` | string | `""` | URL of the pull request opened for this change. |
| 31 | `pr_number` | string | `""` | Number of the pull request opened for this change. |

#### Added (11)

| # | name | type | defaultValue | description | first orchestration read |
|---|---|---|---|---|---|
| 32 | `open_judgements_count` | number | `0` | Count of unresolved design judgements recorded in the change brief. | `01:12` gate |
| 33 | `removals_approved` | boolean | `false` | Whether the inventoried content removals are approved. | `06:2` input deviation |
| 34 | `removal_disposition` | string | `""` | Disposition of an unflagged removal — `flagged \| restored`. | `06:6d` gate |
| 35 | `scope_round` | number | `0` | Scope-confirmation round for this run. | `06:4` instance qualifier |
| 36 | `remediation_round` | number | `0` | Remediation round for this run. | `08:1` gate |
| 37 | `remediation_selected` | boolean | `false` | Whether the operator chose remediation over acceptance at the pre-attestation gate. | `09:6-17` gates |
| 38 | `commit_approved` | boolean | `false` | Whether the operator approved the change for commit. | `09:10-17` gates |
| 39 | `review_closed` | boolean | `false` | Whether a review run closed on its report with no escalation. | `09:7-17` gates |
| 40 | `has_coverage_gap` | boolean | `false` | Whether any enumeration unit was blocked rather than walked. | `09:5`, `09:9` messages |
| 41 | `register_sections` | array | `[]` | Per-target register sections accumulated across the sweep. | `08:5e` `set` target |
| 42 | `verified_findings` | array | — | Findings whose claims survived independent re-derivation. | `08:2` input deviation |

#### Deleted (32), by `workflow-design/workflow.yaml` line

`:45 assumption_decisions` · `:49 has_resolvable_assumptions` · `:61 expressiveness_finding_count` · `:65 conformance_finding_count` · `:69 rule_hygiene_finding_count` · `:73 enforcement_finding_count` · `:77 principle_finding_count` · `:81 anti_pattern_finding_count` (six shadows of one authoritative fact — AP-112 `AP:1454`) · `:89 pass_count` · `:113 format_conventions_path` · `:117 applicable_constructs_path` · `:121 pattern_analysis_path` · `:133 draft_attestation_path` · `:141 structural_inventory_path` · `:145 drafting_plan_path` · `:149 file_review_note_path` · `:153`/`:157`/`:161`/`:165`/`:169`/`:173`/`:177` the seven `*_findings_path` variables · `:181 dimension_questions` · `:198 format_literacy_confirmed` · `:202 schema_constructs_confirmed` · `:220 needs_audit_fixes` (pure projection of `open_finding_count > 0`) · `:224 needs_recommit` · `:232 assumptions_log` · `:235 open_assumptions` · `:238 has_open_assumptions` · `:242 design_dimensions`.

`pass_count` is dropped from the declaration **and** from `08:5d`'s output list **and** from `audit-schema-validation.md`'s Outputs, in one commit: a declared technique output with no declaration and no reader is the dead-output shape `scripts/check-binding-fidelity.ts:485` flags. `fail_count` survives because two gate messages interpolate it.

---

## 2. The four activities

Sparse prefixes `01/06/08/09` are deliberate; `activities/README.md:9` already declares gap prefixes as sanctioned convention. Every activity is `required: true`.

**Gate vocabulary.** **BLOCKING** = `blocking: true`, **no** `defaultOption`, **no** `autoAdvanceMs` — `auto_advance` throws when either is missing (`src/tools/workflow-tools.ts:1167-1172`), so the timer path is structurally unavailable. **SOFT** = both present, server-enforced timer (`:1173-1185`). Structured `condition:` is used on **checkpoints only**, because its presence is what makes a `respond_checkpoint condition_not_met` response legal (`src/schema/activity.schema.ts:75`; `workflow-tools.ts:1186-1192`). Every non-checkpoint gate is a `when:` one-liner — identical for the agent, for manifest validation (`src/utils/validation.ts:79-82`) and for bundling eligibility (`workflow-tools.ts:715`).

Step totals: **43 top-level / 52 including loop bodies** (13 + 8 + 5 + 17 top-level; 13 + 12 + 10 + 17 with bodies).

### 2.1 `activities/01-intake-and-context.yaml`

| field | value |
|---|---|
| filename | `activities/01-intake-and-context.yaml` |
| `id` | `intake-and-context` |
| prefix | `01` |
| `required` | `true` |
| purpose | Classify the request, derive the edit surface path, name the target, produce the change brief and the change constraints, approve removals. |
| persists | `README.md` (seeded), `change-brief.md`, `impact-analysis.md` |
| steps | 13 top-level, no loops |

| # | kind | id | technique / body | deviations & remaps | gate |
|---|---|---|---|---|---|
| 1 | action | `bind-planning-folder-path` | `set planning_folder_path` | value-BEARING orchestration state | — |
| 2 | technique | `derive-target-path` | `derive-workflows-target-path` | → `{target_path}` | **ungated** |
| 3 | technique | `classify-intake` | `intake-classification` | reduced: drop Protocol §4/§5 (`:83-90`) and the `structural_inventory_path` output (`:56-58`); keep `{structural_inventory}` as an in-session value (a declared required input of `synthesize-change-brief`); **add** `review_scope_confirmed` as a declared output. → `{operation_type}`, `{operation_type_ambiguous}`, `{change_request_clear}`, `{intent_needs_confirmation}`, `{workflow_id}`, `{target_workflow_id}`, `{target_workflow_ids}`, `{review_scope_confirmed}`, `{structural_inventory}` | `when: update_seeded_from_review != true` |
| 4 | **checkpoint** | `design-intent-batch` | **BLOCKING**, Gate 1 — 5 options, all `setVariable` | see options below | `condition: and(intent_needs_confirmation == true, update_seeded_from_review != true)` |
| 5 | action | `announce-wrong-target` | `message` — statement form, names the rejected target set and the terminal exit | no path variable to link | `when: and(operation_type == 'review', review_scope_confirmed != true)` |
| 6 | technique | `seed-planning-readme` | `workflow-engine::create-readme` | `seed_profile: workflow-authoring/readme-seed` | `when: operation_type != 'review'` |
| 7 | technique | `elicit-change-brief` | **`elicit-change-brief`** (new) | → `{change_brief}`, `{open_judgements}`, `{open_judgements_count}` | `when: operation_type == 'create'` |
| 8 | technique | `synthesize-change-brief` | **`synthesize-change-brief`** (new, from `synthesize-update-specification`) | same output set; consumes `{structural_inventory}` | `when: operation_type == 'update'` |
| 9 | technique | `analyze-impact` | `impact-analysis` | extended: declare `{change_constraints}` (the co-change set and identifier-collision set phases 2–5 already derive but never bind); drop the "calling activity's" persist prose at `:57` (AP-68). → `{removal_count}`, `{change_constraints}`, `{impact_analysis}` | `when: operation_type == 'update'` |
| 10 | technique | `persist-change-brief` | `work-package::manage-artifacts::write-artifact` | `bare_filename: change-brief.md`, `artifact_content: change_brief`, `outputs.written_artifact: change_brief_path` | `when: operation_type != 'review'` |
| 11 | technique | `persist-impact-analysis` | `work-package::manage-artifacts::write-artifact` | `bare_filename: impact-analysis.md`, `artifact_content: impact_analysis`, `outputs.written_artifact: impact_analysis_path` | `when: operation_type == 'update'` |
| 12 | action | `surface-open-judgements` | `message` — statement form, links `[change brief]({change_brief_path})` | AP-97 satisfied: same gate arm as its producer | `when: open_judgements_count > 0` |
| 13 | **checkpoint** | `impact-approved` | **BLOCKING** | 2 options, below | `condition: removal_count > 0` |

**Gate 1 `design-intent-batch` options** (body reused from `01-intake-and-context.yaml:35-88`; message interpolates `{operation_type}`, `{workflow_id}`, `{operation_type_ambiguous}`, `{change_request_clear}`):

| option id | label | effect `setVariable` |
|---|---|---|
| `confirm-intent` | Confirm classified intent | `intent_needs_confirmation: false`, `review_scope_confirmed: true` |
| `confirm-create` | Create a new workflow | `operation_type: create`, `operation_type_ambiguous: false`, `intent_needs_confirmation: false` |
| `confirm-update` | Update an existing workflow | `operation_type: update`, `operation_type_ambiguous: false`, `intent_needs_confirmation: false` |
| `wrong-review-target` | Wrong review target set | `review_scope_confirmed: false` **only** |
| `cancel-as-create` | Cancel update — create new instead | `operation_type: create`, `operation_type_ambiguous: false`, `intent_needs_confirmation: false` |

`wrong-review-target` must **not** also set `intent_needs_confirmation: true` (as the live body does at `:80`). That clause suppressed the intent announce and left *no* satisfiable transition — a live dead end. With the clause gone, step 5's message fires and transition T1 below takes the session terminal.

**`impact-approved` options:** `approve-removals` → `setVariable removals_approved: true`; `preserve-more` → `setVariable removals_approved: false`.

**Transitions, in declared order:**

| # | to | condition |
|---|---|---|
| T1 | `__terminal__` | `when: and(operation_type == 'review', review_scope_confirmed != true)` |
| T2 | `quality-review` | `when: and(operation_type == 'review', review_scope_confirmed == true)` |
| T3 | `scope-and-draft` | `isDefault: true` |

T1 is first-listed and load-bearing. `action` is one of `log|validate|set|emit|message` and is "interpreted by the executing agent — the server has no action interpreter" (`src/schema/activity.schema.ts:26`), so no step can halt anything; without T1, a rejected review target fails T2 and falls through T3 into `scope-and-draft` and thence into the full canon sweep against the target the human just rejected. `__terminal__` is legal from anywhere (`src/utils/validation.ts:42`).

### 2.2 `activities/06-scope-and-draft.yaml`

| field | value |
|---|---|
| filename | `activities/06-scope-and-draft.yaml` |
| `id` | `scope-and-draft` |
| prefix | `06` |
| `required` | `true` |
| purpose | Prepare the edit worktree, enumerate scope, author every file the manifest names, author the target README. |
| persists | `scope-manifest.md` |
| steps | 8 top-level / 12 with loop body |

| # | kind | id | technique / body | deviations & remaps | gate |
|---|---|---|---|---|---|
| 1 | technique | `ensure-worktree` | `prepare-workflow-branch` | → `{worktree_created}`, `{workflow_branch}`; consumes `{target_path}` from `01:2` | `when: operation_type != 'review'` |
| 2 | technique | `define-scope` | `scope-definition` | input deviations `change_constraints`, `removals_approved`; → `{scope_manifest}`, `{file_count}` | `when: operation_type != 'review'` |
| 3 | technique | `persist-scope-manifest` | `work-package::manage-artifacts::write-artifact` | `bare_filename: scope-manifest.md`, `artifact_content: scope_manifest`, `outputs.written_artifact: scope_manifest_path` | `when: operation_type != 'review'` |
| 4 | **checkpoint** | `scope-confirmed#{scope_round}` | **SOFT** — `blocking: false`, `defaultOption: confirmed`, `autoAdvanceMs: 30000` | options below | `condition: operation_type != 'review'` |
| 5 | action | `bump-scope-round` | `set scope_round` | value-BEARING | `when: scope_manifest_confirmed != true` |
| 6 | **loop** | `file-drafting-loop` | `forEach current_file over scope_manifest`, `maxIterations: 50` | — | `when: scope_manifest_confirmed == true` |
| 6a | technique | `author-yaml` | `yaml-authoring` | — | — |
| 6b | technique | `review-file` | `review-drafted-file` | reduced: delete Protocol §2 persist (`:45-48`) and the `file_review_note*` outputs; **keep** `{has_unflagged_removals}` (`:34`) | — |
| 6c | **checkpoint** | `preservation-check#{current_file.path}` | **BLOCKING** | options below | `condition: has_unflagged_removals == true` |
| 6d | technique | `apply-removal-disposition` | `yaml-authoring` | — | `when: and(has_unflagged_removals == true, removal_disposition == 'restored')` |
| 7 | technique | `author-workflow-readme` | `readme-authoring` | moved here from `09:139` so the sweep covers it | `when: operation_type != 'review'` |
| 8 | technique | `verify-artifact-conforms` | `verify-artifact-conforms` | absorbs `review-draft-yaml.md:51-52`'s binding-fidelity pass: every artifact-persisting step is a bound `steps[]` entry, every required input has a producer | `when: operation_type != 'review'` |

**`scope-confirmed#{scope_round}` options:** `confirmed` (the `defaultOption`) → `setVariable scope_manifest_confirmed: true`; `revise` → `setVariable scope_manifest_confirmed: false` **and** `effect.transitionTo: scope-and-draft`.

**`preservation-check#{current_file.path}` options:** `flag-and-proceed` → `setVariable removal_disposition: flagged`; `restore-content` → `setVariable removal_disposition: restored`.

**Instance qualification on 4 and 6c is mandatory, not stylistic.** `yield_checkpoint` replays a stored response for `${activityId}-${checkpointId}` **without prompting** (`workflow-tools.ts:978-1022`); `checkpointBaseId` resolves `base#instance` back to the one definition (`workflow-loader.ts:438-464`). Precedent: `work-package/activities/07-assumptions-review.yaml:90`.

**Transitions:** `to: quality-review`, `isDefault: true`. Plus the effect-only self edge from `scope-confirmed.revise`.

### 2.3 `activities/08-quality-review.yaml`

| field | value |
|---|---|
| filename | `activities/08-quality-review.yaml` |
| `id` | `quality-review` |
| prefix | `08` |
| `required` | `true` |
| purpose | One whole-surface canon sweep per target against the working tree, plus consumer-surface and known-item resolution. Applies fixes on remediation rounds. |
| persists | none |
| steps | 5 top-level / 10 with loop body |

| # | kind | id | technique / body | deviations & remaps | gate |
|---|---|---|---|---|---|
| 1 | technique | `author-fixes` | `yaml-authoring` | — | `when: remediation_round > 0` |
| 2 | technique | `record-fixes` | `apply-audit-fixes` | input deviation `selected_findings: verified_findings` | `when: remediation_round > 0` |
| 3 | technique | `load-known-findings` | **`load-known-findings`** (new) | → `{known_finding_keys}`; normalises `scripts/binding-fidelity-baseline.json`, `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json` and the prior run's `findings-register.md` | **ungated** |
| 4 | technique | `survey-reference-workflows` | `meta::workflow-engine::list-workflows` | → `{reference_workflows}` | **ungated** |
| 5 | **loop** | `target-sweep-loop` | `forEach target_workflow_id over target_workflow_ids`, `maxIterations: 20` | — | **ungated** |
| 5a | technique | `rebind-target-baseline` | `reload-workflow` | extended: declare `{base_ref}`, `{surface_files}`, `{changed_files}` (it declares no outputs at all today); re-author `:8`'s "post-commit" Capability as "current definition surface and its base ref" | — |
| 5b | technique | `resolve-consumer-surface` | **`resolve-consumer-surface`** (new) | consumes `{changed_files}` (from 5a) and `{target_workflow_id}` (the loop variable); → `{consumer_surface}` | — |
| 5c | technique | `sweep-canon` | **`audit-canon`** (new — the single walker) | consumes `{surface_files}`, `{changed_files}`, `{base_ref}`, `{known_finding_keys}`, `{consumer_surface}`, `{reference_workflows}`, `{change_constraints}`; → `{audit_findings}`, `{coverage_ledger}` | — |
| 5d | technique | `validate-schema` | `audit-schema-validation` | fixed invocations: `validate-workflow-yaml.ts {target_path}/{target_workflow_id}` (positional — `--root` is not its interface), `check-all-refs.ts --root {target_path}`, `check-binding-fidelity.ts --root {target_path}`, plus the seven previously unnamed guards each `--root {target_path}`. → `{fail_count}` only | — |
| 5e | action | `accumulate-target-findings` | `set register_sections` | value-BEARING scatter-gather accumulator over the `forEach` | — |

`target_workflow_ids` is a declared `intake-classification` output that always contains at least the single target, so the loop runs **once** in create/update and N times in review. That singleton-collection substitution is what removes the 20 three-clause `and()` mode gates decorating every non-review step of `08` today.

**Eager delivery: 6 of 10 steps are `_meta.step_techniques`-eligible** — 3, 4, 5a, 5b, 5c, 5d. `collectUngated` skips on `when`/`condition` *before* recursing into loops and pushes only `kind: technique && s.id` (`workflow-tools.ts:713-719`, `:716`); `breakCondition`/`maxIterations` are not in `stepCommonFields` (`src/schema/activity.schema.ts:73-77`), so an ungated loop keeps its body eligible. Structurally ineligible: 1 and 2 (gated), 5 (loop container — recursed, not pushed), 5e (`kind: action`). State it structurally, never as a bare count. The eager-*resource* loop has no cumulative budget — only the 80,000-char per-resource cap (`workflow-tools.ts:798-830`; `src/utils/resource-delivery.ts:6`) — so `anti-patterns.md` (128,341 bytes) **must** be fetched by section, not whole-file.

**Transitions:** `to: validate-and-commit`, `isDefault: true`.

### 2.4 `activities/09-validate-and-commit.yaml`

| field | value |
|---|---|
| filename | `activities/09-validate-and-commit.yaml` |
| `id` | `validate-and-commit` |
| prefix | `09` |
| `required` | `true` |
| purpose | Independently verify findings in a fresh context, gate, re-verify scope, commit, publish, close out. Terminal. |
| persists | `findings-register.md`, `COMPLETE.md` |
| steps | 17, no loops |

Let **T** = `and(remediation_selected != true, review_closed != true)`. **T is mandatory on steps 7–17.** `transitionTo` is *"Recorded and returned, not engine-applied: selecting the option does not itself move the session"* (`src/schema/activity.schema.ts:50`), so a back-edge selection at step 4 or 5 does **not** stop the worker walking the rest of `steps[]`. Without T, choosing `remediate` still presents Gate 2, can commit and open a non-draft PR carrying unfixed findings, writes `COMPLETE.md` on a non-terminal pass, and removes the worktree the next round must edit.

| # | kind | id | technique / body | deviations & remaps | gate |
|---|---|---|---|---|---|
| 1 | technique | `verify-audit-findings` | `verify-high-findings` | extended: declare `{open_finding_count}`, `{has_critical_finding}`, `{has_coverage_gap}`, `{verified_findings}`; add Input `{coverage_ledger}`; drop the `verified_findings_path` output and its `#### artifact` block; drop "the calling activity's" at `:41`; add Rule `no-originating-rationale`; rephrase `verify-before-remediation` to the non-positional *"Do not emit a remediation instruction for a row whose claim has not been re-derived."*; cite `audit-canon`'s phase-1 anchor inventory by hyperlink and declare no inventory of its own | — |
| 2 | technique | `compile-register` | `compile-report` | retargeted to cite `findings-register.md#template`; Inputs `{register_sections}`, `{verified_findings}`, `{coverage_ledger}`, `{known_finding_keys}`, and **optional** `{impact_analysis_path}` — emit a `## Sources` row only when present. → `{findings_register}` | — |
| 3 | technique | `persist-register` | `work-package::manage-artifacts::write-artifact` | `bare_filename: findings-register.md`, `artifact_content: findings_register`, `outputs.written_artifact: report_path` | — |
| 4 | **checkpoint** | `review-disposition` | **BLOCKING** — body from `08:77-105` minus `selective-fixes` (whose effect at `:96-105` is byte-identical to `fix-issues` at `:87-95` — AP-88) | options below | `condition: operation_type == 'review'` |
| 5 | **checkpoint** | `audit-disposition#{remediation_round}` | **BLOCKING pre-attestation gate** — message links `[findings register]({report_path})` and interpolates `{open_finding_count}`, `{has_critical_finding}`, `{has_coverage_gap}`, `{fail_count}` and the blocked-unit list | options below | `condition: or(has_critical_finding == true, open_finding_count > 0)` |
| 6 | action | `bump-remediation-round` | `set remediation_round` | value-BEARING | `when: remediation_selected == true` |
| 7 | technique | `verify-scope-manifest` | `scope-verification` | absorbs `scope-audit`'s drift check; → `{total_count}`, `{addressed_count}`, `{unaddressed_count}` | `when: and(operation_type != 'review', remediation_selected != true, review_closed != true)` |
| 8 | technique | `verify-planning-readme` | `workflow-engine::verify-readme-conforms` | — | `when: T` |
| 9 | **checkpoint** | `approve-to-commit#{remediation_round}` | **BLOCKING**, Gate 2 — body from `09:145-167` | options below | `condition: and(operation_type != 'review', remediation_selected != true, review_closed != true)` |
| 10 | technique | `stage-and-commit` | `version-control::commit-regular-files` | — | `when: and(commit_approved == true, T)` |
| 11 | technique | `verify-commit` | `commit-verification` | delete `:18`, which hard-codes six `09` step ids | `when: and(commit_approved == true, T)` |
| 12 | technique | `push-branch` | `version-control::push-branch` | → `{workflow_branch}` | `when: and(commit_approved == true, T)` |
| 13 | technique | `compose-pr` | `publish-workflow-pr` | — | `when: and(commit_approved == true, T)` |
| 14 | technique | `open-pr` | `github-cli-protocol::create-pr` | `as_draft: false`; → `{pr_url}`, `{pr_number}` | `when: and(commit_approved == true, T)` |
| 15 | technique | `compose-close-out` | `create-completion-doc` | absorbs `conduct-retrospective` as a section (`resources/completion-artifact.md:10`); Inputs `{open_finding_count}`, `{coverage_ledger}`, `{removals_approved}` | `when: and(commit_approved == true, T)` |
| 16 | technique | `persist-close-out` | `work-package::manage-artifacts::write-artifact` | `bare_filename: COMPLETE.md` — fixes `11:20`/`11:36`, which pass `completion.md` while every canon layer declares `COMPLETE.md` | `when: and(commit_approved == true, T)` |
| 17 | technique | `remove-worktree` | `work-package::manage-git::remove-worktree` | `component_name: workflows` | `when: and(worktree_created == true, commit_approved == true, T)` |

`github-cli-protocol::mark-ready` is not bound: Gate 2 already approved publication, so the PR opens non-draft in one step.

**`review-disposition` options:**

| option id | effects |
|---|---|
| `fix-issues` | `setVariable operation_type: update, update_seeded_from_review: true` + `transitionTo: intake-and-context`; **description instructs narrowing `target_workflow_ids` to the escalated target** |
| `report-only` | `setVariable review_closed: true` |

The narrowing cannot be a static `setVariable`: the escalated target is chosen *in the response*, and after the `08:5` loop completes `target_workflow_id` holds the last iteration's value, not necessarily the escalated one. The corpus idiom for a response-supplied list is a description instruction relayed through `variables_changed` — precedent `01-intake-and-context.yaml:76` (`wrong-review-target`: "supply a corrected `target_workflow_ids` list"). Without the narrowing, an escalated update re-sweeps all N review targets when one was fixed.

**`audit-disposition#{remediation_round}` options:** `remediate` → `setVariable remediation_selected: true` + `transitionTo: quality-review`; `accept-and-record` → `setVariable remediation_selected: false, has_critical_finding: false`.

**Gate 2 `approve-to-commit#{remediation_round}` options:** `approved` → `setVariable commit_approved: true`; `return-to-draft` → `transitionTo: scope-and-draft`; `revise-intent` → `transitionTo: intake-and-context`. Its message links `[change brief]({change_brief_path})`, `[scope manifest]({scope_manifest_path})`, `[findings register]({report_path})` and interpolates `{unaddressed_count}`/`{total_count}`, `{open_finding_count}`, `{has_coverage_gap}`. It **must not** link `{impact_analysis_path}`: `message` is `z.string().optional()` (`src/schema/activity.schema.ts:124`) with no conditional-clause construct, and the producer `01:11` is gated `== 'update'`, so in create mode the link renders `[impact analysis]()` — the exact AP-97 defect (`AP:1266`) this plan deletes `05:28-37` for. The impact analysis reaches the register instead, via `09:2`'s optional input and its conditional `## Sources` row.

**Transitions:**

| # | to | condition |
|---|---|---|
| T1 | `quality-review` | `when: and(remediation_selected == true, remediation_round < 3)` |
| T2 | `__terminal__` | `isDefault: true` |

---

## 3. Transition graph

| From | To | Carrier | Condition / origin | Legal because |
|---|---|---|---|---|
| `intake-and-context` | `__terminal__` | declared, first-listed | `and(operation_type == 'review', review_scope_confirmed != true)` | `TERMINAL_SENTINEL` is exempt from anywhere (`src/utils/validation.ts:42`) |
| `intake-and-context` | `quality-review` | declared | `and(operation_type == 'review', review_scope_confirmed == true)` | declared edge |
| `intake-and-context` | `scope-and-draft` | declared | `isDefault: true` | declared edge |
| `scope-and-draft` | `scope-and-draft` | **checkpoint effect only** — `scope-confirmed.revise` | operator chose revise | `getValidTransitions` harvests `c.options.forEach(o => o.effect?.transitionTo …)` (`src/loaders/workflow-loader.ts:473`), so effect-only targets are in the valid set; and `validateActivityTransition` returns `null` on a self-transition (`validation.ts:37`) |
| `scope-and-draft` | `quality-review` | declared | `isDefault: true` | declared edge |
| `quality-review` | `validate-and-commit` | declared | `isDefault: true` | declared edge |
| `validate-and-commit` | `quality-review` | declared **and** checkpoint effect — `audit-disposition.remediate` | `and(remediation_selected == true, remediation_round < 3)` | declared edge; the effect target is additionally harvested at `workflow-loader.ts:473` |
| `validate-and-commit` | `intake-and-context` | **checkpoint effect only** — `review-disposition.fix-issues`, `approve-to-commit.revise-intent` | operator escalated or revised intent | harvested at `workflow-loader.ts:473`; `validateActivityTransition` feeds `buildValidation(...)` (`workflow-tools.ts:517`), i.e. warn-only |
| `validate-and-commit` | `scope-and-draft` | **checkpoint effect only** — `approve-to-commit.return-to-draft` | operator returned to draft | as above |
| `validate-and-commit` | `__terminal__` | declared | `isDefault: true` | `validation.ts:42` |

**Three edges exist only as checkpoint effects** (`06 → 06`, `09 → 01`, `09 → 06`). They are legal and warning-free: `getValidTransitions` explicitly includes effect `transitionTo` targets, so they are inside the valid set even though no `transitions[]` entry names them.

**Every cycle is bounded twice.** `remediation_round < 3` on the declared back edge (structure), plus a BLOCKING checkpoint per round — server-enforced once yielded, since `state.activeCheckpoint` blocks every other tool (`workflow-tools.ts:329`, `:600`, `:1295`; `src/tools/resource-tools.ts:590`, `:771`; `src/utils/session/params.ts:38-46`). `maxIterations` and `breakCondition` are agent-honoured only (`src/schema/activity.schema.ts:144-145`), which is why the bound is never left to a loop.

**Additive-landing note.** A transition naming a not-yet-authored activity emits an advisory `Activity manifest references unknown activity` warning (`src/utils/validation.ts:232-233`). While landing one activity at a time, terminate each stage's graph at `__terminal__` and rewire on the next stage.

---

## 4. Artifacts — six survivors

`write-artifact` bind sites: **6** — 5 `manage-artifacts::write-artifact` binds plus 1 `workflow-engine::create-readme`. Per-activity `write-artifact` distribution is **2 / 1 / 0 / 2**, maximum **2** in any one activity (`create-readme` at `01:6` is a different op and is counted separately). Distinct static targets with distinct structured inputs — AP-38's named carve-out (`AP:550`) holds, and the roster never becomes a clean iterable, so AP-38 classification (b) never fires.

| bare filename | persisted by | creation guide (AP-116) | named reader |
|---|---|---|---|
| `README.md` | `01:6 seed-planning-readme` (`workflow-engine::create-readme`, `seed_profile: workflow-authoring/readme-seed`) | `meta/resources/planning-readme.md` + `resources/readme-seed.md` | human; `sync-progress-status` mutates Status only (`meta/techniques/workflow-engine/sync-progress-status.md:60`) |
| `change-brief.md` | `01:10 persist-change-brief` | **new** `resources/change-brief.md` | human at Gate 1 and Gate 2; `scope-definition` |
| `impact-analysis.md` | `01:11 persist-impact-analysis` | `resources/impact-analysis.md` | human at `impact-approved`; `scope-definition` and `audit-canon` as `{change_constraints}`; `compile-report` as an optional `## Sources` row |
| `scope-manifest.md` | `06:3 persist-scope-manifest` | `resources/scope-manifest.md` | `06:6` iterates it (`forEach current_file over scope_manifest`); `scope-verification` at `09:7` |
| `findings-register.md` | `09:3 persist-register` | **new** `resources/findings-register.md` | agent state: `verify-high-findings`, `compile-report`, `apply-audit-fixes` (`{selected_findings}`), next run's `load-known-findings`; human via both gate messages |
| `COMPLETE.md` | `09:16 persist-close-out` | `resources/completion-artifact.md` | human, post-session |

No output declaration carries an `audience:` attribute. `scripts/check-audience.ts:104` `continue`s unless `o.audience === 'agent'`, and declaring `findings-register.md` as `audience: agent` would make the guard demand a `.json` name — one NEW violation and a non-zero exit. AP-96's Fix authorises the alternative verbatim (`AP:1264`): *"Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute."*

`resources/findings-register.md` is section-delivered (§30, `DP:133`): `## Template`, `## Findings` (row shape + severity scale), `## Coverage`, `## Known`, `## Sources`, `## Rules`. `## Coverage` persists **divergences only** — `blocked` and `not-applicable (reason)` rows, omitted entirely when empty (AP-87 `AP:1146`); the full ledger stays an in-session value carried `08:5c → 09:1 → 09:2`, because AP-91's Fix is explicit (`AP:1204`): *"present aggregate scorecards in-session, not persisted."* Its coverage contract is stated structurally — "one row per `##` section of each named home" — never as a count, and it never enumerates a sibling resource's internals.

No activity declares `artifacts[]` (AP-31 `AP:458`). No message contains an `NN-` filename literal; every message naming a durable file links its path variable and sits on the same gate arm as that variable's producer.

---

## 5. Mode coverage

`operation_type` ∈ `create | update | review`. ✓ = fires, — = gated out, ◆ = fires only on the stated condition.

| step | create | update | review | gate |
|---|---|---|---|---|
| `01:1 bind-planning-folder-path` | ✓ | ✓ | ✓ | ungated |
| `01:2 derive-target-path` | ✓ | ✓ | ✓ | **ungated** |
| `01:3 classify-intake` | ✓ | ✓ | ✓ | `update_seeded_from_review != true` |
| `01:4 design-intent-batch` | ◆ | ◆ | ◆ | `and(intent_needs_confirmation == true, update_seeded_from_review != true)` |
| `01:5 announce-wrong-target` | — | — | ◆ | `and(== 'review', review_scope_confirmed != true)` |
| `01:6 seed-planning-readme` | ✓ | ✓ | — | `!= 'review'` |
| `01:7 elicit-change-brief` | ✓ | — | — | `== 'create'` |
| `01:8 synthesize-change-brief` | — | ✓ | — | `== 'update'` |
| `01:9 analyze-impact` | — | ✓ | — | `== 'update'` |
| `01:10 persist-change-brief` | ✓ | ✓ | — | `!= 'review'` |
| `01:11 persist-impact-analysis` | — | ✓ | — | `== 'update'` |
| `01:12 surface-open-judgements` | ◆ | ◆ | — | `open_judgements_count > 0` |
| `01:13 impact-approved` | — | ◆ | — | `removal_count > 0` |
| `06:1 ensure-worktree` | ✓ | ✓ | — | `!= 'review'` |
| `06:2 define-scope` | ✓ | ✓ | — | `!= 'review'` |
| `06:3 persist-scope-manifest` | ✓ | ✓ | — | `!= 'review'` |
| `06:4 scope-confirmed#{scope_round}` | ✓ | ✓ | — | `!= 'review'` |
| `06:5 bump-scope-round` | ◆ | ◆ | — | `scope_manifest_confirmed != true` |
| `06:6 file-drafting-loop` (6a–6d) | ✓ | ✓ | — | `scope_manifest_confirmed == true` |
| `06:7 author-workflow-readme` | ✓ | ✓ | — | `!= 'review'` |
| `06:8 verify-artifact-conforms` | ✓ | ✓ | — | `!= 'review'` |
| `08:1 author-fixes` | ◆ | ◆ | ◆ | `remediation_round > 0` |
| `08:2 record-fixes` | ◆ | ◆ | ◆ | `remediation_round > 0` |
| `08:3 load-known-findings` | ✓ | ✓ | ✓ | ungated |
| `08:4 survey-reference-workflows` | ✓ | ✓ | ✓ | ungated |
| `08:5 target-sweep-loop` (5a–5e) | ✓ ×1 | ✓ ×1 | ✓ ×N | ungated |
| `09:1 verify-audit-findings` | ✓ | ✓ | ✓ | ungated |
| `09:2 compile-register` | ✓ | ✓ | ✓ | ungated |
| `09:3 persist-register` | ✓ | ✓ | ✓ | ungated |
| `09:4 review-disposition` | — | — | ✓ | `== 'review'` |
| `09:5 audit-disposition#{remediation_round}` | ◆ | ◆ | ◆ | `or(has_critical_finding == true, open_finding_count > 0)` |
| `09:6 bump-remediation-round` | ◆ | ◆ | ◆ | `remediation_selected == true` |
| `09:7 verify-scope-manifest` | ✓ | ✓ | — | `and(!= 'review', T)` |
| `09:8 verify-planning-readme` | ✓ | ✓ | — | `T` |
| `09:9 approve-to-commit#{remediation_round}` | ✓ | ✓ | — | `and(!= 'review', T)` |
| `09:10-14 commit / verify / push / PR` | ◆ | ◆ | — | `and(commit_approved == true, T)` |
| `09:15-16 close-out` | ◆ | ◆ | — | `and(commit_approved == true, T)` |
| `09:17 remove-worktree` | ◆ | ◆ | — | `and(worktree_created == true, commit_approved == true, T)` |

Mode-arm census: `== 'create'` ×1; `== 'update'` ×3; `!= 'review'` ×9 (`01:6`, `01:10`, `06:1`, `06:2`, `06:3`, `06:4` condition, `06:7`, `06:8`, and the two conjoined `09:7`/`09:9`); `== 'review'` ×3 (`01:5` when, the `01 → quality-review` transition, `09:4` condition), plus the `01 → __terminal__` reject edge.

**Consequences a builder must not mistake for holes.**

- **Review mode never enters `06`.** It has no worktree and authors nothing; `{target_path}` nonetheless resolves, because `derive-target-path` is `01:2` and ungated. This is what makes `08:5d`'s `--root {target_path}` real: `resolveWorkflowsRoot:19` requires a truthy `argv[flag + 1]`, so `--root ""` is treated as absent and all ten guards silently fall back to `../workflows`, the stale main checkout (`scripts/workflows-root.ts:4-11`).
- **Review mode terminates on the register.** `commit_approved` is only set by Gate 2, which is `!= 'review'`, so no commit, no PR, and no `COMPLETE.md`. `findings-register.md` is a review run's terminal record.
- **The escalation path re-enters `01` with `operation_type: update`.** `01:3` is skipped (`update_seeded_from_review != true` is false), so classification cannot revert the mode and cannot clobber the narrowed `target_workflow_ids`; every classification output persists in the session bag from the review pass. Gate 1 is suppressed by the same flag. `08:5` then sweeps one target and `06` runs with a worktree.
- **On a remediation round, `09` stops at step 6.** `T` is false for steps 7–17, so Gate 2 is never presented, nothing is committed, no `COMPLETE.md` is written, and the worktree survives for `08:1 author-fixes` to edit.

---

## 6. Checkpoint census — 7 gates, all effect-bearing

| id | activity | type | `condition` | effects | instance-qualified |
|---|---|---|---|---|---|
| `design-intent-batch` | 01 | BLOCKING | `and(intent_needs_confirmation == true, update_seeded_from_review != true)` | 5 options, all `setVariable` | no — suppressed on re-entry by the `update_seeded_from_review` clause |
| `impact-approved` | 01 | BLOCKING | `removal_count > 0` | `removals_approved` | no |
| `scope-confirmed#{scope_round}` | 06 | **SOFT** | `operation_type != 'review'` | `scope_manifest_confirmed` + self `transitionTo` on `revise` | **yes** |
| `preservation-check#{current_file.path}` | 06 | BLOCKING | `has_unflagged_removals == true` | `removal_disposition` | **yes** |
| `review-disposition` | 09 | BLOCKING | `operation_type == 'review'` | `operation_type`, `update_seeded_from_review`, `transitionTo`; or `review_closed` | no |
| `audit-disposition#{remediation_round}` | 09 | BLOCKING | `or(has_critical_finding == true, open_finding_count > 0)` | `remediation_selected`, `has_critical_finding`, `transitionTo` | **yes** |
| `approve-to-commit#{remediation_round}` | 09 | BLOCKING | `operation_type != 'review'` conjoined with `T` | `commit_approved`, or `transitionTo` ×2 | **yes** |

Every option on every gate carries an `effect` — AP-89 `checkpoint-requires-decision` (`AP:1170`) keys on a recorded effect, and a zero-effect option is a violation regardless of how the message reads. Exactly one decision per gate: removal approval (`01:13`) and scope approval (`06:4`) stay separate because their answer spaces do not overlap (AP-05 `AP:134`; AP-88's do-not-flag `AP:1158`), and `selective-fixes` is collapsed into `fix-issues` because their effects were byte-identical.

**Counter visibility caveat.** `#{scope_round}` and `#{remediation_round}` interpolate counters produced by `action: set`, and the server has no action interpreter: an executed `set` reaches the session bag only "when the worker reports it in the `variables_changed` its orchestrator relays on `next_activity`" (`src/schema/activity.schema.ts:26`). A worker that omits the bump leaves the instance id unchanged, and `yield_checkpoint` then replays the stored response with no prompt (`workflow-tools.ts:978-1022`). So the per-round bound is only as strong as the worker's self-report — accept that residual risk explicitly, or derive the qualifier from a technique Output (which lands through `variable-binding` rather than `set`). `#{current_file.path}` needs no counter and is unaffected. The same schema line notes `set` is slated for removal at the next workflow-schema major (#166 B7/B12), which bounds the lifetime of all four surviving `set` steps — `planning_folder_path`, `scope_round`, `remediation_round`, `register_sections`, all value-BEARING and inside AP-33's do-not-flag (a) and (c) (`AP:492`) and AP-34's (`AP:498`).

No `decisions:` block anywhere. `decisions` is read in exactly two places, both of which only widen the legal-transition set (`workflow-loader.ts:472`, `:500-507`), and no server code evaluates a branch — a blocker gate that nothing enforces is the defect `audit-rule-enforcement.md:32` exists to catch (AP-79 `AP:1046`). The blocker here is a BLOCKING checkpoint with a recorded effect plus a transition condition.

---

## Corrections applied

Built in above rather than described as findings. Each entry names what changed and why.

| # | Change | Why |
|---|---|---|
| C-1 | `09`'s steps 7–17 carry `T = and(remediation_selected != true, review_closed != true)`; 15–17 additionally `commit_approved == true`; 17 keeps `worktree_created == true`. | `transitionTo` is *recorded, not engine-applied* (`src/schema/activity.schema.ts:50`), so a back-edge selection does not stop the tail. Ungated, `remediate` still presents Gate 2, can commit unfixed findings on a non-draft PR, writes `COMPLETE.md` on a non-terminal pass, and deletes the worktree the next round must edit. Also gives `review_closed` its readers, so it is no longer write-only (M-2). |
| H-1 | `resolve-consumer-surface` moved from top-level `08:3` into the `08:5` loop body as `5b`, immediately after `rebind-target-baseline`. | Its inputs are `{changed_files}` (produced only by `5a`) and `{target_workflow_id}` (the `forEach` loop variable, undefined outside the loop). At top level both are unproduced — AP-128 (`AP:1688`) — and the walker would resolve consumers of nothing. Eager eligibility is unchanged (`collectUngated` recurses into ungated loops, `workflow-tools.ts:716`) and the step becomes per-target, which review mode needs. |
| H-2 | `audit-canon` declares **one** Rule, `structural-evidence-first`; `attribute-against-base` and `exclude-known-from-decision-surface` are deleted as Rules. Attribution and exclusion are carried by Inputs (`{base_ref}`, `{known_finding_keys}`), the required `Origin`/`Known` columns in `findings-register.md#findings`, and Protocol phase 3. | Phase 3 already states both duties by name with the same variables, so as Rules they are AP-19 `no-rule-protocol-restatement` restatements (`AP:314`); AP-121's do-not-flag defers back to AP-19 (`AP:1572`), closing the escape. AP-25 does not require three rules. |
| H-3 | `01` gains a first-listed `to: __terminal__ when and(operation_type == 'review', review_scope_confirmed != true)`; step 5 becomes a `message` only (renamed `announce-wrong-target`) and is narrowed to the same expression; `06:8 verify-artifact-conforms` is gated `operation_type != 'review'`; Gate 1's `wrong-review-target` drops `intent_needs_confirmation: true`. | `action: validate` cannot halt — the server has no action interpreter (`activity.schema.ts:26`). Without the terminal edge a rejected review target fails the review transition, takes `isDefault` into `scope-and-draft`, runs the one ungated step there, and rides `isDefault` into the full sweep against the rejected target. The id is renamed because `halt-on-wrong-target` now describes something the step cannot do. |
| New hole 1 | `derive-target-path` relocated to `01:2`, **ungated**; `ensure-worktree` stays at `06:1` gated `!= 'review'`. | `{target_path}` is a pure derivation from `{planning_folder_path}` (produced at `01:1`). Review mode never enters `06`, so producing it there left `{target_path}` empty in the one mode whose whole job is sweeping other workflows; `resolveWorkflowsRoot:19` treats `--root ""` as absent and every guard silently validates the stale main checkout. |
| New hole 2 | `09:4 review-disposition.fix-issues` also narrows `target_workflow_ids` to the escalated target — specified as a description instruction relayed via `variables_changed`, per the `wrong-review-target` precedent (`01-intake-and-context.yaml:76`), because a static `setVariable` cannot name a target chosen in the response and post-loop `target_workflow_id` holds the last iteration. | Without it an escalated update re-sweeps all N review targets when one was fixed, and `08:5`'s "once in create/update, N in review" claim is false on the escalation path. |
| H-4 | Gate 2's message drops `[impact analysis]({impact_analysis_path})`; `compile-report` gains it as an **optional** input and emits a `## Sources` row only when present. `resources/findings-register.md` describes Sources abstractly and never names `impact-analysis.md`. | `message` is `z.string().optional()` with no conditional-clause construct (`activity.schema.ts:124`), and the producer `01:11` is gated `== 'update'`, so create mode renders `[impact analysis]()` — AP-97 (`AP:1266`), the same defect the plan deletes `05:28-37` for. Gate 2 now links only artifacts on its own gate arm. |
| H-5 | `06:6d` gated `when: and(has_unflagged_removals == true, removal_disposition == 'restored')`. | 6c and 6d sit inside a `maxIterations: 50` loop: iteration 1 sets `restored`, iteration 2 skips 6c, and 6d re-applies a restoration to a file that flagged none. AP-128's suggested `operator: exists` cannot help — a stale value exists. Conjoining the producer's own expression kills the bleed. |
| H-7 | `08`'s eager eligibility stated structurally as steps 3, 4, 5a, 5b, 5c, 5d — 6 of 10 — with the loop container and `5e` (`kind: action`) named structurally ineligible. | `collectUngated` pushes only `kind: technique && s.id` and recurses into loops without pushing them (`workflow-tools.ts:713-719`). The plan's 8 counted the loop container. The count survives H-1's relocation unchanged. |
| H-8 | `08:5d` invocations corrected: `validate-workflow-yaml.ts {target_path}/{target_workflow_id}` positional, `check-all-refs.ts` and `check-binding-fidelity.ts` plus the seven added guards each `--root {target_path}`. | `--root` is documented as "a worktree's workflows directory" and `validate-workflow-yaml.ts` takes a positional per-workflow path (`scripts/workflows-root.ts:4-11`), so `--root` is not its interface. `{target_path}/{target_workflow_id}` composes only because `5d` is inside the `forEach`. |
| H-10 | `{coverage_ledger}` stays an in-session value; `findings-register.md#coverage` persists divergences only and is omitted when empty; ledger status is three-valued `walked \| not-applicable (reason) \| blocked` and `{has_coverage_gap}` counts `blocked` only. | AP-91's Fix is verbatim *"present aggregate scorecards in-session, not persisted"* (`AP:1204`); AP-87 (`AP:1146`) forbids a None/N-A section. The three-valued status keeps the evidenced-negative obligation without a hard-coded anchor count. |
| M-1 | Variable total resolved to **42** (31 survivors + 11 added); `verified_findings` declared (array, no `defaultValue`); `pass_count` dropped from the declaration, from `08:5d`'s outputs and from `audit-schema-validation.md`'s Outputs in one commit; the one inclusion rule for technique-Input-only values stated in §1.4. | §4.4's own admission criterion includes input deviations, and `08:2` binds `selected_findings: verified_findings`. `verified_findings_path` — the only such name today (`:169`) — is deleted, so an undeclared read is a NEW hard violation (`check-binding-fidelity.ts:474-481`). A declared output with no declaration and no reader is the dead-output shape at `:485`. |
| M-2 | Discharged by C-1: `review_closed` is read by `09:7-17`. | It was a write-only variable, the exact class §4.4 deletes 32 instances of. |
| M-3 | `write-artifact` distribution stated as **2 / 1 / 0 / 2**, maximum **2**. | `01` has two `write-artifact` binds; `01:6` is `workflow-engine::create-readme`, a different op, counted separately. AP-38 is the entry the plan says gets harder by concatenation, so its count is load-bearing. |
| M-4 | `01` is **13** top-level steps (the plan's heading said 11, its table listed 12, and `derive-target-path` relocates in). Roll-up restated as **43 / 52** — 13 + 8 + 5 + 17 top-level, 13 + 12 + 10 + 17 with loop bodies. | The relocations move one step from `06`'s top level into `01` and one from `08`'s top level into its loop body, so the with-bodies total holds at 52 while top-level drops from 44 to 43. |
| M-5 | `01:3 classify-intake` gated `when: update_seeded_from_review != true`. | Ungated, it re-derives the mode from a `{user_description}` that still describes a review and can revert `operation_type` to `review`, looping `01 → 08 → 09 → 01` with the seeded update never running. The gate is chosen over a technique-internal preserve branch because it is structural (§20, AP-107) and because re-running the step would also clobber the `target_workflow_ids` narrowing from new hole 2. |
| M-6 | §6 records that `#{scope_round}` / `#{remediation_round}` visibility depends on the worker's `variables_changed` relay, names the deterministic alternative (qualify on a technique Output), and notes `set`'s #166 deprecation beside the AP-33/34 defence. | The server has no action interpreter (`activity.schema.ts:26`); an unrelayed bump leaves the instance id unchanged and `yield_checkpoint` replays the stored response with no prompt. |
| M-k | `target_workflow_id`'s description rewritten. | The live text at `workflow.yaml:191` is an unterminated sentence that also names its loop — AP-126. |
| AP-96 / `check-audience` | No output declaration carries `audience:`; audience is recorded in the description. | `scripts/check-audience.ts:104` `continue`s unless `audience === 'agent'`, and declaring it would make the guard demand a `.json` name — one NEW violation. AP-96's Fix authorises the description form verbatim (`AP:1264`). |
| AP-68 / `TECHNIQUE.md` | The canonical-home-map rule is authored as *"…enforces the map."* with no activity or position named, and the map is **6 rows**. `verify-before-remediation` is rephrased to *"Do not emit a remediation instruction for a row whose claim has not been re-derived."* | The live `TECHNIQUE.md:70` reads "enforces the map at the end of `scope-and-draft`" — AP-68 Detect(a). The rule rephrase is AP-107/§20, not AP-68: once verification is `09:1` and remediation is `08:1-2`, the ordering is carried by the transition graph. |
| §4.4 `:51` reconciliation | Only `removal_count` (`:87`) is retained-and-rewritten for AP-126. | §4.4 lists `:51` as retained-and-rewritten, but `:51` is the description line of `has_resolvable_assumptions`, which the same section deletes at `:49`. Its AP-126 producer tail dies with the variable; nothing survives to rewrite. |
| Workflow-id knock-ons | `seed_profile: workflow-authoring/readme-seed` at `01:6`; the four criteria homes cited `workflow-design/<home>#<anchor>` during coexistence and rewritten to bare `<home>#<anchor>` when that tree is deleted. | The seed profile is workflow-id-qualified, and the new tree cites rather than copies the 154,507 B canon — one physical copy, §6 One Authoritative Home intact. An unresolvable resource is skipped with `continue` and **no warning** (`workflow-tools.ts:801`), so premature deletion silently empties the criteria bundle. |
