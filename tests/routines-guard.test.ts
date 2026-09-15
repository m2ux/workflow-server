import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture, writeRoutineFixture } from './corpus-fixture.js';
import { collectRoutineFindings } from '../guards/check-routines.js';
import { consumerReaches } from '../guards/check-binding-fidelity.js';
import { workflowIdFromCorpusPath } from '../src/loaders/corpus-index.js';
import type { Finding } from '../guards/guard-protocol.js';

/**
 * The routine guard (#704 W03) — a routine's signature held against its own body, and its home
 * against its referrers.
 *
 * The corpus declares no routine yet, so a clean sweep over it is evidence of nothing. Every rule
 * here is provoked on a fixture instead, which is the only way to show the guard can fire at all.
 *
 * A note on what these cases are NOT: none of them is a load failure. The recorded decision is that
 * the contract derivation stays a guard's business, so a routine contradicting its signature fails a
 * guard run while the workflow carrying it still loads — which is why every tree below loads clean.
 */

interface Tree {
  /** Activity files, by workflow id: activity id → its YAML body. */
  activities: Record<string, Record<string, string>>;
  /** Routine files, by workflow id: routine name → its YAML body. */
  routines?: Record<string, Record<string, string>>;
  /** Technique markdown, by workflow id: `group/operation` → its file body. */
  techniques?: Record<string, Record<string, string>>;
}

async function findingsFor(tree: Tree): Promise<Finding[]> {
  const root = mkdtempSync(join(tmpdir(), 'wf-routines-'));
  try {
    for (const [workflowId, activities] of Object.entries(tree.activities)) {
      writeLoadableWorkflowFixture(root, workflowId, Object.keys(activities));
      mkdirSync(join(root, workflowId, 'activities'), { recursive: true });
      let index = 0;
      for (const [activityId, body] of Object.entries(activities)) {
        index += 1;
        writeFileSync(
          join(root, workflowId, 'activities', `${String(index).padStart(2, '0')}-${activityId}.yaml`),
          body,
        );
      }
    }
    for (const [workflowId, routines] of Object.entries(tree.routines ?? {})) {
      for (const [name, body] of Object.entries(routines)) writeRoutineFixture(root, workflowId, name, body);
    }
    for (const [workflowId, techniques] of Object.entries(tree.techniques ?? {})) {
      for (const [path, body] of Object.entries(techniques)) {
        const file = join(root, workflowId, 'techniques', `${path}.md`);
        mkdirSync(join(file, '..'), { recursive: true });
        writeFileSync(file, body);
      }
    }
    return await collectRoutineFindings(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const checks = (findings: Finding[]): string[] => findings.map((f) => f.check).sort();

/** An activity whose only step refers to `shared-run`, binding whatever the case needs. */
const referrer = (binding = ''): string =>
  `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n${binding}`;

describe('a routine signature held against its own body', () => {
  it('reports nothing on a routine whose body matches what it declares', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: host_verdict\n') } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: topic_name
    description: what the run is about
outputs:
  - id: run_verdict
    type: string
    description: the verdict
steps:
  - kind: action
    id: decide
    actions:
      - action: set
        target: run_verdict
        value: "{topic_name}"
`,
        },
      },
    });
    expect(findings).toEqual([]);
  });

  it('reports an output no step of the body writes', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: host_verdict\n') } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
outputs:
  - id: run_verdict
    type: string
    description: the verdict nothing produces
steps:
  - kind: action
    id: note
    actions:
      - action: log
        message: nothing is written here
`,
        },
      },
    });
    expect(checks(findings)).toContain('routine-output-unwritten');
    expect(findings.find((f) => f.check === 'routine-output-unwritten')!.detail).toContain("'run_verdict'");
  });

  it('reports an input no step of the body reads', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    with:\n      topic_name: anything\n') } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: topic_name
    description: asked for at every site and consulted nowhere
steps:
  - kind: action
    id: note
    actions:
      - action: log
        message: no token here
`,
        },
      },
    });
    expect(checks(findings)).toContain('routine-input-unread');
  });

  it('reports an internal written and never read, and one read and never written', async () => {
    const written = await findingsFor({
      activities: { wf: { host: referrer() } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
internals:
  - id: interim_note
    description: written and never read
steps:
  - kind: action
    id: note
    actions:
      - action: set
        target: interim_note
        value: recorded
`,
        },
      },
    });
    expect(checks(written)).toContain('routine-internal-unread');

    const read = await findingsFor({
      activities: { wf: { host: referrer() } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
internals:
  - id: interim_note
    description: read and never written
steps:
  - kind: action
    id: note
    actions:
      - action: log
        message: "{interim_note}"
`,
        },
      },
    });
    expect(checks(read)).toContain('routine-internal-unwritten');
  });

  /**
   * A binding's unbraced value is a rename only where it names something declared; otherwise it is a
   * literal, by the repository's own decided position that a value naming another variable has to be
   * braced. Reported as an undeclared read it would fire on nearly every real body, and the guard is
   * hard zero — so this needs a technique that actually RESOLVES, since an unresolvable one walks no
   * inputs and the case passes for the wrong reason.
   */
  it('does not report a binding value the namespace settles as a literal', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: host_verdict\n') } },
      techniques: {
        wf: {
          'analysis/sweep': `---
metadata:
  version: 1.0.0
---

## Capability

Sweeps the target at the requested depth.

## Inputs

### analysis_mode

How thorough the sweep is.

## Outputs

### run_verdict

What the sweep concluded.

## Protocol

### 1. Sweep

- Sweep the target.
`,
        },
      },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
outputs:
  - id: run_verdict
    type: string
    description: what the sweep concluded
steps:
  - kind: technique
    id: sweep
    technique:
      name: analysis::sweep
      inputs:
        analysis_mode: thorough
`,
        },
      },
    });
    // `thorough` is a literal, not a name the body reads.
    expect(findings.filter((f) => f.check === 'routine-undeclared-read')).toEqual([]);
  });

  it('reports a name the body reads that the signature does not declare', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer() } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
steps:
  - kind: action
    id: note
    actions:
      - action: log
        message: "about {some_workflow_variable}"
`,
        },
      },
    });
    const finding = findings.find((f) => f.check === 'routine-undeclared-read');
    expect(finding).toBeDefined();
    expect(finding!.detail).toContain("'some_workflow_variable'");
    // The remedy names the fall-through, which is what makes declaring it cheap.
    expect(finding!.detail).toContain("host's value");
  });
});

/**
 * A routine file is addressable by its path, which is what lets a guard reason about it.
 *
 * `routines/` sits beside `activities/` and `techniques/` as a directory a workflow owns, and the
 * resolver that names the owning workflow from a corpus path is the one place that set is spelled.
 * Left out of it, a routine path resolves to no workflow at all — and every rule phrased as "the
 * consumer has to reach the file it closes a finding on" then refuses a routine silently, because
 * a missing workflow fails that test the same way an unrelated one does.
 *
 * Asserted on the resolver rather than through the guard, because the guard's own case below is
 * satisfied by scanning the files, and would pass while this stayed broken for every other caller.
 */
describe('a routine path names the workflow that owns it', () => {
  it('resolves the owning workflow, as an activity or technique path does', () => {
    expect(workflowIdFromCorpusPath('work-package/routines/converge-assumptions.yaml')).toBe('work-package');
    expect(workflowIdFromCorpusPath('work-package/activities/04-research.yaml')).toBe('work-package');
    expect(workflowIdFromCorpusPath('work-package/techniques/analyse-challenge/combine.md')).toBe('work-package');
  });
});

/**
 * The rule that gap breaks, asserted where the rule lives (#704 E03).
 *
 * A routine holds the step bindings the activities referring to it used to hold, so a technique
 * whose only consumer is a routine's output remap needs that routine to be able to close the
 * finding. A consumer closes one only when it can REACH the declaring file, and a path naming no
 * workflow fails that test exactly as an unrelated workflow does — so the finding stood, against a
 * technique that is used, on a guard carrying a triage ledger.
 *
 * Asserted on the rule rather than on a corpus instance, which is how the dead-output scoping cases
 * in `binding-fidelity.test.ts` are written: an instance gets paid down and then tests nothing.
 */
describe('a routine reaches the technique whose output it remaps', () => {
  it('closes a dead output from the routine file of the declaring workflow', () => {
    expect(consumerReaches(
      'work-package/routines/converge-assumptions.yaml',
      'work-package/techniques/analyse-challenge/combine.md',
    )).toBe(true);
  });

  it('still refuses a routine in a workflow that cannot reach the declaring file', () => {
    expect(consumerReaches(
      'codebase-wiki/routines/some-run.yaml',
      'prism/techniques/plan-analysis.md',
    )).toBe(false);
  });
});

describe('the committed fixture root', () => {
  /**
   * The routines fixtures are the one tree in the repository that declares a routine, so they are
   * the only standing example an author reads — and an example that violates the rule the guard
   * enforces teaches the violation. Nothing else points the guard at them: the registered guards
   * resolve through the corpus root, which `tests/fixtures` is not.
   */
  it('passes the guard it is an example for', async () => {
    const findings = await collectRoutineFindings(resolve(import.meta.dirname, 'fixtures/routines'));
    expect(findings).toEqual([]);
  });
});

describe('a routine file the schema refuses', () => {
  /**
   * A corpus-wide sweep reports rather than aborts. A reader that threw would take the whole sweep
   * down and report nothing at all — including for the files that are fine — and `check:all` would
   * show a crash where a defect location belongs.
   */
  it('is a finding naming the file and the reason, not a crash', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: action\n    id: a\n' } },
      routines: { wf: { broken: 'id: broken\nversion: nope\nsteps: []\n' } },
    });
    expect(checks(findings)).toEqual(['routine-unreadable']);
    expect(findings[0]!.detail).toContain('broken.yaml');
    expect(findings[0]!.site).toBe('wf/routines/');
  });
});

describe('placement, over the transitive referrer closure', () => {
  const body = (id: string, steps: string): string =>
    `id: ${id}\nversion: 1.0.0\nname: ${id}\nsteps:\n${steps}`;
  const action = '  - kind: action\n    id: do-it\n    actions:\n      - action: log\n        message: ran\n';

  it('reports a routine nothing references anywhere in the corpus', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      routines: { wf: { 'shared-run': body('shared-run', action) } },
    });
    expect(checks(findings)).toEqual(['routine-unreferenced']);
    expect(findings[0]!.detail).toContain('workflow(s)');
  });

  it('reports a single-owner routine sitting in the shared home', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer() }, meta: { bootstrap: 'id: bootstrap\nversion: 1.0.0\nname: Bootstrap\nsteps:\n' + action } },
      routines: { meta: { 'shared-run': body('shared-run', action) } },
    });
    const finding = findings.find((f) => f.check === 'routine-misplaced');
    expect(finding).toBeDefined();
    expect(finding!.detail).toContain("computed home is 'wf'");
  });

  it('accepts a two-owner routine sitting in the shared home', async () => {
    const findings = await findingsFor({
      activities: {
        wf: { host: referrer() },
        other: { host: referrer() },
        meta: { bootstrap: 'id: bootstrap\nversion: 1.0.0\nname: Bootstrap\nsteps:\n' + action },
      },
      routines: { meta: { 'shared-run': body('shared-run', action) } },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * The case the transitive clause exists for. `inner-run` is referred to by no activity file at
   * all — only by `shared-run` — so a rule counting activity referrers directly returns nothing and
   * the routine reads as both unreferenced and homeless.
   */
  it('closes the referrer set through a routine that refers to another', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer() } },
      routines: {
        wf: {
          'shared-run': body('shared-run', '  - kind: routine\n    id: inner\n    routine: inner-run\n'),
          'inner-run': body('inner-run', action),
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });

  it('computes a nested routine home from the activities that reach it transitively', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer() }, meta: { bootstrap: 'id: bootstrap\nversion: 1.0.0\nname: Bootstrap\nsteps:\n' + action } },
      routines: {
        wf: { 'shared-run': body('shared-run', '  - kind: routine\n    id: inner\n    routine: meta::inner-run\n') },
        meta: { 'inner-run': body('inner-run', action) },
      },
    });
    // Only `wf` activities reach `inner-run`, so its home is `wf` and not the shared one.
    const finding = findings.find((f) => f.check === 'routine-misplaced');
    expect(finding).toBeDefined();
    expect(finding!.site).toBe('meta/routines/inner-run.yaml');
    expect(finding!.detail).toContain("computed home is 'wf'");
  });
});
