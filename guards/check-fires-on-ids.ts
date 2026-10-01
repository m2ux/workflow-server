#!/usr/bin/env npx tsx
/**
 * Every construct a canon unit declares it fires on, against the generated schemas that define it.
 *
 * A unit of the canon — an anti-pattern, a design principle, a convention — carries one line naming
 * the constructs it applies to: `**Fires on:**` followed by comma-separated ids, each a code span.
 * An id is one of:
 *
 *   canon-defined   `resource`, `readme`, or `*` for all definition text — the kinds no schema covers.
 *                   `*` stands alone on its line.
 *   authored kind   `workflow`, `activity`, `technique` or `routine`, covering every field of that kind.
 *   field path      `<kind>.<path>`, naming a field the kind's generated schema declares: dot-separated
 *                   property names, an array field named as itself (`activity.steps`), and `[]` after an
 *                   array field to step into a field of its elements (`activity.steps[].when`,
 *                   `workflow.variables[].type`).
 *
 * Each id appears once on its line. The four kinds are held here, because they are the kinds an author
 * writes; the fields under them are read from `schemas/<kind>.schema.json`, never from a list kept
 * here, so a field renamed or removed from a schema fails every unit that still names it.
 *
 * A path resolves when some reading of the schema reaches its last segment. Each segment is looked
 * up in the declared `properties` of every schema the previous segment reached; a `$ref` is followed
 * to its target in the same file, and each `anyOf` branch contributes, so a field declared by one
 * variant of a union resolves. A `[]` steps into `items`, and only toward a further field: a path that
 * omits it at an array before a further field, writes it after a non-array, or ends with it, resolves
 * nowhere. A record's values (`additionalProperties`) are not stepped into — its keys are chosen by
 * the author and the grammar has no segment for them — so a path ends at a map-valued field:
 * `workflow.graph` resolves, `workflow.graph.<anything>` does not.
 *
 * Declarations are read from the three canon homes by {@link readDeclarations}, which is the one
 * parser of the line. YAML front matter and a leading byte-order mark are passed over, so a
 * front-matter comment is never read as a heading. A fenced block shows markup rather than declaring
 * anything, so its lines are passed over. Fences are counted over the body after the front matter,
 * so a fence marker inside the front matter never pairs with one in the body. An unclosed fence
 * un-fences the rest of its file, so it cannot hide a declaration; the resource-anchors guard reports
 * the fence (`unbalanced-fence`), so this guard reads through it without reporting it again.
 *
 * The line starts with the exact marker. A line opening with a near miss — another case, an italic,
 * bold-italic or underscore emphasis run, a misplaced colon, a quote, a list bullet, or up to three
 * leading spaces — would declare nothing while reading as a declaration, so it is reported. Prose
 * merely opening in bold (`**Fires once**`, `**Fires-on line.**`) is not a near miss. The text after the marker is one or more
 * single-backtick code spans, each holding a non-space, separated by commas; an id outside a span
 * would go unchecked, so any other text fails the line and none of its ids is read.
 *
 * Findings name the unit by the nearest heading above the declaration and are sited at its line,
 * except `missing-home`, which is sited at the home's path:
 *
 *   `unknown-id`            — the id is not canon-defined, an authored kind, or a path rooted at one.
 *   `unresolved-path`       — the id is rooted at a kind, and its path reaches no field of that schema.
 *   `wildcard-not-alone`    — `*` declared beside another id.
 *   `duplicate-id`          — an id declared twice on one line.
 *   `malformed-declaration` — a near-miss marker, or ids that are not comma-separated code spans.
 *   `missing-line`          — an anti-pattern entry, numbered principle, or convention section carries no Fires-on line.
 *   `repeated-line`         — that unit carries more than one Fires-on line.
 *   `misplaced-line`        — an anti-pattern line is not after the opening prose and before Detect, a principle line is not after the prose, or a convention line is not directly under its title.
 *   `missing-home`          — a canon home absent from the corpus, whose declarations nothing reads.
 *
 * A family heading and a Creation Rule carry no line. An anti-pattern entry's line is the last text
 * before Detect, with opening prose above it. A principle's line is the last text of its section,
 * with its prose above it. A convention section's line is the first text under its title.
 *
 * A corpus holding none of the homes has nothing to measure, and the guard exits unmeasured.
 *
 * Run: npx tsx guards/check-fires-on-ids.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runGuard, type Finding } from './guard-protocol.js';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { fencedLines, toLines } from './markdown-refs.js';
import { SCHEMAS_DIR } from '../scripts/generate-schemas.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The files that hold canon units, relative to the corpus root. */
export const CANON_HOMES = [
  'corpus/canon/resources/anti-patterns.md',
  'corpus/canon/resources/design-principles.md',
  'corpus/canon/resources/convention-conformance.md',
] as const;

/** The ids the canon defines for text no schema covers. */
export const CANON_DEFINED_IDS: ReadonlySet<string> = new Set(['resource', 'readme', '*']);

/** The id covering all definition text, which stands alone on its line. */
export const WILDCARD_ID = '*';

/** The kinds an author writes, each a bare id and the root of a field path into its generated schema. */
export const AUTHORED_KINDS = ['workflow', 'activity', 'technique', 'routine'] as const;
const KINDS: ReadonlySet<string> = new Set(AUTHORED_KINDS);

export const DECLARATION_MARKER = '**Fires on:**';
/**
 * A line opening with a Fires-on marker in any spelling: up to three spaces, quote markers, a list
 * bullet, then an emphasis run of one to three `*` or `_` opening on the words "fires on" in any case.
 * A run of two or three may be followed by spaces; a single `*` followed by a space is a list bullet
 * opening prose, so a single run abuts the words.
 */
const MARKER_LIKE = /^ {0,3}(?:>\s*)*(?:(?:[-*+]|\d+[.)])\s+)?(?:(?:\*{2,3}|_{2,3})\s*|[*_])fires\s+on\b/i;
const CODE_SPAN = /`([^`]+)`/g;
/** The text after the marker: single-backtick code spans, each holding a non-space, comma-separated. */
const DECLARED_IDS = /^\s*`\s*[^`\s][^`]*`(?:\s*,\s*`\s*[^`\s][^`]*`)*\s*$/;
const HEADING = /^ {0,3}#{1,6}\s+(.*?)(?:\s+#+)?\s*$/;
/** One path segment: a property name, then one `[]` per array level stepped into. */
const SEGMENT = /^([^.[\]]+)((?:\[\])*)$/;
const FRONT_MATTER_OPEN = /^---\s*$/;
const FRONT_MATTER_CLOSE = /^(?:---|\.\.\.)\s*$/;

/** A parsed generated schema file, keyed in a {@link SchemaSet} by its kind. */
export type JsonSchema = Record<string, unknown>;

/** Generated schemas by authored kind: `activity` for `activity.schema.json`. */
export type SchemaSet = ReadonlyMap<string, JsonSchema>;

/** One canon home's text, sited by its corpus-relative path. */
export interface CanonText {
  path: string;
  text: string;
}

/** A well-formed Fires-on line: its unit's heading, its 1-based line, and its ids in written order. */
export interface Declaration {
  unit: string;
  line: number;
  ids: string[];
}

/** A line that reads as a Fires-on declaration and is not one, with its text as written. */
export interface MalformedDeclaration {
  unit: string;
  line: number;
  text: string;
}

export interface DeclarationRead {
  declarations: Declaration[];
  malformed: MalformedDeclaration[];
}

/** The generated schema of each authored kind present in a directory, parsed and keyed by kind. */
export function loadSchemas(dir: string = SCHEMAS_DIR): Map<string, JsonSchema> {
  const schemas = new Map<string, JsonSchema>();
  for (const kind of AUTHORED_KINDS) {
    const file = join(dir, `${kind}.schema.json`);
    if (existsSync(file)) schemas.set(kind, JSON.parse(readFileSync(file, 'utf-8')) as JsonSchema);
  }
  return schemas;
}

function isObject(value: unknown): value is JsonSchema {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** The node a same-file JSON pointer (`#/definitions/activity/properties/steps`) names. */
function pointer(doc: JsonSchema, ref: string): unknown {
  if (!ref.startsWith('#')) return undefined;
  let node: unknown = doc;
  for (const raw of ref.slice(1).split('/').slice(1)) {
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    node = Array.isArray(node) ? node[Number(key)] : isObject(node) ? node[key] : undefined;
  }
  return node;
}

/** Every schema a node stands for once its `$ref` is followed and its `anyOf` branches are opened. */
function readings(node: unknown, doc: JsonSchema, out: Set<JsonSchema> = new Set()): Set<JsonSchema> {
  if (!isObject(node) || out.has(node)) return out;
  out.add(node);
  const ref = node['$ref'];
  if (typeof ref === 'string') readings(pointer(doc, ref), doc, out);
  const branches = node['anyOf'];
  if (Array.isArray(branches)) for (const branch of branches) readings(branch, doc, out);
  return out;
}

/**
 * The first segment of `path` that resolves nowhere in `schema`, or null when the whole path
 * resolves. `path` is the part of an id after `<kind>.`. A last segment ending in `[]` resolves
 * nowhere: `[]` steps toward a further field and never ends a path.
 */
export function unresolvedSegment(schema: JsonSchema, path: string): string | null {
  const segments = path.split('.');
  let reached = readings(schema, schema);
  for (const [index, segment] of segments.entries()) {
    const parsed = SEGMENT.exec(segment);
    if (!parsed) return segment;
    const steps = parsed[2]!.length / 2;
    if (steps > 0 && index === segments.length - 1) return segment;
    let next = new Set<JsonSchema>();
    for (const node of reached) {
      const properties = node['properties'];
      if (isObject(properties) && Object.hasOwn(properties, parsed[1]!)) readings(properties[parsed[1]!], schema, next);
    }
    for (let depth = 0; depth < steps; depth++) {
      const items = new Set<JsonSchema>();
      for (const node of next) readings(node['items'], schema, items);
      next = items;
    }
    if (next.size === 0) return segment;
    reached = next;
  }
  return null;
}

/** How many leading lines a closed YAML front-matter block occupies; none when the text opens without one. */
function frontMatterLines(lines: readonly string[]): number {
  if (!FRONT_MATTER_OPEN.test(lines[0] ?? '')) return 0;
  const close = lines.findIndex((line, index) => index > 0 && FRONT_MATTER_CLOSE.test(line));
  return close === -1 ? 0 : close + 1;
}

/**
 * Every Fires-on line in one markdown text, and every line that reads as one and is not. A unit is
 * named by the nearest heading above its line, or `(no heading)` above every heading.
 */
export function readDeclarations(text: string): DeclarationRead {
  const lines = toLines(text.replace(/^\uFEFF/, ''));
  const skipped = frontMatterLines(lines);
  const { fenced } = fencedLines(lines.slice(skipped), { onUnclosed: 'read-all' });
  const read: DeclarationRead = { declarations: [], malformed: [] };
  let unit = '(no heading)';
  for (const [index, line] of lines.entries()) {
    if (index < skipped || fenced.has(index - skipped)) continue;
    const heading = HEADING.exec(line);
    if (heading) { unit = heading[1]!; continue; }
    const exact = line.startsWith(DECLARATION_MARKER);
    if (!exact && !MARKER_LIKE.test(line)) continue;
    const declared = line.slice(DECLARATION_MARKER.length);
    if (!exact || !DECLARED_IDS.test(declared)) {
      read.malformed.push({ unit, line: index + 1, text: line.trimEnd() });
      continue;
    }
    read.declarations.push({ unit, line: index + 1, ids: [...declared.matchAll(CODE_SPAN)].map((match) => match[1]!.trim()) });
  }
  return read;
}

/** A unit whose declaration covers a queried construct, sited at its Fires-on line. */
export interface ListedUnit {
  path: string;
  line: number;
  unit: string;
}

/**
 * Whether a declared id covers a queried construct. `*` covers every query. Any other id covers
 * the query when it is the query, or a prefix of it: the bare kind, or a field the query extends
 * with `.` or `[]`. A narrower id does not cover a broader query.
 */
export function covers(declared: string, query: string): boolean {
  return declared === WILDCARD_ID || declared === query
    || query.startsWith(`${declared}.`)
    || query.startsWith(`${declared}[]`);
}

/**
 * Every unit in the canon texts that declares `query`, a prefix of it, its bare kind, or `*`.
 * One unit declaring several ids is listed once, at the line whose ids cover the query. The order
 * is path, then line.
 */
export function listUnits(texts: readonly CanonText[], query: string): ListedUnit[] {
  const found: ListedUnit[] = [];
  for (const { path, text } of texts) {
    for (const declaration of readDeclarations(text).declarations) {
      if (declaration.ids.some((id) => covers(id, query))) {
        found.push({ path, line: declaration.line, unit: declaration.unit });
      }
    }
  }
  found.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.line - b.line);
  return found;
}

/** The listing a caller reads: `path:line unit`, one unit per line. */
export function formatListing(units: readonly ListedUnit[]): string {
  return units.map((unit) => `${unit.path}:${unit.line} ${unit.unit}`).join('\n') + (units.length ? '\n' : '');
}

/** Why an id fails, or null when it is valid. */
function judge(id: string, schemas: SchemaSet): { check: string; reason: string } | null {
  if (CANON_DEFINED_IDS.has(id) || KINDS.has(id)) return null;
  const dot = id.indexOf('.');
  const kind = dot > 0 ? id.slice(0, dot) : '';
  if (!KINDS.has(kind)) {
    return { check: 'unknown-id', reason: 'is not a canon-defined id, an authored kind, or a path rooted at one' };
  }
  const path = id.slice(dot + 1);
  const schema = schemas.get(kind);
  const segment = schema ? unresolvedSegment(schema, path) : path.split('.')[0]!;
  if (segment === null) return null;
  return { check: 'unresolved-path', reason: `reaches no field of the ${kind} schema at '${segment}'` };
}

/** A heading that carries one Fires-on line: an anti-pattern entry, a numbered principle, or a convention section. */
function declares(path: string, line: string): boolean {
  if (path === CANON_HOMES[0]) return /^ {0,3}### AP-\d+\b/.test(line);
  if (path === CANON_HOMES[1]) return /^ {0,3}## \d+\. /.test(line);
  if (path === CANON_HOMES[2]) return /^ {0,3}## /.test(line);
  return false;
}

/**
 * Where each home's one Fires-on line sits. A missing line is sited at the heading, a further line
 * at that line, and a line in the wrong slot at the line.
 */
function placementFindings(path: string, text: string): Finding[] {
  const lines = toLines(text.replace(/^\uFEFF/, ''));
  const skipped = frontMatterLines(lines);
  const { fenced } = fencedLines(lines.slice(skipped), { onUnclosed: 'read-all' });
  const hidden = (index: number) => index < skipped || fenced.has(index - skipped);
  const findings: Finding[] = [];
  type Unit = { name: string; at: number; decls: number[] };
  const units: Unit[] = [];
  let current: Unit | null = null;
  for (const [index, line] of lines.entries()) {
    if (hidden(index)) continue;
    if (HEADING.test(line)) {
      current = null;
      if (declares(path, line)) {
        current = { name: HEADING.exec(line)?.[1] ?? line.trim(), at: index, decls: [] };
        units.push(current);
      }
      continue;
    }
    if (current && line.startsWith(DECLARATION_MARKER) && DECLARED_IDS.test(line.slice(DECLARATION_MARKER.length))) {
      current.decls.push(index);
    }
  }
  for (const unit of units) {
    const site = `${path}:${unit.at + 1}`;
    if (unit.decls.length === 0) {
      findings.push({ check: 'missing-line', site, detail: `'${unit.name}' carries no Fires-on line` });
      continue;
    }
    const slot = declarationSlot(path, lines, hidden, unit.at);
    const prose = proseBefore(lines, hidden, unit.at + 1, unit.decls[0]!);
    if (slot !== unit.decls[0] || (path !== CANON_HOMES[2] && !prose)) {
      findings.push({
        check: 'misplaced-line',
        site: `${path}:${unit.decls[0]! + 1}`,
        detail: `'${unit.name}' ${misplacedDetail(path)}`,
      });
    }
    for (const extra of unit.decls.slice(1)) {
      findings.push({
        check: 'repeated-line',
        site: `${path}:${extra + 1}`,
        detail: `'${unit.name}' carries more than one Fires-on line`,
      });
    }
  }
  return findings;
}

/** The index where this home's Fires-on line belongs, or -1 when the slot cannot be read. */
function declarationSlot(
  path: string,
  lines: string[],
  hidden: (index: number) => boolean,
  heading: number,
): number {
  const end = sectionEnd(lines, hidden, heading + 1);
  if (path === CANON_HOMES[2]) return firstContent(lines, hidden, heading + 1, end);
  if (path === CANON_HOMES[0]) {
    const detect = markerAt(lines, hidden, heading + 1, end, '**Detect:**');
    return detect < 0 ? -1 : lastContent(lines, hidden, heading + 1, detect);
  }
  return lastContent(lines, hidden, heading + 1, end);
}

function misplacedDetail(path: string): string {
  if (path === CANON_HOMES[0]) return 'carries its Fires-on line other than after its opening prose and before Detect';
  if (path === CANON_HOMES[1]) return 'carries its Fires-on line other than after its prose';
  return 'carries its Fires-on line other than directly under its title';
}

function sectionEnd(lines: string[], hidden: (index: number) => boolean, from: number): number {
  for (let index = from; index < lines.length; index++) {
    if (hidden(index)) continue;
    if (HEADING.test(lines[index] ?? '')) return index;
  }
  return lines.length;
}

function firstContent(lines: string[], hidden: (index: number) => boolean, from: number, until: number): number {
  for (let index = from; index < until; index++) {
    if (hidden(index)) continue;
    if ((lines[index] ?? '').trim() === '') continue;
    return index;
  }
  return -1;
}

function lastContent(lines: string[], hidden: (index: number) => boolean, from: number, until: number): number {
  let found = -1;
  for (let index = from; index < until; index++) {
    if (hidden(index)) continue;
    if ((lines[index] ?? '').trim() === '') continue;
    found = index;
  }
  return found;
}

function markerAt(lines: string[], hidden: (index: number) => boolean, from: number, until: number, marker: string): number {
  for (let index = from; index < until; index++) {
    if (hidden(index)) continue;
    if ((lines[index] ?? '').startsWith(marker)) return index;
  }
  return -1;
}

function proseBefore(lines: string[], hidden: (index: number) => boolean, from: number, decl: number): boolean {
  for (let index = from; index < decl; index++) {
    if (hidden(index)) continue;
    const line = lines[index] ?? '';
    if (line.trim() === '' || line.startsWith(DECLARATION_MARKER)) continue;
    return true;
  }
  return false;
}

/** Every finding in the given canon texts, judged against the given schemas. */
export function checkFiresOn(texts: readonly CanonText[], schemas: SchemaSet): Finding[] {
  const findings: Finding[] = [];
  for (const { path, text } of texts) {
    findings.push(...placementFindings(path, text));
    const { declarations, malformed } = readDeclarations(text);
    for (const { unit, line, text: written } of malformed) {
      findings.push({
        check: 'malformed-declaration',
        site: `${path}:${line}`,
        detail: `'${unit}' declares '${written}', which is not the ${DECLARATION_MARKER} marker followed by comma-separated single-backtick code spans, so none of its ids is checked`,
      });
    }
    for (const { unit, line, ids } of declarations) {
      const site = `${path}:${line}`;
      if (ids.includes(WILDCARD_ID) && ids.length > 1) {
        findings.push({ check: 'wildcard-not-alone', site, detail: `'${unit}' declares '${WILDCARD_ID}' beside other ids` });
      }
      const seen = new Set<string>();
      const reported = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) {
          if (!reported.has(id)) findings.push({ check: 'duplicate-id', site, detail: `'${unit}' declares '${id}' more than once` });
          reported.add(id);
          continue;
        }
        seen.add(id);
        const verdict = judge(id, schemas);
        if (verdict) findings.push({ check: verdict.check, site, detail: `'${unit}' fires on '${id}', which ${verdict.reason}` });
      }
    }
  }
  return findings;
}

/** Read the canon homes under `root` and judge them against the schemas in `schemasDir`. */
export function collect(root: string, schemasDir: string = SCHEMAS_DIR): Finding[] {
  const schemas = loadSchemas(schemasDir);
  assertScanned(schemas.size, 'generated schemas', schemasDir);
  const findings: Finding[] = [];
  const texts: CanonText[] = [];
  for (const path of CANON_HOMES) {
    const file = join(root, path);
    if (existsSync(file)) {
      texts.push({ path, text: readFileSync(file, 'utf-8') });
      continue;
    }
    findings.push({
      check: 'missing-home',
      site: path,
      detail: 'a canon home the corpus does not hold, so no declaration in it is checked',
    });
  }
  assertScanned(texts.length, 'canon homes', root);
  return [...findings, ...checkFiresOn(texts, schemas)];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runGuard('fires-on-ids', () => requireWorkflowsRoot(DEFAULT_ROOT), (root) => collect(root), {
    okMessage: 'every id a canon unit fires on is canon-defined, an authored kind, or a field path into one',
    remedy: `open the line with ${DECLARATION_MARKER} and write each id once, as comma-separated code spans: `
      + `an authored kind (${AUTHORED_KINDS.join(', ')}); a field its schema declares, as <kind>.<path> with [] only `
      + `between an array field and a field of its elements; or a canon-defined id (${[...CANON_DEFINED_IDS].join(', ')}), `
      + `${WILDCARD_ID} alone on its line`,
  });
}
