import { describe, it, expect } from 'vitest';
import { renderMessage, unresolvedWarning } from '../src/utils/message-template.js';

/**
 * A gate's message is read by a person, so the values stand in the text rather than in a bag the
 * person cannot see. `check-message-binding` holds the corpus to names the bag carries at gate
 * time; what this covers is the render itself, and what a name the bag does not hold looks like.
 */
describe('renderMessage', () => {
  it('replaces a bare name with its value', () => {
    const { text, unresolved } = renderMessage('Renaming {symbol} now.', { symbol: 'composeLoaded' });
    expect(text).toBe('Renaming composeLoaded now.');
    expect(unresolved).toEqual([]);
  });

  it('reads a dotted path into an object', () => {
    const bag = { report: { summary: { direct: 2 }, risk: 'CRITICAL' } };
    const { text } = renderMessage('{report.risk}: {report.summary.direct} direct callers.', bag);
    expect(text).toBe('CRITICAL: 2 direct callers.');
  });

  it('renders a non-string value as its JSON form', () => {
    const { text } = renderMessage('Files: {changes}. Applied: {applied}.', {
      changes: ['a.ts', 'b.ts'],
      applied: false,
    });
    expect(text).toBe('Files: ["a.ts","b.ts"]. Applied: false.');
  });

  it('leaves a name the bag does not hold standing as its own token, and reports it once', () => {
    const { text, unresolved } = renderMessage('{missing} and {missing} and {held}.', { held: 'x' });
    expect(text).toBe('{missing} and {missing} and x.');
    expect(unresolved).toEqual(['missing']);
  });

  it('treats a path through a value that is not an object as unresolved', () => {
    const { text, unresolved } = renderMessage('{report.summary.direct}', { report: 'CRITICAL' });
    expect(text).toBe('{report.summary.direct}');
    expect(unresolved).toEqual(['report.summary.direct']);
  });

  it('accumulates across the several strings one gate presents', () => {
    const unresolved: string[] = [];
    renderMessage('{a}', {}, unresolved);
    renderMessage('{b} {a}', {}, unresolved);
    expect(unresolved).toEqual(['a', 'b']);
  });

  it('leaves text holding no token untouched', () => {
    const { text, unresolved } = renderMessage('Proceed with the edit?', { risk: 'LOW' });
    expect(text).toBe('Proceed with the edit?');
    expect(unresolved).toEqual([]);
  });
});

describe('unresolvedWarning', () => {
  it('is null where every name resolved', () => {
    expect(unresolvedWarning('gate', [])).toBeNull();
  });

  it('names the checkpoint and every unanswered path', () => {
    const warning = unresolvedWarning('approve-edit', ['risk', 'report.summary.direct']);
    expect(warning).toContain('approve-edit');
    expect(warning).toContain('risk');
    expect(warning).toContain('report.summary.direct');
  });
});
