import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import {
  validateActivityManifest,
  validateActivityTransition,
  validateReportedExit,
  validateStepManifest,
  type SessionView,
} from '../src/utils/validation.js';
import { destinationField, destinationPhrase } from '../src/schema/workflow.schema.js';
import type { Workflow } from '../src/schema/workflow.schema.js';

/**
 * The readers that walk a destination, one test each. Two of them fail SILENTLY without the change
 * — they look the destination up, miss, and return no finding — so each is proved live rather than
 * merely quiet: the check reports where it should, and stays silent where it should not.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let listFan: Workflow;
let instanceFan: Workflow;

beforeAll(async () => {
  process.env['ALLOW_UNEXECUTABLE_FANS'] = '1';
  const load = async (id: string): Promise<Workflow> => {
    const result = await loadWorkflow(FAN_CORPUS, id);
    if (!result.success) throw new Error(`${id} failed to load: ${result.error.message}`);
    return result.value;
  };
  listFan = await load('list-fan-fixture');
  instanceFan = await load('instance-fan-fixture');
});

afterAll(() => {
  delete process.env['ALLOW_UNEXECUTABLE_FANS'];
});

const on = (activity: string): SessionView => ({ wf: 'fixture', act: activity, v: '1.0.0' });

describe('the reported-exit check — silent without the base lookup', () => {
  it('reports a fan instance whose reported exit the activity does not declare', () => {
    // Proved live: an instance-qualified id resolves to its base definition, so the check finds
    // the bindings and reports. Unresolved it would find none and return null — disabled, not wrong.
    const finding = validateReportedExit(on('probe-unit#1'), instanceFan, 'combine-probes', 'no-such-exit');
    expect(finding).toContain("Activity 'probe-unit#1' has no exit 'no-such-exit'");
    expect(finding).toContain('probed');
  });

  it('reports a fan instance returning to a destination its exit is not bound to', () => {
    const finding = validateReportedExit(on('probe-unit#1'), instanceFan, 'scope-sweep', 'probed');
    expect(finding).toContain("is bound to 'combine-probes' but 'scope-sweep' was requested");
  });

  it('is silent when a fan instance returns to the destination its exit names', () => {
    expect(validateReportedExit(on('probe-unit#2'), instanceFan, 'combine-probes', 'probed')).toBeNull();
  });

  it('compares set-wise on a fan enter, so the destination as the graph names it satisfies it', () => {
    expect(validateReportedExit(on('plan-prepare'), listFan, ['survey-pass', 'dependency-review'], 'done'))
      .toBeNull();
    // Order is not part of the agreement; membership is.
    expect(validateReportedExit(on('plan-prepare'), listFan, ['dependency-review', 'survey-pass'], 'done'))
      .toBeNull();
  });

  it('reports a fan enter that opens a branch the binding does not', () => {
    const finding = validateReportedExit(on('plan-prepare'), listFan, ['survey-pass', 'combine-findings'], 'done');
    expect(finding).toContain("is bound to 'survey-pass, dependency-review'");
  });
});

describe('the transition check — silent without the flatten', () => {
  it('reports on a fan enter naming an activity the source does not reach', () => {
    // Proved live: the destination flattens, so every branch is measured against the source's own
    // bound destinations. Unflattened the list itself is compared and nothing matches by accident.
    const finding = validateActivityTransition(on('plan-prepare'), listFan, ['survey-pass', 'combine-findings']);
    expect(finding).toContain("Activity 'combine-findings' is not bound to any exit of 'plan-prepare'");
    expect(finding).toContain('survey-pass, dependency-review');
  });

  it('is silent on a fan enter naming exactly the branches the graph opens', () => {
    expect(validateActivityTransition(on('plan-prepare'), listFan, ['survey-pass', 'dependency-review']))
      .toBeNull();
  });

  it('is silent on an instance fan entered by the destination the graph names', () => {
    const destination = instanceFan.graph!['scope-sweep']!['scoped']!;
    expect(validateActivityTransition(on('scope-sweep'), instanceFan, destination)).toBeNull();
  });

  it('resolves an instance-qualified source through the base lookup', () => {
    expect(validateActivityTransition(on('probe-unit#0'), instanceFan, 'combine-probes')).toBeNull();
    expect(validateActivityTransition(on('probe-unit#0'), instanceFan, 'scope-sweep'))
      .toContain("is not bound to any exit of 'probe-unit#0'");
  });
});

describe('the manifest validators', () => {
  it('the activity manifest admits an instance-qualified id, comparing on the base', () => {
    expect(validateActivityManifest([{ activity_id: 'probe-unit#1', outcome: 'probed' }], instanceFan))
      .toEqual([]);
    expect(validateActivityManifest([{ activity_id: 'no-such#1', outcome: 'done' }], instanceFan))
      .toEqual(["Activity manifest references unknown activity 'no-such#1'"]);
  });

  it('the step manifest resolves an instance through the base fallback rather than reporting it missing', () => {
    expect(validateStepManifest([], instanceFan, 'probe-unit#2'))
      .not.toContain("Cannot validate manifest: activity 'probe-unit#2' not found");
  });
});

describe('no rendered message interpolates a destination directly', () => {
  const FAN = ['survey-pass', 'dependency-review'];
  const INSTANCE = { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' };

  // An array stringifies happily into "whose next target is 'a,b,c'", and the compiler catches
  // none of it, so every field and every message goes through one home.
  it('a payload field carries the branch list rather than the destination verbatim', () => {
    expect(destinationField('combine-findings')).toBe('combine-findings');
    expect(destinationField(FAN)).toEqual(['survey-pass', 'dependency-review']);
    expect(destinationField(INSTANCE)).toEqual(['probe-unit']);
  });

  it('prose names the branches rather than stringifying the destination', () => {
    expect(destinationPhrase('combine-findings')).toBe("'combine-findings'");
    expect(destinationPhrase(FAN)).toBe('the branches it fans to (survey-pass, dependency-review)');
    expect(destinationPhrase(FAN)).not.toContain('survey-pass,dependency-review');
    expect(destinationPhrase(INSTANCE)).toBe('the branches it fans to (probe-unit)');
    // The collection's name is a fact about the fan's width, which is not a worker's business.
    expect(destinationPhrase(INSTANCE)).not.toContain('probe_targets');
  });
});
