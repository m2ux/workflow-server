/**
 * check-corpus-links — a reference out of a workflow names the workflow, rather than counting
 * directories up to it.
 *
 * A workflow sits at whatever depth the corpus organises it to, and it can move. A link that climbs
 * out of the workflow holding it — `../../meta/techniques/orchestrator-conduct.md` — encodes the
 * distance between two workflows, which is a fact about today's layout rather than about either
 * workflow. Moving either end breaks it, and it breaks silently for a reader who follows the link by
 * hand.
 *
 * The workflow-anchored form carries no distance: `/meta/techniques/orchestrator-conduct.md` names
 * the workflow, and the leading segment resolves to wherever discovery found it. Inside a workflow
 * an ordinary relative link is right and stays right, because a workflow moves as a unit.
 *
 * The same rule catches a link that climbs to the corpus root and comes back into its OWN workflow.
 * That one reads as harmless and is not: its `../..` count is the workflow's depth from the root, so
 * it breaks the moment the workflow is organised into a folder, having never needed to leave.
 *
 * Links that reach out of the corpus entirely — into the server repo's `docs/` or `schemas/` — are a
 * separate problem and are not reported here.
 *
 * This guard runs by path rather than from the registry, which `tests/guard-registry.test.ts`
 * records the reason for: it holds at 522 findings against definitions written before an absolute
 * form existed, and a sweep that is red for work already scheduled teaches everyone to ignore it.
 * Enrolling it is the last step of the corpus rewrite, in the commit that makes it pass.
 *
 * Run: npx tsx scripts/check-corpus-links.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { fencedLines, linkDestinations, toLines } from './markdown-refs.js';
import { resolveLink } from './corpus-links.js';
import { indexCorpus, workflowOwning } from '../src/loaders/corpus-index.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

function* markdownFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* markdownFiles(path);
    else if (entry.endsWith('.md')) yield path;
  }
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const corpus = indexCorpus(root);

  for (const file of markdownFiles(root)) {
    const home = workflowOwning(corpus, file);
    // A file under no workflow — the corpus README — has no workflow to be inside of.
    if (!home) continue;
    scanned++;

    const lines = toLines(readFileSync(file, 'utf-8'));
    const { fenced } = fencedLines(lines);
    for (const [index, line] of lines.entries()) {
      // Illustration rather than instruction: a template body shows link forms it does not follow.
      if (fenced.has(index)) continue;
      for (const destination of linkDestinations(line)) {
        // A template names its file with a placeholder, which resolves to nothing on purpose.
        if (/[{[]/.test(destination)) continue;
        const link = resolveLink(root, file, destination, corpus);
        const site = `${relative(root, file)}:${index + 1}`;

        if (link.form === 'workflow') {
          if (link.path !== null) continue;
          findings.push({
            check: 'unknown-workflow',
            site,
            detail: `'${destination}' names workflow '${link.workflow}', which the corpus does not hold — `
              + 'the leading segment of an absolute link is a workflow id, so name one that exists or '
              + 'point the link somewhere else',
          });
          continue;
        }
        if (link.form === 'external' || link.path === null) continue;

        // What matters is whether the link climbs out of the workflow, not where it lands. One that
        // reaches the corpus root and comes back into its own workflow lands inside it and is still
        // counting the workflow's depth, so it breaks the same way.
        const within = relative(home.dir, dirname(file)).split(sep).filter(Boolean).length;
        const climbs = destination.split('/').findIndex((segment) => segment !== '..');
        if ((climbs === -1 ? destination.split('/').length : climbs) <= within) continue;
        // Out of the corpus altogether — a separate problem, not this guard's.
        if (relative(root, link.path).startsWith('..' + sep)) continue;

        const target = workflowOwning(corpus, link.path);
        const anchored = target
          ? `/${target.id}/${relative(target.dir, link.path).split(sep).join('/')}`
          : null;
        findings.push({
          check: 'traversal-out-of-workflow',
          site,
          detail: target?.id === home.id
            ? `'${destination}' climbs to the corpus root and comes back into '${home.id}' itself — its `
              + `'..' count is this workflow's depth, so organising the workflow into a folder breaks a `
              + `link that never had to leave. Write it as a path inside the workflow, or as `
              + `\`${anchored}\``
            : `'${destination}' counts directories out of '${home.id}' to reach ${target ? `'${target.id}'` : 'another part of the corpus'}, `
              + `which fixes the distance between them at today's layout — name the workflow instead: `
              + `${anchored ? `\`${anchored}\`` : 'an absolute link anchored on the workflow id'}`,
        });
      }
    }
  }

  assertScanned(scanned, 'markdown files inside a workflow', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('corpus-links', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every reference out of a workflow names the workflow rather than counting directories to it',
    remedy: 'rewrite the link as `/<workflow-id>/<path>`, which resolves wherever the workflow sits',
  });
}
