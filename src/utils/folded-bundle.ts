/**
 * Folded bodies attached to a door's operations bundle.
 *
 * A technique that names another technique inside its protocol needs that callee's body to execute
 * the call. This assembles those bodies for one door: the closure of everything the door's delivered
 * refs reach, each body once, keyed as the operation it is.
 *
 * **The operations bundle is the channel folded bodies are charged to.** At the orchestrator door
 * that channel carries no budget parameter and cannot drop content, which is what makes retiring the
 * compensating core-operations entries like-for-like: the compensation and its replacement ride one
 * channel, so the replacement cannot fail to arrive where the compensation could not. At the activity
 * door the same channel's serialised size seeds the eager step-technique counter, so a folded body
 * spends budget a step technique would otherwise have — the cost is stated rather than hidden, and
 * `chars` is what it came to.
 *
 * **Bodies key by operation, annotations key by call site.** A body reached from two call sites is
 * one body, so it carries no per-call scope of its own; `folded_call_sites` carries which technique
 * calls which and where, and the block note states the extent those obligations bind over. Putting
 * the scope on the body instead would make a shared body un-shareable.
 */

import type { SessionFile } from '../schema/session.schema.js';
import { projectTechnique } from '../loaders/technique-loader.js';
import { foldedClosureForRefs } from '../loaders/reference-traversal.js';
import { CALL_SCOPED_RULES_POLICY } from './binding-provenance.js';
import { contentHash, dedupTechniqueBlocks, deliveredHash, unchangedMarker } from './delivery.js';
import { stringifyForResponse } from './serialization.js';

/** States what the folded block is and how to read it, once, rather than per body. */
export const FOLDED_NOTE =
  'Bodies of the operations the techniques above call inline, delivered so a named call can be '
  + 'executed rather than improvised. Each body arrives once however many call sites reach it, and is '
  + 'keyed by the operation it is — so an operation already delivered as a bundle member or a step '
  + 'technique is not repeated here. `folded_call_sites` says which technique calls which, and where. '
  + CALL_SCOPED_RULES_POLICY;

/** One folded call site: an edge, keyed apart from the bodies it connects. */
export interface FoldedCallSite {
  readonly caller: string;
  readonly calls: string;
  readonly line: number;
}

export interface FoldedBundle {
  /** The block to merge into the door's bundle payload; undefined when the closure is empty. */
  readonly block: Record<string, unknown> | undefined;
  /** What this attachment adds to the operations bundle, markers included. */
  readonly chars: number;
  /** Ledger entries for the caller to commit. */
  readonly deliveries: Record<string, string>;
  /** One entry per folded body, for the delivery events a door reports. */
  readonly events: ReadonlyArray<{ identity: string; chars: number; delivery: 'full' | 'unchanged' }>;
  /** Call sites whose destination named no loadable body — reported, never silently dropped. */
  readonly unresolved: ReadonlyArray<{ from: string; destination: string; line: number; reason: string }>;
}

const EMPTY: FoldedBundle = { block: undefined, chars: 0, deliveries: {}, events: [], unresolved: [] };

/**
 * Assemble the folded bodies for one door.
 *
 * `mayReferBack` says whether this context retains what it was sent. False keeps the collapse
 * response-local: a body still arrives once per response, but nothing is claimed about earlier calls.
 */
export async function buildFoldedBundle(args: {
  workflowDir: string;
  workflowId: string;
  refs: readonly string[];
  state: SessionFile;
  scope: string;
  mayReferBack: boolean;
}): Promise<FoldedBundle> {
  const { workflowDir, workflowId, refs, state, scope, mayReferBack } = args;
  if (refs.length === 0) return EMPTY;

  const closure = await foldedClosureForRefs({ workflowDir, workflowId, refs });
  if (closure.members.length === 0) return EMPTY;

  const bodies: Record<string, unknown> = {};
  const deliveries: Record<string, string> = {};
  const events: Array<{ identity: string; chars: number; delivery: 'full' | 'unchanged' }> = [];

  for (const member of closure.members) {
    const projected = projectTechnique(member.technique);
    const text = stringifyForResponse(projected);
    const hash = contentHash(text);
    // The same key a step-bound delivery of this operation uses, so the two collapse against
    // each other rather than arriving as two copies of one body.
    const ledgerKey = `technique:${member.identity}`;
    const heldByContext = mayReferBack && deliveredHash(state, ledgerKey, scope) === hash;
    if (heldByContext || deliveries[ledgerKey] === hash) {
      bodies[member.identity] = unchangedMarker(hash);
      events.push({ identity: member.identity, chars: text.length, delivery: 'unchanged' });
      continue;
    }
    deliveries[ledgerKey] = hash;
    bodies[member.identity] = dedupTechniqueBlocks(projected, state, deliveries, scope, mayReferBack);
    events.push({ identity: member.identity, chars: text.length, delivery: 'full' });
  }

  // Every edge of the closure, delivering and revisiting alike: a revisit is a real call site whose
  // callee simply arrived under another edge, so omitting it would hide a call the agent must make.
  const callSites: FoldedCallSite[] = [
    ...closure.members.map((m) => ({ caller: m.reachedFrom, calls: m.identity, line: m.reachedAt })),
    ...closure.revisits.map((r) => ({ caller: r.from, calls: r.identity, line: r.line })),
  ];

  const block: Record<string, unknown> = {
    folded_techniques: bodies,
    folded_call_sites: callSites,
    folded_note: FOLDED_NOTE,
  };
  if (closure.unresolved.length > 0) block['folded_unresolved'] = closure.unresolved;

  return {
    block,
    chars: stringifyForResponse(block).length,
    deliveries,
    events,
    unresolved: closure.unresolved,
  };
}
