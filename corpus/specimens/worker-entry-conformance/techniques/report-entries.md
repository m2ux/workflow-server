---
metadata:
  version: 1.1.0
---

## Capability

Write the one document the run leaves behind: every entry the walk took, and whether the two
branches held identities of their own.

## Inputs

### cold_entry

The record Record Entry wrote.

### batch_entry

The record Carry Batch wrote.

### note_left_outputs

The container Note Left filled, one slot per branch the destination named it for.

### note_right_outputs

The container Note Right filled.

### planning_folder_path

Absolute path of the session's planning folder, which the report is written into.

## Outputs

### report_path

Absolute path of the document this technique wrote.

## Protocol

### 1. Entry Roll

- Read the two records and the two containers whole, and lay out one row each: entry kind,
  activity, identity, instant.
  > Read a container rather than naming a slot. Which record came from which branch is carried
  > by the container that branch filled.

### 2. Identity Comparison

- State whether the two branch containers carry distinct `agent_id` values, and whether the
  identity on `{cold_entry}` and the identity on `{batch_entry}` match.
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
