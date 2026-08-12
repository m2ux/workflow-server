import { describe, it, expect } from 'vitest';
import { collectLensReachabilityViolations } from '../scripts/check-prism-lens-reachability.js';

/**
 * Drift guard: every prism lens resource must be reachable — routable from a goal in
 * plan-analysis's goal-mapping-matrix / the portfolio catalog, an inner pipeline pass, or a
 * document template declaring `type: template` in its own frontmatter — and every lens named in
 * the selection logic must resolve to a file with a matching index. A failure means a lens was
 * added without a route (an orphan) or a lens was renamed and left a stale reference behind. Fix
 * the route/name in the prism workflow; a resource that runs only inside a pipeline goes in the
 * PIPELINE_INTERNAL set in scripts/check-prism-lens-reachability.ts, and a creation guide needs no
 * entry there because its own frontmatter excludes it.
 */
describe('prism lens reachability guard', () => {
  const violations = collectLensReachabilityViolations();

  it('leaves no lens orphaned and no lens reference stale', () => {
    expect(violations.map((v) => `[${v.check}] ${v.site} — ${v.detail}`)).toEqual([]);
  });
});
