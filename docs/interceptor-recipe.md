# MCP-Client Interceptor Recipe

`workflow-server-interceptor` is a small CLI bundled with
`@m2ux/workflow-server`. When wired into your MCP-host harness's
`PreToolUse` / `PostToolUse` hooks (or each harness's equivalent
mechanism), it auto-injects the workflow-server `session_token` into
outgoing tool calls and auto-captures the updated token from each
response. The LLM never has to retype the ~480-character HMAC-signed
token, eliminating an entire class of transcription-drift bugs at the
structural level.

This document walks through what the hook does and why, then shows how
to wire it into each supported harness. Copy-pasteable configuration
files for every harness in this doc live under
[`examples/interceptor/`](../examples/interceptor/).

---

## 1. What the hook does and why

### Why

The workflow-server `session_token` is HMAC-signed and travels back to
the server on every call after `start_session`. The token is opaque,
roughly 480 characters of base64url, and the LLM has to copy it from
the previous response into the next call's `arguments`. The LLM is a
reliable-but-not-infallible copyist of long opaque strings: occasionally
it alters one or two characters, the HMAC verification fails on the
server side, and the workflow halts mid-step with a cryptic
"signature verification failed" error.

The fix is to move the token-passing out of the LLM and into the host
harness. Every MCP-host harness already supports a lifecycle hook that
fires between the LLM emitting a tool call and the harness forwarding
it to the MCP server. That hook is the right place to inject the token.

### What

The CLI has two subcommands:

- **`workflow-server-interceptor inject`** — reads the PreToolUse JSON
  envelope from stdin. For `mcp__workflow-server__*` tool calls (other
  than `start_session`), it reads the most recently captured token from
  `~/.claude/workflow-server-tokens/current.token` and emits an
  `updatedInput` JSON to stdout that merges `session_token` into the
  call's `arguments`. For every other shape (non-workflow-server target,
  `start_session`, pre-existing `session_token` or `checkpoint_handle`,
  missing/empty state file, malformed stdin), it emits a pass-through
  and the call is forwarded unchanged.
- **`workflow-server-interceptor capture`** — reads the PostToolUse JSON
  envelope from stdin, locates the response's `_meta.session_token`
  (or the wrapped `tool_response._meta.session_token`), extracts the
  session id (`sid`) from the token payload, and writes the token to
  both `~/.claude/workflow-server-tokens/<sid-hex>.token` (per-session
  file) and `~/.claude/workflow-server-tokens/current.token` (shared
  pointer). Both writes use atomic rename and mode `0600`. The state
  directory is created with mode `0700` if missing.

The CLI is **failure-safe**: every error (parse failure, missing file,
filesystem permission error, malformed token) degrades to pass-through.
It never exits non-zero, because host harnesses interpret non-zero as
"block the call" — which would be worse than the status quo.

---

## 2. Prerequisites

```bash
npm install -g @m2ux/workflow-server
# or, project-local:
npm install --save @m2ux/workflow-server
```

Confirm the bin resolves:

```bash
which workflow-server-interceptor
# expected: /usr/local/bin/workflow-server-interceptor (or wherever npm puts globals)

echo '{"tool_name":"mcp__workflow-server__get_activity","tool_input":{}}' \
  | workflow-server-interceptor inject
# expected: {} (pass-through, since current.token has not yet been captured)
```

If the binary is installed but not on `PATH`, every example below also
works with `npx workflow-server-interceptor inject` / `capture`.

---

## 3. Claude Code

Claude Code's `~/.claude/settings.json` ships first-class
`PreToolUse` and `PostToolUse` hooks. Match on the `mcp__workflow-server__*`
tool name pattern.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__workflow-server__.*",
        "hooks": [
          { "type": "command", "command": "workflow-server-interceptor inject" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "mcp__workflow-server__.*",
        "hooks": [
          { "type": "command", "command": "workflow-server-interceptor capture" }
        ]
      }
    ]
  }
}
```

The matcher is a regex; `mcp__workflow-server__.*` covers every
workflow-server tool. The hook receives the standard Claude Code
PreToolUse / PostToolUse JSON on stdin (with `tool_name`, `tool_input`,
`tool_response`, `_meta`) and may emit `{ "updatedInput": { ... } }` on
stdout to rewrite the outgoing call.

A copy-pasteable settings fragment lives at
[`examples/interceptor/claude-code-settings.json`](../examples/interceptor/claude-code-settings.json).

---

## 4. Cursor (≥ 1.7)

Cursor exposes `beforeMCPExecution` and `afterMCPExecution` hooks. Their
field names are the same as Claude Code's (`tool_name`, `tool_input`,
`_meta`).

```json
{
  "mcp": {
    "hooks": {
      "beforeMCPExecution": {
        "command": "workflow-server-interceptor inject",
        "matchTool": "^mcp__workflow-server__"
      },
      "afterMCPExecution": {
        "command": "workflow-server-interceptor capture",
        "matchTool": "^mcp__workflow-server__"
      }
    }
  }
}
```

A copy-pasteable fragment is at
[`examples/interceptor/cursor-hooks.json`](../examples/interceptor/cursor-hooks.json).

---

## 5. OpenCode

OpenCode uses plugin handlers registered against `tool.execute.before`
and `tool.execute.after`. The plugin spawns the CLI as a subprocess.

```ts
// ~/.config/opencode/plugins/workflow-server-interceptor.ts
import { spawnSync } from 'node:child_process';

export default {
  'tool.execute.before': (ctx) => {
    if (!ctx.tool_name?.startsWith('mcp__workflow-server__')) return;
    const r = spawnSync('workflow-server-interceptor', ['inject'], {
      input: JSON.stringify({ tool_name: ctx.tool_name, tool_input: ctx.tool_input }),
      encoding: 'utf8',
    });
    try {
      const parsed = JSON.parse(r.stdout || '{}');
      if (parsed.updatedInput) Object.assign(ctx.tool_input, parsed.updatedInput);
    } catch { /* pass-through on parse failure */ }
  },
  'tool.execute.after': (ctx) => {
    if (!ctx.tool_name?.startsWith('mcp__workflow-server__')) return;
    spawnSync('workflow-server-interceptor', ['capture'], {
      input: JSON.stringify({ _meta: ctx.tool_response?._meta }),
      encoding: 'utf8',
    });
  },
};
```

A copy-pasteable plugin is at
[`examples/interceptor/opencode-plugin.ts`](../examples/interceptor/opencode-plugin.ts).

---

## 6. OpenAI Codex CLI

Codex CLI supports a `PreToolUse` hook with the same JSON
envelope shape as Claude Code.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__workflow-server__.*",
        "command": ["workflow-server-interceptor", "inject"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "mcp__workflow-server__.*",
        "command": ["workflow-server-interceptor", "capture"]
      }
    ]
  }
}
```

A copy-pasteable fragment is at
[`examples/interceptor/codex-hooks.json`](../examples/interceptor/codex-hooks.json).

---

## 7. Claude Agent SDK (programmatic)

For SDK-driven agents that don't use a settings file, the hook is
registered programmatically.

```ts
import { spawnSync } from 'node:child_process';
import { Anthropic } from '@anthropic-ai/sdk';

const client = new Anthropic();

function injectHook(toolName: string, toolInput: Record<string, unknown>): Record<string, unknown> {
  if (!toolName.startsWith('mcp__workflow-server__')) return toolInput;
  const r = spawnSync('workflow-server-interceptor', ['inject'], {
    input: JSON.stringify({ tool_name: toolName, tool_input: toolInput }),
    encoding: 'utf8',
  });
  try {
    const parsed = JSON.parse(r.stdout || '{}');
    return parsed.updatedInput ?? toolInput;
  } catch {
    return toolInput;
  }
}

function captureHook(toolName: string, response: { _meta?: Record<string, unknown> }): void {
  if (!toolName.startsWith('mcp__workflow-server__')) return;
  spawnSync('workflow-server-interceptor', ['capture'], {
    input: JSON.stringify({ _meta: response._meta }),
    encoding: 'utf8',
  });
}

// Plug these into your tool-execution wrapper before forwarding to the model.
```

A more complete example (including the Python equivalent) is at
[`examples/interceptor/claude-agent-sdk-callback.ts`](../examples/interceptor/claude-agent-sdk-callback.ts).

---

## 8. Verification

Once the hook is wired:

```bash
# 1. Confirm the binary resolves.
which workflow-server-interceptor

# 2. Smoke-test inject with a sample PreToolUse JSON.
echo '{"tool_name":"mcp__workflow-server__get_activity","tool_input":{}}' \
  | workflow-server-interceptor inject
# Expected: {}  (pass-through before any capture has happened)

# 3. Run a workflow that issues at least one MCP call after start_session.

# 4. Confirm the state directory and pointer file are populated.
ls -la ~/.claude/workflow-server-tokens/
# Expected: directory mode 0700; current.token mode 0600; one or more
#           <sid-hex>.token files (mode 0600 each).

# 5. Tail current.token across calls to confirm it advances.
cat ~/.claude/workflow-server-tokens/current.token
# Different content after each workflow-server tool call.

# 6. Smoke-test inject again — now it should output an updatedInput.
echo '{"tool_name":"mcp__workflow-server__get_activity","tool_input":{}}' \
  | workflow-server-interceptor inject
# Expected: {"updatedInput":{"session_token":"<token>"}}
```

---

## 9. Troubleshooting

**The hook is silent / the LLM is still copying the token.**

- Confirm the harness is actually invoking the hook. Most harnesses log
  hook firings; check the harness's debug output.
- Confirm `workflow-server-interceptor` resolves on the `PATH` the
  harness uses (which may differ from your interactive shell's
  `PATH` if the harness is launched from a desktop application or
  service).
- Try invoking the hook command directly and verify the output:
  `echo '{...}' | workflow-server-interceptor inject`.

**`current.token` exists but inject is a pass-through.**

- Inject deliberately skips `mcp__workflow-server__start_session`.
- Inject deliberately skips when the agent has already supplied
  `session_token` or `checkpoint_handle` in `tool_input`.
- Inject skips when the tool name doesn't start with
  `mcp__workflow-server__`.
- Inject skips when the harness's PreToolUse JSON is malformed or
  missing `tool_name`.

**Permission errors on the state directory or token files.**

- The state directory is created at mode `0700` and token files at
  mode `0600`. If you change those modes, ensure the user the harness
  runs as can still read them.
- On Windows, the mode bits map differently. The interceptor falls back
  to whatever mode the filesystem assigns; it does not require POSIX
  mode bits to function.

**Concurrent workflow-server sessions race on `current.token`.**

- Per-sid files at `<sid-hex>.token` survive concurrent captures; only
  the shared `current.token` pointer races. To recover, manually copy
  the desired per-sid file over `current.token`:
  `cp ~/.claude/workflow-server-tokens/<sid-hex>.token ~/.claude/workflow-server-tokens/current.token`.

**The workflow still fails with a "signature verification failed" error
after installing the hook.**

- The hook prevents transcription corruption. It does NOT fix tokens
  that were already invalid (server restart, tampered token, token
  belonging to a different server instance). If the error persists,
  call `start_session` with the saved token to trigger the server's
  staleness recovery path.
