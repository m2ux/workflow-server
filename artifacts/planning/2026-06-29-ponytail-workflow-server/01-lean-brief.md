# Lean Brief — ponytail over workflow-server

> Activity: `intake-and-scope` · step `capture-and-trace` (technique `scope-intake`) · session `OGMQAL` · artifact prefix `01`

## Task

Run the ponytail lean-coding lens over the workflow-server MCP server codebase — identify
over-engineering and lean-coding (YAGNI / simplification) opportunities in the TypeScript source
and report them, tracking any ponytail debt.

**One-sentence problem:** Where does the workflow-server source carry code, indirection, or
abstraction that no present concrete need justifies — and which of it could be deleted or
collapsed without crossing the safety floor?

This is a **report-only audit**. Per the project CLAUDE.md, `src/` and `schemas/` and workflow
YAML are not edited unless the user explicitly asks; this aligns with ponytail's own
`report-only-no-apply` rule (review / audit / harvest / gain operations list findings and change
no code).

## Target

| Field | Value |
|---|---|
| `task_description` | (above) |
| `target_path` | `.` — the workflow-server repo root |
| Code under audit | `src/` (TypeScript MCP server, ~7,400 LOC), `schemas/`, `tests/`, `scripts/` |
| `lazy_intensity` | **proposed `full`** — confirm at the `intensity-and-scope-confirmed` checkpoint |
| `pass_scope` | **proposed `repo`** ("the codebase" → whole-tree pass) — confirm at the checkpoint |

The intensity/scope pair is gated by the blocking `intensity-and-scope-confirmed` checkpoint
(step 2 of this activity), so the final values are the user's choice, not assumed here.
`repo` (or any `ultra`) selection adds the repo-wide audit downstream.

## Traced flow (the real end-to-end path the audit touches)

The server is an MCP stdio server. The entry-to-exit flow every authenticated tool follows:

1. **Entry.** `src/index.ts` `main()` → `loadConfig(process.argv)` (`src/config.ts`, resolves
   `--workspace` / `WORKFLOW_WORKSPACE`, `WORKFLOW_DIR`, `SCHEMAS_DIR`) → `createServer(config)`
   (`src/server.ts`) registers the tool sets and connects a `StdioServerTransport`.
2. **Tool dispatch.** `registerWorkflowTools` (`src/tools/workflow-tools.ts`, ~870 LOC) and
   `registerResourceTools` (`src/tools/resource-tools.ts`, ~635 LOC) register every tool. Each
   handler is wrapped `withAuditLog(...)` and, for authenticated tools, `withSessionStoreErrors(...)`.
3. **Data carried — the session bag.** The unit of state is the on-disk `SessionFile`
   (`<workspaceDir>/.engineering/artifacts/planning/<slug>/session.json`), HMAC-sealed by a
   sibling `.session-token`. The per-call lifecycle is uniform across tools:
   `loadSessionForTool` (`src/utils/session/resolver.ts` → `resolveSessionLocation` +
   `verifySeal` + schema-validate) → validation helpers (`src/utils/validation.ts`) →
   `advanceSession` (bump `seq`/`ts`, apply mutator on a JSON-clone draft) →
   `saveSessionForTool` (`writeSessionFile`: canonicalise → seal → atomic write, `src/utils/session/store.ts`).
4. **Exit / error paths.** Success returns an MCP `{ content, _meta: { session_index, validation } }`
   envelope. Failure surfaces a `SessionStoreError` (NOT_FOUND / COLLISION / SEAL_MISMATCH /
   INVALID_INDEX / WORKSPACE_INVALID) mapped to an actionable message by
   `describeSessionStoreError`. `main()` exits non-zero on startup failure.

Supporting subsystems on the periphery of this flow (also in scope): the loader stack
(`workflow-loader`, `technique-loader`, `markdown-technique-loader`, `resource-loader`,
`activity-loader`, `core-ops`), the zod `schema/` definitions and generated JSON `schemas/`,
the trace store (`src/trace.ts`), and the `scripts/check-*` fidelity guards.

The codebase is GitNexus-indexed (per CLAUDE.md: 9454 symbols), so downstream audit activities
can use `gitnexus_query` / `gitnexus_context` for caller/callee inspection alongside direct reads.

## Reachable rungs (what the audit is likely to find, per the ladder)

Ranked by where the YAGNI/simplification surface looks densest in the traced flow. These are
candidate observations to confirm in the audit activity — not findings recorded here.

- **Rung 1 (YAGNI — does it need to exist?):** dead or single-use helpers. E.g. `withSession`
  (`resolver.ts`) is a load→mutate→save convenience wrapper that the registered tools do not use
  (they inline the three calls); test-only `_*ForTests` exports; `redirectTransientToWorkspace`
  and other transient-registry machinery whose live consumers warrant a usage check.
- **Rung 2 (reuse an in-repo helper):** near-duplicated logic. The strongest candidate is
  `resolveSessionLocation` vs `resolveSessionIndex` in `store.ts` — two full recursive
  planning-tree walkers with identical COLLISION/NOT_FOUND handling; the latter is documented as
  "a convenience wrapper that drops the jsonPath component" yet reimplements the whole walk.
- **Rung 3 / 7 (stdlib over hand-roll; minimum code, no premature abstraction):** the
  hand-written `canonicaliseJson` serialiser and `navigatePath`/`replacePath` JSON-path walkers
  in `store.ts`/`resolver.ts` — evaluate against present need vs. complexity.
- **Boring-over-clever / single-implementation abstractions:** the layered loader composition
  and any interface/factory with one implementation.

## Safety-floor obligations in play (never simplified away)

- **Input validation at trust boundaries.** The `session_index` regex (`^[A-Z2-7]{6}$`), zod
  schema validation of `session.json`, workflow/activity/technique schema validation, and
  resource-ref / slug parsing all sit at the MCP and filesystem trust boundary. These stay.
- **Error handling that prevents data loss.** The atomic write (stage → fsync → rename, with the
  EXDEV copy fallback and state-before-seal ordering) and the HMAC seal verification are
  data-integrity machinery, not over-engineering — they are floor, not rungs.
- **Security.** HMAC sealing (`crypto.ts`), `timingSafeEqual` seal comparison, and path-traversal
  guards (`assertValidSlug`, workspace-absolute checks) are security-floor and out of scope for
  trimming.
- **Anything explicitly requested.** The user asked for the whole-codebase pass; nothing in that
  request is simplified away as "unnecessary."
- **One runnable assert-based check.** The existing `tests/` and `scripts/check-*` suites are the
  runnable checks for non-trivial logic; any simplification proposed downstream must keep them green.

## Next

Step 2 is the blocking `intensity-and-scope-confirmed` checkpoint — yield it so the orchestrator
can confirm `lazy_intensity` and `pass_scope` with the user before the ladder is climbed.
