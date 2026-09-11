import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { identityMismatches, indexCorpus, workflowIdFromCorpusPath, workflowLocation, workflowSubdir } from '../src/loaders/corpus-index.js';

/**
 * Corpus discovery: a workflow is a directory holding a `workflow.yaml`, at any depth beneath the
 * root, and its directory name is its id. The grouping folders above it organise the corpus and
 * name nothing.
 */
describe('corpus discovery', () => {
  let root: string;

  const workflow = (...segments: string[]): string => {
    const dir = join(root, ...segments);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), `id: ${segments[segments.length - 1]}\nversion: 1.0.0\ntitle: t\n`);
    return dir;
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-index-'));
    workflow('flat');
    workflow('security', 'audits', 'deep');
    workflow('yml-defined');
    rmSync(join(root, 'yml-defined', 'workflow.yaml'));
    writeFileSync(join(root, 'yml-defined', 'workflow.yml'), 'id: yml-defined\nversion: 1.0.0\ntitle: t\n');

    // A workflow's own parts, and a group folder that shares their reserved names.
    mkdirSync(join(root, 'flat', 'activities'), { recursive: true });
    mkdirSync(join(root, 'flat', 'techniques', 'group'), { recursive: true });
    mkdirSync(join(root, 'flat', 'resources'), { recursive: true });
    writeFileSync(join(root, 'flat', 'techniques', 'group', 'workflow.yaml'), 'id: group\nversion: 1.0.0\ntitle: t\n');

    // A folder of techniques no workflow declares.
    mkdirSync(join(root, 'lib', 'techniques'), { recursive: true });

    // A dotfolder — repository plumbing, never a workflow.
    mkdirSync(join(root, '.github', 'ci'), { recursive: true });
    writeFileSync(join(root, '.github', 'ci', 'workflow.yaml'), 'id: ci\nversion: 1.0.0\ntitle: t\n');
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('finds workflows at any depth, keyed by their directory name', () => {
    const index = indexCorpus(root);
    expect([...index.workflows.keys()]).toEqual(['deep', 'flat', 'yml-defined']);
    expect(index.workflows.get('deep')?.dir).toBe(join(root, 'security', 'audits', 'deep'));
    expect(index.workflows.get('yml-defined')?.manifest).toBe(join(root, 'yml-defined', 'workflow.yml'));
  });

  it('never descends into a reserved folder, at the root or beneath a workflow', () => {
    expect(indexCorpus(root).workflows.has('group')).toBe(false);
  });

  it('leaves a folder of techniques no workflow declares undiscovered', () => {
    expect(workflowLocation(root, 'lib')).toBeNull();
  });

  it('skips dotfolders', () => {
    expect(workflowLocation(root, 'ci')).toBeNull();
  });

  it('resolves a workflow subdirectory from wherever the workflow sits', () => {
    expect(workflowSubdir(root, 'deep', 'techniques')).toBe(join(root, 'security', 'audits', 'deep', 'techniques'));
    expect(workflowSubdir(root, 'no-such-workflow', 'techniques')).toBeNull();
  });

  it('holds a construct file under a nested workflow by id, not by a path from the root', () => {
    const present = join(root, 'security', 'audits', 'deep', 'techniques', 'present.md');
    mkdirSync(join(root, 'security', 'audits', 'deep', 'techniques'), { recursive: true });
    writeFileSync(present, '# present\n');
    expect(workflowSubdir(root, 'deep', join('techniques', 'present.md'))).toBe(present);
    expect(indexCorpus(root).workflows.has('security')).toBe(false);
  });

  it('refuses a directory whose definition declares a different id', () => {
    const clash = mkdtempSync(join(tmpdir(), 'corpus-mismatch-'));
    const dir = join(clash, 'group', 'prism');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), 'id: audits\nversion: 1.0.0\ntitle: t\n');
    const index = indexCorpus(clash);
    expect(index.workflows.has('prism')).toBe(true);
    expect(index.workflows.has('audits')).toBe(false);
    expect(identityMismatches(index)).toEqual([{
      directory: 'prism',
      declared: 'audits',
      dir,
      manifest: join(dir, 'workflow.yaml'),
    }]);
    expect(workflowLocation(clash, 'prism')).toBeNull();
    expect(workflowLocation(clash, 'audits')).toBeNull();
    rmSync(clash, { recursive: true, force: true });
  });

  it('refuses a value that is neither a root nor an index', () => {
    expect(() => workflowSubdir(0 as never, 'deep', 'techniques')).toThrow(/corpus root or a CorpusIndex/);
  });

  it('names the workflow a corpus path belongs to by the construct directory, not the first segment', () => {
    expect(workflowIdFromCorpusPath('prism/techniques/plan-analysis.md')).toBe('prism');
    expect(workflowIdFromCorpusPath('security/audits/prism/techniques/plan-analysis.md')).toBe('prism');
    expect(workflowIdFromCorpusPath('security/audits/prism/workflow.yaml')).toBe('prism');
    expect(workflowIdFromCorpusPath('security/audits/prism/activities/patterns/01-pass.yaml')).toBe('prism');
    expect(workflowIdFromCorpusPath('LICENSE')).toBeNull();
  });

  it('resolves an id claimed by two directories to neither, and reports the claimants', () => {
    const contested = mkdtempSync(join(tmpdir(), 'corpus-contested-'));
    for (const group of ['left', 'right']) {
      const dir = join(contested, group, 'twin');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'workflow.yaml'), 'id: twin\nversion: 1.0.0\ntitle: t\n');
    }
    const index = indexCorpus(contested);
    expect(index.workflows.has('twin')).toBe(false);
    expect(index.ambiguous).toEqual([{ id: 'twin', dirs: [join(contested, 'left', 'twin'), join(contested, 'right', 'twin')] }]);
    rmSync(contested, { recursive: true, force: true });
  });
});
