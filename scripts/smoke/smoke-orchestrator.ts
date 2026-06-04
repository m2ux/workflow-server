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
 *   npx tsx scripts/smoke/smoke-orchestrator.ts [--activities=N] [--model=sonnet] [--keep]
 *
 * Scoped by default (--activities=2) to validate plumbing cheaply before a full
 * 13-activity run.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
const KEEP = args.includes('--keep');
// By default the worker has NO Bash (it narrates shell/git steps per the brief),
// so it cannot create real worktrees/branches outside the sandbox. --full enables
// Bash for a faithful run once the plumbing is validated.
const FULL = args.includes('--full');
// 'policy' (3a): deterministic orchestrator. 'agent' (3b): a real orchestrator
// agent makes checkpoint decisions (present_checkpoint -> judge -> respond_checkpoint).
const ORCHESTRATOR = getArg('orchestrator', 'policy');
const policy = defaultPolicy;

function log(msg: string) { process.stdout.write(`[orchestrator] ${msg}\n`); }

/** Create the disposable sandbox: a workspace (for session.json) + a target git repo. */
function setupSandbox() {
  const root = mkdtempSync(join(tmpdir(), 'wf-smoke-'));
  const workspace = join(root, 'workspace');
  const target = join(root, 'target');
  execFileSync('mkdir', ['-p', workspace, target]);
  // Trivial, throwaway target repo.
  writeFileSync(join(target, 'README.md'), '# Sandbox target\n\nThrowaway repo for the work-package smoke run.\n');
  execFileSync('git', ['init', '-q'], { cwd: target });
  execFileSync('git', ['add', '.'], { cwd: target });
  execFileSync('git', ['-c', 'user.email=smoke@test', '-c', 'user.name=smoke', 'commit', '-qm', 'init'], { cwd: target });
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
  return `${WORKER_BRIEF}\n\n---\nsession_index: ${sessionIndex}\nThis is your first turn for the current activity. Begin executing it now.`;
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
      name: 'start_session', arguments: { workflow_id: 'work-package', agent_id: 'smoke-orchestrator' },
    }));
    const sessionIndex = start.session_index as string;
    const slug = start.planning_slug as string;
    const sessionPath = join(sb.workspace, '.engineering/artifacts/planning', slug, 'session.json');
    log(`session ${sessionIndex} (slug ${slug})`);

    const variables: Record<string, unknown> = {};
    let current: string | null = 'start-work-package';
    let count = 0;

    while (current && count < MAX_ACTIVITIES) {
      count++;
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
      const next = pickNext(act, variables);
      log(`next: ${next ?? '(terminal)'}`);
      current = next;
    }

    const finalState = JSON.parse(readFileSync(sessionPath, 'utf8'));
    log(`final status: ${finalState.status}; activities run: ${count}`);
    writeFileSync(join(sb.root, 'transcript.json'), JSON.stringify({ sessionIndex, transcript, finalStatus: finalState.status }, null, 2));
    log(`transcript: ${join(sb.root, 'transcript.json')}`);
  } finally {
    await h.close();
    if (!KEEP) { try { rmSync(sb.root, { recursive: true, force: true }); } catch { /* ignore */ } }
    else log(`sandbox kept: ${sb.root}`);
  }
}

main().catch(e => { process.stderr.write(`smoke-run failed: ${e?.stack ?? e}\n`); process.exit(1); });
