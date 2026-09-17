import { describe, it, expect } from 'vitest';
import {
  checkCall,
  describedCalls,
  registeredTools,
  splitArguments,
  type ToolParameters,
} from '../guards/check-tool-call-shape.js';

/**
 * The guard measures described calls against the schemas the server registers, so these fix the two
 * halves separately: what the parser recognises in prose, and what the comparison owes a schema.
 * The inventory half is checked against the live registrations, because a guard reading an inventory
 * that has drifted from the server reports on a contract nobody has.
 */
const TOOLS = new Map<string, ToolParameters>([
  ['next_activity', {
    declared: new Set(['session_index', 'activity_id', 'from_activity', 'exit', 'step_manifest']),
    required: new Set(['session_index', 'activity_id']),
  }],
  ['record_usage', {
    declared: new Set(['session_index', 'activity', 'usage', 'basis', 'agent_id']),
    required: new Set(['session_index', 'activity', 'usage', 'basis']),
  }],
  ['health_check', { declared: new Set(), required: new Set() }],
]);

const one = (body: string) => describedCalls(body, TOOLS)[0]!;
const findings = (body: string) => describedCalls(body, TOOLS)
  .flatMap((call) => checkCall(call, TOOLS.get(call.tool)!, 'site'));

describe('splitArguments', () => {
  it('splits on the commas between arguments', () => {
    expect(splitArguments('session_index, activity_id, exit')).toEqual(['session_index', 'activity_id', 'exit']);
  });

  it('keeps a braced stub, an angle-bracketed placeholder and a quoted literal whole', () => {
    expect(splitArguments('session_index: {child_session_index}, activity_id: <the one, just completed>, exit: "a, b"'))
      .toEqual(['session_index: {child_session_index}', 'activity_id: <the one, just completed>', 'exit: "a, b"']);
  });

  it('reads an apostrophe inside a placeholder as prose rather than a quote', () => {
    expect(splitArguments("from_activity: <that branch's entry>, exit: <that branch's exit>"))
      .toEqual(["from_activity: <that branch's entry>", "exit: <that branch's exit>"]);
  });
});

describe('describedCalls', () => {
  it('names the arguments a call passes, bare or bound', () => {
    expect(one('Call `next_activity { session_index, activity_id, from_activity: exiting_activity }`.').named)
      .toEqual(['session_index', 'activity_id', 'from_activity']);
  });

  it('passes over a tool this server does not register', () => {
    expect(describedCalls('Call `gitnexus_impact { target, direction }`.', TOOLS)).toEqual([]);
  });

  it('passes over a fenced block, which shows rather than instructs', () => {
    expect(describedCalls('```\n`next_activity { session_index }`\n```\n', TOOLS)).toEqual([]);
  });

  it('reads a call naming session_index as the whole signature', () => {
    expect(one('`next_activity { session_index, activity_id }`').signature).toBe(true);
  });

  it('reads an ellipsis as eliding the rest', () => {
    expect(one('`next_activity { session_index, … }`').signature).toBe(false);
    expect(one('`next_activity { session_index, ...the rest }`').signature).toBe(false);
  });

  it('reads a call without session_index as naming only what it discusses', () => {
    expect(one('force full delivery with `next_activity { exit: "full" }`').signature).toBe(false);
  });

  it('reads a call to a tool that takes no session as whole', () => {
    expect(one('`health_check { }`').signature).toBe(true);
  });
});

describe('checkCall', () => {
  it('reports an argument the tool does not declare', () => {
    expect(findings('`next_activity { session_index, activity_id, from_activity_id: x }`'))
      .toMatchObject([{ check: 'unknown-argument' }]);
  });

  it('reports a required argument a whole signature omits', () => {
    const reported = findings('`record_usage { session_index, activity, usage, agent_id }`');
    expect(reported).toMatchObject([{ check: 'missing-required' }]);
    expect(reported[0]!.detail).toContain("omits 'basis'");
  });

  it('holds a fragment to its named arguments alone', () => {
    expect(findings('`record_usage { session_index, activity, … }`')).toEqual([]);
  });

  it('passes a call that matches the schema', () => {
    expect(findings('`record_usage { session_index, activity, usage, basis, agent_id }`')).toEqual([]);
  });
});

describe('registeredTools', () => {
  it('reads the parameters off the registrations themselves', () => {
    const tools = registeredTools();
    const advance = tools.get('next_activity');
    expect(advance, 'next_activity is registered').toBeDefined();
    expect(advance!.required).toContain('activity_id');
    expect(advance!.declared).toContain('from_activity');
  });

  /**
   * The mark that tells a fragment from a whole signature is `session_index`, so a tool that takes
   * one and does not declare it under that name would be measured as whole wherever it appears.
   */
  it('spells the session argument one way across every tool that takes one', () => {
    const misspelt = [...registeredTools()]
      .filter(([, params]) => [...params.declared].some((name) => /session/.test(name) && name !== 'session_index'))
      .map(([name]) => name);
    expect(misspelt).toEqual([]);
  });
});
