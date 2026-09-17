---
metadata:
  version: 1.0.0
---

## Capability

Count what one directory holds, and name the next directory under it to measure.

## Inputs

### probe_target

Directory to measure, relative to `{component_path}`.

## Outputs

### probe_result

What this pass measured, and where it sends the run next.

#### entry_count

How many entries `{probe_target}` holds directly — files and directories, excluding anything git ignores.

#### next_target

The first subdirectory of `{probe_target}` in name order, relative to `{component_path}`, and null where it holds none.

## Protocol

### 1. Count The Entries

- List what git tracks directly under `{probe_target}` and record the count as `{probe_result.entry_count}`. A directory git tracks nothing under counts zero.

### 2. Name What Follows

- Take the subdirectories of `{probe_target}` in name order and record the first as `{probe_result.next_target}`, null where there are none. One subdirectory per pass is what keeps the walk to the iteration bound the run declares.
