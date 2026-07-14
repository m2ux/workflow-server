# Change Surface Inventory

## Target identity

| Field | Value |
|---|---|
| Review target | Pull request #1849 — `midnightntwrk/midnight-node` |
| Title | feat(1474): expose ledger-emitted events from the node |
| State | OPEN |
| Head branch | `feat/1474-ledger-events-v2` |
| Base branch | `main` |
| Head SHA (pinned review head) | `61c9c3498db07e8b6457b9165d8bf0df29a2faad` |
| Base ref | `origin/main` (`797e76c3cae5223d1795d701ad60d9e4dcc99513` at fetch time) |
| Merge base (three-dot diff base) | `eb2a8025277903d6fe4a628e1d506f54f184b27b` |
| Local checkout | `/home/mike1/projects/work/midnight-node/2026-07-14-msr-blind-run-pr1849` (detached HEAD at review head) |
| Totals | 13 files changed, +395 / −45 lines |

Surface resolution: the GitHub-listed file set (`gh pr diff --name-only`, 13 files) and the local three-dot merge-base diff (`git diff origin/main...HEAD`) agree exactly — the inventory below is the authoritative authored surface.

## Changed-file table

| Path | Kind | +/− | Crate / pallet |
|---|---|---|---|
| `changes/runtime/added/expose-ledger-events.md` | A | +21/−0 | — (change file, runtime/added) |
| `docs/ledger-events.md` | A | +54/−0 | — (documentation) |
| `ledger/src/common/types.rs` | M | +40/−0 | `midnight-node-ledger` |
| `ledger/src/versions/common/api/ledger.rs` | M | +48/−11 | `midnight-node-ledger` |
| `ledger/src/versions/common/api/mod.rs` | M | +9/−0 | `midnight-node-ledger` |
| `ledger/src/versions/common/mod.rs` | M | +27/−5 | `midnight-node-ledger` |
| `ledger/src/versions/common/types.rs` | M | +5/−0 | `midnight-node-ledger` |
| `metadata/static/midnight_metadata.scale` | M | binary | — (static SCALE runtime metadata) |
| `metadata/static/midnight_metadata_2.0.0.scale` | M | binary | — (static SCALE runtime metadata) |
| `pallets/midnight-system/src/lib.rs` | M | +43/−23 | `pallet-midnight-system` |
| `pallets/midnight/src/benchmarking.rs` | M | +54/−1 | `pallet-midnight` |
| `pallets/midnight/src/lib.rs` | M | +9/−1 | `pallet-midnight` |
| `pallets/midnight/src/tests.rs` | M | +85/−4 | `pallet-midnight` |

## Preliminary path-to-crate/pallet mapping (seeds area derivation)

- **`midnight-node-ledger`** (`ledger/`) — 5 files, +129/−16. Ledger version bridge / apply-path API surface: `versions/common/api/*`, `versions/common/mod.rs`, plus shared type additions in `common/types.rs` and `versions/common/types.rs`.
- **`pallet-midnight`** (`pallets/midnight/`) — 3 files, +148/−6. Runtime pallet: event variant in `lib.rs`, new benchmark in `benchmarking.rs`, test coverage in `tests.rs`.
- **`pallet-midnight-system`** (`pallets/midnight-system/`) — 1 file, +43/−23. Inherent/system pallet: event variant and apply-site changes in `lib.rs`.
- **Static runtime metadata** (`metadata/static/*.scale`) — 2 binary files, regenerated SCALE metadata reflecting the new event variants.
- **Docs and change tracking** — `docs/ledger-events.md` (new doc), `changes/runtime/added/expose-ledger-events.md` (change file).

## PR-stated intent (from PR title/body inline text only)

Expose the ledger's per-transaction events as additive Substrate runtime events (`Event::LedgerEvent` on both pallets — index 8 on `pallet-midnight`, index 1 on `pallet-midnight-system`) so consumers (indexer foremost) read them from the node instead of re-executing transactions. A `build_ledger_events` helper serialises each ledger event as tagged bytes into an additive `events` field on both apply-return structs, version-uniform across ledger v7/v8/v9. Emission is left unpriced (FRAME whitelisted-event convention) with `bench_block_full_of_events` as a worst-case guardrail. PR body's own TODO list notes: not compiled on the authoring machine; runtime metadata rebuild, minor version bump, partial-success/integration test cases, decode-safety against historical replay, and per-event serialisation cost all outstanding.

## Publish eligibility

`has_pr_surface = true` (PR #1849, OPEN, postable review surface). `pr_number = 1849`.

## Toolchain Availability

| Toolchain | Gate | Probe performed | Result |
|---|---|---|---|
| GitNexus code graph | `gitnexus_available = false` | `list_repos` over the GitNexus MCP index | A `midnight-node` index exists but is bound to a different checkout (`/home/mike1/projects/dev/midnight-agent-eng/midnight-node`), indexed 2026-06-12 at commit `d1b6a8d3` — neither the review worktree nor the review head. No fresh, queryable index for `{target_repo_path}`. |
| cargo | `cargo_available = true` | `cargo metadata --format-version 1 --no-deps --offline` against the target workspace manifest (cargo 1.95.0 at `/home/mike1/.cargo/bin/cargo`) | Exit 0; full workspace metadata resolved (421 KB). Build and metadata probes are available. |
| midnight-node binary | `node_binary_available = false` | Checked `target/{release,debug}/midnight-node` in the review worktree, sibling worktree `target/release` dirs, `PATH`, `~/.cargo/bin`, `~/.local/bin`, `/usr/local/bin` | No binary found anywhere; no version query possible. |

**Downstream degradation:** with `gitnexus_available` false, code-graph probes (call-graph, impact, execution-flow queries) fall back to grep and file reads in the review worktree. With `node_binary_available` false, runtime and SCALE-metadata probes are unavailable — notably, the regenerated `metadata/static/*.scale` files cannot be cross-checked against a live node's metadata; verification degrades to static inspection and cargo-based checks. cargo being available keeps build, check, and test probes fully on their capability path.
