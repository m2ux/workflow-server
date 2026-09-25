import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { declareFixtureWorkflows, writeWorkflowFixture } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-identity-binds.js';

/**
 * identity-binds guard: an activity step that writes out the same-name binding omitting the pair
 * already performs.
 *
 * The reportable case is one line of YAML, and three populations spell it identically while meaning
 * something else. Every fixture below is a carve-out but one, because the carve-outs are the whole
 * content of the check: a guard that lost one would advise a strip that silently changes what a run
 * binds, and the corpus would go on passing.
 */
describe('identity-binds guard', () => {
  interface Case {
    /** `## Inputs` body of the technique the step binds. */
    inputs?: string;
    /** `## Inputs` body of the group container above it, whose declarations the technique inherits. */
    containerInputs?: string;
    /** The step's `technique:` block, indented as a step field. */
    binding: string;
    /** A routine file carrying the same binding, to show the body is not read. */
    asRoutine?: boolean;
  }

  function findingsFor({ inputs = '', containerInputs, binding, asRoutine = false }: Case): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-identity-'));
    try {
      writeWorkflowFixture(root, 'wf');
      const techniques = join(root, 'wf', 'techniques', 'grp');
      mkdirSync(techniques, { recursive: true });
      if (containerInputs !== undefined) {
        writeFileSync(
          join(techniques, 'TECHNIQUE.md'),
          '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nA group.\n\n'
          + `## Inputs\n\n${containerInputs}\n## Rules\n\n### a-rule\n\nSomething.\n`,
          'utf-8',
        );
      }
      writeFileSync(
        join(techniques, 'op.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n'
        + `## Inputs\n\n${inputs}\n## Protocol\n\n### 1. Do It\n\n1. Do the thing.\n`,
        'utf-8',
      );
      const body = `steps:\n  - kind: technique\n    id: bind-it\n${binding}`;
      const activities = join(root, 'wf', 'activities');
      mkdirSync(activities, { recursive: true });
      if (asRoutine) {
        mkdirSync(join(root, 'wf', 'routines'), { recursive: true });
        writeFileSync(join(root, 'wf', 'routines', 'run.yaml'), `id: run\nversion: 1.0.0\nname: Run\ndescription: Runs.\n${body}`, 'utf-8');
        // The guard refuses a corpus it inspected nothing in, so the routine case still needs an
        // activity — one binding nothing this check reports, so the routine is the only subject.
        writeFileSync(
          join(activities, '01-act.yaml'),
          'id: act\nversion: 1.0.0\nname: Act\ndescription: Acts.\nsteps:\n  - kind: technique\n    id: plain\n    technique: grp::op\n',
          'utf-8',
        );
      } else {
        writeFileSync(join(activities, '01-act.yaml'), `id: act\nversion: 1.0.0\nname: Act\ndescription: Acts.\n${body}`, 'utf-8');
      }
      declareFixtureWorkflows(root);
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const REQUIRED = '### seed_value\n\nThe value taken up.\n';
  const SAME_NAME = '    technique:\n      name: grp::op\n      inputs:\n        seed_value: seed_value\n';

  it('reports a same-name bind on an input the technique requires', () => {
    const findings = findingsFor({ inputs: REQUIRED, binding: SAME_NAME });
    expect(findings.map((f) => f.check)).toContain('identity-bind');
  });

  it('reports a same-name bind on an output, which has no optionality to weigh', () => {
    const findings = findingsFor({
      inputs: REQUIRED,
      binding: '    technique:\n      name: grp::op\n      outputs:\n        landed: landed\n',
    });
    expect(findings.map((f) => f.check)).toContain('identity-bind');
  });

  it('passes a bind that renames, which is the deviation the object exists for', () => {
    const findings = findingsFor({
      inputs: REQUIRED,
      binding: '    technique:\n      name: grp::op\n      inputs:\n        seed_value: other_name\n',
    });
    expect(findings).toEqual([]);
  });

  /**
   * An optional input is not a value the workflow must supply, so the contract derivation counts no
   * read for one. The same-name bind is the activity saying it does supply it, which is what carries
   * the name into the read contract — strip it and `check-activity-variables` reports the declared
   * read as unconsulted.
   */
  it('passes a same-name bind on an input the technique marks optional', () => {
    const findings = findingsFor({
      inputs: '### seed_value\n\n*(optional)* The value taken up.\n',
      binding: SAME_NAME,
    });
    expect(findings).toEqual([]);
  });

  it('passes a same-name bind on an input carrying a default', () => {
    const findings = findingsFor({
      inputs: '### seed_value\n\nThe value taken up.\n\n#### default\n\n`--workspace`\n',
      binding: SAME_NAME,
    });
    expect(findings).toEqual([]);
  });

  /**
   * What a step binds is the composed contract. An input declared optional on the GROUP appears in
   * no leaf, so a check reading the leaf alone calls the pair a restatement and advises a strip that
   * breaks the same contract the leaf case above protects.
   */
  it('passes a same-name bind on an input the CONTAINER marks optional', () => {
    const findings = findingsFor({
      containerInputs: '### seed_value\n\n*(optional when something else is set)* Inherited.\n',
      binding: SAME_NAME,
    });
    expect(findings).toEqual([]);
  });

  /**
   * A routine body is rewritten at each reference site and only the names it spells are rewritten,
   * so the pair is the anchor a site's rename lands on. Strip it and a site binding the parameter to
   * another host variable has nothing to rewrite, and the rename is silently lost.
   */
  it('passes the same binding written in a routine body', () => {
    const findings = findingsFor({ inputs: REQUIRED, binding: SAME_NAME, asRoutine: true });
    expect(findings).toEqual([]);
  });

  /**
   * A nested routine step's outputs carry no same-name default at all: an unbound output fails the
   * load, or is dropped where the declaration permits it. The pair is the binding, not a second
   * spelling of one.
   */
  it('passes a same-name output binding on a nested routine step', () => {
    const findings = findingsFor({
      inputs: REQUIRED,
      binding: '    technique: grp::op\n  - kind: routine\n    id: run-it\n    routine: some-run\n'
        + '    outputs:\n      repo_name: repo_name\n',
    });
    expect(findings).toEqual([]);
  });

  /**
   * Where the reference resolves to more than one technique the optionality carve-outs cannot be
   * tested, and a check that cannot tell a deviation from a restatement should not call it one.
   */
  it('passes a bind whose technique the corpus does not hold', () => {
    const findings = findingsFor({
      inputs: REQUIRED,
      binding: '    technique:\n      name: grp::nowhere\n      inputs:\n        seed_value: seed_value\n',
    });
    expect(findings).toEqual([]);
  });
});
