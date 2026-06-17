# Design: Unify activity constructs as step *kinds*

**Status:** IMPLEMENTED — landed. The unified kind-tagged `steps[]` model described below is now the schema; `checkpoints[]`/`loops[]`/`step.checkpoint` are gone. The body is retained as the design record.
**Prototype codemod:** [`scripts/migrate-step-kinds.ts`](../../scripts/migrate-step-kinds.ts) — transforms an activity and validates the output against the schema below.

## Problem

An activity today is a set of **parallel arrays**: one ordered `steps[]` plus siblings `checkpoints[]`, `decisions[]`, `loops[]`, `transitions[]`. Only `steps[]` (and a loop's nested `steps[]`) carries concrete order. A checkpoint is **defined out-of-line** in `checkpoints[]` and merely *referenced* by `step.checkpoint: <id>`.

The consequence is a real ambiguity: the schema says the worker "MUST yield this checkpoint **before** executing the step" ([activity.schema.ts:52](../../src/schema/activity.schema.ts)), but the worker prompt and the e2e walker do **present-then-checkpoint** (the step surfaces something, *then* the checkpoint confirms it — e.g. `present-summary` renders the change set, then `change-review` confirms it). Nothing positional pins the checkpoint relative to its step's action. Two further latent ambiguities exist: how top-level `steps[]` interleave with `loops[]` is unspecified (`08-implement` has `steps[5]` + `loops[3]`), and `checkpoints[]` can be **orphaned** (defined, referenced by no step).

## Proposal

Make `steps[]` the **single ordered execution list**, where each step is a discriminated union on `kind`:

- `kind: technique` — binds an operation (today's `step.technique`).
- `kind: action` — a control step (today's `actions[]`-only step).
- `kind: checkpoint` — a user decision point, with the `message`/`options`/effects **inlined** (today's `CheckpointSchema`), sitting at a concrete index.
- `kind: loop` — a **compound** step whose body is a nested `steps[]` (today's `LoopSchema`).

Position is the answer: a checkpoint at index *N* is presented exactly there. `step.checkpoint` and the `checkpoints[]` array both disappear.

Two deliberate scope decisions (both surfaced by the feasibility study):

1. **`condition` is an *attribute*, not a kind.** `when` (and the legacy structured `condition`) is a per-step gate — "run this step or skip it" — that applies to *every* kind. It stays a shared base field. A standalone condition-step would be an empty gate. (A `branch` kind would only be warranted to absorb `decisions[]`; see below.)
2. **`decisions[]` and `transitions[]` stay activity-level.** They route to *other activities* and are evaluated by the **orchestrator** at the activity boundary ([evaluate-transition], `getValidTransitions` in [workflow-loader.ts:257](../../src/loaders/workflow-loader.ts)). Pulling them into the worker-facing `steps[]` would cross the orchestrator/worker boundary. They are out of scope for the in-activity sequence.

### Schema (Zod)

```ts
const StepBase = {
  id: z.string(),                          // explicit + STABLE (see replay constraint)
  when: z.string().optional(),             // inline boolean gate (runs-or-skips)
  condition: ConditionSchema.optional(),   // legacy structured gate (compat)
  required: z.boolean().optional(),        // worker hint; only meaningful when false
};

const TechniqueStep  = z.object({ kind: z.literal('technique'),
  technique: z.union([z.string(), TechniqueBindingSchema]),
  actions: z.array(ActionSchema).optional(),     // a technique step may also log/message
  ...StepBase });

const ActionStep     = z.object({ kind: z.literal('action'),
  actions: z.array(ActionSchema).min(1), ...StepBase });

const CheckpointStep = z.object({ kind: z.literal('checkpoint'),
  message: z.string(),
  options: z.array(CheckpointOptionSchema).min(1),
  defaultOption: z.string().optional(),
  autoAdvanceMs: z.number().int().positive().optional(),
  blocking: z.boolean().optional(),              // FORMALIZED (today silently stripped on parse)
  ...StepBase });

const LoopStep = z.lazy(() => z.object({ kind: z.literal('loop'),
  loopType: z.enum(['forEach','while','doWhile']),   // renamed from `type` to avoid clashing with Condition.type
  variable: z.string().optional(), over: z.string().optional(),
  condition: ConditionSchema.optional(), breakCondition: ConditionSchema.optional(),
  maxIterations: z.number().int().positive().default(100),
  name: z.string().optional(),
  steps: z.array(StepSchema),                    // compound body
  ...StepBase }));

const StepSchema = z.lazy(() =>
  z.discriminatedUnion('kind', [TechniqueStep, ActionStep, CheckpointStep, LoopStep]));

// ActivitySchema: steps: z.array(StepSchema); KEEP decisions[]/transitions[]; DROP checkpoints[]/loops[].
```

## Reference: `prism-update/01-review-changes` (before → after)

**Before** (parallel arrays; checkpoint defined out-of-line, referenced by id):
```
steps[2]:
  - id: present-summary
    technique: review-change-set::present-summary
    checkpoint: change-review                 # reference
  - id: apply-exclusions
    technique: review-change-set::apply-exclusions
checkpoints[1]:
  - id: change-review
    message: "Here are the upstream changes. ... confirm which changes to apply."
    options: [confirm, adjust-exclusions, abort→__terminal__]
    blocking: true
```

**After** (one ordered list; the checkpoint sits at index 1 — present-then-confirm is literal adjacency). This is **verbatim codemod output**, validated PASS against the schema above:
```
steps[3]:
  - kind: technique
    id: present-summary
    technique: "review-change-set::present-summary"
  - kind: checkpoint
    id: change-review
    blocking: true
    message: "Here are the upstream changes. ... confirm which changes to apply."
    options: [confirm, adjust-exclusions, abort→__terminal__]
  - kind: technique
    id: apply-exclusions
    technique: "review-change-set::apply-exclusions"
```

`work-package/08-implement` (the hard case) also validates PASS: top-level steps + a checkpoint fold + three `kind: loop` compound steps with their nested checkpoints folded inside the loop body (`switch-model-pre-impl` after `implement-task`, `symbol-provenance-confirmed` after `self-review`). The codemod **flags** the one thing it cannot decide mechanically — the top-level/loop interleave order (see below).

## Key constraints & decisions

- **Replay identity (hard requirement).** Checkpoint responses are keyed `<activityId>-<checkpointId>` in `state.checkpointResponses` and replay only when that exact key exists. A checkpoint-kind step **must** carry an explicit, stable `id` — the migration preserves every existing checkpoint id verbatim, and a guard must enforce that a checkpoint-kind id never routes through the technique-derived `defaultStepId` path.
- **Present-then-checkpoint is the default split.** Where a step today carries *both* a technique and a `checkpoint:` ref, the codemod emits the technique step then the checkpoint step (matching current walker behaviour). Sites needing the checkpoint *before* the action are the exception and are an explicit author choice — which is exactly the clarity this buys.
- **`blocking` gets formalized.** ~30 checkpoints author `blocking:` in TOON but `CheckpointSchema` has no such field, so Zod silently strips it. Inlining is the moment to make it real.
- **Loops stay compound, not flattened.** Flattening loop bodies into the top-level array would collide duplicate ids (`scope-and-draft` reuses ids across the loop/top-level scopes, legal today because scopes are independent). A `kind: loop` step keeps per-scope id validation intact.

## Codemod (prototype)

[`scripts/migrate-step-kinds.ts`](../../scripts/migrate-step-kinds.ts) decodes a TOON activity, folds each `checkpoints[]` def into a checkpoint-kind step at its referencing step's position (present-then-checkpoint), converts `loops[]` to compound loop-kind steps (recursively folding inner checkpoints), leaves `decisions[]`/`transitions[]` untouched, re-encodes, and **validates the output against the schema above**. Both targets pass. It emits flags for the two decisions it cannot make:
- **top-level/loop interleave** — emitted as `[steps…, loops…]`; needs manual ordering for the ~18 activities with both.
- **orphan checkpoints** — appended at the end; their position is an authoring decision (3 in `01-start-work-package`).

## Migration plan (phased; each phase typecheck + test gated)

1. Land the discriminated-union `StepSchema` + regenerate `activity.schema.json`, behind a temporary dual-shape compat shim so a half-migrated corpus still validates.
2. Codemod the **56** activity files that declare a control array; verify with `validate-activities`. (~37 step-only files need only `kind:` annotation.)
3. Rewrite `injectResolvedStepIds` (regex on `- technique:` → structured transform) and `populateStepIds` (recurse into loop-kind bodies).
4. Make the three guards **kind-aware** (`check-bound-step-purity` must stop banning `name`/`description` on checkpoint-kind steps); re-baseline `check-binding-fidelity`.
5. Rewrite the e2e walker (the single largest consumer — it models the parallel arrays throughout) and regenerate snapshots.
6. Update `mcp-server`/`workflow-loader` tests (they iterate `activity.checkpoints` and hard-code checkpoint ids).
7. Rewrite the authoring docs that codify constructs-as-distinct-things: `schema-construct-inventory.md`, `design-principles.md`, `anti-patterns.md` (AP-64 premise), `schemas/README.md`.
8. Remove the compat shim.

**Server execution surface is small** (the server brokers checkpoint yield/respond by id and validates; the worker runs steps) — the dominant cost is data migration + authoring-doc rewrites, both largely codemod-driven. The change is a net simplification: it deletes orphan-checkpoint detection, collapses `getCheckpoint`'s reference lookup, and resolves the present-position and loop-interleave ambiguities by construction.

## Open decisions for the maintainer

1. **Interleave policy** for the ~18 activities with both top-level steps and loops — author by hand, or extend the codemod with an explicit per-activity ordering input?
2. **`blocking`** — formalize as a real field (recommended) or drop it?
3. Keep the legacy structured `condition` alongside `when`, or migrate gates to `when`-only as part of this?
4. Absorb `decisions[]` as a `kind: branch` step too, or hold the line that all cross-activity routing stays in `decisions[]`/`transitions[]` (recommended)?
