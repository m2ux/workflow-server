import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guardById } from '../guards/guards.js';
import { collectDeclaredFallbackFindings, fallbackPhrase } from '../guards/check-declared-fallbacks.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * A fallback stated only in an input's description.
 *
 * The phrase readings are fixtures: a stated default with and without a `#### default`,
 * a producer-value sentence, an optionality sentence, the adjectival sense of the word,
 * and a fenced example. The corpus readings are the two the criterion asks for. At
 * `e191270f^` the readme input still carries `default: {}` in its description. At
 * `4330ef70^` the cargo inputs still say "empty string when none". On the corpus this
 * engine pairs with, no finding stands.
 */

const REPO = resolve(import.meta.dirname, '..');
/** Parent of e191270f, which still carries `default: {}` on entity_context. */
const README_DEFECT = '956604224296aba843a05f2ecd71b0ceab961021';
/** Parent of 4330ef70, which still carries "empty string when none" on the cargo inputs. */
const CARGO_DEFECT = 'e191270fc65e85e311dc806d38b7706868902345';

function technique(body: string): string {
  const root = mkdtempSync(join(tmpdir(), 'fallbacks-'));
  const dir = join(root, 'demo', 'techniques');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'one.md'), body);
  return root;
}

describe('phrase readings', () => {
  it('reads a default stated after a dash', () => {
    expect(fallbackPhrase('Canonical agent technique for the worker — default workflow-engine::activity-worker.')).toBeTruthy();
  });

  it('reads default: with a literal, including braces', () => {
    expect(fallbackPhrase('*(optional, default: `origin`)* Remote name to push to.')).toBe('`origin`');
    expect(fallbackPhrase('default: {}')).toBe('{}');
  });

  it('reads a closed when-none clause', () => {
    expect(fallbackPhrase('Optional `--features` flags (empty string when none)')).toBeTruthy();
  });

  it('does not read a producer value whose clause continues', () => {
    expect(fallbackPhrase('Empty when none remain open.')).toBeNull();
    expect(fallbackPhrase('Empty when no graph covers the checkout.')).toBeNull();
    expect(fallbackPhrase('Empty where the project has no such product.')).toBeNull();
  });

  it('does not read an optionality sentence that names no value', () => {
    expect(fallbackPhrase('Unset where the advance retires no activity.')).toBeNull();
  });

  it('does not read the adjectival sense of the word', () => {
    expect(fallbackPhrase("The repository's default branch.")).toBeNull();
    expect(fallbackPhrase('the PR base / default branch')).toBeNull();
  });

  it('does not read a default: whose continuation is a clause', () => {
    expect(fallbackPhrase("default: derived from the summary's Overall Rating")).toBeNull();
  });

  it('does not read a fenced example', () => {
    const fenced = '```\ndefault: `meta`\n```\n';
    expect(fallbackPhrase(fenced)).toBeNull();
  });

  it('reports a stated default that declares none, and stays silent once the default is declared', () => {
    const stated = [
      '## Inputs',
      '',
      '### workflow_id',
      '',
      'Optional. Fresh-session workflow id (default `meta`).',
      '',
    ].join('\n');
    const declared = [
      stated,
      '#### default',
      '',
      '`meta`',
      '',
    ].join('\n');
    const bare = technique(stated);
    const held = technique(declared);
    try {
      expect(collectDeclaredFallbackFindings(bare).map((f) => f.detail)).toEqual([
        "input 'workflow_id' states an absent-value fallback (`meta`) and declares no default",
      ]);
      expect(collectDeclaredFallbackFindings(held)).toEqual([]);
    } finally {
      rmSync(bare, { recursive: true, force: true });
      rmSync(held, { recursive: true, force: true });
    }
  });
});

/** The tree of `rev`, fetched when a shallow checkout does not hold it. */
function extractRevision(rev: string): string {
  const present = spawnSync('git', ['-C', REPO, 'cat-file', '-e', `${rev}^{commit}`]);
  if (present.status !== 0) {
    const fetched = spawnSync('git', ['-C', REPO, 'fetch', '--depth=1', 'origin', rev], { encoding: 'utf-8' });
    if (fetched.status !== 0) {
      throw new Error(fetched.stderr || fetched.stdout || `cannot fetch ${rev}`);
    }
  }
  const dir = mkdtempSync(join(tmpdir(), 'fallbacks-rev-'));
  const tar = join(dir, 'tree.tar');
  execFileSync('git', ['-C', REPO, 'archive', '--format=tar', '-o', tar, rev]);
  execFileSync('tar', ['-xf', tar, '-C', dir]);
  rmSync(tar);
  return dir;
}

function sites(root: string): string[] {
  return collectDeclaredFallbackFindings(root).map((f) => `${f.site} ${f.detail}`);
}

describe('corrected inputs at the commit preceding the correction', () => {
  let readme: string;
  let cargo: string;

  beforeAll(() => {
    readme = extractRevision(README_DEFECT);
    cargo = extractRevision(CARGO_DEFECT);
  }, 120_000);

  afterAll(() => {
    if (readme) rmSync(readme, { recursive: true, force: true });
    if (cargo) rmSync(cargo, { recursive: true, force: true });
  });

  it('reports entity_context where the description still carries default: {}', () => {
    const hit = sites(readme).filter((line) => line.includes('create-readme.md') && line.includes("input 'entity_context'"));
    expect(hit).toHaveLength(1);
  });

  it('reports the cargo inputs whose descriptions still say empty string when none', () => {
    const hit = sites(cargo);
    expect(hit.filter((line) => line.includes('cargo-operations/TECHNIQUE.md') && line.includes("input 'features'"))).toHaveLength(1);
    expect(hit.filter((line) => line.includes('cargo-operations/test.md') && line.includes("input 'test_filter'"))).toHaveLength(1);
  });
});

const LIVE = liveCorpusRoot();

describe.skipIf(LIVE === null)('the corpus this engine pairs with', () => {
  const root = LIVE!;

  it('reports nothing', () => {
    expect(collectDeclaredFallbackFindings(root)).toEqual([]);
  });

  it('is registered and runs under the standard sweep', () => {
    expect(guardById('declared-fallbacks')?.npmScript).toBe('check:fallbacks');
    const tsx = fileURLToPath(import.meta.resolve('tsx/cli'));
    const run = spawnSync(process.execPath, [
      tsx, 'guards/check-all.ts', '--only', 'declared-fallbacks', '--root', root,
    ], { cwd: REPO, encoding: 'utf-8' });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain('[PASS] declared-fallbacks');
  }, 60_000);
});
