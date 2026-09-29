import { META_WORKFLOW_ID } from '../loaders/corpus-index.js';
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

/**
 * Facts a session is opened with, seeded into its bag and into every client it
 * opens. Paths are agent-facing: the host path a worker runs git and writes
 * artifacts against, never the server's own mount.
 */
export interface OpeningBagFacts {
  host_repo_path?: string;
  target_repo?: string;
  component_path?: string;
  is_monorepo?: boolean;
  planning_folder_path?: string;
}

/** Opening facts a child session inherits from its parent's bag. */
export const INHERITED_OPENING_FACTS = ['host_repo_path', 'target_repo', 'component_path', 'is_monorepo'] as const;

/** Facts a meta session gains when `start_session` opens its client in the same call. */
export const CLIENT_OPENING_FACTS = [
  'target_workflow_id',
  'workflow_match_ambiguous',
  'resume_intent_requested',
  'is_resuming',
  'client_session_index',
  'client_initial_activity',
] as const;

/**
 * Names the server seeds into a session's bag besides its declared defaults: the opening request,
 * the planning folder, the checkout facts, and a meta session's client facts. Each is present where
 * its source is — a request passed, a durable folder, a `working_directory`, a client opened — and
 * absent otherwise.
 */
export const SEEDED_VARIABLE_NAMES: ReadonlySet<string> = new Set([
  'user_request',
  'planning_folder_path',
  ...INHERITED_OPENING_FACTS,
  ...CLIENT_OPENING_FACTS,
]);

/** The facts that are set, as bag entries. */
export function openingFactEntries(facts: OpeningBagFacts): Record<string, unknown> {
  return Object.fromEntries(Object.entries(facts).filter(([, value]) => value !== undefined));
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
  const bagExtras = openingFactEntries(args.bagFacts ?? {});
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
      ...({
        target_workflow_id: childWorkflow.id,
        workflow_match_ambiguous: false,
        resume_intent_requested: false,
        is_resuming: false,
        client_session_index: childSessionIndex,
        client_initial_activity: childWorkflow.initialActivity,
      } satisfies Record<(typeof CLIENT_OPENING_FACTS)[number], unknown>),
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
