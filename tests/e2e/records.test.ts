import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { walk } from './walker.js';
import { makePolicy } from './policies.js';
import {
  assumptionRecordSteps,
  doubledAnnouncements,
  recordHostsEntered,
  recordedAssumptionOutcomes,
} from './records.js';

/**
 * The two walk assertions, put to runs that carry the defect each exists to catch.
 *
 * `all-workflows-walk` and the review-mode snapshot run both against the live corpus, where neither
 * reading reports anything — which is the point of having them and no evidence at all that either
 * would. The corpus cannot carry either defect on purpose, so the runs that do are fixtures, walked
 * through the same server by the same walker: one activity announcing a findings file under two
 * spellings, and one host of an assumption run whose record step lost its review-mode conjunct.
 *
 * Each fixture carries its control beside the defect — the activity that announces once, the host
 * that keeps the conjunct — so a reading that reported everything would fail here too.
 */
const FIXTURES = resolve(import.meta.dirname, '../fixtures/wrong-records');

let harness: Harness;

beforeAll(async () => { harness = await createHarness({ workflowDir: FIXTURES }); });
afterAll(async () => { await harness?.close(); });

describe('a contract that announces one artifact twice', () => {
  it('is reported for the activity that announces it, and not for the one that announces once', async () => {
    const result = await walk(harness, 'doubled-contract', makePolicy({ name: 'fixture' }), {
      mode: 'graph', autoAdvance: true, maxVisits: 4,
    });
    expect(result.path).toEqual(['announces-twice', 'announces-once']);

    // The server composed both spellings: the drop it makes compares exact strings, and these differ.
    const twice = result.steps.find((s) => s.activityId === 'announces-twice')!;
    expect([...twice.artifactContract].sort()).toEqual(['04-findings.md', 'findings.md']);

    expect(doubledAnnouncements(result)).toEqual([
      'announces-twice: findings.md <- findings.md, 04-findings.md',
    ]);
  });
});

describe('an assumption outcome recorded in review mode', () => {
  it('is reported for the host that lost the conjunct, and not for the one that kept it', async () => {
    const reviewMode = makePolicy({ name: 'fixture-review', initialVariables: { is_review_mode: true } });
    const result = await walk(harness, 'review-record', reviewMode, { maxVisits: 4 });
    expect(result.path).toEqual(['guards-the-record', 'records-regardless']);

    const recorders = await assumptionRecordSteps(['review-record'], FIXTURES);
    // Both hosts declare a recording step, and the walk entered both — so a host reported below is
    // reported for what it ran, and a host absent from the report is absent for the same reason.
    expect([...recorders.keys()].sort()).toEqual(['guards-the-record', 'records-regardless']);
    expect(recordHostsEntered(result, recorders)).toEqual(['guards-the-record', 'records-regardless']);

    expect(recordedAssumptionOutcomes(result, recorders)).toEqual(['records-regardless/settle.record-batch']);
  });

  it('is reported for neither host when the run is not in review mode', async () => {
    const createMode = makePolicy({ name: 'fixture-create' });
    const result = await walk(harness, 'review-record', createMode, { maxVisits: 4 });
    const recorders = await assumptionRecordSteps(['review-record'], FIXTURES);
    // Outside review mode a gate asked, so both hosts record — the reading is about the mode, not
    // about the step. Without this the assertion above holds for a reading that reports nothing a
    // guarded host does, whatever the mode.
    expect(recordedAssumptionOutcomes(result, recorders)).toEqual([
      'guards-the-record/settle.record-batch',
      'records-regardless/settle.record-batch',
    ]);
  });
});
