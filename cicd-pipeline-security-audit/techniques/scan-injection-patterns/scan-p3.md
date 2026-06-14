---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Apply P3 comment trigger abuse detection: flag `issue_comment` and `pull_request_review_comment` workflows that execute privileged operations without author-association filtering.

## Protocol

### 1. P3 Comment Trigger

- Identify workflows triggered by `issue_comment` or `pull_request_review_comment`
- Check for `author_association` filtering (MEMBER, OWNER, COLLABORATOR)
- Flag workflows that execute privileged operations on any commenter's trigger
