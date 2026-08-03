/**
 * check-artifact-guides — every persisted artifact filename maps to a creation guide.
 *
 * Design principle 28 (Creation Guide for Generated Documents) and the `no-template-creation-guide`
 * catalog entry both require it: an artifact a workflow persists has a guide resource carrying a
 * `## Template` and the `## Rules` that populate it, and the persist technique cites that guide
 * rather than inventing layout in protocol prose. Until now the requirement was audit-time prose,
 * so a new artifact could ship with its shape improvised and nothing would say so.
 *
 * The guard walks every technique output that declares an `#### artifact` filename and resolves a
 * guide for it two ways, in order:
 *
 *   1. The producing workflow's `resources/README.md` carries a `## Planning artifact to guide map`
 *      section with a row naming the filename. The map is the authored answer, so it wins.
 *   2. Failing that, some resource in the producing workflow — or in `meta` — names the filename in
 *      its body and carries a `## Template` (or `## <Something> Template` / `## Skeleton`) heading.
 *      This is the mapping a guide makes by naming the artifact it is the guide for, which the
 *      catalog entry's own do-not-flag carve-out endorses.
 *
 * An artifact that resolves neither way is a finding, unless `artifact-guide-baseline.json` records
 * it as an accepted gap with a classification. The baseline is not a snapshot to regenerate: an
 * entry is a judgement about one artifact, in the same spirit as
 * `scripts/binding-fidelity-triage.json`. Adding a new artifact with no guide fails the guard;
 * closing a baselined gap means deleting its entry.
 *
 * Run: npx tsx scripts/check-artifact-guides.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tryLoadMarkdownTechnique, tryLoadNestedTechnique } from '../src/loaders/markdown-technique-loader.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));
const BASELINE = resolve(join(DIR, 'artifact-guide-baseline.json'));

const GROUPED_INDEX = 'TECHNIQUE.md';
const SHARED_WORKFLOW = 'meta';

/**
 * A resource carries a fill shape when it has a heading naming one. `Template` and `Skeleton` are
 * the canonical words; `Artifact`, `Format` and `Structure` cover the guides that named their shape
 * before the convention settled (`## Planning Artifact`, `## Response Format Template`).
 */
const TEMPLATE_HEADING = /^#{2,4} .*(Template|Skeleton|Artifact|Format|Structure)\s*$/im;
/** The authored filename-to-guide map section, matched on its heading. */
const GUIDE_MAP_HEADING = /^##+ +Planning artifact to guide map\s*$/im;

export interface UnmappedArtifact {
  /** `<workflow>::<technique-id>::<output-id>`. */
  key: string;
  artifact: string;
  detail: string;
}

interface BaselineEntry {
  site: string;
  artifact: string;
  verdict: string;
  rationale: string;
}

interface BaselineFile {
  note?: string;
  rationales?: Record<string, string>;
  entries: BaselineEntry[];
}

function loadBaseline(): BaselineFile {
  if (!existsSync(BASELINE)) return { entries: [] };
  return JSON.parse(readFileSync(BASELINE, 'utf-8')) as BaselineFile;
}

/**
 * Every resource body of a workflow, keyed by filename. Read once per workflow — the guard asks the
 * same corpus of resources about many artifacts.
 */
function readResources(root: string, workflow: string): Map<string, string> {
  const out = new Map<string, string>();
  const dir = join(root, workflow, 'resources');
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return out;
  for (const entry of readdirSync(dir).sort()) {
    if (!entry.endsWith('.md')) continue;
    out.set(entry, readFileSync(join(dir, entry), 'utf-8'));
  }
  return out;
}

/** The span of the guide-map section in a resources README, or null when it has none. */
function guideMapSection(readme: string | undefined): string | null {
  if (!readme) return null;
  const lines = readme.split('\n');
  const start = lines.findIndex((l) => GUIDE_MAP_HEADING.test(l));
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##+ /.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n');
}

/**
 * A guide-map row names the artifact when the filename appears in it — the row's guide column then
 * says which resource owns the shape. The guard checks the mapping exists, not that its link
 * resolves: `check-resource-anchors` already resolves every relative link in the corpus.
 */
function mapNamesArtifact(section: string | null, artifact: string): boolean {
  if (!section) return false;
  return section.split('\n').some((row) => row.includes('|') && row.includes(artifact));
}

/**
 * The span where a resource declares what it is the guide FOR: its frontmatter and everything before
 * its first `##` section — the `name`/`description` block plus the H1 and its lead paragraph.
 *
 * Scoping the filename match to this span is what separates a guide from a resource that merely
 * mentions the file. A body-wide match certifies coverage it has not got: a guide's own "traces to"
 * line names sibling artifacts, and a close-out guide names every register it counts, so a loose
 * match resolved `evidence-log.md`, `assumptions-log.md` and `token-usage.md` to resources that say
 * nothing about their shape.
 */
function guideDeclarationSpan(body: string): string {
  const afterFrontmatter = body.startsWith('---') ? body.indexOf('\n---', 3) : -1;
  const head = afterFrontmatter >= 0 ? body.slice(0, afterFrontmatter) : '';
  const rest = afterFrontmatter >= 0 ? body.slice(afterFrontmatter) : body;
  const firstSection = rest.search(/^##\s/m);
  return head + (firstSection < 0 ? rest : rest.slice(0, firstSection));
}

/**
 * A resource is the guide for an artifact when it declares the filename in its own guide-declaration
 * span (or in an explicit "creation guide for" statement anywhere) and carries a fill shape.
 */
function resourceIsGuideFor(resources: Map<string, string>, artifact: string): string | null {
  for (const [name, body] of resources) {
    if (name === 'README.md') continue;
    if (!TEMPLATE_HEADING.test(body)) continue;
    if (guideDeclarationSpan(body).includes(artifact)) return name;
    if (new RegExp(`creation guide for[^\\n]*${artifact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(body)) return name;
  }
  return null;
}

type LoadedTechnique = NonNullable<Awaited<ReturnType<typeof tryLoadMarkdownTechnique>>>;

async function tryLoad(load: () => Promise<LoadedTechnique | null>): Promise<LoadedTechnique | null> {
  try { return await load(); } catch { return null; }
}

/** Load every technique in a workflow's `techniques/` tree through the real loader. */
async function loadWorkflowTechniques(techniquesDir: string): Promise<Array<{ id: string; technique: LoadedTechnique }>> {
  const out: Array<{ id: string; technique: LoadedTechnique }> = [];
  if (!existsSync(techniquesDir)) return out;
  for (const entry of readdirSync(techniquesDir).sort()) {
    const full = join(techniquesDir, entry);
    if (statSync(full).isDirectory()) {
      if (existsSync(join(full, GROUPED_INDEX))) {
        const index = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, entry));
        if (index) out.push({ id: entry, technique: index });
      }
      for (const child of readdirSync(full).sort()) {
        if (!child.endsWith('.md') || child === GROUPED_INDEX) continue;
        const op = await tryLoad(() => tryLoadNestedTechnique(techniquesDir, entry, child.slice(0, -'.md'.length)));
        if (op) out.push({ id: `${entry}::${child.slice(0, -'.md'.length)}`, technique: op });
      }
    } else if (entry.endsWith('.md') && entry !== GROUPED_INDEX) {
      const t = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, entry.slice(0, -'.md'.length)));
      if (t) out.push({ id: entry.slice(0, -'.md'.length), technique: t });
    }
  }
  return out;
}

export async function collectUnmappedArtifacts(root: string = DEFAULT_ROOT): Promise<UnmappedArtifact[]> {
  const baseline = loadBaseline();
  const accepted = new Set(baseline.entries.map((e) => `${e.site} ${e.artifact}`));
  const out: UnmappedArtifact[] = [];
  const sharedResources = readResources(root, SHARED_WORKFLOW);
  let scanned = 0;

  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    const resources = readResources(root, workflow);
    const map = guideMapSection(resources.get('README.md'));

    for (const { id, technique } of await loadWorkflowTechniques(techniquesDir)) {
      scanned++;
      for (const o of technique.outputs ?? []) {
        const artifact = o.artifact?.name?.trim();
        if (!artifact) continue;
        const key = `${workflow}::${technique.id}::${o.id}`;
        if (mapNamesArtifact(map, artifact)) continue;
        if (resourceIsGuideFor(resources, artifact)) continue;
        if (resourceIsGuideFor(sharedResources, artifact)) continue;
        if (accepted.has(`${key} ${artifact}`)) continue;
        out.push({
          key,
          artifact,
          detail: `output '${o.id}' in technique '${id}' persists '${artifact}' with no creation guide — add a row to ${workflow}/resources/README.md under 'Planning artifact to guide map', or author a guide resource with a Template and Rules; an accepted gap is classified in scripts/artifact-guide-baseline.json`,
        });
      }
    }
  }
  assertScanned(scanned, 'technique files', root);
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  return (await collectUnmappedArtifacts(root)).map((v) => ({ check: 'artifact-guide-mapped', site: v.key, detail: v.detail }));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  // Name the accepted-debt count in the clean message, so a passing guard never reads as "every
  // artifact has a guide" while sixteen of them are owed one.
  const owed = loadBaseline().entries.length;
  await runGuard('artifact-guides', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: `every persisted artifact filename maps to a creation guide (${owed} triaged as owing one)`,
    remedy: 'map the filename in the workflow resources index, author the guide, or classify the gap in scripts/artifact-guide-baseline.json',
  });
}
