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
  it('does not report a name the bound operation binds as a protocol local', async () => {
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
    technique: analysis::sweep
`,
        },
      },
    });
    expect(findings).toEqual([]);
  });

  /**
   * A routine takes its argument's OPERATION and not that operation's values. Which values those are
   * follows from the argument, so a signature naming one holds at the site that supplied it and
   * nowhere else — and the host reading it downstream is promised something the next site withdraws.
   */
  it('reports a signature carrying a value the bound operation produces', async () => {
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
`,
        },
      },
    });
    expect(checks(findings)).toEqual(['routine-reads-argument-output']);
    expect(findings[0]?.detail).toContain("'run_verdict' is an output of the operation this site binds");
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
  it('says so when no reference site supplies an operation it can read', async () => {
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
   * authored beside the binding and the same whichever operation the site supplies. Only what the
   * operation declares varies by argument.
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

  it('reports a routine nothing references anywhere in the corpus', async () => {
    const findings = await findingsFor({
      activities: { wf: { host: 'id: host\nversion: 1.0.0\nname: Host\nsteps:\n' + action } },
      routines: { wf: { 'shared-run': body('shared-run', action) } },
    });
    expect(checks(findings)).toEqual(['routine-unreferenced']);
    expect(findings[0]!.detail).toContain('workflow(s)');
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
});
