/**
 * check-role-barred-calls — an instruction reaching a role that cannot act on it (#652).
 *
 * The server ships each role a bundle: `get_workflow` hands an orchestrator its set of techniques,
 * `get_activity` hands a worker its own, and a group contract merges into every technique beneath
 * it. So a rule written once on a shared contract reaches both roles, whatever it says — and a rule
 * naming a call one of them is forbidden to make arrives at an agent with no way to follow it.
 *
 * No single file is wrong when that happens. The instruction is defensible, the prohibition is
 * defensible, and the tool is real; the defect lives in the relationship between the three, and
 * every other guard reads one construct at a time. The original instance cost intermittent run
 * failures that read as model unreliability: a worker was told to report where the run goes next,
 * the destination lived only in `get_workflow`, and the worker's own conduct forbade that call.
 *
 * ## Three readings, then a comparison
 *
 *   the bundles   `core-ops.ts` — what each role receives, resolved to the files it is composed
 *                 from, each technique plus the contracts above it. Server code, so the guard
 *                 reads what is shipped rather than a list someone maintains.
 *   the bans      the sentences in those files that forbid a call, attributed to every role the
 *                 file reaches.
 *   the surface   the tools this server registers, read from the registrations themselves.
 *
 * A role's bundle naming a call that role is banned from is the finding. Two shapes reach it: an
 * instruction to make the call, and an instruction to take a value from one — which carries no call
 * verb in the sentence at all ("the workflow graph from `get_workflow`"). Both are reported the same
 * way, because the remedy is the same: move the rule to the role that can act on it, or carry the
 * fact the call stood for.
 *
 * ## A conditional clause states a case, not a duty
 *
 * A call named only inside a conditional clause is not read as banned, and not read as an
 * instruction to make it. The clause names the case, and the case picks out the reader:
 *
 *     Until a stub names one there is no next activity to act on, so never issue its
 *     `get_activity` on your own initiative.
 *
 * That sentence is the worker's rule for an unprompted fetch, not a ban on `get_activity` — a call
 * every worker makes on every activity. Read as a ban it would condemn the worker's own role file,
 * its finalize step, and the shared contract, all for naming the call the role exists to make. The
 * carve-out is one rule applied to both readings: a sentence that OPENS by naming a case is
 * conditional throughout, and a case named mid-sentence governs its own clause.
 *
 * `before` and `after` are not in the set. Both are overwhelmingly prepositional here ("Before
 * executing any step, confirm …"), and such a phrase names an occasion rather than a case: the duty
 * it introduces is owed on every step, so the reader it binds is whoever holds the duty.
 *
 * ## What this does not reach
 *
 * A ban stated by a rule no bundle delivers, and a call the server does not register — a harness or
 * knowledge-base tool belongs to a schema this repository does not hold. Fenced blocks are passed
 * over: they show a call rather than instruct one.
 *
 * Hard zero, no ledger — the corpus is clean and this guard is here to keep it that way.
 *
 * Run: npx tsx guards/check-role-barred-calls.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  CORE_ORCHESTRATOR_TECHNIQUES,
  CORE_WORKER_TECHNIQUES,
  FAN_DISPATCH_TECHNIQUES,
  ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
  WORKER_CHECKPOINT_TECHNIQUES,
} from '../src/loaders/core-ops.js';
import { META_WORKFLOW_ID, type CorpusIndex, indexCorpus, namespaceSubdir } from '../src/loaders/corpus-index.js';
import { parseTechniqueRef } from '../src/loaders/technique-ref.js';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { registeredTools } from './check-tool-call-shape.js';
import { fencedLines, toLines } from './markdown-refs.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The two roles a session serves, and the refs the server bundles for each. */
export const ROLE_BUNDLES: ReadonlyArray<{ role: string; refs: readonly string[] }> = [
  {
    role: 'orchestrator',
    refs: [
      ...CORE_ORCHESTRATOR_TECHNIQUES,
      ...ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
      ...FAN_DISPATCH_TECHNIQUES,
    ],
  },
  {
    role: 'worker',
    refs: [...CORE_WORKER_TECHNIQUES, ...WORKER_CHECKPOINT_TECHNIQUES],
  },
];

/** The index a grouped technique is read from, and the contract every technique beneath it takes. */
const GROUP_INDEX = 'TECHNIQUE.md';

/** An inline code span — how the corpus writes a tool name, bare or with its arguments. */
const CODE_SPAN = /`([^`]+)`/g;
/** A tool name, alone or heading a written signature (`get_activity { bundle: "full" }`). */
const TOOL_IN_SPAN = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\{|$)/;

/**
 * The conjunctions that open a case.
 *
 * Temporal and conditional alike: the corpus writes "Where the reply carries …" for a case as
 * readily as "If". What they share is that the clause they open names a circumstance, so what
 * follows binds whoever is in it rather than everyone the file reaches.
 */
const SUBORDINATORS = [
  'if', 'when', 'whenever', 'where', 'wherever', 'unless', 'until', 'while', 'once',
  'provided', 'as long as', 'otherwise',
];
const SUBORDINATOR_RE = new RegExp(`\\b(?:${SUBORDINATORS.join('|')})\\b`, 'gi');
/** Markdown furniture a line opens with: list markers, numbering, quoting, a bold lead. */
const LEAD = /^[\s>]*(?:[-*+]\s+|\d+\.\s+)?(?:\*\*[^*]*\*\*|__[^_]*__)?[\s:—–-]*/;
/** What ends a clause. */
const CLAUSE_BREAK = /[,;—–(]/;
/** A negation that can govern a call. */
const NEGATION = /\b(?:never|not|no)\b/i;
/** The verbs a ban is written with — a ban is on MAKING the call, not on the tool existing. */
const CALL_VERB = /\b(?:call|calls|calling|issue|issues|issuing|invoke|invokes|invoking|make|makes|making|use|uses|using|fetch|fetches|fetching|request|requests|requesting|pre-?load|pre-?loads|run|runs)\b/i;

/** One tool name as a file names it, with where it sits and how the sentence frames it. */
export interface Mention {
  tool: string;
  line: number;
  /** The sentence holding it, for the finding to quote. */
  sentence: string;
  /** The call is named only inside a clause naming a case. */
  governed: boolean;
  /** The clause holding it forbids making the call. */
  banned: boolean;
}

/**
 * Split a line into sentences.
 *
 * A full stop ends one only where what follows opens a new one, so `e.g.` and a version number stay
 * inside the sentence that wrote them. Prose in this corpus runs one sentence to a clause-rich line,
 * and the unit the readings below are taken over is the sentence: a case named at its head governs
 * everything the sentence goes on to say.
 */
export function sentencesIn(line: string): string[] {
  return line
    .split(/(?<=[.!?])\s+(?=[A-Z`"'(\[*_])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/** Split a sentence into clauses, keeping each one's offset so a mention can be placed in it. */
function clausesIn(sentence: string): Array<{ text: string; start: number }> {
  const out: Array<{ text: string; start: number }> = [];
  let start = 0;
  for (let i = 0; i < sentence.length; i++) {
    if (!CLAUSE_BREAK.test(sentence[i]!)) continue;
    out.push({ text: sentence.slice(start, i), start });
    start = i + 1;
  }
  out.push({ text: sentence.slice(start), start });
  return out;
}

/**
 * The character spans of the sentence that name a case.
 *
 * A sentence that opens with one of the conjunctions is conditional throughout — it states what to
 * do in a case, and names no duty outside it. A conjunction further in opens a clause, and governs
 * to the end of that clause alone.
 */
export function casedSpans(sentence: string): Array<[number, number]> {
  const lead = LEAD.exec(sentence)?.[0]?.length ?? 0;
  const body = sentence.slice(lead);
  const opening = new RegExp(`^(?:${SUBORDINATORS.join('|')})\\b`, 'i');
  if (opening.test(body)) return [[0, sentence.length]];
  const spans: Array<[number, number]> = [];
  for (const match of sentence.matchAll(SUBORDINATOR_RE)) {
    const from = match.index;
    const rest = sentence.slice(from + match[0].length);
    const breakAt = rest.search(CLAUSE_BREAK);
    spans.push([from, breakAt === -1 ? sentence.length : from + match[0].length + breakAt]);
  }
  return spans;
}

/**
 * Every tool this server registers that a markdown body names, with how each sentence frames it.
 *
 * Fenced blocks are left out — a fence shows a call rather than instructing one.
 */
export function mentionsIn(body: string, tools: ReadonlySet<string>): Mention[] {
  const lines = toLines(body);
  const { fenced } = fencedLines(lines);
  const out: Mention[] = [];
  for (const [index, line] of lines.entries()) {
    if (fenced.has(index)) continue;
    for (const sentence of sentencesIn(line)) {
      const spans = casedSpans(sentence);
      const clauses = clausesIn(sentence);
      for (const span of sentence.matchAll(CODE_SPAN)) {
        const name = TOOL_IN_SPAN.exec(span[1]!.trim())?.[1];
        if (!name || !tools.has(name)) continue;
        const at = span.index;
        let clause = sentence;
        for (let i = clauses.length - 1; i >= 0; i--) {
          const candidate = clauses[i]!;
          if (candidate.start <= at) { clause = candidate.text; break; }
        }
        out.push({
          tool: name,
          line: index + 1,
          sentence,
          governed: spans.some(([from, to]) => at >= from && at < to),
          banned: NEGATION.test(clause) && CALL_VERB.test(clause),
        });
      }
    }
  }
  return out;
}

/** One file of a role's bundle: where it is, and the reference that put it there. */
export interface BundleFile {
  path: string;
  /** The reference whose composition this file is part of. */
  ref: string;
  /** Whether it is the technique itself or a contract merging into it. */
  kind: 'technique' | 'contract';
}

/**
 * The files one reference is composed from: the technique, and every contract above it.
 *
 * The walk is the loader's own — the namespace's `techniques/TECHNIQUE.md`, then the index of each
 * containing group — so what the guard reads is what a role receives. A reference resolving to no
 * file is returned empty and reported by the caller: a bundle entry the guard cannot find is
 * surface it would otherwise pass clean over.
 */
export function composedFiles(index: CorpusIndex, ref: string): BundleFile[] {
  const parsed = parseTechniqueRef(ref, index);
  const techniques = namespaceSubdir(index, parsed.namespace ?? META_WORKFLOW_ID, 'techniques');
  if (!techniques) return [];
  const path = parsed.segments.join('/');
  const leaf = [join(techniques, `${path}.md`), join(techniques, path, GROUP_INDEX)]
    .find((candidate) => existsSync(candidate));
  if (!leaf) return [];
  const out: BundleFile[] = [];
  const root = join(techniques, GROUP_INDEX);
  if (existsSync(root) && root !== leaf) out.push({ path: root, ref, kind: 'contract' });
  for (let depth = 1; depth < parsed.segments.length; depth++) {
    const group = join(techniques, parsed.segments.slice(0, depth).join('/'), GROUP_INDEX);
    if (existsSync(group) && group !== leaf) out.push({ path: group, ref, kind: 'contract' });
  }
  out.push({ path: leaf, ref, kind: 'technique' });
  return out;
}

/** What one role receives: each file once, under the first reference that reached it. */
function bundle(index: CorpusIndex, refs: readonly string[]): { files: BundleFile[]; missing: string[] } {
  const files: BundleFile[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    const composed = composedFiles(index, ref);
    if (composed.length === 0) { missing.push(ref); continue; }
    for (const file of composed) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      files.push(file);
    }
  }
  return { files, missing };
}

/** What one corpus says about the two roles. */
export interface RoleReading {
  findings: Finding[];
  /** Calls each role is unconditionally forbidden to make. A conditional clause is not a ban. */
  barred: Map<string, ReadonlySet<string>>;
}

/**
 * The bans and the instructions, read once.
 *
 * A call is barred for a role when some file that role receives forbids it outside a conditional
 * clause. An instruction is a finding when it turns that call on for the same role.
 */
export function measureRoles(root: string = DEFAULT_ROOT): RoleReading {
  const index = indexCorpus(root);
  const tools = new Set(registeredTools().keys());
  const findings: Finding[] = [];
  const barred = new Map<string, ReadonlySet<string>>();
  let scanned = 0;

  for (const { role, refs } of ROLE_BUNDLES) {
    const { files, missing } = bundle(index, refs);
    for (const ref of missing) {
      findings.push({
        check: 'unreachable-bundle-ref',
        site: `${role}::${ref}`,
        detail: `the ${role} bundle names '${ref}', which this corpus holds no technique for`
          + ' — so the calls that reference would have carried are not measured here;'
          + ' correct the reference in src/loaders/core-ops.ts, or add the technique',
      });
    }
    const read = new Map<string, Mention[]>();
    for (const file of files) {
      read.set(file.path, mentionsIn(readFileSync(file.path, 'utf-8'), tools));
      scanned++;
    }
    const roleBarred = new Set<string>();
    for (const mentions of read.values()) {
      for (const mention of mentions) {
        if (mention.banned && !mention.governed) roleBarred.add(mention.tool);
      }
    }
    barred.set(role, roleBarred);
    for (const file of files) {
      for (const mention of read.get(file.path) ?? []) {
        if (!roleBarred.has(mention.tool) || mention.banned || mention.governed) continue;
        const home = file.kind === 'contract'
          ? `a contract merging into '${file.ref}'`
          : `'${file.ref}'`;
        findings.push({
          check: 'barred-call',
          site: `${relative(root, file.path)}:${mention.line}`,
          detail: `${home} reaches the ${role}, and turns on \`${mention.tool}\` — a call the ${role}`
            + ` is forbidden to make: "${mention.sentence}".`
            + ` Move what only the other role can act on to that role's own technique, or carry the`
            + ` fact the call stood for.`,
        });
      }
    }
  }
  assertScanned(scanned, 'bundled technique files', root);
  return { findings, barred };
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  return measureRoles(root).findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('role-barred-calls', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no instruction a role receives turns on a call that role is forbidden to make',
    remedy: "move the rule to the role that can act on it, or carry the fact the call stood for",
  });
}
