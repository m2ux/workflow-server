BASE = `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation`
`WD` = `BASE/workflow-design` · `SRV` = `/home/mike1/projects/dev/workflow-server`
Short forms below are `WD`-relative unless prefixed. Every line number verified by read.

---

# 0. The design premise, stated so it can be attacked

Four value classes must survive. Each has exactly one demonstrated producer:

| Value class | Demonstrated producer | Where it lives today |
|---|---|---|
| 3 verified workflow Highs | the audit pass **that binds `verify-high-findings`** | `08-quality-review.yaml:49-50`, `:414-416` — and nowhere else; `06`'s pre-attestation pair (`06:177-192`) and all five of `10`'s passes (`10:9-72`) run zero verification |
| re-target insight | `synthesize-update-specification` reading `{structural_inventory}` + `{change_category}` | `synthesize-update-specification.md:16-22`, bound `03:32` — **not** the 12-iteration dimension loop (`03:41-60`, create-only) |
| four-files + name-collision constraints | `impact-analysis` phases 2–5 | `impact-analysis.md:30-47`, rule `side-effect-detection` `:69` ("renaming an activity id breaks all transition references and `initialActivity`") — derived, then **buried in artifact prose; never declared as a bound value** |
| scope discrepancy at commit | `scope-verification` → Gate 2 payload | `09-validate-and-commit.yaml:80`, `:145-167` |

Everything else in the 9-activity graph is either ceremony (19 announce-only steps, 10 zero-effect soft checkpoints), duplicate (9 duplicated publish/report binds), or an unverified re-walk of criteria already walked (`10`, 247 lines, ≤24 audit invocations).

**Design rule I applied:** a node earns its existence only if deleting it deletes one of those four producers or a canon-mandated structural gate.

---

# 1. Target activity list

Four locally-authored activities. **Prefixes are deliberately sparse (`01/06/08/09`), not renumbered `01–04`.** Reason: `artifactPrefix` is derived from the filename (`SRV/src/loaders/filename-utils.ts:6-10`, assigned `SRV/src/loaders/workflow-loader.ts:83`) and orders the activity list by `localeCompare` (`:91-93`); `01 < 06 < 08 < 09` sorts correctly, every artifact already minted under `01/06/08` keeps its name (`work-package/techniques/manage-artifacts/write-artifact.md:39-42`, prefix-agnostic and sticky), and 4 of the 9 `@` rows in `resources/readme-seed.md:30-46` survive untouched. Renumbering to `01-04` buys cosmetics and pays hazards H6 and H11 in full. Gaps are already sanctioned — `activities/README.md:9` declares the `02`/`07` gaps intentional.

**Filename id segment == declared `id` in every case** — mandatory, because `getActivity` matches the YAML `id:` (`SRV/src/loaders/workflow-loader.ts:426-428`) while `readActivityRaw` (the path `get_activity` uses) matches the filename-derived id (`:570`), and no validator compares them.

**All step gates are `when:` one-liners, not structured `condition:` blocks** — except on checkpoints, where `condition` is what makes `condition_not_met` dismissal legal (`SRV/src/schema/activity.schema.ts:75`; `SRV/src/tools/workflow-tools.ts:1186-1192`). This is free: both gate identically for the agent (`SRV/src/utils/validation.ts:79-82`) and for bundling eligibility (`SRV/src/tools/workflow-tools.ts:715`), and it removes ~36% of raw activity YAML corpus-wide / 53% of `08` (698 of 1,935 lines are structured condition blocks today).

**No activity carries a `rules:` block.** AP-69 has a literally empty carve-out (`resources/anti-patterns.md:924`: "N/A — activity `rules:` should be empty").

---

## 1.1 `01-frame.yaml` — id `frame` (~170 lines)

**Purpose:** Classify the request, name the target, produce the change brief and the change constraints, enumerate scope. Nothing is edited before this activity's second gate.

| # | kind | id | bound technique / gate | gate |
|---|---|---|---|---|
| 1 | action | `bind-planning-folder-path` | `set planning_folder_path` — **value-BEARING** | — |
| 2 | technique | `classify-intake` | `intake-classification` (reduced: drop Protocol §4/§5 `:83-90` and the `structural_inventory_path` output `:56-58`; keep `{structural_inventory}` as an in-session value) | — |
| 3 | technique | `compose-change-brief` | `compose-change-brief` **(new)** — absorbs `derive-design-dimensions`, `prepare-dimension`, `capture-dimension`, `synthesize-update-specification`, `persist-design-specification`; cites `resources/elicitation-guide.md` dimension sets, emits `{change_brief}` + `{open_judgements}` in one pass | `when: operation_type != review` |
| 4 | technique | `persist-change-brief` | `work-package::manage-artifacts::write-artifact` (`change-brief.md` → `change_brief_path`) | `when: operation_type != review` |
| 5 | action | `surface-open-judgements` | `message` — the single batched question payload feeding Gate 1 | `when: open_judgements_count > 0` |
| 6 | **checkpoint** | `design-intent-batch` | **HARD** (`blocking: true`, no `defaultOption`, no `autoAdvanceMs`) — body reused verbatim from `01-intake-and-context.yaml:35-88`; all 5 options carry `effect.setVariable` (`:54-88`) | `condition:` `intent_needs_confirmation == true` |
| 7 | technique | `seed-planning-readme` | `workflow-engine::create-readme` (`seed_profile: workflow-design/readme-seed`) | `when: operation_type != review` |
| 8 | technique | `analyze-impact` | `impact-analysis` (extended: declare **`{change_constraints}`** as an output — the co-change set and identifier-collision set that phases 2–5 `:30-47` and rule `side-effect-detection` `:69` already derive but never bind) | `when: operation_type == update` |
| 9 | technique | `persist-impact-analysis` | `write-artifact` (`impact-analysis.md` → `impact_analysis_path`) | `when: operation_type == update` |
| 10 | technique | `define-scope` | `scope-definition` (input deviation: `change_constraints`) | `when: operation_type != review` |
| 11 | technique | `persist-scope-manifest` | `write-artifact` (`scope-manifest.md` → `scope_manifest_path`) | `when: operation_type != review` |
| 12 | **checkpoint** | `scope-and-impact-confirmed` | **HARD** (no `defaultOption`, no `autoAdvanceMs`). Merges `05:39` `impact-and-preservation-confirmed` + `06:36` `scope-and-structure-confirmed`. Options: `confirmed` (`setVariable scope_manifest_confirmed: true`), `revise-scope`, `preserve-more` (`setVariable preservation_requested: true`) | `condition:` `operation_type != review` |

**Transitions:** `to: audit` when `and(operation_type == review, review_scope_confirmed == true)`; `to: draft` `isDefault: true`.
`initialActivity: frame` (replaces `workflow.yaml:265`).

Note step 12's option set: AP-88 (`:1158`) permits merging two checkpoints only when the second's answer space is subsumed. Removal-approval and scope-approval answer spaces are **not** subsumed, so the merged option set covers both explicitly (`preserve-more` is the `05:39` axis). That is AP-05-compliant (`:134`) because the user answers one question — "is this scope, including these removals, the change we are making?" — with one recorded effect.

## 1.2 `06-draft.yaml` — id `draft` (~150 lines)

**Purpose:** Prepare the edit worktree and write the files the manifest names.

| # | kind | id | bound technique / gate | gate |
|---|---|---|---|---|
| 1 | technique | `derive-target-path` | `derive-workflows-target-path` | — |
| 2 | technique | `ensure-worktree` | `prepare-workflow-branch` | — |
| 3 | **loop** | `file-drafting-loop` | `forEach current_file over scope_manifest`, `maxIterations: 50`, `when: scope_manifest_confirmed == true` | — |
| 3a | technique | `author-yaml` | `yaml-authoring` | — |
| 3b | technique | `review-file` | `review-drafted-file` (reduced: delete Protocol §2 persist `:45-48` and the `file_review_note*` outputs; **keep `{has_unflagged_removals}`** `:34`) | — |
| 3c | **checkpoint** | `preservation-check#{current_file.path}` | **HARD** (no default/auto). **Instance-qualified** — the plain id at `06:140` inside a `maxIterations: 50` loop is replayed silently from iteration 2 onward (`SRV/src/tools/workflow-tools.ts:978-1022`; qualification resolved by `checkpointBaseId`, `SRV/src/loaders/workflow-loader.ts:438-464`; correct precedent `work-package/activities/07-assumptions-review.yaml:90`) | `condition:` `has_unflagged_removals == true` |
| 4 | technique | `verify-artifact-conforms` | `verify-artifact-conforms` (**absorbs** `review-draft-yaml.md:51-52`'s binding-fidelity pass: every artifact-persisting step is a bound `steps[]` entry, every required input has a producer) | — |

**Transitions:** `to: audit` `isDefault: true`.

No attestation checkpoints. `06:draft-attestation` (`:285-302`) and `06:batch-review-attested` (`:303-326`) are `blocking: false` + `autoAdvanceMs: 30000` with **zero `effect` on every option** — AP-89's discriminator is exactly "recorded effect" (`resources/anti-patterns.md:1170`). The durable attestation is the register plus Gate 2.

## 1.3 `08-audit.yaml` — id `audit` (~180 lines)

**Purpose:** One whole-surface canon sweep over the working-tree diff, independently verified, with a bounded fix loop. **Pre-commit only** — see §3 for why the post-commit audit is retired.

| # | kind | id | bound technique / gate | gate |
|---|---|---|---|---|
| 1 | technique | `load-audit-surface` | `reload-workflow` (extended: declare `{base_ref}`, `{surface_files}`, `{changed_files}` — today it declares no outputs at all) | — |
| 2 | technique | `load-known-findings` | `load-known-findings` **(new)** — normalizes `SRV/scripts/binding-fidelity-baseline.json` (256 entries), `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json`, and any prior `findings-register.md` into `{known_finding_keys}` | — |
| 3 | technique | `survey-reference-workflows` | `meta::workflow-engine::list-workflows` → `{reference_workflows}` | — |
| 4 | technique | `sweep-canon` | `audit-canon` **(new)** — the single walker; see §5 | — |
| 5 | technique | `validate-schema` | `audit-schema-validation` (fix: pass `--root {target_path}` to all three scripts, `audit-schema-validation.md:24,:30,:34` currently pass none — hazard H5) | — |
| 6 | technique | `verify-findings` | `verify-high-findings` (extended: declare `{open_finding_count}`, `{has_critical_finding}` as outputs) | — |
| 7 | technique | `compile-register` | `compile-report` (retargeted: cite `findings-register.md#template`, retire `summarize-findings`) | — |
| 8 | technique | `persist-register` | `write-artifact` (`findings-register.md` → `report_path`) | — |
| 9 | **checkpoint** | `review-disposition` | **HARD** (`blocking: true`). Body from `08:77-105` **minus** the `selective-fixes` option, whose `effect` is byte-identical to `fix-issues` (`:96-105` vs `:87-95`) — AP-88 (`:1158`) | `condition:` `operation_type == review` |
| 10 | **loop** | `fix-cycle` | `while`, `breakCondition: open_finding_count == 0`, `maxIterations: 2`, `when: open_finding_count > 0` | — |
| 10a | technique | `author-fixes` | `yaml-authoring` | — |
| 10b | technique | `record-fixes` | `apply-audit-fixes` (`selected_findings: verified_findings`) | — |
| 10c | technique | `re-sweep` | `audit-canon` with input deviation `surface_files: fixes_applied` | — |
| 10d | technique | `re-validate-schema` | `audit-schema-validation` | — |
| 10e | technique | `re-verify` | `verify-high-findings` | — |
| 10f | action | `bump-round` | `set remediation_round` — **value-BEARING**, orchestration state only | — |
| 11 | technique | `persist-register-final` | `write-artifact` (`findings-register.md`) — same filename, updated in place (`write-artifact.md:39-41`) | `when: remediation_round > 0` |

**Decision** `blocker-gate` (2 branches, min-2 satisfied per `SRV/src/schema/activity.schema.ts:243-258`): `has-blocker` → `transitionTo: draft` when `and(has_critical_finding == true, remediation_round < 2)`; `no-blocker` `isDefault: true`.
**Transitions:** `to: land` `isDefault: true`.

`remediation_round < 2` is the bound that today does not exist anywhere in 63 variables — `10:220-226` re-enters `intake-and-context` unconditionally when `needs_audit_fixes == true`, and `03:101-113` is the corpus's only `while` loop with no `maxIterations`.

**Steps 1–8 carry no `when`/`condition`.** That is deliberate and load-bearing for cost: `collectUngated` (`SRV/src/tools/workflow-tools.ts:713-719`) excludes any step with `when` or `condition` from eager bundling, which is why `08-quality-review.yaml` today has **0 of 27** steps eager-eligible. Mode differences move to input deviations and to the two gated constructs (step 9, step 10).

## 1.4 `09-land.yaml` — id `land` (~150 lines)

**Purpose:** Re-verify scope against what was actually produced, gate the commit, publish, close out. Terminal.

| # | kind | id | bound technique / gate | gate |
|---|---|---|---|---|
| 1 | technique | `verify-scope-manifest` | `scope-verification` → `{total_count}`, `{addressed_count}`, `{unaddressed_count}` | `when: operation_type != review` |
| 2 | technique | `author-readme` | `readme-authoring` | `when: operation_type != review` |
| 3 | technique | `verify-planning-readme` | `workflow-engine::verify-readme-conforms` | — |
| 4 | **checkpoint** | `approve-to-commit` | **HARD** (`blocking: true`). Body from `09:145-167`; payload retargeted to link `[change brief]({change_brief_path})`, `[impact analysis]({impact_analysis_path})`, `[findings register]({report_path})` and interpolate `{unaddressed_count}` / `{open_finding_count}` / `{has_critical_finding}`. Options: `approved`, `revise-scope` (`transitionTo: frame`), `return-to-draft` (`transitionTo: draft`) | `condition:` `operation_type != review` |
| 5 | technique | `stage-and-commit` | `version-control::commit-regular-files` | — |
| 6 | technique | `verify-commit` | `commit-verification` (fix: `commit-verification.md:18` hard-codes six `09` step ids — delete, AP-107 `:1390`) | — |
| 7 | technique | `push-branch` | `version-control::push-branch` | `when: operation_type != review` |
| 8 | technique | `compose-pr` | `publish-workflow-pr` | `when: operation_type != review` |
| 9 | technique | `open-pr` | `github-cli-protocol::create-pr` (`as_draft: false`) | `when: operation_type != review` |
| 10 | technique | `create-completion-doc` | `create-completion-doc` (**absorbs** `conduct-retrospective`; retrospective becomes a section per `resources/completion-artifact.md:10`) | — |
| 11 | technique | `persist-completion` | `write-artifact` (**`COMPLETE.md`** — fixes the `11:20`/`11:36` `completion.md` bug against `resources/completion-artifact.md:3`, `resources/README.md:44`) | — |
| 12 | technique | `remove-worktree` | `work-package::manage-git::remove-worktree` | `when: worktree_created == true` |

**No `transitions:` block** — terminal, matching `11-retrospective.yaml` today.

Step 4 is the §3/AP-07 "after" end of the enumerate-then-re-verify pair; step 1 supplies its evidence. `09:validation-passed` (`:54-77`) and `09:scope-verified` (`:102-125`) are deleted: both are `blocking: false` + `autoAdvanceMs: 30000` with zero effects, and both auto-select the *dangerous* option (commit schema-invalid files; confirm unaddressed scope) after 30 s. Their facts now ride Gate 2's message, which is the gate that already stops the tool surface (`SRV/src/utils/session/params.ts:38-46`).

**Totals:** 4 activities, ~650 lines (from 1,926), 5 checkpoints (from 16), all 5 hard, 1 decision, 2 loops, ~58 top-level steps (from 126).

---

# 2. Target artifact list

Six persisted bare filenames; five locally authored (`README.md` is seeded by a borrowed meta op).

| Bare filename | Creation guide | Named reader | Decision it feeds |
|---|---|---|---|
| `README.md` | `meta/resources/planning-readme.md` Template + `resources/readme-seed.md` | the human tracking the session; `sync-progress-status` writes Status only (`meta/techniques/workflow-engine/sync-progress-status.md:60`) | none — §11 (`design-principles.md:57-59`) requires it; not cuttable |
| `change-brief.md` | **`resources/change-brief.md` (new)** — replaces `design-specification.md`, `structural-inventory.md`, `format-conventions.md`, `applicable-constructs.md` | the human at `design-intent-batch` (frame:6) and `approve-to-commit` (land:4) | mode / target / re-target correction; final approval. Carries the `## Open Judgements` section that replaces the whole assumptions subsystem |
| `impact-analysis.md` | `resources/impact-analysis.md` (existing) | the human at `scope-and-impact-confirmed` (frame:12); `scope-definition` and `audit-canon` as `{change_constraints}` | removal approval (§10, `design-principles.md:53-55`) and the co-change / identifier-collision constraints that bind drafting |
| `scope-manifest.md` | `resources/scope-manifest.md` (existing) | `scope-verification` (land:1); the human at both hard gates | §3 enumerate-then-re-verify (`design-principles.md:25-27`, AP-07 `:158`); the scope-discrepancy catch |
| `findings-register.md` | **`resources/findings-register.md` (new)** — replaces `findings-satellite.md` (7 filenames, `findings-satellite.md:12`) and `compliance-report.md` (2 filenames, `compliance-report.md:13`) | `verify-high-findings` and `apply-audit-fixes` (`{selected_findings}`) in-session; `load-known-findings` on the **next** run; the human via the `review-disposition` / `approve-to-commit` messages that link it | fix vs report-only; blocker gate; next-run known-item exclusion |
| `COMPLETE.md` | `resources/completion-artifact.md` (existing) | the human, post-session | close-out — AP-84 single close-out artifact (`:1110`), whose Do-not-flag (`:1118`) blesses "a single close-out artifact with retrospective as a section" |

**The register is agent-state, not a human report.** AP-96 (`:1254`) demands one declared audience: it is structured one-row-per-finding data that downstream steps re-read. The human decision surface is the **checkpoint message**, which links the register and interpolates the counts — AP-97 (`:1266`), AP-99 statement-form (`:1290`). That is what removes the need for `compliance-review.md` and `post-update-review.md` as separate documents, and it is a stronger §12 answer (`design-principles.md:61-63`, "one canonical home per fact, declared human vs agent audience") than collapsing the two reports into one report.

**Register shape** (guide sections, per §30 `design-principles.md:133-137` — the guide is section-addressable so a renderer fetches one anchor):

- `## Template` (skeleton: header + the four sections below)
- `## Findings` — one table, columns `ID | Dimension | Severity | Origin | Known | Finding | Location | Fix`. **One table with a Dimension column, not one heading per dimension** — AP-87 (`:1146`) forbids per-dimension sections that can read "None"; AP-86 (`:1134`) forbids all-green per-dimension verdict tables while its Do-not-flag (`:1142`) preserves parseable severity counts.
- `## Coverage` — one line per criteria home naming **the enumeration walked**, never the instance count and never the catalogue's entry count (`resources/anti-patterns.md:25`: "do not cite the catalog's entry count (it drifts)"). This is §11's clause: "a completeness verdict names the enumeration grounding it, not the instances inspected" (`design-principles.md:57-59`).
- `## Known` — matches against `{known_finding_keys}`, kept out of the decision surface.
- `## Rules` — Write always (including a zero-row set, because Coverage is the evidenced negative); severity order Critical→High→Medium→Low; rows updated in place across fix rounds (AP-91 `:1194`, "one row per item, updated in place across stages"); aggregate scorecards presented in-session, never persisted (AP-91 Fix `:1204`).

**Retired artifact filenames (14):** `structural-inventory.md`, `format-conventions.md`, `applicable-constructs.md`, `design-specification.md`, `pattern-analysis.md`, `drafting-plan.md`, `file-review-note.md`, `draft-attestation.md`, `assumptions-log.md`, `expressiveness-findings.md`, `conformance-findings.md`, `rule-hygiene-findings.md`, `enforcement-findings.md`, `principle-findings.md`, `anti-pattern-findings.md`, `verified-findings.md`, `compliance-review.md`, `post-update-review.md`, `completion.md` (the misnamed variant), `follow-ups.md` (never produced by any bind site — a guide with no producer). Bind sites: **27 → 8**.

---

# 3. Retirement list

## 3.1 Activities (5 files deleted, 4 rewritten)

Deleted: `03-requirements-refinement.yaml` (149), `04-pattern-analysis.yaml` (38), `05-impact-analysis.yaml` (65), `10-post-update-review.yaml` (247), `11-retrospective.yaml` (53).
Rewritten in place: `01-intake-and-context.yaml`→`01-frame.yaml`, `06-scope-and-draft.yaml`→`06-draft.yaml`, `08-quality-review.yaml`→`08-audit.yaml`, `09-validate-and-commit.yaml`→`09-land.yaml`.

**The load-bearing deletion is `10-post-update-review.yaml`.** Justification, in order:
1. It is the most expensive stage in the corpus — 25 top-level steps, 35 with the loop body, worst case 24 audit invocations (`10:9-72` ×1 + `10:126-158` ×3 iterations ×6 passes), each `audit-anti-patterns` invocation loading all 128,341 bytes of `resources/anti-patterns.md` (`audit-anti-patterns.md:28`, whole-file link, no anchor).
2. It cannot produce a *verified* finding: `verify-high-findings` is bound only at `08:49-50` and `08:414-416`. Its output feeds `apply-audit-fixes` raw, in direct violation of its own rule `verify-before-remediation` (`verify-high-findings.md:49-51`).
3. Its distinct capability, `scope-audit` (`10:69`), has a **dead output** — `{scope_drift_findings}` is baselined dead in `SRV/scripts/binding-fidelity-baseline.json`, never persisted, never read by any gate.
4. It re-binds the entire 7-technique publish tail from `09:78-224` (`10:169-210`), which the 4-activity split would *entrench* rather than resolve.
5. It is the sole source of the merge's fatal ordering contradiction — a single linear `audit` node cannot straddle `land`'s commit, because `reload-workflow.md:8` requires a "**Fresh post-commit** workflow definition" and `scope-audit.md:20` diffs "the **committed** diff".

Deleting it dissolves the contradiction instead of paying for a `land → audit` back edge or 25 new `post_commit` gates.

**What I lose:** any defect introduced by remediation edits after commit. **Why acceptable:** the target `fix-cycle` re-sweeps and re-verifies *inside* the audit activity (steps 10c–10e), and `land` is only reachable with `open_finding_count == 0` or an explicit human `approved`. Today's design has no such guarantee — `06:pre-attestation-fix-cycle` (`:223-247`) records fixes with `apply-audit-fixes` but contains **no editing step at all** (`apply-audit-fixes.md:8,:24-26` is a record, not an edit), so its loop provably cannot converge.

## 3.2 Techniques (37 → 21)

**Retired outright (16):**

| File | Why |
|---|---|
| `audit-expressiveness.md`, `audit-conformance.md`, `audit-rule-hygiene.md`, `audit-rule-enforcement.md`, `audit-principles.md`, `audit-anti-patterns.md` | → one `audit-canon.md`. `audit-rule-hygiene.md:32-33` walks only `## Rule Hygiene Anti-Patterns` (`anti-patterns.md:306-392`) and `audit-rule-enforcement.md:32` walks **one entry**, `structure-backed-constraints` (`:1046`) — both strict subsets of the walk `audit-anti-patterns.md:33` performs in full. AP-105 (`:1366`): "keep at most one walker per home" |
| `derive-design-dimensions.md`, `prepare-dimension.md`, `capture-dimension.md`, `synthesize-update-specification.md`, `persist-design-specification.md` | → one `compose-change-brief.md`. `persist-design-specification.md` is pure ceremony: its sole output `{specification_path}` is read only in message text (`03:75`, `03:90`, `09:152`), and its Protocol `:30` delegates the write to the activity step that is already bound at `03:65-72` |
| `assemble-file-approach.md` | sole purpose is `drafting-plan.md`; `{drafting_plan_path}` is read once, at a checkpoint that is `blocking: false` + 30 s auto-advance **and** gated `operation_type != update` (`06:86-96`) |
| `review-draft-yaml.md` | sole purpose is `draft-attestation.md`; `{draft_attestation}` and `{reviewed_blocks}` are both baselined dead outputs. **Relocate `:51-52` binding-fidelity pass into `verify-artifact-conforms` before deleting** |
| `pattern-analysis.md` | its §7 role is absorbed by the conformance dimension of the sweep, which now takes `{reference_workflows}` from a bound `list-workflows` step |
| `context-loading.md` | both its artifacts die; its literacy gate is already vacuous — `01:210-223` sets `format_literacy_confirmed` and `schema_constructs_confirmed` by `action: set` with no evidence. Construct-inventory and convention citations already live at write time (`yaml-authoring.md:39,:44,:80,:84`) |
| `reconcile-design-assumptions.md` | whole assumption subsystem retired (see accepted losses) |
| `summarize-findings.md` | duplicate of `compile-report` — same guide cite (`compile-report.md:24` / `summarize-findings.md:24`), same output `{review_findings_count}`, split only by mode. AP-110 (`:1430`) |
| `scope-audit.md` | dead output, post-commit only |
| `conduct-retrospective.md` | → a section of `create-completion-doc`. AP-84 (`:1110`) |

**Added (3):** `audit-canon.md`, `load-known-findings.md`, `compose-change-brief.md`.
**Reduced, not retired (5):** `intake-classification.md` (drop §4/§5 `:83-90`, drop `structural_inventory_path` `:56-58`), `impact-analysis.md` (drop §7 persist prose that names "the calling activity's bound step" `:57` — AP-68(a); **add** `{change_constraints}` output), `review-drafted-file.md` (drop §2 `:45-48`), `verify-high-findings.md` (drop "the calling activity's" at `:41`; add `{open_finding_count}`, `{has_critical_finding}`), `reload-workflow.md` (add `{base_ref}`, `{surface_files}`, `{changed_files}`).

## 3.3 Resources (23 → 12)

**Retired (13):** `structural-inventory.md` (73) · `format-conventions.md` (61) · `applicable-constructs.md` (33, **zero citations anywhere in the corpus today**) · `design-specification.md` · `pattern-analysis.md` · `drafting-plan.md` (28) · `file-review-note.md` (28) · `draft-attestation.md` (33) · `design-assumptions.md` · `design-assumption-reconciliation.md` · `findings-satellite.md` (42) · `compliance-report.md` · `follow-ups.md` (29, orphan guide — no producing bind site).
**Added (2):** `change-brief.md`, `findings-register.md`.
**Survivors (12):** `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md`, `elicitation-guide.md`, `update-mode-guide.md`, `impact-analysis.md`, `scope-manifest.md`, `completion-artifact.md`, `readme-seed.md`, `change-brief.md`, `findings-register.md`, plus `README.md` (index).

`schema-construct-inventory.md` and `convention-conformance.md` **must survive** — they are named sole criteria homes (`audit-expressiveness.md:32`, `audit-conformance.md:32`). Retiring the walkers does not retire the homes; §29's Separation test (`design-principles.md:129-131`) is exactly why merging citers loses no criteria.

## 3.4 Variables (63 → 31)

**Delete (32), with `workflow.yaml` line cites:**
6 per-pass counts `:61-84` · `review_findings_count :53-56` (→ `open_finding_count`) · `headless_mode :41-44` · `assumption_decisions :45-48` (zero-read today) · `has_resolvable_assumptions :49-52` · `assumptions_log :232-234` · `open_assumptions :235-237` (dead) · `has_open_assumptions :238-241` · `design_dimensions :242-244` · `dimension_questions :181-184` · `format_literacy_confirmed :198-201` · `schema_constructs_confirmed :202-205` · `needs_audit_fixes :220-223` (pure projection of `open_finding_count > 0` — AP-112 `:1454`) · `needs_recommit :224-227` · and 14 path variables: `format_conventions_path :113-116`, `applicable_constructs_path :117-120`, `pattern_analysis_path :121-124`, `draft_attestation_path :133-136`, `structural_inventory_path :141-144`, `drafting_plan_path :145-148`, `file_review_note_path :149-152`, `expressiveness_findings_path :153-156`, `conformance_findings_path :157-160`, `rule_hygiene_findings_path :161-164`, `enforcement_findings_path :165-168`, `verified_findings_path :169-172`, `principle_findings_path :173-176`, `anti_pattern_findings_path :177-180`.

**Rename (2):** `specification_path :109-112` → `change_brief_path`; `review_findings_count` → `open_finding_count`. **Add (3):** `base_ref`, `remediation_round` (number, `defaultValue: 0`), `preservation_requested` (boolean, `defaultValue: false`).

Also delete `workflow.yaml:18` — the soft-gate/headless rule. With zero soft checkpoints its subject no longer exists; keeping it would restate structure (AP-19 `:310`, AP-79 `:1046`). Fix the three AP-126 producer tails at `:63`, `:71`, `:79` by deletion.

## 3.5 Accepted losses, named

1. **Create-mode 12-dimension elicitation** (`03:41-60`) — replaced by one `compose-change-brief` pass plus one batched question payload into Gate 1. §4 (`design-principles.md:29-31`) asks for *one clarifying question before acting*, not twelve; gap-batching is the sanctioned reduction (`workflow.yaml:37-40`).
2. **The assumption subsystem** — `reconcile-design-assumptions`, the unbounded while loop (`03:101-113`), `assumptions-log.md`, and the audit-vs-open resolvability vocabulary. Open judgements become a `change-brief.md` section surfaced at both hard gates. The loss is real: no automated resolution of schema-settled assumptions. Two of its three step pairs were provably no-ops already (`03:126-137` passes a literal `[]` to `review-assumptions::record`; `assumption_decisions` has no writer in the corpus).
3. **The positive "which construct should this have been" answer** from `audit-expressiveness.md:38`'s before/after rewrite, and **per-principle Pass/Partial/Violation** grading from `audit-principles.md:14,:29`. Mitigated by making them **Dimension values plus a required `Fix` column** on register rows, and by the Coverage section carrying the principle enumeration — but the merged walker will not grade 30 principles individually. This is the sharpest single loss in the design.
4. **Post-commit assurance** (§3.1).
5. **The §2 literacy gate as a gate.** It becomes a technique-internal citation obligation. It was already vacuous (`01:210-223`).

---

# 4. Canon constraints, and how the design satisfies each

## The 12 named entries

**AP-68 `technique-stage-agnostic`** (`resources/anti-patterns.md:906-916`). Every retained/new technique is rewritten to name no stage, checkpoint, or gate. This clears three **existing** hits: `audit-anti-patterns.md:42`, `verify-high-findings.md:41`, `impact-analysis.md:57` all say "via **the calling activity's** bound `manage-artifacts::write-artifact` step", which is Detect(a) verbatim ("named or 'calling/consuming/producing activity'"). Replacement form: the technique declares `#### artifact findings-register.md` on its output and its persist phase cites `[Findings Register Guide](../resources/findings-register.md#template)` — no activity named. Legal under the Do-not-flag at `:914` ("values the technique emits for the activity to route (counts, paths, severity)"). **This is also why the activity merge is cheap:** techniques are already stage-blind by mandate, so moving them between four activities instead of nine changes no technique text.

**AP-69 `no-activity-prose-rules`** (`:918-928`). Zero `rules:` blocks in all four activities — the corpus already has zero (grep over `activities/*.yaml`). Every cross-activity ordering constraint the merge dissolves is re-encoded structurally, not in prose:
| Was a transition/graph edge | Becomes |
|---|---|
| `01:248` → `requirements-refinement` (literacy gate) | deleted with the vacuous gate |
| `03:139`/`03:145` update-vs-create branch | `when: operation_type == update` on frame:8–9 and `when: operation_type != review` on frame:10–11 |
| `05:60`/`04:35` → `scope-and-draft` | intra-activity step order in `frame` |
| `09:237`/`10:227` → `retrospective` | intra-activity step order in `land` (land:10–12) |
| `10:221` → `intake-and-context` (unbounded) | `blocker-gate` branch with `remediation_round < 2` |
The one gate that must **not** become a step order is `frame → audit` in review mode: it stays a `transitions[].condition` on `and(operation_type == review, review_scope_confirmed == true)`, because 12 steps in old `03`/`04` carry **zero conditions** today and rely on transition topology for review-mode exclusion.

**AP-114 `pass-orchestration-in-technique`** (`:1478-1488`). The named exemplar at `:1480` is literally "`run-audit-passes`: Apply audit-expressiveness…" — i.e. the naive version of this consolidation. `audit-canon` lands inside the Do-not-flag carve-out at `:1486`: "a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist *one* product bag) with **no Protocol Apply/`::` work invoke**". Concretely: its Protocol contains zero `Apply [technique]` and zero `::` invocations; the two things it needs from elsewhere — the sibling survey and the persist — are **bound as their own activity steps** (`survey-reference-workflows` at audit:3, `persist-register` at audit:8), which is AP-114's Fix verbatim (`:1488`). This also corrects `audit-conformance.md:37`, which currently reads "Survey similar-type reference workflows **via** [list-workflows]" inside a Protocol phase.

**AP-116 `no-template-creation-guide`** (`:1502-1512`). The obligation is directional — filename → guide — so dropping 14 filenames *reduces* the burden; it cannot trip. All six survivors map: `README.md` → `meta/resources/planning-readme.md` + `readme-seed.md`; `change-brief.md` → new guide; `impact-analysis.md`, `scope-manifest.md`, `COMPLETE.md` → existing guides; `findings-register.md` → new guide. Each new guide carries `## Template` + operative `## Rules` and no wrapper ceremony (AP-90 `:1182`). The map at `resources/README.md:39-58` and the canonical-home map at `techniques/TECHNIQUE.md:73-86` are rewritten in the same commit. **Gap I am creating and must handle by hand:** no entry detects an *orphaned* guide — the nearest coverage is AP-92's "dissolve the resource when nothing template-shaped remains" (`:1216`). All 13 retired guides go in the same commit as their producers.

**AP-121 `rule-as-protocol-step`** (`:1562-1572`). `audit-canon`'s Protocol has four phases, each with a distinct produce outcome — load homes / apply entries over the surface / attribute and exclude / emit the row bag. None is "follow X throughout". The three standing invariants live under `## Rules` (below). Inversely, AP-25 keeps them out of Protocol.

**AP-34 `no-valueless-control-set`** (`:494-504`). The design has exactly two control `set`s and both are **value-BEARING orchestration state**: `bind-planning-folder-path` (frame:1) and `bump-round` (audit:10f) — permitted by the Do-not-flag at `:498` and by AP-33's Do-not-flag (c) at `:492`. This deletes six existing hits: `06:216-222` (4 value-LESS sets), `06:244-247` (4 more), `08:449-459` (2), `10:155-158` (1). Their targets become **declared technique outputs** on `verify-high-findings` — AP-33's Fix verbatim (`:504`, "Declare `### <target>` on the bound technique's `## Outputs`").

**AP-25 `no-one-step-rules`** (`:382-392`). `audit-canon`'s three Rules are each cross-cutting and provably span phases:
- `withdraw-unattributed` — binds phase 3 (attribution) *and* the output contract *and* the fix-loop's re-sweep input; a row with no `Origin` never reaches remediation.
- `walk-as-written` — binds phase 1 (load) and phase 2 (apply); no restating, summarizing, or renumbering criteria (`audit-anti-patterns.md:29` today, correctly).
- `structural-evidence-first` — binds phase 2 and phase 4; prefer fields/shapes/phrases the entry names over inferred intent.
Anything narrower (e.g. "record the enumeration in Coverage") becomes Protocol prose or a `>` caveat, per the Fix at `:392` and AP-59 (`:798`).

**§12 Output Economy** (`design-principles.md:61-63`). One canonical home per fact: one register (was 9 findings/report files), one close-out (was `COMPLETE.md` + `follow-ups.md` + a mis-named `completion.md`), one brief (was 4 files). Declared audience: register = agent (AP-96); brief/impact/scope/COMPLETE = human. Exception-only status: 19 announce-only steps deleted, including the four `*-clean` all-green announcements (`08:143-162`, `:220-239`, `:297-316`, `:374-393`) that each spend ~19 YAML lines and a 3-clause gate on one bit — AP-86 (`:1134`), AP-101 (`:1314`). One decision per checkpoint: 5 checkpoints, 5 distinct answer spaces, `selective-fixes` deleted as a duplicate of `fix-issues`.

**§20 Keep Orchestration in Structure** (`:93-95`). The reduction lands entirely in activity `steps[]`, `when`, checkpoints, one loop, one decision, and four `transitions` blocks. No sequencing moves into a technique Protocol; no technique names a stage or gate. The 4-activity count is achieved by **deleting nodes whose producers are retired**, not by hiding orchestration.

**§25 Bind Sibling Operations as Steps** (`:113-115`). Six audit walkers become **one walker plus three sibling binds in one activity's `steps[]`** (`survey-reference-workflows`, `validate-schema`, `verify-findings`) — not one fat technique. `write-artifact` remains a bound step at every persist site; the 27 bind sites drop to 8 only because 19 artifacts are gone, never because a technique started writing its own file. Deliberate consequence, stated: **step count is not the metric.** ~58 top-level steps for 4 activities is not much below 126 for 9 once ceremony is removed; the reduction that matters is in artifacts, variables, criteria walkers, and dispatches.

**§26 Atomic Techniques; Compose at Activities** (`:117-119`). Zero technique→technique work calls. I do **not** use the borrow clause to hit "4": all four are locally authored, because my audit design is single-context by intent and has nothing to fan out. Where fan-out becomes necessary — multi-target review over `{target_workflow_ids}` — the correct move is to borrow `meta/patterns/04-isolated-fan-out.yaml` (`meta/activities/patterns/README.md:22`, borrow mechanics `:29-37`) rather than author a local spawn recipe, per §18 (`:85-87`) and AP-110 (`:1430`).

**§30 Resources at the Abstract Level; Split for Section Delivery** (`:133-137`). Two applications:
1. The register guide is section-delivered (`## Template`, `## Findings`, `## Coverage`, `## Known`, `## Rules`), so the walker fetches the skeleton and a renderer fetches one anchor — this is what replaces the 7 per-pass satellite *files* with 1 file at no loss of per-dimension isolation.
2. `audit-canon` fetches `anti-patterns.md` **by section**, not whole-file. This is mandatory, not optional: the file is 128,341 bytes and the eager-resource cap is 80,000 (`SRV/src/utils/resource-delivery.ts:6`), so `audit-anti-patterns.md:28`'s whole-file link can never be bundled. Section slicing works on both delivery paths (`SRV/src/utils/resource-delivery.ts:38-47`; `SRV/src/tools/resource-tools.ts:779-786`).
   **Precondition I discovered and must fix first:** `anti-patterns.md` has 13 `## ` units (`:15, :78, :130, :182, :306, :394, :590, :942, :1018, :1106, :1338, :1402, :1622`) but **AP-126–129 sit at `:1666`, `:1676`, `:1688`, `:1700` — inside `## Authoring Guidance (MR)` (`:1622`)**. A sectioned walker that enumerates `## *Anti-Patterns` headings silently drops four entries, including AP-128 `unproduced-value-read` and AP-129 `stale-restatement-after-change` — the two entries this very migration most needs. Re-section the file (move AP-126–129 under a proper family heading) in the same commit, or the whole-surface sweep is quietly incomplete.

## Also binding, briefly

§3 / AP-07 `:158` — `scope-manifest.md` enumerated at frame:10–11, gated at frame:12, **re-verified** at land:1, gated at land:4. Two hard checkpoints carry the ordering across an activity boundary; the pair is never in one unguarded block.
§8 / §10 — `impact-analysis.md` is the confirmation substrate at frame:12; `{removal_count}` and `preservation_requested` are its recorded effects. The proposal itself is content-reducing, so it must run **through** this gate, with a removal inventory covering all 5 activities / 16 techniques / 13 resources / 32 variables.
§9 / AP-79 `:1046` — 13 declared checkpoints → 5, and every deleted one is deleted because it had **no recorded effect** (AP-89 `:1170`), not because its constraint was moved to prose. `scope_manifest_confirmed`, the one soft default that carried an effect (`06:46-48`) and gates 20 downstream steps, is promoted to a hard gate.
§14 / AP-112 `:1454` — 7 count variables → 1 `open_finding_count`; 14 findings/report paths → 1 `report_path`; `needs_audit_fixes` and `needs_recommit` deleted as projections.
§15 `:73-75` — the reorder-or-drop test: `04-pattern-analysis` and `05-impact-analysis` are reorderable topic partitions of one phase, so they get no nodes of their own. The absent `02`/`07` filenames show the corpus has already applied this twice.
§7 `:41-43` — divergence from the sibling many-small-activities convention (`remediate-vuln/workflow.yaml:322-330` borrows 8 `work-package` activities) is justified by §15's test and by the fact that 5 of the 9 nodes lose their producers entirely. Where a *pattern* exists, I borrow it (`meta/patterns/04-isolated-fan-out.yaml`) rather than invent.
§17 / AP-41 `:578` — all four `description`/`outcome` blocks and every README are re-authored from scratch in positive present. No text may say "no longer runs six passes."
§23 / AP-78 `:1034` — one fix cycle survives, bound to the surviving pass, with an actual editing step (`yaml-authoring` at 10a) that `06:223-247` lacks.
§24 / AP-113 `:1466` — the surviving `action: message` steps stay in activities; techniques never present.
§22 / AP-01 `:82` — reduction is by deletion only. No technique body inlined into an activity, no resource body inlined into a technique.
AP-38 `:542` — the merge's real trap: concatenation multiplies `write-artifact` binds in one file. Frame has 3 (distinct static targets, `:550` carve-out holds); audit has 2 (same filename at different pipeline points — also carved out); draft and land have 1 each. At no point does the roster become a clean iterable, so classification (b) never fires.
AP-128 `:1688` — every gate rewritten from a transition to a step `when` must be re-traced. `impact_analysis_path` and `change_brief_path` are read in the `approve-to-commit` message on a path where their producers are gated (`operation_type == update` / `!= review`), so those readers use the register/brief links conditionally or the producer arms are made exhaustive. **Do not paper over it with `defaultValue: ""`** — that is the exact defect at `05:28-37`, where `impact-no-removals` fires in create mode and emits a link to an empty path.
AP-129 `:1700` — the sweep-and-count obligation: one edit updating `README.md:13-21, 45-67, 83, 168, 180-188`, `activities/README.md:13-77` (9 headings that are anchor targets), `resources/README.md:12-35` and `:39-58`, `techniques/TECHNIQUE.md:70, 73-86`, `techniques/README.md:37,:40`, `commit-verification.md:18`, `readme-seed.md:30-46, :56, :60`, and `workflow.yaml:51, :87, :123, :127, :234`, with the occurrence count recorded in the manifest.

## Migration preconditions (not optional, from the blast-radius map)

1. **Six live sessions brick.** `get_activity` throws `Activity not found` for any removed id (`SRV/src/tools/workflow-tools.ts:602-609`), and `get_workflow_status` keeps reporting the dead id as healthy (`:1358, :1392`). QDDWIT is mid-second-pass at `intake-and-context`. Either drive all six to terminal first, or ship a rewriter over `.engineering/artifacts/planning/*/session.json` (including embedded `triggeredWorkflows[i].state`) mapping `currentActivity`/`completedActivities`/`skippedActivities`/`history[].activity` and re-keying `checkpointResponses` from `<old-act>-<cp>`.
2. **`check-resource-anchors.ts` is hard-zero with no baseline** and currently red at 3 (all outside workflow-design). This change breaks ≥10 `activities/README.md#NN-…` links plus ~35 anchored links into the 13 retired guides. Run `npx tsx SRV/scripts/check-resource-anchors.ts --root <worktree>` and require the count to stay at exactly 3.
3. **Fix `audit-schema-validation.md:24,:30,:34` to pass `--root {target_path}`** and to name `check:anchors`, `check:fragments`, `check:variable-model`, `check:activity-tech`. Today the workflow validates the stale main checkout with 3 of 10 guards — a PR can pass its own gate while the corpus is broken. This is a prerequisite, not a follow-up.
4. Delete `SRV/scripts/review-mode-gating-baseline.json:7` by hand (already stale — the guard skips workflow-design at `:150-152` because it declares no `is_review_mode`).
5. Delete each variable declaration, its technique output entry, and every `{token}` read **atomically** — `check-binding-fidelity.ts:474-481` fires NEW on an unresolved read, and `:485` means stripping a `#### artifact` block removes the dead-output exemption.

---

# 5. The audit-stage design

## 5.1 One walker, four homes

Six walkers over four homes today, three of them on `anti-patterns.md`:

| Retired walker | Home it names | Scope |
|---|---|---|
| `audit-anti-patterns.md:28` | `anti-patterns.md` | every `### AP-XX` entry (`:33`) |
| `audit-rule-hygiene.md:32-33` | `anti-patterns.md` | `## Rule Hygiene Anti-Patterns` only (`:306-392`) |
| `audit-rule-enforcement.md:32` | `anti-patterns.md` | **one entry** — `structure-backed-constraints` (`:1046`) |
| `audit-principles.md:28` | `design-principles.md` | 30 principles |
| `audit-expressiveness.md:32` | `schema-construct-inventory.md` | 6 mapping tables |
| `audit-conformance.md:32,:37` | `convention-conformance.md` + live sibling survey | 6-concern checklist |

`audit-canon.md` — one atomic capability, four phases:

1. **Load homes.** `get_resource` per section: `anti-patterns.md` by its `## ` families (§30, after re-sectioning AP-126–129), plus `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` whole (each well under the 80,000-char cap). All sections land in **one** worker context — section addressing is a delivery mechanism, not a context split.
2. **Apply every entry over the whole surface.** Walk each entry as written against `{surface_files}`; honour Do-not-flag; record Fix. Never restate, summarize, or renumber; never cite the catalogue's entry count (`anti-patterns.md:25`). Take `{reference_workflows}` and `{change_constraints}` as declared inputs.
3. **Attribute and exclude.** Derive `Origin` per row by re-checking the cited construct against `{base_ref}`; mark rows matching `{known_finding_keys}` as Known. Record the enumeration walked per home.
4. **Emit one product bag.** `{audit_findings}` — rows tagged `dimension ∈ {anti-pattern, principle, expressiveness, conformance}` plus the Coverage lines. `#### artifact findings-register.md`.

**Rules:** `withdraw-unattributed`, `walk-as-written`, `structural-evidence-first`.
**No `Apply`, no `::`** — AP-114's carve-out at `:1486`. Criteria loss: **zero**, guaranteed by §29's Separation test (`design-principles.md:129-131`) — the walker cites, it does not author, so the number of walkers is independent of the criteria.

Retained as separate steps because they are separate produce paths over different substrates: `audit-schema-validation` (three validator scripts, `{pass_count}`/`{fail_count}`) and `verify-high-findings` (adversarial re-derivation over the row set).

## 5.2 The four properties, each with its structural mechanism

**(a) Mandatory base attribution.** Today this is *optional*: `resources/compliance-report.md:77` says "note new-vs-pre-existing only when it changes the decision", and `summarize-findings.md:14` mentions "new findings introduced by the update" with no mechanism. Making it mandatory takes three coupled moves: `{base_ref}` becomes a **declared input** to `audit-canon` (produced by `reload-workflow`, so AP-128 can trace it); `Origin` becomes a **required column** in the register guide's Template, not an optional note; and the Rule `withdraw-unattributed` makes an unattributed row ineligible for the register's Findings section. The gate consumes it: `has_critical_finding` and `open_finding_count` count only `Origin: diff` rows, so a pre-existing defect cannot block a commit it predates.

**(b) Known-item exclusion.** `load-known-findings` (audit:2) is bound **before** the sweep and produces `{known_finding_keys}` from the four baselines (`binding-fidelity-baseline.json` alone holds 256 entries, 13 of them workflow-design's) plus the prior run's register. `{known_finding_keys}` is a declared input to `audit-canon`; matches route to the register's `## Known` section, outside the decision surface. This is AP-86 applied properly (`:1134`): the decision surface is divergences-only relative to the known set. **Named hazard:** no guard keeps those baselines honest — `check-variable-model.ts` has no unused-variable rule, and `check-binding-fidelity.ts` currently reports 22 already-fixed entries that an unreviewed `--update-baseline` would silently bank. A stale baseline suppresses live findings. Mitigation in the design: the register's `## Known` section is persisted, so every suppressed row is auditable in the diff rather than invisible.

**(c) Evidenced negatives.** A dimension with no findings must publish the **enumeration** it walked, per §11's clause (`design-principles.md:57-59`). The `## Coverage` section carries one line per home naming the enumeration identity — "walked every `### AP-XX` subsection present in the loaded sections of `anti-patterns.md`", "walked every `## N.` section of `design-principles.md`" — with no instance count and no catalogue count. This is why the register persists even at zero rows, and it clears AP-87 (`:1146`) because Coverage is not a "None/N/A" section; it clears AP-86 (`:1134`) because it is not a per-dimension pass/fail table but the grounding of a verdict, and AP-86's Do-not-flag at `:1142` explicitly preserves data downstream steps parse — which Coverage is, since next run's `load-known-findings` reads it.

**(d) Single context over the whole diff.** Four mechanisms, all structural:
- **One bind site.** `audit-canon` is bound once per pass (plus once in the fix loop). No `forEach` over dimensions, no per-lens dispatch, no fan-out — the six-walker shape is what forced six contexts.
- **Whole surface as one declared input.** `{surface_files}` is the changed set *plus containing files*, produced by one `reload-workflow` step. The walker never sees a slice it did not ask for.
- **Ungated steps 1–8** so the whole audit pipeline is eager-bundleable in one `get_activity` payload. Today `08` has **0 of 27** eligible because every top-level step carries a `condition` and both loops are `condition`-gated, excluding their bodies too (`SRV/src/tools/workflow-tools.ts:713-719`) — 27 sequential `get_technique` round-trips.
- **Section-delivered canon.** 128 KB of catalogue reaches one context as ~11 section fetches instead of being un-bundleable whole-file (`resource-delivery.ts:6`) or re-fetched per walker.

**One deliberate context split, and it is load-bearing:** `verify-high-findings` runs as a **separate dispatch**. Its rule `refute-by-default` requires re-deriving each High "without reading the originating pass's reasoning" (`verify-high-findings.md:28`). In the same context as the sweep, that instruction is unenforceable. This is the mechanism behind the 8-Highs-vs-3-Highs spread in the brief — the bare sweep's 8 are pre-verification counts; the full pass's 3 are post-verification — and it must survive consolidation, because it is the workflow's only severity calibration and it exists at only 2 of the corpus's 3 audit sites today.

**Also fixed here:** review mode's multi-target loop currently writes fixed bare filenames *inside* a `forEach` over ≤20 targets (`08:7-61`), so `write-artifact`'s find-or-update leaves only the last target's satellites, and `compile-report` (which sets the count) is inside the loop while `persist-compliance-report` (`:62`) is outside — so the disposition message reports the last target's count as the total. In the target design the register accumulates per-target sections inside the loop (a scatter-gather accumulator, explicitly permitted by AP-33's Do-not-flag (a) at `:492`) and persists **once**, outside it.

---

# 6. Dispatch count and token budget

**Baseline dispatches, per pass:**

| Dispatch | Worker | Why it must be separate |
|---|---|---|
| 1 | `frame` | interactive gates; `get_activity` boundary |
| 2 | `draft` | edit worktree; per-file loop in one context |
| 3 | `audit` sweep | the whole-surface single context |
| 4 | `verify-high-findings` | **independence** — `refute-by-default` (`verify-high-findings.md:28`) is unenforceable in the sweep's context |
| 5 | `land` | commit/publish; Gate 2 |

**= 5 dispatches on a clean run; 6–7 with one or two fix rounds** (each round re-dispatches the sweep scoped to `{fixes_applied}` plus a fresh verify). `maxIterations: 2` on the fix cycle caps it.

**Per-dispatch cost model, from measured facts:**

- **Fixed floor, every dispatch:** `CORE_WORKER_TECHNIQUES` (7 ops, `SRV/src/loaders/core-ops.ts:52-62`) + inherited `techniques.activity: [variable-binding]` (`workflow.yaml:19-21`) ≈ 16 KB raw before composition ≈ **~4k tokens**. Reference-mode collapse cannot help — it is invalid for fresh disposable workers (`SRV/src/tools/workflow-tools.ts:588-590`).
- **Activity YAML, delivered verbatim** (`readActivityRaw` → body, `:608-611`). Target ~150–180 lines/activity vs `08`'s 530 today, and with `condition:` blocks collapsed to `when:` the per-dispatch YAML lands ≈ 6 KB ≈ **~1.5k tokens** (vs ~6k for `08` alone today).
- **Canon, once:** `anti-patterns.md` 128,341 B + `design-principles.md` ~9 KB + `schema-construct-inventory.md` + `convention-conformance.md` ≈ 150 KB ≈ **~38k tokens**, paid **once** on the sweep (and partially on each re-sweep, section-scoped to the families that produced findings).
- **Surface + baselines** on the sweep: a workflow-design-scale diff ≈ 30–60k tokens; `{known_finding_keys}` compact ≈ 5k.

| Dispatch | Estimate |
|---|---|
| frame | 30–50k |
| draft | 40–70k |
| audit sweep | 90–120k |
| verify | 25–40k |
| land | 25–40k |
| **clean run** | **210–320k** |
| + 2 fix rounds (re-sweep section-scoped + re-verify) | +80–160k |
| **worst case** | **~480k** |

**Why this beats 1.43M, mechanically, not aspirationally.** The old cost is dominated by three multipliers the design removes: (i) 12 dispatches × the ~16 KB ops floor, re-delivered in full each time; (ii) `audit-anti-patterns` has **5 bind sites** and reloads all 128 KB at each (`audit-anti-patterns.md:28`, whole-file link), `audit-principles` 5, `audit-schema-validation` 6 — worst case **46 audit invocations in one update run** (6 in `06` + 16 in `08` + 24 in `10`), against the target's **2–4 canon loads**; (iii) `08`'s 27 lazy `get_technique` round-trips because no step is eager-eligible.

It lands **above** the bare sweep's 410k/2-dispatch figure on dispatch count and roughly at or below it on tokens, and buys back what the bare sweep had no mechanism for: schema validation, verified severity, an evidenced-negative record, scope re-verification, and a commit gate.

---

# 7. The three biggest risks in this design

**R1 — One walker is one attention budget, and I have one data point that it is enough.** Six dispatches gave six independent passes at the surface; the sweep gives one. The bare sweep's 8 Highs came from a *human-authored prompt naming two homes* — `anti-patterns.md` and `design-principles.md`. My walker carries **four**, adds base attribution and known-item exclusion as extra per-row work, and adds `{change_constraints}` and `{reference_workflows}` as inputs. The plausible failure is dilution: the anti-pattern catalogue's 129 entries crowd out the 30 principles, and the conformance/expressiveness dimensions degrade to a skim. The Coverage section makes dilution *visible* after the fact but nothing forces depth, and §29's Separation test guarantees only that no criterion is *lost from the corpus* — not that any given run applies it. If I could instrument one thing before shipping, it is this: run the sweep and the six current passes over the same diff and compare per-dimension yield. I have not; the design rests on the two-agent result generalizing from two homes to four.

**R2 — Deleting `headless_mode` makes every run block on five human gates, and the alternative reintroduces the defect it removes.** All five surviving checkpoints are hard: no `defaultOption`, no `autoAdvanceMs`. A yielded checkpoint blocks every tool (`SRV/src/utils/session/params.ts:38-46`), so an unattended run stalls at `design-intent-batch`. `headless_mode` currently defaults **true** (`workflow.yaml:41-44`), which strongly suggests the 12-dispatch pass ran unattended — meaning this design would not have completed it as-is. The tempting fix is to give `scope-and-impact-confirmed` a `defaultOption`, which recreates exactly what I deleted: `05:39` auto-confirming removals nobody approved while `05:62-65` claims "every flagged removal is one the user consciously approved", and `09:54-77` auto-selecting **proceed-to-commit** on schema-invalid files after 30 s. There is no clean escape; the honest position is that this workflow now requires a human at five points, and that trade should be decided explicitly, not by re-adding auto-advance.

**R3 — Retiring the post-commit audit makes the last-mile guarantee behavioural, not structural.** The design's claim is "nothing lands unaudited", enforced by the fix cycle re-sweeping before `land`. But `maxIterations` and `breakCondition` are **agent-honoured, not server-enforced** (`SRV/src/schema/activity.schema.ts:144-145`; `SRV/schemas/README.md:34`), step order is not server-enforced (`step_manifest` order is a warn-only subsequence check, `SRV/src/utils/validation.ts:104-115`), and `blocking: true` is advisory (`SRV/src/schema/activity.schema.ts:111`). So a worker that skips step 10c and advances to `land` produces a commit whose final edits were never audited, and nothing in the schema or the server stops it. That is a §9 violation I am knowingly accepting — the constraint has no structural backing (AP-79 `:1046`), which is precisely the defect class `audit-rule-enforcement` existed to catch, and which I have just merged into a general walker. The only real mitigations available are Gate 2's payload (`{open_finding_count}` interpolated at `approve-to-commit`, so a human sees a non-zero count before approving) and the `blocker-gate` decision — both of which route through the same agent that would have skipped the step.
