---
metadata:
  version: 1.0.0
---

## Capability

Summarise the component's recent commits and the directories they touched, from commit metadata alone.

## Outputs

### history_survey

What this branch saw of the component's recent movement, and when it ran.

#### started_at

The instant this branch began, ISO 8601 UTC.

#### finished_at

The instant this branch finished, ISO 8601 UTC.

#### commit_count

How many commits the window holds.

#### authors

Distinct commit authors in the window, each with a commit count.

#### active_directories

The ten directories the window's commits touched most, each with its path and the number of commits touching it, most active first.

## Protocol

### 1. Record The Start

- Read the current instant and record it as `{history_survey.started_at}` before doing any work.

### 2. Read The Window

- Read the last fifty commits under `{component_path}` and record how many exist as `{history_survey.commit_count}`; a shallow or young checkout may hold fewer, which is a fact to record rather than an error.
- Record the distinct authors and their commit counts as `{history_survey.authors}`.

### 3. Rank The Movement

- From the same window's changed paths, record the ten most-touched directories as `{history_survey.active_directories}`, each with its path and the number of commits touching it.

### 4. Record The Finish

- Read the current instant and record it as `{history_survey.finished_at}`. Report nothing about any other branch: this branch cannot see one.
