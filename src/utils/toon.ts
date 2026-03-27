import { decode, encode } from '@toon-format/toon';

/**
 * Decode a TOON string to a JavaScript object.
 * The caller is responsible for validating the returned structure
 * matches the expected type T (e.g., via Zod schema validation).
 */
export function decodeToon<T = unknown>(content: string): T {
  return decode(content) as T;
}

/**
 * Encode a value to a TOON string.
 * Accepts objects, arrays, and other serializable values supported
 * by the underlying @toon-format/toon library.
 */
export function encodeToon(value: Record<string, unknown> | unknown[] | unknown): string {
  return encode(value as Record<string, unknown>);
}
