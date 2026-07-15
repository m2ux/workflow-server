# Test Suite Review — PR #1807

> Review midnight-node PR #1807 (local env usability) · head `98dd8e11` · 2026-07-15
>
> **Review mode — report only.** Findings are recommendations on the PR's test coverage, not commits.

Diff-aware assessment: coverage is scoped to the changed-symbol set, not absolute project coverage. The PR's only executable surface is the TypeScript in `local-environment/` (`src/commands/run.ts`, `src/index.ts`, `src/lib/types.ts`); the changelog, `fork-network.yml` comment, `docs/fork-testing.md`, and `README.md` changes are prose and carry no test surface.

## Diff-aware coverage map

Changed symbols on the authored surface and their test callers:

| Changed symbol | File | Existing test callers | Verdict |
|----------------|------|-----------------------|---------|
| `runFromGenesis` (new) | `run.ts:158` | none | **Coverage gap** |
| `collectUnsetComposeVars` (new) | `run.ts:188` | none | **Coverage gap** |
| `run` / `runWellKnownNetwork` (from-genesis branch + mutual-exclusivity guard) | `run.ts:48,66` | none | **Coverage gap** |
| `RunOptions.fromGenesis` (new field) | `lib/types.ts:29` | none | Type-only; no runtime test needed |
| `--from-genesis` option wiring | `index.ts:87` | none | Coverage gap (CLI parse) |

GitNexus `diff-coverage-map` was not run against these symbols: the index is Rust-only and stale at `bec726a650`, so it holds no TypeScript symbols or test-caller edges for `local-environment/`. The map above is derived directly. No changed Rust symbol exists (`node/src/command.rs` is unchanged by this PR — it is cross-boundary evidence for CR-1, not part of the authored surface), so no Rust test coverage is in scope.

## Findings

### [TR-1](https://github.com/midnightntwrk/midnight-node/blob/98dd8e11/local-environment/package.json#L6)
**The `local-environment/` package has no automated tests at all.** — **Minor** (coverage gap) · `local-environment/package.json:6`.

`"test": "echo \"Error: no test specified\" && exit 1"`; there are zero `*.test.ts`/`*.spec.ts` files and no test framework (vitest/jest/mocha) in `dependencies`/`devDependencies`. Every symbol this PR adds — `runFromGenesis`, `collectUnsetComposeVars`, the mutual-exclusivity guard, the `--from-genesis` CLI wiring — ships untested. This is a pre-existing package condition, not introduced by the PR, but the PR extends the untested surface. Per the multi-instance/coverage gate this routes (≥ Minor). **Recommendation:** the highest-value, lowest-cost unit test is `collectUnsetComposeVars` — it is pure (string in, string[] out), has no Docker/filesystem dependency once the compose text is provided, and its regex edge cases (CR-5: `${VAR:-default}`, `$$VAR`) are exactly what a unit test would pin. Adding a minimal test runner plus that one test would establish the harness and lock the regex contract.

### [TR-2](https://github.com/midnightntwrk/midnight-node/blob/98dd8e11/local-environment/src/commands/run.ts#L158-L185)
**No test exercises the from-genesis seed-provisioning contract — the CR-1 Critical failure is invisible to the harness.** — **Minor** (coverage gap tied to a Critical defect) · `local-environment/src/commands/run.ts:158-185`.

Traced reported failure (from prior-feedback triage #5b/#6, re-verified as CR-1/SA-1): the from-genesis network boots with empty consensus keystores and never finalizes. **Triggering code path:** `run(...)` → `runWellKnownNetwork(...)` with `runOptions.fromGenesis === true` → `runFromGenesis(...)` → `runDockerCompose(...)` on a base compose whose validator services set `SEED_PHRASE` but no `*_SEED_FILE`. **State precondition:** a validator service whose seed is supplied via the inline `SEED_PHRASE` channel while the node reads only `*_SEED_FILE`. No test reaches this path; the failure is a *runtime* (chain-liveness) property, not something the current package could assert even if it had unit tests, because it depends on the node container's keystore behaviour. **Recommendation:** the meaningful test is integration-level — bring up a from-genesis network and assert block height advances past 0 (not merely that RPC `/health` responds, which is the blind spot noted in SA-2). Absent an integration harness, at minimum add an assertion in `runFromGenesis` that each validator service resolves an `*_SEED_FILE` (or mounted seed file) before `docker compose up`, and unit-test *that* guard — it converts the silent runtime failure into a fast, testable precondition. This is a coverage gap; the underlying defect is rated Critical under CR-1, not re-rated here.

### [TR-3](https://github.com/midnightntwrk/midnight-node/blob/98dd8e11/local-environment/src/commands/run.ts#L67-L69)
**No test pins the mutual-exclusivity guard.** — **Nit** (coverage gap) · `local-environment/src/commands/run.ts:67-69`.

`--from-genesis` + `--from-snapshot` throws, correctly, but nothing asserts it. A one-line unit test (call `runWellKnownNetwork` with both flags, expect the throw) would lock the contract. Low value on its own; folds into establishing the TR-1 harness.

## Anti-pattern scan

No flaky tests, over-mocking, or brittle assertions to report — there are no tests. The relevant anti-pattern is the *absence* of a harness on an actively-extended package (TR-1). The healthcheck-as-liveness-proxy issue (RPC `/health` reporting healthy for a non-finalizing node) is a diagnostic blind spot recorded under structural analysis (SA-2), not a test-suite anti-pattern per se, but it is why a naive "is it up?" integration test would give false confidence — a real from-genesis test must assert block *production*, not container health.

## Summary

Coverage gaps only; no test regressions (there is no baseline test suite to regress). The routing-relevant finding is TR-1 (Minor) — the extended surface is untested. TR-2 ties the coverage gap to the CR-1 Critical: the harness cannot currently see the blocker, which is itself a reason the defect shipped unnoticed. No test-suite finding rises above Minor, so `needs_test_improvements` routes on TR-1/TR-2 (Minor), but in review mode no fixes are applied — these are recommendations to the author.

## Validation reconciliation (validate activity)

Re-confirmed at head `98dd8e11`. CI is fully green — every PR check passes (`Run tests`, `Fomatting and Linting` = Rust `cargo fmt`/clippy, `Local Environment Tests`, all Toolkit/E2E jobs; `cargo-deny` is the only skipped/NEUTRAL job, a routine skip). CI green means the PR's own checks pass; it does **not** exercise the CR-1 seed-wiring path, so TR-2's coverage gap stands independent of the green signal — the harness still cannot see the Critical. No full local `cargo` suite was run: the PR changes no Rust source (7 files: TS/shell/compose-YAML/docs/CI), a workspace build needs network the sandbox blocks, and it would touch nothing the diff changed. Local checkability of the changed `local-environment/` package is limited — `node_modules` is absent and `npm install` is network-blocked, so `eslint`/`prettier --check` cannot run locally; the one statically verifiable fact was confirmed by direct read: `run.ts:68` is 82 characters against prettier 3.5.3's default printWidth 80 (CR-3). Coverage findings (TR-1/TR-2/TR-3) are unchanged.
