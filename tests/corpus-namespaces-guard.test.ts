import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { citePath, corpusNamespaces, corpusWorkflows } from '../guards/workflows-root.js';

/**
 * What the guards enumerate, and what they decline to.
 *
 * A guard sweeping techniques, resources or routines reads through `corpusNamespaces`, so a library
 * no workflow declares is measured rather than skipped — and skipping is the dangerous outcome,
 * because a sweep that reaches nothing reports the same success as one that reached everything.
 *
 * Both enumerations decline a directory the corpus refuses to answer for, on the same terms.
 * Measuring one would hold an author to rules about a directory the server will not serve, and the
 * finding would name a place no reference can reach.
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
    expect(corpusNamespaces(root).map((n) => n.id)).not.toContain('mismatched');
    expect(corpusWorkflows(root).map((w) => w.id)).not.toContain('mismatched');
  });

  it('declines a name two directories claim, rather than listing it twice', () => {
    // Neither resolves under the name, and a list holding both would count two where none answers.
    expect(corpusNamespaces(root).filter((n) => n.id === 'twin')).toEqual([]);
  });

  it('names a namespace by its directory and by the path reaching it', () => {
    const probe = corpusNamespaces(root).find((n) => n.id === 'shared-probe');
    expect(probe).toMatchObject({ id: 'shared-probe', path: 'support/shared-probe' });
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
    expect(entry?.id).toBe('conformance');
    expect(cited).toBe('conformance/techniques/survey.md');
    expect(cited.split('/')[0]).toBe(entry?.id);
    rmSync(nested, { recursive: true, force: true });
  });
});
