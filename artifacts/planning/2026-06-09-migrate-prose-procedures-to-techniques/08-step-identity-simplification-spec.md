# Step Identity Simplification — minimal steps as technique bindings

Status: design spec (proposed) — pending review
Date: 2026-06-10
Scope: `src/schema/activity.schema.ts` (`StepSchema`) + `schemas/activity.schema.json` + the activity loader, `get_technique`, and manifest validation. This is a **server + schema change** — outside the work-package migration's remit; a prerequisite/sibling work item that the migrated definitions can then shed redundant fields against.

## 1. Motivation

After the prose→technique migration, a bound activity step is essentially *"invoke this technique/operation, optionally gated and with deviations."* Two fields no longer carry their weight:

- **`step.name`** — a human label that now duplicates the bound technique's `capability`.
- **`step.id`** — a required, hand-authored identifier that, for the overwhelmingly common 1:1 case, just restates the operation the step binds.

Goal: a minimal step is its technique binding — `{ technique, when?, technique_args?, checkpoint?, actions? }` — with no `name` and no authored `id` except where genuinely needed.

## 2. Current state (grounded)

`StepSchema` ([src/schema/activity.schema.ts:38-51](../../../../src/schema/activity.schema.ts)):
`id` (required), `name` (optional, LEGACY), `description` (optional), `technique` (optional, **labelled LEGACY**), `checkpoint`, `required` (default true), `when`, `condition` (LEGACY), `actions`, `triggers`, `technique_args` (optional, **labelled LEGACY**).

**Where `step.id` is actually referenced** (all runtime, server-side):
1. `get_technique({ step_id })` — the only by-id step lookup: `activity.steps?.find(s => s.id === step_id)` (and loop steps), then loads that step's bound technique ([src/tools/resource-tools.ts:529-551](../../../../src/tools/resource-tools.ts)).
2. `step_manifest` on `next_activity` — orchestrator reports `[{ step_id, output }]`; validation maps ids and warns on empty output ([src/utils/validation.ts:113-134](../../../../src/utils/validation.ts)).
3. activity-loader stamps an op `parameter { step_id: primaryStep.id }` for tracing ([src/loaders/activity-loader.ts:140](../../../../src/loaders/activity-loader.ts)).

**Where it is NOT referenced:** no transition, decision, condition, loop, or checkpoint targets a step id; no `.toon` definition cross-references a step. Steps sequence by **array order**; transitions are **activity-level**; loops embed steps **inline**; conditions key on **variables**. So `step.id` is a local addressing/trace handle, never a graph-edge target.

**Stale labels:** the migration adopted `step.technique` (`group::operation`) + `step.technique_args` as the canonical binding and deprecated the `description`-inline-op form — but the schema still marks `technique`/`technique_args` LEGACY and `description` as the preferred carrier. These descriptions are now inverted.

## 3. Proposed change

### 3.1 Drop `step.name`
Remove `name` from `StepSchema`. A bound step's human meaning is the technique `capability`; a control/action step's meaning is its `actions`/`when`. (Already LEGACY/optional, so removal is low-impact.)

### 3.2 `step.id` becomes optional, defaulting to the technique-id
Make `id` optional. When absent, the loader derives the step's resolved id from `step.technique`:
- `technique: cargo-operations::run-suite` → resolved id `run-suite` (the last `::` segment).
- `technique: reference-resolution` (bare) → resolved id `reference-resolution`.

The resolved id is what `get_technique(step_id)`, the manifest, and tracing use. Callers never see a difference between an authored id and a defaulted one.

### 3.3 Repeat-invocation disambiguation
When one technique is invoked by multiple steps in the same activity (real cases: validate's two `cargo-operations::run-suite` steps; `05` binds `analyze-implementation` four times), the default collides. Resolution (OPEN DECISION — see §8):
- **(A, recommended) explicit-id-on-collision:** the loader/validator errors if two steps resolve to the same id; the author supplies an explicit `id` on the repeats (`run-suite`, `revalidate`). Deterministic and readable.
- **(B) auto-suffix:** the loader appends `-2`, `-3` by array order. Zero authoring, but ids shift if steps are reordered and are less self-describing.

### 3.4 Control / action steps (no technique)
A step with no `technique` (pure `set`/`log`/`emit`/`message`/`when`/`checkpoint` — the A2-exempt class) has nothing to default an id from, so it **must carry an explicit `id`**. The schema rule becomes: `id` is required UNLESS `technique` is present (then it defaults). Expressed as a refinement/superRefine on `StepSchema`.

### 3.5 Correct the canonical-binding labels
Update field descriptions (no behavior change): `step.technique` + `step.technique_args` are the **canonical** per-step binding (`group::operation` + deviation map); `step.description`'s inline-operation-invocation form is **deprecated** (bound steps omit `description`; ordered-procedure prose is forbidden per workflow-design rule A1). Widening `technique_args` value types (object/array, for templated/structured deviations) remains a separate optional item (06a Appendix A).

## 4. Server / code changes

| File | Change |
|------|--------|
| `src/schema/activity.schema.ts` `StepSchema` | Remove `name`; make `id` optional; add a refinement "`id` required when `technique` is absent"; correct `technique`/`technique_args`/`description` descriptions (canonical vs deprecated). |
| `schemas/activity.schema.json` | Mirror the same (remove `name` from step; `id` no longer in `required`; conditional-required note; description fixes). |
| `src/loaders/activity-loader.ts` | Compute each step's **resolved id**: explicit `id` if present, else last `::` segment (or bare id) of `step.technique`. Detect within-activity collisions (error per §8A, or suffix per §8B). Use resolved ids everywhere the loader currently reads `step.id` (e.g. `primaryStep.id`). Apply to both top-level `steps` and `loop.steps`. |
| `src/tools/resource-tools.ts` `get_technique` | Match `step_id` against resolved ids; update the "Available steps: […]" error to list resolved ids. |
| `src/utils/validation.ts` | Manifest `step_id` entries validate against resolved ids. |
| `scripts/validate-activities.ts` / `validate-workflow-toon.ts` | The NN-prefix/duplicate-id checks operate on resolved step ids; add a check that flags an unresolvable step (no `id` and no `technique`). |

## 5. Resolution algorithm (loader)

For each step in an activity (and each loop's steps), in array order:
1. If `step.id` is set → `resolvedId = step.id`.
2. Else if `step.technique` is set → `resolvedId = lastSegment(step.technique, '::')`.
3. Else → **error**: control/action step requires an explicit `id`.
4. Track `resolvedId`s within the activity (top-level and per-loop scope). On duplicate → §8 decision (error, or `-N` suffix).
Expose `resolvedId` on the loaded step object so downstream code reads it uniformly.

## 6. Back-compat & migration

- **Existing definitions keep working:** an explicit `id` always wins (step 1), so every current activity (all carry explicit ids) is unaffected. `name`, where present, is simply dropped/ignored.
- **Optional follow-up — shed redundancy in the migrated work-package activities:** once this lands, a definition pass can remove `name` from steps and drop the now-redundant `id` on 1:1 bound steps (keeping explicit ids only on the repeat-invocation steps and the control/action steps). Net: the minimal-step form becomes the norm.
- No data migration; purely a schema-permissiveness widening + loader id-resolution.

## 7. Edge cases

- **Loop steps** follow the same rule, scoped to the loop's `steps` array (a loop step and a top-level step may share a resolved id without conflict — they're in different scopes; confirm `get_technique` scopes its lookup, which it already does by searching top-level then loops).
- **Step with `checkpoint` but no `technique`** → control step → explicit `id` required (it has a stable handle for the checkpoint flow anyway).
- **Same operation, genuinely distinct call-sites** (validate's `run-suite`/`revalidate`) → explicit ids communicate intent; keep them.
- **Cross-group op-name collision** (two groups expose `test`) invoked in one activity → resolved ids collide → §8 handling (explicit id, or fall back to the fuller `group__op` slug).

## 8. Open decisions

1. **Repeat-invocation:** explicit-id-on-collision (A, recommended — deterministic/readable) vs auto-suffix `-N` (B, zero-authoring/fragile).
2. **Default segment:** last `::` segment (`run-suite`) vs a fuller slug (`cargo-operations__run-suite`) — the short segment is cleaner; reserve the fuller slug only as a collision fallback.
3. **`step.name`:** remove outright vs keep as optional-deprecated for one release. (Recommend remove — it's already LEGACY and unused by the runtime.)
4. **Scope of the follow-up strip pass:** strip `name` + redundant `id` from the migrated work-package activities now, or leave them (explicit ids are harmless) and only adopt the minimal form for new authoring.

## 9. Validation / testing

- Unit: id-resolution (explicit / defaulted / control-step-error / collision) on representative steps.
- `get_technique(step_id)` resolves a defaulted id to the right technique; errors list resolved ids.
- Manifest validation accepts resolved ids.
- `npx tsx scripts/validate-workflow-toon.ts workflows/work-package` passes unchanged (explicit ids honored); add a fixture with a `name`-less, `id`-less bound step to exercise defaulting.
- Full `npm run typecheck` + `npm test`.
