# Lean Change — Cut the redundant test suite down

**Rung taken:** Does it need to exist? (with Reuse an in-repo helper for the walk matrix) · **Intensity:** ultra

```text
 tests/activity-technique-overlap.test.ts |  15 -----      corpus re-run only
 tests/identifier-qualification.test.ts   |  19 -----      corpus re-run only
 tests/prism-lens-reachability.test.ts    |  20 -----      corpus re-run only
 tests/resource-anchors.test.ts           |  15 -----      corpus re-run only
 tests/self-provisioned-input.test.ts     |  15 -----      corpus re-run only
 tests/e2e/definition-lint.test.ts        |  87 -----      folded onto shared walks
 tests/e2e/workflow-e2e.test.ts           |  72 -----      folded onto shared walks
 tests/e2e/snapshot.test.ts               |  89 +++++      holds both, over one traversal
 tests/mcp-server.test.ts                 | 114 +---       2 legacy it.skip; python3 probe
 tests/schema-loader.test.ts              |  69 +---       4 loads -> 1
 tests/site.test.ts                       |  15 +---       site-links, svg-layout re-runs
 tests/binding-fidelity.test.ts           |  19 +---       corpus re-run + counts identity
 tests/review-mode-gating.test.ts         |  20 +---       corpus re-run + stale-acceptance
 tests/section-framing-guard.test.ts      |   9 +---       corpus re-run
 tests/audience-guard.test.ts             |  11 +---       corpus re-run
 tests/{artifact-guides,bootstrap-self-contained,checkpoint-entry,decision-order,
        fragments,harness-adapter-set,set-action-values,technique-template,
        variable-model}*.test.ts          |  64 +---       corpus re-run, one per file
 tests/context-window-smoke.test.ts       |   8 +---       marker shape -> hybrid-bundling
 tests/migration.test.ts                  |   8 ---       "the function is a function"
 tests/session-schema.test.ts             |  12 +---       "Zod is Zod"
 tests/guard-registry.test.ts             |  14 ++++       the premise the cuts rest on
 tests/e2e/option-coverage.test.ts        |   7 +---       silent-pass guard made loud
 tests/e2e/README.md, docs/*.md           |  50 +---       suite described as it now is
 32 files changed, 184 insertions(+), 569 deletions(-)

 files 76 -> 69   tests 1063 -> 1036   work-package walks 21 -> 8
 aggregate test time 222.1s -> 128.1s (-42%)   wall 40.4s -> 30.2s
```

**Check:** `npm run test:ci` green (1021 passed, 15 skipped, 0 failed) and `tsc --noEmit` clean; `npx tsx scripts/check-all.ts` reports 28 guards, 28 pass, 0 unmeasured in 1.9s — every corpus hard-zero deleted from vitest still enforced by its owner, in the same CI job. New in `guard-registry.test.ts`: the verify job runs both `test:ci` and `check:all`, which is the fact the deletions rest on. Precondition settled first: `baseline:stamp` moved the corpus stamp `46bddccc71a3 -> 9cca82e9b713`, and `vitest -u` rewrote no walk snapshot — the 141-commit corpus move changed nothing the baselines record. The shared `workflows` checkout then advanced again mid-pass to `7f37a2bdb730` (PR #484 landing), which the stamp named rather than surfacing as six unexplained snapshot failures; the baselines hold at that commit too, and the stamp now reads it. A branch that carries this change forward re-stamps against whatever corpus commit it finally pins.

**Skipped:** the ~105 fixture-driven guard-logic tests in those same files stay — only the one corpus re-run per file went; add nothing back unless `check:all` leaves the verify job. `robot-execution.test.ts` keeps its own walk rather than joining the shared six; fold it in when a third file wants the same traversal. The bulk `toBeDefined`/`typeof` sweep the brief scoped is not taken — see below.

## Correction to the brief's estimates

Two of the brief's counts did not survive reading the code, and the difference is most of the gap between its projection and this change.

**"19 guard wrappers (124 tests) duplicate `check:all`."** Nineteen files import a `scripts/check-*.js`, but in fourteen of them only a *single* test re-runs the guard over the live corpus. The rest drive the guard's collector against purpose-built fixture corpora and assert what it flags — logic no guard run over a clean corpus can exercise, and several say so in their own docstrings ("the corpus is consistent today, so the real-corpus assertion cannot demonstrate detection"). Twenty tests were the duplicate, not 124. Five files held nothing else and went whole.

**"~25 `typeof` and 97 bare `toBeDefined()` restate TypeScript's own guarantees."** Read individually, most do not. They sit on `Record<string, unknown>` index reads, `Array.prototype.find` results, and `Result` unwraps — positions where `undefined` is a real inhabitant TypeScript cannot exclude. Three clusters were genuine theatre and went: `SessionFileSchema is a Zod schema`, `exports migratePlanningFolder` (a function the same file calls ten times), and a `typeof x === 'number'` on an exported constant. Deleting the rest by pattern would have removed narrowing guards, so the sweep stopped at what reading justified.

**Where the cost actually was.** Not in assertion count but in traversals: three separate files each walked `work-package` across the same six policies with byte-identical calls — eighteen full walks producing three readings of one traversal. Folding two of them onto the third's shared `beforeAll` map removed thirteen walks and 94 seconds of the suite's 222, while every named invariant they asserted survives. That is where a suite of this shape gets expensive, and it is invisible to a test census.

## Two silent passes repaired before anything was cut

The brief flagged eleven `if (...) return` sites as green-with-nothing-checked. Eight are not: they follow an `expect(result.success).toBe(true)` and exist only to narrow the type after the assertion has already decided the test. One is a directory-walk helper. Three were real, and all three are now loud rather than silent:

- The `inspect_session` parity test probed for `python3` and returned early when absent — the oracle *is* that test, so a runner without the interpreter passed it having compared nothing.
- The two corpus-stamp tests returned early when the corpus was not a git checkout, which voids the only comparison they make.

Each now fails on the condition it used to skip on, and carries a `ponytail:` marker naming what would justify a real skip.
