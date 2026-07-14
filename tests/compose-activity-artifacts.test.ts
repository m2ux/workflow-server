import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { composeActivityArtifacts } from '../src/tools/workflow-tools.js';

/**
 * get_activity artifacts-contract carry-through (#224 V4, Task 3): composeActivityArtifacts
 * synthesizes an activity's artifact contract from the `## Outputs` of the techniques its steps
 * bind. An output's `audience` must ride onto the contract entry so the worker knows an artifact's
 * intended reader (and on-disk format) at write time. The same array is emitted verbatim into the
 * get_activity body `{artifacts}` block and `_meta.artifacts` (workflow-tools.ts), so covering the
 * composed array covers both delivery surfaces (PR227-TC-07 / PR227-TC-08).
 */

const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

describe('composeActivityArtifacts audience carry-through', () => {
  let tempDir: string;
  const WF = 'fixture-wf';

  beforeEach(async () => {
    tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'compose-artifacts-')));
  });
  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  async function writeOp(id: string, outputsBody: string[]): Promise<void> {
    const dir = join(tempDir, WF, 'techniques');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, `${id}.md`),
      [...FM, '## Capability', '', 'Cap.', '', '## Outputs', '', ...outputsBody, ''].join('\n'),
      'utf-8',
    );
  }

  it('carries audience (agent and human) onto the contract entry, and omits it when absent', async () => {
    await writeOp('agent-op', [
      '### state_log', '', 'Agent state.', '',
      '#### artifact', '', '`assumptions-log.json`', '',
      '#### audience', '', '`agent`',
    ]);
    await writeOp('human-op', [
      '### summary', '', 'A human summary.', '',
      '#### artifact', '', '`design-review.md`', '',
      '#### audience', '', '`human`',
    ]);
    await writeOp('plain-op', [
      '### report', '', 'An artifact with no declared audience.', '',
      '#### artifact', '', '`plain-report.md`',
    ]);

    const activity = {
      steps: [
        { technique: 'agent-op' },
        { technique: 'human-op' },
        { technique: 'plain-op' },
      ],
    };
    const artifacts = await composeActivityArtifacts(activity, tempDir, WF, 'some-activity');

    const byName = Object.fromEntries(artifacts.map((a) => [a.name, a]));
    expect(byName['assumptions-log.json']!.audience).toBe('agent');
    expect(byName['design-review.md']!.audience).toBe('human');
    // An output with no declared audience carries no audience key on the contract entry.
    expect('audience' in byName['plain-report.md']!).toBe(false);
  });
});
