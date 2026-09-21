# HTTP sidecar benchmark: M1–M5 against live containers

Measured 2026-09-14. Sidecar built with the merged `start.sh --build` path ([#717](https://github.com/m2ux/workflow-server/pull/717)) from worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (M1–M5 uncommitted). Install instance on `:3000` stayed up.

This is **HTTP tool clock**, not session clock. The 407823 ms baseline is still agent turns. M6 is not implemented.

## How it was run

```bash
~/.local/share/workflow-server/start.sh -d \
  --build=/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment \
  --image=workflow-server:exp-ttd \
  --name=workflow-server-exp \
  --host-port=0 \
  --no-update-workflows
# MCP URL: http://127.0.0.1:32769/mcp

MCP_URL=http://127.0.0.1:32769/mcp \
BASELINE_URL=http://127.0.0.1:3000/mcp \
npx tsx scripts/bench-http-experiments.ts

~/.local/share/workflow-server/stop.sh --name=workflow-server-exp
```

Both containers bind the same install corpus (`$INSTALL/workflows`) and the same projects root. M1/M2 ran on the host against that corpus.

## Result

| Method | Experiment sidecar (`workflow-server:exp-ttd` :32769) | Install image (`ghcr.io/m2ux/workflow-server:main` :3000) | Correctness |
| --- | --- | --- | --- |
| M1 TS script | wall **558 ms**, in-process 39 ms | n/a (host script) | `work-package`, not ambiguous |
| M2 Python script | wall **78 ms**, in-process 36 ms | n/a (host script) | `work-package`, not ambiguous |
| M3 `discover_workflow` | **20.7 / 25.6 / 22.1 ms**, 436 chars | tool **absent** (`-32602`) | `work-package`, not ambiguous |
| `list_workflows` (control) | 19.9 / 19.7 / 21.1 ms, 3294 chars | 28.6 / 21.8 / 22.0 ms, 3294 chars | catalog 17 |
| M4 meta `get_workflow` | **7507** chars (ops 1754 + summary 5746), 24 ms | **105904** chars (ops 100151 + summary 5746), 75 ms | both sessions opened |
| M5 derived `start_session` | **success** `2026-09-14-meta-2` then `meta-3` (199 ms, 157 ms) | **FOLDER_OCCUPIED** on `2026-09-14-meta` (48 ms, 60 ms) | occupying run untouched |
| M6 eager dispatch | not implemented | — | — |
| Session clock | not re-walked | 407823 ms (live baseline) | — |

## What these numbers are

The sidecar is the first time M3–M5 ran in the same Docker layout as the install instance. Catalog I/O is ~20 ms on both. The experiment image is smaller on the wire (M3 7.5× vs `list_workflows`, M4 14× vs baseline `get_workflow`) and does not refuse a second derived meta session the same day.

Those milliseconds are not the 6.8 minutes. Live meta still walks discover-session as an LLM worker unless M3 is bound in the corpus. The bind and a second sidecar run are in [01-meta-bind-sidecar-benchmark.md](01-meta-bind-sidecar-benchmark.md).

Derived occupancy on the sidecar created planning folders `2026-09-14-meta-2` and `2026-09-14-meta-3` under the host repo's `.engineering/artifacts/planning`. The HG7UCM folder `2026-09-14-meta` was not written.

## Path taken

`--build` from the experiment worktree → tag `workflow-server:exp-ttd` → `--name=workflow-server-exp --host-port=0` → printed `http://127.0.0.1:32769/mcp` → HTTP MCP initialize + tool calls → `stop.sh --name=workflow-server-exp`. Install `workflow-server` on `:3000` remained ready throughout.
