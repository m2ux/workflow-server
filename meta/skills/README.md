# Meta Workflow Skills

> Part of the [Meta Workflow](../README.md)

Universal skills referenced by canonical ID. Numeric prefixes order the files for humans; the loader strips them. Cross-cutting rules live in [`agent-conduct`](01-agent-conduct.toon) — capability skills reference but never restate them.

---

## Skill Index

| # | Skill ID | Capability | Used By |
|---|----------|------------|---------|
| 00 | [`workflow-engine`](00-workflow-engine.toon) | Operations and rules for workflow execution — session lifecycle, activity dispatch, transition evaluation, checkpoint protocol. State persistence is server-managed (atomic `session.json` + `.session-token` seal write on every authenticated tool call); no agent-side persist/restore operations exist. | Meta activities and every client workflow's orchestrator |
| 01 | [`agent-conduct`](01-agent-conduct.toon) | Cross-cutting behavioural rules — file sensitivity, communication tone, attribution prohibition, code commentary, operational discipline, checkpoint discipline, orchestrator discipline | Universal — single source of truth for cross-role rules |
| 02 | [`version-control`](02-version-control.toon) | Planning-folder lifecycle, conventional commits, regular-vs-submodule commit workflows | [Initialize Session](../activities/README.md#01-initialize-session); workflow-orchestrator `commit-and-persist` hook |
| 03 | [`github-cli-protocol`](03-github-cli-protocol.toon) | GitHub CLI usage with GraphQL-deprecation workarounds — REST API for mutations | Client workflows that interact with GitHub PRs/issues |
| 04 | [`knowledge-base-search`](04-knowledge-base-search.toon) | Optimised concept-rag searches via pre-indexed domain maps | Client workflows that query the knowledge base |
| 05 | [`atlassian-operations`](05-atlassian-operations.toon) | Atlassian Jira and Confluence operations via the Atlassian MCP server | Client workflows that interact with Atlassian |
| 06 | [`gitnexus-operations`](06-gitnexus-operations.toon) | Codebase queries via the GitNexus knowledge graph: explore, impact, debug, refactor | Client workflows performing codebase analysis |
| 07 | [`harness-compat`](07-harness-compat.toon) | Harness-independent operations (`spawn-agent`, `continue-agent`, `spawn-concurrent`) abstracting cross-tool dispatch | [Dispatch Client Workflow](../activities/README.md#03-dispatch-client-workflow) and the workflow-orchestrator engine |

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
| `checkpoint-discipline` (worker / workflow-orchestrator / meta-orchestrator role split) | `agent-conduct` | All checkpoint participants |
| `orchestrator-discipline` (`no-domain-work`, `no-inline-on-resume`, `target-path-scope`, `automatic-transitions`, `no-ad-hoc-interaction`) | `agent-conduct` | meta + workflow orchestrators |
| `session-index-passes-on-each-call`, `validation-warnings`, `resource-loading-via-tool` | `workflow-engine` | All authenticated callers |
| `no-option-hallucination` | `workflow-engine` (under `respond-checkpoint`) | meta only |
| `read-agents-md`, `no-destructive-ops`, `no-hook-skipping`, `explicit-commit`, `conventional-commits` | `version-control` | Orchestrators producing artefacts |

---

## Resource References

Skills declare lightweight `_resources` arrays that resolve to markdown reference docs:

| Skill | Resources |
|-------|-----------|
| `workflow-engine` | [`bootstrap-protocol`](../resources/bootstrap-protocol.md), [`activity-worker-prompt`](../resources/activity-worker-prompt.md), [`workflow-orchestrator-prompt`](../resources/workflow-orchestrator-prompt.md) |

> State persistence is server-managed; there is no `workflow-state-format` resource. The on-disk shape is defined by [`schemas/session-file.schema.json`](../../../schemas/session-file.schema.json) and described in [`docs/state_management_model.md`](../../../docs/state_management_model.md).
