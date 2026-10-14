# Looped Gate: One Answer Replays for Every Iteration — October 2026

> Delivery · Created 2026-10-14

## Executive Summary

A checkpoint answer is recorded under `<activity>-<checkpoint>`, and `yield_checkpoint` replays a recorded answer without yielding, so the id a gate is yielded under is the whole of what separates one round's decision from the next. The engine already carries the separator that does this: a loop-body gate declared as `<base>#{expression}` resolves to its one definition through `getCheckpoint` while keying an answer per round. Five corpus gates used it; thirteen did not, and each of those thirteen asked once and replayed that answer for every later round.

This work makes the shape measurable and brings every site to it: a `gate-inside-loop` rule in `check-loop-shape` reports a loop-body gate whose id reads the same every round, and the thirteen gates take a round — the item for a `forEach`, a counted round for a `while` or `doWhile`. Two readers that name a checkpoint to judge the definition rather than one reach of it now take the base id, and `present_checkpoint` shows the gate under the round it was yielded with rather than under the definition's unrendered template.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Looped gate](looped-gate.md) | The measurement, the change, and the test run for each acceptance criterion |
| [Decisions](decisions.md) | The premise correction, the scope taken, the merge order, and the options weighed |

## Links

| Resource | Link |
| --- | --- |
| Issue | [#1432 Looped Gate](https://github.com/m2ux/workflow-server/issues/1432), closed completed |
| Gate identity, merged first | [#1439](https://github.com/m2ux/workflow-server/pull/1439) into `main` at `593580cb` |
| Definitions, merged second | [#1440](https://github.com/m2ux/workflow-server/pull/1440) into `workflows` at `c9c0609d` |
| Loop-gate guard | [#1441](https://github.com/m2ux/workflow-server/pull/1441) into `fix/1432-gate-identity`, then [#1444](https://github.com/m2ux/workflow-server/pull/1444) into `main` at `8fab4a08` |
| The separator both populations use | [workflow-loader.ts](https://github.com/m2ux/workflow-server/blob/bf3be7b8/src/loaders/workflow-loader.ts#L465-L486) |
