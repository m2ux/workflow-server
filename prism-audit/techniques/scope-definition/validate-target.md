---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Confirm the target is an analysable codebase and gather its structural metadata: verify the path exists and holds source files, detect project markers to identify the build system and primary language, and report the top-level structure and estimated size.

## Protocol

### 1. Validate Target

- Verify `{target_path}` exists and contains analysable source files.
- Check for project markers to confirm it is a codebase: `Cargo.toml` (Rust), `package.json` (JS/TS), `go.mod` (Go), `pyproject.toml` (Python), and equivalents.
- Identify the primary language and build system from the detected markers.
- Report the top-level directory structure.
- Estimate the codebase size (lines of code, excluding tests, docs, and generated files).
  > If `{target_path}` does not exist or contains no analysable source files, surface the path as invalid and request a corrected target before proceeding.

## Outputs

### target_metadata

Structural metadata for the validated target

#### primary_language

The codebase's primary language and build system, inferred from project markers

#### estimated_size

Estimated codebase size in lines of code

#### top_level_structure

The target's top-level directory layout
