import { describe, it, expect } from 'vitest';
import { collectBrokenAnchors } from '../scripts/check-resource-anchors.js';

/**
 * Resource-anchor guard: every relative `.md#anchor` link in the workflow corpus must resolve to a
 * rendered heading in the target file (headings inside code fences do not render and produce no
 * anchor). Techniques address resource templates, rules sections, and rubrics by these anchors; a
 * restructuring pass that renames a heading strands every referencer silently — resources are not
 * parsed by any other guard. Hard-zero: fix the link or restore the heading.
 */
describe('resource-anchor guard', () => {
  it('every relative .md#anchor link resolves to a rendered heading', () => {
    expect(collectBrokenAnchors().map((b) => `[${b.reason}] ${b.source} -> ${b.link}`)).toEqual([]);
  });
});
