---
id: bootstrap-protocol
version: 5.0.0
---

# Bootstrap Protocol

The minimal navigation primer for an agent at a blank-slate prompt. Bootstrap exists only to get the agent into the meta workflow's session — the meta workflow's activities then handle target identification, saved-session matching, dispatch, and lifecycle.

## Load TOON schemas

Workflow content (workflows, activities, skills, state) is encoded in TOON. Fetch each schema before doing anything else:

- `workflow-server://schemas/workflow`
- `workflow-server://schemas/activity`
- `workflow-server://schemas/skill`
- `workflow-server://schemas/condition`
- `workflow-server://schemas/state`

Fetching the combined `workflow-server://schemas` is acceptable, but per-schema fetches ensure each is surfaced in the agent's context.

## Enter the meta workflow

1. Call `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. Save the returned `session_token` — every subsequent tool call requires it.
2. Call `get_workflow({ session_token })` to load the meta workflow definition and its primary skill (`meta-orchestrator`).
3. Follow the primary skill's rules and the meta workflow's activities from here.

The meta workflow's first activity (`discover-session`) calls `list_workflows`, matches the user's request against the catalog, scans planning folders for saved client sessions, and presents resume / workflow-selection checkpoints. Bootstrap does NOT perform any of those steps — they live in activity structure.
