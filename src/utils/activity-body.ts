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
 * So every field the server does not key — the identity among them — is always delivered in full, in
 * the position its author wrote it, and the step list, transitions, outcome and synthesised artifact
 * contract are keyed separately.
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

/**
 * One run of the delivered definition. `field` names a keyed block; its absence means text that always
 * ships as authored. Parts are held in DOCUMENT ORDER, and the delivery emits them in that order —
 * seven activities of the corpus carry an unkeyed field between two keyed ones, so hoisting the unkeyed
 * text would hand the worker a definition whose fields are not in the order its author wrote them.
 */
export interface BodyPart {
  field?: string;
  text: string;
}

/** The definition split at its top-level fields. */
export interface SplitActivityBody {
  /** Every run of the definition, in document order — the form the delivery emits. */
  parts: BodyPart[];
  /** The unkeyed text, concatenated: the identity a worker checks its dispatch against. */
  identity: string;
  /** The keyed blocks, in document order. */
  sections: BodySection[];
}

/** A line opening a top-level YAML field, which is where one block ends and the next begins. */
const TOP_LEVEL_FIELD = /^([A-Za-z$][A-Za-z0-9_-]*):/;

/**
 * Split the delivered definition text into runs at its top-level fields, in document order. Each keyed
 * field carries its own block through to the next top-level field; consecutive unkeyed fields share a
 * run. A field the server does not key is delivered as authored rather than dropped, so an unrecognised
 * definition field reaches the worker whole.
 */
export function splitActivityBody(body: string): SplitActivityBody {
  const parts: Array<{ field?: string; lines: string[] }> = [];
  /** The run being accumulated. A new one opens at every top-level field that changes keyed-ness. */
  let current: { field?: string; lines: string[] } | undefined;

  const open = (field: string | undefined, line: string): void => {
    current = field === undefined ? { lines: [line] } : { field, lines: [line] };
    parts.push(current);
  };

  for (const line of body.split('\n')) {
    const opened = TOP_LEVEL_FIELD.exec(line);
    if (opened) {
      const field = opened[1]!;
      if (COLLAPSIBLE_BODY_FIELDS.includes(field)) { open(field, line); continue; }
      // An unkeyed field extends the run before it only when that run is unkeyed too; after a keyed
      // block it opens a run of its own, so document order survives.
      if (current && current.field === undefined) current.lines.push(line);
      else open(undefined, line);
      continue;
    }
    // A continuation line belongs to whatever run is open — a folded description, a nested list, a
    // comment. A body opening with one has no run yet, so it opens an unkeyed one.
    if (current) current.lines.push(line);
    else open(undefined, line);
  }

  const resolved: BodyPart[] = parts.map((p) => (
    p.field === undefined ? { text: p.lines.join('\n') } : { field: p.field, text: p.lines.join('\n') }
  ));
  return {
    parts: resolved,
    identity: resolved.filter((p) => p.field === undefined).map((p) => p.text).join('\n'),
    sections: resolved.filter((p): p is BodySection => p.field !== undefined),
  };
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
  const newDeliveries: Record<string, string> = {};
  const collapsedFields: string[] = [];
  let collapsedChars = 0;

  const emitted = splitActivityBody(body).parts.map((part) => {
    if (part.field === undefined) return part.text;
    const hash = contentHash(part.text);
    const key = `activity:${part.field}:${hash}`;
    if (opts.readLedger && deliveredHash(state, key, scope) === hash) {
      collapsedFields.push(part.field);
      collapsedChars += part.text.length;
      return stringifyForResponse({ [part.field]: unchangedMarker(hash) });
    }
    newDeliveries[key] = hash;
    return part.text;
  });

  return { text: emitted.join('\n'), newDeliveries, collapsedFields, collapsedChars };
}
