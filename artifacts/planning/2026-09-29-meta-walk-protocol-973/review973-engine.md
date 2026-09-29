# Engine review: PR #978 (engine/fan-barrier-destination, 3807a6c2 vs c9edbebe)

## Runs

- Four files vs meta-walk-protocol (f093a318): 56/56 pass. Reload tests ran unskipped, including `refuses a corpus the guard sweep cannot measure`.
- Full suite vs meta-walk-protocol: 2170 pass, 6 skipped, 0 fail. This matches the PR body.
- Full suite vs `.worktrees/workflows`, which is at origin/workflows 03dfd4e2 (checked with ls-remote): 11 fail.
  - 8 are batch-loop tests: 1 in gates (`releases the identity on the terminal activity`) and 7 in walk (every walk that ends on `__terminal__`, plus the fan walk). These are expected until #991 merges.
  - 3 are in `tests/e2e/snapshot.test.ts`: `[default]`, `[full-workflow]` and `runs only steps...`.
    - The received walk has an extra `clear-checkpoint-reply` gate, and declared steps are 339 against 338 in post-impl-review.
    - That step is on the workflows head already (83d6f046), and the head's `walks/` baseline does not record it. The snapshot is a count of corpus steps, and nothing in #978 touches it.
    - So this drift comes from the corpus, not from #978. It is inferred: main was not run against the head. #991's branch passes it.
  - Engine CI tests against the workflows head, so this PR stays red until #991 merges, and the 3 snapshot tests fail there whatever engine runs.
- Probe (a scratch test outside the repo, `scratchpad/probe/`): live `_meta.barrier` on each path.
  - Open, instance fan: `{destination: combine-probes, pending: [probe-unit#0, probe-unit#1], met: false}`
  - Mid retirement: `{destination: combine-probes, pending: [probe-unit#1], met: false}`
  - Last retirement: `{destination: combine-probes, pending: [combine-probes], met: true}`
  - Fan opened from a join (chained-fan-fixture, `combine-probes.swept`): `{destination: reconcile-review, pending: [unit-review#0, unit-review#1], met: false}`
  - Open on an undeclared exit name (`exit: typo`): `{pending: [...], met: false}`, with no destination.
- Mutation: a corpus copy with `activity_entered: true` removed from `advance-past-fan`. Both batch-loop files still pass, 20/20.

## Barrier change: what holds

- `enteredFan` finds the group by `(source, exit)`. That pair is unique, because the graph binds one destination per exit (`fanGroups`, workflow-loader.ts:583-606). The probe confirms it for a source fan and for a fan opened from a join.
- A nested open, where a fan is entered from a branch retirement, cannot be reached. Loader L5 (workflow-loader.ts:800-806) refuses a branch exit bound to a fan, so `openFan` and `fanEnter` never both hold, and `openFan?.join` never shadows `enteredFan?.join`.
- A first-call fan can be reached only by naming a list on the first call. That draws a warning only (validation.ts:39-42), so the fan opens with no graph group, and destination is absent (see E6).
- `met` is right on every path the probe covers: mid (false), last (true), ordinary advance (no barrier), open from a source or from a join (false).
- Nothing else reads `_meta.barrier`:
  - no src, docs, schema or tool description mentions it;
  - the corpus `enter-fan.md:48` ("as `_meta.barrier.destination` names it on the call that opens them") now matches the engine.
- House rules hold. No "no longer", "previously" or "instead of" appears in the diff. The added comment is two lines in a block of the same density, in present tense.

## Findings

| # | Band | Sev | Principle | Where | Origin |
|---|---|---|---|---|---|
| E1 | Contract | Medium | Test validity: a restated effect hides a regression | tests/batch-loop-walk.test.ts:110-111, 122-125 | diff |
| E2 | Hygiene | Low | Tautological assertion | tests/batch-loop-walk.test.ts:99-104, 391, 430 | diff |
| E3 | Contract | Low | Coverage: `met` changed on every path, only the opening call is asserted | tests/e2e/fan-walk.test.ts:100-127 | diff |
| E4 | Hygiene | Low | Comment describes the design wrongly | src/tools/workflow-tools.ts:1635-1636 | pre-existing, in the edited block |
| E5 | Hygiene | Low | Simplest implementation: dead operand | src/tools/workflow-tools.ts:1642 | pre-existing, on the edited line |
| E6 | Live | Low | Silent failure on a malformed open | src/tools/workflow-tools.ts:1281-1285, 1639-1640 | pre-existing |
| E7 | Hygiene | Nit | Dead stub | tests/reload-exp-sidecar.test.ts:44, 370 | diff |

**E1: the walk restates YAML `set` actions, so the fan-join assertion cannot fail on a corpus regression.**
- Evidence: `'advance-past-fan': (bag) => { ...; bag['activity_entered'] = true; }` and `'end-walk': (bag) => { bag['current_activity'] = null; }`. The EFFECTS docstring says these steps behave "as the YAML declares", but the file hard-codes them.
- Mutation: removing `activity_entered: true` from `activity-loop.yaml` `advance-past-fan` leaves all 20 batch-loop tests passing. `opens a fan ... dispatches the join without an advance` is one of them.
- On a real walk, that regression makes the join's entry call `next_activity` a second time.
- Fix: for each `kind: action` step, apply the `set` actions the YAML declares to the bag, resolving `{name}` values from the bag. Keep EFFECTS rows only for technique steps. This also retires the rows for `spend-entered-activity`, `retire-fan-envelope`, `advance-activity` and `release-spent-worker`, which are pre-existing rows of the same shape.

**E2: "no worker minted for `__terminal__`" is guaranteed by the stub.**
- Evidence: the `enter-activity` EFFECT returns before minting when `activity === TERMINAL`. The assertions `expect(result.minted).not.toContain('worker:__terminal__')` (lines 391, 430) therefore cannot fail. The claim they name lives in the `dispatch-activity` prose, which the test never reads.
- Fix: drop the two assertions, or state in the comment that they check this file's reading of `enter_activity`, not the corpus.

**E3: only the opening call's barrier is asserted.**
- Evidence: the PR changed `met` from `entering` to `entering && fanEnter === undefined`. A regression to `met: false` everywhere, or to a wrong join on a fan opened from a join, passes the suite.
- Fix: extend the fan-walk test to assert:
  - the mid-fan retirement: `{destination: 'combine-probes', pending: ['probe-unit#1'], met: false}`;
  - the last retirement: `{..., pending: ['combine-probes'], met: true}`;
  - chained-fan-fixture's open from the join: `destination: 'reconcile-review'`.

**E4: the comment says "`met` is true with an empty pending list on the call that enters the destination".**
- Evidence: `pending` is `next.frontier`, which on that call holds the entered join (probe: `pending: ['combine-probes']`). The PR body's "enters its destination with nothing pending" repeats the claim. Commit bodies are exempt.
- Fix: "`met` is true on the call that enters the destination, where pending holds that destination alone."

**E5: the third fallback of `destination` never fires.**
- Evidence: `(entering && !fanEnter ? targets[0] : undefined)`. The barrier is emitted only in three cases, and none of them reaches this operand:
  - `openFan` is set: its `join` is always defined, because an undefined join fails the load at L7.
  - `fanEnter` is set: the operand yields undefined.
  - `frontier.length > 1` with no `fanEnter`: only possible when not entering, so the operand yields undefined again.
- Fix: `destination: openFan?.join ?? enteredFan?.join`.

**E6: a fan opened without a graph binding reports no destination.**
- Evidence: an exit the source does not declare (probe `exit: 'typo'`), or a first call naming a list, gives no `boundDestination`, so `activity_id` opens the fan and `enteredFan` is undefined. Only a warning is raised.
- Consequence: `enter-fan` returns no `barrier_destination`, `advance-past-fan` never fires, and the walk stalls after the branches.
- Fix: extend T2 so it refuses an `exit` the retiring activity does not bind whenever that activity has a fan-bound exit. Every fan open then resolves to a graph group.

**E7: `stubLaunchers` writes a `curl` stub into a directory that is not on PATH.**
- In the `refuses a corpus...` test, the `launchers` dir is not on PATH, so the stub is never used. That test needs real curl for `canReachPreflight`.
- This is harmless, and the helper's doc says as much. Optionally, move the curl stub out to the two callers that put the dir on PATH.

## Counts

- Origin diff: E1 (Contract, Medium), E2 (Hygiene, Low), E3 (Contract, Low), E7 (Hygiene, Nit).
- Origin pre-existing: E4 and E5 (Hygiene, Low, both in the edited block), E6 (Live, Low).
- No High. The only Live finding is E6, which is Low.
