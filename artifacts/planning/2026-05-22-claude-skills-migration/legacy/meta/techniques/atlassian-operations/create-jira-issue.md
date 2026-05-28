# create-jira-issue

Create a new Jira issue.

## Inputs

### cloudId

From [resolve-cloud-id](resolve-cloud-id.md)

### projectKey

Project key

### issueTypeName

Issue type name from [list-jira-issue-types](list-jira-issue-types.md)

### summary

Issue summary

### additional_fields

Optional object with description, assignee, labels, etc.

## Output

### issueKey

Created issue key (e.g., `ENG-123`)

## Procedure

1. Call `createJiraIssue({ cloudId, projectKey, issueTypeName, summary, description?, additional_fields? })`.

## Errors

### invalid_issue_type

**Cause:** create-jira-issue called with a non-existent `issueTypeName`.

**Recovery:** Apply [list-jira-issue-types](list-jira-issue-types.md) to discover valid types, then retry.
