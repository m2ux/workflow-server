---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

This text arrives from `discover` before you have a session or an operations bundle, so you have no way
to fetch a workflow file yet. Every step below is therefore complete as written — carry it out from
this text alone. Where a step names an operation in `group::operation` form, that is the home the rule
keeps once step 4 hands you the bundle; it is a label for later, never something to go and read now.

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not*
   an argument to the `get_resource` tool): `workflow-server://schemas/workflow`

   - Orchestrators need only the workflow schema. The activity and technique schemas are fetched later,
     by the workers that execute activities.

2. Derive the target repository as `owner/repo` from git, before step 3:

   - Start at the workspace directory and ascend to the outermost repository that claims the workspace
     checkout as a submodule. That outermost repository is the host.
   - Read `owner/repo` from the host's `origin` remote. Accept the SSH form
     (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`), dropping any
     trailing `.git`.
   - Use git as the source. A repository named only in prose — the user's message, a workspace
     `AGENTS.md` — is a fallback for when the git derivation yields nothing, not a shortcut past it.
   - When the host directory's basename disagrees with the repository segment of `owner/repo`, do not
     pick one silently. The server maps a repository onto a filesystem root by basename alone, so carry
     the divergence forward: the first activity, `00-discover-session`, puts it to the user at a gate
     named `host-binding-mismatch`.

   The derivation runs here rather than inside an activity because `repo` is required on the step 3
   call, and a step inside a meta activity cannot inform the meta session's own binding.
   `00-discover-session` derives the same facts again so they also reach the client session it
   dispatches. (`version-control::resolve-host-repo` is where this lives once you have the bundle.)

3. Call `start_session { workflow_id: "meta", agent_id: "orchestrator", repo, user_request }`. Keep the
   returned `session_index` (6-character base32) as `{meta_session_index}`, and keep `{repo}` as
   `{target_repo}` — the response echo when it carries one, otherwise the value you passed. The server
   writes `session.json` and `.session-token` under the planning folder; you write no state yourself.

   - The response carries more than the index: the running workflow's id, version, title and
     description (later drift detection compares against that version), the `planning_slug` the session
     is keyed on, the canonical `planning_folder_path` once a durable one resolves, the echoed `repo`
     binding, and `context_mode` / `migrated` where either applies.
   - `repo_unbound: true` means the session booted with no repository bound, so the derivation in step 2
     yielded nothing. Treat it as the fallback branch, not a successful boot: supply `repo` from a prose
     source before any durable path can resolve.
   - Pass `planning_folder` as an absolute path or omit it entirely; a relative path is rejected. The
     response's `planning_folder_path` is canonical — do not recompose it.

4. Call `get_workflow { session_index }`. The response is the workflow's resolved operations bundle,
   then a `\n\n---\n\n` separator, then the workflow's metadata and activity roster. Read the bundle:
   from here on, the operations and rules it carries govern, and this bootstrap text stops applying.

   Two rules in that bundle bind immediately, so they are stated here as well:

   - Pass `session_index` on every authenticated tool call from now on.
   - Every worker you spawn must be awaited before your next step — no fire-and-forget. On Cursor that
     means setting `run_in_background=false` explicitly and waiting for the worker's envelope.
