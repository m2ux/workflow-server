/**
 * Layer 3a — agent smoke-run driver (true split, deterministic orchestrator).
 *
 * The driver is the ORCHESTRATOR: it owns activity transitions and checkpoint
 * responses (from a deterministic Policy), running an in-memory technique-branch
 * server against the sandbox checkout. For each activity it dispatches a real
 * WORKER — headless `claude` pointed at the technique-branch dist server via
 * --strict-mcp-config — to execute the activity's steps in the sandbox. The two
 * server instances cooperate through the on-disk, HMAC-sealed session.json
 * (seal key is machine-global), exactly like the production orchestrator/worker
 * split. The worker session is kept alive across a checkpoint via `claude
 * --resume`, so it remembers which steps it has done.
 *
 * Usage (run from the worktree root):
 *   npx tsx scripts/smoke/smoke-orchestrator.ts [--activities=N] [--model=sonnet] [--root=DIR]
 *
 * Scoped by default (--activities=2) to validate plumbing cheaply before a full
 * 13-activity run. The sandbox lives at a CONSISTENT root (default
 * /tmp/claude/wf-smoke-runs, override with --root=); runs are never deleted, and
 * each lands a uniquely-named planning subfolder under the shared planning root,
 * so you can add that root to your IDE and watch every run in real time.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHarness } from '../../tests/e2e/harness.js';
import { parseToolResponse, parseWorkflowResponse, parseBundle } from '../../tests/e2e/harness.js';
import { pickNext, activityCheckpointSteps, type ActivityDef, type CheckpointDef } from '../../tests/e2e/walker.js';
import { defaultPolicy, makePolicy } from '../../tests/e2e/policies.js';
import { evaluateCondition } from '../../src/schema/condition.schema.js';
import { checkSession } from '../check-session-contract.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKTREE = resolve(HERE, '../..');
const CLAUDE_BIN = '/home/mike1/.local/bin/claude';
const TECHNIQUE_DIST = join(WORKTREE, 'dist');

const args = process.argv.slice(2);
const getArg = (k: string, def: string) => {
  const m = args.find(a => a.startsWith(`--${k}=`));
  return m ? m.slice(k.length + 3) : def;
};
const MAX_ACTIVITIES = parseInt(getArg('activities', '2'), 10);
const MODEL = getArg('model', 'sonnet');
// Consistent root (override with --root=). A fixed, env-independent path so the
// planning folder is ALWAYS at <ROOT>/target/.engineering/artifacts/planning/ —
// add that to your IDE and watch each run land as a unique <RUN_ID> subfolder.
const ROOT = getArg('root', '/tmp/claude/wf-smoke-runs');
const RUN_ID = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
// By default the worker has NO Bash (it narrates shell/git steps per the brief),
// so it cannot create real worktrees/branches outside the sandbox. --full enables
// Bash for a faithful run once the plumbing is validated.
const FULL = args.includes('--full');
// 'policy' (3a): deterministic orchestrator. 'agent' (3b): a real orchestrator
// agent makes checkpoint decisions (present_checkpoint -> judge -> respond_checkpoint).
const ORCHESTRATOR = getArg('orchestrator', 'policy');
// Workflow to smoke (default work-package). The orchestrator is workflow-agnostic: it reads the
// initial activity from get_workflow and drives transitions with pickNext + a forward-advance
// fallback, so any workflow can be exercised by a real worker without per-workflow wiring.
const WORKFLOW = getArg('workflow', 'work-package');
// Optional checkpoint steering: --choices=cp1:opt1,cp2:opt2 (mirrors run-3c's policy flexibility),
// e.g. --choices=intensity-and-scope-confirmed:full-repo to open a gated branch.
const CHOICES = getArg('choices', '');
const policy = CHOICES
  ? makePolicy({ name: 'cli-choices', choices: Object.fromEntries(CHOICES.split(',').filter(Boolean).map(p => p.split(':') as [string, string])) })
  : defaultPolicy;

function log(msg: string) { process.stdout.write(`[orchestrator] ${msg}\n`); }

/**
 * Set up the persistent shared sandbox at ROOT (created once, reused by every
 * run). The target repo is the worker's CWD and holds the sessions too, so
 * .engineering/artifacts/planning/ under it is both the stable root you watch and
 * the checkout a worktree path derives from. Each run writes a unique planning
 * subfolder (named from RUN_ID), so runs accumulate rather than clobber.
 *
 * One root, deliberately: sessions used to live beside the checkout rather than
 * inside it, which left the planning folder and the git repository in different
 * directories and a worktree path derivable from neither.
 */
function setupSandbox() {
  const root = ROOT;
  const target = join(root, 'target');
  execFileSync('mkdir', ['-p', target]);
  // Idempotent throwaway target repo — created on first run, reused thereafter.
  if (!existsSync(join(target, 'README.md'))) {
    writeFileSync(join(target, 'README.md'), '# Sandbox target\n\nThrowaway repo for work-package smoke runs.\n');
  }
  if (!existsSync(join(target, '.git'))) {
    execFileSync('git', ['init', '-q'], { cwd: target });
    execFileSync('git', ['add', '.'], { cwd: target });
    execFileSync('git', ['-c', 'user.email=smoke@test', '-c', 'user.name=smoke', 'commit', '-qm', 'init'], { cwd: target });
  }
  // Render the worker MCP config from the template.
  const tpl = readFileSync(join(HERE, 'worker-mcp.template.json'), 'utf8');
  const cfg = tpl.replace('__TECHNIQUE_DIST__', TECHNIQUE_DIST).replace('__SANDBOX_WORKSPACE__', target);
  const cfgPath = join(root, 'worker-mcp.json');
  writeFileSync(cfgPath, cfg);
  return { root, target, cfgPath };
}

interface WorkerTurn { result: string; sessionId: string | null }

/** Dispatch one worker turn (headless claude). Returns its text + resumable session id. */
function runWorker(prompt: string, cfgPath: string, target: string, resumeId: string | null): WorkerTurn {
  const a = [
    '-p', prompt,
    '--mcp-config', cfgPath,
    '--strict-mcp-config',
    '--dangerously-skip-permissions',
    '--add-dir', target,
    '--model', MODEL,
    '--output-format', 'json',
  ];
  if (!FULL) a.push('--disallowedTools', 'Bash');
  if (resumeId) a.push('--resume', resumeId);
  const out = execFileSync(CLAUDE_BIN, a, { cwd: target, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  try {
    const parsed = JSON.parse(out);
    return { result: String(parsed.result ?? ''), sessionId: parsed.session_id ?? null };
  } catch {
    return { result: out, sessionId: resumeId };
  }
}

/**
 * The variables a worker reported producing, read from the fenced `variables_changed` block the
 * brief asks for as the last thing in a turn.
 *
 * Later turns win: a value the worker settles after a checkpoint resume supersedes what it said
 * before. A turn with no block contributes nothing rather than clearing what earlier turns
 * reported, and an unparsable one is skipped with a note — a malformed block must not take the run
 * down, but it must not pass silently either, since a dropped value looks exactly like a value the
 * activity never produced.
 */
function collectWorkerVariables(reports: string[]): Record<string, unknown> {
  const collected: Record<string, unknown> = {};
  const fence = /```(?:json\s+)?variables_changed\s*\n([\s\S]*?)```/g;
  for (const report of reports) {
    for (const match of report.matchAll(fence)) {
      try {
        const parsed = JSON.parse(match[1]!) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.assign(collected, parsed);
        } else {
          log('worker variables_changed block was not an object — skipped');
        }
      } catch (error) {
        log(`worker variables_changed block did not parse — skipped (${error instanceof Error ? error.message : String(error)})`);
      }
    }
  }
  return collected;
}

/** A tool result's text, for an error the driver has to report rather than swallow. */
function toolText(result: { content?: unknown }): string {
  const first = Array.isArray(result.content) ? result.content[0] : undefined;
  return (first as { text?: string } | undefined)?.text ?? '(no detail)';
}

/**
 * The option to answer a checkpoint with.
 *
 * A declared checkpoint goes to the policy. A gate the WORKER raised carries its own options and no
 * definition to look them up in (#477), so the policy has nothing to match on — answering with the
 * checkpoint id, as this did, names an option no gate offers, and respond_checkpoint refuses it. The
 * first option the worker offered is the deterministic answer: an ad-hoc gate exists because the
 * worker could not proceed, and its first option is the one it wrote as the way forward.
 */
function chooseOption(
  active: { checkpointId: string; adhoc?: { options?: Array<{ id: string }> } },
  cp: CheckpointDef | undefined,
  activityId: string,
  variables: Record<string, unknown>,
): string {
  if (cp) return policy.choose({ activityId, checkpoint: cp, variables });
  const offered = active.adhoc?.options?.[0]?.id;
  if (offered) return offered;
  throw new Error(`checkpoint '${active.checkpointId}' has no definition and no ad-hoc options to answer with`);
}

const WORKER_BRIEF = readFileSync(join(HERE, 'worker-brief.md'), 'utf8');

const ORCHESTRATOR_BRIEF = readFileSync(join(HERE, 'orchestrator-brief.md'), 'utf8');

function initialPrompt(sessionIndex: string): string {
  return `${WORKER_BRIEF}\n\n---\nsession_index: ${sessionIndex}\nThis run's name is "smoke-${RUN_ID}" — use it when creating the planning folder so this run's planning subfolder is uniquely named (every run shares one planning root). This is your first turn for the current activity. Begin executing it now.`;
}
function orchestratorPrompt(sessionIndex: string): string {
  return `${ORCHESTRATOR_BRIEF}\n\n---\nsession_index: ${sessionIndex}\nResolve the active checkpoint now.`;
}
function resumePrompt(sessionIndex: string, checkpointId: string, optionId: string): string {
  return `session_index: ${sessionIndex}\nThe orchestrator resolved checkpoint "${checkpointId}" with option "${optionId}". Call resume_checkpoint to get the variable updates, apply them, then continue executing the remaining steps of this activity (yield again at the next checkpoint, or report when the activity's steps are complete).`;
}

async function main() {
  if (!existsSync(join(TECHNIQUE_DIST, 'index.js'))) {
    throw new Error(`Technique dist not built at ${TECHNIQUE_DIST}. Run "npm run build" first.`);
  }
  if (!existsSync(CLAUDE_BIN)) throw new Error(`claude not found at ${CLAUDE_BIN}`);

  const sb = setupSandbox();
  log(`sandbox: ${sb.root} (model=${MODEL}, activities<=${MAX_ACTIVITIES}, orchestrator=${ORCHESTRATOR}, policy=${policy.name})`);

  // The session and the planning artifacts share the checkout, so the two are never separated.
  // naming-conventions derives the worktree checkout root by walking up from planning_folder_path
  // above .engineering/artifacts/planning/ — point that anywhere but the checkout and it lands on a
  // directory with no .git, which a worker met and reported as unresolvable.
  const h = await createHarness({ workspaceDir: sb.target });
  const transcript: Array<Record<string, unknown>> = [];
  try {
    // The orchestrator names the planning folder, as it does in production. A worker left to invent
    // one picked a different directory on each run, and the run where it picked the session's own
    // folder could not derive a worktree root at all.
    const planningFolder = join(sb.target, '.engineering/artifacts/planning', `smoke-${RUN_ID}`);
    const start = parseToolResponse(await h.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: WORKFLOW, agent_id: 'smoke-orchestrator', planning_folder: planningFolder },
    }));
    const sessionIndex = start.session_index as string;
    const slug = start.planning_slug as string;
    const canonicalPlanningFolder = (start.planning_folder_path as string | undefined) ?? planningFolder;
    const sessionPath = join(sb.target, '.engineering/artifacts/planning', slug, 'session.json');
    log(`session ${sessionIndex} (slug ${slug}) planning ${canonicalPlanningFolder}`);

    // Initial activity comes from the workflow definition, not a hardcoded id.
    const wfSummary = parseWorkflowResponse(await h.client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex } }));
    const variables: Record<string, unknown> = {};
    /**
     * The completing activity's worker output, relayed on the next transition. Seeded with the
     * planning folder the orchestrator established: the first activity reads it before anything
     * writes it, and start_session returns the canonical path without putting it in the bag.
     */
    let pendingVariables: Record<string, unknown> = { planning_folder_path: canonicalPlanningFolder };
    /** Everything relayed across the run, for the end-of-run check that the bag received it. */
    const relayedVariables: Record<string, unknown> = {};
    const visited = new Set<string>();
    let current: string | null = (wfSummary.initialActivity as string)
      ?? (wfSummary.activities as Array<{ id: string }> | undefined)?.[0]?.id ?? null;
    let count = 0;

    while (current && count < MAX_ACTIVITIES) {
      count++;
      visited.add(current);
      log(`=== activity ${count}: ${current} ===`);
      // The transition carries the previous activity's worker output into the bag, which is the
      // only path a worker-derived value has into the session.
      const transitioned = await h.client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionIndex,
          activity_id: current,
          ...(Object.keys(pendingVariables).length ? { variables_changed: pendingVariables } : {}),
        },
      });
      // A refused transition leaves the session on the previous activity while the driver reports
      // the next one, so the transcript claims an activity that never ran and the worker keeps
      // answering the old one. The server refuses while a checkpoint is unresolved, which is
      // exactly when this used to happen.
      if (transitioned.isError) {
        throw new Error(`next_activity refused '${current}': ${toolText(transitioned)}`);
      }
      pendingVariables = {};

      const actRes = await h.client.callTool({ name: 'get_activity', arguments: { session_index: sessionIndex, context_tokens: 200_000 } });
      const act = parseWorkflowResponse(actRes) as unknown as ActivityDef;
      const unresolved = (parseBundle(actRes).unresolved as string[] | undefined) ?? [];
      if (unresolved.length) log(`bundle unresolved (degraded for worker): ${unresolved.join(', ')}`);

      // Run the worker across this activity, orchestrating any checkpoints.
      let workerSession: string | null = null;
      let turn = 0;
      let pendingResume: { checkpointId: string; optionId: string } | null = null;
      const cpRecords: Array<Record<string, unknown>> = [];
      const workerReports: string[] = [];
      const MAX_TURNS = 8;
      while (true) {
        turn++;
        // Moving on with a checkpoint still active is what made a refused transition look like a
        // successful one, so the cap says which state it stopped in and the transition below decides
        // whether the run can continue.
        if (turn > MAX_TURNS) { log(`turn cap (${MAX_TURNS}) hit for ${current}`); break; }
        const prompt = turn === 1
          ? initialPrompt(sessionIndex)
          : resumePrompt(sessionIndex, pendingResume!.checkpointId, pendingResume!.optionId);
        const w = runWorker(prompt, sb.cfgPath, sb.target, workerSession);
        workerSession = w.sessionId;
        workerReports.push(w.result);
        log(`worker turn ${turn} (${w.result.length} chars)`);

        const state = JSON.parse(readFileSync(sessionPath, 'utf8'));
        const active = state.activeCheckpoint;
        if (active && active.checkpointId) {
          const cp = activityCheckpointSteps(act).find((c: CheckpointDef) => c.id === active.checkpointId);
          let optionId: string;
          let sv: Record<string, unknown> | undefined;
          let decidedBy = ORCHESTRATOR;

          if (ORCHESTRATOR === 'agent') {
            // 3b: a real orchestrator agent calls present_checkpoint + respond_checkpoint.
            runWorker(orchestratorPrompt(sessionIndex), sb.cfgPath, sb.target, null);
            const after = JSON.parse(readFileSync(sessionPath, 'utf8'));
            const rec = after.checkpointResponses?.[`${current}-${active.checkpointId}`];
            if (!after.activeCheckpoint && rec) {
              optionId = rec.optionId;
              sv = rec.effects?.variablesSet as Record<string, unknown> | undefined;
            } else {
              // Orchestrator agent didn't resolve it — fall back to policy so the run proceeds.
              decidedBy = 'policy-fallback';
              optionId = chooseOption(active, cp, current, variables);
              const resp = parseToolResponse(await h.client.callTool({
                name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId },
              }));
              const effect = (resp.effect ?? {}) as Record<string, unknown>;
              sv = (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined;
            }
          } else {
            // 3a: deterministic orchestrator.
            optionId = chooseOption(active, cp, current, variables);
            const responded = await h.client.callTool({
              name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId },
            });
            // A refused response leaves the checkpoint active, so the next turn yields the same one
            // and the run burns its turn cap on a gate nobody answered. Fail on the spot instead.
            if (responded.isError) {
              throw new Error(`respond_checkpoint refused option '${optionId}' for '${active.checkpointId}': ${toolText(responded)}`);
            }
            const resp = parseToolResponse(responded);
            const effect = (resp.effect ?? {}) as Record<string, unknown>;
            sv = (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined;
          }

          log(`worker yielded "${active.checkpointId}" → ${decidedBy} responds "${optionId}"`);
          if (sv) Object.assign(variables, sv);
          cpRecords.push({ checkpointId: active.checkpointId, optionId, setVariable: sv, decidedBy });
          pendingResume = { checkpointId: active.checkpointId, optionId };
          continue; // re-dispatch worker (resume) to call resume_checkpoint + continue
        }
        break; // no active checkpoint → activity steps complete (or worker stopped)
      }

      // Relay what the worker produced, the way a real orchestrator does: the server writes the
      // session bag from `variables_changed` on the transition out. Without this the run exercises
      // only the checkpoint write path — every value a worker derives is reported in prose and
      // dropped, so no later activity can read what an earlier one produced (#493).
      const produced = collectWorkerVariables(workerReports);
      if (Object.keys(produced).length) {
        log(`worker produced: ${Object.keys(produced).join(', ')}`);
        Object.assign(variables, produced);
      } else {
        log('worker produced no variables_changed block');
      }
      pendingVariables = produced;
      Object.assign(relayedVariables, produced);

      transcript.push({
        activity: current, checkpoints: cpRecords, workerTurns: turn, workerReports,
        variablesChanged: produced,
      });
      let next = pickNext(act, variables);
      // Forward-advance fallback (workflow-agnostic): if the graph stalls or loops back, advance to
      // an unvisited activity, satisfying its simple gate — stands in for agent-set convergence vars.
      if (next === null || visited.has(next)) {
        for (const t of act.transitions ?? []) {
          if (visited.has(t.to)) continue;
          const c = t.condition as { type?: string; variable?: string; operator?: string; value?: unknown } | undefined;
          if (!c) { next = t.to; break; }
          if (c.type === 'simple' && typeof c.variable === 'string') {
            variables[c.variable] = c.operator === '!=' ? (typeof c.value === 'boolean' ? !c.value : `__ne_${String(c.value)}`) : c.value;
            next = t.to; break;
          }
        }
      }
      log(`next: ${next ?? '(terminal)'}`);
      current = next;
    }

    const finalState = JSON.parse(readFileSync(sessionPath, 'utf8'));
    log(`final status: ${finalState.status}; activities run: ${count}`);

    // Assert rather than narrate. A run that reads well in the log and wrote outside its contracts,
    // or never moved the session at all, is the failure this exists to catch — and reading the log
    // by hand is what let both go unnoticed until someone looked.
    const contract = await checkSession(finalState, resolve(WORKTREE, 'workflows'), { runComplete: true });
    log(`session contract: ${contract.checkedWrites} write(s) measured`
      + `${contract.unattributedWrites ? `, ${contract.unattributedWrites} unattributed` : ''}`);
    // What the worker said it produced has to be what the bag received: the relay is the only path,
    // and a name lost between the two is invisible from either side alone.
    const relayed = Object.keys(relayedVariables);
    const landed = relayed.filter((name) => finalState.variables?.[name] !== undefined);
    const dropped = relayed.filter((name) => !landed.includes(name));
    log(`relay: ${landed.length}/${relayed.length} reported values in the bag`);
    const failures = [
      ...contract.findings.map((f) => `[${f.check}] ${f.site}: ${f.detail}`),
      ...(dropped.length ? [`[relay-dropped] ${dropped.join(', ')} were reported by a worker and are absent from the bag`] : []),
    ];
    if (failures.length) {
      for (const line of failures) log(line);
      throw new Error(`${failures.length} assertion(s) failed against session ${sessionIndex}`);
    }
    log('assertions passed');
    writeFileSync(join(sb.root, `transcript-${RUN_ID}.json`), JSON.stringify({ runId: RUN_ID, sessionIndex, transcript, finalStatus: finalState.status }, null, 2));
  } finally {
    await h.close();
    // Persistent root — runs accumulate so they can be watched; nothing is deleted.
    log(`planning root (add to IDE): ${join(sb.target, '.engineering/artifacts/planning')}`);
    log(`this run: ${RUN_ID}`);
  }
}

main().catch(e => { process.stderr.write(`smoke-run failed: ${e?.stack ?? e}\n`); process.exit(1); });
