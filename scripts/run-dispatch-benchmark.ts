/**
 * Headless dispatch-overhead benchmark — what a re-dispatch costs, measured (#353).
 *
 * The two benchmarks in this repo measure two different axes. `bench:token` varies the SESSION MODE
 * (fresh vs persistent) over one solo walk. This one varies the DISPATCH: a client walk spawns a
 * disposable worker per activity against a single orchestrator session, and on that topology cost
 * tracks dispatch count — multi-dispatch activities ran 5,416 tok/call against 3,093 for
 * single-dispatch ones on the walk this was built from (PR #1877).
 *
 * For each activity on a walk it simulates the real shape twice:
 *
 *   spawn   — a fresh worker context (`agent_id: <activity>-w`, no reference opt-in): full delivery
 *   resume  — the SAME context resumed (same `agent_id`, `bundle: "reference"`): reference delivery
 *
 * Both passes fetch the activity payload and every step-bound technique the worker would load, so
 * the pair prices one checkpoint-driven resume: the spawn figure is what a second cold dispatch
 * would pay, the resume figure is what reusing the context pays instead. Figures come from the
 * server's own history events (`activity_dispatched.chars`,
 * `technique_fetched` / `technique_bundled` / `resource_fetched` `chars` + `delivery`), so the
 * numbers are the server's accounting rather than this script's estimate.
 *
 * Usage (from a server checkout with `node_modules` and a populated `workflows/`):
 *
 *   npm run bench:dispatch
 *   npm run bench:dispatch -- --workflow=work-package --activities=6
 *   WORKFLOWS_DIR=/path/to/workflows npm run bench:dispatch -- --gate --min-saving-pct=50
 *
 * Flags:
 *   --workflow=<id>          Workflow to sample (default: work-package)
 *   --activities=<n>         How many activities to sample from the workflow roster (default: 6)
 *   --gate                   Exit 3 unless the resume pass saves at least --min-saving-pct
 *   --min-saving-pct=<n>     Gate threshold in percent of fresh-pass delivered chars (default: 50)
 *
 * Env:
 *   WORKFLOWS_DIR   Corpus root (default: <server-root>/workflows), same knob as the guards.
 *
 * Exit: 0 on a completed measurement, 3 on gate failure, 1 on hard failure.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { createHarness, rawText } from '../tests/e2e/harness.js';
import { corpusRoot } from '../tests/corpus-root.js';
import type { HistoryEntry } from '../src/schema/state.schema.js';

/** One activity measured in one pass. */
interface PassMetrics {
  /** Chars the server delivered in full on this pass. */
  deliveredChars: number;
  /** Chars that collapsed to unchanged-markers — the payload this pass did NOT resend. */
  savedChars: number;
  /** `fresh` | `resume`, as the server discriminated it. */
  dispatch: string;
  /** get_activity payload size for the pass. */
  activityChars: number;
}

interface ActivityMetrics {
  activityId: string;
  techniqueSteps: number;
  spawn: PassMetrics;
  resume: PassMetrics;
}

function flag(name: string): string | undefined {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function has(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

/** Sum `chars` over delivery events for one scope, split by whether the payload actually shipped. */
function magnitudes(history: HistoryEntry[], scope: string): { deliveredChars: number; savedChars: number } {
  let deliveredChars = 0;
  let savedChars = 0;
  for (const event of history) {
    if (event.type !== 'technique_fetched' && event.type !== 'technique_bundled' && event.type !== 'resource_fetched') continue;
    const data = event.data as { agentId?: string; chars?: number; delivery?: string } | undefined;
    if (!data || data.agentId !== scope || typeof data.chars !== 'number') continue;
    if (data.delivery === 'unchanged') savedChars += data.chars;
    else deliveredChars += data.chars;
  }
  return { deliveredChars, savedChars };
}

/** The step ids whose bound technique a worker would load for this activity. */
function techniqueStepIds(activityBody: string): string[] {
  const parsed = parseYaml(activityBody) as { steps?: Array<{ kind?: string; id?: string; technique?: unknown; steps?: unknown }> } | null;
  const out: string[] = [];
  const walk = (steps: Array<{ kind?: string; id?: string; technique?: unknown; steps?: unknown }> | undefined): void => {
    for (const step of steps ?? []) {
      if (Array.isArray(step.steps)) walk(step.steps as Array<{ kind?: string; id?: string }>);
      if (step.kind === 'technique' && step.id) out.push(step.id);
    }
  };
  walk(parsed?.steps);
  return out;
}

async function main(): Promise<number> {
  const workflowId = flag('workflow') ?? 'work-package';
  const activityBudget = Number(flag('activities') ?? 6);
  const minSavingPct = Number(flag('min-saving-pct') ?? 50);

  const h = await createHarness();
  try {
    // A durable planning folder, because the per-event `chars` this benchmark reports live in the
    // session history and `inspect_session` projects that to a tally, not to the events themselves.
    const planningFolder = join(h.workspaceDir, '.engineering/artifacts/planning', 'dispatch-benchmark');
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: workflowId, agent_id: 'orchestrator', planning_folder: planningFolder },
    });
    const sessionIndex = (JSON.parse(rawText(started)) as { session_index: string }).session_index;
    const history = (): HistoryEntry[] =>
      (JSON.parse(readFileSync(join(planningFolder, 'session.json'), 'utf8')) as { history?: HistoryEntry[] }).history ?? [];

    const activityIds = activityRoster(workflowId).slice(0, activityBudget);
    if (activityIds.length === 0) throw new Error(`no activity files found for workflow '${workflowId}'`);

    const measured: ActivityMetrics[] = [];
    for (const activityId of activityIds) {
      const entered = await h.client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionIndex, activity_id: activityId },
      });
      // A roster id the walk cannot enter from here is not a measurement failure — skip it.
      if (entered.isError) continue;

      const scope = `${activityId}-w`;
      const passes: PassMetrics[] = [];
      let techniqueSteps = 0;

      for (const pass of ['spawn', 'resume'] as const) {
        const before = history().length;
        const reference = pass === 'resume' ? { bundle: 'reference' } : {};
        const activity = await h.client.callTool({
          name: 'get_activity',
          arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: scope, ...reference },
        });
        if (activity.isError) throw new Error(`get_activity failed for ${activityId}: ${rawText(activity)}`);

        // The worker loads each step's bound technique as it reaches it. A step whose technique
        // cannot be composed is the binding guard's business, not a measurement failure.
        const stepIds = techniqueStepIds(rawText(activity).split('\n\n---\n\n').slice(1).join('\n\n---\n\n'));
        techniqueSteps = Math.max(techniqueSteps, stepIds.length);
        for (const stepId of stepIds) {
          await h.client.callTool({
            name: 'get_technique',
            arguments: { session_index: sessionIndex, step_id: stepId, agent_id: scope, ...reference },
          });
        }

        const emitted = history().slice(before);
        const dispatchEvent = emitted.find((e) => e.type === 'activity_dispatched');
        passes.push({
          ...magnitudes(emitted, scope),
          dispatch: (dispatchEvent?.data as { dispatch?: string } | undefined)?.dispatch ?? 'unrecorded',
          activityChars: (dispatchEvent?.data as { chars?: number } | undefined)?.chars ?? 0,
        });
      }

      measured.push({ activityId, techniqueSteps, spawn: passes[0]!, resume: passes[1]! });
    }

    const sum = (pick: (m: ActivityMetrics) => number): number => measured.reduce((a, m) => a + pick(m), 0);
    const freshChars = sum((m) => m.spawn.deliveredChars + m.spawn.activityChars);
    const resumeChars = sum((m) => m.resume.deliveredChars + m.resume.activityChars);
    const savingPct = freshChars === 0 ? 0 : ((freshChars - resumeChars) / freshChars) * 100;

    const report = {
      workflowId,
      activitiesMeasured: measured.length,
      dispatchEvents: {
        fresh: measured.filter((m) => m.spawn.dispatch === 'fresh').length,
        resume: measured.filter((m) => m.resume.dispatch === 'resume').length,
      },
      chars: { freshPass: freshChars, resumePass: resumeChars, savedByReference: sum((m) => m.resume.savedChars) },
      savingPct: Number(savingPct.toFixed(1)),
      perActivity: measured.map((m) => ({
        activity: m.activityId,
        techniqueSteps: m.techniqueSteps,
        freshChars: m.spawn.deliveredChars + m.spawn.activityChars,
        resumeChars: m.resume.deliveredChars + m.resume.activityChars,
        savedChars: m.resume.savedChars,
      })),
    };
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');

    const unrecorded = measured.filter((m) => m.spawn.dispatch !== 'fresh' || m.resume.dispatch !== 'resume');
    for (const m of unrecorded) {
      process.stderr.write(`  ! ${m.activityId}: dispatch discriminator read ${m.spawn.dispatch}/${m.resume.dispatch}\n`);
    }
    process.stderr.write(
      `dispatch benchmark — ${measured.length} activities: fresh pass ${freshChars} chars, `
      + `resume pass ${resumeChars} chars, ${report.savingPct}% saved on re-dispatch\n`,
    );

    if (has('gate') && savingPct < minSavingPct) {
      process.stderr.write(`GATE FAIL: resume saving ${report.savingPct}% is below ${minSavingPct}%\n`);
      return 3;
    }
    if (unrecorded.length > 0) {
      process.stderr.write(`GATE FAIL: ${unrecorded.length} activity(ies) did not record a fresh/resume dispatch pair\n`);
      return has('gate') ? 3 : 0;
    }
    return 0;
  } finally {
    await h.close();
  }
}

/** Activity ids of a workflow, in definition-file order — the order a walk meets them. */
function activityRoster(workflowId: string): string[] {
  const dir = join(corpusRoot(), workflowId, 'activities');
  if (!existsSync(dir)) throw new Error(`no activities directory for workflow '${workflowId}' under ${corpusRoot()}`);
  const ids: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
    const def = parseYaml(readFileSync(join(dir, entry), 'utf8')) as { id?: string } | null;
    if (def?.id) ids.push(def.id);
  }
  return ids;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    process.exit(await main());
  } catch (err) {
    process.stderr.write(`dispatch benchmark failed: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
