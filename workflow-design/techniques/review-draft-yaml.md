---
metadata:
  version: 1.0.0
---

## Capability

Review the drafted workflow files as a block-indexed table — one row per drafted construct (activity, technique, resource, workflow metadata) — confirming each block's rationale and capturing a draft attestation.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{scope_manifest}` written under the workflows worktree.

### is_update_mode

Whether update mode is active. In update mode each block is marked added / modified / unchanged against the committed target; in create mode every block is new.

## Outputs

### reviewed_blocks

The block-indexed review table: one row per drafted construct with its file, location, and a one-line rationale.

### draft_attestation

Confirmation, recorded in the planning folder, that every drafted block has been reviewed and is understood and intentional.

### draft_attestation_path

Absolute path to the written draft-attestation artifact (includes the block-indexed review). Interpolated into draft attestation checkpoints as a markdown link.

#### artifact

`draft-attestation.md`

## Protocol

### 1. Index Blocks

- Build a block-indexed table from `{drafted_files}`: one row per drafted construct — each activity, technique, and resource, plus the `workflow.yaml` metadata block — recording its file, location, and a one-line rationale for why it exists
- In update mode, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`

### 2. Persist And Present

- Persist `{reviewed_blocks}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `draft-attestation.md`; capture the written location as `{draft_attestation_path}`
- Present `{reviewed_blocks}` (link the artifact; do not restate the full table in chat when the file carries it)
- Record `{draft_attestation}` in that artifact once every block is confirmed understood and intentional; flag any block the user marks for revision
