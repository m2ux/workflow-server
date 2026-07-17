---
metadata:
  version: 1.0.0
---

## Capability

Present the per-file drafting approach before a file is written: the schema constructs to be used, the reference patterns to be followed, and the intended content structure. The drafting and per-file schema validation themselves are performed via [yaml-authoring](yaml-authoring.md).

## Inputs

### current_file

The scope-manifest entry being drafted this iteration — its path, action (create/modify/remove), type, and one-line description.

### is_update_mode

Whether update mode is active. In update mode the approach frames the change against the file's existing content rather than a from-scratch draft.

## Outputs

### drafting_plan

The per-file drafting plan for `{current_file}`: schema constructs to use (from [schema-construct-inventory](../resources/schema-construct-inventory.md)), reference patterns to follow, and intended content structure. Presented for confirmation before drafting.

## Protocol

### 1. Assemble Drafting Plan

- Assemble `{drafting_plan}` for `{current_file}`: the schema constructs to be used, the reference patterns to be followed, and the intended content structure

### 2. Present Drafting Plan

- Present `{drafting_plan}` for confirmation before drafting proceeds
