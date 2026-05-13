import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '..', 'dist', 'hooks', 'cli.js');

/**
 * Construct a realistic-shaped workflow-server session token whose payload
 * decodes to a JSON object containing the provided `sid`. The signature
 * segment is a fixed dummy string — the CLI does not verify HMAC, only
 * decodes the payload to extract `sid`.
 */
function buildToken(sid: string, extra: Record<string, unknown> = {}): string {
  const payload = { sid, wf: 'work-package', act: 'plan', aid: 'orchestrator', seq: 1, ts: 0, v: '1.0.0', skill: '', cond: '', ...extra };
  const b64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${b64}.deadbeefcafef00d`;
}

function runCli(sub: 'inject' | 'capture', input: string, home: string): { stdout: string; code: number } {
  // execFileSync throws on non-zero exit. The CLI exits 0 unconditionally;
  // capture the output and assert as needed.
  try {
    const stdout = execFileSync(process.execPath, [CLI_PATH, sub], {
      input,
      env: { ...process.env, HOME: home },
      timeout: 5000,
      encoding: 'utf8',
    });
    return { stdout, code: 0 };
  } catch (e: any) {
    return { stdout: String(e.stdout ?? ''), code: typeof e.status === 'number' ? e.status : 1 };
  }
}

function makeHome(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wsc-hooks-cli-'));
}

function stateDir(home: string): string {
  return path.join(home, '.claude', 'workflow-server-tokens');
}

function pointerPath(home: string): string {
  return path.join(stateDir(home), 'current.token');
}

function tokenPath(home: string, sidHex: string): string {
  return path.join(stateDir(home), `${sidHex}.token`);
}

describe('workflow-server-interceptor CLI', () => {
  let home: string;

  beforeEach(() => {
    home = makeHome();
  });

  afterEach(() => {
    try { fs.rmSync(home, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  // --- Inject branch coverage ----------------------------------------

  it('TC-01 inject happy path: merges current.token into updatedInput.session_token', () => {
    const token = buildToken('f921c0ed-f333-4579-a2aa-bc9f84efcbf4');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), token);
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput.session_token).toBe(token);
  });

  it('TC-02 inject preserves other tool_input fields when injecting the token', () => {
    const token = buildToken('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), token);
    const input = JSON.stringify({
      tool_name: 'mcp__workflow-server__get_activity',
      tool_input: { activity_id: 'plan', transition_condition: 'foo' },
    });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput.session_token).toBe(token);
    expect(parsed.updatedInput.activity_id).toBe('plan');
    expect(parsed.updatedInput.transition_condition).toBe('foo');
  });

  it('TC-03 inject is a no-op for start_session', () => {
    const token = buildToken('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), token);
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__start_session', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-04 inject is a no-op when tool_input.session_token is already set', () => {
    const stored = buildToken('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), stored);
    const input = JSON.stringify({
      tool_name: 'mcp__workflow-server__get_activity',
      tool_input: { session_token: 'agent-supplied-token' },
    });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-05 inject is a no-op when tool_input.checkpoint_handle is already set', () => {
    const stored = buildToken('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), stored);
    const input = JSON.stringify({
      tool_name: 'mcp__workflow-server__present_checkpoint',
      tool_input: { checkpoint_handle: 'some-handle' },
    });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-06 inject is a no-op for non-workflow-server tools', () => {
    const stored = buildToken('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), stored);
    const input = JSON.stringify({ tool_name: 'mcp__other__foo', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-07 inject is a pass-through when current.token is missing', () => {
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-08 inject is a pass-through when current.token is empty', () => {
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), '');
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-09 inject is a pass-through on malformed stdin', () => {
    const { stdout, code } = runCli('inject', 'this is not JSON', home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  it('TC-10 inject exits 0 when the pointer file is unreadable', () => {
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(pointerPath(home), 'tok');
    // Strip read permission. On non-POSIX or root contexts this is a no-op
    // and the test still verifies the exit code is 0.
    try { fs.chmodSync(pointerPath(home), 0o000); } catch { /* ignore */ }
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity', tool_input: {} });
    const { code } = runCli('inject', input, home);
    expect(code).toBe(0);
    try { fs.chmodSync(pointerPath(home), 0o600); } catch { /* ignore */ }
  });

  it('TC-11 inject reads only current.token, never a per-sid file', () => {
    const sid = 'f921c0ed-f333-4579-a2aa-bc9f84efcbf4';
    const sidHex = sid.replace(/-/g, '');
    const token = buildToken(sid);
    fs.mkdirSync(stateDir(home), { recursive: true });
    fs.writeFileSync(tokenPath(home, sidHex), token); // per-sid file exists
    // No current.token
    const input = JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity', tool_input: {} });
    const { stdout, code } = runCli('inject', input, home);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.updatedInput).toBeUndefined();
  });

  // --- Capture branch coverage --------------------------------------

  it('TC-12 capture extracts sid and writes the per-sid file at the correct hex filename', () => {
    const sid = 'f921c0ed-f333-4579-a2aa-bc9f84efcbf4';
    const sidHex = 'f921c0edf3334579a2aabc9f84efcbf4';
    const token = buildToken(sid);
    const input = JSON.stringify({ _meta: { session_token: token } });
    const { code } = runCli('capture', input, home);
    expect(code).toBe(0);
    expect(fs.existsSync(tokenPath(home, sidHex))).toBe(true);
    expect(fs.readFileSync(tokenPath(home, sidHex), 'utf8')).toBe(token);
    const mode = fs.statSync(tokenPath(home, sidHex)).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('TC-13 capture dual write: both per-sid and current.token contain the token at mode 0600', () => {
    const sid = 'f921c0ed-f333-4579-a2aa-bc9f84efcbf4';
    const sidHex = 'f921c0edf3334579a2aabc9f84efcbf4';
    const token = buildToken(sid);
    const input = JSON.stringify({ _meta: { session_token: token } });
    runCli('capture', input, home);
    expect(fs.readFileSync(tokenPath(home, sidHex), 'utf8')).toBe(token);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(token);
    expect(fs.statSync(tokenPath(home, sidHex)).mode & 0o777).toBe(0o600);
    expect(fs.statSync(pointerPath(home)).mode & 0o777).toBe(0o600);
  });

  it('TC-14 capture creates state directory at 0700 when missing', () => {
    expect(fs.existsSync(stateDir(home))).toBe(false);
    const token = buildToken('11111111-2222-3333-4444-555555555555');
    runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    expect(fs.existsSync(stateDir(home))).toBe(true);
    expect(fs.statSync(stateDir(home)).mode & 0o777).toBe(0o700);
  });

  it('TC-15 capture produces multiple per-sid files for distinct sids; current.token reflects last', () => {
    const sid1 = '11111111-2222-3333-4444-555555555555';
    const sid2 = '66666666-7777-8888-9999-aaaaaaaaaaaa';
    const t1 = buildToken(sid1);
    const t2 = buildToken(sid2);
    runCli('capture', JSON.stringify({ _meta: { session_token: t1 } }), home);
    runCli('capture', JSON.stringify({ _meta: { session_token: t2 } }), home);
    expect(fs.readFileSync(tokenPath(home, sid1.replace(/-/g, '')), 'utf8')).toBe(t1);
    expect(fs.readFileSync(tokenPath(home, sid2.replace(/-/g, '')), 'utf8')).toBe(t2);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(t2);
  });

  it('TC-16 current.token always reflects the most recent capture', () => {
    const sid = '11111111-2222-3333-4444-555555555555';
    const a = buildToken(sid, { seq: 1 });
    const b = buildToken(sid, { seq: 2 });
    runCli('capture', JSON.stringify({ _meta: { session_token: a } }), home);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(a);
    runCli('capture', JSON.stringify({ _meta: { session_token: b } }), home);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(b);
  });

  it('TC-17 capture overwrites the same sid file in place; no .tmp left behind', () => {
    const sid = '11111111-2222-3333-4444-555555555555';
    const sidHex = sid.replace(/-/g, '');
    const t1 = buildToken(sid, { seq: 1 });
    const t2 = buildToken(sid, { seq: 2 });
    runCli('capture', JSON.stringify({ _meta: { session_token: t1 } }), home);
    runCli('capture', JSON.stringify({ _meta: { session_token: t2 } }), home);
    expect(fs.readFileSync(tokenPath(home, sidHex), 'utf8')).toBe(t2);
    const entries = fs.readdirSync(stateDir(home));
    expect(entries.some(e => e.endsWith('.tmp'))).toBe(false);
  });

  it('TC-18 capture falls back to pointer-only when sid extraction fails', () => {
    const malformed = 'not.a.valid.payload';
    runCli('capture', JSON.stringify({ _meta: { session_token: malformed } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(true);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(malformed);
    const entries = fs.readdirSync(stateDir(home));
    // Only current.token should exist; no <sid-hex>.token file.
    expect(entries.filter(e => e !== 'current.token')).toHaveLength(0);
  });

  it('TC-18b capture falls back to pointer-only when payload lacks sid', () => {
    // Encode a valid JSON payload but omit the sid field entirely.
    const payload = Buffer.from(JSON.stringify({ wf: 'work-package' }), 'utf8').toString('base64url');
    const token = `${payload}.deadbeef`;
    runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(token);
    const entries = fs.readdirSync(stateDir(home));
    expect(entries.filter(e => e !== 'current.token')).toHaveLength(0);
  });

  it('TC-18c capture falls back to pointer-only when sid is not a UUID', () => {
    const payload = Buffer.from(JSON.stringify({ sid: 'not-a-uuid' }), 'utf8').toString('base64url');
    const token = `${payload}.deadbeef`;
    runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(token);
    const entries = fs.readdirSync(stateDir(home));
    expect(entries.filter(e => e !== 'current.token')).toHaveLength(0);
  });

  it('TC-19 capture is a no-op when response has no _meta', () => {
    runCli('capture', JSON.stringify({ tool_name: 'mcp__workflow-server__get_activity' }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-20 capture is a no-op when _meta.session_token is missing', () => {
    runCli('capture', JSON.stringify({ _meta: { other: 'value' } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-21 capture is a no-op when _meta.session_token is null', () => {
    runCli('capture', JSON.stringify({ _meta: { session_token: null } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-22 capture is a no-op when _meta.session_token is a number', () => {
    runCli('capture', JSON.stringify({ _meta: { session_token: 42 } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-22b capture is a no-op when _meta.session_token is a boolean', () => {
    runCli('capture', JSON.stringify({ _meta: { session_token: false } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-23 capture is a no-op when _meta.session_token is an empty string', () => {
    runCli('capture', JSON.stringify({ _meta: { session_token: '' } }), home);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-24 capture exits 0 on malformed stdin', () => {
    const { code } = runCli('capture', 'not json', home);
    expect(code).toBe(0);
    expect(fs.existsSync(pointerPath(home))).toBe(false);
  });

  it('TC-25 capture exits 0 on filesystem error (state dir cannot be created)', () => {
    // Create a file where the state directory is expected — mkdirSync will fail.
    const claudeDir = path.join(home, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(path.join(claudeDir, 'workflow-server-tokens'), 'this is a file, not a dir');
    const token = buildToken('11111111-2222-3333-4444-555555555555');
    const { code } = runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    expect(code).toBe(0);
  });

  it('TC-26 capture leaves no .tmp files after a successful dual write', () => {
    const sid = '11111111-2222-3333-4444-555555555555';
    const token = buildToken(sid);
    runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    const entries = fs.readdirSync(stateDir(home));
    expect(entries.some(e => e.endsWith('.tmp'))).toBe(false);
  });

  it('TC-27 capture writes every token file with mode 0600', () => {
    const sid = '11111111-2222-3333-4444-555555555555';
    const sidHex = sid.replace(/-/g, '');
    const token = buildToken(sid);
    runCli('capture', JSON.stringify({ _meta: { session_token: token } }), home);
    expect(fs.statSync(tokenPath(home, sidHex)).mode & 0o777).toBe(0o600);
    expect(fs.statSync(pointerPath(home)).mode & 0o777).toBe(0o600);
  });

  it('TC-27b capture also locates a token at tool_response._meta.session_token (Claude Code wrapped shape)', () => {
    const sid = '11111111-2222-3333-4444-555555555555';
    const token = buildToken(sid);
    const input = JSON.stringify({ tool_response: { _meta: { session_token: token } } });
    runCli('capture', input, home);
    expect(fs.readFileSync(pointerPath(home), 'utf8')).toBe(token);
  });

  // --- Build / packaging ------------------------------------

  it('TC-28 the built CLI has a #!/usr/bin/env node shebang', () => {
    const first = fs.readFileSync(CLI_PATH, 'utf8').split('\n')[0];
    expect(first).toBe('#!/usr/bin/env node');
  });

  it('TC-29 package.json lists workflow-server-interceptor in bin and points at dist/hooks/cli.js', () => {
    const pkgPath = path.resolve(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin['workflow-server-interceptor']).toBe('dist/hooks/cli.js');
  });
});
