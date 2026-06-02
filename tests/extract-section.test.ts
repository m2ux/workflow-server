import { describe, it, expect } from 'vitest';
import { extractMarkdownSection } from '../src/tools/resource-tools.js';

const DOC = [
  '# Title',
  '',
  'intro paragraph',
  '',
  '## Widget Template',
  '',
  'Use this skeleton:',
  '',
  '```markdown',
  '# {widget_name}',
  '## Section A',
  'body a',
  '## Section B',
  'body b',
  '```',
  '',
  'Notes after the fence.',
  '',
  '## Next Section',
  'other content',
].join('\n');

describe('extractMarkdownSection', () => {
  it('returns the whole section including a fenced skeleton whose lines look like headings', () => {
    const s = extractMarkdownSection(DOC, 'widget-template');
    expect(s).not.toBeNull();
    expect(s).toContain('## Widget Template');
    // Headings inside the ```markdown fence are content, not boundaries — must be retained.
    expect(s).toContain('## Section A');
    expect(s).toContain('## Section B');
    expect(s).toContain('Notes after the fence.');
    // Stops at the next real same-level heading outside the fence.
    expect(s).not.toContain('## Next Section');
    expect(s).not.toContain('other content');
  });

  it('returns null when the anchor matches no heading', () => {
    expect(extractMarkdownSection(DOC, 'no-such-anchor')).toBeNull();
  });
});
