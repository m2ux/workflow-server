---
metadata:
  version: 2.0.0
---

## Capability

Discover and clarify requirements through structured sequential conversation.

## Inputs

### stakeholder_transcript

*(optional)* Transcript or summary from user's discussion with key stakeholders

### issue_platform

Platform where issue lives (github or jira) — determines if assumptions go to Jira

### issue_number

Issue identifier for linking assumptions comment (GitHub #N or Jira KEY-N)

## Outputs

### requirements_document

Elicited [requirements](../../resources/requirements-elicitation.md#document-template) with success criteria and scope

#### requirements_artifact

`requirements-elicitation.md`

#### requirements

Captured requirements list

#### success_criteria

Defined success criteria with verification methods

#### scope_boundaries

In/out scope definitions

## Rules

### conversation-not-interrogation

Core principle: Conversation, not interrogation — discover what user actually needs
