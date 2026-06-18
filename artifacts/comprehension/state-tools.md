# Comprehension: Session State

> Last updated: 2026-06-18
>
> Coverage: server-managed session-state persistence and resume.
> Related artifacts: WP-01 (Security Hardening).
> Work-packages: WP-01.

## How state persistence works

State persistence is server-managed: the server reads and writes each session's state on disk on every authenticated tool call. Agents do not hand a `state_json` blob back to the server.

- **On-disk session state.** Each session's state lives under
  `<workspaceDir>/.engineering/artifacts/planning/<slug>/` as a `session.json` + `.session-token`
  pair (see `src/utils/session/store.ts`: `planningRoot()` at line 380,
  `resolveSessionLocation()` at line ~405). The `.session-token` file holds the HMAC seal that
  authenticates the `session.json` it sits beside.
- **Resume via `start_session`.** To resume, the agent calls
  `start_session(session_token=<saved_token>)`; `start_session` resolves the existing planning
  folder and the server inherits the session position, checkpoint state, decision outcomes, and
  variables from the on-disk `session.json`.
- **Session addressing.** Sessions are located by slug and by a `session_index` under the fixed
  planning root, so the server derives the state-file location from the authenticated session
  rather than from any agent-supplied filesystem path.
- **Workspace binding.** `src/config.ts` resolves a required `workspaceDir` from `--workspace=PATH`
  (CLI) or `WORKFLOW_WORKSPACE` (env), throwing `WorkspaceConfigError` if neither is supplied
  (config.ts lines 72–82). The server resolves all planning-folder paths relative to this
  workspace root. Agents do not pass arbitrary filesystem paths to a state tool; the server
  derives the location from the authenticated session's slug under the fixed planning root.
- **Crypto is HMAC-based.** `src/utils/session/crypto.ts` exposes `getOrCreateServerKey()`,
  `hmacSign()`, and `hmacVerify()` (HMAC-SHA256). The server-local key lives at
  `~/.workflow-server/secret` (32 bytes, created with mode `0600`). Session tokens are HMAC-signed
  and carried as the opaque session credential.

### Where state types live

- `src/schema/state.schema.ts` — Zod schemas for the in-session state model:
  `WorkflowStateSchema` / `WorkflowState` (line 128), `NestedWorkflowStateSchema` /
  `NestedWorkflowState` (line 150) for recursive `triggeredWorkflows`, plus
  `CheckpointResponseSchema`, `DecisionOutcomeSchema`, `LoopStateSchema`,
  `TriggeredWorkflowRefSchema`, and helpers `createInitialState()`, `validateState()`,
  `addHistoryEvent()`.
- `src/utils/session/store.ts` — the on-disk session store (read/write `session.json`,
  resolve session location by slug/index, planning-root derivation).
- `src/utils/session/migration.ts` — migration of legacy `workflow-state.json` fixtures
  (`tests/fixtures/legacy-session/workflow-state.json`) into the session model.

---

## Security properties

### Path containment

The server derives the state-file location from the authenticated session's slug under the fixed
`<workspaceDir>/.engineering/artifacts/planning/` root (`store.ts`). No agent-supplied path
reaches the filesystem layer, so the planning root bounds every read and write of session state.

### Token integrity

Session tokens are HMAC-signed (`src/utils/session/crypto.ts`) and carried as the opaque session
credential. The token is the credential the server verifies on each authenticated call; there is a
single seal mechanism (HMAC-SHA256) with no agent-controlled flag governing how the token is
processed.

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | What enforces the planning-root containment boundary (path-normalization, slug validation, `realpath` checks)? | OPEN — `store.ts` derives paths from session slug + workspace root; the exact containment guarantees (e.g., slug sanitization against `..`) warrant a dedicated read of `resolveSessionLocation()` and the session-creation path before they can be asserted. |
