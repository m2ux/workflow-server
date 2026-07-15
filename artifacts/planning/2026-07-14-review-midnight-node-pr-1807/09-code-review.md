# Code Review — Lean-Coding Audit

> 09-code-review · Review midnight-node PR #1807 (local env usability fixes) · head `98dd8e11` · 2026-07-15
>
> **Review mode — report only.** No simplifications are applied to the author's PR. Findings below are review comments, not commits.

## Lean-Coding Audit

Lens: over-engineering / leanness only (correctness, security, performance are safety-floor and out of scope here). Scope: the changes PR #1807 introduces. The only executable surface is the TypeScript in `local-environment/`; the changelog, `fork-network.yml` comment, `docs/fork-testing.md`, and `README.md` changes are prose and carry no over-engineering surface.

Tags per [review-taxonomy](review-taxonomy#tags): `delete` / `stdlib` / `native` / `yagni` / `shrink`.

### Findings

- `local-environment/src/commands/run.ts:L61-66`: `shrink` the `if (runOptions.fromGenesis) { console.log(...) } else { console.log(...) }` two-branch bring-up banner. A single `console.log(runOptions.fromGenesis ? "Bringing up ..." : "Preparing ...")` expresses the same behaviour in one statement. Saves ~4 lines. *Minor — marginal at `lite` intensity; the branch is already clear.*
- `local-environment/src/commands/run.ts:L198` (`collectUnsetComposeVars`): the regex `/\$\{?([A-Z][A-Z0-9_]*)/g` is the leanest correct form for the values it must catch and is **not** over-engineered — no simplification finding. (Its precision gap on `${VAR:-default}` / `$$VAR` is a correctness/completeness nit already surfaced in triage #5c, not an over-engineering finding, so it is not tagged here.)

### Notes (not over-engineering findings — recorded so they are not mistaken for leanness wins)

These belong to other lenses and are **not** in scope for this audit; they are carried from prior artifacts and repeated only to keep the audit honest about what it is and is not flagging:

- `run.ts` new `throw new Error("--from-genesis and --from-snapshot are mutually exclusive.")` exceeds prettier printWidth 80 — a style nit, not leanness (the guard itself is minimal and correct). Safety-floor-adjacent (the guard is a needed input-validation branch).
- `collectUnsetComposeVars` regex edge cases (`${VAR:-default}`, `$$VAR`) — completeness/correctness, safety floor, not over-engineering.
- `local-environment` TS is not linted in CI — process gap, not code leanness.

The new `runFromGenesis` function, the two warning blocks (stale-data + unset-vars), the `--from-genesis` option wiring, and the `fromGenesis?` type field are each the minimum code that implements a requested, concrete behaviour (restore the from-genesis bring-up path). No YAGNI abstraction, no reinvented stdlib/native primitive, no dead construct. The `[...names].filter(...).sort()` chain is idiomatic native `Set`/array usage.

### Scoreboard

net: -4 lines possible.

The single actionable leanness finding is a marginal `shrink` worth ~4 lines. The change is otherwise lean: it adds the minimum code for a requested feature, holds the safety floor (the mutual-exclusivity guard and the unset-var/stale-data warnings are legitimate input-boundary and error-prevention machinery, never candidates for removal), and introduces no speculative generality.

## Code Review

Lens: correctness, safety, and architecture adherence across the PR's authored surface (7 files, +161/-9). Re-verified against head `98dd8e11` (base `main`). GitNexus `detect_changes` reports 0 changed symbols / low risk — expected, since the index is stale at `bec726a650` and the diff is TypeScript/docs/CI, outside the indexed Rust surface; structural blast radius is therefore assessed directly rather than from the graph. Findings are graded on the classification scale (Critical / Major / Minor / Nit / Informational); the render map (Critical→Critical, Major→High, Minor→Medium, Nit→Low) is applied in the consolidated summary.

Authored surface (`changed_files`): `.github/workflows/fork-network.yml`, `changes/node/added/local-env-from-genesis.md`, `docs/fork-testing.md`, `local-environment/README.md`, `local-environment/src/commands/run.ts`, `local-environment/src/index.ts`, `local-environment/src/lib/types.ts`.

### Findings

#### CR-1
**From-genesis validator seeds never reach the keystore — the network silently never finalizes.** — **Critical** (impact axis: liveness-halt) · `local-environment/src/commands/run.ts:158-185` (`runFromGenesis`), corroborated by `local-environment/src/networks/well-known/devnet/devnet.network.yaml:34` and `node/src/command.rs:223-265`.

`runFromGenesis` runs the well-known base compose detached, passing the env map through unchanged. The base compose provisions each validator's seed as an **inline phrase** env var — `SEED_PHRASE: $MIDNIGHT_NODE_01_0_SEED` (devnet, 6 validators; same shape in all 9 well-known compose files). The node consumes validator seeds **only** from file-path config fields — `aura_seed_file` / `babe_seed_file` / `grandpa_seed_file` / `cross_chain_seed_file` (`node/src/cfg/midnight_cfg/mod.rs:50-65`), each `std::fs::read_to_string`-ed into the `LocalKeystore` at `node/src/command.rs:223-265`. There is no code path — Rust, shell, Dockerfile, or entrypoint — that reads `SEED_PHRASE` and materializes a keystore entry from it (`grep -rn SEED_PHRASE` returns matches only in the 9 compose YAMLs plus `mockComposeOverride.ts`).

**Producer/consumer conservation walk** (the one conservation-relevant invariant in this diff): the *producer* (base compose) sets `SEED_PHRASE`; the *consumer* (`command.rs`) reads `*_SEED_FILE`. The two never meet on the from-genesis path. The fork path *does* balance this contract — `mockComposeOverride.ts:74-80` injects `AURA_SEED_FILE`/`GRANDPA_SEED_FILE`/`CROSS_CHAIN_SEED_FILE` pointing at generated seed files **and blanks `SEED_PHRASE: ""`** — and the bundled local-env stack sets `*_SEED_FILE` in its compose (`local-environment/src/networks/local-env/docker-compose.yml:415-417`). `runFromGenesis` returns before that override runs (`run.ts:84-87`), so nothing supplies `*_SEED_FILE` in from-genesis mode. Consequence: validator containers boot with empty consensus keystores → no block authorship → the chain never finalizes.

`collectUnsetComposeVars` cannot catch this: it flags a *referenced-but-unset* var, and `SEED_PHRASE` is referenced-and-satisfiable (it resolves to `$MIDNIGHT_NODE_01_0_SEED`, which the user supplies). The failure mode is a var that is **set but functionally inert** — the strongest form of silent failure, because the tool's own guard reports green. The healthcheck (`devnet.network.yaml:45-50`) probes RPC liveness (`/health`), not block height, so a non-finalizing node still reports healthy.

This confirms prior-feedback triage rows #5b (m2ux) and #6 (Codex bot), and the portfolio convergent finding, independently re-derived here. The fix is a **design decision about where seed provisioning lives** (base-compose author wires `*_SEED_FILE` + a seed-file materialization step; or the tool provisions seeds like the fork path does; or from-genesis is documented as requiring the operator to mount seed files), not a one-line wiring change — provisioning seeds *inside* the tool trades the silent-no-finalization gap for secret-on-disk exposure and tight coupling to the node's `*_SEED_FILE` contract. Merge-blocking while unaddressed.

#### CR-2
**README documents a from-genesis happy path that does not finalize.** — **Minor** (maintainability / correctness-of-docs) · `local-environment/README.md:55-74` ("Starting a well-known network from genesis").

The new subsection tells the operator that each validator "needs its real seed phrase (e.g. `MIDNIGHT_NODE_01_0_SEED`) … supplied via `--env-file`," framing seed provisioning as complete once that env var is set. Per CR-1 the base compose maps that value into `SEED_PHRASE`, which the node does not consume, so following the documented steps yields a network that comes up but never produces blocks. The doc should either flag the seed-wiring gap or describe the actual provisioning the node requires (seed *files*). Because it is on the authored surface and materially misleads the operator toward the CR-1 failure, it is a PR finding rather than a pure nit; it rides on CR-1's resolution.

#### CR-3
**New `throw` line exceeds prettier printWidth 80.** — **Nit** (style) · `local-environment/src/commands/run.ts:68`.

`throw new Error("--from-genesis and --from-snapshot are mutually exclusive.");` measures 82 characters; prettier 3.5.3 (the pinned formatter, default printWidth 80) would rewrap it across lines. `prettier --check` is the package's `lint` script, so `npm run lint` in `local-environment/` fails on this line. It does not fail CI (see CR-4), and the guard itself is correct and minimal — the finding is the unformatted line only.

#### CR-4
**`local-environment` TypeScript is not linted in CI.** — **Nit** (process/tooling gap, not on a source line) · `local-environment/package.json` `lint` script vs. the PR's CI check set.

The package defines `"lint": "eslint . && prettier --check ."`, but no CI job runs it (the "Fomatting and Linting" check that passes on this PR is Rust `cargo fmt`/clippy). This is why CR-3 slips through green CI. Recorded as an observation about the changed package's tooling; closing it is a CI-workflow follow-up, not a change to this PR's source.

#### CR-5
**`collectUnsetComposeVars` regex does not special-case `${VAR:-default}` or `$$VAR`.** — **Nit** (latent completeness) · `local-environment/src/commands/run.ts:194`.

The regex `/\$\{?([A-Z][A-Z0-9_]*)/g` treats `${VAR:-default}` as a plain reference (would warn about a var that has a compose-level default) and does not skip `$$VAR` (compose's literal-`$` escape). Neither form appears in any current well-known compose file, so the gap is latent and unexercised. It is the leanest correct form for the values it must catch today (confirmed by the lean-coding audit); flagged only so the edge cases are on record if compose files gain defaults or `$$` escapes later.

#### CR-6
**Changelog fragment has empty `PR:`/`Issue:` trailers.** — **Nit** (changelog hygiene) · `changes/node/added/local-env-from-genesis.md:16-17`.

The added-feature entry leaves `PR:` and `Issue:` blank. If the repo's changelog convention expects these populated at merge, fill them (PR #1807 / issue #1468) before merge. Body content is otherwise accurate.

### Praise

- **Clean reuse of existing helpers.** `runFromGenesis` composes `discoverComposeDataMounts` (`src/lib/snapshotRestore.ts:110`), `isNonEmptyDirectory` (`run.ts:238`), and `runDockerCompose` (`src/lib/docker.ts:58`) rather than reimplementing directory-scan or compose-invocation logic — the new path is genuinely thin.
- **Correct control-flow placement of the mutual-exclusivity guard and the early from-genesis dispatch.** The guard (`run.ts:67-69`) runs before any side effect, and `runFromGenesis` returns before `loadNetworkConfig`/`requireMockConfig` (`run.ts:84-90`), so the fork-only config load no longer runs on the genesis path — the branch separation is correct and the mock machinery is not paid for when unused.
- **Honest warnings.** The stale-`data/` and unset-var warnings (`run.ts:166-177`) surface real operator foot-guns up front; within the "warn, don't fail" design they are the right instrument (their one blind spot — the set-but-inert `SEED_PHRASE` — is CR-1, a limitation of the design, not of the warning code).
- **Documentation quality.** The fork-network input clarifications (`fork-network.yml`) and the snapshot-discovery recipe (`docs/fork-testing.md`) directly close usability gaps from #1468 and mirror the workflow's own resolution logic.

### Reconciliation note (drift against prior artifacts)

- **Red-CI blocker is STALE, not current.** Prior triage (#1/#5) dispositioned the red `Local Environment Tests` check as a Confirmed blocker at stale head `bec726a650`. At head `98dd8e11` every PR check passes, including "Local Environment Tests"; the exact `jq`/`libjq1` pin that failed is gone (pulled via the `main` merge). It is **not** a current code-review finding — recorded here only to mark the drift. The seed-wiring blocker (CR-1) is the sole surviving merge blocker.

## Structural Analysis

L12 structural lens applied to the from-genesis bring-up path (`local-environment/src/commands/run.ts`) and the seed-provisioning contract it participates in. Structural context gathered directly (TypeScript target; GitNexus index is Rust-only and stale at `bec726a650`, so caller/callee maps come from direct reads: the sole caller of `runFromGenesis` is `runWellKnownNetwork` at `run.ts:84`; the seed consumer is `node/src/command.rs:223-265`).

### Claim

The from-genesis path's deepest structural problem is that it **validates the presence of an input rather than its effect**: it asserts that every compose-referenced env var is *set*, and treats that as evidence the network can run — but the one input that gates block production (the validator seed) is delivered through a channel (`SEED_PHRASE`, an inline phrase) the consumer does not read (`*_SEED_FILE`, a file path). The guard is measuring the wrong thing.

### Dialectic

*Thesis:* "warn about every unset compose var" makes the bring-up honest — an operator who forgets a var is told. *Antithesis:* honesty about *presence* is dishonesty about *effect* when a var can be set yet unwired; the guard's green report is now a false assurance, worse than no guard, because it actively signals "ready" for a network that cannot finalize. The synthesis the code needs — but does not have — is a check on the *provisioning contract* (does a seed reach a keystore?), not on env-var presence.

### Concealment Mechanism

Three layers hide the real problem. (1) The unset-var warning consumes the operator's attention on the *presence* axis, so the *effect* gap never surfaces. (2) The healthcheck (`devnet.network.yaml:45-50`) probes RPC liveness (`/health`), not block height, so a seedless node reports healthy. (3) The fork path *does* satisfy the seed contract (`mockComposeOverride.ts:74-80` injects `*_SEED_FILE` and blanks `SEED_PHRASE`), so the compose files look complete when read in the fork context — the from-genesis path inherits compose files written for a different provisioning regime.

### Improvements (construction-based)

- *Construct:* have `runFromGenesis` assert the seed contract — for each validator service, confirm an `*_SEED_FILE` is set (or a seed file is mounted) before `docker compose up`. *Reveals:* the compose files carry no `*_SEED_FILE` at all on this path; the assertion would fail every from-genesis run today, making the gap loud instead of silent. This is the missing synthesis.
- *Construct:* materialize `SEED_PHRASE` → a seed file in an entrypoint and set `*_SEED_FILE` to it. *Reveals:* this writes a secret to disk inside the container and couples the tool to the node's seed-intake contract — the trade-off that explains why the minimal design shipped (see `portfolio-rejected-paths.md`).

### Structural Invariant

The property that persists through every improvement: **the tool never provisions consensus keys itself on the from-genesis path — it delegates entirely to the compose files.** Correctness of from-genesis is therefore exactly the completeness of the compose files as genesis inputs. Any fix either (a) makes the compose files complete for genesis, or (b) moves provisioning into the tool, breaking the invariant deliberately.

### Conservation Law

**A validator seed is conserved from producer to keystore only if the channel that carries it is the channel the consumer reads.** Producer/clearer ledger — here "producer" = a site that supplies a seed value into a container, "clearer" = the consumer site that materializes it into a keystore (the lifecycle "completes" when a seed reaches the `LocalKeystore`):

| Resource (per validator) | Producer(s) | Consumer / "clearer" | Termination paths traced | Matched? |
|---|---|---|---|---|
| Seed via **fork path** | `mockComposeOverride.ts:74-76` sets `*_SEED_FILE` → generated seed files; `SEED_PHRASE` blanked (`:80`) | `command.rs:223-265` reads `*_SEED_FILE` → keystore | normal bring-up | ✅ Matched — file channel = read channel |
| Seed via **local-env path** | `local-env/docker-compose.yml:415-417` sets `*_SEED_FILE` | `command.rs:223-265` reads `*_SEED_FILE` → keystore | normal bring-up | ✅ Matched |
| Seed via **from-genesis path** | base compose sets `SEED_PHRASE: $MIDNIGHT_NODE_0N_0_SEED` (`devnet.network.yaml:34`…); `*_SEED_FILE` never set (`runFromGenesis` bypasses the mock override) | `command.rs:223-265` reads `*_SEED_FILE` only | genesis bring-up (`run.ts:84-87`) | ❌ **Unmatched** — phrase channel ≠ file channel; seed never reaches keystore |

The conservation law is **falsified on the from-genesis path**: one producing path (genesis) has no matching consumer for the channel it uses. This is the CR-1 Critical, restated as a conserved-quantity violation — the unmatched producer is the empty-keystore/no-finalization bug.

### Meta-Law

The conservation law itself conceals a concrete, testable consequence specific to this code: **any future bring-up mode that reuses the base compose without also supplying `*_SEED_FILE` will replay the exact defect** — because the invariant (tool delegates provisioning to compose) plus the compose files' phrase-only seed wiring guarantees it. Testable prediction: a hypothetical `--from-checkpoint` (or any non-fork mode added to `runWellKnownNetwork`) that routes through the base compose will produce a non-finalizing network for the same reason, and `collectUnsetComposeVars` will again report green. The fix that survives is a provisioning-contract assertion shared by all non-fork modes, not a per-mode patch.

### Bug Table

| # | Location | Description | Severity | Fixable / Structural |
|---|----------|-------------|----------|----------------------|
| SA-1 | `run.ts:158-185` + base compose `SEED_PHRASE` + `command.rs:223-265` | Unmatched producer: from-genesis seed reaches the container via `SEED_PHRASE` but the node reads `*_SEED_FILE`; empty keystore → no finalization | Critical (liveness-halt) | **Structural** — the conservation law predicts it cannot be resolved without either completing the compose files or moving provisioning into the tool; same finding as CR-1 |
| SA-2 | `run.ts:172-177` (`collectUnsetComposeVars` warning) | Guard measures presence, not effect; reports green for a set-but-inert seed var — false "ready" signal | Minor (concealment enabler) | Fixable — replace/augment with a seed-provisioning-contract check; sub-finding of SA-1, not double-counted in routing |

The single new structural bug is SA-1, which is CR-1 reached by the conservation route (not an additional finding — same defect, corroborating evidence). SA-2 is the concealment mechanism, actionable as part of the SA-1 fix.

## Findings Classification & Routing

All findings from code review, structural analysis, and test-suite review on the single scale (Critical / Major / Minor / Nit / Informational). Render map to the consolidated summary: Critical→Critical, Major→High, Minor→Medium, Nit→Low.

| # | Finding (one-line) | Source | File:line | Severity | Impact axis |
|---|--------------------|--------|-----------|----------|-------------|
| CR-1 | From-genesis validator seeds never reach keystore → no finalization | code review | `run.ts:158-185` | **Critical** | liveness-halt |
| CR-2 | README documents a from-genesis happy path that does not finalize | code review | `README.md:55-74` | Minor | — |
| CR-3 | New `throw` line exceeds prettier printWidth 80 (82 chars) | code review | `run.ts:68` | Nit | — |
| CR-4 | `local-environment` TS not linted in CI | code review | `package.json` lint | Nit | — |
| CR-5 | `collectUnsetComposeVars` regex misses `${VAR:-default}`/`$$VAR` (latent) | code review | `run.ts:194` | Nit | — |
| CR-6 | Changelog fragment has empty `PR:`/`Issue:` trailers | code review | `local-env-from-genesis.md:16-17` | Nit | — |
| SA-1 | Unmatched producer: seed channel ≠ read channel (= CR-1) | structural | `run.ts:158-185` | Critical | liveness-halt |
| SA-2 | Guard measures presence not effect (false "ready"; concealment) | structural | `run.ts:172-177` | Minor | — |
| TR-1 | `local-environment/` package has no automated tests | test suite | `package.json:6` | Minor | — |
| TR-2 | No test exercises the from-genesis seed-provisioning failure path | test suite | `run.ts:158-185` | Minor | — |
| TR-3 | No test pins the mutual-exclusivity guard | test suite | `run.ts:67-69` | Nit | — |

SA-1 is CR-1 by another route (not double-counted). CR-1 is classified Critical on the **liveness-halt** impact axis: the change is behaviourally "correct" (the flag works, the compose comes up) yet harmful (the network cannot finalize), so it renders at Critical — not downgraded to "safe" at the render boundary.

**Routing flags:**
- `needs_code_fixes` = **true** — CR-1 (Critical) and CR-2/SA-2 (Minor) are ≥ Minor.
- `needs_test_improvements` = **true** — TR-1/TR-2 (Minor) are ≥ Minor.

Nit/Informational findings (CR-3, CR-4, CR-5, CR-6, TR-3) are left unflagged — documented for author triage, never auto-fixed. **Review mode:** these flags record routing only; no fix cycle runs against the author's code. The flags feed the consolidated review's Action Items tiers.

**Merge-verdict implication:** one Critical (CR-1) stands unaddressed on the authored surface → **Request Changes**. This is consistent with, and independent of, the prior-triage `rating_cap` = request-changes: even with the red-CI blocker now stale, the seed-wiring Critical alone precludes approve/comment. The red-CI blocker (#1/#5) is **not** a current finding — stale at head `98dd8e11` (all checks green).
