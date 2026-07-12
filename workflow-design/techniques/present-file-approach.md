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

## Protocol

### 1. Present File Approach

- Present the per-file drafting plan for `{current_file}`: the schema constructs to be used, the reference patterns to be followed, and the intended content structure
- Draft files in the confirmed order — `workflow.yaml`, activities, techniques, resources, README
