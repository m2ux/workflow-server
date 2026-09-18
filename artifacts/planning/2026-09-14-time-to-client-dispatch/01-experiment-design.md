# Experiment design: time-to-dispatch optimisation

Goal: cut the wall-clock from first prompt (and from meta `start_session`) to the moment the client work-package session exists and is handed to a worker. The reference measurement lives in [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md): **407823 ms** (~6.8 min from session start, ~7.8 min from first prompt).

This is new implementation on `m2ux/workflow-server`. Code lands on a dedicated feature branch in a local worktree named for that full branch under `.worktrees/<branch>` — never on the primary checkout.

## What is being timed

One quantity, two clocks:

1. **Session clock** — meta `elapsed_ms` at `dispatch-client-workflow` / first `get_workflow` of the child.
2. **Prompt clock** — wall time from the first user prompt to that same instant.

A method wins only if both clocks drop, and the session clock is the primary comparator (it is what the server already records).

## Candidate methods

Each method is a separate, measurable intervention. Run them one at a time against the same user request ("time taken from first prompt to dispatching the client workflow is too long…") so the path stays comparable to the baseline.

| Id | Method | Hypothesis |
| --- | --- | --- |
| M1 | **Scripted preamble** (TypeScript, matching the engine). A local script performs `list_workflows` + keyword match and prints the chosen `workflow_id` before the agent walks meta. | Keyword discovery and the `list_workflows` round-trip dominate discover-session; taking them off the LLM path recovers minutes. |
| M2 | **Scripted preamble** (Python). Same contract as M1, different runtime. | Same savings as M1 if the bottleneck is the agent loop, not the language. A slower script would show the bottleneck is I/O, not the agent. |
| M3 | **`discover-workflow` MCP tool**. Server-side fuzzy match on workflow-embedded keywords from an agent-supplied query; returns ranked `workflow_id`s without shipping the full catalog into context. | Replaces `list_workflows` + in-context keyword match with one cheap tool call; also shrinks the 104KB `get_workflow` pressure if meta no longer needs the catalog in-prompt. |
| M4 | **Skip or shrink `get_workflow` on meta**. Meta already learns the child's `initialActivity` from `dispatch_child`; avoid loading the 104KB work-package bundle onto the meta context. | The baseline path pays `get_workflow` twice (meta bundle, then child bundle). Cutting the child's bundle off meta is already the design; any remaining meta bundle cost is the next slice. |
| M5 | **Folder-collision avoidance**. `start_session` collided with `HG7UCM` then retried a distinct folder. | A deterministic planning slug (or occupied-folder retry inside the server) removes one full start_session round-trip. |
| M6 | **Eager client dispatch from meta**. Collapse discover-session + initialize-session + resolve-target + dispatch-client-workflow into fewer tool round-trips (server-side `dispatch_child` that also binds target). | Four sequential activities before the child exists; fusing them cuts orchestrator turns, not just bytes. |

M3 is the product-shaped default if a tool must land. M1/M2 are the control: if a script already matches the baseline path's discovery quality, the tool is justified only when it is faster *and* usable from an agent without the script. M4–M6 are engine-path cuts that compose with M3.

## Procedure

1. Keep the primary checkout on its current branch. Create `feat/time-to-dispatch-experiment` (or the issue-derived name once the ticket exists) as a worktree at `.worktrees/<full-branch-name>/`.
2. For each method: implement the smallest change that can run end-to-end, then start a fresh meta session with the same `user_request` and `working_directory`.
3. Record, in a per-method file under this folder: method id, commit SHA, session_index, `elapsed_ms` at child creation, prompt-clock delta, and the tool path actually taken (so a silent skip of `list_workflows` is visible).
4. Rank by session clock. A method that is faster but changes which workflow is selected is a correctness failure, not a win.
5. The winning method is the one with the lowest session clock that still dispatches `work-package` for this request. Compose a second pass only after the single-method ranking exists.

## Success criteria

- Session clock strictly below **407823 ms** on a comparable machine and the same request.
- Child workflow is `work-package`; first worker activity remains `start-work-package`.
- No work on the primary checkout; the experiment branch's worktree is the only edit surface.

## Non-goals

- Optimising work-package internals after dispatch (this package times the path *to* the child).
- Changing keyword vocabularies without a measured discovery miss.
- Multi-method bundles before each method has its own number.
