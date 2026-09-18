import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectFindings } from '../guards/check-namespace-collision.js';

/**
 * A name two directories claim reaches neither of them, and every reference written the short way
 * stops resolving. The guards go on measuring both folders through their paths, so the collision
 * costs no coverage — which is precisely why nothing else would ever mention it. Stating it is what
 * turns a cost the corpus pays silently into one it decides to pay.
 */
describe('check-namespace-collision', () => {
  const corpus = (build: (root: string) => void): string => {
    const root = mkdtempSync(join(tmpdir(), 'namespace-collision-'));
    build(root);
    return root;
  };

  const workflow = (root: string, ...segments: string[]): void => {
    const dir = join(root, ...segments);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), `id: ${segments[segments.length - 1]}\nversion: 1.0.0\ntitle: t\n`);
  };

  const library = (root: string, ...segments: string[]): void => {
    mkdirSync(join(root, ...segments, 'techniques'), { recursive: true });
  };

  it('passes a corpus whose every directory name reaches one directory', () => {
    const root = corpus((at) => {
      workflow(at, 'product');
      library(at, 'support', 'shared-probe');
    });
    expect(collectFindings(root)).toEqual([]);
    rmSync(root, { recursive: true, force: true });
  });

  it('names both directories claiming one library name', () => {
    const root = corpus((at) => {
      workflow(at, 'product');
      library(at, 'left', 'twin');
      library(at, 'right', 'twin');
    });
    const findings = collectFindings(root);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.check).toBe('namespace-name-claimed-twice');
    expect(findings[0]?.site).toBe('left/twin right/twin');
    expect(findings[0]?.detail).toContain("named 'twin'");
    expect(findings[0]?.detail).toContain('reaches none of them');
    rmSync(root, { recursive: true, force: true });
  });

  it('reports a workflow name two directories claim, which nothing else reads', () => {
    // The index drops such a workflow from the map every other reader walks, so the one record of
    // the collision is the ambiguity list this guard reads.
    const root = corpus((at) => {
      workflow(at, 'alpha');
      workflow(at, 'one', 'clash');
      workflow(at, 'two', 'clash');
    });
    expect(collectFindings(root).map((f) => f.site)).toEqual(['one/clash two/clash']);
    rmSync(root, { recursive: true, force: true });
  });

  it('names each directory by the path the corpus knows it by, not by the pointed root', () => {
    // A `corpus/` grouping is above the paths every reference and every citation carry, so a site
    // spelled from the pointed directory would name a string nothing else in a ledger holds.
    const root = corpus((at) => {
      workflow(at, 'corpus', 'product');
      library(at, 'corpus', 'left', 'twin');
      library(at, 'corpus', 'right', 'twin');
    });
    expect(collectFindings(root).map((f) => f.site)).toEqual(['left/twin right/twin']);
    rmSync(root, { recursive: true, force: true });
  });

  it('says the name still reaches a claimant at the corpus root', () => {
    // A bare name falls through to the path of the same spelling, so the directory at the root keeps
    // the name and only the deeper one loses it. Reporting otherwise would tell an author the corpus
    // refuses a reference it serves.
    const root = corpus((at) => {
      workflow(at, 'product');
      library(at, 'twin');
      library(at, 'deep', 'twin');
    });
    const detail = collectFindings(root)[0]?.detail ?? '';
    expect(detail).toContain('reaches the one at the corpus root and none of the others');
    rmSync(root, { recursive: true, force: true });
  });

  it('refuses to report on a root holding no namespace at all', () => {
    const root = corpus(() => {});
    expect(() => collectFindings(root)).toThrow(/inspected nothing/);
    rmSync(root, { recursive: true, force: true });
  });
});
