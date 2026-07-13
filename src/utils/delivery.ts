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
 * Content keys are namespaced by delivery channel so the two composition
 * paths never cross-reference each other's payloads:
 *   - `bundle:<technique-ref>`      — one composed technique inside the
 *     `get_activity` techniques bundle
 *   - `bundle:rules:<hash>`         — the `get_activity` rules bundle,
 *     content-keyed (set semantics: any rule set delivered earlier collapses)
 *   - `activity_rules:<hash>`       — the inherited worker rules block
 *   - `technique:<id>`              — a full `get_technique` composed payload
 *   - `technique:<block>:<hash>`    — one shared block of a composed technique
 *     (`inherited_inputs` / `inherited_outputs` / `rules`), content-keyed so a
 *     not-yet-seen technique whose contract/rules were already delivered by a
 *     sibling technique collapses those blocks to markers while its own core
 *     stays full
 *   - `workflow_bundle:<hash>`      — the `get_workflow` orchestrator ops
 *     bundle, content-keyed, collapsed on a persistent-mode resume
 *
 * The `<hash>`-suffixed keys are content-keyed: the key IS the content hash, so
 * a changed payload simply has a different key and delivers in full — no
 * staleness, no invalidation logic. This matches the block dedup's need to stay
 * correct under provenance annotation (an annotated block hashes differently and
 * correctly delivers full).
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
 * The shared blocks of a projected technique eligible for block-level dedup.
 * These are the discrete top-level keys `projectTechnique` emits for the
 * workflow-contract-inherited inputs/outputs and the merged rules — the parts
 * that are identical across most techniques of a workflow. This constant names
 * `projectTechnique`'s own key strings, so a rename of those keys must update
 * this list too.
 */
export const DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'rules'] as const;

/**
 * Replace dedup-eligible blocks of a PROJECTED technique record with
 * unchanged-markers when their per-block content hash is already delivered to
 * this session+agent. Returns a shallow copy with eligible blocks substituted;
 * the input record is not mutated.
 *
 * This is a delivery-time transform that runs AFTER `projectTechnique` (and thus
 * after composition, validation, and provenance decoration), so neither the
 * schema nor `projectTechnique`'s typed input ever sees a marker, and an
 * annotated block variant hashes differently and correctly delivers in full.
 * Each block is hashed over the same single-key projection the reader hashes
 * (`{ [block]: value }`), so block hashes match across techniques that share a
 * contract. Newly-delivered block hashes are accumulated into `newDeliveries`
 * for the caller to commit via `recordDeliveries`; a block already staged in
 * `newDeliveries` within the same call also collapses (idempotence).
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
