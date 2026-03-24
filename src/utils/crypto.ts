import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';

const KEY_DIR = join(homedir(), '.workflow-server');
const KEY_FILE = join(KEY_DIR, 'secret');
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // GCM standard
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

export async function getOrCreateServerKey(): Promise<Buffer> {
  if (existsSync(KEY_FILE)) {
    return readFile(KEY_FILE);
  }

  const key = randomBytes(KEY_LENGTH);
  await mkdir(KEY_DIR, { recursive: true, mode: 0o700 });
  await writeFile(KEY_FILE, key, { mode: 0o600 });
  return key;
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
  return decipher.update(ciphertext) + decipher.final('utf8');
}
