/**
 * What a step gate evaluates to at the moment its activity is delivered, and when that has no answer.
 * The delivery layer bundles a gated step only on a `true`, so the `undefined` cases below are the
 * ones that keep a step on its `get_technique` fetch.
 */
import { describe, it, expect } from 'vitest';
import { bothGates, gateAnswer, unboundPositiveReads, variablesWrittenIn } from '../src/utils/gate-liveness.js';
import type { ProducerSite } from '../src/utils/binding-provenance.js';
import type { Condition } from '../src/schema/condition.schema.js';

const NOTHING_WRITTEN: ReadonlySet<string> = new Set();

const answer = (
  gate: { when?: string; condition?: Condition },
  variables: Record<string, unknown>,
  writtenInActivity: ReadonlySet<string> = NOTHING_WRITTEN,
): boolean | undefined => gateAnswer({ ...gate, variables, writtenInActivity });

describe('gateAnswer', () => {
  it('answers true for a step with no gate', () => {
    expect(answer({}, {})).toBe(true);
  });

  it('evaluates a when expression whose variables are all bound', () => {
    expect(answer({ when: 'is_review_mode == true' }, { is_review_mode: true })).toBe(true);
    expect(answer({ when: 'is_review_mode == true' }, { is_review_mode: false })).toBe(false);
    expect(answer({ when: 'rounds > 0' }, { rounds: 2 })).toBe(true);
    expect(answer({ when: '!skip_audit' }, { skip_audit: false })).toBe(true);
  });

  it('has no answer for a variable that is not in the bag', () => {
    // Both reference evaluators return false here, which conflates "unbound" with "false". A gate on
    // a variable nothing has produced is unanswered, not negative.
    expect(answer({ when: 'is_review_mode == true' }, {})).toBeUndefined();
    expect(answer({ when: 'a == true && b == true' }, { a: true })).toBeUndefined();
  });

  it('has no answer for a variable the activity itself produces', () => {
    expect(answer({ when: 'platform == "github"' }, { platform: 'github' }, new Set(['platform'])))
      .toBeUndefined();
    // A dotted read is unanswered when the activity writes the bag entry it reads into.
    expect(answer({ when: 'plan.approved == true' }, { plan: { approved: true } }, new Set(['plan'])))
      .toBeUndefined();
  });

  it('has no answer for an unparseable when expression', () => {
    expect(answer({ when: 'a == && b' }, { a: true, b: true })).toBeUndefined();
  });

  it('answers an exists condition on a variable that is absent', () => {
    const exists: Condition = { type: 'simple', variable: 'issue_url', operator: 'exists' };
    expect(answer({ condition: exists }, {})).toBe(false);
    expect(answer({ condition: exists }, { issue_url: 'https://example.test/1' })).toBe(true);
    // Still unanswered when this activity is the thing that produces it.
    expect(answer({ condition: exists }, {}, new Set(['issue_url']))).toBeUndefined();
  });

  it('combines when and condition under and-semantics', () => {
    const cond: Condition = { type: 'simple', variable: 'rounds', operator: '>', value: 0 };
    expect(answer({ when: 'a == true', condition: cond }, { a: true, rounds: 1 })).toBe(true);
    expect(answer({ when: 'a == true', condition: cond }, { a: true, rounds: 0 })).toBe(false);
    expect(answer({ when: 'a == true', condition: cond }, { rounds: 1 })).toBeUndefined();
  });
});

describe('bothGates', () => {
  it('lets one false limb decide, and one unanswered limb withhold', () => {
    expect(bothGates(true, true)).toBe(true);
    expect(bothGates(false, true)).toBe(false);
    expect(bothGates(true, false)).toBe(false);
    // A false enclosing gate settles the body even where the body's own gate is unanswered.
    expect(bothGates(false, undefined)).toBe(false);
    expect(bothGates(undefined, true)).toBeUndefined();
    expect(bothGates(true, undefined)).toBeUndefined();
  });
});

describe('variablesWrittenIn', () => {
  const site = (name: string, activityId: string, via: ProducerSite['via']): ProducerSite =>
    ({ name, via, stepId: 's', activityId, ordinal: 0 });

  it('takes only the producer sites inside the named activity', () => {
    const producers = [
      site('platform', 'intake', 'output'),
      site('branch_prefix', 'intake', 'remap'),
      site('review_mode', 'triage', 'checkpoint'),
    ];
    expect(variablesWrittenIn(producers, 'intake')).toEqual(new Set(['platform', 'branch_prefix']));
    expect(variablesWrittenIn(producers, 'triage')).toEqual(new Set(['review_mode']));
    expect(variablesWrittenIn(producers, 'absent')).toEqual(new Set());
  });

  it('reduces a dotted producer name to the bag entry it writes', () => {
    expect(variablesWrittenIn([site('plan.tasks', 'intake', 'output')], 'intake'))
      .toEqual(new Set(['plan']));
  });
});

describe('unboundPositiveReads', () => {
  const bag = { platform: 'jira' };

  it('names a variable an equality gate needs and the bag lacks', () => {
    expect(unboundPositiveReads("issue_platform == 'jira'", undefined, bag)).toEqual(['issue_platform']);
  });

  it('says nothing when the bag has the value', () => {
    expect(unboundPositiveReads("platform == 'jira'", undefined, bag)).toEqual([]);
  });

  it('leaves out a negative comparison, which absence answers', () => {
    expect(unboundPositiveReads('is_review_mode != true', undefined, bag)).toEqual([]);
  });

  it('leaves out presence operators, which absence answers', () => {
    const condition = { type: 'simple', variable: 'branch_name', operator: 'notExists' } as unknown as Condition;
    expect(unboundPositiveReads(undefined, condition, bag)).toEqual([]);
  });

  it('reaches into both arms of a conjunction, and reduces a dotted read to its bag entry', () => {
    const found = unboundPositiveReads('plan.tasks == 3 && needs_issue_creation == true', undefined, bag);
    expect(found.sort()).toEqual(['needs_issue_creation', 'plan']);
  });

  it('walks a structured and/or tree', () => {
    const condition = {
      type: 'and',
      conditions: [
        { type: 'simple', variable: 'issue_platform', operator: '==', value: 'jira' },
        { type: 'or', conditions: [{ type: 'simple', variable: 'jira_project', operator: '==', value: 'selected' }] },
      ],
    } as unknown as Condition;
    expect(unboundPositiveReads(undefined, condition, bag).sort()).toEqual(['issue_platform', 'jira_project']);
  });
});
