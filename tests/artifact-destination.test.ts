import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Artifact destination tests for Issue #1221:
 * - AC1: Activity declared artifact is written to the destination its run binds.
 * - AC2: Session state remains in its planning folder when a destination is bound.
 * - AC3: No session state file reaches the bound destination.
 * - AC4: A run that binds no destination writes its artifacts under {planning_folder_path}.
 */
describe.skipIf(!liveCorpusRoot())('artifact destination and session isolation (#1221)', () => {
  let harness: Harness;
  let client: Client;
  let session: SessionOps;

  beforeAll(async () => {
    harness = await createHarness();
    client = harness.client;
    session = sessionOps(harness, 'work-package');
  });

  afterAll(async () => {
    await harness.close();
  });

  it('AC1 & AC3: bound destination artifact is verified with no warning; no session state reaches destination', async () => {
    const slug = '2026-10-07-ac1-bound-dest';
    const folder = session.folder(slug);
    const boundDestDir = join(harness.workspaceDir, 'external-deliverables');
    mkdirSync(boundDestDir, { recursive: true });

    const idx = await session.start(slug, 'orchestrator');
    await session.enter(idx, 'start-work-package');

    // Simulate product write to bound destination
    const boundArtifactPath = join(boundDestDir, 'release-notes.md');
    writeFileSync(boundArtifactPath, '# Release Notes\nDelivered to reader.', 'utf8');

    const result = await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'design-philosophy',
        from_activity: 'start-work-package',
        artifacts_produced: [
          { id: 'release-notes', name: 'release-notes.md', path: boundArtifactPath },
        ],
        step_manifest: [{ step_id: 'detect-review-mode', output: { result: 'ok' } }],
      },
    });

    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;

    // AC1: Artifact is written to destination and recognized without outside-folder warning
    expect(existsSync(boundArtifactPath)).toBe(true);
    expect(warnings.some(w => w.includes('release-notes'))).toBe(false);

    // AC3: No session state file reaches the bound destination
    const destEntries = readdirSync(boundDestDir);
    expect(destEntries).toEqual(['release-notes.md']);
    expect(destEntries.includes('session.json')).toBe(false);
    expect(destEntries.includes('.session-token')).toBe(false);
  });

  it('AC2: session state remains in planning folder when destination is bound', async () => {
    const slug = '2026-10-07-ac2-session-state';
    const folder = session.folder(slug);
    const boundDestDir = join(harness.workspaceDir, 'external-reports');
    mkdirSync(boundDestDir, { recursive: true });

    const idx = await session.start(slug, 'orchestrator');
    await session.enter(idx, 'start-work-package');

    const artifactPath = join(boundDestDir, 'audit-summary.md');
    writeFileSync(artifactPath, '# Audit Summary\n', 'utf8');

    await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'design-philosophy',
        from_activity: 'start-work-package',
        artifacts_produced: [
          { id: 'audit-summary', name: 'audit-summary.md', path: artifactPath },
        ],
        step_manifest: [{ step_id: 'detect-review-mode', output: { result: 'ok' } }],
      },
    });

    // AC2: Session state remains in planning folder
    expect(existsSync(join(folder, 'session.json'))).toBe(true);
    const sessionState = JSON.parse(readFileSync(join(folder, 'session.json'), 'utf8')) as {
      declaredArtifacts?: Array<{ id: string; name: string; path?: string }>;
    };
    expect(sessionState.declaredArtifacts?.some(a => a.id === 'audit-summary' && a.path === artifactPath)).toBe(true);
  });

  it('AC4: run binding no destination writes artifacts under planning_folder_path', async () => {
    const slug = '2026-10-07-ac4-unbound-dest';
    const folder = session.folder(slug);

    const idx = await session.start(slug, 'orchestrator');
    await session.enter(idx, 'start-work-package');

    // Default unbound behavior writes under planning folder
    const unboundArtifactPath = join(folder, '01-intake-report.md');
    writeFileSync(unboundArtifactPath, '# Intake Report\n', 'utf8');

    const result = await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'design-philosophy',
        from_activity: 'start-work-package',
        artifacts_produced: [
          { id: 'intake-report', name: '01-intake-report.md' },
        ],
        step_manifest: [{ step_id: 'detect-review-mode', output: { result: 'ok' } }],
      },
    });

    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;

    // Unbound artifact exists in planning folder and causes no warning
    expect(existsSync(unboundArtifactPath)).toBe(true);
    expect(warnings.some(w => w.includes('01-intake-report.md') || w.includes('intake-report'))).toBe(false);
  });

  it('warns when an artifact declared with an outside bound destination does not exist', async () => {
    const slug = '2026-10-07-missing-outside-dest';
    const folder = session.folder(slug);
    const nonExistentPath = join(harness.workspaceDir, 'non-existent-folder', 'ghost-artifact.md');

    const idx = await session.start(slug, 'orchestrator');
    await session.enter(idx, 'start-work-package');

    const result = await client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: 'design-philosophy',
        from_activity: 'start-work-package',
        artifacts_produced: [
          { id: 'ghost-artifact', name: 'ghost-artifact.md', path: nonExistentPath },
        ],
        step_manifest: [{ step_id: 'detect-review-mode', output: { result: 'ok' } }],
      },
    });

    expect(result.isError).toBeFalsy();
    const warnings = ((result._meta as Record<string, unknown>)['validation'] as { warnings: string[] }).warnings;
    expect(warnings.some(w => w.includes('ghost-artifact') && w.includes('missing at bound destination'))).toBe(true);
  });
});
