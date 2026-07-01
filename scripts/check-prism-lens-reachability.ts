/**
 * check-prism-lens-reachability — deterministic guard for prism lens coverage.
 *
 * The prism catalog is large (60+ lens resources) and the machinery that dispatches it is small.
 * The failure this guards against: a lens resource exists on disk but no mode can reach it (an
 * orphan), or a lens named in the selection logic doesn't resolve to a file / carries a stale name
 * (the `optim`/`rec`/`ident` class of drift left by a rename). Both make the catalog advertise
 * breadth the workflow cannot deliver.
 *
 * Two hard-zero checks (no baseline — every violation must be fixed):
 *
 *   coverage       Every lens resource under prism/resources/ is either routable (its slug is named
 *                  as a `slug (NN)` goal target in plan-analysis's goal-mapping-matrix or in the
 *                  portfolio-analysis lens catalog) OR explicitly tagged pipeline-internal (runs only
 *                  inside a pipeline / is a template). A lens that is neither is an orphan.
 *
 *   name-fidelity  Every `slug (NN)` pair named in the portfolio-analysis lens catalog resolves to an
 *                  existing resource file, and its index agrees with the resources/README index table
 *                  (so a lens is never referred to by a stale name or a wrong index).
 *
 * Run:
 *   npx tsx scripts/check-prism-lens-reachability.ts
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const PRISM = join(DIR, '..', 'workflows', 'prism');
const RESOURCES = join(PRISM, 'resources');
const PLAN = join(PRISM, 'techniques', 'plan-analysis.md');
const PORTFOLIO = join(PRISM, 'techniques', 'portfolio-analysis.md');

/**
 * Lenses that are correctly unreachable from a goal because they run only as an inner pass of a
 * pipeline (their driver forwards them the prior pass's output) or are a document template, not a
 * lens. These need no goal route.
 */
const PIPELINE_INTERNAL = new Set([
  'l12-complement-adversarial', // full-prism pass 2 (adversarial)
  'l12-synthesis', // full-prism pass 3 (synthesis)
  'behavioral-synthesis', // behavioral pipeline synthesis pass
  'dispute-synthesis', // dispute-mode synthesis pass
  'subsystem-calibration', // subsystem-mode per-region calibration prompt
  'subsystem-synthesis', // subsystem-mode cross-region synthesis pass
  'writer-critique', // writer pipeline pass 2 (cross-workflow-only chain)
  'writer-synthesis', // writer pipeline pass 3 (cross-workflow-only chain)
  'final-output-template', // REPORT.md skeleton — a template, not a lens
]);

export interface LensReachabilityViolation {
  check: string;
  site: string;
  detail: string;
}

/** Parse the resources/README index table into an index → slug map (the authoritative catalog). */
function indexToSlug(readme: string): Map<string, string> {
  const map = new Map<string, string>();
  const rowRe = /\|\s*`(\d+)`\s*\|\s*\[[^\]]*\]\(([a-z0-9-]+)\.md\)/gi;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(readme)) !== null) map.set(m[1], m[2].toLowerCase());
  return map;
}

/** Extract every `slug (NN)` pair (single 2-digit index, not a range) from a technique file. */
function slugIndexPairs(text: string): Array<{ slug: string; index: string }> {
  const out: Array<{ slug: string; index: string }> = [];
  const re = /([a-z0-9][a-z0-9-]*) \((\d{2})\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push({ slug: m[1].toLowerCase(), index: m[2] });
  return out;
}

export function collectLensReachabilityViolations(): LensReachabilityViolation[] {
  const out: LensReachabilityViolation[] = [];

  const lensSlugs = readdirSync(RESOURCES)
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    .map((f) => f.slice(0, -3).toLowerCase())
    .sort();

  const planText = readFileSync(PLAN, 'utf-8');
  const portfolioText = readFileSync(PORTFOLIO, 'utf-8');
  const routingText = (planText + '\n' + portfolioText).toLowerCase();
  const catalog = indexToSlug(readFileSync(join(RESOURCES, 'README.md'), 'utf-8'));

  // coverage — every lens file is routable or explicitly pipeline-internal.
  for (const slug of lensSlugs) {
    if (PIPELINE_INTERNAL.has(slug)) continue;
    // A routable lens is named as a goal target: the literal token `slug (` (e.g. `reachability (`).
    if (routingText.includes(`${slug} (`)) continue;
    out.push({
      check: 'coverage',
      site: `prism/resources/${slug}.md`,
      detail: `lens has no goal route (no \`${slug} (NN)\` target in plan-analysis goal-mapping-matrix or portfolio catalog) and is not tagged pipeline-internal — it is unreachable through any prism mode`,
    });
  }

  // name-fidelity — every `slug (NN)` named in the selection logic (the goal-mapping matrix and the
  // portfolio catalog) resolves to a file whose index agrees with the resources/README catalog. This
  // catches the stale-name class of drift (`optim`/`rec`/`ident`) a rename leaves behind.
  const sources: Array<{ site: string; text: string }> = [
    { site: 'prism/techniques/plan-analysis.md', text: planText },
    { site: 'prism/techniques/portfolio-analysis.md', text: portfolioText },
  ];
  const seen = new Set<string>();
  for (const { site, text } of sources) {
    for (const { slug, index } of slugIndexPairs(text)) {
      const key = `${site}#${slug}#${index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!lensSlugs.includes(slug)) {
        out.push({
          check: 'name-fidelity',
          site,
          detail: `lens \`${slug} (${index})\` names no resource file prism/resources/${slug}.md (stale name or typo)`,
        });
        continue;
      }
      const mapped = catalog.get(index);
      if (mapped && mapped !== slug) {
        out.push({
          check: 'name-fidelity',
          site,
          detail: `lens \`${slug} (${index})\` disagrees with the resources/README catalog, where index ${index} is \`${mapped}\``,
        });
      }
    }
  }

  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectLensReachabilityViolations();
  if (violations.length) {
    process.stdout.write(`prism lens reachability: ${violations.length} violation(s) — every lens must be goal-routable or pipeline-internal, and every named lens must resolve:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) {
      process.stdout.write(`  [${v.check}] ${v.site} — ${v.detail}\n`);
    }
    process.exit(1);
  }
  process.stdout.write('prism lens reachability: OK — every lens is goal-routable or pipeline-internal, and every named lens resolves\n');
}
