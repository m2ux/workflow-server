import type { SessionFile } from '../schema/session.schema.js';
import { contentHash, deliveredHash, unchangedMarker } from './delivery.js';
import { stringifyForResponse } from './serialization.js';

/**
 * The activity definition, delivered in parts (#404 W10).
 *
 * A delivery ends with the activity's own definition text, and every other part of the response can
 * arrive as a short marker when the receiving context already holds the bytes: each bundled
 * technique, the inherited rules block, each shared block of a composed technique, each eagerly
 * bundled resource. The definition is keyed the same way, in parts rather than whole, because one
 * part of it has to survive every collapse: a worker confirms that the activity id the server
 * returned matches the one it was dispatched for, and stops without executing a step if they
 * disagree. That check reads the definition.
 *
 * So the identity — every scalar field up to the first collapsible one — is always delivered in full,
 * and the step list, transitions, outcome and synthesised artifact contract are keyed separately.
 * It is the treatment a composed technique already gets, where the invariant note and the item list
 * are keyed apart so a shared preamble collapses even when the rest differs.
 *
 * Keys are content-keyed (`activity:<field>:<hash>`), so a changed section gets a different key and
 * delivers in full with no invalidation logic — the same scheme as `bundle:rules:<hash>`.
 */

/**
 * Definition fields keyed separately from the identity. Each is a whole top-level block of the
 * delivered YAML: `artifacts` is the contract the server synthesises from the steps' declared
 * outputs and appends, and reaches a worker exactly like an authored field.
 */
export const COLLAPSIBLE_BODY_FIELDS: readonly string[] = ['steps', 'transitions', 'outcome', 'artifacts'];

/** A top-level block of the delivered definition: its field name and its text, newline included. */
export interface BodySection {
  field: string;
  text: string;
}

/** The definition split at its top-level fields. */
export interface SplitActivityBody {
  /** Identity and scalars — everything before the first collapsible field. Always delivered whole. */
  identity: string;
  /** The collapsible blocks, in document order. */
  sections: BodySection[];
}

/** A line opening a top-level YAML field, which is where one block ends and the next begins. */
const TOP_LEVEL_FIELD = /^([A-Za-z$][A-Za-z0-9_-]*):/;

/**
 * Split the delivered definition text at its top-level fields. Text before the first collapsible
 * field is the identity; each collapsible field carries its own block through to the next top-level
 * field. A field the server does not key stays in the identity, so an unrecognised definition field
 * is delivered rather than dropped.
 */
export function splitActivityBody(body: string): SplitActivityBody {
  const lines = body.split('\n');
  const identity: string[] = [];
  const sections: BodySection[] = [];
  let current: { field: string; lines: string[] } | undefined;

  for (const line of lines) {
    const opened = TOP_LEVEL_FIELD.exec(line);
    if (opened) {
      const field = opened[1]!;
      if (current) { sections.push({ field: current.field, text: current.lines.join('\n') }); current = undefined; }
      if (COLLAPSIBLE_BODY_FIELDS.includes(field)) {
        current = { field, lines: [line] };
        continue;
      }
      identity.push(line);
      continue;
    }
    // A continuation line belongs to whatever block is open; before the first collapsible field it is
    // part of the identity (a folded description, a comment).
    (current ? current.lines : identity).push(line);
  }
  if (current) sections.push({ field: current.field, text: current.lines.join('\n') });

  return { identity: identity.join('\n'), sections };
}

/** What a delivery of the definition carried, for the caller to report and to record. */
export interface ProjectedActivityBody {
  /** The definition text to send. */
  text: string;
  /** Ledger entries for the sections sent in full, to commit with the rest of the delivery. */
  newDeliveries: Record<string, string>;
  /** Fields that arrived as markers. */
  collapsedFields: string[];
  /** Characters those markers stand for. */
  collapsedChars: number;
}

/**
 * The definition as this delivery sends it: identity in full, and each keyed section either in full
 * or as an unchanged marker where this scope already holds those bytes.
 *
 * `readLedger: false` sends everything in full, which is what a forced full delivery and a freshly
 * spawned worker get — a marker is unreadable to a context that never received the bytes, and unlike
 * a technique's shared blocks a definition section appears once in a response, so there is no earlier
 * copy in the same payload for a marker to point at.
 */
export function projectActivityBody(
  body: string,
  state: SessionFile,
  scope: string,
  opts: { readLedger: boolean },
): ProjectedActivityBody {
  const { identity, sections } = splitActivityBody(body);
  const newDeliveries: Record<string, string> = {};
  const collapsedFields: string[] = [];
  let collapsedChars = 0;

  const parts: string[] = identity.length > 0 ? [identity] : [];
  for (const section of sections) {
    const hash = contentHash(section.text);
    const key = `activity:${section.field}:${hash}`;
    if (opts.readLedger && deliveredHash(state, key, scope) === hash) {
      parts.push(stringifyForResponse({ [section.field]: unchangedMarker(hash) }));
      collapsedFields.push(section.field);
      collapsedChars += section.text.length;
      continue;
    }
    newDeliveries[key] = hash;
    parts.push(section.text);
  }

  return { text: parts.join('\n'), newDeliveries, collapsedFields, collapsedChars };
}
