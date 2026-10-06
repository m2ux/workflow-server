# Worker Entry Conformance Techniques

> Part of the [Worker Entry Conformance Workflow](../README.md)

The technique library for the worker entry run. Each technique is one capability an activity
step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and
rules live in the per-technique `.md` file. This file orients readers to the layout and
points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the invariant every technique here obeys — that an
activity evidences the entry it arrived on and reaches no further.

The cross-cutting meta strategy technique [`variable-binding`](/meta/techniques/variable-binding.md)
is declared at `workflow.techniques.activity`, not bound per step.

---

## How the library divides

Two techniques, split by whether they record or compare.

[`note-entry`](./note-entry.md) is bound on every activity that sits on an entry path, through
the [`record-one-entry`](../routines/record-one-entry.yaml) routine. It reads the stub and the
clock and writes one record. Four activities bind it and each passes the entry kind its graph
position names, so the same capability serves a cold dispatch, a continuation and a branch.

[`report-entries`](./report-entries.md) is bound once, at the convergence. It reads the
containers whole and writes the document the run leaves behind: the entry roll, the one comparison
no branch could make for itself, and the ledgers counting what the session record holds against
what the graph requires.
