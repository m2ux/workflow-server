---
metadata:
  version: 1.0.0
---

## Capability

Shared base contract for a workflow's techniques. Any Inputs, Outputs, or Rules defined here are inherited by every technique in this workflow. A Protocol here WRAPS each descendant's own protocol: blocks titled `Initial` are placed before, blocks titled `Final` after, and the server renumbers the combined sequence; any other protocol block here is delivered only when this contract is referenced directly. The wrap is recursive — every ancestor container (this root and any containing group) contributes its `Initial`/`Final`. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.

## Inputs

### user_description

Free-form description of the workflow the user wants to create or modify

### target_workflow_id

*(optional)* Existing workflow id to modify (update mode) or to audit (review mode)

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

### resource-loading

Load each entry in a technique's referenced resources via `get_resource` after `get_technique` — refs are lightweight until loaded.

### tool-usage

`list_workflows` requires no params and no `session_index`
