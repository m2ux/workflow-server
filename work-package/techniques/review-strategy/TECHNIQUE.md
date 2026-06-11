---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 12
  legacy_id: 12
---

# Review Strategy

## Capability

Review implementation to ensure changes are minimal, focused, scope-disciplined, and free of investigation artifacts, produce review findings, maintain the changes-folder fragment, and commit the changes-folder fragment and strategic artifacts. This group decomposes the review into ordered operations: [review-scope](./review-scope.md), [changes-folder](./changes-folder.md), [verify-fragment](./verify-fragment.md), [document-findings](./document-findings.md), [recommend-cleanup](./recommend-cleanup.md), and [apply-cleanup](./apply-cleanup.md).

## Inputs

### branch_name

Feature branch under review (examined via `git diff` / `git log`)

### changed_files

List of files changed in the work package. Read for the orphan check; the activity supplies it (no explicit upstream step sets it).

### requirements

The work-package requirements, used as the scope baseline for the scope-discipline check

### planning_folder_path

Folder where the strategic review and architecture summary artifacts are written

### target_path

Target repository root — checked for a `changes/` folder and used as the commit scope

### pr_number

PR identifier, used to read the live PR body for conformance verification

## Outputs

### strategic_review_doc

Strategic review [findings](../../resources/strategic-review.md#strategic-review-artifact-template) and recommendations

#### strategic_review_artifact

`strategic-review-{n}.md`

### architecture_summary_doc

Architecture [summary](../../resources/architecture-summary.md#architecture-summary-artifact-template) with diagrams for stakeholders

#### architecture_summary_artifact

`architecture-summary.md`

## Rules

### minimal-focused-changes

The goal is minimal, focused changes — every change must be justified by a requirement.
