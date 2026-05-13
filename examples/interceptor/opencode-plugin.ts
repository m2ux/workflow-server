/**
 * OpenCode plugin: wires workflow-server-interceptor into the
 * tool.execute.before / tool.execute.after lifecycle hooks.
 *
 * Drop this file into ~/.config/opencode/plugins/ (or your project's
 * equivalent plugin directory). Restart OpenCode so the plugin is
 * picked up.
 *
 * The plugin spawns the CLI synchronously per-call. The CLI is a small
 * Node program with ~50ms cold-start cost; OpenCode batches plugin
 * execution so this does not block UI interactions.
 */
import { spawnSync } from 'node:child_process';

type ToolContext = {
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: { _meta?: Record<string, unknown> } | undefined;
};

export default {
  'tool.execute.before': (ctx: ToolContext): void => {
    if (!ctx.tool_name?.startsWith('mcp__workflow-server__')) return;
    const result = spawnSync('workflow-server-interceptor', ['inject'], {
      input: JSON.stringify({ tool_name: ctx.tool_name, tool_input: ctx.tool_input ?? {} }),
      encoding: 'utf8',
    });
    if (result.error) return; // pass-through on spawn error
    try {
      const parsed = JSON.parse(result.stdout || '{}');
      if (parsed.updatedInput && ctx.tool_input) {
        Object.assign(ctx.tool_input, parsed.updatedInput);
      }
    } catch {
      // pass-through on parse failure
    }
  },

  'tool.execute.after': (ctx: ToolContext): void => {
    if (!ctx.tool_name?.startsWith('mcp__workflow-server__')) return;
    spawnSync('workflow-server-interceptor', ['capture'], {
      input: JSON.stringify({ _meta: ctx.tool_response?._meta ?? null }),
      encoding: 'utf8',
    });
  },
};
