# Meta walk protocol — #973

This folder records the review of corpus PR #991 (`workflow/meta-walk-protocol`, based on `workflows` at `03dfd4e2`) and engine PR #978 (`engine/fan-barrier-destination`, based on `main` at `c9edbebe`).

## Files

| File | What it holds |
|---|---|
| `973-facts.md` | Engine and corpus facts for each defect #973 names, with citations |
| `s973-surface.txt` | The review surface: 27 touched corpus files and 57 closure files |
| `review973-engine.md` | Code review of #978 (E1–E7) |
| `review973-trace.md` | Every activity-loop path traced against the engine handlers (F1–F8) |
| `review973-P.md` | Design principles and convention conformance (P1–P8) |
| `review973-A.md` | Anti-patterns AP-01 to AP-70 (A1–A7) |
| `review973-B.md` | Anti-patterns AP-71 onward, plus ledgers, walk baselines and guards (B1–B11) |

## Disposition

- **Fixed on #991:**
  - P1: client completion is held to meta 04's close-out.
  - A1, F5 and P3: meta 03's exit to close-out is the default.
  - F1, corpus side: `enter-fan` reads the response body.
  - B5: `variables_changed` sits on the techniques that advance.
  - B1 and P5: continue-batch's path list is removed.
  - A2–A7, B2, B3, P4 and P6–P8.
- **Fixed on #978:**
  - F1, engine side: `fan` and `barrier` ride in the response body.
  - E1–E5 and E7.
- **Filed as #992:**
  - Older findings: F2 and P2 (second-walk `from_activity`), F3 (double advance on an entered session), E6, F4, F6, F7, F8, B4, B6 and B7–B11.
- **Owned by #974:** the corrected target list on workflow-design 01's `retarget`.

## Checks at `1d6ba60e` (corpus) and `0ec5d0dc` (engine)

- Guards: 56 of 56 pass.
- Engine suite against the corpus branch: 2170 pass and none fail. The option-coverage sweep was not run.
- Live sidecar walk:
  - At `f093a318` and `73ad6393`: MVW, `exitless-end` and `fan-conformance`. Every claim held.
  - Not yet walked live: the review round's fan body reading and the close-out hold. A meta walk through the bootstrap's client-open path meets #992's double advance.
