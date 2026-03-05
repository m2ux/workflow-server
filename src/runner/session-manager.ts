import type { WebClient } from '@slack/web-api';
import { AcpClient, type AcpSessionUpdate } from './acp-client.js';
import { CheckpointBridge } from './checkpoint-bridge.js';
import { WorktreeManager, type WorktreeInfo } from './worktree-manager.js';
import type { RunnerConfig } from './config.js';

// ---------------------------------------------------------------------------
// Session types
// ---------------------------------------------------------------------------

export type SessionStatus =
  | 'creating'
  | 'running'
  | 'awaiting_checkpoint'
  | 'completed'
  | 'error';

export interface WorkflowSession {
  id: string;
  status: SessionStatus;
  workflowId: string;
  targetSubmodule: string;
  issueRef: string | undefined;
  slackChannel: string;
  slackThreadTs: string;
  worktree: WorktreeInfo | null;
  acpClient: AcpClient | null;
  createdAt: number;
  completedAt: number | undefined;
  error: string | undefined;
  /** Accumulated agent text for periodic Slack updates. */
  pendingText: string;
  /** Timer handle for batched Slack status posts. */
  updateTimer: ReturnType<typeof setInterval> | null;
}

// ---------------------------------------------------------------------------
// Session Manager
// ---------------------------------------------------------------------------

const STATUS_POST_INTERVAL_MS = 5_000;
const MAX_SLACK_TEXT_LENGTH = 3_000;

export class SessionManager {
  private sessions = new Map<string, WorkflowSession>();
  /** Reverse lookup: Slack thread → session ID */
  private threadToSession = new Map<string, string>();

  private worktreeManager: WorktreeManager;
  private checkpointBridge: CheckpointBridge;

  constructor(
    private readonly config: RunnerConfig,
    private readonly slackClient: WebClient,
  ) {
    this.worktreeManager = new WorktreeManager(config.repo.path, config.repo.worktreeBaseDir);
    this.checkpointBridge = new CheckpointBridge(slackClient);
  }

  /**
   * Start a new workflow run: create worktree, spawn agent, send prompt.
   */
  async startWorkflow(
    workflowId: string,
    targetSubmodule: string,
    issueRef: string | undefined,
    slackChannel: string,
    slackThreadTs: string,
  ): Promise<WorkflowSession> {
    const id = this.generateId();

    const session: WorkflowSession = {
      id,
      status: 'creating',
      workflowId,
      targetSubmodule,
      issueRef,
      slackChannel,
      slackThreadTs,
      worktree: null,
      acpClient: null,
      createdAt: Date.now(),
      completedAt: undefined,
      error: undefined,
      pendingText: '',
      updateTimer: null,
    };

    this.sessions.set(id, session);
    this.threadToSession.set(`${slackChannel}:${slackThreadTs}`, id);

    try {
      await this.postStatus(session, `Creating worktree for \`${targetSubmodule}\`...`);

      session.worktree = await this.worktreeManager.create(
        id, 'main', targetSubmodule, this.config.mcpServers as Record<string, import('./config.js').McpServerConfig>,
      );
      session.status = 'running';

      const acp = new AcpClient(this.config.cursor.agentBinary, this.config.cursor.apiKey);
      session.acpClient = acp;

      this.wireAcpEvents(session, acp);

      acp.spawn(session.worktree.path);
      await acp.initialize();
      await acp.authenticate();
      await acp.createSession(
        session.worktree.path,
        this.config.mcpServers as unknown as Record<string, import('./acp-client.js').McpServerEntry>,
      );

      this.startUpdateTimer(session);

      await this.postStatus(session, `Workflow \`${workflowId}\` started. Agent is running...`);

      const prompt = this.buildPrompt(workflowId, targetSubmodule, issueRef);

      // prompt() is long-running — it resolves when the agent finishes.
      // Checkpoints and updates are handled via events in the meantime.
      acp.prompt(prompt).then(
        (result) => this.handleCompletion(session, result),
        (err: unknown) => this.handleError(session, err instanceof Error ? err : new Error(String(err))),
      );

      return session;
    } catch (err) {
      await this.handleError(session, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Look up a session by its Slack thread.
   */
  getByThread(channel: string, threadTs: string): WorkflowSession | undefined {
    const id = this.threadToSession.get(`${channel}:${threadTs}`);
    return id ? this.sessions.get(id) : undefined;
  }

  /**
   * Handle a Slack button click for a checkpoint response.
   */
  handleCheckpointResponse(channel: string, threadTs: string, actionId: string): boolean {
    const session = this.getByThread(channel, threadTs);
    if (!session?.acpClient) return false;

    const resolved = this.checkpointBridge.resolveCheckpoint(
      channel, threadTs, actionId, session.acpClient,
    );
    if (resolved) {
      session.status = 'running';
    }
    return resolved;
  }

  /**
   * List active sessions.
   */
  listActive(): WorkflowSession[] {
    return [...this.sessions.values()].filter(
      (s) => s.status === 'running' || s.status === 'awaiting_checkpoint' || s.status === 'creating',
    );
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private wireAcpEvents(session: WorkflowSession, acp: AcpClient): void {
    acp.on('ask_question', async (requestId, params) => {
      session.status = 'awaiting_checkpoint';
      await this.flushPendingText(session);
      await this.checkpointBridge.presentCheckpoint(
        requestId, params, session.slackChannel, session.slackThreadTs,
      );
    });

    acp.on('request_permission', (requestId, _params) => {
      // Auto-approve all permission requests in PoC.
      // The .cursor/cli.json allowlist handles most cases; this catches stragglers.
      acp.respond(requestId, {
        outcome: { outcome: 'selected', optionId: 'allow-always' },
      });
    });

    acp.on('create_plan', (requestId, _params) => {
      // Auto-approve plans — the workflow orchestrator manages flow control.
      acp.respond(requestId, { accepted: true });
    });

    acp.on('update', (update: AcpSessionUpdate) => {
      if (update.sessionUpdate === 'agent_message_chunk' && update.content?.text) {
        session.pendingText += update.content.text;
      }
    });

    acp.on('error', async (err) => {
      console.error(`[session ${session.id}] ACP error:`, err.message);
    });

    acp.on('close', async (code) => {
      if (session.status !== 'completed' && session.status !== 'error') {
        await this.handleError(session, new Error(`Agent process exited unexpectedly (code ${code})`));
      }
    });
  }

  private buildPrompt(workflowId: string, targetSubmodule: string, issueRef?: string): string {
    const parts = [`Start workflow: ${workflowId}`];
    parts.push(`Target: ${targetSubmodule}`);
    if (issueRef) parts.push(`Issue: ${issueRef}`);
    return parts.join('\n');
  }

  private async handleCompletion(session: WorkflowSession, result: unknown): Promise<void> {
    session.status = 'completed';
    session.completedAt = Date.now();
    this.stopUpdateTimer(session);
    await this.flushPendingText(session);

    const elapsed = Math.round((session.completedAt - session.createdAt) / 1000);
    await this.postStatus(session,
      `Workflow \`${session.workflowId}\` completed in ${elapsed}s.` +
      (result && typeof result === 'object' && 'stopReason' in result
        ? ` Stop reason: ${(result as { stopReason: string }).stopReason}`
        : ''),
    );

    await this.cleanupSession(session);
  }

  private async handleError(session: WorkflowSession, err: Error): Promise<void> {
    session.status = 'error';
    session.error = err.message;
    session.completedAt = Date.now();
    this.stopUpdateTimer(session);
    await this.flushPendingText(session);
    this.checkpointBridge.cancelAll(session.slackChannel, session.slackThreadTs);

    await this.postStatus(session, `Workflow error: ${err.message}`);
    await this.cleanupSession(session);
  }

  private async cleanupSession(session: WorkflowSession): Promise<void> {
    session.acpClient?.kill();
    if (session.worktree) {
      try {
        await this.worktreeManager.cleanup(session.worktree);
      } catch (err) {
        console.error(`[session ${session.id}] Worktree cleanup failed:`, err);
      }
    }
  }

  private startUpdateTimer(session: WorkflowSession): void {
    session.updateTimer = setInterval(() => {
      void this.flushPendingText(session);
    }, STATUS_POST_INTERVAL_MS);
  }

  private stopUpdateTimer(session: WorkflowSession): void {
    if (session.updateTimer) {
      clearInterval(session.updateTimer);
      session.updateTimer = null;
    }
  }

  private async flushPendingText(session: WorkflowSession): Promise<void> {
    if (!session.pendingText.trim()) return;

    let text = session.pendingText.trim();
    session.pendingText = '';

    if (text.length > MAX_SLACK_TEXT_LENGTH) {
      text = '...' + text.slice(-MAX_SLACK_TEXT_LENGTH);
    }

    await this.postStatus(session, text);
  }

  private async postStatus(session: WorkflowSession, text: string): Promise<void> {
    try {
      await this.slackClient.chat.postMessage({
        channel: session.slackChannel,
        thread_ts: session.slackThreadTs,
        text,
      });
    } catch (err) {
      console.error(`[session ${session.id}] Failed to post to Slack:`, err);
    }
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
