# Plain Language Techniques

> Part of the [Plain Language Workflow](../README.md)

The technique library for this workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients — it does not restate protocols.

Operations live in the [`plain-language`](./plain-language/TECHNIQUE.md) group, so each has a `group::operation` address that another workflow can bind without copying the file — the embedded-check use.

---

## Local operations

| Operation | Capability |
|-----------|------------|
| [`intake-and-profile`](./plain-language/intake-and-profile.md) | Classify the operation and settle the reader profile and content selection |
| [`analyze-source`](./plain-language/analyze-source.md) | Audit an existing document against the principles; record findings and strengths |
| [`draft-document`](./plain-language/draft-document.md) | Produce the plain-language document for its readers |
| [`evaluate-document`](./plain-language/evaluate-document.md) | Evaluate a draft against the four principles; record verdicts and open issues |
| [`complete-checklist`](./plain-language/complete-checklist.md) | Walk the ISO 24495-1 checklist against the final draft |

## Shared operations bound by this workflow

Resolved directly from the named workflow — no copy is held here.

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared at `workflow.techniques.activity`; inherited by every activity rather than bound per step |
| [`workflow-engine::create-readme`](../../meta/techniques/workflow-engine/create-readme.md) | Seed the planning-folder `README.md` from the universal Template under this workflow's seed profile |
| [`work-package::manage-artifacts`](../../work-package/techniques/manage-artifacts/TECHNIQUE.md) | `write-artifact` — the numbered planning-folder artifact write |
