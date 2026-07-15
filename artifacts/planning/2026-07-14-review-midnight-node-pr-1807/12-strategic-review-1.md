# Strategic Review — PR #1807 (local-env from-genesis usability)

> strategic-review · Review midnight-node PR #1807 · head `98dd8e11` · base `main` · 2026-07-15
>
> **Review mode — report only.** Cleanup entries below are recommendations to the author, not commits. No source is modified and no commit is re-signed.

## Scope-vs-Issue Fit

Issue [#1468](https://github.com/midnightntwrk/midnight-node/issues/1468) carries an empty template; the operative spec is rsporny's comment [#issuecomment-4767302657](https://github.com/midnightntwrk/midnight-node/issues/1468#issuecomment-4767302657), five local-env usability concerns. Mapping the PR's 7-file authored surface to those concerns:

| # | Issue concern (rsporny) | PR coverage | Fit |
|---|---|---|---|
| 1 | `fork-network` dispatch hangs in CI | `fork-network.yml` fail-fast connection probe | In-scope, addressed |
| 2 | Unclear `fork-network` image inputs | `fork-network.yml` input-format clarifications | In-scope, addressed |
| 3 | PR #1676 TODO incomplete | `docs/fork-testing.md` snapshot-discovery recipe | In-scope, addressed |
| 4 | Missing snapshot-acquisition docs | `docs/fork-testing.md` backup-index docs | In-scope, addressed |
| 5 | Well-known from-genesis regression | `--from-genesis` mode (`run.ts`, `index.ts`, `types.ts`), `README.md`, changelog fragment | In-scope, **functionally incomplete** (CR-1) |

**Verdict: the PR is well-scoped to the issue — no scope creep, no out-of-scope files.** Every changed file traces to one of the five concerns; the diff is minimal (+161/-9) with no unrelated edits. The one gap is not scope drift but *completeness*: concern #5's from-genesis mode ships the CLI wiring but not the seed-provisioning contract, so the delivered behaviour does not finalize (CR-1). Nothing the issue asked for is missing at the feature level; the shortfall is that the from-genesis feature is present but non-functional end-to-end.

## Per-File Necessity & Minimality

Every changed file directly supports a requested concern; no debugging artifact, no superseded approach, no speculative construct survives on the authored surface. The lean-coding audit ([09-code-review.md](09-code-review.md#lean-coding-audit)) independently reached the same conclusion (net −4 lines available from one marginal `shrink`, no YAGNI/dead constructs). Minimality-check answers:

| Question | Answer | Note |
|---|---|---|
| Every changed file necessary? | Yes | 7/7 map to issue concerns |
| Every added line necessary? | Yes (one marginal exception) | The two-branch bring-up banner (`run.ts:61-66`) could collapse to one `console.log` (~4 lines) — a `shrink` opportunity, not required |
| All new dependencies required? | Yes | No dependencies added |
| All configuration changes required? | Yes | `fork-network.yml` change is a requested CI fix |
| Solution as simple as it could be? | Yes | Reuses `discoverComposeDataMounts` / `isNonEmptyDirectory` / `runDockerCompose`; no reinvented primitive |

Orphan check: no introduced-but-unreferenced symbols. `runFromGenesis`, `collectUnsetComposeVars`, and `RunOptions.fromGenesis` are each reached from the `run` command path.

## Findings

Strategic review adds no new defects beyond what the code review, structural analysis, and test-suite review already surfaced. Its distinct contribution is the **scope-fit and minimality** verdict above (clean) and the **changelog-hygiene** finding below. Code/test findings are referenced by ID, not restated — see [09-code-review.md](09-code-review.md) and [10-test-suite-review.md](10-test-suite-review.md).

### [SR-1 — Changelog fragment lacks a CI-conformant issue reference](https://github.com/midnightntwrk/midnight-node/blob/98dd8e11/changes/node/added/local-env-from-genesis.md#L16-L17)

**Nit** (changelog hygiene / CI-conformance) · [`changes/node/added/local-env-from-genesis.md:16-17`](https://github.com/midnightntwrk/midnight-node/blob/98dd8e11/changes/node/added/local-env-from-genesis.md#L16-L17)

The fragment's `PR:` and `Issue:` trailers are empty, and the body contains no reference matching the project's changelog CI regex (`github\.com/.+/issues/[0-9]+` or `(Fixes|Closes|Resolves):?\s+#[0-9]+`) — verified by direct grep at head `98dd8e11`. This is the same surface as code-review **CR-6**; recorded here because the strategic-review change-fragment verification (`verify-fragment`) is the step that formally checks it. **Cleanup recommendation (author):** populate `PR: #1807` and `Issue: #1468` (or add a `Closes: #1468` line) so the fragment satisfies the changelog CI check and the release note is traceable to the issue. Not merge-blocking on its own.

**Category:** Orphaned Infrastructure (changelog metadata left incomplete).

### PR body conformance

The live PR body links issue #1468 via the comment URL but uses no `Closes:`/`Fixes:` keyword and leaves the DCO sign-off and change-file checklist boxes unchecked. These are author-checklist items, not code findings; noted for the author, not gated. (Signature scan reports `%G?` = `E` for all 7 commits — signatures present but unverifiable against the local keyring, i.e. *not* unsigned `N`/`B` — so `unsigned_commits_in_pr` is false and no re-sign prompt applies.)

## Referenced findings (homed in their own reports — not restated)

- **CR-1 / SA-1 · Critical (liveness-halt)** — from-genesis validator seeds delivered via `SEED_PHRASE` are never consumed (node reads `*_SEED_FILE` only); network comes up but never finalizes. Sole merge blocker. Home: [09-code-review.md#cr-1](09-code-review.md#cr-1).
- **CR-2 · Minor** — README documents a from-genesis happy path that does not finalize. Home: [09-code-review.md#cr-2](09-code-review.md#cr-2).
- **SA-2 · Minor** — unset-var guard checks presence, not effect (false "ready"). Home: [09-code-review.md#sa-2](09-code-review.md#structural-analysis).
- **TR-1 / TR-2 · Minor** — `local-environment/` has no test harness; the CR-1 path is untested. Home: [10-test-suite-review.md#tr-1](10-test-suite-review.md#tr-1).
- **CR-3/CR-4/CR-5, TR-3 · Nit** — prettier printWidth-80, TS unlinted in CI, regex edge cases, untested mutual-exclusivity guard. Homes in their reports.
- **Stale, not current:** the prior red `Local Environment Tests` CI blocker is resolved at `98dd8e11` (jq/libjq1 pin pulled via the `main` merge) — reconciled in [09-code-review.md](09-code-review.md#reconciliation-note-drift-against-prior-artifacts), not a live finding.

## Verdict

The change is **minimal, focused, and correctly scoped to issue #1468** — no scope creep, no over-engineering, no investigation artifacts, no orphaned symbols. The strategic lens surfaces one Nit (SR-1, changelog issue reference) and confirms the picture from the other reviews. Merge-readiness is capped by the single unaddressed Critical on the authored surface (CR-1), so the consolidated verdict is **Request Changes** — consistent with the prior-triage `rating_cap` and independent of the now-stale red-CI blocker.
