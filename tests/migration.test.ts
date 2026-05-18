import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, copyFileSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import {
  migratePlanningFolder,
  MigrationError,
  hasLegacyArtifacts,
  LEGACY_STATE_FILE_NAME,
  PLANNING_RELATIVE_DIR,
  SEAL_FILE_NAME,
  SESSION_FILE_NAME,
  sessionFileExists,
  verifySeal,
} from '../src/utils/session/index.js';
import { safeValidateSessionFile } from '../src/schema/session.schema.js';

const FIXTURE_DIR = resolve(import.meta.dirname, 'fixtures/legacy-session');

async function makePlanningFolder(): Promise<{ workspaceDir: string; folder: string; cleanup: () => void }> {
  const workspaceDir = mkdtempSync(join(tmpdir(), 'wf-mig-test-'));
  const folder = join(workspaceDir, PLANNING_RELATIVE_DIR, 'test-slug');
  await mkdir(folder, { recursive: true });
  return {
    workspaceDir,
    folder,
    cleanup: () => {
      try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}

describe('migration converter', () => {
  let workspaceDir: string;
  let folder: string;
  let cleanup: () => void;

  beforeEach(async () => {
    const setup = await makePlanningFolder();
    workspaceDir = setup.workspaceDir;
    folder = setup.folder;
    cleanup = setup.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  describe('full legacy envelope + sibling token', () => {
    it('converts the actual workflow-state.json fixture into a valid session.json + new seal', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      const result = await migratePlanningFolder(folder);
      expect(result.migrated).toBe(true);
      expect(result.reason).toBe('converted-from-envelope');
      expect(result.state).toBeDefined();
      expect(result.state!.schemaVersion).toBe(1);
      expect(result.state!.sessionIndex).toMatch(/^[A-Z2-7]{6}$/);
      expect(result.state!.workflowId).toBe('work-package');
      expect(result.state!.workflowVersion).toBe('3.11.0');
      // Variables from the envelope were carried over.
      expect(result.state!.variables['issue_number']).toBe('42');
      expect(result.state!.completedActivities).toContain('start-work-package');
    });

    it('the new seal verifies on the resulting (session.json, .session-token) pair', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      await migratePlanningFolder(folder);
      const { state } = await verifySeal(folder);
      const parsed = safeValidateSessionFile(state);
      expect(parsed.success).toBe(true);
    });
  });

  describe('envelope only, pre-split sessionToken embedded inside', () => {
    it('decodes the embedded sessionToken field as a fallback when no sibling .session-token exists', async () => {
      // Construct an envelope with an embedded sessionToken (pre-split format).
      const legacyToken = readFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), 'utf8').trim();
      const envelope = {
        stateVersion: 1,
        savedAt: '2024-01-15T12:00:00Z',
        startedAt: '2024-01-15T10:00:00Z',
        sessionToken: legacyToken,
        state: { variables: { foo: 'bar' }, completedActivities: [], history: [], status: 'running' },
      };
      writeFileSync(join(folder, LEGACY_STATE_FILE_NAME), JSON.stringify(envelope));

      const result = await migratePlanningFolder(folder);
      expect(result.migrated).toBe(true);
      expect(result.reason).toBe('converted-from-envelope');
      expect(result.state!.workflowId).toBe('work-package');
      expect(result.state!.variables['foo']).toBe('bar');
    });
  });

  describe('orphan .session-token only (no envelope)', () => {
    it('reconstructs a minimal session.json from the token payload', async () => {
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      const result = await migratePlanningFolder(folder);
      expect(result.migrated).toBe(true);
      expect(result.reason).toBe('converted-from-orphan-token');
      expect(result.state!.workflowId).toBe('work-package');
      // No envelope → no variables / no completed activities.
      expect(result.state!.completedActivities).toEqual([]);
    });
  });

  describe('auto-trigger from start_session', () => {
    // Verified via the mcp-server integration test below; here we just
    // assert the public API surface that start_session calls.
    it('exports migratePlanningFolder for start_session to call', () => {
      expect(typeof migratePlanningFolder).toBe('function');
    });
  });

  describe('clean cutover (no coexistence)', () => {
    it('removes the legacy workflow-state.json after a successful conversion', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      await migratePlanningFolder(folder);

      expect(existsSync(join(folder, LEGACY_STATE_FILE_NAME))).toBe(false);
      expect(existsSync(join(folder, SESSION_FILE_NAME))).toBe(true);
      expect(existsSync(join(folder, SEAL_FILE_NAME))).toBe(true);
    });
  });

  describe('detect-on-read idempotency', () => {
    it('second call short-circuits when session.json is already present', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      const first = await migratePlanningFolder(folder);
      expect(first.migrated).toBe(true);

      // Second call must NOT throw (the legacy workflow-state.json is gone)
      // and must short-circuit by detecting the new session.json.
      const second = await migratePlanningFolder(folder);
      expect(second.migrated).toBe(false);
      expect(second.reason).toBe('already-migrated');
    });

    it('a folder with no legacy artefacts returns no-legacy-state', async () => {
      const result = await migratePlanningFolder(folder);
      expect(result.migrated).toBe(false);
      expect(result.reason).toBe('no-legacy-state');
    });
  });

  describe('corrupt legacy envelope', () => {
    it('throws MigrationError with the legacy path when workflow-state.json is not JSON', async () => {
      writeFileSync(join(folder, LEGACY_STATE_FILE_NAME), '{not-json');

      await expect(migratePlanningFolder(folder)).rejects.toThrow(MigrationError);
      try {
        await migratePlanningFolder(folder);
      } catch (err) {
        expect(err).toBeInstanceOf(MigrationError);
        expect((err as MigrationError).folder).toBe(folder);
        expect((err as MigrationError).message).toContain(LEGACY_STATE_FILE_NAME);
        expect((err as MigrationError).message).toContain('rerun against the most recent valid commit');
      }
    });

    it('throws MigrationError when workflow-state.json is a non-object JSON value', async () => {
      writeFileSync(join(folder, LEGACY_STATE_FILE_NAME), '"just-a-string"');

      await expect(migratePlanningFolder(folder)).rejects.toThrow(MigrationError);
    });
  });

  describe('orphan token decode failure', () => {
    it('throws MigrationError when the orphan .session-token has no payload separator', async () => {
      writeFileSync(join(folder, SEAL_FILE_NAME), 'not-a-token-at-all');

      await expect(migratePlanningFolder(folder)).rejects.toThrow(MigrationError);
      try {
        await migratePlanningFolder(folder);
      } catch (err) {
        expect(err).toBeInstanceOf(MigrationError);
        expect((err as MigrationError).message).toContain(SEAL_FILE_NAME);
      }
    });

    it('throws MigrationError when the orphan .session-token has a separator but the payload is undecodable', async () => {
      // Bogus payload: garbage that base64-decodes but is not valid JSON.
      writeFileSync(join(folder, SEAL_FILE_NAME), 'YWxh.bogus');

      await expect(migratePlanningFolder(folder)).rejects.toThrow(MigrationError);
    });
  });

  describe('already-migrated folder reused', () => {
    it('verifySeal succeeds on a freshly-migrated folder', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));

      await migratePlanningFolder(folder);

      // A no-op second pass — sessionFileExists is true and we short-circuit.
      const second = await migratePlanningFolder(folder);
      expect(second.migrated).toBe(false);

      // Seal still verifies (we did not touch state on the no-op pass).
      const { state } = await verifySeal(folder);
      const parsed = safeValidateSessionFile(state);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Diagnostics helpers', () => {
    it('hasLegacyArtifacts detects an envelope', async () => {
      copyFileSync(join(FIXTURE_DIR, LEGACY_STATE_FILE_NAME), join(folder, LEGACY_STATE_FILE_NAME));
      expect(await hasLegacyArtifacts(folder)).toBe(true);
    });

    it('hasLegacyArtifacts detects a legacy token (b64.sig form)', async () => {
      copyFileSync(join(FIXTURE_DIR, SEAL_FILE_NAME), join(folder, SEAL_FILE_NAME));
      expect(await hasLegacyArtifacts(folder)).toBe(true);
    });

    it('hasLegacyArtifacts returns false on a fresh folder', async () => {
      expect(await hasLegacyArtifacts(folder)).toBe(false);
    });

    it('hasLegacyArtifacts returns false on a folder with a new-style seal (no dot separator)', async () => {
      // A new seal is 64 hex chars with no "." — distinguishable from legacy.
      writeFileSync(join(folder, SEAL_FILE_NAME), 'a'.repeat(64));
      expect(await hasLegacyArtifacts(folder)).toBe(false);
    });
  });
});
