import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckpointBridge } from '../../src/runner/checkpoint-bridge.js';
import type { AcpClient, AcpAskQuestionParams } from '../../src/runner/acp-client.js';

function createMockSlackClient() {
  return {
    chat: {
      postMessage: vi.fn().mockResolvedValue({ ok: true, ts: '1234567890.123456' }),
    },
  };
}

function createMockAcpClient() {
  return {
    respond: vi.fn(),
  } as unknown as AcpClient;
}

const SAMPLE_CHECKPOINT: AcpAskQuestionParams = {
  title: 'Review Checkpoint',
  questions: [{
    id: 'proceed',
    prompt: 'The analysis is complete. How would you like to proceed?',
    options: [
      { id: 'continue', label: 'Continue to implementation' },
      { id: 'revise', label: 'Revise the plan' },
      { id: 'abort', label: 'Abort workflow' },
    ],
  }],
};

describe('CheckpointBridge', () => {
  let bridge: CheckpointBridge;
  let slackClient: ReturnType<typeof createMockSlackClient>;

  beforeEach(() => {
    slackClient = createMockSlackClient();
    bridge = new CheckpointBridge(slackClient as any);
  });

  it('should post an interactive message to Slack on presentCheckpoint', async () => {
    await bridge.presentCheckpoint(42, SAMPLE_CHECKPOINT, 'C123', '1234.5678');

    expect(slackClient.chat.postMessage).toHaveBeenCalledOnce();
    const call = slackClient.chat.postMessage.mock.calls[0]![0]!;
    expect(call.channel).toBe('C123');
    expect(call.thread_ts).toBe('1234.5678');
    expect(call.blocks).toBeDefined();
    expect(call.blocks.length).toBe(3); // header + section + actions
  });

  it('should create a pending checkpoint', async () => {
    await bridge.presentCheckpoint(42, SAMPLE_CHECKPOINT, 'C123', '1234.5678');

    expect(bridge.hasPending('C123', '1234.5678')).toBe(true);
    expect(bridge.hasPending('C123', 'other')).toBe(false);
  });

  it('should resolve checkpoint when correct action is clicked', async () => {
    await bridge.presentCheckpoint(42, SAMPLE_CHECKPOINT, 'C123', '1234.5678');

    const acpClient = createMockAcpClient();
    const resolved = bridge.resolveCheckpoint(
      'C123', '1234.5678', 'checkpoint_proceed_continue', acpClient,
    );

    expect(resolved).toBe(true);
    expect(acpClient.respond).toHaveBeenCalledWith(42, {
      outcome: {
        outcome: 'selected',
        responses: [{ questionId: 'proceed', selectedOptions: ['continue'] }],
      },
    });

    expect(bridge.hasPending('C123', '1234.5678')).toBe(false);
  });

  it('should return false for unknown action', async () => {
    await bridge.presentCheckpoint(42, SAMPLE_CHECKPOINT, 'C123', '1234.5678');

    const acpClient = createMockAcpClient();
    const resolved = bridge.resolveCheckpoint(
      'C123', '1234.5678', 'checkpoint_unknown_action', acpClient,
    );

    expect(resolved).toBe(false);
    expect(acpClient.respond).not.toHaveBeenCalled();
    expect(bridge.hasPending('C123', '1234.5678')).toBe(true);
  });

  it('should return false when no pending checkpoint exists', () => {
    const acpClient = createMockAcpClient();
    const resolved = bridge.resolveCheckpoint(
      'C999', '0000.0000', 'checkpoint_proceed_continue', acpClient,
    );

    expect(resolved).toBe(false);
  });

  it('should cancel all pending checkpoints', async () => {
    await bridge.presentCheckpoint(42, SAMPLE_CHECKPOINT, 'C123', '1234.5678');
    expect(bridge.hasPending('C123', '1234.5678')).toBe(true);

    bridge.cancelAll('C123', '1234.5678');
    expect(bridge.hasPending('C123', '1234.5678')).toBe(false);
  });

  it('should render multiple questions in blocks', async () => {
    const multiQ: AcpAskQuestionParams = {
      title: 'Multi',
      questions: [
        { id: 'q1', prompt: 'First?', options: [{ id: 'a', label: 'A' }] },
        { id: 'q2', prompt: 'Second?', options: [{ id: 'b', label: 'B' }] },
      ],
    };

    await bridge.presentCheckpoint(10, multiQ, 'C123', '1234.5678');

    const call = slackClient.chat.postMessage.mock.calls[0]![0]!;
    // header + (section + actions) * 2 = 5 blocks
    expect(call.blocks.length).toBe(5);
  });
});
