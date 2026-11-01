# Loop Mode

Validates one system change on the live sidecar: the MVW first, then the change-surface specimen, iterating until the claim table holds.

## Procedure

### Typical Flow

1. **Take the change.**
   The user specifies a system change.
2. **Make the change.**
   Make it in the engine, the corpus, or both.
3. **Write the claim table.**
   - One row per outcome the change promises, with the fixture case that will produce it.
   - A row with no case means the fixture cannot evidence the claim; change the fixture before walking.
   - A fixture chosen for neutrality alone usually exercises only the negative path.
4. **Paper-walk the protocol.**
   Walk that fixture by hand, on real data, through the tool calls the operation would make. What the tool cannot answer, or answers with homonyms, is a design defect found here for a few calls rather than after a full walk.
5. **Prepare the specimens.**
   Author or reuse the [MVW](#specimens) (`corpus/specimens/mvw/`) and a [change-surface specimen](#specimens). Run unit, e2e and guard tests, and [Run Serving Check](#run-serving-check) over the corpus worktree.
6. **Ask for the loop.**
   Ask the user whether to run a sidecar loop. On yes, own the sidecar for that loop and [bring it up](#bring-up-the-sidecar).
7. **Walk the MVW.**
   [Walk](#walk-the-specimens) the MVW first. A miss is scored against "the instance can dispatch one activity"; iterate the engine on the MVW alone.
8. **Walk the specimen.**
   Walk the specimen next, scored row by row against the claim table as [Iterate](#iterate) sets out. A row the walk does not reproduce iterates the design and repeats from step 2, opening each cycle with the MVW. An outcome outside the table is recorded, not treated as a verdict.

### Bring Up the Sidecar

1. **Clone the target.**
   - Clone the target at `<projects-root>/workflow-server` so origin derivation yields `owner/repo`. A `working_directory` outside the bind returns `unmapped-root`.
   - That clone is the checkout under work. Planning is written at `<project>/.engineering/artifacts/planning` of the primary project checkout, not in the clone and not in a worktree.
2. **Add a branch worktree.**
   If a specimen must edit the changed files, add a worktree of that branch under the projects root and pass it as `working_directory`. Planning still goes to the primary project checkout.
3. **Reload.**
   [Reload Sidecar](#reload-sidecar) on the first cycle of a pairing, and [Cycle Sidecar](#cycle-sidecar) on each later one.
4. **Probe readiness.**
   [Probe Readiness](#probe-readiness), and walk only when it passes.
5. **Cite the pins.**
   [Inspect Pin Labels](#inspect-pin-labels) and cite `workflow-server.corpus.pin` and `workflow-server.engine.pin` in the run record.

### Walk the Specimens

1. **Discover.**
   - Call `discover` on the sidecar and follow its bootstrap for `working_directory` and `session_index`. A reload drops MCP sessions, so call it again before the walk after each reload.
   - Missing tools or `The socket connection was closed unexpectedly` mean the client is disconnected: confirm `/ready` with [Probe Readiness](#probe-readiness), then the user runs `/mcp reconnect all`.
2. **Walk the MVW.**
   Call `start_session { workflow_id: mvw, agent_id: orchestrator, working_directory }`, then `get_workflow`, then one `next_activity`.
3. **Walk the specimen.**
   Walk it on the same sidecar, by `workflow_id` or via meta with `user_request` / `target_workflow_id`.
4. **Pin identity.**
   Record the MCP URL, corpus pin, image tag, workflow id, and the `planning_folder_path` the session echoes in the run record.

### Iterate

1. **Score.**
   - Score each walk against what it was for: the MVW against dispatch, the specimen against the claim table.
   - Positive and negative cases score alike. A negative case that passes where the change claimed a refusal is a miss of the same weight as a positive case that stops.
2. **Retest.**
   Re-run unit, e2e and guards after a design edit.
3. **Reload.**
   Reload only when the engine must recompile or the corpus bind must move, through [Cycle Sidecar](#cycle-sidecar) or [Reload Sidecar](#reload-sidecar).
4. **Stop.**
   [Stop Sidecar](#stop-sidecar) when the loop ends.

## Reference

### Trees Under Test

| Bind | Tree | Role |
|------|------|------|
| `--build` | Engine worktree under test (absolute path) | Host `tsc`; the image rebuilds when lockfile or Dockerfile drifted |
| `--workflows-dir` | Dedicated corpus worktree containing `corpus/` | Definitions served |
| `working_directory` | Stable clone under the isolated projects root | Repo binding |
| Planning root | `<project>/.engineering/artifacts/planning` of the primary project checkout | Session artifacts. Not a worktree, and not the workflow-server local share |

- The engine worktree's `node_modules` must match its lockfile or the cycle falls back to an image rebuild.
- Definition edits on a mounted tree resolve on the next tool call.

### Specimens

Both live in the corpus worktree under `corpus/specimens/<id>/`; the directory name is the workflow id.

- **MVW (`mvw`)**
  - One orchestrator (`get_workflow`, one `next_activity`), one activity to `__terminal__`, one `kind: routine` step, one `kind: technique` step doing the cheapest work that records a result. Nothing else.
  - Grow it and it is no longer the MVW. Walk it as `workflow_id: mvw`.
- **Change-surface specimen**
  - A second workflow that walks the claim table's cases on the live sidecar. Reuse an existing one only when it already covers that surface.
  - Walk it only after the MVW has held on this instance.
  - It carries representative positive and negative cases, and weighs them equally.
  - A positive case walks a path the change claims to hold; a negative case walks a path the change claims to refuse, reject, or leave untouched, and expects that refusal.

## Rules

- **Two shell touches.**
  [Probe Readiness](#probe-readiness) and [Inspect Pin Labels](#inspect-pin-labels) are the only shell touches of a live instance.
- **Shared dest unbound.**  Never bind the shared `.worktrees/workflows` dest.

## Commands

### Run Serving Check

Checks that the corpus worktree serves; it is also the reload preflight.

- Run from an engine checkout.

```bash
npx tsx guards/check-all.ts --root <corpus-worktree> --serving-only
```

### Reload Sidecar

Builds the engine on the host and starts the sidecar with a named pairing of image, engine worktree and corpus worktree.

- Run from a checkout whose `http.md` describes host compile. Leave preflight on.
- Name a pairing with a distinct `--image` tag.
- `--no-build` moves only the corpus bind.
- Confirm `compile  : host tsc` and no `Building` in the log.

```bash
./tests/scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-<slug> \
  --build=<engine-worktree> \
  --workflows-dir=<corpus-worktree> \
  --host-port=32772 \
  --projects-root="${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/exp-projects"
```

### Cycle Sidecar

Reloads the sidecar on the pairing its first cycle named.

- Later cycles inherit everything and take `--name` alone. Leave preflight on.

```bash
./tests/scripts/reload-exp-sidecar.sh --name=workflow-server-exp
```

### Probe Readiness

Reports whether the sidecar is ready to walk.

- Walk only on HTTP 200 with `status: "ready"`, `checks.sessionKeyWritable: true` and `checks.corpusServes: true`.

```bash
curl -fsS http://127.0.0.1:32772/ready
```

### Inspect Pin Labels

Prints the container labels carrying the corpus and engine pins.

- Cite `workflow-server.corpus.pin` and `workflow-server.engine.pin`; a `-dirty` suffix marks uncommitted edits.

```bash
docker inspect workflow-server-exp --format '{{json .Config.Labels}}'
```

### Stop Sidecar

Stops the sidecar container.

- Pass the name, or the install instance goes with it.

```bash
"${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/stop.sh" --name=workflow-server-exp
```
