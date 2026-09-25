/**
 * check-tool-call-shape — a call a definition describes matches the schema the tool registers (#788).
 *
 * The rest of the guard suite reads definitions against definitions and against themselves. Nothing
 * read a described call against the tool it calls, so a server contract could change and its callers
 * in the corpus stay as they were, green the whole time: the test suite drives the server directly
 * rather than through the technique text, so it exercises the contract while the techniques that
 * actually drive a run are never measured against it. That is the gap this closes. The tool
 * inventory comes from the registrations themselves, so the guard reads whatever the server accepts
 * today and needs no second list to keep in step.
 *
 * A call is recognised as `tool_name { ... }` inside an inline code span, which is how the corpus
 * writes one. The name has to be a tool this server registers; a harness or knowledge-base tool the
 * corpus also describes belongs to a schema this repository does not hold, and is passed over. So
 * is a fenced block and a wholly-quoted exemplar line — both show a call rather than instruct one,
 * and an anti-pattern entry opens with a defective one deliberately.
 *
 * Two findings:
 *
 *   unknown-argument  an argument the tool does not declare. The reading is the same either way it
 *                     arose — a renamed parameter, or a name that was never one — and the call
 *                     fails or silently drops the value depending on how strict that schema is.
 *   missing-required  a complete signature that omits a parameter the schema requires. The call is
 *                     refused at runtime, so the technique describes a step a run cannot take.
 *
 * The second check needs to know whether the text stands for the whole call, because the corpus
 * also shows a call partially — naming the one argument under discussion and no other. Two marks
 * tell a fragment from a signature, and both are the author's own:
 *
 *   an ellipsis (`…`, `...`, or a spread) says arguments are elided;
 *   a call that does not name `session_index`, where the tool declares one, is naming only what it
 *   is discussing — every authenticated tool takes that argument, so a whole call carries it.
 *
 * A fragment still has its named arguments checked; it is only the completeness question that does
 * not apply to it. The second mark costs one case to buy the rest: a call that genuinely forgets
 * `session_index` reads as a fragment, so that one omission is the one the completeness check
 * cannot report. Nothing else in the text tells a partial call from a whole one, and reading every
 * partial call as whole would report the corpus for showing an argument on its own.
 *
 * What this does NOT prove: that a run made the call, or that what it passed was true. Nor does it
 * reach an argument the schema accepts but the server requires conditionally — `from_activity` is
 * optional on `next_activity` and required by the resolver whenever the session holds an open
 * activity, so its absence is a live defect this check cannot see. What it does catch there is the
 * next spelling of it: a renamed or mistyped argument at the same call site.
 *
 * Hard zero, no baseline — the corpus is clean and this guard is here to keep it that way.
 *
 * Run: npx tsx guards/check-tool-call-shape.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { captureTools } from '../scripts/generate-site-data.js';
import { assertScanned, corpusNamespaces, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { fencedLines, toLines } from './markdown-refs.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** An inline code span. */
const CODE_SPAN = /`([^`]+)`/g;
/**
 * A line that is wholly a quoted string, which is prose showing a call rather than instructing one.
 * An anti-pattern entry opens with a defective exemplar on purpose, so reading it as an instruction
 * reports the catalog for carrying the very shape it exists to name — the same reason a fenced block
 * is passed over.
 */
const EXEMPLAR = /^\s*["“][^"”]*["”]\s*$/;
/** `tool_name { arguments }` — the shape the corpus writes a call in. */
const CALL = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\{(.*)\}$/s;
/**
 * An argument name: the identifier left of the colon, or the whole token where it carries none.
 * The grammar is the bag's own (`binding-provenance`), so a camelCase parameter is read rather
 * than passed over as unrecognised text.
 */
const ARGUMENT_NAME = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::|$)/;
/** Either spelling of "and the rest": the ellipsis character, and the spread that stands in for it. */
const ELISION = /^(?:…|\.{3})/;

/** What a tool accepts, read from the schema it is registered with. */
export interface ToolParameters {
  declared: Set<string>;
  required: Set<string>;
}

/** Every tool this server registers, by name. */
export function registeredTools(): Map<string, ToolParameters> {
  const out = new Map<string, ToolParameters>();
  for (const tool of captureTools()) {
    const properties = tool.params?.properties ?? {};
    const required = tool.params?.required ?? [];
    out.set(tool.name, { declared: new Set(Object.keys(properties)), required: new Set(required) });
  }
  return out;
}

/** One call as a definition describes it. */
export interface DescribedCall {
  tool: string;
  /** The arguments it names, in the order it names them. */
  named: string[];
  /** Whether the text stands for the whole call rather than the part under discussion. */
  signature: boolean;
  /** The span as written, for the finding to quote. */
  text: string;
  line: number;
}

/**
 * Split an argument list on the commas that separate arguments.
 *
 * Nesting is tracked so a comma inside a braced stub, an angle-bracketed placeholder or a quoted
 * literal does not end an argument. Apostrophes are left alone: the corpus writes placeholders in
 * prose (`<that branch's exit>`), and reading one as an opening quote would swallow the rest of the
 * list, where a single-quoted literal holding a comma is a form the corpus does not use.
 */
export function splitArguments(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quoted = false;
  let current = '';
  for (const ch of body) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && (ch === '{' || ch === '<' || ch === '(' || ch === '[')) depth++;
    else if (!quoted && (ch === '}' || ch === '>' || ch === ')' || ch === ']')) depth--;
    else if (!quoted && depth === 0 && ch === ',') { out.push(current); current = ''; continue; }
    current += ch;
  }
  out.push(current);
  return out.map((piece) => piece.trim()).filter((piece) => piece.length > 0);
}

/**
 * Every call a markdown body describes, ignoring the fenced blocks that show rather than instruct.
 *
 * `tools` decides which names count: a span naming something this server does not register is some
 * other schema's call, and the guard has nothing to measure it against.
 */
export function describedCalls(body: string, tools: Map<string, ToolParameters>): DescribedCall[] {
  const lines = toLines(body);
  const { fenced } = fencedLines(lines);
  const out: DescribedCall[] = [];
  for (const [index, line] of lines.entries()) {
    if (fenced.has(index) || EXEMPLAR.test(line)) continue;
    for (const span of line.matchAll(CODE_SPAN)) {
      const call = CALL.exec(span[1]!.trim());
      if (!call) continue;
      const parameters = tools.get(call[1]!);
      if (!parameters) continue;
      const named: string[] = [];
      let elided = false;
      for (const argument of splitArguments(call[2]!)) {
        if (ELISION.test(argument)) { elided = true; continue; }
        const name = ARGUMENT_NAME.exec(argument);
        if (name) named.push(name[1]!);
      }
      const whole = !elided && (!parameters.declared.has('session_index') || named.includes('session_index'));
      out.push({ tool: call[1]!, named, signature: whole, text: span[1]!.trim(), line: index + 1 });
    }
  }
  return out;
}

/** What one described call owes the schema of the tool it names. */
export function checkCall(call: DescribedCall, parameters: ToolParameters, site: string): Finding[] {
  const findings: Finding[] = [];
  for (const argument of call.named) {
    if (parameters.declared.has(argument)) continue;
    findings.push({
      check: 'unknown-argument',
      site,
      detail: `\`${call.text}\` passes '${argument}', which ${call.tool} does not declare. `
        + `It accepts: ${[...parameters.declared].sort().join(', ') || '(no arguments)'}.`,
    });
  }
  if (!call.signature) return findings;
  for (const argument of [...parameters.required].sort()) {
    if (call.named.includes(argument)) continue;
    findings.push({
      check: 'missing-required',
      site,
      detail: `\`${call.text}\` omits '${argument}', which ${call.tool} requires, so the server `
        + 'refuses the call. Name it here, or write the call as a fragment (an ellipsis, or without '
        + '`session_index`) where the text is discussing one argument rather than standing for the '
        + 'whole call.',
    });
  }
  return findings;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const tools = registeredTools();
  const findings: Finding[] = [];
  let scanned = 0;
  // Namespaces, not workflows. A library is where tool calls concentrate — the GitHub namespace is
  // the sole home of every `gh api` recipe, the Atlassian and GitNexus ones of their MCP calls — so
  // a workflow-only walk leaves the densest tool-call prose in the corpus unmeasured, and reports
  // the same success it would report having read it. One file can sit under two namespaces where
  // one nests inside another, so a path is checked once.
  const seen = new Set<string>();
  for (const { dir } of corpusNamespaces(root)) {
    for (const path of markdownUnder(dir)) {
      if (seen.has(path)) continue;
      seen.add(path);
      scanned++;
      const rel = relative(root, path);
      for (const call of describedCalls(readFileSync(path, 'utf-8'), tools)) {
        findings.push(...checkCall(call, tools.get(call.tool)!, `${rel}:${call.line}`));
      }
    }
  }
  assertScanned(scanned, 'markdown files', root);
  return findings;
}

function* markdownUnder(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* markdownUnder(path);
    else if (entry.endsWith('.md')) yield path;
  }
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('tool-call-shape', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every described tool call names arguments its tool declares, and every whole signature names the required ones',
    remedy: 'match the call to the schema the server registers for that tool',
  });
}
