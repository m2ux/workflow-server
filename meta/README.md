# Meta Workflow

> v5.2.0 — Top-level lifecycle workflow for the workflow-server. Bootstrap navigates here directly. The meta session runs five activities that identify a target client workflow, match any saved session, create or resume the client session as a child of meta, resolve target_path, drive the client workflow's activity loop and mediate its checkpoint yields, and close out. Provides the universal technique repository for all client workflows.

---

## Overview

The meta workflow is the structural home for the orchestration logic that used to live in technique prose. Every meta activity runs in the meta session as a real activity with formal steps (each binding a technique operation via `step.technique`), checkpoints, transitions, and — for `dispatch-client-workflow` — a `while` loop. Universal techniques live under [techniques/](techniques/) and are auto-resolved for any client workflow via the loader's workflow-local → `meta` fallback.

**Key characteristics:**

- Excluded from `list_workflows` — not a user-facing workflow.
- Bootstrap (resource [`bootstrap-protocol`](./resources/bootstrap-protocol.md)) calls `start_session({ workflow_id: "meta", agent_id: "orchestrator" })` directly and saves the returned `session_index`. There is no separate START / RESUME branching in bootstrap — `discover-session` owns target identification and saved-session matching.
- Universal techniques resolve for any session via the loader's workflow-local → `meta` fallback chain.
- State persistence is server-managed. Every authenticated tool call atomically writes `session.json` + `.session-token` (seal) into the planning folder, so there are no agent-side persist or restore steps.

| # | Activity | Role |
|---|----------|------|
| 00 | [**Discover Session**](./activities/README.md#00-discover-session) | Identify the target client workflow and surface any saved session to resume |
| 01 | [**Initialize Session**](./activities/README.md#01-initialize-session) | Give the work package a stable identity and create or resume the client session as a child of meta |
| 02 | [**Resolve Target**](./activities/README.md#02-resolve-target) | Detect the repo structure (regular vs. submodule monorepo) and resolve `target_path` |
| 03 | [**Dispatch Client Workflow**](./activities/README.md#03-dispatch-client-workflow) | Drive the client workflow end to end inline, mediating its checkpoints with the user |
| 04 | [**End Workflow**](./activities/README.md#04-end-workflow) | Verify the client workflow's outcomes, summarise the session, and confirm closure |

**Detailed documentation:**

- **Activities:** see [activities/README.md](./activities/README.md) for the role each activity plays and links to its authoritative definition.
- **Techniques:** see [techniques/](./techniques/) for the universal techniques and the rule-authority map (the [`agent-conduct`](./techniques/agent-conduct.md) technique is the single source of truth for cross-cutting rules).
- **Resources:** see [resources/README.md](./resources/README.md) for the bootstrap protocol and prompt templates.

---

## Workflow Flow

```mermaid
graph TD
    startNode(["Bootstrap"]) -->|"start_session(workflow_id: meta)"| DS["00 discover-session"]
    DS -->|"target_workflow_id, has_saved_state, is_resuming"| INI["01 initialize-session"]
    INI -->|"client_session_index, client_planning_slug"| RT["02 resolve-target"]
    RT -->|"target_path"| DSP["03 dispatch-client-workflow"]
    DSP -->|"current_activity == null"| END["04 end-workflow"]
    END -.->|"abort_completion == true"| DSP
    END --> doneNode(["Session closed"])
```

---

## Hierarchical Orchestration Model

The workflow-server implements a hierarchical orchestration model. Meta runs as the meta-orchestrator (user-facing); the client session is created as a child of the meta session. During `dispatch-client-workflow`, the meta-orchestrator drives the client workflow's activity loop **inline** — it dispatches each activity-worker directly via `dispatch-activity` using the `client_session_index`, rather than spawning a separate persistent client orchestrator. The activity-worker runs with the same `session_index` as the client session. The server snapshots parent context recursively under the child session's `parentSession` field on creation.

```mermaid
sequenceDiagram
    participant User
    participant Meta as meta-orchestrator<br/>(meta session)
    participant Worker as activity-worker<br/>(client_session_index)

    User->>Meta: "start work-package on issue 42"
    Note over Meta: Bootstrap → start_session(workflow_id: meta, agent_id: orchestrator)
    Meta->>Meta: 00 discover-session<br/>(list-workflows, match-target, scan-saved-sessions, match-saved-session)
    Meta->>Meta: 01 initialize-session<br/>(initialize-folder → create-session(parent_session_index, workflow_id, planning_slug))
    Meta->>Meta: 02 resolve-target<br/>(detect-repo-type, list-submodules)

    Note over Meta: 03 dispatch-client-workflow — prime-initial-activity, then client-activity-loop (while current_activity != null)
    loop client-activity-loop
        Meta->>Worker: dispatch-activity(activity_id, client_session_index, activity-worker-prompt)
        alt worker yielded a checkpoint
            Worker-->>Meta: checkpoint_pending
            Meta->>Meta: present-checkpoint-to-user(client_session_index)
            Meta->>User: AskQuestion (presents checkpoint)
            User->>Meta: selects option
            Meta->>Meta: respond-checkpoint(client_session_index, user_selection)
        else activity complete
            Worker-->>Meta: activity_complete
            Meta->>Meta: commit-and-persist(activity_id, planning_folder_path, target_path)
            Meta->>Meta: evaluate-transition → next current_activity
        end
    end
    Note over Meta: current_activity == null → exit loop

    Meta->>Meta: 04 end-workflow<br/>(verify-outcomes, generate-summary)
    Meta->>User: completion checkpoint
```

---

## Techniques and the cross-workflow shared layer

The `meta/techniques/` and `meta/resources/` folders carry double duty. They
are the local content for the meta workflow itself AND the cross-workflow
shared layer — when any workflow asks for a technique that has no
workflow-local definition, the loader resolves it from `meta/techniques/`.
The ontology and section conventions every technique follows are defined in
[`meta/resources/workflow-canonical.md`](./resources/workflow-canonical.md).

Markdown techniques live under [`meta/techniques/`](techniques/). A standalone
technique is a single `<slug>.md` file; a grouped technique is a `<group>/`
folder containing `TECHNIQUE.md` (the index/base contract) plus one `<op>.md`
per operation, each addressed `<group>::<op>`. The
[`meta/techniques/TECHNIQUE.md`](techniques/TECHNIQUE.md) root base contract
is inherited by every meta technique.

---

## Techniques

Universal techniques referenced by canonical ID (the file/folder slug).

| Technique | Capability |
|-----------|------------|
| [`workflow-engine`](techniques/workflow-engine/TECHNIQUE.md) | Operations and rules for workflow execution — session lifecycle, activity dispatch, transition evaluation, checkpoint protocol. Server-managed state (no agent-side persist/restore). |
| [`agent-conduct`](techniques/agent-conduct.md) | Cross-cutting behavioural boundaries — single source of truth for file sensitivity, communication tone, attribution, code commentary, operational discipline, checkpoint discipline (worker / workflow-orchestrator / meta-orchestrator role split), and orchestrator discipline (`no-domain-work`, `no-inline-on-resume`, `target-path-scope`, `automatic-transitions`, `no-ad-hoc-interaction`) |
| [`version-control`](techniques/version-control/TECHNIQUE.md) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows |
| [`github-cli-protocol`](techniques/github-cli-protocol/TECHNIQUE.md) | GitHub CLI usage with GraphQL-deprecation workarounds — REST API for mutations |
| [`knowledge-base-search`](techniques/knowledge-base-search/TECHNIQUE.md) | Optimised concept-rag searches via pre-indexed domain maps |
| [`atlassian-operations`](techniques/atlassian-operations/TECHNIQUE.md) | Atlassian Jira and Confluence operations via the Atlassian MCP server |
| [`gitnexus-operations`](techniques/gitnexus-operations/TECHNIQUE.md) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor |
| [`cargo-operations`](techniques/cargo-operations/TECHNIQUE.md) | Resource-constrained cargo subcommands (build, check, clippy, test, fmt, doc, preflight) with an inline resource budget |
| [`harness-compat`](techniques/harness-compat/TECHNIQUE.md) | Harness-independent operations (`spawn-agent`, `continue-agent`, `spawn-concurrent`) abstracting cross-tool dispatch |

> Cross-cutting rules live in `agent-conduct`. Capability techniques (`workflow-engine`, `version-control`, etc.) reference but do not restate them. This is the single-source-of-truth boundary anti-pattern 27 calls for.

---

## Resources

| Resource ID | Resource | Purpose |
|-------------|----------|---------|
| `bootstrap-protocol` | [Bootstrap Protocol](./resources/bootstrap-protocol.md) | Pre-session navigation primer — load schemas, then `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. The meta workflow does the rest. |
| `activity-worker-prompt` | [Activity Worker Prompt](./resources/activity-worker-prompt.md) | Template prompt for spawning an activity-worker sub-agent (substitutes `session_index`). |
| `workflow-orchestrator-prompt` | [Workflow Orchestrator Prompt](./resources/workflow-orchestrator-prompt.md) | Template prompt for spawning a workflow-orchestrator sub-agent (substitutes `session_index`). |
| `session-summary-template` | [Session Summary Template](./resources/session-summary-template.md) | Skeleton for the markdown session summary composed by `generate-summary` at workflow close. |

> The on-disk session-state shape is defined by [`schemas/session-file.schema.json`](../../schemas/session-file.schema.json); see [`docs/state_management_model.md`](../../docs/state_management_model.md) for the persistence model.

---

## Outputs

Meta itself produces no domain artefacts. Its outputs are session-state side-effects:

- A meta session that lives for the duration of the user's request.
- A child client session for the matched workflow, tracked alongside the meta session via the recursive `parentSession` snapshot the server captures inside the child's `session.json`.
- A planning folder under `.engineering/artifacts/planning/` containing the client workflow's server-managed `session.json` + `.session-token` (seal) pair and downstream artifacts.
- A session summary presented to the user at the completion checkpoint.

---

## File Structure

```
workflows/meta/
├── workflow.yaml                            # Meta workflow definition (16 variables, 3 rules)
├── README.md                                # This file
├── activities/
│   ├── 00-discover-session.yaml             # Match user request, scan saved sessions
│   ├── 01-initialize-session.yaml           # Create or resume the client session
│   ├── 02-resolve-target.yaml               # Detect repo type, set target_path
│   ├── 03-dispatch-client-workflow.yaml     # Drive the client activity loop (while current_activity != null)
│   └── 04-end-workflow.yaml                 # Outcome verification, summary
├── techniques/
│   ├── TECHNIQUE.md                         # Root base contract (inherited by every meta technique)
│   ├── agent-conduct.md                     # Cross-cutting rules (single source of truth)
│   ├── variable-binding.md                  # Strategy technique — bind step inputs/outputs to variables
│   ├── scatter-gather.md                    # Strategy technique — forEach fan-out / gather
│   ├── workflow-engine/                     # Session lifecycle, dispatch, transitions, checkpoint protocol
│   │   ├── TECHNIQUE.md                     #   group index / base contract
│   │   └── {op}.md                          #   one file per operation (create-session, dispatch-activity, ...)
│   ├── version-control/
│   │   ├── TECHNIQUE.md
│   │   └── {op}.md
│   ├── github-cli-protocol/
│   ├── knowledge-base-search/
│   ├── atlassian-operations/
│   ├── gitnexus-operations/
│   ├── cargo-operations/
│   └── harness-compat/
└── resources/
    ├── README.md                            # Resource index
    ├── bootstrap-protocol.md                # Pre-session navigation primer
    ├── activity-worker-prompt.md
    ├── workflow-orchestrator-prompt.md
    ├── session-summary-template.md
    ├── workflow-canonical.md                # Ontology / section conventions
    └── gitnexus-reference.md
```
