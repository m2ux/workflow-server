---
name: server-in-the-loop
description: >-
  Runs a workflow-server experiment sidecar as server-in-the-loop validation:
  reload and cycle a live HTTP instance on port 32772, author specimen
  workflows, and walk them against codebase and corpus changes. The first live
  walk is always a minimum viable workflow (MVW): one orchestrator, one
  activity, one routine, one technique. Use after unit, e2e and guard tests on
  a system change once the user agrees to a live sidecar loop, or when the user
  names the sidecar, workflow-server-exp, specimen validation, live-instance
  walk, MVW, or server-in-the-loop. Ordinary start, create, and resume
  work-package requests stay on the install instance.
---

# Server in the Loop

A live sidecar walks real workflow traffic to validate codebase changes, corpus changes, or both. Specimen workflows are the vehicle. The first live walk is always a **minimum viable workflow (MVW)** so a broken engine is visible before anyone pays for a change-surface walk.

HTTP is the transport; it is not the interface. **The walk is driven through the sidecar's MCP tools** (see **Reach the instance through MCP**). Bootstrap steps come from `discover`; reload flags live in `http.md` and `scripts/reload-exp-sidecar.sh`. Cite those, do not copy them.

## Typical flow

1. User specifies a system change.
2. Agent makes the change.
3. Agent writes the **claim table**: one row per outcome the change promises, with the fixture case that will produce it. A row with no case means the fixture cannot evidence the claim — change the fixture before walking. A fixture chosen for neutrality alone usually exercises only the negative path.
4. Agent **paper-walks** the protocol on that fixture: the tool calls the operation would make, by hand, on real data. What the tool cannot answer, or answers with homonyms, is a design defect found here for a few calls rather than after a full walk.
5. Agent authors or reuses the MVW (`corpus/specimens/mvw/`) and a specimen for the change surface. Runs unit, e2e and guard tests.
6. Agent asks whether to run a sidecar loop; on yes it owns the sidecar for that loop.
7. MVW first. A miss is scored against "the instance can dispatch one activity"; iterate the engine on the MVW alone.
8. Then the specimen, scored row by row against the claim table. A row the walk does not reproduce iterates the design and repeats from step 2, opening each cycle with the MVW. An outcome outside the table is recorded, not treated as a verdict.

## Fixed pairing

| Piece | Value |
|-------|--------|
| Container name | `workflow-server-exp` |
| Host port | `32772` (stable; Cursor keeps the MCP URL) |
| MCP config name | `workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |
| Isolated projects root | `$XDG_DATA_HOME/workflow-server/exp-projects` |
| Session `working_directory` | `<projects-root>/workflow-server`, a stable clone the agent creates |
| HMAC state | `$XDG_DATA_HOME/workflow-server/state`, shared with the install instance |
| Install instance | `workflow-server` on `:3000`, out of scope here |

Never pass `--name=workflow-server` or `--host-port=3000`; the reload script refuses both. Cursor may namespace tools as `user-workflow-server-exp`. A `session_index` is valid on one instance only.

## Trees under test

| Bind | Tree | Role |
|------|------|------|
| `--build` | Engine worktree under test (absolute path) | Host `tsc`; the image rebuilds when lockfile or Dockerfile drifted |
| `--workflows-dir` | Dedicated corpus worktree containing `corpus/` | Definitions served |
| `working_directory` | Stable clone under the isolated projects root | Repo binding and planning |

Never bind the shared `.worktrees/workflows` dest. Run the reload script from a checkout whose `http.md` describes host compile. The engine worktree's `node_modules` must match its lockfile or the cycle falls back to an image rebuild. `--no-build` moves only the corpus bind. Definition edits on a mounted tree resolve on the next tool call. Name a pairing with a distinct `--image` tag; later cycles inherit everything and take `--name` alone. Confirm `compile  : host tsc` and no `Building` in the log.

## Specimens

Both live in the corpus worktree under `corpus/specimens/<id>/`; the directory name is the workflow id.

**MVW** (`mvw`): one orchestrator (`get_workflow`, one `next_activity`), one activity to `__terminal__`, one `kind: routine` step, one `kind: technique` step doing the cheapest work that records a result. Nothing else. Grow it and it is no longer the MVW. Walk it as `workflow_id: mvw`.

**Change-surface specimen**: a second workflow that walks the claim table's cases on the live sidecar. Reuse an existing one only when it already covers that surface. Walk it only after the MVW has held on this instance. A specimen carries representative positive and negative cases, and weighs them equally. A positive case walks a path the change claims to hold; a negative case walks a path the change claims to refuse, reject, or leave untouched, and expects that refusal.

Layout: `docs/README.md` on the corpus tree. Quality: the `workflow-canon` skill. Serving check from an engine checkout, also the reload preflight:

```bash
npx tsx guards/check-all.ts --root <corpus-worktree> --serving-only
```

## Bring the sidecar up

1. Clone the target at `<projects-root>/workflow-server` so origin derivation yields `owner/repo`. A `working_directory` outside the bind returns `unmapped-root`.
2. If a specimen must edit the changed files, add a worktree of that branch under the projects root and pass it as `working_directory`.
3. Reload:

```bash
./scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-<slug> \
  --build=<engine-worktree> \
  --workflows-dir=<corpus-worktree> \
  --host-port=32772 \
  --projects-root="${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/exp-projects"
```

   Later cycles: `./scripts/reload-exp-sidecar.sh --name=workflow-server-exp`. Leave preflight on.

4. `curl -fsS http://127.0.0.1:32772/ready` — walk only on HTTP 200 with `status: "ready"`, `checks.sessionKeyWritable: true`, `checks.corpusServes: true`.
5. `docker inspect workflow-server-exp --format '{{json .Config.Labels}}'` — cite `workflow-server.corpus.pin` and `workflow-server.engine.pin` (suffix `-dirty` for uncommitted edits).

These are the only two shell touches of a live instance. A reload drops MCP sessions; call `discover` again before the next walk.

## Reach the instance through MCP

Every call that reads or drives the server is an MCP tool call on `workflow-server-exp`. A `curl` walk proves the container answers HTTP and nothing about what an agent receives. Missing tools or `The socket connection was closed unexpectedly` mean the client is disconnected: confirm `/ready`, then the user runs `/mcp reconnect all`. Never fall back to HTTP.

## Walk

Call `discover` on the sidecar and follow its bootstrap for `working_directory` and `session_index`. MVW: `start_session { workflow_id: mvw, agent_id: orchestrator, working_directory }`, then `get_workflow`, then one `next_activity`. Then the specimen on the same sidecar, by `workflow_id` or via meta with `user_request` / `target_workflow_id`.

Pin identity in the run record: MCP URL, corpus pin, image tag, workflow id, and the `planning_folder_path` the session echoes.

## Iterate

Score each walk against what it was for: the MVW against dispatch, the specimen against the claim table. Positive and negative cases score alike. A negative case that passes where the change claimed a refusal is a miss of the same weight as a positive case that stops. Re-run unit, e2e and guards after a design edit. Reload only when the engine must recompile or the corpus bind must move.

Stop with the name, or the install instance goes with it:

```bash
"${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/stop.sh" --name=workflow-server-exp
```
