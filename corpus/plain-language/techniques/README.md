# Plain Language Techniques

> Part of the [Plain Language Workflow](../README.md)

The technique library for this workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients — it does not restate protocols.

Every operation inherits the shared contract in [`TECHNIQUE.md`](./TECHNIQUE.md), and carries a `plain-language::operation` address another workflow can bind without copying the file — the embedded-check use.

---

## Local operations

| Operation | Capability |
|-----------|------------|
| [`intake-and-profile`](./intake-and-profile.md) | Classify the operation and settle the reader profile and content selection |
| [`analyze-source`](./analyze-source.md) | Audit an existing document against the principles; record findings and strengths |
| [`draft-document`](./draft-document.md) | Produce the plain-language document for its readers |
| [`evaluate-document`](./evaluate-document.md) | Evaluate a draft against the four principles; record verdicts and open issues |
| [`complete-checklist`](./complete-checklist.md) | Walk the ISO 24495-1 checklist against the final draft |

## Shared operations bound by this workflow

Resolved directly from the named workflow — no copy is held here.

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared at `workflow.techniques.activity`; inherited by every activity rather than bound per step |
| [`workflow-engine::create-readme`](../../meta/techniques/workflow-engine/create-readme.md) | Seed the planning-folder `README.md` from the universal Template under this workflow's seed profile |
| [`work-package::manage-artifacts`](../../work-package/techniques/manage-artifacts/TECHNIQUE.md) | `write-artifact` — the numbered planning-folder artifact write |

## Why the knowledge graph is absent

This library binds no [`gitnexus-operations`](../../meta/techniques/gitnexus-operations/TECHNIQUE.md) operation, and the group's own `subjects-the-index-holds` rule is the reason. Its subject is a single document handed over by its author, which no index has walked, and the questions asked of that document are which sentence breaches which guideline and which passage a reader will stumble on. The graph holds each heading and each link between files and none of the prose beneath them, so every one of those questions is a read of the document itself.

A heading question is the one exception in shape — and it is still a question about the document under revision rather than about an indexed tree, so it is answered by reading the headings that are already in hand.
