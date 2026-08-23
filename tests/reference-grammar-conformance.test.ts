/**
 * Conformance for the published reference grammar: one fixture per term, plus the corpus totals.
 *
 * The grammar publishes ten counting terms, and each is pinned by its own fixture rather than by a
 * total alone. A total cannot show that two of its terms measure the same form, and this package
 * measured exactly that — `container-target` and `counting-unit` are largely one term seen twice,
 * both of them tracking the qualified `group::op` pair. The overlap is asserted here as a measured
 * property rather than described in prose, which is the whole argument for fixtures.
 *
 * Each fixture is a real corpus read by the real guard, so a fixture pins the term as the guard
 * implements it and not as a test re-implements it. A fixture whose numbers stop distinguishing its
 * term from the alternative reading is a broken fixture and has to say so.
 */
import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { collectCensus, collectFindings, collectRawFindings, applyTriage } from '../scripts/check-inline-references.js';
import { GRAMMAR_TERMS } from '../src/utils/reference-grammar.js';
import { UnreachableCorpusError } from '../scripts/workflows-root.js';
import { corpusRoot } from './corpus-root.js';

const FIXTURES = resolve(import.meta.dirname, 'fixtures/reference-grammar');
const fixture = (term: string): string => resolve(FIXTURES, term);

describe('one fixture per published term', () => {
  it('covers every published term, so a new term cannot arrive unpinned', () => {
    // The directory listing is the coverage check: a term added to the grammar with no fixture
    // beside it is exactly how the first nine each came to be discovered by measuring.
    for (const term of GRAMMAR_TERMS) {
      expect(() => collectCensus(fixture(term.id)), `no fixture pins the ${term.id} term`).not.toThrow();
    }
  });

  it('verb-list — a listed verb calls, an unlisted one cites', () => {
    const c = collectCensus(fixture('verb-list'));
    // Two links, both technique references. Only the one under `apply` is a call.
    expect(c.rawLinkOccurrences).toBe(2);
    expect(c.logicalCallSites).toBe(1);
  });

  it('verb-case — a sentence-initial capital is the same verb', () => {
    const c = collectCensus(fixture('verb-case'));
    expect(c.logicalCallSites).toBe(1);
  });

  it('verb-adjacency — the verb counts from anywhere earlier on the line', () => {
    const c = collectCensus(fixture('verb-adjacency'));
    expect(c.logicalCallSites).toBe(1);
  });

  it('counting-unit — two link occurrences resolve to one logical call', () => {
    const c = collectCensus(fixture('counting-unit'));
    expect(c.rawLinkOccurrences).toBe(2);
    expect(c.logicalCallSites).toBe(1);
  });

  it('container-target — a container link standing alone is its own call site', () => {
    const c = collectCensus(fixture('container-target'));
    expect(c.logicalCallSites).toBe(1);
    expect(c.containerTargeted).toBe(1);
    // No pair here, which is what makes this term's effect independent of qualified-pair.
    expect(c.qualifiedPairsCollapsed).toBe(0);
  });

  it('section-scope — only the scanned section is read', () => {
    const c = collectCensus(fixture('section-scope'));
    // The identical call in the Overview section is not counted.
    expect(c.logicalCallSites).toBe(1);
    expect(c.rawLinkOccurrences).toBe(1);
  });

  it('anchoring — an anchored link cites a passage rather than invoking it', () => {
    const c = collectCensus(fixture('anchoring'));
    // Same destination twice, once anchored. Only the plain one counts.
    expect(c.rawLinkOccurrences).toBe(1);
    expect(c.logicalCallSites).toBe(1);
  });

  it('leading-dot — a destination is classified by shape, so both spellings are technique links', () => {
    const c = collectCensus(fixture('leading-dot'));
    expect(c.logicalCallSites).toBe(2);
    expect(c.distinctCallees).toBe(2);
  });

  it('qualified-pair — both spellings of the pair collapse to one call each', () => {
    const c = collectCensus(fixture('qualified-pair'));
    // Three link occurrences: two for the two-link form, one for the bare-text form.
    expect(c.rawLinkOccurrences).toBe(3);
    expect(c.logicalCallSites).toBe(2);
    expect(c.qualifiedPairsCollapsed).toBe(2);
    // A collapsed container half is absorbed by its pair rather than counted on its own.
    expect(c.containerTargeted).toBe(0);
  });

  it('unresolved-target — a destination naming no file is counted and reported', () => {
    const c = collectCensus(fixture('unresolved-target'));
    expect(c.logicalCallSites).toBe(1);
    expect(c.unresolvedTargets).toBe(1);
    expect(collectRawFindings(fixture('unresolved-target')).map((f) => f.check)).toEqual(['unresolved-target']);
  });
});

describe('the two overlapping terms, asserted rather than described', () => {
  it('shows container-target and counting-unit both tracking the qualified pair', () => {
    // In the pair fixture both terms move together: the unit converts occurrences into calls, and
    // the container half stops being a target. One input, two terms, one form.
    const pair = collectCensus(fixture('qualified-pair'));
    expect(pair.rawLinkOccurrences).toBeGreaterThan(pair.logicalCallSites);
    expect(pair.containerTargeted).toBe(0);
  });

  it('shows container-target still has an effect the pair form does not produce', () => {
    // A standalone container link is a call site under container-target with no pair in sight, so
    // the two terms overlap without being identical — which is why both are published.
    const standalone = collectCensus(fixture('container-target'));
    expect(standalone.qualifiedPairsCollapsed).toBe(0);
    expect(standalone.containerTargeted).toBe(1);
  });
});

describe('asserted totals at the delivered corpus commit', () => {
  const census = collectCensus(corpusRoot());

  it('reproduces the call-site totals the guard publishes', () => {
    // Re-baseline deliberately when a published term changes: that is the assertion working, not
    // failing. Every figure here is measured at the corpus commit this branch delivers.
    expect(census.logicalCallSites).toBe(198);
    expect(census.deduplicatedPairs).toBe(178);
    expect(census.callerFiles).toBe(101);
    expect(census.distinctCallees).toBe(73);
  });

  it('reproduces the counting-unit inputs, so the unit conversion is visible', () => {
    expect(census.rawLinkOccurrences).toBe(351);
    expect(census.linkResolvableReferences).toBe(254);
    expect(census.qualifiedPairsCollapsed).toBe(82);
  });

  it('carries the corpus clean of both hard classes', () => {
    expect(census.unresolvedTargets).toBe(0);
    expect(collectFindings(corpusRoot())).toEqual([]);
  });

  it('publishes coverage beside the total, the two being separate facts', () => {
    // SC-3 asks for a reproducible total and gets one. It does not ask for a complete one, and this
    // is the number that keeps the difference legible: a clean report over an unexamined region
    // must not read as a report that examined it.
    expect(census.verbCoveragePercent).toBe(78);
    expect(census.verbCoveragePercent).toBeLessThan(100);
  });

  it('keeps the two container-targeted sites counted rather than repaired', () => {
    // Both name a group as a set of operations, which the container-target term admits as a call
    // site. Neither is the rule-addressed defect, so neither is repaired here.
    expect(census.containerTargeted).toBe(2);
  });
});

describe('the guard reports unmeasured rather than clean', () => {
  it('refuses to answer over an empty corpus', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'wf-inlineref-'));
    try {
      expect(() => collectCensus(root)).toThrow(UnreachableCorpusError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('triage carries a verdict and cannot go stale silently', () => {
  const raw = [{ check: 'unresolved-target', site: 'wf/techniques/a.md:3', detail: 'a detail' }];

  it('suppresses an accepted finding', () => {
    const out = applyTriage(raw, {
      corpusSha: 'abc',
      rationales: { 'by-design': 'the call is correct as written' },
      entries: [{ ...raw[0]!, verdict: 'harmless', rationale: 'by-design' }],
    });
    expect(out).toEqual([]);
  });

  it('keeps a live bug reported with its rationale attached', () => {
    const out = applyTriage(raw, {
      corpusSha: 'abc',
      rationales: { 'known-break': 'the target moved and the caller has not followed' },
      entries: [{ ...raw[0]!, verdict: 'live-bug', rationale: 'known-break' }],
    });
    expect(out).toHaveLength(1);
    expect(out[0]!.detail).toContain('the target moved and the caller has not followed');
  });

  it('reports a verdict that no longer matches anything', () => {
    const out = applyTriage([], {
      corpusSha: 'abc',
      rationales: {},
      entries: [{ ...raw[0]!, verdict: 'harmless', rationale: 'gone' }],
    });
    expect(out.map((f) => f.check)).toEqual(['stale-triage']);
  });
});
