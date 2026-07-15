import type { PriceTable } from '../config.js';
import type {
  ActivityUsageEntry,
  SessionFile,
  SessionUsage,
  WorkflowUsageTotal,
} from '../schema/session.schema.js';

/** Native usage relayed by the orchestrator at the next_activity transition seam. */
export interface UsageInput {
  input_tokens: number;
  output_tokens: number;
  total_tokens?: number;
  cache_read_tokens?: number;
  cache_write_5m_tokens?: number;
  cache_write_1h_tokens?: number;
  model?: string;
}

const MTok = 1_000_000;

/** Empty workflow total for incremental roll-up initialization. */
export function emptyWorkflowTotal(): WorkflowUsageTotal {
  return { input_tokens: 0, output_tokens: 0, total_tokens: 0, cost_usd: 0 };
}

/** Derive total_tokens from input + output. */
export function deriveTotalTokens(usage: UsageInput): number {
  return usage.input_tokens + usage.output_tokens;
}

/**
 * Estimate USD cost from the price table with derived cache multipliers
 * (5m write ×1.25, 1h write ×2, cache read ×0.1). Unknown model → null.
 */
export function estimateCost(
  usage: UsageInput,
  priceTable: PriceTable,
): number | null {
  if (!usage.model) return null;
  const rates = priceTable[usage.model];
  if (!rates) return null;

  let cost =
    usage.input_tokens * rates.input +
    usage.output_tokens * rates.output;

  if (usage.cache_read_tokens) {
    cost += usage.cache_read_tokens * rates.input * 0.1;
  }
  if (usage.cache_write_5m_tokens) {
    cost += usage.cache_write_5m_tokens * rates.input * 1.25;
  }
  if (usage.cache_write_1h_tokens) {
    cost += usage.cache_write_1h_tokens * rates.input * 2;
  }

  return cost / MTok;
}

function sumOptional(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined && b === undefined) return undefined;
  return (a ?? 0) + (b ?? 0);
}

/** Merge two activity usage entries (re-entered activities accumulate). */
export function mergeActivityUsage(
  existing: ActivityUsageEntry,
  incoming: ActivityUsageEntry,
): ActivityUsageEntry {
  return {
    input_tokens: existing.input_tokens + incoming.input_tokens,
    output_tokens: existing.output_tokens + incoming.output_tokens,
    total_tokens: existing.total_tokens + incoming.total_tokens,
    cache_read_tokens: sumOptional(existing.cache_read_tokens, incoming.cache_read_tokens),
    cache_write_5m_tokens: sumOptional(existing.cache_write_5m_tokens, incoming.cache_write_5m_tokens),
    cache_write_1h_tokens: sumOptional(existing.cache_write_1h_tokens, incoming.cache_write_1h_tokens),
    model: incoming.model ?? existing.model,
    cost_usd:
      existing.cost_usd !== null && incoming.cost_usd !== null
        ? existing.cost_usd + incoming.cost_usd
        : null,
    priceTableVersion: incoming.priceTableVersion ?? existing.priceTableVersion,
  };
}

/** Add an activity entry into the running workflow total. */
export function addToWorkflowTotal(
  total: WorkflowUsageTotal,
  entry: Pick<ActivityUsageEntry, 'input_tokens' | 'output_tokens' | 'total_tokens' | 'cost_usd'>,
): WorkflowUsageTotal {
  return {
    input_tokens: total.input_tokens + entry.input_tokens,
    output_tokens: total.output_tokens + entry.output_tokens,
    total_tokens: total.total_tokens + entry.total_tokens,
    cost_usd:
      total.cost_usd !== null && entry.cost_usd !== null
        ? total.cost_usd + entry.cost_usd
        : null,
  };
}

/**
 * Child-inclusive per-workflow total by pure in-tree traversal of embedded
 * child SessionFile state under triggeredWorkflows.
 */
export function sumUsageTree(state: SessionFile): WorkflowUsageTotal {
  const base = state.usage?.workflowTotal ?? emptyWorkflowTotal();
  let result = { ...base };
  for (const child of state.triggeredWorkflows) {
    if (child.state) {
      result = addToWorkflowTotal(result, sumUsageTree(child.state));
    }
  }
  return result;
}

/** Build a per-activity usage entry from relayed input and config. */
export function buildActivityUsageEntry(
  usage: UsageInput,
  priceTable: PriceTable,
  priceTableVersion: string,
): ActivityUsageEntry {
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: deriveTotalTokens(usage),
    cost_usd: estimateCost(usage, priceTable),
    priceTableVersion,
    ...(usage.model ? { model: usage.model } : {}),
    ...(usage.cache_read_tokens !== undefined ? { cache_read_tokens: usage.cache_read_tokens } : {}),
    ...(usage.cache_write_5m_tokens !== undefined ? { cache_write_5m_tokens: usage.cache_write_5m_tokens } : {}),
    ...(usage.cache_write_1h_tokens !== undefined ? { cache_write_1h_tokens: usage.cache_write_1h_tokens } : {}),
  };
}

/** Record usage for the exited activity into session state. */
export function recordActivityUsage(
  draft: SessionFile,
  activityId: string,
  usage: UsageInput,
  priceTable: PriceTable,
  priceTableVersion: string,
): void {
  const entry = buildActivityUsageEntry(usage, priceTable, priceTableVersion);
  const now = new Date().toISOString();

  if (!draft.usage) {
    draft.usage = { perActivity: {}, workflowTotal: emptyWorkflowTotal() };
  }

  const existing = draft.usage.perActivity[activityId];
  draft.usage.perActivity[activityId] = existing
    ? mergeActivityUsage(existing, entry)
    : entry;

  draft.usage.workflowTotal = addToWorkflowTotal(draft.usage.workflowTotal, entry);

  const { input_tokens, output_tokens, total_tokens, cost_usd, priceTableVersion: recordedVersion, ...optional } = entry;
  draft.history.push({
    timestamp: now,
    type: 'usage_recorded',
    activity: activityId,
    data: {
      activityId,
      input_tokens,
      output_tokens,
      total_tokens,
      cost_usd,
      priceTableVersion: recordedVersion,
      ...optional,
    },
  });
}

/** Fold child workflow usage into the parent total at completion. */
export function finalizeUsageTree(draft: SessionFile): void {
  if (!draft.usage) return;
  draft.usage.workflowTotal = sumUsageTree(draft);
}
