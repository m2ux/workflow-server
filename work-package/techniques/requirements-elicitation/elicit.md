---
metadata:
  version: 1.0.0
---

## Capability

Drive structured elicitation across the question domains, then surface the resulting assumptions to stakeholders for review before the requirements document is finalized.

## Inputs

### question_domains

The question domains to iterate one question at a time (per the [requirements-elicitation](../../resources/requirements-elicitation.md) resource).

### issue_platform

Platform where the issue lives (github or jira) — gates whether assumptions are posted to Jira (inherited from the [requirements-elicitation](./TECHNIQUE.md) group root).

### issue_number

Issue identifier for the assumptions comment (GitHub #N or Jira KEY-N) — the ticket posted to via `addCommentToJiraIssue` (inherited from the [requirements-elicitation](./TECHNIQUE.md) group root).

## Outputs

### requirements

The captured requirements list elicited across the domains (inherited from the [requirements-elicitation](./TECHNIQUE.md) group root).

### success_criteria

The defined success criteria with verification methods (inherited from the [requirements-elicitation](./TECHNIQUE.md) group root).

### scope_boundaries

In/out scope definitions captured during elicitation (inherited from the [requirements-elicitation](./TECHNIQUE.md) group root).

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

- Prepare assumptions as Jira comment for stakeholder review
- Post to the ticket identified by `{issue_number}` using `addCommentToJiraIssue` (only when `{issue_platform}` is jira)

### 3. Await Feedback

- Await stakeholder response on Jira comment
- Incorporate feedback into requirements document
