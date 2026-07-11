# Prospective Improvements — substrate-node-security-audit (v4.18.0)

> Planning · 2026-07-03 · improvement identification across two axes: (1) workflow-design/convention debt (Themes A–E, AP catalog through AP-85, post-#160 worktree-aware guards) and (2) new audit *content* from midnight-node codebase analysis (Theme F)

## Context

The workflow is at v4.18.0 after two back-to-back workflow-design sessions (v4.17.0 compliance
remediation on 2026-07-02, v4.18.0 GitNexus adoption on 2026-07-03). Most low-hanging convention
debt is gone. Themes A–E are what those passes deferred, what the newer AP catalog now names, and
what a fresh read of the activities/techniques surfaces; evidence lines reference the `workflows/`
worktree at v4.18.0. **Theme F** is a separate axis added on request: new audit-content
recommendations (checks, patterns, target-profile updates) grounded in a fresh analysis of the
midnight-node codebase — the audit's actual target — whose crate map, feature surface, and
remediation state have all moved substantially since the audit's last content update (v4.14.0,
2026-02-11). Theme F evidence references the midnight-node worktree at
`feat/1474-expose-ledger-events` (HEAD `7fa88e1c`, 2026-05-13).

## Theme A — Make the structural gates actually gate (P1)

The v4.17.0 F-05 remediation moved the three HARD-STOP gates from prose to structure, but the
structure is currently self-certifying:

**A1. Gate flags are set unconditionally in one bulk step.** `03-primary-audit.yaml`
`finalize-activity` sets `dispatch_complete`, `verification_complete`, `merge_complete`, and
`primary_audit_complete` together, unconditionally, at the end of the activity
(`activities/03-primary-audit.yaml:42-58`). Workflow rules 26–27 say `verification_complete` "is
set from V's output" and the merge is not performed inline — but structurally every flag flips
true on the default path regardless of what V or M returned. The report-generation gates then
validate flags the previous activity always sets.
*Fix:* attach each `set` to its evidence-bearing step, using the established
`index-codebase`/`gitnexus_available` pattern ("reaching this action implies the step succeeded"):
`dispatch_complete` on `verify-agent-output-files`; `verification_complete` on the step that
verifies V's persisted gap report; `merge_complete` on a merge-output verification step (see A3).
Drop the bulk sets from `finalize-activity` (keep `primary_audit_complete`).
*Effort:* S. Activity YAML only; no contract break.

**A2. Two `validate` actions are message-only.** The coverage gate and finding-count
reconciliation gate in `05-report-generation.yaml:39-42` are `validate` actions with a `message`
and no `condition` — text-only enforcement, the same defect class F-05 fixed for the other three
gates.
*Fix:* introduce evidence variables set from V's and M's outputs — e.g.
`coverage_gate_passed` (from V's coverage table: zero UNREAD/RECON-ONLY rows) and
`reconciliation_unaccounted_zero` (from M's reconciliation table) — set them on the steps that
verify those outputs (per A1), and give both `validate` actions real conditions.
*Effort:* S–M. Two new variables + condition wiring.

**A3. The merge agent's output is never file-verified.** `dispatch-merge-agent` is followed only
by `preserve-verification-report`, which binds `dispatch-sub-agents::verify-output-files` with
**no** `expected_output_files` input (`activities/03-primary-audit.yaml:39-41`) — under-specified
(which file?), and no step verifies M's merged-findings file persisted at all.
*Fix:* give `preserve-verification-report` its expected file input (V's gap-report JSON) and add
a merge-output verification binding (M's merge/reconciliation JSON) — the natural carrier for
`merge_complete` per A1.
*Effort:* S.

## Theme B — Binding fidelity: continue the F-10 decomposition (P2)

**B1. `verify-sub-agent-output` is an 11-protocol monolith bound in five roles.**
(`techniques/verify-sub-agent-output.md`; bound at `03-primary-audit.yaml:15-20` twice,
`05-report-generation.yaml:52-54`, `10-sub-crate-review.yaml` `verify-completeness`,
`14-sub-output-verification.yaml` `verify-output`.) This is exactly the shape F-10/F-11 split for
`dispatch-sub-agents`, and AP-73(c)/AP-64(3) name it monolith-masking: each binding site needs
only a slice of the protocols, and nothing but the step id says which slice.
*Fix:* split into an operation group mirroring `dispatch-sub-agents/`:
`check-dispatch-completeness` (protocol 1), `check-coverage-gate` (2), `check-mandatory-tables`
(3+4), `run-targeted-checks` (5, 7–10 — the per-domain re-dispatch checks), `extract-table-findings`
(6), `produce-verification-report` (11). Rebind the five sites to their matching op. The full
protocol set stays intact for the V sub-agent via `14-sub-output-verification` binding the ops in
sequence (or the group base). This also naturally retires the F-18 residual slug
`every-protocol-executed-mechanically` (`verify-sub-agent-output.md:112`) during the split.
*Effort:* M–L. Largest single change; reuses existing protocol content verbatim per AP-64's
split rule.

**B2. `verify-checklist-prompt-coverage` binds a technique that doesn't contain its check.**
The step (`03-primary-audit.yaml:15-17`) binds `verify-sub-agent-output`, but none of the 11
protocols covers §3-item→dispatched-prompt coverage — that check lives only in workflow rule 24.
The binding is wrong-shaped; the step's semantics are homeless.
*Fix:* home it as a real operation (fits the B1 group as `check-prompt-coverage`, or
`dispatch-sub-agents::verify-prompt-coverage` since it validates dispatch composition) and bind
it; rule 24 then states the invariant while the op carries the procedure.
*Effort:* S (within B1).

**B3. Six `dispatch-concurrent` bindings pass no distinguishing input.** The op takes an
`agent_roster` input (`techniques/dispatch-sub-agents/TECHNIQUE.md`), yet none of the six
bindings (4× in primary-audit, 2× in reconnaissance) supplies one — the difference between
dispatching the primary batch, R, S, V, M, or the gap-driven re-dispatch is carried only by step
ids and workflow rules. AP-73's multi-bind exception ("fixed roster of distinct static targets")
expects *different structured inputs*; these have none. `act-on-gap-report` is the worst case:
"derive a targeted re-dispatch roster from V's gap report" appears nowhere in the bound op.
*Fix:* pass a per-binding `agent_roster` input naming the roster source (primary roster from
`assign-roster`; verification agent V per `sub-output-verification`; merge agent M per
`sub-structured-merge`; re-dispatch roster derived from the gap report's
`redispatch_recommendations`). Consider a dedicated `redispatch-gaps` op if the gap-roster
derivation deserves its own protocol.
*Effort:* S–M.

## Theme C — Genericity: finish the v4.9.0 overfitting remediation (P3)

**C1. Target-coupled literals in the generic layer.** The v4.9.0 pass moved target specifics to
the target profile but remnants survive outside it:
- `expected_output_files: a1-nto.json, a2-midnight-ledger.json, …` hardcoded in
  `03-primary-audit.yaml:29` — file names derived from midnight's crate roster, frozen in a
  generic activity.
- `verify-sub-agent-output.md:58` protocol 5: "specifically: NTO pallet, any bridge pallet".
- Protocols 8–9 hardcode agent A3, `service.rs`, `command.rs`.
- Workflow rules 22/25/33 hardcode the roster "(A1-A7, B, D1, D2)", the A3/A4 split, and A3's
  genesis-path duty.
*Fix:* derive `expected_output_files` from `assign-roster`'s output (the roster already carries
`agent_id` per agent); route pallet/file/agent specifics through the vulnerability domain map and
target profile, leaving generic role language ("the node-startup agent", "pallets processing
external-chain inherents") in rules and techniques.
*Effort:* M. Touches the same files as B1 — sequence together.

## Theme D — Variable and resource hygiene (P4)

**D1. `audit_prompt_template` default points into a gitignored planning folder.**
`workflow.yaml:56-59` defaults to
`.engineering/artifacts/planning/2026-02-06-audit-strategy-reverse-engineering/01-audit-prompt-template.md`
— unversioned, absent on any fresh clone (universal rule 36 says planning artifacts are never
referenced), and the workflow has owned a thinned `audit-prompt-template` **resource** since
F-20. `setup-audit-target` protocol just fails if the path is missing.
*Fix:* repoint the default at the workflow resource (bare slug per F-19 convention), or drop the
variable entirely if the resource fully subsumes it (AP-85 direction).
*Effort:* S.

**D2. `cargo_audit_available` is dead.** Declared with `defaultValue: false`
(`workflow.yaml:71-74`) but never set and never read anywhere in the workflow — the same class
as F-08's pruned `agents_assigned`/`agents_dispatched`.
*Fix:* either wire it structurally (a `set` on the cargo-audit step of `setup-audit-target`,
mirroring `gitnexus_available`) if anything downstream should branch on it, or prune it.
*Effort:* S.

**D3. `write-report.md` template placeholders trip `check:binding`.** Ten read-resolution
findings ({start}, {end}, {org}, {source_blob_base}, {remediation}, …) at
`techniques/write-report.md:87-99` — report-template placeholders, not variable reads, but they
sit in the guard baseline as noise.
*Fix:* declare them as `$`-locals produced by the link-construction protocol step (the
`affected_files_hyperlink` prose already defines how `{source_blob_base}` is built), or escape
the template block — whichever the guard's conventions prefer. Shrinks the corpus baseline.
*Effort:* S.

## Theme E — Deferred review follow-ups (P5)

- **E1.** Re-verify the 16 Medium/Low findings remediated in v4.17.0 on first-pass judgement only
  (07-02 review's own deferral) — a lighter adversarial pass over those diffs next session.
- **E2.** `graph-first-when-indexed` slug is shared by `map-codebase.md` and
  `analyze-architecture.md` (07-03 review, noted Low) — confirm intentionally distinct or unify
  the wording into one referenced rule.
- **E3.** Activity numbering gap 08/09 (F-15) — documented band-split in `activities/README.md`;
  renumbering remains available but was deliberately declined. Recommend: leave as-is.
- **E4.** Cross-workflow overlap check vs `work-package/resources/rust-substrate-code-review.md`
  (per the four-tier reuse policy): different philosophy (change review vs full audit), likely a
  documented-divergence note like the v4.18.0 prism assessment rather than adoption.

## Theme F — New audit content from midnight-node codebase analysis (P2–P3)

This theme is content, not structure: new checks, patterns, and profile updates driven by what the
target codebase actually contains. It is a different kind of change from Themes A–E and follows a
different pipeline.

**Provenance and how to read this theme.** Three parallel read-only surveys of the midnight-node
worktree (`feat/1474-expose-ledger-events`, HEAD `7fa88e1c`, 2026-05-13) established what changed
since the audit's last content update (2026-02-11, v4.14.0). The codebase is ~3 months and >2,000
commits past that baseline, and this branch adds a whole ledger-event-exposure feature. **Two
caveats bound every item below.** (1) *Provenance discipline* — the audit's content has historically
been derived from professional reference reports and gap analyses (v4.11–v4.14), which carry
independent ground truth; codebase-derived leads do not. Every candidate here is a *lead* an auditor
must confirm is (a) a real gap and not design-intentional, and (b) not already caught by an existing
check once that check is applied to the new code. (2) *Overfitting discipline* — the v4.9.0
remediation fought exactly the failure of baking target specifics into generic rules. So each
candidate is split: a **target-agnostic idiom** becomes a catalog check/pattern; a **midnight
specific** goes to `target-profile`. The two headline items (F1, F3's Check 33) were verified by
direct code read; the remainder are survey-reported and flagged as such.

### F1. The target profile is factually stale (P1 — highest confidence, smallest diff)

`target-profile.md` describes a codebase that no longer exists at these paths, so a fresh run
mis-routes or drops coverage. This is the single highest-value, lowest-risk content change and
gates any re-run. Verified against `Cargo.toml`:

- **`native-token-observation` → renamed `cnight-observation`** (commit `c7d3dc91`, Oct 2025). The
  profile still names `pallets/native-token-observation/` in the A1 roster entry, the Cross-Chain
  Pallets list, blind-spots #5 and #14, and the §3.2 domain hint. Every reference resolves to a
  dead path.
- **`util/upgrader` deleted** (commit `2f7e3d82`) yet still in D2's assignment.
- **`partner-chains/` inlined as a git subtree** (Apr 2026) — dozens of now-first-party crates
  (committee-selection incl. the Ariadne selection algorithm, the bridge pallet + primitives,
  `plutus-data`, db-sync data sources, governed-map, block-participation, sidechain) that the roster
  does not assign at all. A scope decision is owed: upstream-derived but first-party and
  consensus-adjacent.
- **New in-scope crates with no roster entry:** `pallets/c2m-bridge`, `pallets/throttle`, the
  `relay/` binary, and `primitives/{beefy,ics-observation,reserve-observation}` (A6's "all
  primitives" nominally covers the last three but they carry distinct new surfaces — see F2).
- The profile has **no pinned commit**; its calibration is implicitly a Feb-2026 snapshot (see F6).

*Fix:* refresh the roster, file-coverage, cross-chain-pallets, blind-spot, and domain-hint tables;
pin the profile's target commit; make the partner-chains scope call. *Effort:* S for the
renames/deletes/repins; M to scope partner-chains and assign the new crates.

### F2. New crate/component coverage — surfaces with no roster home (P2)

Each needs a roster assignment and a note on which §3 items and checks apply:

- **`c2m-bridge`** — Cardano→Midnight value bridge implementing `TransferHandler`: batch approvals
  (`MAX_APPROVALS_PER_BATCH = 32`), subminimal-transfer accumulation, treasury/reserve/user routing.
  Dedicated agent; §3.3/§3.7/§3.13 plus new Checks 33–35.
- **`throttle`** — a `CheckThrottle` `TransactionExtension` plus a migration. Introduces a surface
  *class* the catalog has zero coverage of: SignedExtension/TransactionExtension `validate`/`prepare`
  logic. New assignment + Check 41.
- **`relay/`** — an off-chain BEEFY→Cardano relayer *daemon*. This is a component **type** the audit
  does not model — it models the node binary and the toolkit, not a separate signing/submitting
  daemon. New surfaces: key-file handling and `author_insertKey`, signature-threshold enforcement,
  Merkle proof over the authority set, proof freshness. New agent + a small relay checklist.
- **BEEFY** (`primitives/beefy`, `runtime/src/beefy.rs`) — authority-set rotation, monotonic
  validator-set-id, stakes Merkle root.
- **ICS/Reserve genesis** (`primitives/{ics-observation,reserve-observation}`,
  `node/src/genesis/creation/*`) — Cardano-sourced treasury snapshots at genesis.
- **Ledger events V2** (this branch's feature) — `host_api::apply_transaction` /
  `apply_system_transaction` now return `Vec<LedgerEvent>`; new `pallet_midnight` /
  `pallet_midnight_system` `LedgerEvent` events carrying `{source, content_tagged_bytes}`.
- **partner-chains subtree** — committee selection (Ariadne weighted-random), Plutus datum encoding,
  db-sync Cardano parsing (contingent on the F1 scope decision).

### F3. New target-agnostic mechanical checks (P2)

Suggested numbers continue the catalog's sequence; the audit team dedups and renumbers. Each is
written generically — the midnight evidence is the lead, not the check text.

- **Check 33 — Silent failure in system-transaction / executor dispatch.** Extends Check 23 beyond
  hooks-and-`Currency`: a handler dispatches a fallible executor/system-tx call
  (`execute_system_transaction`, `construct_*_system_tx`), only logs on `Err`, and the caller then
  emits an event or commits/kills state as if it succeeded. **Verified:** `c2m-bridge`
  `execute_serialized_tx` (lib.rs:288-293) logs-and-drops both the serialize and the execute errors;
  the caller `handle_subminimal_transfer` calls `SubminimalTransfers::kill()` (lib.rs:319)
  regardless. FAIL if a fallible external-execution result is not propagated and a subsequent
  state-mutation/event assumes success. Severity potential High–Critical (fund-flow).
- **Check 34 — State consumed before a fallible external op, without revert.** The take/remove/kill
  mirror of the existing insert-then-fallible error-path check. `ApprovedMcTxHashes::take()` then
  ledger execute; `SubminimalTransfers::kill()` then flush. FAIL if a storage take/remove/kill
  precedes a fallible op whose failure path does not restore it.
- **Check 35 — Provider/oracle error silently changes control-flow classification.** A
  config/price/threshold provider returns `Err`, and the code falls through to a *different* branch
  rather than erroring or using a genesis-validated default. Survey lead: `MinBridgeAmountProvider`
  failure makes every transfer "regular", bypassing subminimal batching (`c2m-bridge` lib.rs:417).
  FAIL on any error-fallthrough that changes semantics.
- **Check 36 — Host-function input bounds at the Wasm→native boundary.** A new boundary class; the
  catalog's file-I/O check is only its native-filesystem analog. `PassFatPointerAndRead<&[u8]>`
  params (`state_key`, `tx`) decoded in `host_api` (ledger_8.rs) without a max-size guard. FAIL if a
  host fn reads a runtime-supplied buffer with no size cap / `DecodeWithMemTracking` limit.
- **Check 37 — Versioned opaque-payload / dual-version dispatch consistency.** `content_tagged_bytes`
  carried without tag validation; the toolkit's ledger_8→ledger_7 fallback with no byte-identity
  guarantee; per-call `is_unified()` storage-mode reads. FAIL if a versioned opaque payload is
  decoded without validating its tag, or a dual-version fallback can silently return divergent
  results.
- **Check 38 — Unbounded per-item accumulation into block/event state.** Extends Check 20 (unbounded
  `Vec` in extrinsic params) to host-fn returns and event payloads: `Vec<LedgerEvent>` per
  transaction flows into `frame_system::Events` with no cap. FAIL if per-tx event/data vectors
  entering block state lack a length bound.
- **Check 39 — Cross-chain scalar / field-element range validation at import.** A cross-chain-sourced
  key/scalar is used before validation to its field/curve range. Lead: `DustPublicKey` is Fr-range
  filtered only at the IDP (commit `fdb7a2e0`), while the `cnight-observation` registration path
  stores `dust_public_key` without format/range checks. That recent in-tree fix confirms the class
  is real.
- **Check 40 — External-chain value cast + asset-identity verification at genesis.** Check 24
  (narrowing cast) is the generic parent; this is the genesis-treasury specialization plus a new
  asset-identity half. `amount as u64` on Cardano `u128` UTxO quantities in
  `ics_genesis`/`reserve_genesis` with no bounds check, and the queried asset policy-id/name not
  re-verified against the configured identity. FAIL on an unchecked external-value narrowing OR a
  trusted-without-verification external asset identity.
- **Check 41 — TransactionExtension / SignedExtension validation logic.** The catalog has no
  SignedExtension coverage. `throttle`'s `CheckThrottle` `validate`/`prepare`, its block-number
  window reset, and reorg resilience. FAIL on window/counter logic that is not reorg-safe, missing
  weight, or a bypassable validation path.

### F4. New vulnerability-vocabulary pattern (P3)

One reasoning pattern for the architectural sub-agent, generalizing F3's fund-flow cluster:
**External-execution optimism** — state or events treated as final before an asynchronous external
execution (system-tx dispatch, cross-chain submission, ledger construction) is confirmed. FINDING if
a value-bearing event fires or a resource is consumed on the optimistic path with no
confirmation/rollback. (Checks 33–35 are its mechanical instances; the pattern gives the
architectural agent the recognition aid.)

### F5. Target-profile blind-spot, domain-hint, and calibration updates (P2, midnight-specific)

The target instantiations of F3's generic checks, plus routing for the new crates:

- New blind-spot items: c2m-bridge `execute_serialized_tx` error handling; subminimal flush
  kill-before-confirm; throttle window reorg-safety; ledger-event `Vec` bound; host-fn buffer size;
  ICS/reserve amount cast + asset-identity; `dust_public_key` registration validation; relay
  signature-threshold.
- Domain hints for c2m-bridge, throttle, relay, ledger-events, and the BEEFY/genesis crates.
- Update the Cross-Chain Pallets list to `cnight-observation` and add `c2m-bridge`.

### F6. Calibration refresh — the benchmarks describe a codebase that has moved (P2)

The `Severity Calibration Benchmark` table and Vulnerability Domain Hints are pinned to a ~Feb-2026
professional audit. Since then, **many of those exact issues were remediated in-tree** — audit-tagged
commits landed for the per-address registration cap (Issue AE), untagged-hex EOF (Issue H), DB TLS
validation, CIP-19 reward-address validation, cNIGHT policy-id length, Fr-range `DustPublicKey`
filtering, DB-connection-log redaction, bound finality subscription fan-out, derivation-path role
validation, and nonce/nullifier regression tests. Implication: a fresh run at the current commit will
legitimately *not* find issues the profile still lists as domain hints and blind-spots, and the
calibration anchors describe a state that no longer exists. *Fix:* re-pin calibration to a current
reference report (or mark remediated rows historical), and convert the fixed issues into
regression-test anchors ("verify the fix is present") rather than expected findings. This is also a
gap-analysis-phase concern.

### F7. Toolkit-checklist extensions — Cardano/Aiken and bridge tooling (P3)

New surfaces for the Group D toolkit agents, as generic checklist items + midnight Toolkit Focus
Items:

- **Aiken deployer / `aiken-contracts-lib`** — Cardano governance-contract deployment: key material
  (ECDSA cross-chain, AURA/GRANDPA), datum/redeemer construction, double-CBOR encoding,
  script-hash/policy-id derivation. Lead: hardcoded signer-key prefix with no length validation on
  the Cardano hash. Checklist idea: validate key lengths/format before datum construction; validate
  CBOR and language-version before computing a script hash.
- **`bridge_transfer` toolkit commands** — Cardano bech32 / network-id / checksum validation, UTxO
  ref parsing bounds, fee adequacy, no double-spend across forks.
- **coin-selection** (`generate_txs --coin-selection`) — determinism and result-set bounds.

## Proposed sequencing

| Tranche | Items | Rationale |
|---------|-------|-----------|
| 1 | A1, A2, A3, D1, D2 | Gate integrity + trivial hygiene; small YAML-only diff, immediately makes the "enforced structurally" claim true |
| 2 | B1, B2, B3 | The op-group split; largest diff, self-contained, precedented by F-10 |
| 3 | C1 | Genericity; touches B1's files, do after the split lands |
| 4 | D3, E2, E4 | Guard-baseline and documentation polish |
| 5 | E1 | Verification pass over the v4.17.0 Medium/Low remediations |
| 6 | F1, F6 | Content, high-confidence: fix the stale profile and re-pin calibration before any re-run — small diff, blocks correct execution |
| 7 | F3, F4 | Target-agnostic catalog checks + the one new pattern; reusable across any Substrate node |
| 8 | F2, F5, F7 | Midnight-specific roster, blind-spots, and toolkit items; depends on the F1 partner-chains scope call |

Execution: Themes A–E are workflow-design UPDATE-mode sessions (structural), in a dedicated
`workflows`-branch worktree, guards run with `--root` at the worktree (supported post-#160). Minor
version bump to 4.19.0; no phase, checkpoint, or artifact-contract break. **Theme F is content work
on a different pipeline** — it mirrors the v4.11–v4.14 content-addition provenance and is best run
either as its own content-focused session or folded into a gap-analysis pass against a fresh
reference report (which also supplies F6's re-pinned calibration and the independent ground truth
F's provenance caveat calls for). F1+F6 can land immediately; F3/F4 are catalog edits; F2/F5/F7 wait
on the partner-chains scope decision.

## Explicitly not proposed

- Rebuilding on the prism spine — assessed and declined with rationale in v4.18.0.
- Renumbering activities (E3) — the band-split is documented; churn outweighs benefit.
- Treating Theme F candidates as findings to remediate *in the audit workflow* without auditor
  validation — they are content *leads* from automated survey, not confirmed gaps. F's own caveat is
  that codebase-derived content lacks the independent ground truth a reference report supplies; the
  leads are triaged before any check text is written.
- Auditing midnight-node itself as part of this work — the code excerpts here justify *audit-content*
  changes; they are not an audit deliverable. (Several, e.g. the c2m-bridge silent-failure cluster,
  look worth reporting to the midnight-node team on their own track.)
