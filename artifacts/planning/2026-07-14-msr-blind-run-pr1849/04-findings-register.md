# Findings Register — PR #1849 (expose ledger-emitted events)

Adjudicated record for the 10 candidate findings raised in `03-evidence-log.md`, graded against
`grading-rubric` (six-dimension tuple) and dispositioned against the accepted-issue threshold
(evidence confidence medium/high **and** verified anchor → accepted; below → observation;
evidence-contradicted → dismissed). Grades are assigned from the rubric definitions and its PR-#1849
calibration anchors, not intuitively. Every candidate was graded independently before any disposition.

**Anchor verification:** all cited anchors were re-checked against the review head
`61c9c349` in `/home/mike1/projects/work/midnight-node/2026-07-14-msr-blind-run-pr1849`
(three-dot base `eb2a8025`). Every anchor resolved exactly as logged — see the verification notes per
finding. No candidate was dropped for an unverifiable anchor.

**Toolchain posture (caps confidence honestly):** `cargo` effectively blocked for a full type-check
(pinned `polkadot-sdk@660acefe` not in the offline cargo cache; the PR body states the code was not
compiled on the author's machine either), `gitnexus_available=false` (caller enumeration is
grep-best-effort, not graph-complete), `node_binary_available=false` (no runtime/RPC confirmation).
Every compile-level and runtime-level claim therefore caps at static-inspection / source-trace
confidence. Grades reflect this — no finding is inflated to `high` confidence where the mechanism could
only be *inferred* from source rather than *exhibited* end-to-end.

---

## Disposition summary

| ID | Area | One-line | Risk | Conf | Likelihood | Category | Validation | Disposition |
|---|---|---|---|---|---|---|---|---|
| A1-1 | A1 | Unversioned `events` field appended to two `#[derive(Decode)]` host-boundary structs — mixed old/new binary↔runtime misdecode | high | medium | medium | compatibility | source trace (P5 blocked) | **Accepted** |
| A7-1 | A7 | `spec_version` unbumped (`002_000_000`) despite ABI change; release tag derives from it → changed ABI republished under existing `runtime-2.0.0` tag | high | high | medium | operational | hybrid (P3 diff + workflow read) | **Accepted** |
| A6-1 | A6 | Doc decode-tag mapping wrong: `event-details[v14]` unsubstantiated, `[v9]` is the current tag (not v7/v8-era) → consumer selects wrong decoder | medium | medium | medium | integration | source trace (P6 blocked) | **Accepted** |
| A9-1 | A9 | Same decode-tag defect as A6-1, surfaced on the doc-accuracy axis (`docs/ledger-events.md:44`) | medium | medium | medium | integration | source trace (P6 blocked) | **Accepted** (doc-surface facet of A6-1 — same root; verdict dedupes to one decode-contract defect) |
| A5-1 | A5 | Benchmark worst-case (1 MiB) is an unanchored bound (not tied to configured `bytes_churned`); emission unpriced; benchmark excludes ledger-side serialisation cost | medium | medium | medium | performance | source trace (P5 blocked) | **Accepted** |
| A2-1 | A2 | Single un-serialisable event fails the whole apply via `?` in `build_ledger_events` (state stays consistent — persist is after) | medium | low | low | correctness | source trace (P5 blocked) | Observation |
| A8-1 | A8 | Full `EventDetails` forwarded verbatim (no redaction/allowlist), incl. Zswap ciphertexts/nullifiers; `#[non_exhaustive]` → future variants auto-exposed | medium | low | medium | integration | source trace (P6 blocked) | Observation |
| A6-2 | A6 | Change-file "Requires a metadata rebuild" note is stale — head commit *is* the rebuild; blobs already carry the variants | low | high | low | hygiene | hybrid (git log + strings) | Observation |
| A9-2 | A9 | Same stale rebuild-note as A6-2, on the doc-accuracy axis | low | high | low | hygiene | hybrid (git log + strings) | Observation |
| A2-2 | A2 | User & system apply paths build events through one shared `build_ledger_events` helper — no path divergence | low | high | n/a | hygiene | source trace (P1) | Observation (positive — no defect) |

**Accepted (verdict-moving): 5 register entries → 4 distinct defects** (A9-1 is the doc-surface facet of A6-1; they share one root cause and dedupe to a single decode-contract defect in the verdict). **Observations: 5** (4 non-blocking + 1 positive). **Dismissed: 0.**

Distinct accepted defects: **A1-1** (host-boundary decode compat), **A7-1** (unbumped spec_version / tag republish), **A6-1 ≡ A9-1** (doc decode-tag mismatch), **A5-1** (unsubstantiated benchmark bound + unpriced serialisation).

---

## Per-finding detail

### A1-1 — Unversioned host-boundary struct-field append (mixed-binary decode hazard) · **ACCEPTED**

- **Evidence anchor** *(verified)*: `ledger/src/common/types.rs:71` (`events: Vec<LedgerEvent>` trailing on `TransactionAppliedStateRoot`), `:79` (same on `SystemTransactionAppliedStateRoot`), `:45-58` (new `LedgerEvent`/`LedgerEventSource`), `:88-91` (the adjacent `Op` enum's explicit wire-significance comment — the repo's own precedent that cross-boundary SCALE evolution is hazardous); boundary at `host_api/ledger_9.rs:114,142`. Re-read at head: all lines resolve exactly; the two structs derive `Encode, Decode, DecodeWithMemTracking` with `events` as the trailing field.
- **Risk / impact — high**: a mixed old/new binary↔runtime pairing misdecodes the apply-return value across the native↔Wasm host boundary. Per rubric high = "breaks validator compatibility." SCALE structs are decoded field-by-field with no length prefix; an old decoder leaves `events` as unconsumed trailing bytes, a new decoder runs off the end of an old (shorter) encoding.
- **Evidence confidence — medium**: the mechanism is soundly inferred from source (SCALE field-order semantics + the boundary + independent upgradeability), but the decode failure could not be *exhibited* — P5 (build) is blocked, so no round-trip decode test was executed. Rubric medium = "soundly inferred from source, but a step is unvalidated (often because a toolchain gate blocked execution-level confirmation)." **Not graded high** despite the calibration anchor's high, because this blind run cannot demonstrate the failure end-to-end. (Anchor is verified, so it clears the accepted threshold at medium.)
- **Production likelihood — medium**: reached only under a version-skew window (node binary and runtime Wasm are independently upgradeable in Substrate). Rubric medium = "reached under realistic but non-default conditions: upgrades." Reachability turns on binary-before-runtime ordering (interacts with A7-1). Not high because a matched binary/runtime pairing — the normal case — never skews.
- **Category — compatibility**: version/ABI/upgrade breakage across the host boundary (rubric `compatibility`). Matches the calibration anchor "new runtime cannot decode old binary's host response (`ledger/src/common/types.rs`)" → compatibility.
- **Validation mode — source trace (P4/P1); P5 blocked**: SCALE-decode reasoning + host-boundary tracing; execution-level confirmation blocked by the offline-cargo gate (recorded blocked validation A1/A2/A5·P5).
- **Nuance recorded**: the `Op` precedent comment (`types.rs:88-91`) governs *enum-variant* index stability; the `events` append is a *struct-field* append. Both are trailing-append SCALE evolutions and the backward-incompatibility reasoning transfers, but the two are not the identical construct — noted so the finding is not overstated. The runtime *event* enums (A3 idx 8, A4 idx 1) ARE correctly appended-last; A1-1 is specifically about the host-boundary structs, which carry no such guard.

### A7-1 — `spec_version` unbumped despite ABI change; release tag republishes changed ABI · **ACCEPTED**

- **Evidence anchor** *(verified)*: `runtime/src/lib.rs:283` = `spec_version: 002_000_000`; `git diff eb2a8025...61c9c349 -- runtime/` is **empty** (verified — runtime/ entirely unchanged, so spec_version identical to base = unbumped); `.github/workflows/release-image.yml:141-146` greps `spec_version:` from `runtime/src/lib.rs` and converts `001_000_000 → 1.0.0` into `RUNTIME_VERSION`, `:194` sets `RUNTIME_TAG_RELEASE`. Re-read at head: the derivation script and the unbumped value both resolve exactly.
- **Risk / impact — high**: publishing a changed ABI (two new runtime event variants + two widened host-boundary structs, reflected in metadata 135125→135509) under an already-existing `runtime-2.0.0` tag is a release-integrity break that breaks downstream version→ABI assumptions; combined with A1-1 it is also a binary-before-runtime ordering hazard. Rubric high covers "breaks validator compatibility"; the operational republish is the direct hit.
- **Evidence confidence — high**: both halves are *directly exhibited* at their anchors, not inferred — the unbumped `002_000_000` is read directly, the empty runtime/ diff is a direct command result, and the tag-derivation logic is read verbatim from the workflow YAML. Rubric high = "the faulty path is exhibited, not inferred." The only unexecuted step is an actual CI publish run, but the configuration that produces the outcome is fully present and directly observable (no toolchain gate obstructs *this* evidence — the metadata blobs even confirm the ABI changed).
- **Production likelihood — medium**: on a release/upgrade path (not the default per-block path). Rubric medium = "upgrades, failures, edge configurations." `fork-network.yml:50`'s explicit `authorizeUpgradeWithoutChecks` escape hatch confirms spec_version bumps are normally *enforced*, so an unbumped ABI change is anomalous and would surface on the release path.
- **Category — operational**: release/automation/tooling integrity (rubric `operational`).
- **Validation mode — hybrid**: P3 (spec_version-vs-ABI diff, a command result) + P1 (release-tooling read) — source plus command/graph output.
- **Known-incomplete note**: the PR body's own TODO lists the version bump as outstanding, so this is a *known-incomplete* release item rather than a hidden defect — but it is currently reachable on the review head, so it is graded and accepted on its merits (adjudication is blind to the PR's self-assessment by independence constraint; the "PR-flagged" note comes from the change-file in-tree, not from PR comments).

### A6-1 — Doc decode-tag mapping wrong (`event-details[v14]` unsubstantiated) · **ACCEPTED**

- **Evidence anchor** *(verified)*: `docs/ledger-events.md:44` states decode with `event-details[v9]` "for the v7/v8-era ledgers" and `event-details[v14]` "for the v9-era ledger." Against ledger source, the current (v9-era) `EventDetails` tag is `event-details[v9]` (`insight:events.rs:85`) and no `event-details[v10..v14]` exists anywhere in the ledger repo (grep empty; `.tag-decompositions/` tops out at `event[v9]`). Re-read at head: the doc line resolves exactly as logged. **Additional verification this activity:** the node links its ledger crates git-pinned/from crates.io (`Cargo.toml:445` `midnight-ledger-v9` tag `crate-ledger-9.1.0.0-rc.3`; `mn-ledger 7.0.3`, `mn-ledger-8 8.1.0`) — **not vendored** — so no `event-details[vN]` literal appears anywhere in the target tree (grep empty). This confirms the tag lives only in the un-checked-out ledger crate sources.
- **Risk / impact — medium**: a consumer following the doc selects the wrong decoder tag for `content_tagged_bytes` → failed/garbled decode of the ledger event payload. Rubric medium = "broken consumer contracts (indexer/metadata)." Indexer authors are the primary documented consumer and the tag is load-bearing for decoding. Not high: no on-chain corruption or fund loss — it is a consumer-side decode-contract error.
- **Evidence confidence — medium**: the mismatch is soundly inferred from ledger source, but one link is unvalidated — the *actually-linked* rc crates (`crate-ledger-9.1.0.0-rc.3` etc.) are not checked out and P6 (runtime) is blocked, so I could not confirm the tag the linked ledger emits at runtime. The insight repo is a ledger snapshot, not the pinned crates. Rubric medium = "a step is unvalidated (toolchain gate)." Not high (mechanism not exhibited against the linked artifact); not low (source inspection is concrete and the doc anchor is verified).
- **Production likelihood — medium**: any consumer that decodes events by following the doc hits it; but decoding events off `System.Events` is a realistic non-default consumer path, not the node's own default execution path. Rubric medium.
- **Category — integration**: cross-component contract broken — the event/tag decode contract between node-emitted events and downstream indexers (rubric `integration`; matches the calibration anchor "indexer correlation" → integration).
- **Validation mode — source trace (P3/P4); P6 blocked**: doc-vs-ledger-source comparison; runtime tag confirmation blocked (recorded blocked validation A6·P6).

### A9-1 — Doc decode-tag mapping wrong (doc-accuracy axis) · **ACCEPTED (facet of A6-1)**

- **Evidence anchor** *(verified)*: identical to A6-1 — `docs/ledger-events.md:44` (reconciliation row "event-details[v9] (v7/v8-era) / [v14] (v9-era)" → **Contradicted** in the A9 table).
- **Grade tuple**: risk **medium**, confidence **medium**, likelihood **medium**, category **integration**, validation **source trace (P6 blocked)** — same as A6-1, because it is the same defect on the same anchor viewed through the documentation-accuracy lens.
- **Disposition rationale**: accepted (clears the threshold), but flagged as the doc-surface facet of A6-1. A6-1 and A9-1 share one root cause (the doc's decode-tag mapping). Per the accounting rule each finding maps to exactly one area (A6-1→A6, A9-1→A9), so both are retained as distinct register/area entries; the **verdict computation dedupes them to a single decode-contract defect** so merge-readiness is not double-penalised.

### A5-1 — Unanchored benchmark bound + unpriced/serialisation-cost gap · **ACCEPTED**

- **Evidence anchor** *(verified)*: `pallets/midnight/src/benchmarking.rs:26,31` (`BENCH_EVENT_PAYLOAD_BYTES = 4*1024`, `MAX_BENCH_EVENTS = 256`), `:28-30` doc comment claiming `~1 MiB` "tracks the `bytes_churned` block ceiling", `:37-52` synthetic zero-byte non-decodable payload, `:71-81` `bench_block_full_of_events(n: Linear<0,MAX_BENCH_EVENTS>)` asserting `event_count()==n` (count only, not cost); `weights.rs` **absent** and no `mod weights` in `lib.rs` (both verified this activity); the `bytes_churned` ceiling is runtime state (`api/ledger.rs:154`, `helpers/.../mod.rs:277`), not a source constant. Re-read at head: every line resolves exactly; weights.rs confirmed absent.
- **Risk / impact — medium**: if the configured per-block `bytes_churned` limit permits aggregate event payloads > 1 MiB, the guardrail under-measures worst-case event-emission weight → unpriced/under-priced work. Rubric medium = "unpriced work … without direct halt or loss." Not high: no direct halt/corruption — a weight-accounting soundness gap. (The strict-run calibration anchor grades the analogous "~1 MiB vs 50 MB churn" at risk medium — matched.)
- **Evidence confidence — medium**: the gap is soundly inferred — the 1 MiB is demonstrably an *asserted* constant with no source tie to the configured limit, and the zero-byte payload demonstrably excludes `tagged_serialize` cost — but the *actual* configured `bytes_churned` value is runtime state (P6 blocked) and the benchmark cannot be built (P5 blocked), so I could not exhibit an over-limit case. Rubric medium (toolchain gate on the confirming step). Matches calibration confidence medium.
- **Production likelihood — medium**: depends on the configured `bytes_churned` exceeding 1 MiB and blocks actually filling with events — realistic under load but not the guaranteed default. Rubric medium.
- **Category — performance**: unpriced/unbounded work (rubric `performance`; matches calibration anchor → performance).
- **Validation mode — source trace (P4/P1); P5 blocked**: bound arithmetic + WeightInfo wiring by source; benchmark build blocked (recorded blocked validation A5·P5).

### A2-1 — `?` in `build_ledger_events` fails whole apply on one event's serialisation error · Observation

- **Evidence anchor** *(verified)*: `ledger/src/versions/common/mod.rs:586` (`api.tagged_serialize(&ev.content)?` inside `.map()`), `:578-589` (`.collect()` into `Result<Vec<_>,_>` → any single failure aborts the helper); atomicity — `build_ledger_events` at `mod.rs:444`/`:555` runs *before* persist (`:503`/`:559`), so state stays consistent. Re-read at head: the `?`-in-map + collect resolves exactly.
- **Risk / impact — medium**: an otherwise-valid transaction becomes a failed apply if any one ledger event fails to serialise — a liveness/availability degradation. State stays consistent (persist is after the `?`), so no corruption. Rubric medium (degrades a guarantee without loss); capped there because it is availability-only.
- **Evidence confidence — low**: plausible but the triggering serialisation failure is materially unconfirmed — it mirrors the pre-existing `?`-on-`tagged_serialize` convention already used for `state_root`/address serialisation (`mod.rs:435,455,463,471,552`), and the round-trip test `should_emit_events_whose_payload_round_trips` shows normal `EventDetails` serialising cleanly. A failure requires a serialisation bug in the ledger itself — an untested link. Rubric low = "the chain of inference has an untested link."
- **Production likelihood — low**: requires a ledger-side serialisation bug (unusual coincidence). Rubric low.
- **Category — correctness** (would produce a wrong apply outcome — a valid tx failing).
- **Validation mode — source trace (P1); P5 blocked** for execution confirmation.
- **Disposition rationale**: below the accepted threshold (low confidence) → **observation**. Reported, non-blocking.

### A8-1 — Verbatim event-content forward; no redaction/allowlist; `#[non_exhaustive]` forward-exposure · Observation

- **Evidence anchor** *(verified)*: `ledger/src/versions/common/mod.rs:586` (`content_tagged_bytes = api.tagged_serialize(&ev.content)?` — the *entire* `EventDetails`, no field selection); `insight:events.rs:85-127` (`#[non_exhaustive] enum EventDetails` incl. Zswap nullifiers/ciphertexts, dust nullifiers). Re-read at head: the verbatim-serialise line resolves exactly (same anchor as A2-1's `?`).
- **Risk / impact — medium**: (i) lowers the bar for bulk-harvesting the full ledger event stream via one `state_getStorage(System.Events)` RPC (linkability/traffic-analysis aid), and (ii) `#[non_exhaustive]` + verbatim forward means a future ledger variant carrying more sensitive data is auto-exposed with no node-side gate. Capped at medium (not high) because the information is *already* re-derivable by any full node (the doc states every full node re-derives events locally), so no new cryptographic audience is opened — the change widens convenience/observability, not the shielding boundary.
- **Evidence confidence — low**: a definitive Zswap-ciphertext exposure judgement needs the ledger's Zswap crypto internals (beyond this change surface) and a runtime retrieval check (P6 blocked). The node faithfully inherits the ledger's privacy model. Rubric low = "plausible but materially unconfirmed; the chain of inference has an untested link."
- **Production likelihood — medium**: the RPC surface is a default-available read path; harvesting is realistic. But the *defect* (audience widening) is not confirmed, so likelihood attaches to the exposure-convenience mechanism, which is medium (realistic tooling, non-default intent).
- **Category — integration** (cross-component data-exposure contract; privacy surface between node and RPC consumers).
- **Validation mode — source trace (P1/P4); P6 blocked** for runtime retrieval confirmation.
- **Disposition rationale**: below the accepted threshold (low confidence) → **observation**. The forward-compat (`#[non_exhaustive]`, no allowlist) sub-point is a legitimate hardening recommendation to surface as a review comment; not verdict-moving.

### A6-2 — Stale "Requires a metadata rebuild" change-file note · Observation

- **Evidence anchor** *(verified)*: the review **head commit itself** is `chore: rebuild metadata (midnight-node#1474)` (`git log 61c9c349`), and the checked-in blobs already carry the new variants (`strings midnight_metadata.scale` → `LedgerEvent`, `LedgerEventSource`, `content_tagged_bytes`, `logical_segment`, `physical_segment` — verified this activity). So the change-file note reading "Requires a metadata rebuild" as outstanding is stale.
- **Risk / impact — low**: a documentation/change-tracking accuracy nit with no near-term production consequence. Rubric low = "quality or hygiene concern with no near-term production consequence."
- **Evidence confidence — high**: directly demonstrated — the rebuild commit and the updated blobs are both exhibited, not inferred. Rubric high = "the mechanism is directly demonstrated end-to-end at the anchor."
- **Production likelihood — low**: no faulty production path — a stale markdown note. Rubric low.
- **Category — hygiene**: non-production quality (rubric `hygiene`).
- **Validation mode — hybrid**: git log + `strings` (source plus command output).
- **Disposition rationale**: this is a **boundary case** — the bright-line acceptance rule (confidence medium/high + verified anchor) would technically accept it, but the rubric's PR-#1849 **calibration anchor is directly on-point**: "Stale checked-in metadata … known as release follow-up: non-blocking technical observation — reported as a review comment, **not an accepted issue**." The calibration is provided precisely to resolve such boundary calls, and treating a pure doc-note-staleness item (risk low, no production path) as verdict-moving would contradict it. Dispositioned as an **observation** (non-blocking review comment) with this reasoning recorded so the adjudication trail is explicit.

### A9-2 — Stale rebuild-note (doc-accuracy axis) · Observation

- **Evidence anchor** *(verified)*: identical to A6-2 (A9 reconciliation row "Requires a metadata rebuild" → **Stale/contradicted**).
- **Grade tuple**: risk **low**, confidence **high**, likelihood **low**, category **hygiene**, validation **hybrid (git log + strings)** — same as A6-2 (same underlying item on the doc-accuracy axis).
- **Disposition rationale**: **observation**, per the same calibration-anchored reasoning as A6-2. Same root cause as A6-2; retained as a distinct A9-area entry but the two dedupe to one underlying stale-note observation.

### A2-2 — Shared apply-path helper (no divergence) · Observation (positive)

- **Evidence anchor** *(verified)*: `build_ledger_events` has exactly two call-sites — `mod.rs:444` (user path) and `:555` (system path) — both invoking the identical helper; A4 confirms the two system apply-sites (`pallets/midnight-system/src/lib.rs:143-159` governance, `:182-196` executor) are field-by-field identical in the event contract. Re-read at head: both call-sites and the shared helper resolve exactly.
- **Risk / impact — low**: none — this is a *positive* finding (no path divergence in how `events` is built).
- **Evidence confidence — high**: directly demonstrated by call-site enumeration + the single helper definition.
- **Production likelihood — n/a**: no faulty path (positive observation).
- **Category — hygiene** (structural quality note; no defect).
- **Validation mode — source trace (P1/P2-degraded)**: caller enumeration grep-best-effort (gitnexus blocked), but the single-helper structure is directly read.
- **Disposition rationale**: a positive observation confirming design soundness — recorded for the trail; not a defect, not verdict-moving.

---

## Grade-tuple completeness attestation

Every one of the 10 register entries above carries the complete six-dimension tuple (evidence anchor,
risk/impact, evidence confidence, production likelihood, category, validation mode). No tuple element is
missing. All anchors were independently re-verified against the review head this activity. No candidate
was dismissed (no evidence-contradicted candidates). This satisfies the grade-tuple completeness gate and
the accepted-issue-threshold gate: all 5 accepted entries carry medium/high confidence with a verified
anchor; all observation entries are below threshold (low confidence) or are non-blocking calibration-anchored
hygiene/positive items.

## Adjudication → verdict handoff

- **Accepted, verdict-moving:** 4 distinct defects — **A1-1** (high/medium/medium, compatibility),
  **A7-1** (high/high/medium, operational), **A6-1 ≡ A9-1** (medium/medium/medium, integration — one
  decode-contract defect on two axes), **A5-1** (medium/medium/medium, performance).
- **Observations (non-blocking):** A2-1, A8-1, A6-2 ≡ A9-2 (stale-note, one item on two axes), plus the
  A2-2 positive.
- **Per-area accounting (reconciles with `03` and the register):** A1→1 accepted; A2→2 observations
  (A2-1, A2-2); A3→0; A4→0; A5→1 accepted; A6→1 accepted (A6-1) + 1 observation (A6-2); A7→1 accepted;
  A8→1 observation; A9→1 accepted (A9-1, facet of A6-1) + 1 observation (A9-2, facet of A6-2). Total
  register entries = 10, matching the 10 candidates in `03-evidence-log.md`; every finding maps to
  exactly one area.
