---
metadata:
  version: 2.0.0
---

## Capability

Classify an evaluation target from its path, resolving the target type that governs which dimension set and survey approach apply.

## Outputs

### evaluation_target_type

The target's kind: `document` for a single file, `document-set` for a directory of documents without build infrastructure, `codebase` for source with build files, or `mixed` for both code and substantive documentation.

## Protocol

### 1. Classify the Target

- Apply the target classification `prism::plan-analysis` defines to `{target_path}`, which is where the build-marker detection separating a `codebase` from a `document-set` lives, so both workflows classify a target the same way.
- Resolve `{evaluation_target_type}` to the kind that classification yields.  
  > When `{target_path}` resolves to nothing on the filesystem, report the path as unreadable rather than classifying it.
