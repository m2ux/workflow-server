import { createHash } from 'node:crypto';
import type { SessionFile } from '../schema/session.schema.js';
import { stringifyForResponse } from './serialization.js';

/**
 * Reference-not-repeat delivery.
 *
 * The session file carries a delivery ledger (`deliveredContent`): per
 * agentId, a map of content key → hash of the payload last delivered in
 * full. When reference delivery is active (session `contextMode:
 * 'persistent'` or a per-call opt-in), a payload whose hash matches the
 * ledger is replaced by a short `{ delivery: 'unchanged', content_hash }`
 * marker — the receiving context already holds the bytes. This is the one
 * canonical unchanged-marker shape, emitted identically by the `get_activity`
 * bundle path and by `get_technique`. Full content is always recoverable:
 * `get_activity { bundle: 'full' }`, `get_technique { full: true }`.
 *
 * Content keys are namespaced by delivery channel so the composition paths
 * never cross-reference each other's payloads:
 *   - `bundle:<technique-ref>`   — one composed technique in the `get_activity` bundle
 *   - `bundle:rules:<hash>`      — the `get_activity` rules bundle
 *   - `activity_rules:<hash>`    — the inherited worker rules block
 *   - `technique:<id>`           — a full `get_technique` composed payload
 *   - `technique:<block>:<hash>` — one shared block (`inherited_inputs` /
 *     `inherited_outputs` / `rules`) of a composed technique
 *   - `workflow_bundle:<hash>`   — the `get_workflow` orchestrator ops bundle
 *
 * `<hash>`-suffixed keys are content-keyed — the key IS the content hash, so a
 * changed payload gets a different key and delivers in full; no invalidation logic.
 */

/** Hash used for delivery-ledger comparison: sha256, truncated for payload brevity. */
export function contentHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

/** Ledger lookup: hash recorded for `key` under this session's agent, if any. */
export function deliveredHash(state: SessionFile, key: string): string | undefined {
  return state.deliveredContent?.[state.agentId]?.[key];
}

/**
 * Record delivered-content hashes onto a session draft (call inside an
 * `advanceSession` mutator). Entries merge over the agent's existing ledger.
 */
export function recordDeliveries(draft: SessionFile, agentId: string, entries: Record<string, string>): void {
  if (Object.keys(entries).length === 0) return;
  const ledger = draft.deliveredContent ?? {};
  ledger[agentId] = { ...(ledger[agentId] ?? {}), ...entries };
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
 * Projected-technique keys eligible for block-level dedup — the contract-inherited
 * blocks shared across a workflow's techniques. These mirror `projectTechnique`'s
 * key strings, so renaming those keys must update this list.
 */
export const DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'rules'] as const;

/**
 * Replace already-delivered shared blocks of a projected technique record with
 * unchanged-markers, hashing each block over the single-key projection the reader
 * hashes so hashes match across techniques sharing a contract. Returns a shallow
 * copy (input not mutated); newly-delivered hashes are staged into `newDeliveries`
 * for the caller to commit, and a block already staged there collapses too.
 *
 * @param projected   `projectTechnique` output.
 * @param state       session, for the delivery-ledger lookup.
 * @param newDeliveries accumulator of block-hashes to record.
 */
export function dedupTechniqueBlocks(
  projected: Record<string, unknown>,
  state: SessionFile,
  newDeliveries: Record<string, string>,
): Record<string, unknown> {
  const out = { ...projected };
  for (const block of DEDUP_BLOCKS) {
    if (out[block] === undefined) continue;
    const hash = contentHash(stringifyForResponse({ [block]: out[block] }));
    const key = `technique:${block}:${hash}`;
    if (deliveredHash(state, key) === hash || newDeliveries[key] === hash) {
      out[block] = unchangedMarker(hash);
    } else {
      newDeliveries[key] = hash;
    }
  }
  return out;
}
