import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  getOrCreateServerKey,
  getServerKeyPaths,
  resolveKeyDir,
  probeSessionKeyWritable,
  _resetServerKeyCacheForTests,
} from '../src/utils/session/crypto.js';

describe('session crypto key paths', () => {
  let tmp: string;
  const prevKey = process.env['WORKFLOW_SERVER_KEY_DIR'];
  const prevState = process.env['WORKFLOW_SERVER_STATE_DIR'];

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'wf-crypto-'));
    delete process.env['WORKFLOW_SERVER_KEY_DIR'];
    delete process.env['WORKFLOW_SERVER_STATE_DIR'];
    _resetServerKeyCacheForTests();
  });

  /**
   * A key directory the running user genuinely cannot create, so the errno is EACCES wherever
   * the suite runs. A path under `/` stands in for the Docker `HOME=/` failure mode, but a
   * sandboxed or read-only root answers with ENOENT or EROFS instead, which is a different
   * branch of the error mapping.
   */
  function lockedKeyDir(): string {
    const parent = join(tmp, 'locked');
    mkdirSync(parent, { mode: 0o500 });
    return join(parent, 'state');
  }

  afterEach(() => {
    _resetServerKeyCacheForTests();
    // Restore write permission so the temp tree can be removed.
    const locked = join(tmp, 'locked');
    if (existsSync(locked)) chmodSync(locked, 0o700);
    if (prevKey === undefined) delete process.env['WORKFLOW_SERVER_KEY_DIR'];
    else process.env['WORKFLOW_SERVER_KEY_DIR'] = prevKey;
    if (prevState === undefined) delete process.env['WORKFLOW_SERVER_STATE_DIR'];
    else process.env['WORKFLOW_SERVER_STATE_DIR'] = prevState;
    rmSync(tmp, { recursive: true, force: true });
  });

  it('resolveKeyDir prefers WORKFLOW_SERVER_KEY_DIR over STATE_DIR and homedir', () => {
    process.env['WORKFLOW_SERVER_STATE_DIR'] = join(tmp, 'state');
    process.env['WORKFLOW_SERVER_KEY_DIR'] = join(tmp, 'key');
    expect(resolveKeyDir()).toBe(join(tmp, 'key'));
  });

  it('resolveKeyDir uses WORKFLOW_SERVER_STATE_DIR when KEY_DIR unset', () => {
    process.env['WORKFLOW_SERVER_STATE_DIR'] = join(tmp, 'state');
    expect(resolveKeyDir()).toBe(join(tmp, 'state'));
  });

  it('getOrCreateServerKey writes secret under KEY_DIR and reuses it', async () => {
    const keyDir = join(tmp, 'keydir');
    process.env['WORKFLOW_SERVER_KEY_DIR'] = keyDir;
    const a = await getOrCreateServerKey();
    expect(a).toHaveLength(32);
    const { keyFile } = getServerKeyPaths();
    expect(existsSync(keyFile)).toBe(true);
    expect(readFileSync(keyFile)).toHaveLength(32);

    _resetServerKeyCacheForTests();
    const b = await getOrCreateServerKey();
    expect(Buffer.compare(a, b)).toBe(0);
  });

  it('getOrCreateServerKey surfaces actionable EACCES when dir is not writable', async () => {
    process.env['WORKFLOW_SERVER_KEY_DIR'] = lockedKeyDir();
    await expect(getOrCreateServerKey()).rejects.toThrow(/session signing key|WORKFLOW_SERVER_KEY_DIR|HOME/);
  });

  it('probeSessionKeyWritable is true for a writable KEY_DIR', async () => {
    process.env['WORKFLOW_SERVER_KEY_DIR'] = join(tmp, 'probe-ok');
    await expect(probeSessionKeyWritable()).resolves.toBe(true);
  });

  it('probeSessionKeyWritable is false for an unwritable KEY_DIR', async () => {
    process.env['WORKFLOW_SERVER_KEY_DIR'] = lockedKeyDir();
    await expect(probeSessionKeyWritable()).resolves.toBe(false);
  });

  it('probeSessionKeyWritable is true when an existing valid key is readable', async () => {
    const keyDir = join(tmp, 'existing');
    process.env['WORKFLOW_SERVER_KEY_DIR'] = keyDir;
    await getOrCreateServerKey();
    _resetServerKeyCacheForTests();
    // Make directory non-writable but key still readable — probe should still pass.
    chmodSync(keyDir, 0o500);
    try {
      await expect(probeSessionKeyWritable()).resolves.toBe(true);
    } finally {
      chmodSync(keyDir, 0o700);
    }
  });
});
