# Issue #321 — Implementation Plan: cut `workflow-design` to a minimal, token-efficient, maximally effective shape

**Corpus root** `BASE = /home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation`
**Server root** `SRV = /home/mike1/projects/dev/workflow-server`
`WD = BASE/workflow-design` · `AP = WD/resources/anti-patterns.md` · `DP = WD/resources/design-principles.md`
Paths below are `WD`-relative unless prefixed. Every line cite is verified by read.

---

## 0. What this plan is, and the four places it departs from the ranked proposal

This builds on the **value-preserving** target. It grafts the six ideas the judges flagged as worth taking from the other two, and it fixes every FATAL defect. Four departures from the ranked proposal, each forced by a fatal:

| # | Departure | Forced by |
|---|---|---|
| D1 | **Activity ids and filenames are preserved, not renamed.** `01-intake-and-context`, `06-scope-and-draft`, `08-quality-review`, `09-validate-and-commit` keep both. No `frame`/`draft`/`audit`/`land`. | FATAL (migration): 32 non-terminal sessions on disk, not 6. Verified by walking `SRV/.engineering/artifacts/planning/*/session.json` including embedded `triggeredWorkflows[i].state`: 33 `workflow-design` sessions, 32 `running`, current activities `retrospective` ×19, `quality-review` ×4, `intake-and-context` ×3, `scope-and-draft` ×1, `validate-and-commit` ×1, `post-update-review` ×1, `impact-analysis` ×1, `content-drafting` ×1 (a v1.2.1 id already dead), `""` ×1. Id preservation rescues 9 outright and shrinks the rewriter to a 5-id map. `get_activity` throws `Activity not found` with no fallback (`SRV/src/tools/workflow-tools.ts:602-609`) while `get_workflow_status` keeps reporting the dead id as healthy (`:1358`, `:1392`). |
| D2 | **`verify-high-findings` moves to the head of `09-validate-and-commit`**, not into a fifth node and not into the audit activity. The fix cycle becomes a bounded cross-node back edge `validate-and-commit → quality-review`. | `verify-high-findings.md:28` (verified verbatim): "re-derive it from the cited file and construct alone, **without reading the originating pass's reasoning** — refute by default." In the sweep's own context that instruction is unenforceable. A fresh `get_activity` for `validate-and-commit` gives a worker that never held the sweep. Dispatch count stays at 4 on the clean path; verification is not a fifth dispatch. Name stays accurate: verification *is* validation. |
| D3 | **The multi-target review structure is a declared `forEach` at the bind site, not a borrowed `meta/activities/patterns/04-isolated-fan-out.yaml` node.** | FATAL (migration + efficacy): the borrowed file declares no `transitions:` (verified — its only graph line is `id: isolated-fan-out`), so `getValidTransitions` returns `[]` and `validateActivityTransition` short-circuits to `null` (`SRV/src/utils/validation.ts:45`) — every target legal, unwarned, from a node a review session enters. A wrapper *before* it cannot fix its *exit*. Also: the borrow is invisible to both schemas (`SRV/src/schema/workflow.schema.ts:88`; `SRV/schemas/workflow.schema.json:422+`, object items, `additionalProperties: false`), and its filename prefix `04` collides with live folders' `@ 04` rows. The graft's *intent* — declare the structure at a bind site, do not hand-roll a spawn recipe — is satisfied by the loop. Rejected-alternative rationale in §7. |
| D4 | **Scope definition stays in `06-scope-and-draft`; impact/removal approval sits in `01-intake-and-context`.** | Preserves the `@ 06` Progress mapping for `scope-manifest.md` in all 32 existing folders and keeps both activity names literally accurate. §3's enumerate→re-verify pair still spans two boundaries (`06` → `09`), so AP-07 (`AP:158`) is satisfied. |

Grafts taken, with their source: AP-114 Detect-test-in-reverse justification (delivery-first, §2 and §3); split removal approval from scope approval (delivery-first, §1); keep `headless_mode` and one soft effect-bearing gate (delivery-first, §1.3); `#authoring-guidance-mr` anchor instead of re-sectioning the catalogue (delivery-first/minimal-cut, §3); the AP-121/AP-25 placement table with `coverage_ledger` criteria in **Outputs** (minimal-cut, §3.4); the per-boundary AP-69 discharge table (minimal-cut, §2.1); derived rather than asserted coverage (minimal-cut, §3.5); instance-qualified per-round disposition gate (minimal-cut, §1.3); `workflowVersion` restamping in the rewriter (delivery-first, §5).

---

## 1. Target architecture

### 1.1 Activity list

Filename id segment **must** equal declared `id:` — `getActivity` matches the YAML `id` (`SRV/src/loaders/workflow-loader.ts:426-428`) but `readActivityRaw`, the path `get_activity` uses, matches the filename-derived id (`:570`), and no validator compares the two. A file not matching `/^(\d+)-(.+)\.ya?ml$/` is silently skipped (`:68-69`, `SRV/src/loaders/filename-utils.ts:6-10`).

| File | `id` | prefix | `required` | Purpose | Artifacts it persists |
|---|---|---|---|---|---|
| `activities/01-intake-and-context.yaml` | `intake-and-context` | 01 | true | Classify the request, name the target, produce the change brief and the change constraints, approve removals. | `README.md` (seeded), `change-brief.md`, `impact-analysis.md` |
| `activities/06-scope-and-draft.yaml` | `scope-and-draft` | 06 | true | Enumerate scope, prepare the edit worktree, author every file the manifest names, author the target README. | `scope-manifest.md` |
| `activities/08-quality-review.yaml` | `quality-review` | 08 | true | One whole-surface canon sweep per target against the working tree, plus consumer-surface and known-item resolution. Applies fixes on remediation rounds. | none |
| `activities/09-validate-and-commit.yaml` | `validate-and-commit` | 09 | true | Independently verify findings in a fresh context, gate, re-verify scope, commit, publish, close out. Terminal. | `findings-register.md`, `COMPLETE.md` |

Prefixes stay **sparse (01/06/08/09)**. `localeCompare` ordering is correct (`workflow-loader.ts:91-93`); the `02`/`04`/`05`/`07`/`10`/`11` gaps are already sanctioned convention (`activities/README.md:9` declares `02`/`07` intentional). Renumbering to `01-04` buys cosmetics and pays the `@`-column collision in 32 live folders.

Gate vocabulary used below: **BLOCKING** = `blocking: true`, **no** `defaultOption`, **no** `autoAdvanceMs` — the server's `auto_advance` throws when either is missing (`SRV/src/tools/workflow-tools.ts:1167-1172`), so the timer path is structurally unavailable. **SOFT** = both present, server-enforced timer (`:1173-1185`). `condition:` (structured) is used on checkpoints only, because its *presence* is what makes `respond_checkpoint condition_not_met` legal (`SRV/src/schema/activity.schema.ts:75`; `workflow-tools.ts:1186-1192`). Every non-checkpoint gate is a `when:` one-liner — identical for the agent, for manifest validation (`SRV/src/utils/validation.ts:79-82`) and for bundling eligibility (`workflow-tools.ts:715`), and it removes the 698 of 1,935 corpus lines (36%; 282 of 531 in `08`) that are structured `condition:` blocks today.

### 1.2 Step inventories

#### `01-intake-and-context.yaml` — 11 top-level steps, no loops (~150 lines, from 265)

| # | kind | id | bound technique / body | gate |
|---|---|---|---|---|
| 1 | action | `bind-planning-folder-path` | `set planning_folder_path` — **value-BEARING** | — |
| 2 | technique | `classify-intake` | `intake-classification` (reduced: drop Protocol §4/§5 `:83-90` and the `structural_inventory_path` output `:56-58`; keep `{structural_inventory}` as an in-session value — it is a declared required input of `synthesize-update-specification.md:20-22`, loaded at `:38`. **Add** `review_scope_confirmed` as a declared output) | — |
| 3 | **checkpoint** | `design-intent-batch` | **BLOCKING**, Gate 1. Body reused verbatim from `01-intake-and-context.yaml:35-88`; all 5 options carry `effect.setVariable` (`:54-88`). `wrong-review-target` sets `review_scope_confirmed: false` only — no `transitionTo`. | `condition: and(intent_needs_confirmation == true, update_seeded_from_review != true)` |
| 4 | action | `halt-on-wrong-target` | `action: validate`, `target: review_scope_confirmed` | `when: operation_type == 'review'` |
| 5 | technique | `seed-planning-readme` | `workflow-engine::create-readme` (`seed_profile: workflow-design/readme-seed`) | `when: operation_type != 'review'` |
| 6 | technique | `elicit-change-brief` | **`elicit-change-brief`** (new) → `{change_brief}`, `{open_judgements}`, `{open_judgements_count}` | `when: operation_type == 'create'` |
| 7 | technique | `synthesize-change-brief` | **`synthesize-change-brief`** (new, from `synthesize-update-specification`) → same output set | `when: operation_type == 'update'` |
| 8 | technique | `analyze-impact` | `impact-analysis` (extended: declare **`{change_constraints}`** — the co-change set and identifier-collision set that phases 2-5 `impact-analysis.md:30-47` and rule `side-effect-detection` `:69` already derive but never bind) → `{removal_count}`, `{change_constraints}` | `when: operation_type == 'update'` |
| 9 | technique | `persist-change-brief` | `work-package::manage-artifacts::write-artifact` — `bare_filename: change-brief.md`, `artifact_content: change_brief`, `outputs.written_artifact: change_brief_path` | `when: operation_type != 'review'` |
| 10 | technique | `persist-impact-analysis` | `…::write-artifact` — `impact-analysis.md`, `artifact_content: impact_analysis`, `outputs.written_artifact: impact_analysis_path` | `when: operation_type == 'update'` |
| 11 | action | `surface-open-judgements` | `message` — statement form, links `[change brief]({change_brief_path})` | `when: open_judgements_count > 0` |
| 12 | **checkpoint** | `impact-approved` | **BLOCKING**. Options: `approve-removals` → `setVariable removals_approved: true`; `preserve-more` → `setVariable removals_approved: false` | `condition: removal_count > 0` |

**Transitions:** `to: quality-review` when `and(operation_type == 'review', review_scope_confirmed == true)`; `to: scope-and-draft` `isDefault: true`.
`initialActivity: intake-and-context` (`workflow.yaml:265`) — **unchanged**.

#### `06-scope-and-draft.yaml` — 9 top-level / 13 with loop body (~170 lines, from 336)

| # | kind | id | bound technique / body | gate |
|---|---|---|---|---|
| 1 | technique | `derive-target-path` | `derive-workflows-target-path` | `when: operation_type != 'review'` |
| 2 | technique | `ensure-worktree` | `prepare-workflow-branch` | `when: operation_type != 'review'` |
| 3 | technique | `define-scope` | `scope-definition` (input deviations `change_constraints`, `removals_approved`) → `{scope_manifest}`, `{file_count}` | `when: operation_type != 'review'` |
| 4 | technique | `persist-scope-manifest` | `…::write-artifact` — `scope-manifest.md` → `scope_manifest_path` | `when: operation_type != 'review'` |
| 5 | **checkpoint** | `scope-confirmed#{scope_round}` | **SOFT** (`defaultOption: confirmed`, `autoAdvanceMs: 30000`). `confirmed` → `setVariable scope_manifest_confirmed: true`; `revise` → `setVariable scope_manifest_confirmed: false` **and** `effect.transitionTo: scope-and-draft` | `condition: operation_type != 'review'` |
| 6 | action | `bump-scope-round` | `set scope_round` — **value-BEARING** orchestration state | `when: scope_manifest_confirmed != true` |
| 7 | **loop** | `file-drafting-loop` | `forEach current_file over scope_manifest`, `maxIterations: 50` | `when: scope_manifest_confirmed == true` |
| 7a | technique | `author-yaml` | `yaml-authoring` | — |
| 7b | technique | `review-file` | `review-drafted-file` (reduced: delete Protocol §2 persist `:45-48` and the `file_review_note*` outputs; **keep `{has_unflagged_removals}`** `:34`) | — |
| 7c | **checkpoint** | `preservation-check#{current_file.path}` | **BLOCKING**. `flag-and-proceed` → `setVariable removal_disposition: flagged`; `restore-content` → `setVariable removal_disposition: restored` | `condition: has_unflagged_removals == true` |
| 7d | technique | `apply-removal-disposition` | `yaml-authoring` | `when: removal_disposition == 'restored'` |
| 8 | technique | `author-workflow-readme` | `readme-authoring` — **moved here from `09:139`** so the audit sweeps it | `when: operation_type != 'review'` |
| 9 | technique | `verify-artifact-conforms` | `verify-artifact-conforms` (**absorbs** `review-draft-yaml.md:51-52`'s binding-fidelity pass: every artifact-persisting step is a bound `steps[]` entry, every required input has a producer) | — |

**Transitions:** `to: quality-review` `isDefault: true`.

Step 7c is **instance-qualified**, mandatory: the plain id at `06-scope-and-draft.yaml:140` sits inside a `maxIterations: 50` loop, and `yield_checkpoint` replays a stored response for `${activityId}-${checkpointId}` **without prompting** (`workflow-tools.ts:978-1022`); `checkpointBaseId` resolves `base#instance` back to the one definition (`workflow-loader.ts:438-464`). Correct precedent: `work-package/activities/07-assumptions-review.yaml:90`. None of workflow-design's 16 checkpoints does this today.

#### `08-quality-review.yaml` — 6 top-level / 10 with loop body (~130 lines, from 530)

| # | kind | id | bound technique / body | gate |
|---|---|---|---|---|
| 1 | technique | `author-fixes` | `yaml-authoring` | `when: remediation_round > 0` |
| 2 | technique | `record-fixes` | `apply-audit-fixes` (`selected_findings: verified_findings`) | `when: remediation_round > 0` |
| 3 | technique | `resolve-consumer-surface` | **`resolve-consumer-surface`** (new) → `{consumer_surface}` | — |
| 4 | technique | `load-known-findings` | **`load-known-findings`** (new) → `{known_finding_keys}` | — |
| 5 | technique | `survey-reference-workflows` | `meta::workflow-engine::list-workflows` → `{reference_workflows}` | — |
| 6 | **loop** | `target-sweep-loop` | `forEach target_workflow_id over target_workflow_ids`, `maxIterations: 20` — **ungated** | — |
| 6a | technique | `rebind-target-baseline` | `reload-workflow` (extended: declare `{base_ref}`, `{surface_files}`, `{changed_files}` — today it declares **no outputs at all**) | — |
| 6b | technique | `sweep-canon` | **`audit-canon`** (new; the single walker — §3) → `{audit_findings}`, `{coverage_ledger}` | — |
| 6c | technique | `validate-schema` | `audit-schema-validation` (fixed to pass `--root {target_path}`) → `{pass_count}`, `{fail_count}` | — |
| 6d | action | `accumulate-target-findings` | `set register_sections` — **value-BEARING** scatter-gather accumulator over the `forEach` | — |

**Transitions:** `to: validate-and-commit` `isDefault: true`.

`target_workflow_ids` is a declared `intake-classification` output that always contains at least the single target, so the loop runs **once** in create/update and N times in review. That singleton-collection substitution is what removes the 20 three-clause `and()` mode gates decorating every non-review step of `08` today (`08:109-459`) and the 12 new `operation_type != 'review'` gates a naive `03`+`04` merge would need. Steps 3-6 carry no `when`/`condition`, so `collectUngated` (`workflow-tools.ts:713-719`) admits them and their loop body — the whole sweep pipeline plus every linked criteria section arrives in **one** `get_activity` response. Today `08` has **0 of 27** technique steps eager-eligible.

#### `09-validate-and-commit.yaml` — 17 steps, no loops (~200 lines, from 243)

| # | kind | id | bound technique / body | gate |
|---|---|---|---|---|
| 1 | technique | `verify-audit-findings` | `verify-high-findings` (extended: declare `{open_finding_count}`, `{has_critical_finding}`, `{has_coverage_gap}`; drop the `verified_findings_path` output and its `#### artifact` block; drop "the calling activity's" at `:41`; add Rule `no-originating-rationale` and Input `{coverage_ledger}`) | — |
| 2 | technique | `compile-register` | `compile-report` (retargeted: cite `findings-register.md#template`; inputs `{register_sections}`, `{verified_findings}`, `{coverage_ledger}`, `{known_finding_keys}`) → `{findings_register}` | — |
| 3 | technique | `persist-register` | `…::write-artifact` — `findings-register.md`, `outputs.written_artifact: report_path` | — |
| 4 | **checkpoint** | `review-disposition` | **BLOCKING**. Body from `08:77-105` **minus** `selective-fixes` (whose effect at `:96-105` is byte-identical to `fix-issues` at `:87-95` — AP-88). `fix-issues` → `setVariable operation_type: update, update_seeded_from_review: true` + `transitionTo: intake-and-context`; `report-only` → `setVariable review_closed: true` | `condition: operation_type == 'review'` |
| 5 | **checkpoint** | `audit-disposition#{remediation_round}` | **BLOCKING pre-attestation gate**. `remediate` → `setVariable remediation_selected: true` + `transitionTo: quality-review`; `accept-and-record` → `setVariable remediation_selected: false, has_critical_finding: false`. Message links `[findings register]({report_path})` and interpolates `{open_finding_count}`, `{has_critical_finding}`, `{has_coverage_gap}`, `{fail_count}` | `condition: or(has_critical_finding == true, open_finding_count > 0)` |
| 6 | action | `bump-remediation-round` | `set remediation_round` — **value-BEARING** | `when: remediation_selected == true` |
| 7 | technique | `verify-scope-manifest` | `scope-verification` (absorbs `scope-audit`'s drift check) → `{total_count}`, `{addressed_count}`, `{unaddressed_count}` | `when: operation_type != 'review'` |
| 8 | technique | `verify-planning-readme` | `workflow-engine::verify-readme-conforms` | — |
| 9 | **checkpoint** | `approve-to-commit#{remediation_round}` | **BLOCKING**, Gate 2. Body from `09:145-167`, payload retargeted to `[change brief]({change_brief_path})`, `[impact analysis]({impact_analysis_path})`, `[scope manifest]({scope_manifest_path})`, `[findings register]({report_path})`, `{unaddressed_count}`/`{total_count}`, `{open_finding_count}`, `{has_coverage_gap}`. `approved` → `setVariable commit_approved: true`; `return-to-draft` → `transitionTo: scope-and-draft`; `revise-intent` → `transitionTo: intake-and-context` | `condition: operation_type != 'review'` |
| 10 | technique | `stage-and-commit` | `version-control::commit-regular-files` | `when: commit_approved == true` |
| 11 | technique | `verify-commit` | `commit-verification` (fix: delete `:18`, which hard-codes six of `09`'s step ids and is also bound from `10:184-187` where none exist) | `when: commit_approved == true` |
| 12 | technique | `push-branch` | `version-control::push-branch` | `when: commit_approved == true` |
| 13 | technique | `compose-pr` | `publish-workflow-pr` | `when: commit_approved == true` |
| 14 | technique | `open-pr` | `github-cli-protocol::create-pr` (`as_draft: false`) | `when: commit_approved == true` |
| 15 | technique | `compose-close-out` | `create-completion-doc` (**absorbs** `conduct-retrospective`; retrospective is a section, per `resources/completion-artifact.md:10`) | — |
| 16 | technique | `persist-close-out` | `…::write-artifact` — **`COMPLETE.md`** (fixes `11:20`/`11:36`, which pass `completion.md` while every canon layer declares `COMPLETE.md`) | — |
| 17 | technique | `remove-worktree` | `work-package::manage-git::remove-worktree` (`component_name: workflows`) | `when: worktree_created == true` |

**Transitions:** `to: quality-review` when `and(remediation_selected == true, remediation_round < 3)`; `to: __terminal__` `isDefault: true` (`TERMINAL_SENTINEL` is legal from anywhere — `SRV/src/utils/validation.ts:42`).

`github-cli-protocol::mark-ready` is no longer bound: Gate 2 already approved publication, so the PR opens non-draft in one step.

### 1.3 Checkpoint census — 16 → 7, all effect-bearing

| id | activity | type | `condition` | Effects | Instance-qualified |
|---|---|---|---|---|---|
| `design-intent-batch` | 01 | BLOCKING | `and(intent_needs_confirmation == true, update_seeded_from_review != true)` | 5 options, all `setVariable` | no (suppressed on re-entry by the `update_seeded_from_review` clause) |
| `impact-approved` | 01 | BLOCKING | `removal_count > 0` | `removals_approved` | no |
| `scope-confirmed#{scope_round}` | 06 | **SOFT** | `operation_type != 'review'` | `scope_manifest_confirmed` + self `transitionTo` on `revise` | **yes** |
| `preservation-check#{current_file.path}` | 06 | BLOCKING | `has_unflagged_removals == true` | `removal_disposition` | **yes** |
| `review-disposition` | 09 | BLOCKING | `operation_type == 'review'` | `operation_type`, `update_seeded_from_review`, `transitionTo`; or `review_closed` | no |
| `audit-disposition#{remediation_round}` | 09 | BLOCKING | `or(has_critical_finding == true, open_finding_count > 0)` | `remediation_selected`, `has_critical_finding`, `transitionTo` | **yes** |
| `approve-to-commit#{remediation_round}` | 09 | BLOCKING | `operation_type != 'review'` | `commit_approved` or `transitionTo` ×2 | **yes** |

The 9 deleted checkpoints all die on AP-89 `checkpoint-requires-decision` (`AP:1170`) — **zero `effect` on any option**, discriminator "recorded effect": `03:design-context`, `03:spec-confirmed`, `04:patterns-confirmed`, `05:impact-and-preservation-confirmed`, `06:file-approach-confirmed`, `06:file-review`, `06:draft-attestation`, `06:batch-review-attested`, `09:validation-passed`, `09:scope-verified`. Two of those auto-selected the *dangerous* option after 30 s: `09:54-77` fires only when `fail_count > 0` and auto-selects **proceed to commit**; `09:102-125` fires only when `unaddressed_count > 0` and auto-confirms.

`headless_mode` (`workflow.yaml:41-44`, default true) is **retained**, and so is the workflow-level rule at `:18` — but rewritten to remove its checkpoint-id enumeration, which is a live AP-107 `bind-site-is-orchestration-truth` exposure (`AP:1390`):

> A checkpoint that declares neither `defaultOption` nor `autoAdvanceMs` requires a user response and must never be answered on the user's behalf. When `{headless_mode}` is true, a checkpoint declaring both resolves to its `defaultOption` without presentation.

### 1.4 Transition graph

| From | To | Condition |
|---|---|---|
| `intake-and-context` | `quality-review` | `and(operation_type == 'review', review_scope_confirmed == true)` |
| `intake-and-context` | `scope-and-draft` | `isDefault` |
| `scope-and-draft` | `scope-and-draft` | checkpoint effect (`scope-confirmed.revise`) |
| `scope-and-draft` | `quality-review` | `isDefault` |
| `quality-review` | `validate-and-commit` | `isDefault` |
| `validate-and-commit` | `quality-review` | `and(remediation_selected == true, remediation_round < 3)` — and checkpoint effect (`audit-disposition.remediate`) |
| `validate-and-commit` | `intake-and-context` | checkpoint effects (`review-disposition.fix-issues`, `approve-to-commit.revise-intent`) |
| `validate-and-commit` | `scope-and-draft` | checkpoint effect (`approve-to-commit.return-to-draft`) |
| `validate-and-commit` | `__terminal__` | `isDefault` |

Every cycle is bounded by a *recorded* effect plus an explicit counter condition. Today `10:220-226` re-enters `intake-and-context` whenever `needs_audit_fixes == true` with **no counter anywhere in 63 variables**, and `03:101-113` is the corpus's only `while` loop with no `maxIterations`.

### 1.5 Before/after activity mapping

| Before (steps top-level / with loop bodies, lines) | Fate | After |
|---|---|---|
| `01-intake-and-context.yaml` (16/16, 265) | **rewritten in place**; id + prefix preserved. Brief composition absorbed from `03`; impact + removal gate absorbed from `05`. | `01-intake-and-context.yaml` (12/12, ~150) |
| `03-requirements-refinement.yaml` (14/18, 149) | **deleted.** Brief composition → `01` as two mode-specific techniques; assumption subsystem retired (§4.5). | — |
| `04-pattern-analysis.yaml` (3/3, 38) | **deleted.** §15's reorder-or-drop test: a survey reorderable with `05` feeding the same downstream write. Its role is the conformance dimension of the sweep, fed by a bound `list-workflows` step. | — |
| `05-impact-analysis.yaml` (4/4, 65) | **deleted.** Technique, artifact and removal gate → `01`. | — |
| `06-scope-and-draft.yaml` (18/30, 336) | **rewritten in place**; id + prefix preserved. Gains `readme-authoring`. Loses 4 attestation checkpoints, the drafting-plan/file-review-note satellites, and the pre-attestation audit pair. | `06-scope-and-draft.yaml` (9/13, ~170) |
| `08-quality-review.yaml` (23/40, 530) | **rewritten in place**; id + prefix preserved. 6 walkers → 1; 9 `write-artifact` binds → 0; verification → `09`. | `08-quality-review.yaml` (6/10, ~130) |
| `09-validate-and-commit.yaml` (18/18, 243) | **rewritten in place**; id + prefix preserved. Gains verification, the pre-attestation gate, close-out. | `09-validate-and-commit.yaml` (17/17, ~200) |
| `10-post-update-review.yaml` (25/35, 247) | **deleted** — see §4.1. | — |
| `11-retrospective.yaml` (5/5, 53) | **deleted.** Close-out → `09` as one document (AP-84 `AP:1110`, whose do-not-flag `:1118` blesses "a single close-out artifact with retrospective as a section"). | — |
| **9 activities, 126/169 steps, 1,926 lines** | | **4 activities, 44/52 steps, ~650 lines** |

### 1.6 Before/after artifact mapping

Today: 27 `write-artifact` bind sites → **20** distinct bare filenames, 22 counting `README.md` (via `workflow-engine::create-readme`) and `assumptions-log.md` (via `work-package::review-assumptions::record`). #321's "17" is the `resources/readme-seed.md:30-46` Progress-row count, of which only 12 are artifacts.

| After (5 authored + 1 seeded) | Absorbs | Guide (AP-116) | Named reader | Decision it feeds |
|---|---|---|---|---|
| `README.md` (planning) | — | `meta/resources/planning-readme.md` + `resources/readme-seed.md` | human; `sync-progress-status` mutates Status only (`meta/techniques/workflow-engine/sync-progress-status.md:60`) | none — §11 (`DP:57-59`) requires it; mapped at `resources/README.md:43`; not cuttable |
| `change-brief.md` | `design-specification.md`, `structural-inventory.md`, `format-conventions.md`, `applicable-constructs.md`, `assumptions-log.md` (`## Open Judgements` section) | **new** `resources/change-brief.md` | human at Gate 1 and Gate 2; `scope-definition` | mode/target confirmation; final approval; open-judgement resolution |
| `impact-analysis.md` | — (retained as its own file) | `resources/impact-analysis.md` | human at `impact-approved`; `scope-definition` and `audit-canon` as `{change_constraints}` | removal approval (§8 `DP:45`, §10 `DP:53`); co-change and identifier-collision constraints binding the draft |
| `scope-manifest.md` | `drafting-plan.md`, `file-review-note.md`, `draft-attestation.md` | `resources/scope-manifest.md` | `06:7` iterates it (`forEach … over scope_manifest`); `scope-verification` at `09:7` | §3's enumerate→re-verify pair (AP-07 `AP:158`); every drafting iteration |
| `findings-register.md` | all 7 `*-findings.md` satellites, `compliance-review.md`, `post-update-review.md` | **new** `resources/findings-register.md` | **agent state** (AP-96 `AP:1254`): `verify-high-findings`, `compile-report`, `apply-audit-fixes` (`{selected_findings}`), next run's `load-known-findings`; human via the two gate messages | remediate vs accept-and-record; Gate 2 approval; next-run known-item exclusion |
| `COMPLETE.md` | `completion.md` (the misnamed variant), `follow-ups.md`, `deferred-items.md` | `resources/completion-artifact.md` | human, post-session | terminal record — AP-84 single close-out |

`write-artifact` bind sites: **27 → 6** (change-brief ×1, impact-analysis ×1, scope-manifest ×1, findings-register ×1, COMPLETE ×1, plus `create-readme` ×1). Max 3 binds in any one activity, against distinct static targets with distinct structured inputs — AP-38's named carve-out (`AP:550`).

---

## 2. Canon compliance

### 2.1 The sixteen named anti-pattern entries

| Entry | Constraint | How the target satisfies it |
|---|---|---|
| **AP-19** `no-rule-protocol-restatement` (`AP:310`) | No rule restates a protocol bullet without adding an invariant the steps do not convey. | `audit-canon` has three Rules and each states something no phase encodes: base attribution against `{base_ref}`, exclusion of `{known_finding_keys}` from the decision surface, and structural-evidence precedence. The rewritten `workflow.yaml:18` states runtime conduct the schema does not encode (that an undefaulted checkpoint may not be self-answered) rather than enumerating gate ids. |
| **AP-22** `single-rule-authority` (`AP:346`) | One authoritative home per orchestrator-only rule; no cross-level copies. | Headless semantics live once, at `workflow.yaml:18`. No activity declares `rules:` (AP-69), so cross-level duplication is structurally impossible. Commit policy lives once, in the `commit_approved` gate condition, not in prose at three levels. |
| **AP-24** `no-contradictory-rules` (`AP:370`) | No two rules in the same technique **or same rules bucket** prescribe mutually exclusive behaviour. | This is the one entry a merge can trip with no text edited, because merging activities merges rule buckets. Target has **zero** activity rule buckets, so nothing merges. The four workflow-level buckets are untouched. `audit-canon`'s three Rules are mutually orthogonal (attribution / exclusion / evidence precedence). |
| **AP-25** `no-one-step-rules` (`AP:382`) | A `## Rules` entry must be cross-cutting, not step-local. | See the placement table in §3.4 — each of `audit-canon`'s three Rules is shown to span ≥2 Protocol phases plus at least one consumer. `verify-high-findings`' existing `refute-by-default` / `verify-before-remediation` (`:45-51`) already pass and are retained verbatim; the added `no-originating-rationale` binds phases 1 and 3. |
| **AP-34** `no-valueless-control-set` (`AP:494`) | No control step carries value-LESS `set`s whose descriptions hold derivation HOW for a domain payload. | **Zero** value-LESS sets. All four surviving `set` steps are value-BEARING orchestration state — `planning_folder_path`, `scope_round`, `remediation_round`, `register_sections` — permitted by AP-34's do-not-flag (`:498`) and AP-33's do-not-flag (a) and (c) (`:492`). This deletes six live offenders: `01:9-12`, `06:213-222` (4 sets), `06:243-247` (4 sets), `08:449-459` (2), `10:88-124`, `10:155-158`. Their targets become declared **Outputs** of `audit-canon` and `verify-high-findings` — AP-34's Fix verbatim (`:504`). |
| **AP-38** `no-duplicate-technique-steps` (`AP:542`) | Scoped *"in one activity"* — the only entry that gets harder purely by concatenation. | Per-activity `write-artifact` binds: 3 / 1 / 0 / 2. Distinct static targets, distinct structured inputs → carve-out at `:550` holds; the roster never becomes a clean iterable, so classification (b) never fires. `yaml-authoring` appears twice in `06` (7a and 7d) and twice across `06`/`08` — both are the carved-out "same op as distinct phases inside one loop iteration" and "distinct-purpose invocations at different pipeline points". `audit-canon` is bound **once**, inside the singleton-or-N loop; `audit-schema-validation` once. Compare a naive `08`+`10` merge: ~14 pass→filename `write-artifact` binds in one `steps[]`, at which point the roster *is* a clean iterable. |
| **AP-55** `hoist-shared-inputs` (`AP:750`) | Shared inputs hoist to the smallest common container; no synonym drift. | `{base_ref}`, `{surface_files}`, `{known_finding_keys}`, `{consumer_surface}` and `{reference_workflows}` are each declared on the **one** technique that consumes them (`audit-canon`) plus their single producer — 2 sites, inside AP-55's do-not-flag ("niche inputs shared by only two or three techniques — do not push those to the root just to dedup"). `{planning_folder_path}` and `{target_path}` stay hoisted on `techniques/TECHNIQUE.md`, as AP-55's Fix directs for genuinely workflow-wide contextual inputs. `elicit-change-brief` and `synthesize-change-brief` share `{change_brief}`/`{open_judgements}` at 2 sites — same carve-out; no group container is invented (AP-70's YAGNI do-not-flag, `:938`). |
| **AP-68** `technique-stage-agnostic` (`AP:906`) | No technique names stage, activity, checkpoint, loop, transition, position, or a user gate. | Target **fixes three live hits**: `audit-anti-patterns.md:42`, `verify-high-findings.md:41` and `impact-analysis.md:57` all read "via **the calling activity's** bound `manage-artifacts::write-artifact` step" — Detect(a) verbatim. Replacement form: the technique declares `#### artifact findings-register.md` on its output and cites `[Findings Register Guide](../resources/findings-register.md#template)`; the activity owns the persist. `commit-verification.md:18` (six hard-coded `09` step ids) is deleted. AP-68 is also **why the merge is cheap**: because techniques are stage-blind by mandate, redistributing 23 of them across 4 activities instead of 9 changes no technique text about position. |
| **AP-69** `no-activity-prose-rules` (`AP:918`) | Zero tolerance — the carve-out is literally "N/A — activity `rules:` should be empty" (`:924`). | Zero `rules:` blocks in all four files (the corpus has zero today; the only user in the whole library is `meta/activities/02-resolve-target.yaml`). Every ordering guarantee a deleted boundary carried is re-encoded structurally — discharge table below. Two schema facts make prose the *worst* option anyway: activity `rules[]` items are `type: string` with **no `{ref}` variant** (contrast `RuleEntrySchema`, `SRV/src/schema/workflow.schema.ts:38-43`), so they cannot be fragment-deduped; and **no server code reads them** — `get_activity` injects only `rules.activity` + `rules.universal` (`workflow-tools.ts:890-905`), so an activity rule is inert bytes redelivered every dispatch. |
| **AP-74** `no-duplicated-guidance` (`AP:982`) | One authoritative home; duplicates become references. | Six near-identical audit→persist→clean/flagged triads collapse to one walker. The 8-step republish tail (`10:169-210`), which re-binds the exact 7-technique publish sequence of `09:78-224`, is deleted rather than relocated. The duplicated `compliance-review.md` persist (`08:62-76` ≡ `09:7-21` — same filename, content, output remap and gate) collapses to one. |
| **AP-97** `link-named-artifacts` (`AP:1266`) | A user-presented message naming a durable file carries `[label]({path_variable})`, never a hard-coded `NN-` prefix. | Bidirectional obligation honoured in both directions: every surviving message that names a file links its path variable (`change_brief_path`, `impact_analysis_path`, `scope_manifest_path`, `report_path`), and every message that named a **deleted** artifact is deleted with it — including `05:28-37`, which in a linearised create-mode path would emit `"no content removals flagged ([impact analysis]({impact_analysis_path}))"` with the path still `""`. No `NN-` literal appears anywhere. |
| **AP-114** `pass-orchestration-in-technique` (`AP:1478`) | Its exemplar is literally this workflow: "``run-audit-passes`: Apply audit-expressiveness…" (`:1480`). Detect names "`Apply [technique]` / `::` op invocation (one or many)" (`:1482`). | `audit-canon` contains **no `Apply` and no `::` invoke.** It is one produce path over resources and tools — load homes by anchor → apply each entry as written → attribute and exclude → emit one product bag — which is the do-not-flag at `:1486` on its own terms. The three things the walker needs from elsewhere are **bound as their own activity steps**: `meta::workflow-engine::list-workflows` at `08:5`, `audit-schema-validation` at `08:6c`, `verify-high-findings` at `09:1`. That is AP-114's Fix verbatim (`:1488`). **Detect-test-in-reverse, stated for the auditor:** moving `list-workflows`, `audit-schema-validation` or `verify-high-findings` into `audit-canon`'s Protocol *would* preserve behaviour — which is precisely why none of them is there. Two live hits are cleared in the same pass: `audit-conformance.md:37` ("Survey similar-type reference workflows **via** [list-workflows]") and `audit-schema-validation.md:24,:30,:34`'s script recipes, which stay in their own wrapper op rather than being re-taught inside the walker (AP-51 `:702`, AP-110 `:1430`). |
| **AP-116** `no-template-creation-guide` (`AP:1502`) | Direction is filename → guide; sharing is permitted ("Shared satellites may share one guide; every persisted bare filename must still map to a guide", `:1508`). | Dropping 15 filenames strictly *reduces* the obligation — AP-116 cannot be tripped by deletion. All 6 survivors map (§1.6). Both new guides carry `## Template` + operative `## Rules` and no tutorial ceremony (AP-90 `:1182`). `resources/README.md:39-58` and the canonical-home map at `techniques/TECHNIQUE.md:73-86` are rewritten in the same commit. **Named gap:** no entry Detects an *orphaned* guide — nearest coverage is AP-92's "dissolve the resource when nothing template-shaped remains" (`:1216`). All 13 retired guides therefore go by hand, in the same commit as their producers (migration step M9). |
| **AP-119** `procedure-in-io-contract` (`AP:1538`) | No HOW in an Input or Output description; applies symmetrically. | `compile-report.md:11-19`'s optional `*_findings_path` inputs described as "when the principles audit ran" — sequencing duty in a bind slot, and also AP-125 `technique-ref-in-io-contract` (`:1610`) — are replaced by `{register_sections}`, `{verified_findings}`, `{coverage_ledger}`, `{known_finding_keys}`, each stating meaning and shape only. `{coverage_ledger}`'s Output carries **derivation criteria**, which §13 explicitly licenses ("Outputs may include derivation/recognition criteria", `DP:65`) — not HOW. No I/O entry names a producer, consumer, activity or technique (AP-42 `:594`). |
| **AP-121** `rule-as-protocol-step` (`AP:1562`) | No Protocol phase states only a standing invariant. Inverse of AP-25. | Each of `audit-canon`'s four phases has a distinct produce/transform/persist outcome; removing any breaks the work sequence, which is AP-121's test inverted. No phase says "follow the catalogue throughout". The placement table in §3.4 shows, for each of the four sweep framings, which of Rules / Outputs / structure owns it and which test forces that choice. |
| **AP-126** `variable-description-one-line` (`AP:1666`) | One line defining what the value *is*; no producer/consumer/gate/layout tails. | Three live hits die with their variables: `workflow.yaml:63` "…**from audit-expressiveness**", `:71` "…from audit-rule-hygiene", `:79` "…from audit-principles". Two more are rewritten rather than deleted: `:51` and `:87` name `requirements-refinement` and `impact-analysis` in their descriptions. Every one of the 10 added variables is authored as a single line with an enum or shape hint where useful (`removal_disposition` → `flagged \| restored`). |

#### AP-69 discharge table — every dissolved boundary and its structural carrier

| Boundary deleted | What it guaranteed | New structural carrier |
|---|---|---|
| `01:248` → `requirements-refinement` (`and(format_literacy_confirmed, schema_constructs_confirmed)`) | literacy before specification | **Nothing to carry.** The gate was an `action: set` auto-confirm at `01:210-223` with no evidence behind it — AP-79 (`AP:1046`) already. Deleted with `context-loading`; construct-inventory and convention citations remain at write time (`yaml-authoring.md:39,:44,:80,:84`). |
| `03:139` → `impact-analysis` (`operation_type == update`) | specification before impact | Step order `01:6-7` before `01:8`, plus `{change_brief}` as a declared input of the extended `impact-analysis`. |
| `03:145` → `pattern-analysis` (`isDefault`) | specification before pattern survey | `08:5 survey-reference-workflows` produces `{reference_workflows}` as a declared input of `audit-canon`; the survey moved downstream of the draft, where conformance is actually assessable. |
| `04:35` → `scope-and-draft` | pattern survey before scope | `scope-definition` no longer consumes a pattern table; conformance is a sweep dimension. Removal is deliberate — see §4.5 loss (3). |
| `05:60` → `scope-and-draft` | impact before scope | Cross-activity data dependency: `{change_constraints}` and `{removals_approved}` are declared inputs of `scope-definition` at `06:3`, both produced in `01`. |
| `06:328` → `quality-review` | draft before audit | **Retained** as a transition. |
| `08:524` → `validate-and-commit` | audit before validate | **Retained** as a transition, and now load-bearing: it is the context boundary that makes `refute-by-default` enforceable. |
| `09:231` → `post-update-review` (`operation_type == update`) | commit before post-commit audit | Deleted with `10`. `09` contains **zero content-producing steps** — `readme-authoring` moved to `06:8` — so "nothing lands unaudited" is a property of the step inventory, not a promise. |
| `09:237` / `10:227` → `retrospective` | audit clean before close-out | Step order `09:15-16` after Gate 2, plus `create-completion-doc`'s declared inputs `{open_finding_count}`, `{coverage_ledger}`, `{removals_approved}`. |
| `10:221` → `intake-and-context` (`needs_audit_fixes == true`, unbounded) | remediation restart | `09:5 audit-disposition#{remediation_round}` — a BLOCKING checkpoint with a recorded effect — plus the transition condition `remediation_round < 3`. |
| **§3 pair** (`06:scope_manifest` enumerated → `09:103` re-verified) | enumerate before execution, re-verify after | **Preserved across two boundaries**: `06:3-4` enumerate, `06:5` gates, `09:7` re-verifies, `09:9` gates. AP-07 (`AP:158`) Detect keys on *commit*: `09:7 verify-scope-manifest` → `09:9 approve-to-commit` → `09:10 stage-and-commit`. |

### 2.2 The ten named principles

| Principle | How satisfied | Accepted trade-off |
|---|---|---|
| **§6** One Authoritative Home (`DP:37`) | Detect criteria stay in `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` — **none is edited**. `audit-canon` walks and cites; it never re-authors (`audit-anti-patterns.md:29` already mandates "Do not restate, summarize, or number catalog entries"). Six walkers over four homes, three on one home, becomes one walker per home — AP-105's "keep at most one walker per home" (`AP:1366`). One findings home, one brief home, one close-out home. | none |
| **§12** Output Economy (`DP:61`) | 20 filenames → 5. One canonical home per fact (AP-93 `:1218`). Declared audience per AP-96. Exception-only status: the four all-green `*-clean` announces (`08:143-162, 220-239, 297-316, 374-393`, ~19 YAML lines and a 3-clause gate each to carry one bit) deleted per AP-86 (`:1134`) / AP-87 (`:1146`); 19 announce-only steps deleted in total. One close-out (AP-84). One decision per checkpoint — `selective-fixes` collapsed into `fix-issues` (byte-identical effects at `08:96-105` vs `:87-95`), and the removal decision kept **separate** from the scope decision because their answer spaces do not overlap (AP-88's do-not-flag `:1158` is "distinct decisions with non-overlapping answer spaces", so AP-88 licenses no merge and AP-05 `:134` would fire on one). Statement-form messages with links per AP-99 (`:1290`). | Only 2 in-chat narration surfaces survive (`01:11`, and the checkpoint messages). Planning-README Progress becomes the primary visibility channel, which makes the `@`-column migration load-bearing (§5, step M2). |
| **§13** Separate Contract from Procedure (`DP:65`) | New/extended technique I/O states meaning and shape only. `{coverage_ledger}` carries derivation criteria in **Outputs**, which §13 licenses explicitly. No trailing "Set …" projection phases: `{open_finding_count}` and `{has_critical_finding}` are declared Outputs of `verify-high-findings`, not Protocol assignments (AP-111 `:1442`). | none |
| **§15** Phase by Sequenced Outcome (`DP:73`) | The reorder-or-drop test applied to nodes: `04-pattern-analysis` (38 lines, 1 checkpoint) and `05-impact-analysis` (65 lines, 1 checkpoint) are mutually reorderable surveys feeding the same downstream write — co-aspects of one phase, so neither earns a node. The absent `02`/`07` filenames show the corpus has applied this twice already. Each of `audit-canon`'s four phases is a distinct sequenced outcome, not a topic partition. | none |
| **§18** Prefer Shared Capability (`DP:85`) | 11 cross-workflow ops bound by `::` path from activities: `write-artifact`, `create-readme`, `verify-readme-conforms`, `list-workflows`, `commit-regular-files`, `push-branch`, `create-pr`, `remove-worktree`, and (via `prepare-workflow-branch`) `create-worktree`. No local harness recipe is invented (AP-110 `:1430`). | **Declined**: the borrowable `meta/activities/patterns/04-isolated-fan-out.yaml`. §18's preference is for fan-out *over a local spawn recipe*; the target has **no** fan-out, so the preference does not engage. Reasons in D3 and §7. |
| **§20** Keep Orchestration in Structure (`DP:93`) | Stage, checkpoints, loops, transitions and graph progress live in four activity YAMLs. No new or surviving technique names a stage, gate, iteration or position. The count comes down by **deleting** files, steps and artifacts — never by pushing sequencing into a Protocol. | none |
| **§25** Bind Sibling Operations as Steps (`DP:113`) | All multi-technique work is in `steps[]`. Four audit capabilities remain four separate binds across two activities. The single consolidation is *within one home-walking capability*, never across capabilities. | **Stated plainly: step count is not the metric.** 126 → 44 top-level steps comes from ceremony deletion, not from merging; a pure 9→4 merge moves and deletes zero steps. The reductions that matter are artifacts (20→5), walkers (6→1), audit invocations (46→≤3 per target), variables (63→41) and dispatches (12→4). |
| **§26** Atomic Techniques; Compose at Activities (`DP:117`) | Every new technique is one produce path with no branching orchestration and no technique→technique work call. Create-vs-update brief composition is **two techniques**, not one — AP-124 `alternate-ops-as-protocol-sequence` (`AP:1598`) names "create vs update" as its exemplar, and its test (renumbering the phases would not change runtime behaviour because only one applies per call) fires on a fused op. No group container is invented, so §27/AP-115/AP-123 never engage and AP-70's YAGNI do-not-flag (`:938`) is respected. | Activity→activity composition is available and unused (D3). |
| **§29** Cite Resource Policy; Do Not Restate It (`DP:129`) | The Separation test is what makes the walker merge lossless: because the six retired techniques *cite* rather than author, merging citers changes no criterion. `audit-canon`'s Protocol operates on semantic fields and cites each home by section title in house style. | none |
| **§30** Resources at the Abstract Level; Split for Section Delivery (`DP:133`) | Two applications. **(a)** `resources/findings-register.md` is section-delivered: `## Template` (skeleton), `## Findings` (row shape + severity scale — §30's "group shared fragments under a single shared section"), `## Coverage`, `## Known`, `## Rules`. A renderer fetches one anchor; nothing loads the whole guide to read one dimension. That is what replaces 7 satellite *files* at no loss of per-dimension isolation. **(b)** `audit-canon` fetches `anti-patterns.md` **by section**, mandatory not optional: the file is 128,341 bytes and the eager per-resource cap is 80,000 (`SRV/src/utils/resource-delivery.ts:6`), so `audit-anti-patterns.md:28`'s whole-file link can never be bundled. Section slicing works on both delivery paths (`resource-delivery.ts:38-47`; `SRV/src/tools/resource-tools.ts:779-786`). Verified section list and largest sections in §3.2. Neither new resource names a concrete artifact filename or variable belonging to a specific technique. | none |

### 2.3 Additional constraints that bind

**AP-05** `atomic-checkpoints` (`AP:134`) — removal approval (`01:12`) and scope approval (`06:5`) are separate gates; no checkpoint packs two decisions. **AP-07** `scope-reverify-completion` (`AP:158`) — §2.1 discharge table, last row. **AP-31** `no-hand-authored-artifacts` (`AP:458`) — no activity declares `artifacts[]`. **AP-36** / `check-activity-technique-overlap.ts:74` (hard-zero) — both activity-level `techniques: [scatter-gather]` blocks (`03:6-7`, `06:6-7`, bound at no step) are **deleted**, which removes the overlap exposure a merge would create. **AP-40** `readme-orients-not-transcribes` (`AP:566`) — `README.md`, `activities/README.md`, `techniques/README.md`, `resources/README.md` are re-authored to orient by role, with **no inventory counts** and no step/pass enumerations. **AP-41** / §17 (`AP:578`, `DP:81`) — all four `description`/`outcome` blocks written from scratch in positive present; no text may read "no longer runs six separate passes". **AP-79** `structure-backed-constraints` (`AP:1046`) — the corpus's only `decisions` block (`08:508-522`) is **deleted**: `decisions` is read in exactly two places, both of which only widen the legal-transition set (`workflow-loader.ts:472`, `:500-507`), and no server code evaluates a branch, so a "Critical Blocker Gate" that nothing enforces is the very defect `audit-rule-enforcement.md:32` exists to catch. The blocker is a BLOCKING checkpoint with a recorded effect plus a transition condition. **AP-84** `single-closeout-artifact` (`AP:1110`) — one `COMPLETE.md`, retrospective as a section. **AP-91** `lifecycle-row-update` (`AP:1194`) — register rows are updated in place across rounds; aggregate scorecards are presented in the gate message, never persisted. **AP-95** `enforce-output-discipline` (`AP:1242`) — `verify-artifact-conforms` at `06:9` is the workflow-boundary verify op, with no checkpoint, loop or routing variable. **AP-107** `bind-site-is-orchestration-truth` (`AP:1390`) — the multi-target structure is a declared `forEach` at `08:6`, not prose; `workflow.yaml:18`'s gate enumeration is removed; `commit-verification.md:18`'s step-id list is deleted. **AP-127** `bag-value-as-literal` (`AP:1676`) — no prose says "the audit covers all N dimensions"; per `AP:25` nothing cites the catalogue's entry count, which is why `{coverage_ledger}` keys on **section titles**. **AP-128** `unproduced-value-read` (`AP:1688`) — every gate rewritten from a transition to a step `when` is re-traced in migration step M9's checklist; producer arms are made exhaustive rather than papered over with a `defaultValue` a reader cannot distinguish (the exact defect at `05:28-37`). Three existing hits are fixed by declaring the content outputs their persist steps read: `03:71` `design_specification`, `01:180` `format_conventions`, `01:188` `applicable_constructs`. **AP-129** `stale-restatement-after-change` (`AP:1700`) — one edit, counted manifest; site list in §5, step M9.

---

## 3. The audit stage in detail

### 3.1 The arithmetic that licenses one sweep

| Retired walker | Home it names | Scope |
|---|---|---|
| `audit-anti-patterns.md:28` | `anti-patterns.md` | every `### AP-XX` entry (`:33`) |
| `audit-rule-hygiene.md:32-33` | `anti-patterns.md` | `## Rule Hygiene Anti-Patterns` **only** (`AP:306-392`) |
| `audit-rule-enforcement.md:32` | `anti-patterns.md` | **one entry** — `structure-backed-constraints` (`AP:1046`) |
| `audit-principles.md:28` | `design-principles.md` | 30 principles |
| `audit-expressiveness.md:32` | `schema-construct-inventory.md` | 6 mapping tables (`:27-98`) |
| `audit-conformance.md:32,:37` | `convention-conformance.md` + a live sibling survey | 6-concern checklist (`:14-21`) |

Six walkers, four homes, three walkers on one home, one of them a whole technique + variable + artifact + four activity steps for **one** catalogue entry. AP-105 `no-shadow-audit-pass` (`AP:1366`) states the target outright: "keep at most one walker per home (or a scoped thin walker that does not re-author criteria)", and its do-not-flag protects the replacement shape: "a thin scoped walker that loads a named section and applies each entry as written without restating Detect". §29's Separation test (`DP:129`) removes the last objection: merging *citers* changes no criterion. **One walker over four homes is strictly more compliant than the status quo.**

Worst-case audit invocations per update run collapse from **46 across three activities** — `06` = 2 + 2×2, `08` = 4 + 3×4, `10` = 6 + 3×6, with the 128 KB catalogue re-walked in each — to **≤3 in one activity per target**.

### 3.2 `techniques/audit-canon.md`

**Capability.** Whole-surface canon conformance findings for a workflow definition change, attributed against its base and excluding known items.

**Inputs** — `{surface_files}`, `{changed_files}`, `{base_ref}`, `{known_finding_keys}`, `{consumer_surface}`, `{reference_workflows}`, `{change_constraints}`. Every entry states meaning and shape only; none names a producer, activity or technique (AP-42, AP-125, AP-119).

**Protocol** — four phases, each a distinct produce outcome (§15, AP-108 `:1406`, AP-121):

1. **Load the criteria homes by section.** `anti-patterns.md` by all **13** `##` anchors — verified titles and lines: `#creation-rules` (:15), `#structural-anti-patterns` (:78), `#interaction-anti-patterns` (:130), `#schema-expressiveness-anti-patterns` (:182), `#rule-hygiene-anti-patterns` (:306), `#description-hygiene-anti-patterns` (:394), `#coupling-anti-patterns` (:590), `#tool-technique-doc-consistency-anti-patterns` (:942), `#execution-anti-patterns` (:1018), `#output-economy-anti-patterns` (:1106), `#canon-hygiene-anti-patterns` (:1338), `#technique-protocol-anti-patterns` (:1402), **`#authoring-guidance-mr` (:1622)**. Plus `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` whole (each far under the 80,000-char cap).
2. **Apply every entry over the whole surface.** Each catalogue entry's Detect / Do-not-flag / Fix as written; each principle scored Pass / Partial / Violation with citations; each mapping table checked for prose substituting for a construct, naming the substituting construct and a before/after rewrite; each conformance concern compared against `{reference_workflows}`; each `{consumer_surface}` site checked for a claim that contradicts its cited home.
3. **Attribute and exclude.** Derive `Origin` per row by re-reading the cited construct at `{base_ref}` — `git show origin/workflows:<path>`. Mark rows matching `{known_finding_keys}` as `Known`. Record the anchor ids actually received.
4. **Emit one product bag.** `{audit_findings}` rows and `{coverage_ledger}` rows.

**Outputs** — `{audit_findings}` (one row per finding: `Dimension`, `Entry` — the kebab name from the cited home, `Home` — `resource#anchor`, `Severity`, `Origin`, `Known`, `Finding`, `Location` as `file:line`, `Fix`); `{coverage_ledger}` (one row per enumeration unit received, with `walked | blocked` and never omitted — derivation criteria stated here per §13).

**Rules** — `attribute-against-base`, `exclude-known-from-decision-surface`, `structural-evidence-first`. Placement justified in §3.4.

**The `#authoring-guidance-mr` anchor is load-bearing.** Verified: `anti-patterns.md` has exactly 13 `##` sections, and AP-126/127/128/129 sit at `:1666`/`:1676`/`:1688`/`:1700` **inside `## Authoring Guidance (MR)` (:1622)** alongside MR-1…MR-4. A walker enumerating `## *Anti-Patterns` families silently drops **AP-128 `unproduced-value-read` and AP-129 `stale-restatement-after-change` — the two entries this migration most needs.** Fix by enumerating all 13 anchors, **not** by re-sectioning the file: re-sectioning edits a §6 authoritative home, drags §10's removal-inventory obligation over the canon itself, and buys identical coverage.

### 3.3 What is retained by name rather than by pass

| Capability | Where it survives | Why it cannot be dropped |
|---|---|---|
| Sibling-workflow survey | `08:5` bound step → `{reference_workflows}` input | Evidence *outside* the target workflow (`audit-conformance.md:37`). No diff sweep can synthesise it. |
| Per-principle Pass / Partial / Violation | `Dimension: principle` + a `Severity: partial` row value | A Detect-only sweep cannot emit "partially compliant" and cannot catch a principle honoured **nowhere** — an absence, not a smell. `resources/README.md:13,:68` states the split: principles cover families with no Detect triad; the catalogue covers instances. |
| Before/after construct rewrite | `Fix` column, mandatory on `Dimension: expressiveness` rows | The positive "which construct should this have been" answer (`audit-expressiveness.md:38`). This is why `schema-construct-inventory.md` survives as a **home** even though its walker does not. |
| Schema/loader validation | `08:6c` separate bind | Three validator scripts (`audit-schema-validation.md:24,:30,:34`) — mechanical, nothing to fold into prose, and folding it in would be AP-51 + AP-110. |
| Adversarial High verification | `09:1` separate bind, **fresh dispatch** | §3.5. |
| Multi-target review | `08:6` declared `forEach`, `maxIterations: 20`, per-target register sections accumulated at `6d`, persisted **once** at `09:3` | Today `08:7-61` writes `principle-findings.md`, `anti-pattern-findings.md` and `verified-findings.md` with **fixed** bare filenames *inside* the loop, so find-or-update leaves only the last target's satellites; and `compile-report` (which sets the count) is inside the loop while `persist-compliance-report` (`:62`) is outside, so `review-disposition`'s "{review_findings_count} findings across {target_workflow_ids}" reports the last target's count as the total. |

### 3.4 The four required framings — placement, and the test that forces it

| Framing | Placement | Which entry/test forces that placement |
|---|---|---|
| **Mandatory base attribution** via `git show origin/workflows:<path>` | `## Rules` → `attribute-against-base`, **plus** a required `Origin` column in `findings-register.md#findings`, **plus** `{base_ref}` as a declared Input | Cross-cutting: it binds the walk (phase 3), the verification (`09:1` withdraws unattributed rows), and the render. Passes AP-25's do-not-flag ("cross-cutting rules that span multiple phases"). As a Protocol phase it would be AP-121 — removing it leaves the work sequence intact. `origin/workflows` is grounded: `prepare-workflow-branch.md:55` states "create-worktree bases the new branch on that component's `origin/HEAD` default; the workflows library's HEAD must resolve to `workflows`". Because the base is the **base branch**, attribution works whether or not session work is committed. Enforcement is not exhortative: `has_critical_finding` and `open_finding_count` count only `Origin: diff` rows, so a pre-existing defect cannot block a commit it predates. |
| **Known-item exclusion** | `## Inputs` → `{known_finding_keys}` (a bind contract, §13), **plus** one `## Rules` entry `exclude-known-from-decision-surface`, **plus** the `## Known` section of the register | The *set* is a value with meaning and shape → Inputs. The *duty* to route matches out of the decision surface binds phases 3 and 4 and the register render → Rules. `load-known-findings` (`08:4`) normalises `SRV/scripts/binding-fidelity-baseline.json` (256 entries, 13 of them workflow-design's), `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json`, and the prior run's `findings-register.md`. Exclusions are recorded as **a count on one line**, never a list — AP-87 (`:1146`) forbids a "None/N/A" section and forbids a null-confirmation checkpoint. This is AP-86 (`:1134`) applied properly: the decision surface is divergences-only relative to the known set, and it is what makes remediation-round re-walks cheap. |
| **Evidenced negatives** | `## Outputs` → `{coverage_ledger}`'s **derivation criteria** | §13 (`DP:65`) licenses exactly this: "Outputs may include derivation/recognition criteria." Placing it here dodges AP-121 (not a Protocol step) and AP-25 (not a Rule) simultaneously. The authority for the *content* is §11 (`DP:57-59`): "a completeness verdict names the enumeration grounding it, not the instances inspected." Rows key on **section titles**, never counts — `AP:25` forbids citing the catalogue's entry count and AP-40 (`:566`) makes a hard-coded count a transcribing drift site. Separately, negatives are evidenced where a negative is a *decision*: every High that verification withdraws keeps its register row with disposition `withdrawn` plus its re-derivation evidence, which `verify-high-findings.md:29` already specifies. AP-86's do-not-flag (`:1142`) protects the shape — data downstream steps parse, not ceremony. |
| **One context over the whole diff** | **Structure only** — one bind site (`08:6b`), no fan-out, no `dispatch_child`, and steps `08:3-6` carry no `when`/`condition` | AP-68: a technique may not name its dispatch shape; it is an activity fact. Mechanically: `collectUngated` (`workflow-tools.ts:713-719`) skips on `when`/`condition` **before** recursing into loops, and `breakCondition`/`maxIterations` are not in `stepCommonFields` (`SRV/src/schema/activity.schema.ts:73-77`) — so an ungated loop keeps its body eligible. The whole sweep pipeline plus 4 criteria homes therefore arrive in one `get_activity` payload, with **zero** `get_resource` calls. The eager-*resource* loop has no cumulative budget — only the 80,000-char per-resource cap (`workflow-tools.ts:798-830`; `resource-delivery.ts:6`); the `context_tokens × 0.8 × 4` budget at `:706-710` measures technique bodies only. Today `08` has 27 technique steps and 0 eager-eligible, because every top-level step carries a 2-or-3-clause `and` gate and both loops are `condition`-gated. |

### 3.5 The cross-workflow reach — `{consumer_surface}` (the fix for the shared FATAL)

A walker whose input contract is scoped to the target workflow's own files provably cannot reach a contradiction that spans two workflows. The named example: `work-package/techniques/update-pr/post-review-comment.md:34` derives `review_type` from the Overall Rating per `resources/review-mode.md#review-type-selection`, while `midnight-system-review/workflow.yaml:20` asserts "compute-verdict always emits it, so the posting operation's default derivation never runs", and `midnight-system-review/resources/verdict-rubric.md:37` defines a **second** independent verdict→`review_type` mapping — AP-93 (`:1218`), AP-24 (`:370`), AP-103 (`:1342`) in one triangle. An unconstrained agent greps consumers and finds it; a bind-contracted walker over one workflow does not.

**`techniques/resolve-consumer-surface.md`** (new), bound at `08:3`, ungated:

- **Inputs** `{changed_files}`, `{target_workflow_id}`.
- **Outputs** `{consumer_surface}` — the reference sites **outside** the target workflow that bind, cite or interpolate anything the change touches: one row per site with `file:line`, the referencing form (`workflow::group::op`, bare op name, `resource#anchor`, `{variable}`), and the referenced entity.
- **Protocol** three phases: resolve op references across the library the way `SRV/scripts/check-all-refs.ts` does; resolve resource links and anchors the way `SRV/scripts/check-resource-anchors.ts` does; resolve `{variable}` reads the way `SRV/scripts/check-binding-fidelity.ts` does, which already keys findings on `<workflow> :: <op>` across workflows.

`{consumer_surface}` is then a declared Input of `audit-canon` and its phase-2 walk covers those sites, so cross-workflow dual-home and stale-claim contradictions are **in scope by contract**, not by luck.

### 3.6 Verification, in a fresh context

`verify-high-findings.md:28` requires re-derivation "from the cited file and construct alone, **without reading the originating pass's reasoning**". In the sweep's own context that is unenforceable — which is why the 8-vs-3 High spread in the brief is not a like-for-like comparison at all: the bare sweep's 8 are pre-verification counts and the full pass's 3 are post-verification, and verification is bound only at `08:49-50` and `08:414-416` today, so `06`'s pre-attestation pair and all five of `10`'s passes feed raw findings straight into `apply-audit-fixes` in direct violation of the technique's own `verify-before-remediation` rule (`:49-51`).

Binding it at **`09:1`** puts it in a fresh `get_activity` worker that never held the sweep. Its declared Inputs are `{audit_findings}` rows (claim + cited construct + `Origin` + location), `{coverage_ledger}` and the target files — **no narrative channel**. New Rule `no-originating-rationale` makes that a contract, not a convention.

**Two additional duties at `09:1`, both cheap:**

- **Withdraw unattributed rows.** A row whose `Home` anchor does not resolve, or whose claim cannot be applied from that home alone, is withdrawn — AP-103's test (`AP:1342`) turned on the workflow's own findings.
- **Derive coverage rather than trust it** (graft): `{coverage_ledger}` is cross-checked against the anchor inventory of `audit-canon`'s Protocol phase 1, obtained by `get_technique` — an authored list that `SRV/scripts/check-resource-anchors.ts` (hard-zero) already validates in CI. Any anchor absent from the ledger becomes a `not-walked` row and sets `{has_coverage_gap}`, which the pre-attestation gate and Gate 2 both interpolate. This is the one structural check available against a saturated sweep, and it is possible **only** because verification runs in a different context.

### 3.7 Bounded fix cycle and the BLOCKING pre-attestation gate

```
08 quality-review ──(sweep, per target)──▶ 09 validate-and-commit
                                             1 verify-high-findings   (fresh context)
                                             2 compile-register
                                             3 persist findings-register.md
                                             4 review-disposition            [BLOCKING, review mode]
                                             5 audit-disposition#{remediation_round}
                                                   [BLOCKING pre-attestation gate]
                                                   condition: or(has_critical_finding, open_finding_count > 0)
                                                   remediate ─────────┐
                                                   accept-and-record  │
                                             6 bump-remediation-round │
                                             7 verify-scope-manifest  │
                                             8 verify-planning-readme │
                                             9 approve-to-commit#{remediation_round}  [BLOCKING, Gate 2]
                                            10-14 commit / verify / push / PR
                                            15-17 close-out / worktree removal
                                                                      │
08 quality-review ◀───────────────────────────────────────────────────┘
   1 author-fixes    (yaml-authoring)        when remediation_round > 0
   2 record-fixes    (apply-audit-fixes)     when remediation_round > 0
   3-6 re-resolve, re-sweep the changed set
```

Four properties of this wiring:

1. **Every remediation round passes through verification.** The cycle is a cross-node back edge, so a fix can never be re-swept and accepted inside the same context that produced it. This is the defect the intra-activity fix loops have today, and it is compounded at `06:223-247`, whose loop body is `apply-audit-fixes → re-audit-principles → re-audit-anti-patterns → reassess` with **no editing step at all** — `apply-audit-fixes.md:8,:24-26` is a *record*, not an edit, so that loop provably cannot converge.
2. **The bound is doubly encoded.** `remediation_round < 3` on the transition (structure), plus a BLOCKING checkpoint per round (server-enforced once yielded: `state.activeCheckpoint` blocks every other tool — `workflow-tools.ts:329, :600, :1295`; `resource-tools.ts:590, :771`; `SRV/src/utils/session/params.ts:38-46`). `maxIterations` and `breakCondition` are agent-honoured only (`activity.schema.ts:144-145`; `SRV/schemas/README.md:34`), which is exactly why the bound is not left to a loop.
3. **The pre-attestation gate is genuinely pre-attestation.** `audit-disposition#{remediation_round}` (step 5) sits between the verified finding set and the attestation at step 9, and it is `blocking: true` with no `defaultOption`/`autoAdvanceMs`, so the timer path is structurally unavailable. It replaces both `06:264-284 pre-attestation-blocker` and the inert `08:508-522 blocker-gate` `decisions` block.
4. **Instance qualification is not optional.** The live QDDWIT session already carries `checkpointResponses["validate-and-commit-approve-to-commit"]`; without `#{remediation_round}`, a second arrival at Gate 2 auto-approves the commit with no prompt (`workflow-tools.ts:978-1022`).

---

## 4. Retirement list

### 4.1 Activities — 5 files deleted, 4 rewritten in place

Deleted: `activities/03-requirements-refinement.yaml`, `activities/04-pattern-analysis.yaml`, `activities/05-impact-analysis.yaml`, `activities/10-post-update-review.yaml`, `activities/11-retrospective.yaml`.
Rewritten in place (path, filename and `id` all unchanged): `activities/01-intake-and-context.yaml`, `activities/06-scope-and-draft.yaml`, `activities/08-quality-review.yaml`, `activities/09-validate-and-commit.yaml`.

**Why `10-post-update-review.yaml` is the load-bearing deletion**, in order:

1. Most expensive stage in the corpus — 25 top-level / 35 steps, worst case 24 audit invocations (`10:9-72` ×1 + `10:126-158` ×3 iterations ×6 passes), each `audit-anti-patterns` call pulling all 128,341 bytes of `anti-patterns.md` (`audit-anti-patterns.md:28`, whole-file link, no anchor).
2. It **cannot produce a verified finding** — `verify-high-findings` is bound only in `08`.
3. Its one distinct capability, `scope-audit` (`10:69`), has a **dead output**: `{scope_drift_findings}` is baseline-recorded dead in `SRV/scripts/binding-fidelity-baseline.json`, never persisted, never read. Drift folds into `scope-verification` (§14, one authoritative home).
4. It re-binds the entire 7-technique publish tail of `09:78-224` at `10:169-210`, which a naive 4-activity split would *entrench*.
5. It is the sole source of the merge's ordering contradiction — a linear `audit` node cannot straddle a `land` commit.

**What is lost, and why it is acceptable:** any defect a remediation edit introduces after commit. The target removes the exposure structurally rather than by re-auditing: `09` contains **zero content-producing steps** (`readme-authoring` moved to `06:8`), and every remediation round routes back through `08` and then through verification at `09:1`. "Nothing lands unaudited" is a property of the step inventory.

### 4.2 Techniques — 19 retired, 5 added (37 → 23)

| Retired path | Why |
|---|---|
| `techniques/audit-expressiveness.md` (46) | → `audit-canon`; `schema-construct-inventory.md` survives as the home |
| `techniques/audit-conformance.md` (51) | → `audit-canon`; sibling survey becomes `08:5` bound step |
| `techniques/audit-rule-hygiene.md` (46) | strict subset of the `anti-patterns.md` walk — AP-105 |
| `techniques/audit-rule-enforcement.md` (45) | one catalogue entry — AP-105 |
| `techniques/audit-principles.md` (40) | → `audit-canon`; Partial verdict survives as a register value |
| `techniques/audit-anti-patterns.md` (44) | → `audit-canon` |
| `techniques/derive-design-dimensions.md` | → `elicit-change-brief` |
| `techniques/prepare-dimension.md` | → `elicit-change-brief` |
| `techniques/capture-dimension.md` | → `elicit-change-brief` |
| `techniques/synthesize-update-specification.md` | → `synthesize-change-brief` (mode-specific op, AP-124) |
| `techniques/persist-design-specification.md` (35) | wrapper around a bind it does not perform: sole output `{specification_path}` read only in message text (`03:75`, `03:90`, `09:152`), and Protocol `:30` delegates the write to the step already bound at `03:65-72` |
| `techniques/assemble-file-approach.md` (45) | sole purpose is `drafting-plan.md`, whose only path read is inside a checkpoint that is `blocking:false` + 30 s auto **and** gated `operation_type != update` (`06:86-96`) |
| `techniques/review-draft-yaml.md` (52) | sole purpose is `draft-attestation.md`; `{draft_attestation}` and `{reviewed_blocks}` are baselined dead outputs. **Relocate `:51-52` into `verify-artifact-conforms` first** |
| `techniques/pattern-analysis.md` | conformance dimension of the sweep, fed by `{reference_workflows}` |
| `techniques/context-loading.md` | both artifacts die; both outputs are dead path variables (`workflow.yaml:113-120`, zero corpus reads); `applicable-constructs.md` has **zero citations anywhere**; the literacy gate it fed is a no-op `action: set` at `01:210-223` |
| `techniques/reconcile-design-assumptions.md` | assumption subsystem retired (§4.5 loss 2) |
| `techniques/summarize-findings.md` | AP-110 duplicate of `compile-report` — same guide cite (`compile-report.md:24` ≡ `summarize-findings.md:24`), same output variable, split only by mode |
| `techniques/scope-audit.md` | dead output, post-commit only; drift → `scope-verification` |
| `techniques/conduct-retrospective.md` | → a section of `create-completion-doc` (AP-84 do-not-flag `:1118`) |

**Added:** `techniques/audit-canon.md`, `techniques/load-known-findings.md`, `techniques/resolve-consumer-surface.md`, `techniques/elicit-change-brief.md`, `techniques/synthesize-change-brief.md`.

**Reduced or extended, not retired (8):** `intake-classification.md` (drop §4/§5 `:83-90` and the `structural_inventory_path` output `:56-58`; keep `{structural_inventory}`; add `review_scope_confirmed`); `impact-analysis.md` (drop §7's "calling activity" persist prose `:57` — AP-68(a); add `{change_constraints}`); `review-drafted-file.md` (drop §2 `:45-48`; keep `{has_unflagged_removals}`); `reload-workflow.md` (declare `{base_ref}`, `{surface_files}`, `{changed_files}` — today it declares **no outputs at all**; re-author `:8`'s "post-commit" Capability in positive present as "current definition surface and its base ref"); `verify-high-findings.md` (drop `{verified_findings_path}` + its `#### artifact` block and the "calling activity's" clause `:41`; add `{open_finding_count}`, `{has_critical_finding}`, `{has_coverage_gap}`, `{coverage_ledger}` input, Rule `no-originating-rationale`); `compile-report.md` (retarget to `findings-register.md#template`; replace the 7 optional `*_findings_path` inputs — AP-119 + AP-125 hits — with `{register_sections}`, `{verified_findings}`, `{coverage_ledger}`, `{known_finding_keys}`); `verify-artifact-conforms.md` (absorb the binding-fidelity pass); `create-completion-doc.md` (absorb the retrospective as a section; bare filename `COMPLETE.md`); `commit-verification.md` (delete `:18`); `audit-schema-validation.md` (add `--root {target_path}` to `:24`, `:30`, `:34`; name the seven missing guards).

**Deleted activity-level `techniques:` blocks:** `03:6-7` and `06:6-7` (both `[scatter-gather]`, bound at no step).

### 4.3 Resources — 13 retired, 2 added (23 → 12, +index README)

Retired: `resources/design-specification.md`, `resources/structural-inventory.md`, `resources/format-conventions.md`, `resources/applicable-constructs.md`, `resources/pattern-analysis.md`, `resources/drafting-plan.md`, `resources/file-review-note.md`, `resources/draft-attestation.md`, `resources/design-assumptions.md`, `resources/design-assumption-reconciliation.md`, `resources/findings-satellite.md`, `resources/compliance-report.md`, `resources/follow-ups.md` (already an orphan — a creation guide with no producing bind site, cited only by the map row `techniques/TECHNIQUE.md:83`).

Added: `resources/change-brief.md`, `resources/findings-register.md`.

**Survivors (12 + `resources/README.md`):** `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md`, `elicitation-guide.md`, `update-mode-guide.md`, `impact-analysis.md`, `scope-manifest.md`, `completion-artifact.md`, `readme-seed.md`, `change-brief.md`, `findings-register.md`. **None of the four criteria homes is edited.** `schema-construct-inventory.md` and `convention-conformance.md` must survive: they are named sole criteria homes (`audit-expressiveness.md:32`, `audit-conformance.md:32`); retiring a walker does not retire its home.

### 4.4 Variables — 32 deleted, 10 added, 2 renamed (63 → 41)

**Deleted, by `workflow.yaml` line:** `:45 assumption_decisions` (zero reads; its two producing steps `03:126-137` pass the literal `[]` and the step's own message says so) · `:49 has_resolvable_assumptions` · `:61 expressiveness_finding_count` · `:65 conformance_finding_count` · `:69 rule_hygiene_finding_count` · `:73 enforcement_finding_count` · `:77 principle_finding_count` · `:81 anti_pattern_finding_count` (six shadows of one authoritative fact — AP-112 `:1454`; three carry AP-126 producer tails at `:63`, `:71`, `:79`) · `:89 pass_count` · `:113 format_conventions_path` · `:117 applicable_constructs_path` (both dead today) · `:121 pattern_analysis_path` · `:133 draft_attestation_path` · `:141 structural_inventory_path` · `:145 drafting_plan_path` · `:149 file_review_note_path` · `:153`–`:180` the seven `*_findings_path` variables including `:169 verified_findings_path` (dead today) · `:181 dimension_questions` · `:198 format_literacy_confirmed` · `:202 schema_constructs_confirmed` (their only consumer was the deleted `01→03` transition condition — AP-88's Fix `:1158`) · `:220 needs_audit_fixes` (pure projection of `open_finding_count > 0` — AP-112) · `:224 needs_recommit` · `:232 assumptions_log` · `:235 open_assumptions` (dead) · `:238 has_open_assumptions` · `:242 design_dimensions`.

**Renamed in place:** `:109 specification_path` → `change_brief_path`; `:53 review_findings_count` → `open_finding_count`.

**Added (10), each one line, each read by a gate, message, `set` or input deviation:** `open_judgements_count` (number, 0) · `removals_approved` (boolean, false) · `removal_disposition` (string, `flagged \| restored`) · `scope_round` (number, 0) · `remediation_round` (number, 0) · `remediation_selected` (boolean, false) · `commit_approved` (boolean, false) · `review_closed` (boolean, false) · `has_coverage_gap` (boolean, false) · `register_sections` (array, `[]`).

**Retained and rewritten for AP-126:** `:51` and `:87`, whose descriptions name `requirements-refinement` and `impact-analysis`.

Every deletion is atomic with its reads. `SRV/scripts/check-binding-fidelity.ts:474-481` seeds producers from `workflow.yaml` `variables[]` (`:250-258`), so a deleted declaration with a surviving `{token}` read is a NEW hard violation; and `:485` means stripping an output's `#### artifact` block removes the dead-output exemption, which is why `verified_findings_path`, `format_conventions_path` and `applicable_constructs_path` must lose declaration, technique output entry and every read in one commit.

### 4.5 Accepted losses, named

1. **Create-mode 12-dimension elicitation** (`03:41-60`, `maxIterations: 12`) → one `elicit-change-brief` pass plus one batched question payload at `01:11`. §4 (`DP:29`) asks for *one* clarifying question before acting; gap-batching is the sanctioned reduction (`workflow.yaml:37-40`).
2. **The assumption subsystem** — `reconcile-design-assumptions`, the corpus's only unbounded `while` (`03:101-113`), `assumptions-log.md`, and the audit-vs-open resolvability vocabulary. Open judgements become `change-brief.md#open-judgements`, surfaced at `01:11` and re-surfaced in Gate 2's payload. **The loss is real:** no automated resolution of schema-settled assumptions. Two of its three step pairs were provably no-ops already.
3. **Pattern analysis as a positive deliverable.** The conformance dimension detects divergence from siblings; it does not produce an "applicable patterns and practices" document. `04-pattern-analysis.yaml` had zero conditions and one zero-effect checkpoint.
4. **Post-commit assurance as a separate stage** (§4.1) — replaced by a `09` with zero content-producing steps.
5. **The §2 literacy gate as a gate** — becomes a technique-internal citation obligation. It was already vacuous.
6. **Retarget-in-place on a wrong review target.** Gate 1's `wrong-review-target` now sets `review_scope_confirmed: false` and `01:4`'s `action: validate` halts, rather than looping. This *removes* a live dead end: today that option also sets `intent_needs_confirmation: true`, which suppresses `announce-certain-review-scope`, so neither the review transition nor the `isDefault` transition is satisfiable and **no transition exists**.
7. **Context-level independence for Medium confirmations.** `verify-high-findings`' phase 3 lighter Medium pass runs in the same fresh worker as the High re-derivation, which is correct; but the Medium pass has no independent second look. Accepted.

---

## 5. Migration plan

Ten steps. Each is independently landable and leaves every validator at or better than its current state, except the one unavoidable pairing noted at M7.

### M0 — Fix the workflow's own validation gate (prerequisite, no `workflow-design` behaviour change)

`techniques/audit-schema-validation.md:24, :30, :34` invoke `validate-workflow-yaml.ts`, `check-all-refs.ts` and `check-binding-fidelity.ts` and pass **no `--root`**, so all three validate `SRV/workflows` (the stale main checkout) rather than the worktree holding the change; and seven of ten guards are never named. Add `--root {target_path}` to all three and add `check-resource-anchors`, `check-fragments`, `check-variable-model`, `check-activity-technique-overlap`, `check-technique-template`, `check-audience`, `check-self-provisioned-input`. **Without this, the #321 PR can pass workflow-design's own gate while the corpus is broken.** Land alone.

### M1 — Session rewriter (before any file change)

Ship `SRV/scripts/migrate-workflow-design-sessions.ts`. It walks `SRV/.engineering/artifacts/planning/*/session.json`, including embedded `triggeredWorkflows[i].state` (children are embedded, not separate files), and for every node with `workflowId: workflow-design`:

| Field | Action |
|---|---|
| `currentActivity`, `completedActivities`, `skippedActivities`, `history[].activity` | apply the 5-id map below |
| `checkpointResponses` | re-key `<old-act>-<cp>` → `<new-act>-<cp>` for mapped activities; **delete** keys whose checkpoint is now instance-qualified or renamed: `validate-and-commit-approve-to-commit`, `scope-and-draft-scope-and-structure-confirmed`, `scope-and-draft-file-review`, `scope-and-draft-preservation-check`, `scope-and-draft-draft-attestation`, `scope-and-draft-batch-review-attested`, `quality-review-review-disposition` (retained id, but the option set changed — a replayed `selective-fixes` no longer resolves) |
| `workflowVersion` | restamp to the new version. `start_session`'s resume branch never restamps it — `effectiveWorkflowVersion` (`SRV/src/tools/resource-tools.ts:238`) is consumed only on the fresh-creation branch (`:306`) — so `validateWorkflowVersion` (`SRV/src/utils/validation.ts:53-57`) would otherwise warn on every subsequent call |
| `status` | set `abandoned` for the one session at `content-drafting` (a v1.2.1 id already absent) and the one with `currentActivity: ""` |

**Id map (5 retired ids):**

| Old id | New id | Sessions affected | Rationale |
|---|---|---|---|
| `requirements-refinement` | `intake-and-context` | 0 current, several in `completedActivities` | brief composition absorbed |
| `impact-analysis` | `intake-and-context` | 1 current | impact + removal gate absorbed |
| `pattern-analysis` | `intake-and-context` | 0 | survey retired |
| `post-update-review` | `validate-and-commit` | 1 current | post-commit audit absorbed and retired |
| `retrospective` | `validate-and-commit` | **19 current** | close-out absorbed; also set `commit_approved: true`, `remediation_selected: false` in `variables` so those 19 resume at steps 15-17 rather than re-running verification |

**Preserved ids — no rewrite needed, 9 sessions resume directly:** `intake-and-context` (3, including QDDWIT), `quality-review` (4), `scope-and-draft` (1), `validate-and-commit` (1).

**QDDWIT specifically.** Verified at `SRV/.engineering/artifacts/planning/2026-07-27-review-mode-friction-continuation/session.json` as `triggeredWorkflows[0].state`: `workflowId: workflow-design`, `workflowVersion: 1.30.0`, `status: running`, `currentActivity: intake-and-context`, `completedActivities: [intake-and-context, requirements-refinement, impact-analysis, scope-and-draft, quality-review, validate-and-commit, post-update-review]`, `checkpointResponses: { "validate-and-commit-approve-to-commit": … }`. Because `intake-and-context` is preserved, **it does not brick** — `get_activity` resolves and it resumes into the rewritten activity mid-second-pass. Three residual actions, all handled by M1: (a) `requirements-refinement`, `impact-analysis` and `post-update-review` in `completedActivities` are mapped — unmapped they would produce only advisory `Activity manifest references unknown activity 'X'` warnings (`validation.ts:232-233`); (b) the stored `validate-and-commit-approve-to-commit` response is **deleted**, so Gate 2 re-prompts on the second pass instead of silently replaying an approval given against a different definition; (c) `workflowVersion` is restamped from `1.30.0`.

Land alone, run alone, and commit the resulting session diffs in the same PR so the rewrite is auditable.

### M2 — Rewrite the `@` column in existing planning folders (data only)

Writers select Progress rows by the activity-prefix field equal to `{artifact_prefix}` and mutate only Status (`meta/resources/planning-readme.md:77, :88-91`); `{artifact_prefix}` derives from the activity filename index (`meta/techniques/workflow-engine/sync-progress-status.md:45-47`; `SRV/src/loaders/filename-utils.ts:6-10`; `SRV/src/loaders/workflow-loader.ts:83`). Because prefixes 01/06/08/09 are **preserved**, 4 of 9 mappings need no change. Three rows move and two retire:

| Row `@` today | Item | Action in each existing folder |
|---|---|---|
| 01 | Intake and context | unchanged |
| 01 | Format conventions / Structural inventory / Deferred items | set Status `⊘` — artifacts retired |
| 03 | Design specification | rewrite `@` → `01`, relabel to `[Change brief](change-brief.md)`; leave the existing `03-design-specification.md` file on disk and mark the row `⊘` if a `change-brief.md` does not exist |
| 03 | Assumptions log | set `⊘` |
| 04 | Pattern analysis | set `⊘` |
| 05 | Impact analysis | rewrite `@` → `01` (the on-disk file keeps its `05-` prefix: `write-artifact.md:39-42` is prefix-agnostic and sticky) |
| 06 | Scope manifest | **unchanged** |
| 06 | Drafting plan / Draft attestation / File
