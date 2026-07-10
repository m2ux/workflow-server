import { createHash } from 'node:crypto';
import type { SessionFile } from '../schema/session.schema.js';

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
 *   - `bundle:<technique-ref>` — one composed technique inside the
 *     `get_activity` techniques bundle
 *   - `bundle:rules`           — the `get_activity` rules bundle
 *   - `activity_rules`         — the inherited worker rules block
 *   - `technique:<id>`         — a full `get_technique` composed payload
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
