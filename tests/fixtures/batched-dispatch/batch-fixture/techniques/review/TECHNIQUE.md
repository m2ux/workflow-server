---
metadata:
  version: 1.0.0
---

## Capability

A second body of content, bound by more than one activity, so a later delivery has something to
collapse that the first delivery did not already collapse against itself.

## Outputs

### review_note

What the review step recorded.

## Protocol

### 1. Read Back

- Read what the stop before recorded and write a short note under `{review_note}` saying whether it
  still holds.
- This operation exists to be bound at two activities: a batch is read against how much of a second
  delivery the holding context already has, which needs content shared ACROSS activities rather than
  only within one.

## Rules

### read-before-writing

The note says what was read back, not what the step wished had been there.
