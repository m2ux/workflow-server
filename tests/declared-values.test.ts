import { describe, expect, it } from 'vitest';
import { findingsForValueSet } from '../guards/check-declared-values.js';

const REACH = ['home', 'graph', 'hand-derived', 'none', 'unanswerable'];

describe('declared values', () => {
  it('flags a value no step records', () => {
    const findings = findingsForValueSet('reach', ['ready', 'refused'], ['Record `ready` and stop.']);
    expect(findings.map((finding) => finding.check)).toEqual(['value-unassigned']);
    expect(findings[0]?.detail).toContain('refused');
  });

  it('flags a later step that settles a sibling and never names the earlier value', () => {
    const steps = [
      'Record reach `unanswerable` where the member has neither instrument.',
      'Set the reach to `graph`, `hand-derived`, or `none`.',
    ];
    const findings = findingsForValueSet('reach', REACH, steps);
    expect(findings.filter((finding) => finding.check === 'value-reassigned').map((finding) => finding.detail)).toEqual([
      "'unanswerable' is recorded and a later step settles the same field to 'graph' without naming 'unanswerable'",
    ]);
  });

  it('passes a later step that names the value it leaves standing', () => {
    const steps = [
      'Record the home member with reach `home`.',
      'Record reach `unanswerable` where the member has neither instrument. The member recorded `home` is not this case.',
      'For a member with an instrument, set the reach to `graph`, `hand-derived`, or `none`. A member with neither keeps `unanswerable`. The member recorded `home` keeps that reach.',
    ];
    expect(findingsForValueSet('reach', REACH, steps)).toEqual([]);
  });
});
