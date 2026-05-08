# Meta Workflow Skills

> Part of the [Meta Workflow](../README.md)

12 universal skills referenced by canonical ID. Numeric prefixes order the files for humans; the loader strips them. Cross-cutting rules live in [`agent-conduct`](#01--agent-conduct) — per-role skills reference but never restate them.

---

## Skill Index

| # | Skill ID | Capability | Used By |
|---|----------|------------|---------|
| 00 | [`session-protocol`](00-session-protocol.toon) | Session token mechanics, checkpoint-handle discipline, step manifests, resource-loading conventions | Universal — referenced by every orchestrator and worker |
| 01 | [`agent-conduct`](01-agent-conduct.toon) | Cross-cutting behavioural rules — file sensitivity, communication tone, attribution prohibition, code commentary, operational discipline, checkpoint discipline, orchestrator discipline | Universal — single source of truth for cross-role rules |
| 02 | [`state-management`](02-state-management.toon) | Concept reference for variable mutation, persist-after-activity invariant, adopted/recovered semantics. State I/O via `save_state` / `restore_state` MCP tools | [Initialize Session](../activities/README.md#01-initialize-session), [End Workflow](../activities/README.md#04-end-workflow), workflow-orchestrator engine |
| 03 | [`version-control`](03-version-control.toon) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows | [Initialize Session](../activities/README.md#01-initialize-session); workflow-orchestrator `commit-artifacts` hook |
| 04 | [`github-cli-protocol`](04-github-cli-protocol.toon) | GitHub CLI usage with GraphQL-deprecation workarounds — REST API for mutations | Client workflows that interact with GitHub PRs/issues |
| 05 | [`knowledge-base-search`](05-knowledge-base-search.toon) | Optimised concept-rag searches via pre-indexed domain maps | Client workflows that query the knowledge base |
| 06 | [`atlassian-operations`](06-atlassian-operations.toon) | Atlassian Jira and Confluence operations via the Atlassian MCP server | Client workflows that interact with Atlassian |
| 07 | [`gitnexus-operations`](07-gitnexus-operations.toon) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor | Client workflows performing codebase analysis |
| 08 | [`meta-orchestrator`](08-meta-orchestrator.toon) | Inline meta-workflow role: checkpoint mediation rules, sub-agent dispatch, meta-level error recovery. Activity protocols live in activity TOON files | [Dispatch Client Workflow](../activities/README.md#03-dispatch-client-workflow), [End Workflow](../activities/README.md#04-end-workflow) |
| 09 | [`activity-worker`](09-activity-worker.toon) | Engine logic for the activity-worker role: bootstrap, step iteration, checkpoint yielding, artifact production | Primary skill for every activity in every workflow |
| 10 | [`workflow-orchestrator`](10-workflow-orchestrator.toon) | Engine logic for driving a client workflow: doWhile-over-activities, transition evaluation, persist hooks | Spawned by meta's dispatch-client-workflow activity for each client workflow |
| 11 | [`harness-compat`](11-harness-compat.toon) | Harness-independent operations (`spawn-agent`, `continue-agent`, `spawn-concurrent`) abstracting cross-tool dispatch | [Dispatch Client Workflow](../activities/README.md#03-dispatch-client-workflow) and the workflow-orchestrator engine |

---

## Rule-Authority Map

To honour anti-pattern 27 (single source of truth), each rule lives in exactly one skill. The map below shows where each cross-cutting rule is defined and which skills depend on it.

| Rule | Defined in | Referenced by |
|------|-----------|---------------|
| `file-sensitivity` | `agent-conduct` | All roles |
| `communication-tone` | `agent-conduct` | All roles |
| `attribution-prohibition` | `agent-conduct` | All roles |
| `code-commentary` | `agent-conduct` | All roles |
| `operational-discipline` | `agent-conduct` | All roles |
| `checkpoint-discipline` (worker / orchestrator / meta role split) | `agent-conduct` | All checkpoint participants |
| `orchestrator-discipline` (`no-domain-work`, `target-path-scope`, `automatic-transitions`, `no-ad-hoc-interaction`) | `agent-conduct` | `meta-orchestrator`, `workflow-orchestrator` |
| `no-auto-resolution`, `present-before-respond`, `no-option-hallucination`, `checkpoint-token-discipline`, `reject-empty-checkpoints`, `advisory-checkpoint-timing` | `meta-orchestrator` | meta only |
| `no-direct-interaction`, `no-get-activity`, `no-pre-load-skills`, `reject-empty-checkpoints` | `workflow-orchestrator` | sub-agent only |
| `no-continuation-after-yield`, `no-start-session`, `skill-operation-notation` | `activity-worker` | worker only |
| `token-management`, `step-manifests`, `resource-usage`, `validation` | `session-protocol` | All token-passing roles |
| `read-agents-md`, `no-destructive-ops`, `no-hook-skipping`, `explicit-commit`, `conventional-commits` | `version-control` | Orchestrators producing artefacts |
| `commit-after-activity`, `persist-after-every-activity` | `workflow-engine` (under `commit-and-persist`) | Workflow orchestrators at activity boundaries |

---

## Resource References

Skills declare lightweight `_resources` arrays that resolve to markdown reference docs:

| Skill | Resources |
|-------|-----------|
| `session-protocol` | [`bootstrap-protocol`](../resources/00-bootstrap-protocol.md) |
| `state-management` | [`workflow-state-format`](../resources/05-workflow-state-format.md) |
| `atlassian-operations` | [`atlassian-tools`](../resources/04-atlassian-tools.md) |
| `gitnexus-operations` | [`gitnexus-reference`](../resources/03-gitnexus-reference.md) |
| `meta-orchestrator` | [`workflow-orchestrator-prompt`](../resources/02-workflow-orchestrator-prompt.md) |
| `activity-worker` | [`workflow-state-format`](../resources/05-workflow-state-format.md) |
| `workflow-orchestrator` | [`activity-worker-prompt`](../resources/01-activity-worker-prompt.md), [`workflow-state-format`](../resources/05-workflow-state-format.md) |
