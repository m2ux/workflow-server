---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 3
  legacy_id: 3
---

## Capability

Atomically create and verify a GitHub or Jira issue with appropriate type, labels, and metadata

## Inputs

### issue_platform

Selected platform for issue creation (github or jira)

### issue_type

Type of issue (feature, bug, task, enhancement, epic)

### target_submodule

Target submodule for the work package (e.g., midnight-node, midnight-ledger)

## Protocol

### 1. Verify Existing Issue

- Runs when user provides an existing issue key. Detect the platform from key format: `#N` or bare number → GitHub, `PROJ-N` → Jira. Set `{issue_platform}`.
- If no issue key was given and the platform is ambiguous (user did not select GitHub or Jira), present the platform selection checkpoint and wait for the user's selection before proceeding.
- For GitHub: run `gh issue view <number>` to confirm the issue exists. Capture `{issue_number}` and `{issue_url}`.
- For Jira: call `getAccessibleAtlassianResources` FIRST to obtain cloudId, preserve as `{jira_cloud_id}`. THEN call `getJiraIssue` with cloudId and the issue key. Do NOT call `getJiraIssue` before cloudId is resolved.
- Capture `{issue_number}` and `{issue_url}` from the verification result. Set needs_issue_creation to false.

### 2. Create Github Issue

- Runs when `{issue_platform}` is github and needs_issue_creation is true. Use attached [github-issue-creation](../resources/github-issue-creation.md) for guidance.
- Gather title, description, and acceptance criteria from user context, scoping the issue to the `{target_submodule}` the work package targets
- Map `{issue_type}` to GitHub labels using the label mapping below
- Create the issue, then verify creation succeeded — this verified issue is the `{created_issue}`. Capture `{issue_number}` and `{issue_url}`.
- GitHub label mapping: `feature->enhancement`, `bug->bug`, `task->chore`, `enhancement->enhancement`
- If a `gh` CLI command fails (auth, permissions, or network — including the `gh issue view` verification in step 1), verify `gh` auth status and repository access, then retry or prompt the user to create the issue manually.

### 3. Create Jira Issue

- Runs when `{issue_platform}` is jira and needs_issue_creation is true. Use attached [jira-issue-creation](../resources/jira-issue-creation.md) for guidance.
- Obtain Atlassian cloud ID via `getAccessibleAtlassianResources` and preserve as `{jira_cloud_id}`. This MUST be the first Jira tool call.
- List available projects via `getVisibleJiraProjects`, then present the jira-project-selection checkpoint (defined on the activity) for user selection. Resolve available issue types for the selected project.
- Gather summary, description, and acceptance criteria, scoping the issue to the `{target_submodule}` the work package targets. Resolve assignee account ID if specified.
- Create the issue with mapped type using the issue-type mapping below — the resulting issue is the `{created_issue}`. Capture `{issue_number}` and `{issue_url}`.
- Jira issue type mapping: `feature->Story`, `bug->Bug`, `task->Task`, `enhancement->Story`, `epic->Epic`
- If any Atlassian API call fails (auth, permissions, or invalid request — including the `getJiraIssue` verification in step 1), verify the cloudId and project access, and check the Jira issue type and required fields before retrying.

## Outputs

### created_issue

Issue created on the selected platform

#### issue_number

Issue number (GitHub #N or Jira KEY-N)

#### issue_url

URL to the created issue

#### jira_cloud_id

Atlassian cloud ID for subsequent Jira operations (Jira only)

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

- `gh_issue_create` after call — Capture `issue_number` and `issue_url` from output
- `gh_issue_create` sequence — call `gh_issue_view` next
- `getAccessibleAtlassianResources` after call — Preserve `cloudId` as `jira_cloud_id`
- `getAccessibleAtlassianResources` sequence — call `getVisibleJiraProjects` next
- `getVisibleJiraProjects` sequence — call `getJiraProjectIssueTypesMetadata` next
- `getJiraProjectIssueTypesMetadata` sequence — call `createJiraIssue` next
- `createJiraIssue` after call — Capture `issue_number` and `issue_url` from response
