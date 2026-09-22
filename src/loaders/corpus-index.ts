import { type Dirent, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { logWarn } from '../logging.js';
import { parseDefinition } from '../utils/serialization.js';

/**
 * Where the artifacts in a corpus live.
 *
 * A directory offering artifacts to references is a NAMESPACE. It earns that by holding a
 * `techniques/`, `resources/` or `routines/` directory, or by holding a `workflow.yaml` — and a
 * directory holding a definition is additionally a WORKFLOW, the thing an operator can run. The two
 * are one directory whenever a workflow keeps its own library beside its definition, which is the
 * ordinary case: a workflow needs nothing done to it to be addressable.
 *
 * `activities/` earns nothing. An activity declares exits, and the destinations those exits lead to
 * live in a definition's `graph`, so an activity in a directory holding no definition could never be
 * routed anywhere. Activities belong to workflows; the three library kinds are what a namespace
 * offers.
 *
 * A namespace is named by its directory name, by the slash-joined path from the corpus root that
 * reaches it, and by as much of the end of that path as reaches it alone. The name is what a
 * reference ordinarily carries, so an id stays stable however the tree around it is arranged and a
 * folder can be re-grouped without rewriting what points at it; a path is what a reference carries
 * where a name is claimed twice, or where an author would rather say exactly which one they mean.
 * A path is matched against the end of each namespace's path, so it keeps the same invariance:
 * grouping the whole tree under a further folder rewrites nothing. `support/gitnexus/techniques/analyze.md`
 * answers to `gitnexus` and to `support/gitnexus` alike, and once the tree is grouped under `vendor/`
 * both spellings still reach it beside the whole path `vendor/support/gitnexus`.
 *
 * The walk never descends into the four reserved directory names — `activities`, `resources`,
 * `routines` and `techniques` — at any depth. Those hold a namespace's own files, in volume and
 * several levels deep, and never hold a workflow, so skipping them keeps the walk proportional to the
 * shape of the corpus rather than to everything in it. It also stops at a directory that has a
 * definition, so a workflow owns everything beneath it and no workflow contains another.
 *
 * When the pointed tree holds a `corpus/` grouping — a directory of that name that is not itself a
 * workflow — the walk starts there, and the grouping's siblings are outside the corpus whatever they
 * are called. That is the whole rule: the products are named, rather than the folders that are not
 * products, so a tree that grows another kind of folder needs no list amending and no folder
 * disappears for being named like one. A still-flat tree has no such grouping, so the pointed
 * directory is the walk root and everything under it is searched. Grouping folders organise the tree
 * and name nothing: `support/` in `support/gitnexus/techniques/` holds no library of its own, so no
 * reference ever carries it alone.
 *
 * A workflow directory and the `id` its definition declares are one identity. A directory whose file
 * names something else does not resolve, under either name, and `list_workflows` reports the pair. A
 * namespace declaring nothing is identified by its directory name alone, there being no second name
 * for it to disagree with. Two directories claiming one name are the same class of failure as a
 * mismatch: neither answers to the name, and each stays reachable by its path — which is then the
 * one reference that reaches it, and so the one a finding about it quotes.
 *
 * Each resolution walks the corpus unless the caller already holds an index. Stopping at every
 * workflow keeps the walk to roughly the directory reads a single definition load already performs,
 * and it makes the answer the corpus on disk right now — a definition added, moved or checked out at
 * another commit under a running server resolves on the next call, with no cache to invalidate. A
 * caller resolving many ids at once walks once with `indexCorpus` and passes the result.
 */

/** Directory names holding a namespace's own files, which the walk never enters and never searches. */
const RESERVED_DIR_NAMES = new Set(['activities', 'resources', 'techniques', 'routines']);

/**
 * The library directories whose presence makes a directory a namespace, and the kinds a reference
 * addresses within one. `activities` is absent by the rule above: it is a workflow's own.
 */
export const LIBRARY_DIR_NAMES = ['techniques', 'resources', 'routines'] as const;

/** A library kind, which is also the directory name holding artifacts of that kind. */
export type LibraryKind = typeof LIBRARY_DIR_NAMES[number];

/** The meta workflow: the fallback namespace a bare technique or routine reference resolves in. */
export const META_WORKFLOW_ID = 'meta';

/** The product grouping under a nested corpus tree. Not itself a workflow. */
const PRODUCT_GROUPING = 'corpus';

/** Definition file extensions, in resolution priority. */
const DEFINITION_EXTENSIONS = ['yaml', 'yml'] as const;

const DEFINITION_FILENAMES = new Set(DEFINITION_EXTENSIONS.map((ext) => `workflow.${ext}`));

/** The separator between the segments of a namespace path, on every platform. */
const PATH_SEPARATOR = '/';

/**
 * What a path carries ahead of the construct directory — `activities`, `resources`, `routines`,
 * `techniques`, or the definition file. Null where nothing precedes one, the path naming no
 * construct in a namespace.
 */
function segmentsBeforeConstruct(rel: string): string[] | null {
  const parts = rel.split(/[/\\]/).filter((part) => part.length > 0 && part !== '.');
  const at = parts.findIndex((part) => RESERVED_DIR_NAMES.has(part) || DEFINITION_FILENAMES.has(part));
  return at <= 0 ? null : parts.slice(0, at);
}

/**
 * The namespace a corpus-relative path belongs to, by directory name.
 *
 * The directory that holds the construct is the namespace. Grouping folders above that directory
 * organise the corpus and name nothing, so `security/audits/prism/techniques/plan.md` is `prism`.
 * A caller wanting the string a finding quotes wants `namespaceRefFromCitePath`; this answers which
 * product a file on disk was authored under, which is a question about the tree rather than about a
 * reference into it.
 */
export function workflowIdFromCorpusPath(rel: string): string | null {
  const segments = segmentsBeforeConstruct(rel);
  return segments ? segments[segments.length - 1]! : null;
}

/**
 * The namespace a site key names: everything ahead of the construct directory.
 *
 * A site key is `<namespace ref>/<path inside it>`, which the guards' `citePath` writes and this
 * reads back, so `prism/techniques/plan.md` is `prism` and `left/twin/techniques/op.md` is
 * `left/twin`. The two functions are one grammar: a guard keyed on one spelling while citing the
 * other matches nothing across files, and that silence reads as a value nothing consumes rather
 * than as a lookup that missed.
 */
export function namespaceRefFromCitePath(key: string): string | null {
  const segments = segmentsBeforeConstruct(key);
  return segments ? segments.join(PATH_SEPARATOR) : null;
}

/** A namespace's home: the directory that holds it, under both names it answers to. */
export interface NamespaceLocation {
  /** The directory name — the reference a corpus holding one namespace of this name uses. */
  id: string;
  /** The slash-joined path from the corpus root — the reference that names this one and no other. */
  path: string;
  /**
   * The reference that reaches this directory: its name, and its path where two directories claim
   * that name. A finding quotes this, and a guard keys on it, so both name one directory whatever
   * else the corpus holds.
   */
  ref: string;
  /** The directory itself — the root of `techniques/`, `resources/`, `routines/`. */
  dir: string;
}

/** A workflow's home: a namespace that also declares a definition, and the definition file. */
export interface WorkflowLocation extends NamespaceLocation {
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

/**
 * A reference two directories both answer: a namespace at a path, and a directory of the same path
 * inside a shorter namespace's library folder.
 *
 * `support/gitnexus/techniques/analyze.md` and `support/techniques/gitnexus/analyze.md` are both
 * addressed by `support::gitnexus::analyze`. Neither reading is more right than the other, so the
 * reference resolves to neither and names both.
 */
export interface NamespaceShadow {
  /** The namespace path both readings answer to. */
  ref: string;
  /** The library kind the collision is in. */
  kind: LibraryKind;
  /** The namespace directory reached by reading the whole path as a namespace. */
  namespace: string;
  /** The directory inside the shorter namespace's library folder reached by the other reading. */
  nested: string;
}

export interface CorpusIndex {
  /** Workflow id → location, ordered by id. An id two directories claim is absent; see `ambiguous`.
   *  A directory whose definition declares another name is present here and refused at resolve. */
  workflows: ReadonlyMap<string, WorkflowLocation>;
  /** Namespace path → location, ordered by path. Every workflow is here under its own path. */
  namespaces: ReadonlyMap<string, NamespaceLocation>;
  /** Namespace name → location. A name two directories claim is absent; each stays reachable by path. */
  namespacesByName: ReadonlyMap<string, NamespaceLocation>;
  /** Names claimed by more than one directory, with every directory claiming them. */
  ambiguous: ReadonlyArray<{ id: string; dirs: string[] }>;
  /** Paths a namespace and a shorter namespace's library folder both answer to. */
  shadowed: ReadonlyArray<NamespaceShadow>;
}

/** A corpus walk, or the root to walk. Lookups accept either so a request walks once. */
export type CorpusSource = CorpusIndex | string;

/** Whether a value is an index this module produced, rather than a root still to walk. */
function isCorpusIndex(value: unknown): value is CorpusIndex {
  return (
    typeof value === 'object'
    && value !== null
    && (value as CorpusIndex).workflows instanceof Map
    && (value as CorpusIndex).namespaces instanceof Map
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

/** Whether a directory offers artifacts of any library kind. */
function holdsLibrary(dir: string): boolean {
  return LIBRARY_DIR_NAMES.some((kind) => isDirectory(join(dir, kind)));
}

/** Whether a path names a directory, false for anything else and for anything unreadable. */
function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Where the walk of a pointed tree starts.
 *
 * A `corpus/` directory that holds products and carries no definition of its own is the product
 * root; sibling folders of that grouping are not searched. A still-flat tree, or a workflow whose
 * directory is named `corpus`, has no such grouping, so the pointed directory is the walk root.
 */
function productRoot(root: string): string {
  const grouped = join(root, PRODUCT_GROUPING);
  if (!isDirectory(grouped)) return root;
  if (definitionIn(grouped)) return root;
  return grouped;
}

/** A path relative to the corpus root, slash-joined so a reference reads the same on any platform. */
function corpusPath(base: string, dir: string): string {
  return relative(base, dir).split(sep).join(PATH_SEPARATOR);
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

/** One directory the walk found, before the maps that index it by each name it answers to. */
interface Claim extends NamespaceLocation {
  manifest: string | null;
}

/** A claim as the walk finds it: which of its two names reaches it is known once all are in. */
type WalkedClaim = Omit<Claim, 'ref'>;

/** Whether a claim declares a definition, which is what makes its namespace a workflow. */
function isWorkflowClaim(claim: Claim): claim is Claim & { manifest: string } {
  return claim.manifest !== null;
}

/**
 * Walk a corpus root and collect every namespace beneath it, workflows among them.
 *
 * Two directories of the same name at different points in the tree claim one name. Neither resolves
 * under it: either choice would be arbitrary, and a namespace reached by a name that means two
 * things is worse than one that fails to load. The ambiguity is reported instead, `list_workflows`
 * surfaces it, and each directory stays reachable by its path — which is the name that never
 * collides.
 *
 * A directory whose definition declares a different id is the same class of failure: references
 * reach it by the directory and `list_workflows` publishes the declaration, so the two names have
 * to be one. The walk still records the directory; `workflowLocation` refuses both names, and
 * `identityMismatches` is what the listing and the identity guard read.
 */
export function indexCorpus(root: string): CorpusIndex {
  const base = productRoot(root);
  const walked: WalkedClaim[] = [];

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
      ) continue;
      const path = join(dir, entry.name);
      const manifest = definitionIn(path);
      if (manifest !== null || holdsLibrary(path)) {
        walked.push({ id: entry.name, path: corpusPath(base, path), dir: path, manifest });
      }
      // A workflow owns everything beneath it, so the walk stops where a definition is. A namespace
      // declaring none is an ordinary folder to keep descending through: the library directories it
      // holds are skipped above, and a workflow may still sit beside them.
      if (manifest) continue;
      visit(path);
    }
  };
  visit(base);

  const byName = new Map<string, WalkedClaim[]>();
  for (const claim of walked) {
    const claimed = byName.get(claim.id);
    if (claimed) claimed.push(claim);
    else byName.set(claim.id, [claim]);
  }

  const claims: Claim[] = [];
  const workflows = new Map<string, WorkflowLocation>();
  const namespacesByName = new Map<string, NamespaceLocation>();
  const ambiguous: Array<{ id: string; dirs: string[] }> = [];
  for (const id of [...byName.keys()].sort()) {
    const claimants = byName.get(id)!;
    if (claimants.length !== 1) {
      ambiguous.push({ id, dirs: claimants.map((claim) => claim.dir).sort() });
      // The name no longer tells them apart, so each answers to its path — the reference that names
      // it alone, and the one a finding about it has to quote. For a claimant at the corpus root the
      // two spellings are one string, `namespaceLocation` falling a bare name through to the path.
      for (const claim of claimants) claims.push({ ...claim, ref: claim.path });
      continue;
    }
    const only: Claim = { ...claimants[0]!, ref: id };
    claims.push(only);
    namespacesByName.set(id, only);
    if (isWorkflowClaim(only)) workflows.set(id, only);
  }

  const namespaces = new Map<string, NamespaceLocation>();
  for (const claim of [...claims].sort((a, b) => a.path.localeCompare(b.path))) {
    namespaces.set(claim.path, claim);
  }

  return { workflows, namespaces, namespacesByName, ambiguous, shadowed: detectShadows(claims, namespaces) };
}

/**
 * Paths a namespace and a shorter namespace's library folder both answer to.
 *
 * Read `support::gitnexus::analyze` two ways and it names two files whenever a `support/gitnexus`
 * namespace and a `support/techniques/gitnexus/` directory both exist. Longest-prefix resolution
 * would silently pick one and leave the other unreachable under any spelling, so the collision is
 * found while the corpus is walked and the reference is refused when it is made.
 *
 * A collision is per kind, and both sides have to hold it. A namespace offering only `resources/`
 * beside an ancestor's `techniques/<its name>/` answers a resource reference and a technique
 * reference respectively, and neither reference has two readings — so measuring the ancestor alone
 * would refuse references that name exactly one file.
 */
function detectShadows(claims: readonly Claim[], namespaces: ReadonlyMap<string, NamespaceLocation>): NamespaceShadow[] {
  const shadowed: NamespaceShadow[] = [];
  for (const claim of claims) {
    const segments = claim.path.split(PATH_SEPARATOR);
    if (segments.length < 2) continue;
    for (let take = 1; take < segments.length; take++) {
      const shorter = namespaces.get(segments.slice(0, take).join(PATH_SEPARATOR));
      if (!shorter) continue;
      const remainder = segments.slice(take);
      for (const kind of LIBRARY_DIR_NAMES) {
        if (!isDirectory(join(claim.dir, kind))) continue;
        const nested = join(shorter.dir, kind, ...remainder);
        if (isDirectory(nested)) shadowed.push({ ref: claim.path, kind, namespace: claim.dir, nested });
      }
    }
  }
  return shadowed;
}

/** Identity of one location, cached on the object so a shared index parses each file once. */
type LocationIdentity = { ok: true } | { ok: false; declared: string };
const identityByLocation = new WeakMap<NamespaceLocation, LocationIdentity>();

function identityOf(location: NamespaceLocation): LocationIdentity {
  const cached = identityByLocation.get(location);
  if (cached) return cached;
  // A namespace declaring nothing has one name and cannot disagree with itself.
  const manifest = (location as WorkflowLocation).manifest;
  const declared = manifest === undefined ? undefined : declaredId(manifest);
  const identity: LocationIdentity = (declared === undefined || declared === location.id)
    ? { ok: true }
    : { ok: false, declared };
  identityByLocation.set(location, identity);
  return identity;
}

function locationIfMatching<T extends NamespaceLocation>(location: T): T | null {
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

/**
 * A namespace's home within a corpus, addressed by its name or by its path.
 *
 * A reference carrying no separator is a name, and falls through to the path of the same spelling so
 * a top-level namespace stays reachable when a deeper directory claims its name. A reference
 * carrying one is a path: the whole path from the corpus root where one spells it, else the end of
 * exactly one namespace's path. The trailing match is what keeps a path-spelled reference valid when
 * the tree above the namespace is regrouped, and a run of segments that ends two paths names
 * neither — as a name two directories claim names neither.
 */
export function namespaceLocation(source: CorpusSource, ref: string): NamespaceLocation | null {
  const index = asIndex(source);
  const location = ref.includes(PATH_SEPARATOR)
    ? index.namespaces.get(ref) ?? namespaceByPathEnd(index, ref)
    : index.namespacesByName.get(ref) ?? index.namespaces.get(ref) ?? null;
  return location ? locationIfMatching(location) : null;
}

/** The one namespace whose path ends with the segments a reference carries; null where none or several do. */
function namespaceByPathEnd(index: CorpusIndex, ref: string): NamespaceLocation | null {
  const ending = PATH_SEPARATOR + ref;
  let found: NamespaceLocation | null = null;
  for (const location of index.namespaces.values()) {
    if (!location.path.endsWith(ending)) continue;
    if (found) return null;
    found = location;
  }
  return found;
}

/** A directory a namespace owns, or null where the corpus holds no such namespace. */
export function namespaceSubdir(source: CorpusSource, ref: string, name: string): string | null {
  const location = namespaceLocation(source, ref);
  return location ? join(location.dir, name) : null;
}

/** A directory a workflow owns, or null where the corpus holds no such workflow. */
export function workflowSubdir(source: CorpusSource, workflowId: string, name: string): string | null {
  const location = workflowLocation(source, workflowId);
  return location ? join(location.dir, name) : null;
}

/** What a reference's leading segments named, or why they named nothing usable. */
export type NamespaceSplit =
  | { form: 'namespace'; namespace: NamespaceLocation; rest: string[] }
  | { form: 'shadowed'; ref: string; shadows: NamespaceShadow[] };

/**
 * Split a reference into the namespace its leading segments name and the path left over.
 *
 * The longest leading run that names a namespace wins, so a reference reaching into a nested
 * namespace is read as that namespace rather than as a deep path inside a shallower one. At least
 * one segment is always left over: a reference naming only a namespace addresses no artifact.
 *
 * Returns null where no leading run names a namespace, which is the ordinary case for a reference
 * resolved against the workflow making it.
 */
export function splitNamespaceRef(source: CorpusSource, segments: readonly string[]): NamespaceSplit | null {
  const index = asIndex(source);
  for (let take = segments.length - 1; take >= 1; take--) {
    const ref = segments.slice(0, take).join(PATH_SEPARATOR);
    const location = namespaceLocation(index, ref);
    if (!location) continue;
    const shadows = index.shadowed.filter((shadow) => shadow.ref === location.path);
    if (shadows.length > 0) return { form: 'shadowed', ref, shadows };
    return { form: 'namespace', namespace: location, rest: [...segments.slice(take)] };
  }
  return null;
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

/**
 * The namespace whose directory holds a path, or null for a path under none. A library declares no
 * definition, so the walk does not stop at one and a namespace can sit inside another's directory:
 * the deepest match owns the path, which is the one whose name a reference into it carries.
 */
export function namespaceOwning(source: CorpusSource, path: string): NamespaceLocation | null {
  let owner: NamespaceLocation | null = null;
  for (const location of asIndex(source).namespaces.values()) {
    if (path !== location.dir && !path.startsWith(location.dir + sep)) continue;
    if (!owner || location.dir.length > owner.dir.length) owner = location;
  }
  return owner ? locationIfMatching(owner) : null;
}
