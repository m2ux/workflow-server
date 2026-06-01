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

## Rules

### resolve-cloud-id-once

Apply [resolve-cloud-id](./resolve-cloud-id.md) ONCE per session and cache the `cloudId`. Every product-specific operation requires it.

### content-format-markdown

Set `contentFormat` to `markdown` for Confluence create/update/read operations.

### account-id-for-users

User fields require account IDs. Apply [lookup-jira-account-id](./lookup-jira-account-id.md) (or [user-info](./user-info.md) for the current user) to resolve names/emails.

### transitions-are-dynamic

ALWAYS apply [list-jira-transitions](./list-jira-transitions.md) before [transition-jira-issue](./transition-jira-issue.md) — transition IDs are issue-specific.

### verify-after-mutation

After any mutating operation, apply the corresponding read operation (e.g., [get-jira-issue](./get-jira-issue.md), [get-confluence-page](./get-confluence-page.md)) to verify the change.
