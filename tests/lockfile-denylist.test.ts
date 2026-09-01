import { describe, it, expect } from 'vitest';
import { loadDenylist, scanLockfile, type Lockfile } from '../scripts/check-lockfile-denylist.js';

/**
 * This repo's tree holds none of the denylisted packages, so the guard's own run is a clean pass
 * over a lockfile that could not have failed. These feed it lockfiles that can.
 */
describe('lockfile denylist', () => {
  const denylist = loadDenylist();

  const lockfileWith = (packages: Record<string, { version: string }>): Lockfile => ({
    packages: { '': { version: '0.2.0' }, ...packages },
  });

  it('fails a lockfile resolving a denylisted version', () => {
    const findings = scanLockfile(lockfileWith({ 'node_modules/keyv': { version: '6.0.0' } }), denylist);
    expect(findings).toHaveLength(1);
    expect(findings[0].check).toBe('known-bad-version');
    expect(findings[0].detail).toContain('keyv@6.0.0');
  });

  it('passes the same package at a known-good version', () => {
    expect(scanLockfile(lockfileWith({ 'node_modules/keyv': { version: '5.6.0' } }), denylist)).toEqual([]);
  });

  it('reads a scoped name out of its nested path', () => {
    // A transitive copy sits under its dependent, so the name is the last node_modules segment.
    const findings = scanLockfile(
      lockfileWith({ 'node_modules/cacheable/node_modules/@cacheable/net': { version: '2.1.1' } }),
      denylist,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('@cacheable/net@2.1.1');
  });

  it('names the campaign and its tracker, so a hit carries the source of the judgement', () => {
    const [finding] = scanLockfile(lockfileWith({ 'node_modules/ecto': { version: '5.0.1' } }), denylist);
    expect(finding.detail).toContain('keyv-cacheable-2026-08');
    expect(finding.detail).toContain('https://');
  });

  it('pins every denylisted package to a known-good version in overrides', async () => {
    // A denylisted version with no override is caught only after something resolves it. The
    // override is what stops it resolving.
    const pkg = (await import('../package.json', { with: { type: 'json' } })).default as {
      overrides: Record<string, string>;
    };
    const denied = Object.values(denylist.campaigns).flatMap((c) => Object.keys(c.versions));
    const unpinned = denied.filter((name) => !(name in pkg.overrides)).sort();
    expect(unpinned, 'a denylisted package the overrides block does not hold to a good version').toEqual([]);

    const pinnedToBad = Object.entries(pkg.overrides).filter(([name, version]) =>
      Object.values(denylist.campaigns).some((c) => c.versions[name]?.includes(version)));
    expect(pinnedToBad, 'an override pinning a package to a denylisted version').toEqual([]);
  });
});
