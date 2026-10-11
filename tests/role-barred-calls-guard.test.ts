import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guardById } from '../guards/guards.js';
import { mentionsIn, measureRoles } from '../guards/check-role-barred-calls.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * An instruction reaching a role that cannot act on it.
 *
 * The sentence readings are fixtures: a ban, a ban inside a conditional clause, a case named
 * mid-sentence, a negation in a neighbouring clause, and a value taken from a call. The corpus
 * readings are the two the criterion asks for. At `daf819e4^` (`f57e1508`) the worker is told to
 * take the workflow graph from `get_workflow`, a call its own role file forbids. On the corpus this
 * engine pairs with, that finding is absent. `get_activity` is barred for the orchestrator and not
 * for the worker, which is the conditional-clause carve-out on the live files: the worker's own
 * "until a stub names one" sentence would otherwise ban the call every worker makes.
 */

const REPO = resolve(import.meta.dirname, '..');
const TOOLS = new Set(['get_workflow', 'get_activity', 'get_resource', 'next_activity']);
/** Parent of daf819e4, the commit that still carries the routing defect. */
const DEFECT = 'f57e1508fd12ee39120532642fa9618663efc7d1';

const one = (body: string, tool: string) => mentionsIn(body, TOOLS).find((mention) => mention.tool === tool);

describe('sentence readings', () => {
  it('reads a negation on a call verb as a ban', () => {
    expect(one('Never call `get_workflow`.', 'get_workflow')).toMatchObject({ banned: true, governed: false });
  });

  it('does not read a ban that sits only in a conditional clause as a prohibition', () => {
    const sentence = 'Until a stub names one there is no next activity to act on, so never issue its `get_activity` on your own initiative.';
    expect(one(sentence, 'get_activity')).toMatchObject({ banned: true, governed: true });
  });

  it('lets a case named mid-sentence govern its own clause', () => {
    const sentence = 'Confirm `get_workflow`, and if the stub names none never issue `get_activity`.';
    expect(one(sentence, 'get_workflow')).toMatchObject({ governed: false });
    expect(one(sentence, 'get_activity')).toMatchObject({ governed: true });
  });

  it('does not let a negation in a neighbouring clause ban the call', () => {
    const sentence = 'Call `get_resource` once — do not issue repeated section fetches.';
    expect(one(sentence, 'get_resource')).toMatchObject({ banned: false, governed: false });
  });

  it('reads a value taken from a call, which carries no call verb', () => {
    const sentence = 'the workflow graph from `get_workflow`, and the post-activity variable bag.';
    expect(one(sentence, 'get_workflow')).toMatchObject({ banned: false, governed: false });
  });

  it('does not read before as a case', () => {
    const sentence = 'Before executing any step, confirm `get_activity` returned.';
    expect(one(sentence, 'get_activity')).toMatchObject({ governed: false });
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
  const dir = mkdtempSync(join(tmpdir(), 'role-calls-'));
  const tar = join(dir, 'tree.tar');
  execFileSync('git', ['-C', REPO, 'archive', '--format=tar', '-o', tar, rev]);
  execFileSync('tar', ['-xf', tar, '-C', dir]);
  rmSync(tar);
  return dir;
}

describe('the routing defect at the commit that carries it', () => {
  let root: string;

  beforeAll(() => {
    root = extractRevision(DEFECT);
  }, 60_000);

  afterAll(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('reports get_workflow on finalize-activity for the worker', () => {
    const findings = measureRoles(root).findings.filter((finding) => finding.check === 'barred-call');
    const routing = findings.filter((finding) =>
      finding.site === 'meta/techniques/workflow-engine/finalize-activity.md:73'
      && finding.detail.includes('get_workflow')
      && finding.detail.includes('the worker'));
    expect(routing).toHaveLength(1);
  });
});

const LIVE = liveCorpusRoot();

describe.skipIf(LIVE === null)('the corpus this engine pairs with', () => {
  const root = LIVE!;

  it('reports nothing', () => {
    expect(measureRoles(root).findings).toEqual([]);
  });

  it('bars get_activity for the orchestrator and not for the worker', () => {
    const { barred } = measureRoles(root);
    expect(barred.get('orchestrator')?.has('get_activity')).toBe(true);
    expect(barred.get('worker')?.has('get_activity')).toBe(false);
  });

  it('runs under the standard sweep', () => {
    expect(guardById('role-barred-calls')?.npmScript).toBe('check:role-calls');
    const tsx = fileURLToPath(import.meta.resolve('tsx/cli'));
    const run = spawnSync(process.execPath, [
      tsx, 'guards/check-all.ts', '--only', 'role-barred-calls', '--root', root,
    ], { cwd: REPO, encoding: 'utf-8' });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain('[PASS] role-barred-calls');
  }, 60_000);
});
