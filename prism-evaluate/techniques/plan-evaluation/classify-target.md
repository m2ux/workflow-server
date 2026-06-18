---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Classify an evaluation target by examining its path, confirming it holds analysable content and resolving the target type that governs which dimension set and survey approach apply.

## Outputs

### target_type

Classification of the target: `document`, `document-set`, `codebase`, or `mixed`.

## Protocol

- Examine `{target_path}` to determine `{target_type}` from these cases:
  - `document` — `{target_path}` is a single file (markdown, PDF, text).
  - `document-set` — `{target_path}` is a directory of documents without build infrastructure.
  - `codebase` — `{target_path}` is a directory of source code with build files (`Cargo.toml`, `package.json`, `go.mod`, `pyproject.toml`).
  - `mixed` — `{target_path}` contains both code and substantive documentation.
