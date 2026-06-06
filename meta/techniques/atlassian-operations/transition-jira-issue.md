---
metadata:
  version: 1.0.0
---

## Capability

Move an issue to a new status.

## Inputs

### issueIdOrKey

Issue key

### transition

Transition object with an `id` identifying a status transition available for the current issue state

## Protocol

1. Call `transitionJiraIssue { cloudId, issueIdOrKey, transition }`.
   - If the {transition} id is not available for the current issue state, apply [list-jira-transitions](./list-jira-transitions.md) to get the available transitions and retry with one of those ids.
