# Target repository

## Filesystem checkout (navigation)

Projects live under:

```
${env:HOST_PROJECTS_ROOT}
```

The checkout for this workspace is the **repo basename** named in
`workflow-server.code-workspace` (default `workflow-server`).

Same layout for every project:

```text
${env:HOST_PROJECTS_ROOT}/<repo>/
${env:HOST_PROJECTS_ROOT}/<repo>/.engineering/artifacts/planning/
${env:HOST_PROJECTS_ROOT}/<repo>/.worktrees/<slug>/
```

## Session identity (`start_session`)

If the agent needs a GitHub `owner/repo` for `start_session`, set it here:

```
owner/repo
```

Replace with your project (for example `m2ux/workflow-server`).
