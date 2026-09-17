# Routine Conformance Techniques

> Part of the [Routine Conformance Workflow](../README.md)

The technique library for the routine conformance run. Each technique is one capability a step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the shared input every technique here reads and the contract every measurement owes the run that binds it — that it answers under one name, and that it names the target to follow or names none.

The cross-cutting meta strategy technique [`variable-binding`](/meta/techniques/variable-binding.md) is declared at `workflow.techniques.activity`, not bound per step.

---

## How the library divides

**Measurements** are the two a site may supply: [`count-entries`](./count-entries.md) reads how many entries a directory holds, [`measure-size`](./measure-size.md) reads that and sums the bytes of its files. Neither is named in the run that applies them — a site names one, and the run reads what comes back.

They are interchangeable by contract rather than by coincidence. Both answer under `probe_result`, both carry `entry_count` and `next_target`, and the sizing one carries a third field the run never reads. A measurement that answered under a name of its own would be one the run's gates cannot see.

**The opening technique and the reporting technique** sit outside the run. One chooses where both passes start; the other reads what the two sites produced and writes the document. Neither is a measurement and neither can be supplied as one.
