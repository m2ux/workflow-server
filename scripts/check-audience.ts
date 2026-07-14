/**
 * check-audience — agent-audience artifact JSON-format convention guard (#224 V4).
 *
 * An output declared with `#### audience` = `agent` is written for the next agent to consume as
 * state, and by convention (docs/technique-protocol-specification.md §3.2) an agent-audience
 * artifact is serialized as JSON on disk. This guard walks every technique `.md` in the corpus
 * through the real loader and, for each output that is BOTH `audience: agent` AND carries an
 * `#### artifact` filename, asserts the artifact name follows the JSON-format convention: it (or,
 * for a `{token}`-template name, its literal suffix) ends in `.json`.
 *
 * This is a distinct concern from check-binding-fidelity.ts — that guard checks input/output
 * binding conformance and treats `#### artifact` as opaque presence. The audience/JSON-format
 * convention is a separate one-guard-per-concern check, so it lives in its own script. Enum
 * *validity* (`human`|`agent`) is already enforced by the Zod `.strict()` schema at load; this
 * guard checks the on-disk *format* convention the schema cannot express.
 *
 * The current corpus carries no agent-audience adoption, so the expected baseline is empty. Any
 * violation is snapshotted in scripts/audience-baseline.json; the guard fails ONLY on violations
 * absent from that baseline (i.e. a NEW agent-audience artifact whose name is not JSON). Regenerate
 * the baseline after an intentional, reviewed change with:
 *   npx tsx scripts/check-audience.ts --update-baseline
 *
 * Run: npx tsx scripts/check-audience.ts [--root <workflows-dir>]
 * To check a dedicated worktree's workflows instead of the repo's own ../workflows, pass
 * `--root <path>` (or set WORKFLOWS_DIR).
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tryLoadMarkdownTechnique, tryLoadNestedTechnique } from '../src/loaders/markdown-technique-loader.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));
const BASELINE = join(DIR, 'audience-baseline.json');

const GROUPED_INDEX = 'TECHNIQUE.md';

export interface AudienceViolation {
  /** `<workflow>::<technique-id>::<output-id>` — stable key for the baseline. */
  key: string;
  detail: string;
}

/**
 * An agent-audience artifact must be JSON on disk. Accept a name whose literal suffix is `.json`
 * — including a `{token}`-templated name (`{package_name}-state.json`) whose fixed tail is `.json`.
 */
function isJsonArtifactName(name: string): boolean {
  return /\.json$/i.test(name.trim());
}

type LoadedTechnique = NonNullable<Awaited<ReturnType<typeof tryLoadMarkdownTechnique>>>;

/**
 * Load a technique file, tolerating non-technique `.md` files that share the `techniques/` tree.
 * The loader THROWS a parse error on a file with no `## Capability` / no `metadata.version` (e.g. a
 * `README.md`); such a file is not a technique, so the walker skips it rather than crashing the
 * guard. A file that parses but fails schema validation (a genuinely malformed technique) returns
 * null from the loader and is likewise skipped — the schema-validation test owns that failure.
 */
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
      // Grouped technique: `<group>/TECHNIQUE.md` index + `<group>/<op>.md` children.
      if (existsSync(join(full, GROUPED_INDEX))) {
        const index = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, entry));
        if (index) out.push({ id: entry, technique: index });
      }
      for (const child of readdirSync(full).sort()) {
        if (!child.endsWith('.md') || child === GROUPED_INDEX) continue;
        const opName = child.slice(0, -'.md'.length);
        const op = await tryLoad(() => tryLoadNestedTechnique(techniquesDir, entry, opName));
        if (op) out.push({ id: `${entry}::${opName}`, technique: op });
      }
    } else if (entry.endsWith('.md') && entry !== GROUPED_INDEX) {
      // Flat standalone technique `<id>.md`.
      const id = entry.slice(0, -'.md'.length);
      const t = await tryLoad(() => tryLoadMarkdownTechnique(techniquesDir, id));
      if (t) out.push({ id, technique: t });
    }
  }
  return out;
}

export async function collectAudienceViolations(root: string = ROOT): Promise<AudienceViolation[]> {
  const out: AudienceViolation[] = [];
  if (!existsSync(root)) return out;
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const { id, technique } of await loadWorkflowTechniques(techniquesDir)) {
      for (const o of technique.outputs ?? []) {
        // Only agent-audience outputs that also declare an artifact filename are in scope: those
        // are the artifacts written to disk that the convention says must be JSON.
        if (o.audience !== 'agent') continue;
        const name = o.artifact?.name;
        if (!name) continue;
        if (!isJsonArtifactName(name)) {
          out.push({
            key: `${workflow}::${technique.id}::${o.id}`,
            detail: `output '${o.id}' in technique '${id}' is audience: agent but its artifact name '${name}' is not JSON — an agent-audience artifact is serialized as JSON on disk (rename to a .json filename)`,
          });
        }
      }
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

function loadBaseline(): Set<string> {
  if (!existsSync(BASELINE)) return new Set();
  try { return new Set(JSON.parse(readFileSync(BASELINE, 'utf-8')) as string[]); } catch { return new Set(); }
}

/** Violations not in the committed baseline (`added`) and baselined keys no longer present (`fixed`). */
export async function diffBaseline(root: string = ROOT): Promise<{ added: AudienceViolation[]; fixed: string[] }> {
  const all = await collectAudienceViolations(root);
  const baseline = loadBaseline();
  return {
    added: all.filter(v => !baseline.has(v.key)),
    fixed: [...baseline].filter(k => !all.some(v => v.key === k)),
  };
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const all = await collectAudienceViolations();
  if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE, JSON.stringify(all.map(v => v.key), null, 2) + '\n');
    process.stdout.write(`audience: baseline updated with ${all.length} entr(ies) at ${relative(process.cwd(), BASELINE)}\n`);
    process.exit(0);
  }
  const baseline = loadBaseline();
  const fresh = all.filter(v => !baseline.has(v.key));
  const fixed = [...baseline].filter(k => !all.some(v => v.key === k));
  if (fresh.length === 0) {
    process.stdout.write(`audience: OK — ${all.length} total, ${baseline.size} baselined, 0 NEW${fixed.length ? `, ${fixed.length} fixed` : ''}\n`);
    if (fixed.length) process.stdout.write(`  ${fixed.length} baselined entr(ies) no longer present — run --update-baseline to shrink the baseline\n`);
    process.exit(0);
  }
  process.stdout.write(`audience: ${fresh.length} NEW violation(s) — an agent-audience artifact is not JSON:\n`);
  for (const v of fresh) process.stdout.write(`  ${v.key} — ${v.detail}\n`);
  process.exit(1);
}
