# Interceptor Configuration Examples

This directory contains copy-pasteable hook configuration files for
each MCP-host harness supported by `workflow-server-interceptor`. The
conceptual recipe — what the hook does, how to verify it, and how to
troubleshoot — is documented in
[`docs/interceptor-recipe.md`](../../docs/interceptor-recipe.md).

| File | Harness | Where it goes |
|------|---------|---------------|
| [`claude-code-settings.json`](claude-code-settings.json) | Claude Code | Merge into `~/.claude/settings.json`. |
| [`cursor-hooks.json`](cursor-hooks.json) | Cursor (≥1.7) | Merge into Cursor's MCP hooks configuration. |
| [`opencode-plugin.ts`](opencode-plugin.ts) | OpenCode | Drop into `~/.config/opencode/plugins/`. |
| [`codex-hooks.json`](codex-hooks.json) | OpenAI Codex CLI | Merge into the Codex CLI hooks config. |
| [`claude-agent-sdk-callback.ts`](claude-agent-sdk-callback.ts) | Claude Agent SDK | Reference: import the helpers into your SDK app and call them from your tool-execution wrapper. |

All examples assume `workflow-server-interceptor` is installed and
resolves on the harness's `PATH`. If you installed
`@m2ux/workflow-server` locally instead of globally, prefix the command
with `npx` (e.g., `"command": "npx workflow-server-interceptor inject"`).
