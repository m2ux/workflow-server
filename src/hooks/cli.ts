#!/usr/bin/env node
/**
 * workflow-server-interceptor
 *
 * A two-subcommand CLI invoked by MCP-host harness lifecycle hooks
 * (PreToolUse / PostToolUse and their per-harness equivalents). It owns the
 * full lifecycle of the workflow-server `session_token`:
 *
 *   - `inject`  reads the harness's PreToolUse JSON from stdin and merges
 *     the captured token into `tool_input.session_token` for outgoing
 *     `mcp__workflow-server__*` calls (skipping `start_session` and calls
 *     that already carry a `session_token` or `checkpoint_handle`).
 *
 *   - `capture` reads the PostToolUse JSON from stdin and writes the
 *     response's `_meta.session_token` to both a per-sid state file
 *     (`<sid-hex>.token`) and a shared `current.token` pointer.
 *
 * Design intent and full rationale live in
 * `.engineering/artifacts/planning/2026-05-13-interceptor-cli/`. The CLI
 * uses only `node:fs`, `node:path`, `node:os`; no runtime dependencies.
 *
 * Failure-safe contract: every parse error, filesystem error, malformed
 * payload, etc. degrades to a pass-through (inject) or silent no-op
 * (capture). The process never exits non-zero — host harnesses interpret
 * non-zero as "block the call", which is worse than the status quo.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const STATE_DIR = path.join(os.homedir(), '.claude', 'workflow-server-tokens');
const POINTER_FILE = path.join(STATE_DIR, 'current.token');
const WORKFLOW_TOOL_PREFIX = 'mcp__workflow-server__';
const START_SESSION_TOOL = 'mcp__workflow-server__start_session';

/**
 * Read all of stdin synchronously and return the buffered string. A long
 * synchronous read is appropriate here: PreToolUse / PostToolUse payloads
 * are small (a few KB at most) and the CLI runs as a transient subprocess.
 */
function readStdin(): string {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Safely JSON.parse. Returns null on any error so the caller can fall
 * through to pass-through behavior without throwing.
 */
function parseJsonSafe(input: string): unknown {
  if (!input) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

/**
 * Extract the workflow-server `sid` from a token payload. The token is a
 * `<base64url(JSON)>.<signature>` pair; the payload's `sid` is a UUID. The
 * returned value is the UUID with dashes stripped (32 lowercase hex chars)
 * — a stable, filesystem-safe identifier for the per-sid state file.
 *
 * Returns null on any failure: malformed token, non-JSON payload, missing
 * `sid`, or `sid` that is not a UUID. The capture path treats null as a
 * graceful fallback (writes only `current.token`).
 */
function extractSidHex(token: string): string | null {
  if (typeof token !== 'string' || token.length === 0) return null;
  const dotIndex = token.indexOf('.');
  if (dotIndex <= 0) return null;
  const payloadB64 = token.substring(0, dotIndex);
  try {
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    const sid = (parsed as Record<string, unknown>)['sid'];
    if (typeof sid !== 'string') return null;
    // UUID shape: 8-4-4-4-12 hex chars separated by dashes.
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(sid)) return null;
    return sid.replace(/-/g, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Ensure the state directory exists with mode 0700. On POSIX the mode is
 * honored at creation time; on existing directories Node leaves the mode
 * untouched, which is acceptable — the worst case is a directory already
 * locked down with stricter permissions than we'd otherwise apply.
 * Returns true on success, false on any IO error.
 */
function ensureStateDir(): boolean {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Write a string atomically to `targetPath` with mode 0600 (`.tmp`
 * sibling + rename). The `.tmp` is created with restrictive permissions
 * up front so the brief window between create and rename does not leak
 * the credential to other users on the box.
 */
function writeTokenFile(targetPath: string, contents: string): void {
  const tmpPath = targetPath + '.tmp';
  // Open with O_WRONLY | O_CREAT | O_TRUNC and mode 0600 so a freshly
  // created tmp file never starts world-readable. Existing files are
  // truncated; existing modes are preserved (POSIX semantics).
  const fd = fs.openSync(tmpPath, 'w', 0o600);
  try {
    fs.writeFileSync(fd, contents, 'utf8');
    // Ensure the bits are exactly 0600 even if a prior file at this path
    // had a different mode that openSync inherited.
    try { fs.chmodSync(tmpPath, 0o600); } catch { /* best-effort */ }
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmpPath, targetPath);
  // chmod the final path too — on some filesystems rename can carry
  // over destination-side mode bits.
  try { fs.chmodSync(targetPath, 0o600); } catch { /* best-effort */ }
}

/**
 * Read the pointer file (current.token) and return its trimmed contents,
 * or null on any error / missing / empty file.
 */
function readPointerToken(): string | null {
  try {
    const stat = fs.statSync(POINTER_FILE);
    if (!stat.isFile() || stat.size === 0) return null;
    const raw = fs.readFileSync(POINTER_FILE, 'utf8').trim();
    return raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Inject subcommand.
 *
 * Reads a PreToolUse-style JSON envelope from stdin. The harness contract
 * varies in field names across harnesses — Claude Code uses `tool_name` /
 * `tool_input`, Cursor and Codex CLI use the same names, OpenCode uses
 * `tool.execute.before` which exposes equivalent fields. The CLI is
 * permissive: any unrecognized shape becomes pass-through.
 *
 * Output contract (Claude Code shape, mirrored by other harnesses' merge
 * semantics): `{ "updatedInput": { ...tool_input, session_token: <token> } }`
 * on inject, `{}` (or an empty object equivalent) on pass-through.
 */
function runInject(): void {
  const raw = readStdin();
  const envelope = parseJsonSafe(raw);
  if (!envelope || typeof envelope !== 'object') {
    process.stdout.write('{}\n');
    return;
  }

  const env = envelope as Record<string, unknown>;
  const toolName = typeof env['tool_name'] === 'string' ? (env['tool_name'] as string) : '';
  const toolInput = (env['tool_input'] && typeof env['tool_input'] === 'object'
    ? (env['tool_input'] as Record<string, unknown>)
    : {});

  // Skip non-workflow-server targets.
  if (!toolName.startsWith(WORKFLOW_TOOL_PREFIX)) {
    process.stdout.write('{}\n');
    return;
  }
  // Skip start_session — the caller may legitimately be resuming with a saved token.
  if (toolName === START_SESSION_TOOL) {
    process.stdout.write('{}\n');
    return;
  }
  // Skip when the agent has already supplied a token or handle.
  if (typeof toolInput['session_token'] === 'string' && (toolInput['session_token'] as string).length > 0) {
    process.stdout.write('{}\n');
    return;
  }
  if (typeof toolInput['checkpoint_handle'] === 'string' && (toolInput['checkpoint_handle'] as string).length > 0) {
    process.stdout.write('{}\n');
    return;
  }

  const token = readPointerToken();
  if (!token) {
    process.stdout.write('{}\n');
    return;
  }

  const updatedInput = { ...toolInput, session_token: token };
  process.stdout.write(JSON.stringify({ updatedInput }) + '\n');
}

/**
 * Locate `_meta.session_token` in a PostToolUse-style JSON envelope. The
 * conventional locations are top-level `_meta.session_token` and a
 * `tool_response._meta.session_token` fallback (the latter is what
 * Claude Code emits when wrapping an MCP response).
 *
 * Returns the token string when found, null otherwise.
 */
function locateResponseToken(envelope: Record<string, unknown>): string | null {
  const direct = envelope['_meta'];
  if (direct && typeof direct === 'object') {
    const v = (direct as Record<string, unknown>)['session_token'];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  const wrapped = envelope['tool_response'];
  if (wrapped && typeof wrapped === 'object') {
    const wrappedMeta = (wrapped as Record<string, unknown>)['_meta'];
    if (wrappedMeta && typeof wrappedMeta === 'object') {
      const v = (wrappedMeta as Record<string, unknown>)['session_token'];
      if (typeof v === 'string' && v.length > 0) return v;
    }
  }
  return null;
}

/**
 * Capture subcommand.
 *
 * Reads a PostToolUse-style JSON envelope from stdin, locates the
 * response's `_meta.session_token`, extracts the sid, and writes the
 * token to both `<sid-hex>.token` and `current.token`. When sid
 * extraction fails, only `current.token` is updated.
 *
 * Capture never blocks or modifies the call — the PostToolUse contract
 * requires no stdout body. We emit nothing.
 */
function runCapture(): void {
  const raw = readStdin();
  const envelope = parseJsonSafe(raw);
  if (!envelope || typeof envelope !== 'object') {
    return;
  }

  const token = locateResponseToken(envelope as Record<string, unknown>);
  if (!token) {
    return;
  }

  if (!ensureStateDir()) {
    return;
  }

  const sidHex = extractSidHex(token);
  try {
    if (sidHex) {
      const perSidPath = path.join(STATE_DIR, `${sidHex}.token`);
      writeTokenFile(perSidPath, token);
    }
    writeTokenFile(POINTER_FILE, token);
  } catch {
    // Filesystem error — swallow. The call already succeeded server-side;
    // a missed capture just means inject falls through to pass-through on
    // the next call and the agent transcribes manually for that one call.
  }
}

function main(): void {
  const sub = process.argv[2];
  try {
    if (sub === 'inject') {
      runInject();
    } else if (sub === 'capture') {
      runCapture();
    } else {
      // Unknown subcommand — emit a pass-through so a mis-wired hook
      // does not block the call. We intentionally avoid writing usage
      // text to stderr; some harnesses surface stderr as an error to the
      // user.
      process.stdout.write('{}\n');
    }
  } catch {
    // Absolute last-resort guard. The subcommand bodies already swallow
    // their own errors, but this catches any bug that escapes.
    try { process.stdout.write('{}\n'); } catch { /* nothing to do */ }
  }
  // Exit 0 unconditionally — non-zero would tell the harness to block.
  process.exit(0);
}

main();
