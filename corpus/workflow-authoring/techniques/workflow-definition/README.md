# Workflow Definition

> Part of [techniques](../README.md)

Shared contract for the operations that classify, author and audit workflow definition files.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`apply-audit-fixes`](apply-audit-fixes.md) | Durable record of what a remediation round changed, per finding, with the post-edit validation result |
| [`audit-canon`](audit-canon.md) | One walk of every criteria home against a target's definition surface and its change surface (whole touched files closed under I/O-contract referencers and their consumers), with each… |
| [`audit-schema-validation`](audit-schema-validation.md) | The repository's definition guards run against one target, with every resolvable failure resolved |
| [`commit-verification`](commit-verification.md) | Confirmation that a commit on the run's edit worktree landed complete |
| [`compile-report`](compile-report.md) | The run's findings register, rolled up from every target swept |
| [`compose-publication`](compose-publication.md) | The publication payload for a definition change — what to stage, the commit message, and the pull-request title and body |
| [`create-completion-doc`](create-completion-doc.md) | The run's single terminal record: what was delivered, what was decided, what stays open, and what the run itself taught |
| [`derive-workflow-branch`](derive-workflow-branch.md) | Feature branch name in the workflows repo for this run's change |
| [`elicit-change-brief`](elicit-change-brief.md) | Change brief for a new workflow, elicited one design dimension at a time |
| [`impact-analysis`](impact-analysis.md) | Impact assessment of a proposed change against an existing workflow definition |
| [`intake-classification`](intake-classification.md) | Operation-type classification and design-intent baseline for create, update or review |
| [`inventory-prose-fields`](inventory-prose-fields.md) | The inventory of every definition-prose field on the change surface (whole touched files and I/O-contract closure) that Description Hygiene and bound-step criteria reach |
| [`load-known-findings`](load-known-findings.md) | Keys of the findings a prior pass already accepted or baselined, normalised into one comparable form |
| [`readme-authoring`](readme-authoring.md) | Target workflow's root README, orienting a reader to its purpose, structure and links |
| [`reload-workflow`](reload-workflow.md) | Current definition surface of one target, the base ref its change is measured against, and the change surface as whole touched files closed under I/O-contract referencers |
| [`resolve-consumer-surface`](resolve-consumer-surface.md) | The references other workflows hold into one target, resolved against the change surface (whole touched files closed under I/O-contract referencers) |
| [`review-drafted-file`](review-drafted-file.md) | Detection of content a drafted file removes that no removals inventory accounted for |
| [`scope-definition`](scope-definition.md) | Complete file-level scope and structural shape for a change, as a lean manifest |
| [`scope-verification`](scope-verification.md) | The confirmed manifest checked in both directions against what the run actually changed |
| [`synthesize-change-brief`](synthesize-change-brief.md) | Change brief for an existing workflow, covering only the dimensions the change alters |
| [`verify-high-findings`](verify-high-findings.md) | Independent re-derivation of the high-severity findings a criteria walk produced, with severity recalibrated and the decision surface counted |
| [`yaml-authoring`](yaml-authoring.md) | Schema-valid definition file authored from a manifest entry |
