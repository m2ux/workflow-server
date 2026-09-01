#!/usr/bin/env npx tsx
/**
 * Lockfile guard over versions published with an install-time payload.
 *
 * `npm ci` installs whatever the lockfile resolves, and a payload of this kind runs during install
 * rather than at runtime — so by the time anything executes the repo's own code, the credentials on
 * the machine and in CI are already gone. The lockfile is therefore the last point at which a build
 * can refuse.
 *
 * The denylist in `known-bad-versions.json` names published releases a tracker has called
 * malicious. It is deliberately short: pinning every package a worm ever touched is an encyclopedia
 * nobody maintains, so the `overrides` block in `package.json` holds the seed family to known-good
 * releases and this guard catches a denylisted version arriving by any other route.
 *
 * Scope is this repo's own lockfile. Worktree lockfiles resolve from the same file, and the corpus
 * submodule carries no dependencies.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { report, type Finding } from './guard-protocol.js';

const ROOT = resolve(import.meta.dirname, '..');
const LOCKFILE = join(ROOT, 'package-lock.json');
const DENYLIST = join(import.meta.dirname, 'known-bad-versions.json');

interface Campaign {
  published: string;
  summary: string;
  trackers: string[];
  versions: Record<string, string[]>;
}

interface Denylist {
  note: string;
  campaigns: Record<string, Campaign>;
}

interface LockfileEntry {
  version?: string;
}

export interface Lockfile {
  packages?: Record<string, LockfileEntry>;
}

/** `node_modules/@cacheable/net` -> `@cacheable/net`; the root entry has an empty path. */
function packageName(path: string): string | null {
  const at = path.lastIndexOf('node_modules/');
  return at === -1 ? null : path.slice(at + 'node_modules/'.length);
}

export function loadDenylist(): Denylist {
  return JSON.parse(readFileSync(DENYLIST, 'utf-8')) as Denylist;
}

/**
 * Split from the file reads so a test can hand it a poisoned lockfile. A guard whose only evidence
 * is a clean run over a tree that never held the packages has not been shown to fire.
 */
export function scanLockfile(lock: Lockfile, denylist: Denylist): Finding[] {
  // name -> version -> the campaign that published it, so a hit names its source rather than only
  // asserting the version is bad.
  const banned = new Map<string, Map<string, string>>();
  for (const [id, campaign] of Object.entries(denylist.campaigns)) {
    for (const [name, versions] of Object.entries(campaign.versions)) {
      const byVersion = banned.get(name) ?? new Map<string, string>();
      for (const version of versions) byVersion.set(version, id);
      banned.set(name, byVersion);
    }
  }

  const findings: Finding[] = [];
  for (const [path, entry] of Object.entries(lock.packages ?? {})) {
    const name = packageName(path);
    if (name === null || entry.version === undefined) continue;
    const campaign = banned.get(name)?.get(entry.version);
    if (campaign === undefined) continue;
    const { summary, trackers } = denylist.campaigns[campaign];
    findings.push({
      check: 'known-bad-version',
      site: `package-lock.json:${path}`,
      detail: `${name}@${entry.version} was published by ${campaign} — ${summary} See ${trackers[0]}`,
    });
  }
  return findings;
}

function collect(): Finding[] {
  if (!existsSync(LOCKFILE)) {
    return [{
      check: 'lockfile-missing',
      site: 'package-lock.json',
      detail: 'no lockfile to check — `npm ci` has nothing to install from, and this guard measures nothing',
    }];
  }
  return scanLockfile(JSON.parse(readFileSync(LOCKFILE, 'utf-8')) as Lockfile, loadDenylist());
}

// Only when run as a script: importing this module for its exports must not report or exit.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  report('lockfile-denylist', collect(), {
    okMessage: 'no lockfile entry resolves to a version published with an install-time payload',
    root: ROOT,
    remedy: 'resolve the package to a known-good release — pin it in the package.json overrides block and regenerate the lockfile',
  });
}
