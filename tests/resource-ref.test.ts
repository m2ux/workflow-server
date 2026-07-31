import { describe, it, expect } from 'vitest';
import { qualifyResourceId, parseResourceRef } from '../src/utils/resource-ref.js';

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
