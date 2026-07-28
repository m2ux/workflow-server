Corpus root (absolute): `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design/`. All paths below are relative to that root. Counts verified on disk: `techniques/` = 39 files = **37 techniques + `README.md` + `TECHNIQUE.md`** (the shared base contract, not a bindable technique); `resources/` = 24 files = **23 resources + `README.md`** (matches `README.md:27` "23 resources"); `workflow.yaml` = 265 lines, **63 variables**; `activities/` = 9 YAML (gaps at 02/07 are declared intentional, `README.md:9`).

---

# 1. Technique inventory (37 workflow-local, all bound)

Every technique is **workflow-design-local**. Nothing is copied from `meta` or `work-package`; cross-workflow operations are referenced by `::`-path at bind sites only (`techniques/README.md:33-42`). The cross-workflow set actually bound: `work-package::manage-artifacts::write-artifact` (27 sites), `work-package::review-assumptions::collect|record` (`03:92`, `03:132`), `work-package::stakeholder-overview` (`01:196`), `work-package::manage-git::remove-worktree` (`11:41`), `workflow-engine::create-readme` (`01:159`) / `verify-readme-conforms` (`09:127`, `10:174`), `version-control::commit-regular-files` (`09:24`, `09:170`, `10:182`) / `push-branch` (`09:180`, `10:189`), `github-cli-protocol::create-pr` / `mark-ready` (`09:201`, `09:215`, `10:202`). Activity-level strategy techniques: `variable-binding` (`workflow.yaml:19-21`), `scatter-gather` (`03:6-7`, `06:6-7`).

| Technique | Capability (verbatim, `:6-8`) | Declared Inputs | Declared Outputs | Bound by (activity:line) |
|---|---|---|---|---|
| `intake-classification` | Operation-type classification and design-intent baseline for create, update, or review | (TECHNIQUE.md shared) | `operation_type`, `operation_type_ambiguous`, `change_request_clear`, `intent_needs_confirmation`, `headless_mode`, `workflow_id`, `target_workflow_id`, `target_workflow_ids`, `structural_inventory` (+`#### artifact structural-inventory.md`), `structural_inventory_path`, `change_category` | 01:15 |
| `context-loading` | Schema-system and YAML-convention literacy for the design intent | — | `format_conventions_path` (+artifact `format-conventions.md`), `applicable_constructs_path` (+artifact `applicable-constructs.md`) | 01:173 |
| `derive-design-dimensions` | Ordered design-dimension set … from the elicitation-guide mode dimension sets | `operation_type` | `design_dimensions` | 03:29 |
| `prepare-dimension` | Markdown-ready elicitation prompt for a single design dimension | `current_dimension` | `dimension_questions` | 03:53 |
| `capture-dimension` | User answers for a single design dimension … folded into the running design specification | `current_dimension`, `dimension_questions` | `accumulated_design` | 03:61 |
| `synthesize-update-specification` | Update-mode design specification covering only dimensions that change | `operation_type`, `change_category`, `structural_inventory`, `report_path`? | `accumulated_design` | 03:32 |
| `persist-design-specification` | Durable planning-folder review surface for the accumulated design specification | — | `specification_path` (+artifact `design-specification.md`) | 03:64 |
| `reconcile-design-assumptions` | Autonomous resolution of schema- and convention-settled design assumptions | `assumptions_log` | `assumptions_log`, `open_assumptions`, `has_open_assumptions`, `has_resolvable_assumptions` | 03:100, 03:113 |
| `pattern-analysis` | Structural and content pattern extraction from comparable workflows | — | `pattern_analysis` (+artifact), `pattern_analysis_path` | 04:9 |
| `impact-analysis` | Impact assessment of proposed changes against an existing workflow | — | `removal_count`, `impact_analysis_path` (+artifact) | 05:9 |
| `derive-workflows-target-path` | Dedicated workflows edit-root path from the planning folder basename | `planning_folder_path` | `target_path` | 06:11 |
| `prepare-workflow-branch` | Dedicated workflows edit worktree at the target path on the workflow feature branch | `target_path`, `workflow_id`, `operation_type`, `repo_root`? | `workflow_branch`, `worktree_created` | 06:19 |
| `scope-definition` | Complete scope and structure definition as a lean scope manifest | — | `scope_manifest` (+artifact), `file_count`, `scope_manifest_path` | 06:27 |
| `assemble-file-approach` | Lean per-file drafting plan — the delta for this file only | `current_file`, `operation_type` | `drafting_plan` (+artifact), `drafting_plan_path` | 06:77 |
| `yaml-authoring` | Schema-valid workflow YAML files | `schema_type`, `reference_file`? | `yaml_file` | 06:106, 08:480, 10:128 |
| `review-drafted-file` | Lean review note for a drafted file — delivered delta and (on update) removals | `current_file`, `operation_type` | `file_review_note` (+artifact), `file_review_note_path`, **`has_unflagged_removals`** | 06:109 |
| `review-draft-yaml` | Block-indexed draft review … with per-construct rationale and draft attestation | `drafted_files`, `operation_type` | `reviewed_blocks`, `draft_attestation`, `draft_attestation_path` (+artifact) | 06:165 |
| `verify-artifact-conforms` | Design-session planning-artifact conformance check against … output-discipline Rules and canonical-home map | — | `artifact_conformance{conforms,violations}` | 06:176 |
| `audit-expressiveness` | Schema-expressiveness audit of drafted content against formal schema constructs | — | `expressiveness_findings` (+artifact), `expressiveness_finding_count`, `expressiveness_findings_path` | 08:108, 08:489, 10:12, 10:137 |
| `audit-conformance` | Convention-conformance audit … against sibling reference workflows | — | `conformance_findings` (+artifact), `conformance_finding_count`, `conformance_findings_path` | 08:185, 08:492, 10:28, 10:140 |
| `audit-rule-hygiene` | Rule-hygiene audit of `rules[]` … against the anti-pattern catalog | — | `rule_hygiene_findings` (+artifact), `rule_hygiene_finding_count`, `rule_hygiene_findings_path` | **08:262, 08:495 only** |
| `audit-rule-enforcement` | Structure-backed-constraint audit of every `rules[]` entry for text-only critical rules | — | `enforcement_findings` (+artifact), `enforcement_finding_count`, `enforcement_findings_path` | **08:339, 08:498 only** |
| `audit-principles` | Design-principles adherence audit … with compliance classification and citations | — | `principle_findings` (+artifact), `principle_findings_path` | 06:179, 06:229, 08:25, 10:44, 10:143 |
| `audit-anti-patterns` | Anti-pattern catalog audit … including harness-tool and bootstrap-resource consistency entries | — | `anti_pattern_findings` (+artifact), `anti_pattern_findings_path` | 06:187, 06:232, 08:36, 10:55, 10:146 |
| `audit-schema-validation` | JSON-schema and loader reference-resolution validation across a workflow's YAML files | — | `pass_count`, `fail_count` | 08:47, 08:483, 09:32, 10:66, 10:131, 10:149 |
| `verify-high-findings` | Independent High-tier audit-finding verification before remediation | — | `verified_findings`, `verified_findings_path` (+artifact) | 08:50, 08:416 |
| `apply-audit-fixes` | Applied-fix record for selected audit findings with post-edit schema-validation results | `selected_findings` | `fixes_applied` | 06:226, 08:486, 10:134 |
| `compile-report` | Rolled-up compliance report from every review-mode audit pass | `principle_findings_path`?, `anti_pattern_findings_path`? | `compliance_report`, `review_findings_count` | 08:61 |
| `summarize-findings` | Severity-rated summary of post-update audit findings | — | `findings_summary`, `review_findings_count` | 10:72, 10:152 |
| `scope-audit` | Scope-discipline audit of the committed change set against the confirmed scope manifest | — | `scope_drift_findings` | 10:69 |
| `reload-workflow` | Fresh post-commit workflow definition as the audit baseline | — | — | 08:22, 10:9 |
| `scope-verification` | Scope-manifest completeness check against the reviewed draft | — | `total_count`, `addressed_count`, `unaddressed_count` | 09:80, 10:171 |
| `readme-authoring` | Root `README.md` that orients readers to the workflow's purpose, structure, and links | `operation_type` | `workflow_readme` (+artifact `README.md`) | 09:139 |
| `commit-verification` | Verification that a commit on the session edit worktree landed completely | — | — | 09:178, 10:186 |
| `publish-workflow-pr` | Workflow-design PR title and body composed from bound planning artifacts | — | `title`, `body` | 09:194, 10:199 |
| `create-completion-doc` | Design-session completion summary in the planning folder | `operation_type` | `completion_document` (+artifact `COMPLETE.md`) | 11:9 |
| `conduct-retrospective` | Session retrospective surfacing friction points and prioritized workflow improvements | — | `retrospective_document` (+artifact `COMPLETE.md`) | 11:30 |

---

# 2. Resource inventory (23)

## 2a. 1:1 creation guides — 13 (one guide ↔ exactly one bare filename)

Per `resources/README.md:41-58`:

| Resource | Artifact it guides | Cited from | Produced at |
|---|---|---|---|
| `design-specification.md` | `design-specification.md` | `persist-design-specification.md:25,:30`; `impact-analysis.md:58` | 03:70 |
| `impact-analysis.md` | `impact-analysis.md` | `impact-analysis.md:57` | 05:20 |
| `pattern-analysis.md` | `pattern-analysis.md` | `pattern-analysis.md:14,:37,:41` | 04:15 |
| `scope-manifest.md` | `scope-manifest.md` | `scope-definition.md:45,:49,:53` | 06:33 |
| `structural-inventory.md` | `structural-inventory.md` | `intake-classification.md:50,:85,:89` | 01:21 |
| `drafting-plan.md` | `drafting-plan.md` | `assemble-file-approach.md:24,:38,:44` | 06:83 |
| `file-review-note.md` | `file-review-note.md` | `review-drafted-file.md:24,:42,:47` | 06:115 |
| `draft-attestation.md` | `draft-attestation.md` | `review-draft-yaml.md:24,:28,:42,:47` | 06:171 |
| `design-assumptions.md` | `assumptions-log.md` | `reconcile-design-assumptions.md:14,:20,:38` | 03:92/:132 via `review-assumptions` |
| `completion-artifact.md` | `COMPLETE.md` | `create-completion-doc.md:20,:43` | **11:20/:36 write `completion.md` — name mismatch** |
| `format-conventions.md` | `format-conventions.md` | `context-loading.md:46` only — **the persist step `:54` does not cite the guide** | 01:179 |
| `applicable-constructs.md` | `applicable-constructs.md` | **ZERO citations** — `context-loading.md:26,:59` name the file as a bare string, never link the guide | 01:187 |
| `follow-ups.md` | `follow-ups.md` | `TECHNIQUE.md:83` (map row) only | **never produced — no write-artifact step anywhere** |

## 2b. Shared (non-1:1) guides — 3

| Resource | Fan-out | Consumers |
|---|---|---|
| `findings-satellite.md` | **1:7** (`findings-satellite.md:10`) | `audit-expressiveness.md:43`, `audit-conformance.md:48`, `audit-rule-hygiene.md:45`, `audit-rule-enforcement.md:44`, `audit-principles.md:38`, `audit-anti-patterns.md:42`, `verify-high-findings.md:41` |
| `compliance-report.md` | **1:2** — `compliance-review.md` \| `post-update-review.md` (`compliance-report.md:13`) | `compile-report.md:24,:34`; `summarize-findings.md:24`; `findings-satellite.md:10` |
| `readme-seed.md` | planning `README.md`, paired with `meta/resources/planning-readme.md` | consumed as `seed_profile: workflow-design/readme-seed` at 01:164, 09:131, 10:178 |

## 2c. Criteria / vocabulary resources — 7 (NOT creation guides)

| Resource | Role | Sole-source consumer |
|---|---|---|
| `anti-patterns.md` (1710 lines, **AP-01…AP-129 + MR-1…MR-4 in 12 sections**) | Detect/Do-not-flag/Fix catalogue | `audit-anti-patterns.md:28` (full walk), `audit-rule-hygiene.md:32` (scoped), `audit-rule-enforcement.md:32` (1 entry), write-time via `TECHNIQUE.md:60-62`, `reconcile-design-assumptions.md:39` |
| `design-principles.md` (30 principles, 137 lines) | positive stance, **no Detect triad** (`resources/README.md:13,:68`) | `audit-principles.md:28` (sole stance source), `readme-authoring.md:31`, `yaml-authoring.md:44`, `audit-rule-enforcement.md:33` |
| `schema-construct-inventory.md` (6 mapping tables, `:27-98`) | informal→formal construct maps | **`audit-expressiveness.md:32` — "sole source of informal→formal construct mappings for this pass"**; also `context-loading.md:37`, `yaml-authoring.md:39` |
| `convention-conformance.md` (6-concern checklist `:14-21`) | sibling-workflow baseline | **`audit-conformance.md:32` — "sole source of reference-convention criteria"**; `context-loading.md:38`, `yaml-authoring.md:80,:84` |
| `elicitation-guide.md` | mode dimension sets + question bank | `derive-design-dimensions.md:26`, `prepare-dimension.md:14,:26`, `capture-dimension.md:14,:18,:30`, `synthesize-update-specification.md:43` |
| `update-mode-guide.md` | change-category vocabulary | `intake-classification.md:62,:94` |
| `design-assumption-reconciliation.md` | `audit` vs `open` resolvability vocabulary | `reconcile-design-assumptions.md:39` |

13 + 3 + 7 = 23. ✅

---

# 3. Answers

## 3a. Techniques that exist ONLY to persist an artifact

Test applied: does the technique contribute any variable that a `condition` / `when` / loop / decision / transition reads? If not, its whole output is a document plus a path interpolated into message text.

**Pure-persistence techniques (3):**

1. **`persist-design-specification.md`** (35 lines) — sole output `specification_path` (`:12`). Read only in message text: `03:75`, `03:90`, `09:152`. No gate. Its Protocol `:30` explicitly delegates the write to "the calling activity's bound `manage-artifacts::write-artifact` step" — and `03:65-72` *is* that step. The technique is a wrapper around a bind it doesn't perform.
2. **`assemble-file-approach.md`** (45 lines) — outputs `drafting_plan` (`:22`), `drafting_plan_path` (`:30`). `drafting_plan_path` is read exactly once, `06:93`, inside a checkpoint that is `blocking: false` + `autoAdvanceMs: 30000` (`06:94-96`) **and** gated `operation_type != update` (`06:88-92`). So in update mode the artifact is written and never shown; in headless create (`workflow.yaml:41-44` default true) the gate self-resolves. No consumer.
3. **`review-draft-yaml.md`** (52 lines) — outputs `reviewed_blocks` (`:22`, bound `06:172`), `draft_attestation` (`:26`), `draft_attestation_path` (`:30`, read `06:292`, `06:310`, `09:152` — all message text). Both `draft_attestation` and `reviewed_blocks` are recorded **dead outputs** in `scripts/binding-fidelity-baseline.json`. The one non-persistence asset is Protocol §3's binding-fidelity pass (`:51-52`: confirm every artifact-persisting step is a bound `steps[]` entry, not protocol prose, and every required input has a producer) — that must be relocated, not deleted.

**Deliberately excluded from the pure list:**
- `review-drafted-file.md` — also emits **`has_unflagged_removals`** (`:34`), which is the sole gate on `06:139-152` `preservation-check`, a hard safety checkpoint (no `defaultOption`, no `autoAdvanceMs`, and named as a stay-interactive safety gap at `workflow.yaml:18`). Its §2 persist phase (`:45-48`) retires; the technique does not.
- `summarize-findings.md` / `compile-report.md` — both set `review_findings_count`, which gates `10:87`, `10:103`, `10:232` and drives the remedia while-loop. But they are a **duplicate-shared-capability pair** (AP-110, `anti-patterns.md:1430`): same target guide (`compile-report.md:24` and `summarize-findings.md:24` both cite `compliance-report.md#template`), same output variable, split only by mode.
- `scope-audit.md` — bound at `10:69`, but its only output `scope_drift_findings` (`:12`) is a **baseline-recorded dead output**, is never persisted by any step, and is never read. It is dead work rather than persistence.

**Persist-only Protocol phases inside otherwise-substantive techniques** (surgery targets, not whole-file retirements):
`context-loading.md` §6 `:52-55` + §7 `:57-60` · `intake-classification.md` §4 `:83-85` + §5 `:87-90` · `impact-analysis.md` §7 `:55-59` · `pattern-analysis.md` §4 `:39-41` · `scope-definition.md` §6 `:51-55` · `review-drafted-file.md` §2 `:45-48` · `audit-expressiveness.md` §3 `:40-44` · `audit-conformance.md` §4 `:45-49` · `audit-rule-hygiene.md` §3 `:42-46` · `audit-rule-enforcement.md` §3 `:41-45` · `audit-principles.md` §3 `:36-38` · `audit-anti-patterns.md` §3 `:40-42` · `verify-high-findings.md` §4 `:39-41` · `create-completion-doc.md` §4 `:41-43` · `conduct-retrospective.md` §5 `:38-40`.

### Confirming the nine named guides

| Named in #321 | Verdict |
|---|---|
| `draft-attestation.md` | ✅ 1:1 guide. Retires with `review-draft-yaml` (whole technique) + `06:163-173`, `06:285-326`. |
| `drafting-plan.md` | ✅ 1:1 guide. Retires with `assemble-file-approach` (whole technique) + `06:78-103`. |
| `file-review-note.md` | ⚠️ 1:1 guide, but **`06:152` preservation-check links it as evidence in a hard safety gate**. Guide + persist retire; `has_unflagged_removals` must survive. |
| `format-conventions.md` | ✅ 1:1 guide. Also: `01:174-181` has **no `condition`**, so it fires in review mode too, while `01:182-194` is create-gated — `context-loading.md:55,:60` says both are create-only. Retiring it removes an existing bug. |
| `structural-inventory.md` | ⚠️ 1:1 guide, but `structural_inventory` (not the path) is a **declared input to `synthesize-update-specification.md:20-22`** and is loaded at its `:38`. The *artifact* can go; the in-session value cannot. |
| `findings-satellite.md` | ❌ **Not 1:1 — 1:7** (`:10`). Retires only if all seven satellites go; it is the single largest lever (7 persist steps, 7 path variables). |
| `applicable-constructs.md` | ✅ 1:1 guide, and **already broken**: zero citations anywhere; its path variable is never read. Free to delete. |
| `schema-construct-inventory.md` | ❌ **Not a creation guide at all.** `resources/README.md:14` files it as "Prose-to-formal construct mapping tables" and `audit-expressiveness.md:32` names it "sole source of informal→formal construct mappings for this pass." Dropping it retires the **expressiveness audit**, not an artifact. |
| `compliance-report.md` | ❌ **Not 1:1 — 1:2** (`:13`). Retires only if both review mode's `compliance-review.md` and update mode's `post-update-review.md` go — i.e. only if activity 08's review loop *and* activity 10 both go. |

## 3b. Which of the 6 audits can collapse — and what is lost

**Criteria homes, read from the techniques:**

| Pass | Criteria home | Scope |
|---|---|---|
| `audit-anti-patterns` | `anti-patterns.md` (`:28`) | **every** `### AP-XX` entry (`:33`) — AP-01…AP-129 + MR-1…MR-4, 12 sections |
| `audit-rule-hygiene` | `anti-patterns.md` (`:32`) | **`## Rule Hygiene Anti-Patterns` only** (`:33`) = AP-19…AP-25, `anti-patterns.md:306-392` |
| `audit-rule-enforcement` | `anti-patterns.md` (`:32`) | **one entry**: `structure-backed-constraints` = AP-79, `anti-patterns.md:1046` |
| `audit-expressiveness` | `schema-construct-inventory.md` (`:32`) | 6 mapping tables, `:27-98` |
| `audit-conformance` | `convention-conformance.md` (`:32`) **+ live sibling survey** (`:37`) | 6-concern checklist `:14-21` |
| `audit-principles` | `design-principles.md` (`:28`) | 30 principles; explicitly **"Do not re-derive prohibited-pattern Detect here"** (`:30`) |

**Collapse with zero criteria loss — 2:**

`audit-rule-hygiene` and `audit-rule-enforcement` are **strict subsets** of a walk `audit-anti-patterns` already performs in full. AP-19…AP-25 and AP-79 live inside `anti-patterns.md`, which `audit-anti-patterns.md:33` walks entry-by-entry. The catalogue names this exact shape in its own voice: **AP-105 `no-shadow-audit-pass`** (`anti-patterns.md:1366-1376`) — "An audit pass shadows another walker's Detect criteria… keep at most one walker per home." Its "Do not flag" carve-out (`:1374`) *tolerates* thin scoped walkers; it does not justify them. Retiring both is a pure subtraction: 2 techniques, 91 lines, 2 finding-count variables, 2 satellites, 8 activity steps, and 4 clean/flagged announce actions.

**Collapse loses real capability — 4:**

- **`audit-conformance`** — `:37` requires surveying similar-type reference workflows via `meta::workflow-engine::list-workflows`. That is **evidence outside the target workflow**. No whole-surface catalogue sweep of the diff can produce it. AP-04 `no-invented-naming` (`anti-patterns.md:118`) overlaps the naming concern but carries none of the field-ordering / transition-shape / checkpoint-shape rows at `convention-conformance.md:17-21`.
- **`audit-principles`** — produces **Pass / Partial / Violation per principle** with citations (`:14`, `:29`). A Detect-only sweep cannot emit "partially compliant," and cannot catch a principle **honoured nowhere** — an absence, not a smell. `resources/README.md:13,:68` states the design intent: principles cover *families* of smells with no Detect triad; the catalogue covers *specific instances*. Fold them and you keep the instances and lose the families.
- **`audit-expressiveness`** — different home, and produces a **before/after rewrite** naming the substituting construct (`:38`). The catalogue's `## Schema Expressiveness Anti-Patterns` (AP-09…AP-18, `anti-patterns.md:182-304`) covers 10 named smells; `schema-construct-inventory.md:31-52` maps ~22 activity-level informal→formal patterns alone, including rows no AP entry covers — orchestration-pattern borrowing (`:36-42`), checkpoint-effect and action-type tables (`:88-98`). Collapsing loses the *positive* "which construct should this have been" answer.
- **`audit-schema-validation`** — three validator scripts (`:24`, `:30`, `:34`). Mechanical; nothing to fold into prose.

**The collapse-independent thing #321 must not drop:** `verify-high-findings` (`:28`, rules `:45-51` `refute-by-default` / `verify-before-remediation`). This is the workflow's only severity-calibration mechanism, and the 3-High-vs-8-High spread between the full pass and the bare sweep is exactly the signal it polices. Note it is bound only in 08 (`:50`, `:416`) — **activity 10's remedia loop runs no verification at all** (`10:126-158`).

**One structural gap the bare-sweep result already exposes:** in **create** mode the anti-pattern catalogue is never applied as an audit. `08:14-18` gates the principles/anti-patterns loop to `operation_type == review`; `06:180-192` gates the pre-attestation pair to `operation_type == update`. So create mode gets expressiveness + conformance + hygiene + enforcement only, with the catalogue reaching it purely as the write-time rule at `TECHNIQUE.md:60-62`. The two-agent sweep ("apply the anti-pattern catalogue and the design principles") ran the two passes the create/update path structurally omits.

**Worst-case audit invocations in one update run:** 06 = 2 + 2×2 = 6 · 08 = 4 + 3×4 = 16 (plus 3× schema-validation) · 10 = 6 + 3×6 = 24. **46 audit technique invocations across 3 activities**, with the same catalogue re-walked in 06, 08 and 10.

## 3c. Techniques unbound by any activity (dead)

**None.** All 37 workflow-local techniques resolve to at least one `step.technique` bind. Verified by set-differencing `ls techniques/` against every `technique:` value across `activities/*.yaml` — the difference is empty. `README.md:97-135` correctly tables all 37.

The dead surface is at a **finer grain than the technique**:

| Kind | Item | Evidence |
|---|---|---|
| Dead output | `apply-audit-fixes.fixes_applied`, `review-draft-yaml.draft_attestation`, `review-draft-yaml.reviewed_blocks`, `scope-audit.scope_drift_findings`, `verify-high-findings.verified_findings`, `yaml-authoring.yaml_file` | `scripts/binding-fidelity-baseline.json` (6 `dead-output` rows for workflow-design) |
| Orphan input | `apply-audit-fixes.selected_findings`, `review-draft-yaml.drafted_files`, `yaml-authoring.schema_type` (+3 for `commit-regular-files`, 1 for `review-assumptions::record`) | same baseline, 7 `orphan-input` rows |
| Dead variable (zero reads corpus-wide) | `format_conventions_path` (`wf:113`), `applicable_constructs_path` (`wf:117`), `verified_findings_path` (`wf:169`), `open_assumptions` (`wf:235`) | each appears only in its own declaring technique; 0 activity references |
| Orphan resource | `resources/follow-ups.md` (29 lines) | a creation guide with **no producing step**; cited only by the map row `TECHNIQUE.md:83` |
| Effectively dead technique | `scope-audit` (bound 10:69) | output never persisted, never read, never gated |

**Documentation drift found while inventorying (independently reportable):**
- `README.md:189-226` File-Structure techniques tree omits `persist-design-specification.md` (36 of 37 listed).
- `README.md:227-250` resources tree omits `follow-ups.md` (22 of 23 listed).
- `11:20` and `11:36` write `completion.md`; `create-completion-doc.md:24`, `conduct-retrospective.md:18` and `resources/README.md:44` all say `COMPLETE.md`.
- `08:62-76` and `09:7-21` both write `compliance-review.md` from `compliance_report` and both bind `written_artifact: report_path` — a duplicated persist step (AP-38 `no-duplicate-technique-steps`, `anti-patterns.md:542`).
- Undeclared `artifact_content` reads: `03:71` `design_specification` (technique declares only `specification_path`), `01:180` `format_conventions`, `01:188` `applicable_constructs` (technique declares only the two `_path` outputs) — AP-128 `unproduced-value-read`, `anti-patterns.md:1688`.
- `01:174-181` `persist-format-conventions` carries **no `condition`** while its create-only sibling `01:182-194` does.

## 3d. Full retirement list for the #321 cut

Taking the eight genuinely-retirable guides from §3a (all nine named minus `schema-construct-inventory.md`, plus the already-orphaned `follow-ups.md`), and treating `compliance-report.md` as surviving unless both review mode and activity 10 go:

### Resources retired — 8 of 23 (35%)
`drafting-plan.md` (28) · `file-review-note.md` (28) · `draft-attestation.md` (33) · `format-conventions.md` (61) · `applicable-constructs.md` (33) · `structural-inventory.md` (73) · `findings-satellite.md` (42) · `follow-ups.md` (29) — **327 lines**.
**Must survive:** `schema-construct-inventory.md` (sole home, `audit-expressiveness.md:32`) and `compliance-report.md` (1:2, survives if either report survives).

### Techniques retired — 5 whole files
1. `assemble-file-approach.md` (45) — sole purpose is `drafting-plan.md`.
2. `review-draft-yaml.md` (52) — sole purpose is `draft-attestation.md`. **Relocate `:51-52` binding-fidelity pass first.**
3. `audit-rule-hygiene.md` (46) — folds into `audit-anti-patterns`, zero criteria loss.
4. `audit-rule-enforcement.md` (45) — folds into `audit-anti-patterns`, zero criteria loss.
5. `persist-design-specification.md` (35) — absorb into the `03:65-72` write-artifact step it already delegates to (retire even if the spec artifact survives).

Plus **collapse `compile-report.md` + `summarize-findings.md` → 1** (AP-110), and **retire-or-wire `scope-audit.md`**. Net: **37 → 30 techniques (−19%)**.
**Reduce, do not retire:** `review-drafted-file.md` — delete §2 (`:45-48`), keep `has_unflagged_removals`; `intake-classification.md` — delete §4/§5 (`:83-90`) and the `structural_inventory_path` output block (`:56-58`), keep `structural_inventory` for `synthesize-update-specification.md:20`; `context-loading.md` — delete §6/§7 (`:52-60`) and both output blocks (`:10-26`).

### Activity steps retired — 44 bind sites / ~380 lines
- **01** (265 lines): `persist-structural-inventory` `:16-34`, `persist-format-conventions` `:174-181`, `persist-applicable-constructs` `:182-194`; edit `:127` to drop the `structural_inventory_path` link. **3 steps.**
- **03** (149): collapse `persist-specification` `:62-64` + `persist-design-specification-artifact` `:65-72` → 1. **1 step.**
- **06** (336): `persist-drafting-plan` `:78-85`, `file-approach-confirmed` `:86-103`, `persist-file-review-note` `:110-117`, `file-review` `:118-138`, `review-draft-yaml` `:163-165`, `persist-draft-attestation` `:166-173`, `draft-attestation` `:285-302`, `batch-review-attested` `:303-326`. **8 steps.** Retain `preservation-check` `:139-152` (re-source its evidence link).
- **08** (530 — the largest activity): `persist-principle-findings` `:26-33`, `persist-anti-pattern-findings` `:37-44`, `persist-verified-findings-review` `:51-58`, `persist-expressiveness-findings` `:120-142`, `expressiveness-clean` `:143-162`, `expressiveness-findings-flagged` `:163-182`, `persist-conformance-findings` `:197-219`, `conformance-clean` `:220-239`, `conformance-findings-flagged` `:240-259`, `audit-rule-hygiene` `:260-273`, `persist-rule-hygiene-findings` `:274-296`, `rule-hygiene-clean` `:297-316`, `rule-hygiene-findings-flagged` `:317-336`, `audit-rule-enforcement` `:337-350`, `persist-enforcement-findings` `:351-373`, `enforcement-clean` `:374-393`, `enforcement-findings-flagged` `:394-413`, `persist-verified-findings` `:428-446`, `re-audit-rule-hygiene` `:493-495`, `re-audit-rule-enforcement` `:496-498`. **20 steps**; the satellite-persist + clean/flagged triads alone occupy `:120-413` = **294 of 530 lines (55%)**.
- **09** (243): `save-compliance-report` `:7-21` (duplicate of `08:62-76`). **1 step.**
- **10** (247): `persist-post-expressiveness` `:13-25`, `persist-post-conformance` `:29-41`, `persist-post-principles` `:45-52`, `persist-post-anti-patterns` `:56-63`. **4 steps.**
- **11** (53): collapse `persist-completion-doc` `:15-27` + `persist-retrospective` `:31-38` (both write `completion.md`) → 1, and fix the filename to `COMPLETE.md`. **1 step.**

Artifact write-artifact bind sites: **27 → 12**. Distinct produced filenames: **20 → 8** (`design-specification.md`, `impact-analysis.md`, `pattern-analysis.md`, `scope-manifest.md`, `compliance-review.md`/`post-update-review.md`, `COMPLETE.md`, plus planning `README.md` and `assumptions-log.md` from the two cross-workflow producers). Note #321's "17 produced artifacts" **undercounts**: on disk there are **20 distinct `bare_filename` values across 27 bind sites**, plus `README.md` via `workflow-engine::create-readme` and `assumptions-log.md` via `work-package::review-assumptions` = **22 planning artifacts**.

### Variables orphaned — 16 of 63 (25%)

Already dead, retire regardless (4): `format_conventions_path` `wf:113-116` · `applicable_constructs_path` `wf:117-120` · `verified_findings_path` `wf:169-172` · `open_assumptions` `wf:235-237`.

Orphaned by the cut (12):
`draft_attestation_path` `wf:133-136` · `structural_inventory_path` `wf:141-144` · `drafting_plan_path` `wf:145-148` · `file_review_note_path` `wf:149-152` · `expressiveness_findings_path` `wf:153-156` · `conformance_findings_path` `wf:157-160` · `rule_hygiene_findings_path` `wf:161-164` · `enforcement_findings_path` `wf:165-168` · `principle_findings_path` `wf:173-176` · `anti_pattern_findings_path` `wf:177-180` · `rule_hygiene_finding_count` `wf:69-72` · `enforcement_finding_count` `wf:73-76`.

Conditionally orphaned (+2 → 18 / 29%) if the expressiveness and conformance passes also fold: `expressiveness_finding_count` `wf:61-64`, `conformance_finding_count` `wf:65-68`. Each currently drives 6 activity conditions plus a clean/flagged announce pair.

### Net effect
Activities 9 → 4 (per #321) · techniques 37 → 30 · resources 23 → 15 · variables 63 → 47 · write-artifact bind sites 27 → 12 · activity-YAML lines ~1926 → ~1550. The single densest saving is `08-quality-review.yaml:120-413` — 294 lines of satellite-persist and per-pass clean/flagged announce triads, all of which exist to service `findings-satellite.md` and the four per-family finding-count variables.
