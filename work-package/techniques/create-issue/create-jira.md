---
metadata:
  version: 1.0.0
---

## Capability

A Jira issue raised for the work package in its project, typed for the kind of change it records.

## Inputs

### jira_project

*(optional)* The project the issue is created in, as the project gate settled it. Absent where the run has not chosen one.

## Protocol

### 1. Draft the Issue

- Use the [issue template](../../resources/issue-creation.md#issue-template) for the body and the [section rules](../../resources/issue-creation.md#section-rules) governing it, arranged into Jira's fields per [issue structure](../../resources/jira-issue-creation.md#issue-structure) and typed per [issue types](../../resources/jira-issue-creation.md#issue-types); check the draft against the [shared anti-patterns](../../resources/issue-creation.md#anti-patterns) and the [Jira one](../../resources/jira-issue-creation.md#anti-patterns)
- Gather summary, description and acceptance criteria from `{issue_subject}` where it is supplied and from the run's own context otherwise, scoping the issue to the `{component_name}` the work package targets
- Map `{issue_type}` to a Jira issue type through the mapping below

| `{issue_type}` | Issue type |
|---|---|
| `feature` | `Story` |
| `enhancement` | `Story` |
| `bug` | `Bug` |
| `task` | `Task` |
| `epic` | `Epic` |

### 2. Resolve the Project

- Take `{jira_project}` as the project the issue is created in
  > Where it is unset, apply [list-jira-projects](../../../meta/techniques/atlassian-operations/list-jira-projects.md) and take the project from the returned set.

### 3. Create and Verify

- Resolve the types the project admits through [list-jira-issue-types](../../../meta/techniques/atlassian-operations/list-jira-issue-types.md), then apply [atlassian-operations](../../../meta/techniques/atlassian-operations/TECHNIQUE.md)::[create-jira-issue](../../../meta/techniques/atlassian-operations/create-jira-issue.md) with the drafted summary, description and mapped type; capture `{issue_number}` and `{issue_url}` from the resulting issue
  > Where the op fails on auth, permissions or an invalid request, verify the cloud id and project access and check the issue type and its required fields before retrying.
