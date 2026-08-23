/**
 * Session-against-definition check (#493).
 *
 * The activity-variables guard checks a definition against itself: what an activity's steps do
 * against what its contract declares, statically, over the whole corpus. This asks the other
 * question — did a RUN stay inside the contracts the definitions declare — and it needs a session
 * to answer, so it is not a corpus guard and cannot run in the sweep.
 *
 * Two findings, both read from the session's own history plus the workflow it names:
 *
 *   undeclared-write — a variable the run wrote while exiting an activity that the activity does
 *                      not declare under `variables.writes`. Either the contract is short of what
 *                      the activity really produces, or the run produced something the definition
 *                      never sanctioned. The finding names both readings, because the session
 *                      cannot tell them apart and a person can.
 *   no-progress      — a FINISHED run that recorded variable writes or checkpoint responses and
 *                      never completed an activity. A driver reporting activities while the session
 *                      stays put looks exactly like one that is working, which is how a smoke run
 *                      once claimed two activities and executed one. Only the caller knows a run is
 *                      over, so this is asked for with --final: a session read mid-activity has no
 *                      completions yet and is not in trouble for it.
 *
 * Point it at any session: a smoke run's, an end-to-end walk's, or a real one, which is the only
 * way to learn whether the contracts hold when a person is driving.
 *
 *   npx tsx scripts/check-session-contract.ts <path/to/session.json> [--root <workflows-dir>] [--json]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { requireWorkflowsRoot } from './workflows-root.js';
import { report, wantsJson, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = join(DIR, '..', 'workflows');

interface SessionHistoryEntry {
  type: string;
  activity?: string;
  data?: { name?: string; source?: string };
}

interface SessionShape {
  workflowId: string;
  sessionIndex?: string;
  completedActivities?: string[];
  checkpointResponses?: Record<string, unknown>;
  history?: SessionHistoryEntry[];
}

export interface SessionCheckResult {
  findings: Finding[];
  /** Writes the history could not attribute to an activity, so no contract owns them. */
  unattributedWrites: number;
  /** Writes measured against a contract. */
  checkedWrites: number;
}

/**
 * Check one session against the workflow it names.
 *
 * A write is measured only where the history attributes it to an activity: the attribution is what
 * says whose contract applies. Unattributed writes are counted and reported in the summary rather
 * than dropped, so a session whose events lost their activity does not read as a clean one.
 */
export async function checkSession(
  session: SessionShape,
  workflowsRoot: string,
  opts: { runComplete?: boolean } = {},
): Promise<SessionCheckResult> {
  const findings: Finding[] = [];
  const loaded = await loadWorkflow(workflowsRoot, session.workflowId);
  if (!loaded.success) {
    return {
      findings: [{
        check: 'workflow-load',
        site: session.workflowId,
        detail: `the session names workflow '${session.workflowId}', which does not load: ${loaded.error.message}`,
      }],
      unattributedWrites: 0,
      checkedWrites: 0,
    };
  }

  const declaredWrites = new Map<string, Set<string>>();
  for (const activity of loaded.value.activities ?? []) {
    declaredWrites.set(activity.id, new Set((activity.variables?.writes ?? []).map((w) => w.name)));
  }

  const history = session.history ?? [];
  let unattributedWrites = 0;
  let checkedWrites = 0;
  /** One finding per (activity, variable): the same name written at N steps is one disagreement. */
  const seen = new Set<string>();

  for (const entry of history) {
    if (entry.type !== 'variable_set') continue;
    const name = entry.data?.name;
    if (typeof name !== 'string') continue;
    if (entry.activity === undefined) { unattributedWrites++; continue; }
    const declared = declaredWrites.get(entry.activity);
    if (!declared) continue; // An activity outside this workflow's graph is the graph's finding.
    checkedWrites++;
    const key = `${entry.activity}\u0000${name}`;
    if (declared.has(name) || seen.has(key)) continue;
    seen.add(key);
    findings.push({
      check: 'undeclared-write',
      site: `${session.workflowId} :: ${entry.activity}`,
      detail: `the run wrote '${name}' while exiting this activity, which declares no such write`
        + ` (source ${entry.data?.source ?? 'unknown'}) — either the contract is short of what the`
        + ' activity produces, or the run produced what the definition does not sanction',
    });
  }

  const wroteSomething = checkedWrites > 0 || unattributedWrites > 0
    || Object.keys(session.checkpointResponses ?? {}).length > 0;
  const completed = session.completedActivities ?? [];
  if (opts.runComplete && wroteSomething && completed.length === 0) {
    findings.push({
      check: 'no-progress',
      site: `${session.workflowId} :: ${session.sessionIndex ?? '(no index)'}`,
      detail: 'the finished run recorded variable writes or checkpoint responses and completed no'
        + ' activity — a run reporting activities against a session that never moved reads the same'
        + ' as one that did',
    });
  }

  return { findings, unattributedWrites, checkedWrites };
}

/** Read a session file, or fail with the path rather than a parse error alone. */
export function readSession(path: string): SessionShape {
  if (!existsSync(path)) throw new Error(`no session at ${path}`);
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as SessionShape;
  } catch (error) {
    throw new Error(`session at ${path} did not parse: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const path = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!path) {
    process.stderr.write('usage: check-session-contract <path/to/session.json> [--final] [--root <workflows-dir>] [--json]\n');
    process.exit(2);
  }
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  // A run is over when its driver says so: a session read while an activity is still in flight
  // has no completions yet, and that is not a finding.
  const result = await checkSession(readSession(path), root, { runComplete: process.argv.includes('--final') });
  if (!wantsJson()) {
    process.stdout.write(
      `session-contract: ${result.checkedWrites} write(s) measured against a contract`
      + `${result.unattributedWrites ? `, ${result.unattributedWrites} unattributed and unmeasurable` : ''}\n`,
    );
  }
  report('session-contract', result.findings, {
    okMessage: 'every write the run recorded is one the activity that made it declares',
    root,
    remedy: 'declare the write on the activity, or stop the run making it',
  });
}
