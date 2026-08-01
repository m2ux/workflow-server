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

## GitHub auth and agent shell (required)

Host auth is **keyring + SSH**. Most agent GitHub failures are a **sandboxed shell**, not a broken login. When the project checkout carries `github-cli-protocol` / remote `version-control` ops, those techniques state the same invariant (`host-shell-for-gh`, `host-shell-for-remote-git`).

1. **First attempt, every time — full host permissions.** For every `gh` call (including `gh api`) and every remote git/SSH call (`fetch` / `pull` / `push` / `ls-remote` / network `clone` / `ssh` to the git host), run the Shell with `required_permissions: ["all"]` (or the harness equivalent outside the agent sandbox). Local-only git may use the default shell. Do not start these remote calls sandboxed and escalate after failure.
2. **Leave token env unset unless a known-good PAT is intentional.** Unset `GH_TOKEN` and `GITHUB_TOKEN` for keyring auth. Never scrape `~/.config/gh/hosts.yml` into them.
3. **Sandbox denial is not auth failure.** Signatures such as `Bad owner or permissions on …/ssh_config.d/…`, TCP via `127.0.0.1`, or `unexpected EOF` on `api.github.com` mean re-run the same command once under full host permissions — not that credentials failed. If the harness refuses full host permissions, stop and surface that blockage.
