import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectAudienceViolations, diffBaseline } from '../scripts/check-audience.js';

/**
 * Audience convention guard (#224 V4): an output declared `audience: agent` that also carries an
 * `#### artifact` filename must name a JSON artifact — an agent-audience artifact is serialized as
 * JSON on disk (docs/technique-protocol-specification.md §3.2). The corpus carries no agent-audience
 * adoption yet, so beyond the committed baseline (scripts/audience-baseline.json) the set is empty.
 */

const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

async function writeTechnique(techniquesDir: string, id: string, outputsBody: string[]): Promise<void> {
  await mkdir(techniquesDir, { recursive: true });
  await writeFile(
    join(techniquesDir, `${id}.md`),
    [...FM, '## Capability', '', 'Cap.', '', '## Outputs', '', ...outputsBody, ''].join('\n'),
    'utf-8',
  );
}

describe('audience guard (corpus)', () => {
  // PR227-TC-10 — the real corpus introduces no violations beyond the committed baseline.
  it('introduces no NEW non-JSON agent-audience artifacts beyond the baseline', async () => {
    const { added } = await diffBaseline();
    expect(added.map((v) => `${v.key} — ${v.detail}`)).toEqual([]);
  });
});

describe('audience guard (fixture corpus)', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'audience-guard-')));
  });
  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // PR227-TC-09 — an agent-audience artifact whose name is not JSON is flagged.
  it('flags an agent-audience output whose artifact name is not JSON', async () => {
    const dir = join(tempDir, 'fixture-wf', 'techniques');
    await writeTechnique(dir, 'bad', [
      '### state_log', '', 'Agent state.', '',
      '#### artifact', '', '`assumptions-log.md`', '',
      '#### audience', '', '`agent`',
    ]);
    const violations = await collectAudienceViolations(tempDir);
    expect(violations.map((v) => v.key)).toEqual(['fixture-wf::bad::state_log']);
    expect(violations[0]!.detail).toContain('assumptions-log.md');
  });

  it('passes a JSON-named agent-audience artifact and a human-audience markdown artifact', async () => {
    const dir = join(tempDir, 'fixture-wf', 'techniques');
    await writeTechnique(dir, 'ok-agent', [
      '### state_log', '', 'Agent state.', '',
      '#### artifact', '', '`assumptions-log.json`', '',
      '#### audience', '', '`agent`',
    ]);
    await writeTechnique(dir, 'ok-human', [
      '### summary', '', 'A human summary.', '',
      '#### artifact', '', '`design-review.md`', '',
      '#### audience', '', '`human`',
    ]);
    // An agent-audience output with NO artifact is out of scope (nothing written to disk to check).
    await writeTechnique(dir, 'ok-no-artifact', [
      '### transient_state', '', 'Bag-only state.', '',
      '#### audience', '', '`agent`',
    ]);
    const violations = await collectAudienceViolations(tempDir);
    expect(violations).toEqual([]);
  });

  it('accepts a {token}-templated agent artifact whose fixed suffix is .json', async () => {
    const dir = join(tempDir, 'fixture-wf', 'techniques');
    await writeTechnique(dir, 'templated', [
      '### state_log', '', 'Agent state.', '',
      '#### artifact', '', '`{package_name}-state.json`', '',
      '#### audience', '', '`agent`',
    ]);
    const violations = await collectAudienceViolations(tempDir);
    expect(violations).toEqual([]);
  });
});
