/**
 * The shared reference grammar: how a markdown link destination is partitioned into a technique
 * reference, a resource reference or neither, and which of those become call sites.
 *
 * The partition is the load-bearing case. A destination naming a technique file is a technique
 * reference under every spelling, so the dotted and dotless forms of one target cannot disagree —
 * the disagreement is what let a technique path be claimed as a resource id.
 */
import { describe, it, expect } from 'vitest';
import {
  GRAMMAR_TERMS,
  INVOKING_VERBS,
  classifyLink,
  extractCallSites,
  findLinks,
  isResourceLink,
  isTechniqueLink,
} from '../src/utils/reference-grammar.js';
import { extractResourceIds } from '../src/utils/resource-ref.js';

const kind = (destination: string): string => classifyLink(destination).kind;

describe('published grammar terms', () => {
  it('publishes ten terms, each with a question and a fixed answer', () => {
    expect(GRAMMAR_TERMS).toHaveLength(10);
    for (const term of GRAMMAR_TERMS) {
      expect(term.id).toMatch(/^[a-z][a-z-]*$/);
      expect(term.question.length).toBeGreaterThan(0);
      expect(term.answer.length).toBeGreaterThan(0);
    }
  });

  it('gives every term a distinct id', () => {
    expect(new Set(GRAMMAR_TERMS.map((t) => t.id)).size).toBe(GRAMMAR_TERMS.length);
  });

  it('fixes the verb list at the single verb `apply`', () => {
    expect([...INVOKING_VERBS]).toEqual(['apply']);
  });

  it('carries no anchor slugger, so the tree holds one slug computation', async () => {
    const module = await import('../src/utils/reference-grammar.js');
    expect(Object.keys(module).some((k) => /slug/i.test(k))).toBe(false);
  });
});

describe('link classification is spelling-independent', () => {
  it('classifies a dotless technique file the same as its dotted spelling', () => {
    expect(kind('variable-binding.md')).toBe('technique');
    expect(kind('./variable-binding.md')).toBe('technique');
  });

  it('classifies a slash-bearing technique path as a technique under both spellings', () => {
    // The blind spot this closes: the dotless form was claimed as resource id
    // `harness-compat/spawn-concurrent` while the dotted form was not claimed at all.
    expect(kind('harness-compat/spawn-concurrent.md')).toBe('technique');
    expect(kind('./harness-compat/spawn-concurrent.md')).toBe('technique');
    expect(kind('../harness-compat/spawn-concurrent.md')).toBe('technique');
  });

  it('never claims a technique destination as a resource id', () => {
    for (const destination of [
      'variable-binding.md',
      './variable-binding.md',
      'harness-compat/spawn-concurrent.md',
      '../../meta/techniques/gitnexus-operations/query.md',
      './TECHNIQUE.md',
    ]) {
      expect(isResourceLink(destination)).toBe(false);
      expect(isTechniqueLink(destination)).toBe(true);
    }
  });

  it('classifies a group container distinctly from an operation', () => {
    expect(kind('./TECHNIQUE.md')).toBe('technique-container');
    expect(kind('../harness-compat/TECHNIQUE.md')).toBe('technique-container');
    expect(kind('../harness-compat/spawn-agent.md')).toBe('technique');
  });

  it('classifies a resources/ destination as a resource however deep the path', () => {
    expect(kind('../resources/test-plan.md')).toBe('resource');
    expect(kind('../../meta/resources/writing-register.md')).toBe('resource');
  });

  it('classifies a projected bare or workflow-qualified slug as a resource', () => {
    expect(kind('test-plan')).toBe('resource');
    expect(kind('meta/writing-register')).toBe('resource');
  });

  it('rejects external, in-page and deep extensionless destinations', () => {
    expect(kind('https://example.com/x')).toBe('neither');
    expect(kind('#some-heading')).toBe('neither');
    expect(kind('a/b/c')).toBe('neither');
    expect(kind('group::op')).toBe('neither');
  });

  it('splits the anchor off without disturbing the kind', () => {
    expect(classifyLink('./op.md#rules')).toEqual({ kind: 'technique', path: './op.md', anchor: 'rules' });
    expect(classifyLink('test-plan#structure')).toEqual({ kind: 'resource', path: 'test-plan', anchor: 'structure' });
  });
});

describe('resource claiming delegates to the shared classifier', () => {
  it('claims a rewritten resource link', () => {
    expect(extractResourceIds('see [plan](test-plan)')).toEqual(['test-plan']);
    expect(extractResourceIds('see [reg](meta/writing-register)')).toEqual(['meta/writing-register']);
  });

  it('claims a raw resources/ link, keeping the owning workflow', () => {
    expect(extractResourceIds('see [r](../../meta/resources/writing-register.md)')).toEqual(['meta/writing-register']);
  });

  it('keeps an anchor on the claimed id', () => {
    expect(extractResourceIds('see [p](test-plan#structure)')).toEqual(['test-plan#structure']);
  });

  it('claims no id from a technique link under either spelling', () => {
    expect(extractResourceIds('apply [vb](variable-binding.md)')).toEqual([]);
    expect(extractResourceIds('apply [vb](./variable-binding.md)')).toEqual([]);
    expect(extractResourceIds('apply [sc](harness-compat/spawn-concurrent.md)')).toEqual([]);
  });

  it('still reads a resources: array', () => {
    expect(extractResourceIds('resources: [test-plan, meta/writing-register]')).toEqual([
      'test-plan',
      'meta/writing-register',
    ]);
  });
});

describe('call-site extraction', () => {
  it('counts a link only when an invoking verb sits earlier on the line', () => {
    expect(extractCallSites('1. apply [x](./x.md) now')).toHaveLength(1);
    expect(extractCallSites('1. see [x](./x.md) for detail')).toHaveLength(0);
  });

  it('matches the verb case-insensitively', () => {
    expect(extractCallSites('1. Apply [x](./x.md)')).toHaveLength(1);
    expect(extractCallSites('1. APPLY [x](./x.md)')).toHaveLength(1);
  });

  it('accepts a verb anywhere earlier on the line rather than only adjacent', () => {
    expect(extractCallSites('2. When the gate opens, apply the rule in [x](./x.md) before exit')).toHaveLength(1);
  });

  it('excludes an anchored link, which cites a passage rather than invoking it', () => {
    expect(extractCallSites('1. apply [r](./x.md#some-rule)')).toHaveLength(0);
    expect(extractCallSites('1. apply [r](#local-rule)')).toHaveLength(0);
  });

  it('skips fenced blocks', () => {
    const text = ['```', 'apply [x](./x.md)', '```', 'apply [y](./y.md)'].join('\n');
    expect(extractCallSites(text).map((s) => s.destination)).toEqual(['./y.md']);
  });

  it('collapses a two-link qualified pair to one call site naming the operation', () => {
    const sites = extractCallSites(
      'apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the prompt',
    );
    expect(sites).toHaveLength(1);
    expect(sites[0]!.destination).toBe('../harness-compat/spawn-agent.md');
    expect(sites[0]!.container).toBe('../harness-compat/TECHNIQUE.md');
    expect(sites[0]!.qualified).toBe(true);
  });

  it('collapses a container link whose operation is named as bare text', () => {
    const sites = extractCallSites('2. apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.');
    expect(sites).toHaveLength(1);
    expect(sites[0]!.qualified).toBe(true);
    expect(sites[0]!.operation).toBe('infrastructure-submodule-paths');
    expect(sites[0]!.container).toBe('./TECHNIQUE.md');
  });

  it('keeps a standalone container link as its own call site', () => {
    const sites = extractCallSites('1. apply [the group](./TECHNIQUE.md) wholesale');
    expect(sites).toHaveLength(1);
    expect(sites[0]!.qualified).toBe(false);
    expect(sites[0]!.destination).toBe('./TECHNIQUE.md');
  });

  it('counts two independent calls on one line as two sites', () => {
    const sites = extractCallSites('apply [a](./a.md) then apply [b](./b.md)');
    expect(sites.map((s) => s.destination)).toEqual(['./a.md', './b.md']);
  });

  it('reports 1-based line numbers', () => {
    const sites = extractCallSites(['intro', 'apply [x](./x.md)'].join('\n'));
    expect(sites[0]!.line).toBe(2);
  });
});

describe('link discovery', () => {
  it('finds links with their line and column, skipping fences', () => {
    const links = findLinks(['apply [a](./a.md)', '```', '[b](./b.md)', '```'].join('\n'));
    expect(links).toHaveLength(1);
    expect(links[0]!.destination).toBe('./a.md');
    expect(links[0]!.line).toBe(1);
    expect(links[0]!.column).toBe(6);
  });
});
