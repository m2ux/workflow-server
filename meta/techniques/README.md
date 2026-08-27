# Meta Techniques

> Part of the [Meta Workflow](../README.md)

The technique library for the meta workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file (or a group `TECHNIQUE.md` plus its operation files). This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds shared Inputs, Outputs, Rules and Errors for every technique here.

Techniques in this library are bound by the meta activities and are also referenced from other workflows, which qualify them by group (`version-control::resolve-host-repo`, `workflow-engine::dispatch-activity`). A reference from outside meta is always written qualified.

Cross-cutting conduct rules live in two homes, split by the audience that can act on them: [`agent-conduct`](./agent-conduct.md) holds what binds any agent in a run, and [`orchestrator-conduct`](./orchestrator-conduct.md) holds the boundaries only an orchestrator can honour. Capability groups reference them as their single source of truth rather than restating them, and a role's bundle addresses the families it owns rather than a whole conduct technique.

[`verify-artifact-conforms`](./verify-artifact-conforms.md) is the artifact-conformance pass every workflow that persists artifacts binds. It carries no workflow's canonical-home map or guide map of its own — the caller binds whichever maps it declares.

For the group-by-group capability summary, see the [workflow README](../README.md#techniques).
