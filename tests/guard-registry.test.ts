import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { CORPUS_GUARDS, GUARDS, guardById } from '../scripts/guards.js';
import { findingKey, sortFindings, wantsJson } from '../scripts/guard-protocol.js';

const REPO = resolve(import.meta.dirname, '..');

/**
 * The registry is what makes the guards enforced rather than remembered: `check:all` and CI walk it,
 * so an entry that names a missing script or a missing npm script would silently drop a guard from
 * every sweep (#327 S1/R2).
 */
describe('guard registry', () => {
  const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf-8')) as { scripts: Record<string, string> };

  it('points every entry at a script that exists', () => {
    const missing = GUARDS.filter((g) => !existsSync(join(REPO, g.script))).map((g) => g.script);
    expect(missing).toEqual([]);
  });

  it('exposes every entry that claims an npm script', () => {
    const missing = GUARDS
      .filter((g) => g.npmScript !== null && !(g.npmScript in pkg.scripts))
      .map((g) => g.npmScript);
    expect(missing).toEqual([]);
  });

  it('registers the three scripts that package.json never invoked before', () => {
    for (const id of ['refs', 'activities', 'workflow-yaml']) {
      expect(guardById(id), `guard '${id}' is registered`).toBeDefined();
      expect(guardById(id)!.npmScript).not.toBeNull();
    }
  });

  it('gives every guard a unique id and a stated invariant', () => {
    expect(new Set(GUARDS.map((g) => g.id)).size).toBe(GUARDS.length);
    expect(GUARDS.filter((g) => g.proves.trim().length === 0)).toEqual([]);
  });

  it('separates corpus-scoped guards from repo-scoped ones', () => {
    expect(CORPUS_GUARDS.length).toBeGreaterThan(0);
    expect(CORPUS_GUARDS.every((g) => g.scope === 'corpus')).toBe(true);
    // The site guards read `site/` and the encoding guard reads this repo's own sources — neither
    // reads the corpus, so a delta run must not aim them at a corpus root.
    expect(GUARDS.filter((g) => g.scope === 'repo').map((g) => g.id).sort())
      .toEqual(['site-links', 'source-encoding', 'svg-layout']);
  });

  /** No test re-runs a guard against the live corpus; the sweep in this job is what holds it at zero. */
  it('is swept by the same CI job that runs the suite', () => {
    const verify = readFileSync(join(REPO, '.github/workflows/verify.yml'), 'utf-8');
    expect(verify, 'the guard sweep left the verify job — the corpus is now held at zero by nothing')
      .toContain('npm run check:all');
    expect(verify, 'the suite left the verify job').toContain('npm run test:ci');
  });

  it('covers every check:* script in package.json', () => {
    const aggregate = new Set(['check:all', 'check:delta']);
    const uncovered = Object.keys(pkg.scripts)
      .filter((name) => name.startsWith('check:') && !aggregate.has(name))
      .filter((name) => !GUARDS.some((g) => g.npmScript === name));
    expect(uncovered).toEqual([]);
  });

  /**
   * The other two directions start from something that already names the guard — a registry entry,
   * or a `check:*` script. A guard that has neither is named by nothing, so both pass while the
   * sweep never runs it. That is how the branch-as-step guard sat with a script and a test and no
   * entry (#491). This one starts from the files on disk, which is where a forgotten guard is.
   *
   * A script that cannot run in the sweep says so here, with the reason, the same way an
   * unreachable checkpoint option is carried in the option-coverage groups.
   */
  it('registers every guard script on disk, or records why one runs outside the sweep', () => {
    const outsideTheSweep: Record<string, string> = {
      'scripts/check-all.ts': 'the runner that walks the registry',
      'scripts/check-delta.ts': 'the runner that diffs a walk against the merge-base',
      'scripts/check-session-contract.ts':
        'asks whether a run stayed inside its contracts, so it needs a session and has no corpus-wide form',
    };

    const onDisk = readdirSync(join(REPO, 'scripts'))
      .filter((name) => /^(check|validate)-.*\.ts$/.test(name))
      .map((name) => `scripts/${name}`);

    const registered = new Set(GUARDS.map((g) => g.script));
    const unaccounted = onDisk
      .filter((path) => !registered.has(path) && !(path in outsideTheSweep))
      .sort();

    expect(
      unaccounted,
      'a guard script the registry does not name and no reason excuses — add an entry, or record why it runs outside the sweep',
    ).toEqual([]);

    // A reason that outlives its script reads as coverage nothing provides.
    const stale = Object.keys(outsideTheSweep).filter((path) => !existsSync(join(REPO, path)));
    expect(stale, 'a reason naming a script that no longer exists').toEqual([]);
  });
});

describe('guard finding protocol', () => {
  it('keys a finding independently of the line it sits on', () => {
    const a = { check: 'dead-output', site: 'wf/techniques/x.md:12', detail: 'output y is dead' };
    const b = { check: 'dead-output', site: 'wf/techniques/x.md:400', detail: 'output y is dead' };
    expect(findingKey(a)).toBe(findingKey(b));
  });

  it('distinguishes findings that differ by check, site, or detail', () => {
    const base = { check: 'dead-output', site: 'wf/a.md', detail: 'd' };
    expect(findingKey(base)).not.toBe(findingKey({ ...base, check: 'orphan-input' }));
    expect(findingKey(base)).not.toBe(findingKey({ ...base, site: 'wf/b.md' }));
    expect(findingKey(base)).not.toBe(findingKey({ ...base, detail: 'e' }));
  });

  it('sorts findings into a stable order so two sweeps read identically', () => {
    const findings = [
      { check: 'orphan-input', site: 'b', detail: '2' },
      { check: 'dead-output', site: 'a', detail: '1' },
      { check: 'dead-output', site: 'a', detail: '0' },
    ];
    expect(sortFindings(findings).map((f) => f.detail)).toEqual(['0', '1', '2']);
    expect(sortFindings(findings)).toEqual(sortFindings([...findings].reverse()));
  });

  it('reads the --json switch from an explicit argv', () => {
    expect(wantsJson(['--root', '/x', '--json'])).toBe(true);
    expect(wantsJson(['--root', '/x'])).toBe(false);
  });
});
