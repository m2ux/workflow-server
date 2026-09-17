import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  identityMismatches,
  indexCorpus,
  namespaceLocation,
  namespaceSubdir,
  splitNamespaceRef,
  workflowIdFromCorpusPath,
  workflowLocation,
  workflowSubdir,
} from '../src/loaders/corpus-index.js';

/**
 * Corpus discovery: a namespace is a directory holding a library of techniques, resources or
 * routines, or holding a `workflow.yaml` — and one holding a definition is a workflow as well. A
 * namespace answers to its directory name and to the path that reaches it; the grouping folders
 * above it organise the corpus and name nothing.
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

  it('holds a folder of techniques no workflow declares as a namespace, and not as a workflow', () => {
    // What keeps such a folder out of the operator's catalogue is that it declares no definition,
    // rather than a list of names the listing excludes.
    expect(namespaceLocation(root, 'lib')?.dir).toBe(join(root, 'lib'));
    expect(workflowLocation(root, 'lib')).toBeNull();
    expect(indexCorpus(root).workflows.has('lib')).toBe(false);
  });

  it('holds a workflow as a namespace too, whether or not it carries a library yet', () => {
    // `flat` keeps techniques beside its definition and `yml-defined` keeps none: both answer to
    // their name, so a workflow needs nothing done to it to be addressable.
    expect(namespaceLocation(root, 'flat')?.dir).toBe(join(root, 'flat'));
    expect(namespaceLocation(root, 'yml-defined')?.dir).toBe(join(root, 'yml-defined'));
  });

  it('names a namespace by its path as well as by its directory name', () => {
    expect(namespaceLocation(root, 'security/audits/deep')?.dir).toBe(join(root, 'security', 'audits', 'deep'));
    expect(namespaceLocation(root, 'deep')?.dir).toBe(join(root, 'security', 'audits', 'deep'));
    // The grouping folders above it hold no library of their own, so neither answers to anything.
    expect(namespaceLocation(root, 'security')).toBeNull();
    expect(namespaceLocation(root, 'security/audits')).toBeNull();
  });

  it('resolves a namespace subdirectory from wherever the namespace sits', () => {
    expect(namespaceSubdir(root, 'lib', 'techniques')).toBe(join(root, 'lib', 'techniques'));
    expect(namespaceSubdir(root, 'no-such-namespace', 'techniques')).toBeNull();
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

  it('lists every workflow in a still-flat tree that has no named kind roots', () => {
    const flat = mkdtempSync(join(tmpdir(), 'corpus-flat-'));
    for (const id of ['alpha', 'beta', 'fan-conformance']) {
      const dir = join(flat, id);
      mkdirSync(dir);
      writeFileSync(join(dir, 'workflow.yaml'), `id: ${id}\nversion: 1.0.0\ntitle: t\n`);
    }
    expect([...indexCorpus(flat).workflows.keys()]).toEqual(['alpha', 'beta', 'fan-conformance']);
    rmSync(flat, { recursive: true, force: true });
  });

  it('lists a still-flat workflow whose directory is named corpus', () => {
    const flat = mkdtempSync(join(tmpdir(), 'corpus-named-'));
    const dir = join(flat, 'corpus');
    mkdirSync(dir);
    writeFileSync(join(dir, 'workflow.yaml'), 'id: corpus\nversion: 1.0.0\ntitle: t\n');
    expect([...indexCorpus(flat).workflows.keys()]).toEqual(['corpus']);
    expect(indexCorpus(flat).workflows.get('corpus')?.dir).toBe(dir);
    rmSync(flat, { recursive: true, force: true });
  });

  it('walks corpus/ when that grouping exists, and does not search sibling folders', () => {
    const nested = mkdtempSync(join(tmpdir(), 'corpus-nested-'));
    const product = join(nested, 'corpus', 'work-package');
    const specimen = join(nested, 'corpus', 'specimens', 'fan-conformance');
    const docsExample = join(nested, 'docs', 'example');
    const decoy = join(nested, 'notes', 'decoy');
    mkdirSync(product, { recursive: true });
    mkdirSync(specimen, { recursive: true });
    mkdirSync(docsExample, { recursive: true });
    mkdirSync(decoy, { recursive: true });
    mkdirSync(join(nested, 'ledgers'), { recursive: true });
    mkdirSync(join(nested, 'walks'), { recursive: true });
    writeFileSync(join(product, 'workflow.yaml'), 'id: work-package\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(specimen, 'workflow.yaml'), 'id: fan-conformance\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(docsExample, 'workflow.yaml'), 'id: example\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(decoy, 'workflow.yaml'), 'id: decoy\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(nested, 'ledgers', 'binding-fidelity-triage.json'), '{}\n');
    const index = indexCorpus(nested);
    expect([...index.workflows.keys()]).toEqual(['fan-conformance', 'work-package']);
    expect(index.workflows.get('work-package')?.dir).toBe(product);
    expect(index.workflows.get('fan-conformance')?.dir).toBe(specimen);
    expect(index.workflows.has('example')).toBe(false);
    expect(index.workflows.has('decoy')).toBe(false);
    expect([...indexCorpus(join(nested, 'corpus')).workflows.keys()]).toEqual(['fan-conformance', 'work-package']);
    rmSync(nested, { recursive: true, force: true });
  });

  it('leaves the grouping-s siblings outside the corpus whatever they are called', () => {
    // Naming the products rather than the folders that are not products: a tree that grows another
    // kind of folder needs no list amending, and an unforeseen name is outside for being a sibling.
    const nested = mkdtempSync(join(tmpdir(), 'corpus-siblings-'));
    const product = join(nested, 'corpus', 'work-package');
    for (const sibling of ['deploy', 'archive', 'anything-at-all']) {
      const dir = join(nested, sibling, 'example');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'workflow.yaml'), `id: ${sibling}-example\nversion: 1.0.0\ntitle: t\n`);
    }
    mkdirSync(product, { recursive: true });
    writeFileSync(join(product, 'workflow.yaml'), 'id: work-package\nversion: 1.0.0\ntitle: t\n');
    expect([...indexCorpus(nested).workflows.keys()]).toEqual(['work-package']);
    rmSync(nested, { recursive: true, force: true });
  });

  it('walks a grouping named for a kind, and a workflow named for one, inside the corpus', () => {
    // A directory the walk skips is a directory nothing reports, so a name excluded inside the
    // corpus would take every workflow beneath it away in silence.
    const nested = mkdtempSync(join(tmpdir(), 'corpus-kinds-nested-'));
    const grouped = join(nested, 'corpus', 'docs', 'beta');
    const namedForAKind = join(nested, 'corpus', 'walks');
    const deep = join(nested, 'corpus', 'group', 'ledgers', 'gamma');
    mkdirSync(grouped, { recursive: true });
    mkdirSync(namedForAKind, { recursive: true });
    mkdirSync(deep, { recursive: true });
    writeFileSync(join(grouped, 'workflow.yaml'), 'id: beta\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(namedForAKind, 'workflow.yaml'), 'id: walks\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(deep, 'workflow.yaml'), 'id: gamma\nversion: 1.0.0\ntitle: t\n');
    expect([...indexCorpus(nested).workflows.keys()]).toEqual(['beta', 'gamma', 'walks']);
    rmSync(nested, { recursive: true, force: true });
  });

  describe('splitting a reference into a namespace and the path within it', () => {
    it('takes the longest leading run that names a namespace', () => {
      const nested = mkdtempSync(join(tmpdir(), 'corpus-split-'));
      mkdirSync(join(nested, 'support', 'gitnexus', 'techniques'), { recursive: true });
      const split = splitNamespaceRef(nested, ['support', 'gitnexus', 'analyze']);
      expect(split).toMatchObject({ form: 'namespace', rest: ['analyze'] });
      expect(split?.form === 'namespace' && split.namespace.path).toBe('support/gitnexus');
      rmSync(nested, { recursive: true, force: true });
    });

    it('leaves at least one segment over, so a reference naming only a namespace splits to nothing', () => {
      expect(splitNamespaceRef(root, ['lib'])).toBeNull();
    });

    it('names no namespace when no leading run spells one', () => {
      expect(splitNamespaceRef(root, ['group', 'operation'])).toBeNull();
    });

    it('refuses a run two directories answer, naming both', () => {
      // `support/gitnexus/techniques/analyze.md` and `support/techniques/gitnexus/analyze.md` are
      // both addressed by `support::gitnexus::analyze`. Picking one would leave the other
      // unreachable under any spelling, so the reference resolves to neither.
      const contested = mkdtempSync(join(tmpdir(), 'corpus-shadow-'));
      mkdirSync(join(contested, 'support', 'gitnexus', 'techniques'), { recursive: true });
      mkdirSync(join(contested, 'support', 'techniques', 'gitnexus'), { recursive: true });
      const index = indexCorpus(contested);
      expect(index.shadowed).toEqual([{
        ref: 'support/gitnexus',
        kind: 'techniques',
        namespace: join(contested, 'support', 'gitnexus'),
        nested: join(contested, 'support', 'techniques', 'gitnexus'),
      }]);
      expect(splitNamespaceRef(index, ['support', 'gitnexus', 'analyze']))
        .toMatchObject({ form: 'shadowed', ref: 'support/gitnexus' });
      rmSync(contested, { recursive: true, force: true });
    });
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
