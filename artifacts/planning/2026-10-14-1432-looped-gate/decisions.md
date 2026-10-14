# Decisions — Looped Gate

## The premise the issue carried

[#1432](https://github.com/m2ux/workflow-server/issues/1432) proposed giving the answer key an iteration alongside the activity and the checkpoint, on the reading that the engine offered no way to express a gate asking once per round.

The engine already offers one. [`INSTANCE_SEPARATOR`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/loaders/workflow-loader.ts#L465-L486) gives one definition an identity per reach, `getCheckpoint` resolves a qualified id back to that definition, and [`validation.ts`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/utils/validation.ts#L85-L91) already states that a loop-body checkpoint yielded as `<base>#<instance>` records one response per iteration. Five corpus gates used it. So the key needed no change, the replay needed no change, and AC1 and AC2 held for any gate that adopted the shape.

What was missing was a measure and the adoption. The work is therefore the guard and the thirteen sites rather than a change to the key.

**Weighed against it.** Adding an `iteration` parameter to `yield_checkpoint`, as the issue's proposal implies. Rejected: it would put a second mechanism beside a working one for the same job, and the loop controls are agent-owned and advisory, so the server holds no round to validate such a parameter against. The discriminator already carries the round the worker knows.

## Placement

The issue is an orphan standalone issue on no board. Offered: a split between `[I00:E06] Position and Repetition` and `[I14:E04] Missing Checks`; the whole of it in `[I00:E06]`; the guard alone in `[I14:E04]`; or standalone delivery.

**Taken: standalone delivery**, targeting the long-lived branches directly. `[I00:E06]`'s unstarted rows depend on `[E02:W03]` and so wait on `[I00:E02]` closing, which would have held this behind an epic prerequisite.

## Scope

Offered: the guard with all thirteen sites; the guard with only the sites already holding a counter; the corpus alone with the guard deferred; or the guard alone with the corpus deferred.

**Taken: the guard with all thirteen sites.** `check-loop-shape` is declared hard zero with no baseline, and baselines are retired repo-wide, so a guard landing with standing findings turns `check:all` red. The guard and the adoption are one deliverable for that reason.

The nine repeat-until sites had no item to name a round by, and most had no counter either. Each takes a declared counter incremented by a set action at the end of its loop body — the shape `plain-language`'s evaluate-revise loop already used, which had the counter and the message and lacked only the id.

## A counter that does not reset

`prism-evaluate`'s refinement gate sits in a `doWhile` nested inside a `forEach`, so a per-item round would need resetting as each finding is taken up.

**Taken: one counter across findings**, named `refinement_pass` for what it counts. A round number only has to differ between reaches for the key to separate them, and a monotonic count differs without a reset step and without the reader having to know where the reset happens. The name says what the value is rather than implying a per-item round it does not hold.

## The presented id

`present_checkpoint` spread the checkpoint definition, so a loop-body gate was presented under its unrendered template while message and option text rendered from the bag. An ad-hoc gate already reported its resolved id, so the two paths disagreed on what `id` meant.

Classified **trivial** under [Deliver Mode](https://github.com/m2ux/workflow-server/blob/3c0f1ff5/skills/work-planner/references/deliver-mode.md)'s technical-debt rule — it blocks nothing and needs no work item of its own — and put to the user, who took the fix. The gate is presented under `active.checkpointId`, the id its answer is recorded against.

## Readers that name a definition

Discriminating `comprehension-sufficient` broke `check-review-mode-gating`: its acceptance entry named the whole id, so the entry went stale and the discriminated gate was reported unaccepted. The review-mode walk assertion had the mirror fault — two of its forbidden ids are ids this work discriminates, so those assertions would have passed vacuously while the gate they forbid went unchecked.

**Taken: both readers name the base id.** Each names a checkpoint to judge the definition rather than one reach of it, and every round is that definition reached again. This also makes the change order-independent: both readers are green against the definitions before and after.

**Weighed against it.** Rewriting the acceptance entry to the new discriminated id. Rejected: it would need rewriting again whenever the discriminator changes, it would leave the walk assertion's vacuous-pass fault standing, and it would make the two branches depend on each other's merge order in both directions at once.

## Merge order

CI pairs a branch with the other tree's tip: [`verify.yml`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/.github/workflows/verify.yml#L63-L71) resolves a `main` change's definitions and `verify-corpus.yml` resolves a definitions change's engine, and the pairing falls back to the long-lived branch for anything not based on an `iNN/*` branch. Standalone delivery takes that fallback, so each branch is graded against the other tree as it stands today.

That makes one piece order-dependent. `gate-inside-loop` is red against definitions that have not yet taken a round, and nothing can make a hard-zero guard green against a tree carrying thirteen of what it reports. Everything else was made order-independent instead: the base-id readers pass against both trees, and the walk snapshots live under `walks/` on the definitions branch rather than on `main`, so they travel with the definitions that move them.

**Taken: three pull requests, merged in order.**

| Order | Branch | Base | Why it is green there |
| --- | --- | --- | --- |
| 1 | `fix/1432-gate-identity` | `main` | Reads the current definitions; its guard verdicts match `main`'s tip exactly |
| 2 | `fix/1432-looped-gate-corpus` | `workflows` | Pairs with `main` after 1, whose acceptance list now names the base id |
| 3 | `fix/1432-loop-gate-guard` | `main` | Pairs with `workflows` after 2, where no gate is left to report |

**Weighed against it.** An initiative pair, `iNN/main` and `iNN/workflows`, which is what the `iNN/*` branch of the pairing exists for and would let the two trees go green together as one unit. Rejected for this work because the issue is delivered standalone, with no initiative to number the pair under; raising one to carry a single fix would plan the work this choice was made to avoid.

**Weighed against it.** Dropping `comprehension-sufficient` from the thirteen, which would have made the definitions branch green against `main` as it stands and reduced this to two pull requests. Rejected: it leaves one of the reported gates replaying, which is the defect.
