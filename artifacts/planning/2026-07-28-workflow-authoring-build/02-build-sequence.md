# 02 — Build sequence: `workflow-authoring` from a cold start

**Authority.** `07-revised-strategy-new-workflow-id.md` §§1, 2, 3, 5, 7 is the governing source. `04-implementation-plan.md` §5 (M0–M10) is **superseded** and must not be executed; §6 (validation) and §§1.2/4.2/4.3 survive as the source of validation criteria, step inventories and retirement lists. `01-corpus-map-blast-radius.md` supplies validator keying and baseline detail.

The strategy is settled. This document exists to make it executable without re-deriving it.

---

## 0. Constants

| Name | Value |
|---|---|
| Library root (live) | `/home/mike1/projects/dev/workflow-server/workflows` |
| Repo root (`SRV`) | `/home/mike1/projects/dev/workflow-server` |
| `target_workflow_id` | `workflow-authoring` |
| New tree | `/home/mike1/projects/dev/workflow-server/workflows/workflow-authoring/` |
| `{target_path}` | the **workflows directory** of the build worktree — `<worktree>/workflows`, e.g. `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-workflow-authoring-build/workflows` |
| Planning folder (drain log) | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/` |

`{target_path}` must name a directory whose **immediate children are workflow directories**. `resolveWorkflowsRoot` (`scripts/workflows-root.ts:15-22`) defaults to `<repo>/workflows` (`scripts/check-resource-anchors.ts:26`), so a worktree of the full `workflow-server` repo requires the `/workflows` suffix. `01-corpus-map-blast-radius.md` §1 records a baseline run with `--root <worktree>` and no suffix; treat that as an imprecision in the record, not as the interface.

Workflow identity, fixed at S1 (07 §1):

| Field | Value |
|---|---|
| directory | `workflow-authoring/` |
| `id` | `workflow-authoring` |
| `title` | `Workflow Authoring Workflow` |
| `version` | `1.0.0` |
| `$schema` | `../../schemas/workflow.schema.json` |
| `initialActivity` | `intake-and-context` |

---

## 1. Registration mechanics

**Nothing but the directory is required.** There is no registry, no index, and no manifest to edit for either `list_workflows` or `start_session`. Three reads establish this end to end:

| Surface | Mechanism | Site |
|---|---|---|
| `list_workflows` | `listWorkflowsWithDiagnostics` does `readdir(workflowDir)` and filters on `stats.isDirectory()` | `src/loaders/workflow-loader.ts:375-390` |
| Activity discovery | `readdir(activitiesPath)` | `src/loaders/workflow-loader.ts:63`, `:567` |
| Activity id derivation | filename match `/^(\d+)-(.+)\.ya?ml$/` | `src/loaders/filename-utils.ts:6-10` |
| `start_session` | keys on the directory name, same discovery path | `src/loaders/workflow-loader.ts:375-390` |

Consequences to state plainly:

1. **Creating `workflows/workflow-authoring/workflow.yaml` plus one `activities/NN-*.yaml` is the whole registration act.** No edit anywhere outside the directory makes the workflow visible; no edit anywhere outside the directory is needed.
2. **`workflow.yaml` does not enumerate activities.** Its top-level keys are exactly `$schema`, `id`, `version`, `title`, `description`, `author`, `tags`, `rules`, `techniques`, `variables`, `initialActivity`. The only workflow-level reference to an activity is `initialActivity`. **This is the mechanism that permits landing one activity at a time** — adding `activities/06-scope-and-draft.yaml` at S2 requires no workflow-level edit at all, only the transition rewire inside `01`.
3. A file without an `NN-` prefix is **invisible to the loader** (`scripts/validate-workflow-yaml.ts:26`), and the id is derived from the filename and **never compared to the file's own `id:` field** (`:20-39`). Filename is truth.

### The advisory unknown-activity warning

A transition naming an activity that does not yet exist produces `Activity manifest references unknown activity` (`src/utils/validation.ts:232-233`). It is **advisory**, not fatal — but it is noise that accumulates across a seven-step additive build and it makes a real error indistinguishable from an expected one.

**Avoid it entirely by terminating each step's graph at `__terminal__`**, which is legal from any activity (`src/utils/validation.ts:42`). Every step S1–S4 therefore ends its frontier activity with a single `to: __terminal__ isDefault: true` transition, and the *next* step replaces that transition with the real edge and re-terminates on its own new frontier. The invariant to assert at every step: **zero unknown-activity warnings, always** — never "expected warnings".

### Version handling

`validateWorkflowVersion` (`src/utils/validation.ts:53-57`) warns when a session's stamped `workflowVersion` differs from the workflow's current `version`. The new tree starts at `1.0.0` with no sessions, so it is silent. This is also why `workflow-design`'s `version` is **frozen at `1.30.0`** through S6 (§2 S6 below): bumping it would warn on every call for all 32 in-flight sessions.

---

## 2. The build sequence, S1 through S8

Strictly additive through S7. **`workflow-design/` is not written to at all before S6, and the S6 write touches no activity, technique or resource file.**

**Independent landability.** S1, S2, S3, S4 each leave a complete, validating workflow whose graph terminates and whose every bind resolves; S5, S6 and S7 are additive or data-only. **All eight steps are independently landable.** Three non-negotiable couplings exist and are named here rather than left implicit:

| Coupling | Kind | Why |
|---|---|---|
| **S5 before S6** | ordering — *the* unavoidable pairing | S6 is the first write to `workflow-design`, and S8 deletes it. An unresolvable resource ref is skipped with `continue` and **no warning** (`src/tools/workflow-tools.ts:801`), so premature deletion silently empties the new workflow's criteria bundle. The S5 test is the **only** detector. It must exist before anything begins moving under the new tree's feet. |
| S4 internal | one commit | `create-completion-doc`, its `bare_filename: COMPLETE.md` and its guide row land together (H9); a producer cannot be committed without its filename and guide row or it is orphaned on arrival. |
| S8 internal | one commit | `git mv` of the four canon homes **and** the rewrite of every citing link **and** `--update-baseline` are one commit; splitting them breaks `check-resource-anchors` (hard-zero) in the interval. |

---

### S1 — Skeleton + intake

The only step that must be executable directly from this document.

**Lands.**

| Path | Content |
|---|---|
| `workflows/workflow-authoring/workflow.yaml` | identity block per §0; **41 variables** (04 §4.4: 63 − 32 deleted + 10 added, 2 renamed); `rules.activity` carrying the rewritten AP-107-clean headless rule; `techniques.activity` |
| `workflows/workflow-authoring/activities/01-intake-and-context.yaml` | the 12-step inventory below, ~150 lines |
| `workflows/workflow-authoring/techniques/workflow-authoring/intake-classification.md` | copied + reduced: drop Protocol §4/§5 (`:83-90`) and the `structural_inventory_path` output (`:56-58`); keep `{structural_inventory}` as an in-session value (it is a declared required input of `synthesize-update-specification.md:20-22`); **add** `review_scope_confirmed` as a declared output |
| `…/techniques/workflow-authoring/elicit-change-brief.md` | **new** (absorbs `derive-design-dimensions`, `prepare-dimension`, `capture-dimension`) |
| `…/techniques/workflow-authoring/synthesize-change-brief.md` | **new**, from `synthesize-update-specification` (mode-specific op, AP-124) |
| `…/techniques/workflow-authoring/impact-analysis.md` | copied + extended: declare `{change_constraints}`; drop §7's "calling activity" persist prose (`:57`, AP-68(a)) |
| `…/techniques/workflow-authoring/derive-workflows-target-path.md` | copied; **relocated to `01` and ungated** — see the H8 hole below |
| `workflows/workflow-authoring/resources/change-brief.md` | new creation guide |
| `workflows/workflow-authoring/README.md`, `activities/README.md`, `techniques/TECHNIQUE.md`, `resources/README.md` | authored fresh, internally consistent |

**The `01` step inventory** (04 §1.2, with the H4/H5/H8 corrections from 07 §4 applied):

| # | kind | id | bind | gate |
|---|---|---|---|---|
| 1 | action | `bind-planning-folder-path` | `set planning_folder_path` — value-bearing | — |
| 2 | technique | `classify-intake` | `intake-classification` | — |
| 3 | checkpoint | `design-intent-batch` | **BLOCKING**, Gate 1; all 5 options carry `effect.setVariable`; `wrong-review-target` sets `review_scope_confirmed: false` only, no `transitionTo` | `condition: and(intent_needs_confirmation == true, update_seeded_from_review != true)` |
| 4 | action | `halt-on-wrong-target` | `action: validate`, `target: review_scope_confirmed` | `when: operation_type == 'review'` |
| 5 | technique | `derive-target-path` | `derive-workflows-target-path` | **none — ungated (H8)** |
| 6 | technique | `seed-planning-readme` | `workflow-engine::create-readme` (`seed_profile: workflow-authoring/readme-seed`) | `when: operation_type != 'review'` |
| 7 | technique | `elicit-change-brief` | `elicit-change-brief` → `{change_brief}`, `{open_judgements}`, `{open_judgements_count}` | `when: operation_type == 'create'` |
| 8 | technique | `synthesize-change-brief` | `synthesize-change-brief` → same output set | `when: operation_type == 'update'` |
| 9 | technique | `analyze-impact` | `impact-analysis` → `{removal_count}`, `{change_constraints}` | `when: operation_type == 'update'` |
| 10 | technique | `persist-change-brief` | `work-package::manage-artifacts::write-artifact` — `bare_filename: change-brief.md`, `artifact_content: change_brief`, `outputs.written_artifact: change_brief_path` | `when: operation_type != 'review'` |
| 11 | technique | `persist-impact-analysis` | `…::write-artifact` — `impact-analysis.md`, `outputs.written_artifact: impact_analysis_path` | `when: operation_type == 'update'` |
| 12 | action | `surface-open-judgements` | `message`, statement form, links `[change brief]({change_brief_path})` | `when: open_judgements_count > 0` |
| 13 | checkpoint | `impact-approved` | **BLOCKING**; `approve-removals` → `removals_approved: true`; `preserve-more` → `false` | `condition: removal_count > 0` |

**Transitions at S1:** exactly one — `to: __terminal__`, `isDefault: true`.

**The H8 hole this closes.** `{target_path}` was produced only at `06:1` gated `!= 'review'`, and review mode never enters `06`. `resolveWorkflowsRoot:19` requires a **truthy** `argv[flag + 1]`, so `--root ""` is treated as absent and every guard silently falls back to `../workflows` — the stale main checkout — in the one mode whose entire job is sweeping other workflows. `derive-workflows-target-path` is a pure derivation from `{planning_folder_path}` (produced at `01:1`), so it belongs at `01`, ungated. `ensure-worktree` (`prepare-workflow-branch`) stays in `06` gated `!= 'review'` and lands at S2.

**Two authoring decisions to settle at S1, both cheap.**

1. **Group placement.** 07 §7 mitigation requires design-local techniques be authored **inside a group** (`techniques/workflow-authoring/…`) so that S1 is the *last* time they are ever copied — a flat technique has no cross-workflow address (§6 below). The loader's own doc comment describes the group index as `./<group>/TECHNIQUE.md` (`src/loaders/markdown-technique-loader.ts:224`). Resolve the interaction between the group index and the workflow-level `techniques/TECHNIQUE.md` (which carries the canonical-home map) by reading one sibling before authoring: `ls /home/mike1/projects/dev/workflow-server/workflows/work-package/techniques/manage-artifacts/`. This is a placement decision, not a blocker.
2. **The canonical-home map is 6 rows, not 12.** 04 §4.3 leaves 12 surviving resources; four are the criteria homes (cited, never artifact homes) and two are read-guides (`elicitation-guide.md`, `update-mode-guide.md`). The remaining six are the artifact creation homes that the map exists to bind: `change-brief.md`, `impact-analysis.md`, `scope-manifest.md`, `findings-register.md`, `completion-artifact.md`, `readme-seed.md`. The rule text reads **"…enforces the map."** — with no stage, activity or position named. Reproducing `workflow-design/techniques/TECHNIQUE.md:70`'s *"enforces the map at the end of `scope-and-draft`"* would import AP-68 Detect(a) into a fresh file (H3).

**Stays green.** A working single-activity workflow: classify → brief → stop. `workflow-design` is untouched; all 32 sessions are unaffected.

**Prove it green.**

```
npx tsx scripts/validate-workflow-yaml.ts {target_path}/workflow-authoring
npx tsx scripts/validate-activities.ts --root {target_path}
npx tsx scripts/check-all-refs.ts --root {target_path}
npx tsx scripts/check-resource-anchors.ts --root {target_path}
npx tsx scripts/check-variable-model.ts --root {target_path}
npx tsx scripts/check-fragments.ts --root {target_path}
npx tsx scripts/check-technique-template.ts --root {target_path}
npx tsx scripts/check-activity-technique-overlap.ts --root {target_path}
npx tsx scripts/check-binding-fidelity.ts --root {target_path}
npx tsx scripts/check-audience.ts --root {target_path}
npx tsx scripts/check-review-mode-gating.ts --root {target_path}
npx tsx scripts/check-self-provisioned-input.ts --root {target_path}
npx tsx scripts/check-identifier-qualification.ts --root {target_path}
npx tsx scripts/check-stealth-isolation.ts --root {target_path}
```

Plus the registration assertion — `list_workflows` shows `workflow-authoring` / `Workflow Authoring Workflow` / `1.0.0`, and **zero** unknown-activity warnings.

Expected results are in §3. From S1 onward this full block is the standing gate; later steps name only what changes.

---

### S2 — Draft

**Lands.** `activities/06-scope-and-draft.yaml`; techniques `scope-definition`, `yaml-authoring`, `readme-authoring`, `review-drafted-file`, `verify-artifact-conforms`, `prepare-workflow-branch`; `resources/scope-manifest.md`.

`review-drafted-file.md` drops §2 (`:45-48`) and keeps `{has_unflagged_removals}`. `verify-artifact-conforms.md` absorbs the binding-fidelity pass, and `review-draft-yaml.md:51-52` is relocated into it before that file is left behind. **H5 correction:** the reader `06:7d` is gated on the producer's own expression conjoined — `when: and(has_unflagged_removals == true, removal_disposition == 'restored')` — because 7c/7d sit inside `file-drafting-loop` (`maxIterations: 50`) and a bare equality reads a **stale** `restored` on iteration 2. `operator: exists` does not fix this; a stale value exists.

**Rewired.** `01 → scope-and-draft` `isDefault: true`; `06 → __terminal__`.

**Stays green.** Create and update draft end-to-end without audit. Both activities resolve; graph closed on `__terminal__`.

**Prove it.** The S1 block, unchanged. Additionally assert `check-fragments` still reports the corpus's single pre-existing violation and no new one: collapsing near-identical confirm checkpoints into one file is exactly what `duplicate-checkpoint` (`scripts/check-fragments.ts:307-312`, threshold ≥2 sites **corpus-wide**) fires on, and each of the 7 checkpoint bodies must appear once.

---

### S3 — Sweep

**Lands.** `activities/08-quality-review.yaml`; techniques `audit-canon`, `resolve-consumer-surface`, `load-known-findings`, `reload-workflow`, `audit-schema-validation`; `resources/findings-register.md`.

The four criteria homes are **cited cross-workflow, not copied** — see §4, which closes the gate 07 §2 left open on this step. No guard extension and no canon duplication is required.

Corrections that bind here:
- **H1** — never emit an `audience:` attribute on `findings-register.md`. `scripts/check-audience.ts:104` `continue`s unless `o.audience === 'agent'`, so omitting it keeps the guard at 0; declaring it demands a `.json` artifact name and yields one NEW violation and a non-zero exit. AP-96's Fix authorises this verbatim (`anti-patterns.md:1264`): *"Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute."*
- **H10** — `{coverage_ledger}` stays an in-session bound value carried `08:6b → 09:1 → 09:2`. The register's `## Coverage` persists **divergences only** (`blocked` / `not-applicable`), omitted entirely when empty (AP-87). AP-91's Fix, verbatim at `anti-patterns.md:1204`: *"present aggregate scorecards in-session, not persisted."*
- **M-d** — the anchor inventory lives in exactly **one** home, `audit-canon`'s Protocol phase 1, as a **list, not a count**. No literal `13`/`30`/`6`/`6` anywhere. The ledger carries a three-value status `walked | not-applicable (reason) | blocked`, with `{has_coverage_gap}` counting `blocked` only.
- **H7** — state eager eligibility structurally: *"`_meta.step_techniques` contains every `kind: technique` step in `08` carrying no `when`/`condition`, at top level and inside the ungated `08:6` loop body."* On this inventory that is steps 3, 4, 5, 6a, 6b, 6c — **6 of 10 steps, 6 of 8 technique steps**. `collectUngated` recurses into `kind: loop` **without pushing it** and pushes only `kind: technique && s.id` (`src/tools/workflow-tools.ts:713-719`), so the loop container and `6d` (`kind: action`) are structurally ineligible.
- **H8** — the corrected `audit-schema-validation` invocations, §3 below.

**Rewired.** `06 → quality-review`; `08 → __terminal__`.

**Stays green.** The sweep runs and delivers.

**Prove it.** The S1 block, plus `get_resource` on each cited canon id in qualified form resolves: `workflow-design/anti-patterns#creation-rules`, `workflow-design/design-principles`, `workflow-design/schema-construct-inventory`, `workflow-design/convention-conformance`.

---

### S4 — Verify, commit, close out

**Lands.** `activities/09-validate-and-commit.yaml`; techniques `verify-high-findings`, `compile-report`, `apply-audit-fixes`, `scope-verification`, `commit-verification`, `publish-workflow-pr`, `create-completion-doc`.

- **H4** — drop the `[impact analysis]({impact_analysis_path})` clause from Gate 2 entirely. A checkpoint `message` is `z.string().optional()` (`activity.schema.ts:124`); there is no conditional-clause construct, so in create mode it renders `[impact analysis]()`. Give `compile-report` an **optional** `{impact_analysis_path}` input and a `## Sources` row emitted only when present. Gate 2 then links only artifacts sharing its own arm — `change_brief_path`, `scope_manifest_path`, `report_path`. The live entry is **AP-97 `link-named-artifacts`**, not AP-128: with `defaultValue: ""` declared, AP-128's do-not-flag covers it.
- **H3/AP-107** — `verify-high-findings`' Rule is phrased as a non-positional invariant: *"Do not emit a remediation instruction for a row whose claim has not been re-derived."* Do not delete the rule (that loses its coupling to `refute-by-default`) and do not restore the positional phrasing.
- **M-m** — `verify-high-findings` **cites `audit-canon`'s phase-1 inventory by hyperlink and declares no inventory of its own** (AP-74 do-not-flag: *"A single authoritative home with pointers elsewhere"*). This rule does double duty as the AP-110 guard while two design workflows coexist.
- **H9** — `create-completion-doc` binds at `09:15-16` with `bare_filename: COMPLETE.md` and its guide row **in the same commit**.
- **§6 hole 2** — `09:4 review-disposition.fix-issues` sets `operation_type: update` and returns to `01`; it must **also narrow `target_workflow_ids` to the escalated target**, or an escalated update re-sweeps all N review targets when one was fixed.

**Rewired.** `08 → validate-and-commit`; back edges `09 → 08`, `09 → 01`, `09 → 06`; the review edge `01 → quality-review` when `and(operation_type == 'review', review_scope_confirmed == true)`.

**Stays green.** Full graph closed; all three modes reachable. **Review mode becomes usable only here**, because it needs `09:4 review-disposition`.

**Prove it.** The S1 block, plus zero unknown-activity warnings with `__terminal__` now removed from `09` — the graph is closed on real edges, and `src/utils/validation.ts:232-233` is the assertion that every named target exists.

---

### S5 — The delivery test (must land before S6)

**Lands.**
- A committed vitest under `/home/mike1/projects/dev/workflow-server/tests/` asserting that `get_activity` on `workflow-authoring::quality-review` returns `_meta.step_techniques` containing the eager-eligible step ids (S3's structural list) **and** `_meta.resources` containing every criteria resource id including the cross-workflow qualified ids and their `#section` suffixes.
- `/home/mike1/projects/dev/workflow-server/scripts/count-workflow-sessions.ts` (§5).

**Why it is load-bearing.** It discharges **M-i** (the plan claimed a regression "surfaces as a test failure"; no test existed), **M-h** (a slug mismatch appears as a missing key, because `loadResourceDelivery` failures hit `continue` with no warning at `src/tools/workflow-tools.ts:801`), and — new under this strategy — premature deletion of `workflow-design`, which would silently empty the criteria bundle by that same path. Eager delivery calls the same `loadResourceDelivery` as `get_resource` (`workflow-tools.ts:799-806`), so one test covers both.

**Prove it.**

```
cd /home/mike1/projects/dev/workflow-server && npx vitest run tests/workflow-authoring-delivery.test.ts
npx tsx scripts/count-workflow-sessions.ts --workflow workflow-design --status running --list
```

---

### S6 — Deprecate + unstick

**The only pre-deletion write to `workflow-design`, and it touches no server-resolved definition file.**

**Lands.** A deprecation sentence appended to `workflow-design/workflow.yaml`'s `description` (which `list_workflows` surfaces); **`version` frozen at `1.30.0`**; a deprecation banner in `workflow-design/README.md` and in the library root `README.md`. Plus `status: abandoned`, with recorded reasons, on the 2 structurally unresumable sessions (`content-drafting` from v1.2.1; `currentActivity: ""`).

**Do not bump the version.** `validateWorkflowVersion` (`src/utils/validation.ts:53-57`) would then warn on every call for all 32 in-flight sessions.

**Prove it.** The S1 block still green on both trees; `check-binding-fidelity --root {target_path}` still 0 NEW — a `description` edit touches no bind, but the guard seeds `producedByWf` from `workflow.yaml` `variables[]` (`scripts/check-binding-fidelity.ts:250-258`), so the assertion is worth making explicitly on the only commit that edits that file.

---

### S7 — Drain checks (repeatable, no code)

**Lands.** One appended row in `drain-log.md`. No-op on the corpus. See §5.

---

### S8 — Retirement, gated on count == 0

See §5 for the trigger and the exact contents of the deletion commit.

---

## 3. The guard suite

**The new tree has no baseline to inherit, so it must be 0-NEW from S1.** This is strictly harder than the superseded in-place plan, which inherited 13 baselined `binding-fidelity` entries for `workflow-design`. Every baselined guard treats `workflow-authoring` as entirely novel: there is no row to match, so any violation is NEW and the guard exits non-zero. There is no grace interval and no "baseline it later" — `--update-baseline` must never be run against the new tree during S1–S7.

All guards resolve the corpus root through `scripts/workflows-root.ts:15-22` (`--root` > `WORKFLOWS_DIR` > `../workflows`).

| Guard | Invocation | Expected against the new tree | Failure mode to watch |
|---|---|---|---|
| `validate-workflow-yaml.ts` | `npx tsx scripts/validate-workflow-yaml.ts {target_path}/workflow-authoring` — **positional** | all valid; activity + technique counts match the step reached | `:26` a file without an `NN-` prefix is invisible to the loader; `:35` duplicate ids across files |
| `validate-activities.ts` | `npx tsx scripts/validate-activities.ts --root {target_path}` | 0 failed | `populateStepIds` collision detection (`:36-41`) — **every step in every new activity carries an explicit `id:`** |
| `check-all-refs.ts` | `--root {target_path}` | 0 unresolved | any `techniques[]` / `technique:` ref that does not resolve; the guard `workflow-design`'s own validation step already ran (`:18`) |
| `check-binding-fidelity.ts` | `--root {target_path}` | **0 NEW** (256 baselined, 13 of them `workflow-design`) | `read-resolution` (`:474-481`) every `{token}` and structured-condition `variable:` must resolve to a producer, seeded from `workflow.yaml` `variables[]` (`:250-258`); `dead-output` (`:484-490`, `:485` is the `#### artifact` exemption); `orphan-input` (`:461-470`) |
| `check-variable-model.ts` | `--root {target_path}` | **0** — hard-zero (`:26`) | `setvariable-undeclared` (`:113`) any checkpoint effect targeting an undeclared variable; `exists-on-defaulted` (`:96-105`) |
| `check-fragments.ts` | `--root {target_path}` | corpus stays at the **1** pre-existing violation (`work-package/activities/04-research.yaml`); `workflow-authoring` contributes **0** — hard-zero (`:28`) | `duplicate-checkpoint` (`:307-312`) two normalized-identical inline bodies at ≥2 sites **corpus-wide** |
| `check-resource-anchors.ts` | `--root {target_path}` | **exactly the 3 pre-existing entries** (in `meta/` and `work-package/`); `workflow-authoring` contributes **0** — hard-zero (`:15`) | the highest-yield guard for this change; see §4 — the cross-workflow canon citations land **inside** its coverage |
| `check-activity-technique-overlap.ts` | `--root {target_path}` | 0 — hard-zero (`:11`) | an activity-level `techniques[]` entry also bound by a step in the same file (AP-69). The new tree declares **no** activity-level `techniques:` blocks |
| `check-technique-template.ts` | `--root {target_path}` | 0 — hard-zero | shape of every authored technique |
| `check-audience.ts` | `--root {target_path}` | **0 total** (baseline is `[]`) | fires only on `audience: agent` outputs (`:104`). **Emit no `audience:` attribute** (H1) |
| `check-review-mode-gating.ts` | `--root {target_path}` | 0 NEW; `workflow-authoring` adds **no row** | `:150-152` skips any workflow whose `variables[]` lacks `is_review_mode`; the new tree declares `operation_type`, so the guard never walks it (this is why M-b does not apply to the new tree) |
| `check-self-provisioned-input.ts` | `--root {target_path}` | 0 — hard-zero (site = `file[stepId]`, `:30`) | routine |
| `check-identifier-qualification.ts` | `--root {target_path}` | no regression (baseline: 5 bare names) | routine |
| `check-stealth-isolation.ts` | `--root {target_path}` | no regression (`:51`) | routine |

### The corrected `audit-schema-validation` invocations

`scripts/workflows-root.ts:4-11` documents `--root` as *"a worktree's workflows directory"* and notes that `validate-workflow-yaml.ts` *"already accepts a path argument"*. The superseded plan's "add `--root {target_path}` to all three" is right for two guards and **wrong for the first**: `--root` is not its interface.

| Site in `audit-schema-validation.md` | Corrected invocation |
|---|---|
| `:24` | `validate-workflow-yaml.ts {target_path}/{target_workflow_id}` — **positional, no flag** |
| `:30` | `check-all-refs.ts --root {target_path}` |
| `:34` | `check-binding-fidelity.ts --root {target_path}` |
| the 7 added guards | each `--root {target_path}` |

`{target_path}/{target_workflow_id}` composes correctly because `08:6c` is bound inside the `forEach` over `target_workflow_id`. And `{target_path}` is non-empty in **all three modes** only because S1 relocates `derive-target-path` to `01` ungated — `resolveWorkflowsRoot:19` requires a truthy `argv[flag + 1]`, so `--root ""` silently degrades to `../workflows`, the stale main checkout.

### Baseline files — the S8-only surface

| File | State | Relevance |
|---|---|---|
| `scripts/binding-fidelity-baseline.json` | 256 entries; **13** mention `workflow-design` (6 `dead-output` keyed on technique file paths, 7 `orphan-input` keyed on `workflow-design :: <op>`) | removed at S8 via `--update-baseline` only |
| `scripts/review-mode-gating-baseline.json` | 6 entries; line 7 (`workflow-design::scope-and-draft::scope-and-structure-confirmed`) is **already stale** | removed at S8 |
| `scripts/identifier-qualification-baseline.json` | 5 bare data-identifier names | migration-neutral |
| `scripts/audience-baseline.json` | `[]` | migration-neutral; keep it `[]` |

**Zero baseline entries corpus-wide key on an activity file path** (`check-binding-fidelity.ts:29-31`, `:438`, `:466` — `orphan-input` is keyed on `(workflow, op, input)` so the baseline stays stable when steps move). Adding activities therefore invalidates nothing.

---

## 4. The cross-workflow canon citation form — settled

The four criteria homes — `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md`, **154,507 B** total (`anti-patterns.md` alone 128,341 B, ≈39k tokens for the four) — **stay in `workflow-design/resources/` and are cited, not copied**, for the whole coexistence window.

### The form

Author every reference as a **relative markdown link with an optional single `<workflow>/` segment immediately before `resources/`**:

```
](../../workflow-design/resources/<id>.md#<anchor>)
```

The number of `../` segments is whatever reaches the workflows root from the **citing file's own directory**. This matters because 07 §7 puts the new tree's techniques inside a group:

| Citing file | Prefix |
|---|---|
| `workflow-authoring/resources/<x>.md` | `../../workflow-design/resources/<id>.md#<anchor>` |
| `workflow-authoring/techniques/<x>.md` | `../../workflow-design/resources/<id>.md#<anchor>` |
| `workflow-authoring/techniques/workflow-authoring/<x>.md` | `../../../workflow-design/resources/<id>.md#<anchor>` |

Activity YAML is different and unaffected: resource refs there are **ids**, not links — `parseResourceRef` accepts `workflow/id#section` directly (`src/utils/resource-ref.ts:1-26`, e.g. `meta/bootstrap-protocol`).

### The two verified facts that make this the only correct form

1. **The loader projects it to exactly the id `get_resource` accepts.** `rewriteResourceLinks`'s regex at `src/loaders/markdown-technique-loader.ts:228` is

   ```
   /\[([^\]]+)\]\((?:\.\.?\/)+(?:([A-Za-z0-9_-]+)\/)?resources\/([A-Za-z0-9_-]+)\.md(#[A-Za-z0-9_-]+)?\)/g
   ```

   `(?:\.\.?\/)+` absorbs any depth of `../`, and the **optional captured `([A-Za-z0-9_-]+)\/` group before `resources/`** is the cross-workflow segment. The replacement emits `[label](workflow-design/<id>#<anchor>)` — the qualified `<workflow>/<id>[#section]` form. The function's own doc comment names this case explicitly (`:220`: `[x](../../prism/resources/lens.md#section)  (cross-workflow)`). So the agent-facing projection is already correct with no code change.

2. **The relative form stays inside guard coverage; the projected form would not.** `LINK_RE` at `scripts/check-resource-anchors.ts:78` is `/\]\(([^()\s]+\.md)#([A-Za-z0-9][\w-]*)\)/g` — it **requires a `.md#` target**. `workflow-design/anti-patterns#creation-rules` has no `.md`, so it would never match and the reference would be invisible to the hard-zero guard. The relative form matches, and the guard then resolves the target as a plain filesystem path relative to the citing file's directory. There is nothing "cross-workflow" about it from the guard's perspective — it is an ordinary relative link that happens to cross a directory boundary.

### Consequence

**No guard extension and no canon duplication is required. This resolves the open S3 gate** that 07 §2 recorded as *"Unverified and gating S3: whether `check-resource-anchors` resolves cross-workflow anchors"* and that 07 §7 fell back on as *"accept a 154 KB four-file duplication."* Neither fallback is taken. One physical copy; §6 One Authoritative Home fully intact; eager delivery works because the eager loop calls the same `loadResourceDelivery` as `get_resource` (`src/tools/workflow-tools.ts:799-806`).

Two costs remain, both real and both already priced in: the new workflow **depends on the old tree existing** until S8 rewrites the prefix, and **premature deletion silently empties the criteria bundle** because an unresolvable resource is skipped with `continue` and no warning (`:801`). The S5 test is the only detector, which is why it lands before S6.

---

## 5. The drain-to-zero retirement trigger

### The census

Shipped at S5, invoked:

```
npx tsx scripts/count-workflow-sessions.ts --workflow workflow-design --status running --list
```

It walks `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/*/session.json` and **must recurse through `triggeredWorkflows[i].state`**, because **child sessions are embedded in the parent's `session.json` rather than written as separate files**. A flat glob undercounts badly — it finds far fewer than the 33 states actually present across 32 running sessions. This is the fact both the superseded M1 and audit finding C1 had to establish by hand; it is the single thing the script exists to get right.

Equivalent for the record, pending confirmation of field names on first run:

```
jq -s '[.[] | recurse(.triggeredWorkflows[]?.state?) | select(.workflowId=="workflow-design" and .status=="running")] | length' /home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/*/session.json
```

Output: an integer, plus the planning-folder path and `currentActivity` of every remaining session. **A committed script is required, not the one-liner** — the deletion decision hangs on the count, so it belongs in CI, not in shell history.

### The drain log

An append-only `drain-log.md` at `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/drain-log.md`, one row per S7 check: **date, count, remaining folder list**. The deprecation itself is recorded elsewhere (S6): `workflow-design/workflow.yaml`'s `description`, `workflow-design/README.md`, and the library root `README.md` row.

### Why zero is otherwise unreachable — the ≥90-day policy

21 of the 32 running sessions sit on activities that still exist under this strategy, so they *can* advance — but **nothing compels anyone to finish them, and 19 are parked at `retrospective`**. Drain-to-zero is only measurable if it is also *reachable*, so the trigger carries an explicit policy:

> Any `workflow-design` session whose planning folder has had no commit for **≥ 90 days** is set `status: abandoned` with a recorded reason.

The 2 structurally unresumable sessions are abandoned at S6 regardless. Without this policy the count never reaches zero, the duplication in §6 becomes permanent, and audit finding C1 is traded for a chronic §6 One-Authoritative-Home violation — a sharp failure exchanged for a slow one, which is far easier to ignore. **The policy is the strategy's load-bearing weakness, not a footnote.**

### The S8 deletion commit, exactly

| Removes / does | Note |
|---|---|
| `workflow-design/` entirely — 9 activities, 37 techniques, 23 resources (1,935 activity lines, 65,748 B) | **minus the four canon homes** |
| `git mv` of `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` from `workflow-design/resources/` into `workflow-authoring/resources/` | **same commit** |
| Rewrite of every `workflow-authoring` canon citation: drop the `workflow-design/` segment, re-depth the `../` prefix to the new relative distance | mechanical; verified by `check-resource-anchors` (hard-zero) — this is why the `git mv` and the rewrite cannot be split |
| The `workflow-design` row in the library root `README.md` | |
| Its rows in `binding-fidelity-baseline.json` (13 entries), `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json` | **via `--update-baseline` only, never by hand** — M-b's trailing-comma defect relocates here |
| **Precondition, run mechanically before deleting:** no file outside `workflow-design/` links into it | the check H2 shows was never done mechanically. `check-resource-anchors` catches anchored links; the non-anchored and `techniques[]` cases need `check-all-refs` plus a grep sweep |

Gate: **count == 0**, read from the census script, with the drain-log row that produced it.

---

## 6. What this strategy makes worse

Stated honestly and condensed. None of these is a reason to change course; all four are the price of a zero-brick migration.

**1. ~18 technique files must be duplicated, and the mechanism forces it.** Cross-workflow *resource* refs exist (§4). Cross-workflow *technique* binds do not, unless the technique is **group-qualified**: `::` resolves as path segments (`src/loaders/technique-loader.ts:227`, `:586`), and every cross-workflow bind in the corpus carries a group — `workflow-engine::list-workflows`, `manage-artifacts::write-artifact`, `version-control::commit-regular-files`, `work-package::update-pr::post-review-comment`. **`workflow-design`'s techniques are flat files in `techniques/` with no group segment, so they have no cross-workflow address at all.** The new workflow must author its own copy of every design-local technique it keeps — **≈18 of the 23 survivors**. That is a real AP-74 / AP-110 exposure with no mitigation but the time-box.
*The one mitigation, and it must be taken at S1:* author them **inside a group** in the new tree (`workflow-authoring/techniques/workflow-authoring/…`) so that this is the **last** time they are ever copied.

**2. Two design workflows are visible in `list_workflows` for the whole window.** A user or a `discover` bootstrap can start the wrong one, and the wrong one is the 1,926-line version. Mitigated only by the S6 deprecation sentence in `description` (which `list_workflows` surfaces), with `version` frozen at `1.30.0` so `validateWorkflowVersion` stays silent for the 32 in-flight sessions.

**3. The corpus grows before it shrinks.** ~650 new activity lines plus ~18 duplicated technique files, and every library-wide guard now walks both trees on every run. Combined with §3's no-baseline constraint, the guard burden during coexistence is strictly higher than under the superseded in-place plan.

**4. `workflow-design` retains every defect the slim-down exists to fix, for the entire window.** Anyone resuming one of the 32 sessions gets the 46-invocation worst case, the 128 KB whole-file catalogue link, the 11 effect-less soft gates, and — most seriously — **the two dangerous 30-second auto-advances at `09:54-77` and `09:102-125`, which auto-select *proceed to commit* when `fail_count > 0`.** In-place rewriting would have fixed those for in-flight sessions. This strategy deliberately does not. That is the honest price of not bricking them, and it is another reason the ≥90-day abandonment policy is not optional.

---

## 7. Open items carried into execution

| Item | Where it bites | Resolution |
|---|---|---|
| Group-index placement: `techniques/<group>/TECHNIQUE.md` vs. the workflow-level `techniques/TECHNIQUE.md` carrying the 6-row canonical-home map | S1 authoring | read one sibling group before authoring: `ls /home/mike1/projects/dev/workflow-server/workflows/work-package/techniques/manage-artifacts/` |
| Session JSON field names in the jq fallback (`workflowId`, `status`, `triggeredWorkflows[].state`) | S5 script | confirm on first run; the committed script is authoritative thereafter |
| Optional: relocate `survey-reference-workflows` to `01` ungated, so `{reference_workflows}` is available to `yaml-authoring` at write time | S1 vs. S3 | a real create-mode loss is that a first-time author drafts **before** seeing sibling conventions. Cost: `01` gains a step and H7's eager count for `08` becomes 5 rather than 6. H7's assertion is structural and holds either way — state whichever inventory is adopted |
