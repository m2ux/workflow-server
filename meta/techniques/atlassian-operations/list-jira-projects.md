---
metadata:
  version: 1.0.0
---

## Capability

Discover Jira projects with their issue types.

## Outputs

### visible_projects

Projects the current user can see, each with its issue types.

## Protocol

1. Call `getVisibleJiraProjects { cloudId, searchString? }`; return the listing as `{visible_projects}`.
