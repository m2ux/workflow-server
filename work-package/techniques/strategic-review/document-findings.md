---
metadata:
  version: 1.2.0
---

## Capability

Write the strategic review document, categorizing every finding from the review-scope pass by type — or recording a clean review result when all changes are justified.

## Inputs

### planning_folder_path

Folder where the strategic review document is written.

## Outputs

### strategic_review_doc

The strategic review [document](../../resources/strategic-review.md#strategic-review-artifact-template), written under `{planning_folder_path}` as `strategic-review-{n}.md` (the activity's `artifactPrefix` is prepended at write time; n increments on successive reviews), with every finding categorized by type (investigation artifacts, over-engineering, orphaned infrastructure) — or a clean review result when all changes are justified.

#### artifact

`strategic-review-{n}.md`

## Protocol

### 1. Document Findings

- Document all findings in the `{strategic_review_doc}`, written under `{planning_folder_path}`
- Categorize each finding per the group's [finding-categories](./TECHNIQUE.md#finding-categories), assigning each a stable ID (SR-1, SR-2 …) that downstream surfaces reference
- Report exceptions only: a clean review result is one line ("all changes justified — no findings"), never a per-section template fill; findings from other reviews are referenced by ID
- Record any deferred finding as a deferred-items register row ([deferred-items](../../resources/deferred-items.md)) linked from the finding
