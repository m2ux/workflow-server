import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { GUARDS } from '../guards/guards.js';
import { EXIT_UNMEASURED } from '../guards/guard-protocol.js';

/**
 * A corpus-scoped guard pointed at no corpus refuses; it does not report a verdict.
 *
 * The three unreachable states — root missing, root not a directory, root holding no workflow —
 * leave a guard iterating an empty workflow list, and the line it then prints is the one it prints
 * after reading the whole corpus and finding nothing. Nothing downstream can tell the two apart, so
 * the guard stops protecting anything and the log records that it did.
 *
 * Asserted from the registry rather than from a list of scripts, so a guard added with
 * `scope: 'corpus'` is covered on the commit that adds it.
 */

const execFileAsync = promisify(execFile);
const REPO = resolve(import.meta.dirname, '..');
const ABSENT = resolve(REPO, 'tests/fixtures/this-path-holds-no-corpus');

const corpusGuards = GUARDS.filter((g) => g.scope === 'corpus');

/** Exit code and merged output of one guard run against `--root <absent>`. */
async function runAgainstAbsentCorpus(script: string): Promise<{ code: number; out: string }> {
  try {
    const { stdout, stderr } = await execFileAsync('npx', ['tsx', script, '--root', ABSENT], {
      cwd: REPO,
      timeout: 60_000,
    });
    return { code: 0, out: `${stdout}${stderr}` };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    return { code: typeof e.code === 'number' ? e.code : -1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('corpus-scoped guards refuse an unreachable corpus', () => {
  it('the registry declares some corpus-scoped guards', () => {
    expect(corpusGuards.length).toBeGreaterThan(0);
  });

  /**
   * The premise every other case rests on. Were this path to exist, each guard would resolve a real
   * root and the suite would assert nothing while passing — the shape of vacuous result it was
   * written to catch.
   */
  it('the root the guards are pointed at is genuinely absent', () => {
    expect(existsSync(ABSENT)).toBe(false);
  });

  it.each(corpusGuards.map((g) => [g.id, g.script] as const))(
    '%s exits unmeasured rather than reporting',
    async (id, script) => {
      const { code, out } = await runAgainstAbsentCorpus(script);
      expect(code, `${id} exited ${code} with: ${out.trim().split('\n').slice(-3).join(' | ')}`).toBe(
        EXIT_UNMEASURED,
      );
      expect(out).toContain('cannot measure');
    },
    70_000,
  );
});
