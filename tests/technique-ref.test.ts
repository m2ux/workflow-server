import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { indexCorpus, type CorpusIndex } from '../src/loaders/corpus-index.js';
import { isBareName, parseTechniqueRef, techniqueRef, TechniqueRefError } from '../src/loaders/technique-ref.js';
import { readTechnique } from '../src/loaders/technique-loader.js';
import { writeWorkflowFixture } from './corpus-fixture.js';

/**
 * The one rule a technique reference resolves by: `[workflow::]technique[::nested…]`, with the
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
    technique(shared, join('group', 'operation'));
    technique(shared, join('group', 'subgroup', 'operation'));
    // A workflow with no techniques/ directory at all — the case the two readings used to split on.
    writeWorkflowFixture(root, 'bare-wf');
    // The workflow whose activities do the referring, carrying a group named after another workflow.
    const local = writeWorkflowFixture(root, 'local-wf');
    technique(local, 'standalone');
    technique(local, join('bare-wf', 'operation'));
    const meta = writeWorkflowFixture(root, 'meta');
    technique(meta, 'shared-only');
    index = indexCorpus(root);
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  describe('what a leading segment names', () => {
    it('reads it as a workflow when the corpus declares one of that name', () => {
      expect(parseTechniqueRef('shared-wf::standalone', index))
        .toMatchObject({ workflowId: 'shared-wf', segments: ['standalone'] });
    });

    it('reads it as a workflow whether or not that workflow carries techniques yet', () => {
      // `bare-wf` holds no techniques/ directory, so a rule deciding by that probe would read this
      // as a group in the referring workflow — and silently deliver local-wf/techniques/bare-wf/.
      expect(parseTechniqueRef('bare-wf::operation', index))
        .toMatchObject({ workflowId: 'bare-wf', segments: ['operation'] });
    });

    it('reads it as a group when the corpus declares no such workflow', () => {
      expect(parseTechniqueRef('group::operation', index))
        .toMatchObject({ workflowId: undefined, segments: ['group', 'operation'] });
    });

    it('reads a bare name as a technique in the referring workflow', () => {
      expect(parseTechniqueRef('standalone', index))
        .toMatchObject({ workflowId: undefined, segments: ['standalone'] });
    });

    it('takes a workflow prefix only when a segment follows it', () => {
      expect(parseTechniqueRef('shared-wf', index))
        .toMatchObject({ workflowId: undefined, segments: ['shared-wf'] });
    });
  });

  describe('depth', () => {
    it('admits a path of any depth inside a workflow', () => {
      expect(parseTechniqueRef('group::subgroup::operation', index))
        .toMatchObject({ workflowId: undefined, segments: ['group', 'subgroup', 'operation'] });
    });

    it('admits a workflow prefix before a nested path', () => {
      expect(parseTechniqueRef('shared-wf::group::subgroup::operation', index))
        .toMatchObject({ workflowId: 'shared-wf', segments: ['group', 'subgroup', 'operation'] });
    });
  });

  describe('the slash spelling of a workflow prefix', () => {
    it('names the workflow, and the rest is the path within it', () => {
      expect(parseTechniqueRef('shared-wf/group::operation', index))
        .toMatchObject({ workflowId: 'shared-wf', segments: ['group', 'operation'] });
    });

    it('names a workflow whether or not the corpus holds one', () => {
      expect(parseTechniqueRef('no-such-wf/standalone', index))
        .toMatchObject({ workflowId: 'no-such-wf', segments: ['standalone'] });
    });
  });

  describe('what the rule refuses', () => {
    const refused = ['', '::standalone', 'standalone::', 'group::::operation', 'a/b/c', 'group::a/b', '/standalone'];
    for (const ref of refused) {
      it(`refuses '${ref}' and names the rule in the refusal`, () => {
        expect(() => parseTechniqueRef(ref, index)).toThrow(TechniqueRefError);
        try {
          parseTechniqueRef(ref, index);
        } catch (error) {
          expect((error as Error).message).toContain('[workflow::]technique[::nested…]');
        }
      });
    }

    it('surfaces the refusal through the loader rather than as a technique that is merely absent', async () => {
      const result = await readTechnique('group::::operation', root, 'local-wf');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.name).toBe('TechniqueRefError');
    });
  });

  describe('spelling a reference', () => {
    it('writes a built reference canonically', () => {
      expect(techniqueRef('shared-wf', ['group', 'operation']).text).toBe('shared-wf::group::operation');
      expect(techniqueRef(undefined, ['standalone']).text).toBe('standalone');
    });

    it('keeps the reference as written, which is what a message quotes', () => {
      expect(parseTechniqueRef('shared-wf/standalone', index).text).toBe('shared-wf/standalone');
    });

    it('calls a name bare only when it carries neither separator', () => {
      expect(isBareName('standalone')).toBe(true);
      expect(isBareName('group::operation')).toBe(false);
      expect(isBareName('shared-wf/standalone')).toBe(false);
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
      // local-wf holds techniques/bare-wf/operation.md, and bare-wf is a workflow: the reference
      // names the workflow, so it resolves to nothing rather than to the local group's file.
      const result = await readTechnique('bare-wf::operation', root, 'local-wf');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.name).toBe('TechniqueNotFoundError');
    });
  });
});
