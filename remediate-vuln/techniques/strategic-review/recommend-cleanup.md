---
metadata:
  version: 1.0.0
---

## Capability

Record the cleanup actions that would remove the identified investigation artifacts and over-engineering as recommendations in the strategic review document, without mutating the source.

## Outputs

### strategic_review_doc

The strategic review document, extended with a cleanup recommendation per identified artifact (investigation artifacts, over-engineering, orphaned infrastructure). The source is not mutated.

## Protocol

### 1. Recommend Cleanup

- For each identified artifact (investigation artifacts, over-engineering, orphaned infrastructure), record the specific cleanup action it warrants as a recommendation in `{strategic_review_doc}`.
- Do not edit the source.
