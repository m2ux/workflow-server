---
metadata:
  version: 2.0.1
---

## Capability

The host repository a session belongs to, derived from git rather than from prose. Answers *which repository the session belongs to*, never *which component is being worked on* — version-control.host-is-derived-component-is-named.

## Inputs

### workspace_path

*(optional)* Directory the session was opened in — the starting point for the ascent.

#### default

`.`

## Outputs

### target_repo

`owner/repo` of the host repository. Unset when the workspace is not a git repo or the host has no origin remote.

### host_repo_path

Absolute path of the outermost repository that claims the workspace checkout — the workspace's own toplevel when nothing claims it.

### component_hint

Basename of the innermost toplevel when the ascent crossed a non-infrastructure submodule boundary — the component the session is already inside. Unset when the ascent crossed nothing, or crossed only infrastructure submodules.

### host_binding_mismatch

true when `basename({host_repo_path})` differs from the repository segment of `{target_repo}`. The server maps `owner/repo` onto a filesystem root by basename alone, so it cannot represent this divergence.

## Protocol

1. Resolve the innermost toplevel: `git -C {workspace_path} rev-parse --show-toplevel`. When the command fails, the workspace is not a git repo — leave every output unset and stop, so the caller takes its documented fallback.
2. Ascend while the current toplevel's parent directory is itself a git repository whose `.gitmodules` declares the current toplevel's basename as a submodule `path`. Each successful test moves the current toplevel to that parent; the outermost superproject wins. Record each boundary crossed, and whether it was an infrastructure submodule — apply version-control.infrastructure-submodule-paths. Emit `{host_repo_path}` and `{component_hint}` per their Output criteria.
3. Read `git -C {host_repo_path} remote get-url origin` and emit `{target_repo}`, accepting both the SSH form (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`) and dropping any trailing `.git`. When the host has no origin remote, leave `{target_repo}` unset and stop — the fallback case again. Emit `{host_binding_mismatch}` per its Output criteria.

## Rules

### prose-sources-are-fallback-only

The workspace `AGENTS.md` / `CLAUDE.md` and the user are fallback sources for `{target_repo}`, never primary ones. They apply only where this derivation yields nothing — a workspace that is not a git repo, or a host with no origin remote. A repository taken from prose while git could have answered is the defect this technique exists to remove.
