import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectSharedRuns, measure, stepSignature } from '../guards/check-repeated-runs.js';
import { UnreachableCorpusError } from '../guards/workflows-root.js';

/**
 * Repeated-run guard. An activity composes work by listing steps, and a sequence wanted at a second
 * activity is copied because no construct names it — after which the copies drift, in fields no
 * single file reveals. The guard's population is every run two or more activity files carry, and its
 * two rules are what makes that population a fact rather than an opinion: what counts as the same
 * step, and when a window is the same fact as a longer one.
 */

/** A technique step. `extra` carries the fields a site is free to vary. */
function techniqueStep(id: string, op: string, extra: string[] = []): string[] {
  return ['  - kind: technique', `    id: ${id}`, ...extra.map((line) => `    ${line}`), `    technique: ${op}`];
}

/**
 * A fixture workflow is discovered the way the server discovers one — by the `workflow.yaml` that
 * marks its directory — so a fixture corpus and a real one are found by the same rule.
 */
async function writeActivity(root: string, workflow: string, name: string, steps: string[]): Promise<void> {
  const dir = join(root, workflow, 'activities');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(root, workflow, 'workflow.yaml'),
    [`id: ${workflow}`, `name: ${workflow}`, 'version: 1.0.0', `initialActivity: ${name}`, ''].join('\n'),
    'utf-8',
  );
  await writeFile(join(dir, `${name}.yaml`), [`id: ${name}`, 'steps:', ...steps, ''].join('\n'), 'utf-8');
}

describe('repeated-runs guard (fixture corpus)', () => {
  let tempDir: string;
  let ledger: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'repeated-runs-'));
    ledger = join(tempDir, 'ledger.json');
  });
  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('signs a step as its kind and its bound work, and nothing a site varies', () => {
    expect(stepSignature({ kind: 'technique', id: 'a', when: 'x == 1', technique: 'group::alpha' }))
      .toBe(stepSignature({ kind: 'technique', id: 'b', technique: 'group::alpha' }));
    // Which inputs the site binds is part of the run; what it binds them to is not.
    expect(stepSignature({ kind: 'technique', technique: { name: 'group::alpha', inputs: { x: 'one' } } }))
      .toBe(stepSignature({ kind: 'technique', technique: { name: 'group::alpha', inputs: { x: 'two' } } }));
    expect(stepSignature({ kind: 'technique', technique: { name: 'group::alpha', inputs: { x: 1 } } }))
      .not.toBe(stepSignature({ kind: 'technique', technique: 'group::alpha' }));
    // A checkpoint signs as the shared body it references, or as its own inline option ids.
    expect(stepSignature({ kind: 'checkpoint', id: 'g', ref: 'assumption-decision', when: 'x' }))
      .toBe('C:ref=assumption-decision');
    expect(stepSignature({ kind: 'checkpoint', id: 'g', options: [{ id: 'b' }, { id: 'a' }] }))
      .toBe('C:[a,b]');
    // An action signs as its verbs and targets — a marker step carries none.
    expect(stepSignature({ kind: 'action', id: 'm', actions: [{ action: 'message', message: 'hello' }] }))
      .toBe(stepSignature({ kind: 'action', id: 'n', actions: [{ action: 'message', message: 'other' }] }));
    expect(stepSignature({ kind: 'action', id: 'm' })).toBe('A:marker');
    // A loop signs as its iteration, its collection and its body — not its bound or its test.
    expect(stepSignature({
      kind: 'loop', id: 'l', loopType: 'forEach', over: 'items', maxIterations: 20,
      steps: [{ kind: 'technique', id: 'a', technique: 'group::alpha' }],
    })).toBe('L:forEach/items{T:group::alpha()}');
  });

  it('finds a run two activity files carry under different identifiers and gates', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha-here', 'group::alpha'),
      ...techniqueStep('beta-here', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha-there', 'group::alpha'),
      ...techniqueStep('beta-there', 'group::beta', ['when: is_review_mode != true']),
    ]);

    const runs = collectSharedRuns(tempDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.run).toEqual(['T:group::alpha()', 'T:group::beta()']);
    expect(runs[0]!.files).toEqual(['wf-a/activities/one.yaml', 'wf-b/activities/two.yaml']);
    expect(runs[0]!.depth).toBe(0);
    // The differences are the finding's content: which step position, and which field.
    expect(runs[0]!.drift).toEqual(['1.id', '2.id', '2.when']);
  });

  it('says so when the copies are identical field for field', async () => {
    const steps = [...techniqueStep('alpha', 'group::alpha'), ...techniqueStep('beta', 'group::beta')];
    await writeActivity(tempDir, 'wf-a', 'one', steps);
    await writeActivity(tempDir, 'wf-b', 'two', steps);
    expect(collectSharedRuns(tempDir)[0]!.drift).toEqual([]);
  });

  it('drops a window a longer shared window over the same file set contains', async () => {
    const steps = [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
      ...techniqueStep('gamma', 'group::gamma'),
    ];
    await writeActivity(tempDir, 'wf-a', 'one', steps);
    await writeActivity(tempDir, 'wf-b', 'two', steps);
    // (alpha,beta), (beta,gamma) and (alpha,beta,gamma) all sit at the same two files, so the
    // three-step window is the same fact stated completely and the two heads are not reported.
    const runs = collectSharedRuns(tempDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.run).toHaveLength(3);
  });

  it('keeps a contained window whose file set is wider than the longer one', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
      ...techniqueStep('gamma', 'group::gamma'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
      ...techniqueStep('gamma', 'group::gamma'),
    ]);
    await writeActivity(tempDir, 'wf-c', 'three', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    // A three-step run at two sites and its two-step head at three are two facts, and the wider one
    // is the one a shared-run construct would have to serve.
    const runs = collectSharedRuns(tempDir).map((run) => [run.run.length, run.files.length]);
    expect(runs).toEqual([[3, 2], [2, 3]]);
  });

  it('reaches a run shared only inside two loop bodies', async () => {
    const body = (over: string): string[] => [
      '  - kind: loop',
      '    id: cycle',
      '    loopType: forEach',
      `    over: ${over}`,
      '    variable: item',
      '    steps:',
      '      - kind: technique',
      '        id: alpha',
      '        technique: group::alpha',
      '      - kind: technique',
      '        id: beta',
      '        technique: group::beta',
    ];
    await writeActivity(tempDir, 'wf-a', 'one', body('units'));
    await writeActivity(tempDir, 'wf-b', 'two', body('findings'));

    // The two loop steps differ in their collection, so nothing is shared at the top level.
    const runs = collectSharedRuns(tempDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.run).toEqual(['T:group::alpha()', 'T:group::beta()']);
    expect(runs[0]!.depth).toBe(1);
  });

  it('counts a file that repeats a run once towards the population, and its copies towards the differences', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha-first', 'group::alpha'),
      ...techniqueStep('beta-first', 'group::beta'),
      ...techniqueStep('spacer', 'group::spacer'),
      ...techniqueStep('alpha-second', 'group::alpha'),
      ...techniqueStep('beta-second', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha-elsewhere', 'group::alpha'),
      ...techniqueStep('beta-elsewhere', 'group::beta'),
    ]);
    const runs = collectSharedRuns(tempDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.files).toHaveLength(2);
    expect(runs[0]!.copies).toBe(3);
  });

  it('does not read a repetition inside one file as a shared run', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha-first', 'group::alpha'),
      ...techniqueStep('beta-first', 'group::beta'),
      ...techniqueStep('alpha-second', 'group::alpha'),
      ...techniqueStep('beta-second', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [...techniqueStep('unrelated', 'group::other')]);
    expect(collectSharedRuns(tempDir)).toEqual([]);
  });

  it('reports every run no baseline entry classifies', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    const measured = measure(tempDir, { baselinePath: ledger });
    expect(measured.findings.map((f) => f.check)).toEqual(['repeated-run']);
    expect(measured.counts.untriaged).toBe(1);
    expect(measured.findings[0]!.detail).toContain('no baseline entry classifies it');
  });

  it('suppresses a classified run, and names a provisional one rather than suppressing it', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
      ...techniqueStep('gamma', 'group::gamma'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
      ...techniqueStep('gamma', 'group::gamma'),
    ]);
    await writeActivity(tempDir, 'wf-c', 'three', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    const [longer, head] = collectSharedRuns(tempDir);

    await writeFile(ledger, JSON.stringify({
      rationales: { settled: 'A stage removes it.', open: 'It turns on a decision nobody has taken.' },
      entries: [
        { site: longer!.site, run: longer!.run, verdict: 'converging', rationale: 'settled' },
        { site: head!.site, run: head!.run, verdict: 'provisional', rationale: 'open' },
      ],
    }), 'utf-8');

    const measured = measure(tempDir, { baselinePath: ledger });
    expect(measured.findings).toEqual([]);
    expect(measured.counts).toMatchObject({ converging: 1, provisional: 1, untriaged: 0, stale: 0 });
    expect(measured.provisional.map((p) => [p.run.run.length, p.why]))
      .toEqual([[2, 'It turns on a decision nobody has taken.']]);
  });

  it('reports a baseline entry that matches no run, which is how the baseline falls', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    const [present] = collectSharedRuns(tempDir);
    await writeFile(ledger, JSON.stringify({
      entries: [
        { site: present!.site, run: present!.run, verdict: 'converging', rationale: 'settled' },
        { site: 'gone/activities/x.yaml + gone/activities/y.yaml', run: ['T:group::ghost()', 'T:group::shade()'], verdict: 'converging', rationale: 'settled' },
      ],
    }), 'utf-8');

    const withStale = measure(tempDir, { baselinePath: ledger });
    expect(withStale.findings.map((f) => f.check)).toEqual(['repeated-run-baseline-stale']);
    expect(withStale.findings[0]!.site).toBe('gone/activities/x.yaml + gone/activities/y.yaml');
    expect(measure(tempDir, { baselinePath: ledger, reportStale: false }).findings).toEqual([]);
  });

  // A verdict is what suppresses a run, so an unreadable one must not suppress it silently.
  it('reports a verdict outside the three rather than honouring it', async () => {
    await writeActivity(tempDir, 'wf-a', 'one', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    await writeActivity(tempDir, 'wf-b', 'two', [
      ...techniqueStep('alpha', 'group::alpha'),
      ...techniqueStep('beta', 'group::beta'),
    ]);
    const [present] = collectSharedRuns(tempDir);
    await writeFile(ledger, JSON.stringify({
      entries: [{ site: present!.site, run: present!.run, verdict: 'accepted', rationale: 'settled' }],
    }), 'utf-8');

    const measured = measure(tempDir, { baselinePath: ledger });
    expect(measured.findings.map((f) => f.check)).toEqual(['repeated-run-baseline-verdict']);
    expect(measured.counts.malformed).toBe(1);
  });

  // A guard that walks nothing reports nothing, and an empty report reads as a clean corpus (#327 S2).
  it('refuses to report on a corpus holding no activity definitions', async () => {
    await mkdir(join(tempDir, 'wf-a', 'techniques'), { recursive: true });
    expect(() => collectSharedRuns(tempDir)).toThrow(UnreachableCorpusError);
  });
});
