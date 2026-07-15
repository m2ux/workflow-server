# local-environment Tooling & From-Genesis Seed-Wiring — Comprehension Artifact

> 2026-07-15 · work packages: Review midnight-node PR #1807 · coverage: `local-environment` TS package (run flow, from-genesis mode, compose var handling), well-known-network compose files, node seed-import path (`node/src/command.rs`), the fork-network CI workflow, and the contract-compiler CI image · related: [01-prior-feedback-triage.md](01-prior-feedback-triage.md), [02-design-philosophy.md](02-design-philosophy.md)

Comprehension is scoped to what the review must adjudicate: PR #1807's diff (7 root-level files, +161/-9) and the two prior-Confirmed blockers, re-checked against current head `98dd8e11`. GitNexus is indexed at the stale head `bec726a650`; because this PR is shell/CI/docs/TypeScript, comprehension used direct diff and file reads rather than the stale structural index.

## Architecture Overview

### Project Structure

`local-environment/` is a standalone TypeScript CLI (Commander) that orchestrates Docker Compose to bring up test networks on a developer machine. Entry points:

- [`src/index.ts`](../../../../local-environment/src/index.ts) — Commander program; declares the `run` command and its options (`--from-snapshot`, and now `--from-genesis`).
- [`src/commands/run.ts`](../../../../local-environment/src/commands/run.ts) — the `run` orchestration: dispatches on `network` (`local-env` vs. well-known) and on mode (fork-from-snapshot / reuse / from-genesis).
- [`src/lib/types.ts`](../../../../local-environment/src/lib/types.ts) — `RunOptions` interface (adds `fromGenesis?: boolean`).
- `src/networks/well-known/<net>/<net>.network.yaml` — per-network Docker Compose files (the "base compose"), one per network (devnet, qanet, govnet, preview, preprod, mainnet, testnet-02, node-dev-01).
- `src/networks/local-env/` — the bundled local Cardano/partner-chain stack (`docker-compose.yml`) plus a `contract-compiler` build image.

### Module Map

Three bring-up paths inside `runWellKnownNetwork`:

1. **Fork-from-snapshot** (default) — `restoreSnapshot` + `mock-authorities` rewrite, then `runDockerCompose`.
2. **Reuse existing fork** — reuses restored `data/` + generated mock-authorities output.
3. **From-genesis** (new in this PR) — `runFromGenesis`: no snapshot, no mock-authorities; runs the base compose from block 0, passing env through unchanged, after emitting stale-data and unset-var warnings.

### Design Patterns

Thin imperative orchestration over `docker compose`. The CLI's job is to select a compose file, compute an env map, optionally rewrite mock state, and shell out. It does not itself provision consensus keys — that is the node container's responsibility, driven entirely by the env/args the compose file passes in. This boundary is the crux of the seed-wiring blocker.

## Key Abstractions

### Bring-up modes (`RunOptions`)

`fromSnapshot?: string` and `fromGenesis?: boolean` are mutually exclusive (enforced by an early `throw` in `runWellKnownNetwork`). `fromGenesis` selects the `runFromGenesis` path, which returns before the snapshot/mock-authorities branch is reached.

### `collectUnsetComposeVars(composeFile, env)`

Reads the compose file text and regex-matches env-var references `\$\{?([A-Z][A-Z0-9_]*)`, returning those absent/blank in `env`. This is the PR's guard against silently-missing configuration — it warns, it does not fail. Note it recognizes `$VAR` and `${VAR...}` but does **not** special-case `${VAR:-default}` (would flag a var that has a compose-level default) or `$$VAR` (compose's literal-`$` escape) — a latent precision gap, not currently exercised by any well-known compose file.

### Node seed import (`node/src/command.rs`, lines 214–275)

The node consumes validator seeds **only** from four file-path config fields on `MidnightCfg` ([`node/src/cfg/midnight_cfg/mod.rs:50-65`](../../../../node/src/cfg/midnight_cfg/mod.rs#L50)): `aura_seed_file`, `babe_seed_file`, `grandpa_seed_file`, `cross_chain_seed_file`. Each is read with `std::fs::read_to_string(seed_file)`, parsed via `Pair::from_string_with_seed`, and inserted into the `LocalKeystore`. The struct doc-comments state each is a "Path to file containing a secret string". These derive from the `*_SEED_FILE` env vars. There is **no** code path that reads an inline `SEED_PHRASE` env var and materializes a keystore entry from it.

## Design Rationale

### From-genesis is a "pass-through" bring-up

- **Observation**: `runFromGenesis` mocks nothing; it warns about unset vars and stale data, then runs the base compose detached.
- **Hypothesized rationale**: restore the pre-#1470 genesis path (removed with the k8s/AWS integration) with the least machinery, treating the base compose as the source of truth for real inputs.
- **Trade-offs**: optimizes for simplicity and honesty (no mocking); sacrifices completeness — it assumes the base compose already wires every real input the node needs, which is not true for the consensus seed (see blocker below).
- **Implications for changes**: correctness of from-genesis depends entirely on the compose files being complete. The unset-var warning is necessary but not sufficient: a var can be *set* yet functionally inert.
- **Portfolio-lens insight** (see [portfolio-synthesis.md](portfolio-synthesis.md)): fixing the seed gap is a trade-off, not a pure win. Provisioning seeds *inside* the tool would remove the silent no-finalization but introduce secret-on-disk exposure and tight coupling to the node's `*_SEED_FILE` contract; keeping provisioning out (this PR) keeps the tool secret-free but defers an invisible correctness gap. Downstream review should frame the finding as a "where does seed provisioning live" decision, not a one-line wiring fix.

## Data Flow and Operational Context

### Data Flow Map (from-genesis seed path)

`--env-file`/env → `run.ts` env map → `runDockerCompose` → compose `SEED_PHRASE: $MIDNIGHT_NODE_0N_0_SEED` → node container environment. **Dead-ends here.** The node never reads `SEED_PHRASE`; it reads `*_SEED_FILE` paths. Producer (compose) sets `SEED_PHRASE`; consumer (`command.rs`) assumes `*_SEED_FILE`. Gap: the value never reaches a keystore, so consensus keystores stay empty and the from-genesis network produces no blocks.

### Invariant Alignment

| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| Validator seed reaches the keystore | No — compose sets `SEED_PHRASE` only (inert) | Yes — `command.rs` reads `*_SEED_FILE` file paths | **Yes** — set-but-unconsumed; empty keystore, no block production |
| `collectUnsetComposeVars` catches the gap | No — `SEED_PHRASE` *is* set (to `$MIDNIGHT_NODE_0N_0_SEED`), so it is not flagged | — | **Yes** — warning cannot detect a var that is set but functionally unwired |

### Operational Scenarios

| Scenario | Effect on This Code Path | Risk |
|----------|------------------------|------|
| Genesis / first invocation | Containers start; consensus keystores empty; chain never finalizes | High — silent no-block-production; the blocker |
| Recovery after downtime (stale `data/`) | Warning fires; nodes resume from existing chain data rather than genesis | Low — warned |
| Env var unset | Warning fires listing the var | Low — warned (but see set-but-inert case above) |

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| From-genesis | `RunOptions.fromGenesis` → `runFromGenesis` | Bring the base compose up from block 0, no snapshot/mock |
| Fork mode | `restoreSnapshot` + mock-authorities | Default well-known bring-up from a snapshot |
| Validator seed | `SEED_PHRASE` (compose) vs. `*_SEED_FILE` (node) | The mismatch at the heart of the seed-wiring blocker |
| Base compose | `<net>.network.yaml` | Per-network Docker Compose definition |
| contract-compiler | `local-env/.../contract-compiler/Dockerfile` | CI image whose `jq` install drove the earlier red check |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | At head `98dd8e11`, is `SEED_PHRASE` consumed anywhere (Rust, shell, entrypoint, Dockerfile)? | Resolved | No. `SEED_PHRASE` appears only in the 9 well-known compose YAMLs; no consumer in `node/src`, scripts, or images. Node reads `*_SEED_FILE` paths. Seed-wiring blocker **holds**. | Blocker 1 — From-genesis seed wiring |
| 2 | Is the `Local Environment Tests` CI check still red at head `98dd8e11`? | Resolved | No. All PR checks are SUCCESS, including `Local Environment Tests`. The contract-compiler Dockerfile now installs `jq` **unpinned**; the exact-version pin that caused the `libjq1` drift is gone (resolved by the `main` merge in `98dd8e11`). Red-CI blocker **no longer holds at current head**. | Blocker 2 — Red CI check |
| 3 | Does `collectUnsetComposeVars` mishandle `${VAR:-default}` / `$$VAR`? | Resolved | Yes, latent: regex `\$\{?([A-Z][A-Z0-9_]*)` doesn't special-case either form. Not exercised by any current well-known compose file. Non-blocking (matches triage #5c). | — (see Key Abstractions) |
| 4 | Does the new `throw` line fail `local-environment` lint, and is that linted in CI? | Resolved | The one-line `throw new Error("--from-genesis and --from-snapshot are mutually exclusive.")` exceeds prettier 3.5.3 default printWidth 80, so `prettier --check` (the `lint` script) would flag it; no CI job runs `local-environment`'s lint, so it is uncaught. Non-blocking (matches triage #5c). | — |

Remaining follow-up items (out of scope for this comprehension pass):
- Exact `local-environment` package test coverage (triage #5c notes zero automated tests) — assessed in test-suite review, not here.
- `docker inspect` bridge-IP concatenation robustness if node1 joined >1 network (triage #5c; not the case today).

## Deep-Dive Sections

### Blocker 1 — From-genesis validator seed wiring — [2026-07-15]

**Verified against head `98dd8e11`.** Repo-wide search for `SEED_PHRASE` returns matches **only** in the nine `well-known/*/​*.network.yaml` compose files (e.g. [devnet.network.yaml:34](../../../../local-environment/src/networks/well-known/devnet/devnet.network.yaml#L34) `SEED_PHRASE: $MIDNIGHT_NODE_01_0_SEED`). No `.rs`, `.sh`, `Dockerfile`, `.toml`, or entrypoint consumes it. The node's only seed intake is file-path based ([`command.rs:223-275`](../../../../node/src/command.rs#L223)): each `*_seed_file` is `fs::read_to_string`-ed and inserted into the keystore; an unset file field simply skips insertion. The compose files set `SEED_PHRASE` (inline phrase) but never set `AURA_SEED_FILE`/`BABE_SEED_FILE`/`GRANDPA_SEED_FILE`/`CROSS_CHAIN_SEED_FILE`, and no entrypoint converts one into the other. Consequence: from-genesis validator containers boot with empty consensus keystores → no block authorship/finalization. `collectUnsetComposeVars` cannot catch this because `SEED_PHRASE` *is* referenced-and-satisfiable, so it never appears in the unset list. **Blocker holds at current head.**

### Blocker 2 — Red `Local Environment Tests` CI check — [2026-07-15]

**Does not hold at head `98dd8e11`.** `gh pr view 1807 --json statusCheckRollup` at the current head shows every check SUCCESS, including `Local Environment Tests` (0 FAILURE across the rollup; `cargo-deny` NEUTRAL, `license/cla` null-status — neither a failure). The prior triage's root cause — an exact `jq` version pin colliding with `libjq1` drift in [`contract-compiler/Dockerfile`](../../../../local-environment/src/networks/local-env/configurations/contract-compiler/Dockerfile) — is gone: the Dockerfile now installs `jq` **unpinned** (`apt-get install -y --no-install-recommends jq curl ...`, no `=1.6-2.1+deb12u1`). The PR head `98dd8e11` is a `Merge branch 'main'` commit that pulled in this fix. The prior triage's Confirmed disposition was correct at the stale head `bec726a650` but is stale relative to the authoritative current head. Downstream validation should re-anchor this finding to `98dd8e11`.
