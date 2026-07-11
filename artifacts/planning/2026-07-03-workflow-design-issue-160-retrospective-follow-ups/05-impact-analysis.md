# Impact Analysis — workflow-design issue #160 retrospective follow-ups

> Target workflow: `workflow-design` · update mode · #160 · 2026-07-03
> **Scope (revised after `impact-confirmed` → `revise`, user decision 2026-07-03):** this run ships ONLY #3 (RE-2/RE-3) + #4 (RE-4), all in `activities/08-quality-review.yaml`, plus the new `techniques/verify-high-findings.md` and the index updates those entail. **#2 (RE-1) and #1 are companion parent-repo deliverables, NOT authored here** — see §6. The load-bearing RE-5 engine-support finding (§2) is what routed #2 out of this run.

## 1. File inventory (target workflow)

Root: `workflows/workflow-design/`

| File | Purpose |
|------|---------|
| `workflow.yaml` | Metadata, workflow/activity rules, activity references, variables, techniques |
| `README.md` (root) | Workflow overview + activity table |
| `activities/01-intake-and-context.yaml` | Intake & context |
| `activities/03-requirements-refinement.yaml` | Elicitation + assumption interview loop **(RE-1 / #2 — NOT touched this run; companion parent-repo deliverable, see §6)** |
| `activities/04-pattern-analysis.yaml` | Pattern analysis |
| `activities/05-impact-analysis.yaml` | Impact analysis |
| `activities/06-scope-and-draft.yaml` | Scope & draft |
| `activities/08-quality-review.yaml` | Quality review / audit passes **(RE-2/RE-3/RE-4 target)** |
| `activities/09-validate-and-commit.yaml` | Validate & commit |
| `activities/10-post-update-review.yaml` | Post-update review |
| `activities/11-retrospective.yaml` | Retrospective |
| `activities/README.md` | Activities subfolder README |
| `techniques/*.md` (33 files + `TECHNIQUE.md`, `README.md`) | Technique library **(RE-2 adds one)** |
| `resources/*.md` (11 files + `README.md`) | Resource guidance |

## 2. RE-5 — LOAD-BEARING engine-support verification (READ-ONLY source investigation)

**Question:** Does the loader/engine resolve a *templated* loop-body checkpoint id (`assumption-decision-{current_assumption.id}`) per iteration, or only match an exact static `c.id`?

**Conclusion: Mechanism A is NOT feasible as-is. It requires an engine change.** Evidence:

1. **Checkpoint identity is the static YAML `id`, taken verbatim from the definition — no interpolation.**
   `activityCheckpoints()` flattens all steps (including loop bodies) and maps each `kind:checkpoint` step to a checkpoint whose `id` is the literal `s.id` from YAML — `src/schema/activity.schema.ts:289-301` (`id: s.id!` at :293). Loop-body checkpoints ARE discovered (the recursive `flattenActivitySteps` at :272-282 descends into `s.steps`), but there is exactly ONE `assumption-decision` definition, not one synthesized per iteration.

2. **Lookup is exact static equality.**
   `getCheckpoint()` returns `activityCheckpoints(activity).find(c => c.id === checkpointId)` — `src/loaders/workflow-loader.ts:265`. A worker yielding `checkpoint_id: "assumption-decision-a3"` would fail the `find` (no checkpoint whose YAML id is that literal), producing `Checkpoint not found` at `src/tools/workflow-tools.ts:427`. A worker yielding the literal template string `assumption-decision-{current_assumption.id}` would match, but then all iterations collide on that one id — the exact replay bug.

3. **`checkpointResponses` is keyed by `activity_id-checkpoint_id` (static).**
   `src/tools/workflow-tools.ts:440` — `responseKey = \`${activity_id}-${checkpoint_id}\``. On iteration 2, `yield_checkpoint` finds iteration 1's stored response under the same key and **replays** it (`:441-478`), returning `status: "replayed"` and skipping the user prompt. This is precisely the #2 bug the retrospective flagged — and it is keyed off the static id, so it fires whenever two iterations share a checkpoint id.

4. **No id-interpolation anywhere in the loader/engine.**
   Grep of `src/loaders/` and `src/tools/workflow-tools.ts` finds no interpolation of checkpoint (or step) ids. The only `{...}` resolution is on checkpoint **`message`** text, done at presentation time by the agent/orchestrator — not on `id`. So a templated `id` is never expanded to a per-iteration concrete value before lookup or before response-keying.

**What A would require (engine change, two coordinated edits):** (a) interpolate the checkpoint-id template against the loop variable per iteration before `getCheckpoint`/`activityCheckpoints` identity resolution, AND (b) key `checkpointResponses` (and `activeCheckpoint.checkpointId`, and the `<activity>-<checkpoint>` responseKey) by the *interpolated* id so replay is per-iteration. This touches `activity.schema.ts` (`activityCheckpoints`), `workflow-loader.ts` (`getCheckpoint`), and `workflow-tools.ts` (yield replay + responseKey), plus session-schema/migration for the id shape. That is a non-trivial engine + schema change.

**Design-principle collision (raises the bar on A):** the `workflow-design` activity rules themselves say *"Never modify schemas during workflow creation"* (`workflow.yaml:26`) and *"capability grows in the technique library … in preference to schema or engine changes"* (`workflow.yaml:35`). Mechanism A is exactly the kind of engine/schema change those rules steer away from. This is authoring-scope guidance (it governs producing workflows, not the server roadmap), but it is a strong signal that the fix should NOT depend on new engine machinery if a structural alternative exists.

### RE-5 verdict and its effect on RE-1 (routing decision)

Per the RE-1 gate ("(A) CONDITIONAL on RE-5 confirming engine support; else fall back to (C)"), **the condition is NOT met.** Both candidate mechanisms require an engine change:

- **(A) per-iteration templated checkpoint id** needs the loader to interpolate the id template against the loop variable before identity resolution AND to key `checkpointResponses` / `activeCheckpoint` by the interpolated id — a change across `activity.schema.ts` (`activityCheckpoints`), `workflow-loader.ts` (`getCheckpoint`), and `workflow-tools.ts` (yield replay + responseKey), plus session-schema/migration for the id shape.
- **(C) engine-side per-iteration response-key namespacing** keeps one static `assumption-decision` id but scopes the recorded response per iteration so replay does not collide — a smaller, more localized engine change than A, but still an engine change (not YAML-only).

The only genuinely YAML-only alternative — a bounded set of statically-distinct `assumption-decision-1 … -k` checkpoint steps indexed by iteration — is verbose and its expressibility is itself uncertain (the loop body today has ONE shared checkpoint step, so indexed per-iteration selection may need an engine assist too).

**User decision (2026-07-03, at the `impact-confirmed` → `revise` gate):** because #2 cannot be fixed by a YAML-only edit to `03-requirements-refinement.yaml`, **#2 is routed OUT of this workflow-design run** and becomes a companion parent-repo deliverable: the `src/` engine change (A or C) PLUS its coupled `03-requirements-refinement.yaml` dynamic-id edit, gated on and shipped WITH the engine change — see §6. **This run therefore does not touch `03-requirements-refinement.yaml`.**

## 3. Impact classification per in-scope decision (this run)

This run's directly-modified set is a SINGLE workflow file — `activities/08-quality-review.yaml` — plus one new technique file. #2 (RE-1) and #1 are companion parent-repo deliverables assessed in §6, not classified here.

### #3 / RE-2 — new `verify-high-findings` step + technique in `activities/08-quality-review.yaml`
- **Directly modified:** `08-quality-review.yaml` (new `kind:technique` step, `is_review_mode != true` gated, placed before `audit-fix-cycle` at line 221). Version bump (currently 1.4.0).
- **New file:** `techniques/verify-high-findings.md` (a NEW technique doc, following the `techniques/` README style; must be listed in `techniques/README.md`).
- **Indirectly affected:** `techniques/README.md` (add the new technique row); root `README.md`/`activities/README.md` if they enumerate quality-review steps (verify at draft time). No transition-chain impact — the new step is a linear insert; `transitions` (271-273) and `blocker-gate` decision (256-270) unchanged.
- **Binding note (for drafting):** the new step binds exactly one operation via `step.technique` per the activity rules; the new technique's inputs/outputs must be generic (audit findings in, verified-High set out). Not folded into `audit-fix-cycle`.

### #3 / RE-3 — new `quality-review` activity rule
- **Directly modified:** `08-quality-review.yaml` `rules:` block (lines 6-9). Add: "High findings must be independently verified before they drive remediation." No collision with the three existing rules; complements the workflow activity rule "Encode critical constraints as structure" (`workflow.yaml:29`) since RE-2 provides the structural backing.
- **Indirectly affected:** none. Rule text only.

### #4 / RE-4 — relabel + re-default `enforcement-confirmed` checkpoint
- **Directly modified:** `08-quality-review.yaml` `enforcement-confirmed` checkpoint (lines 189-206). Adjust option labels/descriptions and/or `defaultOption` (currently `accept-text-only`) so the recorded disposition matches shipped structural enforcement — `accept-text-only` genuinely = no structural change; the `add-enforcement` path is recorded when enforcement ships.
- **Removed/changed content:** existing option labels/descriptions on `add-enforcement` / `accept-text-only` may be reworded, and the default may flip. Flag for preservation confirmation: the two option **ids** (`add-enforcement`, `accept-text-only`) should be preserved unless a rename is explicitly wanted — an id change would be a (harmless here, no transitionTo) but still-flagged mutation. `autoAdvanceMs: 30000` and `blocking: false` semantics to be preserved unless the re-default intent says otherwise.
- **Indirectly affected:** none — this checkpoint carries no `transitionTo`, so no transition chain depends on its option ids.

## 4. Transition-chain & reference integrity (this run)

- **Transition chain:** no activity is added, removed, or reordered. Only `08-quality-review.yaml` is edited; its `transitions` (271-273) and `blocker-gate` decision (256-270) are untouched, and it is a linear step insert (RE-2). **Intact.** `03-requirements-refinement.yaml` is NOT edited this run, so its internal loop and `transitions` (03:107-115) are wholly unaffected.
- **Technique references:** RE-2 adds one technique reference (`verify-high-findings`) — must have a matching `techniques/verify-high-findings.md` or it orphans. All other technique refs in `08` unchanged. No refs removed → no orphans created.
- **Resource references:** none added/removed by the in-scope decisions. **Intact.**

## 5. Removals requiring explicit confirmation (preservation gate)

Scoped to this run's only edited workflow file, `08-quality-review.yaml`:

| # | File | Content potentially removed/replaced | Intentional? |
|---|------|--------------------------------------|--------------|
| a | `08-quality-review.yaml` | `enforcement-confirmed` (189-206) option labels/descriptions + possibly `defaultOption` (currently `accept-text-only`) reworded/flipped (RE-4 re-default) — **the two option ids (`add-enforcement`, `accept-text-only`) should survive unless a rename is explicitly intended; `autoAdvanceMs: 30000` / `blocking: false` preserved unless the re-default intent says otherwise** | Confirm |

No wholesale file or activity removal. No technique/resource deletions. #2's `03-requirements-refinement.yaml` removal flag (the `assumption-decision` options/effect that must survive its dynamic-id rework) travels with the companion deliverable in §6, not this run.

## 6. Companion parent-repo deliverables (NOT authored in this run)

Routed to a separate parent-repo (`workflow-server`) track, outside this workflow-design run's YAML authoring scope. Recorded here for traceability; no YAML designed for them here.

### #2 / RE-1 — assumption-decision replay fix (engine change + coupled `03` edit)
- **Why routed out:** RE-5 (§2) established there is NO YAML-only fix. Loop-body checkpoint ids are resolved by exact static equality and responses are keyed by the static id, so a per-iteration fix requires a `src/` engine change:
  - `src/schema/activity.schema.ts:289-301` — `activityCheckpoints` maps each checkpoint to its literal static YAML `id` (`id: s.id!`, :293); one shared `assumption-decision` definition for the whole loop.
  - `src/loaders/workflow-loader.ts:265` — `getCheckpoint` matches `c.id === checkpointId` exactly; no interpolation.
  - `src/tools/workflow-tools.ts:440` — `responseKey = \`${activity_id}-${checkpoint_id}\`` (static), so iterations 2..N replay iteration 1's stored response (:441-478).
- **Deliverable shape:** the engine change (mechanism A — interpolate loop-body checkpoint ids per iteration + key responses by the interpolated id; OR mechanism C — per-iteration response-key namespacing, smaller/localized) PLUS the coupled `activities/03-requirements-refinement.yaml` dynamic-id edit to the `assumption-decision` checkpoint (03:84-100), gated on and shipped WITH the engine change.
- **Preservation flag (for that deliverable):** the `assumption-decision` options `accept`/`reject`/`defer` and the `defer → has_deferred_assumptions` setVariable effect MUST survive whatever dynamic-id structure is adopted.

### #1 — worktree-aware guard scripts
- Parent-repo TypeScript under `scripts/` (`check-all-refs.ts`, `check-binding-fidelity.ts`) — accept a `--root`/worktree path or auto-detect the active worktree (precedent: `validate-workflow-yaml.ts` already takes a workflow-dir arg). Not workflow YAML; own branch + PR.
