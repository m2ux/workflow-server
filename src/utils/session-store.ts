import { mkdir, readFile, writeFile, rename, unlink, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import type { SessionRecord } from './state-hash.js';

/**
 * Default sessions root: ~/.workflow-server/sessions/
 * Holds index files (<sid-hex>.path) and fallback state files (<sid-hex>.json)
 * for sessions that haven't been bound to a planning folder.
 */
export const DEFAULT_SESSIONS_ROOT = join(homedir(), '.workflow-server', 'sessions');

/**
 * On-disk format. Stored as JSON for human inspectability. NOT signed —
 * the wire token's `sh` field provides integrity (any tampering with this
 * file is detected at the next tool call when its hash fails to match).
 */
export interface StoredSession {
  schemaVersion: 1;
  sid: string;           // 32-char hex (canonical representation of the 16-byte sid)
  record: SessionRecord;
  shAtSave?: string;     // 32-char hex of sh at last save; informational only
}

/**
 * File-backed session store. Each session has:
 *   - an index file at <rootDir>/<sid>.path containing the absolute path to its state file
 *   - a state file at the indexed path containing the StoredSession JSON
 *
 * Fresh sessions place their state at <rootDir>/<sid>.json. The bind_session_path
 * tool relocates the state file into <planning>/.workflow/session.json and updates
 * the index pointer.
 */
export class SessionStore {
  constructor(private readonly rootDir: string = DEFAULT_SESSIONS_ROOT) {}

  private sidHex(sid: Buffer): string {
    if (sid.length !== 16) {
      throw new Error(`SessionStore: sid must be 16 bytes, got ${sid.length}`);
    }
    return sid.toString('hex');
  }

  private indexPath(sid: Buffer): string {
    return join(this.rootDir, `${this.sidHex(sid)}.path`);
  }

  /** Default state-file location for a session that has not been bound to a planning folder. */
  fallbackStatePath(sid: Buffer): string {
    return join(this.rootDir, `${this.sidHex(sid)}.json`);
  }

  private async writeAtomic(path: string, contents: string, mode = 0o600): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    const tmp = `${path}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    await writeFile(tmp, contents, { mode });
    try {
      await rename(tmp, path);
    } catch (err) {
      // Clean up tmp on failure; ignore unlink errors.
      try { await unlink(tmp); } catch { /* ignore */ }
      throw err;
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read the index for sid and return the absolute path to its state file, or
   * null if no index exists. Strips trailing whitespace from the index contents.
   */
  async resolveIndex(sid: Buffer): Promise<string | null> {
    try {
      const contents = await readFile(this.indexPath(sid), 'utf8');
      const path = contents.trim();
      return path.length > 0 ? path : null;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Load the SessionRecord for sid by following the index pointer.
   * Returns null when:
   *   - no index exists for this sid, or
   *   - the index points at a path that no longer exists (file deleted by user).
   * Throws on parse errors or schema-version mismatch.
   */
  async load(sid: Buffer): Promise<SessionRecord | null> {
    const path = await this.resolveIndex(sid);
    if (path === null) return null;
    try {
      const contents = await readFile(path, 'utf8');
      const parsed = JSON.parse(contents) as StoredSession;
      if (parsed.schemaVersion !== 1) {
        throw new Error(
          `SessionStore: unsupported schemaVersion ${parsed.schemaVersion} in ${path} (expected 1).`
        );
      }
      if (parsed.sid !== this.sidHex(sid)) {
        throw new Error(
          `SessionStore: sid mismatch in ${path} (file claims ${parsed.sid}, lookup was ${this.sidHex(sid)}).`
        );
      }
      return parsed.record;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Create a fresh session. Writes the state file at the fallback path
   * (<rootDir>/<sid>.json) and an index file pointing at it.
   *
   * Throws if an index already exists for this sid (defensive against
   * accidental session-id collisions or double-create logic bugs).
   */
  async create(sid: Buffer, record: SessionRecord, shAtSave?: Buffer): Promise<string> {
    if (await this.fileExists(this.indexPath(sid))) {
      throw new Error(
        `SessionStore: refusing to create sid ${this.sidHex(sid)} — index already exists. ` +
        `This indicates a duplicate session id or a logic bug in the caller.`
      );
    }
    const statePath = this.fallbackStatePath(sid);
    const stored: StoredSession = shAtSave
      ? { schemaVersion: 1, sid: this.sidHex(sid), record, shAtSave: shAtSave.toString('hex') }
      : { schemaVersion: 1, sid: this.sidHex(sid), record };
    await this.writeAtomic(statePath, JSON.stringify(stored, null, 2));
    await this.writeAtomic(this.indexPath(sid), statePath);
    return statePath;
  }

  /**
   * Overwrite the record at the path resolved by the index. The path must
   * already exist in the index; call create() or relocate() first.
   */
  async save(sid: Buffer, record: SessionRecord, shAtSave?: Buffer): Promise<void> {
    const path = await this.resolveIndex(sid);
    if (path === null) {
      throw new Error(
        `SessionStore: cannot save sid ${this.sidHex(sid)} — no index pointer. Call create() first.`
      );
    }
    const stored: StoredSession = shAtSave
      ? { schemaVersion: 1, sid: this.sidHex(sid), record, shAtSave: shAtSave.toString('hex') }
      : { schemaVersion: 1, sid: this.sidHex(sid), record };
    await this.writeAtomic(path, JSON.stringify(stored, null, 2));
  }

  /**
   * Move the session's state file to newPath and update the index.
   * - Path must be absolute and free of `..` traversal segments.
   * - Idempotent when newPath equals the current path.
   * - Handles cross-filesystem moves by copy-then-unlink.
   * - The state file's contents are preserved exactly (no re-serialization).
   */
  async relocate(sid: Buffer, newPath: string): Promise<void> {
    if (!isAbsolute(newPath)) {
      throw new Error(`SessionStore: relocate path must be absolute, got ${newPath}`);
    }
    if (newPath.split('/').includes('..')) {
      throw new Error(`SessionStore: relocate path must not contain '..' segments, got ${newPath}`);
    }
    const oldPath = await this.resolveIndex(sid);
    if (oldPath === null) {
      throw new Error(
        `SessionStore: cannot relocate sid ${this.sidHex(sid)} — no index pointer. Call create() first.`
      );
    }
    if (oldPath === newPath) return;

    await mkdir(dirname(newPath), { recursive: true });

    try {
      await rename(oldPath, newPath);
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'EXDEV') {
        // Cross-filesystem rename not supported — copy then unlink.
        const contents = await readFile(oldPath, 'utf8');
        await this.writeAtomic(newPath, contents);
        await unlink(oldPath);
      } else {
        throw err;
      }
    }
    await this.writeAtomic(this.indexPath(sid), newPath);
  }
}
