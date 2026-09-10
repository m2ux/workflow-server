import { describe, it, expect } from 'vitest';
import {
  DestinationSchema,
  branchKey,
  destinationTargets,
  instanceFan,
  instanceFans,
  isFan,
} from '../src/schema/workflow.schema.js';

/**
 * The parse settles a destination's shape; the load settles its meaning. Every message here is
 * load-bearing for authoring feedback, and each one is probed rather than assumed: the array
 * member's own arity message, the `maxInstances` field message, the union's error map for
 * everything that matches no member far enough to raise a field error, and the strict object's
 * unrecognised-key rejection — which is what tells an author the output key is derived rather
 * than authored.
 */
describe('destination schema — the parse', () => {
  const message = (value: unknown): string => {
    const parsed = DestinationSchema.safeParse(value);
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('expected a parse error');
    return parsed.error.issues.map((i) => i.message).join(' | ');
  };

  const FAN = { activity: 'research-pass', over: 'research_topics', variable: 'research_topic' };

  it('accepts an activity id and the terminal sentinel', () => {
    expect(DestinationSchema.safeParse('assumptions-review').success).toBe(true);
    expect(DestinationSchema.safeParse('__terminal__').success).toBe(true);
  });

  it('accepts a list of two or more members, bare or instance-fan', () => {
    expect(DestinationSchema.safeParse(['research', 'codebase-comprehension']).success).toBe(true);
    expect(DestinationSchema.safeParse(['research', FAN]).success).toBe(true);
  });

  it('accepts a single instance fan, with and without a ceiling', () => {
    expect(DestinationSchema.safeParse(FAN).success).toBe(true);
    expect(DestinationSchema.safeParse({ ...FAN, maxInstances: 3 }).success).toBe(true);
    // Whether instances commit into checkouts of their own is a property of the activity they run,
    // settled by what that activity binds, so no destination field carries it.
    expect(DestinationSchema.safeParse({ ...FAN, isolation: 'worktree' }).success).toBe(false);
  });

  // S2 — a one-element list is a plain destination spelled a second way.
  it('a one-element list renders the array member\'s own arity message', () => {
    expect(message(['research-pass'])).toContain('a fan names at least two members');
  });

  it('an empty list renders the same message — the error map does not suppress it', () => {
    expect(message([])).toContain('a fan names at least two members');
  });

  // S1 — everything that matches no member far enough to surface a field error.
  it('a number renders the union error-map message', () => {
    expect(message(42)).toContain('a destination is an activity id');
  });

  it('a nested list renders the union error-map message', () => {
    expect(message([['a-thing', 'b-thing']])).toContain('a destination is an activity id');
  });

  it('a non-string, non-fan list member renders the union error-map message', () => {
    expect(message(['research', 7])).toContain('a destination is an activity id');
  });

  it('a partial fan object renders the union error-map message, which is why the map enumerates all three required fields', () => {
    const rendered = message({ activity: 'research-pass', over: 'research_topics' });
    expect(rendered).toContain('a destination is an activity id');
    expect(rendered).toContain('activity');
    expect(rendered).toContain('over');
    expect(rendered).toContain('variable');
  });

  // S3 — a ceiling of one is a plain edge spelled a third way.
  it('a declared ceiling of one renders the maxInstances field message, that member having matched furthest', () => {
    expect(message({ ...FAN, maxInstances: 1 })).toContain('a fan admits at least two instances');
  });

  // S5 — the strict object is what tells an author the output key is derived rather than authored.
  it('an unrecognised key is rejected by name', () => {
    expect(message({ ...FAN, unit: 'q' })).toContain('unit');
  });

  // S4 — a bare-word parameter fails the parse, so no load rule is needed for it.
  it('a bare-word parameter fails the parse on the qualified-name message', () => {
    expect(message({ ...FAN, variable: 'topic' })).toContain('qualified snake_case noun phrase');
  });
});

describe('destination derivations', () => {
  const FAN = { activity: 'web-research', over: 'research_topics', variable: 'research_topic' };

  it('destinationTargets flattens every form', () => {
    expect(destinationTargets('assumptions-review')).toEqual(['assumptions-review']);
    expect(destinationTargets(['research', 'codebase-comprehension']))
      .toEqual(['research', 'codebase-comprehension']);
    expect(destinationTargets(FAN)).toEqual(['web-research']);
    expect(destinationTargets(['research', FAN])).toEqual(['research', 'web-research']);
  });

  it('isFan is true for both fan forms and false for a plain destination', () => {
    expect(isFan('assumptions-review')).toBe(false);
    expect(isFan('__terminal__')).toBe(false);
    expect(isFan(['research', 'codebase-comprehension'])).toBe(true);
    expect(isFan(FAN)).toBe(true);
  });

  it('instanceFans returns none, itself, or those among a list\'s members', () => {
    expect(instanceFans('assumptions-review')).toEqual([]);
    expect(instanceFans(['research', 'codebase-comprehension'])).toEqual([]);
    expect(instanceFans(FAN)).toEqual([FAN]);
    expect(instanceFans(['research', FAN])).toEqual([FAN]);
  });

  it('instanceFan answers for the object form alone', () => {
    expect(instanceFan(FAN)).toEqual(FAN);
    expect(instanceFan(['research', FAN])).toBeUndefined();
    expect(instanceFan('assumptions-review')).toBeUndefined();
  });

  // The suffix is what makes the derivation total: `research` is one word and would otherwise need
  // a bare-word exemption entry for every single-word fanned activity id in the corpus.
  it('branchKey is the activity id in snake case with the outputs suffix', () => {
    expect(branchKey('research')).toBe('research_outputs');
    expect(branchKey('codebase-comprehension')).toBe('codebase_comprehension_outputs');
    expect(branchKey('research-pass')).toBe('research_pass_outputs');
  });
});
