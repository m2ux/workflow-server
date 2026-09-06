---
metadata:
  version: 3.3.0
---

## Capability

A GitHub or Jira issue that exists and is verified for the work package, carrying the type, labels and metadata its tracker expects

## Inputs

### issue_platform

Selected platform for issue creation (github or jira)

### issue_type

Type of issue (feature, bug, task, enhancement, epic)

### component_name

Basename of the component the work package targets (e.g., midnight-node, midnight-ledger)

### issue_subject

*(optional)* The already-identified thing the issue is raised for, carrying what it is and why it matters. Absent when the issue is the work package's own, whose subject is the run's own context.

### jira_project

*(optional)* Jira project chosen at the `jira-project-selection` gate — the project the new Jira issue is created in. Absent for GitHub issues.

## Outputs

### needs_issue_creation

Whether the run creates a new issue: `true` when no existing issue was supplied, `false` when one was.

### issue_number

Issue number of the verified or newly created issue (GitHub #N or Jira KEY-N).

### issue_url

URL of the verified or newly created issue.

## Protocol

### 1. Verify Existing Issue

- Runs only when the user provides an existing issue key. Detect the platform from key format: `#N` or bare number → GitHub, `PROJ-N` → Jira. Set `{issue_platform}`.
- For GitHub: Apply [view-issue](../../meta/techniques/github-cli-protocol/view-issue.md)(*repo_path*=`{component_git_dir}`); capture `{issue_number}` and `{issue_url}` from the op.
- For Jira: Apply [atlassian-operations](../../meta/techniques/atlassian-operations/TECHNIQUE.md)::[get-jira-issue](../../meta/techniques/atlassian-operations/get-jira-issue.md)(*issueIdOrKey*=the issue key); take `{issue_record}` from the op.
- Capture `{issue_number}` and `{issue_url}` from the verification result. Set `{needs_issue_creation}` to false.

### 2. Resolve Platform For Creation

- Runs when no existing issue key was given. Set `{needs_issue_creation}` to true.

### 3. Create Github Issue

- Runs when `{issue_platform}` is github and `{needs_issue_creation}` is true. Use the [issue template](../resources/github-issue-creation.md#issue-template) and [section rules](../resources/github-issue-creation.md#section-rules) (and [anti-patterns](../resources/github-issue-creation.md#anti-patterns) when checking the draft).
- Gather title, description, and acceptance criteria from `{issue_subject}` where it is supplied and from user context otherwise, scoping the issue to the `{component_name}` the work package targets
- Map `{issue_type}` to GitHub labels using the label mapping below
- Create the issue, then verify creation succeeded, capturing `{issue_number}` and `{issue_url}` from the verified issue.
- GitHub label mapping: `feature->enhancement`, `bug->bug`, `task->chore`, `enhancement->enhancement`
- If a github-cli-protocol op fails (auth, permissions, or network — including the issue verification in step 1), verify `gh` auth status and repository access, then retry or prompt the user to create the issue manually.

### 4. Create Jira Issue

- Runs when `{issue_platform}` is jira and `{needs_issue_creation}` is true. Use the [issue structure](../resources/jira-issue-creation.md#issue-structure) and [issue types](../resources/jira-issue-creation.md#issue-types) (and [anti-patterns](../resources/jira-issue-creation.md#anti-patterns) when checking the draft).
- Create the issue in `{jira_project}` by applying [atlassian-operations](../../meta/techniques/atlassian-operations/TECHNIQUE.md)::[create-jira-issue](../../meta/techniques/atlassian-operations/create-jira-issue.md), resolving the available issue types for that project through [list-jira-issue-types](../../meta/techniques/atlassian-operations/list-jira-issue-types.md).
  > Where `{jira_project}` is unset, Apply [list-jira-projects](../../meta/techniques/atlassian-operations/list-jira-projects.md) and take the project from the returned set.
- Gather summary, description, and acceptance criteria from `{issue_subject}` where it is supplied and from user context otherwise, scoping the issue to the `{component_name}` the work package targets. Resolve assignee account ID if specified.
- Create the issue with mapped type using the issue-type mapping below, capturing `{issue_number}` and `{issue_url}` from the resulting issue.
- Jira issue type mapping: `feature->Story`, `bug->Bug`, `task->Task`, `enhancement->Story`, `epic->Epic`
- If an atlassian-operations op fails (auth, permissions, or invalid request — including the issue verification), verify the cloud id and project access, and check the Jira issue type and required fields before retrying.

## Rules

### issues-define-problems

Issues define problems, not solutions. Describe what needs to be solved and why.

### acceptance-criteria

Acceptance criteria must be observable and testable

### no-implementation-details

No implementation details in issues — those belong in planning docs and PRs

### requirement-traceability

Every work package should be linked to a GitHub or Jira issue for traceability

### issue-clarity

Issues should be clear to someone without prior context
