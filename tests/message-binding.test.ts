/**
 * check-message-binding fires on a gate showing a value its own activity produces only after the
 * gate, and stays silent where the bag holds the value when the gate is presented — produced by an
 * earlier step of the activity, bound by a checkpoint effect before it, carried round a loop,
 * seeded as a session fact, or produced by an earlier activity. A message action is the agent's
 * own to state, so none is measured.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import { collectFindings } from '../guards/check-message-binding.js';
import type { Finding } from '../guards/guard-protocol.js';

const FIXTURE = resolve(import.meta.dirname, 'fixtures/message-binding');

describe('check-message-binding', () => {
  let findings: Finding[] = [];
  let sites: string[] = [];
  beforeAll(async () => {
    findings = await collectFindings(FIXTURE);
    sites = findings.map((f) => f.site);
  });

  it('fires on a gate showing a value its own activity produces only after the gate', () => {
    expect(sites).toContain('binding-fixture/produce-then-render::cites-later-output');
  });

  it('separates a value that renders its declared default from one that renders the placeholder, option text included', () => {
    const later = findings.filter((f) => f.site.endsWith('::cites-later-output'));
    expect(later.map((f) => f.check).sort()).toEqual(['renders-declared-default', 'renders-placeholder']);
    expect(later.find((f) => f.check === 'renders-placeholder')?.detail).toContain("description of option 'confirmed'");
  });

  it('stays silent on a value an earlier step of the same activity produced', () => {
    expect(sites).not.toContain('binding-fixture/produce-then-render::cites-own-output');
  });

  it('stays silent on a loop-carried value with a declared default', () => {
    expect(sites).not.toContain('binding-fixture/loop-carried::round-reviewed');
  });

  it('measures no message action', () => {
    expect(sites.filter((s) => s.endsWith('::announce') || s.endsWith('::announce-mode') || s.endsWith('::announce-prior'))).toEqual([]);
  });

  it('stays silent on a name more than one activity produces', () => {
    expect(sites).not.toContain('binding-fixture/shared-before::shows-shared');
  });

  it('fires on a loop-body value with no default, which its first pass has not produced', () => {
    expect(findings.filter((f) => f.site === 'binding-fixture/loop-undefaulted::shows-loop-note').map((f) => f.check))
      .toEqual(['renders-placeholder']);
  });

  it('fires on a top-level gate whose id a later loop-body step reuses', () => {
    expect(sites).toContain('binding-fixture/repeated-id::review');
  });

  it('stays silent on a defaulted count an enclosing loop carries round a nested gate', () => {
    expect(sites).not.toContain('binding-fixture/nested-loops::inner-reviewed');
  });

  it('reports nothing beyond the gates that show a later value', () => {
    expect(new Set(sites)).toEqual(new Set([
      'binding-fixture/produce-then-render::cites-later-output',
      'binding-fixture/loop-undefaulted::shows-loop-note',
      'binding-fixture/repeated-id::review',
    ]));
  });
});
