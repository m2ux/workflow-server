/**
 * Rendering a user-facing checkpoint message from the session variable bag.
 *
 * A gate's message carries the content of the decision — the rating, the caller count, the files an
 * edit touches — as `{name}` and `{name.field}` tokens. Its reader is a person, so the values stand
 * in the text `present_checkpoint` returns rather than in a bag the person cannot see.
 *
 * `check-message-binding` holds the corpus to messages whose names the bag already carries at gate
 * time, so a token surviving a render names a value the run never produced. It is left standing and
 * reported, because a reader shown a name knows a value is missing where a reader shown nothing
 * does not.
 *
 * A checkpoint effect's `{name}` passthrough is a reference the agent resolves against its own
 * scope, so it is stored as written and is not rendered here.
 */
import { IDENTIFIER_PATTERN } from './binding-provenance.js';

/** A bag name, optionally read into by dotted segments: `{risk}`, `{report.summary.direct}`. */
const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');

/** The value at a dotted path, or undefined where a segment is absent or reads into a non-object. */
function valueAt(bag: Record<string, unknown>, path: string): unknown {
  let cursor: unknown = bag;
  for (const segment of path.split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

/** A value as it stands in prose: a string as written, anything else as its JSON form. */
function asText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export interface RenderedMessage {
  /** The message with every answered token replaced by its value. */
  text: string;
  /** Token paths the bag did not answer, in first-appearance order, each named once. */
  unresolved: string[];
}

/**
 * Replace each token in `template` with the bag value it names.
 *
 * `unresolved` accumulates across calls when one is passed in, so the several strings one gate
 * presents — its message and each option's label and description — report as one list.
 */
export function renderMessage(
  template: string,
  bag: Record<string, unknown>,
  unresolved: string[] = [],
): RenderedMessage {
  const text = template.replace(TOKEN_RE, (token, path: string) => {
    const value = valueAt(bag, path);
    if (value === undefined) {
      if (!unresolved.includes(path)) unresolved.push(path);
      return token;
    }
    return asText(value);
  });
  return { text, unresolved };
}

/** The warn-only entry naming what a gate could not render, or null where everything resolved. */
export function unresolvedWarning(checkpointId: string, unresolved: string[]): string | null {
  if (unresolved.length === 0) return null;
  return `Checkpoint '${checkpointId}' presents ${unresolved.length} name(s) the session variable bag does not hold: ${unresolved.join(', ')}. Each stands in the presented text as its own token.`;
}
