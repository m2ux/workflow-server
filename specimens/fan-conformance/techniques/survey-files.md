---
metadata:
  version: 1.0.0
---

## Capability

Count the component's files by extension and name its largest directories, from listings alone.

## Outputs

### file_survey

What this branch saw of the component's shape, and when it ran.

#### started_at

The instant this branch began, ISO 8601 UTC.

#### finished_at

The instant this branch finished, ISO 8601 UTC.

#### extension_counts

File count per extension, largest first, for the ten most common extensions.

#### largest_directories

The ten directories holding the most files, each with its path and its file count, largest first.

#### total_files

Total files under `{component_path}`, excluding anything git ignores.

## Protocol

### 1. Record The Start

- Read the current instant and record it as `{file_survey.started_at}` before doing any work.

### 2. Count By Extension

- List the files git tracks under `{component_path}` and count them by extension. Record the ten most common as `{file_survey.extension_counts}` and the total as `{file_survey.total_files}`.

### 3. Rank The Directories

- Group the same listing by containing directory and record the ten holding the most files as `{file_survey.largest_directories}`, each with its path and count.

### 4. Record The Finish

- Read the current instant and record it as `{file_survey.finished_at}`. Report nothing about any other branch: this branch cannot see one.
