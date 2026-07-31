# Build log — `workflow-authoring`

Append-only record of each build step: what landed, what the guards said, which open decisions closed, and every deviation from [01-target-architecture.md](01-target-architecture.md) / [02-build-sequence.md](02-build-sequence.md) with its reason.

**Build worktree:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-workflow-authoring-build` — a worktree of the `workflows` lineage, so workflow directories are its immediate children and `{target_path}` is the worktree root itself, with no `/workflows` suffix. Branch `workflow/workflow-authoring`, based on `origin/workflows`.

**Correction to the README's state of the world.** `workflows` head is **`2feda8da`** (PR #328, `fix(meta,work-package): close the engine defects from the #141 run (#324)`), not `b9b1056a`. The build is based on `2feda8da`.

---

## S1 — Skeleton + intake · landed, all guards green

### Landed

| Path | Notes |
|---|---|
| `workflow-authoring/workflow.yaml` | identity block, `rules.activity` (2), `techniques.activity`, **42 variables** |
| `workflow-authoring/activities/01-intake-and-context.yaml` | 13 steps, 2 checkpoints, graph closed on `__terminal__` |
| `workflow-authoring/techniques/TECHNIQUE.md` | 4 hoisted inputs, 3 workflow-wide rules incl. the canonical-home map |
| `workflow-authoring/techniques/workflow-definition/TECHNIQUE.md` | group contract |
| `workflow-authoring/techniques/workflow-definition/` | `derive-workflows-target-path`, `intake-classification`, `elicit-change-brief`, `synthesize-change-brief`, `impact-analysis` |
| `workflow-authoring/resources/` | `change-brief.md`, `impact-analysis.md`, `elicitation-guide.md`, `update-mode-guide.md`, `readme-seed.md`, `README.md` |
| `workflow-authoring/README.md`, `activities/README.md`, `techniques/README.md` | orientation, authored against the tree as landed |
| `work-package/techniques/manage-artifacts/write-artifact.md` | **one cross-tree edit** — see D-7 below |

### Guard results

Run from `/home/mike1/projects/dev/workflow-server` against `--root <build worktree>`. All fourteen green.

| Guard | Result |
|---|---|
| `validate-workflow-yaml.ts` (positional) | All YAML valid — 1 activity, **8 technique files** (`README.md` and both `TECHNIQUE.md` included, per CA-5) |
| `validate-activities.ts` (**positional**, see D-9) | 109 passed, 0 failed |
| `check-all-refs.ts` | 0 unresolved corpus-wide |
| `check-resource-anchors.ts` | hard-zero clean; **coverage proved by probe**, see decision 1 |
| `check-variable-model.ts` | clean |
| `check-fragments.ts` | clean — every ref resolves, no inline duplicates |
| `check-technique-template.ts` | clean |
| `check-activity-technique-overlap.ts` | clean |
| `check-binding-fidelity.ts` | **0 NEW** (228 total, 256 baselined, 28 fixed) |
| `check-audience.ts` | 0 total, 0 NEW |
| `check-review-mode-gating.ts` | 0 NEW; `workflow-authoring` adds no row (it declares `operation_type`, not `is_review_mode`) |
| `check-self-provisioned-input.ts` | clean |
| `check-identifier-qualification.ts` | 0 NEW |
| `check-stealth-isolation.ts` | clean |

The 28 "fixed" and 1 "fixed" counts are pre-existing baseline drift from the newer `workflows` head plus the one entry D-7 removes. **No baseline was updated** (GI-8).

### Registration assertion

Read through `listWorkflowsWithDiagnostics` / `loadWorkflow` against the worktree (GI-9 — not through the served catalog):

```
list_workflows row: workflow-authoring / Workflow Authoring Workflow / 1.0.0
id/version/initialActivity: workflow-authoring 1.0.0 intake-and-context
activities: 01:intake-and-context          (artifactPrefix server-computed)
declared variables: 42
load errors: []
valid transitions from intake-and-context: ["__terminal__"]
```

Zero unknown-activity warnings, as required — not "expected warnings".

---

## Open sub-decisions closed at S1

### 1. Cite the canon cross-workflow, or duplicate it? — **CITE.** Settled.

`check-resource-anchors --root <worktree>` is hard-zero clean with the cross-workflow citations in place.

Guard coverage was **proved, not assumed** (GI-4): one authored anchor was temporarily corrupted and the guard reported it, then restored.

```
[missing-anchor] workflow-authoring/techniques/TECHNIQUE.md
                 -> ../../workflow-design/resources/anti-patterns.md#deliberately-bogus-anchor
```

So the relative `](../../workflow-design/resources/<id>.md#<anchor>)` form is inside hard-zero coverage. **No canon duplication and no guard extension.** The 154,507 B stays in one place.

### 2. Are technique-Input-only variables declared in `workflow.yaml`, or technique-local? — **TECHNIQUE-LOCAL.** Settled.

S1 carries five such values — `change_brief`, `structural_inventory`, `change_category`, `impact_analysis`, `report_path` — all undeclared at workflow level, and `check-binding-fidelity` read-resolution is 0 NEW. The rule to apply at S3 to the eight remaining candidates:

> A value is declared in `workflow.yaml variables[]` **iff** the orchestration layer reads or writes it — a step `when`, a checkpoint `condition`, a message, an `action: set` target, a `forEach` collection or loop variable, or an `outputs.*` remap target — or it is read at a bind site under a name other than its producing technique's declared Output name. Everything else flows technique `## Outputs` → technique `## Inputs` by name and stays technique-local.

Confirmed mechanically: the guard resolves a read against "an id declared by the workflow's techniques", so a name-matched chain needs no declaration, and declaring one anyway would be a variable with no reader (BL-3).

### 3. Where does `survey-reference-workflows` bind? — still open (S3), but narrowed.

S1 established a fact that bears on it: **`workflow-engine::list-workflows` returns only the catalog** — `{ id, title, description, tags }` per `meta/techniques/workflow-engine/list-workflows.md:12-14`. It cannot supply definition bodies. `workflow-design/techniques/intake-classification.md:81`'s "Load targets via [list-workflows]" was therefore both an AP-114-class invoke inside a Protocol **and** a mis-citation: the structural inventory it feeds cannot come from a catalog. The new `intake-classification` derives the baseline by enumerating the target's files under `{target_path}` instead, which removes the invoke and needs no extra bind at `01`.

---

## Deviations from the specification, with reasons

### D-1 — Technique group is `workflow-definition`, not `workflow-authoring` · **blocking defect in the spec**

`07` §7.1 / RP-7's corollary direct the local techniques into `techniques/workflow-authoring/…`. **That group name cannot be bound.** `parseTechniquePath` and `readTechnique` treat a leading `::` segment that names a real workflow's techniques directory as a cross-workflow prefix (`src/loaders/technique-loader.ts:122`, `:232`), then resolve the remainder as a **flat** technique in that workflow with **no fallback to a group**. Proved against the live loader:

```
workflow-authoring::intake-classification                                    -> TechniqueNotFoundError
workflow-definition::intake-classification                                   -> RESOLVES
workflow-authoring::workflow-definition::intake-classification (foreign)     -> RESOLVES
```

`workflow-definition` therefore keeps both the in-workflow bind form and the cross-workflow address that the whole group mitigation exists for (02 §6 item 1). The hoisted root contract reaches group leaves as `inherited_inputs`, confirmed by the same probe.

### D-2 — One cross-tree edit: `write-artifact`'s `target_dir` optional marking · **canon-sanctioned**

`write-artifact.md` declared `*(optional, default `planning_folder_path`)*`. The corpus convention both the guard and the server read is `OPTIONAL_INPUT_RE = /^[*_]{0,2}\(optional\)/i` plus a `#### default` sub-section (`src/utils/binding-provenance.ts:39`), and the comma-form matches neither — so an unbound `target_dir` reads as an orphan input. It surfaced as the only NEW binding-fidelity violation at S1, and it is the same violation `work-package` already carries baselined.

The two in-tree escapes both fail: binding `target_dir: planning_folder_path` at each site is precisely the D-9 restatement pattern **CT-6 forbids**, and `--update-baseline` is forbidden by **GI-8**. AP-110's do-not-flag names the remaining route verbatim — *"parameterising or minorly refactoring the shared/meta op itself to absorb a new caller (new optional inputs, defaults, outputs, small protocol branches) while preserving existing callers"*. The edit is description-only: no input, output or protocol phase changed, no caller affected, and it also clears `work-package`'s own baselined entry.

**Consequence to carry:** S1 is no longer *strictly* additive. The edit is one hunk in one file and is independent of everything else in S1.

### D-3 — `01`'s activity-level "corrections must persist" rule is rephrased, not copied

`check-fragments` `duplicate-rule` is hard-zero and fires at **≥2 distinct workflows**, so copying `workflow-design/workflow.yaml:17` verbatim is an immediate violation. Extracting a shared fragment needs an edit to `workflow-design/workflow.yaml` (forbidden before S6, and S6 is `description`-only) or to `meta/workflow.yaml` (a second cross-tree edit). The duty is kept as a sharper invariant in this workflow's own words:

> A correction the user makes at a gate is recorded against the fact it corrects, and every later gate is answered from the corrected value — never from the value it superseded.

### D-4 — `bind-planning-folder-path` carries `message`, not `value:`

`01` §2.1 row 1 and §6 call this a value-BEARING `set`. There is no literal to author: the planning folder is server-resolved and reaches the worker only through the session summary, and no ambient id names it (`AMBIENT_CONTEXT_IDS` is `target_symbol`, `impact_report`, `model_id`). The corpus idiom in both reference workflows — `workflow-design/activities/01:7-12` and `work-package/activities/01:524-529` — is `set` + `message`, and it is followed here with the message narrowed to the value's identity rather than its derivation, which keeps it outside AP-34's Detect (that entry keys on derivation HOW for a **domain payload**; this is orchestration state, AP-33 do-not-flag (c)).

### D-5 — `{open_judgements}` is not declared as an Output

`01` §2.1 row 7 lists it. Nothing consumes it: no read, no condition, no binding value, no same-named input — which is `check-binding-fidelity`'s `dead-output` (`:484-490`), hard against a tree with no baseline. It is also a second canonical home for a fact the canonical-home map assigns to `change-brief.md`. Only `{open_judgements_count}` — read by `01:12`'s gate — is declared.

### D-6 — `{change_constraints}` is deferred from `impact-analysis` to S2

Same rule, same guard: at S1 its consumers (`scope-definition`, `audit-canon`) do not exist, so declaring it now is a `dead-output`. It lands in the same commit as `scope-definition`'s Input, which is also what CT-8 requires in the mirror direction.

### D-7 — `01` declares two `__terminal__` transitions, not one

02 S1 says "exactly one — `to: __terminal__`, `isDefault: true`". BL-1/BL-4 say the halt structure must be right in the **first** authored YAML. Both are satisfied by authoring the real first-listed reject edge now, with the default edge also terminal until S2 gives it a target:

```yaml
transitions:
  - to: __terminal__        # and(operation_type == 'review', review_scope_confirmed != true)
  - to: __terminal__        # isDefault: true
```

Zero warnings either way (`getValidTransitions` returns `["__terminal__"]`). S2 changes one `to:` value instead of inserting an edge.

### D-8 — `announce-wrong-target`'s message states status, not the exit

`01` §2.1 row 5 asks it to name "the rejected target set and the terminal exit". Narrating the exit is routing that `transitions` owns, which is AP-98's Detect with no carve-out available (its do-not-flag is "pure factual status clauses with **no** routing narration"). The message names the rejected set and stops; T1 carries the exit.

### D-9 — `validate-activities.ts` takes a **positional** path, not `--root`

02 §2 S1 and §3 both invoke it as `--root {target_path}`. It does not implement `--root`; it resolves the argument as a workflow-or-workflows folder (`scripts/validate-activities.ts:6-12`) and reports `No workflow directories found in <repo>/--root`. This is the same class as GI-1's correction for `validate-workflow-yaml.ts` and belongs beside it. Corrected form:

```
npx tsx scripts/validate-activities.ts {target_path}
```

### D-10 — Orientation surfaces carry the S1 tree, not the S4 tree

The canonical-home map is **3 rows**, the readme-seed Progress inventory is **3 rows**, and the root README's activity table is **1 row** — each re-derived from the tree as landed, per CA-6 ("authored fresh at S1 and revisited at S2–S4") and CA-4 (counts derived mechanically, never hand-assembled). No count is written into any Rule or Protocol (CA-1). The map reaches its settled 6 rows when `scope-manifest.md`, `findings-register.md` and `COMPLETE.md` land at S2–S4.

### D-11 — `structural-inventory.md` has no guide, because nothing persists it

`intake-classification` keeps `{structural_inventory}` as an in-session value and drops the artifact, so per AP-116's direction (filename → guide, never the reverse) no guide is owed. Its shape is stated in the Output declaration, which AP-119's do-not-flag allows explicitly ("meaning/shape/allowed-value identity including brief shape examples").

---

## S2 — Draft · landed, all guards green

### Landed

| Path | Notes |
|---|---|
| `workflow-authoring/activities/06-scope-and-draft.yaml` | **9 top-level steps / 13 with the loop body** (see D-12), 2 checkpoints, graph closed on `__terminal__` |
| `…/techniques/workflow-definition/derive-workflow-branch.md` | new — the local half of the split in D-12 |
| `…/techniques/workflow-definition/scope-definition.md` | persist phase dropped (AP-68); consumes `{change_constraints}` optionally (CT-4) |
| `…/techniques/workflow-definition/yaml-authoring.md` | takes `{current_file}`, not `schema_type` (D-17); validator phase dropped (D-18) |
| `…/techniques/workflow-definition/review-drafted-file.md` | reduced to removal detection (D-19) |
| `…/techniques/workflow-definition/readme-authoring.md` | target README, orientation stance cited by section |
| `…/techniques/workflow-definition/verify-artifact-conforms.md` | no Outputs (D-20); measures each artifact against its own guide (D-21) |
| `workflow-authoring/resources/scope-manifest.md` | new creation guide |
| `…/techniques/workflow-definition/impact-analysis.md` | `{change_constraints}` declared with its consumer, discharging D-6 |
| `…/techniques/workflow-definition/derive-workflows-target-path.md` | gains Output `repo_root` (D-13) |

**Rewired.** `01`'s default edge `__terminal__` → `scope-and-draft`; `06` terminates. `01`'s first-listed reject edge is untouched, which is what D-7 bought.

**Extended.** Canonical-home map gains `scope-manifest.md` and its `verify-artifact-conforms` enforcement pointer; readme-seed Progress inventory gains the two `06` rows; resource index, artifact-to-guide map, cross-workflow list, technique orientation map and both READMEs re-derived against the S2 tree.

### Guard results

All fourteen green. `validate-workflow-yaml`: 2 activities, **14 technique files**. `validate-activities`: 110 passed, 0 failed. `check-binding-fidelity`: **0 NEW** (227 total, 256 baselined, 29 fixed). Every other guard clean or 0 NEW. No baseline updated.

One failure surfaced and was fixed in this step: `check-resource-anchors` caught a `../../` canon link in `scope-definition.md` that needed `../../../` from inside the group. That is the guard earning the coverage the S1 probe proved it has.

### Graph and bind assertions

Read through the loader against the branch:

```
activities: 01:intake-and-context, 06:scope-and-draft
load errors: []
valid transitions from intake-and-context: ["__terminal__","scope-and-draft"]
valid transitions from scope-and-draft:    ["__terminal__","scope-and-draft"]
06: all binds resolve
06 eager-eligible technique step ids: []
```

`scope-and-draft` appears in its own valid set without a `transitions[]` entry naming it — `getValidTransitions` harvests checkpoint `effect.transitionTo`, exactly as the transition graph predicts for the `06 → 06` revise edge.

**`06` has no eager-eligible steps, structurally.** Every top-level technique step carries a mode gate and the drafting loop is gated, and `collectUngated` skips on `when`/`condition` before recursing. So every technique in `06` is fetched lazily by `get_technique`. This is expected: the eager-delivery lever the plan pulls is `08`'s, not `06`'s.

---

## S2 deviations

### D-12 — `prepare-workflow-branch` is split into a local derive plus a bound shared op · **AP-114 in the source**

The source technique's Protocol phase 2 reads *"Compose [create-worktree](…)"* — an op invoke by canonical hyperlink inside a Protocol, which AP-114 Detects with no carve-out (its do-not-flag holds only *"with no Protocol Apply/`::` work invoke"*). It is not a corpus convention either: a sweep for that idiom across every workflow's techniques returns **one** file, this one. §25 is explicit that all multi-technique work lives in activity `steps[]`, and AP-110's do-not-flag names the shape adopted here — *"a local technique that only assembles caller-specific values while the activity binds the shared op as its own step"*.

So `06` binds two steps where the spec's table has one:

| step | binds | produces |
|---|---|---|
| `derive-workflow-branch` | `workflow-definition::derive-workflow-branch` | `{workflow_branch}` |
| `ensure-worktree` | `work-package::manage-git::create-worktree` | `{worktree_created}` |

`06` is therefore 9 top-level steps, not 8. Per §25, step count is not the metric — activities, artifacts, walkers, variables and dispatches are.

### D-13 — `derive-workflows-target-path` gains Output `repo_root`

Binding `create-worktree` directly needs `repo_root`, which the op declares required. Declaring a workflow variable for it would break the settled 42 and add a variable whose only reader is one bind (BL-3). The value was already computed inside the technique as a local sigil — the ancestor of `{planning_folder_path}` above its `.engineering` artifact root — so it is promoted to a declared Output and name-matches into the bind. No new variable, no orphan input, no step binding.

### D-14 — `create_branch: true` is bound, against CT-6

`create-worktree.md` states its default in prose — *"Optional. Boolean, default `true`"* — which matches neither `OPTIONAL_INPUT_RE` nor a `#### default` sub-section, so an unbound `create_branch` reads as an orphan input. It is baselined for `work-package` and would be NEW here. The `write-artifact` remedy (D-2) would apply identically, but the standing steer for S2 was to keep changes inside the new tree, so the bind is taken instead. One line, removable the moment `create-worktree.md`'s marking is corrected the same way.

### D-15 — `06`'s tail is gated on the manifest confirmation, not only on mode · **BL-1**

`scope-confirmed.revise` carries `effect.transitionTo: scope-and-draft`, and `transitionTo` is recorded, not engine-applied. Without a gate on the remainder, a revise selection still authors the target README and runs artifact conformance against a manifest the operator just rejected. Both tail steps therefore carry `operation_type != 'review' && scope_manifest_confirmed == true`. §2.2's table shows only the mode clause.

### D-16 — `bump-scope-round` also gates on mode · **BL-5**

`scope_manifest_confirmed` defaults false, so the spec's single-clause gate `scope_manifest_confirmed != true` is **true in review mode** and the step would fire on a run that never enumerated a manifest. §5's mode table marks it `—` for review, which the single clause does not deliver. Gate is `operation_type != 'review' && scope_manifest_confirmed != true`. With that, review mode passes through `06` doing nothing at all — every step is either mode-gated or gated on a confirmation review never reaches.

### D-17 — `yaml-authoring` takes `{current_file}`, not `schema_type` · **WI-7**

WI-7 names `yaml-authoring`'s `schema_type` as one of two inputs a worker could satisfy only by improvisation: not a declared variable, not a prior step's output, not supplied by a binding, not marked optional. The manifest entry already carries the file's kind and is the loop variable, so the kind is derived from `{current_file}` and the unresolvable input disappears rather than being bound at the step.

### D-18 — `yaml-authoring` drops the corpus-validator phase · **AP-51 / AP-74**

Its source phase 6 ran the repo's workflow validator over the whole directory. `audit-schema-validation` wraps exactly that capability and is bound as its own step at S3, so re-teaching the recipe in a drafting op is the raw-tool-recipe-where-a-wrapper-exists defect, and a walker is not a wrapper. Per-file schema conformance and failure resolution stay, because those are the drafting op's own produce path.

### D-19 — `review-drafted-file` keeps one Output and is renamed by capability

The spec directs dropping its persist phase and the `file_review_note*` outputs and keeping `{has_unflagged_removals}`. With the note gone the op no longer authors a note, so its Capability now states what it does: detect content a drafted file removes that no removals inventory accounts for. `{file_review_note}` is not declared — with no persist step it would be a dead output.

### D-20 — `verify-artifact-conforms` declares no Outputs

Its source declares an `artifact_conformance` envelope that nothing consumes — a dead output against a tree with no baseline. Its real product is the corrected artifacts on disk plus an exceptions-only in-session report, which is also what AP-91 asks for (*"present aggregate scorecards in-session, not persisted"*). The Capability states that directly.

### D-21 — Conformance is measured against each artifact's own guide

The source checks artifacts against a five-name output-discipline vocabulary — `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, `line-budget` — that lives in `work-package`'s `manage-artifacts` contract, not in this tree. Copying it here would be AP-74 duplication of another workflow's map. Under §29 the check cites the policy where it lives: each artifact is measured against the `## Rules` of the guide its own filename maps to, plus the canonical-home map. Every guide in `resources/` already carries those Rules, including its line budget.

---

## S3 — Sweep · landed, all guards green

### Landed

| Path | Notes |
|---|---|
| `workflow-authoring/activities/08-quality-review.yaml` | **3 top-level steps / 7 with the sweep loop**, no gates, graph closed on `__terminal__` |
| `…/techniques/workflow-definition/audit-canon.md` | **the single walker** — six citers collapsed to one, anchor inventory in Protocol phase 1 as a list, one Rule |
| `…/techniques/workflow-definition/load-known-findings.md` | new |
| `…/techniques/workflow-definition/resolve-consumer-surface.md` | new |
| `…/techniques/workflow-definition/reload-workflow.md` | re-authored: surface plus base ref, no op invoke |
| `…/techniques/workflow-definition/audit-schema-validation.md` | every guard named with its corrected invocation |
| `workflow-authoring/resources/findings-register.md` | new, section-delivered |
| `…/techniques/workflow-definition/intake-classification.md` | `target_workflow_ids` is non-empty in every mode (D-22) |

**Rewired.** `06`'s default edge `__terminal__` → `quality-review`; `08` terminates.

**Extended.** Canonical-home map gains `findings-register.md`; resource index, artifact-to-guide map, cross-workflow list, technique orientation map, readme-seed and both READMEs re-derived against the S3 tree.

### Guard results

All fourteen green. `validate-workflow-yaml`: 3 activities, **19 technique files**. `validate-activities`: 111 passed, 0 failed. `check-binding-fidelity`: **0 NEW** (227 total, 256 baselined, 29 fixed). No baseline updated.

One failure surfaced and was fixed in-step: `coverage_ledger` was a `dead-output`, because both its readers are S4 operations. Fixed by having the gather step's own `set` name the values it gathers — which it should have said anyway.

### Delivery assertion — the number CA-3 can freeze

Computed by mirroring `collectUngated` over the authored inventory: it skips on `when`/`condition` **before** the loop branch and pushes only `kind: technique` steps carrying an `id`.

```
08: all binds resolve
08 eager-eligible: 6 of 7 steps, 6 of 6 technique steps
  ids: [load-known-findings, survey-reference-workflows, rebind-target-baseline,
        resolve-consumer-surface, sweep-canon, validate-schema]
```

**Six**, as `07` §4 H7 concluded — on a different denominator, because this inventory carries no `kind: action` accumulator step and defers the two remediation steps (D-23). The loop container is the only ineligible step: `collectUngated` recurses into an ungated loop without pushing it. When S4 prepends the two gated remediation steps the eligible set is unchanged, so the figure to freeze is **6**.

### Every criteria section resolves, and every one fits

`loadResourceDelivery` — the same function eager delivery and `get_resource` both call — resolves all sixteen resource ids projected from `08`'s technique bodies:

| Home | Sections | Largest section |
|---|---|---|
| `workflow-design/anti-patterns` | 13, each fetched by anchor | `#technique-protocol-anti-patterns`, 29,819 chars |
| `workflow-design/design-principles` | whole file, 12,289 chars | — |
| `workflow-design/schema-construct-inventory` | whole file, 11,866 chars | — |
| `workflow-design/convention-conformance` | whole file, 1,383 chars | — |

This is the concrete form of §30's mandate. **Every anti-patterns section is under the 80,000-char per-resource eager cap; the whole file at 128,341 is not**, so a whole-file reference could never be bundled and — worse — an oversized body is skipped silently. Stated honestly: the sections sum to roughly the whole file, so anchoring buys no net byte saving. What it buys is that each unit is *reachable at all*, and that a worker fetches one unit at a time instead of needing the catalogue in a single payload.

---

## S3 deviations

### D-22 — `target_workflow_ids` is non-empty in every mode · **the sweep loop depends on it**

S1's `intake-classification` said the list was unset in create mode, copying the source. `08`'s `forEach` iterates it in every mode, and §2.3 states the loop "runs **once** in create/update and N times in review" — which requires a one-element list, not an unset one. That singleton substitution is the whole reason `08` needs no mode gates. Corrected at the source: create and update take both the id and the list from their single target, review takes the list from the request. Without this the loop had nothing to iterate on a create run and every step in `08` would have been skipped.

### D-23 — `author-fixes` and `record-fixes` are deferred to S4, with `apply-audit-fixes`

Both are gated `remediation_round > 0`, and `remediation_round` is only ever bumped at `09:6` — which lands at S4. So at S3 they are unreachable, and landing them anyway forces `apply-audit-fixes` to land too, whose `fixes_applied` output nothing consumes until S4. That is a `dead-output` against a tree with no baseline. Deferring keeps S3 clean and puts the remediation cycle in the step that closes it. `02` lists `apply-audit-fixes` under S4 already; only §2.3's step table places its binds at S3.

### D-24 — `reload-workflow` reads the edit surface instead of invoking the catalog op

Its source Protocol refreshed *"via [list-workflows]"* — the same AP-114 op-invoke-in-a-Protocol class as D-12, and additionally a mis-citation: `list-workflows` returns `{ id, title, description, tags }` per entry and no file bodies, so it cannot produce a definition surface. The re-authored operation resolves the base ref, enumerates the target's files under `{target_path}`, and diffs the two — which is also what the group contract requires, since the served catalog can lag the branch under change.

The operation keeps the name `reload-workflow` because `02` §2 S3 names it in the landed set and `01` §2.3 directs re-authoring its Capability rather than renaming it. The name is now a weak description of what it does; worth revisiting if the tree is ever renamed wholesale.

### D-25 — The per-target gather rides the bound step, with no separate `kind: action` step

§2.3 has `5e accumulate-target-findings` as a standalone control step, and §6 defends all four `set` steps as *"value-BEARING and inside AP-33's do-not-flag (a) and (c)"*. Those two cannot both hold: AP-33's carve-out **(a)** — "cross-iteration accumulator / scatter-gather gather over a `forEach`" — is a do-not-flag for a step that has a `technique`, and AP-33 does not reach a control step at all. A control step with a value-LESS `set` whose description carries derivation for a domain payload is AP-34, whose Fix is to delete it; and a register section has no literal to bear.

So the gather rides `validate-schema`, the last step of each iteration and the point at which every value the section needs exists. AP-33's Detect does not fire — `register_sections` is not what `audit-schema-validation` computes — and carve-out (a) covers the accumulator outright. `08` is 7 steps rather than 10, and one fewer `set` survives into the tree.

### D-26 — `audit-canon`'s anchor inventory lists sections, and only for the home with the trap

M-d requires the inventory in exactly one home as a list, never a count. Phase 1 lists the thirteen anti-pattern sections explicitly, each as an anchored link, because that home is the one where a title-pattern walk silently drops entries — four of them sit outside the family sections. For the other three homes the unit is stated structurally as "one unit per `##` section", because walking those files has no trap to defeat. No count appears anywhere in the operation, and entries are cited by kebab-case name.

`{coverage_ledger}`'s three-value derivation criteria live in `## Outputs`, which §13 licenses explicitly and AP-119's do-not-flag names — placing them there dodges both AP-121 and AP-25.

### D-27 — `verify-artifact-conforms`-style vocabularies are cited, not carried

Same reasoning as D-21, now applied to the walker: `audit-canon` cites the four homes and restates no Detect, which is what makes collapsing six citers into one lossless. It carries exactly one Rule, `structural-evidence-first`, per H-2 — the two rules the source walkers carried as `attribute-against-base` and `exclude-known-from-decision-surface` are Protocol phase 3 and the Inputs that feed it, so as Rules they would restate their own phase.

### D-28 — `{reference_workflows}` stays technique-local despite being a remap target

§1.4's inclusion rule declares a value at workflow level when it is "an `outputs.*` remap target", and `08:2` remaps `workflow_catalog` to `reference_workflows`. But §1.4's own technique-local list names `reference_workflows` — the section contradicts itself. Settled under the rule closed at S1: declare only what the guard demands. `check-binding-fidelity` resolves a remap target as a producer without a declaration, and an over-declared name with no orchestration reader is BL-3. Left technique-local.

The remap itself is kept rather than renaming `audit-canon`'s input to `workflow_catalog`, because AP-33's do-not-flag (b) blesses exactly this — a caller-specific name derived from a generic wrapper op's generic output.

---

## Open sub-decision 3 — closed: `survey-reference-workflows` binds at `08`

`07` §6 left the placement open. Settled at `08`, ungated, for four reasons:

1. **Its only reader is `audit-canon`, at `08`.** Binding it at `01` would separate producer from consumer by two activities with nothing in between reading it — the inverse of WI-1's discipline.
2. **The create-mode argument does not survive contact with S2.** The concern was that a first-time author drafts before seeing sibling conventions. But `scope-definition` already takes the folder layout and naming scheme from `convention-conformance`'s Reference Conventions, and `yaml-authoring` reads a reference file of the same kind before drafting. Drafting is already convention-grounded without the catalog.
3. **The catalog is not the conventions.** `list-workflows` returns id, title, description and tags — no file bodies (see D-24). It cannot teach an author anything about structure; it only names the siblings a conformance walk compares against.
4. **It keeps the eager count at 6**, which CA-3 can now freeze against a measured set rather than a derived one.

---

## S4 — Verify, commit, close out · landed, all guards green. The graph is closed.

### Landed

| Path | Notes |
|---|---|
| `workflow-authoring/activities/09-validate-and-commit.yaml` | **17 steps**, 3 checkpoints, terminal |
| `…/techniques/workflow-definition/verify-high-findings.md` | three Rules; cites the walker's inventory, declares none (D-35) |
| `…/techniques/workflow-definition/compile-report.md` | register roll-up; optional impact path and fixes record |
| `…/techniques/workflow-definition/apply-audit-fixes.md` | the durable fix record, with its own consumer |
| `…/techniques/workflow-definition/scope-verification.md` | both directions in one op (D-34) |
| `…/techniques/workflow-definition/compose-publication.md` | new — the whole publication payload (D-30) |
| `…/techniques/workflow-definition/commit-verification.md` | step-id manifest phase dropped (D-36) |
| `…/techniques/workflow-definition/create-completion-doc.md` | retrospective as a section, not a second document |
| `workflow-authoring/resources/completion-artifact.md` | new creation guide |

**Rewired — the graph now closes on real edges.** `08` → `validate-and-commit`; `01` gains its review edge to `quality-review`; `08` gains the two gated remediation steps; `01` gains a seed-clear step (D-29). No `__terminal__` placeholder remains except the two that belong there.

### Guard results

All fourteen green. `validate-workflow-yaml`: 4 activities, **26 technique files**. `validate-activities`: 112 passed, 0 failed. `check-binding-fidelity`: **0 NEW** (226 total, 256 baselined, 30 fixed). No baseline updated. One NEW orphan-input surfaced and was fixed in-step (D-31).

### The graph, read through the loader

```
activities: 01:intake-and-context, 06:scope-and-draft, 08:quality-review, 09:validate-and-commit
load errors: []
  intake-and-context  -> ["__terminal__","quality-review","scope-and-draft"]
  scope-and-draft     -> ["quality-review","scope-and-draft"]
  quality-review      -> ["validate-and-commit"]
  validate-and-commit -> ["quality-review","__terminal__","intake-and-context","scope-and-draft"]
graph: every transition target exists
checkpoints: every option carries an effect
```

Three of those edges exist **only** as checkpoint effects — `06 → 06`, `09 → 01`, `09 → 06` — and `getValidTransitions` harvests them, so they are inside the valid set with no `transitions[]` entry naming them. Every target resolves to a real activity or the terminal sentinel, which is the assertion `src/utils/validation.ts:232-233` would otherwise raise: **zero unknown-activity warnings, not "expected warnings"**.

Every checkpoint option across all four activities carries a recorded effect — AP-89's discriminator, checked mechanically rather than by eye.

### Suppression completeness, checked step by step

The C-1 defect is that `transitionTo` is *recorded, not engine-applied*, so a back-edge selection does not stop the worker walking the rest of `steps[]`. Verified mechanically that every step after the disposition gate carries all three suppression clauses:

```
09 bump-remediation-round        exempt (the bump itself)
09 verify-scope-manifest         suppressed
09 verify-planning-readme        suppressed
09 approve-to-commit#{...}       suppressed
09 compose-publication           suppressed
09 stage-and-commit              suppressed
09 verify-commit                 suppressed
09 push-branch                   suppressed
09 open-pr                       suppressed
09 compose-close-out             suppressed
09 persist-close-out             suppressed
09 remove-worktree               suppressed
```

`bump-remediation-round` is correctly the only exemption — it is the bump the suppression keys on.

### The figure CA-3 freezes

With the two gated remediation steps prepended, `08`'s eager-eligible set is **6 of 9 steps, 6 of 8 technique steps** — the technique-step figure matching `07` §4 H7 exactly. The step denominator is 9 rather than 10 because this inventory carries no `kind: action` accumulator step (D-25). The eligible ids are unchanged from S3, as predicted.

### Artifact census

Six bare filenames, each mapped to a guide: `README.md`, `change-brief.md`, `impact-analysis.md`, `scope-manifest.md`, `findings-register.md`, `COMPLETE.md`. Five `write-artifact` binds plus one `create-readme`. Per-activity `write-artifact` distribution **2 / 1 / 0 / 2**, maximum **2** — exactly M-3's figure, so AP-38's fixed-roster carve-out holds and its classification (b) never fires. No output declares an `audience:` attribute. No message contains an `NN-` literal.

---

## S4 deviations

### D-29 — The suppression clause has three terms, and `01` clears the seed · **a hole in BL-1's own worked example**

BL-1's **Applies** names three back edges needing suppression — `remediate`, `report-only`, and *"`09`'s `fix-issues` review→update seed (→ `01`)"* — then states that on the audited design this is *"one `when: and(remediation_selected != true, review_closed != true)` clause"*. Those two clauses cover the first two edges. They do not cover `fix-issues`, which sets `operation_type: update` and `update_seeded_from_review: true` and **neither** of the flags T tests.

The consequence is the C-1 defect in full: an operator picks `fix-issues` on a review run, and the worker continues into scope verification against a manifest that does not exist, presents Gate 2, and on approval commits, opens a pull request and writes `COMPLETE.md` for a run that authored nothing. `operation_type` is now `update`, so even the `!= 'review'` clauses pass.

`update_seeded_from_review` is the flag `fix-issues` already sets, so T takes it as a third term. But it must stay true for the whole escalated pass through `01` — it is what suppresses re-classification (M-5) and Gate 1, and what protects the narrowed `target_workflow_ids`. So `01` gains a final step that clears it once intake has consumed it:

```yaml
- kind: action
  id: clear-review-seed
  when: update_seeded_from_review == true
  actions:
    - action: set
      target: update_seeded_from_review
      value: false
```

The corpus precedent is `workflow-design/activities/01-intake-and-context.yaml:225-234`, which does exactly this. Timing works because a `set` reaches the session bag only when the orchestrator relays it at the activity boundary: `01`'s own earlier steps read the pre-clear value, and `06`, `08` and `09` read the cleared one. So the escalated pass 2 through `09` runs its tail normally, and pass 1's tail is suppressed. `01` is 14 steps.

### D-30 — `publish-workflow-pr` becomes `compose-publication`, and moves before the commit

`version-control::commit-regular-files` declares `paths`, `commit_message` and `branch`, all required with no declared default. `workflow-design` binds **none** of them, which is why it carries baselined orphan-input rows against that op. WI-7 forbids shipping an input a worker can satisfy only from its working context, so the values need a producer.

AP-110's do-not-flag names the shape: a local operation that assembles caller-specific values while the activity binds the shared op as its own step. The local op therefore owns the whole publication payload — what to stage, the commit message, and the pull-request title and body — and WI-1 puts it **before** the step that consumes it, so it binds at `09:10` and the commit at `09:11`. The name changed because `publish-workflow-pr` no longer describes what it produces. `09` is still 17 steps: this is a reorder and a rename, not an addition.

### D-31 — `remote_name: origin` is bound on `push-branch` · **the third instance of one marking defect**

`*(optional, default: `origin`)*` matches neither `OPTIONAL_INPUT_RE` nor a `#### default` sub-section, so an unbound `remote_name` reads as an orphan input. This is the same defect as `write-artifact`'s `target_dir` (D-2) and `create-worktree`'s `create_branch` (D-14) — three shared ops, one systematic cause: the `*(optional, default: X)*` prose form. Bound here, consistent with the standing steer to keep changes inside the new tree. `workflow-design` binds it the same way.

**The pattern is now worth fixing at source.** Three instances in three ops is not coincidence; any op whose optionality is written in that prose form is invisible to both the guard and the server's provenance annotation.

### D-32 — Gate 2 has two options

Per the decision recorded below: `approved` sets `commit_approved`, `return-to-draft` records a transition to drafting, and `revise-intent` is not authored. `design-intent-batch` consequently needs no instance qualification, and the checkpoint census's justification for that is now true.

### D-33 — `yaml-authoring` takes an optional finding set

D-17 gave it `{current_file}` — a manifest entry, bound from the drafting loop's variable. `08:1 author-fixes` binds the same op with no loop around it, so under that contract alone the op would be authoring whichever file the last drafting iteration left bound. It gains an optional `{selected_findings}` input: when present, those findings name the files to author and bound how much of each may change. `{current_file}`'s description drops its positional framing.

This is not AP-124's fused create-vs-update shape — every phase still applies on both paths, and only file selection differs, so renumbering the phases would change behaviour. The `smallest-edit-that-resolves` rule lives here, where the edit happens; `apply-audit-fixes` keeps a distinct rule about the record being complete, so neither restates the other.

### D-34 — `scope-verification` absorbs the drift check as a phase, not a second output

§2.4 has it absorb `scope-audit`'s drift check. Declaring `scope_drift_findings` as an output would be dead — nothing consumes it — so the second direction is a Protocol phase, and its result reaches the reader through the exceptions it surfaces and through the close-out's Scope Outcome. Its Rule states why one direction is not a scope check.

### D-35 — `verify-high-findings` cites the walker's inventory by anchor

RP-8 requires it to cite `audit-canon`'s phase-1 inventory by hyperlink and declare none of its own. The citation is `[Enumerate the Criteria Units](./audit-canon.md#1-enumerate-the-criteria-units)` — inside `check-resource-anchors`' coverage, because its pattern matches any `.md#anchor` target, not only resource paths. Its three Rules are kept distinct: one on what confirms a finding, one on what the re-derivation may read, one on what may drive an edit.

### D-36 — `commit-verification` loses its second phase

Its source phase 2 enumerated six `09` step ids verbatim and stated only a standing duty about manifest completeness — AP-121 `rule-as-protocol-step` and AP-107 in one phase, and the exemplar `05` Q6 names. Removing it leaves the work sequence intact, which is AP-121's own test. The operation is one phase: confirm the commit landed with every touched file in it.

---

## Gate 2 loses `revise-intent` — decided ahead of S4

**Gate 2 (`approve-to-commit`) carries two options, not three: `approved` and `return-to-draft`.** `revise-intent` is not authored.

The defect it was meant to resolve: `revise-intent` transitions back to `01`, where Gate 1 (`design-intent-batch`) was already answered on the first pass. The response key is `${activity_id}-${checkpoint_id}`, so `yield_checkpoint` returns the stored option with `status: 'replayed'` and no prompt. The classifier cannot recover either — it derives from a `{user_description}` that still describes the original request, which is exactly why `01:3` is gated against re-derivation (BL-6). So the operator asks to revise their intent, is asked nothing, and the run walks forward to the same gate with the same brief.

Three resolutions were weighed. Two were rejected:

- **Suppress the gate on return** — have `revise-intent` also set `update_seeded_from_review`. This replaces a silent replay with a silent skip, which is worse, and it overloads a flag whose declared meaning is "update mode was entered from a review-mode fix disposition". *(This was one of the two candidates this log originally named; on inspection it is the weaker one.)*
- **Instance-qualify Gate 1** — `design-intent-batch#{intent_round}`. Correct, but it needs a counter, and BL-8 requires a qualifier to come from a declared technique Output rather than an `action: set`, because an intra-activity `set` does not reach the session bag inside the activity that writes it. No existing variable differs reliably between the two visits — `{scope_round}` is 0 on both unless the manifest happened to be revised — so this costs a 43rd variable against the settled 42, and a static `effect.setVariable` cannot increment, so a second revise would replay again.

**Dropping the option is the resolution taken**, and it has independent canon support beyond the replay defect:

- `revise-intent`'s only effect is `transitionTo`, which is *recorded, not engine-applied*. Its entire behaviour is therefore agent compliance — the shape AP-89 `checkpoint-requires-decision` keys against, since the discriminator is a **recorded effect**.
- Gate 2's decision is whether this change commits. "Is the goal right?" is a second decision packed into it, which is AP-05 `atomic-checkpoints`.
- `return-to-draft` already covers the recoverable case — the files are wrong. A wrong *goal* means the brief, the manifest and the drafts are all downstream of a bad input, and the honest remedy is a fresh run with a corrected description.

**Consequences to carry into S4:**

1. Gate 2 authors two options. `approved` → `setVariable commit_approved: true`; `return-to-draft` → `transitionTo: scope-and-draft`, setting no variable, so `commit_approved` stays false and steps 10–17 are skipped by their existing gate — C-1's `T` plus `commit_approved == true` already discharges BL-1 here with no extra clause.
2. **`design-intent-batch` needs no instance qualification, and the §6 census's justification becomes true.** The only surviving edge back into `01` is `review-disposition.fix-issues`, which sets `update_seeded_from_review: true` — suppressing both classification and Gate 1. That was the census's stated reason all along; it was simply false while `revise-intent` existed.
3. The transition-graph row for `validate-and-commit → intake-and-context` names **`review-disposition.fix-issues` only**.
4. `validate-and-commit → scope-and-draft` remains an effect-only edge, so reaching `06` from `return-to-draft` rests on the orchestrator honouring a recorded intent against a declared `isDefault: __terminal__`. §3 accepts that for all three effect-only edges. Flagged rather than fixed, because a declared conditional edge would need its own variable.

---

All five items S3 carried into S4 are discharged, and all three modes are now reachable end to end. **Review mode becomes usable at S4**, because it needs `09`'s `review-disposition` gate.

## S5 — The delivery test · landed. Verified by negative control.

**These land in the server repo, not the workflows tree**, so they sit on their own branch: `feat/workflow-authoring-delivery-test`, worktree `.worktrees/2026-07-28-workflow-authoring-delivery`, based on `origin/main` (`3c23313f`).

### Landed

| Path | What it is |
|---|---|
| `tests/workflow-authoring-delivery.test.ts` | Five assertions on `get_activity` for `quality-review`, driven through a real session over the MCP wire |
| `scripts/count-workflow-sessions.ts` | The drain-to-zero trigger, recursing `triggeredWorkflows[i].state` |

`npx tsc --noEmit` clean. The suite passes green against the build worktree.

### What the test asserts

1. `step_techniques` carries exactly the eager-eligible step ids.
2. Every criteria home arrives under `resource_refs` — the full-mode shape a fresh worker gets.
3. Every anti-pattern unit is addressed **by section**, never as a whole file.
4. **Every delivered reference resolves.**
5. Every unit fits inside the 80,000-char per-resource eager cap that the whole file exceeds.

### The negative control — why assertion 4 exists

GI-4 says to assume a guard can be silently blind and instrument accordingly, so the test was checked by breaking the thing it exists to catch. With `workflow-design/resources/anti-patterns.md` moved aside:

```
Tests  1 failed | 4 passed (5)
```

**Four of five assertions stay green when the canon disappears.** The references are still delivered, because the links live in the technique bodies and `rewriteResourceLinks` projects them to qualified ids whether or not the target exists; the sections still "look" anchored; the cap check passes because an unresolvable body has no length. Only *resolves every delivered reference* fails.

That is exactly the silent-empty-bundle failure the S5/S6 ordering exists to prevent, and it is exactly why the resolution assertion had to be written separately from the delivery assertion. The file was restored and the suite re-run green; the build worktree is clean.

### The census reproduces the migration analysis independently

```
workflow-design (running): 32          →  5 top-level, 27 nested
workflow-design (all statuses): 33
currentActivity distribution: 19 retrospective · 4 quality-review · 3 intake-and-context
                              · 1 each validate-and-commit, scope-and-draft, post-update-review,
                                impact-analysis, content-drafting · 1 empty
```

Three things this settles by measurement rather than by trust:

- **The recursion is load-bearing, decisively.** Only **5 of 32** running sessions are top-level states. A flat glob over `planning/*/session.json` would report 5 and license deleting a tree with 27 live sessions embedded in it. This is the single fact `02` §5 says the script exists to get right.
- **19 sit at `retrospective`**, matching the figure the ≥90-day abandonment policy is built on. That policy is load-bearing, not bookkeeping: nothing compels anyone to finish those.
- **The 2 structurally unresumable sessions are confirmed and identified.** One sits on `content-drafting`, an activity `workflow-design` no longer defines — `readActivityRaw` matches the filename-derived id with no fallback, so `get_activity` throws for it. The other carries an empty `currentActivity`. Both are the sessions S6 marks `abandoned`.

### One thing to know about the test's condition

The suite is `skipIf` the tree's absence from the resolved workflows root, because `workflow-authoring` lands on the `workflows` branch before the submodule pointer moves. In that window, point it at the branch with `WORKFLOWS_DIR`. The condition is on **presence of the tree, never on the assertions** — a present tree with a broken bundle fails.

**This exposes a step the plan does not name.** `02` §0 calls `/home/mike1/projects/dev/workflow-server/workflows` the live library root, and S1's registration assertion assumes the tree is reachable there. Nothing in S1–S8 says when `workflow/workflow-authoring` merges to `workflows` and the submodule pointer bumps — but S6 cannot safely deprecate a workflow that is not yet reachable, and this test only becomes an unconditional gate after the bump. **Sequence it between S5 and S6.**

---

## S6 — Deprecate · landed, minus the session statuses. One premise corrected.

Branch `workflow/workflow-design-deprecation`, worktree `.worktrees/2026-07-28-workflow-design-deprecation`, based on the authoring branch so it merges **after** it.

Also landed on the authoring branch first: **the library root README had no row for `workflow-authoring`** — an omission from S1–S4. That table is where the library indexes what can be started, and it is one of the AP-129 site families a change here has to sweep. Row added (`fbecc600`), then the deprecation note applied to the `workflow-design` row on the S6 branch.

### Landed

| File | Change |
|---|---|
| `workflow-design/workflow.yaml` | `title`, `tags` and `description` only — **no activity, technique or resource touched**, `version` held at `1.30.0` |
| `workflow-design/README.md` | Deprecation banner, explicit about what resuming late costs |
| `README.md` (library root) | `workflow-design` row marked deprecated |

All fourteen guards green; `check-binding-fidelity --root` **0 NEW**, which is the assertion `02` S6 asks for specifically because the guard seeds producers from this `workflow.yaml`'s `variables[]`. All nine activities still load with no errors, so sessions in flight are unaffected.

### D-37 — The deprecation notice does not reach a chooser through `description` · **the mitigation the plan relies on does not exist**

`02` §6 item 2 states the two-visible-workflows risk is *"Mitigated **only** by the S6 deprecation sentence in `description` (which `list_workflows` surfaces)"*. **It does not surface it.**

`listWorkflowsWithDiagnostics` builds each row as exactly `{ id, title, version, tags }` (`src/loaders/workflow-loader.ts:405`, type at `:21`), and the tool's own description says *"List available workflows (id, title, version, tags)"*. Verified by reading the delivered payload:

```
list_workflows returns exactly these keys per row: ["id","title","version","tags"]
  workflow-design → description present in listing: false
```

`description` reaches a caller only through `get_workflow` (`workflow-tools.ts:407`) — which runs **after** a session exists, so it cannot influence the choice it was meant to influence.

Since the risk being mitigated is precisely that a user or a `discover` bootstrap starts the wrong workflow — and the wrong one is the 1,926-line version — the notice goes where a chooser can see it:

```
title: DEPRECATED — use workflow-authoring — Workflow Design Workflow
tags:  ["deprecated", "workflow-creation", …]
```

Safe for a live session: **only `version` is compared against session state** (`validateWorkflowVersion`), and nothing anywhere keys on `title` or `tags`. The leading position is deliberate — a scanning chooser sees the signal before the name — and the `Workflow` suffix the corpus convention expects is preserved at the end. The `description` sentence is kept as well, so a session that did start here says so on its first call.

### Not done: the two session statuses · **stopped deliberately**

`02` S6 also asks for `status: abandoned`, with recorded reasons, on the two structurally unresumable sessions the S5 census identified. **I did not do this**, and it should be a decision rather than an improvisation:

- `session.json` is **HMAC-sealed** against a sibling `.session-token`, and the server detects a mismatch as *modified outside the server* (`src/utils/session/store.ts:38-43`).
- **No server tool sets that status** — a grep for `abandoned` across the tools finds nothing, and the two sessions are unresumable precisely because reaching them through the server is what fails.
- **No re-seal script exists.** `scripts/generate-session-token.ts` seeds a token for a legacy folder; it does not re-seal an edited state. `writeSealForBytes` is exported but documented as *"mainly for tests"*.

So the available routes are a hand edit that breaks the seal — making both sessions read as tampered with rather than closed, which is worse than leaving them running — or a purpose-built script that re-signs real session records with the server's key. The second is a reasonable thing to build, but it mutates user data under the signing key and it is not obviously S6's business.

**Decided: leave both sessions `running` and carry the exemption on paper.** Neither record is edited and neither file is deleted.

The cost is that `count == 0` is unreachable, so **the S8 gate is restated rather than abandoned**:

> Delete when the census reports **2** running sessions, and both are the named pair.

That keeps the gate a check rather than a judgement — a later reader verifies two things, that the count is 2 and that the remaining folders are the two named ones. A count of 2 whose members are two ordinary live sessions is *not* the gate. The alternative readings were rejected: `count == 0` can never be satisfied, and "delete when it looks drained" is the judgement call the gate exists to prevent.

The exemption, both folders, why each cannot advance, and their ≥90-day dates are recorded in [`drain-log.md`](../2026-07-28-workflow-design-slim-down/drain-log.md), which is also where S7's checks accumulate. Its first row is today's: 32 running, 2 exempt, 30 to drain.

One consequence worth naming: past **2026-09-09** and **2026-10-09** respectively, those two sessions are abandoned *in policy* while still reading `running` *in the data*. The ≥90-day policy is what makes the other 30 reachable; it cannot resolve these two, because applying the status is precisely the operation that fails on them. The drain log records that divergence deliberately — it is not drift to be reconciled later.

---

## Carried into S7 and S8

**S7** is a repeatable, no-code drain check: run the census, append one row to `drain-log.md` at `.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/drain-log.md` — date, count, remaining folder list. Today's row would read **32**, so it is a no-op on the corpus and stays one until sessions actually finish.

**S8** is gated on the census reporting **2**, both being the named exempt pair — see the decision above. Two things stand between here and there:

1. **The ≥90-day abandonment policy**, without which the count never comes down at all: 19 of the 32 sit at `retrospective` and nothing obliges anyone to finish them. The policy is the strategy's load-bearing weakness, not a footnote.
2. **The deletion commit must be atomic** — `git mv` of the four canon homes into `workflow-authoring/resources/`, the re-depthing of every citation, and `--update-baseline` in one commit. Splitting them breaks `check-resource-anchors`, which is hard-zero, for the interval. The re-depth is mechanical: drop the `workflow-design/` segment and re-count `../` from each citing file's own directory. The committed S5 test is what proves the bundle survives it.

**Before deleting anything**, run the outside-reference check mechanically: no file outside `workflow-design/` may link into it. `check-resource-anchors` catches anchored links; the non-anchored and `techniques[]` cases need `check-all-refs` plus a grep sweep. This is the check that was never done by hand correctly — it once hid 72 links across 25 files behind a 6-file manifest.

## Raised, not fixed here

- **The `*(optional, default: X)*` prose form defeats both the guard and the server.** Three shared ops carry it — `write-artifact`'s `target_dir` (fixed at D-2), `create-worktree`'s `create_branch` (bound at D-14), `push-branch`'s `remote_name` (bound at D-31). `OPTIONAL_INPUT_RE` needs `*(optional)` closed immediately, and a default needs its own `#### default` sub-section; the prose form satisfies neither, so every caller must restate a default it should be able to omit, and the server's provenance annotation reads the input as unresolved. One small hygiene change across the three files clears two baselined entries and lets three binds be deleted from this tree. **A corpus-wide sweep for the form is worth running** — three instances found incidentally suggests more.
- **`validate-activities.ts` takes a positional path, not `--root`** (D-9). Worth aligning with the other guards, or documenting beside `validate-workflow-yaml.ts` in `scripts/workflows-root.ts`.
- **`reload-workflow`'s name** no longer describes what it does (D-24): it reads the edit surface rather than reloading from the server.
- **`validate-and-commit → scope-and-draft` is an effect-only edge**, so `return-to-draft` reaching `06` rests on the orchestrator honouring a recorded intent against a declared `isDefault: __terminal__`. Accepted by the plan for all three effect-only edges; a declared conditional edge would need its own variable.
