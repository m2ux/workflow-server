---
metadata:
  version: 1.0.0
---

## Capability

Move an issue to a new status.

## Inputs

### issueIdOrKey

Issue key.

### status_transition

Transition object with an `id` identifying a status transition available for the current issue state

## Protocol

1. Call `transitionJiraIssue { cloudId, issueIdOrKey, transition: status_transition }`.

   `{status_transition}` carries an id drawn from this issue's own transitions lookup, which `atlassian-operations.transitions-are-dynamic` requires of every caller — transition ids are issue-specific, so an id sourced any other way is valid for at most one issue state.
