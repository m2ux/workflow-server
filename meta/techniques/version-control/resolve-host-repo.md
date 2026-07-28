---
metadata:
  version: 1.0.0
---

## Capability

Derive the host repository a session belongs to from git: ascend from the workspace checkout through every superproject that claims it as a submodule, and read `owner/repo` from the outermost host's origin remote. Answers *which repository the session belongs to*, never *which component is being worked on* — see [version-control](./TECHNIQUE.md)::host-is-derived-component-is-named.

## Inputs

### workspace_path

Directory the session was opened in — the starting point for the ascent. Defaults to the current working directory.

## Outputs

### target_repo

`owner/repo` read from the origin remote of `{host_repo_path}`. Left unset when the workspace is not a git repo or the host has no origin remote, which is the only case where a caller falls back to workspace prose or the user.

### host_repo_path

Absolute path of the outermost repository that claims the workspace checkout — the workspace's own toplevel when nothing claims it.

### is_monorepo_host

true when the ascent crossed at least one non-infrastructure submodule boundary, meaning the session was opened inside a component of a larger superproject. An ascent that crossed only infrastructure submodules leaves this false, per [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.

### component_hint

Basename of the innermost toplevel when the ascent crossed a non-infrastructure submodule boundary — the component the session is already inside. Left unset when no ascent happened, or when the boundary crossed was an infrastructure submodule, which is never a target component.

### host_binding_mismatch

true when `basename({host_repo_path})` differs from the repository segment of `{target_repo}`. The server maps `owner/repo` onto a filesystem root by basename alone, so it cannot represent this divergence — the caller gates on it rather than binding.

## Protocol

1. Resolve the innermost toplevel: `git -C {workspace_path} rev-parse --show-toplevel`. When the command fails, the workspace is not a git repo — leave every output unset and stop, so the caller takes its documented fallback.
2. Ascend while the current toplevel's parent directory is itself a git repository whose `.gitmodules` declares the current toplevel's basename as a submodule `path`. Each successful test moves the current toplevel to that parent; the outermost superproject wins. Record each boundary crossed, and whether it was an infrastructure submodule — apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.
3. Set `{host_repo_path}` to the final toplevel. Set `{is_monorepo_host}` = true when at least one crossed boundary was a non-infrastructure submodule; false otherwise, including when no ascent happened.
4. Set `{component_hint}` to the basename of the innermost toplevel when at least one crossed boundary was a non-infrastructure submodule; leave it unset otherwise.
5. Read `git -C {host_repo_path} remote get-url origin` and set `{target_repo}` to `owner/repo`, accepting both the SSH form (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`) and dropping any trailing `.git`. When the host has no origin remote, leave `{target_repo}` unset and stop — the fallback case again.
6. Set `{host_binding_mismatch}` = true when `basename({host_repo_path})` differs from the repository segment of `{target_repo}`; false otherwise.
