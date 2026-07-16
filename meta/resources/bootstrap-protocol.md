---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool):
   - `workflow-server://schemas/workflow`

   The orchestrator drives the workflow-level loop (activities, `initialActivity`, transitions) and never calls `get_activity` or `get_technique`, so it needs only the workflow schema. The activity and technique schemas are the worker's domain and are loaded there on demand.

2. `start_session { workflow_id: "meta", agent_id: "orchestrator" }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` (seal) under the planning folder on this call; no agent-side state writes are required.

   To target a specific planning folder, pass `planning_folder` as an absolute path (e.g. `start_session { planning_folder: "/abs/path/to/.engineering/artifacts/planning/<slug>", agent_id: "orchestrator" }`). Only the basename is consumed as the slug; the rest of the path is a hint and is otherwise ignored. The server resolves the slug against its OWN workspace planning root, records the canonical path in `session.json#planningFolderPath`, and returns it on the response as `planning_folder_path` — pass whatever absolute path you have and read the canonical one back; you never reconcile paths yourself. Bare slugs and relative paths are rejected.

   Omit `planning_folder` for the meta bootstrap when the slug isn't known yet: the server mints a transitional slug from a UUID and parks the session in `os.tmpdir()`, and `dispatch_child` later supplies the real slug and promotes the session to its workspace folder.

   `context_mode` declares the session's delivery context model, decided by execution topology:

   | Topology | How to start | Effect |
   |---|---|---|
   | **Dispatch** (orchestrator spawns per-activity workers) | Omit `context_mode`, or pass `"fresh"` | Full content every call — correct; each worker is a new context with an empty ledger |
   | **Solo** (this same agent context executes every activity; no worker spawning) | Pass `context_mode: "persistent"` and ONE canonical `agent_id` for the whole walk | Already-delivered bundles, techniques, and resources arrive as `{ delivery: "unchanged", content_hash }` references instead of being repeated |

   Default (omit, or `"fresh"`) is correct whenever activities are dispatched to spawned workers ([dispatch-activity](../techniques/workflow-engine/dispatch-activity.md)) — never set `context_mode: "persistent"` on a worker-dispatched session, and never instruct a worker to pass `bundle: "reference"`. In a persistent (solo) session, reuse the same `agent_id` on resume — the delivery ledger is keyed by `agent_id`, so a different `agent_id` starts from an empty ledger and re-delivers in full. Force full re-delivery after summarization with `get_activity { bundle: "full" }`, `get_technique { full: true }`, or `get_resource { full: true }`. `dispatch_child` accepts the same `context_mode` parameter for a child session, under the same solo-vs-dispatch test applied to the child's activities.

   **Resource sections vs whole file:** A `#section` on `resource_id` returns only that heading's body (smaller context). Prefer a section when this step needs one slice of a large resource. When the same agent context will need **two or more** sections from the same resource in the current activity (or immediately after), fetch the bare resource id once and keep it — do not ping-pong section fetches. Bare and `#section` ids are different delivery keys; fetching sections does not count as already having the whole file. The binding rule is `meta.agent-conduct.operational-discipline-resource-section-or-whole`.

3. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
