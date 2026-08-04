import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectUnmappedArtifacts, collectFindings } from '../scripts/check-artifact-guides.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Creation-guide mapping guard (#403 W5). Design principle 28 and the `no-template-creation-guide`
 * catalog entry both require that every artifact a workflow persists resolves to a guide carrying a
 * template and the rules that populate it. The guard resolves a guide two ways — the workflow's
 * authored artifact-to-guide map, or a resource that names the filename and carries a template
 * heading — and accepts a gap only when `scripts/artifact-guide-baseline.json` classifies it.
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

async function writeResource(resourcesDir: string, name: string, body: string[]): Promise<void> {
  await mkdir(resourcesDir, { recursive: true });
  await writeFile(join(resourcesDir, name), body.join('\n') + '\n', 'utf-8');
}

describe('artifact-guides guard (corpus)', () => {
  // Every corpus artifact either resolves to a guide or is classified in the baseline, so the guard
  // is clean without suppressing anything silently.
  it('resolves a guide for every persisted artifact, or finds it triaged', async () => {
    const findings = await collectFindings(corpusRoot());
    expect(findings.map((f) => `${f.site} — ${f.detail}`)).toEqual([]);
  });
});

describe('artifact-guides guard (fixture corpus)', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'artifact-guides-')));
  });
  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('flags an artifact no resource and no map accounts for', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`unguided-report.md`',
    ]);
    const unmapped = await collectUnmappedArtifacts(tempDir);
    expect(unmapped.map((v) => v.artifact)).toEqual(['unguided-report.md']);
    expect(unmapped[0]!.key).toBe('fixture-wf::writer::report');
  });

  it('accepts an artifact a resource names and templates', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`guided-report.md`',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'guided-report.md', [
      '# Guided Report Guide', '',
      'Creation guide for bare filename `guided-report.md`.', '',
      '## Template', '', '```markdown', '# Guided Report', '```',
    ]);
    expect(await collectUnmappedArtifacts(tempDir)).toEqual([]);
  });

  it('accepts an artifact the resources index maps, even when no resource names the filename', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`REPORT.md`',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'report-skeleton.md', [
      '# Report Skeleton', '', '## Skeleton', '', 'Sections.',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'README.md', [
      '# Fixture Resources', '',
      '## Planning artifact to guide map', '',
      '| Bare filename | Guide |', '|---|---|',
      '| `REPORT.md` | [report-skeleton](report-skeleton.md) |',
    ]);
    expect(await collectUnmappedArtifacts(tempDir)).toEqual([]);
  });

  // The defect this guards against: a body-wide filename match certifies coverage it has not got.
  // A guide's own "traces to" line names sibling artifacts, and a close-out guide names every
  // register it counts, so a loose match resolved evidence-log.md and token-usage.md to resources
  // that say nothing about their shape.
  it('does not accept a templated resource that names the filename only in its body', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### log', '', 'A register.', '',
      '#### artifact', '', '`evidence-log.md`',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'publication-record.md', [
      '---', 'name: publication-record',
      'description: Creation guide for `publication-record.md`.', '---', '',
      '# Publication Record Guide', '',
      'Creation guide for bare filename `publication-record.md`.', '',
      '## Template', '', '```markdown', '# Publication Record', '```', '',
      '## Rules', '',
      '- **Traces to** the review report and `evidence-log.md`.',
    ]);
    const unmapped = await collectUnmappedArtifacts(tempDir);
    expect(unmapped.map((v) => v.artifact)).toEqual(['evidence-log.md']);
  });

  it('accepts a guide that declares its artifact in the frontmatter description alone', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### record', '', 'A record.', '',
      '#### artifact', '', '`publication-record.md`',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'publication-record.md', [
      '---', 'name: publication-record',
      'description: Creation guide for `publication-record.md`.', '---', '',
      '# Publication Record Guide', '',
      '## Template', '', 'Fields.',
    ]);
    expect(await collectUnmappedArtifacts(tempDir)).toEqual([]);
  });

  it('does not accept a resource that names the filename without carrying a template', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`mentioned-only.md`',
    ]);
    await writeResource(join(tempDir, 'fixture-wf', 'resources'), 'notes.md', [
      '# Notes', '', 'The run writes `mentioned-only.md` somewhere.',
    ]);
    const unmapped = await collectUnmappedArtifacts(tempDir);
    expect(unmapped.map((v) => v.artifact)).toEqual(['mentioned-only.md']);
  });

  it('resolves a guide that lives in the shared meta resources', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'seeder', [
      '### planning_readme', '', 'The planning README.', '',
      '#### artifact', '', '`README.md`',
    ]);
    await writeResource(join(tempDir, 'meta', 'resources'), 'planning-readme.md', [
      '# Planning Folder README Guide', '',
      'Creation guide for `README.md`.', '',
      '## Template', '', 'Sections.',
    ]);
    // meta needs a techniques dir of its own for the walk to reach the fixture workflow at all.
    await writeTechnique(join(tempDir, 'meta', 'techniques'), 'noop', [
      '### value', '', 'No artifact.',
    ]);
    expect(await collectUnmappedArtifacts(tempDir)).toEqual([]);
  });

  // A triage that outlives its debt is a triage nobody prunes, so an entry matching nothing reports.
  // Stale reporting is scoped to the corpus the baseline describes, because a fixture corpus holds
  // none of the real declarations and would flag every entry.
  it('reports a baseline entry that matches no declaration, and honours the scope flag', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`unguided-report.md`',
    ]);
    const baselinePath = join(tempDir, 'fixture-baseline.json');
    await writeFile(baselinePath, JSON.stringify({
      entries: [{ site: 'ghost-wf::ghost::x', artifact: 'ghost.md', verdict: 'fix-later', rationale: 'r' }],
    }), 'utf-8');

    const withStale = await collectUnmappedArtifacts(tempDir, { reportStale: true, baselinePath });
    expect(withStale.filter((v) => v.stale).map((v) => v.artifact)).toEqual(['ghost.md']);

    const withoutStale = await collectUnmappedArtifacts(tempDir, { reportStale: false, baselinePath });
    expect(withoutStale.some((v) => v.stale)).toBe(false);
    expect(withoutStale.map((v) => v.artifact)).toEqual(['unguided-report.md']);
  });

  // An entry that still matches suppresses its artifact and is not reported stale.
  it('suppresses an artifact a live baseline entry accounts for', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'writer', [
      '### report', '', 'A report.', '',
      '#### artifact', '', '`unguided-report.md`',
    ]);
    const baselinePath = join(tempDir, 'fixture-baseline.json');
    await writeFile(baselinePath, JSON.stringify({
      entries: [{ site: 'fixture-wf::writer::report', artifact: 'unguided-report.md', verdict: 'fix-later', rationale: 'r' }],
    }), 'utf-8');
    expect(await collectUnmappedArtifacts(tempDir, { reportStale: true, baselinePath })).toEqual([]);
  });

  it('ignores an output that persists nothing', async () => {
    await writeTechnique(join(tempDir, 'fixture-wf', 'techniques'), 'computer', [
      '### verdict', '', 'A bag-only verdict with no artifact.',
    ]);
    expect(await collectUnmappedArtifacts(tempDir)).toEqual([]);
  });
});
