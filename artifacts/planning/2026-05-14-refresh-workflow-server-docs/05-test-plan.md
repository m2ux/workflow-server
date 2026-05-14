# Test Plan — Refresh Workflow-Server Docs

**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Activity:** plan-prepare (v1.4.2)

---

## Test strategy

This is a documentation-only change. No source or schema modifications are planned, so the test surface is **verification** (the changes do not regress the build or tests) plus **doc-specific checks** (links, examples, references).

---

## Verification suite (existing tooling)

| Check | Command | Pass criteria |
|---|---|---|
| Build | `npm run build` | Exit 0; no new errors. |
| Typecheck | `npm run typecheck` | Exit 0; same diagnostic count as baseline. |
| Unit tests | `npm test` | Same pass/fail set as baseline (no new failures). |
| Workflow validator | `node scripts/validate-workflows.js` (or equivalent) | No new validation errors. |

These are sanity checks, not the primary verification — docs do not change runtime behavior.

---

## Doc-specific checks

| # | Check | How | Pass criteria |
|---|---|---|---|
| D1 | Tool inventory matches source | Cross-reference `docs/api-reference.md` entries against `server.tool(...)` calls in `src/tools/*.ts` | 1:1 mapping; every registered tool documented; no docs for removed tools. |
| D2 | Tool signatures match Zod input schemas | Spot-check 4 high-traffic tools (`start_session`, `next_activity`, `get_activity`, `respond_checkpoint`) | Documented params match Zod schemas. |
| D3 | `_meta` shapes match runtime | Read a handful of tool implementations; compare `_meta` keys in the doc | Documented `_meta` keys match those returned. |
| D4 | Setup commands work end-to-end on a clean checkout | Manual: `npm install` → `npm run build` → `npm start` → `discover` from MCP client | All steps succeed; `discover` returns the expected bootstrap text. |
| D5 | Cross-references resolve | Grep every relative markdown link; verify target exists | Zero broken links inside refreshed docs. |
| D6 | External links current | Sample a handful (Anthropic MCP, GitHub repo, schemas) | Links resolve to current content. |
| D7 | Schema doc parity | For each schema in `schemas/*.json`, confirm `schemas/README.md` describes the current fields | No undocumented public fields; no documented fields that have been removed. |
| D8 | IDE setup procedure works | Manual: follow `docs/ide-setup.md` against Claude Code from scratch | Bootstrap rule fires; `discover` is invoked first. |
| D9 | No stale tool names | Grep refreshed docs for removed/renamed tool names | No matches. |
| D10 | "Tracked drift" appendix complete | Inspect against the list of references kept in `session_token` form | Every reference that will need re-touching after the session-state merge appears in the appendix. |

---

## Manual review checklist

- [ ] `README.md` reads cleanly top-to-bottom; a new contributor could follow it.
- [ ] `SETUP.md` matches the actual `package.json` scripts.
- [ ] `docs/api-reference.md` tool roster matches `src/tools/`.
- [ ] `docs/ide-setup.md` no longer a stub.
- [ ] `schemas/README.md` describes the current schemas.
- [ ] PR `#119` description reflects the refresh and links the planning folder.

---

## Out of scope (deferred to follow-up work packages)

- Doc translation for `session_token → session_index` (waits on the server-managed-session-state branch landing in main).
- New doc surfaces not currently present (e.g., user-facing tutorials).
- Site-generation tooling for docs (Docusaurus / mdBook etc.).
