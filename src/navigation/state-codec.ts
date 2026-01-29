import { gzipSync, gunzipSync } from 'node:zlib';
import { type WorkflowState, validateState, safeValidateState } from '../schema/state.schema.js';

/** State token version for migration support */
const STATE_VERSION = 'v1';

/** Encoding identifier */
const ENCODING = 'gzB64';

/** Token prefix pattern: v1.gzB64. */
const TOKEN_PREFIX = `${STATE_VERSION}.${ENCODING}.`;

/** Error thrown when state token is invalid */
export class StateCodecError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_FORMAT' | 'DECODE_FAILED' | 'DECOMPRESS_FAILED' | 'VALIDATION_FAILED'
  ) {
    super(message);
    this.name = 'StateCodecError';
  }
}

/**
 * Encode workflow state to an opaque token.
 * Format: v1.gzB64.{compressed-base64-payload}
 * 
 * The token is designed to be:
 * - Opaque: Not human-readable (compressed binary)
 * - Compact: Gzip compression reduces size significantly
 * - Versioned: Prefix allows future migration
 */
export function encodeState(state: WorkflowState): string {
  // Serialize state to JSON
  const json = JSON.stringify(state);
  
  // Compress with gzip
  const compressed = gzipSync(Buffer.from(json, 'utf-8'));
  
  // Encode to base64
  const base64 = compressed.toString('base64');
  
  // Return with version prefix
  return `${TOKEN_PREFIX}${base64}`;
}

/**
 * Decode an opaque state token back to WorkflowState.
 * Validates format, decompresses, and validates schema.
 * 
 * @throws StateCodecError if token is invalid
 */
export function decodeState(token: string): WorkflowState {
  // Validate token format
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new StateCodecError(
      `Invalid token format. Expected prefix '${TOKEN_PREFIX}'`,
      'INVALID_FORMAT'
    );
  }
  
  // Extract payload
  const payload = token.slice(TOKEN_PREFIX.length);
  if (!payload) {
    throw new StateCodecError('Empty token payload', 'INVALID_FORMAT');
  }
  
  // Decode base64
  let compressed: Buffer;
  try {
    compressed = Buffer.from(payload, 'base64');
  } catch {
    throw new StateCodecError('Failed to decode base64 payload', 'DECODE_FAILED');
  }
  
  // Decompress
  let json: string;
  try {
    const decompressed = gunzipSync(compressed);
    json = decompressed.toString('utf-8');
  } catch {
    throw new StateCodecError('Failed to decompress payload', 'DECOMPRESS_FAILED');
  }
  
  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new StateCodecError('Failed to parse JSON payload', 'DECODE_FAILED');
  }
  
  // Validate schema
  const result = safeValidateState(data);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new StateCodecError(`State validation failed: ${issues}`, 'VALIDATION_FAILED');
  }
  
  return result.data;
}

/**
 * Validate token format without fully decoding.
 * Useful for quick validation before expensive operations.
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token.startsWith(TOKEN_PREFIX)) return false;
  const payload = token.slice(TOKEN_PREFIX.length);
  if (!payload) return false;
  
  // Check if payload is valid base64
  try {
    Buffer.from(payload, 'base64');
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract version from token without decoding.
 */
export function getTokenVersion(token: string): string | null {
  const match = token.match(/^(v\d+)\./);
  return match?.[1] ?? null;
}

/**
 * Get compression ratio for diagnostics.
 * Returns ratio of compressed size to original JSON size.
 */
export function getCompressionRatio(state: WorkflowState): number {
  const json = JSON.stringify(state);
  const compressed = gzipSync(Buffer.from(json, 'utf-8'));
  return compressed.length / json.length;
}
