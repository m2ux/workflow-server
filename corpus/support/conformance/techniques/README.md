# Conformance Techniques

> Part of the [conformance library](../README.md)

The operations a specimen applies to set a case up, rather than to measure one. The authoritative capability, outputs and rules live in the per-operation `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

| Technique | Does |
|-----------|------|
| [`prepare-stale-fixture`](prepare-stale-fixture.md) | Stands up a throwaway checkout whose graph trails its working tree, and names the path and the graph a case binds |

A case that gates on a condition needs a subject holding that condition at the moment the gate is read. Where the run itself settles the condition — a rebuild brings a graph current — a subject chosen for holding it once holds it once, and every walk after the first takes the other branch. An operation here supplies the subject afresh each walk, so the gate reads the same on the hundredth walk as on the first.
