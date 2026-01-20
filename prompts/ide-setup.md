# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* fetch the `workflow://intents` resource.
```

## How It Works

1. **Fetch intents** - The `workflow://intents` resource provides the intent index
2. **Match user goal** - Use `quick_match` to identify the appropriate intent
3. **Load intent** - Fetch `workflow://intents/{id}` for detailed flow
4. **Load skill** - Fetch `workflow://skills/{skill}` referenced by the intent
5. **Execute** - Follow the skill's tool orchestration and workflow interpretation guidance

## Available Resources

| Resource | Purpose |
|----------|---------|
| `workflow://intents` | Intent index - primary entry point |
| `workflow://intents/{id}` | Specific intent details |
| `workflow://skills/{id}` | Skill guidance for tool usage |
| `workflow://guides/{name}` | Reference documentation |
