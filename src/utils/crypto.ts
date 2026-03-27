import { randomBytes, createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const KEY_DIR = join(homedir(), '.workflow-server');
const KEY_FILE = join(KEY_DIR, 'secret');
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // GCM standard
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

export async function getOrCreateServerKey(): Promise<Buffer> {
  try {
    const key = await readFile(KEY_FILE);
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Server key must be exactly ${KEY_LENGTH} bytes, got ${key.length}`);
    }
    return key;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      const key = randomBytes(KEY_LENGTH);
      await mkdir(KEY_DIR, { recursive: true, mode: 0o700 });
      const tmpFile = `${KEY_FILE}.${process.pid}.tmp`;
      await writeFile(tmpFile, key, { mode: 0o600 });
      await rename(tmpFile, KEY_FILE);
      return key;
    }
    throw err;
  }
}

export function encryptToken(token: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encrypted: string, key: Buffer): string {
  const parts = encrypted.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted token format');

  const iv = Buffer.from(parts[0]!, 'hex');
  const authTag = Buffer.from(parts[1]!, 'hex');
  const ciphertext = Buffer.from(parts[2]!, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
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
