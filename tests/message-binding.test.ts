/**
 * check-message-binding fires on a message that cites its own activity's technique output, and
 * stays silent where the value is already in the bag — bound by a checkpoint effect before the
 * message, seeded as a session fact, or produced by an earlier activity.
 */
import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { collectFindings } from '../scripts/check-message-binding.js';

const FIXTURE = resolve(import.meta.dirname, 'fixtures/message-binding');

describe('check-message-binding', () => {
  const findings = collectFindings(FIXTURE);
  const sites = findings.map((f) => f.site);

  it('fires on a gate citing a path its own activity produces', () => {
    expect(sites).toContain('binding-fixture/activities/00-produce-then-render.yaml::cites-own-output');
  });

  it('separates a value that renders its declared default from one that renders the placeholder', () => {
    const own = findings.filter((f) => f.site.endsWith('::cites-own-output'));
    expect(own.map((f) => f.check).sort()).toEqual(['renders-declared-default', 'renders-placeholder']);
  });

  it('stays silent on a value a checkpoint effect bound before the message', () => {
    expect(sites).not.toContain('binding-fixture/activities/01-gate-then-render.yaml::announce-mode');
  });

  it('stays silent on a session fact and on a value an earlier activity produced', () => {
    expect(sites).not.toContain('binding-fixture/activities/00-produce-then-render.yaml::announce');
    expect(sites).not.toContain('binding-fixture/activities/02-read-prior-state.yaml::announce-prior');
  });
});
