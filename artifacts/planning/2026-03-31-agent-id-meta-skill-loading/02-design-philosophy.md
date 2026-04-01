# Design Philosophy — Agent-ID Meta-Skill Loading

## Problem Statement

The workflow server's `get_skills` tool has two related defects that prevent worker agents from receiving complete behavioral context:

1. **Missing meta skills for workers.** When a worker agent enters an activity and calls `get_skills`, only the activity's declared skills (primary + supporting) are returned. Universal/meta skills — session-protocol, agent-conduct, execute-activity, state-management, artifact-management, version-control-protocol — are excluded from the activity scope branch. Workers bootstrap without foundational protocols governing how they should manage artifacts, handle git operations, communicate, or follow session discipline.

2. **Silent failure of cross-workflow resource references.** Skills can declare resource references using `workflow/index` notation (e.g., `meta/05` for the worker-prompt-template from the meta workflow). The `loadSkillResources` function passes the entire string directly to `readResourceStructured`, which attempts to match it as a filename index against the current workflow's resources directory. No file matches, so the resource is silently dropped. Affected skills: `orchestrate-workflow` (meta/05) and `build-comprehension` (meta/04).

### System Understanding

- **Architecture:** MCP server exposing tools (`start_session`, `next_activity`, `get_skills`, etc.) for AI agent workflow orchestration.
- **Execution model:** Orchestrator agent manages transitions; worker sub-agents execute activity steps. Workers call `get_skills` to load behavioral protocols for each activity.
- **Skill taxonomy:** Meta/universal skills define cross-cutting behavioral rules. Activity skills define domain capabilities. Both are needed for correct worker behavior.
- **Session token:** HMAC-signed JWT-like token tracks workflow state (`wf`, `act`, `aid`, `seq`, etc.). The `aid` field exists but was unused before this change.

### Impact Assessment

- **Severity:** Medium — workers functioned because meta skill content was delivered via prompt injection and inherited context, masking the contract violation.
- **Scope:** All worker agents in all workflows. Every `get_skills` call from a worker with an active activity omits meta skills. Cross-workflow resource references fail in any skill that uses the `workflow/index` notation.
- **Risk of inaction:** As the system matures and prompt injection is replaced by server-driven skill loading, workers would lose behavioral protocols entirely.

### Success Criteria

1. `get_skills` accepts optional `agent_id` parameter
2. First call with a new `agent_id` returns meta skills + activity skills
3. Subsequent calls with same `agent_id` return activity skills only (no redundant re-send)
4. `token.aid` is updated on agent_id change
5. Cross-workflow resource prefix (`workflow/index`) resolves correctly
6. Bare index references maintain backward compatibility
7. Tool description updated to document new behavior

### Constraints

- Backward compatibility: omitting `agent_id` must preserve existing behavior
- Token structure: `aid` field already exists — no schema migration needed
- Resource references: bare indices (`05`) must continue resolving from current workflow

---

## Problem Classification

### Type: Specific Problem — Cause Known

Both defects have clearly identifiable root causes:

- **Defect 1 root cause:** The `get_skills` activity scope branch returns only `[activity.skills.primary, ...activity.skills.supporting]` — it never consults the universal skill list when an activity is active.
- **Defect 2 root cause:** `loadSkillResources` passes the full reference string (e.g., `meta/05`) as an index to `readResourceStructured`, which expects a bare numeric index. No prefix parsing exists.

This is not an inventive goal or design exploration — the desired behavior is unambiguous and the implementation path is direct.

### Complexity: Simple

**Rationale:**
- Known root causes with direct fixes
- Changes confined to `src/tools/resource-tools.ts` (primary) with test updates in `tests/mcp-server.test.ts`
- Leverages existing infrastructure (the `aid` token field, existing `listUniversalSkillIds` helper, existing resource resolution pipeline)
- No architectural decisions or trade-offs — the solution extends existing patterns
- Clear acceptance criteria with testable outcomes
- Estimated implementation: ~1.5h agentic + ~30m review

---

## Workflow Path

**Selected path:** Skip optional activities (no elicitation, no research)

**Rationale:**
- The issue is fully specified with clear acceptance criteria
- Root causes are identified and the solution approach is straightforward
- No ambiguity in requirements — the desired behavior is unequivocal
- The implementation touches a small, well-understood surface area
- No design patterns or research needed — this extends existing code patterns

| Variable | Value |
|----------|-------|
| `complexity` | `simple` |
| `needs_elicitation` | `false` |
| `needs_research` | `false` |
| `skip_optional_activities` | `true` |

---

## Design Rationale

### Agent-ID Detection Approach

The solution uses `agent_id` comparison against `token.aid` to detect new worker agents. This was chosen over alternatives:

- **Why not always include meta skills?** Redundant data on every call increases response size and wastes context window. Workers that already have meta skills loaded don't need them again.
- **Why not a separate `get_meta_skills` tool?** Adds API surface complexity. The existing `get_skills` tool is the natural entry point; extending it with agent awareness keeps the API simple.
- **Why `agent_id` parameter instead of auto-detecting from context?** MCP tools don't have inherent caller identity. The agent must declare itself. The token's `aid` field provides server-side state for comparison.

### Resource Reference Prefix

The `workflow/index` notation was chosen over `workflow:index` (originally described in the issue) because the slash separator is more natural for path-like references and avoids ambiguity with Jira-style keys (`PROJ-123`). The implementation uses `parseResourceRef` to split on the first slash.

### Nested Resources

Resources are now bundled directly under each skill's `_resources` field rather than returned as a flat array at the response root. This eliminates index-based cross-referencing and makes each skill self-contained — the consumer doesn't need to correlate resource indices with skill declarations.
