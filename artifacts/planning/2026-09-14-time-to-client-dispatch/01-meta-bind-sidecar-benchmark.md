# Meta bind: discover-session calls `discover_workflow`

Measured 2026-09-14. Sidecar reused image `workflow-server:exp-ttd` (no rebuild). Corpus was a dedicated worktree of the `workflows` branch, not the shared dest at `.worktrees/workflows`.

This is still **HTTP tool clock**, not session clock. Binding changes what a worker following discover-session would call. Cursor's MCP client is still the install instance on `:3000` unless retargeted. The protocol walk that records session `elapsed_ms` is in [01-session-clock-walks.md](01-session-clock-walks.md).

## What was bound

On branch `feat/time-to-dispatch-meta` at `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-meta`:

- `workflow-engine::match-target-workflow` calls `discover_workflow { query: {user_request} }` and records `workflow_id` / `ambiguous`. It does not take a `workflow_catalog` input.
- `discover-session` drops the `list-available-workflows` step. The `workflow-selection` checkpoint stays.
- `workflow-engine` TECHNIQUE.md lists `discover_workflow` among the tools that do not take `session_index`.
- `list-workflows.md` stays — `workflow-authoring` still uses it.

M1/M2 remain host scripts. M4/M5 remain engine-side on the experiment image. M6 is not implemented.

## How it was run

```bash
~/.local/share/workflow-server/start.sh -d \
  --image=workflow-server:exp-ttd \
  --no-pull \
  --name=workflow-server-exp \
  --host-port=0 \
  --no-update-workflows \
  --workflows-dir=/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-meta
# MCP URL: http://127.0.0.1:32770/mcp

MCP_URL=http://127.0.0.1:32770/mcp \
BASELINE_URL=http://127.0.0.1:3000/mcp \
WORKFLOWS_DIR=/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-meta \
npx tsx scripts/bench-http-experiments.ts

~/.local/share/workflow-server/stop.sh --name=workflow-server-exp
```

Install `workflow-server` on `:3000` stayed up and kept serving the install corpus (two-step list + LLM match).

## Result

| Probe | Experiment sidecar (`workflow-server:exp-ttd` :32770, meta-bind corpus) | Install image (`ghcr.io/m2ux/workflow-server:main` :3000, install corpus) |
| --- | --- | --- |
| M3 `discover_workflow` | **15–19 ms**, 436 chars, `work-package`, not ambiguous | tool **absent** (`-32602`) |
| `list_workflows` (control) | ~20 ms, 3294 chars | ~27–30 ms, 3294 chars |
| M4 meta `get_workflow` | **7507** chars (ops 1754 + summary 5746), 31 ms | **105904** chars (ops 100151 + summary 5746), 64 ms |
| `get_technique` `match-target-workflow` | 5810 chars, **contains `discover_workflow`**, no `workflow_catalog` input | 8336 chars, **no `discover_workflow`** |
| `get_activity` discover-session | 67098 chars, **no `list-available-workflows` step**, match-target present | 73113 chars, **`list-available-workflows` step present** |
| M5 derived `start_session` | success `2026-09-14-meta-4` then `meta-5` | **FOLDER_OCCUPIED** on `2026-09-14-meta` |
| M1 / M2 (host, this corpus) | TS 555 ms wall / Py **69 ms** wall; both `work-package` | n/a |
| Session clock | **2235 ms** protocol walk ([01-session-clock-walks.md](01-session-clock-walks.md)) | 407823 ms (live baseline) / **2280 ms** protocol walk |

The sidecar activity bundle still mentions `list_workflows` because the inherited `workflow-engine` TECHNIQUE.md names it as an unauthenticated tool. The discover-session **step list** on the sidecar does not include `list-available-workflows`.

## What these numbers are

The live definition on the sidecar names `discover_workflow` on the match-target protocol. A worker that follows that technique would not call `list_workflows` then score the catalog in-prompt. That is the bind. The milliseconds above are still tool clocks: they do not prove the 6.8 minutes drop until an agent walk uses this sidecar (or Cursor is pointed at it).

Derived occupancy on the sidecar created planning folders `2026-09-14-meta-4` and `2026-09-14-meta-5`. Named bench folders: `2026-09-14-http-bench-meta-bind-experiment` and `2026-09-14-http-bench-meta-bind-baseline`. The HG7UCM folder `2026-09-14-meta` was not written.

Corpus-only guards on the meta-bind tree: 36 pass. The one fail is a pre-existing stale `binding-fidelity` triage entry on `version-control/merge-branches.md` (present on `workflows` HEAD); this bind added no untriaged finding.

## Path taken

`--no-pull` of `workflow-server:exp-ttd` → `--workflows-dir` at the meta-bind worktree → `--name=workflow-server-exp --host-port=0` → printed `http://127.0.0.1:32770/mcp` → HTTP MCP initialize + tool calls, including `get_technique` / `next_activity` / `get_activity` on discover-session → `stop.sh --name=workflow-server-exp`. Install `:3000` remained ready throughout.
