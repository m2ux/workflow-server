import { describe, it, expect } from 'vitest';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import {
  batchActivities,
  batchBound,
  batchState,
  batchRefusal,
  deliveredChars,
} from '../src/utils/batch.js';
import {
  DEFAULT_BATCH_HEADROOM_FRACTION,
  DEFAULT_BATCH_MAX_ACTIVITIES,
  DEFAULT_BUNDLE_CHARS_PER_TOKEN,
} from '../src/config.js';

/**
 * The batch bound is total over the history it reads.
 *
 * Every function here derives its answer from `state.history`, which is the one input the server does
 * not author: sessions sealed by older builds carry events this build never wrote, migration output
 * carries fields it no longer sets, and a hand-edited or truncated file carries whatever it carries.
 * A `deliveredChars` that throws on an event with no `chars` does not fail the delivery it was asked
 * about — it fails `get_activity`, on a session whose only fault is being old.
 *
 * So the contract asserted here is narrow and absolute: over any of these shapes each function
 * RETURNS — a number, an array, a verdict — and none throws. What it returns for a nonsense history is
 * deliberately not pinned; there is no right answer to pin. That it answers at all is the invariant,
 * and it is the one a malformed session actually depends on.
 */

const POLICY = {
  headroomFraction: DEFAULT_BATCH_HEADROOM_FRACTION,
  maxActivities: DEFAULT_BATCH_MAX_ACTIVITIES,
  charsPerToken: DEFAULT_BUNDLE_CHARS_PER_TOKEN,
};

const SCOPE = 'worker-1';

function base(): SessionFile {
  return createInitialSessionFile({
    sessionIndex: 'AAAAAA',
    workflowId: 'work-package',
    workflowVersion: '1.0.0',
    agentId: 'orchestrator',
  });
}

/** A session whose history is replaced wholesale by `history`, whatever shape that is. */
function withHistory(history: unknown): SessionFile {
  const state = base() as unknown as Record<string, unknown>;
  state.history = history;
  return state as unknown as SessionFile;
}

/**
 * The shape the readers actually key on: the scope is `data.agentId`, the activity id is `activity` on
 * the event, and the size is `data.chars`. Writing the fixture from the reader rather than from memory
 * is what makes the table exercise anything — a fixture with the fields one level too high reads as
 * "some other scope" and every entry is skipped, so every shape would pass having tested nothing.
 */
const WELL_FORMED = {
  type: 'activity_dispatched',
  activity: 'analysis',
  timestamp: '2026-08-05T00:00:00.000Z',
  data: { agentId: SCOPE, chars: 1000 },
};

/** `WELL_FORMED` with `data` merged over, for the shapes that vary one field inside it. */
const withData = (data: Record<string, unknown>): unknown =>
  ({ ...WELL_FORMED, data: { ...WELL_FORMED.data, ...data } });

/**
 * Each entry is one history shape. The names say what is wrong with it; the point of the table is its
 * breadth, since the fault classes a sealed session can present are not enumerable in advance.
 */
const SHAPES: ReadonlyArray<readonly [string, unknown]> = [
  // The container itself.
  ['history absent', undefined],
  ['history null', null],
  ['history an empty array', []],
  ['history an object, not an array', { 0: WELL_FORMED }],
  ['history a string', 'activity_dispatched'],
  ['history a number', 7],
  // Entries that are not events.
  ['an entry of null', [null]],
  ['an entry of undefined', [undefined]],
  ['an entry of a string', ['activity_dispatched']],
  ['an entry of a number', [42]],
  ['an entry of an array', [[WELL_FORMED]]],
  ['an entry with no type', [{ activity: 'analysis', data: { agentId: SCOPE, chars: 10 } }]],
  ['an entry whose type is not a string', [{ ...WELL_FORMED, type: 12 }]],
  ['an unknown event type', [{ ...WELL_FORMED, type: 'activity_teleported' }]],
  // The data envelope, which every reader dereferences.
  ['no data envelope', [{ type: 'activity_dispatched', activity: 'analysis' }]],
  ['data null', [{ ...WELL_FORMED, data: null }]],
  ['data a string', [{ ...WELL_FORMED, data: 'agentId=worker-1' }]],
  // Fields a legacy or migrated event may not carry.
  ['no agentId', [{ ...WELL_FORMED, data: { chars: 10 } }]],
  ['agentId null', [withData({ agentId: null })]],
  ['agentId a number', [withData({ agentId: 3 })]],
  ['no activity id on the event', [{ type: 'activity_dispatched', data: { agentId: SCOPE, chars: 10 } }]],
  ['activity null', [{ ...WELL_FORMED, activity: null }]],
  ['activity an object', [{ ...WELL_FORMED, activity: { id: 'analysis' } }]],
  ['no chars', [{ ...WELL_FORMED, data: { agentId: SCOPE } }]],
  ['chars null', [withData({ chars: null })]],
  ['chars a string', [withData({ chars: '1000' })]],
  ['chars NaN', [withData({ chars: Number.NaN })]],
  ['chars Infinity', [withData({ chars: Number.POSITIVE_INFINITY })]],
  ['chars negative', [withData({ chars: -1000 })]],
  // Shapes a real migration or a partial write leaves behind.
  ['a redelivery with no prior dispatch', [{ ...WELL_FORMED, type: 'activity_redelivered' }]],
  ['a well-formed event after a broken one', [null, WELL_FORMED]],
  ['a broken event after a well-formed one', [WELL_FORMED, null]],
  ['the same activity delivered twice', [WELL_FORMED, WELL_FORMED]],
];

describe('the batch bound answers over any history it is handed', () => {
  const bound = batchBound(200_000, POLICY);

  it.each(SHAPES.map(([name, history]) => ({ name, history })))(
    'returns rather than throws: $name',
    ({ history }) => {
      const state = withHistory(history);

      const activities = batchActivities(state, SCOPE);
      expect(Array.isArray(activities)).toBe(true);
      // Every member is an activity id a later comparison will treat as a string.
      for (const id of activities) expect(typeof id).toBe('string');

      const chars = deliveredChars(state, SCOPE);
      expect(typeof chars).toBe('number');
      // A budget comparison against NaN is silently false in both directions, which would read as
      // "inside the budget" no matter how much had been delivered.
      expect(Number.isFinite(chars)).toBe(true);

      const reading = batchState(state, SCOPE, bound);
      expect(typeof reading.mayContinue).toBe('boolean');

      // `undefined` is the deliver verdict, so this asserts a verdict was reached, not which one.
      expect(() => batchRefusal(state, SCOPE, 'analysis', bound)).not.toThrow();
    },
  );

  it('reads the fixture shape, so the table above is not vacuous', () => {
    // The guard on the whole file. Every shape below is a variation on `WELL_FORMED`, so if the fields
    // sat at the wrong level the readers would skip all of them as belonging to another scope, every
    // case would pass, and the suite would report 33 green tests having exercised nothing. This
    // asserts the baseline is SEEN — the one assertion that has to fail for the rest to mean anything.
    const state = withHistory([WELL_FORMED]);
    expect(batchActivities(state, SCOPE)).toEqual(['analysis']);
    expect(deliveredChars(state, SCOPE)).toBe(1000);
  });

  it('does not let one poisoned size refuse the rest of the session', () => {
    // NaN passes a `typeof` test and then compares false against the budget from both sides, so a
    // scope carrying one would read as past its budget for the remainder of the walk.
    const state = withHistory([withData({ chars: Number.NaN }), WELL_FORMED]);
    expect(deliveredChars(state, SCOPE)).toBe(1000);
    expect(batchState(state, SCOPE, bound).mayContinue).toBe(true);
  });

  it('covers the shape classes a sealed session can present', () => {
    // The count is quoted in the PR and the implementation record. Asserting it here is what stops
    // that figure becoming a claim with nothing behind it.
    expect(SHAPES).toHaveLength(33);
    expect(new Set(SHAPES.map(([name]) => name)).size).toBe(SHAPES.length);
  });
});
