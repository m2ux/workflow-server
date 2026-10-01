# E02 W07 — claim table

Criterion: Meta's activity loop acts on the child session and planning folder its site names (E02 AC9).

Fixture: durable meta with `target_workflow_id: work-package` (specimens are absent from the discovery catalog, so `mvw` cannot be embedded by pin). Call site `corpus/meta/activities/03-dispatch-client-workflow.yaml` binds `session_index: client_session_index` into `activity-loop`; unbound `planning_folder_path` falls through to the host activity's planning folder (the shared folder `start_session` mints for meta and client).

## Run record

| | |
|---|---|
| MCP | `http://127.0.0.1:32772/mcp` |
| Image | `workflow-server:exp-i10-activity-loop` |
| Engine pin | `7bdef1fc-dirty` (`i10/main`) |
| Corpus pin | `ed7525bd` (`i10/workflows`) |
| MVW | `MXVJUF` → `__terminal__` |
| Meta | `APOODB` on `dispatch-client-workflow` |
| Client | `NNG7A5` (`work-package`) → `start-work-package` |
| Planning folder | `…/exp-projects/workflow-server/.engineering/artifacts/planning/2026-10-01-meta` |

| # | Claim | Evidence | Case | Result |
|---|---|---|---|---|
| 1 | The call site names the child session as the loop's `session_index` | definition; live `get_activity` on meta | `dispatch-client-workflow` → `client-activity-loop` | held — site `with: session_index: client_session_index`; spliced steps bind `session_index: client_session_index` and `planning_folder_path: planning_folder_path` |
| 2 | The live walk advances the child session, not the meta session | sidecar walk | meta → work-package | held — `next_activity` on `NNG7A5` entered `start-work-package`; meta `APOODB` stayed on `dispatch-client-workflow` (`inspect_session`) |
| 3 | The planning folder the loop uses is the folder the site/host names (shared meta/client folder) | sidecar walk | meta → work-package | held — both bags carry the same `planning_folder_path` under `2026-10-01-meta` |
| 4 | MVW still dispatches on this sidecar pairing before the specimen walk | sidecar walk | `mvw` | held — `MXVJUF` completed `dispatch` → `__terminal__` |

## Notes

- Specimens remain startable by id and via `dispatch_child`; they are not in the discovery catalog, so a meta embed must pin a non-specimen catalog id.
- A prior transient meta `GPBJL7` with `dispatch_child` → `mvw` (`ZOZTEW`) confirmed child open and shared planning folder, but did not seed `client_session_index` into the meta bag (that seed is eager `start_session` only). The AC9 walk used the durable embed path.
