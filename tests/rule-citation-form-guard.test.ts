import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import {
  citerKind,
  declaredRules,
  inherits,
  ruleCitations,
  checkCitation,
  areaOf,
  bareRuleMentions,
  reachableRules,
} from '../guards/check-rule-citation-form.js';

const GROUP = resolve('/corpus/meta/techniques/workflow-engine');
const CONTAINER = `${GROUP}/TECHNIQUE.md`;
const OP = `${GROUP}/dispatch-activity.md`;
const SIBLING = `${GROUP}/continue-batch.md`;

/** Stand-in roster: the container and one technique each declare a rule. */
const ROSTER = new Map<string, Set<string>>([
  [CONTAINER, new Set(['agent-id-scopes-delivery'])],
  [OP, new Set(['account-every-activity'])],
  [SIBLING, new Set(['one-advance-per-activity'])],
]);
const rulesOf = (abs: string) => ROSTER.get(abs) ?? new Set<string>();

describe('declaredRules', () => {
  it('reads slugs under ## Rules and nothing above it', () => {
    const text = [
      '## Protocol',
      '',
      '### 1. Do the thing',
      '',
      '## Rules',
      '',
      '### first-invariant',
      'body',
      '',
      '### second-invariant',
      'body',
    ].join('\n');
    expect(declaredRules(text)).toEqual(new Set(['first-invariant', 'second-invariant']));
  });

  it('stops at the next top-level section', () => {
    const text = '## Rules\n\n### a-rule\n\n## Outputs\n\n### not-a-rule\n';
    expect(declaredRules(text)).toEqual(new Set(['a-rule']));
  });

  it('returns nothing for a file with no Rules section', () => {
    expect(declaredRules('## Capability\n\nDoes a thing.\n')).toEqual(new Set());
  });
});

describe('citerKind', () => {
  it('holds a technique to the naming form', () => {
    expect(citerKind('meta/techniques/workflow-engine/dispatch-activity.md')).toBe('technique');
  });

  it('exempts a resource, which inherits nothing and runs no Protocol', () => {
    expect(citerKind('meta/resources/planning-readme.md')).toBe('resource');
  });

  it('exempts a README wherever it sits', () => {
    expect(citerKind('meta/techniques/README.md')).toBe('readme');
  });
});

describe('inherits', () => {
  it('is true for a technique beneath the container declaring the rule', () => {
    expect(inherits(OP, CONTAINER)).toBe(true);
  });

  it('is false for a sibling technique, whose rules merge into nobody', () => {
    expect(inherits(OP, SIBLING)).toBe(false);
  });

  it('is false for a container the citer does not sit beneath', () => {
    expect(inherits('/corpus/meta/techniques/git/commit-paths.md', CONTAINER)).toBe(false);
  });
});

describe('ruleCitations', () => {
  it('finds a link whose anchor is a rule on the target', () => {
    const text = 'Honour [agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery) on every call.\n';
    const found = ruleCitations(text, OP, rulesOf);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ anchor: 'agent-id-scopes-delivery', targetAbs: CONTAINER, line: 1 });
  });

  it('resolves an empty destination to the citing file itself', () => {
    const text = 'per [account-every-activity](#account-every-activity)\n';
    const found = ruleCitations(text, OP, rulesOf);
    expect(found).toHaveLength(1);
    expect(found[0]?.targetAbs).toBe(OP);
  });

  it('passes over an anchor that is not a rule on the target', () => {
    const text = 'see [Progress table](./TECHNIQUE.md#progress-table)\n';
    expect(ruleCitations(text, OP, rulesOf)).toHaveLength(0);
  });

  it('passes over a link inside a fenced block, which shows markup rather than citing', () => {
    const text = ['```md', '[account-every-activity](#account-every-activity)', '```'].join('\n');
    expect(ruleCitations(text, OP, rulesOf)).toHaveLength(0);
  });

  it('reports the line each citation sits on', () => {
    const text = ['intro', '', 'per [account-every-activity](#account-every-activity)'].join('\n');
    expect(ruleCitations(text, OP, rulesOf)[0]?.line).toBe(3);
  });

  it('finds every citation on one line', () => {
    const text = '[account-every-activity](#account-every-activity) and [agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)\n';
    expect(ruleCitations(text, OP, rulesOf)).toHaveLength(2);
  });
});

describe('checkCitation', () => {
  const site = 'meta/techniques/workflow-engine/dispatch-activity.md:12';

  it('asks for the bare name when the rule is the citing file own', () => {
    const f = checkCitation({ line: 12, text: 'x', anchor: 'account-every-activity', targetAbs: OP }, OP, site);
    expect(f!.check).toBe('own-rule');
    expect(f!.detail).toContain('bare name');
  });

  /**
   * The loader merges a container's rules into every file beneath it, so the reader is holding the
   * rule's text when they meet the citation. A link there navigates to what they already have, which
   * is the spelling `dotted-rule-address` keys on — the ancestry names the owner, leaving the slug.
   */
  it('asks for the bare name when the rule merges in from a container above', () => {
    const f = checkCitation({ line: 12, text: 'x', anchor: 'agent-id-scopes-delivery', targetAbs: CONTAINER }, OP, site);
    expect(f!.check).toBe('inherited-rule');
    expect(f!.detail).toContain('bare name');
    expect(f!.detail).toContain('agent-id-scopes-delivery');
  });

  it('asks for the dotted address when the rule belongs to a technique the citer does not inherit', () => {
    const f = checkCitation({ line: 12, text: 'x', anchor: 'one-advance-per-activity', targetAbs: SIBLING }, OP, site);
    expect(f!.check).toBe('foreign-rule');
    expect(f!.detail).toContain('dotted address');
    expect(f!.detail).toContain('continue-batch');
  });
});

describe('areaOf', () => {
  it('names a library by its namespace and a workflow by its own folder', () => {
    expect(areaOf('corpus/support/gitnexus/techniques/analyze.md')).toBe('support/gitnexus');
    expect(areaOf('support/git/techniques/pin-revision.md')).toBe('support/git');
    expect(areaOf('corpus/codebase-wiki/techniques/ingest.md')).toBe('codebase-wiki');
  });
});

describe('bareRuleMentions', () => {
  it('takes a backticked kebab slug and passes over its own rule headings', () => {
    const text = ['prose citing `index-freshness-first` here', '', '## Rules', '', '### my-own-rule', 'body'].join('\n');
    expect(bareRuleMentions(text)).toEqual([{ line: 1, slug: 'index-freshness-first' }]);
  });

  /**
   * A dotted address ends in a slug, and the tail must not read as a bare citation of its own — the
   * whole point of the dotted form is that it is already at the length its reader needs.
   */
  it('passes over the tail of a dotted address', () => {
    expect(bareRuleMentions('per `gitnexus.index-freshness-first` there')).toEqual([]);
  });

  it('passes over a fenced block, which shows markup rather than citing', () => {
    const text = ['```', 'a `some-rule-name` sample', '```'].join('\n');
    expect(bareRuleMentions(text)).toEqual([]);
  });

  it('ignores a single word, which carries no slug shape', () => {
    expect(bareRuleMentions('the `repo` argument')).toEqual([]);
  });
});

describe('reachableRules', () => {
  const ROOT = resolve('/corpus');

  /** What the loader merges in: the file's own rules, and every container above it. */
  it('carries the citer own rules and every container above it', () => {
    const reachable = reachableRules(OP, ROOT, rulesOf);
    expect(reachable.has('account-every-activity')).toBe(true);
    expect(reachable.has('agent-id-scopes-delivery')).toBe(true);
  });

  /** A sibling technique is merged into nobody; it reaches a reader by the bundle, not the tree. */
  it('leaves out a sibling technique rule, which no container merge supplies', () => {
    expect(reachableRules(OP, ROOT, rulesOf).has('one-advance-per-activity')).toBe(false);
  });
});
