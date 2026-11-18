# Loop Mode

Validates one system change on the live sidecar: the MVW first, then a specimen scored against the change's claim table.

## Procedure

1. **Specify.**  User specifies a system change.
2. **Change.**  Agent makes the change.
3. **Claim.**  Agent writes the **claim table**: one row per outcome the change promises, with the fixture case that will produce it. A row with no case means the fixture cannot evidence the claim — change the fixture before walking. A fixture chosen for neutrality alone usually exercises only the negative path.
4. **Paper-walk.**  Agent **paper-walks** the protocol on that fixture: the tool calls the operation would make, by hand, on real data. What the tool cannot answer, or answers with homonyms, is a design defect found here for a few calls rather than after a full walk.
5. **Specimens.**  Agent authors or reuses the MVW (`corpus/specimens/mvw/`) and a specimen for the change surface, as [Specimens](#specimens) states. Runs unit, e2e and guard tests. Serving check from an engine checkout, also the reload preflight:

   ```bash
   npx tsx guards/check-all.ts --root <corpus-worktree> --serving-only
   ```

6. **Ask.**  Agent asks whether to run a sidecar loop; on yes it owns the sidecar for that loop and follows [Bring the Sidecar Up](#bring-the-sidecar-up).
7. **MVW.**  MVW first, as [Walk](#walk) states. A miss is scored against "the instance can dispatch one activity"; iterate the engine on the MVW alone.
8. **Specimen.**  Then the specimen, scored row by row against the claim table. A row the walk does not reproduce iterates the design and repeats from step 2, opening each cycle with the MVW. An outcome outside the table is recorded, not treated as a verdict. Then follow [Iterate](#iterate).

### Bring the Sidecar Up

1. **Clone.**  Clone the target at `<projects-root>/workflow-server` so origin derivation yields `owner/repo`. A `working_directory` outside the bind returns `unmapped-root`. That clone is the checkout under work. Planning is written at `<project>/.engineering/artifacts/planning` of the primary project checkout, not in the clone and not in a worktree.
2. **Worktree.**  If a specimen must edit the changed files, add a worktree of that branch under the projects root and pass it as `working_directory`. Planning still goes to the primary project checkout.
3. **Reload.**  Reload:

   ```bash
   ./tests/scripts/reload-exp-sidecar.sh \
     --name=workflow-server-exp \
     --image=workflow-server:exp-<slug> \
     --build=<engine-worktree> \
     --workflows-dir=<corpus-worktree> \
     --host-port=32772 \
     --projects-root="${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/exp-projects"
   ```

   Later cycles: `./tests/scripts/reload-exp-sidecar.sh --name=workflow-server-exp`. Leave preflight on.

4. **Ready.**  `curl -fsS http://127.0.0.1:32772/ready` — walk only on HTTP 200 with `status: "ready"`, `checks.sessionKeyWritable: true`, `checks.corpusServes: true`.
5. **Pins.**  `docker inspect workflow-server-exp --format '{{json .Config.Labels}}'` — cite `workflow-server.corpus.pin` and `workflow-server.engine.pin` (suffix `-dirty` for uncommitted edits).

These are the only two shell touches of a live instance. A reload drops MCP sessions; call `discover` again before the next walk.

### Walk

1. **Discover.**  Call `discover` on the sidecar and follow its bootstrap for `working_directory` and `session_index`.
2. **MVW.**  MVW: `start_session { workflow_id: mvw, agent_id: orchestrator, working_directory }`, then `get_workflow`, then one `next_activity`.
3. **Specimen.**  Then the specimen on the same sidecar, by `workflow_id` or via meta with `user_request` / `target_workflow_id`.
4. **Pin.**  Pin identity in the run record: MCP URL, corpus pin, image tag, workflow id, and the `planning_folder_path` the session echoes.

### Iterate

1. **Score.**  Score each walk against what it was for: the MVW against dispatch, the specimen against the claim table. Positive and negative cases score alike. A negative case that passes where the change claimed a refusal is a miss of the same weight as a positive case that stops.
2. **Re-run.**  Re-run unit, e2e and guards after a design edit. Reload only when the engine must recompile or the corpus bind must move.
3. **Stop.**  Stop with the name, or the install instance goes with it:

   ```bash
   "${XDG_DATA_HOME:-$HOME/.local/share}/workflow-server/stop.sh" --name=workflow-server-exp
   ```

## Reference

### Specimens

Both live in the corpus worktree under `corpus/specimens/<id>/`; the directory name is the workflow id.

**MVW** (`mvw`): one orchestrator (`get_workflow`, one `next_activity`), one activity to `__terminal__`, one `kind: routine` step, one `kind: technique` step doing the cheapest work that records a result. Nothing else. Grow it and it is no longer the MVW. Walk it as `workflow_id: mvw`.

**Change-surface specimen**: a second workflow that walks the claim table's cases on the live sidecar. Reuse an existing one only when it already covers that surface. Walk it only after the MVW has held on this instance. A specimen carries representative positive and negative cases, and weighs them equally. A positive case walks a path the change claims to hold; a negative case walks a path the change claims to refuse, reject, or leave untouched, and expects that refusal.

Layout: `docs/README.md` on the corpus tree. Quality: the `workflow-canon` skill.

### Reach the Instance Through MCP

Every call that reads or drives the server is an MCP tool call on `workflow-server-exp`. A `curl` walk proves the container answers HTTP and nothing about what an agent receives. Missing tools or `The socket connection was closed unexpectedly` mean the client is disconnected: confirm `/ready`, then the user runs `/mcp reconnect all`. Never fall back to HTTP.
