import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { constants } from 'node:fs';
import { readFile, mkdir, open, access, writeFile, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const KEY_LENGTH = 32; // 256 bits
const KEY_FILE_NAME = 'secret';

let keyPromise: Promise<Buffer> | null = null;

/**
 * Directory that holds the server HMAC signing key (`secret`).
 *
 * Resolution order:
 * 1. `WORKFLOW_SERVER_KEY_DIR` (explicit key directory)
 * 2. `WORKFLOW_SERVER_STATE_DIR` (install/state root; key at `<dir>/secret`)
 * 3. `~/.workflow-server` via `os.homedir()`
 *
 * Docker `start.sh` sets `WORKFLOW_SERVER_KEY_DIR=/var/lib/workflow-server/state`
 * and bind-mounts `$INSTALL/state` there so non-root `--user` (HOME=/) still works.
 */
export function resolveKeyDir(): string {
  const explicit = process.env['WORKFLOW_SERVER_KEY_DIR']?.trim();
  if (explicit) return resolve(explicit);
  const stateDir = process.env['WORKFLOW_SERVER_STATE_DIR']?.trim();
  if (stateDir) return resolve(stateDir);
  return join(homedir(), '.workflow-server');
}

export function getServerKeyPaths(): { keyDir: string; keyFile: string } {
  const keyDir = resolveKeyDir();
  return { keyDir, keyFile: join(keyDir, KEY_FILE_NAME) };
}

/**
 * Clear the cached key promise (tests only). Production callers must not use this.
 */
export function _resetServerKeyCacheForTests(): void {
  keyPromise = null;
}

export async function getOrCreateServerKey(): Promise<Buffer> {
  if (keyPromise) return keyPromise;
  keyPromise = loadOrCreateKey().catch((err) => {
    keyPromise = null;
    throw err;
  });
  return keyPromise;
}

function isErrno(err: unknown, code: string): boolean {
  return err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === code;
}

function formatKeyAccessError(err: unknown, operation: string): Error {
  const { keyDir, keyFile } = getServerKeyPaths();
  const code =
    err instanceof Error && 'code' in err
      ? String((err as NodeJS.ErrnoException).code ?? 'unknown')
      : 'unknown';
  const detail = err instanceof Error ? err.message : String(err);
  return new Error(
    `Cannot ${operation} session signing key at '${keyFile}' (${code}: ${detail}). ` +
      `Key directory: '${keyDir}'. ` +
      `Fix: set WORKFLOW_SERVER_KEY_DIR (or WORKFLOW_SERVER_STATE_DIR) to a writable path, ` +
      `or ensure HOME points at a writable directory (Docker non-root often has HOME=/). ` +
      `Documented Docker layout mounts $INSTALL/state → /var/lib/workflow-server/state via start.sh.`,
  );
}

async function loadOrCreateKey(): Promise<Buffer> {
  const { keyDir, keyFile } = getServerKeyPaths();

  try {
    const key = await readFile(keyFile);
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Server key must be exactly ${KEY_LENGTH} bytes, got ${key.length}`);
    }
    return key;
  } catch (err: unknown) {
    if (!isErrno(err, 'ENOENT')) {
      if (isErrno(err, 'EACCES') || isErrno(err, 'EPERM')) {
        throw formatKeyAccessError(err, 'read');
      }
      throw err;
    }

    const key = randomBytes(KEY_LENGTH);
    try {
      await mkdir(keyDir, { recursive: true, mode: 0o700 });
    } catch (mkdirErr: unknown) {
      if (isErrno(mkdirErr, 'EACCES') || isErrno(mkdirErr, 'EPERM')) {
        throw formatKeyAccessError(mkdirErr, 'create directory for');
      }
      throw mkdirErr;
    }

    try {
      const fh = await open(keyFile, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o600);
      try {
        await fh.writeFile(key);
      } finally {
        await fh.close();
      }
    } catch (writeErr: unknown) {
      if (isErrno(writeErr, 'EEXIST')) {
        try {
          const existingKey = await readFile(keyFile);
          if (existingKey.length !== KEY_LENGTH) {
            throw new Error(
              `Server key must be exactly ${KEY_LENGTH} bytes, got ${existingKey.length} (concurrent write may have produced a truncated key)`,
            );
          }
          return existingKey;
        } catch (readErr: unknown) {
          if (isErrno(readErr, 'EACCES') || isErrno(readErr, 'EPERM')) {
            throw formatKeyAccessError(readErr, 'read');
          }
          throw readErr;
        }
      }
      if (isErrno(writeErr, 'EACCES') || isErrno(writeErr, 'EPERM')) {
        throw formatKeyAccessError(writeErr, 'write');
      }
      throw writeErr;
    }
    return key;
  }
}

/**
 * Readiness probe: existing key is readable, or the key directory is writable.
 * Does not mint the production secret; uses a short-lived write probe file.
 */
export async function probeSessionKeyWritable(): Promise<boolean> {
  const { keyDir, keyFile } = getServerKeyPaths();
  try {
    await access(keyFile, constants.R_OK);
    const key = await readFile(keyFile);
    return key.length === KEY_LENGTH;
  } catch {
    // fall through to write probe
  }

  try {
    await mkdir(keyDir, { recursive: true, mode: 0o700 });
    const probe = join(keyDir, `.write-probe-${process.pid}`);
    await writeFile(probe, 'ok', { mode: 0o600 });
    await unlink(probe);
    return true;
  } catch {
    return false;
  }
}

export function hmacSign(payload: string, key: Buffer): string {
  return createHmac('sha256', key).update(payload).digest('hex');
}

export function hmacVerify(payload: string, signature: string, key: Buffer): boolean {
  const expected = Buffer.from(hmacSign(payload, key), 'utf8');
  const actual = Buffer.from(signature, 'utf8');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
