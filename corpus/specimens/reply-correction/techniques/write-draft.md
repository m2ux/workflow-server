---
metadata:
  version: 1.0.0
---

## Capability

Write a one-line draft, applying the reader's correction where one is given.

## Inputs

### draft_correction

*(optional)* Text the reader typed correcting the draft. Unset on the first draft.

## Outputs

### draft_text

The one-line draft.

## Protocol

### 1. Write

- Set `{draft_text}` to the sentence "The draft is written."
  > When `{draft_correction}` is bound, `{draft_text}` is that correction as the reader typed it.
