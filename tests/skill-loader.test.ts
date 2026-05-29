import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readSkill, readSkillRaw, projectSkillToToon } from '../src/loaders/skill-loader.js';
import { resolve, join } from 'node:path';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { decodeToonRaw } from '../src/utils/toon.js';
import { safeValidateSkill } from '../src/schema/skill.schema.js';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');
const FIXTURE_DIR = resolve(import.meta.dirname, 'fixtures/markdown-skills');

/* -------------------------------------------------------------------------- */
/* Existing real-content checks — pin the markdown loader against the          */
/* migrated workflows/ content (TC-16 backward compatibility).                 */
/* -------------------------------------------------------------------------- */

describe('skill-loader', () => {
  describe('readSkill (real content)', () => {
    it('loads meta/agent-conduct (rules-only technique)', async () => {
      const result = await readSkill('meta/agent-conduct', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('agent-conduct');
        expect(result.value.capability).toBeDefined();
      }
    });

    it('loads meta/workflow-engine', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('workflow-engine');
        expect(result.value.version).toBeDefined();
        expect(result.value.capability).toBeDefined();
      }
    });

    it('returns SkillNotFoundError for non-existent skill', async () => {
      const result = await readSkill('non-existent-skill', WORKFLOW_DIR);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SkillNotFoundError');
        expect(result.error.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('materialises workflow-engine operations and rules from markdown', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const skill = result.value;
        expect(skill.operations).toBeDefined();
        expect(Object.keys(skill.operations!).length).toBeGreaterThanOrEqual(6);
        expect(skill.rules).toBeDefined();
        expect(Object.keys(skill.rules!).length).toBeGreaterThanOrEqual(3);

        const opsWithErrors = Object.values(skill.operations!).filter(
          (op) => (op as { errors?: Record<string, unknown> }).errors !== undefined,
        );
        expect(opsWithErrors.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('materialises per-operation errors with cause + recovery', async () => {
      const result = await readSkill('meta/workflow-engine', WORKFLOW_DIR);
      expect(result.success).toBe(true);
      if (result.success && result.value.operations) {
        for (const [opName, opDef] of Object.entries(result.value.operations)) {
          const errors = (opDef as { errors?: Record<string, { cause?: string; recovery?: string }> }).errors;
          if (!errors) continue;
          for (const [errorName, errorInfo] of Object.entries(errors)) {
            expect(errorInfo.cause, `${opName}::${errorName} should have 'cause' field`).toBeDefined();
            expect(errorInfo.recovery, `${opName}::${errorName} should have 'recovery' field`).toBeDefined();
          }
        }
      }
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Fixture-based cases (PR126-TC-03 through TC-08, TC-15)                    */
  /* ------------------------------------------------------------------------ */

  describe('markdown fixtures (PR126-TC suite)', () => {
    it('PR126-TC-03: materialises op-as-child-files into Skill.operations keyed by op basename', async () => {
      const result = await readSkill('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const ops = result.value.operations ?? {};
        expect(ops['check']).toBeDefined();
        expect(ops['test']).toBeDefined();
        const check = ops['check'] as { procedure?: string[]; inputs?: unknown };
        expect(Array.isArray(check.procedure)).toBe(true);
        expect(check.procedure!.length).toBeGreaterThan(0);
      }
    });

    it('PR126-TC-04: falls back to meta when no workflow-local override exists', async () => {
      const result = await readSkill('agent-conduct', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toMatch(/meta-version/i);
      }
    });

    it('PR126-TC-05: workflow-local override suppresses the meta version', async () => {
      const result = await readSkill('build-comprehension', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.description).toMatch(/workflow-local override/i);
      }
    });

    it('PR126-TC-06: malformed op-child file (missing Procedure) raises a loader error', async () => {
      const result = await readSkill('malformed-ops', FIXTURE_DIR, 'work-package');
      // Parser surfaces the error as SkillNotFoundError (matches contract). Verify either:
      //   (a) the result is failed, OR
      //   (b) the operation was silently dropped (regression — should be false).
      expect(result.success).toBe(false);
    });

    it('PR126-TC-07: returns SkillNotFoundError when neither workflow-local nor meta has the skill', async () => {
      const result = await readSkill('no-such-technique', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SKILL_NOT_FOUND');
      }
    });

    it('PR126-TC-08: projectSkillToToon round-trip preserves the Skill object', async () => {
      const result = await readSkill('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const toon = projectSkillToToon(result.value);
        const decoded = decodeToonRaw(toon);
        const parsed = safeValidateSkill(decoded);
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

    it('PR126-TC-15: skill-loader.ts no longer imports parseActivityFilename under a parseSkillFilename alias', async () => {
      const source = await readFile(resolve(import.meta.dirname, '../src/loaders/skill-loader.ts'), 'utf-8');
      expect(source).not.toMatch(/parseActivityFilename\s+as\s+parseSkillFilename/);
      expect(source).not.toMatch(/parseSkillFilename\b/);
    });

    it('readSkillRaw returns projected TOON (decodes back to a valid Skill)', async () => {
      const result = await readSkillRaw('cargo-operations', FIXTURE_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const decoded = decodeToonRaw(result.value);
        const parsed = safeValidateSkill(decoded);
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
      tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'skill-test-')));
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('returns SkillNotFoundError when no SKILL.md exists', async () => {
      const result = await readSkill('does-not-exist', tempDir);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SkillNotFoundError');
      }
    });

    it('rejects a SKILL.md with no frontmatter as validation failure', async () => {
      await mkdir(join(tempDir, 'meta', 'techniques', 'malformed'), { recursive: true });
      await writeFile(join(tempDir, 'meta', 'techniques', 'malformed', 'SKILL.md'), 'just a plain string', 'utf-8');
      const result = await readSkill('malformed', tempDir);
      expect(result.success).toBe(false);
    });

    it('loads a minimal SKILL.md with frontmatter + Capability', async () => {
      const dir = join(tempDir, 'meta', 'techniques', 'minimal');
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, 'SKILL.md'),
        ['---', 'name: minimal', 'description: minimal description', 'metadata:', '  version: 1.0.0', '---', '', '# Minimal', '', '## Capability', '', 'A minimal capability statement.', ''].join('\n'),
        'utf-8',
      );
      const result = await readSkill('minimal', tempDir);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('minimal');
        expect(result.value.capability).toMatch(/minimal capability/);
      }
    });
  });
});
