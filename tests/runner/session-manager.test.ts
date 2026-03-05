import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { SessionManager } from '../../src/runner/session-manager.js';
import type { RunnerConfig } from '../../src/runner/config.js';

// ---------------------------------------------------------------------------
// Module-level mock instance handles
// ---------------------------------------------------------------------------

let mockAcpInstance: any;
let mockWorktreeInstance: any;
let mockCheckpointInstance: any;
let promptDeferred: { resolve: (v: unknown) => void; reject: (e: Error) => void };

vi.mock('../../src/runner/acp-client.js', () => ({
  AcpClient: vi.fn().mockImplementation(() => {
    let res: (v: unknown) => void;
    let rej: (e: Error) => void;
    const promise = new Promise<unknown>((r, j) => { res = r; rej = j; });
    promptDeferred = { resolve: res!, reject: rej! };

    mockAcpInstance = Object.assign(new EventEmitter(), {
      spawn: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
      authenticate: vi.fn().mockResolvedValue(undefined),
      createSession: vi.fn().mockResolvedValue('sess-123'),
      prompt: vi.fn().mockReturnValue(promise),
      respond: vi.fn(),
      kill: vi.fn(),
      pid: 12345,
      active: true,
    });
    return mockAcpInstance;
  }),
}));

vi.mock('../../src/runner/worktree-manager.js', () => ({
  WorktreeManager: vi.fn().mockImplementation(() => {
    mockWorktreeInstance = {
      create: vi.fn().mockResolvedValue({
        runId: 'test-run',
        path: '/tmp/worktrees/wf-runner-test-run',
        branch: 'wf-runner/test-run',
        targetSubmodule: 'midnight-node',
      }),
      cleanup: vi.fn().mockResolvedValue(undefined),
      sweepOrphaned: vi.fn().mockResolvedValue(0),
    };
    return mockWorktreeInstance;
  }),
}));

vi.mock('../../src/runner/checkpoint-bridge.js', () => ({
  CheckpointBridge: vi.fn().mockImplementation(() => {
    mockCheckpointInstance = {
      presentCheckpoint: vi.fn().mockResolvedValue(undefined),
      resolveCheckpoint: vi.fn().mockReturnValue(true),
      hasPending: vi.fn().mockReturnValue(false),
      cancelAll: vi.fn(),
    };
    return mockCheckpointInstance;
  }),
}));

vi.mock('../../src/runner/logger.js', () => ({
  createChildLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const tick = () => new Promise((r) => setTimeout(r, 10));

const MOCK_CONFIG: RunnerConfig = {
  slack: {
    botToken: 'xoxb-test',
    signingSecret: 'test-secret',
    appToken: 'xapp-test',
  },
  cursor: {
    apiKey: 'test-key',
    agentBinary: 'agent',
  },
  repo: {
    path: '/repo',
    worktreeBaseDir: '/tmp/worktrees',
  },
  mcpServers: {},
};

function createMockSlackClient() {
  return {
    chat: {
      postMessage: vi.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
    },
  };
}

function createMockStore() {
  return {
    open: vi.fn(),
    save: vi.fn(),
    load: vi.fn(),
    loadActive: vi.fn().mockReturnValue([]),
    updateStatus: vi.fn(),
    close: vi.fn(),
  };
}

function clearSessionTimers(manager: SessionManager): void {
  const sessions = (manager as any).sessions as Map<string, any>;
  for (const session of sessions.values()) {
    if (session.updateTimer) {
      clearInterval(session.updateTimer);
      session.updateTimer = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionManager', () => {
  let manager: SessionManager;
  let slackClient: ReturnType<typeof createMockSlackClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    slackClient = createMockSlackClient();
    manager = new SessionManager(MOCK_CONFIG, slackClient as any);
  });

  afterEach(async () => {
    clearSessionTimers(manager);
    await manager.shutdownAll();
  });

  it('should start a workflow and return a running session', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', 'PM-123', 'C123', '1234.5678',
    );

    expect(session.status).toBe('running');
    expect(session.workflowId).toBe('work-package');
    expect(session.targetSubmodule).toBe('midnight-node');
    expect(session.issueRef).toBe('PM-123');
    expect(session.worktree).toBeDefined();
    expect(session.acpClient).toBeDefined();

    expect(mockWorktreeInstance.create).toHaveBeenCalledOnce();
    expect(mockAcpInstance.spawn).toHaveBeenCalledOnce();
    expect(mockAcpInstance.initialize).toHaveBeenCalledOnce();
    expect(mockAcpInstance.authenticate).toHaveBeenCalledOnce();
    expect(mockAcpInstance.createSession).toHaveBeenCalledOnce();
    expect(mockAcpInstance.prompt).toHaveBeenCalledOnce();
  });

  it('should post Slack status messages during startup', async () => {
    await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    expect(slackClient.chat.postMessage).toHaveBeenCalled();
    const texts = slackClient.chat.postMessage.mock.calls.map(
      (c: any[]) => c[0]?.text as string,
    );
    expect(texts.some((t) => t.includes('Creating worktree'))).toBe(true);
    expect(texts.some((t) => t.includes('started'))).toBe(true);
  });

  it('should look up session by Slack thread', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    expect(manager.getByThread('C123', '1234.5678')).toBe(session);
    expect(manager.getByThread('C999', '0000.0000')).toBeUndefined();
  });

  it('should list active sessions', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    const active = manager.listActive();
    expect(active).toHaveLength(1);
    expect(active[0]!.id).toBe(session.id);
  });

  it('should forward checkpoint responses to the bridge', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );
    session.status = 'awaiting_checkpoint';

    const resolved = manager.handleCheckpointResponse(
      'C123', '1234.5678', 'checkpoint_q1_yes',
    );

    expect(resolved).toBe(true);
    expect(mockCheckpointInstance.resolveCheckpoint).toHaveBeenCalledWith(
      'C123', '1234.5678', 'checkpoint_q1_yes', session.acpClient,
    );
    expect(session.status).toBe('running');
  });

  it('should return false for checkpoint response without matching session', () => {
    expect(manager.handleCheckpointResponse('C999', '0000', 'x')).toBe(false);
  });

  it('should shut down all active sessions', async () => {
    await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    clearSessionTimers(manager);
    await manager.shutdownAll();

    expect(mockAcpInstance.kill).toHaveBeenCalled();
    expect(mockWorktreeInstance.cleanup).toHaveBeenCalled();
    expect(manager.listActive()).toHaveLength(0);
  });

  it('should handle ACP close event by setting error status', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    mockAcpInstance.emit('close', 1);
    await tick();

    expect(session.status).toBe('error');
    expect(session.error).toContain('exited unexpectedly');
    expect(mockCheckpointInstance.cancelAll).toHaveBeenCalledWith('C123', '1234.5678');
  });

  it('should handle prompt completion', async () => {
    const session = await manager.startWorkflow(
      'work-package', 'midnight-node', undefined, 'C123', '1234.5678',
    );

    promptDeferred.resolve({ stopReason: 'end_turn' });
    await tick();

    expect(session.status).toBe('completed');
    expect(session.completedAt).toBeGreaterThan(0);
  });

  it('should mark stale sessions as error on construction with store', () => {
    const store = createMockStore();
    store.loadActive.mockReturnValue([
      { id: 'stale-1', status: 'running' },
      { id: 'stale-2', status: 'creating' },
    ]);

    const mgr = new SessionManager(MOCK_CONFIG, slackClient as any, store as any);

    expect(store.updateStatus).toHaveBeenCalledWith(
      'stale-1', 'error', 'Stale session from previous run',
    );
    expect(store.updateStatus).toHaveBeenCalledWith(
      'stale-2', 'error', 'Stale session from previous run',
    );

    // no sessions were added to this manager, shutdown is a no-op
    void mgr.shutdownAll();
  });

  it('should persist session to store when provided', async () => {
    const store = createMockStore();
    const mgr = new SessionManager(MOCK_CONFIG, slackClient as any, store as any);

    const session = await mgr.startWorkflow(
      'work-package', 'midnight-node', 'PM-123', 'C123', '1234.5678',
    );

    expect(store.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: session.id,
        workflowId: 'work-package',
        targetSubmodule: 'midnight-node',
        issueRef: 'PM-123',
        status: 'creating',
      }),
    );
    expect(store.updateStatus).toHaveBeenCalledWith(session.id, 'running');

    clearSessionTimers(mgr);
    await mgr.shutdownAll();
  });
});
