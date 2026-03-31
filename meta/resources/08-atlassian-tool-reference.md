# Atlassian MCP Tool Reference

Complete reference for Atlassian MCP server tools. Organized by product.

## Prerequisites

Every product-specific tool requires `cloudId`. Call `getAccessibleAtlassianResources` first.

## Jira Tools

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `searchJiraIssuesUsingJql` | Precise search with field-level filtering | `cloudId`, `jql`, `fields[]`, `maxResults` | Matching issues |
| `getVisibleJiraProjects` | Discover projects before creating issues | `cloudId`, optional `searchString` | Projects with keys and issue types |
| `getJiraProjectIssueTypesMetadata` | Discover issue types for a project | `cloudId`, `projectIdOrKey` | Issue types with IDs and names |
| `getJiraIssueTypeMetaWithFields` | Discover fields for an issue type | `cloudId`, `projectIdOrKey`, `issueTypeId` | Field metadata |
| `createJiraIssue` | Create a new issue | `cloudId`, `projectKey`, `issueTypeName`, `summary`, optional `description`, `additional_fields` | Created issue key |
| `editJiraIssue` | Update issue fields | `cloudId`, `issueIdOrKey`, `fields` object | Confirmation |
| `getJiraIssue` | Read a single issue | `cloudId`, `issueIdOrKey` | Full issue details |
| `getTransitionsForJiraIssue` | Discover available status transitions | `cloudId`, `issueIdOrKey` | Available transitions with IDs |
| `transitionJiraIssue` | Change issue status | `cloudId`, `issueIdOrKey`, `transition` object with ID | Confirmation |
| `addCommentToJiraIssue` | Add a comment | `cloudId`, `issueIdOrKey`, `commentBody` (Markdown) | Created comment |
| `addWorklogToJiraIssue` | Log work | `cloudId`, `issueIdOrKey`, `timeSpent` (e.g., '2h') | Confirmation |
| `lookupJiraAccountId` | Resolve user name/email to account ID | `cloudId`, `searchString` | Matching accounts |

## Confluence Tools

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `searchConfluenceUsingCql` | Structured search with CQL | `cloudId`, `cql`, optional `limit`, `cursor` | Matching content |
| `createConfluencePage` | Create a page | `cloudId`, `spaceId`, `body` (Markdown), `contentFormat: 'markdown'`, optional `title`, `parentId` | Created page ID |
| `updateConfluencePage` | Update a page (full replace) | `cloudId`, `pageId`, `body` (Markdown), optional `title` | Updated page |
| `getConfluencePage` | Read a page | `cloudId`, `pageId`, `contentFormat: 'markdown'` | Page content as Markdown |
| `getConfluenceSpaces` | List spaces | `cloudId`, optional filters | Spaces with IDs and keys |
| `getPagesInConfluenceSpace` | List pages in a space | `cloudId`, `spaceId`, optional `title` filter | Pages in space |
| `getConfluencePageDescendants` | List child pages | `cloudId`, `pageId`, optional `depth`, `limit` | Descendant pages |
| `createConfluenceFooterComment` | Page-level comment | `cloudId`, `pageId`, `body` (Markdown) | Created comment |
| `createConfluenceInlineComment` | Inline text comment | `cloudId`, `pageId`, `body` (Markdown), `inlineCommentProperties` | Created comment |

## Cross-Product Tools

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `getAccessibleAtlassianResources` | First call — obtain cloudId | none | Cloud sites with UUIDs |
| `atlassianUserInfo` | Get current user's account ID | none | User details with account ID |
| `search` (Rovo) | Broad natural-language search across Jira + Confluence | `query` | Results with ARIs |
| `fetch` | Retrieve full details by ARI | `id` (ARI from search) | Full entity details |

## Common CQL Patterns

- `title ~ "keyword" AND type = page`
- `space = SPACEKEY AND label = "label"`
- `ancestor = pageId`
