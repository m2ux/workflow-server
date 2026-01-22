# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call fetch_resource with uri "workflow://intents".
```

## How It Works

1. **Fetch intents** - Call `fetch_resource { uri: "workflow://intents" }` to get the intent index
2. **Match user goal** - Use `quick_match` patterns to identify the appropriate intent
3. **Load intent** - Call `fetch_resource { uri: "workflow://intents/{id}" }` for detailed flow
4. **Load skill** - Call `fetch_resource { uri: "workflow://skills/{skill}" }` referenced by the intent
5. **Execute** - Follow the skill's tool orchestration and workflow interpretation guidance

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_resources` | Discover all available resources and their URIs |
| `fetch_resource` | Fetch any resource by URI |

## URI Patterns

| URI | Purpose |
|-----|---------|
| `workflow://intents` | Intent index - primary entry point |
| `workflow://intents/{id}` | Specific intent details |
| `workflow://skills/{id}` | Skill guidance for tool usage |
| `workflow://{workflowId}` | Workflow definition |
| `workflow://{workflowId}/guides` | List guides for workflow |
| `workflow://{workflowId}/guides/{index}` | Specific guide by index |
| `workflow://{workflowId}/templates/{index}` | Specific template by index |
