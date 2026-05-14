# Work Package Plan — Refresh Workflow-Server Docs

**Work package:** `2026-05-14-refresh-workflow-server-docs`
**Activity:** plan-prepare (v1.4.2)
**Date:** 2026-05-14
**Target branch / PR:** `chore/refresh-workflow-server-docs` / `#119`
**Target worktree:** `/home/mike1/projects/work/workflow-server/2026-05-14-refresh-workflow-server-docs/`

---

## Reference: what is the source of truth?

The docs in this work package align against the **current state of `main` at the time the PR is opened**. The `session_index` migration is in a separate feature branch (`server-managed-session-state`) and is **not yet merged into main** — so this work package keeps `session_token` terminology consistent with main's runtime. When that branch lands, a follow-up doc pass will translate the affected tool entries.

A short "Tracked drift" appendix (see task T9) records places where the docs match `main` today but will need re-touching after the session-state merge.

---

## In-scope files

| # | File | Last touched | Refresh focus |
|---|---|---|---|
| F1 | `README.md` | 2026-05-13 | Verify quick-start matches current `npm` scripts; check links to docs/ and SETUP.md; confirm tool count and inventory summary. |
| F2 | `SETUP.md` | 2026-04-23 | Refresh setup instructions: `workflows` worktree command, schema fetch step, MCP client examples (Claude Code, generic MCP), version pinning. |
| F3 | `AGENTS.md` | 2026-05-14 | Verify rule references (`get_rules`, discover bootstrap) and IDE-setup pointer; align with `CLAUDE.md`. |
| F4 | `CLAUDE.md` | 2026-05-14 | Verify GitNexus block, IDE-setup pointer, repo conventions; align with `AGENTS.md`. |
| F5 | `docs/api-reference.md` | 2026-05-13 | Tool roster (17 tools: 12 in workflow-tools.ts, 5 in resource-tools.ts), signatures, `_meta` shapes, lifecycle table; cross-check with `src/tools/`. |
| F6 | `docs/ide-setup.md` | 2026-05-13 | Expand from current 223-byte stub — bootstrap rule, discover-first contract, schemas fetch. |
| F7 | `docs/architecture.md` | 2026-05-13 | Update module map to match current `src/` layout (loaders, tools, resources, types, utils, schema). |
| F8 | `docs/development.md` | 2026-05-13 | Build/test/lint commands, repo layout, contribution flow; align with comprehension portfolio. |
| F9 | `docs/dispatch_model.md` | 2026-05-13 | Hierarchical dispatch (meta → child), worker/orchestrator roles, dispatch-activity contract; align with `hierarchical-dispatch.md` comprehension artifact. |
| F10 | `docs/checkpoint_model.md` | 2026-05-13 | Worker yield, orchestrator response, meta-only `respond_checkpoint` rule; align with current `present_checkpoint`/`respond_checkpoint` signatures. |
| F11 | `docs/state_management_model.md` | 2026-05-08 | Session token lifecycle, advance semantics, checkpoint enforcement. |
| F12 | `docs/resource_resolution_model.md` | 2026-05-13 | Resource refs vs ids, `get_resource` contract, attachment via `_resources` on skills. |
| F13 | `docs/artifact_management_model.md` | 2026-04-26 | Planning folder structure, artifact ids/locations, README progress table. |
| F14 | `docs/workflow-fidelity.md` | 2026-05-13 | Workflow fidelity rules (discover, schema fetch, no-fabricate options); align with current rule set. |
| F15 | `docs/orchestra-specification.md` | 2026-05-13 | Spec doc — verify cross-references to current schemas. |
| F16 | `schemas/README.md` | 2026-04-23 | Schema-by-schema doc against `schemas/*.json` and `src/schema/*.ts`; confirm Zod ↔ JSON Schema parity. |
| F17 | `schemas/schema-header.md` | 2026-04-23 | Verify schema-header format matches what `schema-preamble.ts` emits. |

Out of scope: source under `src/`, schemas under `schemas/*.json`, workflow TOON files, `.engineering/AGENTS.md` and `.engineering/CLAUDE.md` (engineering-folder-specific, not user-facing).

---

## Tasks

| # | Task | Files | Estimate | Depends on |
|---|---|---|---|---|
| T1 | Sweep tool roster against `src/tools/*.ts`; produce delta table | F5 | 15m | — |
| T2 | Refresh `docs/api-reference.md` tool entries | F5 | 30m | T1 |
| T3 | Refresh `README.md` (quick-start, tool inventory, links) | F1 | 15m | T1 |
| T4 | Refresh `SETUP.md` (highest-drift file — 3 weeks stale) | F2 | 25m | T1, T3 |
| T5 | Expand `docs/ide-setup.md` from stub | F6 | 15m | T2, T4 |
| T6 | Align `AGENTS.md` ↔ `CLAUDE.md` | F3, F4 | 10m | T3, T5 |
| T7 | Refresh `docs/architecture.md` module map | F7 | 15m | T1 |
| T8 | Refresh `docs/development.md` build/test/lint flow | F8 | 10m | T7 |
| T9 | Refresh dispatch / checkpoint / state / resource / artifact / fidelity / orchestra docs | F9–F15 | 60m | T1, T2 |
| T10 | Refresh `schemas/README.md` against current schemas | F16 | 30m | — |
| T11 | Refresh `schemas/schema-header.md` against `schema-preamble.ts` | F17 | 10m | T10 |
| T12 | Add "Tracked drift" appendix (follow-up needed after session-state merge) | new section in plan / `.engineering/` | 10m | T2, T9 |
| T13 | Cross-reference sweep: every doc-to-doc link verified | all | 15m | T2–T11 |
| T14 | Run `npm run typecheck` and `npm test` (sanity — no source changes expected) | — | 5m | — |
| T15 | Update PR description with planning summary, file inventory, follow-up appendix link | PR #119 | 10m | T13, T14 |

**Total estimate (agentic + review): ~4–5h agentic, ~1–1.5h review.**

---

## Dependency Graph

```
T1 → T2 → T3 → T4 → T5 → T6
       ↓
       T9
T1 → T7 → T8
T10 → T11
T2,T9 → T12
T2–T11 → T13 → T14 → T15
```

---

## Commit grouping

Three coherent commit groups under the existing PR:

1. **API + entry docs** — T2, T3, T4, T5, T6
2. **Architecture and model docs** — T7, T8, T9
3. **Schema docs** — T10, T11
4. **Cross-refs + PR update** — T12, T13, T15

T1, T14 are read-only verification steps.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Drift between main and unmerged feature branches (notably `server-managed-session-state`) causes confusion about which terms to use. | High | T12 explicitly documents the boundary; docs align with main, follow-up tracked. |
| Tool descriptions in `src/` differ from how docs describe them. | Medium | T1 produces a delta table before any doc writes. |
| Cross-references break during refresh (a link target gets renamed). | Low–Medium | T13 sweeps cross-references after writes. |
| Schema doc drift on undocumented fields. | Medium | T10 spot-checks Zod ↔ JSON Schema parity per file. |

---

## Definition of done

- All in-scope files refreshed and committed in the worktree branch.
- `npm run typecheck` and `npm test` pass in the worktree.
- PR `#119` description updated with the planning summary.
- Tracked drift appendix exists and is linked from the PR.
