---
name: create-issue
description: Atomic issue creation and verification on GitHub or Jira.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 3
  legacy_id: 3
---

# Create Issue

## Capability

Create a GitHub or Jira issue with appropriate type, labels, and metadata

## Inputs

### issue-platform

Selected platform for issue creation (github or jira). Set by platform-selection checkpoint.

### issue-type

Type of issue (feature, bug, task, enhancement, epic). Set by issue-type-selection checkpoint.

### target-submodule

Target submodule for the work package (e.g., midnight-node, midnight-ledger)

## Protocol

### 1. Verify Existing Issue

- Runs when user provides an existing issue key. Detect the platform from key format: '#N' or bare number → GitHub, 'PROJ-N' → Jira. Set issue_platform.
- For GitHub: run 'gh issue view <number>' to confirm the issue exists. Capture issue_number and issue_url.
- For Jira: call getAccessibleAtlassianResources FIRST to obtain cloudId, preserve as jira_cloud_id. THEN call getJiraIssue with cloudId and the issue key. Do NOT call getJiraIssue before cloudId is resolved.
- Capture issue_number and issue_url from the verification result. Set needs_issue_creation to false.

### 2. Create Github Issue

- Runs when issue_platform is github and needs_issue_creation is true. Use attached [github-issue-creation](legacy/work-package/resources/github-issue-creation/SKILL.md) for guidance.
- Gather title, description, and acceptance criteria from user context
- Map issue_type to GitHub labels per github-label-mapping rule
- Create the issue, then verify creation succeeded. Capture issue_number and issue_url.
- GitHub label mapping: feature->enhancement, bug->bug, task->chore, enhancement->enhancement

### 3. Create Jira Issue

- Runs when issue_platform is jira and needs_issue_creation is true. Use attached [jira-issue-creation](legacy/work-package/resources/jira-issue-creation/SKILL.md) for guidance.
- Obtain Atlassian cloud ID via getAccessibleAtlassianResources and preserve as jira_cloud_id. This MUST be the first Jira tool call.
- List available projects via getVisibleJiraProjects, then present the jira-project-selection checkpoint (defined on the activity) for user selection. Resolve available issue types for the selected project.
- Gather summary, description, and acceptance criteria. Resolve assignee account ID if specified.
- Create the issue with mapped type per jira-type-mapping rule. Capture issue_number and issue_url.
- Jira issue type mapping: feature->Story, bug->Bug, task->Task, enhancement->Story, epic->Epic

## Outputs

### created-issue

Issue created on the selected platform

- **issue_number**: Issue number (GitHub #N or Jira KEY-N)
- **issue_url**: URL to the created issue
- **jira_cloud_id**: Atlassian cloud ID for subsequent Jira operations (Jira only)

## Rules

### issues-define-problems

Issues define problems, not solutions. Describe what needs to be solved and why.

### acceptance-criteria

Acceptance criteria must be observable and testable

### no-implementation-details

No implementation details in issues — those belong in planning docs and PRs

### traceability

Every work package should be linked to a GitHub or Jira issue for traceability

### clarity

Issues should be clear to someone without prior context

### tool-usage

- gh_issue_create after call — Capture issue_number and issue_url from output
- gh_issue_create sequence — call gh_issue_view next
- getAccessibleAtlassianResources after call — Preserve cloudId as jira_cloud_id
- getAccessibleAtlassianResources sequence — call getVisibleJiraProjects next
- getVisibleJiraProjects sequence — call getJiraProjectIssueTypesMetadata next
- getJiraProjectIssueTypesMetadata sequence — call createJiraIssue next
- createJiraIssue after call — Capture issue_number and issue_url from response

## Errors

### no_platform_selected

**Cause:** User did not select GitHub or Jira for issue creation

**Recovery:** Present platform selection checkpoint and wait for selection

### gh_cli_error

**Cause:** gh CLI command failed (auth, permissions, or network)

**Recovery:** Verify gh auth status and repository access; retry or prompt user to create issue manually

### jira_api_error

**Cause:** Atlassian API call failed (auth, permissions, or invalid request)

**Recovery:** Verify cloudId and project access; check Jira issue type and required fields
