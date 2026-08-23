/**
 * Reference traversal: the closure of technique bodies an inline call site reaches.
 *
 * A technique's protocol may call another technique by markdown link. The bodies those links name
 * are collected here — transitively, deduplicated, each delivered once — so a caller receives what
 * it needs to execute the call rather than a pointer it cannot follow.
 *
 * **Revisit tolerance is categorical, not empirical.** The walk carries a visited set and continues
 * past an edge reaching a body it has already delivered. That is correct independently of what the
 * corpus contains, because delivery is a reachability problem rather than an evaluation problem: no
 * closure member computes a value another member consumes, so a body is complete the first time it
 * arrives and a second arrival adds nothing. A cycle is therefore a shape the walk tolerates, not an
 * error it reports.
 *
 * **Each call site resolves against the file it was authored in.** A composed body carries its
 * ancestors' `Initial`/`Final` protocol blocks, whose relative links point out of the ancestor's own
 * directory rather than the callee's, so the walk reads each technique's own protocol and reaches an
 * ancestor's calls only when that ancestor is itself a closure member. Measured across the corpus at
 * pin `12400e85`: of 76 container files, 0 carry a technique link in an `Initial` or `Final` block
 * and 0 call sites sit there, so the two readings coincide today and this one stays correct if that
 * changes.
 */

import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { Technique } from '../schema/technique.schema.js';
import { extractCallSites, CONTAINER_FILENAME } from '../utils/reference-grammar.js';
import { composeTechniqueWithSource, readTechniqueWithSource, projectTechniqueToYaml } from './technique-loader.js';
import { getWorkflowTechniquesDir } from './markdown-technique-loader.js';

/** Where one technique's file sits: the workflow tree that owns it, and its path within that tree. */
export interface TechniqueLocation {
  readonly workflow: string;
  readonly pathSegments: readonly string[];
}

/**
 * The identity of one operation, independent of the spelling a call site used to reach it.
 *
 * Two call sites naming one file share this string, so the delivery ledger collapses them to one
 * body. It doubles as a loadable reference: the leading segment names the workflow the file lives
 * in, which is the form `composeTechniqueWithSource` resolves against the callee's home tree.
 */
export function techniqueIdentity(location: TechniqueLocation): string {
  return [location.workflow, ...location.pathSegments].join('::');
}

/** The file a location's technique is stored in — flat leaf or group container — else null. */
function fileOf(workflowDir: string, location: TechniqueLocation): string | null {
  if (location.pathSegments.length === 0) return null;
  const dir = getWorkflowTechniquesDir(workflowDir, location.workflow);
  const flat = join(dir, `${location.pathSegments.join('/')}.md`);
  if (existsSync(flat)) return flat;
  const grouped = join(dir, ...location.pathSegments, CONTAINER_FILENAME);
  return existsSync(grouped) ? grouped : null;
}

/** Stem of the container filename, for the path decomposition below. */
const CONTAINER_STEM = CONTAINER_FILENAME.replace(/\.md$/i, '').toLowerCase();

/**
 * Decompose a corpus file path into the workflow owning it and its path within that tree.
 *
 * A group's contract lives in its container file, so the container IS the group: the filename drops
 * out and the folder names the technique. The workflow root index keeps its own stem, being loadable
 * for its contract without being an addressable technique.
 */
function locationOf(workflowDir: string, file: string): TechniqueLocation | null {
  const rel = relative(resolve(workflowDir), resolve(file));
  if (rel === '' || rel.startsWith('..')) return null;
  const parts = rel.split(sep);
  if (parts.length < 3 || parts[1] !== 'techniques') return null;
  const workflow = parts[0]!;
  const within = parts.slice(2);
  const stem = (within[within.length - 1] ?? '').replace(/\.md$/i, '');
  const pathSegments = stem.toLowerCase() === CONTAINER_STEM && within.length > 1
    ? within.slice(0, -1)
    : [...within.slice(0, -1), stem];
  return { workflow, pathSegments };
}

/** Why a call site yielded no body. */
export type ResolutionFailure = 'caller-not-located' | 'no-such-target' | 'outside-corpus' | 'not-loadable';

export type ReferenceResolution =
  | { readonly ok: true; readonly location: TechniqueLocation }
  | { readonly ok: false; readonly reason: ResolutionFailure };

/**
 * Resolve one call-site destination against the caller's own file.
 *
 * The destination is a filesystem-relative markdown path — the loader rewrites resource links at
 * parse time but leaves technique links as authored — so it resolves against the caller's directory
 * and is then decomposed back into a workflow-owned location. A target outside the corpus root is
 * reported separately from one that simply does not exist: the first is a link escaping the tree,
 * which is a defect class of its own.
 */
export function resolveReference(
  workflowDir: string,
  caller: TechniqueLocation,
  destination: string,
): ReferenceResolution {
  const callerFile = fileOf(workflowDir, caller);
  if (!callerFile) return { ok: false, reason: 'caller-not-located' };
  const target = resolve(dirname(callerFile), destination);
  const location = locationOf(workflowDir, target);
  if (!location) return { ok: false, reason: 'outside-corpus' };
  if (!existsSync(target)) return { ok: false, reason: 'no-such-target' };
  return { ok: true, location };
}

/** One delivered body of the closure. */
export interface ClosureMember {
  readonly identity: string;
  readonly location: TechniqueLocation;
  /** The composed body — the callee's own content under the contract that governs it. */
  readonly technique: Technique;
  /** Distance from the root: 1 for a callee the root's own protocol names. */
  readonly depth: number;
  /** Identity of the member whose protocol first reached this one. */
  readonly reachedFrom: string;
}

/** A call site the walk could not turn into a body. */
export interface UnresolvedReference {
  readonly from: string;
  readonly destination: string;
  readonly line: number;
  readonly reason: ResolutionFailure;
}

/** An edge reaching a body already delivered. The walk records it and carries on. */
export interface Revisit {
  readonly from: string;
  readonly identity: string;
  readonly line: number;
  /** True where the member reached is the one whose protocol holds the edge. */
  readonly selfLoop: boolean;
}

/** One body's arrival. Exactly one per delivered member, which is what SC-8 asserts. */
export interface DeliveryEvent {
  readonly identity: string;
  readonly chars: number;
  readonly depth: number;
}

export interface TraversalResult {
  readonly members: ClosureMember[];
  readonly unresolved: UnresolvedReference[];
  readonly revisits: Revisit[];
  readonly events: DeliveryEvent[];
  /** Depth of the deepest member; 0 when the closure is empty. */
  readonly maxDepth: number;
  /** Deepest the pending stack grew — the walk's working-set bound. */
  readonly maxPending: number;
  /** Serialised size of every delivered body, for the charging rule. */
  readonly totalChars: number;
}

/** Render a protocol back to the prose the grammar scans: one line per title and per step bullet. */
export function protocolText(technique: Technique): string {
  const lines: string[] = [];
  for (const block of technique.protocol ?? []) {
    if (block.title !== undefined) lines.push(`### ${block.title}`);
    for (const step of block.steps) lines.push(step);
  }
  return lines.join('\n');
}

/** One pending edge: a call site read out of `from`'s protocol, not yet resolved. */
interface PendingEdge {
  from: string;
  fromLocation: TechniqueLocation;
  destination: string;
  /** Operation named as bare text after a container link, per the `qualified-pair` term. */
  operation: string | undefined;
  line: number;
  depth: number;
}

/**
 * Walk the reference closure of one technique, depth-first, delivering each body once.
 *
 * The root's own body is not a closure member — the caller already holds it — but its identity seeds
 * the visited set, so a callee referring back to the caller is a revisit rather than a second copy.
 * `rootTechnique` is the root's own uncomposed form; pass it when the caller already holds it.
 */
export async function traverseReferences(args: {
  workflowDir: string;
  root: TechniqueLocation;
  rootTechnique?: Technique;
}): Promise<TraversalResult> {
  const { workflowDir, root } = args;
  const rootIdentity = techniqueIdentity(root);

  /** A technique's own protocol, uncomposed — the form whose links resolve against its own file. */
  const ownForm = async (location: TechniqueLocation): Promise<Technique | null> => {
    const read = await readTechniqueWithSource(techniqueIdentity(location), workflowDir, location.workflow);
    return read.success ? read.value.technique : null;
  };

  const members: ClosureMember[] = [];
  const unresolved: UnresolvedReference[] = [];
  const revisits: Revisit[] = [];
  const events: DeliveryEvent[] = [];
  const visited = new Set<string>([rootIdentity]);

  const stack: PendingEdge[] = [];
  let maxPending = 0;

  /** Read one technique's call sites onto the stack, first-written walked first. */
  const enqueue = (from: string, fromLocation: TechniqueLocation, technique: Technique, depth: number): void => {
    const sites = extractCallSites(protocolText(technique));
    for (let i = sites.length - 1; i >= 0; i--) {
      const site = sites[i]!;
      stack.push({ from, fromLocation, destination: site.destination, operation: site.operation, line: site.line, depth });
    }
    maxPending = Math.max(maxPending, stack.length);
  };

  const rootOwn = args.rootTechnique ?? await ownForm(root);
  if (rootOwn) enqueue(rootIdentity, root, rootOwn, 1);

  while (stack.length > 0) {
    const edge = stack.pop()!;
    const fail = (reason: ResolutionFailure): void => {
      unresolved.push({ from: edge.from, destination: edge.destination, line: edge.line, reason });
    };

    const resolved = resolveReference(workflowDir, edge.fromLocation, edge.destination);
    if (!resolved.ok) {
      fail(resolved.reason);
      continue;
    }

    // A qualified pair naming its operation as bare text links only the container, so the target is
    // the operation inside it. The container body is not a closure member of such a site — the pair
    // names one operation, and that is what the caller executes.
    let target = resolved.location;
    if (edge.operation !== undefined) {
      const operation: TechniqueLocation = {
        workflow: target.workflow,
        pathSegments: [...target.pathSegments, edge.operation],
      };
      if (fileOf(workflowDir, operation) === null) {
        fail('no-such-target');
        continue;
      }
      target = operation;
    }

    const identity = techniqueIdentity(target);
    if (visited.has(identity)) {
      revisits.push({ from: edge.from, identity, line: edge.line, selfLoop: identity === edge.from });
      continue;
    }

    const composed = await composeTechniqueWithSource(identity, workflowDir, target.workflow);
    if (!composed.success) {
      fail('not-loadable');
      continue;
    }

    visited.add(identity);
    const technique = composed.value.technique;
    members.push({ identity, location: target, technique, depth: edge.depth, reachedFrom: edge.from });
    events.push({ identity, chars: projectTechniqueToYaml(technique).length, depth: edge.depth });

    const own = await ownForm(target);
    if (own) enqueue(identity, target, own, edge.depth + 1);
  }

  return {
    members,
    unresolved,
    revisits,
    events,
    maxDepth: members.reduce((d, m) => Math.max(d, m.depth), 0),
    maxPending,
    totalChars: events.reduce((n, e) => n + e.chars, 0),
  };
}
