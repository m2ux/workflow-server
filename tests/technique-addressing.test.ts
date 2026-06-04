import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { resolveTechniques } from '../src/loaders/technique-loader.js';

/**
 * Technique addressing: the `::` path form `[workflow::]technique[::sub]`.
 * Same-workflow refs are implicit (parent workflow filled in via currentWorkflow);
 * the full canonical path is also available; cross-workflow uses an explicit prefix.
 */
const WF_DIR = resolve(import.meta.dirname, '../workflows');

describe('technique addressing (:: path)', () => {
  it('resolves an implicit same-workflow sub-technique', async () => {
    const [r] = await resolveTechniques(['cargo-operations::run-suite'], WF_DIR, 'work-package');
    expect(r.type).toBe('sub-technique');
    expect(r.source).toBe('cargo-operations');
    expect(r.name).toBe('run-suite');
  });

  it('resolves the full canonical path workflow::technique::sub', async () => {
    const [r] = await resolveTechniques(['work-package::cargo-operations::run-suite'], WF_DIR, 'meta');
    expect(r.type).toBe('sub-technique');
    expect(r.workflow).toBe('work-package');
    expect(r.name).toBe('run-suite');
  });

  it('delivers a whole (standalone) technique protocol from a bare ref', async () => {
    const [r] = await resolveTechniques(['classify-problem'], WF_DIR, 'work-package');
    expect(r.type).toBe('technique');
    expect((r.body as { protocol?: unknown }).protocol).toBeDefined();
  });

  it('resolves a cross-workflow ref (legacy / and :: forms equivalently)', async () => {
    const [slash] = await resolveTechniques(['prism/portfolio-analysis'], WF_DIR, 'work-package');
    const [colons] = await resolveTechniques(['prism::portfolio-analysis'], WF_DIR, 'work-package');
    expect(slash.type).toBe('technique');
    expect(colons.type).toBe('technique');
    expect(colons.workflow).toBe('prism');
  });

  it('group-prefix rule ref still expands (agent-conduct::checkpoint-discipline)', async () => {
    const resolved = await resolveTechniques(['agent-conduct::checkpoint-discipline'], WF_DIR, 'work-package');
    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.every(r => r.type === 'rule')).toBe(true);
  });
});
