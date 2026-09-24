# Setup

Install Workflow Server and prepare a target repository so an IDE agent can run workflows.

**Outcome:** server reachable over your chosen transport, target repo registered, bootstrap rule in place, and a verified first session.

## 1. Choose a transport

Complete the transport guide’s install, then return here for §2–§4.

| Path                              | When | Guide |
|-----------------------------------|------|--------|
| **Docker / HTTP**                 | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

## 2. Initialise a target repo

Two steps per project. **2a** deploys engineering into the product repo. **2b** checks that project out under `HOST_PROJECTS_ROOT`.

### 2a. Deploy engineering

A product repository keeps its engineering storage outside this tree. The layouts are [engineering storage](https://github.com/m2ux/workflow-server/blob/workspace/docs/engineering-storage.md).

### 2b. Checkout the project

After deploy, clone or check out the project into the canonical location under
`HOST_PROJECTS_ROOT` (default `~/projects/dev`):

```bash
# HOST_PROJECTS_ROOT from $INSTALL/env (default: ~/projects/dev)
git clone https://github.com/owner/repo.git "$HOST_PROJECTS_ROOT/<repo>"
mkdir -p "$HOST_PROJECTS_ROOT/<repo>/.worktrees"
```

Repeat **2a → 2b** for each product repo.

## 3. Setup Cursor workspace

The kickoff workspace lives on the workspace branch. [IDE setup](https://github.com/m2ux/workflow-server/blob/workspace/docs/ide-setup.md) covers the bootstrap rule and the workspace roots.

## 4. Update Workflows

When workflow definitions change remotely, refresh locally:

```bash
$INSTALL/update-workflows.sh
```

This fast-forwards the corpus at `HOST_WORKFLOWS_DIR` (default `$INSTALL/workflows`)
onto `WORKFLOW_SERVER_WORKFLOWS_BRANCH` (default `workflows`). Product checkouts under
`HOST_PROJECTS_ROOT` are yours to update.
Restart the HTTP server afterward if it is running.

## 5. Verify

1. Agent calls **`discover`**.
2. Agent calls **`start_session`** with at least `workflow_id` (default `meta`), `agent_id`, and **`working_directory`** as the absolute path of the checkout under work. The server derives `owner/repo` from that origin.
3. You get a **`session_index`** back.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Sessions fail while HTTP is up | `/ready` not fully ready | Require `sessionKeyWritable: true` — [http.md](http.md) |
| Every workflow id misses while HTTP is up | Corpus bind points at the wrong tree | Require `corpusServes: true`; compare `corpus.dir` with the bind — [http.md](http.md) |
| Agent skips `discover` | Bootstrap rule missing | Complete §3 |
| Repo / planning path errors | Missing deploy or checkout under `HOST_PROJECTS_ROOT` | Complete §2a then §2b |
| stdio exits at startup | No workspace or repo binding | [stdio.md](stdio.md) — `--workspace` or `--repo` required |

