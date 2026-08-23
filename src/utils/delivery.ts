import { createHash } from 'node:crypto';
import type { SessionFile } from '../schema/session.schema.js';
import { stringifyForResponse } from './serialization.js';

/**
 * Reference-not-repeat delivery.
 *
 * The session file carries a delivery ledger (`deliveredContent`): per
 * delivery scope (see `deliveryScope`), a map of content key → hash of the
 * payload last delivered in full. When reference delivery is active (session
 * `contextMode: 'persistent'` or a per-call opt-in), a payload whose hash
 * matches the ledger is replaced by a short `{ delivery: 'unchanged',
 * content_hash }` marker — the receiving context already holds the bytes.
 * This is the one canonical unchanged-marker shape, emitted identically by
 * the `get_activity` bundle path, `get_technique`, and `get_resource`.
 *
 * Content keys are namespaced by delivery channel so the composition paths
 * never cross-reference each other's payloads:
 *   - `bundle:<technique-ref>`   — one composed technique in the `get_activity` bundle
 *   - `bundle:rules:<hash>`      — the `get_activity` rules bundle
 *   - `activity_rules:<hash>`    — the inherited worker rules block
 *   - `technique:<id>`           — a full composed technique payload, where `<id>`
 *     is the operation's canonical identity (`canonicalTechniqueId`) rather than
 *     the spelling a caller used. A folded callee and a step-bound delivery of
 *     one operation therefore share this key and one body arrives.
 *   - `technique:<block>:<hash>` — one shared block (`inherited_inputs` /
 *     `inherited_outputs` / `inherited_rules` / `rules`) of a composed technique
 *   - `technique:provenance_note:<hash>` — the step-bound provenance preamble
 *   - `technique:inherited_inputs.note:<hash>` / `…items:<hash>` (and the same
 *     for `inherited_outputs` and `inherited_rules`) — invariant note vs items
 *     of an inherited block. Splitting them is what lets one contract's rules
 *     collapse across a closure whose members each inherit them: the items are
 *     the same bytes for every member of one container, and only the call-scoped
 *     note differs.
 *   - `call_site:<hash>`         — the annotations of one folded call site, keyed
 *     apart from the callee body so a body shared by two call sites still
 *     collapses while each site keeps its own annotations
 *   - `workflow_bundle:<hash>`   — the `get_workflow` orchestrator ops bundle
 *   - `resource:<resource_id>`   — a full `get_resource` payload (exact caller
 *     `resource_id`, including any `#section` anchor)
 *
 * `<hash>`-suffixed keys are content-keyed — the key IS the content hash, so a
 * changed payload gets a different key and delivers in full; no invalidation logic.
 *
 * Full content is always recoverable: `get_activity { bundle: 'full' }`,
 * `get_technique { full: true }`, `get_resource { full: true }`.
 *
 * A response-local marker points at an earlier entry of the same response and needs no ledger; see
 * docs/resource-resolution-model.md § Reference Delivery.
 */

/** Hash used for delivery-ledger comparison: sha256, truncated for payload brevity. */
export function contentHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Which context's deliveries a call reads and writes.
 *
 * One session serves many agent contexts: a dispatched worker authenticates against the
 * ORCHESTRATOR's `session_index`, and several workers can hold that same index at once. The scope is
 * therefore the per-call `agent_id` — the identity of the context a payload is delivered TO — and
 * never the session, whose ledger all of those workers would share. Sharing it fails in one specific
 * way: worker B receives an unchanged-marker for content only worker A holds, and a marker is
 * unreadable to a context that never received the bytes.
 *
 * The orchestrator mints an id per dispatch and reuses it verbatim for as long as that worker lives —
 * resuming it after a gate, and advancing it to the next activity of its batch. So a fresh spawn reads
 * an empty ledger and takes full delivery, while that same context reads its own prior deliveries and
 * collapses them to markers. Omitted, the scope is the session's own agent id, which is the whole walk
 * on a solo session.
 */
export function deliveryScope(state: SessionFile, agentId?: string): string {
  return agentId ?? state.agentId;
}

/** Ledger lookup: hash recorded for `key` under `scope` (default: this session's agent), if any. */
export function deliveredHash(state: SessionFile, key: string, scope: string = state.agentId): string | undefined {
  return state.deliveredContent?.[scope]?.[key];
}

/**
 * Record delivered-content hashes onto a session draft (call inside an
 * `advanceSession` mutator). Entries merge over that scope's existing ledger.
 */
export function recordDeliveries(draft: SessionFile, scope: string, entries: Record<string, string>): void {
  if (Object.keys(entries).length === 0) return;
  const ledger = draft.deliveredContent ?? {};
  ledger[scope] = { ...(ledger[scope] ?? {}), ...entries };
  draft.deliveredContent = ledger;
}

/**
 * Marker substituted for content already delivered to this context. The one
 * canonical unchanged-marker shape — the `get_activity` bundle path and
 * `get_technique` both emit exactly this.
 */
export function unchangedMarker(hash: string): { delivery: 'unchanged'; content_hash: string } {
  return { delivery: 'unchanged', content_hash: hash };
}

/**
 * Projected-technique keys eligible for whole-block dedup — the contract-inherited
 * blocks and the step-bound provenance preamble shared across a workflow's techniques.
 * These mirror `projectTechnique`'s key strings, so renaming those keys must update this list.
 * Inherited `note` / `items` are also hashed separately (see `dedupTechniqueBlocks`).
 */
export const DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'inherited_rules', 'rules', 'provenance_note'] as const;

/** Inherited blocks whose `note` is content-keyed separately from `items`. */
const INHERITED_SPLIT_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'inherited_rules'] as const;

/**
 * Content-key a field: collapse to an unchanged-marker when already delivered,
 * otherwise stage the hash. When `assignFull` is true, also write the full value
 * on first delivery (top-level blocks); nested note/items keep the spread value.
 * `ledgerLookup` false restricts the comparison to this response's own entries.
 */
function stageField(
  out: Record<string, unknown>,
  field: string,
  value: unknown,
  state: SessionFile,
  newDeliveries: Record<string, string>,
  scope: string,
  keyPrefix: string,
  assignFull = false,
  ledgerLookup = true,
): void {
  const hash = contentHash(stringifyForResponse({ [field]: value }));
  const key = `${keyPrefix}:${hash}`;
  const heldByContext = ledgerLookup && deliveredHash(state, key, scope) === hash;
  if (heldByContext || newDeliveries[key] === hash) {
    out[field] = unchangedMarker(hash);
  } else {
    newDeliveries[key] = hash;
    if (assignFull) out[field] = value;
  }
}

/**
 * Replace already-delivered shared blocks of a projected technique record with
 * unchanged-markers. For `inherited_inputs` / `inherited_outputs`, the invariant
 * `note` and the `items` list are hashed separately so a shared preamble collapses
 * across techniques whose own-input sets differ. `provenance_note` and `rules` are
 * whole-value candidates. Returns a shallow copy (input not mutated); newly-delivered
 * hashes are staged into `newDeliveries` for the caller to commit.
 *
 * @param projected   `projectTechnique` output.
 * @param state       session, for the delivery-ledger lookup.
 * @param newDeliveries accumulator of block-hashes to record.
 * @param scope       delivery scope to look up (default: the session's agent).
 * @param ledgerLookup whether the caller's context retains what it was sent. False keeps the pass
 *   response-local — a block collapses only against an earlier entry of the same response.
 */
export function dedupTechniqueBlocks(
  projected: Record<string, unknown>,
  state: SessionFile,
  newDeliveries: Record<string, string>,
  scope: string = state.agentId,
  ledgerLookup = true,
): Record<string, unknown> {
  const out = { ...projected };

  if (out['provenance_note'] !== undefined) {
    stageField(out, 'provenance_note', out['provenance_note'], state, newDeliveries, scope, 'technique:provenance_note', true, ledgerLookup);
  }

  for (const block of INHERITED_SPLIT_BLOCKS) {
    const value = out[block];
    if (value === undefined) continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const rec = value as Record<string, unknown>;
      const next: Record<string, unknown> = { ...rec };
      if (rec['note'] !== undefined) {
        stageField(next, 'note', rec['note'], state, newDeliveries, scope, `technique:${block}.note`, false, ledgerLookup);
      }
      if (rec['items'] !== undefined) {
        stageField(next, 'items', rec['items'], state, newDeliveries, scope, `technique:${block}.items`, false, ledgerLookup);
      }
      // Whole-block key still recorded when both halves are full (first delivery), so a
      // reader that only understands whole-block markers keeps working.
      const wholeHash = contentHash(stringifyForResponse({ [block]: value }));
      const wholeKey = `technique:${block}:${wholeHash}`;
      const wholeHeld = ledgerLookup && deliveredHash(state, wholeKey, scope) === wholeHash;
      if (wholeHeld || newDeliveries[wholeKey] === wholeHash) {
        out[block] = unchangedMarker(wholeHash);
      } else {
        newDeliveries[wholeKey] = wholeHash;
        out[block] = next;
      }
    } else {
      stageField(out, block, value, state, newDeliveries, scope, `technique:${block}`, true, ledgerLookup);
    }
  }

  if (out['rules'] !== undefined) {
    stageField(out, 'rules', out['rules'], state, newDeliveries, scope, 'technique:rules', true, ledgerLookup);
  }

  return out;
}
