# Work Package Techniques

> Part of the [Work Package Implementation Workflow](../README.md)

The technique library for the work-package workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-technique `.md` file (or group `TECHNIQUE.md` + operation files). This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds shared Inputs, Outputs, Rules, and Errors for every technique here.

The cross-cutting meta strategy techniques [`variable-binding`](../../meta/techniques/variable-binding.md) and [`scatter-gather`](../../meta/techniques/scatter-gather.md) are declared at `workflow.techniques.activity` / activity level, not bound per step.

---

## Cross-workflow techniques

Operations under `meta/` (e.g. `gitnexus-operations`, `version-control`, `workflow-engine`) are referenced by qualified id from this workflow.
