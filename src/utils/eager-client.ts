import { META_WORKFLOW_ID } from '../loaders/fragment-resolver.js';
import { loadWorkflow } from '../loaders/workflow-loader.js';
import { createInitialSessionFile, type SessionFile } from '../schema/session.schema.js';
import { advanceSession, computeEmbeddedSessionIndex } from './session/index.js';
import { seedDefaults } from './variable-seed.js';

export interface EagerClient {
  session_index: string;
  workflow: {
    id: string;
    version: string | undefined;
    initialActivity: string | undefined;
  };
}

export interface EagerOpenResult {
  parent: SessionFile;
  client: EagerClient;
}

export interface OpeningBagFacts {
  host_repo_path?: string;
  target_repo?: string;
  component_path?: string;
  is_monorepo?: boolean;
}

/**
 * Embed a client workflow under a fresh meta parent in memory. Ranking, resume
 * gates, and open decisions are resolved before this runs
 * (`resolveOpeningIntent`). Persists nothing — the caller writes `session.json`
 * once, with the embedded parent.
 */
export async function tryEagerClientDispatch(args: {
  parent: SessionFile;
  parentFolder: string;
  workflowDir: string;
  workflowId: string;
  bagFacts?: OpeningBagFacts;
}): Promise<EagerOpenResult> {
  if (args.parent.workflowId !== META_WORKFLOW_ID) {
    throw new Error(
      `tryEagerClientDispatch: parent workflow is '${args.parent.workflowId}', not meta`,
    );
  }
  if (args.parent.triggeredWorkflows.length > 0) {
    throw new Error('tryEagerClientDispatch: parent already has a triggered workflow');
  }

  const wfResult = await loadWorkflow(args.workflowDir, args.workflowId);
  if (!wfResult.success) throw wfResult.error;
  const childWorkflow = wfResult.value;
  const triggeredAt = new Date().toISOString();
  const childJsonPath = ['triggeredWorkflows', 0, 'state'];
  const childSessionIndex = await computeEmbeddedSessionIndex(args.parentFolder, childJsonPath);
  const inheritedRequest = args.parent.variables?.['user_request'];
  const facts = args.bagFacts ?? {};
  const bagExtras: Record<string, unknown> = {
    ...(facts.host_repo_path !== undefined ? { host_repo_path: facts.host_repo_path } : {}),
    ...(facts.target_repo !== undefined ? { target_repo: facts.target_repo } : {}),
    ...(facts.component_path !== undefined ? { component_path: facts.component_path } : {}),
    ...(facts.is_monorepo !== undefined ? { is_monorepo: facts.is_monorepo } : {}),
  };
  const childInitial = createInitialSessionFile({
    sessionIndex: childSessionIndex,
    workflowId: childWorkflow.id,
    workflowVersion: childWorkflow.version ?? '',
    agentId: 'orchestrator',
    ...(args.parent.repo ? { repo: args.parent.repo } : {}),
    ...(args.parent.contextMode ? { contextMode: args.parent.contextMode } : {}),
    variables: {
      ...seedDefaults(childWorkflow.variables),
      ...(inheritedRequest !== undefined ? { user_request: inheritedRequest } : {}),
      ...bagExtras,
    },
  });

  const parent = advanceSession(args.parent, (draft) => {
    draft.variables = {
      ...draft.variables,
      ...bagExtras,
      target_workflow_id: childWorkflow.id,
      workflow_match_ambiguous: false,
      resume_intent_requested: false,
      is_resuming: false,
      client_session_index: childSessionIndex,
      client_initial_activity: childWorkflow.initialActivity,
    };
    draft.triggeredWorkflows.push({
      workflowId: childWorkflow.id,
      sessionIndex: childSessionIndex,
      triggeredAt,
      triggeredFrom: { activityId: 'start_session' },
      status: 'running',
      state: childInitial,
    });
    draft.history.push({
      timestamp: triggeredAt,
      type: 'workflow_triggered',
      activity: 'start_session',
      data: { workflowId: childWorkflow.id, sessionIndex: childSessionIndex },
    });
  });

  return {
    parent,
    client: {
      session_index: childSessionIndex,
      workflow: {
        id: childWorkflow.id,
        version: childWorkflow.version,
        initialActivity: childWorkflow.initialActivity,
      },
    },
  };
}
