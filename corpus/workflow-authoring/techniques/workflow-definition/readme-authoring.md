---
metadata:
  version: 1.2.0
---

## Capability

Target workflow's root README, orienting a reader to its purpose, structure and links.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

## Outputs

### workflow_readme

The target workflow's root README: generated whole on a create run, revised in place on an update run so its activity table, modes, structure block and links match the manifest as landed.

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Generate or Revise the README

- Where `{operation_type}` is `create`, write `{workflow_readme}` whole
- Where `{operation_type}` is `update`, revise the existing README wherever `{manifest_entries}` changes what it claims — the activity table, the mode table, the file-structure block and the links
- Take the orientation stance from [11. Complete Documentation Structure](/canon/resources/design-principles.md#11-complete-documentation-structure): the README points at the authoritative definitions and does not transcribe them

## Rules

### every-claim-re-derivable

Every claim the README makes is re-derivable from the tree it ships in: no row for a construct the tree does not contain, and no count of anything. State the structure, never its size.
