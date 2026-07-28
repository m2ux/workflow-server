---
metadata:
  version: 1.0.0
---

## Capability

Current definition surface of one target and the base ref its change is measured against.

## Outputs

### base_ref

The git ref this run's change is measured against — the merge base between the branch under change and the workflows library's default branch.

### surface_files

Every definition file of the target as it stands on the branch under change: the root definition, the activity files, the technique files at every level, the resource files and the README.

### changed_files

The subset of `{surface_files}` that differs from `{base_ref}`. Empty when the branch has not yet touched this target, which is the ordinary case for a target under audit rather than under change.

## Protocol

### 1. Resolve the Base Ref

- Set `{base_ref}` to the merge base between the branch checked out at `{target_path}` and the workflows library's default branch

### 2. Enumerate the Definition Surface

- Enumerate the target's files under `{target_path}/{target_workflow_id}` as `{surface_files}`, at every technique level — standalone, group index and nested

### 3. Diff the Surface Against the Base Ref

- Set `{changed_files}` to the entries of `{surface_files}` that differ from their state at `{base_ref}`

## Rules

### one-target-per-binding

This operation resolves exactly the target `{target_workflow_id}` names. When that id is rebound across a set of targets, each binding produces the surface of its own target and nothing else — a surface carrying two targets' files cannot be attributed against a single base ref.
