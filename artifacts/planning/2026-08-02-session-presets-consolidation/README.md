# Session presets — consolidation record

This folder is the investigation-detail home for the session-presets epic, which consolidates two issues proposing the same shape of mechanism: named, precomputed, per-workflow metadata that fixes a property of a session before its first step runs, instead of leaving that property to a runtime step, an agent's judgement, or a cloned wrapper workflow.

## Consolidated issues

| Work item | Issue | Capture in this folder |
|---|---|---|
| W1 — profiles: named presets over seeded state and interaction posture | #213 | [issue-213-workflow-profiles.md](./issue-213-workflow-profiles.md) |
| W2 — context-cost profile: a precomputed estimate gates solo runs | #248 | [issue-248-context-cost-profile.md](./issue-248-context-cost-profile.md) |
| W3 — session reattach: a second dispatch continues the run it finds | #429 | [issue-429-session-reattach.md](./issue-429-session-reattach.md) |

Each capture is the issue body verbatim at consolidation time, so the schema sketches, candidate-profile tables, and open design questions stay reachable after the issue closes.

W3 joined on 6 August 2026 and closed on joining. It belongs here because the fault it describes lives in the throwaway-session-then-promote machinery the server-side bootstrap item retires — that item is the epic's current W2, which took the row after the cost model was designed and dropped. The bootstrap item already names a saved session that might be the one to resume as an open decision it returns rather than settles for itself, and this is what happens today when nothing returns it. Its own investigation folder — the measured damage, each constraint with its evidence, and the corpus-side gate semantics verified against the when-expression evaluator — stays at [2026-08-04-session-reattach](../2026-08-04-session-reattach/).

## Decisions

The open design questions were settled on 2 August 2026 after a code-level deep dive across the four surfaces the epic touches. The findings and all nine decisions — including the entry-activity ruling the acceptance criteria call for — are recorded in [deep-dive-decisions.md](./deep-dive-decisions.md).

## Why these two consolidate

- Both add declared, named metadata to a workflow definition that is consumed exactly once, at session creation — profile seeds laid over defaults, a cost profile read to decide dispatch versus solo.
- Both exist to remove a runtime improvisation: a mode variable set mid-run by a detection step, or an agent choosing solo by feel. In each case the guarantee only holds if the property is fixed from step zero — safety gates hold from the first step, and the overflow class of failure cannot recur.
- Both are verified statically, not trusted at runtime: guards evaluate reachability per profile, and validation refuses solo when the stored estimate says ineligible or is missing.
- Both surface through the same tools — the workflow catalog listing and session creation — so designing them together avoids two competing addressing schemes for "this workflow, configured thus".

## Boundaries preserved from the source issues

- The shipped stealth design stays as-is; profiles must not weaken the stealth guarantee that disclosure steps are statically unreachable given the seeded state.
- The meta orchestrator never runs client activity logic; there is no try-solo-and-fall-back heuristic; a missing or stale cost profile always means dispatch.
