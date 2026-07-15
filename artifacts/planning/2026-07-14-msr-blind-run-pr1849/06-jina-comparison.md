# Blind-Run Validation — midnight-system-review vs Jina simulation bot (PR #1849)

Comparison of the **blind** `midnight-system-review` run (session `ZE3S5P`, review head `61c9c349`)
against the Jina simulation bot's **strict run** on the same commit (review `0e13345f`, merge-readiness
1/5, 8 findings). The blind run's worker agents were given only neutral inputs (repo path, PR number,
base ref) and were barred from reading PR comments, PR reviews, bot output, linked engineering docs, or
any prior analysis of this change.

## Headline

| Metric | Jina strict run | Blind MSR run |
|---|---|---|
| Merge-readiness verdict | **1/5** "Strongly do not merge" | **1/5** "Strongly do not merge" |
| Areas investigated | 10 | 9 |
| Probes/tasks | 33 | 19 |
| Accepted/blocking findings | 8 | 4 distinct (A6-1≡A9-1 counted once) |
| Net-new accepted finding (not in Jina set) | — | 1 (doc decode-tag error, A6-1) |

The **verdict matches exactly**, and the blind run independently derived essentially all 10 of Jina's
investigation areas. On *finding recall* it caught **3 of 8 fully + 1 partially** — and the pattern of
what it missed is coherent and actionable (see Gaps).

## Finding-by-finding

| # | Jina finding | Location | Risk | Blind-run status | Blind-run ref |
|---|---|---|---|---|---|
| 1 | Governance `SystemTransactionApplied` emits **state root as tx hash** → breaks event correlation | `pallets/midnight-system/src/lib.rs:144` | high | **MISS** | A4 → "no-defect" |
| 2 | New runtime **can't decode old binary's host response** (unversioned appended field) | `ledger/src/common/types.rs:71` | high | **HIT** | A1-1 (accepted, high) |
| 3 | Event benchmark covers ~1 MiB while ledger permits ~50 MiB churn | `pallets/midnight/src/benchmarking.rs:29` | medium | **HIT** | A5-1 (accepted) |
| 4 | C2M bridge **discards accounting state** on failed/ swallowed system-tx execution | `pallets/c2m-bridge/src/lib.rs:305` | high | **MISS** | A2/A4 examined path, concluded state-consistent |
| 5 | Runtime activation has **no validator-binary compatibility gate** | `local-environment/src/commands/federatedRuntimeUpgrade.ts:94` | high | **MISS** | A7 reached release-image.yml, not the TS upgrade tooling |
| 6 | Image rollout **ignores `--include/--exclude` filters** | `local-environment/src/commands/imageUpgrade.ts:78` | medium | **MISS** | file not examined (outside 13-file diff) |
| 7 | Release automation publishes changed ABI under **unbumped spec_version** | `.github/workflows/release-image.yml:142` | medium | **HIT** | A7-1 (accepted, high) |
| 8 | System `LedgerEvent` payload growth **not in caller weight** | `pallets/cnight-observation/src/lib.rs:643` | medium | **PARTIAL** | A5-1 found emission unpriced, not the specific caller-weight gap |
| RC | Rebuild generated runtime metadata (non-blocking review comment) | `metadata/static/*.scale` | — | **MATCHED (disposition)** | A6-2 observation (blind run found metadata already rebuilt at this head) |

**Recall: 3 full + 1 partial of 8 (~44%).** Both decisive high-risk defects that *live inside the changed
files* (mixed-binary decode #2, release spec_version #7) were caught, plus the benchmark bound (#3). The
blind run also produced a **net-new accepted finding** Jina did not report — the `docs/ledger-events.md`
decode-tag mapping error (`event-details[v14]` unsubstantiated) — and correctly dispositioned privacy
(A8) and metadata-rebuild (A6-2/RC) as non-blocking, matching Jina.

## Gaps and their root cause

The four misses cluster into three probe *mechanisms* — none a knowledge gap:

- **G1 — cross-record identifier correlation** (miss #1). The governance bug is that
  `SystemTransactionApplied.hash` is populated from the state root while `LedgerEvent.source.transaction_hash`
  uses the ledger tx hash, so the two records that an indexer must join cannot be joined. Area A4 had the
  right file open and checked *atomicity* and *governance/executor parity* — but never asked "do two
  records designed to join use a consistent key?"
- **G2 — downstream-caller failure-atomicity** (miss #4; partial #8). The bridge bug lives in a *caller*
  (`c2m-bridge`) of the changed system-tx path: it deletes `SubminimalTransfers` / consumes
  `ApprovedMcTxHashes` regardless of executor success. A4 named `c2m-bridge` as a coupled caller and even
  anchored it, but its probe compared *event-emission parity*, not the caller's own state-consumption on
  the failure path. The cnight-observation weight gap (#8) is the same shape.
- **G3 — operational tooling beyond the diff** (misses #5, #6). Jina investigated the release/upgrade
  tooling (`federatedRuntimeUpgrade.ts`, `imageUpgrade.ts`) though none is in the 13-file diff. A7 did
  reach *outside* the diff (`release-image.yml`) — proving the workflow can — but not deep enough into the
  local-environment upgrade commands.

**Root cause (single lever).** The workflow's own `subsystem-map.md` **already names every one of these
failure classes** — "state root vs transaction hash correlation" (pallet-midnight-system), "accounting
state consumed before/despite failed execution" (c2m-bridge), "mandatory weight priced on partial work"
(cnight-observation), "advertised CLI controls (include/exclude filters) not actually applied" (release
automation). The workflow reads these failure classes during area derivation but **never converts them
into mandatory probe obligations**. Area A4 was handed "state root vs transaction hash correlation" in the
map and still closed as no-defect. So the fix is not more domain knowledge — it is *forcing each named
failure class of every in-scope and coupled subsystem to be confirmed, refuted, or recorded blocked*.

## Caveat — this validation is partly circular

The workflow was authored *from* this same Jina review (the original task was "recreate this as a native
workflow"). Its `subsystem-map.md` failure classes and its `grading-rubric.md` calibration anchors are
derived from PR #1849's findings. So a blind run against PR #1849 cannot measure generalization — the
areas were partly pre-seeded. The meaningful signal here is the *negative* one: **even with the answers
embedded in its own resources, the run missed the findings that require caller-tracing, cross-record
correlation, and beyond-diff tooling coverage** — which is exactly the probe-execution weakness the
augmentation targets. A clean generalization test requires running the augmented workflow against a
*different* midnight-node PR (recommended follow-up).

## Augmentation (applied to workflow v1.1.0)

1. **probe-catalog** — add **P7 cross-record correlation** and **P8 downstream-caller failure-atomicity**
   probe classes.
2. **subsystem-map** — make coupled-subsystem failure classes first-class at the coupling point.
3. **derive-areas** — **failure-class obligation**: every named failure class of each in-scope *and
   coupled* subsystem must map to a planned probe (or be marked N/A with a reason); release/upgrade tooling
   is a mandatory coupled area for ABI/runtime/event-ABI changes.
4. **probe-area** — every failure-class obligation must be discharged (confirmed / refuted-with-anchor /
   blocked); route correlation→P7, caller-atomicity→P8.
5. **evidence-probes activity + workflow rule** — a coverage gate: no named failure class for an in-scope
   or coupled subsystem is silently skipped.
