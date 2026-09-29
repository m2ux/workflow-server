---
metadata:
  version: 1.4.0
---

## Capability

Block-indexed draft review of workflow files with per-construct rationale and draft attestation.

## Inputs

### drafted_files

The set of files just drafted for this workflow — the entries of `{manifest_entries}` written under `{target_path}/{workflow_id}/`.

## Outputs

### reviewed_blocks

The block-indexed review table, at the shape [Template](../resources/draft-attestation.md#template) declares, closed by the template's attestation line recording that every drafted block is understood and intentional.

#### artifact

`draft-attestation.md`

#### audience

`human`

## Protocol

### 1. Index Blocks

- Build `{reviewed_blocks}` from `{drafted_files}` at the shape [Template](../resources/draft-attestation.md#template) declares
- When `{operation_type}` is `update`, mark each block added / modified / unchanged by comparing against the committed `{target_workflow_id}`; when `create`, mark every block new

### 2. Check Binding Fidelity

- For each drafted activity step that persists a planning artifact, confirm `manage-artifacts::write-artifact` (or equivalent) is a bound `steps[]` entry — not protocol-only prose — and that every technique input marked required has a producer in the same activity (or an explicit step-binding). Flag each gap for revision.

### 3. Record Draft Attestation

- Close `{reviewed_blocks}` with the template's attestation line once every block is marked understood and intentional; flag any block marked for revision
