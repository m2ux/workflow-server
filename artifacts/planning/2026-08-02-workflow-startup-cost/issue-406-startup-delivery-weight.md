# Capture: issue #406 — Startup delivery weight: the setup ceremony's fixed payloads and per-activity deliveries shrink to what the work needs

Body verbatim as of 2 August 2026 (filed 2 August 2026; subsumed into #404 and closed the same day — the epic carries the two work items, and this folder's README holds the measurement record).

> **Correction note, 3 August 2026.** The token figures in the body below — "roughly 60–100 thousand tokens of context establishment" per dispatch, "974 thousand tokens of fresh context" for the five pre-work workers, and "0.66–1.08 million tokens" before real work begins — are inflated by about 2.4×, because the analyser that produced them counted usage once per transcript record rather than once per response. Measured with `npm run profile:run`, the committed profiler, they are 23 to 42 thousand, 403 thousand, and 0.43–0.51 million. The body is left verbatim, as captures are; see [#409](https://github.com/m2ux/workflow-server/issues/409) and the restatement box in this folder's README.

---

## Summary

When a user asks for a work package, the session does not start on the work — it starts on ceremony. The orchestrating agent reads two large reference documents, then walks four setup activities (match the request to a workflow, create the session, resolve the target repository, dispatch the client workflow), handing each one to a freshly spawned worker agent that builds its context from nothing. Only then does the work-package workflow's own first activity run — and that activity is itself setup: worktree, planning folder, intake questions. Measured across nine recent runs, **real work begins 17–31 active minutes after the request, after 0.66–1.08 million tokens of fresh agent context have been paid for and 61–77 thousand tokens generated.** The setup phase before the client workflow's first activity is a stable 7–10 minutes in every clean run, regardless of the task.

Two of the levers on this window live on the session-presets epic (#401), where the session-creation area of concern is coordinated: letting one agent walk a short setup sequence in its own context instead of dispatching every step (its W2), and moving the deterministic setup steps — repository derivation, session creation, planning-folder resolution — into the server at session creation (its W3, relocated from this issue's first draft). This issue carries the remaining area, which is this epic's own: the content a startup delivery carries and what it costs.

## Where the time and tokens go today

- **Fixed payloads the orchestrator may not need.** The bootstrap's first instruction reads the full workflow schema — about 44 KB, roughly 11 thousand tokens, delivered identically every run to an agent that never authors a workflow definition. Together with the orchestrating workflow's own delivery and the planning-folder guide, 55–124 KB of fixed content lands in the orchestrator's context before its first decision.
- **A fresh worker per setup step.** Each of the four setup activities dispatches its own worker, and every dispatch pays roughly 60–100 thousand tokens of context establishment (system prompt, project instructions, tool schemas) before any workflow content arrives. In the July 27 run the five pre-work workers together cost 974 thousand tokens of fresh context — nine times what the orchestrator itself consumed.
- **Heavy deliveries for light steps.** What a setup activity hands its worker varies from 2 KB (discover-session) to 43 KB (initialize-session, whose job is largely one server call plus verification). The deciding steps in the ceremony are few — matching free text to a workflow, surfacing ambiguity — while repository derivation, session creation, and planning-folder resolution are deterministic work the server could do itself.
- **A commit ritual per step.** After each activity the orchestrator commits and pushes planning artifacts — about 2 minutes per cycle in the July 27 run, several cycles inside the startup window.

## The work

**W1 — Deliver what the orchestrator uses.** Replace the full-schema read with an orchestrator-facing digest, or fold the needed rules into the session-start delivery the orchestrator already receives. State a token budget for bootstrap-time fixed content and hold deliveries to it.

**W2 — Slim the ceremony's definitions.** Audit the setup activities of the orchestrating workflow and the work-package start activity for delivered weight: techniques inlined eagerly that the step never exercises, steps that always run together but are written apart, resources delivered whole where a section would do. The audit also retires the per-activity commit ritual — the setup activities' persist steps batch into a single commit-and-push when the client workflow is dispatched. Target: no setup activity delivers more content than the work it directs.

## Why now is cheap

The measurement is already done — nine runs profiled with per-run timelines, token ledgers, and per-worker delivery weights, recorded in the planning folder. The theme has shipped precedent: the re-dispatch overhead work (#353) measured 31% mid-run overhead and landed. And the cost is paid at the head of every session, so each week of delay multiplies it across every run started in that week.

## Acceptance criteria

- [ ] The fixed content delivered to the orchestrator before its first decision has a stated budget, and the schema read is replaced by a delivery sized to what the orchestrator consumes.
- [ ] Each remaining setup activity delivers less content than it did in the July baseline, measured by the same per-worker method recorded in the planning folder.
- [ ] The ceremony produces one planning-artifact commit, not one per activity.
- [ ] A re-measurement over fresh runs shows this issue's levers landed: bootstrap-time fixed content and per-activity delivered weight at half the July baseline or better.

## Non-goals

- Moving the deterministic setup steps into session creation — relocated to the session-presets epic as #401 W3, whose area is what gets fixed at session creation; this issue's levers apply even while those steps still run as activities.
- Solo walks and the context-cost profile that gates them — #401 W2.
- Intake-question reduction via named presets — #401 W1.
- The server's per-delivery resolve caching — #269, already W1 of this epic.

## Investigation detail

Full record — methodology, the nine-run table, fixed-payload identification, per-worker delivery weights, and the epic-coverage survey:
**[engineering/artifacts/planning/2026-08-02-workflow-startup-cost](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-workflow-startup-cost)**
