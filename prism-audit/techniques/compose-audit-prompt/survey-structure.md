---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Survey the target codebase to produce a structural inventory: primary language and build system, module/crate/package layout, total and per-module size, dependency graph, and test coverage structure, optionally enriched with GitNexus functional areas and fan-in.

## Protocol

### 1. Survey Structure

- List files and directories at the top level of `{target_path}`
- Identify the build system: `Cargo.toml` (Rust), `package.json` (JS/TS), `go.mod` (Go), `pyproject.toml` (Python), etc.
- For workspace/monorepo projects, enumerate all packages/crates/modules from the build configuration
- Count lines of code per module (excluding tests, docs, generated files)
- Identify test directories and test file patterns
- If GitNexus is available (check via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../../meta/techniques/gitnexus-operations/verify-index.md)): use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md) to discover functional areas, execution flows, and community clusters — these produce better module boundaries and dependency maps than directory layout alone
- If GitNexus is available: use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) on high-risk modules to check fan-in (number of callers) — high fan-in modules have larger blast radius and should be elevated in risk classification
- Record: language, `build_system`, modules (array of `{ name, path, line_count, purpose, fan_in (if GitNexus available) }`), `{total_loc}`, `{gitnexus_available}` (boolean)
- If `{target_path}` contains no analysable source files, verify the path is correct and check whether submodules need initialisation before proceeding.

## Outputs

### total_loc

Total lines of code across the surveyed modules, excluding tests, docs, and generated files
