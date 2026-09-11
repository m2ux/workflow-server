---
metadata:
  version: 1.0.0
---

## Capability

Discover available status transitions for an issue.

## Inputs

### issueIdOrKey

Issue key.

## Outputs

### available_transitions

Status transitions available from the issue's current state, each with its `id`.

## Protocol

1. Call `getTransitionsForJiraIssue { cloudId, issueIdOrKey }`; return the listing as `{available_transitions}`.
