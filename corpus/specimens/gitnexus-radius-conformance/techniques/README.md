# GitNexus Radius Conformance Techniques

> Part of the [GitNexus Radius Conformance Workflow](../README.md)

The technique library for the radius conformance run. Each technique is one capability a step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients readers to the library layout and points to those authoritative sources.

The cross-cutting meta strategy technique [`variable-binding`](/meta/techniques/variable-binding.md) is declared at `workflow.techniques.activity`, not bound per step.

---

## How the library divides

**One technique, after the run.** [`report-radius-conformance`](./report-radius-conformance.md) reads what the reach run settled and writes the document.

**The run under test is not here.** The measurement is the gitnexus library's [`group-radius`](/gitnexus/routines/group-radius.yaml), which composes the library's own readiness, reading, probing and settling techniques. What this specimen owns is the reading of the answer, so the evidence is about the library's run rather than about anything authored beside it.
