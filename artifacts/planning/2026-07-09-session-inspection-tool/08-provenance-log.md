# Provenance Log

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T1 | claude | claude-opus-4-8 | code-generation | repo-only | Add `inspect_session` zod param schema (view enum, child_index, variable) in `src/tools/workflow-tools.ts` |
| T2 | claude | claude-opus-4-8 | code-generation | repo-only | Port projection/view helpers from `scripts/inspect_session.py` to typed TS pure functions |
| T3 | claude | claude-opus-4-8 | code-generation | repo-only | Add read-only `inspect_session` handler + registration (excludeFromTrace, no checkpoint gate, child_index descent) |
| T4 | claude | claude-opus-4-8 | test-writing | repo-only | Add `tool: inspect_session` test block in `tests/mcp-server.test.ts` (per-view, variable narrowing, child_index descent + NOT_FOUND, read-only invariance, checkpoint-active, parity vs reference script) |
| T5 | claude | claude-opus-4-8 | docs | repo-only | Update `README.md` tool count 16→17 + table row and `docs/api-reference.md` per-tool entry for `inspect_session` |
| T5 | claude | claude-opus-4-8 | docs | repo-only | Add `inspect_session` to `TOOL_GROUPS` (Session) + site guide in `scripts/generate-site-data.ts` and regenerate `site/api/tools.html` (drift guard / site.test.ts requirement, IM-4) |
| T6 | claude | claude-opus-4-8 | docs | repo-only | Add advisory `inspect_session` blockquote notes to four close-out techniques (verify-outcomes, generate-summary, retrospective, select-next) in a dedicated workflows worktree |
