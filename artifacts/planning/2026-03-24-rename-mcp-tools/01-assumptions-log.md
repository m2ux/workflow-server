# Assumptions Log

**Work Package:** Rename MCP Tools  
**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59)  
**Created:** 2026-03-24  
**Last Updated:** 2026-03-24

---

## Summary

| # | Category | Assumption | Resolvability | Status | Resolution |
|---|----------|-----------|---------------|--------|------------|
| A-PI-1 | Problem Interpretation | Rename scope limited to source, tests, and docs on main branch | Code-analyzable | Invalidated | Workflow data files (.toon) in the workflows worktree also reference both tool names (17 occurrences across 9 files) |
| A-PI-2 | Problem Interpretation | Loader interfaces (`readActivityIndex`, `readRules`) don't need changes | Code-analyzable | Validated | Loaders return domain objects; tool handlers wrap them. `start_session` can call `readRules()` and augment the response with a token without changing the loader interface. |
| A-PI-3 | Problem Interpretation | `get_activity` (singular) is unrelated and unchanged | Code-analyzable | Validated | `get_activity` retrieves a specific workflow phase by ID — entirely different purpose from the goal-matching index. |
| A-CA-1 | Complexity Assessment | Session token is a simple UUID with no server-side storage | Stakeholder-dependent | Open | User mentioned this preference in the work package description but it needs confirmation during elicitation. The server already has `save_state`/`restore_state` for state persistence — session could optionally build on that pattern. |
| A-CA-2 | Complexity Assessment | Backward compatibility is not required (breaking change acceptable) | Stakeholder-dependent | Open | Old tool names will simply stop existing. Consumers must update. Needs user confirmation. |
| A-CA-3 | Complexity Assessment | Changeset limited to ~10 files | Code-analyzable | Invalidated | Including workflow data files, the total is ~20+ files across two git contexts (main branch source + workflows worktree). |
| A-WP-1 | Workflow Path | Workflow data files (.toon) in workflows worktree are in scope for this work package | Stakeholder-dependent | Open | The workflows directory is a separate git worktree (currently on `prism-pipeline-modes-v2` branch). Modifying it requires a separate commit workflow. User needs to confirm this is in scope. |
| A-WP-2 | Workflow Path | No external consumers exist beyond repo files | Stakeholder-dependent | Open | There may be other repos, agent configurations, or MCP client rules that reference `get_activities` or `get_rules`. |
| A-CA-4 | Complexity Assessment | Subsequent tools need a `session_token` parameter | Stakeholder-dependent | Open | If `start_session` returns a token, do tools like `get_workflow`, `get_workflow_activity`, etc. need to accept and validate it? This would significantly expand the changeset. Needs clarification during elicitation. |

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

**Impact:** The workflows worktree has its own git context (currently on branch `prism-pipeline-modes-v2`). Changes there require a separate commit/push cycle and coordination.

### A-PI-2: Loader interfaces unchanged (VALIDATED)

**Evidence:** `readActivityIndex()` returns `Result<ActivityIndex, ActivityNotFoundError>` and `readRules()` returns `Result<Rules, RulesNotFoundError>`. The `start_session` tool handler can call `readRules()` identically and compose the response with an added session token field. No loader signature changes needed.

### A-PI-3: get_activity (singular) is unrelated (VALIDATED)

**Evidence:** `get_activity` (defined at `resource-tools.ts:32-41`) takes an `activity_id` parameter and calls `readActivity()` to load a specific workflow phase. It serves a completely different purpose from the goal-matching index tool.

### A-CA-3: Changeset limited to ~10 files (INVALIDATED)

**Revised count:**

| Category | Files | Count |
|----------|-------|-------|
| Source (main branch) | `resource-tools.ts`, `activity-loader.ts`, `server.ts` | 3 |
| Tests (main branch) | `mcp-server.test.ts` | 1 |
| Documentation (main branch) | `README.md`, `SETUP.md`, `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`, `.cursor/rules/workflow-server.mdc` | 6 |
| Workflow data (workflows worktree) | 9 `.toon` files | 9 |
| **Total** | | **19** |

---

## Open Questions for Elicitation

1. **Workflow data scope (A-WP-1):** Should the `.toon` files in the workflows worktree be updated as part of this work package, or handled separately?
2. **Backward compatibility (A-CA-2):** Is a clean break acceptable, or should the old names be kept as aliases during a transition period?
3. **Session token consumption (A-CA-4):** Should subsequent tools (`get_workflow`, `get_workflow_activity`, etc.) accept a `session_token` parameter? Or is the token purely informational for now?
4. **Session token format (A-CA-1):** Simple UUID? Or something with embedded metadata (e.g., timestamp)?
5. **External consumers (A-WP-2):** Are there other repos or agent configurations outside this repository that reference these tool names?
