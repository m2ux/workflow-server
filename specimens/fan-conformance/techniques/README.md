# Fan Conformance Techniques

> Part of the [Fan Conformance Workflow](../README.md)

The technique library for the fan conformance run. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients readers to the library layout and points to those authoritative sources.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the shared input every technique here reads and the rule every technique that runs in a branch obeys — that it records its own start and finish instants, in its own output, because a branch cannot see its siblings and the activity they converge on is where those intervals are compared.

The cross-cutting meta strategy technique [`variable-binding`](../../../corpus/meta/techniques/variable-binding.md) is declared at `workflow.techniques.activity`, not bound per step.

---

## How the library divides

The techniques split by the position the activity binding them occupies in the graph, the same division the [activities README](../activities/README.md) describes.

**Branch techniques** count something and report the interval they took doing it: files grouped by extension, directories ranked by size, how many commits landed recently and which directories they touched, how deep one directory nests, what the largest file under it is. Every one of them only reads, so the run's cost is the routing's cost rather than the counting's. Each reads only what it was handed — a branch technique that reached wider would duplicate a sibling's work and make the two disagree.

**Meeting-point techniques** read containers whole and produce either the collection the next fan runs over or the one document the run leaves behind. None of them names a slot.

One branch technique commits. It writes its note inside the checkout its activity materialised and nowhere else, because a commit derives its paths from the tree it runs in — so a write that escapes into the shared tree is attributed to whichever instance commits next.

---

## Cross-workflow techniques

Operations under `meta/` are referenced by qualified id from this workflow. [`orchestration-patterns::gather-results`](../../../corpus/meta/techniques/orchestration-patterns/gather-results.md) reconciles a container against the collection that produced it; [`version-control::create-worktree`](../../../corpus/meta/techniques/version-control/create-worktree.md), [`version-control::commit-regular-files`](../../../corpus/meta/techniques/version-control/commit-regular-files.md) and [`version-control::merge-branches`](../../../corpus/meta/techniques/version-control/merge-branches.md) give an isolated writer its checkout, its commit, and the merge at the convergence.

The first of those version-control operations is load-bearing beyond what it does. An engine rule reads whether a fanned activity binds it and admits the commit operations only where it does, so the binding is what exempts this run's writers from the refusal that otherwise stops a fanned activity from committing.
