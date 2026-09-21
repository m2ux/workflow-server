import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readTechnique, projectTechnique, projectTechniqueToYaml, composeTechnique, composeTechniqueWithSource, projectTechniqueWire, resolveTechniques, formatTechniqueBundle } from '../src/loaders/technique-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import { safeValidateTechnique } from '../src/schema/technique.schema.js';
import { liveCorpusRoot } from './corpus-root.js';
import { writeWorkflowFixture } from './corpus-fixture.js';

const LIVE_CORPUS = liveCorpusRoot();
const WORKFLOW_DIR = LIVE_CORPUS ?? '';
const FIXTURE_DIR = resolve(import.meta.dirname, 'fixtures/markdown-techniques');

/* -------------------------------------------------------------------------- */
/* Existing real-content checks — pin the markdown loader against the          */
/* migrated workflows/ content (TC-16 backward compatibility).                 */
/* -------------------------------------------------------------------------- */

describe('technique-loader', () => {
  describe.skipIf(!LIVE_CORPUS)('readTechnique (real content)', () => {
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
        expect(result.error.name).toBe('TechniqueNotFoundError');
      }
    });

    it('PR126-TC-08: projectTechniqueToYaml round-trip preserves the Technique object', async () => {
      const result = await readTechnique('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const projected = projectTechniqueToYaml(result.value);
        const decoded = parseYaml(projected);
        const parsed = safeValidateTechnique(decoded);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.id).toBe(result.value.id);
          expect(parsed.data.version).toBe(result.value.version);
          expect(parsed.data.capability).toBe(result.value.capability);
          expect(parsed.data.protocol).toEqual(result.value.protocol);
        }
      }
    });

    it('PR126-TC-15: technique-loader.ts no longer imports parseActivityFilename under a parseSkillFilename alias', async () => {
      const source = await readFile(resolve(import.meta.dirname, '../src/loaders/technique-loader.ts'), 'utf-8');
      expect(source).not.toMatch(/parseActivityFilename\s+as\s+parseSkillFilename/);
      expect(source).not.toMatch(/parseSkillFilename\b/);
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Tempdir parsing edge cases (markdown variant of the old YAML tests)       */
  /* ------------------------------------------------------------------------ */

  describe('markdown loader edge cases', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'technique-test-')));
      writeWorkflowFixture(tempDir, 'meta');
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

    // #330 — an `#### artifact` body that cannot be a filename reaches the schema refinement and
    // drops the technique, rather than being derived into the file a worker tries to create.
    it('rejects an `#### artifact` body that is not a filename, and loads the corrected literal', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      const technique = (artifactBody: string) => [
        '---', 'metadata:', '  version: 1.0.0', '---', '',
        '## Capability', '', 'Cap.', '',
        '## Outputs', '', '### completion_record', '', 'The close-out.', '',
        '#### artifact', '', artifactBody, '',
      ].join('\n');

      await writeFile(join(dir, 'artifact-prose.md'), technique('`COMPLETE.md` (implementation) or session `README.md` section (review mode)'), 'utf-8');
      expect((await readTechnique('artifact-prose', tempDir)).success).toBe(false);

      await writeFile(join(dir, 'artifact-prose.md'), technique('`COMPLETE.md`'), 'utf-8');
      const fixed = await readTechnique('artifact-prose', tempDir);
      expect(fixed.success).toBe(true);
      if (fixed.success) {
        expect(fixed.value.outputs?.[0]?.artifact?.name).toBe('COMPLETE.md');
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
      writeWorkflowFixture(tempDir, 'meta');
      writeWorkflowFixture(tempDir, 'wp');
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
        expect(result.value.protocol).toBeUndefined();
      }
    });

    it('preserves "(optional)" description prose and emits no required flag', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'opt.md'),
        [...FM('opt'), '## Capability', '', 'Cap.', '', '## Inputs', '', '### maybe_input', '', '(optional) Provided only on resume.', '', '### firm_input', '', 'Always needed.', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('opt', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        const [maybe, firm] = result.value.inputs ?? [];
        expect(maybe?.description).toMatch(/^\(optional\) Provided only on resume/);
        expect(maybe && 'required' in maybe).toBe(false);
        expect(firm && 'required' in firm).toBe(false);
        expect(projectTechniqueToYaml(result.value)).not.toContain('required:');
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
          '', '### anchored', '',
          'An [anchored](/prism/resources/portfolio.md#scoring) workflow-anchored ref',
          '', '## Protocol', '',
          '1. Use [grp](./grp/TECHNIQUE.md)::[op](./grp/op.md), then read [guide](../resources/guide.md)',
          '',
        ].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('reslink', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        const projected = projectTechniqueToYaml(result.value);
        // resource links: path + .md stripped, anchor kept; cross-workflow keeps the wf prefix
        expect(projected).toContain('[log](assumption-reconciliation#integration-with-assumptions-log)');
        expect(projected).toContain('[lens](prism/portfolio#scoring)');
        expect(projected).toContain('[anchored](prism/portfolio#scoring)');
        expect(projected).toContain('[guide](guide)');
        expect(projected).not.toContain('../resources/');
        expect(projected).not.toContain('/prism/resources/');
        // technique links are NOT rewritten
        expect(projected).toContain('[grp](./grp/TECHNIQUE.md)');
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

    it('composeTechnique inherits the root rules and leaves the protocol as authored', async () => {
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
        // A container contributes a contract, never steps — none of the root's three blocks
        // reaches the descendant, whatever each is titled.
        expect(result.value.protocol?.flatMap((b) => b.steps)).toEqual(['Do the work']);
      }
    });

    it('resolveTechniques leaves a nested op its own protocol across the whole ancestor chain', async () => {
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
      expect(steps).toEqual(['op-work']);

      // A container referenced directly delivers its own protocol in full, and only its own.
      const direct = await resolveTechniques(['grp'], tempDir, 'wp');
      const grp = direct.find((r) => r.type === 'technique' && r.source === 'grp');
      const grpSteps = (grp!.body as { protocol?: Array<{ steps: string[] }> }).protocol!.flatMap((b) => b.steps);
      expect(grpSteps).toEqual(['grp-init', 'grp-setup', 'grp-final']);
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
        // Technique-own entries — including the override of a root-declared id — stay under `inputs`.
        expect(result.value.inputs?.map(i => i.id).sort()).toEqual(['own-input', 'shared-id']);
        const shared = result.value.inputs?.find(i => i.id === 'shared-id');
        expect(shared?.description).toMatch(/Technique override wins/);
        // Root-contract entries arrive under the marked inherited block, with the scope note.
        expect(result.value.inherited_inputs?.items.map(i => i.id)).toEqual(['root-input']);
        expect(result.value.inherited_inputs?.note).toMatch(/workflow or group contract/);
        // Outputs partition the same way: the technique declares none of its own.
        expect(result.value.outputs).toBeUndefined();
        expect(result.value.inherited_outputs?.items.map(o => o.id)).toEqual(['result']);
        expect(result.value.inherited_outputs?.note).toMatch(/workflow or group contract/);
      }
    });

    it('projectTechniqueToYaml renders inherited blocks adjacent to their own sections', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [
          ...FM('TECHNIQUE'),
          '## Capability', '', 'Root.', '',
          '## Inputs', '',
          '### root-input', '', 'Provided by the root contract.', '',
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
          '## Protocol', '', '1. Work', '',
          '## Outputs', '',
          '### own-result', '', 'Own outcome.', '',
        ].join('\n'),
        'utf-8',
      );
      const result = await composeTechnique('work', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (result.success) {
        const yaml = projectTechniqueToYaml(result.value);
        const at = (key: string) => yaml.indexOf(`\n${key}:`);
        expect(at('inputs')).toBeGreaterThan(-1);
        expect(at('inputs')).toBeLessThan(at('inherited_inputs'));
        expect(at('inherited_inputs')).toBeLessThan(at('protocol'));
        expect(at('outputs')).toBeLessThan(at('inherited_outputs'));
        expect(yaml).toContain('not specific to this technique');
      }
    });

    it('resolveTechniques names the group scope instead of copying its inputs into the op body', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(join(dir, 'grp'), { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'TECHNIQUE.md'),
        [
          ...FM('grp'),
          '## Capability', '', 'Group.', '',
          '## Inputs', '',
          '### grp-shared', '', 'Shared across the group.', '',
        ].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'grp', 'op.md'),
        [
          ...FM('op'),
          '## Capability', '', 'An op.', '',
          '## Inputs', '',
          '### own-input', '', 'Op-local input.', '',
          '## Protocol', '', '1. Work', '',
        ].join('\n'),
        'utf-8',
      );
      const resolved = await resolveTechniques(['grp::op'], tempDir, 'wp');
      const op = resolved.find((r) => r.type === 'technique' && r.name === 'op');
      const body = op!.body as {
        inputs?: Array<{ id: string }>;
        inherited_inputs?: { note: string; items: Array<{ id: string }> };
        inherits?: string[];
      };
      expect(body.inputs?.map((i) => i.id)).toEqual(['own-input']);
      expect(body.inherited_inputs).toBeUndefined();
      expect(body.inherits).toEqual(['grp']);
      expect(op!.scopes?.map((s) => s.id)).toEqual(['grp']);
      expect(op!.scopes?.[0]?.inputs?.map((i) => i.id)).toEqual(['grp-shared']);
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
        // Protocol: the op's own, whatever its ancestors author.
        const steps = result.value.protocol?.flatMap(b => b.steps);
        expect(steps).toEqual(['Do the op']);
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

    /**
     * A technique fetched across a workflow boundary carries the shared contract written above
     * it — the root and group `TECHNIQUE.md` of the workflow holding the file — whichever
     * workflow asked for it. Both ways of reaching another workflow's technique are covered: a
     * `workflow::` prefix, and a bare reference falling back to the shared `meta` layer.
     */
    const writeCrossWorkflowFixture = async (): Promise<void> => {
      const metaDir = join(tempDir, 'meta', 'techniques', 'grp');
      await mkdir(metaDir, { recursive: true });
      await writeFile(
        join(tempDir, 'meta', 'techniques', 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Meta root.', '',
         '## Inputs', '', '### meta-root-input', '', 'Meta root contract.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(metaDir, 'TECHNIQUE.md'),
        [...FM('grp'), '## Capability', '', 'Meta group.', '',
         '## Inputs', '', '### grp-input', '', 'Group contract.', '',
         '## Rules', '', '### grp-rule', '', 'Group constraint.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(metaDir, 'op.md'),
        [...FM('op'), '## Capability', '', 'Shared op.', '',
         '## Inputs', '', '### own-input', '', 'Op-local input.', '',
         '## Protocol', '', '1. Operate', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(tempDir, 'wp', 'techniques', 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Caller root.', '',
         '## Inputs', '', '### caller-input', '', 'Caller contract.', '',
         '## Rules', '', '### caller-rule', '', 'Caller constraint.', ''].join('\n'),
        'utf-8',
      );
    };

    it('composeTechnique composes a prefixed cross-workflow technique against its own workflow', async () => {
      await mkdir(join(tempDir, 'wp', 'techniques'), { recursive: true });
      await writeCrossWorkflowFixture();

      const result = await composeTechnique('meta::grp::op', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value.inputs?.map(i => i.id)).toEqual(['own-input']);
      // The contract above the file, not the one above the caller.
      expect(result.value.inherited_inputs?.items.map(i => i.id)).toEqual(['meta-root-input', 'grp-input']);
      expect(result.value.rules?.['grp-rule']).toBeDefined();
      expect(result.value.rules?.['caller-rule']).toBeUndefined();

      // Fetched from the workflow that holds it, the same technique reads the same way.
      const fromHome = await composeTechnique('meta::grp::op', tempDir, 'meta');
      expect(fromHome.success).toBe(true);
      if (fromHome.success) expect(fromHome.value).toEqual(result.value);
    });

    it('composeTechnique composes a meta-fallback technique against the meta contract', async () => {
      await mkdir(join(tempDir, 'wp', 'techniques'), { recursive: true });
      await writeCrossWorkflowFixture();

      // `wp` holds no `grp`, so the bare reference resolves through the shared meta layer.
      const result = await composeTechnique('grp::op', tempDir, 'wp');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value.inherited_inputs?.items.map(i => i.id)).toEqual(['meta-root-input', 'grp-input']);
      expect(result.value.rules?.['caller-rule']).toBeUndefined();
    });

    it('resolveTechniques composes a whole technique against the workflow holding it', async () => {
      await mkdir(join(tempDir, 'wp', 'techniques'), { recursive: true });
      await writeCrossWorkflowFixture();

      // The group itself, delivered whole: a bare reference the caller's workflow cannot answer,
      // and a prefixed one. Both read the meta contract, as the get_technique path does.
      for (const ref of ['grp', 'meta::grp']) {
        const resolved = await resolveTechniques([ref], tempDir, 'wp');
        const grp = resolved.find(r => r.type === 'technique');
        const body = grp!.body as { inherits?: string[]; inherited_inputs?: { items: Array<{ id: string }> } };
        expect(body.inherited_inputs).toBeUndefined();
        expect(body.inherits).toEqual(['meta']);
      }
    });

    it('formatTechniqueBundle delivers each inherited contract once and names it from every op', async () => {
      const dir = join(tempDir, 'wp', 'techniques', 'grp');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(tempDir, 'wp', 'techniques', 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root.', '',
         '## Rules', '', '### root-rule', '', 'Root constraint.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [
          ...FM('grp'),
          '## Capability', '', 'Group.', '',
          '## Inputs', '',
          '### grp-shared', '', 'Shared across the group.', '',
          '## Rules', '', '### group-rule', '', 'Group constraint.', '',
        ].join('\n'),
        'utf-8',
      );
      for (const op of ['a', 'b']) {
        await writeFile(
          join(dir, `${op}.md`),
          [
            ...FM(op),
            '## Capability', '', 'An op.', '',
            '## Inputs', '',
            '### own-input', '', 'Op-local input.', '',
            '## Rules', '', '### op-rule', '', 'Op constraint.', '',
            '## Protocol', '', '1. Work', '',
          ].join('\n'),
          'utf-8',
        );
      }
      const resolved = await resolveTechniques(['grp::a', 'grp::b'], tempDir, 'wp');
      const bundle = formatTechniqueBundle(resolved);
      const techniques = bundle['techniques'] as Record<string, { inherits?: string[]; rules?: Record<string, string>; inherited_inputs?: unknown }>;
      const contracts = bundle['contracts'] as Record<string, { note: string; rules?: Record<string, string>; inputs?: Array<{ id: string }> }>;
      expect(Object.keys(contracts).sort()).toEqual(['grp', 'wp']);
      expect(contracts['grp']?.inputs?.map((i) => i.id)).toEqual(['grp-shared']);
      expect(contracts['grp']?.rules?.['group-rule']).toBeDefined();
      expect(contracts['wp']?.rules?.['root-rule']).toBeDefined();
      expect(contracts['grp']?.note).toMatch(/workflow or group contract/);
      expect(techniques['wp/grp::a']?.inherits).toEqual(['wp', 'grp']);
      expect(techniques['wp/grp::b']?.inherits).toEqual(['wp', 'grp']);
      expect(techniques['wp/grp::a']?.rules).toEqual({ 'op-rule': 'Op constraint.' });
      expect(techniques['wp/grp::a']?.inherited_inputs).toBeUndefined();
      expect(techniques['wp/grp::b']?.inherited_inputs).toBeUndefined();
    });

    it('projectTechniqueWire keeps own rules and names scopes, without inherited copies', async () => {
      const dir = join(tempDir, 'wp', 'techniques', 'grp');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(tempDir, 'wp', 'techniques', 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root.', '', '## Rules', '', '### root-rule', '', 'Root constraint.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('grp'), '## Capability', '', 'Group.', '', '## Rules', '', '### group-rule', '', 'Group constraint.', ''].join('\n'),
        'utf-8',
      );
      await writeFile(
        join(dir, 'a.md'),
        [...FM('a'), '## Capability', '', 'An op.', '', '## Rules', '', '### op-rule', '', 'Op constraint.', '', '## Protocol', '', '1. Work', ''].join('\n'),
        'utf-8',
      );
      const loaded = await composeTechniqueWithSource('grp::a', tempDir, 'wp');
      expect(loaded.success).toBe(true);
      if (!loaded.success) return;
      const wire = projectTechniqueWire(loaded.value.technique, loaded.value.scopes, loaded.value.ownRuleKeys);
      expect(wire['inherits']).toEqual(['wp', 'grp']);
      expect(wire['rules']).toEqual({ 'op-rule': 'Op constraint.' });
      expect(wire['inherited_inputs']).toBeUndefined();
      expect(wire['inherited_outputs']).toBeUndefined();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* audience attribute (#224 V4): loader parse + projection carry-through      */
  /* ------------------------------------------------------------------------ */

  /**
   * A component holding a list states the fields one entry carries, in the same structured place a
   * component is stated. Without it the fields live only in the sentence describing the list, and a
   * step reading one off an item is making a claim nothing can settle.
   */
  describe('component entry fields', () => {
    let tempDir: string;
    const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'technique-entry-')));
      writeWorkflowFixture(tempDir, 'meta');
    });
    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    async function writeTechnique(componentBody: string[]): Promise<void> {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'rank.md'),
        [...FM, '## Capability', '', 'Cap.', '',
         '## Outputs', '', '### query_report', '', 'What the concept reached.', '',
         ...componentBody, ''].join('\n'),
        'utf-8',
      );
    }

    type Outputs = Array<{ id: string; components?: Record<string, unknown> }>;

    it('reads a component\'s `#####` sub-sections as the fields one entry carries', async () => {
      await writeTechnique([
        '#### processes', '', 'The flows the concept ranked into.', '',
        '##### summary', '', 'The name that identifies the flow end to end.', '',
        '##### priority', '', 'Its relevance.',
      ]);
      const result = await readTechnique('rank', tempDir);
      expect(result.success).toBe(true);
      if (!result.success) return;
      const component = (result.value.outputs as Outputs | undefined)?.[0]?.components?.['processes'];
      expect(component).toEqual({
        description: 'The flows the concept ranked into.',
        entry: {
          summary: 'The name that identifies the flow end to end.',
          priority: 'Its relevance.',
        },
      });
    });

    /** Most components are their description and nothing more, and stay a plain string. */
    it('keeps a component with no entry fields as its description', async () => {
      await writeTechnique(['#### definitions', '', 'The symbols it reached outside any flow.']);
      const result = await readTechnique('rank', tempDir);
      expect(result.success).toBe(true);
      if (!result.success) return;
      const component = (result.value.outputs as Outputs | undefined)?.[0]?.components?.['definitions'];
      expect(component).toBe('The symbols it reached outside any flow.');
    });

    /**
     * An output that IS a list has no part to hang the declaration on, so it uses the reserved
     * `entry` block. Reserved is what keeps one spelling from meaning two things: a `####` is a
     * part of the value everywhere else, and its presence here is how the output says it is a list.
     */
    it('reads a reserved `#### entry` block as the fields of a list-shaped output', async () => {
      await writeTechnique([
        '#### entry', '',
        '##### name', '', 'What the area is called.', '',
        '##### symbols', '', 'How many symbols it holds.',
      ]);
      const result = await readTechnique('rank', tempDir);
      expect(result.success).toBe(true);
      if (!result.success) return;
      const output = (result.value.outputs as Array<{ entry?: unknown; components?: unknown }> | undefined)?.[0];
      expect(output?.entry).toEqual({
        name: 'What the area is called.',
        symbols: 'How many symbols it holds.',
      });
      // Reserved, so it is not also read as a part of the value.
      expect(output?.components).toBeUndefined();
    });

    /**
     * An output is a value with parts or a list of entries, never both. Declaring each describes
     * two shapes of one value, and a reader addressing into it would be answered by whichever
     * declaration the access selected.
     */
    it('refuses an output declaring both its parts and its entry', async () => {
      await writeTechnique([
        '#### processes', '', 'The flows.', '',
        '#### entry', '', '##### name', '', 'Its name.',
      ]);
      const result = await readTechnique('rank', tempDir);
      expect(result.success).toBe(false);
    });

    it('validates against the technique schema either way', async () => {
      await writeTechnique([
        '#### processes', '', 'The flows.', '', '##### summary', '', 'Its name.', '',
        '#### definitions', '', 'The rest.',
      ]);
      const result = await readTechnique('rank', tempDir);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(safeValidateTechnique(result.value).success).toBe(true);
    });
  });

  describe('audience attribute', () => {
    let tempDir: string;
    const FM = ['---', 'metadata:', '  version: 1.0.0', '---', ''];

    beforeEach(async () => {
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'technique-audience-')));
      writeWorkflowFixture(tempDir, 'meta');
    });
    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    async function writeTechnique(audienceLine: string[]): Promise<void> {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'aud.md'),
        [...FM, '## Capability', '', 'Cap.', '',
         '## Outputs', '', '### state_log', '', 'The output.', ...audienceLine, ''].join('\n'),
        'utf-8',
      );
    }

    // PR227-TC-01
    it('parses `#### audience` = human onto the output entry', async () => {
      await writeTechnique(['', '#### audience', '', '`human`']);
      const result = await readTechnique('aud', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.outputs?.find((o) => o.id === 'state_log')?.audience).toBe('human');
      }
    });

    // PR227-TC-02
    it('parses `#### audience` = agent onto the output entry (alongside an artifact)', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'aud.md'),
        [...FM, '## Capability', '', 'Cap.', '',
         '## Outputs', '', '### state_log', '', 'The output.', '',
         '#### artifact', '', '`assumptions-log.json`', '',
         '#### audience', '', '`agent`', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('aud', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        const out = result.value.outputs?.find((o) => o.id === 'state_log');
        expect(out?.audience).toBe('agent');
        expect(out?.artifact?.name).toBe('assumptions-log.json');
      }
    });

    // PR227-TC-03 — backward compatibility
    it('loads an output with no `#### audience` (audience absent)', async () => {
      await writeTechnique([]);
      const result = await readTechnique('aud', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.outputs?.find((o) => o.id === 'state_log')?.audience).toBeUndefined();
      }
    });

    // PR227-TC-05 (loader path) — an out-of-set value is passed through and rejected by .strict()
    it('drops a technique whose `#### audience` is out of the human|agent set', async () => {
      await writeTechnique(['', '#### audience', '', '`robot`']);
      // A malformed field fails schema validation; the loader logs a warning and returns null,
      // which readTechnique surfaces as a not-found/err rather than a technique carrying `robot`.
      const result = await readTechnique('aud', tempDir);
      expect(result.success).toBe(false);
    });

    // PR227-TC-06 — projection carry-through, no source edit to projectTechnique
    it('projectTechnique / projectTechniqueToYaml preserve audience unchanged', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'aud.md'),
        [...FM, '## Capability', '', 'Cap.', '',
         '## Outputs', '', '### state_log', '', 'The output.', '',
         '#### artifact', '', '`assumptions-log.json`', '',
         '#### audience', '', '`agent`', ''].join('\n'),
        'utf-8',
      );
      const result = await readTechnique('aud', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        // Object projection preserves the field verbatim.
        const projected = projectTechnique(result.value) as { outputs?: Array<{ id: string; audience?: string }> };
        expect(projected.outputs?.find((o) => o.id === 'state_log')?.audience).toBe('agent');
        // YAML projection round-trips it too.
        const decoded = parseYaml(projectTechniqueToYaml(result.value)) as { outputs?: Array<{ id: string; audience?: string }> };
        expect(decoded.outputs?.find((o) => o.id === 'state_log')?.audience).toBe('agent');
      }
    });
  });
});
