import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readTechnique, readTechniqueRaw, projectTechniqueToToon, listWorkflowTechniqueIds, composeTechnique, resolveTechniques } from '../src/loaders/technique-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { decodeToonRaw } from '../src/utils/toon.js';
import { safeValidateTechnique } from '../src/schema/technique.schema.js';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');
const FIXTURE_DIR = resolve(import.meta.dirname, 'fixtures/markdown-techniques');

/* -------------------------------------------------------------------------- */
/* Existing real-content checks — pin the markdown loader against the          */
/* migrated workflows/ content (TC-16 backward compatibility).                 */
/* -------------------------------------------------------------------------- */

describe('technique-loader', () => {
  describe('readTechnique (real content)', () => {
    it('loads meta/agent-conduct (rules-only technique)', async () => {
      const result = await readTechnique('meta/agent-conduct', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('agent-conduct');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('loads meta/workflow-engine', async () => {
      const result = await readTechnique('meta/workflow-engine', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('workflow-engine');
        expect(result.value.version).toBeDefined();
        expect(result.value.capability).toBeDefined();
      }
    });

    it('resolves a cross-workflow technique via the canonical :: form (parity with the / form)', async () => {
      // The `::` cross-workflow prefix must resolve on the standalone readTechnique path exactly as
      // the legacy `/` form does. `prism::structural-analysis` (referenced from work-package
      // activities) targets the prism workflow even though the current workflow is work-package.
      const viaColons = await readTechnique('prism::structural-analysis', WORKFLOW_DIR, 'work-package');
      const viaSlash = await readTechnique('prism/structural-analysis', WORKFLOW_DIR, 'work-package');
      expect(viaColons.success).toBe(true);
      expect(viaSlash.success).toBe(true);
      if (viaColons.success && viaSlash.success) {
        expect(viaColons.value.id).toBe('structural-analysis');
        expect(viaColons.value.id).toBe(viaSlash.value.id);
        expect(viaColons.value.capability).toBeDefined();
      }
    });

    it('resolves a nested cross-workflow op via :: (workflow::group::op)', async () => {
      // Nested cross-workflow addressing — only the `::` form handles this (the `/` form cannot
      // express a nested op after the workflow segment).
      const result = await readTechnique('meta::workflow-engine::dispatch-activity', WORKFLOW_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('dispatch-activity');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('returns TechniqueNotFoundError for non-existent technique', async () => {
      const result = await readTechnique('non-existent-technique', WORKFLOW_DIR);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('TechniqueNotFoundError');
        expect(result.error.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('materialises workflow-engine operations and rules from markdown', async () => {
      const result = await readTechnique('meta/workflow-engine', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        // The index carries rules but NO operations map — operations are files now.
        expect((result.value as { operations?: unknown }).operations).toBeUndefined();
        expect(result.value.rules).toBeDefined();
        expect(Object.keys(result.value.rules!).length).toBeGreaterThanOrEqual(3);
      }
      // Operations resolve from their `<op>.md` files via resolveTechniques.
      const resolved = await resolveTechniques(
        ['workflow-engine::dispatch-activity', 'workflow-engine::evaluate-transition', 'workflow-engine::commit-and-persist'],
        WORKFLOW_DIR,
      );
      const ops = resolved.filter((r) => r.type === 'technique');
      expect(ops.length).toBe(3);
      expect((ops[0]!.body as { protocol?: unknown }).protocol).toBeDefined();
    });

    it('does not deliver an errors field — the Errors section is deprecated (folded into protocol)', async () => {
      const resolved = await resolveTechniques(
        ['workflow-engine::dispatch-activity', 'workflow-engine::evaluate-transition', 'workflow-engine::handle-sub-workflow'],
        WORKFLOW_DIR,
      );
      const techniques = resolved.filter((r) => r.type === 'technique');
      expect(techniques.length).toBeGreaterThan(0);
      for (const entry of techniques) {
        expect((entry.body as { errors?: unknown }).errors, `${entry.name} must not carry a deprecated errors field`).toBeUndefined();
      }
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Fixture-based cases (PR126-TC-03 through TC-08, TC-15)                    */
  /* ------------------------------------------------------------------------ */

  describe('markdown fixtures (PR126-TC suite)', () => {
    it('PR126-TC-03: resolves op-as-child-files via resolveTechniques (group::op -> op file)', async () => {
      const resolved = await resolveTechniques(
        ['work-package/cargo-operations::check', 'work-package/cargo-operations::test'],
        FIXTURE_DIR,
      );
      const byName = Object.fromEntries(resolved.map((r) => [r.name, r]));
      expect(byName['check']?.type).toBe('technique');
      expect(byName['test']?.type).toBe('technique');
      const check = byName['check']!.body as { protocol?: Array<{ steps: string[] }> };
      expect(Array.isArray(check.protocol)).toBe(true);
      expect(check.protocol!.flatMap((b) => b.steps).length).toBeGreaterThan(0);
      // The grouped index itself loads as a plain technique with no operations map.
      const idx = await readTechnique('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(idx.success).toBe(true);
      if (idx.success) expect((idx.value as { operations?: unknown }).operations).toBeUndefined();
    });

    it('PR126-TC-04: falls back to meta when no workflow-local override exists', async () => {
      const result = await readTechnique('agent-conduct', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.capability).toMatch(/meta-version/i);
      }
    });

    it('PR126-TC-05: workflow-local override suppresses the meta version', async () => {
      const result = await readTechnique('build-comprehension', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.capability).toMatch(/workflow-local override/i);
      }
    });

    it('PR126-TC-05b: explicit meta/<id> prefix wins over a workflow-local override', async () => {
      // Inverse direction of TC-05: when a workflow-local override exists, an
      // explicit `meta/<id>` reference must bypass precedence and force-target
      // the meta layer. The `explicit-prefix-target` slug ships paired fixtures
      // (meta tagged `description: meta-version`, work-package tagged
      // `description: workflow-local override`) so the assertion can confirm
      // the meta-side value is returned despite the override existing. Uses a
      // dedicated slug to avoid coupling with TC-04's no-override premise.
      const result = await readTechnique('meta/explicit-prefix-target', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.capability).toMatch(/meta-version/i);
        expect(result.value.capability).not.toMatch(/workflow-local override/i);
      }
    });

    it('PR126-TC-06: a malformed op file (missing Protocol) does not resolve as an operation', async () => {
      // broken.md has no `## Protocol`; the op parser throws and resolveTechniques surfaces the ref
      // as not-found rather than a partial/silent operation. The grouped index still loads fine.
      const resolved = await resolveTechniques(['work-package/malformed-ops::broken'], FIXTURE_DIR);
      expect(resolved[0]!.type).toBe('not-found');
      const idx = await readTechnique('malformed-ops', FIXTURE_DIR, 'work-package');
      expect(idx.success).toBe(true);
    });

    it('PR126-TC-07: returns TechniqueNotFoundError when neither workflow-local nor meta has the technique', async () => {
      const result = await readTechnique('no-such-technique', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('PR126-TC-08: projectTechniqueToToon round-trip preserves the Technique object', async () => {
      const result = await readTechnique('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const toon = projectTechniqueToToon(result.value);
        const decoded = decodeToonRaw(toon);
        const parsed = safeValidateTechnique(decoded);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.id).toBe(result.value.id);
          expect(parsed.data.version).toBe(result.value.version);
          expect(Object.keys(parsed.data.operations ?? {}).sort()).toEqual(
            Object.keys(result.value.operations ?? {}).sort(),
          );
        }
      }
    });

    it('PR126-TC-15: technique-loader.ts no longer imports parseActivityFilename under a parseSkillFilename alias', async () => {
      const source = await readFile(resolve(import.meta.dirname, '../src/loaders/technique-loader.ts'), 'utf-8');
      expect(source).not.toMatch(/parseActivityFilename\s+as\s+parseSkillFilename/);
      expect(source).not.toMatch(/parseSkillFilename\b/);
    });

    it('readTechniqueRaw returns projected TOON (decodes back to a valid Technique)', async () => {
      const result = await readTechniqueRaw('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const decoded = decodeToonRaw(result.value);
        const parsed = safeValidateTechnique(decoded);
        expect(parsed.success).toBe(true);
      }
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Tempdir parsing edge cases (markdown variant of the old TOON tests)       */
  /* ------------------------------------------------------------------------ */

  describe('markdown loader edge cases', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'technique-test-')));
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('returns TechniqueNotFoundError when no technique file exists', async () => {
      const result = await readTechnique('does-not-exist', tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('TechniqueNotFoundError');
      }
    });

    it('rejects a flat technique file with no frontmatter as validation failure', async () => {
      await mkdir(join(tempDir, 'meta', 'techniques'), { recursive: true });
      await writeFile(join(tempDir, 'meta', 'techniques', 'malformed.md'), 'just a plain string', 'utf-8');
      const result = await readTechnique('malformed', tempDir);
      expect(result.success).toBe(false);
    });

    it('rejects a non-canonical singular interface header (## Output / ## Input / ## Output(s))', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      for (const banned of ['## Output', '## Input', '## Output(s)']) {
        await writeFile(
          join(dir, 'singular.md'),
          ['---', 'metadata:', '  version: 1.0.0', '---', '',
           '## Capability', '', 'Cap.', '',
           banned, '', '### result', '', 'The outcome.', ''].join('\n'),
          'utf-8',
        );
        const result = await readTechnique('singular', tempDir);
        expect(result.success).toBe(false);
      }
    });

    it('loads the canonical plural interface headers (## Inputs / ## Outputs)', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'plural.md'),
        ['---', 'metadata:', '  version: 1.0.0', '---', '',
         '## Capability', '', 'Cap.', '',
         '## Inputs', '', '### in_a', '', 'An input.', '',
         '## Outputs', '', '### out_a', '', 'An output.', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('plural', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.inputs?.map((i) => i.id)).toContain('in_a');
        expect(result.value.outputs?.map((o) => o.id)).toContain('out_a');
      }
    });

    it('loads a minimal flat technique with frontmatter + Capability', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'minimal.md'),
        ['---', 'metadata:', '  version: 1.0.0', '---', '', '# Minimal', '', '## Capability', '', 'A minimal capability statement.', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('minimal', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('minimal');
        expect(result.value.capability).toMatch(/minimal capability/);
      }
    });
  });

  describe('flattened-shape resolution (TECHNIQUE.md model)', () => {
    let tempDir: string;
    // Identity comes from the filename/folder, not frontmatter — so the synthetic frontmatter
    // carries only metadata.version. The id arg is retained at call sites to document intent.
    const FM = (_id: string) => ['---', 'metadata:', '  version: 1.0.0', '---', ''];

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'technique-flat-')));
    });
    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('resolves a standalone technique from a flat <slug>.md file', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'classify.md'),
        [...FM('classify'), '## Capability', '', 'Classify the thing.', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('classify', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('classify');
        expect(result.value.capability).toMatch(/Classify the thing/);
        expect(result.value.operations).toBeUndefined();
      }
    });

    it('rewrites technique-relative resource links to get_resource refs; leaves technique links', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(
        join(dir, 'reslink.md'),
        [
          ...FM('reslink'),
          '## Capability', '', 'Cap.', '',
          '## Inputs', '',
          '### log', '',
          'The running [log](../resources/assumption-reconciliation.md#integration-with-assumptions-log) of items',
          '', '### lens', '',
          'A [lens](../../prism/resources/portfolio.md#scoring) cross-workflow ref',
          '', '## Protocol', '',
          '1. Use [grp](./grp/TECHNIQUE.md)::[op](./grp/op.md), then read [guide](../resources/guide.md)',
          '',
        ].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('reslink', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        const toon = projectTechniqueToToon(result.value);
        // resource links: path + .md stripped, anchor kept; cross-workflow keeps the wf prefix
        expect(toon).toContain('[log](assumption-reconciliation#integration-with-assumptions-log)');
        expect(toon).toContain('[lens](prism/portfolio#scoring)');
        expect(toon).toContain('[guide](guide)');
        expect(toon).not.toContain('../resources/');
        // technique links are NOT rewritten
        expect(toon).toContain('[grp](./grp/TECHNIQUE.md)');
      }
    });

    it('resolves an operation from a grouped <group>/<op>.md; the index has no operations map', async () => {
      const dir = join(tempDir, 'meta', 'techniques', 'vc');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('vc'), '## Capability', '', 'Version control ops.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'commit.md'),
        [...FM('commit'), '## Capability', '', 'commit a thing', '', '## Protocol', '', '1. Stage files', '2. Commit', ''].join('\n'),
        'utf-8',
      );
      const idx = await readTechnique('vc', tempDir);
      expect(idx.success).toBe(true);
      if (idx.success) {
        expect(idx.value.id).toBe('vc');
        expect((idx.value as { operations?: unknown }).operations).toBeUndefined();
      }
      const resolved = await resolveTechniques(['vc::commit'], tempDir);
      expect(resolved[0]!.type).toBe('technique');
      const op = resolved[0]!.body as { protocol?: Array<{ steps: string[] }> };
      expect(op.protocol).toEqual([{ steps: ['Stage files', 'Commit'] }]);
    });

    it('lists flat + grouped technique ids and excludes the root TECHNIQUE.md index', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(join(dir, 'TECHNIQUE.md'), [...FM('TECHNIQUE'), '## Capability', '', 'Root index.', ''].join('\n'), 'utf-8');
      await writeFile(join(dir, 'standalone.md'), [...FM('standalone'), '## Capability', '', 'Standalone.', ''].join('\n'), 'utf-8');
      await writeFile(join(dir, 'grp', 'TECHNIQUE.md'), [...FM('grp'), '## Capability', '', 'Grouped.', ''].join('\n'), 'utf-8');
      await writeFile(join(dir, 'grp', 'op.md'), ['an op', '', '## Protocol', '', '1. Do it', ''].join('\n'), 'utf-8');

      const ids = await listWorkflowTechniqueIds(tempDir, 'meta');
      expect(ids).toContain('standalone');
      expect(ids).toContain('grp');
      expect(ids).not.toContain('TECHNIQUE');
    });

    it('composeTechnique wraps the technique with the root Initial/Final; other root blocks are root-only', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root base.', '', '## Rules', '', '### no-skip', '', 'Never skip steps.', '',
         '## Protocol', '',
         '### Initial', '', '- root-init', '',
         '### Setup', '', '- root-setup', '',
         '### Final', '', '- root-final', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'do-thing.md'),
        [...FM('do-thing'), '## Capability', '', 'Do the thing.', '', '## Rules', '', '### own-rule', '', 'Be careful.', '', '## Protocol', '', '### 1. Work', '', '- Do the work', ''].join('\n'),
        'utf-8',
      );
      const result = await composeTechnique('do-thing', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.rules?.['no-skip']).toBeDefined(); // inherited from root
        expect(result.value.rules?.['own-rule']).toBeDefined(); // technique-local
        // root.Initial, then own, then root.Final — the root-only "Setup" block is NOT included.
        expect(result.value.protocol?.flatMap((b) => b.steps)).toEqual(['root-init', 'Do the work', 'root-final']);
      }
    });

    it('resolveTechniques recursively wraps an op with the Initial/Final of every ancestor (root + group)', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root.', '', '## Protocol', '',
         '### Initial', '', '- root-init', '', '### Final', '', '- root-final', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'TECHNIQUE.md'),
        [...FM('grp'), '## Capability', '', 'Group.', '', '## Protocol', '',
         '### Initial', '', '- grp-init', '', '### Setup', '', '- grp-setup', '', '### Final', '', '- grp-final', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'op.md'),
        [...FM('op'), '## Capability', '', 'An op.', '', '## Protocol', '', '### 1. Work', '', '- op-work', ''].join('\n'),
        'utf-8',
      );
      const resolved = await resolveTechniques(['grp::op'], tempDir, 'wp');
      const op = resolved.find((r) => r.type === 'technique' && r.name === 'op');
      const steps = (op!.body as { protocol?: Array<{ steps: string[] }> }).protocol!.flatMap((b) => b.steps);
      // root.Initial, grp.Initial, op's own, grp.Final, root.Final. grp's "Setup" is excluded.
      expect(steps).toEqual(['root-init', 'grp-init', 'op-work', 'grp-final', 'root-final']);

      // The group referenced DIRECTLY delivers its FULL own protocol (incl. Setup), wrapped only by the root.
      const direct = await resolveTechniques(['grp'], tempDir, 'wp');
      const grp = direct.find((r) => r.type === 'technique' && r.source === 'grp');
      const grpSteps = (grp!.body as { protocol?: Array<{ steps: string[] }> }).protocol!.flatMap((b) => b.steps);
      expect(grpSteps).toEqual(['root-init', 'grp-init', 'grp-setup', 'grp-final', 'root-final']);
    });

    it('composeTechnique merges inputs and output from the full ancestor chain', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [
          ...FM('TECHNIQUE'),
          '## Capability', '', 'Root.', '',
          '## Inputs', '',
          '### root-input', '', 'Provided by the root contract.', '',
          '### shared-id', '', 'Root version — technique should override.', '',
          '## Outputs', '',
          '### result', '', 'The outcome.', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'work.md'),
        [
          ...FM('work'),
          '## Capability', '', 'Do work.', '',
          '## Inputs', '',
          '### own-input', '', 'Technique-local input.', '',
          '### shared-id', '', 'Technique override wins.', '',
        ].join('\n'),
        'utf-8',
      );
      const result = await composeTechnique('work', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (result.success) {
        const inputIds = result.value.inputs?.map(i => i.id) ?? [];
        expect(inputIds).toContain('root-input');  // inherited from root
        expect(inputIds).toContain('own-input');   // technique-local
        expect(inputIds).toContain('shared-id');   // present exactly once
        expect(inputIds.filter(id => id === 'shared-id').length).toBe(1);
        // Technique-local description wins on id conflict.
        const shared = result.value.inputs?.find(i => i.id === 'shared-id');
        expect(shared?.description).toMatch(/Technique override wins/);
        // Outputs inherited from root (technique declares none).
        expect(result.value.outputs?.map(o => o.id)).toContain('result');
      }
    });

    it('composeTechnique with :: path resolves and fully composes a nested op', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [
          ...FM('TECHNIQUE'),
          '## Capability', '', 'Root.', '',
          '## Rules', '', '### root-rule', '', 'Root constraint.', '',
          '## Protocol', '',
          '### Initial', '', '- root-init', '',
          '### Final', '', '- root-final', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'TECHNIQUE.md'),
        [
          ...FM('grp'),
          '## Capability', '', 'Group.', '',
          '## Rules', '', '### group-rule', '', 'Group constraint.', '',
          '## Protocol', '',
          '### Initial', '', '- grp-init', '',
          '### Final', '', '- grp-final', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'op.md'),
        [
          ...FM('op'),
          '## Capability', '', 'The operation.', '',
          '## Rules', '', '### op-rule', '', 'Op constraint.', '',
          '## Protocol', '', '1. Do the op', '',
        ].join('\n'),
        'utf-8',
      );
      const result = await composeTechnique('grp::op', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (result.success) {
        // Protocol: full ancestor chain Initial/Final wrap.
        const steps = result.value.protocol?.flatMap(b => b.steps);
        expect(steps).toEqual(['root-init', 'grp-init', 'Do the op', 'grp-final', 'root-final']);
        // Rules: all three levels merged; technique-local wins on name conflict.
        expect(result.value.rules?.['root-rule']).toBeDefined();
        expect(result.value.rules?.['group-rule']).toBeDefined();
        expect(result.value.rules?.['op-rule']).toBeDefined();
      }
    });

    it('resolveTechniques emits rule entries from the full ancestor chain (root, group, op)', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [
          ...FM('TECHNIQUE'),
          '## Capability', '', 'Root.', '',
          '## Rules', '', '### root-rule', '', 'Root constraint.', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'TECHNIQUE.md'),
        [
          ...FM('grp'),
          '## Capability', '', 'Group.', '',
          '## Rules', '', '### group-rule', '', 'Group constraint.', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'op.md'),
        [
          ...FM('op'),
          '## Capability', '', 'The op.', '',
          '## Rules', '', '### op-rule', '', 'Op constraint.', '',
          '## Protocol', '', '1. Do it', '',
        ].join('\n'),
        'utf-8',
      );
      const resolved = await resolveTechniques(['grp::op'], tempDir, 'wp');
      const ruleNames = resolved.filter(r => r.type === 'rule').map(r => r.name);
      expect(ruleNames).toContain('op-rule');    // from the op
      expect(ruleNames).toContain('group-rule'); // from the group container
      expect(ruleNames).toContain('root-rule');  // from the workflow root
    });

    it('composeTechnique never inherits the meta root into a non-meta workflow', async () => {
      const metaDir = join(tempDir, 'meta', 'techniques');
      await mkdir(metaDir, { recursive: true });
      await writeFile(
        join(metaDir, 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Meta root.', '', '## Rules', '', '### meta-only', '', 'Orchestrator scope.', ''].join('\n'),
        'utf-8',
      );
      const wpDir = join(tempDir, 'wp', 'techniques');
      await mkdir(wpDir, { recursive: true });
      await writeFile(
        join(wpDir, 'solo.md'),
        [...FM('solo'), '## Capability', '', 'Solo technique, no wp root.', ''].join('\n'),
        'utf-8',
      );
      const result = await composeTechnique('solo', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.rules?.['meta-only']).toBeUndefined(); // meta root must NOT bleed in
      }
    });
  });
});
