---
metadata:
  version: 1.0.0
---

## Capability

Every finding in the strategic review document, as an out-of-scope deferral.

## Inputs

### strategic_review_doc

The strategic review document holding the findings.

### deferral_reason

Why the findings are set aside beyond this work package.

### deferred_items

Deferrals already set aside. Empty where there are none.

## Outputs

### deferred_items

The deferrals already set aside, plus every finding in `{strategic_review_doc}` whose Recommendation is not keep, each carrying what was set aside, the finding's designator as where, and `{deferral_reason}` as why.

## Protocol

### 1. Defer Findings

- Add every finding in `{strategic_review_doc}` whose Recommendation is not keep to `{deferred_items}`, deferred at its designator for `{deferral_reason}`, and emit the list.
  > A finding `{deferred_items}` already holds is kept once.
