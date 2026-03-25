# Assumptions Log: Resource Utilization Fix

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Date:** 2026-03-25

---

## Design-Philosophy Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A1 | No external clients consume `get_skill` response shape directly (only agents via TOON instructions) | Code-analyzable | Code-analyzable | Validated | Server is an MCP tool server; agents receive JSON text content. No SDK client or typed interface depends on `get_skill` returning a flat skill object. Response is `JSON.stringify`'d into `content[0].text`. |
| A2 | The `_resources` field collision with skill's `resources` array is the sole reason for the underscore prefix | Code-analyzable | Code-analyzable | Validated | `resource-tools.ts:128` — `{ ...result.value, _resources: resources }` spreads the skill (which has `resources: string[]`) and adds `_resources` to avoid collision. `get_skills` doesn't have this problem because resources are at a separate top level. |
| A3 | Restructuring `get_skill` to return `{ skill: {...}, resources: {...} }` will not break existing tests | Code-analyzable | Code-analyzable | Partially Validated | `mcp-server.test.ts:238-239` — test asserts `skill.id === 'create-issue'` on the parsed response, which accesses the flat skill shape. Lines 252-253 assert `skill._resources` exists. Both tests must be updated to use the new `{ skill, resources }` structure. The changes are mechanical (2 test updates). |
| A4 | All ~30 "Load resource" instances in TOON files can be mechanically updated without semantic changes | Code-analyzable | Code-analyzable | Validated | Grep confirmed all instances follow the pattern "Load resource NN (name) for..." — the replacement "Use attached resource NN..." is a language change, not a logic change. No conditional logic depends on these strings. |
| A5 | The `note_resources` tool entries serve no purpose once a global rule is added to `rules.toon` | Stakeholder-dependent | Stakeholder | Open | User may prefer keeping `note_resources` as a redundant safety net in skills. Need to confirm removal is acceptable. |
| A6 | `get_skills` (batch) is the primary tool agents use at activity bootstrap; `get_skill` is used for per-step skill references | Code-analyzable | Code-analyzable | Validated | `execute-activity.toon` bootstrap-skill protocol explicitly says: "Call get_skills to load all skills and resources at once." `get_skill` is used only "for per-step skill references" per the rules section. |
| A7 | Changing the response structure of `get_skill` does not affect `get_skills` (they are independent handlers) | Code-analyzable | Code-analyzable | Validated | `resource-tools.ts:49-96` (get_skills) and `resource-tools.ts:98-136` (get_skill) are independent `server.tool()` registrations with separate handlers. |
| A8 | There are no other tools or code paths that consume the `_resources` field name | Code-analyzable | Code-analyzable | Validated | Searched `src/` and `tests/` for `_resources`. Found only: `resource-tools.ts:128` (production), `mcp-server.test.ts:244,252,253` (test). No other consumers. |
