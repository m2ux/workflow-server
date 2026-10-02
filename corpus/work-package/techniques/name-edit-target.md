---
metadata:
  version: 1.0.0
---

## Capability

Name the primary symbol a task changes.

## Inputs

### current_task

A single atomic task — its goal, deliverables, dependencies, and Contract (Signatures, Behaviours, Error cases, Acceptance)

## Outputs

### target_symbol

The function, class, or method this task changes.

## Protocol

- Read the `{current_task}` Contract — Signatures, Behaviours, Error cases and Acceptance — then its goal, deliverables and dependencies
- Emit `{target_symbol}`
