---
metadata:
  version: 2.0.0
---

## Capability

Surveys the target codebase into the structural inventory an audit prompt is built from.

## Outputs

### build_system

The target's primary language and the build system it is assembled by.

### module_inventory

The target's modules, each `{ name, path, line_count, purpose, fan_in }`, in the layout the build configuration declares. `fan_in` carries a caller count where the codebase is indexed, and is absent otherwise.

### total_loc

Total lines of code across the surveyed modules, excluding tests, docs, and generated files.

## Protocol

### 1. Identify the Build System

- Resolve `{build_system}` by applying the target classification `prism::plan-analysis` defines, which is where the marker detection identifying a build system lives.  
  > For a workspace or monorepo, the build configuration also declares the member packages, which the next phase enumerates from it.

### 2. Inventory the Modules

- Record `{module_inventory}` from the layout the build configuration declares, with each module's line count excluding tests, docs and generated files, and `{total_loc}` as their sum. Note the test directories and the file patterns they follow.  
  > - Where the codebase is indexed, apply `gitnexus-operations::query` for functional areas, execution flows and community clusters, which bound modules better than directory layout alone, and `gitnexus-operations::context` on the high-risk ones for a caller count.
  > - Where `{target_path}` holds no analysable source files, report the path as unsurveyable and whether submodules appear uninitialised, rather than an empty inventory.
