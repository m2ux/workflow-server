# Workflow Authoring Techniques

> Part of the [Workflow Authoring Workflow](../README.md)

The technique library for this workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds the inputs and authoring invariants shared by every technique here, including the canonical-home map.

---

## Local techniques

| Technique | Capability |
|-----------|------------|
| [`intake-classification`](./intake-classification.md) | Classify create, update or review; land the gap flags, the target set and the baseline |
| [`select-dimension-set`](./select-dimension-set.md) | Order the create-mode design dimensions as the elicitation guide states them |
| [`elicit-change-brief`](./elicit-change-brief.md) | Elicit a new workflow's change brief one design dimension at a time |
| [`synthesize-change-brief`](./synthesize-change-brief.md) | Assemble an existing workflow's change brief from the dimensions that change |
| [`impact-analysis`](./impact-analysis.md) | Classify impact, check integrity and inventory removals against an existing definition |
| [`derive-workflow-branch`](./derive-workflow-branch.md) | Derive the feature branch name this run's changes are committed to |
| [`scope-definition`](./scope-definition.md) | Enumerate the complete file manifest with its structural design and drafting order |
| [`yaml-authoring`](./yaml-authoring.md) | Author one manifest entry as a schema-valid definition file |
| [`review-drafted-file`](./review-drafted-file.md) | Detect content a drafted file removes that no inventory accounts for |
| [`readme-authoring`](./readme-authoring.md) | Generate or revise the target workflow's root README |
| meta [`verify-artifact-conforms`](/meta/techniques/verify-artifact-conforms.md) | Correct the planning artifacts against their own guides and the canonical-home map, bound with this workflow's two maps |
| [`load-known-findings`](./load-known-findings.md) | Normalise the baselines and a prior register into comparable exclusion keys |
| [`reload-workflow`](./reload-workflow.md) | Resolve one target's current definition surface and the base ref its change is measured against |
| [`resolve-consumer-surface`](./resolve-consumer-surface.md) | Resolve the references other workflows hold into a target against the files this run changed |
| [`inventory-prose-fields`](./inventory-prose-fields.md) | Inventory every definition-prose field on the change surface that Description Hygiene and bound-step criteria reach |
| [`audit-canon`](./audit-canon.md) | Walk every criteria home once against a target's surface, attributing and recording coverage |
| [`audit-schema-validation`](./audit-schema-validation.md) | Run the repository's definition guards against the tree the run edits |
| [`apply-audit-fixes`](./apply-audit-fixes.md) | Record what a remediation round changed, per finding, with its post-edit validation result |
| [`verify-high-findings`](./verify-high-findings.md) | Re-derive every high-severity finding independently and recalibrate severity |
| [`compile-report`](./compile-report.md) | Roll the swept targets up into the run's findings register |
| [`scope-verification`](./scope-verification.md) | Check the confirmed manifest against the change set in both directions |
| [`compose-publication`](./compose-publication.md) | Compose what to stage, the commit message, and the pull-request title and body |
| [`commit-verification`](./commit-verification.md) | Confirm the commit landed with every touched file in it |
| [`create-completion-doc`](./create-completion-doc.md) | Record the run's single terminal document, retrospective included |

## Shared techniques bound by this workflow

Resolved directly from the named workflow — no copy is held here.

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](/meta/techniques/variable-binding.md) | Declared at `workflow.techniques.activity`; inherited by every activity rather than bound per step |
| [`workflow-engine::create-readme`](/meta/techniques/workflow-engine/create-readme.md) | Seed the planning-folder `README.md` from the universal Template under this workflow's seed profile |
| [`workflow-engine::list-workflows`](/meta/techniques/workflow-engine/list-workflows.md) | The library catalog, remapped as the reference set a conformance walk compares against |
| [`workflow-engine::verify-readme-conforms`](/meta/techniques/workflow-engine/verify-readme-conforms.md) | Drift-check the planning-folder `README.md` against the Template and this workflow's seed profile |
| [`work-package::manage-artifacts`](/work-package/techniques/manage-artifacts/TECHNIQUE.md) | `write-artifact` — the numbered planning-folder artifact write |
| [`work-package::manage-git`](/work-package/techniques/manage-git/TECHNIQUE.md) | `remove-worktree` — tear down the run's edit worktree |
| [`git`](/git/techniques/TECHNIQUE.md) | `derive-workflows-target-path` and `create-worktree` for the edit surface; `commit-regular-files` and `push-branch` to publish it |
| [`github`](/github/techniques/TECHNIQUE.md) | `create-pr` — opened non-draft, because the commit gate already approved publication |
