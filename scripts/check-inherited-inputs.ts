/**
 * check-inherited-inputs — a technique may not redeclare an input a container contract already
 * merges into it (`inherited-input-re-declared`).
 *
 * The loader composes a workflow-root `TECHNIQUE.md` and any group `TECHNIQUE.md` into every
 * descendant, so an operation reaches those inputs without declaring them. A leaf that declares one
 * again adds no bind point — it adds a second description of the same slot, and the two are edited
 * apart. Most of the instances this guard was written from had narrowed the wording to the operation
 * they sat on, so a caller binding the op read the ancestor's contract while a reader of the file
 * took the leaf's, with nothing marking which governed.
 *
 * A leaf entry that changes the bind contract is not this defect and is not flagged: a `#### default`
 * the ancestor lacks, or an optionality marker, is what an override is for. The mirror defect — an
 * input several leaves share that no common ancestor declares at all — is `hoist-shared-inputs`, the
 * hoist still owed rather than its residue, and it is out of scope here.
 *
 * Run: npx tsx scripts/check-inherited-inputs.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

const HEADING = /^### (\w+)[ \t]*$/gm;

/** The `## Inputs` span of a technique file, or '' when it declares none. */
function inputsSpan(body: string): string {
  const m = /^## Inputs[ \t]*$([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(body);
  return m ? m[1] : '';
}

/** id -> the entry's text, for each `### id` in an Inputs span. */
function entries(span: string): Map<string, string> {
  const heads = [...span.matchAll(HEADING)];
  const out = new Map<string, string>();
  heads.forEach((h, i) => {
    const start = h.index!;
    const end = i + 1 < heads.length ? heads[i + 1].index! : span.length;
    out.set(h[1], span.slice(start, end));
  });
  return out;
}

function declaredIds(path: string): Set<string> {
  if (!existsSync(path)) return new Set();
  return new Set(entries(inputsSpan(readFileSync(path, 'utf-8'))).keys());
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (entry.endsWith('.md') && entry !== 'TECHNIQUE.md') out.push(p);
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    const rootIds = declaredIds(join(techniquesDir, 'TECHNIQUE.md'));
    for (const path of walk(techniquesDir)) {
      const span = inputsSpan(readFileSync(path, 'utf-8'));
      if (!span) continue;
      scanned++;
      const groupDir = dirname(path);
      const groupIds =
        groupDir === techniquesDir ? new Set<string>() : declaredIds(join(groupDir, 'TECHNIQUE.md'));
      for (const [id, text] of entries(span)) {
        if (!rootIds.has(id) && !groupIds.has(id)) continue;
        // an override changes the bind contract rather than restating it
        if (text.includes('#### default') || text.includes('*(optional)*')) continue;
        const owner = groupIds.has(id) ? 'its group' : "the workflow root's";
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
