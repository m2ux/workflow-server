---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

A `group::operation` name in a step is a label for the home that rule keeps once step 3 delivers the
bundle. Do not read it now.

Do not fetch a definition schema here — it is read by whichever context authors a definition.

1. Derive the target repository as `owner/repo` from git, before step 2:

   - Start at the workspace checkout's own repository root. While the parent directory is itself a
     repository whose `.gitmodules` declares the current root's basename as a submodule path, move the
     current root to that parent. The outermost root the loop reaches is the host.
   - Read `owner/repo` from the host's `origin` remote. Accept the SSH form
     (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`), dropping any
     trailing `.git`.
   - Use git as the source. A repository named only in prose — the user's message, a workspace
     `AGENTS.md` — is a fallback for when the git derivation yields nothing, not a shortcut past it.
   - When the host directory's basename disagrees with the repository segment of `owner/repo`, do not
     pick one silently. The server maps a repository onto a filesystem root by basename alone, so carry
     the divergence forward: the first activity, `00-discover-session`, puts it to the user at a gate
     named `host-binding-mismatch`.

   The derivation runs here rather than inside an activity because `repo` is required on the step 2
   call, and a step inside a meta activity cannot inform the meta session's own binding.
   `00-discover-session` derives the same facts again so they also reach the client session it
   dispatches. (`version-control::resolve-host-repo` is where this lives once you have the bundle.)

2. Call `start_session { workflow_id: "meta", agent_id: "orchestrator", repo, user_request }`. Keep the
   returned `session_index` (6-character base32) as `{meta_session_index}`, and keep `{repo}` as
   `{target_repo}` — the response echo when it carries one, otherwise the value you passed. The server
   creates or rebinds `session.json` and `.session-token` itself; you write no state. This call names no
   planning folder, so they start somewhere transient and move once a durable folder resolves.

   - The response carries more than the index: the running workflow's id, version, title and
     description (later drift detection compares against that version), the `planning_slug` the session
     is keyed on, the canonical `planning_folder_path` once a durable one resolves, the echoed `repo`
     binding, and `context_mode` / `migrated` where either applies. `context_mode` records the delivery
     topology: `persistent` for a single context walking the whole session, omitted or `fresh` when each
     activity is dispatched to a worker.
   - `repo_unbound: true` comes back when a transient session booted with no repository bound, so the
     derivation in step 1 yielded nothing. Treat it as the fallback branch, not a successful boot: supply `repo` from a prose
     source before any durable path can resolve.
   - Pass `planning_folder` as an absolute path or omit it entirely; a relative path is rejected. The
     response's `planning_folder_path` is canonical — do not recompose it.

3. Call `get_workflow { session_index }`. The response is the workflow's resolved operations bundle,
   then a `\n\n---\n\n` separator, then the workflow's metadata and activity roster. Read the bundle:
   from here on, the operations and rules it carries govern, and this bootstrap text stops applying.

   This is the workflow delivered at the size an orchestrator acts on: the rules and operations it
   executes, the variables it binds, the activity roster it routes through, and `initialActivity` for
   your first `next_activity`. Per-activity step detail reaches whichever context executes the
   activity, through `get_activity`.

   Two of the bundle's rules bind from your very next call, so they are stated here too. The bundle
   carries both — one among the `workflow-engine` rules, one among `harness-compat`'s — and its wording
   governs once you hold it.

   - Pass `session_index` on every authenticated tool call from now on.
   - Every worker you spawn must be awaited before your next step — no fire-and-forget. On Cursor that
     means setting `run_in_background=false` explicitly and waiting for the worker's envelope.
