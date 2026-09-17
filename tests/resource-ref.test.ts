import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { qualifyResourceId, parseResourceRef, extractResourceIds } from '../src/utils/resource-ref.js';

describe('extractResourceIds', () => {
  it('keeps the workflow a cross-workflow link points at', () => {
    // A work-package technique linking meta's register: the id must resolve against
    // meta's tree, not the reader's own, whichever workflow is delivering.
    expect(extractResourceIds('[Register](../../../meta/resources/writing-register.md)'))
      .toEqual(['meta/writing-register']);
    expect(extractResourceIds('[Prose](../../meta/resources/writing-register.md#prose)'))
      .toEqual(['meta/writing-register#prose']);
  });

  it('leaves a same-workflow link bare', () => {
    expect(extractResourceIds('[Layout](../resources/findings-report.md)'))
      .toEqual(['findings-report']);
    expect(extractResourceIds('[Severity](../resources/findings-report.md#severity)'))
      .toEqual(['findings-report#severity']);
  });

  it('skips an illustrative path that is not a resource id', () => {
    // A resource id is `[<workflow>/]<slug>`; a deeper path is a filesystem path,
    // and an example one in prose is not a ref a worker should try to load.
    expect(extractResourceIds('rendered as `[display-path](relative/path/to/file.md)`'))
      .toEqual([]);
  });

  it('reads an explicit resources: array', () => {
    expect(extractResourceIds('resources: [review-mode, meta/planning-readme]'))
      .toEqual(['review-mode', 'meta/planning-readme']);
  });
});

describe('qualifyResourceId (PR366-TC-20)', () => {
  it('prefixes bare ids when technique workflow differs from delivery', () => {
    expect(qualifyResourceId('bootstrap-protocol', 'meta', 'work-package')).toBe('meta/bootstrap-protocol');
  });
  it('leaves already-qualified and same-workflow bare ids unchanged', () => {
    expect(qualifyResourceId('meta/bootstrap-protocol', 'meta', 'work-package')).toBe('meta/bootstrap-protocol');
    expect(qualifyResourceId('review-mode', 'work-package', 'work-package')).toBe('review-mode');
  });
  it('preserves section anchors on bare ids when qualifying', () => {
    const q = qualifyResourceId('bootstrap-protocol#steps', 'meta', 'work-package');
    expect(q).toBe('meta/bootstrap-protocol#steps');
    expect(parseResourceRef(q).section).toBe('steps');
  });
});

describe('parseResourceRef — where the namespace ends', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'resource-ns-'));
    mkdirSync(join(root, 'support', 'gitnexus', 'resources'), { recursive: true });
    mkdirSync(join(root, 'meta', 'resources'), { recursive: true });
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('takes the first segment when no corpus says otherwise', () => {
    // The spelling a namespace at the corpus root has always had, and the answer every caller
    // holding no corpus gets.
    expect(parseResourceRef('meta/bootstrap-protocol'))
      .toEqual({ namespace: 'meta', id: 'bootstrap-protocol', section: undefined });
    expect(parseResourceRef('support/gitnexus/index-reading'))
      .toEqual({ namespace: 'support', id: 'gitnexus/index-reading', section: undefined });
  });

  it('takes the longest run naming a namespace when a corpus is supplied', () => {
    expect(parseResourceRef('support/gitnexus/index-reading', root))
      .toEqual({ namespace: 'support/gitnexus', id: 'index-reading', section: undefined });
    expect(parseResourceRef('gitnexus/index-reading', root))
      .toEqual({ namespace: 'support/gitnexus', id: 'index-reading', section: undefined });
  });

  it('keeps a section anchor across either reading', () => {
    expect(parseResourceRef('support/gitnexus/index-reading#freshness', root))
      .toEqual({ namespace: 'support/gitnexus', id: 'index-reading', section: 'freshness' });
  });

  it('names no namespace where no leading run spells one', () => {
    expect(parseResourceRef('nowhere/at-all', root))
      .toEqual({ namespace: undefined, id: 'nowhere/at-all', section: undefined });
  });
});
