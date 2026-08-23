/**
 * check-inline-references — every inline technique call in the corpus is enumerated under the
 * published reference grammar, resolved through that grammar's own classifier, and has its
 * arguments binned against the callee's declared inputs.
 *
 * A technique file calls another technique from inside its Protocol prose. Nothing resolved those
 * calls, so a renamed callee stranded its callers silently and a call passing fewer arguments than
 * its callee declares read exactly like one passing all of them. This guard is what makes the class
 * visible: a new call site joins the census rather than an unmeasured remainder, and a defect in one
 * of the hard classes exits non-zero.
 *
 * **The grammar is published, and so is its coverage.** The ten counting terms live in
 * `src/utils/reference-grammar.ts` and this guard prints them with `--grammar`. The census reports
 * the coverage figure beside every total, because the two are separate facts: the total is
 * reproducible at any verb-list width, and a guard reporting clean over a group it never examined
 * must not read as a guard that examined it.
 *
 * **The census is keyed on syntax, and syntax is not the consumer set.** Every figure here counts an
 * invoking verb next to a markdown link inside a Protocol section. A caller that names an operation
 * in ordinary prose is a real consumer and is outside the count by design — `midnight-system-review`
 * reaches this corpus's GitNexus operations nine times across three files with no link and no
 * qualified pair anywhere. So a total is evidence the guard counts what it says it counts, and it is
 * never evidence that nothing else calls the thing being counted. A retirement decision needs a
 * reading pass, not this number.
 *
 * Hard classes, which fail the guard, both being unambiguous:
 *   unresolved-target            a call site whose destination names no file
 *   rule-addressed-as-operation  a qualified call whose operation half names a container rule
 *
 * Classified rather than failed, and printed as the disposition worklist:
 *   unbound-argument             a required own input of the callee that no name at the call site supplies
 *   value-named-callee           a callee named by a runtime value, so beyond static reach
 *
 * The split is deliberate. A static reading of the name-match convention cannot see the runtime
 * variable bag an input resolves against, so an argument bin is a candidate for disposition and not
 * yet a defect. Failing on one would have the guard assert something it cannot observe, which is the
 * failure mode this package exists to remove rather than reproduce.
 *
 * Run: npx tsx scripts/check-inline-references.ts [--root <workflows-dir>] [--json]
 *      npx tsx scripts/check-inline-references.ts --census
 *      npx tsx scripts/check-inline-references.ts --grammar
 *      npx tsx scripts/check-inline-references.ts --worklist
 *      npx tsx scripts/check-inline-references.ts --emit-untriaged
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { findingKey, runGuard, wantsJson, type Finding } from './guard-protocol.js';
import {
  CONTAINER_FILENAME,
  GRAMMAR_TERMS,
  INVOKING_VERBS,
  SCANNED_SECTION,
  classifyLink,
  extractCallSites,
  findLinks,
} from '../src/utils/reference-grammar.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));
const TRIAGE_PATH = resolve(join(DIR, 'inline-reference-triage.json'));
const TRIAGE_LABEL = relative(process.cwd(), TRIAGE_PATH);

/** A verdict is a human judgement about one finding; there is no regenerate flag. */
export type TriageVerdict = 'harmless' | 'fix-later' | 'live-bug';

export interface TriageEntry extends Finding {
  verdict: TriageVerdict;
  /** Key into the file's `rationales` map — the reason this verdict holds. */
  rationale: string;
}

export interface TriageFile {
  corpusSha: string;
  rationales: Record<string, string>;
  entries: TriageEntry[];
}

function loadTriage(): TriageFile {
  if (!existsSync(TRIAGE_PATH)) return { corpusSha: '', rationales: {}, entries: [] };
  return JSON.parse(readFileSync(TRIAGE_PATH, 'utf-8')) as TriageFile;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** Every technique file under the corpus, READMEs and CHANGELOGs excluded. */
function techniqueFiles(root: string): string[] {
  const out: string[] = [];
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const path of walk(techniquesDir)) {
      if (!path.toLowerCase().endsWith('.md')) continue;
      if (/\/(README|CHANGELOG)\.md$/i.test(path)) continue;
      out.push(path);
    }
  }
  return out;
}

/**
 * The scanned section's body and the line it starts at, per the `section-scope` term.
 *
 * The section ends at the next heading of the same or shallower depth, so a `### ` subsection of the
 * protocol stays inside it.
 */
function scannedSection(text: string): { body: string; offset: number } | undefined {
  const lines = text.split(/\r?\n/);
  const wanted = new RegExp(`^${SCANNED_SECTION}\\b`, 'i');
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,6})\s+(.*)$/.exec(lines[i] ?? '');
    if (!m) continue;
    if (start < 0 && wanted.test((m[2] ?? '').trim())) {
      start = i + 1;
      level = m[1]!.length;
    } else if (start >= 0 && m[1]!.length <= level) {
      return { body: lines.slice(start, i).join('\n'), offset: start };
    }
  }
  return start >= 0 ? { body: lines.slice(start).join('\n'), offset: start } : undefined;
}

interface InputMeta {
  hasDefault: boolean;
  optional: boolean;
}

/**
 * A technique file's own declared input ids, and the output ids it lands.
 *
 * Necessity is a convention rather than a flag: an input is required unless it declares a `default`
 * block or opens its description with an `(optional)` marker. Inherited blocks are never authored in
 * a technique file, so everything parsed here is the technique's own.
 */
function declaredSignature(path: string): { inputs: Map<string, InputMeta>; outputs: Set<string> } {
  const inputs = new Map<string, InputMeta>();
  const outputs = new Set<string>();
  let section: 'inputs' | 'outputs' | null = null;
  let entry: string | null = null;
  let awaitingProse = false;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      const title = h2[1]!.trim();
      section = title === 'Inputs' ? 'inputs' : title === 'Outputs' ? 'outputs' : null;
      entry = null;
      continue;
    }
    if (!section) continue;
    const h3 = /^###\s+(\S+)\s*$/.exec(line);
    if (h3) {
      entry = h3[1]!.trim();
      awaitingProse = true;
      if (section === 'inputs') inputs.set(entry, { hasDefault: false, optional: false });
      else outputs.add(entry);
      continue;
    }
    if (!entry) continue;
    const h4 = /^####\s+(\S+)\s*$/.exec(line);
    if (h4) {
      awaitingProse = false;
      if (section === 'inputs' && h4[1]!.trim() === 'default') inputs.get(entry)!.hasDefault = true;
      continue;
    }
    if (awaitingProse && line.trim().length > 0) {
      awaitingProse = false;
      if (section === 'inputs' && /^\(?\*{0,2}\(?optional\)?/i.test(line.trim())) {
        inputs.get(entry)!.optional = true;
      }
    }
  }
  return { inputs, outputs };
}

/** Rule ids a group container declares under `## Rules`, as `### <id>` headings. */
function containerRules(path: string): Set<string> {
  const rules = new Set<string>();
  if (!existsSync(path)) return rules;
  let inRules = false;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      inRules = h2[1]!.trim() === 'Rules';
      continue;
    }
    if (!inRules) continue;
    const h3 = /^###\s+(\S+)\s*$/.exec(line);
    if (h3) rules.add(h3[1]!.trim());
  }
  return rules;
}

/** `{token}` names appearing in a stretch of prose — the values a call site has in hand. */
function tokensIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(/\{\$?([a-z_][a-z0-9_.]*)\}/gi)) out.add(m[1]!.split('.')[0]!.toLowerCase());
  return out;
}

/**
 * Ids a technique inherits, by walking its own filesystem ancestry up to the workflow's techniques
 * directory and taking each `TECHNIQUE.md` container's declared inputs and outputs.
 *
 * Ancestry resolves from the file's own tree rather than from whichever workflow is executing, which
 * is the same home-tree rule composition applies — so a name available to the caller here is a name
 * available to it at runtime.
 */
function inheritedIds(callerAbs: string, root: string): Set<string> {
  const out = new Set<string>();
  let dir = dirname(callerAbs);
  const stop = resolve(root);
  for (;;) {
    const container = join(dir, CONTAINER_FILENAME);
    if (existsSync(container) && resolve(container) !== resolve(callerAbs)) {
      const sig = declaredSignature(container);
      for (const id of sig.inputs.keys()) out.add(id.toLowerCase());
      for (const id of sig.outputs) out.add(id.toLowerCase());
    }
    const parent = dirname(dir);
    if (parent === dir || dir === stop || !dir.startsWith(stop)) break;
    dir = parent;
  }
  return out;
}

export interface Census {
  /** Technique files whose scanned section was read. */
  filesScanned: number;
  /**
   * Unanchored technique link occurrences in scanned sections, before the verb test and before the
   * qualified-pair collapse — the input the `counting-unit` term converts into call sites.
   */
  rawLinkOccurrences: number;
  /** Unanchored technique links in scanned sections, before the verb test — the link-resolvable population. */
  linkResolvableReferences: number;
  /** Call sites the published verb list admits. */
  logicalCallSites: number;
  /** Share of the link-resolvable population the verb list admits, as a percentage rounded to a whole number. */
  verbCoveragePercent: number;
  qualifiedPairsCollapsed: number;
  deduplicatedPairs: number;
  callerFiles: number;
  distinctCallees: number;
  containerTargeted: number;
  unresolvedTargets: number;
  /**
   * Call sites whose link destination carries a `{token}`, so the callee is named by a runtime value.
   *
   * This counts the form a link-keyed grammar can see. A caller that names its callee in prose with
   * no link is outside the count like every other syntax-free reach, so a zero here is a measured
   * zero for templated destinations and not a claim that no callee is ever chosen at runtime.
   */
  valueNamedCallees: number;
  /** SC-4's bins, over required own inputs of resolved callees — the disposition worklist. */
  argumentsNameMatchSatisfied: number;
  argumentsGenuinelyUnbound: number;
  callSitesWithUnboundArgument: number;
}

interface Site {
  callerRel: string;
  callerAbs: string;
  line: number;
  destination: string;
  container: string | undefined;
  operation: string | undefined;
  qualified: boolean;
  lineText: string;
}

/** Every call site in the corpus under the published grammar, with the prose line that carries it. */
function enumerateSites(root: string): {
  sites: Site[];
  linkResolvable: number;
  rawOccurrences: number;
  filesScanned: number;
} {
  const sites: Site[] = [];
  let linkResolvable = 0;
  let rawOccurrences = 0;
  let filesScanned = 0;
  for (const path of techniqueFiles(root)) {
    const section = scannedSection(readFileSync(path, 'utf-8'));
    if (section === undefined) continue;
    filesScanned++;
    const lines = section.body.split(/\r?\n/);

    // The verb-independent population, with qualified pairs collapsed the same way, so the coverage
    // ratio varies only in the verb term.
    const links = findLinks(section.body).filter((l) => {
      const c = classifyLink(l.destination);
      return (c.kind === 'technique' || c.kind === 'technique-container') && c.anchor === undefined;
    });
    let collapsed = 0;
    for (let i = 0; i < links.length; i++) {
      const link = links[i]!;
      if (classifyLink(link.destination).kind !== 'technique-container') continue;
      const after = (lines[link.line - 1] ?? '').slice(link.column);
      const closeIdx = after.indexOf(')');
      const tail = closeIdx >= 0 ? after.slice(closeIdx + 1) : '';
      const next = links[i + 1];
      if (tail.startsWith('::[') && next !== undefined && next.line === link.line && next.column > link.column) {
        collapsed++;
        i++;
      }
    }
    rawOccurrences += links.length;
    linkResolvable += links.length - collapsed;

    for (const s of extractCallSites(section.body)) {
      sites.push({
        callerRel: relative(root, path),
        callerAbs: path,
        line: s.line + section.offset,
        destination: s.destination,
        container: s.container,
        operation: s.operation,
        qualified: s.qualified,
        lineText: lines[s.line - 1] ?? '',
      });
    }
  }
  return { sites, linkResolvable, rawOccurrences, filesScanned };
}

/** Absolute path a call site's destination names, or undefined when a runtime value names it. */
function targetOf(site: Site): string | undefined {
  if (/\{/.test(site.destination)) return undefined;
  return resolve(dirname(site.callerAbs), site.destination.split('#')[0]!);
}

interface Analysis {
  census: Census;
  /** The classes that fail hard: a call that cannot resolve, and a rule addressed as an operation. */
  findings: Finding[];
  /**
   * The disposition worklist SC-4 and SC-6 produce — argument bins and value-named callees.
   *
   * These are classified rather than failed. An argument bin is a static reading of a convention that
   * resolves against a runtime variable bag, so an entry here is a candidate for disposition and not
   * yet a defect; failing on them would make the guard assert something it cannot see.
   */
  worklist: Finding[];
}

function analyse(root: string): Analysis {
  const { sites, linkResolvable, rawOccurrences, filesScanned } = enumerateSites(root);
  const findings: Finding[] = [];
  const worklist: Finding[] = [];
  const signatures = new Map<string, ReturnType<typeof declaredSignature>>();
  const signatureOf = (path: string): ReturnType<typeof declaredSignature> => {
    let sig = signatures.get(path);
    if (sig === undefined) {
      sig = declaredSignature(path);
      signatures.set(path, sig);
    }
    return sig;
  };

  let unresolvedTargets = 0;
  let valueNamedCallees = 0;
  let containerTargeted = 0;
  let satisfied = 0;
  let unbound = 0;
  const sitesWithUnbound = new Set<string>();
  const pairs = new Set<string>();
  const callees = new Set<string>();

  for (const site of sites) {
    const at = `${site.callerRel}:${site.line}`;
    const target = targetOf(site);

    // SC-6: a callee named by a runtime value is enumerated and reported as beyond static reach.
    if (target === undefined) {
      valueNamedCallees++;
      worklist.push({
        check: 'value-named-callee',
        site: at,
        detail: `callee is named by a runtime value (\`${site.destination}\`), so no static resolution reaches it — enumerate the set the value is drawn from and check closure over it`,
      });
      continue;
    }

    pairs.add(`${site.callerRel}\u0000${target}`);
    callees.add(target);
    if (classifyLink(site.destination).kind === 'technique-container' && site.operation === undefined) {
      containerTargeted++;
    }

    // The tenth term: an unresolved destination is counted and reported, never dropped.
    if (!existsSync(target)) {
      unresolvedTargets++;
      findings.push({
        check: 'unresolved-target',
        site: at,
        detail: `destination \`${site.destination}\` resolves to no file — correct the path or remove the call`,
      });
      continue;
    }

    // SC-5: a qualified call whose operation half names a rule of the container rather than an
    // operation file. The remedy is a dotted rule address, which is what a rule citation is.
    if (site.qualified && site.operation !== undefined) {
      const groupDir = dirname(resolve(dirname(site.callerAbs), site.container ?? site.destination));
      const opFile = join(groupDir, `${site.operation}.md`);
      if (!existsSync(opFile)) {
        const rules = containerRules(join(groupDir, CONTAINER_FILENAME));
        if (rules.has(site.operation)) {
          findings.push({
            check: 'rule-addressed-as-operation',
            site: at,
            detail: `\`${site.operation}\` is a rule of the group, addressed as though it were an operation — cite it by dotted address instead, since a rule is read rather than applied`,
          });
          continue;
        }
        findings.push({
          check: 'unresolved-target',
          site: at,
          detail: `qualified call names \`${site.operation}\`, which is neither an operation of the group nor one of its rules — correct the name or remove the call`,
        });
        continue;
      }
    }

    // SC-4: bin the callee's required own inputs into name-match-satisfied and genuinely unbound.
    // Available names are what the name-match convention can reach: the caller's own declared ids
    // and the values its call line has in hand.
    const calleeFile = site.qualified && site.operation !== undefined
      ? join(dirname(resolve(dirname(site.callerAbs), site.container ?? site.destination)), `${site.operation}.md`)
      : target;
    if (!existsSync(calleeFile)) continue;
    const callee = signatureOf(calleeFile);
    const caller = signatureOf(site.callerAbs);
    const available = new Set<string>([
      ...[...caller.inputs.keys()].map((k) => k.toLowerCase()),
      ...[...caller.outputs].map((k) => k.toLowerCase()),
      ...inheritedIds(site.callerAbs, root),
      ...tokensIn(site.lineText),
    ]);
    for (const [id, meta] of callee.inputs) {
      if (meta.hasDefault || meta.optional) continue;
      if (available.has(id.toLowerCase())) {
        satisfied++;
        continue;
      }
      unbound++;
      sitesWithUnbound.add(at);
      worklist.push({
        check: 'unbound-argument',
        site: at,
        detail: `callee \`${basename(calleeFile)}\` requires input \`${id}\`, which no name in the caller's own signature, its inherited ancestry or its call line supplies`,
      });
    }
  }

  const callerFiles = new Set(sites.map((s) => s.callerRel)).size;
  const census: Census = {
    filesScanned,
    rawLinkOccurrences: rawOccurrences,
    linkResolvableReferences: linkResolvable,
    logicalCallSites: sites.length,
    verbCoveragePercent: linkResolvable === 0 ? 0 : Math.round((sites.length / linkResolvable) * 100),
    qualifiedPairsCollapsed: sites.filter((s) => s.qualified).length,
    deduplicatedPairs: pairs.size,
    callerFiles,
    distinctCallees: callees.size,
    containerTargeted,
    unresolvedTargets,
    valueNamedCallees,
    argumentsNameMatchSatisfied: satisfied,
    argumentsGenuinelyUnbound: unbound,
    callSitesWithUnboundArgument: sitesWithUnbound.size,
  };

  assertScanned(filesScanned, 'technique files with a Protocol section', root);
  return { census, findings, worklist };
}

/** The census, for the conformance test that asserts the totals at the delivered corpus commit. */
export function collectCensus(root: string = DEFAULT_ROOT): Census {
  return analyse(root).census;
}

/** Every finding, before triage — what the guard would report with an empty triage file. */
export function collectRawFindings(root: string = DEFAULT_ROOT): Finding[] {
  return analyse(root).findings;
}

/** The disposition worklist: argument bins and value-named callees, classified rather than failed. */
export function collectWorklist(root: string = DEFAULT_ROOT): Finding[] {
  return analyse(root).worklist;
}

/**
 * Apply a triage to a raw finding set.
 *
 * A triaged finding is suppressed unless its verdict is `live-bug`, which stays reported with its
 * rationale attached so the guard remains red until the bug is fixed. A triage entry matching nothing
 * is itself reported: a repaired site cannot leave a stale verdict behind, which is the property the
 * regenerable baselines this repo retired did not have.
 *
 * Pure, so the mechanism is testable without a triage file on disk — and there is none, because the
 * corpus is clean of both hard classes at the delivered commit. An absent file is the statement that
 * nothing has needed a verdict, the same convention the artifact-guide baseline follows.
 */
export function applyTriage(raw: Finding[], triage: TriageFile, label = TRIAGE_LABEL): Finding[] {
  const classified = new Map(triage.entries.map((e) => [findingKey(e), e]));
  const matched = new Set<string>();
  const out: Finding[] = [];

  for (const finding of raw) {
    const key = findingKey(finding);
    const entry = classified.get(key);
    if (entry === undefined) {
      out.push(finding);
      continue;
    }
    matched.add(key);
    if (entry.verdict === 'live-bug') {
      const why = triage.rationales[entry.rationale] ?? entry.rationale;
      out.push({ ...finding, detail: `${finding.detail} [live bug: ${why}]` });
    }
  }

  for (const [key, entry] of classified) {
    if (matched.has(key)) continue;
    out.push({
      check: 'stale-triage',
      site: entry.site,
      detail: `triaged finding no longer occurs — delete the entry from ${label}`,
    });
  }
  return out;
}

/** Findings the guard reports: the hard classes, after triage. */
export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  return applyTriage(analyse(root).findings, loadTriage());
}

function printGrammar(): void {
  console.log(`inline-reference grammar — ${GRAMMAR_TERMS.length} published terms`);
  console.log(`invoking verbs: ${INVOKING_VERBS.join(', ')}`);
  console.log(`scanned section: ## ${SCANNED_SECTION}\n`);
  for (const term of GRAMMAR_TERMS) {
    console.log(`  ${term.id}`);
    console.log(`    Q: ${term.question}`);
    console.log(`    A: ${term.answer}\n`);
  }
}

function printCensus(census: Census): void {
  console.log('inline-reference census, under the published grammar');
  for (const [key, value] of Object.entries(census)) console.log(`  ${key.padEnd(30)} ${value}`);
  console.log(
    `\ncoverage: the verb list admits ${census.logicalCallSites} of ${census.linkResolvableReferences} link-resolvable references — ${census.verbCoveragePercent}%.`,
  );
  console.log(
    'The remainder are real consumers outside the count by design. Every figure here is keyed on syntax,',
  );
  console.log(
    'so none of them is evidence about callers that name an operation in prose. A retirement needs a reading pass.',
  );
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (process.argv.includes('--grammar')) {
    printGrammar();
  } else if (process.argv.includes('--census')) {
    printCensus(collectCensus(requireWorkflowsRoot(DEFAULT_ROOT)));
  } else if (process.argv.includes('--emit-untriaged')) {
    console.log(JSON.stringify(collectFindings(requireWorkflowsRoot(DEFAULT_ROOT)), null, 2));
  } else if (process.argv.includes('--worklist')) {
    console.log(JSON.stringify(collectWorklist(requireWorkflowsRoot(DEFAULT_ROOT)), null, 2));
  } else {
    if (!wantsJson()) printCensus(collectCensus(requireWorkflowsRoot(DEFAULT_ROOT)));
    await runGuard('inline-references', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
      okMessage:
        'every inline call site resolves to a file, and no rule is addressed as an operation — argument bins are a worklist, printed above rather than failed',
      remedy: 'repair the call, or record a verdict and a named rationale in ' + TRIAGE_LABEL,
    });
  }
}
