---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Classify every workflow by its trigger events, flagging `pull_request_target`, `issue_comment`, and `pull_request_review_comment` as high-priority.

## Protocol

### 1. Classify Triggers

- Parse each workflow's `on:` block and classify its trigger types with their configurations, flagging `pull_request_target`, `issue_comment`, and `pull_request_review_comment` as high-priority.  
  > If a workflow file contains invalid YAML and cannot be parsed, record the parse error and flag the file for manual review.
