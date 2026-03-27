# Assumptions Log

**Work Package:** Tools Session Protocol (WP-07)  
**Created:** 2026-03-27  
**Last Updated:** 2026-03-27 (reconciled after codebase-comprehension)

---

## Summary

Total: 4 | Validated: 2 | Invalidated: 1 | Partially Validated: 1 | Open: 0  
Convergence iterations: 1 | Newly surfaced: 0

---

## Assumptions

### A-02-01: Token return location is specific to start_session
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** QC-037 reports that `start_session` returns the token in the response body rather than `_meta`. This assumes other tools already return tokens via `_meta`, and only `start_session` is inconsistent.  
**Finding:** Confirmed. `start_session` (resource-tools.ts:60-69) puts `session_token` in the JSON body inside `content[0].text`. Every other tool (`get_workflow`, `next_activity`, `get_checkpoint`, `get_activities`, `get_skills`, `get_skill`, `save_state`, `restore_state`, `get_trace`) returns the token via `_meta.session_token`.  
**Evidence:** resource-tools.ts:68 (`session_token: token` in body) vs. resource-tools.ts:118 (`_meta: { session_token: ... }`).  
**Resolution:** Validated — iteration 1

### A-02-02: Existing tests cover current behavior adequately
**Status:** Partially Validated  
**Resolvability:** Code-analyzable  
**Category:** Complexity Assessment  
**Assumption:** The existing test suite tests the happy-path behavior that the 17 fixes modify, meaning changes can be verified against current tests without writing new ones.  
**Finding:** Tests cover happy paths for all tools and some error paths (invalid tokens, non-existent workflows). But tests do NOT cover: malformed JSON in `save_state`, failed skill loads in `get_skills`, tracing-disabled vs. empty-events in `get_trace`, or the token location in `start_session` body vs. `_meta`.  
**Evidence:** mcp-server.test.ts:82 — `expect(response.session_token).toBeDefined()` tests body token (will need update if moved to `_meta`). No test for `save_state` with invalid JSON.  
**Resolution:** Partially Validated — iteration 1. Tests cover happy paths; moving `start_session` token to `_meta` will require updating test line 82.

### A-02-03: Encryption key changes are scoped to configuration
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Category:** Problem Interpretation  
**Assumption:** QC-034 can be addressed by making the hard-coded `'session_token'` string a constant. QC-035 can be addressed with error handling and a documentation comment.  
**Finding:** QC-034 refers to the property name `'session_token'` used to look up state variables (state-tools.ts:43, 99), not the encryption algorithm key. The encryption key itself is already externalized to `~/.workflow-server/secret` (crypto.ts:8). Making `'session_token'` a constant is straightforward.  
**Evidence:** state-tools.ts:43 — `state.variables['session_token']`, crypto.ts:7-8 — key is file-based.  
**Resolution:** Validated — iteration 1

### A-02-04: No cross-file dependencies between findings
**Status:** Invalidated  
**Resolvability:** Code-analyzable  
**Category:** Complexity Assessment  
**Assumption:** The 17 findings can be fixed independently within their respective files without coordinating changes across files.  
**Finding:** QC-037 (move token to `_meta` in resource-tools.ts) directly affects QC-096 (protocol description in workflow-tools.ts) because the `help` tool describes where tokens appear. Additionally, the test in mcp-server.test.ts:82 reads the token from the body — this must be updated. The findings are not fully independent.  
**Evidence:** resource-tools.ts:68 (token in body), workflow-tools.ts:48 (protocol description says `_meta`), mcp-server.test.ts:82 (test reads body token).  
**Resolution:** Invalidated — iteration 1. QC-037 and QC-096 require coordinated change, and tests need updating.
