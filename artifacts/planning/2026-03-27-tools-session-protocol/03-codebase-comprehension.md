# Codebase Comprehension: Tool Handlers

**Work Package:** Tools Session Protocol (WP-07)  
**Created:** 2026-03-27

---

## Scope

Three tool handler files in `src/tools/` plus the validation utility module:

| File | Lines | Responsibility |
|------|-------|----------------|
| `resource-tools.ts` | 157 | Session bootstrap (`start_session`), skill loading (`get_skills`, `get_skill`) |
| `state-tools.ts` | 111 | State persistence (`save_state`, `restore_state`) |
| `workflow-tools.ts` | 270 | Workflow navigation (`help`, `list_workflows`, `get_workflow`, `next_activity`, `get_checkpoint`, `get_activities`, `get_trace`, `health_check`) |
| `utils/validation.ts` | 173 | Validation helpers used by all tools |

---

## Architecture

All tool handlers follow a consistent pattern:
1. Register via `server.tool(name, description, schema, handler)`
2. Decode session token (except exempt tools: `help`, `list_workflows`, `start_session`, `health_check`)
3. Execute business logic
4. Return `{ content: [...], _meta: { session_token, validation } }`

The `withAuditLog` wrapper provides trace event recording and error handling.

---

## Findings Mapping

### resource-tools.ts

**QC-032 — `get_skills` swallows skill-load failures silently**  
Lines 97-108: The `for` loop over `skillIds` silently skips failed loads (`if (result.success)`). No indication to caller which skills failed.

**QC-037 — `start_session` returns token in body, not `_meta`**  
Lines 60-70: Token is placed in `response.session_token` inside `content[0].text`. All other tools return tokens via `_meta.session_token`. This is the only tool that returns the token in the body.

**QC-039 — Index-based resource deduplication silently drops duplicates**  
Lines 95-107: `seenIndices` Set drops duplicate resources without logging. If two skills reference the same resource index, the second is silently dropped.

**QC-092 — `loadSkillResources` cast without runtime type guard**  
Lines 15-16: `skillValue as Record<string, unknown>` and subsequent cast to `string[]` with no runtime validation.

**QC-097 — `'0.0.0'` version fallback obscures warnings**  
Line 46: `workflow.version ?? '0.0.0'` creates a session token with a dummy version, which means version drift detection will produce misleading warnings if version is actually undefined.

### state-tools.ts

**QC-033 — `JSON.parse` without try/catch in `save_state`**  
Line 36: `JSON.parse(stateJson)` can throw a `SyntaxError` on malformed input. The error propagates as an unhandled exception instead of a meaningful error message.

**QC-034 — Hard-coded `'session_token'` key for encryption**  
Lines 43, 99: The string literal `'session_token'` is hard-coded as the property name to look up in `state.variables`. Should be a constant.

**QC-035 — Key rotation breaks decrypt with no migration path**  
Lines 99-103: If the server key is rotated (e.g., by deleting `~/.workflow-server/secret`), previously saved states cannot be decrypted. No error handling or migration guidance.

**QC-036 — State tools skip workflow consistency validation**  
Lines 34, 89: Both `save_state` and `restore_state` decode the session token but don't validate workflow consistency (unlike all other tools).

**QC-099 — `encodeToon` double cast at serialization boundary**  
Line 61: `saveFile as unknown as Record<string, unknown>` — double cast through `unknown`.

### workflow-tools.ts

**QC-038 — `get_trace` indistinguishable "no events" vs "tracing disabled"**  
Lines 253-256: When `config.traceStore` is `undefined` (tracing disabled), returns empty array. When tracing is enabled but no events exist, also returns empty array. Caller cannot distinguish.

**QC-093 — Redundant `initialActivity` type cast**  
Line 94: `(wf as Record<string, unknown>)['initialActivity']` — unnecessary cast since `initialActivity` should be on the type.

**QC-094 — Missing `activity_manifest` warning branch**  
Lines 132-137: When `activity_manifest` is present, warnings are collected but never checked whether an empty manifest was provided vs. no manifest at all.

**QC-095 — Non-null assertions after length check**  
Lines 161-162: `segment.events[0]!` and `segment.events[segment.events.length - 1]!` — non-null assertions used even though the length check on line 154 guarantees they exist.

**QC-096 — `help` tool hardcodes protocol description**  
Lines 47-51: Session protocol description is inline literal strings. If protocol behavior changes, this description can drift from actual behavior.

**QC-098 — Only `get_activities` checks `token.act` precondition**  
Line 205: `get_activities` is the only tool that checks `token.act` exists. Other tools that depend on an activity context (e.g., `get_checkpoint`) don't validate this.

**QC-100 — Trace `act` field uses previous activity after transition**  
Line 157: `act: token.act || activity_id` — the trace payload uses `token.act` (the *previous* activity) rather than `activity_id` (the *new* activity being transitioned to).

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should `start_session` token move to `_meta`? | Resolved — yes, all other tools use `_meta` |
| 2 | Does the test suite cover the affected edge cases? | Resolved — no, tests cover happy paths only |
| 3 | Are findings independent across files? | Resolved — QC-037/QC-096 are cross-file dependent |
