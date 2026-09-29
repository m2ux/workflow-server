---
metadata:
  version: 1.4.0
---

## Capability

Block-indexed draft review of workflow files with per-construct rationale and draft attestation.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{scope_manifest}` written under `{target_path}/{workflow_id}/`.

### operation_type

The classified technique — `create` or `update`.

## Outputs

### reviewed_blocks

The block-indexed review table following the [Draft Attestation Guide](../resources/draft-attestation.md#template), closed by the template's attestation line recording that every drafted block is understood and intentional.

#### artifact

`draft-attestation.md`

#### audience

`human`

## Protocol

### 1. Index Blocks

- Build `{reviewed_blocks}` from `{drafted_files}` following the [Draft Attestation Guide](../resources/draft-attestation.md#template)
- When `{operation_type}` is `update`, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`; when `create`, mark every block new

### 2. Record Draft Attestation

- Close `{reviewed_blocks}` with the template's attestation line once every block is marked understood and intentional; flag any block marked for revision
- Binding-fidelity pass: for each drafted activity step that persists a planning artifact, confirm `manage-artifacts::write-artifact` (or equivalent) is a bound `steps[]` entry — not protocol-only prose — and that every technique input marked required has a producer in the same activity (or an explicit step-binding). Flag gaps for revision before attestation closes.
