# Comprehension: Token-Use Tracking and Cost Estimation

> Last updated: 2026-07-15
>
> Coverage: the mechanisms a per-activity / per-workflow token-use-tracking and cost-estimation feature will touch — session state & schema, the MCP tool-call contract (what the server does and does not observe), the activity/workflow completion path, artifact writing, and the one existing sizing/budget concept.
> Related artifacts: [state-tools.md](state-tools.md), [workflow-server.md](workflow-server.md), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md), [orchestration.md](orchestration.md), [hierarchical-dispatch.md](hierarchical-dispatch.md); portfolio lens analysis — [pedagogy](portfolio-token-use-tracking-pedagogy.md), [rejected-paths](portfolio-token-use-tracking-rejected-paths.md), [synthesis](portfolio-token-use-tracking-synthesis.md).
> Work-packages: #232 (Token Use Tracking and Cost Estimation, PR #233, branch `feat/232-token-use-tracking-and-cost-estimation`).

This is the codebase map for issue #232. The problem statement ([design-philosophy](../planning/2026-07-14-token-use-tracking/02-design-philosophy.md)): add per-activity and per-workflow token-use tracking and cost estimation, using the model's native usage capabilities where possible, logging results to the planning artifact on completion. The central architectural unknown — how native usage figures reach a server that only ever sees tool calls — is grounded below against the real tool contract.

## Architecture overview

The server is a small, single-purpose MCP server (TypeScript, Node 18+, `@modelcontextprotocol/sdk`). `@m2ux/workflow-server` v0.1.0; runtime `serverVersion` default `2.1.0` (`src/config.ts:130`). The source tree is compact (~40 files under `src/`):

- **Entry / wiring:** `src/index.ts` (`main()` → `loadConfig` → `createServer` → stdio transport), `src/server.ts` (`createServer` registers three tool/resource groups), `src/config.ts` (`loadConfig`, `ServerConfig`).
- **Tool handlers:** `src/tools/workflow-tools.ts` (1354 lines — the execution-plane tools: `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `get_trace`, `health_check`, `get_workflow_status`, `inspect_session`) and `src/tools/resource-tools.ts` (750 lines — `start_session`, `dispatch_child`, `get_technique`, `get_resource`).
- **Schemas:** `src/schema/*.ts` — Zod schemas for session (`session.schema.ts`), in-session state model + history events (`state.schema.ts`), workflow (`workflow.schema.ts`), activity (`activity.schema.ts`), technique, condition, resource. `schemas/*.json` are generated JSON-Schema mirrors published as the `workflow-server://schemas` MCP resource.
- **Session persistence:** `src/utils/session/` — `store.ts` (on-disk `session.json` + HMAC seal, atomic writes, slug/index resolution), `resolver.ts` (`loadSessionForTool`, `advanceSession`, `saveSessionForTool`, `sessionView`, `navigatePath`, `replacePath`), `derivation.ts` (base32 index derivation), `migration.ts` (legacy state migration), `crypto.ts` (server key), `params.ts` (`sessionIndexParam`, `contextTokensParam`).
- **Loaders:** `src/loaders/*` compose workflows / activities / techniques from the `workflows/` git worktree. Not on the feature's critical path except that `get_activity` is where `context_tokens` is consumed.
- **Observability:** `src/logging.ts` (`withAuditLog` wrapper — measures per-call duration, appends trace events), `src/trace.ts` (`TraceStore`, `TraceEvent`, HMAC-signed trace tokens).

**Overarching pattern:** a thin request/response tool layer over a sealed, file-backed state store. Every authenticated tool follows one shape: `loadSessionForTool` → read/compute → `advanceSession(state, draft => …)` → `saveSessionForTool` → return `{ content, _meta }`. There is no in-memory session object and no database; the durable record is `session.json`, and the in-memory `TraceStore` is a non-durable side channel (see below).

## Key abstractions

### `SessionFile` — the persisted session (`src/schema/session.schema.ts`)

`SessionFileSchema` / interface `SessionFile` (`session.schema.ts:57` base, `:163` interface, `:194` recursive schema) is the shape of `session.json`. Relevant fields:

- `variables: Record<string, unknown>` (`:92`) — the "variable bag". Arbitrary key/value; the workflow's decision/output state.
- `history: HistoryEntry[]` (`:105`) — append-only event log. **The natural home for per-event usage records.**
- `completedActivities: string[]` / `skippedActivities: string[]` (`:95-96`).
- `status: 'running' | 'completed' | 'aborted'` (`:113`) — flips to `completed` at the terminal activity.
- `triggeredWorkflows: EmbeddedSessionRef[]` (`:120`) — child workflows embedded recursively; the **whole work-package tree lives inside the top-level `session.json`** (child state at `triggeredWorkflows[i].state`). Any per-workflow aggregation must decide whether it lives on the child SessionFile or rolls up to the parent entry.
- `seq` / `ts` (`:75`, `:78`) — monotonic sequence + last-write epoch, bumped by `advanceSession`.
- `deliveredContent?: Record<string, Record<string, string>>` (`:156`) — the reference-not-repeat delivery ledger (agentId → content-key → hash). A precedent for a nested per-agent map on the session, if usage needs per-agent attribution.

There is **no** token / usage / cost field anywhere on `SessionFile`. Adding one means: (1) a new optional field on `SessionFileBaseSchema` + the `SessionFile` interface, and (2) an entry in `TOP_LEVEL_KEY_PRIORITY` (`src/utils/session/store.ts:85`) so canonical serialization orders it deterministically (missing entries fall to lexicographic order after the priority block — functional but unordered). Optional-with-default keeps existing sessions parsing without migration (the pattern used by `status`, `contextMode`, `planningFolderPath`).

`createInitialSessionFile(...)` (`session.schema.ts:258`) builds a fresh file and seeds the initial `history` (`workflow_started`, optional `variables_seeded`). A usage feature that pre-initializes a usage accumulator would seed it here.

### `HistoryEntry` + `HistoryEventType` (`src/schema/state.schema.ts`)

`HistoryEventTypeSchema` (`state.schema.ts:6-30`) is a closed `z.enum` of event types. Existing types include `activity_entered` / `activity_exited`, `variables_seeded`, `resource_fetched`, `technique_fetched`, `technique_bundled`, `variable_set`, `workflow_completed`. **No usage/token event exists.** A per-call or per-activity usage record would add a new enum member here (e.g. `usage_recorded`) and be pushed as a `HistoryEntry` (`:33-44`) whose `data: Record<string, unknown>` carries the figures. `HistoryEntry.data` is deliberately open (`z.record(z.unknown())`), so usage payloads need no schema change beyond the enum member — mirroring how `technique_bundled` carries `{ techniqueId, stepId, agentId }`.

Note two parallel state models coexist: `SessionFile` (`session.schema.ts`, the live on-disk shape) and the legacy `WorkflowState` (`state.schema.ts:114`, migrated-from shape). Both import `HistoryEntrySchema` from `state.schema.ts`, so a new event type is shared automatically. The feature targets `SessionFile`.

### Persistence contract (`src/utils/session/store.ts`, `resolver.ts`)

- `session.json` is written by `writeSessionFile` (`store.ts:309`): canonicalised deterministic JSON (`canonicaliseJson`, `:118`) → HMAC-SHA256 seal into `.session-token` → atomic write (`writeAtomic`, `:188`, tmp-file + fsync + rename).
- The seal (`.session-token`) is the integrity gate: `verifySeal` (`store.ts:346`) rejects any `session.json` edited outside the server. **Agents cannot write usage into `session.json` directly** — only the server can, via the standard mutate path. This is decisive for the sourcing question: whatever channel delivers usage, the server must write it.
- The canonical mutate+persist path is `advanceSession(state, mutate)` (`resolver.ts:163`) → `saveSessionForTool(loaded, next)` (`resolver.ts:192`). `advanceSession` bumps `seq`/`ts`, deep-clones a draft, runs the mutator (which pushes `history` events and sets `variables`), and returns the new state. Every existing history/variable mutation goes through here.
- For an embedded child, `saveSessionForTool` uses `replacePath` to slot the child sub-state back into the top file, then re-seals the whole file. A per-child usage record therefore automatically persists in the one top-level `session.json`.

### The tool-call contract (`_meta`, `context_tokens`)

- Every authenticated tool returns `{ content: [...], _meta: { session_index, validation, ... } }`. `_meta` is **response-only today** — a grep for `_meta` (`src/`) finds it only in server output and in `logging.ts:58` reading it off the *result* to extract validation warnings. **Nothing reads `_meta` (or any usage figure) off the incoming request.** The server observes only the declared tool parameters.
- Tool inputs are declared via Zod. Shared params: `sessionIndexParam`, `contextTokensParam` (`src/utils/session/params.ts`). `get_activity` requires `context_tokens` (`params.ts:20` note; consumed at `workflow-tools.ts:638`). This is a **declared** window size supplied by the caller — not a measured usage figure — but it is the existing precedent for "the calling agent reports a token quantity to the server on a tool call." A usage-reporting channel would extend this pattern: a new optional parameter (e.g. `usage`/`token_usage`) on `next_activity` (and/or `respond_checkpoint`, `dispatch_child`), or a server read of MCP request `_meta`.
- `withAuditLog(toolName, handler, traceOpts)` (`src/logging.ts`) wraps every handler: it times the call (`duration_ms`), emits an audit log line, and appends a `TraceEvent`. This is the single choke point through which every tool call passes — the natural interception point if usage rides in on a request field, or if per-call timing/counting is wanted.

### Existing sizing / budget concept (the one to mirror)

The only pre-existing "token" and "budget" concept is the **eager step-technique bundling budget** on `get_activity`:

- Config: `bundleHeadroomFraction` (default `0.80`, `DEFAULT_BUNDLE_HEADROOM_FRACTION`, `config.ts:49`) and `bundleCharsPerToken` (default `4`, `DEFAULT_BUNDLE_CHARS_PER_TOKEN`, `config.ts:50`), both env-overridable (`BUNDLE_HEADROOM_FRACTION`, `BUNDLE_CHARS_PER_TOKEN`) via `envNumberOrDefault` (`config.ts:63`), each with an in-code fallback.
- Use: `eagerBudgetChars = context_tokens × headroomFraction × charsPerToken` (`workflow-tools.ts:638`) sizes how much technique content `get_activity` inlines.

This matters for the feature as a **design precedent, not a data source**: it derives a budget from a *declared* `context_tokens`, and it establishes the house style for cost/pricing knobs — server-owned config constant + env override + in-code fallback. A per-model pricing table for cost estimation should follow the same shape. It is not a usage measurement: `context_tokens` is what the caller says its window is, not what it actually consumed.

### Trace stream (`src/trace.ts`)

`TraceEvent` (`trace.ts:6`) carries mechanical per-call fields — `name`, `ts`, `ms` (duration), `s` (ok/error), `wf`, `act`, `aid`, and optional `psid`/`pdepth`/`vw`. `TraceStore` (`trace.ts` class) is **in-memory, per-process, bounded (evicts oldest at 1000 sessions), and lost on restart** — explicitly not durable. It is exposed via `get_trace` and `next_activity`'s `_meta.trace_token`. Usage *could* be added as trace-event fields for live observability, but the durable per-activity/per-workflow record the feature needs must live in `session.json`, not the trace store.

## Design rationale (hypotheses for validation)

- **Why the server sees no token counts.** The architecture is deliberately server-managed and agent-opaque: agents call tools and receive content; the LLM that consumes/produces tokens runs in the agent's harness, entirely outside the server process. The server has no LLM client and no tokenizer wired into the request path. So "use native usage capabilities" cannot be satisfied by server self-measurement — it requires either the agent to *report* its harness-provided usage on a tool call, or an out-of-band harness feed. (Hypothesis; the sourcing decision is the work package's primary research question.)
- **Why `session.json` is the right home, not the trace store.** The trace store is intentionally ephemeral (bounded, in-memory, restart-lossy). `session.json` is the sealed, durable, per-work-package record that already carries `history`, `variables`, and completion status — matching "log results on completion." (Hypothesis, but strongly supported by the durability contrast.)
- **Why `history` events + a rolled-up field, mirroring existing patterns.** The codebase already separates per-event records (`history`) from rolled-up state (`variables`, `completedActivities`). Usage naturally maps the same way: a per-call/per-activity `usage_recorded` history event (audit trail) plus an aggregated usage/cost accumulator field (fast read at completion). This mirrors `variable_set` events feeding the `variables` bag. (Hypothesis on the intended shape.)
- **Why config-driven pricing.** The bundling-budget knobs show the established way to make numeric policy operator-tunable (config + env + fallback). Cost = tokens × per-model price; the price table is exactly this kind of tunable policy. (Hypothesis on where pricing config should live.)

## Domain concept mapping

| Domain term | Technical construct |
|---|---|
| Session / run | `SessionFile` (`session.schema.ts:163`) persisted as `session.json` under `.engineering/artifacts/planning/<slug>/` |
| Variable bag | `SessionFile.variables` (`session.schema.ts:92`) |
| Event log | `SessionFile.history` (`HistoryEntry[]`, `state.schema.ts:33`); event vocabulary `HistoryEventTypeSchema` (`state.schema.ts:6`) |
| Activity boundary | `activity_entered` / `activity_exited` events emitted in `next_activity` (`workflow-tools.ts:439`, `:447`) |
| Workflow completion | `workflow_completed` event + `status='completed'` in `next_activity` (`workflow-tools.ts:452-455`); parent notified (`:463-485`) |
| Per-call metadata channel | `_meta` on tool responses (response-only today); `context_tokens` declared input on `get_activity` (`params.ts`, consumed `workflow-tools.ts:638`) |
| Per-call interception | `withAuditLog` wrapper (`src/logging.ts`) — times every call, appends `TraceEvent` |
| Budget / sizing precedent | `bundleHeadroomFraction` × `bundleCharsPerToken` × `context_tokens` (`config.ts:49-50`, `workflow-tools.ts:638`) |
| Durable write path | `advanceSession` → `saveSessionForTool` → `writeSessionFile` (HMAC-sealed, atomic) (`resolver.ts`, `store.ts:309`) |
| Completion artifact hook | work-package `14-complete.yaml` `create-complete-doc` step (`finalize-documentation::create-complete-doc`); planning `README.md` progress table |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|---|---|---|---|
| 1 | How can native harness/model usage figures reach a server that only receives tool-call parameters? | Structure answered; channel choice open | Three channels grounded: (a) declared tool param (mirrors `context_tokens`), (b) MCP request `_meta` via the ignored `extra` handler arg, (c) out-of-band feed. Which one is a research decision. | [Deep-dive: the usage sourcing channel](#deep-dive-the-usage-sourcing-channel) |
| 2 | Where should the per-activity → per-workflow aggregation hook live, given nested `triggeredWorkflows`? | Answered | `next_activity`'s exit/entry/completion block (`workflow-tools.ts:434-485`) is the seam; child usage rolls up via the embedded-child persist path and the parent-notification cycle. | [Deep-dive: activity & workflow completion hooks](#deep-dive-activity--workflow-completion-hooks) |
| 3 | What is the durable on-disk shape for usage (history events vs. a rolled-up field vs. both)? | Answered | `usage_recorded` history event (open `data`) + optional rolled-up `SessionFile.usage` field; add enum member, optional field, `TOP_LEVEL_KEY_PRIORITY` entry; persists via `advanceSession`. | [Deep-dive: session-schema extension points](#deep-dive-session-schema-extension-points) |
| 4 | Where do results land on completion — a dedicated usage artifact or the planning `README.md`? | Open | Elicitation decision; the completion-doc hook (`14-complete.yaml` `create-complete-doc`) and the README progress table are the two workflow-side write points. | — |
| 5 | What pricing source drives cost estimation and how are unknown models handled? | Open | Research + elicitation decision; config-driven pricing table mirroring the bundling-budget knob pattern is the codebase-native shape. | — |
| 6 | Should usage be captured on tools *other than* `next_activity` (`respond_checkpoint`, `dispatch_child`, `get_activity`), and how is a wrong/absent reported figure handled? | Open | Lens-surfaced. If material spend happens between transitions, attribution-to-exited-activity mis-files it; the reported figure is unvalidated (modeled on unvalidated `context_tokens`). Both are design decisions. | [Deep-dive: structural risks](#deep-dive-structural-risks-portfolio-lens-findings) |
| 7 | Is cost frozen at completion or computed live at read time? | Open | Lens-surfaced. Durable-record requirement favors freezing (config price × tokens, with recorded pricing-table version); live computation breaks reproducibility. | [Deep-dive: structural risks](#deep-dive-structural-risks-portfolio-lens-findings) |
| 8 | Does any channel risk the "native usage" constraint by substituting server-side re-tokenization? | Open | Lens-surfaced. Re-tokenization removes agent dependency but approximates rather than measures and violates the constraint while looking authoritative — a path to avoid. | [Deep-dive: structural risks](#deep-dive-structural-risks-portfolio-lens-findings) |

### Remaining follow-up items (out of scope)

- Cross-session / fleet-level usage analytics and budget enforcement — explicitly out of scope per the design-philosophy constraints (single-run tracking only).
- Migrating the legacy `WorkflowState` model to carry usage — the feature targets `SessionFile`; the legacy shape only surfaces through migration.

## Deep-Dive Sections

### Deep-dive: the usage sourcing channel

Traces question 1 (the primary architectural unknown) down to the wire. The server process runs no LLM and no tokenizer on the request path, so it cannot self-measure. The token counts exist only in the *caller's* harness. Three concrete channels for getting them to the server, each grounded:

1. **Explicit tool parameter (agent-reported).** Add an optional input (e.g. `usage: { input_tokens, output_tokens, … }` or `token_usage`) to the tools that mark boundaries — primarily `next_activity` (it already runs on every activity transition and owns the exit/entry/completion block, `workflow-tools.ts:434-456`), and optionally `respond_checkpoint` (`workflow-tools.ts:1004`) and `dispatch_child` (`resource-tools.ts:389`). Precedent: `get_activity` already accepts a caller-declared token quantity (`context_tokens`, `params.ts`, used `workflow-tools.ts:638`), so "agent reports a token number on a tool call" is an established shape. Cost: the agent must be instructed (via workflow/technique content) to read its harness usage and pass it. Trade-off: relies on agent cooperation; robust, explicit, and testable.

2. **MCP request `_meta` read (harness/client-attached).** New finding: the SDK `ToolCallback` receives a second argument, `extra: RequestHandlerExtra` (`node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts:250`), and the request/result types carry `_meta?: Record<string, unknown>` (`mcp.d.ts:156`, `:273`). **The server's handlers currently ignore `extra` entirely** — every handler is written `async (args) => …` with a single parameter (`workflow-tools.ts:53`, `resource-tools.ts:123`), and no code reads request-side `_meta` (grep confirms `_meta` appears only in server *output* and in `logging.ts:58` reading the *result*). So a client/harness that attaches usage to the `tools/call` request `_meta` could be read by the handler via `extra` with no new declared parameter. Trade-off: depends on whether the specific MCP client forwards harness usage in request `_meta` (not guaranteed across harnesses); less explicit than a declared param and unvalidated by Zod.

3. **Out-of-band harness feed.** A separate mechanism (env, sidecar file, a dedicated report tool) writing usage the server later folds in. Highest coupling to a specific harness; least aligned with the existing tool-call contract. Likely the fallback, not the primary.

Whichever channel wins, the *write* is identical and server-only: fold the received figure into a `history` event + rolled-up field inside `advanceSession`, then persist under the seal. The channel choice is a research/elicitation decision; the code makes options 1 and 2 both viable, with option 1 the most consistent with existing patterns.

### Deep-dive: activity & workflow completion hooks

Traces question 2. Activity and workflow boundaries are both emitted in one place — the `next_activity` mutator (`workflow-tools.ts:434-456`):

- **Activity exit** (`:438-443`): when `draft.currentActivity` is non-empty, an `activity_exited` event is pushed and the activity is added to `completedActivities`. This is the seam to finalize a **per-activity** usage total: the exiting activity is known (`draft.currentActivity`), and if usage arrived on this same `next_activity` call it can be attributed to the activity being exited.
- **Activity entry** (`:444-447`): `currentActivity` is set to the new id, `activity_entered` pushed.
- **Workflow completion** (`:452-455`): on transition to `complete` or `TERMINAL_SENTINEL`, `workflow_completed` is pushed and `status='completed'`. This is the seam for the **per-workflow** roll-up (sum of per-activity totals) and for triggering the completion write.
- **Parent notification** (`:463-485`): when a child reaches terminal, the parent's `triggeredWorkflows[i]` flips to `completed` and a `workflow_returned` event is pushed on the parent (a *second* `loadSessionForTool`/`advanceSession`/`saveSessionForTool` cycle against the parent). This is the natural place to roll a child's per-workflow usage up into the parent's aggregate, if cross-level totals are wanted — the parent write already happens here.

Because the whole tree lives in one `session.json` (`triggeredWorkflows[i].state`), a child's per-activity/per-workflow usage persists in the single top file automatically via `replacePath` in `saveSessionForTool` (`resolver.ts:192`). Aggregation logic (per-activity → per-workflow) is pure computation over `history` usage events or an incrementally-updated field; either can be done inside the existing `next_activity` mutator with no new persistence machinery.

Caveat: `next_activity` is the orchestrator's tool, and a checkpoint response (`respond_checkpoint`) or a dispatch (`dispatch_child`) can also consume tokens between activity transitions. If those calls' usage must be captured, they need the same receiving channel — otherwise usage between the yield and the next `next_activity` is attributed to the wrong activity or dropped.

### Deep-dive: session-schema extension points

Traces question 3. The minimal, migration-safe on-disk shape:

1. **New history event type.** Add a member (e.g. `usage_recorded`) to `HistoryEventTypeSchema` (`state.schema.ts:6-30`). `HistoryEntry.data` is already `z.record(z.unknown())` (`state.schema.ts:41`), so the usage payload (`{ activityId, input_tokens, output_tokens, model, … }`) needs no further schema work — exactly how `technique_bundled` carries `{ techniqueId, stepId, agentId }`. This gives the per-event audit trail.

2. **New rolled-up field on `SessionFile` (optional).** For a fast read at completion without re-scanning `history`, add an optional field (e.g. `usage?: { perActivity: Record<string, …>; total: … }`) to `SessionFileBaseSchema` (`session.schema.ts:57`) and the `SessionFile` interface (`session.schema.ts:163`). Optional-with-absent keeps every existing `session.json` parsing unchanged (the pattern used by `status`, `contextMode`, `deliveredContent`). Mirror the `deliveredContent` precedent (`session.schema.ts:156`) if per-agent attribution is wanted (nested `agentId → …` map).

3. **Canonical serialization ordering.** Add the new top-level field name to `TOP_LEVEL_KEY_PRIORITY` (`store.ts:85-107`) so it serializes in a stable, human-friendly position. Omitting it is not a correctness bug (unlisted keys sort lexicographically after the priority block) but leaves the field in an arbitrary slot; the existing convention is to list every top-level field.

4. **Seeding (optional).** If the roll-up field should be initialized empty at session creation, do it in `createInitialSessionFile` (`session.schema.ts:258`) alongside the existing `history` seeding.

All writes flow through `advanceSession` → `saveSessionForTool` (`resolver.ts:163`, `:192`), which already re-seals and atomic-writes — no new persistence code. The JSON-Schema mirrors under `schemas/*.json` are generated (`npm run build:schemas`), so regenerate after touching the Zod schemas.

### Deep-dive: structural risks (portfolio lens findings)

Two complementary lenses (pedagogy, rejected-paths) were run against this design shape; full analysis in the [synthesis](portfolio-token-use-tracking-synthesis.md) and per-lens artifacts. Both converge on one structural fault and each surfaces distinct risks that downstream planning must resolve:

- **Convergent — a relayed usage figure carries unearned authority.** Usage modeled on `context_tokens` inherits that field's low-stakes trust (a wrong `context_tokens` only mis-sizes a bundle, self-correcting and visible) into a high-stakes, non-self-correcting setting (a wrong usage figure silently corrupts the durable cost record). Implication: treat the figure's provenance and validation as a first-class design question; prefer the channel that keeps a missing figure *visibly* missing over a server-computed figure that *looks* authoritative.
- **Unique (pedagogy) — attribution-to-exited-activity is the first-failing, slowest-discovered choice.** Keying per-activity usage to the activity being exited on `next_activity` (`workflow-tools.ts:438-443`) mis-files any tokens spent during the checkpoint-yield / dispatch window between transitions. The workflow total still sums correctly, so the error is arithmetically invisible.
- **Unique (rejected-paths) — server-side re-tokenization is the pressure trap, and cost-freshness fights reproducibility.** Re-tokenizing agent content server-side would remove the agent-cooperation dependency but violates the "native usage" constraint while looking authoritative. And computing cost live keeps prices fresh but breaks the "durable frozen cost record" requirement; freezing cost at completion (config price × tokens) with a recorded pricing-table version is the reproducible shape.
