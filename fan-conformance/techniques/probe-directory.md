---
metadata:
  version: 1.0.0
---

## Capability

Describe the one directory this instance was handed, from listings alone.

## Inputs

### probe_target

This instance's own probe: its designator at `id`, the directory it covers at `directory`, and why it was picked at `reason`.

## Outputs

### probe_finding

What this probe found, and when it ran.

#### probe_id

The designator this instance was handed, copied from `{probe_target.id}`. The report reads the container back by it, so a slot naming a different probe than the one it was handed is the finding.

#### started_at

The instant this instance began, ISO 8601 UTC.

#### finished_at

The instant this instance finished, ISO 8601 UTC.

#### file_count

Files directly under the probed directory, and the total including its subdirectories.

#### subdirectories

Immediate subdirectory names, alphabetically.

#### largest_file

The largest file under the probed directory, with its path and size in bytes.

## Protocol

### 1. Record The Start And The Identity

- Read the current instant and record it as `{probe_finding.started_at}` before doing any work.
- Copy `{probe_target.id}` into `{probe_finding.probe_id}`. Report the designator handed to this instance, not one derived from the directory: the point of recording it is that the two can be compared.

### 2. Probe The Directory

- List `{probe_target.directory}` and record the direct and total file counts as `{probe_finding.file_count}`, the immediate subdirectory names as `{probe_finding.subdirectories}`, and the largest file with its size as `{probe_finding.largest_file}`.
- Stay inside `{probe_target.directory}`. Nothing outside it belongs in this instance's finding, and a sibling instance is already covering its own.

### 3. Record The Finish

- Read the current instant and record it as `{probe_finding.finished_at}`.
