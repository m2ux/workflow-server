import { loadDiscoveryCatalog } from './load-discovery-catalog.js';
import { presentDiscoverWorkflow, rankWorkflows } from './match-workflow.js';
import { statesResumeIntent } from './resume-intent.js';
import { scanSavedClientSessions, type SavedClientHit } from './scan-saved-clients.js';

export type OpeningIntent =
  | { kind: 'embed'; workflowId: string }
  | {
    kind: 'decision';
    decision: 'workflow-selection' | 'resume-session';
    candidates: Array<Record<string, unknown>>;
    recommendation: string;
  };

/**
 * Resolve whether a fresh durable meta start_session should embed a client
 * or yield an open decision. Does not create a session.
 */
export async function resolveOpeningIntent(args: {
  userRequest: string;
  workflowDir: string;
  targetWorkflowId?: string;
  fresh?: boolean;
  planningRootDir: string;
  planningRelativeDir?: string;
  searchRoots?: readonly string[];
}): Promise<OpeningIntent> {
  const catalog = await loadDiscoveryCatalog(args.workflowDir);
  const match = rankWorkflows(args.userRequest, catalog);
  const presented = presentDiscoverWorkflow(match);

  let workflowId: string | null = null;
  if (args.targetWorkflowId) {
    const pinned = catalog.find((entry) => entry.id === args.targetWorkflowId);
    if (!pinned) {
      return {
        kind: 'decision',
        decision: 'workflow-selection',
        candidates: presented.ranked.map((row) => ({ id: row.id, score: row.score, title: row.title })),
        recommendation:
          `target_workflow_id '${args.targetWorkflowId}' is not in the catalog. Pass one of the ranked ids, or omit the pin and retry.`,
      };
    }
    workflowId = pinned.id;
  } else if (match.workflow_id && !match.ambiguous) {
    workflowId = match.workflow_id;
  } else {
    return {
      kind: 'decision',
      decision: 'workflow-selection',
      candidates: presented.ranked.map((row) => ({ id: row.id, score: row.score, title: row.title })),
      recommendation: match.workflow_id
        ? `Several workflows match. Retry start_session with target_workflow_id set to the intended id (top hit: '${match.workflow_id}').`
        : 'No workflow scored against this request. Retry start_session with target_workflow_id set to a catalog id.',
    };
  }

  const resume = !args.fresh && statesResumeIntent(args.userRequest);
  if (resume) {
    const hits = await scanSavedClientSessions({
      workspaceDir: args.planningRootDir,
      workflowId,
      ...(args.planningRelativeDir ? { planningRelativeDir: args.planningRelativeDir } : {}),
      ...(args.searchRoots ? { searchRoots: args.searchRoots } : {}),
    });
    if (hits.length > 0) {
      return {
        kind: 'decision',
        decision: 'resume-session',
        candidates: hits.map(hitPayload),
        recommendation: hits.length === 1
          ? `Retry start_session with planning_folder '${hits[0]!.planning_folder}' to continue, or pass fresh: true to open a new client.`
          : 'Several saved sessions match. Retry start_session with planning_folder set to one candidate, or pass fresh: true to open a new client.',
      };
    }
  }

  return { kind: 'embed', workflowId };
}

function hitPayload(hit: SavedClientHit): Record<string, unknown> {
  return {
    session_index: hit.session_index,
    workflow_id: hit.workflow_id,
    planning_folder: hit.planning_folder,
    planning_slug: hit.planning_slug,
  };
}
