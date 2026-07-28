Verification complete — 18 tool calls. I have what I need, including the naming rule (`convention-conformance.md` states `no-invented-naming` and semver) and the decisive asymmetry: cross-workflow **resource** refs are supported, cross-workflow **technique** binds require a group segment.

---

# Revised sections — `workflow-design` slim-down

**Two facts about the source material, stated first because they bound everything below.**

1. **The plan on disk is truncated.** `04-implementation-plan.md` is 499 lines and ends mid-sentence inside M2's table (`| 06 | Drafting plan / Draft attestation / File`). §5 contains only M0, M1, M2; **M3–M10, §6 and §7 do not exist in the file.** H7 (§6.3), M-d (§7.2), M-i (R2a) and parts of H2/H3/H8 cite sections that are absent, so for those I amend the *on-disk carrier* of each claim and quote the audit for the missing text. Replacing §5 is therefore cheap: there is only M0–M2 to remove.
2. **The on-disk plan already fixes several audit findings.** M1 *is* a session rewriter (C1's minimal correction), `audit-disposition#{remediation_round}` is instance-qualified (M-l), and `--root` is already named (H8, partially). I flag these rather than re-fix them.

---

## 1. The new workflow id

### Convention actually in use

All 15 sibling workflows, `id` and `title` read from their `workflow.yaml`:

| id | title | version |
|---|---|---|
| `cicd-pipeline-security-audit` | CI/CD Pipeline Security Audit Workflow | 1.2.0 |
| `codebase-wiki` | Codebase Wiki Workflow | 1.0.0 |
| `meta` | Meta Workflow | 5.10.0 |
| `midnight-system-review` | Midnight System Review Workflow | 1.2.0 |
| `ponytail` | Ponytail Lean-Coding Workflow | 1.0.0 |
| `prism` | Structural Analysis Prism Workflow | 2.3.0 |
| `prism-audit` | Security Audit Workflow | 1.2.0 |
| `prism-evaluate` | Evaluation Workflow | 1.3.0 |
| `prism-update` | Prism Update Workflow | 1.1.1 |
| `remediate-vuln` | Security Vulnerability Remediation Workflow | 2.0.0 |
| `requirements-refinement` | Requirements Refinement Workflow | 1.1.0 |
| `substrate-node-security-audit` | Security Audit Workflow | 4.19.0 |
| `work-package` | Work Package Implementation Workflow | 3.35.4 |
| `work-packages` | Work Packages Workflow | 3.1.0 |
| `workflow-design` | Workflow Design Workflow | 1.30.0 |

Extracted rules: **id is kebab-case, lowercase, and equals the directory name in 15 of 15**; **every title ends in "Workflow"**; noun-phrase heads dominate (one verb-first outlier, `remediate-vuln`); new workflows start at **1.0.0** (`codebase-wiki`, `ponytail`).

The canon rule is in `workflow-design/resources/convention-conformance.md`: *"File naming | Activities `NN-name.yaml`; techniques/resources kebab-case `.md`"*, *"Version format | Semantic `X.Y.Z`"*, and the binding closer — *"Where drafted content uses different naming or structural patterns than existing workflows, align with the established conventions unless the user has approved an exception (`no-invented-naming`)."* Workflow-level ids are not named explicitly, so `no-invented-naming` routes the decision to the observed convention above.

### Decision

| Field | Value |
|---|---|
| directory | `workflow-authoring/` |
| `id` | `workflow-authoring` |
| `title` | `Workflow Authoring Workflow` |
| `version` | `1.0.0` |
| `$schema` | `../../schemas/workflow.schema.json` (same relative depth as every sibling) |
| `initialActivity` | `intake-and-context` |

**Justification.**

1. **Kebab-case noun phrase with a nominalised head** — structurally the same shape as `requirements-refinement`, the closest sibling (a nominalisation naming a design activity). Satisfies `no-invented-naming`.
2. **Not a variant suffix.** `workflow-design-slim` / `-v2` / `-new` would read as a family member under the `prism` → `prism-audit`/`prism-evaluate`/`prism-update` convention, which is reserved for *phases of one capability*. This is not a phase of `workflow-design`; it is its replacement.
3. **Nothing transient in the id.** "slim" is a property of the migration, not the capability. Encoding it buys a rename later — and a rename is C1 again at workflow scope: `readActivityRaw` matching is per-activity, but sessions store `workflowId`, and discovery keys on the directory (`workflow-loader.ts:375-390`), so renaming the workflow later strands every session on it. The id must be the name we want *after* `workflow-design` is deleted.
4. **"authoring" is the corpus's own word** for this capability: `techniques/yaml-authoring.md`, `techniques/readme-authoring.md`, and `anti-patterns.md`'s `## Authoring Guidance (MR)` (`:1622`). "design" is retained by the *canon* (`design-principles.md`), so reusing it in the id invites confusion with the resource family.
5. **Sorts adjacent to `workflow-design`** under `workflow-*` in `list_workflows`, preserving the family adjacency the `prism-*` convention achieves without inheriting a name that must change.
6. **No namespace collision.** `::` refs resolve as path segments (`technique-loader.ts:227`, `:586`) against group directories — `workflow-engine`, `manage-artifacts`, `version-control`, `review-assumptions`. A workflow id collides only if it duplicates a group name, so `workflow-engine` in particular must be avoided; `workflow-authoring` is clear.
7. **Title conformance over elegance.** "Workflow Authoring Workflow" is stutter-y, but `workflow-design` → "Workflow Design Workflow" has exactly the same stutter and all 15 titles end in "Workflow". Deviating would itself be an invented naming exception requiring user approval.

### Registration — what it actually takes

**Nothing but the directory.** `listWorkflowsWithDiagnostics` does `readdir(workflowDir)` and filters on `stats.isDirectory()` (`src/loaders/workflow-loader.ts:375-390`); activities are discovered by `readdir(activitiesPath)` (`:63`, `:567`) and matched against `/^(\d+)-(.+)\.ya?ml$/` (`src/loaders/filename-utils.ts:6-10`). There is no registry, index or manifest to edit for `list_workflows` or `start_session`.

Critically, **`workflow.yaml` does not enumerate activities.** Its top-level keys are exactly `$schema`, `id`, `version`, `title`, `description`, `author`, `tags`, `rules`, `techniques`, `variables`, `initialActivity`. The only workflow-level reference to an activity is `initialActivity`. **This is what makes an additive migration land one activity at a time.**

Two things do need attention outside the directory: transitions naming a not-yet-existing activity produce an advisory `Activity manifest references unknown activity` warning (`src/utils/validation.ts:232-233`) — avoidable by terminating each step's graph at `__terminal__`, legal from anywhere (`validation.ts:42`); and library-wide guards begin walking the new tree immediately, so it must be **0-NEW from S1** with no baseline to inherit.

---

## 2. Replacement migration sequence

Strictly additive through S7. **`workflow-design/` is not written to at all before S6, and the S6 write touches no activity, technique or resource file.**

| # | Step | Lands | Green at this point |
|---|---|---|---|
| **S1** | **Skeleton + intake.** `workflow-authoring/workflow.yaml` (41 variables, `rules.activity` with the rewritten AP-107-clean headless rule, `techniques.activity`), `activities/01-intake-and-context.yaml`, the techniques `01` binds, `resources/change-brief.md`, and all four READMEs + `techniques/TECHNIQUE.md` (canonical-home map: **6 rows, not 12**). `01`'s only transition is `to: __terminal__ isDefault`. | A working single-activity workflow: classify → brief → stop. `validate-workflow-yaml {target_path}/workflow-authoring` passes; `check-all-refs` resolves every bind; `list_workflows` shows it; **zero** unknown-activity warnings. `workflow-design` untouched, all 32 sessions unaffected. |
| **S2** | **Draft.** `activities/06-scope-and-draft.yaml` + `scope-definition`, `yaml-authoring`, `readme-authoring`, `review-drafted-file`, `verify-artifact-conforms`, `prepare-workflow-branch`, `resources/scope-manifest.md`. Rewire `01 → scope-and-draft isDefault`; `06 → __terminal__`. | Create and update can draft end-to-end without audit. Both activities resolve; graph closed on `__terminal__`. |
| **S3** | **Sweep.** `activities/08-quality-review.yaml` + `audit-canon`, `resolve-consumer-surface`, `load-known-findings`, `reload-workflow`, `audit-schema-validation`, `resources/findings-register.md`. The four criteria homes are **cited cross-workflow**, not copied (see §7). Rewire `06 → quality-review`; `08 → __terminal__`. | The sweep runs and delivers. **Landing gate:** `check-resource-anchors` must resolve `workflow-design/anti-patterns#<anchor>`; if it cannot, extend the guard here or fall back to duplicating the canon and record that as a drain-time debt. |
| **S4** | **Verify, commit, close out.** `activities/09-validate-and-commit.yaml` + `verify-high-findings`, `compile-report`, `apply-audit-fixes`, `scope-verification`, `commit-verification`, `publish-workflow-pr`, `create-completion-doc`. Rewire `08 → validate-and-commit`, add the back edges (`09 → 08`, `09 → 01`, `09 → 06`) and the review transition `01 → quality-review`. | Full graph closed; all three modes reachable. **Review mode becomes usable only here**, since it needs `09:4 review-disposition`. |
| **S5** | **The delivery test.** A committed vitest under `SRV/tests/` asserting `get_activity` on `workflow-authoring::quality-review` returns `_meta.step_techniques` with the eager-eligible step ids and `_meta.resources` containing every criteria resource id including cross-workflow ids and `#section` suffixes. Plus `SRV/scripts/count-workflow-sessions.ts`. | Discharges M-i, M-h, **and** guards the coexistence strategy (see §7). Must land before S6. |
| **S6** | **Deprecate + unstick.** Append a deprecation sentence to `workflow-design/workflow.yaml`'s `description`; **freeze `version: 1.30.0`**; deprecation banner in `workflow-design/README.md` and the library root README. Set `status: abandoned` on the 2 structurally unresumable sessions (`content-drafting` from v1.2.1; `currentActivity: ""`) with recorded reasons. | The only pre-deletion write to `workflow-design`, and it touches no server-resolved definition file. Version stays frozen deliberately: bumping it makes `validateWorkflowVersion` (`validation.ts:53-57`) warn on every call for all 32 in-flight sessions. |
| **S7** | **Drain checks** (repeatable, no code). Run the census; append a row to the drain log. | No-op on the corpus. |
| **S8** | **Retirement**, gated on count == 0. | See §3. |

Independently landable: yes at every step — S1–S4 each leave a complete, validating workflow whose graph terminates; S5–S7 are additive; only S8 removes anything.

---

## 3. The drain-to-zero trigger, concretely

**The count.** Ship as part of S5, invoked:

```
npx tsx scripts/count-workflow-sessions.ts --workflow workflow-design --status running --list
```

It walks `SRV/.engineering/artifacts/planning/*/session.json` and **recurses through `triggeredWorkflows[i].state`**, because child sessions are embedded rather than separate files — the fact both the plan's M1 and the audit's C1 had to establish by hand, and the reason a flat glob undercounts (it would have found far fewer than 33 states). Output: an integer, plus the planning-folder path and `currentActivity` of every remaining session.

Equivalent for the record, pending confirmation of the field names on first run:

```
jq -s '[.[] | recurse(.triggeredWorkflows[]?.state?) | select(.workflowId=="workflow-design" and .status=="running")] | length' \
  /home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/*/session.json
```

A committed script is preferred over the one-liner precisely because the deletion decision hangs on it: it belongs in CI, not in shell history.

**Where retirement is recorded.** An append-only `drain-log.md` in the planning folder `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/`, one row per check: date, count, remaining folder list. The deprecation itself is recorded in `workflow-design/workflow.yaml`'s `description`, `workflow-design/README.md`, and the library root README row (S6).

**Reachability — the part that must not be hand-waved.** 21 of the 32 running sessions sit on activities that still exist under this strategy, so they *can* advance, but nothing compels anyone to finish them, and 19 are parked at `retrospective`. Drain-to-zero is only measurable if it is also *reachable*, so the trigger carries an explicit policy: any `workflow-design` session whose planning folder has had no commit for **≥90 days** is set `status: abandoned` with a recorded reason, and the 2 structurally unresumable ones are abandoned at S6. Without this the count never reaches zero and the duplication in §7 becomes permanent.

**What the S8 deletion commit removes.**

| Removes | Note |
|---|---|
| `workflow-design/` entirely — 9 activities, 37 techniques, 23 resources | minus the four canon homes |
| `git mv` of `anti-patterns.md`, `design-principles.md`, `schema-construct-inventory.md`, `convention-conformance.md` into `workflow-authoring/resources/` | same commit |
| Rewrite of `workflow-authoring`'s canon refs `workflow-design/<home>#<anchor>` → bare `<home>#<anchor>` | mechanical; verified by `check-resource-anchors` (hard-zero) |
| The `workflow-design` row in the library root `README.md` | |
| Its rows in `binding-fidelity-baseline.json` (13 entries), `review-mode-gating-baseline.json`, `identifier-qualification-baseline.json`, `audience-baseline.json` | **via `--update-baseline` only, never by hand** — M-b's trailing-comma defect relocates here |
| Precondition, run mechanically before deleting | that no file outside `workflow-design/` links into it — the check H2 shows was never done mechanically |

---

## 4. The ten fixes, as amendments

Plan file throughout: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/04-implementation-plan.md`.

### H1 — `check-audience` and `audience: agent`
**Defect.** Declaring `findings-register.md` as `audience: agent` makes `check-audience` demand a `.json` artifact name, so a `.md` register is one NEW violation and a non-zero exit.
**Correction.** Never emit an `audience:` attribute. `check-audience.ts:104` `continue`s unless `o.audience === 'agent'`, so omitting it keeps the guard at 0, and AP-96's Fix authorises exactly that — verbatim at `anti-patterns.md:1264`: *"Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute."* AP-96's other half (*"agent state → structured one-row-per-item data"*) is already satisfied by the register's row-shaped `## Findings`. The `.json` alternative is worse: it breaks the `## Template` guide and the readme-seed link. **Auditor correct; adopt.**
**Amends** `:190` (§1.6, "**agent state** (AP-96 `AP:1254`)") and `:241` (§2.2 §12, "Declared audience per AP-96").

### H3 — AP-68 stage naming presented as a benefit
**Defect.** `TECHNIQUE.md:70` reads *"…enforces the map **at the end of `scope-and-draft`**"* — confirmed verbatim — which is AP-68 Detect(a) (names an activity *and* a position); the plan preserved it as a dividend of id preservation.
**Correction.** The new tree authors `techniques/TECHNIQUE.md` fresh, so this is an authoring instruction, not an edit: the `canonical-home-map` rule reads *"…enforces the map."* The map also shrinks from 12 rows to 6, which is where H2's stale `TECHNIQUE.md:87` claim dies.
**Where I disagree with the auditor.** It calls `verify-high-findings`' Rule `verify-before-remediation` a second AP-68 hit. AP-68's Detect keys on naming a *stage, activity or position*; "Verification precedes remediation" names two capabilities, so AP-68(a) does not fire on its text. The underlying point is right under a different entry: once verification is `09:1` and remediation is `08:1-2`, the ordering is carried by the transition graph, so the rule restates structure — **AP-107 `bind-site-is-orchestration-truth` (`AP:1390`) / §20**, not AP-68. That changes the fix: don't delete the rule (which would lose its coupling to `refute-by-default`), rephrase it to a non-positional invariant — *"Do not emit a remediation instruction for a row whose claim has not been re-derived."*
**Amends** `:210` (§2.1 AP-68 row: three fixed hits → four, adding `TECHNIQUE.md:70`), `:206` (§2.1 AP-25 row, which retains both rules "verbatim"), `:414` (§4.2).

### H4 — `{impact_analysis_path}` in Gate 2
**Defect.** Gate 2 links `[impact analysis]({impact_analysis_path})` unconditionally; in create mode the producer `01:10` is gated `== 'update'` and the variable is `defaultValue: ""` (`workflow.yaml:125-128`), so it renders `[impact analysis]()`. A checkpoint `message` is `z.string().optional()` (`activity.schema.ts:124`) — there is no conditional-clause construct.
**Where I disagree with the auditor.** It files this under AP-128. With `defaultValue: ""` declared, AP-128's do-not-flag covers it — verbatim: *"Variables with a `defaultValue` seeded at session creation, where the gate is constant rather than undefined."* The live entry is **AP-97 `link-named-artifacts`**. That matters because the plan already convicts itself under AP-97: `:213` deletes `05:28-37` for precisely this rendering, quoting *"with the path still `\"\"`"*, and then commits the identical defect in Gate 2.
**Correction — adopt the auditor's preferred fix, refined.** Drop the clause from Gate 2's message. Give `compile-report` an **optional** `{impact_analysis_path}` input and a `## Sources` row emitted only when present — AP-128's own Fix shape, and the same optional-input-with-Protocol-branching the auditor already accepted as clean for `{change_constraints}`. Guard §30 (`DP:133-137`): `resources/findings-register.md` describes Sources abstractly ("one row per input artifact consulted, label and path"), never naming `impact-analysis.md`. Gate 2 then links only artifacts sharing its own arm — `change_brief_path` (`01:9`, `!= 'review'`), `scope_manifest_path` (`06:4`, `!= 'review'`), `report_path` (ungated) — all inside AP-128's "same expression as their producer" do-not-flag. Rejected: splitting Gate 2 into two mode-exclusive checkpoints (breaks the one-gate property, re-opens AP-05/AP-88).
**Amends** `:117` (§1.2 step 9), `:414` (§4.2 `compile-report`), `:213` (§2.1 AP-97 row).

### H5 — `{removal_disposition}` reader gate
**Defect.** Producer `06:7c` is gated `has_unflagged_removals == true`; reader `06:7d` is gated `removal_disposition == 'restored'` — different expressions, which is AP-128's Detect verbatim (*"a reader gated by an equality or relational operator, which cannot distinguish an undefined variable from a produced value"*).
**Correction, and the auditor's fix is insufficient.** The real failure is not undefinedness but **cross-iteration bleed**: 7c and 7d sit inside `file-drafting-loop`, `maxIterations: 50` (`:74`). Iteration 1 sets `restored`; iteration 2 with no flagged removals skips 7c, and 7d reads the *stale* `restored`, re-applying a restoration to a file that never flagged one. AP-128's suggested `operator: exists` does not help — a stale value exists. Gate 7d on the producer's own expression conjoined: `when: and(has_unflagged_removals == true, removal_disposition == 'restored')`. That lands in the do-not-flag and kills the bleed.
**Amends** `:78` (§1.2 step 7d), `:138` (§1.3 census row).

### H7 — "8 of 10 eager-eligible"
**Defect.** Impossible: `collectUngated` recurses into `kind: loop` without pushing it, and pushes only `kind: technique && s.id` (`workflow-tools.ts:713-719`, read first-hand).
**Correction — and both prior numbers are wrong.** Against §1.2's actual `08` inventory: eligible = steps 3, 4, 5 (top-level techniques, ungated) + 6a, 6b, 6c (loop-body techniques, ungated) = **6 of 10 steps, 6 of 8 technique steps**. Ineligible: steps 1–2 (gated `remediation_round > 0`), step 6 (loop container, recursed not pushed), step 6d (`kind: action`). The plan's 8 counts the loop container; the auditor's replacement figure of 7 assumed 5 ungated top-level techniques and 2 ungated loop-body techniques, which is not this inventory — it misses that 6d is an action.
State it structurally so it cannot rot: *"`_meta.step_techniques` contains every `kind: technique` step in `08` carrying no `when`/`condition`, at top level and inside the ungated `08:6` loop body — on the inventory above, steps 3, 4, 5, 6a, 6b, 6c. The loop container and `6d` (`kind: action`) are structurally ineligible."*
**Amends** `:103` (§1.2 `08` note) and `:311` (§3.4 "One context over the whole diff").

### H8 — `audit-schema-validation` and `--root`
**Defect, and it is worse than the auditor stated.** `scripts/workflows-root.ts:4-11` documents `--root` as *"a worktree's workflows directory"* and notes `validate-workflow-yaml.ts` *"already accepts a path argument"*. `{target_path}` is the worktree root — i.e. the library root — per `derive-workflows-target-path.md`'s Output (`<checkout>/.worktrees/{basename(planning_folder_path)}/`). So the plan's "add `--root {target_path}` to all three" is right for two guards and **wrong for the first**, which takes a positional per-workflow path; `--root` is not its interface.
**Correction.**

| Site | Corrected invocation |
|---|---|
| `audit-schema-validation.md:24` | `validate-workflow-yaml.ts {target_path}/{target_workflow_id}` — positional |
| `:30` | `check-all-refs.ts --root {target_path}` |
| `:34` | `check-binding-fidelity.ts --root {target_path}` |
| 7 added guards | each `--root {target_path}` |

`{target_path}/{target_workflow_id}` composes correctly because `6c` is bound inside the `forEach` over `target_workflow_id`.
**Plus a hole neither the plan nor the audit caught.** `{target_path}` is produced only at `06:1`, gated `!= 'review'` — and **review mode never enters `06` at all** (`01` transitions straight to `quality-review`). So in review mode `{target_path}` is `""`; `resolveWorkflowsRoot:19` requires a truthy `argv[flag + 1]`, so `--root ""` is treated as absent and the guards silently fall back to `../workflows`, the stale main checkout — H8's disease surviving its own fix, in the one mode whose entire job is sweeping other workflows. Fix: relocate `derive-target-path` to `01` as an **ungated** step; it is a pure derivation from `{planning_folder_path}`, produced at `01:1`. `ensure-worktree` stays in `06` gated `!= 'review'`.
**Amends** `:68` (§1.2 `06` step 1 → `01`), `:98` (§1.2 step 6c), `:414` (§4.2), and replaces M0.

### H10 — persisted coverage scorecard
**Defect.** `:249` gives `findings-register.md` a `## Coverage` section and `:287` requires ledger rows *"never omitted"*, while `:253` already asserts *"aggregate scorecards are presented in the gate message, never persisted."* The plan contradicts itself and AP-91's Fix, verbatim at `anti-patterns.md:1204`: *"present aggregate scorecards in-session, not persisted."*
**Correction.** `{coverage_ledger}` stays a bound in-session value carried `08:6b → 09:1 → 09:2`. The register's `## Coverage` persists **divergences only** (`blocked` / `not-applicable` rows), omitted entirely when empty per AP-87. `{has_coverage_gap}` and the gap list interpolate into both gate messages. The `09:1` cross-check (`:334`) is unaffected — it operates on the value, not the file. **Auditor correct; adopt.**
**Amends** `:249` (§2.2 §30(a)), `:287` (§3.2 Outputs), `:190` (§1.6).

### M-d — hard-coded 13/30/6/6
**Defect.** `:282` and `:291` assert "all **13**" / "exactly 13 `##` sections", making the literal load-bearing in three homes; a 14th section stales all three — AP-129 created by an AP-129 sweep.
**Correction.** (a) The anchor inventory lives in exactly one home, `audit-canon`'s Protocol phase 1, as a **list**, not a count. (b) The register guide's coverage contract reads *"one row per `##` section of each named home"* — structural — and never enumerates a sibling resource's internals (§30, `DP:133-137`). (c) `verify-high-findings` cites the inventory by hyperlink (M-m). (d) Delete the assertive counts from `:291`, `:249`, `:310`.
**Where I disagree with the auditor.** It proposes excluding **both** `#creation-rules` and `#authoring-guidance-mr` as carrying no applicable Detect. Excluding `#authoring-guidance-mr` is wrong: AP-126/127/128/129 live inside it (`:1666`/`:1676`/`:1688`/`:1700`), `:253` leans on AP-128 and AP-129 by name, and `:291` is a whole paragraph arguing that dropping this anchor is the failure mode to avoid. The auditor's own M-d text would delete the plan's best argument. `#creation-rules` (`:15-77`) is inapplicable only *while* the change surface excludes the canon — which is true now (`:424`) but false for any future run that edits it. So rather than excluding anchors by name, give the ledger a three-value status — **`walked | not-applicable (reason) | blocked`** — with `{has_coverage_gap}` counting `blocked` only. No count, no forced attestation, the evidenced-negative obligation preserved (a reason is required), and it still fires correctly on a canon-editing run.
**Amends** `:282`, `:291`, `:287`, `:249`, `:310`.

### M-i — a test that does not exist
**Defect.** R2(a) claims a regression "surfaces as a test failure"; §6.3 is a one-off acceptance table and no step adds a test. On-disk carrier of the claim is `:311`.
**Correction.** Add the committed vitest as **migration step S5** (§2 above). It discharges three things at once: M-i (a real failing test); **M-h** (a slug mismatch appears as a missing key, because `loadResourceDelivery` failures hit `continue` with no warning at `workflow-tools.ts:801`); and, new under this strategy, premature deletion of `workflow-design`, which would silently empty the new workflow's criteria bundle by that same path. That promotes the test from a nicety to the guard for the whole coexistence strategy.
**Amends** `:311`, and adds S5.

### M-m — AP-74 on the anchor inventory
**Defect.** `:334` has `verify-high-findings` obtain the inventory by `get_technique`, but no rule forbids restating it, so two techniques need the same inventory with no declared authority.
**Correction.** State in §3.6 and in §4.2's `verify-high-findings` extension that it **cites `audit-canon`'s phase-1 inventory by hyperlink and declares no inventory of its own** — AP-74's do-not-flag (*"A single authoritative home with pointers elsewhere"*) and §29 (`DP:129`). **Auditor correct; adopt** — and note this rule does double duty as the AP-110 guard once two design workflows coexist.
**Amends** `:334`, `:414`.

---

## 5. Dissolved versus surviving

| Finding | Verdict | Why |
|---|---|---|
| **C1** Critical | **Dissolved** | No activity file is rewritten or deleted while sessions run, so `readActivityRaw` keeps matching all 9 filenames and the 21 exposed sessions keep resolving. M1's rewriter, its 5-id map, its `checkpointResponses` re-keying and its `workflowVersion` restamp all become unnecessary — and the restamp becomes actively harmful, hence the frozen `1.30.0`. **Residual:** the 2 already-broken sessions stay broken (pre-existing, unchanged by either strategy) and must be explicitly abandoned or the drain never reaches zero. |
| **H2** | **Dissolved for the additive phase; recurs, reduced, at S8** | Nothing is deleted, so none of the 72 links breaks. The new tree authors `resources/README.md`, `TECHNIQUE.md` (6-row map) and `readme-seed.md` fresh and internally consistent, so every named breakage — `verify-high-findings.md:41`, `intake-classification.md:50/:85/:89`, `impact-analysis.md:58`, `TECHNIQUE.md:87`, `readme-seed.md:48` — never exists in it. At S8 the links die with the 25 files containing them, all inside `workflow-design/`, **conditional on the mechanical outside-references check S8 must run first.** |
| **H3** | **Partly dissolved; substance survives** | The claim H3 attacked (`:70` "stays true, a dividend of id preservation") disappears with in-place rewriting. The violation becomes an authoring instruction: do not reproduce the clause. The `verify-before-remediation` question survives untouched (fixed above, under AP-107). |
| **H6** | **Dissolved outright** | The window existed only because M6 rewrote `06` while old `08` still read the pre-rename `scope_manifest_confirmed`. The new workflow authors both sides in one tree and never declares both names; old `08` is untouched and keeps its own producer at `06:46-48`. |
| **H9** | **Dissolved** | The hazard was M8 deleting both `COMPLETE.md` producers without naming a rebind. The new tree binds `create-completion-doc` at `09:15-16` in the same commit that creates them, with `bare_filename: COMPLETE.md` (`:124`) and a guide row (`:191`) — producer and filename land together and cannot be orphaned. Old `workflow-design` keeps its `completion.md` mismatch until S8, harmlessly. |
| **M-a** | **Dissolved** | The `@`-column rewrite (M2) disappears entirely. Existing folders belong to sessions still running on `workflow-design`, whose prefixes are unchanged; the new workflow writes new folders with its own prefixes. No folder is migrated, so there is no count to get wrong. |
| **M-b** | **Not dissolved — deferred and re-homed to S8** | `workflow-design` keeps its baseline rows throughout coexistence; the correction still applies at deletion (`--update-baseline`, never by hand). The new workflow adds no row: `check-review-mode-gating.ts:150-152` skips any workflow not declaring `is_review_mode`, and the new one declares `operation_type`. |
| **H1, H4, H5, H7, H8, H10, M-d, M-i, M-m** | **Survive** | Defects in the target design; the id is irrelevant. Fixed in §4. |
| **M-l** | Already fixed on disk | `:113`, `:140` are instance-qualified. |
| **M-e, M-f, M-g, M-h, M-j, M-k** | Survive, outside the ten | M-h is incidentally discharged by S5. M-k's site is confirmed verbatim — `workflow.yaml:191`, the unterminated *"(bound per iteration when reviewing multiple."* |

---

## 6. Mode confirmation

Gate inventory from the on-disk §1.2/§1.4:

| Arm | Count | Sites |
|---|---|---|
| `== 'create'` | **1** | `01:6 elicit-change-brief` |
| `== 'update'` | 3 | `01:7 synthesize-change-brief`, `01:8 analyze-impact`, `01:10 persist-impact-analysis` |
| `!= 'review'` | 10 | `01:5`, `01:9`, `06:1`, `06:2`, `06:3`, `06:4`, `06:5` (condition), `06:8`, `09:7`, `09:9` (condition) |
| `== 'review'` | **3, not five** | `01:4 halt-on-wrong-target` (when); the `01 → quality-review` transition `and(operation_type == 'review', review_scope_confirmed == true)`; `09:4 review-disposition` (condition) |

The brief's "five review-only gates" is not reproducible from the on-disk text — I count three, plus two review-*coupled* expressions that are not themselves review gates: Gate 1's `update_seeded_from_review != true` clause (`:50`) and the `review_closed` effect (`:112`). I flag the discrepancy rather than invent two; the missing §6.2 may have counted differently.

**All three modes are preserved, with two holes — one new, one carried.**

1. **The `{target_path}` hole** (H8 above). Review mode has no producer for it, and the empty-string fallback is silent. Fixed by relocating `derive-target-path` to `01`, ungated.
2. **`target_workflow_ids` after a review→update escalation.** `:103` claims the `08:6` loop *"runs once in create/update and N times in review."* But `09:4 review-disposition.fix-issues` sets `operation_type: update` and returns to `01` (`:112`) **without resetting `target_workflow_ids`**, so an escalated update re-sweeps all N review targets when only one was fixed. Correction: `fix-issues` also narrows `target_workflow_ids` to the escalated target, and `:103`'s claim is amended to name the escalation path.

Otherwise hole-free. In review, neither brief producer fires and `persist-change-brief` (`!= 'review'`) is skipped — consistent. Gate 2 and its links are `!= 'review'`, the same arm as their producers. The escalation re-enters `01` with `operation_type: update`, so `synthesize-change-brief` and `analyze-impact` fire, Gate 1 is correctly suppressed by `update_seeded_from_review`, and `06` runs with a worktree.

**Is anything create-mode-specific silently lost from `04-pattern-analysis` / `applicable-constructs`?** Two real losses, neither silent, one mis-stated:

- **`04-pattern-analysis` carried zero conditions** (`:442`), so it ran in *all three* modes — nothing was create-*specific*. What create mode actually loses is **pre-draft** sibling-pattern guidance: the survey moves to `08:5`, downstream of the draft, where it feeds detection (`{reference_workflows}` → `audit-canon`) rather than authoring. `:227` declares this (*"Removal is deliberate — see §4.5 loss (3)"*), so it is disclosed. But `:442`'s framing — that the loss is "an applicable patterns and practices document" — understates it. The loss is that a first-time author now drafts *before* seeing sibling conventions. Optional mitigation: relocate `survey-reference-workflows` to `01`, ungated, so `{reference_workflows}` is available to `yaml-authoring` at write time and to `audit-canon` later. Cost: `01` gains a step and H7's eager count for `08` becomes 5 rather than 6 — state whichever inventory is adopted, since H7's corrected assertion is structural and holds either way.
- **`applicable-constructs`** is genuinely free: zero inbound links corpus-wide (independently confirmed by the audit), both outputs dead path variables, and the literacy gate it fed was a no-op `action: set` at `01:210-223`. Its substance survives as write-time citation obligations inside `yaml-authoring` (`:39,:44,:80,:84`, per `:224`). Not a loss.

---

## 7. What this strategy makes worse

**1. Technique-body duplication is unavoidable, and the mechanism forces it.** Cross-workflow *resource* refs exist — `parseResourceRef` accepts `workflow/id#section` (`src/utils/resource-ref.ts:1-26`, e.g. `meta/bootstrap-protocol`). Cross-workflow *technique* binds resolve `::` as path segments (`technique-loader.ts:227`, `:586`), and every cross-workflow bind in the corpus is **group-qualified**: `workflow-engine::list-workflows`, `manage-artifacts::write-artifact`, `version-control::commit-regular-files`, `work-package::update-pr::post-review-comment`. `workflow-design`'s techniques are **flat files** in `techniques/`, with no group segment — so they have **no cross-workflow address**, and the new workflow must author its own copy of every design-local technique it keeps (≈18 of 23). That is a real AP-74 / AP-110 exposure with no mitigation but the time-box. One thing to do anyway: author them inside a group in the new tree (`techniques/workflow-authoring/…`) so this is the *last* time they get copied.

**2. The 154,507 B canon need not be duplicated — and must not be.** The four criteria homes are resources, so the new workflow cites them cross-workflow: `workflow-design/anti-patterns#<anchor>`, `workflow-design/design-principles`, `workflow-design/schema-construct-inventory`, `workflow-design/convention-conformance`. One physical copy, §6 One Authoritative Home fully intact, and eager delivery still works because the eager loop calls the same `loadResourceDelivery` as `get_resource` (`workflow-tools.ts:799-806`). Two costs: the new workflow depends on the tree being retired, so S8 must `git mv` and rewrite the prefix; and **premature deletion silently empties the criteria bundle**, because an unresolvable resource is skipped with `continue` and no warning (`:801`). The S5 test is the only detector, which is why it lands before S6. Unverified and gating S3: whether `check-resource-anchors` resolves cross-workflow anchors. If not, extend the guard or accept a 154 KB four-file duplication that the drain must time-box.

**3. Two design workflows in `list_workflows`.** A user or a `discover` bootstrap can start the wrong one, and the wrong one is the 1,926-line version. Mitigated by the S6 deprecation sentence in `description` (which `list_workflows` surfaces), with `version` frozen at `1.30.0` so `validateWorkflowVersion` stays silent for 32 in-flight sessions.

**4. The corpus grows before it shrinks.** ~650 new activity lines plus ~18 duplicated technique files, and every library-wide guard now walks both trees. The new tree must be **0-NEW from S1** with no baseline to inherit — strictly harder than the in-place plan, which inherited 13 baselined `binding-fidelity` entries.

**5. The time-box is only as good as the abandonment policy — the strategy's central weakness.** In-place migration had a zero-length duplication window and a hard-brick risk. This strategy has a zero brick risk and a *permanent duplication* risk. That trade is correct, but it converts a sharp failure into a slow one, which is much easier to ignore: 19 sessions sit at `retrospective` and nobody is obliged to finish them. Hence the drain log and the ≥90-day rule. Without them, AP-74/AP-110 across two trees is the steady state, and the audit's own C1 gets traded for a chronic §6 violation.

**6. `workflow-design` keeps every defect the plan exists to fix, for the whole window.** Anyone resuming one of the 32 sessions gets the 46-invocation worst case, the 128 KB whole-file catalogue link, the 11 effect-less soft gates, and — most seriously — the two dangerous 30 s auto-advances at `09:54-77` (auto-selects **proceed to commit** when `fail_count > 0`) and `09:102-125`. In-place rewriting would have fixed those *for in-flight sessions*. This strategy deliberately does not, and that is the honest price of not bricking them.

---

**Sanity check performed:** I re-read the seven required output sections against the brief; every one is present. Every code claim I make is first-hand — `collectUngated` (`workflow-tools.ts:713-719`), `resolveWorkflowsRoot` (`workflows-root.ts:15-22`), `parseResourceRef` (`resource-ref.ts:1-26`), `listWorkflowsWithDiagnostics` (`workflow-loader.ts:375-390`), the eager resource loop (`:795-830`), `workflow.yaml`'s top-level keys and the `impact_analysis_path`/`removal_count`/`target_path`/`target_workflow_id` declarations, `derive-workflows-target-path.md`, `audit-schema-validation.md:18-40`, `TECHNIQUE.md:66-90`, `convention-conformance.md`, and AP-91/96/128 verbatim. Three findings I revise against the auditor (H3's entry attribution, H4's entry attribution, M-d's exclusion of `#authoring-guidance-mr`) and two where I strengthen the fix beyond it (H5's cross-iteration bleed, H7's recount to 6). Unverified and flagged in place: cross-workflow anchor support in `check-resource-anchors` (gates S3), and the session JSON field names in the jq fallback. 18 tool calls, within budget.

result: Replaced the in-place migration with an 8-step additive strategy on a new workflow id `workflow-authoring` (1.0.0), registered by directory scan alone with no registry edit; specified a drain-to-zero retirement trigger with a committed session-census script, a ≥90-day abandonment policy to make zero reachable, and a defined S8 deletion commit; dissolved C1, H6, H9, M-a and (for the additive phase) H2, with H3 partly dissolved and M-b deferred to S8; and amended all ten surviving design defects against specific plan line numbers — revising the auditor on H3's and H4's entry attribution and on M-d's proposed exclusion of `#authoring-guidance-mr`, and strengthening H5 (cross-iteration bleed makes `operator: exists` insufficient) and H7 (correct eager count is 6 of 10, not the plan's 8 nor the auditor's 7) — plus two holes neither document caught: `{target_path}` is unproduced in review mode so the guards silently validate the stale main checkout, and `target_workflow_ids` is not reset on a review→update escalation.
