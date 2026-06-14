---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
---

## Capability

Write a workflow audit report to disk as a dated markdown file in the designated folder.

## Outputs

### report_path

Path to the written report file

#### compliance_report_artifact

Filename of a compliance review report, dated and keyed to the workflow id

#### post_update_review_artifact

Filename of a post-update review snapshot, keyed to the target workflow id

## Protocol

### 1. Persist Report

- Using today's date `{$date}`, construct the report filename: for a compliance report, bind `{$compliance_report_artifact}` as `{$date}-{workflow_id}-compliance-review.md` in the planning folder; for a post-update review snapshot, bind `{$post_update_review_artifact}` as `{target_workflow_id}-post-update-review.md` in `.engineering/artifacts/reviews/`
- Write the report to its destination folder as a dated markdown file, naming it `{$compliance_report_artifact}` or `{$post_update_review_artifact}` per mode, capturing `{$report_path}`
