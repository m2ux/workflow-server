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

A live HTTP sidecar walks real workflow traffic to exercise and validate **codebase changes, corpus changes, or both**. Specimen workflows are the usual vehicle. The first live walk is always a **minimum viable workflow (MVW)** — one orchestrator, one activity, one routine, one technique — so a broken engine is visible before anyone authors a change-surface specimen, and so a broken instance can be cycled without paying for that larger walk.

This skill locates the pairing, the MCP namespace, and the loop. Bootstrap steps come from `discover` on the sidecar; reload flags live in `http.md` and `scripts/reload-exp-sidecar.sh` of the server checkout. Cite those. Do not copy them here.

## Typical flow

1. User specifies a system change.
2. Agent adds or changes the feature.
3. Agent authors or reuses the MVW (`corpus/specimens/mvw/`) and, separately, a specimen that exercises the change surface.
4. Agent runs unit, e2e, and guard tests.
5. Agent asks whether to run a sidecar loop. The walk (MVW, then specimen) is the cost; an engine reload is host `tsc` plus a container recreate. On yes: spin up or reload the sidecar.
6. First live walk: the MVW. A miss here is scored against "the instance can dispatch one activity"; iterate the engine and stay on the MVW. Do not walk the change-surface specimen yet.
7. Once the MVW holds, walk the change-surface specimen. Score that walk against the claims of the change under test. A miss against those claims iterates the design and repeats from step 2, still opening each sidecar cycle with the MVW. An outcome the change does not speak to is recorded, not treated as a verdict on the change.

After a yes at step 5, the agent owns the sidecar lifecycle for that loop and may cycle the instance as the experiment requires. Ordinary start / create / resume work packages on the install instance are a different job; they never use this sidecar.

## Fixed pairing

| Piece | Value |
|-------|--------|
| Container name | `workflow-server-exp` |
| Host port | `32772` (stable; Cursor then keeps the MCP URL and skips a new permission prompt) |
| MCP config name | `workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |
| Isolated projects root | `$XDG_DATA_HOME/workflow-server/exp-projects` (this skill's pairing, not a `start.sh` default) |
| Session `working_directory` | Absolute path `<projects-root>/workflow-server` — a stable clone the agent creates; directory basename is the `<repo>` segment of the planning path |
| HMAC state | `$XDG_DATA_HOME/workflow-server/state` — same bind as the install instance; `--projects-root` does not replace it |
| Install instance | `workflow-server` on `:3000` — out of scope for this skill |

Never pass `--name=workflow-server` or `--host-port=3000`. The reload script refuses both.

Match the sidecar by that URL or config name. Cursor may namespace tools as `user-workflow-server-exp`; install tools share names on `:3000`. A `session_index` is valid on one instance only — never send a sidecar index to install, or the reverse.

## Trees under test

Three checkouts, three jobs:

| Bind | Tree | Role |
|------|------|------|
| `--build` | Engine worktree of the code under test | Host `tsc` plus the image when lockfile or Dockerfile drifted |
| `--workflows-dir` | Dedicated corpus worktree | Definitions the sidecar serves |
| `working_directory` | Stable clone under the isolated projects root | Repo binding and planning |

`--workflows-dir` is a checkout that contains `corpus/` — typically `.worktrees/<branch>` of the primary server checkout. The script accepts any such directory. **Never bind the shared `.worktrees/workflows` dest** — that checkout stays on the integration branch for other agents.

`--build` and `--workflows-dir` are resolved from the current working directory unless they are absolute.

Run the reload script from a checkout whose `http.md` describes host compile (section **Reload an experiment sidecar on a stable port**). Pass `--build` as the **absolute** path of the engine worktree under test. That engine tree is the source being compiled; it is not the script that must run. An older `reload-exp-sidecar.sh` in that worktree docker-builds every cycle.

`--build` names the engine checkout. Host compile and a recreate are the engine cycle; the image rebuilds when the lockfile or Dockerfile drifted. The engine worktree's `node_modules` must match its lockfile (provision that worktree, or `npm ci` there) or the cycle falls back to an image rebuild. When only the corpus bind must move, `--no-build` reuses the image and does not compile. Definition edits on a corpus tree the sidecar already mounts resolve on the next tool call; that tree is not cached at boot.

Pick a distinct `--image` tag per experiment (for example `workflow-server:exp-<slug>`). The script's own default is `workflow-server:local` and is **not** read back from the container.

The first reload of a new pairing names `--name`, `--image`, `--build`, `--workflows-dir`, `--host-port=32772`, and `--projects-root`. Later engine cycles inherit port, corpus, and projects root. They still need `--image` whenever the tag is not `workflow-server:local`. A corpus-only cycle passes `--no-build`. Confirm the log: `compile  : host tsc` and no `Building … from`. `Building` means the image was rebuilt (lockfile or Dockerfile drift, missing image, or `node_modules` not matching the engine lockfile).

Open `http.md` in the server checkout, section **Reload an experiment sidecar on a stable port**, and the script's own `--help`, for the flag surface. Leave preflight on: it runs serving guards before anything is stopped, and a refusal leaves the sidecar as it was.

## Specimens

Two workflows, two jobs. Both live in the dedicated corpus worktree under `corpus/specimens/<id>/`. The directory name is the workflow id.

### MVW

Id `mvw`. Four counts, and nothing else:

| Piece | Count |
|-------|--------|
| Orchestrator | 1 — this session's `agent_id`, one `get_workflow`, one `next_activity` |
| Activity | 1 — `graph` is that activity to `__terminal__` |
| Routine | 1 — the activity's only step is `kind: routine` |
| Technique | 1 — the routine's only step is `kind: technique` |

No second activity, no loop, no fan, no checkpoint, no extra fetch. The technique's protocol is the cheapest work that still executes (one recorded result). It does not exercise the change surface.

Reuse `corpus/specimens/mvw/` when it still matches those counts. Grow it and it is no longer the MVW — put the extra work on the change-surface specimen.

Walk it as `workflow_id: mvw` so meta is not on the path. That is the cheap cycle: a broken image is found before anyone pays for catalog dispatch or a larger graph.

File grain (schema inventory, then `docs/README.md` on the corpus tree): `workflow.yaml`, `activities/01-<id>.yaml`, `routines/<name>.yaml`, `techniques/<name>.md`. Definition quality: the `workflow-canon` skill.

### Change-surface specimen

A second workflow, authored to walk the change surface on the live sidecar — the same path unit, e2e, and guard tests cannot see. Reuse an existing specimen only when it already covers that surface; a new change surface gets a new specimen. Walk it only after the MVW has held on this instance.

Layout, identity, and linking: `docs/README.md` on that corpus tree. Definition quality: the `workflow-canon` skill. Serving check before a walk, from an **engine** checkout (`npx tsx` must resolve there; a corpus worktree has no `package.json`):

```bash
npx tsx guards/check-all.ts --root <corpus-worktree> --serving-only
```

That is the reload preflight. Full corpus picture: the same command with `--corpus-only`. Omit `--root` and the sweep measures `.worktrees/workflows` of the primary checkout instead. The preflight **skips** (does not refuse) when `tsx` does not resolve from the engine checkout — provision that worktree, or run the script from a checkout that has `node_modules`.

## Bring the sidecar up

1. Ensure the isolated projects root exists. `start.sh` creates the directory; it does not clone a repo. Clone the target so origin derivation yields `owner/repo`, at `<projects-root>/workflow-server`. Session `working_directory` is that absolute path. Planning lands under `<projects-root>/<repo>/.engineering/artifacts/planning`. A path outside this bind returns `unmapped-root` — the live checkout under `~/projects/dev` is outside it.
2. If a specimen must edit the same files the agent just changed, add a worktree of that branch **under the isolated projects root** and pass that absolute path as `working_directory` instead. The default clone is for binding and planning; it is not the engine source.
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

Run that from the checkout that has host compile, with `--build` pointing at the engine worktree. Later engine cycles:

```bash
./scripts/reload-exp-sidecar.sh --name=workflow-server-exp --image=workflow-server:exp-<slug>
```

4. Confirm identity on the endpoint itself:

```bash
curl -fsS http://127.0.0.1:32772/ready
```

The payload is `{ status, checks, corpus }`. Walk only on HTTP 200 with `status: "ready"`, `checks.sessionKeyWritable: true`, and `checks.corpusServes: true`. `corpus.hostDir` is the dedicated corpus worktree on the host; `corpus.dir` is the container mount. `/ready` does not carry a pin.

5. Cite the pin from labels, not from `/ready`:

```bash
docker inspect workflow-server-exp --format '{{json .Config.Labels}}'
```

`workflow-server.corpus.pin` is the commit (suffix `-dirty` when that tree has uncommitted edits). An engine cycle stamps `workflow-server.engine.pin`; a `--no-build` reload leaves the engine unclaimed. The install container on `:3000` stays up.

MCP HTTP sessions live in the container's memory. A reload drops them. Call `discover` on the sidecar again before the next walk.

## Walk the MVW, then the specimen

Call `discover` on the **sidecar** MCP server (`workflow-server-exp` / `:32772`). Follow the bootstrap it returns for `working_directory` and `session_index`. `working_directory` is the absolute path of the stable clone (or the isolated worktree from the escape hatch above).

The first walk of every sidecar cycle is the MVW. `start_session` takes `workflow_id: mvw`, `agent_id: orchestrator`, and that `working_directory`. Do not open meta for this pass. Then `get_workflow` and one `next_activity` on the returned `session_index`. Keep every later authenticated call on the same sidecar namespace.

`discover` still reads `meta/bootstrap-protocol` from the served corpus when `meta` is present. The MVW pass does not follow that protocol's `workflow_id: meta` opening.

Once the MVW holds, walk the change-surface specimen on the same sidecar. That session may use `user_request` / `target_workflow_id` under meta, or pass the specimen id as `workflow_id`. A unique catalog match returns `client` already open — then `get_workflow` and `next_activity` go to `client.session_index`.

Pin identity in the run record: MCP URL, `workflow-server.corpus.pin`, image tag, workflow id (`mvw` or the specimen), and the `planning_folder_path` the session echoes.

## Iterate

Score each walk against what that walk was for.

The MVW claims only that this instance can open a session and dispatch one activity through one routine and one technique. A miss there is a miss on the engine or the pairing. Stay on the MVW: reload, re-walk, do not start the change-surface specimen. That is the cheap cycle while the server is broken.

The change-surface specimen is scored against the attendant design changes, not against an absolute idea of a clean session. A miss is a path those changes claimed would hold and the walk did not. A walk that stops, errors, or differs from a prior run is a miss only where those claims reach. It is still a miss in the ordinary sense when the change claimed the instance would serve that path at all.

An outcome outside the change surface (pre-existing behaviour, a specimen gap, a stop the change never promised to prevent) is evidence about the walk, not a verdict on the change. Name which, then either widen the specimen or leave it out of the loop.

Every sidecar cycle after a reload opens with the MVW again, then the specimen. Re-run unit, e2e, and guards after a design edit. Reload from the host-compile checkout when the engine must recompile, or when `--workflows-dir` must point at a different tree. Definition edits on the tree already mounted resolve on the next tool call.

Stop with `--name=workflow-server-exp` on any `stop.sh`. Omitting `--name` defaults to `workflow-server` and removes the install instance:

```bash
"${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/stop.sh" --name=workflow-server-exp
```

Leave `workflow-server` on `:3000` running.
