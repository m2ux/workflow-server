---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Discover and clarify requirements through structured sequential conversation

## Inputs

### stakeholder-transcript

*(optional)* Transcript or summary from user's discussion with key stakeholders

### issue-platform

Platform where issue lives (github or jira) — determines if assumptions go to Jira

### issue-number

Issue identifier for linking assumptions comment (GitHub #N or Jira KEY-N)

## Protocol

### 1. Prompt Transcript

- Prompt user for stakeholder discussion transcript before elicitation
- Offer skip option with note about limitation
- Stakeholder input first: User should discuss with key stakeholders before agent elicitation

### 2. Iterate Domains

- Use attached [requirements-elicitation](../resources/requirements-elicitation.md) for question domains
- Iterate through domains one question at a time
- Record responses and adapt follow-up based on answers
- Skip irrelevant follow-ups; probe deeper when needed
- Skip option always available — user can say 'skip' to move to next question

### 3. Collect Assumptions

- Identify assumptions from requirement interpretation
- Categorize by Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria

### 4. Post Assumptions Jira

- Prepare assumptions as Jira comment for stakeholder review
- Post to ticket using addCommentToJiraIssue (only when issue_platform is jira)

### 5. Await Feedback

- Await stakeholder response on Jira comment
- Incorporate feedback into requirements document

### 6. Create Document

- Create the requirements-document artifact in planning folder
- Include elicited requirements, success criteria, scope boundaries, and assumptions

## Outputs

### requirements-document

Elicited [requirements](../resources/requirements-elicitation.md#document-template) with success criteria and scope

- **artifact**: `requirements-elicitation.md`
- **requirements**: Captured requirements list
- **success_criteria**: Defined success criteria with verification methods
- **scope_boundaries**: In/out scope definitions
- **assumptions**: Documented assumptions from elicitation

## Rules

### conversation-not-interrogation

Core principle: Conversation, not interrogation — discover what user actually needs

## Errors

### no_stakeholder_input

**Cause:** User skipped stakeholder discussion

**Recovery:** Note limitation and proceed with agent-led elicitation
