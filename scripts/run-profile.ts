/**
 * run-profile — work-package run profiler, read from harness session transcripts.
 *
 * The third measurement tool in this repo, beside `bench:token` (payload chars for a headless walk)
 * and `bench:dispatch` (what a re-dispatch costs). Those two price the server's *delivery* on a
 * synthetic walk. This one profiles a *real run already on disk*: it reads a session transcript and
 * the worker transcripts stored beside it, places the startup milestones on a timeline, and reports
 * token usage split between the orchestrator's main context and each worker's context.
 *
 * ## A usage figure belongs to a response, not to a record
 *
 * The harness writes one transcript record per content block of a response, and repeats the same
 * usage object on every one of them. `requestId` is the response identity: records sharing one
 * describe one response and carry one copy each of its usage. So every figure here is reduced
 * across a response's records rather than summed over them — the maximum, which is the shared value
 * for the cache and input counters and the terminal count for `output_tokens`, whose earlier
 * streaming partials report single digits.
 *
 * Each total is reported beside `recordSummed`, what a summation over records yields for the same
 * span, and their `ratio`. A figure quoted from a per-record count can then be reconciled against
 * this profile rather than merely contradicted by it — over the whole 27 July 2026 run, main and
 * worker context together reconcile at 2.09x, and the worker column across that run's startup
 * window at 2.42x ([#409](https://github.com/m2ux/workflow-server/issues/409)).
 *
 * ## Milestones
 *
 * Placed from the main transcript's tool calls, as the startup-cost measurement record defines them:
 *
 *   startSession        `start_session` — end of the bootstrap-protocol preamble
 *   firstWorker         the first worker dispatch
 *   firstCheckpoint     the first `present_checkpoint`
 *   clientFirstActivity the first `next_activity` against a client session; everything before it is
 *                       the meta workflow's ceremony
 *   openingComplete     the next `next_activity` after that, which reports the opening activity done
 *
 * A `next_activity` call names the activity being requested and carries the step manifest of the
 * one just finished, so the call *after* the opening activity is fetched is the call that reports it
 * complete. That is where substantive work begins, and it closes the default measurement window.
 *
 * The client session is read from the transitions themselves: a session index that never carries a
 * meta activity belongs to the client workflow, and the first call against it names that workflow's
 * `initialActivity`. Every client workflow in the corpus opens on a different id, so the profiler
 * discovers the opening activity rather than being told it — and reports it.
 *
 * Checkpoint wait is the span between putting a question to the user and receiving the answer
 * (`AskUserQuestion` call to result), summed over the window and excluded from active duration.
 *
 * Usage:
 *
 *   npm run profile:run -- --session=03e43af3
 *   npm run profile:run -- --transcript=~/.claude/projects/<slug>/<session-id>.jsonl
 *   npm run profile:run -- --session=03e43af3 --session=f5783c2a --json
 *
 * Flags:
 *   --session=<id-or-prefix>  Session to profile, resolved under --projects-dir. Repeatable.
 *   --transcript=<path>       Session transcript JSONL to profile directly. Repeatable.
 *   --projects-dir=<path>     Transcript root (default: ~/.claude/projects)
 *   --window=startup|full     Span to report (default: startup — t0 to the opening activity done)
 *   --json                    One JSON array on stdout instead of the text report
 *
 * Exit: 0 on a completed profile; 1 if no run could be resolved or read.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** One transcript line. Fields beyond these exist and are ignored. */
export interface TranscriptRecord {
  type?: string;
  timestamp?: string;
  /** Response identity. Records sharing one describe one response. */
  requestId?: string;
  uuid?: string;
  isSidechain?: boolean;
  message?: {
    id?: string;
    role?: string;
    content?: unknown;
    usage?: Record<string, unknown>;
  };
}

/** Token usage over a span, counted once per response. */
export interface UsageTotals {
  /** Responses that reported usage. The unit a usage figure belongs to. */
  responses: number;
  /** Records that carried a usage object — one per content block of those responses. */
  records: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  /** Input tokens billed at neither cache rate. */
  inputTokens: number;
  /** What a summation over records yields for the same span, and by what factor it exceeds the total. */
  recordSummed: {
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    inputTokens: number;
    /** `recordSummed.cacheCreationTokens / cacheCreationTokens`, or null when the total is zero. */
    cacheCreationRatio: number | null;
  };
}

export interface WorkerProfile {
  agentId: string;
  /** Harness label for the dispatch, e.g. `initialize-session worker`. */
  description?: string;
  /** Dispatch time, from the spawning tool call in the main transcript. */
  dispatchedAt?: string;
  /** Minutes from t0 to dispatch. */
  dispatchOffsetMin?: number;
  usage: UsageTotals;
  /** Result characters this worker received, by tool. */
  resultCharsByTool: Record<string, number>;
  resultCharsTotal: number;
}

export interface Milestones {
  startSession?: string;
  firstWorker?: string;
  firstCheckpoint?: string;
  clientFirstActivity?: string;
  openingComplete?: string;
}

export interface RunProfile {
  sessionId: string;
  transcriptPath: string;
  t0: string;
  /** Opening activity of the client workflow this run dispatched, read from the transcript. */
  openingActivity?: string;
  window: {
    mode: 'startup' | 'full';
    start: string;
    end: string;
    /** Milestone that closed the window, or `transcript-end` when the run never reached it. */
    closedBy: string;
    minutes: number;
  };
  milestones: Milestones;
  /** Milestone offsets from t0, in minutes. */
  milestoneOffsetsMin: Partial<Record<keyof Milestones, number>>;
  checkpointWaitMin: number;
  main: UsageTotals;
  workers: WorkerProfile[];
  workerTotals: UsageTotals;
  /** Result characters the orchestrator received in the window, by tool. */
  resultCharsByTool: Record<string, number>;
}

const DEFAULT_PROJECTS_DIR = join(homedir(), '.claude', 'projects');

function flags(name: string): string[] {
  return process.argv.slice(2).filter((a) => a.startsWith(`--${name}=`)).map((a) => a.slice(name.length + 3));
}

function flag(name: string, fallback: string): string {
  const all = flags(name);
  return all.length ? all[all.length - 1]! : fallback;
}

function has(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

export function parseTranscript(text: string): TranscriptRecord[] {
  const out: TranscriptRecord[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // A transcript is appended to live, so its last line can be a partial write.
    try { out.push(JSON.parse(trimmed) as TranscriptRecord); } catch { /* skip */ }
  }
  return out;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function emptyTotals(): UsageTotals {
  return {
    responses: 0,
    records: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    inputTokens: 0,
    recordSummed: {
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      inputTokens: 0,
      cacheCreationRatio: null,
    },
  };
}

/**
 * Token usage over `records`, counted once per response.
 *
 * Records are grouped by `requestId` — the response identity — and each field is reduced with `max`
 * across a group. The cache and input counters are one value repeated on every record of the
 * response, so the maximum is that value; `output_tokens` grows to its final count on the record
 * that closes the response, so the maximum is that count. A usage-bearing record with no
 * `requestId` stands as its own response, keyed on its `uuid`.
 */
export function sumUsage(records: Iterable<TranscriptRecord>): UsageTotals {
  const totals = emptyTotals();
  const byResponse = new Map<string, Record<string, unknown>>();
  for (const record of records) {
    const usage = record.message?.usage;
    if (!usage) continue;
    totals.records += 1;
    totals.recordSummed.outputTokens += num(usage.output_tokens);
    totals.recordSummed.cacheCreationTokens += num(usage.cache_creation_input_tokens);
    totals.recordSummed.cacheReadTokens += num(usage.cache_read_input_tokens);
    totals.recordSummed.inputTokens += num(usage.input_tokens);
    const key = record.requestId ?? record.message?.id ?? record.uuid ?? `anonymous-${totals.records}`;
    const held = byResponse.get(key);
    if (!held) { byResponse.set(key, { ...usage }); continue; }
    for (const field of ['output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'input_tokens']) {
      if (num(usage[field]) > num(held[field])) held[field] = usage[field];
    }
  }
  for (const usage of byResponse.values()) {
    totals.responses += 1;
    totals.outputTokens += num(usage.output_tokens);
    totals.cacheCreationTokens += num(usage.cache_creation_input_tokens);
    totals.cacheReadTokens += num(usage.cache_read_input_tokens);
    totals.inputTokens += num(usage.input_tokens);
  }
  totals.recordSummed.cacheCreationRatio = totals.cacheCreationTokens === 0
    ? null
    : Math.round((totals.recordSummed.cacheCreationTokens / totals.cacheCreationTokens) * 1000) / 1000;
  return totals;
}

interface ContentBlock {
  type?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: unknown;
}

function blocks(record: TranscriptRecord): ContentBlock[] {
  const content = record.message?.content;
  return Array.isArray(content) ? content as ContentBlock[] : [];
}

/** Characters of a tool result, whichever shape the harness stored it in. */
function resultChars(block: ContentBlock): number {
  const content = block.content;
  if (typeof content === 'string') return content.length;
  if (!Array.isArray(content)) return 0;
  let chars = 0;
  for (const part of content as Array<{ type?: string; text?: string }>) {
    if (part?.type === 'text' && typeof part.text === 'string') chars += part.text.length;
  }
  return chars;
}

function ms(timestamp: string | undefined): number {
  return timestamp ? Date.parse(timestamp) : Number.NaN;
}

function minutesBetween(from: string, to: string): number {
  return Math.round(((ms(to) - ms(from)) / 60000) * 10) / 10;
}

/** A tool name matches when it is the bare name or an MCP-qualified one ending in it. */
function isTool(name: string | undefined, bare: string): boolean {
  return !!name && (name === bare || name.endsWith(`__${bare}`));
}

/** The harness spawns a worker through one of these; which one depends on the client version. */
const SPAWN_TOOLS = new Set(['Agent', 'Task']);

/** One `next_activity` call: the session it transitions and the activity it asks for. */
interface Transition {
  at: string;
  sessionIndex?: string;
  activityId?: string;
}

function transitions(main: TranscriptRecord[]): Transition[] {
  const calls: Transition[] = [];
  for (const record of main) {
    if (!record.timestamp) continue;
    for (const block of blocks(record)) {
      if (block.type !== 'tool_use' || !isTool(block.name, 'next_activity')) continue;
      calls.push({
        at: record.timestamp,
        sessionIndex: typeof block.input?.session_index === 'string' ? block.input.session_index : undefined,
        activityId: typeof block.input?.activity_id === 'string' ? block.input.activity_id : undefined,
      });
    }
  }
  return calls;
}

/**
 * The meta workflow's activity roster, from `workflows/meta/activities/`. The bootstrap protocol
 * fixes this one workflow, so its ids identify a meta session; every other session a run transitions
 * belongs to the client workflow the meta walk dispatched.
 */
const META_ACTIVITIES = new Set([
  'discover-session',
  'initialize-session',
  'resolve-target',
  'dispatch-client-workflow',
  'end-workflow',
]);

/**
 * Milestones, and the client workflow's opening activity.
 *
 * The opening activity is found by the session it transitions rather than by its id: a session index
 * that never carries a meta activity is a client session, and by the `next_activity` contract the
 * first call against it names that workflow's `initialActivity`. Every client workflow in the corpus
 * opens on a different id, so reading the session scope is what lets one profiler walk any of them —
 * and it holds on a run that creates a second meta session before dispatching.
 */
function findMilestones(main: TranscriptRecord[]): { milestones: Milestones; openingActivity?: string } {
  const found: Milestones = {};
  let openingActivity: string | undefined;
  for (const record of main) {
    const at = record.timestamp;
    if (!at) continue;
    for (const block of blocks(record)) {
      if (block.type !== 'tool_use') continue;
      const name = block.name;
      if (!found.startSession && isTool(name, 'start_session')) found.startSession = at;
      if (!found.firstWorker && name && SPAWN_TOOLS.has(name)) found.firstWorker = at;
      if (!found.firstCheckpoint && isTool(name, 'present_checkpoint')) found.firstCheckpoint = at;
    }
  }

  const calls = transitions(main);
  const metaSessions = new Set(
    calls.filter((c) => c.activityId && META_ACTIVITIES.has(c.activityId)).map((c) => c.sessionIndex),
  );
  const opening = calls.findIndex((c) => c.sessionIndex && !metaSessions.has(c.sessionIndex));
  if (opening !== -1) {
    found.clientFirstActivity = calls[opening]!.at;
    openingActivity = calls[opening]!.activityId;
    // A next_activity call carries the step manifest of the activity just finished, so the call
    // after the opening activity is fetched is the one reporting it complete.
    found.openingComplete = calls[opening + 1]?.at;
  }
  return { milestones: found, openingActivity };
}

/** Summed `AskUserQuestion` call-to-result spans inside the window, in minutes. */
function checkpointWaitMinutes(main: TranscriptRecord[], from: number, to: number): number {
  const askedAt = new Map<string, number>();
  let waited = 0;
  for (const record of main) {
    const at = ms(record.timestamp);
    if (!Number.isFinite(at) || at < from || at > to) continue;
    for (const block of blocks(record)) {
      if (block.type === 'tool_use' && block.name === 'AskUserQuestion' && block.id) askedAt.set(block.id, at);
      if (block.type !== 'tool_result' || !block.tool_use_id) continue;
      const asked = askedAt.get(block.tool_use_id);
      if (asked !== undefined) { waited += at - asked; askedAt.delete(block.tool_use_id); }
    }
  }
  return Math.round((waited / 60000) * 10) / 10;
}

/** Result characters by tool name, over records inside the window. */
function resultCharsByTool(records: TranscriptRecord[], from: number, to: number): Record<string, number> {
  const toolOfUse = new Map<string, string>();
  for (const record of records) {
    for (const block of blocks(record)) {
      if (block.type === 'tool_use' && block.id && block.name) toolOfUse.set(block.id, block.name);
    }
  }
  const chars: Record<string, number> = {};
  for (const record of records) {
    const at = ms(record.timestamp);
    if (!Number.isFinite(at) || at < from || at > to) continue;
    for (const block of blocks(record)) {
      if (block.type !== 'tool_result' || !block.tool_use_id) continue;
      const tool = toolOfUse.get(block.tool_use_id) ?? 'unattributed';
      chars[tool] = (chars[tool] ?? 0) + resultChars(block);
    }
  }
  return chars;
}

function inWindow(records: TranscriptRecord[], from: number, to: number): TranscriptRecord[] {
  return records.filter((r) => {
    const at = ms(r.timestamp);
    return Number.isFinite(at) && at >= from && at <= to;
  });
}

/** Timestamp of the tool call that spawned each worker, keyed on the harness `toolUseId`. */
function spawnTimes(main: TranscriptRecord[]): Map<string, string> {
  const times = new Map<string, string>();
  for (const record of main) {
    if (!record.timestamp) continue;
    for (const block of blocks(record)) {
      if (block.type === 'tool_use' && block.id) times.set(block.id, record.timestamp);
    }
  }
  return times;
}

export interface ProfileOptions {
  window?: 'startup' | 'full';
}

export function profileRun(transcriptPath: string, options: ProfileOptions = {}): RunProfile {
  const mode = options.window ?? 'startup';
  const path = resolve(transcriptPath);
  const main = parseTranscript(readFileSync(path, 'utf8')).filter((r) => !r.isSidechain);
  if (!main.length) throw new Error(`transcript has no records: ${path}`);

  const sessionId = basename(path, '.jsonl');
  const t0 = main[0]!.timestamp ?? new Date(0).toISOString();
  const last = [...main].reverse().find((r) => r.timestamp)?.timestamp ?? t0;
  const { milestones, openingActivity } = findMilestones(main);

  const closedBy = mode === 'full' ? 'transcript-end'
    : milestones.openingComplete ? 'openingComplete' : 'transcript-end';
  const end = mode === 'full' ? last : (milestones.openingComplete ?? last);
  const from = ms(t0);
  const to = ms(end);

  const workers: WorkerProfile[] = [];
  const spawns = spawnTimes(main);
  const subagentsDir = join(dirname(path), sessionId, 'subagents');
  if (existsSync(subagentsDir) && statSync(subagentsDir).isDirectory()) {
    for (const file of readdirSync(subagentsDir).filter((f) => f.endsWith('.jsonl')).sort()) {
      const agentId = basename(file, '.jsonl');
      const records = parseTranscript(readFileSync(join(subagentsDir, file), 'utf8'));
      if (!records.length) continue;
      const metaPath = join(subagentsDir, `${agentId}.meta.json`);
      const meta = existsSync(metaPath)
        ? JSON.parse(readFileSync(metaPath, 'utf8')) as { description?: string; toolUseId?: string }
        : {};
      const dispatchedAt = (meta.toolUseId ? spawns.get(meta.toolUseId) : undefined) ?? records[0]!.timestamp;
      const at = ms(dispatchedAt);
      // A worker belongs to the window its dispatch falls in; its own turns may run past the close.
      if (!Number.isFinite(at) || at < from || at > to) continue;
      const chars = resultCharsByTool(records, -Infinity, Infinity);
      workers.push({
        agentId,
        description: meta.description,
        dispatchedAt,
        dispatchOffsetMin: dispatchedAt ? minutesBetween(t0, dispatchedAt) : undefined,
        usage: sumUsage(records),
        resultCharsByTool: chars,
        resultCharsTotal: Object.values(chars).reduce((a, b) => a + b, 0),
      });
    }
  }
  workers.sort((a, b) => ms(a.dispatchedAt) - ms(b.dispatchedAt));

  const workerRecords: TranscriptRecord[] = [];
  for (const worker of workers) {
    const records = parseTranscript(readFileSync(join(subagentsDir, `${worker.agentId}.jsonl`), 'utf8'));
    workerRecords.push(...records);
  }

  const milestoneOffsetsMin: Partial<Record<keyof Milestones, number>> = {};
  for (const [name, at] of Object.entries(milestones)) {
    if (at) milestoneOffsetsMin[name as keyof Milestones] = minutesBetween(t0, at);
  }

  return {
    sessionId,
    transcriptPath: path,
    t0,
    ...(openingActivity ? { openingActivity } : {}),
    window: { mode, start: t0, end, closedBy, minutes: minutesBetween(t0, end) },
    milestones,
    milestoneOffsetsMin,
    checkpointWaitMin: checkpointWaitMinutes(main, from, to),
    main: sumUsage(inWindow(main, from, to)),
    workers,
    workerTotals: sumUsage(workerRecords),
    resultCharsByTool: resultCharsByTool(main, from, to),
  };
}

/** Session transcripts under `projectsDir` whose id starts with `prefix`. */
export function findTranscripts(prefix: string, projectsDir: string): string[] {
  const hits: string[] = [];
  if (!existsSync(projectsDir)) return hits;
  for (const project of readdirSync(projectsDir)) {
    const dir = join(projectsDir, project);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.jsonl') && file.startsWith(prefix)) hits.push(join(dir, file));
    }
  }
  return hits.sort();
}

function thousands(n: number): string {
  return n.toLocaleString('en-US');
}

function report(profile: RunProfile): string {
  const lines: string[] = [];
  const w = profile.window;
  lines.push(`== ${profile.sessionId}  t0=${profile.t0}`);
  lines.push(`   window: ${w.mode} — ${w.minutes} min, closed by ${w.closedBy}`);
  if (profile.openingActivity) lines.push(`   client workflow opens on: ${profile.openingActivity}`);
  for (const [name, offset] of Object.entries(profile.milestoneOffsetsMin)) {
    lines.push(`   ${name.padEnd(20)} + ${String(offset).padStart(8)} min`);
  }
  lines.push(`   checkpoint wait: ${profile.checkpointWaitMin} min  |  workers dispatched: ${profile.workers.length}`);
  const main = profile.main;
  const workers = profile.workerTotals;
  lines.push(
    `   MAIN   out=${thousands(main.outputTokens).padStart(9)}  cache_write=${thousands(main.cacheCreationTokens).padStart(11)}`
    + `  cache_read=${thousands(main.cacheReadTokens).padStart(11)}  (${main.responses} responses over ${main.records} records)`,
  );
  lines.push(
    `   WORKER out=${thousands(workers.outputTokens).padStart(9)}  cache_write=${thousands(workers.cacheCreationTokens).padStart(11)}`
    + `  cache_read=${thousands(workers.cacheReadTokens).padStart(11)}  (${workers.responses} responses over ${workers.records} records)`,
  );
  const ratio = workers.recordSummed.cacheCreationRatio;
  if (ratio !== null) {
    lines.push(`   worker cache-write record-summed: ${thousands(workers.recordSummed.cacheCreationTokens)} (${ratio.toFixed(2)}x this total)`);
  }
  if (profile.workers.length) {
    lines.push('   per worker:');
    for (const worker of profile.workers) {
      const label = (worker.description ?? worker.agentId).slice(0, 34).padEnd(34);
      lines.push(
        `     +${String(worker.dispatchOffsetMin ?? 0).padStart(7)} min  ${label}`
        + ` out=${thousands(worker.usage.outputTokens).padStart(8)}  cache_write=${thousands(worker.usage.cacheCreationTokens).padStart(10)}`
        + `  results=${thousands(worker.resultCharsTotal).padStart(9)}B`,
      );
    }
  }
  const tools = Object.entries(profile.resultCharsByTool).sort((a, b) => b[1] - a[1]);
  const total = tools.reduce((sum, [, chars]) => sum + chars, 0);
  lines.push(`   main result chars in window: total=${thousands(total)}`);
  for (const [tool, chars] of tools.slice(0, 12)) {
    lines.push(`      ${tool.padEnd(34)} ${thousands(chars).padStart(9)}`);
  }
  return lines.join('\n');
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const projectsDir = resolve(flag('projects-dir', DEFAULT_PROJECTS_DIR).replace(/^~(?=$|\/)/, homedir()));
  const window = flag('window', 'startup');
  if (window !== 'startup' && window !== 'full') {
    process.stderr.write(`--window must be startup|full, got ${window}\n`);
    process.exit(1);
  }
  const paths = flags('transcript').map((p) => resolve(p.replace(/^~(?=$|\/)/, homedir())));
  for (const session of flags('session')) {
    const hits = findTranscripts(session, projectsDir);
    if (!hits.length) process.stderr.write(`WARN: no transcript under ${projectsDir} for session ${session}\n`);
    paths.push(...hits);
  }
  if (!paths.length) {
    process.stderr.write('nothing to profile — pass --session=<id> or --transcript=<path>\n');
    process.exit(1);
  }

  const profiles: RunProfile[] = [];
  for (const path of paths) {
    try {
      profiles.push(profileRun(path, { window }));
    } catch (err) {
      process.stderr.write(`WARN: ${path}: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }
  if (!profiles.length) process.exit(1);

  if (has('json')) {
    process.stdout.write(`${JSON.stringify(profiles, null, 2)}\n`);
  } else {
    process.stdout.write(`${profiles.map(report).join('\n\n')}\n`);
  }
}
