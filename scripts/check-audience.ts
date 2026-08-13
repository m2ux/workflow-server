/**
 * check-audience — artifact audience declaration and JSON-format guard (#224 V4).
 *
 * An output declared with `#### audience` = `agent` is written for the next agent to consume as
 * state, and by convention (docs/technique-protocol-specification.md §3.2) an agent-audience
 * artifact is serialized as JSON on disk. This guard walks every technique `.md` in the corpus
 * through the real loader and, for each output that is BOTH `audience: agent` AND carries an
 * `#### artifact` filename, asserts the artifact name follows the JSON-format convention: it (or,
 * for a `{token}`-template name, its literal suffix) ends in `.json`.
 *
 * It also asserts that an output declaring an artifact declares an audience for it. Absence reads as
 * `human` by default, so an agent-state register — a log, index or ledger only later steps re-read —
 * silently keeps the prose shape a human document has, which is how a reader-less artifact acquires
 * a reader nobody chose. An output with no `#### artifact` is out of scope for both halves: audience
 * is a property of a file on disk, and a component or in-memory output is not one.
 *
 * The catalog entry `artifact-audience-declared` names both halves and this guard proves them.
 *
 * This is a distinct concern from check-binding-fidelity.ts — that guard checks input/output
 * binding conformance and treats `#### artifact` as opaque presence. Audience is a separate
 * one-guard-per-concern check, so it lives in its own script. Enum *validity* (`human`|`agent`) is
 * already enforced by the Zod `.strict()` schema at load; this guard checks the on-disk *format*
 * convention the schema cannot express.
 *
 * Hard zero, no baseline: the convention has no accepted exceptions, so any violation fails the
 * guard. The retired `audience-baseline.json` held an empty array (issue #327 R5).
 *
 * Run: npx tsx scripts/check-audience.ts [--root <workflows-dir>] [--json]
 * To check a dedicated worktree's workflows instead of the repo's own ../workflows, pass
 * `--root <path>` (or set WORKFLOWS_DIR).
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tryLoadMarkdownTechnique, tryLoadNestedTechnique } from '../src/loaders/markdown-technique-loader.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

const GROUPED_INDEX = 'TECHNIQUE.md';

export interface AudienceViolation {
  /** Which finding family this violation belongs to. */
  check: 'audience-json-format' | 'audience-declared';
  /** `<workflow>::<technique-id>::<output-id>`. */
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

export async function collectAudienceViolations(root: string = DEFAULT_ROOT): Promise<AudienceViolation[]> {
  const out: AudienceViolation[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const { id, technique } of await loadWorkflowTechniques(techniquesDir)) {
      scanned++;
      for (const o of technique.outputs ?? []) {
        // An output declaring an artifact filename is a file on disk, and only a file has an
        // audience. Everything else — components, in-memory values — is out of scope for both halves.
        const name = o.artifact?.name;
        if (!name) continue;

        if (!o.audience) {
          out.push({
            check: 'audience-declared',
            key: `${workflow}::${technique.id}::${o.id}`,
            detail: `output '${o.id}' in technique '${id}' declares artifact '${name}' with no audience — absence reads as human, so agent state keeps a prose shape nobody chose for it (declare 'human' for a document a person reads, or 'agent' for state a later step re-reads, which is JSON on disk)`,
          });
          continue;
        }

        if (o.audience !== 'agent') continue;
        if (!isJsonArtifactName(name)) {
          out.push({
            check: 'audience-json-format',
            key: `${workflow}::${technique.id}::${o.id}`,
            detail: `output '${o.id}' in technique '${id}' is audience: agent but its artifact name '${name}' is not JSON — an agent-audience artifact is serialized as JSON on disk (rename to a .json filename)`,
          });
        }
      }
    }
  }
  assertScanned(scanned, 'technique files', root);
  return out.sort((a, b) => (a.check + a.key).localeCompare(b.check + b.key));
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  return (await collectAudienceViolations(root)).map((v) => ({ check: v.check, site: v.key, detail: v.detail }));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('audience', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every artifact declares its audience, and every agent-audience artifact is JSON on disk',
    remedy: 'declare an audience on each artifact, and rename each agent-audience artifact to a .json filename',
  });
}
