import { App, type SlackCommandMiddlewareArgs, type AllMiddlewareArgs } from '@slack/bolt';
import { logger } from './logger.js';
import type { SessionManager } from './session-manager.js';
import type { RunnerConfig } from './config.js';

const HELP_TEXT = [
  '*Workflow Runner Commands*',
  '`/workflow start <workflow-id> <target-submodule> [issue-ref]`',
  '  Start a workflow (e.g. `/workflow start work-package midnight-node PM-12345`)',
  '`/workflow list`',
  '  List active workflow sessions',
  '`/workflow help`',
  '  Show this help message',
].join('\n');

export function createSlackApp(
  config: RunnerConfig,
  sessionManager: SessionManager,
): App {
  const app = new App({
    token: config.slack.botToken,
    signingSecret: config.slack.signingSecret,
    appToken: config.slack.appToken,
    socketMode: true,
  });

  // -----------------------------------------------------------------------
  // Slash command: /workflow
  // -----------------------------------------------------------------------

  app.command('/workflow', async (args) => {
    const { command, ack, say } = args as SlackCommandMiddlewareArgs & AllMiddlewareArgs;
    await ack();

    const parts = command.text.trim().split(/\s+/);
    const subcommand = parts[0]?.toLowerCase();

    switch (subcommand) {
      case 'start':
        await handleStart(parts.slice(1), command.channel_id, say, sessionManager);
        break;
      case 'list':
        await handleList(say, sessionManager);
        break;
      case 'help':
      default:
        await say(HELP_TEXT);
        break;
    }
  });

  // -----------------------------------------------------------------------
  // Interactive: button clicks (checkpoint responses)
  // -----------------------------------------------------------------------

  app.action(/^checkpoint_/, async ({ action, body, ack }) => {
    await ack();

    if (body.type !== 'block_actions' || !('actions' in body)) return;

    const channel = body.channel?.id;
    // Thread timestamp: prefer the message's thread_ts, fall back to the message ts
    const message = body.message as Record<string, unknown> | undefined;
    const threadTs = (message?.['thread_ts'] ?? message?.['ts']) as string | undefined;
    const actionId = 'action_id' in action ? action.action_id : undefined;

    if (!channel || !threadTs || !actionId) return;

    const resolved = sessionManager.handleCheckpointResponse(channel, threadTs, actionId);

    if (!resolved) {
      // Could be a stale button click — no action needed
      logger.warn({ actionId, channel, threadTs }, 'Unresolved checkpoint action');
    }
  });

  return app;
}

// -------------------------------------------------------------------------
// Subcommand handlers
// -------------------------------------------------------------------------

async function handleStart(
  args: string[],
  channel: string,
  say: SlackCommandMiddlewareArgs['say'],
  sessionManager: SessionManager,
): Promise<void> {
  const workflowId = args[0];
  const targetSubmodule = args[1];

  if (!workflowId || !targetSubmodule) {
    await say('Usage: `/workflow start <workflow-id> <target-submodule> [issue-ref]`');
    return;
  }

  const issueRef = args[2];

  // Post an initial message and use its timestamp as the thread root
  const result = await say(
    `Starting workflow \`${workflowId}\` targeting \`${targetSubmodule}\`` +
    (issueRef ? ` (${issueRef})` : '') +
    '...',
  );

  const threadTs = typeof result === 'object' && 'ts' in result ? result.ts : undefined;
  if (!threadTs) {
    await say('Failed to create workflow thread.');
    return;
  }

  try {
    await sessionManager.startWorkflow(
      workflowId, targetSubmodule, issueRef, channel, threadTs,
    );
  } catch (err) {
    await say({
      text: `Failed to start workflow: ${err instanceof Error ? err.message : String(err)}`,
      thread_ts: threadTs,
    });
  }
}

async function handleList(
  say: SlackCommandMiddlewareArgs['say'],
  sessionManager: SessionManager,
): Promise<void> {
  const active = sessionManager.listActive();

  if (active.length === 0) {
    await say('No active workflow sessions.');
    return;
  }

  const lines = active.map((s) => {
    const elapsed = Math.round((Date.now() - s.createdAt) / 1000);
    return `- \`${s.workflowId}\` on \`${s.targetSubmodule}\` [${s.status}] (${elapsed}s)`;
  });

  await say(`*Active Sessions (${active.length})*\n${lines.join('\n')}`);
}
