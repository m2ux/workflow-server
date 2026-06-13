---
metadata:
  version: 1.0.0
---

## Capability

Write the strategic review document, categorizing every finding from the review-scope pass by type — or recording a clean review result when all changes are justified.

## Outputs

### strategic_review_doc

The strategic review document, with every entry in `{review_findings}` categorized by type (investigation artifacts, over-engineering, orphaned infrastructure) — or a clean review result when all changes are justified.

## Protocol

### 1. Document Findings

- Write `{strategic_review_doc}` under `{planning_folder_path}`, recording every entry in `{review_findings}`.
- Categorize by type: investigation artifacts, over-engineering, orphaned infrastructure.
- When all changes are justified and no cleanup is needed, document a clean review result.
