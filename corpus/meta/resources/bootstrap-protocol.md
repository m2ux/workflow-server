---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Derive the target repository as `owner/repo` from git, before step 2:

   - Start at the workspace checkout's own repository root. While the parent directory is itself a
     repository whose `.gitmodules` declares the current root's basename as a submodule path, move the
     current root to that parent. The outermost root the loop reaches is the host.
   - Read `owner/repo` from the host's `origin` remote. Accept the SSH form
     (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`), dropping any
     trailing `.git`.
   - Use git as the source. A repository named only in prose — the user's message, a workspace
     `AGENTS.md` — is the fallback for when the git derivation yields nothing.
   - When the host directory's basename disagrees with the repository segment of `owner/repo`, keep
     both values and carry the disagreement into step 2 unresolved. It is settled later, with the user.

2. Call `start_session { workflow_id: "meta", agent_id: "orchestrator", repo, user_request }`. Keep two
   values from the response: the `session_index` it returns, a 6-character base32 string, and the
   `repo` binding it echoes, falling back to the value you passed when the echo is absent. Later text
   calls them `meta_session_index` and `target_repo`.

   `repo_unbound: true` comes back when the step 1 derivation yielded nothing. Supply `repo` from a
   prose source and call again.

3. Call `get_workflow { session_index }`. The response is the workflow's resolved operations bundle,
   then a `\n\n---\n\n` separator, then the workflow's metadata and activity roster.

   Read the bundle. From here on the operations and rules it carries govern, and this bootstrap text
   stops applying. It names an `initialActivity`: that id is the argument to your first
   `next_activity` call, which is where the workflow itself takes over.

   Two of its rules bind from your very next call:

   - Pass `session_index` on every authenticated tool call from now on.
   - Every worker you spawn must be awaited before your next step — no fire-and-forget. On Cursor that
     means setting `run_in_background=false` explicitly and waiting for the worker's envelope.
