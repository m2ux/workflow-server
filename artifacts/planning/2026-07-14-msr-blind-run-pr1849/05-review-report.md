## System Review - Merge Readiness 1/5

### 4 issues found - Strongly do not merge

This change (PR #1849, expose ledger-emitted events) is **not merge-ready**. The accepted set carries **two high-risk defects and two medium-risk defects**, and it spans the **compatibility** class — either of which independently drives the verdict to 1/5 under the rubric.

The two high-risk defects are the decisive ones. **A1-1** appends an unversioned `events: Vec<LedgerEvent>` field to two `#[derive(Decode)]` host-boundary structs, a backward-incompatible SCALE change with no version guard: a mixed old/new binary↔runtime pairing misdecodes the apply-return value across the native↔Wasm host boundary (compatibility). **A7-1** leaves `spec_version` unbumped at `002_000_000` despite this ABI change, and release automation derives the runtime tag from `spec_version` — so the changed ABI republishes under the already-existing `runtime-2.0.0` tag (operational). A1-1 and A7-1 also compound: the unbumped version removes the very gate that would prevent the binary-before-runtime skew A1-1 needs to be reachable.

The two medium-risk defects are contained but block a clean merge. **A6-1 ≡ A9-1** is a doc decode-tag contract error (`docs/ledger-events.md:44` claims `event-details[v14]` for the v9-era ledger; the current tag is `event-details[v9]` and no `[v14]` exists) — one defect surfaced on both the integration axis (A6) and the doc-accuracy axis (A9); a consumer following the doc selects the wrong decoder. **A5-1** is a weight-accounting soundness gap: the benchmark worst-case (1 MiB) is an asserted bound not tied to the configured `bytes_churned` ceiling, emission is unpriced, and the synthetic zero-byte payload excludes the ledger-side `tagged_serialize` cost.

Final review: nine areas were investigated — A1 host-boundary type evolution & mixed-binary decode; A2 event-bridge apply-path (sourcing/serialisation/failure semantics); A3 pallet-midnight event surface & deposit ordering; A4 pallet-midnight-system dual apply-sites (atomicity/parity); A5 event-emission pricing & benchmark fidelity; A6 SCALE metadata freshness & indexer decode contract; A7 runtime spec identity & upgrade/release ordering; A8 event-content privacy & payload exposure; A9 documentation & change-tracking accuracy. Probe classes that ran: source tracing (P1), SCALE/decode reasoning (P4), metadata comparison (P3), and code-graph enumeration in **degraded** grep-only mode (P2, gitnexus unavailable). Three validation lines were **blocked** and cap the corresponding confidence at static inspection: **P5 (build)** for A1/A2/A5 — offline cargo cannot resolve the pinned `polkadot-sdk@660acefe` (not cached; sandbox has no network), and the PR body states the code was not compiled on the author's machine either; **P6 (runtime)** for A6 — no runnable `midnight-node` binary, so served-metadata and `state_getStorage(System.Events)` retrieval and the actually-linked ledger's emitted tag could not be confirmed; **P2 (code-graph)** for A2/A4/A7 — no GitNexus index for the review checkout, so caller enumeration is grep-best-effort, not graph-complete. No accepted finding is inflated to `high` confidence where the mechanism could only be inferred rather than exhibited end-to-end.

### Review Comments

- **Whole-apply failure on a single event's serialisation error (A2-1)**

  `build_ledger_events` uses `?` inside a `.map()` collected into `Result<Vec<_>, _>`, so one un-serialisable ledger event fails the entire transaction apply. State stays consistent (the helper runs before `persist()`), so this is an availability concern, not corruption — and it mirrors the pre-existing `?`-on-`tagged_serialize` convention already used for state-root/address serialisation; a failure would require a serialisation bug in the ledger itself. Non-blocking (low evidence confidence, low likelihood).

  Evidence:
    - `ledger/src/versions/common/mod.rs:586` (`api.tagged_serialize(&ev.content)?` inside `.map()`)
    - `mod.rs:578-589` (`.collect()` into `Result<Vec<_>, _>` → any single failure aborts the helper)
    - `mod.rs:503`/`:559` (persist is after the `?`; state stays consistent)
    - `api/ledger.rs:386-405` (`should_emit_events_whose_payload_round_trips` — normal `EventDetails` serialises cleanly)

  Related files: `ledger/src/versions/common/mod.rs`, `ledger/src/versions/common/api/ledger.rs`

- **Verbatim event-content forward; no redaction/allowlist; `#[non_exhaustive]` forward-exposure (A8-1)**

  The full `EventDetails` is forwarded verbatim into `frame_system::Events` with no field selection, and `EventDetails` is `#[non_exhaustive]`, so a future variant carrying more sensitive data would be auto-exposed with no node-side gate. This is not a confirmed defect: every full node already re-derives these events locally (per `docs/ledger-events.md`), so no new cryptographic audience is opened — the change widens convenience/observability, not the shielding boundary. The forward-compat hardening point (add an allowlist rather than forwarding verbatim) is a legitimate recommendation. Non-blocking (low evidence confidence; a definitive Zswap-ciphertext judgement needs ledger crypto internals + a P6 runtime check, which is blocked).

  Evidence:
    - `ledger/src/versions/common/mod.rs:586` (`content_tagged_bytes = api.tagged_serialize(&ev.content)?` — entire `EventDetails`, no field selection)
    - `insight:events.rs:85-127` (`#[non_exhaustive] enum EventDetails` incl. Zswap nullifiers/ciphertexts, dust nullifiers)

  Related files: `ledger/src/versions/common/mod.rs`, `docs/ledger-events.md`

- **Stale "Requires a metadata rebuild" change-file note (A6-2 ≡ A9-2)**

  The change-file's "Requires a metadata rebuild" reads as outstanding, but the review head commit *is* the rebuild (`chore: rebuild metadata (midnight-node#1474)`) and the checked-in blobs already carry the new variants. A pure documentation/change-tracking staleness nit with no production path — this is directly on the rubric's own calibration anchor for a non-blocking technical observation (stale checked-in metadata as a release follow-up), so it is reported as a comment, not an accepted issue. Same underlying item on both the change-file axis (A6) and the doc-accuracy axis (A9). Non-blocking (high evidence confidence but risk low, no faulty production path).

  Evidence:
    - `git log 61c9c349` → head commit is `chore: rebuild metadata (midnight-node#1474)`
    - `strings midnight_metadata.scale` → `LedgerEvent`, `LedgerEventSource`, `content_tagged_bytes`, `logical_segment`, `physical_segment` (blobs already updated)

  Related files: `changes/runtime/added/expose-ledger-events.md`, `docs/ledger-events.md`, `metadata/static/midnight_metadata.scale`

- **Shared apply-path helper — no path divergence (A2-2, positive)**

  A positive observation confirming design soundness: `build_ledger_events` has exactly two call-sites (user path and system path), both invoking the identical helper, so there is no divergence in how the `events` field is built. Recorded for the trail; not a defect.

  Evidence:
    - `ledger/src/versions/common/mod.rs:444` (user path call-site)
    - `mod.rs:555` (system path call-site) — both invoke the single `build_ledger_events` definition at `:574`

  Related files: `ledger/src/versions/common/mod.rs`

### Issues

#### Inline comments posted

- **Unversioned host-boundary struct-field append — mixed-binary decode hazard (A1-1)**

  _Location: `ledger/src/common/types.rs:71`; Risk / impact: high; Evidence confidence: medium;
  Production likelihood: medium; Category: compatibility; Validation: source trace (P4/P1); P5 (build) blocked_

  `events: Vec<LedgerEvent>` is appended as the trailing field to `TransactionAppliedStateRoot` (`types.rs:71`) and `SystemTransactionAppliedStateRoot` (`:79`), both deriving `Encode, Decode, DecodeWithMemTracking`. These structs cross the native↔Wasm host boundary (`host_api/ledger_9.rs:114,142`), and node binary vs runtime Wasm are independently upgradeable in Substrate. SCALE structs are decoded field-by-field with no length prefix: an old decoder reading a new encoding leaves the `events` bytes as unconsumed trailing data, and a new decoder reading an old (shorter) encoding runs off the end seeking `events` and fails. The PR ships no version guard on these structs — despite the adjacent `Op` enum (`types.rs:88-91`) carrying an explicit wire-significance comment, the repo's own precedent that cross-boundary SCALE evolution is hazardous. Reachability turns on a binary-before-runtime version-skew window (interacts with A7-1); a matched pairing never skews, which is why likelihood is medium not high. Confidence is medium — the failure is soundly inferred from SCALE semantics but could not be exhibited end-to-end because the build is blocked.

- **`spec_version` unbumped despite ABI change; release tag republishes changed ABI (A7-1)**

  _Location: `runtime/src/lib.rs:283`; Risk / impact: high; Evidence confidence: high;
  Production likelihood: medium; Category: operational; Validation: hybrid (P3 diff + P1 release-tooling read)_

  `spec_version` is `002_000_000` at head and `git diff eb2a8025...61c9c349 -- runtime/` is empty (runtime/ entirely unchanged), so the version is unbumped — while the PR is unambiguously ABI-changing (two new runtime event variants, two widened host-boundary structs, metadata 135125→135509). Release automation greps `spec_version:` from `runtime/src/lib.rs` and converts it into the runtime tag (`release-image.yml:141-146`, `:194`), so the changed ABI would publish under the already-existing `runtime-2.0.0` tag — a release-integrity break that defeats downstream version→ABI assumptions and, combined with A1-1, is a binary-before-runtime ordering hazard. `fork-network.yml:50`'s `authorizeUpgradeWithoutChecks` escape hatch confirms spec_version bumps are normally enforced, so an unbumped ABI change is anomalous and surfaces on the release path. Confidence is high — both halves are directly exhibited at their anchors (the unbumped value, the empty runtime/ diff, and the tag-derivation logic read verbatim). The PR body's own TODO lists the version bump as outstanding, so this is a known-incomplete release item; it is graded on its merits because it is currently reachable on the review head (adjudication is blind to the PR's self-assessment).

- **Doc decode-tag mapping wrong — consumer selects wrong decoder (A6-1 ≡ A9-1)**

  _Location: `docs/ledger-events.md:44`; Risk / impact: medium; Evidence confidence: medium;
  Production likelihood: medium; Category: integration; Validation: source trace (P3/P4); P6 (runtime) blocked_

  `docs/ledger-events.md:44` instructs consumers to decode with `event-details[v9]` "for the v7/v8-era ledgers" and `event-details[v14]` "for the v9-era ledger." Against ledger source, the current (v9-era) `EventDetails` tag is `event-details[v9]` (`insight:events.rs:85`) and no `event-details[v10..v14]` exists anywhere in the ledger repo (grep empty; `.tag-decompositions/` tops out at `event[v9]`). The mapping is therefore inverted: `[v9]` is the current tag (not v7/v8-era) and `[v14]` is unsubstantiated — a consumer following the doc selects the wrong decoder for `content_tagged_bytes` and gets a failed/garbled decode. Indexer authors are the primary documented consumer and the tag is load-bearing. This is one decode-contract defect surfaced on two axes — the integration axis (A6, node-emitted-events↔indexer contract) and the doc-accuracy axis (A9, `ledger-events.md` reconciliation row → Contradicted); it is counted once. Confidence is medium — the mismatch is soundly inferred from ledger source, but the actually-linked rc crates (`crate-ledger-9.1.0.0-rc.3` etc.) are git-pinned/not vendored and P6 is blocked, so the tag the linked ledger emits at runtime could not be confirmed.

- **Unanchored benchmark bound + unpriced/serialisation-cost gap (A5-1)**

  _Location: `pallets/midnight/src/benchmarking.rs:26`; Risk / impact: medium; Evidence confidence: medium;
  Production likelihood: medium; Category: performance; Validation: source trace (P4/P1); P5 (build) blocked_

  `bench_block_full_of_events` is offered as the worst-case guardrail, but its sizing (`BENCH_EVENT_PAYLOAD_BYTES = 4*1024` × `MAX_BENCH_EVENTS = 256` = 1 MiB) is an **asserted** bound: the doc comment claims it "tracks the `bytes_churned` block ceiling," yet `bytes_churned` is runtime state (`api/ledger.rs:154`, `helpers/.../mod.rs:277`), not a source constant, and nothing ties the 1 MiB to the configured value. If the real ceiling permits aggregate event payloads > 1 MiB, the guardrail under-measures. Compounding: the synthetic payload is non-decodable zero-bytes (`:37-52`), so the benchmark excludes the ledger-side `tagged_serialize` cost of building `content_tagged_bytes`; and emission carries no weight term (`weights.rs` absent, no `mod weights` in `lib.rs`) — genuinely unpriced by design. The benchmark asserts `event_count() == n` (count only, not cost). The soundness of "unpriced, bounded by bytes_churned" rests on a bound the PR does not substantiate. Confidence is medium — the gap is soundly inferred, but the configured `bytes_churned` value (P6) and the benchmark build (P5) are both blocked, so an over-limit case could not be exhibited.

#### File-level or unanchored issues

None — all four accepted findings carry a file:line anchor.

### Areas Investigated

- **A1 — Ledger host-boundary type evolution & mixed-binary decode** - 2 probe(s), 1 issue(s) found
- **A2 — Event bridge apply-path: sourcing, serialisation, failure semantics** - 2 probe(s), 0 issue(s) found (2 observations)
- **A3 — pallet-midnight event surface, deposit ordering & partial-success** - 2 probe(s), 0 issue(s) found
- **A4 — pallet-midnight-system dual apply-sites: atomicity & governance/executor parity** - 2 probe(s), 0 issue(s) found
- **A5 — Event-emission pricing, weight-vs-work & benchmark fidelity** - 2 probe(s), 1 issue(s) found
- **A6 — SCALE metadata freshness & indexer decode contract** - 3 probe(s), 1 issue(s) found (+1 observation)
- **A7 — Runtime spec identity & upgrade/release ordering** - 2 probe(s), 1 issue(s) found
- **A8 — Event-content privacy & payload-shape exposure** - 2 probe(s), 0 issue(s) found (1 observation)
- **A9 — Documentation & change-tracking accuracy vs implemented behaviour** - 2 probe(s), 0 issue(s) found (doc facets of A6-1/A6-2)

_Per-area accounting note: the register lists 5 accepted entries, but A6-1 and A9-1 are the same decode-contract defect on two axes (integration and doc-accuracy). The verdict and this report count it once, so Issues found = 4 distinct defects. To avoid double-counting the shared defect in the Areas Investigated sum, its single count is carried under A6 (the primary integration axis) and A9's doc facet is annotated rather than re-counted; likewise A9-2 is the doc facet of the A6-2 observation. Per-area issue counts therefore sum to 4, matching Issues found._

### Review Details

- Status: issues found
- Areas investigated: 9
- Tasks/probes performed: 19
- Issues found: 4
- Observations: 5
- Inline comments: 4
- File-level comments: 0
- Blocked validations: 3
- Commit: 61c9c3498db07e8b6457b9165d8bf0df29a2faad
- Changed files: 13
