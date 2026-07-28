BASE = `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation`
SRV = `/home/mike1/projects/dev/workflow-server`

Everything below is verified by read. Four facts I established myself that change the design space and were not in the map:

1. **The eager-resource loop has NO cumulative budget** — only a per-resource 80,000-char cap (`SRV/src/tools/workflow-tools.ts:798-830`; `SRV/src/utils/resource-delivery.ts:6`). The cumulative `context_tokens × 0.8 × 4` budget (`:706-710`, `SRV/src/config.ts:135-136`) applies to *technique bodies only*. So a technique that links N resource sections gets all N delivered inside one `get_activity` response, unbounded in aggregate.
2. **A loop whose iteration test is `breakCondition` (not `condition`) keeps its body eager-bundle-eligible.** `collectUngated` skips on `when`/`condition` then recurses into loops (`:713-719`); `breakCondition` and `maxIterations` are not gates. Today `08-quality-review.yaml:470-476` puts the while-test in `condition:`, which is why all 27 of its technique steps are ineligible.
3. **Directory scan and an explicit `activities:` list are ADDITIVE** (`SRV/src/loaders/workflow-loader.ts:257-289`): local files load first, then string refs are appended, deduped by id. Verified live — `remediate-vuln` loads 1 local + 14 borrowed = 15 and passes `validate-workflow-yaml.ts`. So workflow-design can add one borrow line without enumerating its own files.
4. **`extractMarkdownSection` slices by heading slug at any level and stops at the next same-or-higher heading** (`SRV/src/utils/resource-ref.ts:86-120`), and `extractResourceIds` preserves `#anchor` (`:70-91`). `anti-patterns.md`'s 13 `##` sections (`:15, 78, 130, 182, 306, 394, 590, 942, 1018, 1106, 1338, 1402, 1622`) are therefore already valid delivery units — no file split needed, only anchored links.

Together these mean: **the 128,341-byte catalogue can be delivered eagerly, in full, in one round trip, to a worker whose fix loop is also eagerly bundled.** That is the design.

---

# 1. Target activity list

**4 locally authored activities + 1 borrowed = 5 graph nodes.** Filename id segment equals declared `id:` in every case (mandatory: `getActivity` matches the YAML `id` at `SRV/src/loaders/workflow-loader.ts:426-428` but `readActivityRaw` — the path `get_activity` uses — matches the filename-derived id at `:570`; divergence passes every validator then fails at runtime). Prefix orders the list (`:91-93`).

No activity declares `rules:` (AP-69, zero carve-out). No activity declares `artifacts[]` (AP-31, `anti-patterns.md:458`). `bundleTechniques` is omitted everywhere — the automatic budget is what I want, and `maxChars: 0` would suppress the resource map that carries the criteria (`workflow-tools.ts:704, 711, 792`).

## A1 — `01-intake.yaml`, id `intake`, prefix 01, `required: true`

Purpose: classify the operation and settle every mode variable at one hard gate, **so that no downstream technique step needs a `when`/`condition`** — gating is the on/off switch for eager delivery, so the mode branch belongs on this node's transitions, not on 40 steps.

| # | kind | bound technique / body |
|---|---|---|
| 1 | technique | `intake-classification` → `operation_type`, `operation_type_ambiguous`, `change_request_clear`, `intent_needs_confirmation`, `headless_mode`, `workflow_id`, `target_workflow_id`, `target_workflow_ids`, `review_target_count`, `change_category`, `structural_inventory` (in-session value only — artifact block and `structural_inventory_path` deleted; the value must survive because `synthesize-update-specification.md:20-22` declares it required) |
| 2 | **checkpoint** | `design-intent` |
| 3 | technique | `context-loading` (§2's demonstration; both `#### artifact` blocks and both `_path` outputs deleted) |
| 4 | technique | `workflow-engine::create-readme` (`seed_profile: workflow-design/readme-seed`) — now **ungated**; review mode needs a planning folder for its register too |
| 5 | technique | `impact-analysis` — `when: operation_type != "create"` → `removal_count`, `#impact` section of the design record |
| 6 | **checkpoint** | `preservation-check` |

Checkpoints:

| id | Gate type | Mechanics |
|---|---|---|
| `design-intent` | **hard interactive** | `blocking: true`, no `defaultOption`, no `autoAdvanceMs`; `condition: intent_needs_confirmation == true` present so `respond_checkpoint condition_not_met` is legal (`workflow-tools.ts:1186-1192`); all 4 options carry `effect.setVariable`. §4's structural home, before any execution. |
| `preservation-check` | **hard interactive, conditional** | `condition: removal_count > 0`; `blocking: true`, no default/auto; every option carries `effect.setVariable removals_approved` (today `06:139-162` has **zero** effects — AP-89). §8 + §10's home, now *before* drafting, which is where §10 actually needs it. |

Transitions: `to: isolated-fan-out` when `operation_type == "review" AND review_target_count > 1`; `to: audit` when `operation_type == "review"`; `to: design-and-draft`, `isDefault: true`.

## A2 — `02-design-and-draft.yaml`, id `design-and-draft`, prefix 02, `required: true`

`techniques: [scatter-gather]` (activity-level, bound at no step — AP-36/`check-activity-technique-overlap.ts:74` clean).

| # | kind | bound technique / body |
|---|---|---|
| 1 | technique | `derive-design-dimensions` → `design_dimensions` |
| 2 | loop | `dimension-elicitation` · `forEach current_dimension over design_dimensions` · `maxIterations: 12` · `when: operation_type == "create"` — body: `prepare-dimension` → **action** `surface-dimension-questions` (message `{dimension_questions}`; §24 — techniques are session-blind) → `capture-dimension` |
| 3 | technique | `synthesize-update-specification` — `when: operation_type == "update"` → `accumulated_design` |
| 4 | technique | `pattern-analysis` → `#patterns` section (ungated: §15 co-aspect survey; also grounds the conformance survey) |
| 5 | technique | `work-package::review-assumptions::collect` → `assumptions_log` |
| 6 | loop | `assumption-reconcile` · `while` · `breakCondition: has_resolvable_assumptions == false` · `maxIterations: 3` — body: `reconcile-design-assumptions` (today `03:101-113` is the corpus's only `while` with **no** `maxIterations`) |
| 7 | technique | `scope-definition` → `scope_manifest`, `file_count`, `#scope-manifest` section |
| 8 | technique | `work-package::manage-artifacts::write-artifact` (`design-record.md`) → `design_record_path` |
| 9 | **checkpoint** | `scope-and-structure-confirmed` |
| 10 | technique | `derive-workflows-target-path` → `target_path` |
| 11 | technique | `prepare-workflow-branch` → `workflow_branch`, `worktree_created` |
| 12 | loop | `file-drafting` · `forEach current_file over scope_manifest` · `maxIterations: 50` · **ungated** — body: `yaml-authoring` → `review-drafted-file` (→ `has_unflagged_removals`) → **checkpoint** `file-review#{current_file.path}` |
| 13 | technique | `verify-artifact-conforms` → `artifact_conformance` (absorbs `review-draft-yaml.md:51-52`'s binding-fidelity pass) |

Checkpoints:

| id | Gate type | Mechanics |
|---|---|---|
| `scope-and-structure-confirmed` | **soft, effect-bearing** | `defaultOption: confirmed` + `autoAdvanceMs: 30000`; `confirmed` sets `scope_manifest_confirmed: true`; the non-default `revise` sets it false **and** carries `effect.transitionTo: design-and-draft` (self). Today (`06:36-51`) selecting `revise` silently skips the drafting loop *and* all 20 non-review steps of `08`, then commits unaudited — the self-loop turns that into a declared edge (§9). |
| `file-review#{current_file.path}` | **soft, instance-qualified** | `defaultOption: accepted` + `autoAdvanceMs: 30000`; options carry `effect.setVariable`. The `#` instance qualifier is mandatory inside a loop: `yield_checkpoint` replays a stored response for `${activity}-${checkpoint}` **without prompting** (`workflow-tools.ts:978-1022`), resolved back to the base definition by `checkpointBaseId` (`workflow-loader.ts:438-464`). None of workflow-design's 16 checkpoints does this today; three sit inside a `maxIterations: 50` loop. |

Transitions: `to: audit`, `isDefault: true`.

## A3 — `03-audit.yaml`, id `audit`, prefix 03, `required: true`

Purpose: one whole-surface sweep over the change, verified, registered, reported, and remediated in a bounded intra-activity loop, then gated. **Every technique step is ungated and the fix loop uses `breakCondition`, so this activity's entire technique and resource payload arrives in one `get_activity` response.**

| # | kind | bound technique / body |
|---|---|---|
| 1 | technique | `reload-workflow` |
| 2 | technique | **`audit-workflow-surface`** (new) → `audit_findings`, `audit_coverage`, `audit_finding_count`; links all 13 `anti-patterns#…` sections + `design-principles.md` + `schema-construct-inventory.md` + `convention-conformance.md` |
| 3 | technique | `audit-schema-validation` → `pass_count`, `fail_count` (gains `--root {target_path}` — see risk R3) |
| 4 | technique | `scope-verification` → `total_count`, `addressed_count`, `unaddressed_count` (§3's re-verify end, moved *before* the approval that commits) |
| 5 | technique | `verify-high-findings` → recalibrated `audit_findings`, `verified_high_count` |
| 6 | technique | `write-artifact` (`findings-register.md`) → `findings_register_path` |
| 7 | technique | **`compile-review-report`** (new; merges `compile-report` + `summarize-findings`, AP-110) → `compliance_report`, `review_findings_count`, `needs_audit_fixes`, `has_critical_finding` |
| 8 | technique | `write-artifact` (`review-report.md`) → `report_path` |
| 9 | loop | `fix-cycle` · `loopType: while` · `breakCondition: needs_audit_fixes == false` · `maxIterations: 2` · **no `when`/`condition`** — body: `yaml-authoring` → `apply-audit-fixes` → `audit-workflow-surface` → `audit-schema-validation` → `verify-high-findings` → `write-artifact` (`findings-register.md`) → `compile-review-report` |
| 10 | **checkpoint** | `review-disposition` |
| 11 | **checkpoint** | `approve-to-commit` (Gate 2) |
| 12 | *(activity-level `decision`)* | `blocker-gate` |

Checkpoints and the decision:

| id | Gate type | Mechanics |
|---|---|---|
| `review-disposition` | **hard interactive, conditional** | `condition: operation_type == "review"`; `blocking: true`, no default/auto. Two options only: `fix-issues` (`setVariable operation_type: update, update_seeded_from_review: true`; `transitionTo: intake`), `report-only` (`setVariable review_closed: true`). Today's third option `selective-fixes` (`08:99-105`) has a **byte-identical effect** to `fix-issues` — AP-88 collapse. |
| `approve-to-commit` | **hard interactive, conditional** (Gate 2) | `condition: operation_type != "review"`; `blocking: true`, no default/auto. Batches `[report]({report_path})`, `[register]({findings_register_path})`, `[design record]({design_record_path})`, `{has_open_assumptions}`, `{fail_count}`, `{unaddressed_count}`, `{audit_finding_count}` (AP-97 link discipline). Options: `approved` (`setVariable commit_approved: true`), `defer-remaining` (`setVariable commit_approved: true, deferrals_recorded: true`), `return-to-draft` (`transitionTo: design-and-draft`), `correct-intent` (`transitionTo: intake`). |
| `blocker-gate` | **declarative decision** (advisory — no server code evaluates a branch; `getValidTransitions` only widens the legal set, `workflow-loader.ts:472, 500-507`) | branches: `has-blocker` (`has_critical_finding == true` → `transitionTo: design-and-draft`), `no-blocker` `isDefault`. Its real work is legalising the back edge. |

Transitions: `to: land-and-close` when `commit_approved == true`; `to: __terminal__` when `review_closed == true` (`TERMINAL_SENTINEL` is legal from anywhere, `SRV/src/utils/validation.ts:42`).

**There is no automatic `audit → intake` back edge.** Today `10:220-226` re-enters intake whenever the remedia loop exhausts, with no attempt counter in 63 variables — an unbounded cycle over the whole graph. Here, exhaustion after `maxIterations: 2` surfaces as a *human choice* at Gate 2 (`defer-remaining` vs `return-to-draft`). Every cross-node cycle is a recorded checkpoint effect.

## A4 — `meta/patterns/04-isolated-fan-out.yaml` (**borrowed**, id `isolated-fan-out`, prefix 04, `required: false`)

Added to `workflow.yaml` as a single string entry in a new `activities:` list — the dir scan still finds the four local files (`workflow-loader.ts:257-289`). Reached only from `intake` when `operation_type == "review" AND review_target_count > 1`.

Verified body (6 steps, **all ungated → all eager-bundled**): `orchestration-patterns::decompose-work-units` → `compose-worker-briefs` (`isolation_mode`) → `dispatch-workers` (`concurrency`) → `gather-results` (`expected_ids: work_units`) → action `require-complete` (`action: validate` on `gathered_results.completeness`) → `synthesise-results`. Declares `techniques: [scatter-gather]`.

Each fanned worker runs `audit-workflow-surface` against one target and returns one register section; `synthesise-results` merges them. This deletes `08:7-61`'s `forEach over target_workflow_ids` (max 20) which writes `principle-findings.md`, `anti-pattern-findings.md` and `verified-findings.md` with fixed bare filenames **inside** the loop — so a 3-target review currently leaves only target 3's satellites, and `review-disposition`'s "{review_findings_count} findings across {target_workflow_ids}" reports the last target's count as the total. §18 (`design-principles.md:85-87`) and AP-110 (`anti-patterns.md:1430`) both name the borrow as the preferred fix. Checkpoints: none. Transitions: **none declared in the borrowed file** — see risk R2.

## A5 — `05-land-and-close.yaml`, id `land-and-close`, prefix 05, `required: true`

Purpose: commit, verify against the post-commit tree, publish, close out. **The post-commit boundary that `reload-workflow.md:8` ("Fresh post-commit workflow definition as the audit baseline") and `scope-audit.md:20` ("the committed diff") require is a step position, not an activity boundary** — which is what dissolves the map's "fatal Contradiction 1".

| # | kind | bound technique |
|---|---|---|
| 1 | technique | `readme-authoring` → `workflow_readme` |
| 2 | technique | `workflow-engine::verify-readme-conforms` |
| 3 | technique | `version-control::commit-regular-files` |
| 4 | technique | `commit-verification` |
| 5 | technique | `reload-workflow` — **post-commit baseline** |
| 6 | technique | `audit-workflow-surface` — post-commit delta sweep with `{known_findings}` = the register |
| 7 | technique | `scope-audit` → `scope_drift_findings` (now persisted as a register section; today it is a baseline-recorded dead output, never read) |
| 8 | technique | `verify-high-findings` |
| 9 | technique | `write-artifact` (`findings-register.md`) — find-or-update, adds the `#post-commit` section |
| 10 | technique | `compile-review-report` → `needs_audit_fixes`, `needs_recommit` |
| 11 | loop | `post-commit-fix-cycle` · `while` · `breakCondition: needs_audit_fixes == false` · `maxIterations: 2` · ungated — body: `yaml-authoring` → `apply-audit-fixes` → `audit-workflow-surface` → `audit-schema-validation` → `commit-regular-files` → `commit-verification` → `compile-review-report` |
| 12 | technique | `version-control::push-branch` |
| 13 | technique | `publish-workflow-pr` → `title`, `body` |
| 14 | technique | `github-cli-protocol::create-pr` (`as_draft: true`) |
| 15 | technique | `github-cli-protocol::mark-ready` |
| 16 | technique | `create-completion-doc` → `completion_document` |
| 17 | technique | `conduct-retrospective` → retrospective **section of the same document** |
| 18 | technique | `write-artifact` (`COMPLETE.md`) → `completion_path` |
| 19 | technique | `work-package::manage-git::remove-worktree` — `when: worktree_created == true` |

**Checkpoints: none.** The three soft checkpoints this replaces (`09:validation-passed`, `09:scope-verified`, and `05:impact-and-preservation-confirmed`) all have **zero effect on any option** and auto-advance in 30 s — pure AP-89, and two of them auto-approve consequential situations (`validation-passed` fires only when `fail_count > 0` and auto-selects *proceed to commit*; `scope-verified` fires only when `unaddressed_count > 0` and auto-confirms). Their facts are now encoded as structure upstream: `fail_count` and `unaddressed_count` feed `has_critical_finding`, which routes `blocker-gate`, and both appear in Gate 2's batch payload — **before** the irreversible act, which is where §8 wants the confirmation. Publish is bound once (today the entire 7-technique tail is bound twice, `09:78-224` and `10:169-210`).

Transitions: `to: __terminal__`.

---

# 2. Target artifact list — 5

| Bare filename | Creation guide (§28) | Named reader | Decision it feeds |
|---|---|---|---|
| `README.md` (planning) | `meta/resources/planning-readme.md` Template + `readme-seed.md` | the human owner; and `sync-progress-status` — the **sole** Progress-status writer (`meta/techniques/workflow-engine/sync-progress-status.md:60`) | run-level progress/blocked/skip visibility. Non-cuttable per §11 (`design-principles.md:57-59`) and mapped at `resources/README.md:43`. |
| `design-record.md` | `design-record.md` (new; §30-sectioned: `#skeleton`, `#intent`, `#impact`, `#patterns`, `#specification`, `#scope-manifest`, `#assumptions`, `#per-file`) | the human at `approve-to-commit`; `scope-definition`, `scope-verification` and `scope-audit`, which each fetch only `design-record#scope-manifest` | Gate 2 approval; and both ends of §3's enumerate→re-verify pair, which now cite the same anchor. Replaces 6 satellite files (`design-specification.md`, `impact-analysis.md`, `pattern-analysis.md`, `scope-manifest.md`, `drafting-plan.md`, `file-review-note.md`) + `structural-inventory.md` + `draft-attestation.md`. |
| `findings-register.md` | `findings-register.md` (new; sectioned `#skeleton`, `#anti-patterns`, `#principles`, `#expressiveness`, `#conformance`, `#schema-validation`, `#scope-drift`, `#post-commit`, `#coverage`, `#excluded`) | **agent-state** (`audience: agent`, AP-96 `anti-patterns.md:1254`): `verify-high-findings`, `compile-review-report`, `apply-audit-fixes` (`{selected_findings}`), and every subsequent sweep as `{known_findings}` | the two fix loops' `breakCondition`; `has_critical_finding` → `blocker-gate`; known-item exclusion on re-walks. One row per finding, updated in place (AP-91 `:1194`). Replaces all 7 satellites, which already share one guide (`resources/README.md:58`). |
| `review-report.md` | `compliance-report.md` (survives, retitled — it already covers two filenames at `compliance-report.md:13`) | the human at `review-disposition` (review mode) and at Gate 2 (create/update) | review-disposition (fix vs report-only) and approve-to-commit. **Links** register anchors; copies no rows (AP-85 `:1122`, AP-94 `:1230`). Replaces `compliance-review.md` + `post-update-review.md`, whose duplicated persist steps (`08:62-76` ≡ `09:7-21`, byte-identical) collapse to one. |
| `COMPLETE.md` | `completion-artifact.md` | the human owner; the next session's `intake-classification` | nothing in-run — the single close-out (AP-84 `:1110`) with the retrospective as a **section**, which is AP-84's own do-not-flag (`:1118`). Fixes the live mismatch: every canon layer says `COMPLETE.md` but both bind sites pass `bare_filename: completion.md` (`11-retrospective.yaml:20, :36`), so the seeded README's `[Close-out (COMPLETE.md)](COMPLETE.md)` never resolves. |

Plus one borrowed-capability artifact I do not count as workflow-design's: `assumptions-log.md`, produced by `work-package::review-assumptions::record` against `design-assumptions.md`.

`write-artifact` bind sites: **27 → 8** (design-record ×1, findings-register ×3, review-report ×1, COMPLETE ×1, README via `create-readme` ×1, assumptions-log ×1). Distinct bare filenames: **20 → 5** (+1 borrowed). Note #321's "17" is the `readme-seed.md:30-46` progress-row count, of which only 12 are artifacts; the real number is 20 across 27 bind sites.

---

# 3. Retirement list

**Activities.** Delete 6 files: `03-requirements-refinement.yaml`, `04-pattern-analysis.yaml`, `05-impact-analysis.yaml`, `08-quality-review.yaml`, `10-post-update-review.yaml`, `11-retrospective.yaml`. Rename 3: `01-intake-and-context.yaml`→`01-intake.yaml`, `06-scope-and-draft.yaml`→`02-design-and-draft.yaml`, `09-validate-and-commit.yaml`→`05-land-and-close.yaml`. Create 1: `03-audit.yaml`. Nine ids retire, four are minted, one is borrowed.

**Techniques: 37 → 28.** Delete 11:

| File | Why |
|---|---|
| `audit-rule-hygiene.md` | scopes to `## Rule Hygiene Anti-Patterns` only (`:82`) — a strict subset of a walk `audit-anti-patterns.md:33` already performs in full. AP-105 (`anti-patterns.md:1366`). |
| `audit-rule-enforcement.md` | an entire pass, variable, artifact and 4 activity steps for **one** catalogue entry (`:127`). AP-105. |
| `audit-expressiveness.md`, `audit-conformance.md`, `audit-principles.md`, `audit-anti-patterns.md` | fold into `audit-workflow-surface`; their homes survive untouched (§29 Separation test). |
| `assemble-file-approach.md` | sole purpose is `drafting-plan.md`; its only path read is inside a checkpoint that is *both* `blocking: false`+30 s auto **and** gated `operation_type != update` (`06:88-96`). |
| `review-draft-yaml.md` | sole purpose is `draft-attestation.md`; `draft_attestation` and `reviewed_blocks` are baselined dead outputs. Relocate `:51-52` binding-fidelity pass into `verify-artifact-conforms` **first**. |
| `persist-design-specification.md` | a wrapper around a bind it does not perform — its Protocol `:30` delegates to the calling activity's `write-artifact` step, which is `03:65-72`. |
| `summarize-findings.md`, `compile-report.md` | AP-110 duplicate pair: same guide (`compile-report.md:24` ≡ `summarize-findings.md:24`), same output variable, split only by mode → one `compile-review-report`. |

Add 2: `audit-workflow-surface.md`, `compile-review-report.md`.
Reduce 6 (surgery, not deletion): `intake-classification` (drop §4/§5 `:83-90` + `structural_inventory_path` output `:56-58`; **keep `structural_inventory`**), `context-loading` (drop §6/§7 `:52-60` + both outputs `:10-26`), `review-drafted-file` (drop §2 `:45-48`; **keep `has_unflagged_removals`** — it is the sole gate on the `preservation-check` safety checkpoint), `impact-analysis`/`pattern-analysis`/`scope-definition` (persist phase becomes a design-record section cite).
Rewrite in all 7 survivors that carry it: the clause "via **the calling activity's** bound `manage-artifacts::write-artifact` step" (`audit-anti-patterns.md:42`, `audit-principles.md:80`, `audit-expressiveness.md:123`, `audit-conformance.md:48`, `audit-rule-hygiene.md:94`, `audit-rule-enforcement.md:139`, `verify-high-findings.md:181`) is an existing AP-68(a) hit — it names the calling activity from inside a technique.

**Resources: 23 → 13 (+ index README = 14).** Delete 12: `drafting-plan.md`, `file-review-note.md`, `draft-attestation.md`, `format-conventions.md`, `applicable-constructs.md` (already broken — **zero** citations anywhere in the corpus), `structural-inventory.md`, `design-specification.md`, `impact-analysis.md`, `pattern-analysis.md`, `scope-manifest.md`, `findings-satellite.md`, `follow-ups.md` (already orphaned — a creation guide with no producing step, cited only by the map row `techniques/TECHNIQUE.md:83`). Add 2: `design-record.md`, `findings-register.md`. Restructure 1: `anti-patterns.md` — anchor-address its 13 existing `##` sections, no file split (see §4/§30). Keep: `design-principles.md`, `anti-patterns.md`, `schema-construct-inventory.md`, `convention-conformance.md`, `elicitation-guide.md`, `update-mode-guide.md`, `design-assumption-reconciliation.md`, `design-assumptions.md`, `compliance-report.md`, `completion-artifact.md`, `readme-seed.md`.

> **`schema-construct-inventory.md` must survive.** It is not a creation guide — `resources/README.md:14` files it as mapping tables and `audit-expressiveness.md:112` names it "sole source of informal→formal construct mappings". Dropping it retires a capability, not an artifact. Same for `compliance-report.md`.

**Variables: 63 → ~46.** Delete 27:

- *Already dead* (4): `format_conventions_path` `:113`, `applicable_constructs_path` `:117`, `verified_findings_path` `:169`, `open_assumptions` `:235`.
- *Six per-pass counts → one* `audit_finding_count`: `:61, :65, :69, :73, :77, :81`. Note three carry AP-126 producer tails ("…from audit-expressiveness" `:63`, `:71`, `:79`).
- *Six findings paths → one* `findings_register_path`: `:153, :157, :161, :165, :173, :177`.
- *Eight artifact paths → one* `design_record_path`: `specification_path` `:109`, `pattern_analysis_path` `:121`, `impact_analysis_path` `:125`, `scope_manifest_path` `:129`, `draft_attestation_path` `:133`, `structural_inventory_path` `:141`, `drafting_plan_path` `:145`, `file_review_note_path` `:149`.
- *Provably unused* (3): `assumption_decisions` `:45` (zero reads; its two producing steps `03:126-137` pass the literal `[]` and the step's own message admits it), `format_literacy_confirmed` `:198` + `schema_constructs_confirmed` `:202` (their only consumer was the `01→03` transition condition — AP-88's Fix: "delete variables whose only consumer was the removed checkpoint's condition").

Add 10: `audit_finding_count`, `findings_register_path`, `design_record_path`, `review_target_count`, `commit_approved`, `review_closed`, `removals_approved`, plus the fan-out seeds `isolation_mode`, `concurrency`, `work_units`, `gathered_results`. **Drop the borrow and it is 63 → 42.**

**Steps: 126 top-level → ~72.** All of the reduction is deletion, none is relocation into techniques: 19 announce-only steps (`01:89-108, 128-157`; `03:86-90, 114-123`; `05:28-37`; `08:143-182, 220-259, 297-336, 374-413`; `09:38-53, 86-101, 225-229`; `10:159-168`), 15 persist steps collapsing to 8 find-or-update binds, 10 zero-effect soft checkpoints, the 2-step empty-attestation pair, the duplicate `compliance-review.md` bind, and the 8-step republish tail. `08-quality-review.yaml:120-413` alone is **294 of 531 lines** of satellite-persist + per-pass clean/flagged triads.

---

# 4. Canon constraints and how the design satisfies them

## The twelve named

**AP-68 `technique-stage-agnostic`** (`anti-patterns.md:906-916`). `audit-workflow-surface` names no stage, activity, checkpoint, loop, transition, or timing, and prescribes no user confirmation. It declares `{audit_findings}`, `{audit_coverage}`, `{audit_finding_count}` and an `#### artifact` block — values the activity routes on, which is AP-68's do-not-flag verbatim. It does **not** carry the "via the calling activity's bound write-artifact step" clause that all six current audit techniques carry. AP-68 is also *why the merge is cheap*: because techniques are stage-blind by mandate, relocating six walkers' criteria into one node changes zero technique text about position.

**AP-69 `no-activity-prose-rules`** (`:918-928`, literally empty carve-out). Zero `rules:` blocks across all four files. Every constraint that today lives on an activity boundary re-lands as structure: step order (sweep → verify → register → report → Gate 2 → commit), `breakCondition` + `maxIterations` on both fix loops, checkpoint `condition` (mode divergence), `effect.setVariable` (`commit_approved`, `review_closed`, `scope_manifest_confirmed`, `removals_approved`), the `blocker-gate` `decision`, and `transitions`. Two schema facts make this free: activity `rules[]` items are `type: string` only with **no `{ref}` variant** (contrast `RuleEntrySchema`, `SRV/src/schema/workflow.schema.ts:38-43`) so they cannot be fragment-deduped; and **no server code reads them** — `get_activity` injects only `rules.activity` + `rules.universal` (`workflow-tools.ts:890-905`), so an activity rule is inert bytes re-delivered on every dispatch.

**AP-114 `pass-orchestration-in-technique`** (`:1478-1488`) — whose verbatim exemplar is `run-audit-passes: Apply audit-expressiveness…`, i.e. exactly the naive version of #321. My design does not create it. `audit-workflow-surface` has no Protocol `Apply [technique]` and no `::` work invoke: it is one load→derive→persist path over **resources and tools**, which is the bolded do-not-flag at `:1486` ("a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) with no Protocol Apply/`::` work invoke"). The four criteria homes are *resources*, cited by section anchor. The other three audit ops stay separate techniques bound as separate `steps[]` entries — which is precisely AP-114's own Fix ("bind each sibling or shared operation as its own activity step in the order required"). AP-114's Detect test applied to my node: moving `audit-schema-validation`, `verify-high-findings` or `compile-review-report` into `audit-workflow-surface`'s Protocol *would* preserve behaviour, which is why they are not in it.

**AP-116 `no-template-creation-guide`** (`:1502-1512`). The obligation is directional — filename → guide — and it explicitly permits sharing ("Shared satellites may share one guide; every persisted bare filename must still map to a guide"). All 5 surviving filenames map, and the map row is rewritten in `resources/README.md:41-58` in the same commit. Dropping artifacts cannot trip AP-116; it only reduces the burden. The exposed gap matters here: **no entry Detects an orphaned guide**, so the 12 retired guides must be deleted in the same commit — nearest coverage is AP-92's Fix clause "dissolve the resource when nothing template-shaped remains" (`:1216`) and AP-129 for the stale roster lines.

**AP-121 `rule-as-protocol-step`** (`:1562-1572`). `audit-workflow-surface`'s Protocol carries no "follow the catalogue throughout" phase. Its four phases each have a distinct produce outcome — load the four homes by section; walk every entry against the change surface; subtract `{known_findings}`; emit the register rows + coverage line — and removing any breaks the work sequence, which is AP-121's test inverted. The two standing invariants (`base-attribution`, `known-item-exclusion`) live in `## Rules`, not Protocol.

**AP-34 `no-valueless-control-set`** (`:494-504`). All four value-LESS classify/reassess control steps die: `06:213-222` and `06:243-247` (4 sets each), `08:449-467`, `10:88-124`. `needs_audit_fixes`, `has_critical_finding`, `audit_finding_count`, `needs_recommit` become declared `## Outputs` of `compile-review-report` — AP-34's Fix verbatim ("Bind a technique whose outputs/protocol own the derivation; delete the value-LESS activity sets"). The only surviving `set`s are value-BEARING flow state carried by checkpoint `effect.setVariable`, which is the one engine-applied effect (`workflow-tools.ts:1238-1244`) — AP-33's do-not-flag (c).

**AP-25 `no-one-step-rules`** (`:382-392`). `audit-workflow-surface` has exactly two Rules and both are cross-cutting: `base-attribution` binds every row emitted from all four homes across all three bind sites (audit step, audit fix loop, post-commit sweep); `known-item-exclusion` binds every walk in the workflow. `verify-high-findings`'s existing `refute-by-default` / `verify-before-remediation` (`:185-191`) already pass and are retained verbatim. Nothing step-local is filed as a Rule; step-local caveats stay as `>` notes (AP-59 — note its mechanism: the protocol parser strips leading whitespace, so an indented constraint becomes a disconnected peer step).

**§12 Output Economy** (`design-principles.md:61-63`). One canonical home per fact (register = the only findings home; design record = the only pre-draft analysis home; AP-93 `:1218`). Declared audience (register `audience: agent`; record/report/COMPLETE human; AP-96). Exception-only status — all four `*-clean` announce steps deleted (`08:143-162, 220-239, 297-316, 374-393`, ~19 YAML lines each to carry one bit; AP-86 `:1134`, AP-87 `:1146`). Lean templates. One close-out document (AP-84 `:1110`). One decision per checkpoint (`fix-issues`/`selective-fixes` collapse; AP-88 `:1158`). Statement-form messages with `[label]({path_variable})` links (AP-97 `:1266`, AP-99 `:1290`) — and note the bidirectional obligation: dropping an artifact means dropping it from every checkpoint message, or the message names a file with no path variable to link.

**§20 Keep Orchestration in Structure** (`:93-95`). The reduction lands in `steps[]`, checkpoints, loops, decisions and transitions. I explicitly do **not** treat step count as the metric to minimise: 126 → ~72 comes from deleting ceremony, not from moving sequencing into Protocols. Nothing in 129 catalogue entries sets a step, line, loop or checkpoint ceiling on an activity, and AP-70's do-not-flag (`:938`) blesses "multiple distinct capability groups composed by one activity"; `08-quality-review.yaml` already carries 27 binds, 2 loops, a blocking checkpoint and a decision and passes `validate-activities.ts`.

**§25 Bind Sibling Operations as Steps** (`:113-115`). Four audit capabilities remain four separate `steps[]` binds. The single consolidation happens *within one home-walking capability*, never across capabilities. The `write-artifact` binds are 8 distinct static targets with different structured inputs, not a clean iterable — AP-38's own carve-out (`:550`) — and the two register re-writes inside the fix loop are "same op as distinct phases inside one loop iteration", also carved out. This is where merging is most dangerous: concatenating `08`+`10` unchanged would put ~14 pass→filename `write-artifact` binds in one `steps[]`, at which point the roster *is* a clean iterable and AP-38(b) fires. Collapsing to one register filename is what keeps AP-38 satisfied.

**§26 Atomic Techniques; Compose at Activities** (`:117-119`). `audit-workflow-surface` is atomic: one produce path, no branching orchestration, no technique invokes. The activity composes it with three sibling audit ops and `write-artifact`. Activity→activity composition is used once, for the borrowed fan-out — the third-sentence clause verbatim ("borrow, bind, or include activities to reuse standalone orchestration patterns — including the meta pattern library"), with the mechanics at `meta/activities/patterns/README.md:29-37` and precedent verified live at `remediate-vuln/workflow.yaml:322-336`.

**§30 Resources at the Abstract Level; Split for Section Delivery** (`:133-137`) — **the load-bearing constraint for cost, and the design's central mechanism.** `anti-patterns.md` is 128,341 bytes; the eager per-resource cap is 80,000 (`SRV/src/utils/resource-delivery.ts:6`), so today it can *never* be bundled, and `audit-anti-patterns.md:28` links the whole file — 128 KB pulled through `get_resource` on every invocation, across 5 bind sites and up to 6 invocations per update run, plus a sixth load at `context-loading.md:37`. Its 13 `##` sections are each far below the cap (largest is `## Coupling Anti-Patterns`, lines 590-941 ≈ 26 KB). Anchoring the links makes each a delivery unit on **both** paths — eager bundle (`resource-delivery.ts:38-47`) and `get_resource` (`SRV/src/tools/resource-tools.ts:779-786`) — and because the eager-resource loop has no cumulative budget, all 13 arrive in the one `get_activity` response. §30's second paragraph is honoured exactly: the whole-document skeleton lives in its own section, and `design-record.md` / `findings-register.md` are authored the same way, so `scope-verification` fetches only `design-record#scope-manifest` and the consolidating step fetches only `#skeleton`. "No consumer loads the whole resource to read one category."

## The eight the brief did not name but the design must clear

| Entry | Where it bites | How the design satisfies it |
|---|---|---|
| AP-38 `no-duplicate-technique-steps` (`:542`) | the only entry that gets harder purely by concatenation — scope is "in one activity" | 8 write-artifact binds on 5 distinct static filenames, not a 14-row iterable; loop-body repeats are the carved-out "distinct phases inside one loop iteration" |
| AP-128 `unproduced-value-read` (`:1688`) | merging converts boundary gates into intra-activity `when`, so a reader can become reachable on a path where its sole producer is skipped | mode divergence sits on **checkpoints and transitions**, never on technique steps — and checkpoints are never bundle-eligible, so gating them costs zero delivery. The three remaining `when`s (`impact-analysis`, the two elicitation arms, `remove-worktree`) are complementary arms with `defaultValue`-independent readers. Also fixes existing hits: `03:71` reads undeclared `design_specification`, `01:180`/`01:188` read undeclared `format_conventions`/`applicable_constructs` |
| AP-89 `checkpoint-requires-decision` (`:1170`) | 10 of 16 current checkpoints have zero effect on any option | every surviving checkpoint records an effect; the 10 zero-effect ones are deleted and their facts move into Gate 2's payload |
| AP-05 / `check-fragments.ts:307-312` `duplicate-checkpoint` (hard-zero, ≥2 sites corpus-wide) | merging concentrates near-identical checkpoint bodies | each body appears once; if a second is ever needed it goes in a new `fragments.checkpoints` block. workflow-design has **no `fragments:` block and no `ref:`** today, so this is greenfield. Note fragments are an authoring-dedup lever only — `injectCheckpointFragmentBodies` expands the body into the delivered YAML (`workflow-tools.ts:617-622`), so a ref costs the same wire bytes as inline |
| AP-129 `stale-restatement-after-change` (`:1700`) | the tax entry: an ordering claim changes in ~15 files | one edit with a counted manifest across `README.md:13-21, 45-67, 83, 168, 180-188`; `activities/README.md:13-77`; `resources/README.md:12-35, 39-58`; `techniques/README.md:37, 40`; `techniques/TECHNIQUE.md:70, 73-86`; `techniques/commit-verification.md:18` (hard-codes six of `09`'s step ids and is *also* bound from `10:184-187` where none exist); `readme-seed.md:30-46, 56, 60`; `workflow.yaml:51, 87, 123, 127, 234` |
| AP-40 `readme-orients-not-transcribes` (`:566`) | every README must be *re-authored*, not trimmed; and no inventory counts | READMEs orient by role, not by enumeration; no "N activities/techniques/resources" claims |
| AP-41 / §17 positive present (`:578`, `design-principles.md:81-83`) | merged `outcome:` blocks leak comparative framing | all four `outcome:` blocks authored from scratch; no "no longer runs six separate passes" |
| AP-70 `capability-group-placement` (`:930`) | tempting to invent an `audit::` group | **no group invented.** `audit-workflow-surface` is a flat workflow-local technique; a group folder whose ops are the workflow's entire operation set is AP-70's own Detect, and its do-not-flag warns off "inventing a group for a hypothetical second cluster (YAGNI)". This also keeps AP-115/AP-123 (container Capability) unengaged. |

---

# 5. The audit-stage design

## One sweep replaces six passes

The licence is arithmetic, not judgement. Every one of the six techniques *cites* its home and is forbidden from re-authoring it — `audit-anti-patterns.md:29` "Do not restate, summarize, or number catalog entries in this technique; follow each entry as written"; `audit-expressiveness.md:113`; `audit-conformance.md:33`; `audit-rule-hygiene.md:83`; `audit-principles.md:72`. §29's Separation test (`design-principles.md:129-131`) therefore guarantees that merging *citers* changes no criterion. And AP-105 `no-shadow-audit-pass` (`:1366`) states the target outright: **"keep at most one walker per home."** Today: six walkers over four homes, three of them on `anti-patterns.md`, one of those (`audit-rule-enforcement.md:127`) dedicated to a single entry. One walker over four homes is strictly *more* compliant than the status quo, and AP-105's do-not-flag protects the shape — "a thin scoped walker that loads a named section and applies each entry as written without restating Detect."

`audit-workflow-surface.md` Protocol, four phases:

1. **Load homes** — `[anti-patterns](../resources/anti-patterns.md#structural-anti-patterns)` … through `#authoring-guidance-mr` (13 anchors), `[design-principles](../resources/design-principles.md)`, `[schema-construct-inventory](../resources/schema-construct-inventory.md)`, `[convention-conformance](../resources/convention-conformance.md)`, plus the sibling-workflow baseline via `meta::workflow-engine::list-workflows`. No criterion restated (AP-102 `:1326`, AP-104 `:1354`, AP-106 `:1378`).
2. **Walk every entry against the change surface** — each catalogue entry's Detect / Do-not-flag / Fix as written; each principle scored Pass/Partial/Violation; each inventory mapping checked for prose substituting for a construct, with the substituting construct and a before/after rewrite; each conformance concern compared against the reference baseline.
3. **Subtract `{known_findings}`.**
4. **Emit `{audit_findings}` + `{audit_coverage}` + `{audit_finding_count}`** into `findings-register.md` per `[Findings Register Guide](../resources/findings-register.md#skeleton)`.

What is **not** collapsed, because collapsing loses capability:

- `audit-conformance`'s sibling survey (`:37`) is evidence *outside* the target workflow. It survives as Protocol phase 1's last bullet; the walker is still a walker.
- `audit-principles`'s Partial classification (`:71`) catches a principle honoured *nowhere* — an absence, which no Detect finds. Survives as a register disposition value. `resources/README.md:13, 68` states the intent: principles cover smell *families* with no Detect triad; the catalogue covers *instances*.
- `audit-expressiveness`'s before/after rewrite naming the substituting construct (`:118`) is the positive answer Detect cannot give. Survives as two register columns.
- `audit-schema-validation` is three validator scripts (`:24, :30, :34`) — mechanical, stays its own step.
- `verify-high-findings` stays its own step and is now bound **three** times instead of only in `08` (`:50, :416`).

## The four properties, as structure

**(P4) Single context over the whole diff.** `audit-workflow-surface` is bound as one *ungated* step, so `collectUngated` (`workflow-tools.ts:713-719`) collects it and its body is inlined; every resource it links then arrives in the sibling `resources` map in the *same* response — all 13 `anti-patterns` sections plus `design-principles.md` (12,510 B), `schema-construct-inventory.md` (12,122 B), `convention-conformance.md` (1,534 B). Total 154,507 B of criteria, delivered **once**, with zero `get_resource` calls. Compare today: `08-quality-review.yaml` has 27 technique steps and **0** eager-eligible, because every top-level step carries a 2-or-3-clause `and` gate and both loops are `condition`-gated (so their bodies are excluded too) — ~27 sequential fetches plus a 128 KB catalogue pull per audit invocation.

**(P2) Mandatory base attribution.** Structural, not exhortative. `{audit_findings}` rows carry a required `Entry` (the kebab **name** from the cited home — never a bare number, per `anti-patterns.md:25` "Do not cite bare historic numbers, and do not cite the catalog's entry count") and a required `Home` (`resource#anchor`). `findings-register.md`'s Template makes both columns mandatory. Enforcement is `verify-high-findings`: a row whose `Home` anchor does not resolve, or whose claim cannot be applied from that home alone, is **withdrawn** — which is AP-103 `cited-home-owns-claim`'s test (`:1342`, "open the cited home; if the claim cannot be applied from X alone, the citation is false") turned on the workflow's own findings. Paired with a verify operation at a workflow boundary as AP-95 (`:1242`) demands, and with "no checkpoint, loop, or routing variable" as AP-95 specifies.

**(P3) Known-item exclusion.** `audit-workflow-surface` declares `{known_findings}` with an I/O-agnostic bind contract — "the finding rows already recorded against this target: id, entry name, home anchor, location" — naming no producer (AP-42 `:594`, AP-125 `:1610`, AP-119 `:1538`). At the first walk it resolves to the four corpus baselines (`SRV/scripts/binding-fidelity-baseline.json` 256 entries, `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json`); at every re-walk — both fix loops and the post-commit sweep — it resolves to `findings-register.md`. The register records the exclusion as **a count on one line**, never a list: AP-87 (`:1146`) forbids the "None"/"N/A" section and forbids a null-confirmation checkpoint. This is what makes re-walks cheap — iteration 2 reports only what iteration 1 did not.

**(P1) Evidenced negatives, without an all-green table.** Two deliberately separate mechanisms:

- *Coverage attestation.* `{audit_coverage}` is one line per home naming **the enumeration walked, not the instances inspected** — §11's formulation verbatim (`design-principles.md:57-59`). It lands in `findings-register#coverage`. It is not a verdict table, so AP-86 (`:1134`) is not engaged; it is not per-entry, so it does not scale with the catalogue; and it cannot hard-code a count, because AP-40's test (`:566`, "if the block must be edited when folder contents change, it is transcribing") and `anti-patterns.md:25` both forbid citing the entry count.
- *Refutation rows.* Negatives are evidenced where a negative is a **decision**: every High that `verify-high-findings` withdraws keeps its register row with disposition `withdrawn` plus the re-derivation evidence — which `verify-high-findings.md:168-169` already specifies ("Record the re-derivation evidence for each High: the construct inspected and whether the finding was independently reproduced"). AP-86's own do-not-flag protects this (`:1142`, "Vocabularies downstream steps parse … data, not ceremony").

## Why this recovers the bare sweep's yield

The 8-vs-3 High gap has two causes and my design addresses both. First, **verification asymmetry**: `verify-high-findings`'s `refute-by-default` rule withdraws any High not independently re-derived, and it is bound *only* in `08` (`:50, :416`) — neither `06`'s pre-attestation pair nor `10`'s five post-commit passes runs it, so the numbers were never comparable. Here it runs on every sweep. Second, **coverage holes**: `08:14-18` gates the principles/anti-pattern loop to review mode and `06:180-192` gates the pre-attestation pair to update mode, so **create mode never applies the anti-pattern catalogue as an audit at all** — the catalogue reaches it only as a write-time rule at `techniques/TECHNIQUE.md:60-62`. The bare two-agent sweep ran exactly the two passes the create/update path structurally omits. One ungated sweep over all four homes in every mode closes that hole without adding a pass.

---

# 6. Dispatch count and token budget

A dispatch is one `spawn-agent` per activity entry (`meta/techniques/workflow-engine/dispatch-activity.md` step 4), landing in a **fresh** context where `bundle: "reference"` is invalid (`workflow-tools.ts:586-588`, `636`). So per-dispatch delivery is never amortised, and dispatch count multiplies the whole floor.

**Measured floor per dispatch.** `CORE_WORKER_TECHNIQUES` = 7 refs (`SRV/src/loaders/core-ops.ts:52-62`) → `yield-checkpoint.md` 1,988 + `resume-from-checkpoint.md` 901 + `finalize-activity.md` 3,102 + `agent-conduct.md` 4,865 = **10,856 B**, plus inherited `techniques.activity: [variable-binding]` (`workflow.yaml:19-21`) ≈ 5,300 B ≈ **16 KB ≈ 4K tokens** before composition, unavoidable, every dispatch.

**Update-mode run: 4 dispatches, no loop-backs on the happy path.**

| # | Node | Activity YAML | Eager technique steps | Eager resources | Lazy round trips |
|---|---|---|---|---|---|
| 1 | `intake` | ~4 KB | 3 of 4 | `update-mode-guide`, `readme-seed`, `planning-readme` | 1 (`impact-analysis`, gated) |
| 2 | `design-and-draft` | ~7 KB | ~9 of 13 | `elicitation-guide`, `design-record`, `design-assumptions`, `convention-conformance` | ~4 (the two mutually exclusive elicitation arms) |
| 3 | `audit` | ~5 KB | **all 13, incl. the whole fix-loop body** | 13 `anti-patterns` sections + 3 homes + `findings-register` + `compliance-report` ≈ **168 KB** | **0** |
| 4 | `land-and-close` | ~6 KB | ~17 of 18 | 4 homes (re-delivered) + `completion-artifact` + `planning-readme` | 1 (`remove-worktree`, gated) |

Review mode: 2 dispatches single-target (`intake → audit → __terminal__`), or 2 + N with the borrowed fan-out.

**Token budget.** Criteria corpus 154,507 B ≈ 39K tokens, delivered twice (dispatches 3 and 4) ≈ 78K. Activity YAML ~22 KB ≈ 6K. Floor 4 × 4K = 16K. Eager technique bodies across all four dispatches ≈ 55K. The working set — the *target* workflow's own files, which the sweep must actually read, ~66 KB of activity YAML plus techniques and resources, re-read on 3 sweeps (initial, one fix iteration, post-commit) ≈ 120K. Register/report/record generation ≈ 40K. Reasoning overhead over delivered context ≈ 2×.

**Estimate: 380K–450K total subagent tokens for a full update pass.** That is deliberately the same order as the bare two-agent sweep's 410K, and that is the whole argument: the bare sweep's cost *is* the irreducible cost of reading the canon and the change once. Structure should cost the canon plus the harness floor, not 3.5× it.

Against 1,430,000 that is a **~3.4× reduction**, decomposing as — largest first:
1. **6→1 walkers over sectioned homes** (removes 5 redundant full-criteria loads per audit node, ×3 audit nodes today) — the dominant term.
2. **Un-gating audit steps and moving while-tests to `breakCondition`** — turns `08`'s 27 lazy fetches into 0 and unlocks the fix-loop body.
3. **Whole-file → anchored resource links** — the 128 KB catalogue moves from un-bundleable to bundled.
4. **12 → 4 dispatches** — −8 × 16 KB floor plus 8 fewer cold re-derivations of the change surface.
5. **27 → 8 write-artifact binds, 63 → ~46 variables, 126 → ~72 steps.**

**Budget the change itself separately.** AP-129 requires the whole definition tree swept in one edit with a counted manifest; §17/AP-41 requires four `outcome:` blocks and every README re-authored from scratch in positive present. That is ~15 files of documentation rewrite and it is not optional: `check-resource-anchors.ts` is hard-zero with no baseline, and 10 anchored links point at `activities/README.md#NN-activity-name` headings (`README.md:13-21, 168` → `activities/README.md:13, 21, 29, 37, 45, 53, 61, 69, 77`) that every rename breaks, plus ~35 more anchored links into the 12 deleted creation guides.

---

# 7. The three biggest risks in my own design

**R1 — The whole-surface sweep is one agent's attention over ~155 KB of criteria plus ~66 KB of target, and `{audit_coverage}` is self-reported.** The six-pass shape had one property I give up: each pass was a fresh context with one home, so a lens could not be crowded out by another lens. My compensations are the coverage attestation and the AP-105 argument that criteria are unchanged — but a coverage line naming "13 of 13 sections" is exactly the claim a saturated agent emits falsely, and AP-40 (`:566`) plus `anti-patterns.md:25` forbid me from hard-coding the expected section count as a check (it would be a transcribing drift site and a forbidden count citation). The defensible mitigation: make `{audit_coverage}` **derived rather than asserted** — the walker records, per home, the anchor ids it actually received, and `verify-high-findings` cross-checks that list against the anchors present in the delivered `resources` map, so under-coverage is detectable from the register alone. Residual risk after that is real and I would want the first three runs measured against a held-back finding set before retiring the six-pass shape.

**R2 — Two load-bearing behaviours are code facts, not contracts.** (a) The eager-resource loop's *absence* of a cumulative budget (`workflow-tools.ts:798-830`) is what makes "155 KB of criteria in one response" work; it is an asymmetry against the technique loop's explicit budget, it reads like an oversight, and adding a cumulative resource cap — an obvious future optimisation — silently reverts my audit node to ~17 lazy `get_resource` calls with no test failing. (b) Activity borrowing is a loader feature **neither schema admits**: `WorkflowSchema.activities` is `z.array(ActivitySchema)` (`SRV/src/schema/workflow.schema.ts:88`, with the comment at `:83-88` conceding strings exist only in the intermediate raw schema) and `SRV/schemas/workflow.schema.json:422+` declares items as objects with `additionalProperties: false`. Worse, the borrowed `04-isolated-fan-out.yaml` declares **no `transitions:`**, so `getValidTransitions` returns `[]` and `validateActivityTransition` short-circuits to `null` — legalising *every* target from it (`SRV/src/utils/validation.ts:45`) with no warning. I would ship the borrow only behind a thin local wrapper that owns the transitions, and I would drop it entirely (4 nodes, 4 fewer variables, −1 unvalidated edge) if review runs stay single-target in practice.

**R3 — Migration is where this breaks, and workflow-design's own gate cannot see it.** Six live sessions are pinned to ids I delete: `get_activity` throws `Activity not found` with no fallback (`workflow-tools.ts:602-609`) for the QDDWIT session at `intake-and-context` and five others at `quality-review`/`retrospective`, while `get_workflow_status` keeps reporting the dead id as healthy (`:1358, :1392`) and `next_activity` to a surviving id succeeds **silently** because the empty-valid-set escape hatch fires. Compounding, the workflow's own validation step runs 3 of 10 guards and passes **no `--root`** (`audit-schema-validation.md:24, :30, :34`), so it validates the stale main checkout rather than the worktree holding the change — meaning this PR can pass workflow-design's own gate while `check-resource-anchors.ts` (hard-zero) is red on 10–45 links, ~13 orphaned variables sit undetected (`check-variable-model.ts` has no unused-variable rule and `check-binding-fidelity.ts` treats `workflow.yaml` variables as *producers*), and `readme-seed.md:30-46`'s `@` column silently desyncs so every future Progress write becomes a 0-row no-op with no error path (`sync-progress-status.md:45-47`, `meta/resources/planning-readme.md:88-89`). And §10 (`design-principles.md:53-55`) makes this a content-reducing update to workflow-design itself: it needs a flagged removal inventory and explicit approval through `preservation-check`, so it must be executed *through* node A1, not applied around it. Two prerequisites, not follow-ups: add `--root {target_path}` plus the seven missing guards to `audit-schema-validation`; and ship a session rewriter over `.engineering/artifacts/planning/*/session.json` — including the embedded `triggeredWorkflows[i].state` children — that maps `currentActivity`, `completedActivities`, `skippedActivities`, `history[].activity`, re-keys `checkpointResponses` from `<old-act>-<cp>` to `<new-act>-<cp>`, and restamps `workflowVersion` (the resume branch never does — `SRV/src/tools/resource-tools.ts:268-293`).
