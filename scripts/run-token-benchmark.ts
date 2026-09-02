/**
 * Headless delivery-cost benchmark for reference / persistent context mode.
 *
 * Walks one workflow (`--workflow`, default `work-package`) under the e2e `skip-optional` policy with the robot walker,
 * forcing `start_session` `agent_id` / `context_mode`, and probes `get_resource` for
 * technique-linked resources plus a fixed hot-template set on every `get_activity`
 * (cross-activity resource repeat tax). Prints one JSON metrics object to stdout.
 *
 * By default, stdout also includes `vsReference`: relative deltas against the committed
 * baseline fixture (`scripts/fixtures/token-benchmark-baseline.json`). A compact
 * scorecard is written to stderr.
 *
 * `--gate` is what the Verify workflow runs, at the 1% default. Re-recording it, and why the
 * fixture must name the corpus commit under review: docs/development.md § Token delivery benchmark.
 *
 * Usage (from a server checkout with `node_modules` and a `workflows/` worktree):
 *
 *   npm run bench:token -- --label=check --context-mode=fresh --gate
 *   npm run bench:token -- --label=opt --context-mode=persistent
 *   WORKFLOWS_DIR=/path/to/workflows npm run bench:token -- \
 *     --label=rerecord --context-mode=fresh --no-compare --server-root=$PWD
 *
 * Flags:
 *   --workflow=<id>            Workflow to walk (default: work-package). Recorded in the output; a
 *                              comparison across two different workflows is reported but never gated.
 *   --label=<string>           Run label in the JSON output (default: run)
 *   --context-mode=fresh|persistent   Forced on start_session (default: fresh)
 *   --agent-id=<string>        Forced agent_id / ledger key (default: bench-solo)
 *   --server-root=<path>       Server checkout root (default: cwd)
 *   --reference=<path>         Baseline fixture path (default: <server-root>/scripts/fixtures/…)
 *   --no-compare               Skip vs-reference scorecard
 *   --gate                     Fail (exit 3) on a delivery-char regression beyond the threshold
 *   --max-regression-pct=<n>   Gate threshold in percent (default: 1)
 *
 * Env:
 *   WORKFLOWS_DIR   Corpus root for the harness (default: <server-root>/workflows)
 *
 * A comparison is only valid when the run and the reference share a context mode
 * (#323 T4): a fresh-vs-persistent delta conflates a mode switch with a code
 * change, and a persistent-only comparison cannot see a regression on the mode
 * production actually uses. Cross-mode runs still report, but are marked
 * `modeMatched: false` and can never pass `--gate`.
 *
 * Exit: 0 on completed walk; 2 if finalStatus !== completed; 3 on gate failure;
 * 1 on hard failure.
 *
 * See docs/development.md § "Token delivery benchmark" and docs/api-reference.md
 * § Reference Delivery.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { extractResourceIds } from '../src/utils/resource-ref.js';

type ContextMode = 'fresh' | 'persistent';

interface Metrics {
  /** Workflow this run walked. Recorded because a delta is only meaningful within one workflow. */
  workflowId: string;
  label: string;
  contextMode: ContextMode;
  agentId: string;
  workflowsDir: string;
  /** Corpus commit the walk read, so a fixture recorded from this output carries its own provenance. */
  workflowsRev?: string;
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

interface ReferenceFixture {
  label: string;
  description?: string;
  /** Workflow the fixture walked. Absent on fixtures recorded before the field: those walked work-package. */
  workflowId?: string;
  /** Context mode the fixture was recorded in. A comparison is only valid within one mode. */
  contextMode?: ContextMode;
  /** Corpus revision the fixture was recorded against, for the pinning warning. */
  workflowsRev?: string;
  getActivityChars: number;
  getWorkflowChars: number;
  getResourceChars: number;
  getTechniqueChars: number;
  toolCalls: Record<string, number>;
  history: {
    technique_bundled: number;
    technique_fetched: number;
    resource_fetched: number;
  };
  deliveredContentKeys: number;
  resourceLedgerKeys: number;
  unchangedResourceAnswers: number;
  unchangedTechniqueAnswers: number;
}

interface Delta {
  current: number;
  reference: number;
  delta: number;
  deltaPct: number | null;
  /** Lower is better for cost metrics; higher for collapse/ledger wins. */
  better: 'lower' | 'higher';
}

interface VsReference {
  referenceLabel: string;
  referencePath: string;
  description?: string;
  /** Run and reference share a context mode. Only a matched comparison is a valid gate (#323 T4). */
  modeMatched: boolean;
  /** Run and reference walked the same workflow. A cross-workflow delta measures two different
   *  things and is never a gate (#327 S4). */
  workflowMatched: boolean;
  /** Why a comparison is not gate-worthy, when it is not. */
  caveat?: string;
  /** Sum of activity+workflow+resource+technique payload chars. A0 = 100. */
  deliveryCostIndex: {
    current: number;
    reference: number;
    relative: number;
  };
  metrics: Record<string, Delta>;
}

interface GateResult {
  /** Percent regression in total delivery chars that fails the gate. */
  maxRegressionPct: number;
  regressionPct: number | null;
  passed: boolean;
  reason: string;
}

function arg(name: string, fallback: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
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

const DEFAULT_REFERENCE = 'scripts/fixtures/token-benchmark-baseline.json';

/** Default `--gate` threshold: total delivery chars may not regress by more than this percent. */
const DEFAULT_MAX_REGRESSION_PCT = 1;

function deliveryChars(m: {
  getActivityChars: number;
  getWorkflowChars: number;
  getResourceChars: number;
  getTechniqueChars: number;
}): number {
  return m.getActivityChars + m.getWorkflowChars + m.getResourceChars + m.getTechniqueChars;
}

function pctDelta(current: number, reference: number): number | null {
  if (reference === 0) return current === 0 ? 0 : null;
  return Math.round(((current - reference) / reference) * 1000) / 10;
}

function makeDelta(current: number, reference: number, better: 'lower' | 'higher'): Delta {
  return {
    current,
    reference,
    delta: current - reference,
    deltaPct: pctDelta(current, reference),
    better,
  };
}

function buildVsReference(metrics: Metrics, reference: ReferenceFixture, referencePath: string): VsReference {
  const currentDelivery = deliveryChars(metrics);
  const referenceDelivery = deliveryChars(reference);
  // An unlabelled fixture is treated as matching: it predates the mode field and every fixture
  // shipped so far was recorded fresh.
  const referenceMode = reference.contextMode ?? metrics.contextMode;
  const modeMatched = referenceMode === metrics.contextMode;
  // An unlabelled fixture predates the field; every fixture shipped so far walked work-package.
  const referenceWorkflow = reference.workflowId ?? 'work-package';
  const workflowMatched = referenceWorkflow === metrics.workflowId;
  const caveats = [
    modeMatched ? null
      : `Cross-mode comparison: reference is ${referenceMode}, run is ${metrics.contextMode}. `
        + 'The delta conflates the mode switch with the code change and is not a valid ship gate — '
        + 'compare within one mode, and always include a fresh-mode arm.',
    workflowMatched ? null
      : `Cross-workflow comparison: reference walked '${referenceWorkflow}', run walked `
        + `'${metrics.workflowId}'. The delta measures two different corpora paths, not a code change.`,
  ].filter((c): c is string => c !== null);
  return {
    referenceLabel: reference.label,
    referencePath,
    description: reference.description,
    modeMatched,
    workflowMatched,
    ...(caveats.length ? { caveat: caveats.join(' ') } : {}),
    deliveryCostIndex: {
      current: currentDelivery,
      reference: referenceDelivery,
      /** 100 = A0; lower is better. */
      relative: referenceDelivery === 0
        ? 0
        : Math.round((currentDelivery / referenceDelivery) * 1000) / 10,
    },
    metrics: {
      deliveryChars: makeDelta(currentDelivery, referenceDelivery, 'lower'),
      getActivityChars: makeDelta(metrics.getActivityChars, reference.getActivityChars, 'lower'),
      getWorkflowChars: makeDelta(metrics.getWorkflowChars, reference.getWorkflowChars, 'lower'),
      getResourceChars: makeDelta(metrics.getResourceChars, reference.getResourceChars, 'lower'),
      getTechniqueChars: makeDelta(metrics.getTechniqueChars, reference.getTechniqueChars, 'lower'),
      getResourceCalls: makeDelta(
        metrics.toolCalls.get_resource ?? 0,
        reference.toolCalls.get_resource ?? 0,
        'lower',
      ),
      getTechniqueCalls: makeDelta(
        metrics.toolCalls.get_technique ?? 0,
        reference.toolCalls.get_technique ?? 0,
        'lower',
      ),
      getActivityCalls: makeDelta(
        metrics.toolCalls.get_activity ?? 0,
        reference.toolCalls.get_activity ?? 0,
        'lower',
      ),
      techniqueBundled: makeDelta(
        metrics.history.technique_bundled,
        reference.history.technique_bundled,
        'lower',
      ),
      techniqueFetched: makeDelta(
        metrics.history.technique_fetched,
        reference.history.technique_fetched,
        'lower',
      ),
      resourceFetched: makeDelta(
        metrics.history.resource_fetched,
        reference.history.resource_fetched,
        'lower',
      ),
      unchangedResourceAnswers: makeDelta(
        metrics.unchangedResourceAnswers,
        reference.unchangedResourceAnswers,
        'higher',
      ),
      unchangedTechniqueAnswers: makeDelta(
        metrics.unchangedTechniqueAnswers,
        reference.unchangedTechniqueAnswers,
        'higher',
      ),
      resourceLedgerKeys: makeDelta(
        metrics.resourceLedgerKeys,
        reference.resourceLedgerKeys,
        'higher',
      ),
    },
  };
}

function formatPct(deltaPct: number | null): string {
  if (deltaPct === null) return 'n/a';
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct}%`;
}

function writeScorecard(vs: VsReference, contextMode: ContextMode, corpusNote?: string): void {
  const lines: string[] = [
    '',
    `vs ${vs.referenceLabel} · ${contextMode}-mode · deliveryCostIndex ${vs.deliveryCostIndex.relative} (baseline = 100, lower is better)`,
    '─'.repeat(72),
  ];
  if (!vs.modeMatched) lines.push(`  ⚠ NOT A VALID GATE — ${vs.caveat}`, '');
  if (corpusNote) lines.push(`  ⚠ ${corpusNote}`, '');
  const rows: Array<[string, Delta]> = [
    ['delivery chars (act+wf+res+tech)', vs.metrics.deliveryChars!],
    ['get_activity chars', vs.metrics.getActivityChars!],
    ['get_resource chars', vs.metrics.getResourceChars!],
    ['get_technique chars', vs.metrics.getTechniqueChars!],
    ['get_resource calls', vs.metrics.getResourceCalls!],
    ['get_technique calls', vs.metrics.getTechniqueCalls!],
    ['unchanged resource answers', vs.metrics.unchangedResourceAnswers!],
    ['resource:* ledger keys', vs.metrics.resourceLedgerKeys!],
  ];
  for (const [name, d] of rows) {
    const pad = name.padEnd(34);
    lines.push(
      `  ${pad} ${String(d.reference).padStart(8)} → ${String(d.current).padStart(8)}  (${formatPct(d.deltaPct)})`,
    );
  }
  lines.push('');
  process.stderr.write(`${lines.join('\n')}`);
}

/** Corpus revision of the walked workflows dir, when it is a git checkout. */
function resolveCorpusRev(workflowsDir: string): string | undefined {
  try {
    const rev = execFileSync('git', ['-C', workflowsDir, 'rev-parse', '--short=8', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return rev || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Ship gate on total delivery chars (#323 T4). A gate can only pass on a mode-matched
 * comparison: the July gate compared fresh-before against persistent-after and so could not
 * see a +24.5% regression on the only mode production uses.
 */
function evaluateGate(vs: VsReference | undefined, maxRegressionPct: number): GateResult {
  const base = { maxRegressionPct, regressionPct: null as number | null, passed: false };
  if (!vs) {
    return { ...base, reason: 'No reference comparison to gate on (--no-compare, or the fixture is missing).' };
  }
  if (!vs.modeMatched || !vs.workflowMatched) {
    return { ...base, reason: vs.caveat ?? 'Mismatched comparison is not a valid gate.' };
  }
  const regressionPct = vs.metrics.deliveryChars!.deltaPct;
  if (regressionPct === null) {
    return { ...base, reason: 'Reference delivery chars are zero — no ratio to gate on.' };
  }
  const passed = regressionPct <= maxRegressionPct;
  return {
    maxRegressionPct,
    regressionPct,
    passed,
    reason: passed
      ? `Total delivery chars ${formatPct(regressionPct)} vs ${vs.referenceLabel}, within the ${maxRegressionPct}% threshold.`
      : `Total delivery chars regressed ${formatPct(regressionPct)} vs ${vs.referenceLabel}, beyond the ${maxRegressionPct}% threshold.`,
  };
}

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
  // The walked workflow used to be hardcoded, so a run reported a confident delta for a change it
  // could not see — the same failure mode as a guard passing on a corpus it never reached (#327 S4).
  // The robot policy is work-package-shaped, so another workflow needs a policy that can drive it.
  const workflowId = arg('workflow', 'work-package');
  const serverRoot = resolve(arg('server-root', process.cwd()));
  const compare = !hasFlag('no-compare');
  const referencePath = resolve(arg('reference', join(serverRoot, DEFAULT_REFERENCE)));
  const gate = hasFlag('gate');
  const maxRegressionPct = Number(arg('max-regression-pct', String(DEFAULT_MAX_REGRESSION_PCT)));
  if (!Number.isFinite(maxRegressionPct)) {
    throw new Error(`--max-regression-pct must be numeric, got ${arg('max-regression-pct', '')}`);
  }

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
    const walkResult = await walk(harness, workflowId, skipOptionalPolicy, {
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
      workflowId,
      label,
      contextMode,
      agentId,
      workflowsDir: process.env.WORKFLOWS_DIR ?? join(serverRoot, 'workflows'),
      workflowsRev: resolveCorpusRev(process.env.WORKFLOWS_DIR ?? join(serverRoot, 'workflows')),
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

    let vsReference: VsReference | undefined;
    if (compare) {
      if (!existsSync(referencePath)) {
        process.stderr.write(`WARN: --compare requested but reference missing: ${referencePath}\n`);
      } else {
        const reference = JSON.parse(readFileSync(referencePath, 'utf8')) as ReferenceFixture;
        vsReference = buildVsReference(metrics, reference, referencePath);
        // A delta against a different corpus is not attributable to the code change. Reported,
        // not enforced: measuring a new corpus deliberately is a legitimate run.
        const corpusRev = resolveCorpusRev(metrics.workflowsDir);
        const corpusNote = reference.workflowsRev && corpusRev && corpusRev !== reference.workflowsRev
          ? `Corpus mismatch: reference recorded at workflows@${reference.workflowsRev}, this walk ran workflows@${corpusRev}. `
            + 'Pin WORKFLOWS_DIR to the reference corpus to attribute the delta to server code.'
          : undefined;
        writeScorecard(vsReference, metrics.contextMode, corpusNote);
      }
    }

    const gateResult = gate ? evaluateGate(vsReference, maxRegressionPct) : undefined;
    if (gateResult) {
      process.stderr.write(`gate: ${gateResult.passed ? 'PASS' : 'FAIL'} — ${gateResult.reason}\n`);
    }

    const output = { ...metrics, ...(vsReference ? { vsReference } : {}), ...(gateResult ? { gate: gateResult } : {}) };
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    if (metrics.finalStatus !== 'completed') {
      process.stderr.write(`WARN: finalStatus=${metrics.finalStatus}\n`);
      process.exitCode = 2;
    } else if (gateResult && !gateResult.passed) {
      process.exitCode = 3;
    }
  } finally {
    await harness.close();
  }
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
