# Work Package Techniques

> Part of the [Work Package Implementation Workflow](../README.md)

The technique library for the work-package workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-technique `.md` file (or group `TECHNIQUE.md` + technique files). This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the shared Inputs and Rules every technique here inherits.

[`variable-binding`](/meta/techniques/variable-binding.md) rides every activity's delivery as part of the worker contract. The cross-cutting meta strategy technique [`scatter-gather`](/meta/techniques/scatter-gather.md) is declared at activity level, not bound per step.

---

## Shared techniques bound by this workflow

Techniques a shared namespace holds — `meta` (`workflow-engine`), `git`, `github`, `atlassian` and `gitnexus` — are referenced by qualified id from this workflow.
