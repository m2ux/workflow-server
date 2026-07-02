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

- Apply the target classification defined in prism's [plan-analysis](../../../prism/techniques/plan-analysis.md) technique to `{target_path}` — the build-marker detection (`Cargo.toml`, `package.json`, `go.mod`, `pyproject.toml`) that distinguishes a `codebase` from a `document-set` lives there and is not restated here, so the two workflows classify targets identically.
- Resolve `{target_type}` to `document` (a single file), `document-set` (a directory of documents without build infrastructure), `codebase` (source with build files), or `mixed` (both code and substantive documentation) — the type that governs which evaluation dimension set and survey approach apply.
