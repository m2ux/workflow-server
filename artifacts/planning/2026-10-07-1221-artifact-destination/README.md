# Artifact Destination: A Product Reaches a Reader Outside the Session Folder — October 2026

> Planning record · Issue #1221

## Summary

When a workflow runs on an isolated projects root (such as in an experiment sidecar), the session planning folder is unreachable by external human readers. Under current conduct rules (`operational-discipline-artifact-location`), every artifact must be written to `{planning_folder_path}`. However, citation rules (`operational-discipline-artifact-citation`) prohibit referencing files from pull requests or issues if readers cannot open them.

This change allows an artifact to take a bound destination separate from the session planning folder:
1. **Product destination binding**: An activity step binds the artifact's destination (via inputs such as `target_dir`), allowing product deliverables to land where external readers can access them.
2. **Session state isolation**: The session's state (`session.json`, `.session-token`, seals, locks) remains exclusively inside `{planning_folder_path}` and never travels to the product destination.
3. **Unbound fallback**: Unbound artifacts default to `{planning_folder_path}`, preserving full backward compatibility for existing workflows.
4. **Engine reconciliation**: `next_activity` reconciles declared artifacts by verifying existence at their external path on disk without emitting spurious "status unknown" warnings when the file exists.
5. **Conduct rule alignment**: `operational-discipline-artifact-location` is restated to distinguish internal session planning records from product deliverables with a bound destination.

## Acceptance Criteria

- **AC1.** An activity's declared artifact is written to the destination its run binds, as a read of that destination after a sidecar walk on an isolated projects root shows.
- **AC2.** The session's state remains in its planning folder when a destination is bound, as a listing of that folder after the same walk shows.
- **AC3.** No session state file reaches the bound destination, as a listing of that destination after the same walk shows.
- **AC4.** A run that binds no destination writes its artifacts under `{planning_folder_path}`, as a walk binding none shows.

## Claim Table

| Claim | Condition / Case | Expected Outcome | Verification |
| --- | --- | --- | --- |
| AC1 | Activity binds `target_dir` to an external directory | Artifact file is written to the bound external directory | File exists at bound destination; `next_activity` accepts without outside-folder warning |
| AC2 | Session runs with bound artifact destination | `session.json` and `.session-token` remain in planning folder | Planning folder contains `session.json`; resumption continues normally |
| AC3 | Destination directory checked after bound run | No session state files present in external directory | Directory listing contains only produced artifact, no `session.json` or token |
| AC4 | Activity runs without binding a destination | Artifact lands in `{planning_folder_path}` | File exists in planning folder; recognized by planning folder reconciliation |

## Paper Walk

1. **Bootstrap**: Call `start_session` on workflow server. Server assigns `session_index` and creates `{planning_folder_path}`.
2. **Execution (Bound Destination)**:
   - Worker loads activity declaring output artifact `product-report.md`.
   - Step binds `target_dir: external_dest`.
   - Worker writes `external_dest/product-report.md`.
   - Worker calls `next_activity` with `artifacts_produced: [{ id: 'product-report', name: 'product-report.md', path: '/path/to/external_dest/product-report.md' }]`.
   - Server checks existence of `/path/to/external_dest/product-report.md`. It exists, so no warning is emitted.
   - Server writes `session.json` solely to `{planning_folder_path}/session.json`.
3. **Verification**:
   - Destination contains `product-report.md` and zero session files.
   - Planning folder contains `session.json` and `.session-token`.
4. **Execution (Unbound Destination)**:
   - Worker executes activity without bound destination.
   - Step writes to `{planning_folder_path}/02-summary.md`.
   - Server reconciles artifact within `{planning_folder_path}`.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [README.md](README.md) | Problem statement, design decisions, claim table, and verification plan |

## Links

| Resource | Link |
| --- | --- |
| Issue #1221 | https://github.com/m2ux/workflow-server/issues/1221 |
| Conduct rules | `workflows/corpus/meta/techniques/agent-conduct.md` |
| Sidecar guide | `docs/http.md` |
