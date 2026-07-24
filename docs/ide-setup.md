# Workflow Server IDE Setup

This guide explains how to configure your IDE so that the agent connects to the workflow server correctly on every workflow request.

## Bootstrap Rule

Add the following to your IDE's "always-applied" rule set (Cursor rule, Claude Code project rule, etc.):

```
For any start workflow, create work package, or resume work package request:

1. Infer the target GitHub repo as owner/repo from the user's request (explicit name, issue/PR URL, open workspace, git remote). If more than one repo is plausible or none is clear, ask one clarifying question — do not guess.
2. Use that repo's paths under the workflow-server install layout
   ($INSTALL/engineering/<owner>/<repo> and $INSTALL/workspace/<owner>/<repo>).
   If that repo was never initialised by the operator (init-repo.sh), tell the user — do not invent another root.
3. Call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

If the user provides a `session_token` or `session_index`, pass it to subsequent workflow-server calls per their instructions.
```

The rule wires natural-language requests ("start a work package for acme/app", "resume the workflow on PR #12") into **repo inference** and the server's bootstrap procedure. The operator runs [`init-repo.sh`](../scripts/init-repo.sh) when adding a repo (see [setup.md §2](../setup.md#2-init-a-target-repo)). The agent does **not** ask the user for path flags; it infers `owner/repo` from the ask and clarifies when ambiguous ([setup.md §3](../setup.md#3-which-repo-is-this-request-for-agent)).

## What the Bootstrap Returns

`discover` returns:

- **Server name and version** — confirms which workflow server the agent is talking to.
- **Bootstrap procedure** — the pre-session stub the agent must follow: fetch `workflow-server://schemas/workflow`, call `start_session`, then `get_workflow` and follow the returned operations bundle. Activity dispatch (`next_activity` / `get_activity`) and checkpoint discipline come from that bundle, not from the stub itself. `list_workflows` is available without a session and is typically used during meta `discover-session`, not as a required bootstrap step.

Because `discover` is the entry point, the procedure stays in sync with the server. You do not need to maintain a separate copy of the protocol in your IDE rules — the rule above only has to enforce "resolve the repo, then call `discover`." Ongoing delivery policy (worker-fresh, resource `#section` vs whole file, force-full escapes) is authoritative in techniques delivered with the operations bundle after `get_workflow`.

## Delivery Context and Worker Parameters

Two session-shaping choices affect how much content the server delivers and how it is sized. Both are decided by your execution topology.

- **`context_mode` (on `start_session` / `dispatch_child`).** Declares the session's delivery context model. The default (omit, or `"fresh"`) delivers full content on every call and is correct whenever activities are dispatched to spawned workers — each worker is a fresh context that relies on the repeated delivery. Pass `context_mode: "persistent"` **only** when a single agent context executes the whole session itself (no worker spawning): already-delivered bundle, technique, and resource content then arrives as `{ delivery: "unchanged", content_hash }` references instead of being repeated, and `get_activity { bundle: "full" }` / `get_technique { full: true }` / `get_resource { full: true }` re-fetch anything that context no longer holds.
- **`agent_id` (on `start_session` / `dispatch_child`).** Names the agent whose delivery ledger the server keys against. In a solo/persistent session use one canonical `agent_id` for the whole walk so reference delivery collapses correctly; resuming under a different `agent_id` starts that agent from an empty ledger (its first deliveries are full).
- **`context_tokens` (REQUIRED on `get_activity`).** The worker declares its own context window in tokens on its activity-fetch entry call. The server derives an eager step-technique bundling budget from it (availability headroom × a token→char factor, both server config) and inlines the activity's ungated step-bound techniques that fit under that budget; the rest stay lazy via `get_technique`. It is per-agent and per-call — never stored on the session, never defaulted. **Omitting `context_tokens` on `get_activity` is a validation error.** `get_workflow` does no technique bundling and takes no `context_tokens`.

## Schema Awareness (Optional)

The server also exposes the JSON Schemas for `workflow`, `activity`, `technique`, `condition`, and `state` via an MCP resource at `workflow-server://schemas`. Agents that want to author or validate workflow definitions locally can fetch this resource on startup. See [schemas/README.md](../schemas/README.md) for the schema reference.

## Verifying the Connection

After configuring the rule:

1. Restart your MCP client.
2. Ask the agent to `list available workflows`. It should call `list_workflows` (no session token required) and return the workflow inventory.
3. Ask the agent to `start a work-package workflow for <owner/repo>`. It should resolve the repo (or ask if ambiguous), then call `discover` and complete the returned bootstrap (schema fetch → `start_session` → `get_workflow`).

If the agent skips `discover`, your rule has not been picked up — re-check the IDE's rule configuration.

## Related

- [README.md](../README.md) — project overview and quick-start.
- [setup.md](../setup.md) — shared install sequence (layout, operator init-repo, agent repo inference, verify).
- [http.md](../http.md) — Docker / HTTP transport only.
- [stdio.md](../stdio.md) — local checkout / stdio transport only.
- [Development Guide](development.md) — env vars and process flags (developers).
- [API Reference](api-reference.md) — tool catalog (links out for depth).
- [Site API](../site/api/tools.html) — wire descriptions generated from source.
- [Workflow Fidelity](workflow-fidelity.md) — enforcement layers and what the bootstrap procedure protects against.
