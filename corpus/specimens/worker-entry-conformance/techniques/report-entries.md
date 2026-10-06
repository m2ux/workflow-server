---
metadata:
  version: 1.0.0
---

## Capability

Write the one document the run leaves behind: every entry the walk took, and whether the two
branches held identities of their own.

## Inputs

### cold_entry

The record Record Entry wrote.

### batch_entry

The record Carry Batch wrote.

### left_entry

The record Note Left wrote.

### right_entry

The record Note Right wrote.

### planning_folder_path

Absolute path of the session's planning folder, which the report is written into.

## Outputs

### report_path

Absolute path of the document this technique wrote.

## Protocol

### 1. Entry Roll

- Read the four records whole and lay them out as one row each: entry kind, activity,
  identity, instant.
  > Read the containers rather than naming a slot. Which record came from which branch is
  > carried by the container the branch filled.

### 2. Identity Comparison

- State whether `left_entry.agent_id` and `right_entry.agent_id` differ, and whether
  `cold_entry.agent_id` and `batch_entry.agent_id` match.
  > Two branches sharing an identity, or a continuation arriving under a fresh one, are each
  > a finding about the entry rather than about the activity that recorded it.

### 3. Written Report

- Write the roll and the comparison to `{planning_folder_path}/worker-entry-report.md`,
  following the [entry report](/worker-entry-conformance/resources/entry-report.md) shape,
  and return that path as `{report_path}`.

## Rules

### read-containers-whole

This technique names no slot of a fanned container. A fan's width is a run-time value, so an
authored index is a claim about a run rather than about the workflow.
