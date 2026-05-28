---
name: atlassian-operations
description: Operations for Jira and Confluence tasks via the Atlassian MCP server.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 5
  legacy_id: 5
---

# Atlassian Operations

## Capability

Operations for common Jira and Confluence tasks via the Atlassian MCP server — site/account discovery, Jira issue/transition/comment management, and Confluence page/comment management.

## Operations

### Discovery

| Operation | Purpose |
|---|---|
| [resolve-cloud-id](resolve-cloud-id.md) | Obtain the `cloudId` for the target Atlassian site |
| [user-info](user-info.md) | Get the current user's account ID |
| [lookup-jira-account-id](lookup-jira-account-id.md) | Resolve a name or email to a Jira account ID |

### Jira

| Operation | Purpose |
|---|---|
| [search-jira-issues](search-jira-issues.md) | Search Jira issues with JQL |
| [list-jira-projects](list-jira-projects.md) | Discover Jira projects with their issue types |
| [list-jira-issue-types](list-jira-issue-types.md) | List issue types available in a project |
| [list-jira-issue-fields](list-jira-issue-fields.md) | Discover the fields for a specific issue type |
| [create-jira-issue](create-jira-issue.md) | Create a new Jira issue |
| [edit-jira-issue](edit-jira-issue.md) | Update fields on an existing Jira issue |
| [get-jira-issue](get-jira-issue.md) | Read a single Jira issue |
| [list-jira-transitions](list-jira-transitions.md) | Discover available status transitions for an issue |
| [transition-jira-issue](transition-jira-issue.md) | Move an issue to a new status |
| [comment-jira-issue](comment-jira-issue.md) | Add a comment to a Jira issue |
| [log-work-jira-issue](log-work-jira-issue.md) | Log work time on a Jira issue |

### Confluence

| Operation | Purpose |
|---|---|
| [search-confluence](search-confluence.md) | Search Confluence content with CQL |
| [create-confluence-page](create-confluence-page.md) | Create a Confluence page |
| [update-confluence-page](update-confluence-page.md) | Update a Confluence page (full body replace) |
| [get-confluence-page](get-confluence-page.md) | Read a Confluence page as Markdown |
| [list-confluence-spaces](list-confluence-spaces.md) | List spaces accessible to the current user |
| [list-confluence-pages-in-space](list-confluence-pages-in-space.md) | List pages in a Confluence space |
| [list-confluence-page-descendants](list-confluence-page-descendants.md) | List child pages of a Confluence page |
| [comment-confluence-page-footer](comment-confluence-page-footer.md) | Add a page-level (footer) comment to a Confluence page |
| [comment-confluence-page-inline](comment-confluence-page-inline.md) | Add an inline (in-text) comment to a Confluence page |

## Rules

### resolve-cloud-id-once

Apply [resolve-cloud-id](resolve-cloud-id.md) ONCE per session and cache the `cloudId`. Every product-specific operation requires it.

### content-format-markdown

Set `contentFormat` to `markdown` for Confluence create/update/read operations.

### account-id-for-users

User fields require account IDs. Apply [lookup-jira-account-id](lookup-jira-account-id.md) (or [user-info](user-info.md) for the current user) to resolve names/emails.

### transitions-are-dynamic

ALWAYS apply [list-jira-transitions](list-jira-transitions.md) before [transition-jira-issue](transition-jira-issue.md) — transition IDs are issue-specific.

### verify-after-mutation

After any mutating operation, apply the corresponding read operation (e.g., [get-jira-issue](get-jira-issue.md), [get-confluence-page](get-confluence-page.md)) to verify the change.
