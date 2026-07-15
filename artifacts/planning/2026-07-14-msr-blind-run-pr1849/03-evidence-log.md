# Evidence Log — PR #1849 (expose ledger-emitted events)

Consolidated evidence base for the 9 investigation areas in `02-investigation-plan.md`, probed
against the review head `61c9c349` (`chore: rebuild metadata (midnight-node#1474)`) in
`/home/mike1/projects/work/midnight-node/2026-07-14-msr-blind-run-pr1849`, three-dot base
`eb2a8025`. Toolchain in force: `cargo_available=true` **but effectively degraded** (see the
cross-cutting P5 note), `gitnexus_available=false` (P2 → grep + reads), `node_binary_available=false`
(P6 blocked). Evidence anchors are `file:line` in the target repo unless prefixed `insight:` (the
midnight-agent-eng insight checkout, read as subsystem/architecture material only).

Independence maintained: no PR comments/reviews/bot output read; no PR-body hyperlinks followed; insight
repo used for ledger/architecture source only.

## Cross-cutting blocked validation — P5 (build) is uniformly unavailable

Planned for A1, A2, A5. `cargo_available=true` in principle, but **the build cannot resolve offline**:
the workspace pins `polkadot-sdk` at tag `polkadot-stable2606`, rev `660acefe`
(`ledger/Cargo.toml` → `frame-support` git dep). That rev is **not** in the local cargo git cache — the
bare db `~/.cargo/git/db/polkadot-sdk-dee0edd6eefa0594` has no object `660acefe` (`git cat-file -t
660acefe` → "Not a valid object name"), and the only checked-out worktree is a different rev `2e4dd0b`.
Materialising `660acefe` requires a network fetch, which the `sbx` sandbox blocks. Command evidence:
`cargo check -p midnight-node-ledger --offline` → `unable to update
https://github.com/paritytech/polkadot-sdk.git?tag=polkadot-stable2606 … you are in the offline mode`.

**Consequence:** every compile-level claim (both `cargo check` and `cargo check --features
runtime-benchmarks`) caps at static-inspection confidence. This matters most because the **PR body itself
states the code was not compiled on the authoring machine** — so compile status is unconfirmed on both
the author's side and this review's side. The prior interrupted change-surface probe had run `cargo
metadata` successfully (that only reads the manifest graph, no dependency checkout), which is why the gate
was initially read as `true`; a full type-check needs the un-cached dependency.

## Per-area accounting

| Area | Probes planned | Executed | Blocked | Candidate findings raised |
|---|---|---|---|---|
| A1 | P4, P1, P5 | P4, P1 | P5 (build) | 1 (mixed-binary decode of appended struct field) |
| A2 | P1, P2, P5 | P1, P2(degraded) | P5 (build) | 1 (serialise-`?` fails whole apply); 1 positive (path parity) |
| A3 | P1, P4 | P1, P4 | — | 0 (behaviour matches claims) |
| A4 | P1, P2 | P1, P2(degraded) | — | 0 (atomicity + parity hold) |
| A5 | P4, P1, P5 | P4, P1 | P5 (benchmark build) | 1 (unanchored worst-case bound + unpriced/serialisation-cost gap) |
| A6 | P3, P4, P1 | P3, P4, P1 | P6 (live-node metadata) | 1 (doc tag `[v14]` unsubstantiated); 1 (rebuild note stale) |
| A7 | P3, P1 | P3, P1(degraded) | — | 1 (spec_version unbumped despite ABI change) |
| A8 | P1, P4 | P1, P4 | — | 1 observation (verbatim forward; no redaction/allowlist; `#[non_exhaustive]` forward-compat) |
| A9 | P1, P3 | P1, P3 | — | 2 (both reinforce A6 doc findings) |

All 9 areas produced exactly one record, in order; every executed-probe count is ≤ `probe_budget_per_area`
(4). No overage. P2 recorded degraded (grep + reads) in A2/A4/A7; P5 blocked in A1/A2/A5; P6 blocked in A6.

---

## A1 — Ledger host-boundary type evolution & mixed-binary decode

**Probes:** P4 (SCALE decode reasoning), P1 (host-boundary tracing). P5 blocked (see cross-cutting note).

**Evidence items.**
- `ledger/src/common/types.rs:60-72` — `TransactionAppliedStateRoot` derives `Encode, Decode,
  DecodeWithMemTracking`; `events: Vec<LedgerEvent>` appended as the **trailing field** (line 71).
- `ledger/src/common/types.rs:74-80` — `SystemTransactionAppliedStateRoot`, same derive, `events` appended
  trailing (line 79).
- `ledger/src/common/types.rs:45-58` — new `LedgerEventSource { transaction_hash: Hash, logical_segment:
  u16, physical_segment: u16 }` and `LedgerEvent { source, content_tagged_bytes: Vec<u8> }`.
- `ledger/src/common/types.rs:88-90` — the adjacent `Op` enum carries an explicit wire-significance
  comment ("SCALE-encoded across the `get_decoded_transaction` runtime-API boundary … variant indices are
  wire-significant"). The codebase demonstrably understands cross-boundary SCALE-evolution hazards, yet the
  new struct-field append ships **no equivalent versioning note or guard**.
- `ledger/src/host_api/ledger_9.rs:48-49` — `#[runtime_interface] pub trait Ledger9Bridge`. `apply_transaction`
  returns `AllocateAndReturnByCodec<Result<TransactionAppliedStateRoot, LedgerApiError>>` (line 114);
  `apply_system_transaction` returns `…SystemTransactionAppliedStateRoot…` (line 142). Mirrored in
  `host_api/ledger_7.rs:133,162,190` and `host_api/ledger_8.rs:114,142`.
- The runtime-side consumers are `versions/common/mod.rs:315` (`apply_transaction`) and `:528`
  (`apply_system_transaction`), which construct the structs (mod.rs:434, 551) — the values are SCALE-encoded
  on the native (node-binary) provider side and SCALE-decoded on the Wasm (runtime) caller side.

**Decode-compatibility reasoning (P4).** SCALE structs are decoded field-by-field with no length prefix. An
**old decoder** (runtime or binary that predates the field) reading a **new** encoding stops after
`unshielded_utxos_spent` and leaves the `events` bytes as unconsumed trailing data; a **new decoder** reading
an **old** (shorter) encoding runs off the end seeking the `events` field and fails to decode. Because these
structs cross the native↔Wasm host boundary and node binary vs runtime Wasm are independently upgradeable in
Substrate, a version-skew window is real (elaborated in A7). The PR ships no versioning of these structs.

**Candidate finding A1-1.** Appending `events: Vec<LedgerEvent>` to two `#[derive(Decode)]` host-boundary
structs is a backward-incompatible SCALE change with no version guard; a mixed old/new binary↔runtime pairing
can misdecode the apply-return value. Anchors: `types.rs:71,79` (append), `host_api/ledger_9.rs:114,142` (the
boundary), `types.rs:88-90` (the repo's own precedent that this class of change is wire-significant).
*Reachability caveat:* in Substrate practice the runtime Wasm is normally shipped/executed with a compatible
binary; whether the skew is reachable in the deployment turns on the binary-before-runtime ordering (A7).

---

## A2 — Event bridge apply-path: sourcing, serialisation, failure semantics

**Probes:** P1 (trace `build_ledger_events`), P2 degraded (call-site enumeration by grep). P5 blocked.

**Evidence items.**
- `ledger/src/versions/common/mod.rs:573-588` — `build_ledger_events(api, events: &[Event<D>]) ->
  Result<Vec<LedgerEvent>, LedgerApiError>`: maps each `Event<D>` to `LedgerEventSource` from
  `ev.source.{transaction_hash.0.0, logical_segment, physical_segment}` and
  `content_tagged_bytes = api.tagged_serialize(&ev.content)?`, then `.collect()` into `Result<Vec<_>,_>`.
- **The `?` inside the map + `.collect::<Result<…>>()` means a single event's serialisation failure aborts the
  whole helper** and (via the `?` at each call-site) the whole apply.
- Call-site enumeration (grep, P2 degraded): `build_ledger_events` has exactly **two** call-sites —
  `mod.rs:444` (user path, inside `TransactionAppliedStateRoot` construction) and `mod.rs:555` (system path,
  inside `SystemTransactionAppliedStateRoot`) — plus the definition at `:574`. **Both paths use the same
  helper** → no divergence in how `events` is built.
- **Atomicity ordering (the key nuance):** user path — `build_ledger_events` at mod.rs:444 runs *before*
  `new_ledger.persist()` at `mod.rs:503` (comment "Only update state after no errors", `mod.rs:497`). System
  path — `build_ledger_events` at `mod.rs:555` runs *before* `ledger.persist()` at `mod.rs:559` (comment
  `mod.rs:558`). So a serialisation failure returns via `?` **before** state is committed → **state and events
  stay consistent**; there is no "events emitted but state rolled back" path.
- Failure/partial-success (P1): `api/ledger.rs:164-177` — `TransactionResult::Success(events) => Ok((…,
  events))`, `PartialSuccess(segments, events) => Ok((…, events))`, `Failure(reason) => Err(…)`. **Failure
  returns an error, never a tuple → no events on failure.** Grounded against insight source:
  `insight:midnight-ledger/ledger/src/semantics.rs:85-92` (`TransactionResult::{Success(Vec<Event<D>>),
  PartialSuccess(BTreeMap, Vec<Event<D>>), Failure(TransactionInvalid<D>)}`) and its own
  `TransactionResult::events()` returning `&[]` for `Failure` (`semantics.rs:96-100`). Field access grounded:
  `insight:events.rs:40-42` (`Event<D> { source: EventSource, content: EventDetails<D> }`).
- New error plumbing: `ledger/src/versions/common/types.rs:236` adds `SerializationError::EventDetails`;
  `:396` maps it to wire code `64` (appended after `ArenaHash=63` — safe trailing position);
  `api/mod.rs:136-142` impls `SerializableError for EventDetails<D>` returning that variant.

**Candidate finding A2-1 (low, availability).** A single un-serialisable ledger event fails the *entire*
transaction apply (`build_ledger_events` `?` → `LedgerApiError::Serialization(EventDetails)`), turning an
otherwise-valid transaction into a failed apply. State stays consistent (persist is after), so this is a
liveness/availability concern, not corruption. *Reachability is low:* it mirrors the pre-existing
`?`-on-`tagged_serialize` convention already used for `state_root` and address serialisation (mod.rs:435,
455, 463, 471, 552), and the round-trip test `should_emit_events_whose_payload_round_trips`
(`api/ledger.rs:386-405`) shows normal `EventDetails` serialising cleanly. A failure would require a
serialisation bug in the ledger itself.

**Positive observation A2-2.** User and system apply paths build `events` through the identical
`build_ledger_events` helper — no path divergence (both call-sites, mod.rs:444 / :555).

---

## A3 — pallet-midnight event surface, deposit ordering & partial-success

**Probes:** P1 (deposit sequence), P4 (variant-index stability).

**Evidence items.**
- `pallets/midnight/src/lib.rs:242-260` — `Event` enum order: `ContractCall`(0), `ContractDeploy`(1),
  `TxApplied`(2), `ContractMaintain`(3), `PayoutMinted`(4), `ClaimRewards`(5), `UnshieldedTokens`(6),
  `TxPartialSuccess`(7), **`LedgerEvent(LedgerEvent)`(8)** appended last (lines 259-260). All prior indices
  unchanged.
- `pallets/midnight/src/tests.rs` `ledger_event_is_last_variant` — asserts `Event::LedgerEvent(…).encode()[0]
  == 8`, i.e. discriminant byte 8. Matches enumeration. (P4 confirmed.)
- Deposit sequence in `send_mn_transaction` (P1): `lib.rs:395` ContractCall → `:399` ContractDeploy → `:405`
  ContractMaintain → `:411` ClaimRewards → `:419` UnshieldedTokens → **`:425-428` `for ledger_event in
  result.events { deposit_event(Event::LedgerEvent(ledger_event)) }`** → `:430-434`
  `TxApplied`/`TxPartialSuccess`. So `LedgerEvent`s precede the terminal marker.
- `result.events` is consumed by-value regardless of `all_applied`; on partial success the events are the
  ledger-filtered `PartialSuccess(_, events)` set (A2) — **the pallet does not re-filter or re-attribute**; it
  relies on upstream filtering. Test `test_send_mn_transaction` updated to assert `events[0] ==
  ContractDeploy`, `events.last() == TxApplied`, and at least one `LedgerEvent` in between; test
  `test_send_mn_transaction_deposits_ledger_events` asserts every emitted `LedgerEvent.source.transaction_hash
  == TxApplied.tx_hash`.

**Verdict:** behaviour matches documented claims (append-last, index-8, events-before-terminal,
upstream-filtered). No candidate finding.

---

## A4 — pallet-midnight-system dual apply-sites: atomicity & governance/executor parity

**Probes:** P1 (both apply-sites' ordering), P2 degraded (executor callers + field-by-field parity).

**Evidence items.**
- `pallets/midnight-system/src/lib.rs:27-32` — `Event<T>` enum: `SystemTransactionApplied`(0),
  **`LedgerEvent(LedgerEvent)`(1)** appended. Index-1 append matches the change-file/PR claim.
- Governance path `send_mn_system_transaction` (`lib.rs:121-162`): events captured *inside* the
  `mut_ledger_state` closure — `Ok::<(Vec<u8>, (Hash, Vec<LedgerEvent>)), Error<T>>((result.state_root,
  (result.tx_hash, result.events)))` (`:143-146`), bound only after the closure returns via `?` (`:147`); then
  `SystemTransactionApplied` deposited (`:149-154`), then `for ledger_event in ledger_events {
  deposit_event(LedgerEvent) }` (`:156-159`).
- Executor path `execute_system_transaction` (`MidnightSystemTransactionExecutor`, `lib.rs:165-199`):
  identical structure — closure returns same tuple (`:182-185`), `?` (`:186`), `SystemTransactionApplied`
  (`:189-191`), `LedgerEvent` loop (`:193-196`).
- **Atomicity (P1):** in both, `mut_ledger_state`'s `?` propagation means the state mutation is committed
  before `ledger_events` is bound; the deposit loops run strictly after. No early-return exists between the
  committed closure and the deposit. → events deposited only on committed state; no emit-then-rollback path.
- **Parity (P2 degraded):** the two sites are field-by-field identical in the event contract (same closure
  return type, same `(state_root,(tx_hash,events))`, same `SystemTransactionApplied`-then-`LedgerEvent`-loop
  ordering). Real (non-mock) callers of the executor path: `pallets/c2m-bridge/src/lib.rs:266` and
  `pallets/cnight-observation/src/lib.rs:737` — both consume only `Result<Hash, DispatchError>` and do not
  observe events directly; events land in `frame_system::Events` regardless. So bridge/observation-triggered
  system txs now emit `LedgerEvent`s identically to governance. No parity gap.

**Observation (no defect).** Pre-existing cosmetic difference: governance path reads
`runtime_version`/`block_context` *outside* the closure (`:131-132`); executor path reads them *inside*
(`:172-174`). Not introduced by this PR's event logic and irrelevant to the event contract.

**Verdict:** atomicity and parity hold. No candidate finding.

---

## A5 — Event-emission pricing, weight-vs-work & benchmark fidelity

**Probes:** P4 (bound arithmetic), P1 (WeightInfo wiring). P5 blocked (benchmark build — cross-cutting note).

**Evidence items.**
- `pallets/midnight/src/benchmarking.rs:20-28` — `BENCH_EVENT_PAYLOAD_BYTES = 4*1024`, `MAX_BENCH_EVENTS =
  256`; doc comment claims `MAX_BENCH_EVENTS * BENCH_EVENT_PAYLOAD_BYTES (~1 MiB)` "tracks the `bytes_churned`
  block ceiling."
- `benchmarking.rs:30-46` — `generate_ledger_events` builds `content_tagged_bytes: alloc::vec![0u8;
  BENCH_EVENT_PAYLOAD_BYTES]` — comment (`:20-22`) states this is **not a decodable event**, deliberately, so
  the benchmark measures the runtime-side deposit (state-trie write into `frame_system::Events`) only.
- `benchmarking.rs:60-82` — `bench_block_full_of_events(n: Linear<0, MAX_BENCH_EVENTS>)`: deposits `n` events
  in a `#[block]`, then `assert_eq!(frame_system::Pallet::<T>::event_count(), n)` — asserts count only, not
  cost.
- **WeightInfo wiring (P1):** `pallets/midnight/src/weights.rs` **does not exist**; the pallet does not
  `mod weights`; the only `#[pallet::weight]` attrs are `get_tx_weight(midnight_tx)` (`lib.rs:375`) and
  `T::DbWeight::get().writes(1)` (`lib.rs:440`). `bench_block_full_of_events` (`benchmarking.rs:71`) is
  referenced only within the benchmark module. → per-event emission carries **no weight term** — genuinely
  unpriced, matching the stated design.
- **Bound arithmetic (P4):** the `bytes_churned` ceiling is **not a source constant** — it is a configured
  ledger parameter read from runtime state: `sp.state.parameters.limits.block_limits` (`api/ledger.rs:154,
  186, 217, 256`), field `bytes_churned` (`ledger/helpers/src/versions/common/types.rs:332`), enforced by
  `cost.bytes_churned.min(limits.bytes_churned)` (`ledger/helpers/src/versions/common/mod.rs:277`). Nothing in
  the diff or source anchors the benchmark's 1 MiB to the *actual configured value*.

**Candidate finding A5-1 (medium — the design's open question).** The `bench_block_full_of_events` guardrail
(a) is wired to nothing (pure measurement, no extrinsic weight consumes it — by design, "unpriced"), and (b)
its worst-case sizing (256 × 4 KiB = 1,048,576 bytes) is an **asserted, not derived, bound** — there is no
anchor tying 1 MiB to the runtime's configured per-block `bytes_churned` limit. If the real ceiling permits
aggregate event payloads > 1 MiB, the guardrail under-measures. Compounding: the synthetic payload is
non-decodable zero-bytes, so the benchmark **excludes the ledger-side `tagged_serialize` cost** of building
`content_tagged_bytes` (the PR's own TODO flags per-event serialisation cost as unmeasured). Anchors:
`benchmarking.rs:20-28,60-82`; `api/ledger.rs:154`; `helpers/.../mod.rs:277`. The soundness of "unpriced,
bounded by bytes_churned" rests on a bound the PR does not substantiate.

---

## A6 — SCALE metadata freshness & indexer decode contract

**Probes:** P3 (`strings`/`cmp` over the blobs), P4 (tag-version + historical-replay reasoning), P1 (generator
reachability). P6 blocked (no live node — cannot confirm served metadata matches checked-in blobs, nor
`state_getStorage(System.Events)` retrieval).

**Evidence items.**
- Sizes: both `metadata/static/midnight_metadata.scale` and `…_2.0.0.scale` go 135125 → 135509 bytes
  (identical +384 delta) base→head (`git show <base|head>:… | wc -c`).
- **Both blobs are byte-identical at head AND at base** (`cmp` → IDENTICAL both times). So the
  "identical-delta smell" is the **pre-existing status quo**, not a regression.
- Confirmed correct-by-design: `metadata/src/lib.rs:11-12` binds `midnight_metadata_2.0.0.scale` as the
  `midnight_metadata_2_0_0` subxt module; `metadata/README.md` states a `midnight_metadata_latest` module
  tracks the latest protocol version. The unsuffixed `midnight_metadata.scale` is the latest alias, and
  `2.0.0` is the highest in the versioned series (`static/` holds `0.21.0, 0.22.0, 1.0.0, 2.0.0` + unsuffixed)
  — so latest ≡ 2.0.0 being identical is expected. Only the two latest files changed; the frozen older
  versions correctly did not.
- **Freshness (positive):** `strings midnight_metadata.scale` contains `LedgerEvent`, `LedgerEventSource`,
  `content_tagged_bytes`, `logical_segment`, `physical_segment` — the checked-in blobs **do** reflect the new
  variants. (Also `@Partial Success.,LedgerEvent` — the `TxPartialSuccess` doc-comment sits adjacent to
  `LedgerEvent`, consistent with append-at-8.)
- **Generator reachability (P1):** the review **head commit itself is `chore: rebuild metadata
  (midnight-node#1474)`** (`git log 61c9c349`), i.e. the rebuild is the final commit of this PR. So metadata
  was in fact rebuilt.
- **Tag versions (P4):** `insight:midnight-ledger/ledger/src/events.rs:48` — `#[tag = "event-source[v1]"]`
  (matches doc). `insight:events.rs:85` — `#[tag = "event-details[v9]"]`. **No `event-details[v10..v14]`
  exists anywhere** in the ledger repo (grep empty; `.tag-decompositions/` tops out at `event[v9] =
  (event-source[v1], event-details[v9])`).

**Candidate finding A6-1 (medium — indexer decode contract; doc vs source).** `docs/ledger-events.md` claims
consumers decode with `event-details[v9]` for v7/v8-era ledgers and `event-details[v14]` for the v9-era
ledger. Against ledger source, the *current* (v9-era) `EventDetails` tag is `event-details[v9]`, and
`event-details[v14]` does not exist. So the doc's mapping is inverted/wrong: `[v9]` appears to be the current
tag (not a v7/v8-era tag), and `[v14]` is unsubstantiated. A consumer following the doc would select the
wrong decoder tag. *Confidence caveat:* the insight repo is a ledger snapshot; the node under review links
its own pinned ledger v7/v8/v9 crates, and P6/P5 being blocked means I could not confirm the tag the
*actually-linked* ledger emits at runtime — the finding rests on ledger source inspection.

**Candidate finding A6-2 (low — change-file accuracy).** The change-file's "Requires a metadata rebuild" reads
as an outstanding action, but the head commit *is* the rebuild and the blobs already carry the new variants —
the note is stale. (Reconciled in A9.)

---

## A7 — Runtime spec identity & upgrade/release ordering

**Probes:** P3 (`spec_version` vs ABI diff), P1 degraded (release/upgrade tooling grep). No file in the change
surface touches `runtime/` — cross-cutting area anchored by the ABI change.

**Evidence items.**
- `runtime/src/lib.rs:283` — `spec_version: 002_000_000` at head. `git diff base...head -- runtime/` is
  **empty** → `runtime/` entirely unchanged → `spec_version` identical at base = **unbumped**.
- The PR is unambiguously ABI-changing: two new runtime event variants (A3 idx 8, A4 idx 1) and two widened
  host-boundary structs (A1), reflected in regenerated metadata (135125→135509).
- **Release automation derives the tag from `spec_version` (P1):** `.github/workflows/release-image.yml:141-146`
  greps `spec_version:` out of `runtime/src/lib.rs` and converts `001_000_000 → 1.0.0`, producing
  `RUNTIME_VERSION`; `:152,194,202` set `RUNTIME_TAG_RELEASE` / `git_tag_runtime=runtime-${RUNTIME_VERSION}`.
  So the published runtime/image tag *is* the `spec_version`. `002_000_000` maps to `2.0.0`, matching
  `midnight_metadata_2.0.0.scale`.
- Corroborating: `.github/workflows/fork-network.yml:50` provides an explicit escape hatch to "Accept a
  runtime wasm that does not bump spec_version (uses `authorizeUpgradeWithoutChecks`; rehearsal-only)" —
  confirming spec_version bumps are normally *enforced* on upgrade, so an unbumped ABI change is anomalous.

**Candidate finding A7-1 (high interest).** ABI-changing PR with `spec_version` left unbumped
(`runtime/src/lib.rs:283`, `002_000_000`, runtime/ diff empty). Release automation that derives the runtime
tag from `spec_version` (`release-image.yml:141-146,194`) would publish the changed ABI (new event variants +
new metadata) under the **already-existing `runtime-2.0.0` tag** — a direct hit on the subsystem failure class
"publishing a changed ABI under an unchanged version tag." Combined with the A1 host-boundary struct change,
this is also a binary-before-runtime ordering concern. The PR body's own TODO lists the version bump as
outstanding. *Note:* this is exactly what the PR flags as not-yet-done, so it is a known-incomplete item, not
a hidden defect — but it is currently reachable on the review head.

---

## A8 — Event-content privacy & payload-shape exposure

**Probes:** P1 (`EventDetails` variant enumeration + verbatim-forward), P4 (payload-shape / no redaction).

**Evidence items.**
- `insight:midnight-ledger/ledger/src/events.rs:85-127` — `#[non_exhaustive] pub enum EventDetails<D>`
  variants: `ZswapInput { nullifier: CoinNullifier, contract }`, `ZswapOutput { commitment: CoinCommitment,
  preimage_evidence: ZswapPreimageEvidence, contract, mt_index }`, `ContractDeploy { address, initial_state:
  ContractState<D> }`, `ContractLog { address, entry_point, logged_item: StateValue<D> }`,
  `ParamChange(LedgerParameters)`, `DustInitialUtxo {…}`, `DustGenerationDtimeUpdate {…}`, `DustSpendProcessed
  { commitment, commitment_index, nullifier: DustNullifier, v_fee, … }`.
- **Verbatim forward, no redaction (P1/P4):** `build_ledger_events` serialises the *entire* `EventDetails`
  via `api.tagged_serialize(&ev.content)?` (`ledger/src/versions/common/mod.rs:582`) with no field selection or
  filtering; `content_tagged_bytes: Vec<u8>` is the complete tagged serialisation. Any privacy property is
  inherited wholly from the ledger's event design; the node adds nothing and redacts nothing.

**Privacy reasoning.** These are the ledger's own per-transaction events, which every full node already
recomputes deterministically by executing the block (the doc, `ledger-events.md`, states this: runtime events
"live in the state trie … every full node re-derives them locally"). So the *information* is already available
to any full-node operator/indexer. Contract state (`ContractDeploy.initial_state`, `ContractLog.logged_item`)
is public in Midnight's model; Zswap `preimage_evidence` is a ciphertext/public-preimage that does not by
itself break shielding for non-recipients. Re-emitting to `frame_system::Events` therefore does not obviously
*widen the cryptographic audience* — it widens *convenience/observability* (a single
`state_getStorage(System.Events)` yields the full event stream, vs re-execution before).

**Observation A8-1 (low confidence of a defect).** Two sharper sub-points for adjudication: (i) the change
lowers the bar for bulk-harvesting the full ledger event stream (Zswap nullifiers/ciphertexts, dust
nullifiers) via one RPC surface, which may aid linkability/traffic-analysis tooling even without breaking
shielding; (ii) `EventDetails` is `#[non_exhaustive]` (`events.rs:86`) and the node forwards **verbatim with no
allowlist** — a future ledger version adding a variant carrying more sensitive data would be auto-exposed with
no node-side review gate. Neither is a confirmed defect: the PR faithfully inherits the ledger's privacy model
and the doc acknowledges the public-event nature. *Confidence caveat:* a definitive Zswap-ciphertext exposure
judgement would need the ledger's Zswap crypto internals (beyond this change surface) and ideally a runtime
retrieval check (P6 blocked).

---

## A9 — Documentation & change-tracking accuracy vs implemented behaviour

**Probes:** P1 (claim-by-claim reconciliation against A1-A8 evidence), P3 (rebuild-note vs committed blobs).

**Reconciliation table (claims from `docs/ledger-events.md` + `changes/runtime/added/expose-ledger-events.md`).**

| Claim | Evidence (area) | Verdict |
|---|---|---|
| Appended last, indices unchanged (both pallets) | A3 (lib.rs:242-260, idx 8), A4 (lib.rs:29-32, idx 1) | Supported |
| Failed tx emits none | A2 (api/ledger.rs:174 `Failure=>Err`; test TC-15) | Supported |
| Partial success emits only succeeded segments | A2 (ledger-filtered `PartialSuccess(_,events)`) | Supported |
| Dry-run/mempool never emit | A3 (emission only in apply path; test TC-17) | Supported |
| Wire shape stable across ledger versions | A2 (single `versions/common` helper; opaque bytes) | Supported (design) |
| `event-source[v1]` | A6 (events.rs:48) | Supported |
| `event-details[v9]` (v7/v8-era) / `[v14]` (v9-era) | A6 (current tag is `[v9]`; `[v14]` absent) | **Contradicted** |
| Unpriced | A5 (no WeightInfo, no weights.rs) | Supported |
| Bounded by `bytes_churned` | A5 (bound asserted, not anchored to configured limit) | Partially supported |
| Requires a metadata rebuild (change-file) | A6 (head commit *is* the rebuild; blobs already updated) | **Stale/contradicted** |
| `(address, entry_point)` namespaces contract events | A8 (`ContractLog{address,entry_point,logged_item}`) | Supported |

**Candidate findings A9-1 / A9-2.** Both are documentation-accuracy issues that reinforce A6 (they are the
same two underlying defects surfaced on the doc surface): (1) the `event-details[v14]` decode-tag claim is
unsubstantiated and `[v9]` is mischaracterised as v7/v8-era — a consumer decode-contract accuracy problem;
(2) the "Requires a metadata rebuild" change-file note is stale relative to the committed rebuild. Low
severity in isolation, but A9-1 matters because indexer authors are the primary documented consumer and the
tag is load-bearing for decoding.

---

## Blocked-validation ledger (final)

| Area(s) | Probe | Claim not validated live | Missing instrument | Confidence consequence |
|---|---|---|---|---|
| A1, A2, A5 | P5 (build) | Review head compiles; widened signatures / new `SerializableError` impl / `Linear<0,MAX_BENCH_EVENTS>` are well-formed | Offline cargo cannot resolve pinned `polkadot-sdk@660acefe` (not cached; sandbox has no network). PR states it was not compiled on the author's machine either. | All compile-level claims cap at static-inspection confidence |
| A6 | P6 (runtime) | Metadata served by a live node at head matches the checked-in blobs; events retrievable via `state_getStorage(System.Events)`; the *linked* ledger's actual emitted `event-details` tag | No runnable `midnight-node` binary (`node_binary_available=false`) | Metadata-freshness, RPC-retrieval, and tag-version claims cap at static (P3/P4) confidence; A6-1 tag finding could not be runtime-confirmed |
| A2, A4, A7 | P2 (code-graph) | Exhaustive caller/blast-radius enumeration of the changed structs/functions | No GitNexus index for the review checkout (`gitnexus_available=false`) | Caller enumeration is grep-best-effort, not graph-guaranteed complete |

## Candidate findings summary (for adjudication)

| ID | Area | One-line | Confirmed-defect vs observation | Interest |
|---|---|---|---|---|
| A1-1 | A1 | Appended `events` field to two `#[derive(Decode)]` host-boundary structs — unversioned mixed-binary decode hazard | Confirmed (defect class present); reachability gated by upgrade ordering | High |
| A2-1 | A2 | `?` in `build_ledger_events` fails whole apply on any single event serialisation error (state stays consistent) | Observation (low reachability; matches existing convention) | Low |
| A2-2 | A2 | User & system paths share one helper — no divergence | Positive observation (no defect) | — |
| A5-1 | A5 | Benchmark worst-case (1 MiB) is an unanchored bound; emission unpriced and benchmark excludes serialisation cost | Confirmed gap (soundness unsubstantiated) | Medium |
| A6-1 | A6 | Doc decode-tag claim `event-details[v14]` unsubstantiated; `[v9]` is the current tag, not v7/v8-era | Confirmed (doc vs source); runtime-unconfirmed | Medium |
| A6-2 | A6 | "Requires a metadata rebuild" note stale — head commit is the rebuild | Confirmed (minor) | Low |
| A7-1 | A7 | `spec_version` unbumped (`002_000_000`) despite ABI change; release tag derives from it → ABI republished under existing `runtime-2.0.0` tag | Confirmed (reachable on head; PR-flagged as TODO) | High |
| A8-1 | A8 | Full `EventDetails` forwarded verbatim (no redaction/allowlist), incl. Zswap ciphertexts/nullifiers; `#[non_exhaustive]` → future variants auto-exposed | Observation (inherits ledger privacy model; audience not obviously widened) | Low-Medium |
| A9-1 | A9 | Doc `event-details[v14]` / `[v9]`-era mapping wrong (= A6-1 on doc surface) | Confirmed (doc accuracy) | Medium |
| A9-2 | A9 | Change-file metadata-rebuild note stale (= A6-2 on doc surface) | Confirmed (minor) | Low |
