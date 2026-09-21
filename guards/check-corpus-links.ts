/**
 * check-corpus-links — a reference out of a namespace names the namespace, rather than counting
 * directories up to it.
 *
 * A namespace sits at whatever depth the corpus organises it to, and it can move. A link that climbs
 * out of the namespace holding it — `../../meta/techniques/orchestrator-conduct.md` — encodes the
 * distance between two of them, which is a fact about today's layout rather than about either.
 * Moving either end breaks it, and it breaks silently for a reader who follows the link by hand.
 *
 * The anchored form carries no distance: `/meta/techniques/orchestrator-conduct.md` names the
 * namespace, and the leading segment resolves to wherever discovery found it. Inside a namespace an
 * ordinary relative link is right and stays right, because a namespace moves as a unit.
 *
 * A library is a namespace holding no definition, and both halves here read it as one: its own files
 * are scanned, and a link INTO one is offered the anchored form by name. Read as workflows instead,
 * a library's files would go unscanned and a link into one would be told it is wrong without being
 * told what to write.
 *
 * The same rule catches a link that climbs to the corpus root and comes back into its OWN namespace.
 * That one reads as harmless and is not: its `../..` count is the namespace's depth from the root, so
 * it breaks the moment it is organised into a folder, having never needed to leave.
 *
 * The other half is whether a link that names its namespace correctly lands on anything. A namespace
 * that resolves and a file inside it that does not is a reference nothing checks: the anchor guard
 * checks anchors, the pinned-path guard checks TypeScript, and a link from one corpus file to
 * another falls between them. What an agent does with a reference to a file that is not there is
 * undefined, and where the target is an operation the likely outcome is that it improvises the call
 * the library exists to stop anyone improvising.
 *
 * Links that reach out of the corpus entirely — into the server repo's `docs/` or `schemas/` — are a
 * separate problem and are not reported here. So is a dangling RELATIVE link: the corpus holds 116,
 * almost all of them template placeholders naming files a planning folder holds once a run writes
 * them, which is a population to triage rather than a defect to report.
 *
 * It was written against a corpus holding 522 links in the pre-namespace form. That rewrite landed,
 * and the last six — library indexes naming the folder that groups them, which is a folder the
 * corpus states appears in no reference and so has no anchored form — went with #827.
 *
 * Run: npx tsx guards/check-corpus-links.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { fencedLines, linkDestinations, toLines } from './markdown-refs.js';
import { resolveLink } from './corpus-links.js';
import { indexCorpus, namespaceOwning } from '../src/loaders/corpus-index.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The file a link names, with the in-page anchor dropped — `foo.md#section` is a link to `foo.md`. */
function withoutAnchor(path: string): string {
  const hash = path.indexOf('#');
  return hash === -1 ? path : path.slice(0, hash);
}

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
    const home = namespaceOwning(corpus, file);
    // A file under no namespace — the corpus README — has nothing to be inside of. A library is a
    // namespace like any other, and its links climb out of it the same way a workflow's do.
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
          if (link.path === null) {
            findings.push({
              check: 'unknown-workflow',
              site,
              detail: `'${destination}' names workflow '${link.workflow}', which the corpus does not hold — `
                + 'the leading segment of an absolute link is a workflow id, so name one that exists or '
                + 'point the link somewhere else',
            });
            continue;
          }
          // The namespace resolves and the file inside it does not. A technique applying an operation
          // by a link is the one place this is silent and costly: what an agent does with a reference
          // to a file that is not there is undefined, and the likely outcome is that it improvises the
          // call the library exists to stop anyone improvising.
          if (!existsSync(withoutAnchor(link.path))) {
            findings.push({
              check: 'dangling-target',
              site,
              detail: `'${destination}' names '${link.workflow}', which the corpus holds, and no file at `
                + `'${relative(root, withoutAnchor(link.path))}' — a reference to a file that is not there `
                + 'leaves whoever follows it to invent what it would have said',
            });
          }
          continue;
        }
        if (link.form === 'external' || link.path === null) continue;

        // What matters is whether the link climbs out of the namespace, not where it lands. One that
        // reaches the corpus root and comes back into its own namespace lands inside it and is still
        // counting the namespace's depth, so it breaks the same way.
        const within = relative(home.dir, dirname(file)).split(sep).filter(Boolean).length;
        const climbs = destination.split('/').findIndex((segment) => segment !== '..');
        if ((climbs === -1 ? destination.split('/').length : climbs) <= within) continue;
        // Out of the corpus altogether — a separate problem, not this guard's.
        if (relative(root, link.path).startsWith('..' + sep)) continue;

        // Resolved as a namespace, so a link into a library is offered the same anchored form a link
        // into a workflow is. Resolved as a workflow it would land on nothing, and the finding would
        // name the fault without naming the fix.
        const target = namespaceOwning(corpus, link.path);
        const anchored = target
          ? `/${target.id}/${relative(target.dir, link.path).split(sep).join('/')}`
          : null;
        findings.push({
          check: 'traversal-out-of-namespace',
          site,
          detail: target?.id === home.id
            ? `'${destination}' climbs to the corpus root and comes back into '${home.id}' itself — its `
              + `'..' count is this namespace's depth, so organising it into a folder breaks a `
              + `link that never had to leave. Write it as a path inside the namespace, or as `
              + `\`${anchored}\``
            : `'${destination}' counts directories out of '${home.id}' to reach ${target ? `'${target.id}'` : 'another part of the corpus'}, `
              + `which fixes the distance between them at today's layout — name the namespace instead: `
              + `${anchored ? `\`${anchored}\`` : 'an absolute link anchored on the namespace id'}`,
        });
      }
    }
  }

  assertScanned(scanned, 'markdown files inside a namespace', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('corpus-links', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every reference out of a namespace names the namespace rather than counting directories to it',
    remedy: 'rewrite the link as `/<namespace>/<path>`, which resolves wherever the namespace sits',
  });
}
