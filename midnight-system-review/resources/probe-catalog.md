---
name: probe-catalog
description: The bounded probe classes evidence gathering selects from — what each validates, its instruments and toolchain gate, bounding guidance, and how a gated-out probe becomes a recorded blocked validation.
metadata:
  order: 2
---

# Probe Catalog

Every planned probe comes from this catalog. A probe is one bounded evidence-gathering action with a stated validation target — never open-ended exploration. Plans select two to `probe_budget_per_area` probes per area, matched to the area's subsystem class and change kind. Where a probe's toolchain gate is false, the probe is recorded as a blocked validation — the missing instrument and the unvalidated claim — and never silently skipped.

## P1 — Source tracing

- Validates: control and data flow claims — error paths, storage mutation ordering, event emission contracts, weight derivation.
- Instrument: direct reading of the implicated sources, following the flow across functions and pallets; grep for symbol usage.
- Gate: none — always available.
- Bounding: trace one named flow per probe, from entry point to the claim under test; stop when the claim is confirmed or refuted with a file:line anchor.
- Evidence form: file:line anchors with the observed behavior.

## P2 — Code-graph queries

- Validates: structural claims — callers/callees of a changed symbol, reachability, blast radius, cross-function comparison (e.g. do the root and internal execution paths build the same event tuple?).
- Instrument: the meta `gitnexus-operations` group (`query`, `context`, `impact`, `diff-coverage-map`).
- Gate: `gitnexus_available`; fallback is grep-based enumeration plus targeted file reads (P1 discipline).
- Bounding: one named structural question per probe; take the graph answer with its symbol references as the anchor.
- Evidence form: graph query results with symbol/file references.

## P3 — Metadata comparison

- Validates: ABI and metadata consistency claims — checked-in static metadata reflecting event/type changes, spec_version matching ABI changes, generated-binding freshness.
- Instrument: diffing generated artifacts against sources — e.g. `strings` over `metadata/static/*.scale` for expected variant names, `git diff base...head` over metadata paths, comparing `spec_version` against the ABI-changing diff.
- Gate: none for static comparison; regeneration checks need `cargo_available`.
- Bounding: one artifact-vs-source consistency question per probe.
- Evidence form: command output showing presence/absence, with the exact invocation.

## P4 — SCALE and size probes

- Validates: encoding and volume claims — decode compatibility of evolved structs across versions, payload-size bounds vs configured limits (e.g. benchmark coverage vs permitted bytes churned).
- Instrument: bounded decode/size reasoning over the SCALE layouts in the diff, arithmetic against configured limits found in source; small scripted checks where the toolchain allows.
- Gate: none for layout reasoning; executable decode checks need `cargo_available`.
- Bounding: one encoding or bound claim per probe; state the arithmetic explicitly.
- Evidence form: layout/limit comparison with sources for both sides.

## P5 — Build and test probes

- Validates: compile-time claims and executable behavior — does the workspace build, do targeted tests or benchmarks confirm a suspected defect.
- Instrument: `cargo check` / targeted `cargo test` / benchmark runs, narrowest scope that answers the question.
- Gate: `cargo_available`; there is no fallback — gate false records a blocked validation.
- Bounding: one build target or test per probe; never a full-workspace sweep for a local claim.
- Evidence form: command output (pass/fail, assertion detail).

## P6 — Runtime and RPC probes

- Validates: live-node claims — RPC retrieval of new data, runtime metadata served vs checked-in, node startup with the changed runtime.
- Instrument: a runnable midnight-node binary (version query, targeted RPC calls, local-environment rehearsal where warranted).
- Gate: `node_binary_available`; there is no fallback — gate false records a blocked validation.
- Bounding: one runtime question per probe against a locally-run node; no network-dependent assertions.
- Evidence form: RPC/execution output.

## Blocked-Validation Record

For every probe whose gate is false, record in the area's evidence: the probe class, the claim that could not be validated, the missing instrument, and the degradation consequence (what evidence confidence caps at without it). The strict-run precedent: Rust tests, benchmarks, node execution, and RPC checks recorded as unavailable because cargo/rustc and a built node were absent — the review proceeded on P1–P4 evidence with the gaps stated.
