import { decode, encode } from '@toon-format/toon';

/**
 * Decode a TOON string to a JavaScript object.
 * Wrapper around @toon-format/toon decode with consistent error handling.
 */
export function decodeToon<T = unknown>(content: string): T {
  return decode(content) as T;
}

/**
 * Encode a JavaScript object to a TOON string.
 * Wrapper around @toon-format/toon encode for state serialization.
 */
export function encodeToon(value: Record<string, unknown>): string {
  return encode(value);
}
