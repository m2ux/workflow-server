# Meta Techniques

> Part of the [Meta Workflow](../README.md)

The technique library for the meta workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file (or a group `TECHNIQUE.md` plus its operation files). This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds shared Inputs, Outputs, Rules and Errors for every technique here.

Techniques in this library are bound by the meta activities and are also referenced from other workflows, which qualify them by group (`version-control::resolve-host-repo`, `workflow-engine::dispatch-activity`). A reference from outside meta is always written qualified.

Cross-cutting conduct rules live in [`agent-conduct`](./agent-conduct.md); capability groups reference it as their single source of truth rather than restating it.

Strategy techniques at this root (standalone `.md` peers of the capability groups):

| Technique | Capability |
|-----------|------------|
| [`variable-binding`](./variable-binding.md) | Map a step's bound operation onto the variable bag by the operation's `inputs[]`/`outputs[]` signature |
| [`scatter-gather`](./scatter-gather.md) | Scatter agent work units (sequential or parallel), gather ordered keyed results, combine |
| [`unit-fan-out`](./unit-fan-out.md) | Scatter same-context process/shell/tool units, wait-all, ordered gather, combine |

For the group-by-group capability summary, see the [workflow README](../README.md#techniques).
