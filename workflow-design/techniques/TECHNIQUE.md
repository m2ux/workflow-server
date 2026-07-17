---
metadata:
  version: 1.0.1
---

## Capability

Shared base contract for a workflow's techniques. Any Inputs, Outputs, or Rules defined here are inherited by every technique in this workflow. A Protocol here WRAPS each descendant's own protocol: blocks titled `Initial` are placed before, blocks titled `Final` after, and the server renumbers the combined sequence; any other protocol block here is delivered only when this contract is referenced directly. The wrap is recursive — every ancestor container (this root and any containing group) contributes its `Initial`/`Final`. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### user_description

Free-form description of the workflow the user wants to create or modify

### target_workflow_id

*(optional)* Existing workflow id to modify (update mode), or the current review-mode audit target. When multiple targets are audited, each iteration binds this id from `{target_workflow_ids}`.

### target_workflow_ids

*(optional)* Ordered list of workflow ids to audit in review mode. Single-target review uses a one-element list. Update/create modes leave this unset and use `{target_workflow_id}` alone.

## Outputs

### workflow_files

Complete workflow definition: `workflow.yaml`, activity files, technique files, resource files, README

#### workflow_definition

Root workflow definition with metadata, variables, rules, and techniques

#### activity_files

One `.yaml` file per activity with steps, checkpoints, transitions

#### technique_files

One `.md` file per technique with capability, protocol, inputs, outputs, rules

#### resource_files

Markdown resource files for agent guidance

#### readme_file

Workflow README with description, activity table, and usage

## Rules

### workflow-rules-authoritative

Cross-cutting design invariants live in `workflow.yaml` `rules[]`. Apply those as the single source of truth; this technique does not duplicate them.

### consult-referenced-resources

Before relying on a referenced resource's content, load that resource. Do not restate harness tool recipes here (`no-tool-usage-prescription`).

### apply-anti-patterns-when-authoring

When authoring or revising workflow definition content (YAML prose fields, technique/resource markdown, README orientation), apply [anti-patterns](../resources/anti-patterns.md) as write-time constraints — especially Schema Expressiveness and Description Hygiene — rather than relying on a later quality-review pass to discover violations. Do not restate entry Detect criteria here.
