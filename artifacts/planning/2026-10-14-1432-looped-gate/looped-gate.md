# Looped Gate — A Round of Its Own for Every Gate in a Loop Body

## Overview

A gate inside a `kind: loop` step is one definition the run reaches once per round. Its answer is recorded under `<activity>-<checkpoint>`, and `yield_checkpoint` returns a recorded answer without yielding, so a gate yielded under the same id every round holds one answer for the whole loop and every round after the first replays it. The engine carries the separator that gives each round an identity; thirteen corpus gates did not use it. This work reports the shape, brings those thirteen to it, and makes the readers that judge a checkpoint definition name it by its base.

## Problem

- **The answer key is the yielded id, and nothing required that id to vary.**
  [`checkpointResponses`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/schema/session.schema.ts#L88) is keyed by activity and checkpoint, and the [replay branch](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/tools/workflow-tools.ts#L2504-L2512) returns the stored option for a key already held.
- **Clearing is scoped to activity entry, which a loop step does not reach.**
  [`forgetEarlierVisitAnswers`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/tools/workflow-tools.ts#L780-L791) runs as an activity is entered, so a self-loop asks again while a `kind: loop` step iterating inside one visit does not.
- **Thirteen definitions carried the shape.**
  Measured over `origin/workflows` at `7a2d660d`: twenty checkpoints sit inside loop steps, five carry a discriminator, thirteen do not.
- **No guard reported it.**
  The all-workflows walk runs in `mode: 'graph'` and executes no steps, and the end-to-end walker [makes a single pass](https://github.com/m2ux/workflow-server/blob/bf3be7b8/tests/e2e/walker.ts#L620-L628) of a loop body on purpose, so a looped gate walked to completion with nothing measuring it.
- **Two readers named a checkpoint by its whole id to judge its definition.**
  The review-mode acceptance list and the review-mode walk assertion each name a checkpoint to say something about the definition. A discriminated id matches neither, so an acceptance goes stale and a forbidden gate passes the assertion under the name it rounds under.
- **The presented id named no round.**
  `present_checkpoint` spread the definition, whose discriminator is still in template form, while every other field rendered from the bag.

## Proposal

- **The discriminator is the mechanism, and it already exists.**
  [`INSTANCE_SEPARATOR`](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/loaders/workflow-loader.ts#L465-L486) gives one definition an identity per reach; `getCheckpoint` resolves a qualified id back to that definition. A key per round costs the definition nothing but the id it is yielded under, and the resume replay is unchanged — a key naming the round still matches within that round.
- **A guard reports a gate that cannot ask per round.**
  `gate-inside-loop`, in `check-loop-shape`, names each loop-body checkpoint whose id carries no expression read against the bag.
- **Every corpus gate takes a round.**
  An item loop names its round by the item it already binds; a repeat-until loop counts its rounds in a declared counter incremented by a set action at the end of its body.
- **A reader judging the definition names the base.**
  The acceptance list and the walk assertion take `baseId`, so one entry covers every round and no forbidden gate slips past under a rounded name.

## Work Breakdown

| Part | Description |
| --- | --- |
| Guard | `gate-inside-loop` in `check-loop-shape`, with the fixture cases that pin each shape. |
| Definitions | The thirteen gates, their counters, and the walk snapshots those counters move. |
| Readers | `check-review-mode-gating` and the review-mode walk assertion keyed on the base id. |
| Presentation | `present_checkpoint` under the active checkpoint's own id, and the schema prose that describes the key. |
| Tests | A server-tool run over three rounds and a resume within one. |

## Changed files

### Gate identity — `fix/1432-gate-identity` at `96139bcc`

- [`workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/src/tools/workflow-tools.ts#L2772-L2776) — the gate is presented under the id it was yielded with.
- [`activity.schema.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/src/schema/activity.schema.ts#L88) — a loop-body checkpoint id ends in `#{expression}`.
- [`session.schema.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/src/schema/session.schema.ts#L88) — a looped gate's key names the round.
- [`check-review-mode-gating.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/guards/check-review-mode-gating.ts#L218) — the acceptance names the base id.
- [`snapshot.test.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/tests/e2e/snapshot.test.ts#L144-L152) — the review-mode assertion names base ids.
- [`looped-gate.test.ts`](https://github.com/m2ux/workflow-server/blob/96139bcc/tests/looped-gate.test.ts) — three rounds, and a resume within one.

### Definitions — `fix/1432-looped-gate-corpus` at `1dd4159e`

- Four item-loop gates take the item the loop binds: `workflow-authoring/01`, and three in `workflow-design/06`.
- Nine repeat-until gates take a counted round: `plain-language/04`, `ponytail/02`, `prism-evaluate/05`, and `work-package/06`, `/09`, `/13` (two), `/15`, `/21`.
- [`walks/snapshot.test.ts.snap`](https://github.com/m2ux/workflow-server/blob/1dd4159e/walks/snapshot.test.ts.snap) — the step counts and gate ids the counters bring.

### Loop-gate guard — `fix/1432-loop-gate-guard` at `174932e9`

- [`check-loop-shape.ts`](https://github.com/m2ux/workflow-server/blob/174932e9/guards/check-loop-shape.ts) — the `gate-inside-loop` rule and the reach it states.
- [`loop-shape-guard.test.ts`](https://github.com/m2ux/workflow-server/blob/174932e9/tests/loop-shape-guard.test.ts) — six cases over the gate rule.

## Tests

Revisions: engine at `96139bcc` (`fix/1432-gate-identity`) and `174932e9` (`fix/1432-loop-gate-guard`), both cut from `main` at `bf3be7b8`; definitions at `1dd4159e` (`fix/1432-looped-gate-corpus`), cut from `workflows` at `7a2d660d`. Every run is `scripts/sbx` under bubblewrap, with no network.

Each branch is run against the tip its CI pairs it with, because a pull request based on `main` is graded against the `workflows` tip and one based on `workflows` against the `main` tip. [Decisions](decisions.md) holds the order that follows.

### T1 — A looped gate asks once per round

`npx vitest run tests/looped-gate.test.ts`, at `96139bcc`.

```text
Test Files  1 passed (1)
     Tests  3 passed (3)
```

Three rounds of one loop-body gate, yielded as `round-reviewed#1`, `#2` and `#3` and answered `revise`, `revise`, `accept`, record three keys each holding its own round's option, with no `checkpoint_replayed` event among them. That is **AC1**.

### T2 — A resume within a round replays that round's answer

The third case of the same file. A worker yielding `round-reviewed#2` after that round is answered receives `status: 'replayed'` with `resolved_option: 'accept'` and no active checkpoint, while `round-reviewed#1` replays `revise`. The replay is the round's own answer rather than the first round's, which is **AC2**.

### T3 — The guard reports every gate that cannot ask per round

`npx tsx guards/check-loop-shape.ts --root <corpus>`, at `174932e9` against `workflows` at `7a2d660d`.

```text
loop-shape: 13 violation(s) — give an item loop its collection and item, a repeat-until loop its continuation test, and a loop-body gate a round in its id
  [gate-inside-loop] plain-language/activities/04-evaluate.yaml[evaluate-revise-loop].evaluation-reviewed
  … 12 more
```

The same guard at `174932e9` against the definitions at `1dd4159e`:

```text
loop-shape: OK — every loop declares the fields its iteration type uses, and every gate in a body asks once per round
```

The guard names each of the thirteen on the tree that carries them and reports none on the tree that fixes them, which is **AC3**.

### T4 — The guard's own cases

`npx vitest run tests/loop-shape-guard.test.ts`, at `174932e9`.

```text
Test Files  1 passed (1)
     Tests  16 passed (16)
```

Six cases cover the gate rule over synthetic roots: a plain id refused in both loop kinds, an expression accepted in both, a literal discriminator refused, the site named under its loop, a gate outside any loop left alone, and a gate in a nested body reported once against the inner loop.

### T5 — The suite, each branch against the tip it pairs with

`npx vitest run`.

| Branch | Definitions | Result |
| --- | --- | --- |
| `96139bcc` | `7a2d660d` (the current tip) | `143 passed, 2 skipped` / `2448 passed, 6 skipped` |
| `174932e9` | `1dd4159e` | `143 passed, 2 skipped` / `2454 passed, 6 skipped` |

### T6 — The guard sweep, each branch against the tip it pairs with

`npx tsx guards/check-all.ts`, compared per guard with `main` at `bf3be7b8` against `workflows` at `7a2d660d`.

| Branch | Definitions | Verdicts differing from that pair |
| --- | --- | --- |
| `96139bcc` | `7a2d660d` | none |
| `96139bcc` | `1dd4159e` | none |
| `174932e9` | `1dd4159e` | none |

The sweep is red on this repository for guards this work does not touch, so the measure is the per-guard verdict against the same pair rather than a clean sweep. No verdict moves in either direction on any of the three pairings — `loop-shape` included, which passes on each because each branch is read against the definitions it is delivered with.

### T7 — The walk checks the definitions branch runs

`npx vitest run tests/e2e/snapshot.test.ts tests/e2e/all-workflows-walk.test.ts`, at `96139bcc` against `1dd4159e`.

```text
Test Files  2 passed (2)
     Tests  88 passed (88)
```

The two walks `verify-corpus.yml` runs on the definitions branch pass against the engine that branch pairs with.

### T8 — Typecheck

`tsc --noEmit` and `tsc -p tsconfig.tools.json`, at `174932e9`. Both exit 0 with no diagnostic.
