import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeLoadableWorkflowFixture } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-operation-contract.js';

/**
 * operation-contract guard: what an activity's variable contract says about a value, held against
 * what the operation filling it publishes.
 *
 * Both families exist because the contract guard narrows every derived name to the workflow's
 * declared namespace, and that namespace is assembled out of the declarations — so an omission and
 * an operation that lands nothing are the same silence there. The fixtures pin the reportable case
 * and each carve-out, because a guard whose negative fixture stops failing reports clean over
 * ground it never read.
 */
describe('operation-contract guard', () => {
  interface Case {
    /** `## Outputs` body of the bound operation. */
    outputs: string;
    /** `variables.writes` entries of the activity binding it. */
    writes: string;
    /** What the follow-on step feeds `consume`'s declared input, making the value handed on. */
    handOn?: string;
    /** Put the consuming step BEFORE the producing one, so the read cannot be a handoff. */
    consumeFirst?: boolean;
  }

  /**
   * A two-step activity: `op` lands the outputs under test, and `consume` takes one value up. The
   * second operation declares the input it is fed, because an unbound binding key names no input of
   * the signature and is walked by nothing — so a fixture binding one would leave the value
   * unmentioned, and every handoff case would pass for the wrong reason.
   */
  async function findingsFor({ outputs, writes, handOn, consumeFirst = false }: Case): Promise<Awaited<ReturnType<typeof collectFindings>>> {
    const root = mkdtempSync(join(tmpdir(), 'wf-opcontract-'));
    try {
      writeLoadableWorkflowFixture(root, 'wf', ['act']);
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
      writeFileSync(
        join(root, 'wf', 'activities', '01-act.yaml'),
        `id: act\nversion: 1.0.0\nname: Act\ndescription: Acts.\nvariables:\n  reads: []\n  writes:\n${writes}`
        + `steps:\n${consumeFirst ? consume + produce : produce + consume}`,
        'utf-8',
      );
      return await collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  /**
   * The audit instance: a variable declared a string summary while the operation bound to that step
   * publishes a structure. Both declarations were internally consistent and every check stayed green.
   */
  it('reports a scalar declaration against an operation publishing members', async () => {
    const findings = await findingsFor({
      outputs: '### test_status\n\nThe check\'s status.\n\n#### check_id\n\nWhich check ran.\n\n'
        + '#### passed\n\nWhether every test passed.\n',
      writes: '    - name: test_status\n      type: string\n      description: Pass/fail summary\n',
    });
    expect(findings.map((f) => f.check)).toContain('declared-type-mismatch');
  });

  it('passes the same variable declared as the shape the operation publishes', async () => {
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
   * The other audit instance: an operation lands a value, a later step takes it up, and the contract
   * shows neither. The handoff runs; a reader of the contract cannot see it.
   */
  it('reports an operation write a later step consumes and the contract omits', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      handOn: 'symbol_work_list',
    });
    expect(findings.map((f) => f.check)).toContain('underived-operation-write');
  });

  it('passes the same write once the contract declares it', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: symbol_work_list\n      type: array\n      description: The symbols to document.\n',
      handOn: 'symbol_work_list',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });

  /**
   * A read that happens BEFORE the operation lands the value is not the handoff this family is
   * about — whatever it consults came from somewhere else, and calling it a handoff would describe
   * a flow that does not happen. Ordering accounts for 24 of the 141 the un-ordered reading gave.
   */
  it('passes a read of the same name that precedes the operation landing it', async () => {
    const findings = await findingsFor({
      outputs: '### symbol_work_list\n\nThe symbols to document.\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      handOn: 'symbol_work_list',
      consumeFirst: true,
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });

  /**
   * A production nothing goes on to consume dies with its step — a utility operation's confirmation
   * value owes the contract nothing, and reporting it would report most of the corpus.
   */
  it('passes an operation write nothing takes up', async () => {
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
  it('passes an operation write the technique persists as an artifact', async () => {
    const findings = await findingsFor({
      outputs: '### written_report\n\nThe written report.\n\n#### artifact\n\n`report.md`\n',
      writes: '    - name: other_value\n      type: string\n      description: Something else.\n',
      handOn: 'written_report',
    });
    expect(findings.filter((f) => f.check === 'underived-operation-write')).toEqual([]);
  });
});
