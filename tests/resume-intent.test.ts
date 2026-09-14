import { describe, it, expect } from 'vitest';
import { statesResumeIntent } from '../src/utils/resume-intent.js';

describe('statesResumeIntent', () => {
  it('matches closed-vocabulary continuation phrases', () => {
    expect(statesResumeIntent('resume the work package')).toBe(true);
    expect(statesResumeIntent('carry on where we left off')).toBe(true);
    expect(statesResumeIntent('pick up where I left off')).toBe(true);
  });

  it('does not match a fresh-start request', () => {
    expect(statesResumeIntent('start a new work package from scratch')).toBe(false);
    expect(statesResumeIntent(
      'At present the time taken from first prompt to dispatching the client workflow with workflow server is too long.',
    )).toBe(false);
  });

  it('does not match continue inside discontinue or start inside restart', () => {
    expect(statesResumeIntent('please discontinue this approach')).toBe(false);
    expect(statesResumeIntent('restart the service')).toBe(false);
  });
});
