import type { WebClient } from '@slack/web-api';
import type { AcpClient, AcpAskQuestionParams, AcpQuestionResponse } from './acp-client.js';

type SlackBlock = Record<string, unknown>;

/**
 * Tracks a pending checkpoint waiting for a Slack interaction response.
 */
export interface PendingCheckpoint {
  acpRequestId: number;
  questions: AcpAskQuestionParams;
  slackChannel: string;
  slackThreadTs: string;
  /** Map from Slack action_id → { questionId, optionId } */
  actionMap: Map<string, { questionId: string; optionId: string }>;
  createdAt: number;
}

/**
 * Bridges ACP cursor/ask_question requests to Slack interactive messages
 * and routes Slack button clicks back as ACP responses.
 */
export class CheckpointBridge {
  /**
   * Keyed by a composite of channel + thread_ts so we can look up the
   * pending checkpoint when a Slack interaction arrives.
   */
  private pending = new Map<string, PendingCheckpoint>();

  constructor(private readonly slackClient: WebClient) {}

  /**
   * Called when the ACP client emits a cursor/ask_question request.
   * Posts an interactive message to the Slack thread and stores the
   * pending state for later resolution.
   */
  async presentCheckpoint(
    acpRequestId: number,
    params: AcpAskQuestionParams,
    channel: string,
    threadTs: string,
  ): Promise<void> {
    const actionMap = new Map<string, { questionId: string; optionId: string }>();
    const blocks: SlackBlock[] = [];

    if (params.title) {
      blocks.push({
        type: 'header',
        text: { type: 'plain_text', text: params.title, emoji: true },
      });
    }

    for (const question of params.questions) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: question.prompt },
      });

      const buttonElements = question.options.map((opt) => {
        const actionId = `checkpoint_${question.id}_${opt.id}`;
        actionMap.set(actionId, { questionId: question.id, optionId: opt.id });
        return {
          type: 'button' as const,
          text: { type: 'plain_text' as const, text: opt.label, emoji: true },
          action_id: actionId,
          value: opt.id,
        };
      });

      blocks.push({ type: 'actions', elements: buttonElements });
    }

    await this.slackClient.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: params.title ?? 'Workflow checkpoint',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks: blocks as any[],
    });

    const key = this.pendingKey(channel, threadTs);
    this.pending.set(key, {
      acpRequestId,
      questions: params,
      slackChannel: channel,
      slackThreadTs: threadTs,
      actionMap,
      createdAt: Date.now(),
    });
  }

  /**
   * Called when a Slack button interaction arrives. Resolves the pending
   * checkpoint by responding to the ACP client.
   *
   * @returns true if a pending checkpoint was resolved, false if none was found.
   */
  resolveCheckpoint(
    channel: string,
    threadTs: string,
    actionId: string,
    acpClient: AcpClient,
  ): boolean {
    const key = this.pendingKey(channel, threadTs);
    const checkpoint = this.pending.get(key);
    if (!checkpoint) return false;

    const mapping = checkpoint.actionMap.get(actionId);
    if (!mapping) return false;

    const responses: AcpQuestionResponse[] = [{
      questionId: mapping.questionId,
      selectedOptions: [mapping.optionId],
    }];

    acpClient.respond(checkpoint.acpRequestId, {
      outcome: { outcome: 'selected', responses },
    });

    this.pending.delete(key);
    return true;
  }

  /**
   * Check whether a thread has a pending checkpoint.
   */
  hasPending(channel: string, threadTs: string): boolean {
    return this.pending.has(this.pendingKey(channel, threadTs));
  }

  /**
   * Cancel all pending checkpoints (e.g. on agent crash).
   */
  cancelAll(channel: string, threadTs: string): void {
    this.pending.delete(this.pendingKey(channel, threadTs));
  }

  private pendingKey(channel: string, threadTs: string): string {
    return `${channel}:${threadTs}`;
  }
}
