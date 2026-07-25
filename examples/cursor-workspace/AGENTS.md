# Target repository

## Filesystem checkout (navigation)

Projects live under `HOST_PROJECTS_ROOT` (see `$INSTALL/env`, default example
`~/projects/dev`). The checkout for this workspace is the **repo basename**:

```
workflow-server
```

Full path: `$HOST_PROJECTS_ROOT/workflow-server`  
(example absolute: `/home/mike1/projects/dev/workflow-server`)

Same layout for every project — no special case for workflow-server:

```text
$HOST_PROJECTS_ROOT/<repo>/
$HOST_PROJECTS_ROOT/<repo>/.engineering/       # planning / eng submodule
$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/  # feature worktrees only
```

`$INSTALL/worktrees` and `$INSTALL/projects` are **not** used for source or
feature trees.

## Session identity (`start_session`)

If the agent needs a GitHub `owner/repo` for `start_session` / `session.json#repo`,
set it here (orthogonal to the filesystem path above):

```
owner/repo
```

Replace with your project (for example `m2ux/workflow-server`).
