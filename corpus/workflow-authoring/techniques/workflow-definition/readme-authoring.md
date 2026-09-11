---
metadata:
  version: 1.1.0
---

## Capability

Target workflow's root README, orienting a reader to its purpose, structure and links.

## Inputs

### operation_type

The classified operation for the request — create, update or review.

### scope_manifest

The complete file manifest for this run, whose entries are the structure the README orients a reader to.

## Outputs

### workflow_readme

The target workflow's root README: generated whole on a create run, revised in place on an update run so its activity table, modes, structure block and links match the manifest as landed.

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Generate or Revise the README

- On a create run, write `{workflow_readme}` whole
- On an update run, revise the existing README wherever `{scope_manifest}` changes what it claims — the activity table, the mode table, the file-structure block and the links
- Take the orientation stance from [11. Complete Documentation Structure](../../../workflow-design/resources/design-principles.md#11-complete-documentation-structure): the README points at the authoritative definitions and does not transcribe them

## Rules

### every-claim-re-derivable

Every claim the README makes is re-derivable from the tree it ships in. A row for a construct the tree does not contain, or a count of anything, is a claim that goes stale the moment the tree moves — state the structure, never its size.
