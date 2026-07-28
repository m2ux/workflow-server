# Target architecture for `workflow-design` — the aggressive cut

**Stance taken literally: 4 activities, 5 artifacts.** Every retained construct is justified below against a named principle or a named data dependency. Where the cut trips an entry, I redesign.

Roots: `WD = /home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design`, `SRV = /home/mike1/projects/dev/workflow-server`. `AP` = `WD/resources/anti-patterns.md`, `DP` = `WD/resources/design-principles.md`.

---

## 0. The one structural move that makes 4 nodes work

The corpus map found the fatal contradiction in #321: `audit = 08+10` straddles the commit in `land`, because `reload-workflow.md:8` requires "**Fresh post-commit** workflow definition as the audit baseline" and `scope-audit.md:20` diffs "the **committed** diff on `{workflow_branch}`". Real order today is `08 → 09(commit) → 10 → 11`.

**Resolution: move the commit into `draft` and move the gate to publish.** `DP:45` (§8) classifies by *reversibility*, not by act. A commit on a session-local worktree feature branch behind a **draft** PR is reversible: the branch is deletable, the worktree is removed by `work-package::manage-git::remove-worktree` (bound today at `11-retrospective.yaml:41`), and the PR is never merged. The semi-irreversible act is `github-cli-protocol::mark-ready` (today `09-validate-and-commit.yaml:215`). So Gate 2 becomes **approve-to-publish** in `land`, sited at the irreversible act, and it carries the audit evidence §8 demands — which the current `approve-to-commit` (`09:145-167`) cannot, because it fires *before* the post-commit audit exists.

This buys three things at once: a linear `frame → draft → audit → land` with no back edge required for the committed baseline; a single hard gate that reads the findings register instead of a pre-audit attestation; and it deletes `10-post-update-review.yaml`'s 8-step republish tail (`10:169-210`), which today re-binds the exact publish sequence already in `09:78-224`.

---

## 1. Target activity list

Filenames must carry an `NN-` prefix (`SRV/src/loaders/filename-utils.ts:6-10`; a non-matching file is **silently skipped**, `SRV/src/loaders/workflow-loader.ts:68-69`) and the filename id segment **must equal the declared `id:`** — `getActivity` matches the YAML `id` (`workflow-loader.ts:426-428`) but `readActivityRaw`, the path `get_activity` uses, matches the filename (`:570`), so divergence passes every validator then throws at delivery (hazard H2).

Gate-type vocabulary: **hard** = `blocking: true`, **no** `defaultOption`, **no** `autoAdvanceMs` — the server's `auto_advance` throws when either is missing (`SRV/src/tools/workflow-tools.ts:1167-1172`), so the timer path is structurally unavailable. **soft** = both present, server-enforced timer (`:1173-1185`). *Every checkpoint in this design is hard.*

Bundling rule applied throughout: `collectUngated` skips any step with `when` **or** `condition`, and the test precedes the loop branch, so a gated loop excludes its whole body (`workflow-tools.ts:713-719`). Iteration bounds therefore live in `breakCondition`/`maxIterations` (`SRV/src/schema/activity.schema.ts:144-145`), which are **not** in `stepCommonFields` (`:73-77`) — so a bounded loop stays eager-bundleable. This is why `08-quality-review.yaml` delivers 0 of 27 step techniques eagerly today and the target audit delivers nearly all of them.

### `01-frame.yaml` — `id: frame` (initial, required)

Purpose: turn a request into an approved design specification and a complete scope manifest.

| # | id | kind | bound technique / body | gate |
|---|---|---|---|---|
| 1 | `classify-intent` | technique | `intake-classification` | — |
| 2 | `seed-planning-readme` | technique | `workflow-engine::create-readme` (`seed_profile: workflow-design/readme-seed`) | — |
| 3 | `design-intent` | **checkpoint** | — | `when: intent_needs_confirmation == true` |
| 4 | `derive-dimensions` | technique | `derive-design-dimensions` | `when: operation_type == 'create'` |
| 5 | `dimension-loop` | **loop** `forEach current_dimension over design_dimensions`, `maxIterations: 12` | 5a `prepare-dimension` (technique) · 5b `surface-questions` (action, `message: {dimension_questions}`) · 5c `capture-dimension` (technique) | `when: operation_type == 'create'` |
| 6 | `synthesize-update-spec` | technique | `synthesize-update-specification` | `when: operation_type == 'update'` |
| 7 | `reconcile-assumptions` | technique | `reconcile-design-assumptions` | `when: operation_type != 'review'` |
| 8 | `survey-target` | technique | **`survey-target`** (new: patterns + impact + removal inventory) | `when: operation_type != 'review'` |
| 9 | `define-scope` | technique | `scope-definition` | `when: operation_type != 'review'` |
| 10 | `persist-specification` | technique | `work-package::manage-artifacts::write-artifact` — `bare_filename: design-specification.md`, `artifact_content: accumulated_design`, `outputs.written_artifact: specification_path` | `when: operation_type != 'review'` |
| 11 | `persist-scope-manifest` | technique | `…::write-artifact` — `scope-manifest.md`, `artifact_content: scope_manifest`, `outputs.written_artifact: scope_manifest_path` | `when: operation_type != 'review'` |
| 12 | `preservation-and-scope` | **checkpoint, HARD** | 2 options: `approve` → `setVariable preservation_approved: true`; `revise` → `transitionTo: frame` | `when: or(removal_count > 0, has_open_assumptions == true)` |

Transitions: `to: audit` `when operation_type == 'review'`; `to: draft` `isDefault: true`.

Step 5b exists because techniques are session-blind — `DP:109` (§24) and AP-113 (`AP:1466`). It is not removable by merging activities; that is the invariant the map called R9.

Step 12 replaces `06:36-51 scope-and-structure-confirmed`, whose soft auto-advancing default set `scope_manifest_confirmed: true` and thereby unlocked the drafting loop *and all 20 non-review steps of 08* — the single consequential-default defect in the corpus, and the sole `workflow-design` row in `SRV/scripts/review-mode-gating-baseline.json:7`. `scope_manifest_confirmed` is **deleted**, per AP-88's Fix ("delete variables whose only consumer was the removed checkpoint's condition", `AP:1158`); the ordering it faked is now carried by step order alone.

### `02-draft.yaml` — `id: draft` (required)

Purpose: author every file the scope manifest names and land them as a reversible committed baseline behind a draft PR.

| # | id | kind | bound technique / body | gate |
|---|---|---|---|---|
| 1 | `prepare-worktree` | technique | `prepare-workflow-branch` (absorbs `derive-workflows-target-path`) | `when: file_count > 0` |
| 2 | `file-loop` | **loop** `forEach current_file over scope_manifest`, `maxIterations: 50` | 2a `author-file` (`yaml-authoring`) · 2b `review-file` (`review-drafted-file`) · 2c `preservation-check#{current_file}` (**checkpoint, HARD**, `when: and(operation_type == 'update', has_unflagged_removals == true)`; options `flag-and-proceed` → `setVariable removal_disposition: flagged`, `restore-content` → `setVariable removal_disposition: restored`) · 2d `apply-removal-disposition` (`yaml-authoring`, `when: removal_disposition == 'restored'`) | — |
| 3 | `validate-schema` | technique | `audit-schema-validation` (with `--root {target_path}`) | `when: file_count > 0` |
| 4 | `schema-blocker` | **checkpoint, HARD** | `redraft` → `transitionTo: draft`; `commit-anyway` → `setVariable schema_failures_accepted: true` | `when: fail_count > 0` |
| 5 | `commit-baseline` | technique | `version-control::commit-regular-files` | `when: file_count > 0` |
| 6 | `verify-commit` | technique | `commit-verification` | `when: file_count > 0` |
| 7 | `push-branch` | technique | `version-control::push-branch` | `when: file_count > 0` |
| 8 | `compose-pr` | technique | `publish-workflow-pr` | `when: file_count > 0` |
| 9 | `open-draft-pr` | technique | `github-cli-protocol::create-pr` (`as_draft: true`) | `when: file_count > 0` |

Transitions: `to: audit`, `isDefault: true`.

`preservation-check#{current_file}` is **instance-qualified**. The plain-id version at `06-scope-and-draft.yaml:140` sits inside a `maxIterations: 50` loop, and `yield_checkpoint` replays a stored response **without prompting** when `checkpointResponses['<activity>-<checkpoint>']` exists (`workflow-tools.ts:978-1022`); `checkpointBaseId` resolves `base#instance` back to the one definition (`workflow-loader.ts:438-464`, separator at `:438`). `work-package/activities/07-assumptions-review.yaml:90` already does this correctly; none of workflow-design's 16 checkpoints does. Fixing it is mandatory here because the loop is the only place per-file safety is decided.

Step 4 replaces `09:54-77 validation-passed`, which fires only when `fail_count > 0` and **auto-selects `proceed` to commit after 30 s**.

**Review mode needs no mode gates in this activity.** `scope_manifest` is empty in review mode, so the `forEach` runs zero iterations; the commit tail is gated on `file_count > 0`, one expression reused. This "empty-scope" substitution is what removes the 12 new `operation_type != 'review'` gates the map predicted for 03+04, and the 20 three-clause `and()` gates that today decorate every non-review step of `08` (`08:109-459`). `DP:97`-adjacent AP-14 `mode-as-state` (`AP:246`) is still satisfied: `operation_type` remains the single authoritative mode variable, read by `when` and by transitions.

### `03-audit.yaml` — `id: audit` (required)

Purpose: one whole-surface sweep of the committed definition against every canon home, with verified severities and a bounded remediation cycle.

| # | id | kind | bound technique / body | gate |
|---|---|---|---|---|
| 1 | `establish-baseline` | technique | `reload-workflow` → `audit_base_ref`, `audit_file_set` | — |
| 2 | `sweep-cycle` | **loop** `loopType: doWhile`, `variable: audit_iteration`, `maxIterations: 3`, `breakCondition: or(audit_finding_count == 0, remediation_selected == false)` | see below | **no `when`, no `condition`** |
| 2a | `sweep-canon` | technique | **`audit-workflow-content`** (new walker) → `audit_findings`, `coverage_ledger`, `audit_finding_count`, `has_critical_finding` | — |
| 2b | `verify-highs` | technique | `verify-high-findings` → `verified_findings`, `verified_high_count` | — |
| 2c | `compile-register` | technique | **`compile-findings-register`** (new; replaces `compile-report` + `summarize-findings`) → `findings_register` | — |
| 2d | `persist-register` | technique | `…::write-artifact` — `findings-register.md`, `artifact_content: findings_register`, `outputs.written_artifact: register_path` | — |
| 2e | `audit-disposition#{audit_iteration}` | **checkpoint, HARD** | `remediate` → `setVariable remediation_selected: true`; `accept-and-record` → `setVariable remediation_selected: false` | `when: verified_high_count > 0` |
| 2f | `ensure-remediation-worktree` | technique | `prepare-workflow-branch` | `when: and(remediation_selected == true, worktree_created != true)` |
| 2g | `author-fixes` | technique | `yaml-authoring` | `when: remediation_selected == true` |
| 2h | `record-fixes` | technique | `apply-audit-fixes` | `when: remediation_selected == true` |
| 2i | `revalidate-schema` | technique | `audit-schema-validation` | `when: remediation_selected == true` |
| 2j | `recommit-fixes` | technique | `version-control::commit-regular-files` | `when: remediation_selected == true` |
| 2k | `push-fixes` | technique | `version-control::push-branch` | `when: remediation_selected == true` |

Transitions: `to: draft` `when: and(has_critical_finding == true, remediation_selected == true)`; `to: land` `isDefault: true`.

Four deliberate choices:

- **`doWhile`** (`activity.schema.ts:141`) guarantees ≥1 body execution, so the sweep is bound **once** — not once at top level plus once inside a `while` body, as `08:108/489` and `10:12/137` do today. That removes the AP-38 exposure the map predicted for a merged 08+10 (14 `write-artifact` binds → clean iterable → classification (b)) *by arithmetic*: this activity has one `write-artifact` bind.
- **2g before 2h.** `apply-audit-fixes.md:8,:24-26` is a *record*, not an edit; `06:223-247` has no editing step at all, so the pre-attestation cycle records fixes it never made. Fixed here.
- **2f** lets review mode remediate in-session, which deletes `update_seeded_from_review` (`workflow.yaml:57-60`) and the `08:94/:105 → intake-and-context` back edge. §23 (`DP:105`) closes the loop *inside* the audit stage instead of restarting the workflow.
- **No `decisions` block.** The corpus's only one (`08:508-522`) is inert: `decisions` is read in exactly two places, both of which merely widen the legal-transition set (`workflow-loader.ts:472`, `:500-507`), and no server code evaluates a branch. Keeping a "Critical Blocker Gate" that nothing enforces is AP-79 `structure-backed-constraints` (`AP:1046`) — the very entry `audit-rule-enforcement.md:32` exists to police. The blocker is a real transition condition instead.

Cycle bound: the back edge fires only while the user keeps choosing `remediate` at 2e, so the cycle is user-bounded. That replaces `10:220-226`'s unguarded `to: intake-and-context` on loop exhaustion, which has no counter anywhere in the 63 variables.

### `04-land.yaml` — `id: land` (required, terminal)

| # | id | kind | bound technique | gate |
|---|---|---|---|---|
| 1 | `reconcile-scope` | technique | `scope-verification` (absorbs `scope-audit`'s drift check) → `unaddressed_count`, `drift_count` | `when: file_count > 0` |
| 2 | `verify-artifact-discipline` | technique | `verify-artifact-conforms` → `artifact_conformance` | — |
| 3 | `author-workflow-readme` | technique | `readme-authoring` | `when: operation_type != 'review'` |
| 4 | `sync-planning-readme` | technique | `workflow-engine::verify-readme-conforms` | — |
| 5 | `publish-approval` | **checkpoint, HARD** (Gate 2) | `publish` → `setVariable publish_approved: true`; `return-to-draft` → `transitionTo: draft`; `return-to-frame` → `transitionTo: frame` | **unconditional** |
| 6 | `mark-ready` | technique | `github-cli-protocol::mark-ready` | `when: and(publish_approved == true, file_count > 0)` |
| 7 | `close-out` | technique | **`close-out-session`** (new; `create-completion-doc` + `conduct-retrospective`) → `close_out_document` | — |
| 8 | `persist-close-out` | technique | `…::write-artifact` — `COMPLETE.md`, `artifact_content: close_out_document` | — |
| 9 | `remove-worktree` | technique | `work-package::manage-git::remove-worktree` (`component_name: workflows`) | `when: worktree_created == true` |

No `transitions:` block. Its legal set is `{draft, frame}` from the checkpoint effects (`workflow-loader.ts:466-474`) plus `__terminal__`, which is always legal (`SRV/src/utils/validation.ts:42`). Note the trap avoided: an activity with *no* transitions, decisions **and** no checkpoint `transitionTo` legalizes every target, because `validateActivityTransition` returns null on an empty valid set (`validation.ts:45`).

Step 2 is not optional: AP-95 `enforce-output-discipline` (`AP:1242`) requires every output-discipline ruleset to be paired with a verify operation **at a workflow boundary**, gated with "no checkpoint, loop, or routing variable". With 5 artifacts the canonical-home map is small, but the verify op is mandated.

**Checkpoint census: 16 → 6, all hard, all with recorded effects.** Exactly one (`publish-approval`) is unconditional; the other five are exception-only — §12's "exception-only status" (`DP:61`) applied to gates. The 11 soft auto-advancing checkpoints go because 10 of 11 carry **zero `effect` on any option**, which is AP-89 `checkpoint-requires-decision` verbatim ("Every option leads to the same next step, sets no variable… Discriminator is recorded effect", `AP:1170`). `workflow.yaml:18` names four checkpoints that stay interactive under `headless_mode`; all four survive as Gate 1 (`design-intent`), Gate 2 (`publish-approval`), `preservation-check`, and `audit-disposition` (the renamed `review-disposition`).

---

## 2. Target artifact list — 5, each with its named reader and the decision it feeds

`AP-96 artifact-audience-declared` (`AP:1254`) requires the audience in the output declaration; `AP-97 link-named-artifacts` (`AP:1266`) requires `[label]({path_variable})` at every checkpoint that names one, never a hard-coded `NN-` prefix.

| # | Bare filename | Producer / persist site | Named reader | Decision it feeds | Guide (AP-116) |
|---|---|---|---|---|---|
| 1 | `README.md` (planning) | `workflow-engine::create-readme`, `frame:2` | human; `sync-progress-status` mutates Status only | Session-progress visibility; the *only* surviving in-session narration surface | `meta/resources/planning-readme.md` + `WD/resources/readme-seed.md` |
| 2 | `design-specification.md` | `write-artifact`, `frame:10`; content `accumulated_design` | **human** at `frame:12` and at Gate 2 (`land:5`); **agent** input to `scope-definition` | Approve the design + the removal inventory + open judgements (§4, §8, §10) | `WD/resources/design-specification.md` (extended with `#impact-and-removals`, `#open-judgements`) |
| 3 | `scope-manifest.md` | `write-artifact`, `frame:11` | **agent**: `draft:2` iterates it (`forEach … over scope_manifest`); `scope-verification` re-verifies it at `land:1` | §3's enumerate/re-verify pair; drives every drafting iteration | `WD/resources/scope-manifest.md` |
| 4 | `findings-register.md` | `write-artifact`, `audit:2d`; content `findings_register` | **agent state** (one row per finding, `AP:1264`) re-read by `apply-audit-fixes`; **human** via link at `audit:2e` and Gate 2 | Remediate / accept-and-record; publish / return | **new** `WD/resources/findings-register.md`, section-split per §30 |
| 5 | `COMPLETE.md` | `write-artifact`, `land:8` | human | Terminal record: delivered items, decisions, `preservation_approved`, coverage, retrospective | `WD/resources/completion-artifact.md` |

Persist sites: **5** (4 `write-artifact` + 1 `create-readme`), down from 27 `write-artifact` binds → 20 distinct bare filenames (22 counting `README.md` and `assumptions-log.md`). Max 2 `write-artifact` binds in any one activity, against distinct static targets with distinct structured inputs — AP-38's named carve-out (`AP:550`).

The target workflow's own root `README.md` (`readme-authoring`, `land:3`) is **product written into `{target_path}`**, not a session planning artifact; §11 (`DP:57`) requires it and it is not one of the 5. Stating that explicitly so the count is not accused of hiding one.

Three deletions that need naming because they look load-bearing:

- **`impact-analysis.md` and `pattern-analysis.md` become sections of `design-specification.md`.** §8 needs impact *content* at the confirmation, not a file; §30 (`DP:133`) makes sections the delivery units, so `frame:12`'s gate fetches `design-specification.md#impact-and-removals`. AP-93 `canonical-fact-home` (`AP:1218`) is satisfied — the removal inventory has exactly one home — and AP-85/AP-94 are satisfied because nothing copies it.
- **`structural-inventory.md` goes; `{structural_inventory}` stays.** It is a declared required input of `synthesize-update-specification.md:20-22`, loaded at `:38`. The value survives in the bag; the artifact does not.
- **`assumptions-log.md` goes.** `assumption_decisions` is written only by `03:126-129` with the literal `[]` and passed straight to `review-assumptions::record` at `03:132-137` — the step's own message says "empty decision list for record". Both steps are unconditional no-ops. Open judgements become `design-specification.md#open-judgements`, gated at `frame:12` via `has_open_assumptions`.

---

## 3. Retirement list

### Activities — 8 files deleted, 1 renamed

`01-intake-and-context.yaml`, `03-requirements-refinement.yaml`, `04-pattern-analysis.yaml`, `05-impact-analysis.yaml`, `08-quality-review.yaml`, `09-validate-and-commit.yaml`, `10-post-update-review.yaml`, `11-retrospective.yaml`; `06-scope-and-draft.yaml` → `02-draft.yaml` (`id: draft`). New: `01-frame.yaml`, `03-audit.yaml`, `04-land.yaml`.

### Techniques — 18 retired, 4 new (37 → 23 local)

| Retired | Why |
|---|---|
| `context-loading` | Both outputs are dead path variables (`workflow.yaml:113-120`, zero reads corpus-wide); `applicable-constructs.md` has **zero citations** anywhere. §2's literacy gate is already a no-op `action: set` at `01:210-223`. |
| `persist-design-specification` | Sole output `specification_path`; its Protocol `:30` delegates the write to the activity's `write-artifact` bind, which `03:65-72` already is. Wrapper around a bind it does not perform. |
| `derive-workflows-target-path` | Folded into `prepare-workflow-branch`: one produce path (derive root → create worktree → checkout branch). `derive-workflows-target-path.md:12-14,:26-31` + `prepare-workflow-branch.md:12-14,:30-36`. |
| `assemble-file-approach` | Sole purpose is `drafting-plan.md`, whose only reader is a zero-effect 30 s auto-advancing checkpoint that is *also* gated out in update mode (`06:86-103`). |
| `review-draft-yaml` | Sole purpose is `draft-attestation.md`; `draft_attestation` and `reviewed_blocks` are baselined dead outputs. **Relocate Protocol `:51-52`** (binding-fidelity: every artifact-persisting step is a bound `steps[]` entry, every required input has a producer) into the new walker — it is a structural check over bind sites. |
| `pattern-analysis`, `impact-analysis` | → **`survey-target`**. §15's reorder-or-drop test: two surveys of the same target, mutually reorderable, feeding the same downstream write. |
| `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `audit-principles`, `audit-anti-patterns` | → **`audit-workflow-content`**. Six walkers over four homes, three on `anti-patterns.md`, one dedicated to a single entry — against AP-105's "keep at most one walker per home" (`AP:1366`). §29's Separation test (`DP:129`) guarantees no criteria loss. |
| `compile-report`, `summarize-findings` | → **`compile-findings-register`**. Same guide (`compile-report.md:24` and `summarize-findings.md:24` both cite `compliance-report.md#template`), same output variable, split only by mode — AP-110 (`AP:1430`). |
| `scope-audit` | Output `scope_drift_findings` is baselined dead, never persisted, never read. Drift folds into `scope-verification` (§14, one authoritative home for the scope-reconciliation fact). |
| `create-completion-doc`, `conduct-retrospective` | → **`close-out-session`**. AP-84's Do-not-flag blesses "a single close-out artifact with retrospective as a section" (`AP:1118`). Also fixes the `completion.md` vs `COMPLETE.md` mismatch: both bind sites (`11:20`, `11:36`) write `completion.md` while every canon layer declares `COMPLETE.md`, so the seeded README's `[Close-out (COMPLETE.md)](COMPLETE.md)` never resolves. |

**Reduced, not retired:** `review-drafted-file` — delete §2 persist (`:45-48`), keep `has_unflagged_removals` (sole gate on the hard preservation checkpoint). `intake-classification` — delete §4/§5 (`:83-90`) and the `structural_inventory_path` output (`:56-58`); **add `planning_folder_path` as a declared output** so `01:9-12`'s value-LESS control `set` can be deleted per AP-34's Fix verbatim ("Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets", `AP:504`). `reconcile-design-assumptions` — input becomes `accumulated_design`; resolve the whole collection in one pass, which deletes the corpus's only unbounded `while` loop (`03:101-113`) and `has_resolvable_assumptions` (`workflow.yaml:49-52`). `commit-verification` — rewrite `:18`, which hard-codes six of `09`'s step ids and is also bound from `10:184-187` where none exist (AP-68 + AP-129). `audit-schema-validation` — add `--root {target_path}` to all three commands (`:24,:30,:34` today validate `SRV/workflows`, the stale main checkout, not the worktree under change — hazard H5).

**Activity-level `techniques:` lists deleted** — `03:6-7` and `06:6-7` both list `scatter-gather`, bound at no step. With no fan-out in this design there is nothing to strategize, and deleting them removes the `check-activity-technique-overlap` exposure a merge would create (hazard H8).

### Resources — 12 retired, 1 new (23 → 12)

Retired: `impact-analysis.md`, `pattern-analysis.md`, `structural-inventory.md`, `drafting-plan.md`, `file-review-note.md`, `draft-attestation.md`, `design-assumptions.md`, `format-conventions.md`, `applicable-constructs.md`, `follow-ups.md` (already an orphan — a guide with no producing step, cited only by the map row `techniques/TECHNIQUE.md:83`), `findings-satellite.md`, `compliance-report.md`. New: `findings-register.md`.

Retained and load-bearing: `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md` (**not** a creation guide — `audit-expressiveness.md:32` names it "sole source of informal→formal construct mappings"), `convention-conformance.md`, `elicitation-guide.md`, `update-mode-guide.md`, `design-assumption-reconciliation.md`, `design-specification.md`, `scope-manifest.md`, `completion-artifact.md`, `readme-seed.md`, `README.md`.

Note the catalogue gap this exposes: **no entry Detects an orphaned creation guide.** AP-116 is unidirectional (filename → guide, `AP:1508`). The nearest coverage is AP-92's "dissolve the resource when nothing template-shaped remains" (`AP:1216`) and AP-129 for the stale roster line. So the 12 deletions must be executed by hand in the same commit; no guard will notice a miss.

### Variables — 63 → 34

Deleted (with `workflow.yaml` line): `has_resolvable_assumptions` :49 · `review_findings_count` :53 · `update_seeded_from_review` :57 · `expressiveness_finding_count` :61 · `conformance_finding_count` :65 · `rule_hygiene_finding_count` :69 · `enforcement_finding_count` :73 · `principle_finding_count` :77 · `anti_pattern_finding_count` :81 · `format_conventions_path` :113 · `applicable_constructs_path` :117 · `pattern_analysis_path` :121 · `impact_analysis_path` :125 · `draft_attestation_path` :133 · `report_path` :137 · `structural_inventory_path` :141 · `drafting_plan_path` :145 · `file_review_note_path` :149 · the seven `*_findings_path` :153-180 · plus `scope_manifest_confirmed`, `format_literacy_confirmed`, `schema_constructs_confirmed`, `assumption_decisions`, `open_assumptions`, `review_scope_confirmed`, `needs_audit_fixes`, `needs_recommit`, `operation_type_ambiguous`, `change_request_clear`.

The six per-pass counts are shadows of one authoritative fact — AP-112 `no-derived-state-shadow` (`AP:1454`) — and three of them carry producer tails in their descriptions (`:63` "from audit-expressiveness", `:71`, `:79`), which is AP-126 `variable-description-one-line` (`AP:1666`) live today.

New: `audit_base_ref`, `audit_file_set`, `audit_findings`, `coverage_ledger`, `audit_finding_count`, `verified_high_count`, `remediation_selected`, `audit_iteration`, `register_path`, `removal_disposition` (`flagged|restored`), `preservation_approved`, `publish_approved`, `schema_failures_accepted`, `drift_count`.

`review_scope_confirmed` deletion also fixes a live dead end: selecting `wrong-review-target` at Gate 1 (`01:74-80`) sets it false **and** `intent_needs_confirmation` true, which suppresses `announce-certain-review-scope`, so neither the review transition nor the `isDefault` transition is satisfiable. In the target, the review branch conditions on `operation_type` only.

Every deletion must be atomic with its reads — `check-binding-fidelity.ts:474-481` seeds producers from `workflow.yaml` `variables[]` (`:250-258`), so a deleted declaration with a surviving `{token}` read is a NEW hard violation; and stripping an output's `#### artifact` block removes the dead-output exemption at `:485` (hazard H4).

---

## 4. Canon constraints and how the design satisfies each

### The six explicitly named anti-pattern entries

**AP-69 `no-activity-prose-rules`** (`AP:918-928`) — zero-tolerance, empty carve-out. Target keeps **zero** activity `rules:` blocks (the corpus has none today; the only user is `meta/activities/02-resolve-target.yaml`). This is the hardest constraint on the merge, because every ordering guarantee that a deleted activity boundary carried must land in `steps[]` order / `when` / a checkpoint — never prose. Discharge table:

| Boundary deleted | What it guaranteed | New structural carrier |
|---|---|---|
| 01→03 | literacy before spec | Nothing to carry — it was `action: set` auto-confirm at `01:210-223`, unbacked by any gate; deleted with `context-loading`. |
| 03→04/05 | spec before survey | `frame` step order 4-7 precede 8, and `accumulated_design` is a declared input of `survey-target`. |
| 04/05→06 | survey before scope | Data dependency: `scope-definition.md:43-45,:54` requires the pattern table and the impact link. |
| 06→08 | draft before audit | `audit:1 reload-workflow` produces `audit_base_ref` from a **committed** ref; the sweep has no input without it. |
| 08→09 | audit before commit | **Inverted by design.** Commit is `draft:5`; audit-before-*publish* is carried by `land:5` reading `{register_path}` and `{verified_high_count}`. |
| 09→10 | commit before post-commit audit | Now `draft` → `audit` inside the graph. |
| 10/09→11 | audit clean before close-out | `close-out-session` declares `verified_high_count`, `coverage_ledger`, `preservation_approved` as inputs. |
| §3 pair | scope enumerated (06) → re-verified (09) | `frame:9-11` → `land:1` — still **two** activity boundaries apart, so AP-07 `scope-reverify-completion` (`AP:158`) is satisfied more strongly than today. |

**AP-114 `pass-orchestration-in-technique`** (`AP:1478-1488`) — its exemplar is literally this workflow: "``run-audit-passes`: Apply audit-expressiveness…". `audit-workflow-content` is not that. It contains **no Protocol `Apply [technique]` and no `::` work invoke**; it is one produce path over resources and tools — load homes → apply each entry as written → emit one product bag — which is the Do-not-flag carve-out at `AP:1486` verbatim ("a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag)"). The AP-114 Fix test also confirms the shape: moving each of `sweep-canon`, `verify-highs`, `compile-register`, `persist-register`, `author-fixes`, `record-fixes`, `revalidate-schema`, `recommit-fixes` to its own `steps[]` entry is exactly what the design does — they are eight steps, not eight Protocol phases of one op. `survey-target`, `prepare-workflow-branch`, `scope-verification` and `close-out-session` each satisfy the same carve-out.

**AP-68 `technique-stage-agnostic`** (`AP:906-916`) — the design *fixes* two live violations rather than inheriting them. `audit-anti-patterns.md:42` and `verify-high-findings.md:41` both read "Persist … via **the calling activity's** bound `manage-artifacts::write-artifact` step" — AP-68(a) hits, verified by direct read. In the target, `audit-workflow-content` and `verify-high-findings` declare `{audit_findings}` / `{verified_findings}` as Outputs with no persist phase and no mention of an activity, checkpoint, loop, or gate; the activity owns `persist-register`. `commit-verification.md:18` (six hard-coded `09` step ids) is rewritten for the same reason. AP-68 is also what makes the whole merge *cheap*: because techniques are stage-blind by mandate, moving 23 of them between four activities changes **no technique text**.

**AP-116 `no-template-creation-guide`** (`AP:1502-1512`) — the obligation is filename → guide, so dropping artifacts strictly reduces it. All 5 survivors map: `README.md` → `meta/resources/planning-readme.md` + `readme-seed.md`; `design-specification.md`, `scope-manifest.md`, `COMPLETE.md` → their 1:1 guides; `findings-register.md` → the new sectioned guide with `## Template` + operative `## Rules`. The shared-guide clause (`AP:1508`, "Shared satellites may share one guide") is what licensed the 7-satellite fan-out; §30 is what replaces it with one file.

**AP-121 `rule-as-protocol-step`** (`AP:1562-1572`) and **AP-25 `no-one-step-rules`** (`AP:382-392`) are inverses, and the audit stage sits exactly between them. Placement of the four sweep properties is decided by their tests:

| Property | Placement | Which test forces it |
|---|---|---|
| Mandatory base attribution | `## Rules` | Cross-cutting: constrains the walk, the verification, and the render. Passes AP-25's Do-not-flag ("Cross-cutting rules that span multiple phases"). Would be AP-121 as a Protocol phase — removing it leaves the work sequence intact. |
| Known-item exclusion | `## Rules` | Same test; it also governs `verify-high-findings` and `compile-findings-register`, so no single phase owns it. |
| Evidenced negatives | **Outputs** — `coverage_ledger`'s derivation criteria | §13 (`DP:65`) explicitly allows "Outputs may include derivation/recognition criteria". This dodges both AP-121 (not a Protocol step) and AP-25 (not a Rule). |
| Single context over the whole diff | **Structure only** — one step, no fan-out | AP-68: a technique may not name the dispatch shape. It is an activity fact. |

No Protocol phase in any new technique states a standing invariant; every phase has a distinct produce/transform/persist outcome. No `## Rules` entry constrains only one phase.

**AP-34 `no-valueless-control-set`** (`AP:494-504`) — the design has **zero** value-LESS control `set`s. Today there are three offenders totalling ten sets: `01:9-12` (`planning_folder_path`), `06:213-222` and `06:243-247` (4 sets each: `principle_finding_count`, `anti_pattern_finding_count`, `needs_audit_fixes`, `has_critical_finding`), plus `08:449-459` and `10`'s reassess steps. All are deleted because the walker declares those counts as **Outputs** — AP-34's Fix verbatim. The one surviving `set` family is checkpoint `effect.setVariable`, which is the single engine-applied effect (`activity.schema.ts:48`).

### The six explicitly named principles

**§12 Output Economy** (`DP:61`) — 20 artifact filenames → 5; one canonical home per fact (removals in the spec, findings in the register, close-out in `COMPLETE.md`); declared audience per AP-96; exception-only status — the four all-green announce steps (`08:143-162`, `:220-239`, `:297-316`, `:374-393`, ~19 YAML lines each to carry one bit) are deleted per AP-86 (`AP:1134`) and AP-87 (`AP:1146`); one close-out doc per AP-84; one decision per checkpoint per AP-88 — `08:77-105`'s `fix-issues` and `selective-fixes` have **byte-identical effects**, so they collapse into one option; statement-form messages with `[label]({path_variable})` links per AP-97 and AP-99. Nineteen announce-only steps go, including `05:28-37` which in a linearised create-mode path would emit "no content removals flagged ([impact analysis]({impact_analysis_path}))" with the path still `""`.

**§20 Keep Orchestration in Structure** (`DP:93`) — the count comes down by deleting steps and files, never by pushing sequencing into Protocols. Stage, checkpoints, transitions and graph progress live in four activity YAMLs; the four new techniques name no activity, no gate, no iteration, no position in the flow.

**§25 Bind Sibling Operations as Steps** (`DP:113`) — all multi-technique work is in `steps[]`. The audit stage is 11 steps in one loop body, not one fat op. This is the constraint that makes step count, not activity count, the honest metric: the map's arithmetic (126 top-level steps before, 126 after a pure merge) is correct, which is why this design deletes ~40 steps on independent grounds — 19 announce-only, 10 zero-effect checkpoints, the 2-step empty-attestation pair (`03:126-137`), the duplicate `compliance-review.md` bind (`08:62-76` vs `09:7-21`, identical filename, content, remap and gate), and the 8-step republish tail (`10:169-210`).

**§26 Atomic Techniques; Compose at Activities** (`DP:117`) — 23 techniques, each one capability's produce path; zero technique→technique work calls; composition entirely at activities. **I decline the borrow clause**, and that is the one place I diverge from the corpus map's conclusion. The map argued borrowing is "the only route to 9→4 that no principle blocks", because deleting boundaries deletes gates §9 requires. That holds only if all 13 checkpoints and all 126 steps must survive. Ten of the 16 checkpoints die on AP-89 (zero recorded effect), and ~40 steps die on AP-86/AP-87/AP-101/AP-38 — so the structure that needed a borrow to survive no longer exists. The two things §26/§18 exist to enable are respectively deleted (no fan-out) and already satisfied (10 cross-workflow ops bound by `::` path from activities). Borrowing would also add a real fragility: neither schema admits the string form — `WorkflowSchema.activities` is `z.array(ActivitySchema)` (`SRV/src/schema/workflow.schema.ts:88`) and `SRV/schemas/workflow.schema.json:422+` declares object items with `additionalProperties: false` — so borrows are invisible to `$schema` validation. Precedent declined with eyes open: `remediate-vuln/workflow.yaml:324-335` borrows 12 `work-package` activities; mechanics at `meta/activities/patterns/README.md:29-37`.

**§30 Resources at the Abstract Level; Split for Section Delivery** (`DP:133`) — two applications:
1. *The register.* One artifact, section-addressable: `findings-register.md#template` (skeleton), `#rows` (shared row shape + severity scale — §30's "Group shared fragments … under a single shared section"), and per-dimension anchors `#anti-patterns`, `#design-principles`, `#schema-constructs`, `#conventions`, `#schema-validation`, `#coverage-ledger`. `compile-findings-register` fetches only `#template`; nothing loads the whole guide to read one dimension. This delivers the per-pass context isolation the 7 satellites bought, at 1/7 the filenames. The discriminated shape is already anticipated: `findings-satellite.md:20` carries `**Pass:** {expressiveness | … | verified}` in its Template.
2. *The catalogue.* `anti-patterns.md` is **128,341 bytes**, above the 80,000-char eager cap (`SRV/src/utils/resource-delivery.ts:6`), so it can never be bundled — and `audit-anti-patterns.md:28` links the whole file with no anchor. The walker cites its 12 walkable sections by anchor (`## Structural` :78, `Interaction` :130, `Schema Expressiveness` :182, `Rule Hygiene` :306, `Description Hygiene` :394, `Coupling` :590, `Tool-Technique-Doc Consistency` :942, `Execution` :1018, `Output Economy` :1106, `Canon Hygiene` :1338, `Technique Protocol` :1402, `Authoring Guidance (MR)` :1622), which both `extractMarkdownSection` paths honour (`resource-delivery.ts:38-47`, `SRV/src/tools/resource-tools.ts:779-786`). The section list doubles as the coverage ledger's row key.

### The other constraints that bind, briefly

§3 (`DP:25`) enumerate→re-verify: `frame:9-11` → `land:1`, two boundaries apart. §4 (`DP:29`): Gate 1 stays first and hard. §5/AP-79: the inert `decisions` block is replaced by a real transition condition. §6 (`DP:37`): Detect criteria stay in `anti-patterns.md` / `design-principles.md` / `schema-construct-inventory.md` / `convention-conformance.md`; the walker walks, never re-authors — `audit-anti-patterns.md:29` already says "Do not restate, summarize, or number catalog entries". §7 (`DP:41`): divergence from the fine-grained sibling shape is justified by §15, not asserted — there is nothing in the library that owns "author a workflow definition", so there is nothing to borrow. §9 (`DP:49`): discharge table above. §10 (`DP:53`): **this proposal is itself a content-reducing update** and must run through workflow-design's own preservation gate with a flagged removal inventory — it is not self-authorizing. §11 (`DP:57`) + AP-40: `WD/README.md:13-21,:45-67,:180-188` and `WD/activities/README.md:13-77` are **rewritten**, not trimmed, and must contain no inventory counts. §13/AP-119: no HOW in any I/O entry — `compile-report.md:11-19`'s optional inputs described as "when the principles audit ran" are gone with the file (AP-125 too: `AP:1610` names that exemplar shape). §14 (`DP:69`): one authoritative count. §17 (`DP:81`) + AP-41: all four `outcome:` blocks authored from scratch in positive present — no "no longer runs six separate passes". §22 (`DP:101`): reduction by deletion only; nothing inlined. §23 (`DP:105`): the fix cycle survives at `audit:2f-2k`, and review mode now remediates in-session instead of restarting. §24 (`DP:109`): `frame:5b` stays an activity step. §27/AP-115/AP-123: no `audit::*` group is created, so the container-Capability constraints do not engage — and AP-70's Do-not-flag warns against "inventing a group for a hypothetical second cluster (YAGNI)". AP-129 (`AP:1700`): the ordering claim changes in `resources/README.md:12-35` and `:39-58`, `techniques/TECHNIQUE.md:70,:73-86`, `techniques/README.md:37,:40`, `WD/README.md`, `activities/README.md`, `readme-seed.md:30-46,:56,:60`, and `workflow.yaml:51,:87,:123,:127,:234` — **one edit, counted manifest**. AP-127 (`AP:1676`): no prose may say "the audit covers all N dimensions"; and per the catalogue's own Creation Rules (`AP:25`) nothing may cite the catalogue's entry count — which is also why the coverage ledger keys on section titles, not counts.

---

## 5. The audit-stage design

### How one sweep replaces six passes

Six walkers cover four homes, three of them on `anti-patterns.md`, and one — `audit-rule-enforcement` — is a whole technique, variable, artifact and four activity steps dedicated to a **single** catalogue entry (`audit-rule-enforcement.md:32-33` → `structure-backed-constraints`, `AP:1046`). AP-105 states the rule directly: "keep at most one walker per home (or a scoped thin walker that does not re-author criteria)" (`AP:1366`). §29's Separation test (`DP:129`) removes the objection: because these techniques *cite* rather than author, merging citers changes no criterion.

`audit-workflow-content`, shaped exactly as AP-105's Do-not-flag permits ("A thin scoped walker that loads a named section and applies each entry as written without restating Detect"):

- **Inputs:** `audit_file_set`, `audit_base_ref`, `known_findings`.
- **Protocol (four phases, each a distinct outcome per §15):** 1. Run the three validator scripts over `{audit_file_set}`. 2. Walk each canon home section-by-section, applying every entry as written — `anti-patterns.md` by its 12 section anchors, `design-principles.md` by principle heading, `schema-construct-inventory.md` by mapping table, `convention-conformance.md` by concern, plus the live sibling survey via `meta::workflow-engine::list-workflows` that `audit-conformance.md:37` requires. 3. Emit `{audit_findings}` rows tagged by dimension. 4. Emit `{coverage_ledger}`.
- **Outputs:** `audit_findings` (one row per finding: dimension, entry name, `file:line`, base attribution, offending content, fix), `coverage_ledger`, `audit_finding_count`, `has_critical_finding`.
- **Rules:** base attribution; known-item exclusion; do not restate or number catalogue entries; do not cite the catalogue's entry count.

What is *not* lost, because it is retained by name rather than by pass: the sibling-workflow survey (external evidence no diff sweep can synthesize); the **Pass / Partial / Violation per principle** verdict, which can flag a principle honoured *nowhere* — an absence, not a smell (`resources/README.md:13,:68`: principles cover families, the catalogue covers instances); and the expressiveness pass's positive before/after naming the substituting construct, which is why `schema-construct-inventory.md` must survive as a home even though its walker does not.

Worst-case audit invocations fall from **46 across three activities** (06 = 6, 08 = 16, 10 = 24, with the catalogue re-walked in each) to **≤3 in one activity**.

### Preserving the four properties that made the bare sweep effective

| Property | Structural carrier | Why it holds |
|---|---|---|
| **Mandatory base attribution** | `reload-workflow` produces `audit_base_ref` + `audit_file_set` as the sweep's declared inputs; `audit_findings`' row contract requires `file:line` **and** the base ref; `findings-register.md#rows` makes it a required column; `verify-artifact-conforms` (`land:2`) is the AP-95 verify op that fails an unattributed row. | Attribution is a declared Output field and a cross-cutting Rule, so it survives independently of any Protocol phase (AP-121-safe). It cannot be satisfied by prose because the register is machine-shaped agent state (AP-96, `AP:1264`: "agent state → structured one-row-per-item data"). |
| **Known-item exclusion** | `known_findings` is a declared **Input** of the sweep, bound from the prior `findings-register.md` rows and the repo baselines (`SRV/scripts/binding-fidelity-baseline.json`, 13 workflow-design entries). A `## Rules` entry excludes matched items. | Making it an Input, not a Protocol lookup, keeps it a bind contract (§13) and makes the exclusion set auditable. Today nothing excludes known items, which is why re-audits re-report the same 6 baselined dead outputs. |
| **Evidenced negatives** | `coverage_ledger`: one row per enumeration unit — the 12 catalogue section titles, the 30 principle headings, the 6 mapping tables, the 6 conformance concerns — each `walked` / `blocked`, never omitted. **§11's clause is the authority**: "a completeness verdict names the enumeration grounding it, not the instances inspected" (`DP:57`). Rows key on section titles, never counts (`AP:25`; `audit-anti-patterns.md:38`). Separately, `verify-high-findings` **annotates rather than filters**: its declared output already is a disposition set — "each High finding marked confirmed, downgraded, or withdrawn **with its re-derivation evidence**" (`verify-high-findings.md:14`) — and the register publishes withdrawals *with* the refutation, so the 8-vs-3 gap becomes visible instead of silent. | Today the verification is real (`refute-by-default`, `:45-47`) but invisible: it is bound only in `08` (`:50`, `:416`), its `verified_findings_path` is a dead variable (`workflow.yaml:169`), and `10`'s five post-commit passes and `06`'s pre-attestation pair run **no verification at all**. Binding it once inside the single loop covers every dimension — the highest-value structural change available, and one #321 does not mention. |
| **Single context over the whole diff** | One activity, one worker, one step: `sweep-canon` receives the entire `audit_file_set` with no fan-out and no `dispatch_child`. The loop carries no `when`/`condition`, so `collectUngated` (`workflow-tools.ts:713-719`) admits its body and the sweep/verify/compile/persist chain arrives **eager-bundled in the single `get_activity`** instead of as ~27 sequential `get_technique` round trips (today `08` has 27 technique steps and **0** eager-eligible, because every top-level step carries a `condition` and both loops are `condition`-gated). | This is the property the 6-pass fan-out destroyed: cross-file and cross-construct findings (AP-38, AP-93, AP-129, AP-107) are only visible to an agent holding the whole surface. §18's fan-out preference (`DP:85`) is not engaged, because there is no fan-out to prefer a pattern for. |

---

## 6. Dispatch count and token budget

**Dispatches: 4 nominal, 6 worst case.** One `get_activity` per activity; the audit loop's up-to-3 iterations run in the **same** worker context (that is property four). Worst case adds one `draft` re-entry from the `has_critical_finding` back edge and one `land` re-entry from Gate 2.

**Per-dispatch fixed floor.** `CORE_WORKER_TECHNIQUES` — 7 ops (`SRV/src/loaders/core-ops.ts:52-62`) — plus inherited `techniques.activity: [variable-binding]` (`workflow.yaml:19-21`) ride every `get_activity` in full mode (`workflow-tools.ts:645-650`): ≈16 KB raw before composition, ≈4k tokens. Reference-mode collapse is invalid for fresh workers (`:588-590`), so 12 dispatches paid this 12×; 4 pay it 4×. That alone is ≈32k tokens saved.

**Activity YAML is delivered verbatim** (`readActivityRaw` → body, `:608-611`, `:941`): 65,748 bytes / 1,935 lines across 9 files today, of which 698 lines (36%) are structured `condition:` blocks — 282 of 531 (53%) in `08` alone. Target: 4 files, ~610 lines, ~21 KB, because ~40 steps are deleted and every remaining gate is a `when` one-liner. `when` and `condition` gate identically for the agent, for manifest validation (`validation.ts:79-82`) and for bundling (`workflow-tools.ts:715`); `condition` is load-bearing **only** on a checkpoint needing `condition_not_met` dismissal (`activity.schema.ts:75`; `workflow-tools.ts:1186-1192`) — and none of the six target checkpoints uses dismissal.

| Stage | Dominant inputs | Estimate |
|---|---|---|
| `frame` | activity YAML, `elicitation-guide`, `update-mode-guide`, structural inventory of the target, sibling survey | 60–90k |
| `draft` | per-file authoring + review over `{file_count}` files; **no catalogue load** (the `06:177-192` pre-attestation pair is deleted, folded into the one post-commit sweep) | 150–200k |
| `audit` | catalogue ≈32k (128,341 B) + 3 smaller homes ≈5k + whole committed surface 15–25k; iteration 1 ≈120k, iterations 2–3 re-read only changed files ≈40k each | 200–300k |
| `land` | activity YAML, scope reconciliation, README, PR | 40–60k |

**Total ≈ 450–650k, centred on ~550k across 4 dispatches** — a ~60% cut from 1,430,000/12, and the audit stage alone (~250k) covers strictly more than the bare two-agent sweep's 410k: same whole-surface catalogue + principles coverage, plus schema validation, conformance-vs-siblings, verification-with-evidence, and remediation.

Where the old 1.43M went, and what removes it: (a) 46 worst-case audit invocations re-walking a 128 KB catalogue across three activities — now ≤3 in one; (b) 12× the ops floor plus 9 activity bodies redelivered — now 4×; (c) 112 technique steps of which only 31 (28%) were eager-eligible, so ~81 sequential `get_technique` fetches — now most of the audit body arrives in one bundle; (d) 27 `write-artifact` round trips against 20 filenames — now 5.

---

## 7. The three biggest risks in this design

**1. Sweep coverage is self-attested by the agent that may have run out of room.** The single-context property is exactly what makes coverage unverifiable: one worker holds the whole surface *plus* a 128 KB catalogue *plus* up to three iterations of findings. If it degrades, `coverage_ledger` is written by the same degraded agent. The ledger's "blocked, not omitted" rule and per-iteration register persistence limit the damage, and section-anchored fetches keep any single load small — but nothing structurally verifies that all 12 catalogue sections were actually applied. This is the one thing the 6-pass fan-out genuinely bought, and I am trading it for cross-file findings and 60% of the token bill. The honest mitigation is a cheap external check that every enumeration unit appears as a ledger row — a guard that does not exist in `SRV/scripts` today.

**2. Commit-before-approval rests on a reversibility judgement, and every bound that protects it is agent-honoured.** Moving Gate 2 to `mark-ready` is correct only while the commit is genuinely reversible: session worktree, feature branch, draft PR. If any target repo runs CI on push, or the PR is created non-draft, unapproved content has escaped — and §8's confirmation is no longer sited at the first irreversible act. Worse, nothing server-side bounds the consequences: `maxIterations`, `breakCondition` and `when` are all agent-evaluated (`activity.schema.ts:144-145`; `SRV/schemas/README.md:34`), `blocking: true` is advisory (`:111`, `:129`), step order is a warn-only subsequence check (`validation.ts:104-115`), `transitionTo` is recorded but not enacted (`activity.schema.ts:50`), and a self-transition is legal and unwarned (`validation.ts:39`). The only genuinely server-enforced gate in the whole design is a *yielded* checkpoint, which blocks every other tool via `state.activeCheckpoint` (`workflow-tools.ts:329`, `:600`, `:1295`; `resource-tools.ts:590`, `:771`).

**3. The migration breaks six live sessions and silently kills the one narration surface that replaces the deleted checkpoints.** All 9 activity ids disappear or move, and `get_activity` throws `Activity not found` with no fallback (`workflow-tools.ts:602-609`) for QDDWIT (at `intake-and-context`) and five other running sessions (at `quality-review`/`retrospective`), while `get_workflow_status` keeps reporting the dead id as healthy (`:1358`, `:1392`) — hazard H1, mitigable only by a session rewriter that also re-keys `checkpointResponses` from `<old-act>-<cp>`. Compounding it: this design deletes all 11 soft checkpoints and 19 announce steps, so planning-README Progress becomes the user's only in-session visibility — and renumbering to `01-04` desyncs the `@` column from the derived `{artifact_prefix}`, after which `sync-progress-status` matches zero rows and returns `{rows_updated}: 0` with **no error path** (`sync-progress-status.md:45-47`; `meta/resources/planning-readme.md:77`, `:88-91`), and no validator cross-checks `readme-seed.md:30-46` against the activity filenames. The failure mode is a session that reports nothing and gates nothing until Gate 2.
