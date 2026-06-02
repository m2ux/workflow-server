Move an issue to a new status.

## Inputs

### cloudId

UUID of the target Atlassian cloud site.

### issueIdOrKey

Issue key

### transition

Transition object with an `id` identifying a status transition available for the current issue state

## Protocol

1. Call `transitionJiraIssue { cloudId, issueIdOrKey, transition }`.

## Errors

### transition_not_available

**Cause:** transition-jira-issue called with a transition id that is not available for the current issue state.

**Recovery:** Apply [list-jira-transitions](./list-jira-transitions.md) to get the available transitions and retry with one of those ids.
