# Canon Re-audit — fix round `34067ffc` (PR #1003)

**Base ref:** `0193e9bb` · **Coverage:** 222 of 222 units × 13 of 13 paths · **Change surface:** 13 files (touched: 10 · closure: 3 · consumers: 0) · **Guards:** clean

**Verdict at `34067ffc`:** Live 0 · Contract 7 · Hygiene 10. Of these, 5 came from the fix round and 3 were fixes left incomplete; all 8 are fixed at `07a3daf0`. Residual: 0 files `unread`, 0 units `blocked`. Walks: [A](reaudit-walk-A.md) catalog, [P](reaudit-walk-P.md) principles, conformance, inventory, fix fidelity. [Surface](reaudit-surface.md).

## Prior findings closed by the round

| Finding | Status |
|---|---|
| F6, A4, A5, A6, A8, B12 | Closed |
| P9 | Closed; opened R-P1, R-P2 |
| B10 | Closed at `07a3daf0` (R-A4 / R-P7) |
| B11 | Closed; sibling shapes R-A5, R-A6 fixed at `07a3daf0` |
| B9 | Withdrawn: a target the run creates does not exist when `sources-confirmed` links it (`link-named-artifacts` Do not flag, no durable file). Link reverted |

## Findings

| ID | Band | Severity | Entry | Origin | Outcome at `07a3daf0` |
|----|------|----------|-------|--------|---------|
| R-P1 | Contract | Medium | One Authoritative Home — Template repeats Section Structure | diff | Section Structure is the Template |
| R-P2 | Contract | Medium | Cite Resources at Section Grain — citers reach one half each | diff | Citers point at `#template` |
| R-P4 | Contract | Medium | Encode Constraints as Structure — "matched by file name" unenforced | diff | `source_readable` is false when two sources share a file name |
| R-P5 | Contract | Medium | Single Source of Truth — two `source_paths` descriptions | diff | Activity 01 matches |
| R-A1 / R-P3 | Contract | Medium | `cited-home-owns-claim` — analysis rule cites Section Structure for source-type sections | pre-existing | Cites Source Reference Format |
| R-P8 | Hygiene | Low | Protocol description and README row omit the Template | diff | Fixed |
| R-A3 / R-P6 | Hygiene | Low | `link-named-artifacts`; record-intake message repeats the checkpoint | pre-existing | Message removed |
| R-A4 / R-P7 | Hygiene | Low | `omit-null-sections` — two analysis sections | pre-existing | Marked |
| R-A5 | Hygiene | Low | `one-invariant-per-rule` — failure-report IDs rule | pre-existing | Split |
| R-A6 | Hygiene | Low | `one-invariant-per-rule` — change-summary budget rule | pre-existing | Split |
| R-A2 | Contract | Medium | `no-derived-state-shadow` — `spec_basename` | pre-existing | Fixed at 9049523a |
| R-A7 | Hygiene | Low | `no-rationale-in-description` — analyze-source §3 | pre-existing | Fixed at 9049523a |
| R-A8 | Hygiene | Low | `no-technique-resource-dual-home` — update-specification restates identifiers and pending | pre-existing | Fixed at 9049523a |
| R-A9 | Hygiene | Low | `no-technique-resource-dual-home` — analyze-source §2 restates identifier reuse | pre-existing | Fixed at 9049523a |

Guard candidates filed by walk A (second occurrence across consecutive walks): `omit-null-sections`, `one-invariant-per-rule`, `link-named-artifacts`.

Checks at `07a3daf0`: guards 236 of 236; engine suite 2200 pass.
