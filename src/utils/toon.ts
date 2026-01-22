import { decode } from '@toon-format/toon';

/**
 * Decode a TOON string to a JavaScript object.
 * Wrapper around @toon-format/toon decode with consistent error handling.
 */
export function decodeToon<T = unknown>(content: string): T {
  return decode(content) as T;
}
