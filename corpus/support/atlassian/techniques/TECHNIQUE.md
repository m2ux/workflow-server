---
metadata:
  version: 3.1.0
---

## Capability

Techniques for common Jira and Confluence tasks via the Atlassian MCP server — site/account discovery, Jira issue/transition/comment management, and Confluence page/comment management.

## Inputs

### cloudId

*(optional)* UUID of the target Atlassian cloud site. A site-scoped call passes it; [user-info](./user-info.md) takes none.

## Rules

### resolve-cloud-id-once

Apply [resolve-cloud-id](./resolve-cloud-id.md) ONCE per session and cache the `{cloudId}`. A site-scoped call passes that id; when the id is absent the call resolves it and retries. [user-info](./user-info.md) takes no cloud id.

### content-format-markdown

Set `contentFormat` to `markdown` for Confluence create/update/read techniques.

### account-id-for-users

User fields require account IDs. Apply [lookup-jira-account-id](./lookup-jira-account-id.md) (or [user-info](./user-info.md) for the current user) to resolve names/emails.

### transitions-are-dynamic

ALWAYS apply [list-jira-transitions](./list-jira-transitions.md) before [transition-jira-issue](./transition-jira-issue.md) — transition IDs are issue-specific.

### verify-after-mutation

After any mutating technique, apply the corresponding read technique (e.g., [get-jira-issue](./get-jira-issue.md), [get-confluence-page](./get-confluence-page.md)) to verify the change.
