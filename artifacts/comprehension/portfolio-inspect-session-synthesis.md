# Portfolio Synthesis — inspect_session (#193)

> Lenses: pedagogy (06), rejected-paths (09), applied independently. Subject: session read path + read-only tool pattern. Work package: #193. Date: 2026-07-11.

## Convergent findings (both lenses, high confidence)

| Finding | Pedagogy framing | Rejected-paths framing |
|---|---|---|
| **Safety lives in the shared load primitive, not the tool** | Seal-verify/schema-validate/navigate transfer only if you reuse `loadSessionForTool` | Reaching for `readSessionFile` (the simpler path) re-opens the integrity gap the primitive closed |
| **`child_index` semantics are the load-bearing ambiguity** | "`--child N` descends deep" is a mental-model trap — it is root-relative, one level | The first divergence a real nested close-out exercises; the one composition decision left for plan-prepare |
| **Raw-passthrough is the tempting-but-wrong response shape** | "just return the doc" ignores unbounded `history`/`deliveredContent` growth | Returning raw `session.json` migrates the projection problem one layer up to every caller |

## Unique findings

**Pedagogy only:**
- Read-only = shared primitive **minus** the `advanceSession`/`saveSessionForTool` tail (not a separate code path); `get_workflow_status` is the exact template to clone.
- Omitting `assertNoActiveCheckpoint` is deliberate — an inspection tool must work while blocked.
- Slowest-discovered failure = a dropped seal check on read (silent, close-out-only).

**Rejected-paths only:**
- The static-script and hook-relaxation alternatives are already rejected with recorded rationale (proposal Alternatives) — do not re-litigate.
- The residual risk is **port fidelity** to `inspect_session.py`, not build complexity (zero callers, additive).
- A parity test between the script and the tool is the light guard against the two-definitions drift; generating one from the other is over-engineering for the simple tier.

## Summary table

| # | Finding | Lens(es) | Convergent / Unique |
|---|---|---|---|
| 1 | Safety is in `loadSessionForTool`, not the tool body | pedagogy + rejected-paths | Convergent |
| 2 | `child_index` root-relative one-level semantics | pedagogy + rejected-paths | Convergent |
| 3 | Raw passthrough is wrong; project compactly | pedagogy + rejected-paths | Convergent |
| 4 | Read-only = clone `get_workflow_status` minus advance/save | pedagogy | Unique |
| 5 | Deliberately skip `assertNoActiveCheckpoint` | pedagogy | Unique |
| 6 | Dropped seal-on-read is the slowest-discovered failure | pedagogy | Unique |
| 7 | Static-script/hook alternatives already rejected | rejected-paths | Unique |
| 8 | Residual risk = port fidelity, not build | rejected-paths | Unique |
| 9 | Parity test as the light drift-guard | rejected-paths | Unique |

## Implication for planning

Convergent findings are the **invariants**: build on `loadSessionForTool` (finding 1), pin the `child_index` contract to the reference script's root-relative one-level positional semantics (finding 2), return compact projections (finding 3). Unique findings are the **build recipe and its guard**: clone `get_workflow_status` and drop the advance/save tail (4/5), and add a parity test against `scripts/inspect_session.py` (9) to hold the port faithful (8). No architectural decisions remain open beyond the `child_index` composition, matching the `simple` complexity assessment.
