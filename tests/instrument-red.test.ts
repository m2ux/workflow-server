import { describe, expect, it } from 'vitest';

/**
 * A single failing assertion, so engine CI can be observed with the suite red and nothing else in
 * the tree disturbed. It lives only on the throwaway `i98/` branch pair that takes that reading.
 */
describe('instrument', () => {
  it('fails, so the suite concludes failure', () => {
    expect(1).toBe(2);
  });
});
