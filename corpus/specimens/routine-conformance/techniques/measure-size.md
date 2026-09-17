---
metadata:
  version: 1.0.0
---

## Capability

Measure how much one directory holds, and name the next directory under it to measure.

## Inputs

### probe_target

Directory to measure, relative to `{component_path}`.

## Outputs

### probe_result

What this pass measured, and where it sends the run next.

#### entry_count

How many entries `{probe_target}` holds directly — files and directories, excluding anything git ignores.

#### byte_total

Total size in bytes of the files `{probe_target}` holds directly, excluding its subdirectories.

#### next_target

The first subdirectory of `{probe_target}` in name order, relative to `{component_path}`, and null where it holds none.

## Protocol

### 1. Measure The Directory

- List what git tracks directly under `{probe_target}`; record the count as `{probe_result.entry_count}` and the summed size of the files among them as `{probe_result.byte_total}`, from the listing's own size field.

### 2. Name What Follows

- Take the subdirectories of `{probe_target}` in name order and record the first as `{probe_result.next_target}`, null where there are none. The same rule the counting measurement follows, so the two passes walk the same targets and the report compares like with like.
