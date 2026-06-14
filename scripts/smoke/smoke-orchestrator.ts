/**
 * Layer 3a — agent smoke-run driver (true split, deterministic orchestrator).
 *
 * The driver is the ORCHESTRATOR: it owns activity transitions and checkpoint
 * responses (from a deterministic Policy), running an in-memory technique-branch
 * server against a sandbox workspace. For each activity it dispatches a real
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
import { pickNext, type ActivityDef, type CheckpointDef } from '../../tests/e2e/walker.js';
import { defaultPolicy } from '../../tests/e2e/policies.js';
import { evaluateCondition } from '../../src/schema/condition.schema.js';

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
const policy = defaultPolicy;

function log(msg: string) { process.stdout.write(`[orchestrator] ${msg}\n`); }

/**
 * Set up the persistent shared sandbox at ROOT (created once, reused by every
 * run). Workspace holds the server sessions; the target repo is the worker's CWD,
 * so its .engineering/artifacts/planning/ is the stable root you watch. Each run
 * writes a unique planning subfolder (named from RUN_ID), so runs accumulate
 * rather than clobber.
 */
function setupSandbox() {
  const root = ROOT;
  const workspace = join(root, 'workspace');
  const target = join(root, 'target');
  execFileSync('mkdir', ['-p', workspace, target]);
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
  const cfg = tpl.replace('__TECHNIQUE_DIST__', TECHNIQUE_DIST).replace('__SANDBOX_WORKSPACE__', workspace);
  const cfgPath = join(root, 'worker-mcp.json');
  writeFileSync(cfgPath, cfg);
  return { root, workspace, target, cfgPath };
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

  const h = await createHarness({ workspaceDir: sb.workspace });
  const transcript: Array<Record<string, unknown>> = [];
  try {
    const start = parseToolResponse(await h.client.callTool({
      name: 'start_session', arguments: { workflow_id: WORKFLOW, agent_id: 'smoke-orchestrator' },
    }));
    const sessionIndex = start.session_index as string;
    const slug = start.planning_slug as string;
    const sessionPath = join(sb.workspace, '.engineering/artifacts/planning', slug, 'session.json');
    log(`session ${sessionIndex} (slug ${slug})`);

    // Initial activity comes from the workflow definition, not a hardcoded id.
    const wfSummary = parseWorkflowResponse(await h.client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex, summary: true } }));
    const variables: Record<string, unknown> = {};
    const visited = new Set<string>();
    let current: string | null = (wfSummary.initialActivity as string)
      ?? (wfSummary.activities as Array<{ id: string }> | undefined)?.[0]?.id ?? null;
    let count = 0;

    while (current && count < MAX_ACTIVITIES) {
      count++;
      visited.add(current);
      log(`=== activity ${count}: ${current} ===`);
      await h.client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: current } });

      const actRes = await h.client.callTool({ name: 'get_activity', arguments: { session_index: sessionIndex } });
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
        if (turn > MAX_TURNS) { log(`turn cap (${MAX_TURNS}) hit for ${current} — moving on`); break; }
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
          const cp = (act.checkpoints ?? []).find((c: CheckpointDef) => c.id === active.checkpointId);
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
              optionId = cp ? policy.choose({ activityId: current, checkpoint: cp, variables }) : active.checkpointId;
              const resp = parseToolResponse(await h.client.callTool({
                name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId },
              }));
              const effect = (resp.effect ?? {}) as Record<string, unknown>;
              sv = (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined;
            }
          } else {
            // 3a: deterministic orchestrator.
            optionId = cp ? policy.choose({ activityId: current, checkpoint: cp, variables }) : active.checkpointId;
            const resp = parseToolResponse(await h.client.callTool({
              name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId },
            }));
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

      transcript.push({ activity: current, checkpoints: cpRecords, workerTurns: turn, workerReports });
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
    writeFileSync(join(sb.root, `transcript-${RUN_ID}.json`), JSON.stringify({ runId: RUN_ID, sessionIndex, transcript, finalStatus: finalState.status }, null, 2));
  } finally {
    await h.close();
    // Persistent root — runs accumulate so they can be watched; nothing is deleted.
    log(`planning root (add to IDE): ${join(sb.target, '.engineering/artifacts/planning')}`);
    log(`this run: ${RUN_ID}`);
  }
}

main().catch(e => { process.stderr.write(`smoke-run failed: ${e?.stack ?? e}\n`); process.exit(1); });
