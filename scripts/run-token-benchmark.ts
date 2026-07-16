/**
 * Headless delivery-cost benchmark for reference / persistent context mode.
 *
 * Walks `work-package` under the e2e `skip-optional` policy with the robot walker,
 * forcing `start_session` `agent_id` / `context_mode`, and probes `get_resource` for
 * technique-linked resources plus a fixed hot-template set on every `get_activity`
 * (cross-activity resource repeat tax). Prints one JSON metrics object to stdout.
 *
 * Usage (from a server checkout with `node_modules` and a `workflows/` worktree):
 *
 *   npm run bench:token -- --label=A0 --context-mode=fresh
 *   WORKFLOWS_DIR=/path/to/workflows npm run bench:token -- \
 *     --label=A3 --context-mode=persistent --server-root=$PWD
 *
 * Flags:
 *   --label=<string>           Run label in the JSON output (default: run)
 *   --context-mode=fresh|persistent   Forced on start_session (default: fresh)
 *   --agent-id=<string>        Forced agent_id / ledger key (default: bench-solo)
 *   --server-root=<path>       Server checkout root (default: cwd)
 *
 * Env:
 *   WORKFLOWS_DIR   Corpus root for the harness (default: <server-root>/workflows)
 *
 * Exit: 0 on completed walk; 2 if finalStatus !== completed; 1 on hard failure.
 *
 * See docs/development.md § "Token delivery benchmark" and docs/api-reference.md
 * § Reference Delivery.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { extractResourceIds } from '../src/utils/resource-ref.js';

type ContextMode = 'fresh' | 'persistent';

interface Metrics {
  label: string;
  contextMode: ContextMode;
  agentId: string;
  workflowsDir: string;
  serverRoot: string;
  path: string[];
  finalStatus: string;
  toolCalls: Record<string, number>;
  chars: Record<string, number>;
  history: {
    technique_bundled: number;
    technique_fetched: number;
    resource_fetched: number;
  };
  repeatedResources: Array<{ resourceId: string; count: number }>;
  contextModeOnDisk?: string;
  agentIdOnDisk?: string;
  deliveredContentKeys: number;
  resourceLedgerKeys: number;
  unchangedResourceAnswers: number;
  unchangedTechniqueAnswers: number;
  getActivityChars: number;
  getWorkflowChars: number;
  getResourceChars: number;
  getTechniqueChars: number;
}

function arg(name: string, fallback: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const HOT_RESOURCES = [
  'pr-description',
  'pr-description#template-initial',
  'pr-description#template-final',
  'pr-description#link-row-forms',
  'review-mode',
  'review-mode#consolidated-review-format',
  'review-mode#review-type-selection',
] as const;

/** Resource ids already delivered on get_activity's sibling `resources` map — skip re-fetch. */
function bundledResourceIdsFromOps(text: string): Set<string> {
  const opsYaml = text.split('\n\n---\n\n')[0] ?? '';
  try {
    const ops = parseYaml(opsYaml) as { resources?: Record<string, unknown> } | null;
    return new Set(Object.keys(ops?.resources ?? {}));
  } catch {
    return new Set();
  }
}

async function main(): Promise<void> {
  const label = arg('label', 'run');
  const contextMode = arg('context-mode', 'fresh') as ContextMode;
  if (contextMode !== 'fresh' && contextMode !== 'persistent') {
    throw new Error(`--context-mode must be fresh|persistent, got ${contextMode}`);
  }
  const agentId = arg('agent-id', 'bench-solo');
  const serverRoot = resolve(arg('server-root', process.cwd()));

  const harnessMod = await import(pathToFileURL(join(serverRoot, 'tests/e2e/harness.ts')).href) as typeof import('../tests/e2e/harness.js');
  const walkerMod = await import(pathToFileURL(join(serverRoot, 'tests/e2e/walker.ts')).href) as typeof import('../tests/e2e/walker.js');
  const policiesMod = await import(pathToFileURL(join(serverRoot, 'tests/e2e/policies.ts')).href) as typeof import('../tests/e2e/policies.js');

  const { createHarness, rawText } = harnessMod;
  const { walk } = walkerMod;
  const { skipOptionalPolicy } = policiesMod;

  const toolCalls: Record<string, number> = {};
  const chars: Record<string, number> = {};
  let unchangedResourceAnswers = 0;
  let unchangedTechniqueAnswers = 0;
  const seenResource = new Set<string>();
  let fetchingResources = false;

  const harness = await createHarness();
  const client = harness.client;
  const orig = client.callTool.bind(client);

  async function fetchResource(sessionIndex: string, resourceId: string): Promise<void> {
    const result = await orig({
      name: 'get_resource',
      arguments: { session_index: sessionIndex, resource_id: resourceId },
    });
    toolCalls.get_resource = (toolCalls.get_resource ?? 0) + 1;
    const text = rawText(result);
    chars.get_resource = (chars.get_resource ?? 0) + text.length;
    if ((result as { isError?: boolean }).isError) return;
    const delivery = (result as { _meta?: { delivery?: string } })._meta?.delivery;
    if (delivery === 'unchanged') unchangedResourceAnswers += 1;
  }

  client.callTool = (async (req: { name: string; arguments?: Record<string, unknown> }) => {
    const name = req.name;
    let args = { ...(req.arguments ?? {}) };

    if (name === 'start_session') {
      args = {
        ...args,
        agent_id: agentId,
        context_mode: contextMode,
      };
    }

    const result = await orig({ name, arguments: args });
    toolCalls[name] = (toolCalls[name] ?? 0) + 1;
    const text = rawText(result);
    chars[name] = (chars[name] ?? 0) + text.length;

    const delivery = (result as { _meta?: { delivery?: string } })._meta?.delivery;
    if (delivery === 'unchanged') {
      if (name === 'get_technique') unchangedTechniqueAnswers += 1;
    }

    if (fetchingResources) return result;

    // Worker-like resource loads from technique/activity link targets, plus a fixed
    // hot-template set re-fetched on every get_activity (cross-activity repeat tax).
    if ((name === 'get_technique' || name === 'get_activity') && !(result as { isError?: boolean }).isError) {
      const sessionIndex = String(args.session_index ?? '');
      fetchingResources = true;
      try {
        const alreadyBundled = name === 'get_activity' ? bundledResourceIdsFromOps(text) : new Set<string>();
        const fromContent = extractResourceIds(text);
        for (const resourceId of fromContent) {
          if (alreadyBundled.has(resourceId)) continue;
          if (seenResource.has(resourceId)) continue;
          seenResource.add(resourceId);
          await fetchResource(sessionIndex, resourceId);
        }
        if (name === 'get_activity') {
          for (const resourceId of HOT_RESOURCES) {
            // Hot set still probes repeat tax; skip only when this get_activity already bundled it.
            if (alreadyBundled.has(resourceId)) continue;
            await fetchResource(sessionIndex, resourceId);
          }
        }
      } finally {
        fetchingResources = false;
      }
    }

    return result;
  }) as typeof client.callTool;

  try {
    const walkResult = await walk(harness, 'work-package', skipOptionalPolicy, {
      agentId,
      mode: 'robot',
    });

    const planningFolder = join(
      harness.workspaceDir,
      '.engineering/artifacts/planning',
      walkResult.planningSlug,
    );
    const session = JSON.parse(readFileSync(join(planningFolder, 'session.json'), 'utf8')) as {
      contextMode?: string;
      agentId?: string;
      history?: Array<{ type: string; data?: { resourceId?: string } }>;
      deliveredContent?: Record<string, Record<string, string>>;
    };

    const history = session.history ?? [];
    const resourceCounts = new Map<string, number>();
    for (const e of history) {
      if (e.type === 'resource_fetched' && e.data?.resourceId) {
        resourceCounts.set(e.data.resourceId, (resourceCounts.get(e.data.resourceId) ?? 0) + 1);
      }
    }

    const ledger = session.deliveredContent?.[agentId] ?? {};
    const ledgerKeys = Object.keys(ledger);

    const metrics: Metrics = {
      label,
      contextMode,
      agentId,
      workflowsDir: process.env.WORKFLOWS_DIR ?? join(serverRoot, 'workflows'),
      serverRoot,
      path: walkResult.path,
      finalStatus: walkResult.finalStatus,
      toolCalls,
      chars,
      history: {
        technique_bundled: history.filter((e) => e.type === 'technique_bundled').length,
        technique_fetched: history.filter((e) => e.type === 'technique_fetched').length,
        resource_fetched: history.filter((e) => e.type === 'resource_fetched').length,
      },
      repeatedResources: [...resourceCounts.entries()]
        .filter(([, c]) => c > 1)
        .map(([resourceId, count]) => ({ resourceId, count }))
        .sort((a, b) => b.count - a.count),
      contextModeOnDisk: session.contextMode,
      agentIdOnDisk: session.agentId,
      deliveredContentKeys: ledgerKeys.length,
      resourceLedgerKeys: ledgerKeys.filter((k) => k.startsWith('resource:')).length,
      unchangedResourceAnswers,
      unchangedTechniqueAnswers,
      getActivityChars: chars.get_activity ?? 0,
      getWorkflowChars: chars.get_workflow ?? 0,
      getResourceChars: chars.get_resource ?? 0,
      getTechniqueChars: chars.get_technique ?? 0,
    };

    process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
    if (metrics.finalStatus !== 'completed') {
      process.stderr.write(`WARN: finalStatus=${metrics.finalStatus}\n`);
      process.exitCode = 2;
    }
  } finally {
    await harness.close();
  }
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
