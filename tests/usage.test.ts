import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRICE_TABLE,
  DEFAULT_PRICE_TABLE_VERSION,
} from '../src/config.js';
import type { SessionFile } from '../src/schema/session.schema.js';
import {
  addToWorkflowTotal,
  buildActivityUsageEntry,
  deriveTotalTokens,
  emptyWorkflowTotal,
  estimateCost,
  mergeActivityUsage,
  recordActivityUsage,
  sumUsageTree,
} from '../src/utils/usage.js';

describe('estimateCost', () => {
  it('computes base input/output cost per the price table (PR233-TC-05)', () => {
    const cost = estimateCost(
      { input_tokens: 1_000_000, output_tokens: 1_000_000, model: 'claude-sonnet-5' },
      DEFAULT_PRICE_TABLE,
    );
    expect(cost).toBe(12);
  });

  it('derives cache rates from base input (PR233-TC-06)', () => {
    const cost = estimateCost(
      {
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 1_000_000,
        cache_write_5m_tokens: 1_000_000,
        cache_write_1h_tokens: 1_000_000,
        model: 'claude-sonnet-5',
      },
      DEFAULT_PRICE_TABLE,
    );
    // read: 2 * 0.1 = 0.2, 5m: 2 * 1.25 = 2.5, 1h: 2 * 2 = 4 → 6.7
    expect(cost).toBeCloseTo(6.7);
  });

  it('returns null for a model absent from the price table (PR233-TC-07)', () => {
    const cost = estimateCost(
      { input_tokens: 100, output_tokens: 100, model: 'unknown-model' },
      DEFAULT_PRICE_TABLE,
    );
    expect(cost).toBeNull();
  });
});

describe('deriveTotalTokens', () => {
  it('derives input + output regardless of relayed total_tokens', () => {
    expect(
      deriveTotalTokens({ input_tokens: 100, output_tokens: 50, total_tokens: 999 }),
    ).toBe(150);
  });
});

describe('sumUsageTree', () => {
  function session(usage?: SessionFile['usage'], children: SessionFile[] = []): SessionFile {
    return {
      schemaVersion: 1,
      sessionIndex: 'ABCDEF',
      workflowId: 'work-package',
      workflowVersion: '3.11.0',
      agentId: 'worker',
      seq: 0,
      ts: 0,
      startedAt: '2026-01-01T00:00:00.000Z',
      currentActivity: '',
      currentTechnique: '',
      condition: '',
      variables: {},
      completedActivities: [],
      skippedActivities: [],
      checkpointResponses: {},
      history: [],
      status: 'running',
      triggeredWorkflows: children.map((state, i) => ({
        workflowId: 'child',
        sessionIndex: 'BBBBBB',
        triggeredAt: '2026-01-01T00:00:00.000Z',
        triggeredFrom: { activityId: 'dispatch' },
        status: 'completed' as const,
        state,
      })),
      ...(usage ? { usage } : {}),
    };
  }

  it('sums parent + nested child workflowTotal (PR233-TC-08)', () => {
    const parentTotal = { input_tokens: 100, output_tokens: 50, total_tokens: 150, cost_usd: 1 };
    const childTotal = { input_tokens: 200, output_tokens: 100, total_tokens: 300, cost_usd: 2 };
    const child = session({ perActivity: {}, workflowTotal: childTotal });
    const parent = session({ perActivity: {}, workflowTotal: parentTotal }, [child]);
    expect(sumUsageTree(parent)).toEqual(addToWorkflowTotal(parentTotal, childTotal));
  });

  it('returns empty total when usage is absent', () => {
    expect(sumUsageTree(session())).toEqual(emptyWorkflowTotal());
  });
});

describe('recordActivityUsage', () => {
  it('builds stamped activity entries with price table version', () => {
    const entry = buildActivityUsageEntry(
      { input_tokens: 1000, output_tokens: 500, model: 'claude-sonnet-5' },
      DEFAULT_PRICE_TABLE,
      DEFAULT_PRICE_TABLE_VERSION,
    );
    expect(entry.priceTableVersion).toBe(DEFAULT_PRICE_TABLE_VERSION);
    expect(entry.cost_usd).not.toBeNull();
  });

  it('merges re-entered activity usage', () => {
    const draft: SessionFile = {
      schemaVersion: 1,
      sessionIndex: 'ABCDEF',
      workflowId: 'work-package',
      workflowVersion: '3.11.0',
      agentId: 'worker',
      seq: 0,
      ts: 0,
      startedAt: '2026-01-01T00:00:00.000Z',
      currentActivity: 'implement',
      currentTechnique: '',
      condition: '',
      variables: {},
      completedActivities: [],
      skippedActivities: [],
      checkpointResponses: {},
      history: [],
      status: 'running',
      triggeredWorkflows: [],
    };
    recordActivityUsage(
      draft,
      'implement',
      { input_tokens: 100, output_tokens: 50, model: 'claude-sonnet-5' },
      DEFAULT_PRICE_TABLE,
      DEFAULT_PRICE_TABLE_VERSION,
    );
    recordActivityUsage(
      draft,
      'implement',
      { input_tokens: 200, output_tokens: 100, model: 'claude-sonnet-5' },
      DEFAULT_PRICE_TABLE,
      DEFAULT_PRICE_TABLE_VERSION,
    );
    expect(draft.usage?.perActivity.implement.input_tokens).toBe(300);
    expect(draft.history.filter((e) => e.type === 'usage_recorded')).toHaveLength(2);
  });
});

describe('mergeActivityUsage', () => {
  it('propagates null cost when either side is unpriced', () => {
    const merged = mergeActivityUsage(
      {
        input_tokens: 1,
        output_tokens: 1,
        total_tokens: 2,
        cost_usd: 0.01,
        priceTableVersion: 'v1',
      },
      {
        input_tokens: 1,
        output_tokens: 1,
        total_tokens: 2,
        cost_usd: null,
        model: 'unknown',
      },
    );
    expect(merged.cost_usd).toBeNull();
  });
});
