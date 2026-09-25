import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-operation-contract.js';

/**
 * operation-contract guard: what an activity's variable contract says about a value, held against
 * what the technique filling it publishes.
 *
 * Both families exist because the contract guard narrows every derived name to the workflow's
 * declared namespace, and that namespace is assembled out of the declarations — so an omission and
 * a technique that lands nothing are the same silence there. The fixtures pin the reportable case
 * and each carve-out, because a guard whose negative fixture stops failing reports clean over
 * ground it never read.
 */
describe('operation-contract guard', () => {
  interface Case {
    /** `## Outputs` body of the bound technique. */
    outputs: string;
    /** `variables.writes` entries of the activity binding it. */
    writes: string;
    /** What the follow-on step feeds `consume`'s declared input, making the value handed on. */
    handOn?: string;
    /** Put the consuming step BEFORE the producing one, so the read cannot be a handoff. */
    consumeFirst?: boolean;
    /** A value the activity's own exit condition tests, which is what carries it past the boundary. */
    routeOn?: string;
  }

  /**
   * A two-step activity: `op` lands the outputs under test, and `consume` takes one value up. The
   * second technique declares the input it is fed, because an unbound binding key names no input of
   * the signature and is walked by nothing — so a fixture binding one would leave the value
   * unmentioned, and every handoff case would pass for the wrong reason.
   */
  async function findingsFor({ outputs, writes, handOn, consumeFirst = false, routeOn }: Case): Promise<Awaited<ReturnType<typeof collectFindings>>> {
    const root = mkdtempSync(join(tmpdir(), 'wf-opcontract-'));
    try {
      writeLoadableWorkflowFixture(root, 'wf', ['act']);
      // An activity declaring exits needs the graph to name a destination for each, or the
      // workflow does not load and the guard reports that instead of what the case is about.
      if (routeOn !== undefined) {
        writeFileSync(
          join(root, 'wf', 'workflow.yaml'),
          'id: wf\nversion: 1.0.0\ntitle: wf\ninitialActivity: act\ngraph:\n  act:\n'
          + '    went-on: __terminal__\n    did-not: __terminal__\n',
          'utf-8',
        );
      }
      mkdirSync(join(root, 'wf', 'techniques'), { recursive: true });
      writeFileSync(
        join(root, 'wf', 'techniques', 'op.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n'
        + `## Outputs\n\n${outputs}\n## Protocol\n\n1. Do the thing.\n`,
        'utf-8',
      );
      writeFileSync(
        join(root, 'wf', 'techniques', 'consume.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nTakes a value up.\n\n'
        + '## Inputs\n\n### seed_value\n\nThe value taken up.\n\n## Protocol\n\n1. Take it up.\n',
        'utf-8',
      );
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      const produce = '  - kind: technique\n    technique: op\n';
      const consume = handOn === undefined
        ? ''
        : '  - kind: technique\n    technique:\n      name: consume\n      inputs:\n'
          + `        seed_value: "{${handOn}}"\n`;
      // An exit carrying a `when` is activity-level routing, read at the boundary after every step.
      const exits = routeOn === undefined
        ? ''
        : `exits:\n  - id: went-on\n    label: It went on.\n    when: "${routeOn} == yes"\n`
          + '  - id: did-not\n    label: It did not.\n    isDefault: true\n';
      writeFileSync(
        join(root, 'wf', 'activities', '01-act.yaml'),
        `id: act\nversion: 1.0.0\nname: Act\ndescription: Acts.\nvariables:\n  reads: []\n  writes:\n${writes}`
        + exits
        + `steps:\n${consumeFirst ? consume + produce : produce + consume}`,
        'utf-8',
      );
      return await collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  /**
   * The audit instance: a variable declared a string summary while the technique bound to that step
   * publishes a structure. Both declarations were internally consistent and every check stayed green.
   */
  it('reports a scalar declaration against a technique publishing members', async () => {
    const findings = await findingsFor({
      outputs: '### test_status\n\nThe check\'s status.\n\n#### check_id\n\nWhich check ran.\n\n'
        + '#### passed\n\nWhether every test passed.\n',
      writes: '    - name: test_status\n      type: string\n      description: Pass/fail summary\n',
    });
    expect(findings.map((f) => f.check)).toContain('declared-type-mismatch');
  });

  it('passes the same variable declared as the shape the technique publishes', async () => {
    const findings = await findingsFor({
      outputs: '### test_status\n\nThe check\'s status.\n\n#### check_id\n\nWhich check ran.\n\n'
        + '#### passed\n\nWhether every test passed.\n',
      writes: '    - name: test_status\n      type: object\n      description: The check\'s status.\n',
    });
    expect(findings.filter((f) => f.check === 'declared-type-mismatch')).toEqual([]);
  });

  /**
   * An output declaring no members states nothing about its shape, so a scalar declaration against
   * it contradicts nothing. Reporting these would report every under-declared output in the corpus.
   */
  it('passes a scalar declaration against an output declaring no members', async () => {
    const findings = await findingsFor({
      outputs: '### test_status\n\nThe check\'s status.\n',
      writes: '    - name: test_status\n      type: string\n      description: Pass/fail summary\n',
    });
    expect(findings.filter((f) => f.check === 'declared-type-mismatch')).toEqual([]);
  });

  /**
   * The other audit instance: a technique lands a value, the activity's own exit condition tests
   * it, and the contract declares no write of it. The value chooses where the run goes next, so it
   * outlives the activity, and a reader of the contract cannot see what decided the exit.
   */
  it('reports a technique write the activity routes on and the contract omits', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      routeOn: 'symbol_work_list',
    });
    expect(findings.map((f) => f.check)).toContain('underived-operation-write');
  });

  it('passes the same write once the contract declares it', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: symbol_work_list\n      type: array\n      description: The symbols to document.\n',
      routeOn: 'symbol_work_list',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });

  /**
   * A handoff between two steps of one activity crosses no boundary: the value is produced and
   * consumed inside the activity and nothing outside can reach it. The construct inventory calls
   * that the technique layer's own wiring, and `check-binding-fidelity` answers for it. A wider
   * reading reported 117 of these, which is what made the family read as a convention question
   * rather than a defect family.
   */
  it('passes a technique write only a later step of the same activity consumes', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      handOn: 'symbol_work_list',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });

  /**
   * A production nothing goes on to consume dies with its step — a utility technique's confirmation
   * value owes the contract nothing, and reporting it would report most of the corpus.
   */
  it('passes a technique write nothing takes up', async () => {
    const findings = await findingsFor({
      outputs: '### run_confirmation\n\nThat the thing was done.\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });

  /**
   * The server consumes a persisted output when it synthesizes the activity's artifact contract, so
   * the value reaches a reader whatever the variable contract says.
   */
  it('passes a technique write the technique persists as an artifact', async () => {
    const findings = await findingsFor({
      outputs: '### written_report\n\nThe written report.\n\n#### artifact\n\n`report.md`\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      handOn: 'written_report',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });
});
