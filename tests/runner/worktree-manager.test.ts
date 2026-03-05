import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { WorktreeManager } from '../../src/runner/worktree-manager.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn((_cmd: string, _args: string[], _opts: unknown, cb?: Function) => {
    if (cb) cb(null, '', '');
  }),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
}));

describe('WorktreeManager', () => {
  let manager: WorktreeManager;
  const mockExecFile = vi.mocked(execFile);

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new WorktreeManager('/repo', '/tmp/worktrees');

    mockExecFile.mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb?: any) => {
        if (typeof cb === 'function') cb(null, '', '');
        return undefined as any;
      },
    );
  });

  it('should create a worktree with correct git commands', async () => {
    const info = await manager.create('abc123', 'main', 'midnight-node', {});

    expect(info.runId).toBe('abc123');
    expect(info.path).toBe('/tmp/worktrees/run-abc123');
    expect(info.branch).toBe('runner/abc123');
    expect(info.targetSubmodule).toBe('midnight-node');

    const calls = mockExecFile.mock.calls;

    // First call: git worktree add
    expect(calls[0]![0]).toBe('git');
    expect(calls[0]![1]).toEqual(
      ['worktree', 'add', '/tmp/worktrees/run-abc123', '-b', 'runner/abc123', 'main'],
    );
    expect((calls[0]![2] as any).cwd).toBe('/repo');

    // Second call: git submodule update --init
    expect(calls[1]![0]).toBe('git');
    expect(calls[1]![1]).toEqual(['submodule', 'update', '--init', 'midnight-node']);
    expect((calls[1]![2] as any).cwd).toBe('/tmp/worktrees/run-abc123');

    // .cursor/cli.json was written
    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      '/tmp/worktrees/run-abc123/.cursor/cli.json',
      expect.stringContaining('permissions'),
    );
  });

  it('should write MCP config when mcpServers are provided', async () => {
    await manager.create('def456', 'main', undefined, {
      'workflow-server': {
        command: 'node',
        args: ['dist/index.js'],
        env: undefined,
      },
    });

    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      '/tmp/worktrees/run-def456/.cursor/mcp.json',
      expect.stringContaining('workflow-server'),
    );
  });

  it('should not write mcp.json when no MCP servers configured', async () => {
    await manager.create('ghi789', 'main', undefined, {});

    const writeFileCalls = vi.mocked(writeFile).mock.calls;
    const mcpWrite = writeFileCalls.find((c) => String(c[0]).includes('mcp.json'));
    expect(mcpWrite).toBeUndefined();
  });

  it('should cleanup worktree and branch', async () => {
    await manager.cleanup({
      runId: 'abc123',
      path: '/tmp/worktrees/run-abc123',
      branch: 'runner/abc123',
      targetSubmodule: 'midnight-node',
    });

    const calls = mockExecFile.mock.calls;

    // git worktree remove
    expect(calls[0]![0]).toBe('git');
    expect(calls[0]![1]).toEqual(
      ['worktree', 'remove', '/tmp/worktrees/run-abc123', '--force'],
    );
    expect((calls[0]![2] as any).cwd).toBe('/repo');

    // git branch -D
    expect(calls[1]![0]).toBe('git');
    expect(calls[1]![1]).toEqual(['branch', '-D', 'runner/abc123']);
    expect((calls[1]![2] as any).cwd).toBe('/repo');
  });
});
