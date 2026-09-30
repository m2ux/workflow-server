---
metadata:
  version: 1.0.0
---

## Capability

Every finding in the strategic review document, as an out-of-scope deferral.

## Inputs

### strategic_review_doc

The strategic review document holding the findings.

### deferred_items

The deferrals the review already emitted. Empty where it emitted none.

## Outputs

### deferred_items

The deferrals the review emitted, plus every finding in `{strategic_review_doc}`, each carrying what was set aside, the finding's designator as where, and its Recommendation as why.

## Protocol

### 1. Defer Findings

- Add every finding in `{strategic_review_doc}` to `{deferred_items}`, deferred at its designator, and emit the list.
  > A finding `{deferred_items}` already holds is kept once.
