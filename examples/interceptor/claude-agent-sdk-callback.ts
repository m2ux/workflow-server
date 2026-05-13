/**
 * Claude Agent SDK integration for workflow-server-interceptor.
 *
 * Programmatic harnesses (Anthropic SDK, custom MCP clients) don't have
 * a settings file. Instead, you call these helpers from your own
 * tool-execution wrapper before forwarding a tool call to the model and
 * after the tool response comes back.
 *
 * The TypeScript shape below shows the integration; an equivalent
 * Python snippet follows in the comment block at the bottom.
 */
import { spawnSync } from 'node:child_process';

/**
 * Mutates `toolInput` in place (returning the same reference for
 * convenience) so that workflow-server calls carry the latest captured
 * session_token. Calls to non-workflow-server tools are unchanged.
 */
export function injectSessionToken(
  toolName: string,
  toolInput: Record<string, unknown>,
): Record<string, unknown> {
  if (!toolName.startsWith('mcp__workflow-server__')) return toolInput;
  const result = spawnSync('workflow-server-interceptor', ['inject'], {
    input: JSON.stringify({ tool_name: toolName, tool_input: toolInput }),
    encoding: 'utf8',
  });
  if (result.error || result.status !== 0) return toolInput;
  try {
    const parsed = JSON.parse(result.stdout || '{}');
    if (parsed.updatedInput) {
      Object.assign(toolInput, parsed.updatedInput);
    }
  } catch {
    // pass-through on parse failure
  }
  return toolInput;
}

/**
 * Persist the workflow-server session_token from a tool response.
 * Non-workflow-server responses and responses missing `_meta` are
 * silent no-ops.
 */
export function captureSessionToken(
  toolName: string,
  toolResponse: { _meta?: Record<string, unknown> } | undefined,
): void {
  if (!toolName.startsWith('mcp__workflow-server__')) return;
  spawnSync('workflow-server-interceptor', ['capture'], {
    input: JSON.stringify({ _meta: toolResponse?._meta ?? null }),
    encoding: 'utf8',
  });
}

/**
 * Example usage inside a tool-execution wrapper. Adapt to your own
 * client's API. The two helpers compose: inject before the call, run
 * the call, capture the response.
 *
 *   async function execTool(name: string, input: Record<string, unknown>) {
 *     injectSessionToken(name, input);
 *     const response = await mcpClient.callTool(name, input);
 *     captureSessionToken(name, response);
 *     return response;
 *   }
 */

/* ---------- Python equivalent (for reference) ----------

import json
import subprocess

def inject_session_token(tool_name: str, tool_input: dict) -> dict:
    if not tool_name.startswith("mcp__workflow-server__"):
        return tool_input
    r = subprocess.run(
        ["workflow-server-interceptor", "inject"],
        input=json.dumps({"tool_name": tool_name, "tool_input": tool_input}),
        capture_output=True, text=True,
    )
    try:
        parsed = json.loads(r.stdout or "{}")
        if "updatedInput" in parsed:
            tool_input.update(parsed["updatedInput"])
    except json.JSONDecodeError:
        pass
    return tool_input

def capture_session_token(tool_name: str, tool_response: dict | None) -> None:
    if not tool_name.startswith("mcp__workflow-server__"):
        return
    meta = (tool_response or {}).get("_meta")
    subprocess.run(
        ["workflow-server-interceptor", "capture"],
        input=json.dumps({"_meta": meta}),
        capture_output=True, text=True,
    )

---------- end Python ---------- */
