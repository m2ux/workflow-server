# Lean Brief — Cut the redundant test suite down

**Target:** `tests/` (76 files, 18,141 lines) · **Intensity:** ultra · **Scope:** repo

**Problem:** The suite declares 975 tests across 76 files and collects ~1,052, and a measurable share of them re-run work another check already does, assert what TypeScript already guarantees, or pass without checking anything — so the suite must shed those without losing a single test that would catch a real regression.

## Traced Flow

**Entry:** `npm run test:ci` → `vitest run` → the single glob `include: ['tests/**/*.test.ts']` in `vitest.config.ts`. CI reaches it from `.github/workflows/verify.yml`, which runs typecheck → `test:ci` → `check:all` → `bench:token --gate` serially in one job.

**Data:** Three distinct inputs feed the tests, and which one a test reads decides whether deleting it is safe. Twenty-five files read live YAML from the `workflows` submodule through `tests/corpus-root.ts`. Nine files boot the real server over `InMemoryTransport` against `src/server.js` (248 tests, 25% of the suite). Nineteen files import `scripts/check-*.js` directly and re-run a guard that `check:all` runs again later in the same CI job.

**Exit and error paths:** A failure surfaces as a non-zero vitest exit that fails the `verify` job. Two exits are silent instead: eleven sites wrap every assertion in an `if` that returns early on load failure or a missing `python3`, so the test goes green having checked nothing; and coverage has no thresholds anywhere and is never run in CI, so nothing measures what a deletion stops covering.

## Reachable Rungs

| Rung | Why it looks reachable |
|------|------------------------|
| Does it need to exist? | 2 `it.skip` blocks (~98 lines) test a design that was replaced and is covered elsewhere; 19 guard wrappers (124 tests) duplicate `check:all` in the same job; 4 e2e files walk `work-package` across the same 6 policies. |
| Reuse an in-repo helper | The clean-corpus assertion is written out in 7 files; `context-window-smoke` and `hybrid-bundling` carry a byte-identical unchanged-marker assertion triple. |
| Write the minimum that works | ~25 `typeof` and 97 bare `toBeDefined()` assertions restate TypeScript's own guarantees — `SessionFileSchema is a Zod schema` tests that Zod is Zod. |
| Deletion over addition | Applies at every rung above; the whole pass is a subtraction. |

## Safety Floor in Play

| Obligation | Why this flow implicates it |
|------------|-----------------------------|
| Understand the problem first | With no coverage gate, nothing catches a deletion that removed the only check on a path — each cut has to be justified by reading what the test actually drove. |
| Anything explicitly requested | "Retaining real value" is the user's own constraint, so a test that would fail on a real regression stays regardless of how ugly it reads. |
| One runnable assert-based check | Deleting the duplicate of a pair is fine; leaving a `src/` module with zero remaining checks is not. |
| Error handling that prevents data loss | The session-store, migration, and `batch-bound-totality` malformed-history tests are what stand between a bad write and lost session state. |
| Security | `session-crypto` seal and key-rotation tests are floor, not surface. |
| Input validation at trust boundaries | MCP tool inputs are the client/server trust boundary; repo-authored refinements (the 6-char base32 regex, the cycle cap) stay even where Zod-native required-field tests go. |

## Open Items

Two findings are live before any cut is made. The eleven silently-voided `if` guards are worse than redundant — they are green with nothing checked — so they need repair or removal rather than counting as coverage. And `tests/e2e/__snapshots__/corpus-sha.json` records a corpus commit that the checked-out `workflows/` worktree has moved past, so the snapshot and option-coverage stamps fail in this tree as it stands, and the 6 walk snapshots downstream are diffing against a corpus that has moved.

**Scope:** The lens is ultra intensity over repo scope. The whole `tests/` tree is in scope rather than a diff, which is what the target demands — the working tree carries no test-file change, only submodule pointers and `AGENTS.md`. Ultra intensity means a duplicate pair is cut to one even where both carry a header comment defending the split, and a TypeScript-redundant assertion goes without further argument; what holds it back is the safety floor above, not the strength of the justifying comment.
