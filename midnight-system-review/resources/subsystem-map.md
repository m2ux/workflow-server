---
name: subsystem-map
description: Snapshot of the midnight-node subsystem topology — per-subsystem paths, responsibilities, failure classes, and probe affinities — used to map a change surface onto investigation areas.
metadata:
  order: 1
---

# Midnight Subsystem Map

Snapshot of the midnight-node system topology, distilled from the midnight-agent-eng insight repository. Area derivation maps every changed file onto these entries; a file that maps to none becomes its own candidate area. When `insight_repo_path` is supplied, prefer that checkout's current notes wherever they are fresher than this snapshot — the snapshot is a maintained convenience, not the system of record.

## How to Use

1. Locate each changed file's subsystem below (by path prefix).
2. Read the subsystem's failure classes — they say what a change here can break.
3. Note the coupled subsystems — a change rarely stays local; coupled entries are candidate co-areas.
4. Use the probe affinities to seed planned probes from the probe-catalog.

A subsystem's listed failure classes are the review's coverage contract for that subsystem: when a change puts a subsystem in scope, each of its named failure classes relevant to the change is a probe obligation (see the area-derivation failure-class obligation), not merely background reading. This extends to coupled subsystems at the coupling point — a changed API's callers own the caller-accounting and atomicity failure classes, correlation counterparts own the identifier-correlation classes, and any ABI, runtime, or event-ABI change puts the release-and-upgrade automation in scope for its failure classes even when none of its files is in the diff.

## Runtime Pallets

### pallet-midnight — `pallets/midnight/`

User-transaction execution against the versioned ledger: transaction application, ledger event deposit, extrinsic weights and benchmarks (`pallets/midnight/src/benchmarking.rs`).

- Failure classes: event fidelity/privacy leaks, unpriced execution work (benchmark coverage vs configured ledger limits such as bytesChurned), weight-vs-work divergence.
- Coupled with: ledger/host ABI, SCALE metadata (event enums are ABI), runtime spec identity.
- Probe affinities: source tracing, weight/benchmark comparison, SCALE/size probes.

### pallet-midnight-system — `pallets/midnight-system/`

System (non-user) transaction execution: root governance path (`send_mn_system_transaction`) and the internal executor; emits `SystemTransactionApplied`.

- Failure classes: event/hash contract mismatches (state root vs transaction hash correlation), governance path divergence from the user path, fixed-weight paths accepting variable work.
- Coupled with: c2m-bridge and cnight-observation (callers), SCALE metadata, indexer correlation.
- Probe affinities: source tracing, code-graph caller queries, event-contract comparison.

### pallet-c2m-bridge — `pallets/c2m-bridge/`

Cardano-to-Midnight transfer accounting: approved transfer hashes (`ApprovedMcTxHashes`), subminimal transfer pooling (`SubminimalTransfers`), execution of bridge system transactions.

- Failure classes: accounting state consumed before/despite failed execution (permanent cross-chain loss), swallowed executor errors, non-atomic storage mutation around fallible calls.
- Coupled with: pallet-midnight-system (executor), cnight-observation, ledger failure semantics.
- Probe affinities: source tracing on error paths, atomicity inspection, code-graph flow queries.

### pallet-cnight-observation — `pallets/cnight-observation/`

Cardano observation processing (`process_tokens`): mints/updates from observed Cardano state under mandatory weights.

- Failure classes: mandatory weight priced on partial work (UTXO count vs event payload growth), unbounded payloads through fixed-weight paths.
- Coupled with: pallet-midnight-system, pallet-midnight event deposit, throttle.
- Probe affinities: weight/benchmark comparison, source tracing.

### Supporting pallets — `pallets/{federated-authority,federated-authority-observation,system-parameters,throttle,version}/`

Authority set management and its observation feed, on-chain parameters, rate limiting, and runtime/ledger version signalling.

- Failure classes: authority/parameter drift, throttle bypass, version-signal divergence from actual ABI.
- Probe affinities: source tracing, parameter comparison.

## Ledger and Host Boundary

### Ledger integration and host ABI — `ledger/` (boundary types: `ledger/src/common/types.rs`)

The versioned ledger (v7/v8/v9 side by side) behind shared host-function types; structs such as `TransactionAppliedStateRoot` / `SystemTransactionAppliedStateRoot` cross the native host boundary between node binary and Wasm runtime.

- Failure classes: mixed-binary decode incompatibility (new runtime decoding an old binary's host response, or the reverse), shared-type evolution without versioning, ledger failure semantics (what the runtime sees when ledger execution fails).
- Coupled with: every pallet that executes transactions; runtime upgrade automation (binary-first ordering).
- Probe affinities: struct-evolution diffing across ledger versions, host-function signature tracing, mixed-version reasoning.

## Runtime Identity and ABI Surface

### Runtime and spec identity — `runtime/src/lib.rs`

Runtime composition and `spec_version` — the identity release automation and metadata caches key on.

- Failure classes: ABI-changing PRs that leave `spec_version` unbumped, upgrade activation without compatibility gates.
- Coupled with: SCALE metadata, release automation.
- Probe affinities: spec-version-vs-ABI-diff comparison, metadata cache invalidation reasoning.

### SCALE metadata and indexer surface — `metadata/` (static: `metadata/static/*.scale`), `indexer/`

Generated static SCALE metadata and its consumers: static subxt bindings (`metadata/src/lib.rs`) and the version-aware indexer.

- Failure classes: stale checked-in metadata after event/ABI changes (consumers cannot decode new variants), indexer correlation contracts (e.g. matching system-transaction records to ledger events by hash).
- Coupled with: all event-emitting pallets, runtime spec identity.
- Probe affinities: metadata comparison (`strings` over `.scale`, decode checks), consumer-side tracing.

## Operations and Tooling

### Release and upgrade automation — `.github/workflows/` (notably `release-image.yml`), `local-environment/src/commands/`

Image build/publish, runtime tag derivation from `spec_version`, and the federated upgrade flows (`imageUpgrade.ts`, `federatedRuntimeUpgrade.ts`) that order binary rollout before runtime activation.

- Failure classes: publishing a changed ABI under an unchanged version tag, activation without verifying every validator runs a compatible binary, advertised CLI controls (include/exclude filters) not actually applied.
- Coupled with: runtime spec identity, ledger/host ABI compatibility.
- Probe affinities: workflow-file tracing, execution probes of tooling paths, upgrade-ordering reasoning.

### Node service and RPC — `node/`

Node service wiring, host-function provisioning, and the RPC surface consumers retrieve events and state through.

- Failure classes: host-function wiring drift, RPC retrieval gaps for new data.
- Probe affinities: source tracing, runtime/RPC execution probes (node binary gate).

### Local environment tooling — `local-environment/`

Federated local network orchestration used to rehearse rollouts and upgrades.

- Failure classes: rehearsal-vs-production divergence, unapplied orchestration options.
- Probe affinities: execution probes, tooling source tracing.
