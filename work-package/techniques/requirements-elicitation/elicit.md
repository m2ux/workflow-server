---
metadata:
  version: 1.0.0
---

## Capability

Structured requirements elicitation across question domains, with stakeholder review of resulting assumptions.

## Inputs

### question_domains

The question domains to iterate one question at a time (per the [requirements-elicitation](../../resources/requirements-elicitation.md) resource).

### issue_platform

Issue host platform: `github` or `jira`.

### issue_number

Issue identifier on `{issue_platform}` (GitHub `#N` or Jira `KEY-N`).

## Outputs

### requirements

The captured requirements list elicited across the domains.

### success_criteria

The defined success criteria with verification methods.

### scope_boundaries

In/out scope definitions captured during elicitation.

### elicitation_log

Record of the questions asked and the responses given across the domain iteration.


## Protocol

### 1. Iterate Domains

- Use attached [requirements-elicitation](../../resources/requirements-elicitation.md) for question domains
- Iterate through domains one question at a time
- Record responses and adapt follow-up based on answers
- Skip irrelevant follow-ups; probe deeper when needed
- Skip option always available — user can say 'skip' to move to next question

### 2. Post Assumptions Jira

- When `{issue_platform}` is `jira`, prepare assumptions as a Jira comment for stakeholder review and post to the ticket identified by `{issue_number}` using `addCommentToJiraIssue`
- When `{issue_platform}` is `github`, skip the Jira assumptions post

### 3. Await Feedback

- Await stakeholder response on the posted assumptions comment when one was posted
- Incorporate feedback into the requirements document
