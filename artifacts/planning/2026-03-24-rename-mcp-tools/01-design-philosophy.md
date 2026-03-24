# Design Philosophy

**Work Package:** Rename MCP Tools  
**Issue:** [#59](https://github.com/m2ux/workflow-server/issues/59) - MCP tool names overload workflow terminology and lack session management  
**Created:** 2026-03-24

---

## Problem Statement

The workflow-server MCP server exposes two entry-point tools whose names create semantic confusion or fail to reflect their actual purpose:

1. **`get_activities`** returns a dynamic index of workflow activities with `quick_match` patterns for goal-matching. Its purpose is to map user intent to a workflow, but the name uses "activities" — the same term used for phases within a workflow. Agents encountering both `get_activities` (goal-matching index) and `get_activity` (retrieve a specific workflow phase) must disambiguate based on context alone.

2. **`get_rules`** returns global agent behavioral guidelines but provides no session context. The activity index builder hardcodes `get_rules` as the `next_action` after goal-matching, but each call is stateless — the server cannot correlate a sequence of tool invocations into a coherent working session.

### System Context

| Component | Role | File |
|-----------|------|------|
| `get_activities` tool | Goal-matching entry point; calls `readActivityIndex()` | `src/tools/resource-tools.ts:17-30` |
| `get_rules` tool | Returns agent behavioral guidelines via `readRules()` | `src/tools/resource-tools.ts:45-54` |
| Activity index builder | Builds dynamic index; hardcodes `get_rules` as `next_action` | `src/loaders/activity-loader.ts:270-283` |
| `discover_resources` tool | References `get_activities` in discovery output | `src/tools/resource-tools.ts:154-155` |
| Server registration log | Lists all tool names | `src/server.ts:22` |
| Test suite | Tests `get_activities` tool | `tests/mcp-server.test.ts:170-172` |

Documentation references: `README.md`, `SETUP.md`, `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`, `.cursor/rules/workflow-server.mdc`

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — naming confusion leads to agent errors during workflow discovery |
| Scope | All agents consuming this MCP server; all documentation and IDE configurations |
| Business Impact | Reduced agent reliability; inability to correlate operations across a session |

---

## Problem Classification

**Type:** Specific Problem — Cause Known

The root cause is directly attributable to naming choices. `get_activities` was inherited from a prior rename (`get_intents` → `get_activities`, see `.engineering/history/2026-01-22`), and the same overloading problem has resurfaced with the current term. For `get_rules`, the lack of session management is a known design gap — the tool was built as a stateless rule-fetcher with no provision for session identity.

**Subtype:**
- [x] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

- The `match_goal` rename is mechanical: update tool name, description, audit log tag, test references, and documentation across ~10 files.
- The `start_session` replacement adds new behavior: session token generation and inclusion in the response. However, the user specified no persistent storage for v1, bounding the scope.
- The total changeset is confined to two tool definitions, their internal references, and documentation. No architectural changes, new modules, or schema modifications to the workflow data model are needed.

---

## Workflow Path Decision

**Selected Path:** Elicitation only (skip research)

**Activities Included:**
- [x] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis (implicit in plan-prepare)
- [x] Plan & Prepare

**Rationale:** The user selected elicitation to clarify requirements before implementation. While the rename itself is straightforward, the `start_session` tool introduces a new session token concept with open design questions: token format, lifecycle, how subsequent tools consume it, and what the server does with it. Elicitation will surface and resolve these questions before planning begins.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Backward Compatibility | Breaking change — consumers referencing `get_activities` and `get_rules` must update configurations |
| Session Storage | No persistent session storage for v1; in-memory or stateless token only |
| Scope | Only the two entry-point tools change; all other tools remain unchanged |
| Data Model | Workflow data model (activities, skills, steps) is unaffected |
| Dependencies | Underlying loaders (`readActivityIndex`, `readRules`) remain functionally unchanged |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| No "activity" overloading | Goal-matching tool name does not contain "activity/activities" | Tool named `match_goal` |
| Session token returned | Bootstrap tool response includes a session token | Token present in `start_session` response |
| Rules still returned | Bootstrap tool response includes agent behavioral guidelines | Rules content identical to current `get_rules` output |
| All references updated | No remaining references to old tool names in source, tests, or docs | Zero hits for `get_activities`/`get_rules` in codebase (excluding history) |
| Tests pass | Existing test suite passes after changes | `npm test` exits 0 |

---

## Notes

- The activity index builder (`readActivityIndex`) currently hardcodes `tool: 'get_rules'` as `next_action`. This must change to `start_session`.
- The `discover_resources` tool outputs `tool: 'get_activities'` in its discovery payload. This must change to `match_goal`.
- Historical files in `.engineering/history/` should not be modified — they are records of past work.
- The `get_activity` tool (singular) is unrelated to this rename and should remain unchanged.
- Elicitation should clarify: session token format, whether subsequent tools validate the token, and what server-side behavior (if any) the token enables.
