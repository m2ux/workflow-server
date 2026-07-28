# Workflow Authoring Techniques

> Part of the [Workflow Authoring Workflow](../README.md)

The technique library for this workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the inputs and authoring invariants shared by every technique here, including the canonical-home map.

Workflow-local operations live in the [`workflow-definition`](./workflow-definition/TECHNIQUE.md) group, so each has a `group::operation` address that another workflow can bind without copying the file.

---

## Local operations

| Operation | Capability |
|-----------|------------|
| [`derive-workflows-target-path`](./workflow-definition/derive-workflows-target-path.md) | Derive the dedicated workflows edit root from the planning-folder basename |
| [`intake-classification`](./workflow-definition/intake-classification.md) | Classify create, update or review; land the gap flags, the target set and the baseline |
| [`elicit-change-brief`](./workflow-definition/elicit-change-brief.md) | Elicit a new workflow's change brief one design dimension at a time |
| [`synthesize-change-brief`](./workflow-definition/synthesize-change-brief.md) | Assemble an existing workflow's change brief from the dimensions that change |
| [`impact-analysis`](./workflow-definition/impact-analysis.md) | Classify impact, check integrity and inventory removals against an existing definition |
| [`derive-workflow-branch`](./workflow-definition/derive-workflow-branch.md) | Derive the feature branch name this run's changes are committed to |
| [`scope-definition`](./workflow-definition/scope-definition.md) | Enumerate the complete file manifest with its structural design and drafting order |
| [`yaml-authoring`](./workflow-definition/yaml-authoring.md) | Author one manifest entry as a schema-valid definition file |
| [`review-drafted-file`](./workflow-definition/review-drafted-file.md) | Detect content a drafted file removes that no inventory accounts for |
| [`readme-authoring`](./workflow-definition/readme-authoring.md) | Generate or revise the target workflow's root README |
| [`verify-artifact-conforms`](./workflow-definition/verify-artifact-conforms.md) | Correct the planning artifacts against their own guides and the canonical-home map |
| [`load-known-findings`](./workflow-definition/load-known-findings.md) | Normalise the baselines and a prior register into comparable exclusion keys |
| [`reload-workflow`](./workflow-definition/reload-workflow.md) | Resolve one target's current definition surface and the base ref its change is measured against |
| [`resolve-consumer-surface`](./workflow-definition/resolve-consumer-surface.md) | Resolve the references other workflows hold into a target against the files this run changed |
| [`audit-canon`](./workflow-definition/audit-canon.md) | Walk every criteria home once against a target's surface, attributing and recording coverage |
| [`audit-schema-validation`](./workflow-definition/audit-schema-validation.md) | Run the repository's definition guards against the tree the run edits |

## Shared operations bound by this workflow

Resolved directly from the named workflow — no copy is held here.

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared at `workflow.techniques.activity`; inherited by every activity rather than bound per step |
| [`workflow-engine::create-readme`](../../meta/techniques/workflow-engine/create-readme.md) | Seed the planning-folder `README.md` from the universal Template under this workflow's seed profile |
| [`workflow-engine::list-workflows`](../../meta/techniques/workflow-engine/list-workflows.md) | The library catalog, remapped as the reference set a conformance walk compares against |
| [`work-package::manage-artifacts`](../../work-package/techniques/manage-artifacts/TECHNIQUE.md) | `write-artifact` — the numbered planning-folder artifact write |
| [`work-package::manage-git`](../../work-package/techniques/manage-git/TECHNIQUE.md) | `create-worktree` — materialise the run's edit worktree on its own branch |
