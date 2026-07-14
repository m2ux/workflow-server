# Investigation Plan — PR #1849 (expose ledger-emitted events)

Derived by mapping the 13-file change surface (see `01-change-surface.md`) onto the
[subsystem map] and selecting bounded probes from the [probe catalog]. Probe budget: **4 per area**.
Toolchain gates in force: `cargo_available = true` (P5 live), `gitnexus_available = false`
(P2 degrades to grep + targeted reads), `node_binary_available = false` (P6 blocked).

This artifact is the authoritative coverage contract for the evidence-probing activity: every derived
area lists its planned probes, and the coverage summary maps every changed file to at least one area.

## Change intent (recap, from PR title/body/diff only)

The PR forwards the ledger's per-transaction `Vec<Event<D>>` to consumers as additive Substrate runtime
events. A new `LedgerEvent { source: LedgerEventSource, content_tagged_bytes: Vec<u8> }` wire type is
appended to the two host-boundary apply-return structs (`TransactionAppliedStateRoot`,
`SystemTransactionAppliedStateRoot`); a `build_ledger_events` helper tagged-serialises each ledger
`EventDetails` into the opaque bytes; and both pallets gain an appended `Event::LedgerEvent` variant
(pallet-midnight index 8, pallet-midnight-system index 1) deposited once per ledger event. Emission is
left unpriced, with `bench_block_full_of_events` as a worst-case guardrail. Static SCALE metadata is
regenerated. PR body's own TODO list flags: not compiled on the authoring machine, metadata rebuild,
version bump, partial-success/integration tests, decode-safety on historical replay, per-event
serialisation cost — all noted as outstanding.

## Area table

| # | Area | Subsystem(s) | Changed files in scope | Planned probes |
|---|---|---|---|---|
| A1 | Ledger host-boundary type evolution & mixed-binary decode | Ledger integration and host ABI | `ledger/src/common/types.rs`, `ledger/src/versions/common/types.rs` | P4, P1, P5 |
| A2 | Event bridge apply-path: sourcing, serialisation, failure semantics | Ledger integration and host ABI; pallet-midnight; pallet-midnight-system | `ledger/src/versions/common/mod.rs`, `ledger/src/versions/common/api/ledger.rs`, `ledger/src/versions/common/api/mod.rs`, `ledger/src/versions/common/types.rs` | P1, P2, P5 |
| A3 | pallet-midnight event surface, deposit ordering & partial-success | pallet-midnight | `pallets/midnight/src/lib.rs`, `pallets/midnight/src/tests.rs` | P1, P4 |
| A4 | pallet-midnight-system dual apply-sites: atomicity & governance/executor parity | pallet-midnight-system | `pallets/midnight-system/src/lib.rs` | P1, P2 |
| A5 | Event-emission pricing, weight-vs-work & benchmark fidelity | pallet-midnight (benchmarks); pallet-cnight-observation (coupled); ledger cost limits | `pallets/midnight/src/benchmarking.rs` | P4, P1, P5 |
| A6 | SCALE metadata freshness & indexer decode contract | SCALE metadata and indexer surface | `metadata/static/midnight_metadata.scale`, `metadata/static/midnight_metadata_2.0.0.scale` | P3, P4, P1 |
| A7 | Runtime spec identity & upgrade/release ordering | Runtime and spec identity; Release and upgrade automation | (no direct file — cross-cutting; anchored by metadata + change-file) | P3, P1 |
| A8 | Event-content privacy & payload-shape exposure | pallet-midnight; ledger event boundary | `docs/ledger-events.md`, `ledger/src/versions/common/mod.rs` (build_ledger_events) | P1, P4 |
| A9 | Documentation & change-tracking accuracy vs implemented behaviour | Docs and change tracking | `docs/ledger-events.md`, `changes/runtime/added/expose-ledger-events.md` | P1, P3 |

## Per-area detail

### A1 — Ledger host-boundary type evolution & mixed-binary decode

**Subsystem:** Ledger integration and host ABI (`ledger/`, boundary types `ledger/src/common/types.rs`).
**Files:** `ledger/src/common/types.rs` (+40: new `LedgerEvent`/`LedgerEventSource`, `events` field appended
to `TransactionAppliedStateRoot` and `SystemTransactionAppliedStateRoot`), `ledger/src/versions/common/types.rs`
(+5: new `SerializationError::EventDetails` variant, u8 code 64).

**Rationale.** `TransactionAppliedStateRoot` / `SystemTransactionAppliedStateRoot` cross the native host
boundary between the node binary and the Wasm runtime (subsystem failure class: *mixed-binary decode
incompatibility — new runtime decoding an old binary's host response, or the reverse; shared-type
evolution without versioning*). Appending a `Vec<LedgerEvent>` field to a SCALE `Decode` struct is
backward-incompatible for a decoder that does not expect the trailing field: an old runtime decoding a
new binary's response would leave trailing bytes; a new runtime decoding an old binary's (shorter)
response would fail to find the `events` field. This is exactly the cross-version hazard the subsystem
flags, and the PR ships no explicit versioning of these structs. The new `SerializationError::EventDetails`
variant also extends a `PalletError`-deriving enum that is itself part of the ABI (its `From<…> for u8`
mapping is a stable wire code) — appended at the end (63 → 64), which is the safe position, but worth
confirming nothing else keys on the discriminant count.

**Planned probes.**
- **P4 (SCALE/size)** — Decode-compatibility reasoning: given the appended `events: Vec<LedgerEvent>` on
  both apply-return structs, state whether the struct is length-delimited or trailing-field-decoded, and
  whether an old↔new binary/runtime pairing can misdecode. Anchor on the SCALE layout in the diff and the
  `#[derive(Decode)]` on the structs. *(gate: none for layout reasoning.)*
- **P1 (source tracing)** — Trace who constructs and who decodes `TransactionAppliedStateRoot` /
  `SystemTransactionAppliedStateRoot` across the host boundary (host-function return path), to establish
  whether binary and runtime are always version-locked in practice or can be mixed (informs whether the
  decode hazard is reachable). Anchor with file:line on the host-function definition/wiring.
- **P5 (build)** — `cargo check` the `midnight-node-ledger` crate at the review head to confirm the new
  types and the widened signatures compile (the PR body states it was *not compiled on the authoring
  machine*; this is the first thing to establish). Narrowest scope: `-p midnight-node-ledger`.

### A2 — Event bridge apply-path: sourcing, serialisation, failure semantics

**Subsystem:** Ledger integration and host ABI; feeds pallet-midnight and pallet-midnight-system.
**Files:** `ledger/src/versions/common/mod.rs` (+27: `build_ledger_events` helper, wiring `events` into both
apply structs, widened `apply_verified_transaction` / `apply_system_tx` call-sites),
`ledger/src/versions/common/api/ledger.rs` (+48/−11: `apply_verified_transaction` and `apply_system_tx`
return-tuple widened to carry `Vec<Event<D>>`; Failure path returns no events),
`ledger/src/versions/common/api/mod.rs` (+9: `SerializableError for EventDetails<D>`),
`ledger/src/versions/common/types.rs` (also in A1 for the error-code angle).

**Rationale.** This is the load-bearing seam: it reads the ledger's own `Event<D>` stream out of
`TransactionResult` and serialises each `EventDetails` into `content_tagged_bytes` via
`api.tagged_serialize`. Failure classes: (a) *does the serialisation error path surface correctly* — the
helper propagates through `LedgerApiError::Serialization`/new `EventDetails` code, and a `?` in
`build_ledger_events` will fail the *entire apply* if any single event fails to serialise (turning an
otherwise-successful transaction into a failure — a availability/consensus concern worth stating); (b)
*failure/partial-success semantics* — `TransactionResult::Failure` must yield no events (confirmed in
diff: Failure arm returns an error, not a tuple), `PartialSuccess` forwards the segment events; (c)
*version uniformity* — the helper lives in `versions/common` and must behave identically across ledger
v7/v8/v9 (the PR claims version-uniform). Grounded against insight-repo `ledger/src/semantics.rs`:
`TransactionResult::Success(Vec<Event<D>>)` / `PartialSuccess(_, Vec<Event<D>>)` / `Failure` — the source
is real and the Failure arm genuinely carries no events.

**Planned probes.**
- **P1 (source tracing)** — Trace `build_ledger_events` end to end: `Event<D>` → `LedgerEventSource`
  field copy → `api.tagged_serialize(&ev.content)?` → `LedgerEvent`. Confirm (i) the `?` fails the whole
  apply on any single serialisation error, and characterise the blast radius; (ii) the Failure arm emits
  nothing; (iii) PartialSuccess forwards events. file:line anchors in `mod.rs` and `api/ledger.rs`.
- **P2 (code-graph, degraded → grep+reads)** — Cross-function comparison: do the user apply-path
  (`apply_verified_transaction` → `TransactionAppliedStateRoot`) and the system apply-path
  (`apply_system_tx` → `SystemTransactionAppliedStateRoot`) build the `events` field through the *same*
  `build_ledger_events` helper (consistency), or diverge? Enumerate all call-sites of `build_ledger_events`
  by grep. *(gate: gitnexus_available=false → grep-based enumeration + targeted reads, recorded as
  degraded.)*
- **P5 (build)** — `cargo check -p midnight-node-ledger` (shared with A1's build probe; here the target
  claim is that the widened return tuples and the new `SerializableError` impl compile and that no other
  in-crate caller of `apply_verified_transaction`/`apply_system_tx` was left on the old arity).

### A3 — pallet-midnight event surface, deposit ordering & partial-success

**Subsystem:** pallet-midnight (`pallets/midnight/`).
**Files:** `pallets/midnight/src/lib.rs` (+9: new `Event::LedgerEvent` variant, appended; deposit loop
`for ledger_event in result.events`), `pallets/midnight/src/tests.rs` (+85: new tests for deposit,
failed-tx-no-event, pre_dispatch-no-event, last-variant index).

**Rationale.** Failure classes for this subsystem: *event fidelity, event enum is ABI*. Two concrete
questions. (1) **Deposit ordering / partial-success interaction:** in `lib.rs` the `LedgerEvent` deposit
loop runs *before* the `if result.all_applied { TxApplied } else { TxPartialSuccess }` branch. So on a
partial success, `LedgerEvent`s are deposited and then `TxPartialSuccess` — meaning ledger events precede
the terminal marker. Confirm this matches the documented "events only for succeeded segments" claim and
that the ledger already filters partial-success events upstream (A2), so the pallet is not
double-filtering or mis-attributing. (2) **Variant index stability (ABI):** the new variant is appended;
the test `ledger_event_is_last_variant` asserts index 8. Confirm no existing variant index shifted and
that index 8 is genuinely the next free discriminant.

**Planned probes.**
- **P1 (source tracing)** — Trace the `send_mn_transaction` deposit sequence in `lib.rs`: order of
  `ContractDeploy`/`ContractCall`/`UnshieldedTokens`/`LedgerEvent`/`TxApplied|TxPartialSuccess`, and
  confirm the `result.events` the loop consumes is the filtered set from the bridge (A2). Cross-check
  against the updated `tests.rs` assertions (`ContractDeploy` first, `LedgerEvent` in between, `TxApplied`
  last). file:line anchors.
- **P4 (SCALE/size)** — Confirm variant-index stability: enumerate the `Event` enum discriminants
  pre/post and verify `LedgerEvent` = index 8 with every prior index unchanged (the test asserts the
  encoded discriminant byte). Anchor on the enum definition and the `ledger_event_is_last_variant` test.

### A4 — pallet-midnight-system dual apply-sites: atomicity & governance/executor parity

**Subsystem:** pallet-midnight-system (`pallets/midnight-system/`).
**Files:** `pallets/midnight-system/src/lib.rs` (+43/−23: new `Event::LedgerEvent` variant; the
`mut_ledger_state` closure return type widened to `(Vec<u8>, (Hash, Vec<LedgerEvent>))` on **both** the
root `send_mn_system_transaction` path and the internal `execute_system_transaction` executor path; a
deposit loop added to each).

**Rationale.** Subsystem failure classes: *event/hash contract mismatches, governance path divergence
from the user path, non-atomic storage mutation around fallible calls* (and this pallet is coupled to
c2m-bridge / cnight-observation as callers). Two questions. (1) **Atomicity:** events are collected
*inside* the `mut_ledger_state` closure and deposited *after* the closure returns Ok. Confirm the
closure's `?`/error propagation means events are deposited only when the ledger state mutation actually
commits (no path where events are emitted but state is rolled back, or vice-versa) — the "Only update
state after no errors" invariant the surrounding code advertises. (2) **Governance/executor parity:** the
two apply-sites are near-duplicated; confirm they build and deposit `LedgerEvent`s identically (same
ordering relative to `SystemTransactionApplied`, same per-event loop) so the root governance path and the
internal executor path (used by bridge/observation) do not diverge in what indexers see.

**Planned probes.**
- **P1 (source tracing)** — Trace both apply-sites: `mut_ledger_state` closure → `result.events` capture
  → post-closure `SystemTransactionApplied` deposit → `LedgerEvent` deposit loop. Establish the atomicity
  ordering (does event deposit happen strictly after the state-commit signalled by the closure returning
  Ok?) and whether any early-return between commit and deposit could drop events. file:line anchors on
  both fns.
- **P2 (code-graph, degraded → grep+reads)** — Caller/parity question: enumerate callers of
  `execute_system_transaction` (`MidnightSystemTransactionExecutor`) — grep across pallets (c2m-bridge,
  cnight-observation) — and compare the two apply-sites field-by-field to confirm no divergence in the
  emitted event contract. *(gate: gitnexus_available=false → grep enumeration + targeted reads,
  recorded degraded.)*

### A5 — Event-emission pricing, weight-vs-work & benchmark fidelity

**Subsystem:** pallet-midnight benchmarks; coupled to pallet-cnight-observation (mandatory-weight paths)
and the ledger's `bytes_churned` cost limits.
**Files:** `pallets/midnight/src/benchmarking.rs` (+54: new `bench_block_full_of_events`,
`MAX_BENCH_EVENTS = 256`, `BENCH_EVENT_PAYLOAD_BYTES = 4 KiB`, ~1 MiB total; synthetic non-decodable
payload; asserts `event_count() == n`).

**Rationale.** Subsystem failure classes: *unpriced execution work (benchmark coverage vs configured
ledger limits such as bytesChurned), weight-vs-work divergence*. The PR deliberately prices event emission
at zero (FRAME whitelisted-event convention) and offers `bench_block_full_of_events` as the guardrail.
Concrete questions. (1) **Is the guardrail wired to anything?** Confirmed via grep that pallet-midnight
`lib.rs` has *no* `WeightInfo`/weights.rs reference for this path — so the benchmark measures cost but no
extrinsic weight term consumes it; it is purely a measurement. State whether that matches the PR's stated
"unpriced" design and whether the measurement's constants (256 × 4 KiB ≈ 1 MiB) are actually anchored to
the real `bytes_churned` block ceiling or are an unverified guess. (2) **Weight-vs-work coverage:** the
synthetic payload is `vec![0u8; 4096]` and explicitly *not* a decodable event — confirm the benchmark
therefore measures only the `frame_system::Events` state-write cost, not serialisation cost (the PR's own
TODO flags per-event serialisation cost as unmeasured), and note the gap. (3) **Bound soundness:** does
the `bytes_churned` limit genuinely cap event volume as the docs claim, or can a transaction emit events
whose aggregate size exceeds what the fee paid for?

**Planned probes.**
- **P4 (SCALE/size)** — Bound arithmetic: locate the configured `bytes_churned` / block synthetic-cost
  limit in source and compare against `MAX_BENCH_EVENTS * BENCH_EVENT_PAYLOAD_BYTES` (256 × 4096 ≈ 1 MiB).
  State whether the benchmark's worst case is ≥ the real achievable per-block event volume, or under-sized.
  Anchor on both the limit definition and the benchmark constants.
- **P1 (source tracing)** — Trace whether `bench_block_full_of_events` (and the pre-existing `todo`
  benchmark) is referenced by any generated `WeightInfo` / weights file or extrinsic `#[pallet::weight]`,
  confirming the emission path carries no per-event weight term. file:line anchors (or a documented
  absence).
- **P5 (build)** — `cargo check` the benchmark target for `pallet-midnight`
  (`-p pallet-midnight --features runtime-benchmarks`, narrowest that compiles the `#[benchmarks]` module)
  to confirm the new benchmark compiles and the `Linear<0, MAX_BENCH_EVENTS>` component is well-formed.

### A6 — SCALE metadata freshness & indexer decode contract

**Subsystem:** SCALE metadata and indexer surface (`metadata/static/*.scale`, `indexer/`).
**Files:** `metadata/static/midnight_metadata.scale`, `metadata/static/midnight_metadata_2.0.0.scale`
(both binary, 135125 → 135509 bytes).

**Rationale.** Subsystem failure classes: *stale checked-in metadata after event/ABI changes (consumers
cannot decode new variants); indexer correlation contracts*. Two questions. (1) **Freshness:** both blobs
were regenerated and (confirmed via `strings`) contain `LedgerEvent`, `LedgerEventSource`,
`content_tagged_bytes` — so metadata reflects the new variants. But the PR body's TODO explicitly lists
"runtime metadata rebuild" as outstanding; confirm whether the checked-in blobs actually match a rebuild
from the review-head runtime, or are stale/hand-edited. (2) **Two-file consistency anomaly:** the two
`.scale` files show an *identical* size delta (both 135125 → 135509) and identical new strings — worth
confirming whether `midnight_metadata.scale` and `midnight_metadata_2.0.0.scale` are supposed to be
distinct (different runtime/spec versions) or are legitimately identical; if they are meant to differ, an
identical regeneration is a smell (ties into A7 spec-version identity). (3) **Decode contract:** the
indexer (insight-repo `indexer-api/.../ledger_events.rs`, `zswap_ledger_events.rs`,
`dust_ledger_events.rs`, v4 subscription paths) is a real consumer that decodes `content_tagged_bytes`
with `tagged_deserialize::<EventDetails>`; the docs claim version tags `event-details[v9]` (v7/v8-era) and
`event-details[v14]` (v9-era). Confirm the tag-version claim against the ledger source
(`event-details[v9]` observed in insight-repo `ledger/src/events.rs`).

**Planned probes.**
- **P3 (metadata comparison)** — `strings`/`git diff base...head` over both `.scale` blobs to confirm the
  new variant/type names are present (`LedgerEvent`, `LedgerEventSource`, `content_tagged_bytes`) and to
  compare the two files against each other for the divergence question. Exact invocations recorded.
  *(gate: none for static comparison.)*
- **P4 (SCALE/size)** — Decode-safety on historical replay (the PR TODO's "decode-safety against
  historical replay"): reason about whether a consumer decoding events produced by an *older* ledger
  version with a *newer* `EventDetails` tag (or vice-versa) can misdecode, given `EventDetails` is
  `#[non_exhaustive]` and the doc's `event-details[v9]`/`[v14]` version-tag dispatch. Anchor on the
  ledger `events.rs` tag and the doc's stated dispatch rule.
- **P1 (source tracing)** — Verify the metadata regeneration claim's *reachability*: identify how these
  static blobs are generated (the generator target / script) and whether regenerating from the review-head
  runtime is what produced the checked-in bytes, or whether a rebuild is genuinely still pending. file:line
  or command anchor. *(node-binary metadata cross-check, P6, is BLOCKED — see below.)*

### A7 — Runtime spec identity & upgrade/release ordering

**Subsystem:** Runtime and spec identity (`runtime/src/lib.rs`); Release and upgrade automation.
**Files:** No file in the change surface touches `runtime/src/lib.rs` or `.github/workflows/` — this is a
**cross-cutting area anchored by the ABI change** (the two new event variants + regenerated metadata) and
the change-file's own "minor version bump … outstanding" note.

**Rationale.** Subsystem failure classes: *ABI-changing PRs that leave `spec_version` unbumped; publishing
a changed ABI under an unchanged version tag; activation without compatibility gates*. This PR changes the
event ABI (two enum variants) and the host-boundary structs, which is exactly an ABI-changing PR. The PR
body's TODO explicitly lists the version bump as outstanding, and no `runtime/src/lib.rs` change is in the
diff — so on current evidence `spec_version` is **unbumped despite an ABI change**, and release automation
that derives the runtime tag from `spec_version` would publish a changed ABI under an unchanged tag
(direct hit on the failure class). Also relevant: the host-boundary struct change (A1) makes this a
binary-first-ordering concern — validators must run a compatible binary before the runtime activates.

**Planned probes.**
- **P3 (metadata comparison)** — Compare `spec_version` at the review head against the ABI-changing diff:
  read `spec_version` in `runtime/src/lib.rs` at base and head, and confirm whether it was bumped. State
  the mismatch (ABI changed, version bump present/absent). Exact file:line anchor. *(gate: none.)*
- **P1 (source tracing)** — Trace the upgrade/release ordering constraint introduced by the host-boundary
  struct evolution: identify whether any compatibility gate keys on the changed struct shape and whether
  the binary-before-runtime ordering is enforced or advisory (grep the release/upgrade tooling for
  `spec_version` / metadata-tag derivation). file:line anchors, degraded (grep-based, no gitnexus).

### A8 — Event-content privacy & payload-shape exposure

**Subsystem:** pallet-midnight event surface; ledger event boundary.
**Files:** `docs/ledger-events.md` (the exposure claims), `ledger/src/versions/common/mod.rs`
(`build_ledger_events` — what actually gets serialised into `content_tagged_bytes`).

**Rationale.** pallet-midnight failure class: *event fidelity / privacy leaks*. The runtime now exposes,
in the publicly-readable `frame_system::Events` state trie, the ledger's tagged-serialised `EventDetails`
for every applied transaction. Grounded against insight-repo `ledger/src/events.rs`, `EventDetails`
variants embed potentially sensitive payloads: `ZswapOutput { preimage_evidence: ZswapPreimageEvidence
(a coin ciphertext or a public preimage with coin/recipient), … }`, `ContractDeploy { initial_state:
ContractState }`, `ContractLog { logged_item: StateValue }`. The question is whether forwarding the *full*
`EventDetails` byte-for-byte to a public runtime event exposes anything that was not already public on
chain — i.e., is the ledger event stream already the same information that lands in on-chain state, or does
node-side re-emission widen the audience / change the observability of shielded data? This is a
first-principles privacy question the PR does not explicitly address in the change-file.

**Planned probes.**
- **P1 (source tracing)** — Enumerate the `EventDetails` variants (from the ledger `events.rs` boundary,
  read as subsystem material) and, for each, characterise what it carries (esp. Zswap
  preimage-evidence/ciphertext, contract initial state, contract logs) and whether that content is already
  publicly derivable from on-chain state. Determine whether `build_ledger_events` forwards the payload
  verbatim (it does: `api.tagged_serialize(&ev.content)`) with no redaction. file:line anchors.
- **P4 (SCALE/size)** — Payload-shape reasoning: confirm the opaque `content_tagged_bytes` is the *entire*
  `EventDetails` serialisation (no field is dropped/redacted at the node boundary), so any privacy property
  is inherited wholly from the ledger's event design, not added by the node. Anchor on the serialise call
  and the `EventDetails` layout.

### A9 — Documentation & change-tracking accuracy vs implemented behaviour

**Subsystem:** Docs and change tracking.
**Files:** `docs/ledger-events.md` (+54, new), `changes/runtime/added/expose-ledger-events.md` (+21, new).

**Rationale.** The change-file and doc make several *checkable* behavioural claims that a reviewer should
hold the code to (documentation-vs-implementation fidelity): "appended last, indices unchanged"; "failed
tx emits none, partial success emits only succeeded segments, dry-run/mempool never emit"; "wire shape
stable across ledger versions"; "`event-source[v1]`"; version tags "`event-details[v9]`/`[v14]`";
"unpriced, bounded by `bytes_churned`"; "requires a metadata rebuild". Each of these is validated in a
code-focused area above; A9 exists to *reconcile the documentation surface against those findings* and flag
any doc claim the code does not support (e.g. the version-tag numbers, or the "metadata rebuild" note vs the
already-committed blobs). Low-risk area but cheap and closes the documentation-fidelity loop.

**Planned probes.**
- **P1 (source tracing)** — Walk each concrete claim in `docs/ledger-events.md` and the change-file and
  map it to the corresponding code evidence gathered in A1–A8; list any claim unsupported or contradicted
  by the implementation. file:line cross-references.
- **P3 (metadata comparison)** — Specifically reconcile the "requires a metadata rebuild" change-file note
  against the *already-regenerated* checked-in `.scale` blobs (A6): is the note stale, or does it signal
  the committed metadata is provisional? Command/anchor evidence.

## Blocked-validation ledger (gates currently false)

Recorded now so probing does not silently skip them:

| Area(s) | Probe class blocked | Claim that cannot be validated live | Missing instrument | Confidence consequence |
|---|---|---|---|---|
| A6 | P6 (runtime/RPC) | Metadata *served by a live node* at review head matches the checked-in `.scale` blobs; events actually retrievable via `state_getStorage(System.Events)` | Runnable `midnight-node` binary (`node_binary_available=false`) | Metadata-freshness and RPC-retrieval claims cap at static-inspection confidence (P3/P4); no live confirmation |
| A2, A4, A7 | P2 (code-graph) | Exhaustive caller/blast-radius enumeration of `apply_verified_transaction` / `apply_system_tx` / `execute_system_transaction` / changed structs | GitNexus index for the review checkout (`gitnexus_available=false`) | Structural claims degrade to grep + targeted reads; completeness of caller enumeration is best-effort, not graph-guaranteed |

`cargo_available=true` keeps P5 (build/`cargo check`, targeted benchmark compile) on its capability path,
which is the single most valuable probe given the PR was *not compiled on the authoring machine*.

## Coverage summary — every changed file assigned to ≥ 1 area

| Changed file | Area(s) |
|---|---|
| `ledger/src/common/types.rs` | A1 |
| `ledger/src/versions/common/types.rs` | A1, A2 |
| `ledger/src/versions/common/mod.rs` | A2, A8 |
| `ledger/src/versions/common/api/ledger.rs` | A2 |
| `ledger/src/versions/common/api/mod.rs` | A2 |
| `pallets/midnight/src/lib.rs` | A3 |
| `pallets/midnight/src/tests.rs` | A3 |
| `pallets/midnight-system/src/lib.rs` | A4 |
| `pallets/midnight/src/benchmarking.rs` | A5 |
| `metadata/static/midnight_metadata.scale` | A6 |
| `metadata/static/midnight_metadata_2.0.0.scale` | A6 |
| `docs/ledger-events.md` | A8, A9 |
| `changes/runtime/added/expose-ledger-events.md` | A9 |

All 13 changed files are covered. A7 is a cross-cutting area with no directly-changed file (anchored by the
ABI change and the change-file's version-bump note) — an intentional downstream/integration area, not a
file-coverage gap.

[subsystem map]: loaded via `get_resource { subsystem-map }`
[probe catalog]: loaded via `get_resource { probe-catalog }`
