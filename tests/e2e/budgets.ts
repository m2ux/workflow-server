/**
 * Time budgets for the e2e walk hooks, in one place.
 *
 * A walk replays a full multi-activity session against the live corpus, so its duration scales with
 * the corpus, and the hooks that perform several walks up front are the suite's long poll. Those
 * budgets were per-hook literals bumped one at a time — definition-lint went 60s -> 120s as the
 * corpus grew, then timed out anyway on a GitHub runner, which is roughly 4x slower than a local
 * machine (a six-walk hook measures ~30s locally and exceeded 120s in CI).
 *
 * A per-walk budget with the slow-runner factor folded in moves every hook together, so the next
 * corpus growth does not need a hunt for which literal to raise.
 */

/** Generous per-walk allowance: ~5s locally, ~20s on a CI runner, plus headroom for both. */
export const PER_WALK_MS = 45_000;

/** Budget for a hook that performs `walks` sequential walks before the assertions run. */
export function walkHookTimeout(walks: number): number {
  return walks * PER_WALK_MS;
}
