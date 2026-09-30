---
metadata:
  version: 1.0.0
---

## Capability

The strategic review's findings set aside beyond this work package at the review checkpoint, as out-of-scope deferrals.

## Inputs

### deferred_items

The deferrals the review emitted before the checkpoint. Empty where it emitted none.

## Outputs

### deferred_items

The deferrals the review emitted, plus every finding the checkpoint deferred, each carrying what was set aside, the finding's designator as where, and why it falls outside this package.

## Protocol

### 1. Defer Findings

- Add every finding in `{strategic_review_doc}` to `{deferred_items}`, deferred at its designator, and emit the list.
  > A finding `{deferred_items}` already holds is kept once.
