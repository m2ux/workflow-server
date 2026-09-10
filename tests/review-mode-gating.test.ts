import { describe, it, expect } from 'vitest';
import {
  ACCEPTED_HEADLESS_AUTO_ADVANCE,
  reachableInReview,
  type ActivityDef,
} from '../scripts/check-review-mode-gating.js';
import type { Graph } from '../src/schema/workflow.schema.js';

/**
 * The corpus is held at zero by the `review-mode-gating` guard, which also reports an acceptance
 * matching no checkpoint. What the guard does not read is whether an acceptance states why it is
 * safe, so that is what this asserts.
 */
describe('review-mode-gating acceptances', () => {
  it('gives every acceptance a non-empty reason', () => {
    const reasonless = Object.entries(ACCEPTED_HEADLESS_AUTO_ADVANCE)
      .filter(([, reason]) => reason.trim().length === 0)
      .map(([key]) => key);
    expect(reasonless).toEqual([]);
  });
});

/**
 * This guard declares the graph's shape itself and parses raw YAML, so the fan load rules cannot
 * protect it. Unflattened, its lookup on a list or an object is undefined and the whole subtree
 * beyond a fan drops out of the set the guard exists for — it would pass because it stopped
 * looking, which for a fan between the initial activity and the rest of the graph is most of the
 * workflow.
 */
describe('review-mode reachability past a fan', () => {
  const act = (id: string, ...exits: string[]): ActivityDef => ({
    id,
    exits: exits.map((e, i) => ({ id: e, isDefault: i === 0 })),
  });
  const activities = new Map<string, ActivityDef>([
    ['plan-prepare', act('plan-prepare', 'done')],
    ['survey-pass', act('survey-pass', 'surveyed')],
    ['dependency-review', act('dependency-review', 'reviewed')],
    ['probe-unit', act('probe-unit', 'probed')],
    ['combine-findings', act('combine-findings', 'settled')],
    ['report-findings', act('report-findings', 'reported')],
  ]);

  it('keeps every branch of a list fan and the subtree beyond it in the set', () => {
    const graph: Graph = {
      'plan-prepare': { done: ['survey-pass', 'dependency-review'] },
      'survey-pass': { surveyed: 'combine-findings' },
      'dependency-review': { reviewed: 'combine-findings' },
      'combine-findings': { settled: 'report-findings' },
    };
    expect(reachableInReview('plan-prepare', activities, graph)).toEqual(new Set([
      'plan-prepare', 'survey-pass', 'dependency-review', 'combine-findings', 'report-findings',
    ]));
  });

  it('keeps an instance fan\'s activity and the subtree beyond it in the set', () => {
    const graph: Graph = {
      'plan-prepare': { done: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' } },
      'probe-unit': { probed: 'combine-findings' },
      'combine-findings': { settled: 'report-findings' },
    };
    expect(reachableInReview('plan-prepare', activities, graph)).toEqual(new Set([
      'plan-prepare', 'probe-unit', 'combine-findings', 'report-findings',
    ]));
  });
});
