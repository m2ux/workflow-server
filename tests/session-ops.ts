/**
 * Session-level operations over a harness client, shared by the integration
 * suites that drive a workflow through the MCP wire. One home for the planning
 * path layout, so a change to it moves every suite at once.
 */
import { expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Harness } from './e2e/harness.js';
import type { HistoryEntry } from '../src/schema/state.schema.js';

/** Absolute planning-folder path for a slug under a workspace. */
export function planningFolderPath(workspaceDir: string, slug: string): string {
  return join(workspaceDir, '.engineering/artifacts/planning', slug);
}

export interface SessionOps {
  /** Absolute planning folder for a slug under this harness's workspace. */
  folder(slug: string): string;
  /** The history array of the session file a slug's folder holds. */
  history(slug: string): HistoryEntry[];
  /** Open a session on the bound workflow, planning into the slug's folder. */
  start(slug: string, agentId: string, contextMode?: string): Promise<string>;
  /**
   * Enter an activity. `fromActivity` names the one the call is exiting, which every call but a
   * session's first owes: the retiring activity is resolved from what the call says rather than
   * inferred from what happens to be in flight.
   */
  enter(sessionIndex: string, activityId: string, fromActivity?: string): Promise<void>;
}

/** Bind the session operations to a connected harness and the workflow under test. */
export function sessionOps(h: Harness, workflowId: string): SessionOps {
  const folder = (slug: string) => planningFolderPath(h.workspaceDir, slug);
  /**
   * What this helper last entered, per session — what an orchestrator knows because it dispatched
   * it. `from_activity` is required whenever anything is in flight, so a caller that does not name
   * it explicitly gets the activity this helper put there.
   */
  const lastEntered = new Map<string, string>();
  return {
    folder,

    history(slug) {
      const state = JSON.parse(
        readFileSync(join(folder(slug), 'session.json'), 'utf8'),
      ) as { history: HistoryEntry[] };
      return state.history;
    },

    async start(slug, agentId, contextMode) {
      const result = await h.client.callTool({
        name: 'start_session',
        arguments: {
          workflow_id: workflowId,
          agent_id: agentId,
          planning_folder: folder(slug),
          ...(contextMode ? { context_mode: contextMode } : {}),
        },
      });
      expect(result.isError).toBeFalsy();
      const body = JSON.parse((result.content as Array<{ text: string }>)[0]!.text) as Record<string, unknown>;
      return body['session_index'] as string;
    },

    async enter(sessionIndex, activityId, fromActivity) {
      const exiting = fromActivity ?? lastEntered.get(sessionIndex);
      const result = await h.client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionIndex,
          activity_id: activityId,
          ...(exiting !== undefined ? { from_activity: exiting } : {}),
        },
      });
      expect(result.isError).toBeFalsy();
      lastEntered.set(sessionIndex, activityId);
    },
  };
}
