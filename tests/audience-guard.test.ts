import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectAudienceViolations, collectFindings } from '../scripts/check-audience.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Audience convention guard (#224 V4): an output declared `audience: agent` that also carries an
 * `#### artifact` filename must name a JSON artifact — an agent-audience artifact is serialized as
 * JSON on disk (docs/technique-protocol-specification.md §3.2). Hard zero: the convention has no
 * accepted exceptions, and the retired baseline held an empty array (#327 R5).
 *
 * Presence is checked from the same walk: an output declaring an artifact declares an audience for
 * it. Absence reads as `human`, so an undeclared register keeps a prose shape by default rather than
 * by decision. An output with no artifact is out of scope for both halves — audience is a property
 * of a file on disk.
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
  // PR227-TC-10 — the real corpus declares no non-JSON agent-audience artifact.
  it('names every agent-audience artifact as JSON', async () => {
    const findings = await collectFindings(corpusRoot());
    expect(findings.map((f) => `${f.site} — ${f.detail}`)).toEqual([]);
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
    expect(violations[0]!.check).toBe('audience-json-format');
    expect(violations[0]!.detail).toContain('assumptions-log.md');
  });

  // Absence reads as `human`, so an undeclared artifact keeps a prose shape by default rather than
  // by decision. The guard reports it so the reader is chosen rather than inherited.
  it('flags an artifact-bearing output that declares no audience', async () => {
    const dir = join(tempDir, 'fixture-wf', 'techniques');
    await writeTechnique(dir, 'undeclared', [
      '### report', '', 'A report with no declared reader.', '',
      '#### artifact', '', '`design-review.md`',
    ]);
    const violations = await collectAudienceViolations(tempDir);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.check).toBe('audience-declared');
    expect(violations[0]!.detail).toContain('design-review.md');
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
