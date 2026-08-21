---
metadata:
  version: 2.0.0
---

## Capability

Classify an evaluation target from its path, resolving the target type that governs which dimension set and survey approach apply.

## Outputs

### evaluation_target_type

The target's kind, one of four values. A single file is `document`. A directory carrying a project marker (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`) is `codebase`. A directory of documents without one is `document-set`. A directory holding both source and substantive documentation is `mixed`.

## Protocol

### 1. Classify the Target

- Resolve `{evaluation_target_type}` from `{target_path}` against the four kinds the Output defines.  
  > When `{target_path}` resolves to nothing on the filesystem, report the path as unreadable rather than classifying it.
