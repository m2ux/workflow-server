/**
 * check-protocol-shape — a technique indexes each phase of its protocol in a heading that names it.
 *
 * A protocol takes either shape today: `### N. Title` headings that name what each phase achieves,
 * or a flat numbered list directly under `## Protocol`. The design catalogue holds an entry saying
 * the heading is the form, on the ground that a phase without one is a phase nothing can cite and
 * nothing can link to — a reviewer naming where a protocol goes wrong has to quote it instead, and a
 * resource pointing at one step of it has nowhere to point.
 *
 * A file carrying both shapes is reported too: numbered items sitting outside any heading, beside
 * headings that name their own phases, reads as though only some of the phases were worth naming.
 *
 * ---
 *
 * NOT IN THE GUARD REGISTRY, and `tests/guard-registry.test.ts` records the reason.
 *
 * The corpus holds 409 techniques following the rule and 95 that do not. The 95 are a corpus-wide
 * conversion, and #837 argues the measurement should precede the decision: whether they are
 * converted in one pass or recorded as accepted debt is a judgement someone makes against a number,
 * and until this ran there was no number. Enrolling it would take the sweep red for work nobody has
 * scheduled, which teaches every reader to ignore a red sweep.
 *
 * What it buys now is that the 95 stop being 96. The population is a figure that moves.
 *
 * Run: npx tsx guards/check-protocol-shape.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, corpusNamespaces, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** How a technique indexes the phases of its `## Protocol`. */
interface ProtocolShape {
  /** `### ` headings under `## Protocol` — one per named phase. */
  headings: number;
  /** Numbered items sitting directly under `## Protocol`, outside any heading. */
  bare: number;
  /** Line of the first bare numbered item, which is where the finding points. */
  firstBareLine: number | null;
}

/**
 * Read the shape of a file's protocol.
 *
 * Fenced blocks are skipped: a template showing a numbered protocol is illustration rather than one.
 * A `## ` heading other than Protocol closes the section, so a numbered list under `## Rules` is not
 * counted as a phase.
 */
function protocolShape(body: string): ProtocolShape {
  let inProtocol = false;
  let fenced = false;
  let underHeading = false;
  const shape: ProtocolShape = { headings: 0, bare: 0, firstBareLine: null };
  body.split('\n').forEach((line, i) => {
    if (/^```/.test(line)) { fenced = !fenced; return; }
    if (fenced) return;
    if (/^## /.test(line)) {
      inProtocol = /^## Protocol\s*$/.test(line);
      underHeading = false;
      return;
    }
    if (!inProtocol) return;
    if (/^### /.test(line)) { shape.headings++; underHeading = true; return; }
    if (/^\d+\. /.test(line) && !underHeading) {
      shape.bare++;
      shape.firstBareLine ??= i + 1;
    }
  });
  return shape;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  // A protocol is a protocol wherever it is written, so the sweep enumerates namespaces and reaches
  // the libraries no workflow declares. One file can sit under two namespaces where one nests inside
  // another, so a path is checked once.
  const seen = new Set<string>();
  for (const { dir } of corpusNamespaces(root)) {
    const techniquesDir = join(dir, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const path of walk(techniquesDir)) {
      if (!path.endsWith('.md') || path.endsWith('README.md')) continue;
      if (seen.has(path)) continue;
      seen.add(path);
      const body = readFileSync(path, 'utf-8');
      if (!/^## Protocol\s*$/m.test(body)) continue;
      scanned++;
      const { headings, bare, firstBareLine } = protocolShape(body);
      if (bare === 0) continue;
      const rel = relative(root, path);
      findings.push({
        check: headings > 0 ? 'protocol-shape-mixed' : 'protocol-phase-unnamed',
        site: `${rel}:${firstBareLine ?? 1}`,
        detail: headings > 0
          ? `indexes ${headings} phase${headings === 1 ? '' : 's'} in a heading and leaves `
            + `${bare} numbered item${bare === 1 ? '' : 's'} outside any of them, which reads as though `
            + 'only some of its phases were worth naming. Give each phase a `### N. Title` of its own'
          : `writes its protocol as ${bare} numbered item${bare === 1 ? '' : 's'} under \`## Protocol\` `
            + 'with no phase headings, so no phase can be cited or linked to. Group the steps into '
            + 'phases and name each one in a `### N. Title` heading',
      });
    }
  }
  assertScanned(scanned, 'technique files carrying a Protocol', root);
  return findings;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('protocol-shape', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every protocol phase is named in a heading of its own',
    remedy: 'group the steps into phases and give each a `### N. Title` heading, so it can be cited',
  });
}
