import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readTechnique, readTechniqueRaw, projectTechniqueToToon, listWorkflowTechniqueIds, composeTechnique, resolveOperations } from '../src/loaders/technique-loader.js';
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
      // Operations resolve from their `<op>.md` files via resolveOperations.
      const resolved = await resolveOperations(
        ['workflow-engine::dispatch-activity', 'workflow-engine::evaluate-transition', 'workflow-engine::commit-and-persist'],
        WORKFLOW_DIR,
      );
      const ops = resolved.filter((r) => r.type === 'operation');
      expect(ops.length).toBe(3);
      expect((ops[0]!.body as { protocol?: unknown }).protocol).toBeDefined();
    });

    it('resolved operation errors carry cause + recovery', async () => {
      const resolved = await resolveOperations(
        ['workflow-engine::dispatch-activity', 'workflow-engine::evaluate-transition', 'workflow-engine::handle-sub-workflow'],
        WORKFLOW_DIR,
      );
      for (const entry of resolved.filter((r) => r.type === 'operation')) {
        const errors = (entry.body as { errors?: Record<string, { cause?: string; recovery?: string }> }).errors;
        if (!errors) continue;
        for (const [errorName, info] of Object.entries(errors)) {
          expect(info.cause, `${entry.name}::${errorName} should have 'cause'`).toBeDefined();
          expect(info.recovery, `${entry.name}::${errorName} should have 'recovery'`).toBeDefined();
        }
      }
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Fixture-based cases (PR126-TC-03 through TC-08, TC-15)                    */
  /* ------------------------------------------------------------------------ */

  describe('markdown fixtures (PR126-TC suite)', () => {
    it('PR126-TC-03: resolves op-as-child-files via resolveOperations (group::op -> op file)', async () => {
      const resolved = await resolveOperations(
        ['work-package/cargo-operations::check', 'work-package/cargo-operations::test'],
        FIXTURE_DIR,
      );
      const byName = Object.fromEntries(resolved.map((r) => [r.name, r]));
      expect(byName['check']?.type).toBe('operation');
      expect(byName['test']?.type).toBe('operation');
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
      // broken.md has no `## Protocol`; the op parser throws and resolveOperations surfaces the ref
      // as not-found rather than a partial/silent operation. The grouped index still loads fine.
      const resolved = await resolveOperations(['work-package/malformed-ops::broken'], FIXTURE_DIR);
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

    it('loads a minimal flat technique with frontmatter + Capability', async () => {
      const dir = join(tempDir, 'meta', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'minimal.md'),
        ['---', 'name: minimal', 'description: minimal description', 'metadata:', '  version: 1.0.0', '---', '', '# Minimal', '', '## Capability', '', 'A minimal capability statement.', ''].join('\n'),
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
    const FM = (name: string) => ['---', `name: ${name}`, `description: ${name} desc`, 'metadata:', '  version: 1.0.0', '---', ''];

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
        ['commit a thing', '', '## Protocol', '', '1. Stage files', '2. Commit', ''].join('\n'),
        'utf-8',
      );
      const idx = await readTechnique('vc', tempDir);
      expect(idx.success).toBe(true);
      if (idx.success) {
        expect(idx.value.id).toBe('vc');
        expect((idx.value as { operations?: unknown }).operations).toBeUndefined();
      }
      const resolved = await resolveOperations(['vc::commit'], tempDir);
      expect(resolved[0]!.type).toBe('operation');
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

    it('composeTechnique inherits the root contract and prepends the root protocol', async () => {
      const dir = join(tempDir, 'wp', 'techniques');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'TECHNIQUE.md'),
        [...FM('TECHNIQUE'), '## Capability', '', 'Root base.', '', '## Rules', '', '### no-skip', '', 'Never skip steps.', '', '## Protocol', '', '### 1. Preamble', '', '- Read AGENTS.md', ''].join('\n'),
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
        expect(result.value.protocol?.[0]?.steps).toEqual(['Read AGENTS.md']); // root preamble first
        expect(result.value.protocol?.[1]?.steps).toEqual(['Do the work']); // then own
      }
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
