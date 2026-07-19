# Workflow Design Techniques

> Part of the [Workflow Design Workflow](../README.md)

The technique library for the workflow-design workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-technique `.md` file. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](./TECHNIQUE.md) holds shared Inputs, Outputs, and Rules for every technique here.

The cross-cutting meta strategy techniques [`variable-binding`](../../meta/techniques/variable-binding.md) and [`scatter-gather`](../../meta/techniques/scatter-gather.md) are declared at `workflow.techniques.activity` / activity level, not bound per step.

For the full technique-to-activity table with capability summaries, see the [workflow README](../README.md#techniques).

---

## Workflow-local techniques by area

| Area | Techniques |
|------|------------|
| **Intake** | `intake-classification`, `context-loading`, `reload-workflow` |
| **Elicitation** | `derive-design-dimensions`, `prepare-dimension`, `capture-dimension`, `synthesize-update-specification`, `reconcile-design-assumptions` |
| **Analysis** | `pattern-analysis`, `impact-analysis` |
| **Scope & draft** | `derive-workflows-target-path`, `prepare-workflow-branch` (ensure worktree), `scope-definition`, `assemble-file-approach`, `review-drafted-file`, `yaml-authoring`, `review-draft-yaml`, `verify-artifact-conforms` |
| **Quality audits** | `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `verify-high-findings`, `audit-principles`, `audit-anti-patterns`, `audit-schema-validation`, `apply-audit-fixes`, `scope-audit` |
| **Reporting** | `compile-report`, `summarize-findings`, `persist-report` |
| **Validate, commit & PR** | `scope-verification`, `readme-authoring`, `commit-verification`, `publish-workflow-pr` (title/body); activity binds `version-control::push-branch`, `github-cli-protocol::create-pr`, `github-cli-protocol::mark-ready` |
| **Completion** | `create-completion-doc`, `conduct-retrospective` |

## Cross-workflow techniques bound by this workflow

These operations are referenced cross-workflow (resolved directly from the named workflow, no copy):

| Reference | Used for |
|-----------|----------|
| [`work-package::manage-artifacts`](../../work-package/techniques/manage-artifacts/TECHNIQUE.md) | `create-readme` (seed the planning README), `write-artifact` (numbered artifacts), `verify-readme-conforms` (drift check) |
| [`work-package::manage-git`](../../work-package/techniques/manage-git/TECHNIQUE.md) | `create-worktree` (via prepare-workflow-branch ensure), `remove-worktree` (optional retrospective teardown) |
| [`work-package::stakeholder-overview`](../../work-package/techniques/stakeholder-overview.md) | Plain-language Problem Overview (intake) and Solution Overview (scope-and-draft) sections of the planning README |
| [`work-package::review-assumptions`](../../work-package/techniques/review-assumptions/TECHNIQUE.md) | `collect`, `interview`, `record` for the design-assumption lifecycle |
| [`meta::version-control`](../../meta/techniques/version-control/TECHNIQUE.md) | `commit-regular-files`, `push-branch` |
| [`meta::github-cli-protocol`](../../meta/techniques/github-cli-protocol/TECHNIQUE.md) | `create-pr`, `mark-ready`, `update-pr-description` (bound from validate-and-commit) |
