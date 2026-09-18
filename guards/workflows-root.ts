/**
 * Resolve the workflows corpus root for the guard scripts.
 *
 * By default the guards validate `.worktrees/workflows` of the primary checkout. Pass
 * `--root <path>` or `--root=<path>`, or set the `WORKFLOWS_DIR` env var, to point them at
 * another dest (a feature corpus worktree, an install clone).
 *
 * Precedence: `--root` flag > `WORKFLOWS_DIR` env var > the built-in default.
 *
 * `resolveWorkflowsRoot` is pure path arithmetic. Guards call `requireWorkflowsRoot`, which also
 * proves the corpus is there: an unreachable or empty root is a measurement failure, not a pass.
 * A guard that walks an absent corpus reports "OK — 0 violations", and green-because-empty reads
 * as coverage the run never had (issue #327 S2). Guards that count what they inspect close the
 * loop with `assertScanned`.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { defaultCorpusDest, REFERENCE_CORPUS_ADD } from '../src/corpus-dest.js';
import { type CorpusIndex, type WorkflowLocation, indexCorpus, namespaceLocation, namespaceOwning, workflowLocation } from '../src/loaders/corpus-index.js';

export { defaultCorpusDest, isPrimaryCheckout, primaryCheckoutRoot, REFERENCE_CORPUS_ADD, REFERENCE_CORPUS_REL } from '../src/corpus-dest.js';

/** A directory a workflow owns, wherever the workflow sits — `null` for an id the corpus lacks. */
export { workflowSubdir, namespaceSubdir } from '../src/loaders/corpus-index.js';

/** Where a resolved root came from, so a failure names the knob that selected it. */
export type RootOrigin = '--root' | 'WORKFLOWS_DIR' | 'default';

export function resolveWorkflowsRoot(defaultDir: string, argv: string[] = process.argv.slice(2)): string {
  return resolveWorkflowsRootWithOrigin(defaultDir, argv).root;
}

export function resolveWorkflowsRootWithOrigin(
  defaultDir: string,
  argv: string[] = process.argv.slice(2),
): { root: string; origin: RootOrigin } {
  const eq = argv.find((a) => a.startsWith('--root='));
  if (eq) return { root: resolve(eq.slice('--root='.length)), origin: '--root' };
  const flag = argv.indexOf('--root');
  if (flag !== -1 && argv[flag + 1]) return { root: resolve(argv[flag + 1]!), origin: '--root' };
  if (process.env.WORKFLOWS_DIR) return { root: resolve(process.env.WORKFLOWS_DIR), origin: 'WORKFLOWS_DIR' };
  return { root: defaultDir, origin: 'default' };
}

/**
 * A workflow in the corpus, as a guard needs it: `id` names it in a finding, `dir` is where its
 * files are read from, and `rel` is its path from the corpus root (grouping folders appear here).
 * Ledger site keys use `citePath`, which names the workflow by the reference that reaches it.
 */
export interface CorpusWorkflow {
  id: string;
  dir: string;
  rel: string;
  /** The definition file itself. */
  manifest: string;
}

/**
 * Every workflow in a corpus, ordered by id. Guards enumerate through this rather than reading the
 * root directly: discovery is the server's rule (a directory holding a `workflow.yaml`, at any
 * depth, outside the reserved `activities`/`resources`/`routines`/`techniques` names), so a workflow
 * the server runs is a workflow the guards measure.
 *
 * This is the enumeration for anything measured about a runnable product — its graph, its
 * activities, its definition. A guard sweeping a library of techniques, resources or routines wants
 * `corpusNamespaces`, which reaches the libraries no workflow declares as well.
 */
export function corpusWorkflows(root: string, index: CorpusIndex = indexCorpus(root)): CorpusWorkflow[] {
  return [...index.workflows.values()]
    .filter((location) => workflowLocation(index, location.id))
    .map(({ id, dir, manifest }) => ({ id, dir, manifest, rel: relative(root, dir) }));
}

/**
 * A namespace in the corpus, as a guard needs it. A workflow is one of these too, and carries its
 * `manifest`; a library that declares no workflow carries none.
 */
export interface CorpusNamespace {
  /** The reference that reaches it: the directory name, and the path where the name is claimed
   *  twice. Findings key on this, and `citePath` writes the same string. */
  ref: string;
  /** The slash-joined path from the corpus root — the reference that names this one and no other. */
  path: string;
  dir: string;
  rel: string;
  /**
   * The definition file, for a directory the corpus can start under its name. Absent for a library
   * that declares no workflow, and for one whose name two directories claim: nothing can enter a
   * graph no name reaches, so a guard grading a graph has nothing here to read.
   */
  manifest?: string;
}

/**
 * Every namespace a reference can reach, ordered by path — the libraries no workflow declares among
 * them.
 *
 * A guard measuring techniques, resources or routines enumerates through this, because a library is
 * addressable whether or not a definition sits beside it, and one the guards cannot see is one whose
 * contents nothing measures. A guard measuring a product's graph or activities keeps to
 * `corpusWorkflows`: an activity belongs to a workflow, so a namespace holding no definition has
 * nothing for it to read.
 *
 * The question asked of each candidate is whether the directory resolves, under either name it
 * answers to — not whether its name does. A library whose name two directories claim stays fully
 * live: every reference into one is a technique, resource or routine reference, and all three take
 * the path spelling, so an activity can bind an operation in either and the server will deliver it.
 * Dropping the pair would leave everything inside both folders unmeasured, and a sweep that reaches
 * nothing reports the same success as one that reached everything. `corpusWorkflows` is right to
 * keep asking about the name: a workflow is started by name and has no second spelling, so one whose
 * name is claimed twice cannot be run at all.
 *
 * A directory the corpus refuses to answer for under any spelling is left out, on the same terms
 * `corpusWorkflows` leaves one out: a definition declaring an id other than its directory's name
 * resolves to nothing by path as by name, and measuring it would hold a corpus to rules about a
 * directory the server declines to serve.
 *
 * A directory reached only by its path is published here as a library, whatever sits beside its
 * techniques. Its operations are borrowable and so are measured; its graph is enterable only by
 * starting it under its name, which is the one thing a claimed name takes away. `manifest` is how a
 * guard tells the two halves apart.
 */
export function corpusNamespaces(root: string, index: CorpusIndex = indexCorpus(root)): CorpusNamespace[] {
  return [...index.namespaces.values()].filter((location) => namespaceLocation(index, location.path)).map((location) => {
    // The definition is carried only where the corpus answers for the workflow it declares, which is
    // the same question `corpusWorkflows` asks. A library carries the field holding null rather than
    // not carrying it, so a reader testing for the field alone would read every library as declaring
    // a definition.
    const startable = workflowLocation(index, location.id) === location;
    const manifest = startable ? (location as WorkflowLocation).manifest : undefined;
    return {
      ref: location.ref,
      path: location.path,
      dir: location.dir,
      rel: relative(root, location.dir),
      ...(manifest === undefined ? {} : { manifest }),
    };
  });
}

function posixRel(from: string, to: string): string {
  return relative(from, to).split(sep).join('/');
}

/**
 * The site key a ledger matches: `<namespace ref>/<path-inside-that-namespace>`.
 *
 * Grouping folders (`corpus/`, `support/`, and any future nest) name nothing in a finding. The same
 * resource cited from a flat tree and from `corpus/<name>/` is one site, so a ledger written against
 * the namespace name keeps matching when the tree is nested.
 *
 * A library is named the same way a workflow is: a reference reaches both by the directory's name,
 * so a finding about a file in either quotes the string a reader would search for. The key falls
 * back to the path exactly where the name does not reach the directory — the same "name, and path
 * only where needed" rule references follow. Two directories of one name would otherwise produce one
 * key for two files, and a triage record accepting a finding in one would silence the same finding
 * in the other.
 *
 * `namespaceRefFromCitePath` reads the ref back off a key, and the two have to agree on which string
 * names a directory: a guard keyed on one spelling while citing the other matches nothing across
 * files.
 */
export function citePath(root: string, file: string, index: CorpusIndex = indexCorpus(root)): string {
  const location = namespaceOwning(index, resolve(file));
  if (!location) return posixRel(root, file);
  const inner = posixRel(location.dir, file);
  if (!inner || inner === '.') return location.ref;
  return `${location.ref}/${inner}`;
}

export class UnreachableCorpusError extends Error {}

/**
 * Resolve the corpus root and prove it holds a corpus. Throws `UnreachableCorpusError` when the
 * root is missing, is not a directory, or contains no workflow — the three states in which every
 * corpus guard would otherwise pass having inspected nothing.
 */
export function requireWorkflowsRoot(defaultDir: string, argv: string[] = process.argv.slice(2)): string {
  const { root, origin } = resolveWorkflowsRootWithOrigin(defaultDir, argv);
  const from = origin === 'default' ? 'the built-in default' : origin;
  if (!existsSync(root)) {
    throw new UnreachableCorpusError(
      `workflows corpus root '${root}' (from ${from}) does not exist. `
      + `In a fresh worktree run 'npm run worktree:provision' to add a workflows worktree.`,
    );
  }
  if (!statSync(root).isDirectory()) {
    throw new UnreachableCorpusError(`workflows corpus root '${root}' (from ${from}) is not a directory.`);
  }
  const index = indexCorpus(root);
  if (index.workflows.size === 0 && index.ambiguous.length === 0) {
    throw new UnreachableCorpusError(
      `workflows corpus root '${root}' (from ${from}) contains no workflow (no directory with a `
      + `workflow.yaml at any depth). An empty workflows checkout makes every corpus guard pass `
      + `vacuously — run '${REFERENCE_CORPUS_ADD}' to populate it.`,
    );
  }
  return root;
}

/**
 * Assert a guard inspected something. `count` is whatever the guard walked (technique files,
 * activities, workflows); zero means the walk found no surface, so an empty finding list is not
 * evidence of a clean corpus.
 */
export function assertScanned(count: number, what: string, root: string): void {
  if (count > 0) return;
  throw new UnreachableCorpusError(
    `no ${what} found under '${root}' — the guard inspected nothing, so a clean result is not a pass.`,
  );
}

/** A triage ledger on the pointed-at corpus tree. */
export function ledgerPath(root: string, file: string): string {
  return join(root, 'ledgers', file);
}

/** A recorded walk artifact on the pointed-at corpus tree. */
export function walkArtifactPath(root: string, file: string): string {
  return join(root, 'walks', file);
}

/** One definition file: its path on disk, and its path from the directory the walk started at. */
export interface DefinitionFile { rel: string; path: string }

const isDefinition = (name: string): boolean => name.endsWith('.yaml') || name.endsWith('.yml');

/**
 * Every definition under a directory, at any depth, in a stable order.
 *
 * A definition sits at any depth: `meta/activities/patterns/` holds a library of activities a client
 * workflow borrows by path rather than ones meta's own graph reaches. A rule about the file in front
 * of it — a gate that parses, a schema that validates, a set action composing its own target — is
 * that file's rule wherever it runs, so this is the walk it takes. `rel` carries the nesting, so a
 * caller citing a file cites one on disk.
 */
export function definitionsUnder(dir: string): DefinitionFile[] {
  const walk = (at: string, prefix: string): DefinitionFile[] => readdirSync(at, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(at, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return walk(path, rel);
      return isDefinition(entry.name) ? [{ rel, path }] : [];
    });
  return walk(dir, '');
}

/**
 * The definitions a workflow's own graph holds: the top level of the directory, and no deeper.
 *
 * A rule that grades a definition AGAINST the workflow around it takes this walk — the seeded
 * variable model, the set of defaults that suppresses a finding, the reachability of an activity
 * from `initialActivity`, the producers a message binding resolves against. A library activity a
 * subdirectory holds runs under whichever workflow borrows it, and takes that workflow's model,
 * graph and producers; graded here it would be graded against a workflow it never runs under.
 *
 * What counts as a definition is what the deep walk counts, so the two agree on every file they
 * both see and differ only in how far they go.
 */
export function ownDefinitionsIn(dir: string): DefinitionFile[] {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => (!entry.isDirectory() && isDefinition(entry.name)
      ? [{ rel: entry.name, path: join(dir, entry.name) }]
      : []));
}
