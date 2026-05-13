# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure.
```

## Recommended: install the MCP-client interceptor

For all supported harnesses (Claude Code, Cursor, OpenCode, OpenAI Codex CLI, Claude Agent SDK), install the `workflow-server-interceptor` CLI as a `PreToolUse` / `PostToolUse` (or equivalent) hook. The interceptor auto-threads the workflow-server `session_token` between MCP calls so the LLM never has to retype it, which eliminates an entire class of transcription-drift bugs.

See [docs/interceptor-recipe.md](interceptor-recipe.md) for per-harness configuration recipes and `examples/interceptor/` for copy-pasteable fragments.
