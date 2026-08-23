import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import {
  traverseReferences,
  resolveReference,
  techniqueIdentity,
  protocolText,
  type TechniqueLocation,
} from '../src/loaders/reference-traversal.js';
import { corpusRoot } from './corpus-root.js';

const WORKFLOW_DIR = corpusRoot();

/** Frontmatter every technique file needs to parse. */
const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

/** A technique whose protocol holds the given prose lines. */
const technique = (capability: string, ...steps: string[]): string =>
  [...FM, '## Capability', '', capability, '', '## Protocol', '', ...steps.map((s, i) => `${i + 1}. ${s}`), ''].join('\n');

describe('reference traversal', () => {
  describe('the corpus cycle, at its named files', () => {
    // `verify-index` and `analyze` in meta/techniques/gitnexus-operations/ reach each other, and
    // `verify-index` also reaches itself. Both arms are guarded in prose, which is why the corpus
    // loads today and why the cycle is invisible until something follows the references.
    const verifyIndex: TechniqueLocation = { workflow: 'meta', pathSegments: ['gitnexus-operations', 'verify-index'] };
    const analyze: TechniqueLocation = { workflow: 'meta', pathSegments: ['gitnexus-operations', 'analyze'] };

    it('PR466-TC-18: walks the cycle, delivering each body exactly once', async () => {
      const result = await traverseReferences({ workflowDir: WORKFLOW_DIR, root: verifyIndex });

      // Terminates, and reaches the other cycle member.
      expect(result.members.map((m) => m.identity)).toContain(techniqueIdentity(analyze));
      // One delivery event per body: the event count equals the member count, and no identity twice.
      expect(result.events).toHaveLength(result.members.length);
      expect(new Set(result.events.map((e) => e.identity)).size).toBe(result.events.length);
      // Every referenced target in this closure resolves.
      expect(result.unresolved).toEqual([]);
    });

    it('PR466-TC-18: records the closing edge and the self-loop as revisits rather than errors', async () => {
      const result = await traverseReferences({ workflowDir: WORKFLOW_DIR, root: verifyIndex });

      // `analyze` closes the cycle by reaching back to `verify-index`, which is the root.
      expect(result.revisits).toContainEqual(
        expect.objectContaining({ from: techniqueIdentity(analyze), identity: techniqueIdentity(verifyIndex) }),
      );
      // `verify-index` applies itself, retrying after the analyze it triggered.
      expect(result.revisits.some((r) => r.selfLoop && r.identity === techniqueIdentity(verifyIndex))).toBe(true);
    });

    it('reaches the same two-member closure from either arm', async () => {
      const fromAnalyze = await traverseReferences({ workflowDir: WORKFLOW_DIR, root: analyze });
      expect(fromAnalyze.members.map((m) => m.identity)).toContain(techniqueIdentity(verifyIndex));
      expect(fromAnalyze.unresolved).toEqual([]);
      expect(fromAnalyze.events).toHaveLength(fromAnalyze.members.length);
    });
  });

  describe('synthetic shapes', () => {
    let dir: string;
    /** `<wf>/techniques/` of the synthetic corpus. */
    let techniques: string;

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'traversal-'));
      techniques = join(dir, 'wf', 'techniques');
      await mkdir(techniques, { recursive: true });
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    const root: TechniqueLocation = { workflow: 'wf', pathSegments: ['root'] };
    const walk = (): ReturnType<typeof traverseReferences> =>
      traverseReferences({ workflowDir: dir, root });

    it('PR466-TC-19: terminates on a deep chain, with a bounded working set', async () => {
      const depth = 30;
      await writeFile(join(techniques, 'root.md'), technique('Root.', 'Apply [next](./link1.md).'), 'utf-8');
      for (let i = 1; i <= depth; i++) {
        const body = i < depth
          ? technique(`Link ${i}.`, `Apply [next](./link${i + 1}.md).`)
          : technique(`Link ${i}.`, 'Stop here.');
        await writeFile(join(techniques, `link${i}.md`), body, 'utf-8');
      }

      const result = await walk();
      expect(result.members).toHaveLength(depth);
      expect(result.maxDepth).toBe(depth);
      expect(result.unresolved).toEqual([]);
      // Each link holds one call site, so the walk never queues more than one pending edge.
      expect(result.maxPending).toBe(1);
      expect(result.events).toHaveLength(depth);
    });

    it('PR466-TC-14: delivers a body reached by two paths once, and continues past the revisit', async () => {
      await writeFile(join(techniques, 'root.md'), technique('Root.', 'Apply [a](./a.md) and apply [b](./b.md).'), 'utf-8');
      await writeFile(join(techniques, 'a.md'), technique('A.', 'Apply [shared](./shared.md).'), 'utf-8');
      await writeFile(join(techniques, 'b.md'), technique('B.', 'Apply [shared](./shared.md).'), 'utf-8');
      await writeFile(join(techniques, 'shared.md'), technique('Shared.', 'Apply [tail](./tail.md).'), 'utf-8');
      await writeFile(join(techniques, 'tail.md'), technique('Tail.', 'Done.'), 'utf-8');

      const result = await walk();
      expect(result.members.map((m) => m.identity).sort()).toEqual(
        ['wf::a', 'wf::b', 'wf::shared', 'wf::tail'],
      );
      // One body, one event — the second path to `shared` is a revisit.
      expect(result.events.filter((e) => e.identity === 'wf::shared')).toHaveLength(1);
      expect(result.revisits).toContainEqual(expect.objectContaining({ identity: 'wf::shared' }));
      // The walk continued past the revisit: `tail` sits beyond `shared`.
      expect(result.members.map((m) => m.identity)).toContain('wf::tail');
    });

    it('PR466-TC-18: tolerates a two-member cycle, delivering each member once', async () => {
      await writeFile(join(techniques, 'root.md'), technique('Root.', 'Apply [a](./a.md).'), 'utf-8');
      await writeFile(join(techniques, 'a.md'), technique('A.', 'Apply [b](./b.md).'), 'utf-8');
      await writeFile(join(techniques, 'b.md'), technique('B.', 'Apply [a](./a.md) again.'), 'utf-8');

      const result = await walk();
      expect(result.members.map((m) => m.identity).sort()).toEqual(['wf::a', 'wf::b']);
      expect(result.events).toHaveLength(2);
      expect(result.revisits).toContainEqual(expect.objectContaining({ from: 'wf::b', identity: 'wf::a' }));
    });

    it('PR466-TC-20: a qualified pair delivers its operation, never the group container', async () => {
      await mkdir(join(techniques, 'grp'), { recursive: true });
      await writeFile(join(techniques, 'grp', 'TECHNIQUE.md'), technique('Group contract.'), 'utf-8');
      await writeFile(join(techniques, 'grp', 'op.md'), technique('The operation.'), 'utf-8');
      await writeFile(
        join(techniques, 'root.md'),
        technique('Root.', 'Apply [grp](./grp/TECHNIQUE.md)::[op](./grp/op.md).'),
        'utf-8',
      );

      const result = await walk();
      expect(result.members.map((m) => m.identity)).toEqual(['wf::grp::op']);
      expect(result.members.map((m) => m.identity)).not.toContain('wf::grp');
    });

    it('PR466-TC-20: a pair naming its operation as bare text resolves to that operation', async () => {
      await mkdir(join(techniques, 'grp'), { recursive: true });
      await writeFile(join(techniques, 'grp', 'TECHNIQUE.md'), technique('Group contract.'), 'utf-8');
      await writeFile(join(techniques, 'grp', 'op.md'), technique('The operation.'), 'utf-8');
      await writeFile(
        join(techniques, 'root.md'),
        technique('Root.', 'Apply [grp](./grp/TECHNIQUE.md)::op to the input.'),
        'utf-8',
      );

      const result = await walk();
      expect(result.members.map((m) => m.identity)).toEqual(['wf::grp::op']);
    });

    it('a container link standing alone delivers the container body', async () => {
      await mkdir(join(techniques, 'grp'), { recursive: true });
      await writeFile(join(techniques, 'grp', 'TECHNIQUE.md'), technique('Group contract.'), 'utf-8');
      await writeFile(join(techniques, 'root.md'), technique('Root.', 'Apply [grp](./grp/TECHNIQUE.md).'), 'utf-8');

      const result = await walk();
      expect(result.members.map((m) => m.identity)).toEqual(['wf::grp']);
    });

    it('reports a dangling target and a target outside the corpus without failing the walk', async () => {
      await writeFile(
        join(techniques, 'root.md'),
        technique(
          'Root.',
          'Apply [gone](./missing.md).',
          'Apply [escaped](../../../outside.md).',
          'Apply [here](./present.md).',
        ),
        'utf-8',
      );
      await writeFile(join(techniques, 'present.md'), technique('Present.'), 'utf-8');

      const result = await walk();
      expect(result.members.map((m) => m.identity)).toEqual(['wf::present']);
      expect(result.unresolved.map((u) => u.reason).sort()).toEqual(['no-such-target', 'outside-corpus']);
    });

    it('crosses into another workflow tree and composes the callee against its own contract', async () => {
      const other = join(dir, 'other', 'techniques');
      await mkdir(other, { recursive: true });
      await writeFile(
        join(other, 'TECHNIQUE.md'),
        [...FM, '## Capability', '', 'Other root.', '', '## Rules', '', '### other-only', '',
          'The obligation the other tree imposes.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(join(other, 'callee.md'), technique('Callee.'), 'utf-8');
      await writeFile(
        join(techniques, 'root.md'),
        technique('Root.', 'Apply [callee](../../other/techniques/callee.md).'),
        'utf-8',
      );

      const result = await walk();
      expect(result.members.map((m) => m.identity)).toEqual(['other::callee']);
      // The callee arrives governed by the tree it lives in, not the tree that called it, with the
      // obligation attributed to the contract imposing it.
      expect(result.members[0]!.technique.inherited_rules?.items).toEqual([
        { name: 'other-only', from: 'TECHNIQUE', rule: expect.any(String) },
      ]);
    });
  });

  describe('resolveReference', () => {
    let dir: string;

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'resolve-'));
      await mkdir(join(dir, 'wf', 'techniques', 'grp'), { recursive: true });
      await writeFile(join(dir, 'wf', 'techniques', 'grp', 'TECHNIQUE.md'), technique('Group.'), 'utf-8');
      await writeFile(join(dir, 'wf', 'techniques', 'grp', 'op.md'), technique('Op.'), 'utf-8');
      await writeFile(join(dir, 'wf', 'techniques', 'flat.md'), technique('Flat.'), 'utf-8');
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    it('resolves a sibling of a grouped operation', () => {
      const r = resolveReference(dir, { workflow: 'wf', pathSegments: ['grp', 'op'] }, './TECHNIQUE.md');
      expect(r).toEqual({ ok: true, location: { workflow: 'wf', pathSegments: ['grp'] } });
    });

    it('resolves out of a group into the workflow tree', () => {
      const r = resolveReference(dir, { workflow: 'wf', pathSegments: ['grp', 'op'] }, '../flat.md');
      expect(r).toEqual({ ok: true, location: { workflow: 'wf', pathSegments: ['flat'] } });
    });

    it('classifies a container link by its folder, not its filename', () => {
      const r = resolveReference(dir, { workflow: 'wf', pathSegments: ['flat'] }, './grp/TECHNIQUE.md');
      expect(r).toEqual({ ok: true, location: { workflow: 'wf', pathSegments: ['grp'] } });
    });

    it('reports a destination leaving the corpus root', () => {
      const r = resolveReference(dir, { workflow: 'wf', pathSegments: ['flat'] }, '../../../elsewhere.md');
      expect(r).toEqual({ ok: false, reason: 'outside-corpus' });
    });
  });

  describe('protocolText', () => {
    it('renders one line per block title and per step, so verb adjacency reads per step', () => {
      const text = protocolText({
        id: 'x', version: '1.0.0', capability: 'c',
        protocol: [{ title: 'Setup', steps: ['first', 'second'] }, { steps: ['third'] }],
      });
      expect(text.split('\n')).toEqual(['### Setup', 'first', 'second', 'third']);
    });
  });
});
