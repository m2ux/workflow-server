# Session presets — consolidation record

This folder is the investigation-detail home for the session-presets epic, which consolidates two issues proposing the same shape of mechanism: named, precomputed, per-workflow metadata that fixes a property of a session before its first step runs, instead of leaving that property to a runtime step, an agent's judgement, or a cloned wrapper workflow.

## Consolidated issues

| Work item | Issue | Capture in this folder |
|---|---|---|
| W1 — profiles: named presets over seeded state and interaction posture | #213 | [issue-213-workflow-profiles.md](./issue-213-workflow-profiles.md) |
| W2 — context-cost profile: a precomputed estimate gates solo runs | #248 | [issue-248-context-cost-profile.md](./issue-248-context-cost-profile.md) |

Each capture is the issue body verbatim at consolidation time, so the schema sketches, candidate-profile tables, and open design questions stay reachable after the issue closes.

## Why these two consolidate

- Both add declared, named metadata to a workflow definition that is consumed exactly once, at session creation — profile seeds laid over defaults, a cost profile read to decide dispatch versus solo.
- Both exist to remove a runtime improvisation: a mode variable set mid-run by a detection step, or an agent choosing solo by feel. In each case the guarantee only holds if the property is fixed from step zero — safety gates hold from the first step, and the overflow class of failure cannot recur.
- Both are verified statically, not trusted at runtime: guards evaluate reachability per profile, and validation refuses solo when the stored estimate says ineligible or is missing.
- Both surface through the same tools — the workflow catalog listing and session creation — so designing them together avoids two competing addressing schemes for "this workflow, configured thus".

## Boundaries preserved from the source issues

- The shipped stealth design stays as-is; profiles must not weaken the stealth guarantee that disclosure steps are statically unreachable given the seeded state.
- The meta orchestrator never runs client activity logic; there is no try-solo-and-fall-back heuristic; a missing or stale cost profile always means dispatch.
