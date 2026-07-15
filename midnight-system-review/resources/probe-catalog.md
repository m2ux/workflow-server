---
name: probe-catalog
description: The bounded probe classes evidence gathering selects from — what each validates, its instruments and toolchain gate, bounding guidance, and how a gated-out probe becomes a recorded blocked validation.
metadata:
  order: 2
---

# Probe Catalog

Every planned probe comes from this catalog. A probe is one bounded evidence-gathering action with a stated validation target — never open-ended exploration. Plans select two to `probe_budget_per_area` probes per area, matched to the area's subsystem class and change kind. Where a probe's toolchain gate is false, the probe is recorded as a blocked validation — the missing instrument and the unvalidated claim — and never silently skipped.

Failure-class discharge records use three-way disposition: **confirmed** (evidence supports the failure mode), **refuted** (proof the failure mode cannot occur), or **inconclusive** (evidence insufficient). Inconclusive is never silently treated as refuted. Refuted on correlation-class or atomicity-class obligations requires the proof artifacts defined for P7, P8a, or P8b below.

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

## P7 — Cross-record correlation

- Validates: identifier-consistency claims across records a downstream consumer joins — e.g. an emitted event's key field against the correlated record's key field, checking both are populated from the same source on every emitting path (the state-root-vs-transaction-hash correlation class).
- Instrument: source tracing of each join-key field back to its assignment origin, on every path that emits the paired records; grep for the field's writes.
- Gate: none — source trace.
- Bounding: one join-key relationship per probe; anchor the origin of each side and state whether they agree or diverge.
- Evidence form: a mandatory **join-key discharge table** — for each paired record type, the field name, assignment origin (file:line), and same-source vs different-source verdict — plus file:line anchors for each record's key assignment.

## P8a — Downstream-caller propagation

- Validates: error propagation from a changed callee through caller control flow — whether a caller surfaces, handles, or swallows errors from the changed function when the signature, return, or failure semantics changed.
- Instrument: enumerate callers of the changed symbol (the `gitnexus-operations` group when `gitnexus_available`, otherwise grep plus targeted reads), then trace each caller's control flow around the fallible call — early returns, error handling branches, swallowed errors.
- Gate: `gitnexus_available` for enumeration; fallback is grep-based caller discovery plus reads (P1/P2 discipline).
- Bounding: one caller's propagation path per probe; anchor the fallible call and the observed error-handling behavior.
- Evidence form: file:line of the caller's fallible call and error-handling path, with the observed propagation or swallowing behavior.

## P8b — Downstream-caller post-call storage

- Validates: caller-side persistent-state integrity after a non-propagating (swallowed-error) call — each caller that mutates persistent state (storage writes/deletes, accounting consumption) commits or rolls back correctly when the callee returns without propagating failure (the accounting-consumed-before-success class).
- Instrument: enumerate callers of the changed symbol (the `gitnexus-operations` group when `gitnexus_available`, otherwise grep plus targeted reads), then trace each caller's state mutations **after** the fallible call — the order of consume/delete versus commit.
- Gate: `gitnexus_available` for enumeration; fallback is grep-based caller discovery plus reads (P1/P2 discipline).
- Bounding: one caller's post-call storage path per probe; anchor the state mutation and its ordering against the fallible call.
- Evidence form: file:line of the caller's state mutation and the fallible call, with the observed on-failure behavior and a per-caller path anchor for refutation.

## P9 — Operational tooling

- Validates: subsystem-map **entrypoints** and **advertised-control** claims — CLI flags, workflow steps, and orchestration options that tooling documentation or subsystem-map metadata asserts are applied during release and upgrade flows.
- Instrument: subsystem-map entrypoint metadata plus source/workflow tracing of the advertised control path; optional execution when toolchain gates allow.
- Gate: none for static tracing; execution probes follow existing toolchain gates (`cargo_available`, `node_binary_available`).
- Bounding: one entrypoint or advertised-control claim per probe; trace from the subsystem-map entrypoint to the implementation that applies or omits the control.
- Evidence form: file:line or workflow-path anchors showing the control is wired or absent; execution output when gates permit.

## Blocked-Validation Record

For every probe whose gate is false, record in the area's evidence: the probe class, the claim that could not be validated, the missing instrument, and the degradation consequence (what evidence confidence caps at without it). The strict-run precedent: Rust tests, benchmarks, node execution, and RPC checks recorded as unavailable because cargo/rustc and a built node were absent — the review proceeded on P1–P4 evidence with the gaps stated.
