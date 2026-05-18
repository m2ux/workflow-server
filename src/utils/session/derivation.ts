import { createHmac } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { getOrCreateServerKey } from './crypto.js';

/**
 * RFC 4648 base32 alphabet (uppercase, no padding). 32 symbols covering
 * `A-Z` and `2-7`. The alphabet excludes ambiguous digits/letters `0`, `1`,
 * `8`, `9`.
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Length of the session index in base32 characters. 6 characters = 30 bits of
 * collision space — sufficient for per-workspace scoping and short enough to
 * be a single tokenizer chunk.
 */
const SESSION_INDEX_LENGTH = 6;

/**
 * Encode a buffer as RFC 4648 base32 (uppercase, no padding) and truncate to
 * `length` characters. Each output character consumes 5 bits of the input;
 * the function only needs ~4 bytes of input to emit 6 characters but accepts
 * any buffer ≥ ⌈length·5/8⌉ bytes so callers can pass a longer HMAC digest
 * without slicing it first.
 */
function base32Truncated(bytes: Buffer, length: number): string {
  const bitsNeeded = length * 5;
  const bytesNeeded = Math.ceil(bitsNeeded / 8);
  if (bytes.length < bytesNeeded) {
    throw new Error(
      `base32Truncated: input buffer too short (${bytes.length} bytes, need at least ${bytesNeeded} for ${length} chars)`,
    );
  }

  let buffer = 0;
  let bitsInBuffer = 0;
  let out = '';
  for (let i = 0; i < bytesNeeded && out.length < length; i++) {
    buffer = (buffer << 8) | (bytes[i] as number);
    bitsInBuffer += 8;
    while (bitsInBuffer >= 5 && out.length < length) {
      bitsInBuffer -= 5;
      const symbol = (buffer >> bitsInBuffer) & 0b11111;
      out += BASE32_ALPHABET[symbol];
    }
  }
  // If we still need one more symbol and have residual bits, left-pad with zeros.
  if (out.length < length && bitsInBuffer > 0) {
    const symbol = (buffer << (5 - bitsInBuffer)) & 0b11111;
    out += BASE32_ALPHABET[symbol];
  }
  return out;
}

/**
 * Compute the canonical session index for a planning folder.
 *
 * Algorithm:
 *   1. Canonicalise the folder path via `fs.realpathSync` (symlink-stable so
 *      the same folder always hashes to the same index).
 *   2. HMAC-SHA-256 the canonical path bytes under the server's secret key
 *      (secret-bound so an index reveals nothing about the folder without
 *      the key).
 *   3. Truncate the digest to 30 bits and encode as 6 RFC 4648 base32 chars
 *      (uppercase).
 *
 * The folder path **must exist on disk** at call time — `realpathSync` is
 * synchronous and throws if the path is missing. The caller is responsible
 * for creating the folder first.
 */
export async function computeSessionIndex(folderAbsPath: string): Promise<string> {
  const canonical = realpathSync(folderAbsPath);
  const key = await getOrCreateServerKey();
  const digest = createHmac('sha256', key).update(canonical, 'utf8').digest();
  return base32Truncated(digest, SESSION_INDEX_LENGTH);
}

/**
 * Synchronous variant that takes a pre-loaded key. Useful for callers that
 * have already resolved the server key (e.g. `resolveSessionIndex` enumerates
 * many folders and resolves the key once).
 */
export function computeSessionIndexSync(folderAbsPath: string, key: Buffer): string {
  const canonical = realpathSync(folderAbsPath);
  const digest = createHmac('sha256', key).update(canonical, 'utf8').digest();
  return base32Truncated(digest, SESSION_INDEX_LENGTH);
}

/**
 * Path into an embedded SessionFile expressed as an array of object keys and
 * array indices. `[]` addresses the root of the file. `["triggeredWorkflows",
 * 0, "state"]` addresses the first child's embedded state. Recurse for
 * grandchildren.
 */
export type SessionJsonPath = ReadonlyArray<string | number>;

/**
 * Canonical string form of a `SessionJsonPath`. Segments are joined by `.`,
 * with array indices rendered as decimal integers. This is the input fed
 * into the HMAC for embedded-index derivation; canonicalising here keeps
 * the index byte-identical regardless of how the caller constructed the
 * path.
 */
function jsonPathToString(path: SessionJsonPath): string {
  return path.map((seg) => (typeof seg === 'number' ? String(seg) : seg)).join('.');
}

/**
 * Compute the session_index for an embedded SessionFile at `jsonPath` inside
 * the top-level `session.json` at `folderAbsPath`. When `jsonPath` is empty
 * the result is identical to `computeSessionIndex(folderAbsPath)` — root
 * sessions are addressed by folder alone.
 *
 * Algorithm: HMAC-SHA-256 over `<realpath(folder)>` if root, else
 * `<realpath(folder)>:<jsonPathString>`. The `:` separator can never appear
 * inside a real filesystem path on POSIX (filenames may contain `:` but
 * `realpath` always yields an absolute path beginning with `/`, so the
 * separator never collides with path content), and the canonical path is
 * always rooted, so the combined input is unambiguous.
 */
export async function computeEmbeddedSessionIndex(
  folderAbsPath: string,
  jsonPath: SessionJsonPath,
): Promise<string> {
  const canonical = realpathSync(folderAbsPath);
  const key = await getOrCreateServerKey();
  const input = jsonPath.length === 0 ? canonical : `${canonical}:${jsonPathToString(jsonPath)}`;
  const digest = createHmac('sha256', key).update(input, 'utf8').digest();
  return base32Truncated(digest, SESSION_INDEX_LENGTH);
}

/** Sync variant; matches `computeSessionIndexSync` when `jsonPath` is empty. */
export function computeEmbeddedSessionIndexSync(
  folderAbsPath: string,
  jsonPath: SessionJsonPath,
  key: Buffer,
): string {
  const canonical = realpathSync(folderAbsPath);
  const input = jsonPath.length === 0 ? canonical : `${canonical}:${jsonPathToString(jsonPath)}`;
  const digest = createHmac('sha256', key).update(input, 'utf8').digest();
  return base32Truncated(digest, SESSION_INDEX_LENGTH);
}

/**
 * Regex matching a syntactically valid session index. Useful for early input
 * validation before invoking `resolveSessionIndex`.
 */
export const SESSION_INDEX_REGEX = /^[A-Z2-7]{6}$/;

/**
 * `true` iff `value` is a 6-character RFC 4648 base32 string (uppercase).
 * Lowercase, padded, or wrong-length inputs return `false`.
 */
export function isSessionIndex(value: string): boolean {
  return SESSION_INDEX_REGEX.test(value);
}

/** Exposed for tests / external consumers; not part of the index contract. */
export const SESSION_INDEX_BASE32_ALPHABET = BASE32_ALPHABET;
export const SESSION_INDEX_CHAR_LENGTH = SESSION_INDEX_LENGTH;
