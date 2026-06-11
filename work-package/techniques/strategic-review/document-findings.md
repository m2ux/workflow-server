---
metadata:
  version: 1.0.0
---

## Capability

Write the strategic review document, categorizing every finding from the review-scope pass by type — or recording a clean review result when all changes are justified.

## Inputs

### planning_folder_path

Folder where the strategic review document is written; inherited from the [strategic-review](./TECHNIQUE.md) group root.

## Outputs

### strategic_review_doc

The strategic review [document](../../resources/strategic-review.md#strategic-review-artifact-template), written under `{planning_folder_path}` as `strategic-review-{n}.md`, with every finding categorized by type (investigation artifacts, over-engineering, orphaned infrastructure) — or a clean review result when all changes are justified.

## Protocol

### 1. Document Findings

- Document all findings in the `{strategic_review_doc}`, written under `{planning_folder_path}`
- Categorize by type: investigation artifacts, over-engineering, orphaned infrastructure
- If all changes are justified and no cleanup is needed, document a clean review result
