import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture, writeRoutineFixture } from './corpus-fixture.js';
import { collectRoutineFindings } from '../guards/check-routines.js';
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
