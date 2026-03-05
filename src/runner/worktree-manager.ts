import { execFile } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { McpServerConfig } from './config.js';

const exec = promisify(execFile);

export interface WorktreeInfo {
  runId: string;
  path: string;
  branch: string;
  targetSubmodule: string | undefined;
}

const AUTO_APPROVE_PERMISSIONS = {
  permissions: {
    allow: [
      'Mcp(workflow-server:*)',
      'Mcp(atlassian:*)',
      'Mcp(gitnexus:*)',
      'Mcp(concept-rag:*)',
      'Shell(git)',
      'Shell(cargo)',
      'Shell(npm)',
      'Shell(npx)',
      'Shell(ls)',
      'Shell(head)',
      'Read(**)',
      'Write(**)',
      'WebFetch(*)',
    ],
    deny: [
      'Shell(rm)',
    ],
  },
};

export class WorktreeManager {
  constructor(
    private readonly repoPath: string,
    private readonly baseDir: string,
  ) {}

  /**
   * Create a new git worktree for a workflow run.
   */
  async create(
    runId: string,
    baseBranch: string = 'main',
    targetSubmodule?: string,
    mcpServers: Record<string, McpServerConfig> = {},
  ): Promise<WorktreeInfo> {
    await mkdir(this.baseDir, { recursive: true });

    const worktreePath = path.join(this.baseDir, `run-${runId}`);
    const branchName = `runner/${runId}`;

    await exec('git', ['worktree', 'add', worktreePath, '-b', branchName, baseBranch], {
      cwd: this.repoPath,
    });

    if (targetSubmodule) {
      await exec('git', ['submodule', 'update', '--init', targetSubmodule], {
        cwd: worktreePath,
      });
    }

    await this.placeCursorConfig(worktreePath, mcpServers);

    return { runId, path: worktreePath, branch: branchName, targetSubmodule };
  }

  /**
   * Remove a worktree and its branch after a workflow run completes.
   */
  async cleanup(info: WorktreeInfo): Promise<void> {
    try {
      await exec('git', ['worktree', 'remove', info.path, '--force'], {
        cwd: this.repoPath,
      });
    } catch {
      // Worktree may already be removed; force-delete the directory
      await rm(info.path, { recursive: true, force: true });
      await exec('git', ['worktree', 'prune'], { cwd: this.repoPath });
    }

    try {
      await exec('git', ['branch', '-D', info.branch], { cwd: this.repoPath });
    } catch {
      // Branch may not exist if worktree creation failed partway
    }
  }

  /**
   * Place .cursor/mcp.json and .cursor/cli.json in the worktree so the
   * Cursor agent picks up MCP servers and auto-approved permissions.
   */
  private async placeCursorConfig(
    worktreePath: string,
    mcpServers: Record<string, McpServerConfig>,
  ): Promise<void> {
    const cursorDir = path.join(worktreePath, '.cursor');
    await mkdir(cursorDir, { recursive: true });

    if (Object.keys(mcpServers).length > 0) {
      const mcpConfig = { mcpServers };
      await writeFile(
        path.join(cursorDir, 'mcp.json'),
        JSON.stringify(mcpConfig, null, 2),
      );
    }

    await writeFile(
      path.join(cursorDir, 'cli.json'),
      JSON.stringify(AUTO_APPROVE_PERMISSIONS, null, 2),
    );
  }
}
