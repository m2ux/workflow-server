/**
 * check-canonical-home-map — every canonical-home row names an artifact some technique declares.
 *
 * A canonical-home map answers one question for every template in its workflow: which single
 * artifact homes this fact category, so that every other template carries a link-only slot to it
 * rather than restating the content. `verify-artifact-conforms` is bound with the map as an input
 * and enforces that rule at a workflow boundary, which makes the map's home column operative — a
 * conformance gate resolves against it.
 *
 * Nothing checked that the column named a file the workflow actually produces. A row can name the
 * *guide* resource that describes an artifact's shape instead of the artifact itself, and the two
 * differ whenever the guide's own filename is not the artifact's. The gate then asks every template
 * to link a home that no run writes, and the rule can never be satisfied for that category while
 * the guard suite stays green — the failure is silent because the gate reads the map and the map is
 * the thing that is wrong.
 *
 * The guard resolves each map the corpus binds, reads its home column, and requires every filename
 * there to be one a technique declares under `#### artifact` in the same workflow or in `meta`.
 *
 * Carve-outs, each because the name is a real home the artifact contract cannot carry:
 *   - `README.md`, minted by `workflow-engine::create-readme` rather than declared as an output.
 *   - A `{token}` template on either side, which resolves at runtime (`strategic-review-{n}.md`).
 *
 * Run: npx tsx scripts/check-canonical-home-map.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot, workflowSubdir } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));
const TRIAGE = resolve(join(DIR, 'canonical-home-map-triage.json'));

interface TriageEntry {
  site: string;
  artifact: string;
  verdict: string;
  rationale: string;
}

interface TriageFile {
  note?: string;
  rationales?: Record<string, string>;
  entries: TriageEntry[];
}

function loadTriage(path: string = TRIAGE): TriageFile {
  if (!existsSync(path)) return { entries: [] };
  return JSON.parse(readFileSync(path, 'utf-8')) as TriageFile;
}

const SHARED_WORKFLOW = 'meta';
/** The server mints the planning-folder index rather than declaring it as a technique output. */
const SERVER_MINTED = new Set(['README.md']);

/** `canonical_home_map: <workflow>/<resource>` or `<workflow>/techniques#<anchor>`. */
const MAP_BIND = /canonical_home_map:\s*([^\s#]+)(?:#([^\s]+))?\s*$/gm;
/** A backticked filename: one path segment carrying an extension. */
const FILENAME = /`([A-Za-z0-9_{}.-]+\.[A-Za-z0-9]+)`/g;

interface MapRef {
  /** `<workflow>/<resource>` or `<workflow>/techniques#<anchor>`, as authored. */
  ref: string;
  workflow: string;
  path: string;
  /** Set when the map is a `###` section of a container contract rather than a whole resource. */
  anchor?: string;
}

function walk(dir: string | null, out: string[] = []): string[] {
  if (!dir || !existsSync(dir)) return out;
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (entry.endsWith('.md')) out.push(p);
  }
  return out;
}

/** Every map the corpus binds as a `canonical_home_map` input, deduplicated by ref. */
function boundMaps(root: string): MapRef[] {
  const byRef = new Map<string, MapRef>();
  for (const { dir } of corpusWorkflows(root)) {
    const activities = join(dir, 'activities');
    if (!existsSync(activities) || !statSync(activities).isDirectory()) continue;
    for (const entry of readdirSync(activities).sort()) {
      if (!entry.endsWith('.yaml')) continue;
      const body = readFileSync(join(activities, entry), 'utf-8');
      for (const m of body.matchAll(MAP_BIND)) {
        const [workflow, ...rest] = m[1].split('/');
        const tail = rest.join('/');
        const anchor = m[2];
        // A ref naming no workflow the corpus holds keeps an unresolvable path, which the caller
        // reports as a missing home rather than silently skipping.
        const path = anchor
          ? workflowSubdir(root, workflow, join(tail, 'TECHNIQUE.md')) ?? join(root, workflow, tail, 'TECHNIQUE.md')
          : workflowSubdir(root, workflow, join('resources', `${tail}.md`)) ?? join(root, workflow, 'resources', `${tail}.md`);
        const ref = anchor ? `${m[1]}#${anchor}` : m[1];
        byRef.set(ref, { ref, workflow, path, ...(anchor ? { anchor } : {}) });
      }
    }
  }
  return [...byRef.values()];
}

/** The map's body — the whole resource, or the span of the named `###` section. */
function mapBody(ref: MapRef): string | null {
  if (!existsSync(ref.path)) return null;
  const body = readFileSync(ref.path, 'utf-8');
  if (!ref.anchor) return body;
  const lines = body.split('\n');
  const start = lines.findIndex((l) => new RegExp(`^#{2,4} +${ref.anchor}\\s*$`, 'i').test(l));
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{2,4} /.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n');
}

/**
 * The filenames a map's home column names.
 *
 * Only the second column is read, and only its backticked tokens: a row may cite the guide that
 * owns an artifact's shape as a markdown link beside the home, and that link target is not a home.
 */
function homeFilenames(body: string): { row: string; artifact: string }[] {
  const out: { row: string; artifact: string }[] = [];
  for (const row of body.split('\n')) {
    const cells = row.split('|');
    if (cells.length < 3) continue;
    const category = cells[1].trim();
    if (!category || /^-+$/.test(category) || /^Fact category$/i.test(category)) continue;
    for (const m of cells[2].matchAll(FILENAME)) out.push({ row: category, artifact: m[1] });
  }
  return out;
}

/** Every filename a technique declares under `#### artifact`, for one workflow. */
function declaredArtifacts(root: string, workflow: string): Set<string> {
  const out = new Set<string>();
  for (const file of walk(workflowSubdir(root, workflow, 'techniques'))) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!/^#### +artifact\s*$/i.test(lines[i])) continue;
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const m = lines[j].match(/^\s*`([^`]+)`\s*$/);
        if (m) {
          out.add(m[1].trim());
          break;
        }
        if (/^#/.test(lines[j])) break;
      }
    }
  }
  return out;
}

/**
 * A home written as a `{token}` template matches a declared name of the same skeleton.
 *
 * The brace must be on the HOME side. Matching a literal home against a declared template lets a
 * fully-templated artifact name — `{codebase_area}.md` — stand in for any filename at all, so every
 * row in a workflow that declares one passes without being read. That is not a carve-out but a hole
 * the size of the check: the guard went silent on the row it was written for until this direction
 * was fixed.
 */
function templateMatches(home: string, declared: string): boolean {
  if (!home.includes('{')) return false;
  const escaped = home.replace(/[.*+?^$()|[\]\\]/g, (c) => `\\${c}`);
  return new RegExp(`^${escaped.replace(/\{[^}]*\}/g, '[A-Za-z0-9_.-]+')}$`).test(declared);
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const out: Finding[] = [];
  const maps = boundMaps(root);
  assertScanned(maps.length, 'canonical-home map binding(s)', root);
  const triage = loadTriage();
  const accepted = new Map(triage.entries.map((e) => [`${e.site} ${e.artifact}`, e]));
  const matched = new Set<string>();
  const shared = declaredArtifacts(root, SHARED_WORKFLOW);
  for (const ref of maps) {
    const body = mapBody(ref);
    if (body === null) {
      out.push({
        check: 'canonical-home-map-resolves',
        site: ref.ref,
        detail: `bound as a canonical_home_map input but resolves to no map — expected ${ref.path.replace(root, 'workflows')}${ref.anchor ? ` section '${ref.anchor}'` : ''}`,
      });
      continue;
    }
    const declared = new Set([...declaredArtifacts(root, ref.workflow), ...shared]);
    for (const { row, artifact } of homeFilenames(body)) {
      if (SERVER_MINTED.has(artifact)) continue;
      if (declared.has(artifact)) continue;
      if ([...declared].some((d) => templateMatches(artifact, d))) continue;
      const site = `${ref.ref} [${row}]`;
      const key = `${site} ${artifact}`;
      if (accepted.has(key)) {
        matched.add(key);
        continue;
      }
      out.push({
        check: 'canonical-home-names-an-artifact',
        site,
        detail: `home '${artifact}' is declared by no technique's '#### artifact' in '${ref.workflow}' or '${SHARED_WORKFLOW}' — the conformance gate bound with this map asks every template to link a home no run writes`,
      });
    }
  }
  // A triage entry matching nothing is stale — the row was repointed or the artifact gained a
  // declaration. Reporting it keeps the ledger from outliving the debt it records, the convention
  // scripts/binding-fidelity-triage.json states for its own entries.
  for (const [key, entry] of accepted) {
    if (matched.has(key)) continue;
    out.push({
      check: 'canonical-home-map-triage-stale',
      site: entry.site,
      detail: `triage entry for '${entry.artifact}' matches no finding — the row was repointed or the artifact gained a declaration; delete the entry from scripts/canonical-home-map-triage.json`,
    });
  }
  return out.sort((a, b) => a.site.localeCompare(b.site));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  // Name the accepted-debt count in the clean message, so a passing guard never reads as "every
  // row resolves" while some of them are owed a declaration.
  const owed = loadTriage().entries.length;
  await runGuard('canonical-home-map', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: owed === 0
      ? 'every canonical-home row names an artifact a technique declares'
      : `every canonical-home row names an artifact a technique declares (${owed} triaged as owing one)`,
    remedy: "point the row at the artifact filename its producing technique declares under '#### artifact' — not at the guide resource that describes the artifact's shape",
  });
}
