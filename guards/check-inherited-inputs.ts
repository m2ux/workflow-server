/**
 * check-inherited-inputs — a technique may not redeclare an input a container contract already
 * merges into it (`inherited-input-re-declared`).
 *
 * The loader composes a workflow-root `TECHNIQUE.md` and any group `TECHNIQUE.md` into every
 * descendant, so a technique reaches those inputs without declaring them. A leaf that declares one
 * again adds no bind point — it adds a second description of the same slot, and the two are edited
 * apart. Most of the instances this guard was written from had narrowed the wording to the technique
 * they sat on, so a caller binding the op read the ancestor's contract while a reader of the file
 * took the leaf's, with nothing marking which governed.
 *
 * A leaf entry that changes the bind contract is not this defect and is not flagged: a `#### default`
 * the ancestor lacks, an optionality marker, or a required entry over an ancestor that marks the
 * input optional, is what an override is for. The mirror defect — an input several leaves share that
 * no common ancestor declares at all — is `hoist-shared-inputs`, the
 * hoist still owed rather than its residue, and it is out of scope here.
 *
 * Run: npx tsx guards/check-inherited-inputs.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, corpusFiles, corpusNamespaces, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

const HEADING = /^### (\w+)[ \t]*$/gm;

/** The `## Inputs` span of a technique file, or '' when it declares none. */
function inputsSpan(body: string): string {
  const m = /^## Inputs[ \t]*$([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(body);
  return m?.[1] ?? '';
}

/** id -> the entry's text, for each `### id` in an Inputs span. */
function entries(span: string): Map<string, string> {
  const heads = [...span.matchAll(HEADING)];
  const out = new Map<string, string>();
  heads.forEach((h, i) => {
    const start = h.index!;
    const end = i + 1 < heads.length ? heads[i + 1]!.index! : span.length;
    out.set(h[1]!, span.slice(start, end));
  });
  return out;
}

function declaredEntries(path: string): Map<string, string> {
  if (!existsSync(path)) return new Map();
  return entries(inputsSpan(readFileSync(path, 'utf-8')));
}

const OPTIONAL = '*(optional)*';

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const { dir } of corpusNamespaces(root)) {
    const techniquesDir = join(dir, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    const rootEntries = declaredEntries(join(techniquesDir, 'TECHNIQUE.md'));
    for (const path of corpusFiles(techniquesDir, (name) => name.endsWith('.md') && name !== 'TECHNIQUE.md')) {
      const span = inputsSpan(readFileSync(path, 'utf-8'));
      if (!span) continue;
      scanned++;
      const groupDir = dirname(path);
      const groupEntries =
        groupDir === techniquesDir ? new Map<string, string>() : declaredEntries(join(groupDir, 'TECHNIQUE.md'));
      for (const [id, text] of entries(span)) {
        // The nearest ancestor is the declaration this entry merges over.
        const inherited = groupEntries.get(id) ?? rootEntries.get(id);
        if (inherited === undefined) continue;
        // An override changes the bind contract rather than restating it: a default of its own, an
        // optionality marker, or a required entry over an ancestor that marks the input optional.
        if (text.includes('#### default') || text.includes(OPTIONAL)) continue;
        if (inherited.includes(OPTIONAL)) continue;
        const owner = groupEntries.has(id) ? 'its group' : "the workflow root's";
        findings.push({
          check: 'inherited-input-re-declared',
          site: relative(root, path),
          detail: `input '${id}' is already declared by ${owner} TECHNIQUE.md and merged in, so this `
            + 'entry adds no bind point — only a second description of one slot, which drifts from the '
            + 'ancestor it duplicates. Delete it; Protocol keeps referencing the designator unchanged. '
            + "Where this entry's wording holds something the ancestor's lacks, widen the ancestor first.",
        });
      }
    }
  }
  assertScanned(scanned, 'technique files declaring inputs', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('inherited-inputs', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no technique redeclares an input a container contract already delivers',
    remedy: 'delete the leaf declaration and let the container merge supply the slot',
  });
}
