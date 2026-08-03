/**
 * Headless batch benchmark — what one worker walking a run of activities saves (#407).
 *
 * The fourth measurement tool in this repo. `bench:token` varies the SESSION MODE over one solo
 * walk; `bench:dispatch` prices ONE re-dispatch by measuring a spawn pass against a resume pass of
 * the same activity; `profile:run` reads a real run off disk. This one varies the BATCH: it walks the
 * same run of activities twice and reports the difference.
 *
 *   per-activity — a fresh worker context per activity (`agent_id: <activity>-w`, full delivery)
 *   batched      — ONE context for the whole run (`agent_id: <run>-batch`, reference delivery after
 *                  the first activity), which is what the server's batch bound admits
 *
 * ## What the wall-clock here does and does not measure
 *
 * Both passes drive the real server over an in-memory transport, so the elapsed figures are the
 * SERVER-SIDE component of a walk: composing each payload, resolving techniques and fragments off
 * disk, and writing the session.
 *
 * **Server-side elapsed is a wash, and that is the finding, not a defect.** Over the analysis run it
 * lands within a few percent either way of the per-activity pass, noise-dominated at this scale.
 * Reference delivery composes every payload in full and then hashes it to decide what may collapse,
 * so a batch does slightly MORE server work to put fewer bytes on the wire. The saving is the bytes
 * and the dispatches, not the server's time — so the figure is reported to keep that honest rather
 * than to be claimed as a speed-up.
 *
 * The run-duration saving is the harness's context establishment: the system prompt, project
 * instructions and tool schemas a freshly spawned worker rebuilds before it reads a line of workflow
 * content. Nothing headless can observe it, because there is no agent here to spawn. So this script
 * reports the dispatches a batch AVOIDS and prices them from a measured per-dispatch spawn cost
 * supplied as a flag, rather than inventing one:
 *
 *   --spawn-seconds=<n>   Wall-clock a real dispatch costs before the worker's first server call.
 *                         Default 87, the mean of the four setup-walk dispatches on the profiled
 *                         27 July 2026 run — 77, 65, 42 and 165 seconds. Override it with your own
 *                         harness's figure; the projection is only as good as this input.
 *
 * The projected saving is `dispatchesAvoided × spawnSeconds`, reported separately from the measured
 * server-side elapsed and clearly labelled, so the two are never added into one headline number.
 *
 * Usage (from a server checkout with `node_modules` and a populated `workflows/`):
 *
 *   npm run bench:batch
 *   npm run bench:batch -- --workflow=meta --activities=discover-session,initialize-session,resolve-target
 *   npm run bench:batch -- --gate --min-saving-pct=20
 *
 * Flags:
 *   --workflow=<id>        Workflow to walk (default: work-package)
 *   --activities=<a,b,c>   Run to walk, comma-separated (default: the measured analysis run)
 *   --context-tokens=<n>   Window each pass declares (default: 200000)
 *   --spawn-seconds=<n>    Measured per-dispatch spawn cost for the projection (default: 87)
 *   --repeat=<n>           Walk each pass n times and report the best elapsed (default: 3)
 *   --gate                 Exit 3 unless the batched pass saves at least --min-saving-pct of chars
 *   --min-saving-pct=<n>   Gate threshold, percent of the per-activity pass's chars (default: 15)
 *
 * Env:
 *   WORKFLOWS_DIR   Corpus root (default: <server-root>/workflows), same knob as the guards.
 *
 * Exit: 0 on a completed measurement, 3 on gate failure, 1 on hard failure.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHarness, rawText, isError, parseToolResponse } from '../tests/e2e/harness.js';
import type { HistoryEntry } from '../src/schema/state.schema.js';
import type { SessionFile } from '../src/schema/session.schema.js';
import { deliveredChars } from '../src/utils/batch.js';

/** The analysis run through the middle of the main workflow — the best measured batch candidate. */
export const DEFAULT_RUN = ['implementation-analysis', 'plan-prepare', 'assumptions-review'];

/** Mean per-dispatch spawn wall-clock across the four setup workers of the profiled 27 July run. */
export const DEFAULT_SPAWN_SECONDS = 87;

export interface PassMetrics {
  /** How the pass drove the walk. */
  mode: 'per-activity' | 'batched';
  /** Characters the server delivered in full across the whole run. */
  deliveredChars: number;
  /**
   * Characters reported as collapsed by a content-fetch event. NOT the run's total saving: most
   * collapse happens inside an activity payload, which shows up as a smaller `activity_dispatched`
   * size rather than as an `unchanged` event. Compare `deliveredChars` between the passes for the
   * saving; this field only sees the lazy fetches.
   */
  savedChars: number;
  /** Contexts the server met, which is what a dispatch costs a harness. */
  dispatches: number;
  /** Best server-side elapsed over --repeat walks, milliseconds. */
  elapsedMs: number;
  /** Per activity, in walk order: the characters that activity's delivery carried. */
  perActivityChars: number[];
  /**
   * The same total, computed by the SERVER's own `deliveredChars` over the same session. This script's
   * `magnitudes` is a second implementation of one counting rule, and a second implementation nobody
   * reconciles is how the double count got into both of them at once. A caller asserts the two agree.
   */
  serverDeliveredChars: number;
}

function flag(name: string): string | undefined {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function has(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

/**
 * Sum delivery magnitudes over one session's history, split by whether the payload shipped.
 *
 * Counted the same way the batch bound counts (see `src/utils/batch.ts`), which matters here: an
 * `activity_dispatched` size is the WHOLE `get_activity` response, eagerly bundled techniques and
 * resources included, so adding their own events would charge those bytes twice and overstate the
 * saving the recalibration is read from. Collapsed content is reported as saved rather than delivered.
 */
function magnitudes(history: HistoryEntry[]): { deliveredChars: number; savedChars: number } {
  let deliveredChars = 0;
  let savedChars = 0;
  for (const event of history) {
    const data = event.data as { chars?: number; delivery?: string; bundled?: boolean } | undefined;
    if (!data || typeof data.chars !== 'number') continue;
    const collapsed = data.delivery === 'unchanged';
    switch (event.type) {
      case 'activity_dispatched':
        deliveredChars += data.chars;
        break;
      case 'technique_bundled':
        // Inside the activity payload already counted above; only its collapse is news.
        if (collapsed) savedChars += data.chars;
        break;
      case 'resource_fetched':
        if (collapsed) savedChars += data.chars;
        else if (data.bundled !== true) deliveredChars += data.chars;
        break;
      case 'technique_fetched':
        if (collapsed) savedChars += data.chars;
        else deliveredChars += data.chars;
        break;
      default:
        break;
    }
  }
  return { deliveredChars, savedChars };
}

/**
 * Walk `activities` once and return what it cost the server. In `batched` mode every activity is
 * taken under one scope, with reference delivery from the second on; in `per-activity` mode each
 * activity is a fresh scope taking full delivery, which is a spawn apiece.
 */
async function walk(
  mode: PassMetrics['mode'],
  opts: { workflowId: string; activities: string[]; contextTokens: number; slug: string },
): Promise<Omit<PassMetrics, 'mode'>> {
  const h = await createHarness();
  try {
    const planningFolder = join(h.workspaceDir, '.engineering/artifacts/planning', opts.slug);
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: opts.workflowId, agent_id: 'orchestrator', planning_folder: planningFolder },
    });
    if (isError(started)) throw new Error(`start_session failed: ${rawText(started)}`);
    const sessionIndex = parseToolResponse(started).session_index as string;

    const batchScope = `${opts.slug}-batch`;
    const perActivityChars: number[] = [];
    const startedAt = process.hrtime.bigint();

    for (const [index, activityId] of opts.activities.entries()) {
      const entered = await h.client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionIndex, activity_id: activityId },
      });
      if (isError(entered)) throw new Error(`next_activity ${activityId} failed: ${rawText(entered)}`);

      const scope = mode === 'batched' ? batchScope : `${activityId}-w`;
      const reference = mode === 'batched' && index > 0 ? { bundle: 'reference' } : {};
      const taken = await h.client.callTool({
        name: 'get_activity',
        arguments: { session_index: sessionIndex, context_tokens: opts.contextTokens, agent_id: scope, ...reference },
      });
      if (isError(taken)) throw new Error(`get_activity ${activityId} failed: ${rawText(taken)}`);
      perActivityChars.push(rawText(taken).length);
    }

    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const state = JSON.parse(readFileSync(join(planningFolder, 'session.json'), 'utf8')) as SessionFile;
    const history = state.history ?? [];
    const scopes = new Set(
      history
        .filter((e) => e.type === 'activity_dispatched')
        .map((e) => (e.data as { agentId?: string } | undefined)?.agentId)
        .filter((id): id is string => typeof id === 'string'),
    );
    // Reconciliation figure: the server's own counting over every scope this pass used, which for the
    // batched pass is the one batch scope and for the per-activity pass is one scope an activity.
    const serverDeliveredChars = [...scopes].reduce((total, scope) => total + deliveredChars(state, scope), 0);

    return { ...magnitudes(history), dispatches: scopes.size, elapsedMs, perActivityChars, serverDeliveredChars };
  } finally {
    await h.close();
  }
}

/** Walk one pass `repeat` times and keep the best elapsed, so a cold FS cache does not dominate. */
export async function measure(
  mode: PassMetrics['mode'],
  opts: { workflowId: string; activities: string[]; contextTokens: number; repeat: number },
): Promise<PassMetrics> {
  let best: Awaited<ReturnType<typeof walk>> | undefined;
  for (let run = 0; run < opts.repeat; run++) {
    const result = await walk(mode, { ...opts, slug: `batch-bench-${mode}-${run}` });
    if (!best || result.elapsedMs < best.elapsedMs) best = result;
  }
  return { mode, ...best! };
}

async function main(): Promise<number> {
  const workflowId = flag('workflow') ?? 'work-package';
  const activities = (flag('activities') ?? DEFAULT_RUN.join(',')).split(',').map((a) => a.trim()).filter(Boolean);
  const contextTokens = Number(flag('context-tokens') ?? 200_000);
  const spawnSeconds = Number(flag('spawn-seconds') ?? DEFAULT_SPAWN_SECONDS);
  const repeat = Math.max(1, Number(flag('repeat') ?? 3));
  const minSavingPct = Number(flag('min-saving-pct') ?? 15);

  const perActivity = await measure('per-activity', { workflowId, activities, contextTokens, repeat });
  const batched = await measure('batched', { workflowId, activities, contextTokens, repeat });

  const charSavingPct = perActivity.deliveredChars === 0
    ? 0
    : ((perActivity.deliveredChars - batched.deliveredChars) / perActivity.deliveredChars) * 100;
  const serverSavingPct = perActivity.elapsedMs === 0
    ? 0
    : ((perActivity.elapsedMs - batched.elapsedMs) / perActivity.elapsedMs) * 100;
  const dispatchesAvoided = perActivity.dispatches - batched.dispatches;

  const report = {
    workflowId,
    activities,
    contextTokens,
    repeat,
    measured: {
      perActivity: {
        dispatches: perActivity.dispatches,
        deliveredChars: perActivity.deliveredChars,
        elapsedMs: Number(perActivity.elapsedMs.toFixed(1)),
        perActivityChars: perActivity.perActivityChars,
      },
      batched: {
        dispatches: batched.dispatches,
        deliveredChars: batched.deliveredChars,
        savedChars: batched.savedChars,
        elapsedMs: Number(batched.elapsedMs.toFixed(1)),
        perActivityChars: batched.perActivityChars,
      },
      charSavingPct: Number(charSavingPct.toFixed(1)),
      serverElapsedSavingPct: Number(serverSavingPct.toFixed(1)),
      dispatchesAvoided,
    },
    // Reported apart from the measured figures and never folded into them: the harness cost of a
    // spawn cannot be observed headlessly, so this is arithmetic over a figure the caller supplies.
    projected: {
      basis: `${dispatchesAvoided} dispatch(es) avoided × ${spawnSeconds}s measured spawn cost`,
      spawnSecondsInput: spawnSeconds,
      runDurationSavingSeconds: Number((dispatchesAvoided * spawnSeconds).toFixed(1)),
    },
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');

  process.stderr.write(
    `batch benchmark — ${activities.length} activities of '${workflowId}': `
    + `${perActivity.dispatches} contexts → ${batched.dispatches}, `
    + `${perActivity.deliveredChars} chars → ${batched.deliveredChars} (${report.measured.charSavingPct}% saved), `
    + `server-side ${report.measured.perActivity.elapsedMs}ms → ${report.measured.batched.elapsedMs}ms `
    + `(${report.measured.serverElapsedSavingPct}%)\n`,
  );
  process.stderr.write(
    `  projected run duration: ${report.projected.runDurationSavingSeconds}s saved, from `
    + `${report.projected.basis} — supply your harness's own --spawn-seconds to re-base it\n`,
  );

  if (has('gate') && charSavingPct < minSavingPct) {
    process.stderr.write(`GATE FAIL: batched saving ${report.measured.charSavingPct}% is below ${minSavingPct}%\n`);
    return 3;
  }
  return 0;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    process.exit(await main());
  } catch (err) {
    process.stderr.write(`batch benchmark failed: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
