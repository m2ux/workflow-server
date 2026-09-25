import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { indexCorpus, type CorpusIndex } from '../src/loaders/corpus-index.js';
import { isBareName, parseTechniqueRef, techniqueRef, TechniqueRefError } from '../src/loaders/technique-ref.js';
import { composeActivityTechnique, readTechnique, resolveTechniques } from '../src/loaders/technique-loader.js';
import { writeWorkflowFixture } from './corpus-fixture.js';

/**
 * The one rule a technique reference resolves by: `[namespace::]technique[::nested…]`, with the
 * leading segment naming a workflow when the corpus declares one of that name.
 */
describe('technique reference rule', () => {
  let root: string;
  let index: CorpusIndex;

  const technique = (dir: string, path: string): void => {
    const file = join(dir, 'techniques', `${path}.md`);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, ['---', 'metadata:', '  version: 1.0.0', '---', '',
      '## Capability', '', `Does ${path}.`, '', '## Protocol', '', '1. Do it.'].join('\n'), 'utf-8');
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'technique-ref-'));
    // A workflow carrying techniques, one of them nested two groups deep.
    const shared = writeWorkflowFixture(root, 'shared-wf');
    technique(shared, 'standalone');
    technique(shared, join('group', 'technique'));
    technique(shared, join('group', 'subgroup', 'technique'));
    // A workflow with no techniques/ directory: a declared workflow is still what its name means.
    writeWorkflowFixture(root, 'bare-wf');
    // The workflow whose activities do the referring, carrying a group named after another workflow.
    const local = writeWorkflowFixture(root, 'local-wf');
    technique(local, 'standalone');
    technique(local, join('bare-wf', 'technique'));
    const meta = writeWorkflowFixture(root, 'meta');
    technique(meta, 'shared-only');
    index = indexCorpus(root);
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  describe('what a leading segment names', () => {
    it('reads it as a workflow when the corpus declares one of that name', () => {
      expect(parseTechniqueRef('shared-wf::standalone', index))
        .toMatchObject({ namespace: 'shared-wf', segments: ['standalone'] });
    });

    it('reads it as a workflow whether or not that workflow carries techniques yet', () => {
      // `bare-wf` holds no techniques/ directory, and local-wf holds a group folder of that name:
      // the reference names the workflow, so the local group is not what it addresses.
      expect(parseTechniqueRef('bare-wf::technique', index))
        .toMatchObject({ namespace: 'bare-wf', segments: ['technique'] });
    });

    it('reads it as a group when the corpus declares no such workflow', () => {
      expect(parseTechniqueRef('group::technique', index))
        .toMatchObject({ namespace: undefined, segments: ['group', 'technique'] });
    });

    it('reads a bare name as a technique in the referring workflow', () => {
      expect(parseTechniqueRef('standalone', index))
        .toMatchObject({ namespace: undefined, segments: ['standalone'] });
    });

    it('takes a workflow prefix only when a segment follows it', () => {
      expect(parseTechniqueRef('shared-wf', index))
        .toMatchObject({ namespace: undefined, segments: ['shared-wf'] });
    });
  });

  describe('depth', () => {
    it('admits a path of any depth inside a workflow', () => {
      expect(parseTechniqueRef('group::subgroup::technique', index))
        .toMatchObject({ namespace: undefined, segments: ['group', 'subgroup', 'technique'] });
    });

    it('admits a workflow prefix before a nested path', () => {
      expect(parseTechniqueRef('shared-wf::group::subgroup::technique', index))
        .toMatchObject({ namespace: 'shared-wf', segments: ['group', 'subgroup', 'technique'] });
    });
  });

  describe('the slash spelling of a workflow prefix', () => {
    it('names the workflow, and the rest is the path within it', () => {
      expect(parseTechniqueRef('shared-wf/group::technique', index))
        .toMatchObject({ namespace: 'shared-wf', segments: ['group', 'technique'] });
    });

    it('names a workflow whether or not the corpus holds one', () => {
      expect(parseTechniqueRef('no-such-wf/standalone', index))
        .toMatchObject({ namespace: 'no-such-wf', segments: ['standalone'] });
    });
  });

  describe('what the rule refuses', () => {
    const refused = ['', '::standalone', 'standalone::', 'group::::technique', 'a/b/c', 'group::a/b', '/standalone'];
    for (const ref of refused) {
      it(`refuses '${ref}' and names the rule in the refusal`, () => {
        expect(() => parseTechniqueRef(ref, index)).toThrow(TechniqueRefError);
        try {
          parseTechniqueRef(ref, index);
        } catch (error) {
          expect((error as Error).message).toContain('[namespace::]technique[::nested…]');
        }
      });
    }

    it('surfaces the refusal through the loader rather than as a technique that is merely absent', async () => {
      const result = await readTechnique('group::::technique', root, 'local-wf');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.name).toBe('TechniqueRefError');
    });
  });

  describe('spelling a reference', () => {
    it('writes a built reference canonically', () => {
      expect(techniqueRef('shared-wf', ['group', 'technique']).text).toBe('shared-wf::group::technique');
      expect(techniqueRef(undefined, ['standalone']).text).toBe('standalone');
    });

    it('keeps the reference as written, which is what a message quotes', () => {
      expect(parseTechniqueRef('shared-wf/standalone', index).text).toBe('shared-wf/standalone');
    });

    it('calls a name bare only when it carries neither separator', () => {
      expect(isBareName('standalone')).toBe(true);
      expect(isBareName('group::technique')).toBe(false);
      expect(isBareName('shared-wf/standalone')).toBe(false);
    });
  });

  describe('the two delivery paths', () => {
    it('reads and bundles a slash-prefixed nested reference the same way', async () => {
      // One rule, so `workflow/group::op` names the same file whichever path asks: the slash carries
      // the workflow and the `::` that follows walks into a group folder, on both.
      const read = await readTechnique('shared-wf/group::technique', root, 'local-wf');
      expect(read.success).toBe(true);
      const bundled = (await resolveTechniques(['shared-wf/group::technique'], root, 'local-wf'))[0]!;
      expect(bundled.type).toBe('technique');
      expect(bundled.workflow).toBe('shared-wf');
    });
  });

  describe('the activity-group convention', () => {
    it('prefixes the activity group only onto a name that still parses once prefixed', () => {
      expect(isBareName('standalone')).toBe(true);
      expect(() => parseTechniqueRef('an-activity::standalone', index)).not.toThrow();
      // Why the convention tests for a bare name rather than for an absent `::`: prefixing a
      // reference that already names a workflow composes one the rule refuses, and every caller
      // building the candidate would otherwise refuse a well-formed corpus reference.
      expect(isBareName('shared-wf/standalone')).toBe(false);
      expect(() => parseTechniqueRef('an-activity::shared-wf/standalone', index)).toThrow(TechniqueRefError);
    });

    it('composes a qualified reference as authored when an activity is in scope', async () => {
      const composed = await composeActivityTechnique('shared-wf/standalone', root, 'local-wf', 'an-activity');
      expect(composed.success).toBe(true);
      if (composed.success) expect(composed.value.techniqueId).toBe('shared-wf/standalone');
    });
  });

  describe('a namespace that declares no workflow', () => {
    let libRoot: string;

    beforeAll(() => {
      libRoot = mkdtempSync(join(tmpdir(), 'technique-ns-'));
      // A library under a grouping folder, with no definition beside it, and a workflow to refer
      // from. The grouping folder holds no library of its own, so it names nothing.
      technique(join(libRoot, 'support', 'gitnexus'), 'analyze');
      const client = writeWorkflowFixture(libRoot, 'client-wf');
      technique(client, 'standalone');
      writeWorkflowFixture(libRoot, 'meta');
    });

    afterAll(() => rmSync(libRoot, { recursive: true, force: true }));

    it('reads its name, and the path reaching it, as the same namespace', () => {
      const index = indexCorpus(libRoot);
      expect(parseTechniqueRef('gitnexus::analyze', index))
        .toMatchObject({ namespace: 'support/gitnexus', segments: ['analyze'] });
      expect(parseTechniqueRef('support::gitnexus::analyze', index))
        .toMatchObject({ namespace: 'support/gitnexus', segments: ['analyze'] });
    });

    it('delivers the technique under either spelling', async () => {
      for (const ref of ['gitnexus::analyze', 'support::gitnexus::analyze']) {
        const found = await readTechnique(ref, libRoot, 'client-wf');
        expect(found.success).toBe(true);
        if (found.success) expect(found.value.capability).toContain('analyze');
      }
    });

    it('keeps it out of the workflow catalogue, holding no definition', () => {
      const index = indexCorpus(libRoot);
      expect(index.workflows.has('gitnexus')).toBe(false);
      expect([...index.workflows.keys()]).toEqual(['client-wf', 'meta']);
    });

    it('keeps every spelling valid when the tree above the library is regrouped', async () => {
      // Grouped under `vendor/`, the library's path from the corpus root grows a segment. The
      // references written against the smaller tree still reach it, beside the whole path.
      const regrouped = mkdtempSync(join(tmpdir(), 'technique-ns-regrouped-'));
      technique(join(regrouped, 'vendor', 'support', 'gitnexus'), 'analyze');
      writeWorkflowFixture(regrouped, 'client-wf');
      writeWorkflowFixture(regrouped, 'meta');
      const index = indexCorpus(regrouped);
      for (const ref of ['gitnexus::analyze', 'support::gitnexus::analyze', 'vendor::support::gitnexus::analyze']) {
        expect(parseTechniqueRef(ref, index))
          .toMatchObject({ namespace: 'vendor/support/gitnexus', segments: ['analyze'] });
        const found = await readTechnique(ref, regrouped, 'client-wf');
        expect(found.success).toBe(true);
      }
      rmSync(regrouped, { recursive: true, force: true });
    });

    it('round-trips a built reference through the rule', () => {
      const index = indexCorpus(libRoot);
      const built = techniqueRef('support/gitnexus', ['analyze']);
      expect(built.text).toBe('support::gitnexus::analyze');
      expect(parseTechniqueRef(built.text, index)).toMatchObject({ namespace: 'support/gitnexus', segments: ['analyze'] });
    });
  });

  describe('what the referring workflow resolves', () => {
    it('resolves a qualified reference in the named workflow only, with no meta fallback', async () => {
      const found = await readTechnique('shared-wf::standalone', root, 'local-wf');
      expect(found.success).toBe(true);
      const absent = await readTechnique('shared-wf::shared-only', root, 'local-wf');
      expect(absent.success).toBe(false);
    });

    it('resolves a bare reference against the referring workflow and then meta', async () => {
      const local = await readTechnique('standalone', root, 'local-wf');
      expect(local.success).toBe(true);
      if (local.success) expect(local.value.capability).toContain('standalone');
      const shared = await readTechnique('shared-only', root, 'local-wf');
      expect(shared.success).toBe(true);
    });

    it('does not deliver a same-named local group in place of a workflow that has no techniques yet', async () => {
      // local-wf holds techniques/bare-wf/technique.md, and bare-wf is a workflow: the reference
      // names the workflow, so it resolves to nothing rather than to the local group's file.
      const result = await readTechnique('bare-wf::technique', root, 'local-wf');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.name).toBe('TechniqueNotFoundError');
    });
  });
});
