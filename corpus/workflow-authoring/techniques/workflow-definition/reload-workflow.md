---
metadata:
  version: 1.1.0
---

## Capability

Current definition surface of one target, the base ref its change is measured against, and the change surface as whole touched files closed under I/O-contract referencers.

## Outputs

### base_ref

The git ref this run's change is measured against — the merge base between the branch under change and the workflows library's default branch.

### surface_files

Every definition file of the target as it stands on the branch under change: the root definition, the activity files, the technique files at every level, the resource files and the README.

### touched_files

Every path under the target that differs from `{base_ref}`, each entry a **whole file**. Diff hunks only discover membership. Empty when the branch has not yet touched this target.

### changed_files

The **change surface**: the union of `{touched_files}` and every activity or technique (in this target or another workflow under `{target_path}`) that references a touched file whose **I/O contract** changed. Each entry is a whole file. I/O contract means technique `## Inputs` / `## Outputs` (including nested component and artifact declarations), and activity-declared inputs/outputs plus step binds that name technique input or output ids — including renames, additions, removals, and optionality flips. Empty when nothing was touched and nothing was pulled in by contract closure.

## Protocol

### 1. Resolve the Base Ref

- Set `{base_ref}` to the merge base between the branch checked out at `{target_path}` and the workflows library's default branch

### 2. Enumerate the Definition Surface

- Enumerate the target's files under `{target_path}/{target_workflow_id}` as `{surface_files}`, at every technique level — standalone, group index and nested

### 3. Diff Touched Paths Against the Base Ref

- Set `{touched_files}` to the entries of `{surface_files}` whose bytes differ from their state at `{base_ref}` — whole paths only, never hunk ranges

### 4. Close Under I/O-Contract Referencers

- For each path in `{touched_files}`, compare its I/O contract at `{base_ref}` to the working tree. When Inputs, Outputs, or activity bind-facing ids differ, record that path as a **contract-changed** file
- Sweep every workflow directory under `{target_path}` for references that resolve to a contract-changed file: activity `techniques[]` and step `technique` / `technique.name` binds, technique Protocol Apply / `::` / markdown links to the op, and resource or README cites that resolve to the op file
- Set `{changed_files}` to the union of `{touched_files}` and every resolved referencer file (whole file), including referencers outside `{target_workflow_id}`
- A path that joins only via contract closure is still a full member of `{changed_files}`; Detect later walks the entire file

## Rules

### one-target-per-binding

This operation resolves exactly the target `{target_workflow_id}` names for `{surface_files}` and `{touched_files}`. Contract-closure may add referencers from other workflow ids under `{target_path}` into `{changed_files}`; those paths stay attributed against the same `{base_ref}`.

### whole-file-change-surface

`{changed_files}` never carries hunk ranges or "lines modified" scopes. Membership is path-level; audit walks the full file contents of every member.
