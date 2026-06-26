---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Review the freshly drafted workflow files as a block-indexed table — one row per drafted construct (activity, technique, resource, workflow metadata) — confirming each block's rationale before the automated audit passes run, and capture a draft attestation. The structural counterpart of a manual diff review, indexed by construct rather than by git hunk.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{scope_manifest}` written under the workflows worktree.

## Outputs

### reviewed_blocks

The block-indexed review table: one row per drafted construct with its file, location, and a one-line rationale.

### draft_attestation

Confirmation, recorded in the planning folder, that every drafted block has been reviewed and is understood and intentional.

## Protocol

### 1. Index Blocks

- Build a block-indexed table from `{drafted_files}`: one row per drafted construct — each activity, technique, and resource, plus the `workflow.yaml` metadata block — recording its file, location, and a one-line rationale for why it exists
- In update mode, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`

### 2. Present And Attest

- Present `{reviewed_blocks}` and walk the user through each block's rationale
- Record `{draft_attestation}` in `{planning_folder_path}` once every block is confirmed understood and intentional; flag any block the user marks for revision before the audit passes run
