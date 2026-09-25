# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

## 1. Choose a transport

Complete the transport guide’s install, then return here for the workspace and the verify step.

| Path                              | When | Guide |
|-----------------------------------|------|--------|
| **Docker / HTTP**                 | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

## 2. Initialise Workspace

Follow the [Workspace](https://github.com/m2ux/workflow-server/blob/workspace/README.md) setup instructions.

## 3. Verify

1. Agent calls **`discover`**.
2. Agent calls **`start_session`** with at least `workflow_id` (default `meta`), `agent_id`, and **`working_directory`** as the absolute path of the checkout under work. The server derives `owner/repo` from that origin.
3. You get a **`session_index`** back.
