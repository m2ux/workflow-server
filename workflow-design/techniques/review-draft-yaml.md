---
metadata:
  version: 1.2.0
---

## Capability

Block-indexed draft review of workflow files with per-construct rationale and draft attestation.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{scope_manifest}` written under `{target_path}/{workflow_id}/`.

### operation_type

The classified operation — `create` or `update`.

## Outputs

### reviewed_blocks

The block-indexed review table following the [Draft Attestation Guide](../resources/draft-attestation.md#template).

### draft_attestation

Record in the planning folder that every drafted block has been reviewed and is understood and intentional (closing line of the [draft-attestation](../resources/draft-attestation.md#template) template).

### draft_attestation_path

Absolute path to the written draft-attestation artifact (includes the block-indexed review).

#### artifact

`draft-attestation.md`

## Protocol

### 1. Index Blocks

- Build `{reviewed_blocks}` from `{drafted_files}` following the [Draft Attestation Guide](../resources/draft-attestation.md#template)
- When `{operation_type}` is `update`, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`; when `create`, mark every block new

### 2. Persist Reviewed Blocks

- Persist `{reviewed_blocks}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `draft-attestation.md` per [draft-attestation](../resources/draft-attestation.md#template); capture the written location as `{draft_attestation_path}`

### 3. Record Draft Attestation

- Record `{draft_attestation}` in that artifact once every block is marked understood and intentional; flag any block marked for revision
- Binding-fidelity pass: for each drafted activity step that persists a planning artifact, confirm `manage-artifacts::write-artifact` (or equivalent) is a bound `steps[]` entry — not protocol-only prose — and that every technique input marked required has a producer in the same activity (or an explicit step-binding). Flag gaps for revision before attestation closes.
