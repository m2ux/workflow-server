---
metadata:
  version: 1.1.2
---

## Capability

Review the drafted workflow files as a block-indexed table — one row per drafted construct (activity, technique, resource, workflow metadata) — recording each block's rationale and capturing a draft attestation.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{scope_manifest}` written under the workflows worktree.

### operation_type

The classified operation. When `update`, each block is marked added / modified / unchanged against the committed target; when `create`, every block is new.

## Outputs

### reviewed_blocks

The block-indexed review table following the [Draft Attestation Guide](../resources/draft-attestation.md#template).

### draft_attestation

Record in the planning folder that every drafted block has been reviewed and is understood and intentional (closing line of the [draft-attestation](../resources/draft-attestation.md) template).

### draft_attestation_path

Absolute path to the written draft-attestation artifact (includes the block-indexed review).

#### artifact

`draft-attestation.md`

## Protocol

### 1. Index Blocks

- Build `{reviewed_blocks}` from `{drafted_files}` following the [Draft Attestation Guide](../resources/draft-attestation.md#template)
- When `{operation_type}` is `update`, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`

### 2. Persist Reviewed Blocks

- Persist `{reviewed_blocks}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `draft-attestation.md` per [draft-attestation](../resources/draft-attestation.md); capture the written location as `{draft_attestation_path}`

### 3. Record Draft Attestation

- Record `{draft_attestation}` in that artifact once every block is marked understood and intentional; flag any block marked for revision
