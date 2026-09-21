# M6 — Eager client dispatch from start_session

Measured 2026-09-14 on `feat/time-to-dispatch-experiment` (engine) and `feat/time-to-dispatch-meta` (bootstrap). GitNexus `impact` on `start_session` returned target-not-found (index on the primary checkout, stale). Additive path: `tryEagerClientDispatch` after a fresh durable meta `start_session`.

## Hypothesis

The uninstructed live walk (`MU5VDE`, 334916 ms) still spawned a discover-session worker. Time-to-child was **335 s**, slower than baseline’s **281 s** to child. Catalog match was already `discover_workflow`. The remaining cost is orchestrator technique-load and worker spawn, not ranking. Opening the client inside `start_session` removes those turns.

## What it does

A **fresh durable meta** session with `user_request` that uniquely matches a catalog workflow, and that does not state resume intent, embeds that client under the parent in the same call. The response includes `client.session_index` and `client.workflow.initialActivity`.

Bootstrap (`discover` → `bootstrap-protocol`) tells the agent: when `client.session_index` is present, `get_workflow` / `next_activity` the **child**, not meta discover-session.

Resume-intent phrases skip eager dispatch. Ambiguous matches skip it. Transient meta (no `working_directory` and no `planning_folder`) skips it. A named `planning_folder` on meta is a durable session.

## Tests

`tests/resume-intent.test.ts` and `tests/eager-client.test.ts`: baseline request → `work-package` / `start-work-package`; resume phrasing → no `client` block.

## Live clock

Live Cursor walk: [01-live-cursor-sidecar-walk-eager.md](01-live-cursor-sidecar-walk-eager.md). Meta `OPH6L7`, child `JE2NSB` (`work-package` / `start-work-package`), slug `2026-09-14-meta-8`. Sidecar `http://127.0.0.1:32772/mcp`.

Meta `inspect_session` `view: usage` **`elapsed_ms`: 83**. That is `workflow_started` 2026-09-14T11:35:25.326Z to `workflow_triggered` 2026-09-14T11:35:25.409Z — the child is created inside the same `start_session` call. Child `elapsed_ms` **31338** (`get_workflow` + `next_activity start-work-package`). Prompt-to-stop wall is about **117 s**.

Path taken: `discover` → `discover_workflow` (unique `work-package`) → `start_session` returned `client.session_index` `JE2NSB` → child `get_workflow` / `next_activity start-work-package`. No `get_activity` on discover-session, no discover-session worker. `list_workflows` was not called.

`01-live-cursor-sidecar-walk.md` still holds the earlier instructed full-meta walk (`ZA4H56`, 86581). This run is a separate file so that note stays.

Versus the same request: baseline **407823**, uninstructed sidecar **334916**, instructed full-meta **86581**, this eager walk **83**. The 83 ms figure is the meta history span, not the 117 s the chat sat through. The human-facing cut is 117 s against ~6.8 min (session) / ~7.8 min (prompt) at baseline, and against 335 s uninstructed.

Correctness for this request: child `work-package`.
