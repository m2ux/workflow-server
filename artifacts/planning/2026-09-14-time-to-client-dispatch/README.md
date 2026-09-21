# Time to client dispatch — September 2026

> Enhancement · Created 2026-09-14 · **Status:** Experimenting (startup only; work-package paused after start-work-package)

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This package measures wall-clock from first prompt to client-workflow dispatch and ranks interventions against that baseline. Work-package delivery after startup is out of scope for this run: the client session exists, a dedicated branch and worktree are ready, and the remaining work is the timed methods in [01-experiment-design.md](./01-experiment-design.md).

## Problem Overview

When someone asks the workflow server to start a piece of work, a long setup stretch happens before the actual work session even exists. On this run that stretch took about 6.8 minutes from session start (about 7.8 minutes from the first prompt): the assistant had to discover the server, open a session, load a large workflow bundle, search the catalog by keywords, and only then open the client work package.

That wait is paid on every new request, before any design or code begins. The rest of this package measures that interval as a baseline of 407823 milliseconds and tries several ways to shorten it — scripts that do the catalog lookup, a dedicated discovery tool, and cuts to extra round-trips — so the client session starts in a time a person can sit through.

## Solution Overview

*Placeholder — a later step replaces it.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Start work package | Branch, worktree, planning folder | 20-40m | ✅ |
| 2 | [Baseline](01-baseline-time-to-dispatch.md) | Prompt-to-dispatch wall clock | 10-15m | ✅ |
| 3 | [Experiment design](01-experiment-design.md) | Methods M1–M6, ranking rule | 10-15m | ✅ |
| 4 | [M1 scripted discovery (TS)](01-m1-scripted-discovery.md) | Keyword match off the LLM path | 30-45m | ✅ |
| 5 | [M2 scripted discovery (Python)](01-m2-scripted-discovery.md) | Same contract, other runtime | 20-30m | ✅ |
| 6 | [M3 discover-workflow MCP tool](01-m3-discover-workflow-tool.md) | Server-side fuzzy keyword match | 45-90m | ✅ |
| 6b | [Bind M3 into meta + sidecar](01-meta-bind-sidecar-benchmark.md) | discover-session calls `discover_workflow`; sidecar `--workflows-dir` | 20-40m | ✅ |
| 6c | [Session clock walks](01-session-clock-walks.md) | Sidecar and install meta→child `elapsed_ms` | 15-30m | ✅ |
| 7 | [M4 shrink meta get_workflow](01-m4-shrink-get-workflow.md) | Avoid second large bundle load | 20-40m | ✅ |
| 8 | [M5 folder-collision avoidance](01-m5-folder-collision.md) | Occupied planning-folder retry | 15-30m | ✅ |
| 9 | [M6 eager client dispatch](01-m6-eager-client-dispatch.md) | `start_session` opens the client on a unique match | 45-90m | ✅ |
| 9b | [M6 live Cursor walk](01-live-cursor-sidecar-walk-eager.md) | Uninstructed sidecar; meta `elapsed_ms` 83 | 15-30m | ✅ |
| 10 | Rank methods | Lowest session clock that still matches work-package | 15-30m | ⬚ |
| 11 | [start_session computed bag](01-start-session-computed-bag.md) | Git/fs facts and remaining gates on `start_session` | 2-4h | ✅ |
| 12 | [Opening on start_session](02-opening-on-start-session.md) | Drop `discover_workflow`; retire meta opening activities | 1-2h | 🟡 |
| 12b | [Meta graph sidecar walk](03-meta-graph-sidecar-walk.md) | Prove meta 7.0.0 loads and advances on the exp sidecar | 20-40m | ✅ |
| 11 | Design philosophy | Work-package remainder | 15-30m | ⊘ |
| 12 | Requirements elicitation | Work-package remainder | 30-60m | ⊘ |
| 13 | Implementation analysis | Work-package remainder | 20-45m | ⊘ |
| 14 | Work package plan | Work-package remainder | 20-45m | ⊘ |
| 15 | Implementation | Work-package remainder | 1-4h | ⊘ |
| 16 | Post-implementation review | Work-package remainder | 30-60m | ⊘ |
| 17 | Submit for review | Work-package remainder | 30-60m | ⊘ |
| 18 | Close-out | Work-package remainder | 10-20m | ⊘ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## Sidecar

Rebuild the experiment HTTP instance without touching the install server on :3000. The reload script lives in `feat/time-to-dispatch-experiment` (also `feat/reload-experiment-sidecar`). `--host-port` is the port that container already publishes. `--no-build` reuses the image tag. The flag surface lives in `http.md`.

Computed-bag proof (image tag distinct from the M3/M6 `exp-ttd` image):

```bash
/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment/scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-computed-bag \
  --build=/home/mike1/projects/dev/workflow-server/.worktrees/feat/start-session-computed-bag \
  --workflows-dir=/home/mike1/projects/dev/workflow-server/.worktrees/feat/start-session-computed-bag-meta \
  --host-port=32772
```

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | Skipped |
| PR | — |
| HTTP sidecar bench | [01-http-sidecar-benchmark.md](01-http-sidecar-benchmark.md) |
| Meta-bind sidecar bench | [01-meta-bind-sidecar-benchmark.md](01-meta-bind-sidecar-benchmark.md) |
| Session clock walks | [01-session-clock-walks.md](01-session-clock-walks.md) |
| Live Cursor (instructed meta) | [01-live-cursor-sidecar-walk.md](01-live-cursor-sidecar-walk.md) |
| Live Cursor (uninstructed meta) | [01-live-cursor-sidecar-walk-uninstructed.md](01-live-cursor-sidecar-walk-uninstructed.md) |
| Live Cursor (M6 eager) | [01-live-cursor-sidecar-walk-eager.md](01-live-cursor-sidecar-walk-eager.md) |
| start_session computed bag | [01-start-session-computed-bag.md](01-start-session-computed-bag.md) |
| Opening on start_session | [02-opening-on-start-session.md](02-opening-on-start-session.md) |
| Meta graph sidecar walk | [03-meta-graph-sidecar-walk.md](03-meta-graph-sidecar-walk.md) |
| Sidecar reload | `scripts/reload-exp-sidecar.sh --name=workflow-server-exp --image=workflow-server:exp-computed-bag --build=.worktrees/feat/start-session-computed-bag --workflows-dir=.worktrees/feat/start-session-computed-bag-meta --host-port=32772` |
