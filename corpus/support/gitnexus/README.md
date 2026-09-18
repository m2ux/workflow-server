# GitNexus

Codebase intelligence over a knowledge graph: what calls what, which execution flows a concept lands in, what a change would break, and which of a repository group's members can answer at all.

This is a **library namespace**, not a workflow. It declares no `workflow.yaml` and takes no place in any graph — it offers operations and runs to whatever binds them, and a caller may sit in any workflow or arrive later. References reach it as `gitnexus::<name>`, or as `support::gitnexus::<name>` where the path is the clearer address.

---

## What sits here

| Folder | Holds | Grain |
|--------|-------|-------|
| [`techniques/`](techniques/README.md) | One operation per GitNexus endpoint, plus the judgements the runs end on | One answer: a tool call, a resource read, or a reading of what those returned |
| [`routines/`](routines/README.md) | Named runs of those operations | A sequence, an iteration, a branch, a gate |

**The split is what the construct can hold.** A technique is a short produce path over one endpoint with the prose that reads its answer; it carries no loop, no branch and no user decision. A run that walks a collection, selects between two paths, or stops for a person is a routine, where the schema holds each of those as structure the step manifest and the coverage walk can see.

---

## Addressing an answer

Every operation answers from **one** indexed graph, and the caller says which by giving `{repo_name}`. Apply [`resolve-graph`](techniques/resolve-graph.md) for that name and for the groups configured over the graphs. A component and a containing tree that also holds it are separate graphs whose answers differ in scope while sharing a shape, so where an answer is reported the graph it came from is reported with it.

Two subjects sit outside every index and take grep instead: a document the walk never read, and anything beneath a dot-directory. The namespace's own [`TECHNIQUE.md`](techniques/TECHNIQUE.md) holds those rules and the rest of the shared contract.

---

## What the graph does not hold

A call site inside a macro body has no edge, because the text that makes the call exists only after expansion. Naming a type in a signature or a trait bound is not a call, so it is no edge at all. An answer is therefore evidence of what the graph holds and never of what depends on a symbol — where either route reaches the subject, the enumeration is re-derived by hand and the answer says which instrument produced it.

---

## Related

- [Workflow Canonical](/meta/resources/workflow-canonical.md#tools) — why a complex tool earns a namespace of its own
