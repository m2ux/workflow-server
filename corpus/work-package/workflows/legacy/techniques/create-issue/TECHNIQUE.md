---
metadata:
  version: 1.1.0
---

## Capability

Shared contract for raising a tracker issue: what the issue is about, what kind of change it records, and the identity the run carries forward once it exists.

## Inputs

### issue_type

The kind of change the issue records — one of feature, bug, task, enhancement or epic.

### component_name

Basename of the component the work package targets (e.g. midnight-node, midnight-ledger).

### issue_subject

*(optional)* The already-identified thing the issue is raised for, carrying what it is and why it matters. Absent when the issue is the work package's own, whose subject is the run's own context.

## Outputs

### issue_number

Issue number of the newly created issue (GitHub `#N` or Jira `KEY-N`).

### issue_url

URL of the newly created issue.

## Rules

### requirement-traceability

Every work package is linked to a GitHub or Jira issue for traceability.
