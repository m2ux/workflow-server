import { describe, expect, it } from 'vitest';
import { DECLARATION_MARKER, formatListing, listUnits } from '../guards/check-fires-on-ids.js';
import { queryArg } from '../guards/list-fires-on.js';

const HOME = 'corpus/canon/resources/anti-patterns.md';
const OTHER = 'corpus/canon/resources/design-principles.md';
const QUERY = 'activity.steps[].when';

function line(ids: string): string {
  return `${DECLARATION_MARKER} ${ids}`;
}

/**
 * One home whose units declare the queried field, a prefix of it, its bare kind, `*`, a sibling
 * field, and another kind. Line numbers are the marker lines in this text.
 */
const CATALOG = [
  '# Catalog',
  '',
  '### Exact field',
  '',
  line('`activity.steps[].when`'),
  '',
  '### Steps prefix',
  '',
  line('`activity.steps`'),
  '',
  '### The activity kind',
  '',
  line('`activity`'),
  '',
  '### All definition text',
  '',
  line('`*`'),
  '',
  '### Sibling field',
  '',
  line('`activity.steps[].message`'),
  '',
  '### Another kind',
  '',
  line('`technique.protocol`'),
  '',
].join('\n');

const PRINCIPLE = [
  '# Principles',
  '',
  '## 9. Encode Constraints as Structure',
  '',
  line('`activity.exits`, `activity`'),
  '',
].join('\n');

describe('list-fires-on', () => {
  const texts = [
    { path: HOME, text: CATALOG },
    { path: OTHER, text: PRINCIPLE },
  ];

  it('lists the units that declare the field, a prefix, its bare kind, or *', () => {
    const listed = listUnits(texts, QUERY);
    expect(listed.map((unit) => unit.unit)).toEqual([
      'Exact field',
      'Steps prefix',
      'The activity kind',
      'All definition text',
      '9. Encode Constraints as Structure',
    ]);
    expect(listed.map((unit) => `${unit.path}:${unit.line}`)).toEqual([
      `${HOME}:5`,
      `${HOME}:9`,
      `${HOME}:13`,
      `${HOME}:17`,
      `${OTHER}:5`,
    ]);
    expect(formatListing(listed)).toBe(
      [
        `${HOME}:5 Exact field`,
        `${HOME}:9 Steps prefix`,
        `${HOME}:13 The activity kind`,
        `${HOME}:17 All definition text`,
        `${OTHER}:5 9. Encode Constraints as Structure`,
        '',
      ].join('\n'),
    );
  });

  it('omits a unit whose ids are narrower than the query', () => {
    const listed = listUnits(texts, 'activity');
    expect(listed.map((unit) => unit.unit)).toEqual([
      'The activity kind',
      'All definition text',
      '9. Encode Constraints as Structure',
    ]);
  });

  it('reads the construct id and leaves --root to the corpus flag', () => {
    expect(queryArg(['activity.steps[].when', '--root', '/tmp/corpus'])).toBe('activity.steps[].when');
    expect(queryArg(['--root', '/tmp/corpus', 'activity'])).toBe('activity');
    expect(queryArg(['--root=/tmp/corpus'])).toBeUndefined();
  });
});
