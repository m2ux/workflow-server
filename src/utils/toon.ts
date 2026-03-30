import { type ZodType } from 'zod';
import { decode, encode } from '@toon-format/toon';

/**
 * Decode a TOON string and validate against a Zod schema.
 * Returns the validated, typed result. Throws ZodError on validation failure.
 */
export function decodeToon<T>(content: string, schema: ZodType<T>): T {
  return schema.parse(decode(content));
}

/**
 * Decode a TOON string without schema validation.
 * Returns an untyped value — callers must validate or narrow the result.
 * Use decodeToon(content, schema) when a schema is available.
 */
export function decodeToonRaw(content: string): unknown {
  return decode(content);
}

/**
 * Encode a value to a TOON string.
 * Accepts objects, arrays, and other serializable values supported
 * by the underlying @toon-format/toon library.
 */
export function encodeToon(value: Record<string, unknown> | unknown[] | unknown): string {
  return encode(value as Record<string, unknown>);
}
