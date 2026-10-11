---
metadata:
  version: 1.1.0
---

## Capability

Establishes that the target is a codebase an audit can analyse, and what kind of codebase it is.

## Outputs

### target_metadata

Structural metadata for the validated target

#### primary_language

The codebase's primary language and build system, inferred from project markers

#### estimated_size

Estimated codebase size in lines of code

#### top_level_structure

The target's top-level directory layout

## Protocol

### 1. Confirm the Target Is Analysable

- Verify `{target_path}` exists and holds source files, and check it for the project markers that mark a codebase: `Cargo.toml` (Rust), `package.json` (JS/TS), `go.mod` (Go), `pyproject.toml` (Python), and their equivalents.  
  > Where the path is absent or holds no source files, record it as an invalid target rather than a codebase whose metadata came back empty.

### 2. Gather the Structural Metadata

- Record `{target_metadata}`: `{target_metadata.primary_language}` from the markers found, `{target_metadata.top_level_structure}` from the directory layout, and `{target_metadata.estimated_size}` in lines of code, excluding tests, docs, and generated files.
