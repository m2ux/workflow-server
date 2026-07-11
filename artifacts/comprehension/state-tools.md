# Comprehension: Session State

> Last updated: 2026-07-11
>
> Coverage: server-managed session-state persistence and resume; session read path, read-only tool pattern, session-file shape, and close-out technique surfaces.
> Related artifacts: [workflow-server.md](workflow-server.md), [zod-schemas.md](zod-schemas.md), WP-01 (Security Hardening).
> Work-packages: WP-01, #193 (Session Inspection Tool).

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

## Session read path (tool-facing)

Every authenticated tool reads session state through one primitive:
[`loadSessionForTool(workspaceDir, sessionIndex)`](../../../src/utils/session/resolver.ts#L138)
in `src/utils/session/resolver.ts`. The chain is:

1. [`resolveSessionLocation`](../../../src/utils/session/store.ts#L404) (`store.ts`) — maps the
   6-char base32 `session_index` to a `SessionLocation { folder, jsonPath }`. Resolution is
   **enumeration-based**: transient (tmp-dir) registry first, then a `readdir` walk of every folder
   under `<workspaceDir>/.engineering/artifacts/planning/`, reading each `session.json` and matching
   the *stored* `sessionIndex` at the root and recursively under `triggeredWorkflows[i].state`
   (`walkEmbedded`). Zero matches → `NOT_FOUND`; more than one → `COLLISION`. A child session's own
   index therefore resolves to a non-empty `jsonPath` like `["triggeredWorkflows", 0, "state"]`.
2. [`verifySeal`](../../../src/utils/session/store.ts#L346) — [`readSessionFile`](../../../src/utils/session/store.ts#L268)
   returns raw bytes + parsed JSON; the `.session-token` HMAC is recomputed over the exact bytes and
   compared with `timingSafeEqual`. Any drift → `SEAL_MISMATCH`. Integrity is checked **before** any
   projection, even for pure reads.
3. `safeValidateSessionFile` — Zod-parses the top file against `SessionFileSchema`; failure surfaces
   as `SEAL_MISMATCH` with the Zod issue list.
4. [`navigatePath`](../../../src/utils/session/resolver.ts#L20) — walks the `jsonPath` (string keys +
   numeric array indices) into the parsed top state; missing key / out-of-bounds / non-object
   intermediate → `NOT_FOUND`.

The result is a [`LoadedSession`](../../../src/utils/session/resolver.ts#L113):
`{ state, folderAbsPath, bytes, jsonPath, topState }` — `state` is the *addressed* session (root or
embedded child), `topState` is always the on-disk root. Mutating tools then call `advanceSession`
(bump `seq`/`ts`, apply a mutator on a deep clone) and `saveSessionForTool` (re-inserts via
[`replacePath`](../../../src/utils/session/resolver.ts#L63), re-canonicalises, re-seals, atomic-writes).
**A read-only tool is simply a tool that stops after step 4** — precedent below.

Error mapping for tool responses lives in
[`describeSessionStoreError`](../../../src/utils/session/resolver.ts#L207): per-code actionable
messages for `INVALID_INDEX`, `NOT_FOUND`, `COLLISION`, `SEAL_MISMATCH`, `WORKSPACE_INVALID`.

## Tool registration pattern

Tools register in [`registerWorkflowTools(server, config)`](../../../src/tools/workflow-tools.ts#L112)
(`src/tools/workflow-tools.ts`, 12 tools) and `registerResourceTools` (`resource-tools.ts`, 4 tools),
both called from `createServer` (`src/server.ts`). The uniform shape:

```ts
server.tool(name, description,
  { ...sessionIndexParam /* + tool-specific zod params */ },
  withAuditLog(name, withSessionStoreErrors(async ({ session_index, ... }) => {
    const loaded = await loadSessionForTool(config.workspaceDir, session_index);
    ...
    return { content: [{ type: 'text', text }], _meta: { session_index, validation: buildValidation() } };
  })), traceOpts);
```

- [`sessionIndexParam`](../../../src/utils/session/params.ts#L9) — shared Zod spread validating
  `/^[A-Z2-7]{6}$/` with a self-describing `.describe()`.
- [`withSessionStoreErrors`](../../../src/tools/workflow-tools.ts#L48) — catches `SessionStoreError`
  and re-throws with the `describeSessionStoreError` message.
- [`assertNoActiveCheckpoint`](../../../src/utils/session/params.ts#L36) — called by *mutating*
  tools; it gates all tools while a checkpoint is active.

**Read-only precedent — [`get_workflow_status`](../../../src/tools/workflow-tools.ts#L1063):** loads
the session, projects `{ status, current_activity, completed_activities, variables, workflow, parent?,
last_checkpoint? }`, and deliberately does **not** call `advanceSession`/`saveSessionForTool`
("reads but does not advance — keep the on-disk state stable"), does **not** call
`assertNoActiveCheckpoint` (usable while blocked — it reports `status: 'blocked'` instead), and
registers with `excludeFromTrace: true` so status polls stay out of the trace. It already exposes the
variable bag and completed activities — a subset of the projections a full inspection tool needs (no
`checkpointResponses`, `history`, `skippedActivities`, or `triggeredWorkflows` children).

## Session file shape (schemaVersion 1)

[`SessionFile`](../../../src/schema/session.schema.ts#L163) (`src/schema/session.schema.ts`) — the
recursive on-disk model; one top-level `session.json` carries the whole work-package tree:

- **Identity:** `schemaVersion: 1`, `sessionIndex`, `workflowId`, `workflowVersion`, `agentId`,
  `seq` (monotonic, bumped per mutating call), `ts`, `startedAt`.
- **Position:** `currentActivity`, `currentTechnique`, `condition`, `activeCheckpoint?`
  (`{ checkpointId, activityId, yieldedAt }`), `status` (`running|completed|aborted`, default `running`).
- **Accumulated state:** `variables` (arbitrary bag), `completedActivities[]`, `skippedActivities[]`,
  `checkpointResponses` (map `"activityId-checkpointId"` → [`CheckpointResponse`](../../../src/schema/state.schema.ts#L47)
  `{ optionId, respondedAt, effects?: { variablesSet?, transitionedTo?, activitiesSkipped? } }`),
  `history[]` (append-only [`HistoryEntry`](../../../src/schema/state.schema.ts#L33)
  `{ timestamp, type, activity?, step?, checkpoint?, decision?, loop?, data?, error? }` over the
  [24-value event-type enum](../../../src/schema/state.schema.ts#L6) — includes `workflow_started/…triggered/…completed`,
  `activity_entered/exited/skipped`, `checkpoint_reached/response/replayed`, `technique_fetched/bundled`,
  `variables_seeded`).
- **Tree structure:** `triggeredWorkflows[]` of [`EmbeddedSessionRef`](../../../src/schema/session.schema.ts#L17)
  `{ workflowId, sessionIndex, triggeredAt, triggeredFrom, status (running|completed|aborted|error),
  completedAt?, returnedContext?, state?: SessionFile }` — children embed their state under `.state`
  (the root/child asymmetry), recursively. `parentSession?` is the upward link (a full snapshot, not
  a reference).
- **Delivery bookkeeping:** `planningFolderPath?`, `contextMode?`, `deliveredContent?` (agentId →
  content key → hash; grows with every delivery — one reason raw `session.json` passthrough is a
  poor tool response).

## Close-out technique surfaces (workflows worktree)

Technique operations are markdown files in the `workflows` orphan-branch worktree with frontmatter
`metadata.version`, then `## Capability / ## Inputs (### per input) / ## Outputs (### per output,
#### artifact for filenames) / ## Protocol (### numbered phases, bullet steps) / ## Rules (### named
rules)`. **Advisory step notes are `>` blockquote lines under a protocol step** (e.g. the merge-wait
note in `retrospective.md` step 3) — the established convention for non-normative guidance.

The four close-out consumers that read session state at close time:

| Technique op | File (worktree-relative) | Session data it reads |
|---|---|---|
| `workflow-engine::verify-outcomes` | `meta/techniques/workflow-engine/verify-outcomes.md` | variable state + completed-activities trace vs. declared `outcomes` |
| `workflow-engine::generate-summary` | `meta/techniques/workflow-engine/generate-summary.md` | execution trace: activities, checkpoint decisions, artifacts (rule `present-only`: summary is presented, never persisted) |
| `conduct-retrospective::retrospective` | `work-package/techniques/conduct-retrospective/retrospective.md` | session history capture (protocol phase 1) |
| `conduct-retrospective::select-next` | `work-package/techniques/conduct-retrospective/select-next.md` | planning-folder follow-ups / carried context |

## Design rationale (hypotheses)

- **Seal-verify even on read** — reads share `loadSessionForTool` with writers, so a read never
  projects tampered or torn state; the cost is one HMAC per call. Uniformity over micro-optimisation.
- **Enumeration-based index resolution** — resolving by *stored* `sessionIndex` (walking folders)
  rather than by deriving a path from input means no agent-supplied string ever becomes a filesystem
  path; containment is structural, not sanitization-dependent. Trade-off: O(all planning folders +
  embedded tree) per call, acceptable at planning-folder scale.
- **Compact projections over raw passthrough** — `session.json` accretes `history` and
  `deliveredContent` without bound; tools that answer questions return shaped projections
  (`get_workflow_status`) instead of the file.
- **Read tools skip `assertNoActiveCheckpoint`** — an inspection surface must work while the session
  is blocked at a checkpoint, since that is precisely when an orchestrator wants to look.

## Domain glossary

| Term | Meaning | Code anchor |
|---|---|---|
| session_index | 6-char RFC 4648 base32 id addressing a root or embedded session | [`sessionIndexParam`](../../../src/utils/session/params.ts#L9) |
| planning folder | `<workspace>/.engineering/artifacts/planning/<slug>/` holding `session.json` + `.session-token` | [`planningRoot`](../../../src/utils/session/store.ts#L380) |
| seal | HMAC-SHA256 hex over the exact `session.json` bytes, stored in `.session-token` | [`verifySeal`](../../../src/utils/session/store.ts#L346) |
| jsonPath | key/index array locating an embedded session inside the top file | [`navigatePath`](../../../src/utils/session/resolver.ts#L20) |
| embedded child | a dispatched workflow's full `SessionFile` under `triggeredWorkflows[i].state` | [`EmbeddedSessionRef`](../../../src/schema/session.schema.ts#L17) |
| transient session | tmp-dir meta-bootstrap session resolved via in-memory registry, never enumerated | [`resolveSessionLocation`](../../../src/utils/session/store.ts#L426) |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|-----------|-------------------|
| 1 | What enforces the planning-root containment boundary (path-normalization, slug validation, `realpath` checks)? | Resolved | Two mechanisms: read side never composes a path (enumeration by stored `sessionIndex`), write/create side validates slugs via `assertValidSlug` (rejects `/ \ . ..`). | [Planning-root containment](#planning-root-containment-resolves-q1) |
| 2 | How should the tool's `child_index` compose with index-based child resolution while keeping the reference script's positional semantics? | Open | — | [Child addressing](#child-addressing-child_index-vs-index-based-resolution) — analysis done; the composition *decision* is explicitly deferred to plan-prepare per the design-philosophy note. |

Remaining follow-up items (out of scope for comprehension):
- Q2's resolution is a plan-prepare decision, not a comprehension gap — the mechanics are fully traced here; only the design choice remains.

## Deep-Dive Sections

### Planning-root containment (resolves Q1)

Two complementary mechanisms, verified in `store.ts`:

- **Read side needs no sanitization.** [`resolveSessionLocation`](../../../src/utils/session/store.ts#L404)
  never composes a path from the `session_index`: after the `/^[A-Z2-7]{6}$/` format check it
  enumerates directories under `planningRoot(workspaceDir)` with `readdir` and matches the
  `sessionIndex` *stored inside* each `session.json` (root field, then the recursive
  `walkEmbedded` over `triggeredWorkflows[i].state`). The only inputs to `resolve()` are
  `readdir`-returned entry names, so no agent-controlled string reaches the filesystem — escape by
  crafted index is structurally impossible.
- **Write/create side validates slugs.** [`assertValidSlug`](../../../src/utils/session/store.ts#L544)
  rejects `/`, `\`, `.` and `..`, and is called by both slug-accepting entry points:
  [`findPlanningFolderBySlug`](../../../src/utils/session/store.ts#L561) and
  [`ensurePlanningFolder`](../../../src/utils/session/store.ts#L612) (which creates
  `<planningRoot>/<slug>` mode 0700).
- Transient (meta-bootstrap) sessions bypass enumeration via the in-memory
  [`transientFolderByIndex`](../../../src/utils/session/store.ts#L637) registry — server-populated
  only, tmp-dir folders, always root-addressed (empty `jsonPath`).

### Child addressing: `child_index` vs index-based resolution

Two orthogonal ways to reach an embedded child, which the inspection surface must compose:

- **By the child's own `session_index`** — `resolveSessionLocation` returns the child's `jsonPath`
  and `loadSessionForTool` hands back the child as `loaded.state`. Existing tools address children
  this way exclusively.
- **By position from an addressed session** — the reference implementation
  (`scripts/inspect_session.py` in the #193 planning folder) takes `--child N` and returns
  `doc["triggeredWorkflows"][N]["state"]`. Note the exact reference semantics: `resolve()` indexes
  the **root document's** `triggeredWorkflows` (single-level positional addressing), and the
  `children` view — including the `children` key inside `summary` — is likewise always computed
  from the root document, even when `--child` is given. Positional addressing is therefore
  root-relative in the spec, one level deep; nested descent happens by passing a deeper session's
  own index instead. In the server port, `navigatePath(state, ['triggeredWorkflows', n, 'state'])`
  applied to `loaded.state` reproduces this when the addressed session is the root, and generalises
  it (addressed-session-relative) when a child's index is supplied — the composition
  `resolveSessionLocation` already performs for its own matching.
- Failure shape is already canonical: `navigatePath` throws `SessionStoreError(NOT_FOUND)` for a
  missing/out-of-range child, which `withSessionStoreErrors` + `describeSessionStoreError` turn into
  an actionable message.

### Portfolio-lens findings

Two complementary lenses (pedagogy, rejected-paths) applied independently to this material for #193.
See [pedagogy](portfolio-inspect-session-pedagogy.md), [rejected-paths](portfolio-inspect-session-rejected-paths.md),
and the [synthesis](portfolio-inspect-session-synthesis.md). Load-bearing conclusions: safety lives in
the shared `loadSessionForTool` primitive (not the tool body); the `child_index` contract must match
the reference script's root-relative one-level positional semantics; return compact projections, never
raw `session.json`; build by cloning `get_workflow_status` minus its advance/save tail; guard port
fidelity with a parity test against `scripts/inspect_session.py`.

### Test and docs surfaces for an additive tool

- **Unit/integration:** `tests/mcp-server.test.ts` — vitest, `createServer(config)` wired to a
  `Client` over `InMemoryTransport.createLinkedPair()`; one `describe('tool: X')` block per tool
  calling `client.callTool({ name, arguments })`. No test asserts an exhaustive tool list or count,
  so adding a tool breaks nothing existing (removals are guarded by explicit
  "old tool names removed" rejection tests). Store/schema behavior has dedicated suites
  (`session-store.test.ts`, `session-schema.test.ts`, `session-index.test.ts`).
- **E2E:** `tests/e2e/` snapshots capture workflow-walk payloads (activity/technique deliveries),
  not the MCP tool list — additive tool registration leaves snapshots unchanged.
- **Docs:** the docs site auto-captures tool registrations via
  [`captureTools`](../../../scripts/generate-site-data.ts#L285) (shims `server.tool` and records
  name/description/params), so a new tool flows into site data without manual edits. Two manual
  surfaces do exist: the README tool table + "registers 16 MCP tools" count (README.md line 40) and
  the per-tool table in `docs/api-reference.md`.
