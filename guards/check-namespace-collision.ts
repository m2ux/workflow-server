/**
 * check-namespace-collision — one directory answers to each directory name in the corpus.
 *
 * A directory offering techniques, resources or routines answers to its own name and to the path
 * from the corpus root that reaches it. The name is what a reference ordinarily carries. Two
 * directories of one name claim that name between them, so it stops telling them apart: `twin::op`
 * names two folders and the corpus declines to choose. A claimant sitting at the corpus root keeps
 * the name anyway, the path that reaches it being the name itself; every deeper one loses it.
 *
 * What remains live is the path spelling, and the guards measure through it — a library nobody can
 * reach by name is still a library whose contents rules apply to. So the collision costs no
 * coverage, and the layout is one the reference grammar supports: two components each carrying a
 * library of one name under different parents. What it costs is the short name, and a corpus that
 * pays that silently pays it without deciding to. This guard states the fact.
 *
 * A workflow pays more. It is started by name and `start_session` has no path spelling, so a
 * workflow whose directory name is claimed twice cannot be run at all, and the finding says so.
 *
 * Run: npx tsx guards/check-namespace-collision.ts [--root <workflows-dir>] [--json]
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const index = indexCorpus(root);
  assertScanned(index.namespaces.size, 'namespaces', root);
  // A finding quotes the path the corpus knows a directory by, which a `corpus/` grouping is above:
  // the enumeration and every citation say `left/twin`, so a site saying `corpus/left/twin` would
  // name a string nothing else in a ledger or a reference carries. Every claimant is in the
  // path-keyed map, each under its own path, which is what makes a name ambiguous in the first place.
  const pathByDir = new Map([...index.namespaces.values()].map((location) => [location.dir, location.path]));
  return index.ambiguous.map((clash) => {
    const paths = clash.dirs.map((dir) => pathByDir.get(dir)!);
    // A bare name falls through to the path of the same spelling, so a claimant sitting at the
    // corpus root keeps the name and only the deeper ones lose it.
    const reach = paths.includes(clash.id)
      ? 'a reference spelling it reaches the one at the corpus root and none of the others'
      : 'a reference spelling it reaches none of them';
    return {
      check: 'namespace-name-claimed-twice',
      site: paths.join(' '),
      detail: `${clash.dirs.length} directories are named '${clash.id}' (${paths.join(', ')}), so the name `
        + `no longer tells them apart: ${reach}. Each is reachable by the path that names it alone, and a `
        + `workflow reached only by a path cannot be started at all — start_session takes a name. Rename `
        + `all but one, or accept the loss of the short name and spell every reference into the others as `
        + `a path.`,
    };
  });
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('namespace-collision', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every directory name in the corpus reaches the one directory that carries it',
    remedy: 'rename all but one of the directories sharing each name',
  });
}
