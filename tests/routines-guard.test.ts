import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture, writeRoutineFixture } from './corpus-fixture.js';
import { collectRoutineFindings } from '../guards/check-routines.js';
import { consumerReaches } from '../guards/check-binding-fidelity.js';
import { namespaceRefFromCitePath } from '../src/loaders/corpus-index.js';
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
  /**
   * Activity files a level down, by workflow id: `subdirectory/activity id` → its YAML body.
   * A library another workflow borrows by path, which the workflow's own graph never reaches.
   */
  libraryActivities?: Record<string, Record<string, string>>;
  /** Routine files, by workflow id: routine name → its YAML body. */
  routines?: Record<string, Record<string, string>>;
  /** Technique markdown, by workflow id: `group/technique` → its file body. */
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
    for (const [workflowId, library] of Object.entries(tree.libraryActivities ?? {})) {
      for (const [path, body] of Object.entries(library)) {
        const file = join(root, workflowId, 'activities', `${path}.yaml`);
        mkdirSync(join(file, '..'), { recursive: true });
        writeFileSync(file, body);
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

/**
 * The same, for a library activity a level down. It carries its own id because it sits in a
 * workflow that also holds a graph activity, and two definitions under one workflow answering to
 * one id would be a fixture saying something the case is not about.
 */
const borrowed = (binding = ''): string =>
  `id: borrowed\nversion: 1.0.0\nname: Borrowed\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n${binding}`;

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
  /**
   * A protocol variable is a symbol created and used within one protocol run: bound once as
   * `{$name}` and read bare afterwards. Those reads name the step's own working value, so charging
   * them to the bag asks a routine to declare a name nothing in the session ever holds.
   */
  it('does not report a name the bound technique binds as a protocol local', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: host_verdict\n') } },
      techniques: {
        wf: {
          'analysis/sweep': `---
metadata:
  version: 1.0.0
---

## Capability

Sweeps the target.

## Outputs

### run_verdict

What the sweep concluded.

## Protocol

### 1. Sweep

- Take the target's shape as \`{$observed_shape}\` and weigh \`{observed_shape}\` against \`{sweep_depth}\`.
`,
        },
      },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: sweep_depth
    description: how deep the sweep goes
outputs:
  - id: run_verdict
    type: string
    description: what the sweep concluded
steps:
  - kind: technique
    id: sweep
    technique:
      name: analysis::sweep
      outputs:
        run_verdict: run_verdict
`,
        },
      },
    });
    expect(findings).toEqual([]);
  });

  /**
   * A routine takes its argument's OPERATION and not that technique's values. Which values those are
   * follows from the argument, so a signature naming one holds at the site that supplied it and
   * nowhere else — and the host reading it downstream is promised something the next site withdraws.
   */
  it('reports a signature carrying a value the bound technique produces', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    with:\n      pass_operation: analysis::sweep\n    outputs:\n      run_verdict: host_verdict\n` } },
      techniques: {
        wf: {
          'analysis/sweep': `---
metadata:
  version: 1.0.0
---

## Capability

Sweeps the target.

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
inputs:
  - id: pass_operation
    kind: technique
    description: the sweep each site applies
outputs:
  - id: run_verdict
    type: string
    description: what the sweep concluded
steps:
  - kind: technique
    id: sweep
    technique:
      name: pass_operation
      outputs:
        run_verdict: run_verdict
`,
        },
      },
    });
    expect(checks(findings)).toEqual(['routine-reads-argument-output']);
    expect(findings[0]?.detail).toContain("'run_verdict' is an output of the technique this site binds");
  });

  /**
   * The same value one step down: a run steering its later steps on what its own earlier step put in
   * the bag. No site supplies it, so there is nothing for a declaration to say — and a rule asking
   * for one leaves the value nowhere to go, an input the host never reads being refused as an output
   * the argument produces.
   */
  it('passes a body that reads what its own step produced', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    with:\n      pass_operation: analysis::sweep\n` } },
      techniques: {
        wf: {
          'analysis/sweep': `---
metadata:
  version: 1.0.0
---

## Capability

Sweeps the target.

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
inputs:
  - id: pass_operation
    kind: technique
    description: the sweep each site applies
steps:
  - kind: technique
    id: sweep
    technique:
      name: pass_operation
  - kind: action
    id: note-clean
    when: run_verdict == "clean"
    actions:
      - action: log
        message: the sweep came back clean
`,
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * Every signature rule for such a routine runs against a site, so a routine whose every site binds
   * an argument this cannot read has no rule that can fire. A guard reporting nothing there is not
   * reporting that the routine is sound — it is reporting that it looked at nothing, and the two read
   * identically unless one of them says so.
   */
  it('says so when no reference site supplies a technique it can read', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    with:\n      pass_operation: "{chosen_lens}"\n` } },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: pass_operation
    kind: technique
    description: the sweep each site applies
  - id: unread_topic_name
    description: nothing in the body reads this
outputs:
  - id: unwritten_run_verdict
    type: string
    description: nothing in the body writes this
steps:
  - kind: technique
    id: sweep
    technique:
      name: pass_operation
`,
        },
      },
    });
    expect(checks(findings)).toEqual(['routine-signature-unheld']);
    expect(findings[0]?.detail).toContain('1 site(s) refer');
  });

  /**
   * The counterpart, and the one the corpus actually has: a step's actions are the RUN's writes,
   * authored beside the binding and the same whichever technique the site supplies. Only what the
   * technique declares varies by argument.
   */
  it('does not report an output the run writes through an action beside the binding', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    with:\n      pass_operation: analysis::sweep\n    outputs:\n      run_notes: host_notes\n` } },
      techniques: {
        wf: {
          'analysis/sweep': `---
metadata:
  version: 1.0.0
---

## Capability

Sweeps the target.

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
inputs:
  - id: pass_operation
    kind: technique
    description: the sweep each site applies
outputs:
  - id: run_notes
    type: string
    description: what the run noted of its own accord
steps:
  - kind: technique
    id: sweep
    technique:
      name: pass_operation
    actions:
      - action: set
        target: run_notes
        description: noted beside the binding
`,
        },
      },
    });
    expect(findings).toEqual([]);
  });

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
 * resolver that names the owning namespace from a site key is the one place that set is spelled.
 * Left out of it, a routine path resolves to no workflow at all — and every rule phrased as "the
 * consumer has to reach the file it closes a finding on" then refuses a routine silently, because
 * a missing workflow fails that test the same way an unrelated one does.
 *
 * Asserted on the resolver rather than through the guard, because the guard's own case below is
 * satisfied by scanning the files, and would pass while this stayed broken for every other caller.
 */
describe('a routine path names the workflow that owns it', () => {
  it('resolves the owning workflow, as an activity or technique path does', () => {
    expect(namespaceRefFromCitePath('work-package/routines/converge-assumptions.yaml')).toBe('work-package');
    expect(namespaceRefFromCitePath('work-package/activities/04-research.yaml')).toBe('work-package');
    expect(namespaceRefFromCitePath('work-package/techniques/analyse-challenge/combine.md')).toBe('work-package');
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

  /**
   * A routine is an artifact offered to whatever binds it, on the terms the techniques beside it
   * are offered, so how many callers reach it is not a property this guard measures. Its signature
   * is held against its own body either way.
   */
  it('accepts a routine nothing references anywhere in the corpus', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      routines: { wf: { 'shared-run': body('shared-run', action) } },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A reference is a field an activity file carries, so whether the workflow around it loads is a
   * different question. Counted only through the load, a routine referred to from a workflow that
   * does not load reads as a routine nothing refers to — and the remedy that finding names, delete
   * the file, is destructive applied to a file the corpus uses.
   *
   * Every other tree in this file loads clean, which is the assumption that kept this out of view.
   */
  it('counts a reference from a workflow that does not load', async () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-routines-unread-'));
    try {
      // A workflow whose graph names a destination no activity declares, so the load refuses it.
      mkdirSync(join(root, 'broken-wf', 'activities'), { recursive: true });
      writeFileSync(
        join(root, 'broken-wf', 'workflow.yaml'),
        'id: broken-wf\nversion: 1.0.0\ntitle: broken-wf\ninitialActivity: host\ngraph:\n  host:\n    done: no-such-activity\n',
      );
      writeFileSync(join(root, 'broken-wf', 'activities', '01-host.yaml'), referrer());
      writeRoutineFixture(root, 'broken-wf', 'shared-run', body('shared-run', action));

      expect(checks(await collectRoutineFindings(root))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  /**
   * A definition sits at any depth under `activities/`: `meta/activities/patterns/` holds a library
   * another workflow borrows by path, which meta's own graph never reaches and the loader never
   * enumerates. The reference the borrowed activity carries is a reference wherever it runs, so a
   * walk stopping at the top level reports the routine as referred to by nothing — and the remedy
   * that finding names, delete the file, is destructive applied to a file three sites use.
   */
  it('counts a reference from an activity a level down', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      libraryActivities: { wf: { 'patterns/02-borrowed': borrowed() } },
      routines: { wf: { 'shared-run': body('shared-run', action) } },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A per-site finding cites the reference site in its own text, so the path a nested file
   * contributes is user-facing: cited by its basename alone it names a file that is not there.
   */
  it('cites a nested referrer by its path from the corpus root', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      libraryActivities: {
        wf: {
          'patterns/02-borrowed': borrowed('    with:\n      pass_operation: analysis::sweep\n'),
        },
      },
      techniques: {
        wf: {
          'analysis/sweep': '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nSweeps the target.\n\n'
            + '## Protocol\n\n### 1. Sweep\n\n- Sweep the target, noting `{some_workflow_variable}`.\n',
        },
      },
      routines: {
        wf: {
          'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: pass_operation
    kind: technique
    description: the lens each site applies
steps:
  - kind: technique
    id: apply
    technique: pass_operation
`,
        },
      },
    });
    const finding = findings.find((f) => f.check === 'routine-undeclared-read');
    expect(finding).toBeDefined();
    expect(finding!.site).toBe('wf/routines/shared-run.yaml at wf/activities/patterns/02-borrowed.yaml');
  });

  it('computes the home from a referrer a level down', async () => {
    const findings = await findingsFor({
      activities: {
        wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action },
        meta: { bootstrap: 'id: bootstrap\nversion: 1.0.0\nname: Bootstrap\nsteps:\n' + action },
      },
      libraryActivities: { wf: { 'patterns/02-borrowed': borrowed() } },
      routines: { meta: { 'shared-run': body('shared-run', action) } },
    });
    const finding = findings.find((f) => f.check === 'routine-misplaced');
    expect(finding).toBeDefined();
    expect(finding!.detail).toContain("computed home is 'wf'");
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

  /**
   * A library declares no workflow, so it holds no activity file and the owner computation can only
   * name somewhere else. Left at that, a run composing a library's techniques could never sit beside
   * them — which is the arrangement the resolver's `namespace::name` form exists for.
   */
  const probe = `---
metadata:
  version: 1.0.0
---

## Capability

Probe the target.

## Protocol

### 1. Probe

- Probe the target.
`;

  const libraryReferrer = 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: lib::shared-run\n';

  it('accepts a library-homed routine whose body binds that library\'s techniques', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: libraryReferrer } },
      techniques: { lib: { probe } },
      routines: { lib: { 'shared-run': body('shared-run', '  - kind: technique\n    id: probe\n    technique: lib::probe\n') } },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A library offers its artifacts to whatever binds them — a caller may arrive from any workflow,
   * or from none yet — which is the standing a technique in the same directory already has. Held to
   * the workflow rule, a library could carry no run until some workflow happened to want one.
   */
  it('accepts a library-homed routine no caller references', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      techniques: { lib: { probe } },
      routines: { lib: { 'shared-run': body('shared-run', '  - kind: technique\n    id: probe\n    technique: lib::probe\n') } },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * The run a missing caller does bear on: its signature is derived against the technique that
   * stands in the parameter's place, which a site supplies or a declared default carries. A
   * parameter with neither has nothing to derive against, and silence there would read as a run
   * nothing found fault with.
   */
  it('reports a routine whose signature no site can hold', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    description: the measurement each pass applies
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    const finding = findings.find((f) => f.check === 'routine-signature-unheld');
    expect(finding).toBeDefined();
    expect(finding!.detail).toContain('nothing in the corpus refers to');
  });

  it('reports a library-homed routine that binds none of that library\'s techniques', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: libraryReferrer } },
      techniques: { lib: { probe } },
      routines: { lib: { 'shared-run': body('shared-run', action) } },
    });
    const finding = findings.find((f) => f.check === 'routine-misplaced');
    expect(finding).toBeDefined();
    expect(finding!.site).toBe('lib/routines/shared-run.yaml');
    expect(finding!.detail).toContain("computed home is 'wf'");
    expect(finding!.detail).toContain('this body binds none');
  });

  /**
   * The exemption is a library's, and a workflow declaring the same shape is held to the ordinary
   * rule: its activities are what the owner computation reads, so a run one other workflow reaches
   * belongs to that workflow whatever its own directory offers. A reader granting the exemption on
   * the techniques alone would move every workflow's runs out of reach of the placement rule.
   */
  it('reports a workflow-homed routine binding its own techniques, the exemption being a library\'s', async () => {
    const findings = await findingsFor({
      activities: {
        wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: other::shared-run\n' },
        other: { own: 'id: own\nversion: 1.0.0\nname: Own\nsteps:\n' + action },
      },
      techniques: { other: { probe } },
      routines: { other: { 'shared-run': body('shared-run', '  - kind: technique\n    id: probe\n    technique: other::probe\n') } },
    });
    const finding = findings.find((f) => f.check === 'routine-misplaced');
    expect(finding).toBeDefined();
    expect(finding!.site).toBe('other/routines/shared-run.yaml');
    expect(finding!.detail).toContain("computed home is 'wf'");
  });

  /**
   * A run composes a library by reaching another of its runs as readily as by binding one of its
   * techniques: the reference splices that run's body, which is the library's techniques, where it
   * stands.
   */
  it('accepts a library-homed routine that reaches a sibling run of the same library', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: lib::outer-run\n' } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'inner-run': body('inner-run', '  - kind: technique\n    id: probe\n    technique: lib::probe\n'),
          'outer-run': body('outer-run', '  - kind: routine\n    id: inner\n    routine: lib::inner-run\n'),
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A technique arriving by parameter carries its reference in the declaration's default rather
   * than in the step, so the body is read with that substituted. Read as authored, the step names a
   * bare parameter id, which names no namespace and would send the file away from the library whose
   * technique it runs.
   */
  it('accepts a library-homed routine whose technique arrives from a declared default', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: libraryReferrer } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    default: lib::probe
    description: the measurement each pass applies
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A parameter carries no namespace of its own, so a run whose every technique arrives that way
   * names its library through what a site binds into it. Read from the authored steps alone the
   * body names nothing, and the file is sent to the workflow that refers to it.
   */
  it('accepts a library-homed routine whose technique arrives from a site argument', async () => {
    const findings = await findingsFor({
      activities: {
        wf: {
          host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: lib::shared-run\n    with:\n      probe_operation: lib::probe\n',
        },
      },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    description: the measurement each pass applies
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });

  /**
   * A run the authored steps name the library in is homed there whatever stands in its technique
   * positions. A reading that only ever substitutes would have no body to inspect where a parameter
   * has neither an argument nor a default, and would send the file away from the library it spells.
   */
  it('accepts a library-homed routine naming the library outright, its other technique unbound', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: libraryReferrer } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    description: the measurement each pass applies
steps:
  - kind: technique
    id: named
    technique: lib::probe
  - kind: technique
    id: parameterised
    technique: probe_operation
`,
        },
      },
    });
    expect(findings.find((f) => f.check === 'routine-misplaced')).toBeUndefined();
  });

  /**
   * Where sites exist and none supplies a technique this can read, nothing is derived and the
   * unheld finding says so. Grading the declaration against its own default there would report on a
   * body no reference site runs, and would retire the one verdict that says nothing was checked.
   */
  it('reports unheld where a site overrides the default with something unreadable', async () => {
    const findings = await findingsFor({
      activities: {
        wf: {
          host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: lib::shared-run\n    with:\n      probe_operation: "{chosen_operation}"\n',
        },
      },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    default: lib::probe
    description: the measurement each pass applies
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    const finding = findings.find((f) => f.check === 'routine-signature-unheld');
    expect(finding).toBeDefined();
    expect(finding!.detail).toContain('1 site(s) refer to');
  });

  /**
   * A declaration supplying its own technique holds its signature without a site, the default being
   * the technique every site that says nothing runs. Reporting it unheld states that nothing could
   * be derived, which the default falsifies — and what is derived is graded, so a body contradicting
   * the declaration is reported rather than passed over.
   */
  it('grades a caller-less routine against the body its declared default derives', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    default: lib::probe
    description: the measurement each pass applies
  - id: unread_input
    description: a value no step of this body reads
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    expect(findings.find((f) => f.check === 'routine-input-unread')).toBeDefined();
    expect(findings.find((f) => f.check === 'routine-signature-unheld')).toBeUndefined();
  });

  it('holds the signature of a caller-less routine whose technique carries a default', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      techniques: { lib: { probe } },
      routines: {
        lib: {
          'shared-run': `id: shared-run
version: 1.0.0
name: shared-run
inputs:
  - id: probe_operation
    kind: technique
    default: lib::probe
    description: the measurement each pass applies
steps:
  - kind: technique
    id: probe
    technique: probe_operation
`,
        },
      },
    });
    expect(findings.find((f) => f.check === 'routine-signature-unheld')).toBeUndefined();
  });

  /**
   * A namespace answers to its directory name and to the path reaching it, and a body naming the
   * library it sits in may use either. Matching the name alone leaves a body spelling the path
   * unmatched, which is the spelling a corpus reaches for where two directories claim one name.
   */
  it('accepts a library whose body names it by the path reaching it', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: libraryReferrer } },
      techniques: { 'support/lib': { probe } },
      routines: {
        'support/lib': {
          'shared-run': body('shared-run', '  - kind: technique\n    id: probe\n    technique: support::lib::probe\n'),
        },
      },
    });
    expect(checks(findings)).toEqual([]);
  });
});

/**
 * A routine's own names reach a technique step only through the fields the step spells, because an
 * unbound input or output resolves under its bare id and substitution rewrites only what a step
 * spells. An internal is renamed at every site, so its bare id is always another variable. An input
 * or output reaches its bare id only where every site binds that name to itself.
 */
describe('a routine name a body step leaves to its bare id', () => {
  const TECHNIQUES = {
    wf: {
      'analysis/produce': `---
metadata:
  version: 1.0.0
---

## Capability

A finding.

## Outputs

### interim_finding

The finding.

## Protocol

### 1. Produce

- Produce the finding.
`,
      'analysis/consume': `---
metadata:
  version: 1.0.0
---

## Capability

A verdict from the finding.

## Inputs

### interim_finding

The finding to weigh.

### side_note

*(optional)* A note the caller may add. Unset where none is given.

## Outputs

### run_verdict

The verdict.

## Protocol

### 1. Consume

- Weigh \`{interim_finding}\` into \`{run_verdict}\`.
`,
    },
  };
  const routineWith = (produceStep: string, consumeOutputs: string): string => `id: shared-run
version: 1.0.0
name: Shared Run
outputs:
  - id: run_verdict
    type: string
    description: the verdict
internals:
  - id: interim_finding
    description: handed from the producing step to the consuming step
  - id: side_note
    description: a note the run never supplies
steps:
${produceStep}
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      inputs:
        interim_finding: interim_finding
${consumeOutputs}`;
  const BOUND_PRODUCE = `  - kind: technique
    id: produce
    technique:
      name: analysis::produce
      outputs:
        interim_finding: interim_finding`;
  const host = (verdictTarget: string): Record<string, Record<string, string>> => ({
    wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    outputs:\n      run_verdict: ${verdictTarget}\n` },
  });
  const scopeFindings = (findings: Finding[]): Finding[] => findings.filter((f) => f.check === 'routine-scope-unbound');

  it('reports an internal a step produces under its bare id', async () => {
    const findings = await findingsFor({
      activities: host('run_verdict'),
      techniques: TECHNIQUES,
      routines: { wf: { 'shared-run': routineWith('  - kind: technique\n    id: produce\n    technique: analysis::produce', '      outputs:\n        run_verdict: run_verdict\n') } },
    });
    expect(scopeFindings(findings).map((f) => f.detail)).toEqual([
      expect.stringContaining("step 'produce' leaves its technique's output 'interim_finding' unbound, and 'interim_finding' is an internal"),
    ]);
  });

  it('leaves an optional input the run means to leave unset', async () => {
    const findings = await findingsFor({
      activities: host('run_verdict'),
      techniques: TECHNIQUES,
      routines: { wf: { 'shared-run': routineWith(BOUND_PRODUCE, '      outputs:\n        run_verdict: run_verdict\n') } },
    });
    expect(scopeFindings(findings)).toEqual([]);
  });

  it('leaves an output every site binds to its own name', async () => {
    const findings = await findingsFor({
      activities: host('run_verdict'),
      techniques: TECHNIQUES,
      routines: { wf: { 'shared-run': routineWith(BOUND_PRODUCE, '') } },
    });
    expect(scopeFindings(findings)).toEqual([]);
  });

  it('reports an output a site binds under another name', async () => {
    const findings = await findingsFor({
      activities: host('host_verdict'),
      techniques: TECHNIQUES,
      routines: { wf: { 'shared-run': routineWith(BOUND_PRODUCE, '') } },
    });
    expect(scopeFindings(findings).map((f) => f.detail)).toEqual([
      expect.stringContaining("step 'consume' leaves its technique's output 'run_verdict' unbound, and a reference site, or a routine enclosing one, binds 'run_verdict' under another name"),
    ]);
  });
});

describe('a routine name a parent routine renames', () => {
  const CONSUME = {
    wf: {
      'analysis/consume': `---
metadata:
  version: 1.0.0
---

## Capability

A verdict from the finding.

## Inputs

### interim_finding

The finding to weigh.

## Outputs

### run_verdict

The verdict.

## Protocol

### 1. Consume

- Weigh the finding into the verdict.
`,
    },
  };
  const CHILD = `id: child-run
version: 1.0.0
name: Child Run
inputs:
  - id: interim_finding
    description: the finding
outputs:
  - id: run_verdict
    type: string
    description: the verdict
steps:
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      outputs:
        run_verdict: run_verdict
`;
  const parent = (internals: string, inputs: string): string => `id: parent-run
version: 1.0.0
name: Parent Run
${inputs}outputs:
  - id: run_verdict
    type: string
    description: the verdict
${internals}steps:
  - kind: action
    id: note
    actions:
      - action: set
        target: interim_finding
        value: found
  - kind: routine
    id: child
    routine: child-run
    with:
      interim_finding: "{interim_finding}"
    outputs:
      run_verdict: run_verdict
`;
  const host = (binding: string): Record<string, Record<string, string>> => ({
    wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: parent-run\n${binding}    outputs:\n      run_verdict: run_verdict\n` },
  });
  const unboundIn = (findings: Finding[]): string[] =>
    findings.filter((f) => f.check === 'routine-scope-unbound').map((f) => `${f.site}: ${f.detail}`);
  const CHILD_MISS = "wf/routines/child-run.yaml: step 'consume' leaves its technique's input 'interim_finding' unbound, and a reference site, or a routine enclosing one, binds 'interim_finding' under another name — an unbound input resolves under its bare name, which substitution never rewrites, so bind it under technique.inputs as 'interim_finding: interim_finding'";

  it('reports a child step reading the bare name of the internal its parent passes', async () => {
    const findings = await findingsFor({
      activities: host(''),
      techniques: CONSUME,
      routines: { wf: { 'child-run': CHILD, 'parent-run': parent('internals:\n  - id: interim_finding\n    description: the finding\n', '') } },
    });
    expect(unboundIn(findings)).toEqual([CHILD_MISS]);
  });

  it('reports it where the parent passes on an input its own site rebinds', async () => {
    const findings = await findingsFor({
      activities: host('    with:\n      interim_finding: "{host_finding}"\n'),
      techniques: CONSUME,
      routines: { wf: { 'child-run': CHILD, 'parent-run': parent('', 'inputs:\n  - id: interim_finding\n    description: the finding\n') } },
    });
    expect(unboundIn(findings)).toEqual([CHILD_MISS]);
  });

  it('leaves it where every site up the chain binds the name to itself', async () => {
    const findings = await findingsFor({
      activities: host('    with:\n      interim_finding: "{interim_finding}"\n'),
      techniques: CONSUME,
      routines: { wf: { 'child-run': CHILD, 'parent-run': parent('', 'inputs:\n  - id: interim_finding\n    description: the finding\n') } },
    });
    expect(unboundIn(findings)).toEqual([]);
  });
});

describe('a routine name a site leaves to a default, keeps local, or never passes on', () => {
  const READ = {
    wf: {
      'analysis/consume': `---
metadata:
  version: 1.0.0
---

## Capability

A verdict from the finding.

## Inputs

### interim_finding

The finding to weigh.

## Outputs

### run_verdict

The verdict.

## Protocol

### 1. Consume

- Weigh the finding into the verdict.
`,
    },
  };
  const scope = (findings: Finding[], check = 'routine-scope-unbound'): string[] =>
    findings.filter((f) => f.check === check).map((f) => `${f.site}: ${f.detail.split(' — ')[0]}`);

  it('reports a step reading the bare name of an input a site leaves to its default', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: run_verdict\n') } },
      techniques: READ,
      routines: { wf: { 'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: interim_finding
    description: the finding
    default: none
outputs:
  - id: run_verdict
    type: string
    description: the verdict
steps:
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      outputs:
        run_verdict: run_verdict
` } },
    });
    expect(scope(findings)).toEqual([
      "wf/routines/shared-run.yaml: step 'consume' leaves its technique's input 'interim_finding' unbound, and a reference site, or a routine enclosing one, binds 'interim_finding' under another name",
    ]);
  });

  it('reports a step reading the bare name of an optional output a site keeps local', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    outputs:\n      run_verdict: run_verdict\n') } },
      techniques: READ,
      routines: { wf: { 'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
outputs:
  - id: run_verdict
    type: string
    description: the verdict
  - id: interim_finding
    type: string
    description: the finding
    optional: true
steps:
  - kind: action
    id: note
    actions:
      - action: set
        target: interim_finding
        value: found
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      outputs:
        run_verdict: run_verdict
` } },
    });
    expect(scope(findings)).toEqual([
      "wf/routines/shared-run.yaml: step 'consume' leaves its technique's input 'interim_finding' unbound, and a reference site leaves the optional output 'interim_finding' unbound, which keeps it local to that use",
    ]);
  });

  it('reports a site inside a routine leaving a child input unbound where the routine holds the name as an internal', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: `id: host\nversion: 1.0.0\nname: Host\nsteps:\n  - kind: routine\n    id: run\n    routine: parent-run\n    outputs:\n      run_verdict: run_verdict\n` } },
      techniques: READ,
      routines: { wf: {
        'child-run': `id: child-run
version: 1.0.0
name: Child Run
inputs:
  - id: interim_finding
    description: the finding
outputs:
  - id: run_verdict
    type: string
    description: the verdict
steps:
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      inputs:
        interim_finding: interim_finding
      outputs:
        run_verdict: run_verdict
`,
        'parent-run': `id: parent-run
version: 1.0.0
name: Parent Run
outputs:
  - id: run_verdict
    type: string
    description: the verdict
internals:
  - id: interim_finding
    description: the finding
steps:
  - kind: action
    id: note
    actions:
      - action: set
        target: interim_finding
        value: found
  - kind: routine
    id: child
    routine: child-run
    outputs:
      run_verdict: run_verdict
`,
      } },
    });
    expect(scope(findings)).toEqual([
      "wf/routines/parent-run.yaml: step 'child' leaves 'child-run' input 'interim_finding' unbound, and 'interim_finding' is an internal here",
    ]);
  });

  it('reports a body writing a name its signature declares only as an input', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: referrer('    with:\n      interim_finding: "{host_finding}"\n    outputs:\n      run_verdict: run_verdict\n') } },
      techniques: READ,
      routines: { wf: { 'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: interim_finding
    description: the finding
outputs:
  - id: run_verdict
    type: string
    description: the verdict
steps:
  - kind: technique
    id: consume
    technique:
      name: analysis::consume
      inputs:
        interim_finding: interim_finding
      outputs:
        run_verdict: run_verdict
  - kind: action
    id: overwrite
    actions:
      - action: set
        target: interim_finding
        value: spent
` } },
    });
    expect(scope(findings, 'routine-writes-input')).toEqual([
      "wf/routines/shared-run.yaml: the body writes 'interim_finding', which the signature declares as an input and not an output",
    ]);
  });
});

describe('a routine read at each site that supplies its technique', () => {
  it('reports an unbound internal once, naming every site it was read at', async () => {
    const host = (id: string): string => `id: ${id}\nversion: 1.0.0\nname: ${id}\nsteps:\n  - kind: routine\n    id: run\n    routine: shared-run\n    with:\n      pass_operation: analysis::produce\n`;
    const findings = await findingsFor({
      activities: { wf: { first: host('first'), second: host('second') } },
      techniques: {
        wf: {
          'analysis/produce': `---
metadata:
  version: 1.0.0
---

## Capability

A finding.

## Outputs

### interim_finding

The finding.

## Protocol

### 1. Produce

- Produce the finding.
`,
        },
      },
      routines: { wf: { 'shared-run': `id: shared-run
version: 1.0.0
name: Shared Run
inputs:
  - id: pass_operation
    kind: technique
    description: the producing technique each site applies
internals:
  - id: interim_finding
    description: handed from the producing step to the note
steps:
  - kind: technique
    id: produce
    technique:
      name: pass_operation
  - kind: action
    id: note
    actions:
      - action: log
        message: "found {interim_finding}"
` } },
    });
    const unbound = findings.filter((f) => f.check === 'routine-scope-unbound');
    expect(unbound).toHaveLength(1);
    expect(unbound[0]!.site).toBe('wf/routines/shared-run.yaml');
    expect(unbound[0]!.detail).toContain("step 'produce' leaves its technique's output 'interim_finding' unbound, and 'interim_finding' is an internal");
    expect(unbound[0]!.detail).toContain('(read at wf/routines/shared-run.yaml at wf/activities/01-first.yaml; wf/routines/shared-run.yaml at wf/activities/02-second.yaml)');
  });
});
