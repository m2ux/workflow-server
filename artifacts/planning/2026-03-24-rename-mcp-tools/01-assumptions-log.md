# Assumptions Log

**Work Package:** Rename MCP Tools  
**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59)  
**Created:** 2026-03-24  
**Last Updated:** 2026-03-24 (implementation analysis)

---

## Summary

| # | Category | Assumption | Resolvability | Status | Resolution |
|---|----------|-----------|---------------|--------|------------|
| A-PI-1 | Problem Interpretation | Rename scope limited to source, tests, and docs on main branch | Code-analyzable | Invalidated | Workflow data files (.toon) in the workflows worktree also reference both tool names (17 occurrences across 9 files) |
| A-PI-2 | Problem Interpretation | Loader interfaces (`readActivityIndex`, `readRules`) don't need changes | Code-analyzable | Validated | Loaders return domain objects; tool handlers wrap them. `start_session` can call `readRules()` and augment the response with a token without changing the loader interface. |
| A-PI-3 | Problem Interpretation | `get_activity` (singular) is unrelated and unchanged | Code-analyzable | Validated | `get_activity` retrieves a specific workflow phase by ID — entirely different purpose from the goal-matching index. |
| A-CA-1 | Complexity Assessment | Session token is a simple UUID with no server-side storage | Stakeholder-dependent | Resolved | User chose structured token format: `wfs_<timestamp>_<uuid-short>`. No server-side storage confirmed. |
| A-CA-2 | Complexity Assessment | Backward compatibility is not required (breaking change acceptable) | Stakeholder-dependent | Resolved | User confirmed clean break — no aliases, no transition period. |
| A-CA-3 | Complexity Assessment | Changeset limited to ~10 files | Code-analyzable | Invalidated | Including workflow data files and session_token additions, total is ~22+ files across two git contexts. |
| A-WP-1 | Workflow Path | Workflow data files (.toon) in workflows worktree are in scope | Stakeholder-dependent | Resolved | User confirmed: include all .toon files for atomic consistency. |
| A-WP-2 | Workflow Path | No external consumers exist beyond repo files | Stakeholder-dependent | Resolved | External consumers exist: Cursor IDE rules in other projects. Out of scope to update them; they update their own rules after this ships. |
| A-CA-4 | Complexity Assessment | Subsequent tools need a `session_token` parameter | Stakeholder-dependent | Resolved | User chose `required-param` — all tools except match_goal, start_session, and health_check must require session_token. 14 tools affected. |
| A-RI-1 | Requirement Interpretation | `health_check` is exempt from session_token requirement | Code-analyzable | Validated | health_check is a server health probe (uptime, workflow count) — not a workflow operation. Requiring a session token would prevent basic health monitoring. |
| A-RI-2 | Requirement Interpretation | Session token validation is format-only, not registry-based | Implicit Requirement | Open | User chose "required-param" but scope excludes server-side session registry. Format validation (regex) cannot verify a token was actually issued by start_session. A well-formed but fabricated token would pass. Acceptable for v1 per "no server-side session registry" scope exclusion. |
| A-RI-3 | Requirement Interpretation | Token format uses Unix epoch seconds and first 8 hex chars of UUID | Implicit Requirement | Open | Specific format `wfs_<unix-epoch-seconds>_<8-hex-chars>` assumed from user's choice of "structured token." Exact field lengths not explicitly stated. |
| A-RI-4 | Scope Boundaries | `discover_resources` should also be exempt from session_token | Code-analyzable | Invalidated | discover_resources is a data-access tool (lists all workflows, resources, skills), not a discovery entry point like match_goal. It should require session_token like other data-access tools. |
| A-RI-5 | Scope Boundaries | Workflows worktree changes committed to current branch (prism-pipeline-modes-v2) | Code-analyzable | Validated | The worktree is on `prism-pipeline-modes-v2` and pushes to `origin`. Tool name changes in .toon files can be committed to this branch. |
| A-RI-6 | Implicit Requirements | withAuditLog wrapper needs modification to log session_token | Code-analyzable | Invalidated | `withAuditLog` already logs all `parameters` as a Record. Since session_token is a tool parameter, it automatically appears in audit logs. No wrapper changes needed. |
| A-IA-1 | Current Behavior | withAuditLog wrapper doesn't need changes for session logging | Code-analyzable | Validated | Logs all parameters automatically — session_token will appear in audit output |
| A-IA-2 | Dependency Understanding | No Zod schema changes needed for state persistence of session tokens | Code-analyzable | Validated | `variables` is `z.record(z.unknown())` — session_token can be stored as `variables.session_token` |
| A-IA-3 | Gap Identification | Shared `sessionTokenParam` can be spread into tool schemas | Code-analyzable | Validated | Zod's `z.object()` accepts spread for composition |
| A-IA-4 | Current Behavior | `start_session` returns token + rules; orchestrator handles state persistence | Stakeholder-dependent | Open | User said "stored in state file" — existing pattern is for orchestrators to call `save_state`. Clarification needed: does `start_session` write to state file directly, or does orchestrator handle it? |
| A-IA-5 | Current Behavior | `crypto.randomUUID()` available in Node.js runtime | Code-analyzable | Validated | Available via `node:crypto` import (stable since Node.js 19+; this project targets Node.js 18+, where it's available via import) |

---

## Detail

### A-PI-1: Rename scope limited to source, tests, and docs (INVALIDATED)

**Initial assumption:** The rename only touches TypeScript source files, test files, and markdown documentation on the main branch.

**Evidence:** `grep -rn` across the `workflows/` worktree found 17 references to `get_activities` or `get_rules` in `.toon` skill and workflow definition files:

| File | Tool Referenced | Count |
|------|----------------|-------|
| `workflows/meta/skills/00-activity-resolution.toon` | `get_activities` | 4 |
| `workflows/meta/skills/04-orchestrate-workflow.toon` | `get_rules` | 1 |
| `workflows/meta/skills/05-execute-activity.toon` | `get_rules` | 2 |
| `workflows/meta/workflow.toon` | `get_activities` | 1 |
| `workflows/substrate-node-security-audit/skills/02-execute-sub-agent.toon` | `get_rules` | 2 |
| `workflows/substrate-node-security-audit/skills/04-dispatch-sub-agents.toon` | `get_rules` | 1 |
| `workflows/cicd-pipeline-security-audit/skills/04-dispatch-scanners.toon` | `get_rules` | 4 |
| `workflows/cicd-pipeline-security-audit/skills/08-execute-sub-agent.toon` | `get_rules` | 2 |
| `workflows/cicd-pipeline-security-audit/workflow.toon` | `get_rules` | 1 |

### A-PI-2: Loader interfaces unchanged (VALIDATED)

**Evidence:** `readActivityIndex()` returns `Result<ActivityIndex, ActivityNotFoundError>` and `readRules()` returns `Result<Rules, RulesNotFoundError>`. The `start_session` tool handler can call `readRules()` identically and compose the response with an added session token field.

### A-PI-3: get_activity (singular) is unrelated (VALIDATED)

**Evidence:** `get_activity` (defined at `resource-tools.ts:32-41`) takes an `activity_id` parameter and calls `readActivity()`. Different purpose from the goal-matching index.

### A-CA-1 through A-CA-4, A-WP-1, A-WP-2: Resolved via elicitation

All stakeholder-dependent assumptions from the design-philosophy phase were resolved through agent-led elicitation. See elicitation log in `02-requirements-elicitation.md`.

### A-RI-1: health_check exemption (VALIDATED)

**Evidence:** `health_check` (`workflow-tools.ts:49-53`) returns `{ status, server, version, workflows_available, uptime_seconds }`. It's a stateless probe for server liveness. Requiring a session token would prevent monitoring tools from checking server health without first establishing a workflow session.

### A-RI-4: discover_resources exemption (INVALIDATED)

**Initial assumption:** `discover_resources` should be exempt from session_token like match_goal.

**Evidence:** `discover_resources` (`resource-tools.ts:144-195`) lists all workflows, resources, and skills — it's a comprehensive data-access tool, not a bootstrap entry point. Unlike `match_goal` (which agents call before having a session), `discover_resources` is called during workflow exploration when a session should already be active. It should require session_token.

### A-RI-5: Workflows worktree branch (VALIDATED)

**Evidence:** `git branch --show-current` in `workflows/` returns `prism-pipeline-modes-v2`. `git remote get-url origin` returns the same repo. Tool name changes in TOON content strings can be committed to this branch.

### A-RI-6: withAuditLog wrapper changes (INVALIDATED)

**Initial assumption:** The `withAuditLog` wrapper needs modification to separately log session_token.

**Evidence:** `withAuditLog<T>` in `logging.ts:8` accepts `(params: T)` and logs `parameters: params` as the full parameter record. Since session_token will be a regular tool parameter, it automatically appears in the audit log JSON under `parameters.session_token`. No wrapper modification needed.

---

## Remaining Open Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A-RI-2 | Format-only validation is sufficient for v1 | A fabricated well-formed token would pass validation. Acceptable tradeoff per scope exclusion of server-side registry. |
| A-RI-3 | Token format: `wfs_<unix-epoch-seconds>_<8-hex-chars>` | If user intended different field lengths or timestamp format, the generator and validator need adjustment. Low risk — easily changed during implementation. |
| A-IA-4 | `start_session` returns token; orchestrator persists via `save_state` | If user intended `start_session` to write directly to state file, the tool needs a `planning_folder_path` parameter. Current separation of concerns favors orchestrator-managed persistence. |
