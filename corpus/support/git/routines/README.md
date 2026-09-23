# Git Routines

> Part of the [git library](../techniques/TECHNIQUE.md)

Each run here is a named sequence of the library's [operations](../techniques/README.md), declared with the inputs it needs and the values it produces, and reached from an activity by a `kind: routine` step. This file orients — the signature and the body live in the per-run `.yaml`.

| Routine | Reached for |
|---------|-------------|
| [`ready-checkouts`](ready-checkouts.yaml) | Every checkout a roster names brought to its stated revision, answering the commit each landed at or the refusal that left it as it stood |

A checkout carrying modifications refuses a pin, so where the caller sets `reset_before_pin` the run surveys every tree first and puts what it found in front of a person — the case where the trees being pinned are ones tools write into, and the work at risk is nobody's.
