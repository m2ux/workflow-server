import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { citePath, corpusNamespaces, corpusWorkflows } from '../guards/workflows-root.js';
import { namespaceRefFromCitePath } from '../src/loaders/corpus-index.js';

/**
 * What the guards enumerate, and what they decline to.
 *
 * A guard sweeping techniques, resources or routines reads through `corpusNamespaces`, so a library
 * no workflow declares is measured rather than skipped — and skipping is the dangerous outcome,
 * because a sweep that reaches nothing reports the same success as one that reached everything.
 *
 * Both enumerations decline a directory the corpus refuses to answer for under any spelling.
 * Measuring one would hold an author to rules about a directory the server will not serve, and the
 * finding would name a place no reference can reach. They part over a name two directories claim: a
 * library stays reachable by its path and so stays measured, a workflow has only its name and so
 * does not.
 */
describe('what the guards enumerate', () => {
  let root: string;

  const workflow = (segments: string[], declaredId: string): void => {
    const dir = join(root, ...segments);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), `id: ${declaredId}\nversion: 1.0.0\ntitle: t\n`);
  };

  const library = (...segments: string[]): void => {
    mkdirSync(join(root, ...segments, 'techniques'), { recursive: true });
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-namespaces-'));
    workflow(['product'], 'product');
    workflow(['mismatched'], 'declares-something-else');
    library('support', 'shared-probe');
    library('left', 'twin');
    library('right', 'twin');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('reaches a library no workflow declares, which corpusWorkflows does not', () => {
    expect(corpusNamespaces(root).map((n) => n.path)).toContain('support/shared-probe');
    expect(corpusWorkflows(root).map((w) => w.id)).not.toContain('shared-probe');
  });

  it('carries a manifest for a workflow and none for a library', () => {
    const byPath = new Map(corpusNamespaces(root).map((n) => [n.path, n]));
    expect(byPath.get('product')?.manifest).toBe(join(root, 'product', 'workflow.yaml'));
    expect(byPath.get('support/shared-probe')?.manifest).toBeUndefined();
  });

  it('declines a directory whose definition declares another id, as corpusWorkflows does', () => {
    // The server refuses it under either name, so a guard measuring it would report against a
    // directory no reference reaches.
    expect(corpusNamespaces(root).map((n) => n.ref)).not.toContain('mismatched');
    expect(corpusWorkflows(root).map((w) => w.id)).not.toContain('mismatched');
  });

  it('measures both libraries of a name two directories claim, each under its path', () => {
    // Every reference into a library is a technique, resource or routine reference, and all three
    // take the path spelling — so both folders stay live and anything wrong inside either would
    // otherwise pass every check silently. A workflow has no second spelling and so keeps its
    // exclusion: start_session takes a name.
    expect(corpusNamespaces(root).filter((n) => n.path.endsWith('/twin')).map((n) => n.ref).sort())
      .toEqual(['left/twin', 'right/twin']);
  });

  it('publishes a workflow two directories claim as a library, carrying no definition', () => {
    // Its operations are borrowable by path and so are measured. Its graph is enterable only by
    // starting it under its name, which is the one thing a claimed name takes away, so a guard
    // grading a graph finds nothing here to read and does not hold an author to rules about a
    // product nobody can run.
    const twinned = mkdtempSync(join(tmpdir(), 'corpus-twin-wf-'));
    for (const side of ['one', 'two']) {
      const dir = join(twinned, side, 'clash');
      mkdirSync(join(dir, 'techniques'), { recursive: true });
      writeFileSync(join(dir, 'workflow.yaml'), 'id: clash\nversion: 1.0.0\ntitle: t\n');
    }
    const listed = corpusNamespaces(twinned);
    expect(listed.map((n) => n.ref)).toEqual(['one/clash', 'two/clash']);
    expect(listed.map((n) => n.manifest)).toEqual([undefined, undefined]);
    expect(corpusWorkflows(twinned)).toEqual([]);
    rmSync(twinned, { recursive: true, force: true });
  });

  it('names a namespace by the reference that reaches it and by the path reaching it', () => {
    const probe = corpusNamespaces(root).find((n) => n.ref === 'shared-probe');
    expect(probe).toMatchObject({ ref: 'shared-probe', path: 'support/shared-probe' });
    expect(probe?.dir).toBe(join(root, 'support', 'shared-probe'));
  });

  it('cites a file in a library by the namespace, as it cites one in a workflow', () => {
    // A finding quotes the string a reference into the file would carry. Naming the path from the
    // corpus root instead would key a library's findings on grouping folders — `support/` here —
    // that appear nowhere else in a ledger.
    const file = join(root, 'support', 'shared-probe', 'techniques', 'measure.md');
    writeFileSync(file, '# Measure\n');
    expect(citePath(root, file)).toBe('shared-probe/techniques/measure.md');
  });

  it('cites two files of one library name apart, and reads each key back to its own folder', () => {
    // One key for two files would let a triage record accepting a finding in one silence the same
    // finding in the other, and would count two defects as one. The key a ledger carries and the
    // owner a guard reads back off a file have to be the same string, or a guard keyed on one
    // spelling while citing the other matches nothing across files.
    const files = ['left', 'right'].map((side) => {
      const file = join(root, side, 'twin', 'techniques', 'op.md');
      writeFileSync(file, '# Op\n');
      return citePath(root, file);
    });
    expect(files).toEqual(['left/twin/techniques/op.md', 'right/twin/techniques/op.md']);
    expect(files.map((key) => namespaceRefFromCitePath(key))).toEqual(['left/twin', 'right/twin']);
  });

  it('agrees with a citation about which string names a workflow below the corpus root', () => {
    // A guard keyed on one of the two names and citing the other matches nothing across files, and
    // the silence reads as a value that nothing consumes rather than as a lookup that missed. The
    // two have to be the same string for a workflow that does not sit at the root.
    const nested = mkdtempSync(join(tmpdir(), 'corpus-cite-'));
    const dir = join(nested, 'specimens', 'conformance');
    mkdirSync(join(dir, 'techniques'), { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), 'id: conformance\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(dir, 'techniques', 'survey.md'), '# Survey\n');

    const entry = corpusNamespaces(nested).find((n) => n.path === 'specimens/conformance');
    const cited = citePath(nested, join(dir, 'techniques', 'survey.md'));
    expect(entry?.ref).toBe('conformance');
    expect(cited).toBe('conformance/techniques/survey.md');
    expect(namespaceRefFromCitePath(cited)).toBe(entry?.ref);
    rmSync(nested, { recursive: true, force: true });
  });
});
