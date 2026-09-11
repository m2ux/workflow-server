import { type Dirent, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { logWarn } from '../logging.js';
import { parseDefinition } from '../utils/serialization.js';

/**
 * Where the workflows in a corpus live.
 *
 * A workflow is a directory holding a `workflow.yaml`, at any depth beneath the corpus root. The
 * directory's name is the workflow's id — the name every reference uses, so an id stays stable
 * however the tree around it is arranged. Grouping folders carry no definition of their own and
 * exist purely to organise: `security/audits/prism/workflow.yaml` is the workflow `prism`.
 *
 * The walk never descends into three reserved directory names — `activities`, `resources` and
 * `techniques` — at any depth. Those hold a workflow's own files, in volume and several levels
 * deep, and never hold a workflow, so skipping them keeps the walk proportional to the shape of the
 * corpus rather than to everything in it. It also stops at a directory that has a definition, so a
 * workflow owns everything beneath it and no workflow contains another.
 *
 * Named roots that are not the product grouping — `ledgers`, `walks`, `specimens`, `docs` — are
 * skipped the same way, at any depth. Product definitions live under `corpus/` or as a still-flat
 * tree of workflow directories. `specimens` is a grouping under `corpus/`; a specimen workflow is
 * reached by pointing the walk at `corpus/specimens/`.
 *
 * The directory name and the `id` the definition declares are one identity. A directory whose file
 * names something else does not resolve, under either name, and `list_workflows` reports the pair.
 * Two directories of the same name are the same class of failure. Identity is applied when an id
 * is resolved, so the walk itself is the directory reads of discovery and does not parse a
 * definition to answer "where does this id live".
 *
 * Each resolution walks the corpus unless the caller already holds an index. Stopping at every
 * workflow keeps the walk to roughly the directory reads a single definition load already performs,
 * and it makes the answer the corpus on disk right now — a definition added, moved or checked out
 * at another commit under a running server resolves on the next call, with no cache to invalidate.
 * A caller resolving many ids at once walks once with `indexCorpus` and passes the result.
 */

/** Directory names holding a workflow's own files, which the walk never enters and never searches. */
const RESERVED_DIR_NAMES = new Set(['activities', 'resources', 'techniques']);

/**
 * Kind names the walk never enters. `ledgers`, `walks` and `docs` sit beside `corpus/` at the
 * branch root; `specimens` is a grouping under `corpus/`. The skip is by name at every depth, so
 * a walk of the branch root or of `corpus/` does not list a specimen. A still-flat tree has none
 * of these names, so every workflow directory at the root is still a member of the product list.
 */
const NON_PRODUCT_ROOTS = new Set(['ledgers', 'walks', 'specimens', 'docs']);

/** Definition file extensions, in resolution priority. */
const DEFINITION_EXTENSIONS = ['yaml', 'yml'] as const;

const DEFINITION_FILENAMES = new Set(DEFINITION_EXTENSIONS.map((ext) => `workflow.${ext}`));

/**
 * The workflow a corpus-relative path belongs to.
 *
 * The directory that holds the construct — `activities`, `resources`, `techniques`, or the
 * definition file — is the workflow. Grouping folders above that directory organise the corpus
 * and name nothing, so `security/audits/prism/techniques/plan.md` is `prism`.
 */
export function workflowIdFromCorpusPath(rel: string): string | null {
  const parts = rel.split(/[/\\]/).filter((part) => part.length > 0 && part !== '.');
  const at = parts.findIndex((part) => RESERVED_DIR_NAMES.has(part) || DEFINITION_FILENAMES.has(part));
  if (at <= 0) return null;
  return parts[at - 1]!;
}

/** A workflow's home: the directory that holds it, and its definition file. */
export interface WorkflowLocation {
  id: string;
  /** The directory holding the definition — the root of `activities/`, `resources/`, `techniques/`. */
  dir: string;
  /** The definition file itself. */
  manifest: string;
}

/** A directory whose definition declares an id other than the directory's name. */
export interface IdentityMismatch {
  /** The directory name — the id every reference would use. */
  directory: string;
  /** The `id` the definition declares. */
  declared: string;
  dir: string;
  manifest: string;
}

export interface CorpusIndex {
  /** Workflow id → location, ordered by id. An id two directories claim is absent; see `ambiguous`.
   *  A directory whose definition declares another name is present here and refused at resolve. */
  workflows: ReadonlyMap<string, WorkflowLocation>;
  /** Ids claimed by more than one directory, with every directory claiming them. */
  ambiguous: ReadonlyArray<{ id: string; dirs: string[] }>;
}

/** A corpus walk, or the root to walk. Lookups accept either so a request walks once. */
export type CorpusSource = CorpusIndex | string;

/** Whether a value is an index this module produced, rather than a root still to walk. */
function isCorpusIndex(value: unknown): value is CorpusIndex {
  return (
    typeof value === 'object'
    && value !== null
    && (value as CorpusIndex).workflows instanceof Map
    && Array.isArray((value as CorpusIndex).ambiguous)
  );
}

/** The index for a source: identity when the caller already walked, a walk when they passed a root. */
export function asIndex(source: CorpusSource): CorpusIndex {
  if (typeof source === 'string') return indexCorpus(source);
  if (isCorpusIndex(source)) return source;
  throw new TypeError('asIndex expects a corpus root or a CorpusIndex');
}

/** The definition file directly inside a directory, or null where the directory holds none. */
function definitionIn(dir: string): string | null {
  for (const ext of DEFINITION_EXTENSIONS) {
    const candidate = join(dir, `workflow.${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** The `id` a definition declares, or undefined where the file is unreadable or names no string id. */
function declaredId(manifest: string): string | undefined {
  try {
    const raw = parseDefinition(readFileSync(manifest, 'utf-8'));
    if (raw && typeof raw === 'object' && typeof (raw as { id?: unknown }).id === 'string') {
      return (raw as { id: string }).id;
    }
  } catch {
    // Unreadable or unparsable: list_workflows reports the read failure. Identity is checked
    // when a declaration exists.
  }
  return undefined;
}

/**
 * Walk a corpus root and collect every workflow directory beneath it.
 *
 * Two directories of the same name at different points in the tree claim one id. Neither resolves:
 * either choice would be arbitrary, and a workflow reached by an id that means two things is worse
 * than one that fails to load. The ambiguity is reported instead, and `list_workflows` surfaces it.
 *
 * A directory whose definition declares a different id is the same class of failure: references
 * reach it by the directory and `list_workflows` publishes the declaration, so the two names have
 * to be one. The walk still records the directory; `workflowLocation` refuses both names, and
 * `identityMismatches` is what the listing and the identity guard read.
 */
export function indexCorpus(root: string): CorpusIndex {
  const claims = new Map<string, WorkflowLocation[]>();

  const visit = (dir: string): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      logWarn('Unreadable corpus directory', { dir, error: error instanceof Error ? error.message : String(error) });
      return;
    }
    for (const entry of entries) {
      // `isDirectory()` is false for a symlink, so the walk cannot cycle through one.
      if (
        !entry.isDirectory()
        || entry.name.startsWith('.')
        || RESERVED_DIR_NAMES.has(entry.name)
        || NON_PRODUCT_ROOTS.has(entry.name)
      ) continue;
      const path = join(dir, entry.name);
      const manifest = definitionIn(path);
      if (manifest) {
        const claimed = claims.get(entry.name);
        if (claimed) claimed.push({ id: entry.name, dir: path, manifest });
        else claims.set(entry.name, [{ id: entry.name, dir: path, manifest }]);
        continue;
      }
      visit(path);
    }
  };
  visit(root);

  const workflows = new Map<string, WorkflowLocation>();
  const ambiguous: Array<{ id: string; dirs: string[] }> = [];
  for (const id of [...claims.keys()].sort()) {
    const locations = claims.get(id)!;
    if (locations.length !== 1) {
      ambiguous.push({ id, dirs: locations.map((l) => l.dir).sort() });
      continue;
    }
    workflows.set(id, locations[0]!);
  }
  return { workflows, ambiguous };
}

/** Identity of one location, cached on the object so a shared index parses each file once. */
type LocationIdentity = { ok: true } | { ok: false; declared: string };
const identityByLocation = new WeakMap<WorkflowLocation, LocationIdentity>();

function identityOf(location: WorkflowLocation): LocationIdentity {
  const cached = identityByLocation.get(location);
  if (cached) return cached;
  const declared = declaredId(location.manifest);
  const identity: LocationIdentity = (declared === undefined || declared === location.id)
    ? { ok: true }
    : { ok: false, declared };
  identityByLocation.set(location, identity);
  return identity;
}

function locationIfMatching(location: WorkflowLocation): WorkflowLocation | null {
  return identityOf(location).ok ? location : null;
}

/**
 * Directories whose definition declares an id other than the directory name. Parsed on demand,
 * once per location on a shared index — listing and the identity guard are the callers, not
 * every id lookup.
 */
export function identityMismatches(source: CorpusSource): IdentityMismatch[] {
  const out: IdentityMismatch[] = [];
  for (const location of asIndex(source).workflows.values()) {
    const identity = identityOf(location);
    if (identity.ok) continue;
    out.push({ directory: location.id, declared: identity.declared, dir: location.dir, manifest: location.manifest });
  }
  return out;
}

/** A workflow's home within a corpus, or null where the corpus holds no such workflow. */
export function workflowLocation(source: CorpusSource, workflowId: string): WorkflowLocation | null {
  const location = asIndex(source).workflows.get(workflowId) ?? null;
  return location ? locationIfMatching(location) : null;
}

/** A directory a workflow owns, or null where the corpus holds no such workflow. */
export function workflowSubdir(source: CorpusSource, workflowId: string, name: string): string | null {
  const location = workflowLocation(source, workflowId);
  return location ? join(location.dir, name) : null;
}

/**
 * The workflow whose directory holds a path, or null for a path under no workflow. Unambiguous
 * because the walk stops at a definition: no workflow contains another.
 */
export function workflowOwning(source: CorpusSource, path: string): WorkflowLocation | null {
  for (const location of asIndex(source).workflows.values()) {
    if (path === location.dir || path.startsWith(location.dir + sep)) return locationIfMatching(location);
  }
  return null;
}
