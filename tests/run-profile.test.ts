import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseTranscript, profileRun, sumUsage, type TranscriptRecord } from '../scripts/run-profile.js';

const FIXTURES = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures/run-profile');
const RUN = join(FIXTURES, 'profiled-run.jsonl');

function record(requestId: string, usage: Record<string, number>, uuid = requestId): TranscriptRecord {
  return { type: 'assistant', uuid, requestId, message: { role: 'assistant', usage } };
}

describe('sumUsage — a usage figure belongs to a response, not to a record', () => {
  it('counts a response split across several records once', () => {
    const usage = { cache_creation_input_tokens: 14578, cache_read_input_tokens: 51496, input_tokens: 2, output_tokens: 2 };
    const split = [
      record('req-1', { ...usage }, 'block-1'),
      record('req-1', { ...usage }, 'block-2'),
      record('req-1', { ...usage, output_tokens: 6087 }, 'block-3'),
    ];

    const totals = sumUsage(split);

    expect(totals.responses).toBe(1);
    expect(totals.records).toBe(3);
    expect(totals.cacheCreationTokens).toBe(14578);
    expect(totals.cacheReadTokens).toBe(51496);
    // The terminal record carries the final count; the streaming partials before it report single digits.
    expect(totals.outputTokens).toBe(6087);
  });

  it('reports the record-summed figure and the factor it exceeds the total by', () => {
    const usage = { cache_creation_input_tokens: 1000, cache_read_input_tokens: 200, input_tokens: 2, output_tokens: 10 };
    const totals = sumUsage([
      record('req-1', { ...usage }, 'block-1'),
      record('req-1', { ...usage }, 'block-2'),
    ]);

    expect(totals.cacheCreationTokens).toBe(1000);
    expect(totals.recordSummed.cacheCreationTokens).toBe(2000);
    expect(totals.recordSummed.cacheCreationRatio).toBe(2);
  });

  it('adds responses to each other', () => {
    const totals = sumUsage([
      record('req-1', { cache_creation_input_tokens: 1000, output_tokens: 5 }),
      record('req-1', { cache_creation_input_tokens: 1000, output_tokens: 60 }, 'req-1-b'),
      record('req-2', { cache_creation_input_tokens: 250, output_tokens: 40 }),
    ]);

    expect(totals.responses).toBe(2);
    expect(totals.cacheCreationTokens).toBe(1250);
    expect(totals.outputTokens).toBe(100);
  });

  it('treats a usage-bearing record with no request id as its own response', () => {
    const totals = sumUsage([
      { type: 'assistant', uuid: 'lone-a', message: { usage: { cache_creation_input_tokens: 700 } } },
      { type: 'assistant', uuid: 'lone-b', message: { usage: { cache_creation_input_tokens: 300 } } },
    ]);

    expect(totals.responses).toBe(2);
    expect(totals.cacheCreationTokens).toBe(1000);
  });

  it('ignores records that carry no usage', () => {
    const totals = sumUsage([
      { type: 'user', uuid: 'u0', message: { role: 'user', content: 'go' } },
      record('req-1', { cache_creation_input_tokens: 42 }),
    ]);

    expect(totals.responses).toBe(1);
    expect(totals.records).toBe(1);
    expect(totals.cacheCreationTokens).toBe(42);
  });
});

describe('parseTranscript', () => {
  it('skips a trailing partial line, which a live transcript can end on', () => {
    const records = parseTranscript('{"uuid":"a"}\n{"uuid":"b"}\n{"uuid":"c",');

    expect(records.map((r) => r.uuid)).toEqual(['a', 'b']);
  });
});

describe('profileRun', () => {
  const profile = profileRun(RUN);

  it('places the startup milestones on the timeline', () => {
    expect(profile.milestoneOffsetsMin).toEqual({
      startSession: 0.5,
      firstWorker: 1,
      firstCheckpoint: 4,
      clientFirstActivity: 3,
      openingComplete: 6,
    });
    expect(profile.window.closedBy).toBe('openingComplete');
    expect(profile.window.minutes).toBe(6);
  });

  it('counts the wait between putting a question to the user and the answer', () => {
    expect(profile.checkpointWaitMin).toBe(1);
  });

  it('counts each worker response once and attributes the dispatch', () => {
    expect(profile.workers).toHaveLength(1);
    const worker = profile.workers[0]!;
    expect(worker.description).toBe('discover-session worker');
    expect(worker.dispatchOffsetMin).toBe(1);
    // Three records repeating one 10,000-token response, plus a second response of 3,000.
    expect(worker.usage.cacheCreationTokens).toBe(13000);
    expect(worker.usage.recordSummed.cacheCreationTokens).toBe(33000);
    expect(worker.usage.outputTokens).toBe(750);
    expect(worker.resultCharsByTool['mcp__workflow-server__get_activity']).toBe(10);
  });

  it('holds the window to the workers and turns inside it', () => {
    // The second worker is dispatched four minutes after the window closes.
    expect(profile.workers.map((w) => w.agentId)).toEqual(['agent-w1']);
    expect(profile.workerTotals.cacheCreationTokens).toBe(13000);
    expect(profile.main.cacheCreationTokens).toBe(8300);
    expect(profile.main.outputTokens).toBe(870);
  });

  it('reports the whole run when asked for it', () => {
    const full = profileRun(RUN, { window: 'full' });

    expect(full.window.closedBy).toBe('transcript-end');
    expect(full.workers).toHaveLength(2);
    expect(full.workerTotals.cacheCreationTokens).toBe(90000);
    expect(full.main.cacheCreationTokens).toBe(98300);
  });

  it('reads the opening activity off the client session rather than being told it', () => {
    expect(profile.openingActivity).toBe('start-work-package');
  });

  it('is not fooled by a second meta session created before the client workflow is dispatched', () => {
    // 8608448b in the corpus does this: the run abandons its first meta session and starts another.
    const restarted = profileRun(join(FIXTURES, 'restarted-meta-run.jsonl'));

    expect(restarted.openingActivity).toBe('intake-and-context');
    expect(restarted.milestoneOffsetsMin.clientFirstActivity).toBe(4);
    expect(restarted.milestoneOffsetsMin.openingComplete).toBe(6);
  });
});
