# Impact Analysis — Server-owned session setup (Landing 1)

**Target:** `m2ux/workflow-server` server (`src/`, `tests/`, published dispatch docs that currently state replace-on-promote)
**Mode:** Create
**Date:** 2026-09-11
**Change source:** [Change brief](01-change-brief.md) · [Specification](README.md)
**Baseline:** `origin/main`. Index taken 2026-09-11 on commit `792f2cc`: 16,908 nodes, 23,343 edges, 300 flows.

---

## Summary

Landing 1 adds a create-only persist and a git derivation in front of session birth. `writeSessionFile` stays the unconditional persist. GitNexus rates a contract change on that function **CRITICAL**: six direct callers, nine processes, four modules. The cut that keeps that contract is `createSessionFile`.

The occupancy subject is `dispatch_child`'s transient branch. The persistent-parent branch already appends under compare-and-swap and is out of this change.

**Removals inventoried:** the wipe path only — a promote or derived-slug create that would write over a folder already holding a session. The files, the identifier, and the history stay. Transient create for a caller that omits both `working_directory` and `planning_folder` remains, so today's bootstrap still boots.

---

## 1. Impact classification

### Directly modified (planned)

| Path | Change |
|------|--------|
| `src/utils/session/store.ts` | Add `createSessionFile`. Do not change `writeSessionFile`. |
| `src/tools/resource-tools.ts` (`registerResourceTools`) | `start_session` takes `working_directory`, derives the bind, calls `createSessionFile` on the fresh branch. Transient `dispatch_child` promote onto an occupied folder throws `FOLDER_OCCUPIED`. |
| Session-store error surface | `FOLDER_OCCUPIED` arm: folder, existing `session_index`, nothing written. Unreadable session names key rotation. |
| Derivation helper beside the store / resource tools | Working-directory invert, toplevel, origin parse, host ascent, open-decision shape. |
| `docs/dispatch-model.md` and the `dispatch_child` tool description | Wipe sentence deleted because this landing makes it false. |
| Site generator string that restates replace-on-promote | Same deletion, same commit set. |
| Tests listed in the specification (cases 1–10) | Against the real store, not a stub that cannot see a second write. |

`migratePlanningFolder` keeps calling `writeSessionFile`. Session-store, session-scope, session-concurrency, and mcp-server tests that assert unconditional persist keep calling it.

### GitNexus blast radius on `writeSessionFile`

Taken on this tree, `gitnexus_impact({ target: "writeSessionFile", direction: "upstream" })`.

| | Count |
|---|---|
| Risk | **CRITICAL** |
| Direct callers (d=1) | 6 |
| Processes affected | 9 |
| Modules affected | 4 |

**d=1 (WILL BREAK if the contract changes):**

| Caller | Path |
|--------|------|
| `registerResourceTools` | `src/tools/resource-tools.ts` |
| `migratePlanningFolder` | `src/utils/session/migration.ts` |
| `session-store.test.ts` | `tests/session-store.test.ts` |
| `session-scope.test.ts` | `tests/session-scope.test.ts` |
| `session-concurrency.test.ts` | `tests/session-concurrency.test.ts` |
| `mcp-server.test.ts` | `tests/mcp-server.test.ts` |

**d=2:** `createServer` (`src/server.ts`), `captureTools` (`scripts/generate-site-data.ts`), `migration.test.ts`.

**d=3:** `renderToolsRegion`, `startStdioServer`, `mcpHandler`, `createHarness` (e2e).

**Processes named:** `registerResourceTools`, smoke-orchestrator `main`, dispatch-benchmark `main`, token-benchmark `main`, `run-3c` `main`, batch-benchmark `walk`, `src/index.ts` `main`, HTTP `mcpHandler`, `migratePlanningFolder`.

This run does not edit `writeSessionFile`. Re-take the impact before any edit that would.

### Possibly touched at draft time

| Path | Why |
|------|-----|
| `src/utils/session/` other store helpers | `sessionFileExists`, seal mismatch, `findPlanningFolderBySlug`, `resolveSessionRoot` |
| `docs/ide-setup.md`, `AGENTS.md`, `CLAUDE.md` | Still instruct the agent to derive `repo`. Landing 2. A wipe sentence in those files that this landing makes false is in scope here. |
| `tests/e2e/harness.ts` | Indirect via `createServer`. A harness that depends on promote-over-occupied is asserting the defect. |
| HTTP and stdio transports | Indirect. Open-decision responses (no `session_index`) must serialise as a successful tool result. |

### Unaffected

- Persistent-parent `dispatch_child` append under compare-and-swap.
- Resume of a `planning_folder` the caller named.
- Corpus definitions (`workflows/`). Landing 2.
- `resolve-host-repo` as a technique file. The create call implements the algorithm; the technique stays.
- `writeSessionFile` callers that are not switched to `createSessionFile`.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| `writeSessionFile` contract | Must remain unconditional persist. Occupancy is a different function. |
| Fresh session with `working_directory` | Durable folder, derived `owner/repo`, no temp map entry. |
| Occupied derived slug | `FOLDER_OCCUPIED`, files byte-identical. |
| Occupied named folder | Resume, not occupancy. |
| Transient promote onto occupied | `FOLDER_OCCUPIED`. This is the measured wipe, inverted. |
| Persistent parent, second child | Append still works. |
| Non-git `working_directory` | Refuse. No mkdir under the mapped basename. |
| Open decisions | Successful call, no `session_index`, `decision` / `candidates` / `recommendation` present. |
| Existing suites | start-session, dispatch-child, migration, concurrency stay green. |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | Transient `dispatch_child` promote onto a folder that already holds `session.json` | The write that replaces the run | Persistent-parent append; promote onto an *empty* durable folder until Landing 3 |
| 2 | Fresh `start_session` that would derive a slug already holding a session | Auto-resume of yesterday's folder, and overwrite | Resume when the caller *named* that folder |
| 3 | Published wipe sentence | The claim that a second dispatch into an occupied folder replaces the session | The rest of the dispatch model |
| 4 | Agent-derived `repo` as the bind on the `working_directory` path | Silent win for a caller `repo` that disagrees with git | Optional `repo` that must equal the derivation; prose fallback only when git cannot answer |

No workflow activity is removed on this landing. Criterion "no setup activity remains that contains no judgment call" is Landing 2, applied to `discover-session`, `initialize-session`, and `resolve-target`.
