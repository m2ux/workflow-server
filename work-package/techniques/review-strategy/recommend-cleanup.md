---
metadata:
  version: 1.0.0
---

## Capability

In review mode, record the cleanup actions that *would* remove the identified investigation artifacts and over-engineering as recommendations in the strategic review document, without mutating the source — the reviewer decides whether to apply them.

## Inputs

### strategic_review_doc

The strategic review document holding the identified artifacts; read to enumerate them and extended with cleanup recommendations.

## Outputs

### strategic_review_doc

The same strategic review document, extended with a cleanup recommendation per identified artifact (investigation artifacts, over-engineering, orphaned infrastructure). Source is NOT mutated in review mode.

## Protocol

### 1. Recommend Cleanup

- For each identified artifact (investigation artifacts, over-engineering, orphaned infrastructure), record the specific cleanup action it warrants as a recommendation in the `{strategic_review_doc}`.
- Do NOT edit the source in review mode — the recommendations are for the reviewer to act on.
