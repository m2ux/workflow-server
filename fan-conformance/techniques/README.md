# Fan Conformance Techniques

> Part of the [Fan Conformance Workflow](../README.md)

The technique library for the fan conformance run. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the shared input every operation here reads and the rule every operation that runs in a branch obeys — that it records its own start and finish instants, in its own output, because a branch cannot see its siblings and the report compares intervals it did not take itself.

## What the library is shaped by

The operations divide by the position the activity binding them occupies in the graph, which is the same division the [activities README](../activities/README.md) describes.

The branch operations survey something cheap and report their own interval: files by extension, recent history, one directory, one root of the tree. They are deliberately inexpensive, so the run's cost is the routing's cost rather than the survey's. Each reads only what it was handed — a branch operation that reached wider would duplicate a sibling's work and make the two disagree.

The meeting-point operations read containers whole and produce either the collection the next fan runs over or the one document the run leaves behind. None of them names a slot.

One branch operation commits. It writes its note inside the checkout its activity materialised and nowhere else, because a commit derives its paths from the tree it runs in — so a write that escapes into the shared tree is attributed to whichever instance commits next.

## Capabilities this library does not hold

Some operations these activities bind live in the meta library, and are referenced qualified by group as any reference from outside meta is. `orchestration-patterns::gather-results` reconciles a container against the collection that produced it; `version-control::create-worktree`, `version-control::commit-regular-files` and `version-control::merge-branches` give an isolated writer its checkout, its commit and the merge at the convergence.

The first of those version-control operations is load-bearing beyond what it does. An engine rule reads whether a fanned activity binds it, and admits the commit operations only where it does — so the binding is what exempts this run's writers from the refusal that otherwise stops a fanned activity from committing.
