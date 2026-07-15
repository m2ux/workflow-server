# Knowledge Base Research - Token Use Tracking and Cost Estimation

> #232 · 2026-07-15 · Complete

Research for the per-activity / per-workflow token-use-tracking and cost-estimation feature (issue #232, PR #233). The primary target is **DI-1: the exact declared channel by which native model usage reaches the server**; secondary targets are the **cost-model / pricing source** and confirming that **server-side re-tokenization is a rejected path**. A user-directed pass added a fourth question: **can Claude Code's native OpenTelemetry export be the usage/cost source?**

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|----------------|-----------------|
| Knowledge base (concept-rag) | `catalog_search` on token-usage / cost / observability / metering | No directly-relevant institutional content; corpus is general SW-engineering ebooks. One tangential match — *Observability Engineering* (structured events + rolled-up metrics, telemetry cost allocation, cost-vs-fidelity tradeoff) validates the general shape. Gap noted; web research carries the load. |
| Web / SDK verification | Installed `@modelcontextprotocol/sdk` type inspection; official Anthropic docs (pricing, Claude Code monitoring, Agent SDK cost-tracking); MCP spec `_meta`; `claude-code-guide` sub-agent verification | Channel evidence, current pricing + multipliers, OTEL contract, and re-tokenization all grounded and cited below. |

## Relevant Concepts Discovered

### Structured per-event records + rolled-up metrics (observability pattern)
**Source:** *Observability Engineering* (Majors, Fong-Jones, Miranda), concept-rag corpus — the one KB match (score ~0.08).
**Relevance:** Confirms the comprehension artifact's intended shape — a per-event audit record (`usage_recorded` history event) plus an aggregated rolled-up field, and the "telemetry cost allocation" / "cost-versus-fidelity tradeoff" framing that maps onto freeze-at-activity-time vs recompute-live.
**Key Insight:** Wide structured events keyed to a unit of work, with roll-ups computed over them, is an established observability idiom — the feature is applying a known pattern, not inventing one. (Confidence: MEDIUM — analogous, not MCP-specific.)

**Knowledge-base gap:** the concept-rag index holds no MCP-, LLM-usage-, or token-cost-specific guidance. All decision-bearing findings below are web/SDK-sourced.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Caller-declared token quantity as a Zod tool param | `src/utils/session/params.ts` (`context_tokens`), consumed `workflow-tools.ts:638` | Establishes the house shape for "agent reports a token number on a tool call" — the direct precedent for a declared `usage` param on `next_activity` | HIGH |
| Config constant + env override + in-code fallback for numeric policy | `config.ts:49-50` (`bundleHeadroomFraction`, `bundleCharsPerToken`) | The house shape for a tunable price table (per-model rates + price-table version, env-overridable) | HIGH |
| Per-event history + rolled-up field | `state.schema.ts` (`history[]`, open `HistoryEntry.data`), `session.schema.ts` (`deliveredContent` nested map precedent) | `usage_recorded` event (no schema change beyond an enum member) + optional `SessionFile.usage` roll-up | HIGH |
| MCP `_meta` as a general extension point | [MCP spec — `_meta`](https://modelcontextprotocol.io/specification/2025-06-18/basic/index) | A legal alternative channel; custom prefixes allowed (only `mcp`/`modelcontextprotocol`-suffixed prefixes reserved) | HIGH |

## Best Practices Found

### Freeze cost at capture time; version the price table
**Source:** [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing.md); [Agent SDK cost-tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking.md).
**Description:** The Agent SDK computes `total_cost_usd` from "a price table bundled at build time," explicitly warning it drifts when pricing changes or a model is unrecognized. Anthropic itself schedules price changes (Sonnet 5 introductory $2/$10 in → standard $3/$15 on 2026-09-01).
**Application:** Confirms RE-2 — freeze cost at activity time from a config table stamped with model id + price-table version; unknown model → tokens recorded, cost `unknown`. A versioned table also handles the scheduled Sonnet-5 change.

### Store base rates, derive cache rates from documented multipliers
**Source:** [Anthropic pricing — prompt caching](https://platform.claude.com/docs/en/about-claude/pricing.md).
**Description:** Cache pricing is a fixed multiple of base input across all models: 5-minute cache write = 1.25× base input, 1-hour cache write = 2× base input, cache read (hit) = 0.1× base input.
**Application:** The price table can hold just `{input, output}` per model and derive the three cache rates, shrinking the table and keeping cache pricing correct by construction. (Confidence: HIGH.)

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| A relayed usage figure carries unearned authority (modeled on low-stakes `context_tokens`, but corrupts a durable cost record if wrong) | Portfolio-lens synthesis (comprehension artifact) | Prefer the channel that keeps a missing figure *visibly missing* (declared, Zod-validated param) over one that looks authoritative; stamp provenance |
| Attribution-to-exited-activity mis-files spend between transitions | Comprehension deep-dive (structural risks) | Accept per-activity granularity at the `next_activity` seam for v1 (RE-3); finer attribution deferred (DI-2) |
| Server-side re-tokenization approximates rather than measures, yet looks authoritative | This research (see Re-tokenization below) | Rejected path — out of scope #1; usage must be harness-reported |
| Client-side cost estimates ≠ actual billing, and are meaningless on Pro/Max subscriptions | [Agent SDK cost-tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking.md); [Claude Code costs](https://code.claude.com/docs/en/costs.md) | Label recorded cost as an estimate; carry the API-key-vs-subscription caveat into the artifact and README |

## Recommended Approach

1. **Primary channel (DI-1): a declared `usage` object param on `next_activity`, populated by the orchestrator/harness.**
   - Rationale: mirrors the `context_tokens` precedent; Zod-validated and explicit (malformed/absent fails loudly at the boundary); keeps a missing figure visibly missing; harness-agnostic (not coupled to Claude Code). Crucially, the populator must be the **orchestrator/harness**, not the worker — see the mid-turn finding below.
2. **Cost:** config price table (per-model `{input, output}` + derived cache multipliers), stamped with model id + `priceTableVersion`, frozen at activity time; unknown model → cost `unknown`. Mirrors the bundling-budget config idiom.
3. **OTEL as optional complement, not the v1 primary:** see the OTEL section and the head-to-head — its per-activity attribution gap and infra burden make it a fallback/enrichment.
4. **Risks to monitor:** provenance/authority of the relayed figure; between-transition attribution (deferred); cost-is-an-estimate labeling.

**Status:** Ready for implementation-analysis and plan-prepare.

---

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| MCP `_meta` reserved convention for tool calls | MCP spec 2025-06-18; modelcontextprotocol GitHub | `_meta` is a general extension point; only `mcp`/`modelcontextprotocol` prefixes reserved; no usage/cost convention; SEP-414 reserves only trace-context keys |
| Claude Agent SDK / Claude Code: can an agent see its own usage mid-turn? | Messages API ref; Agent SDK cost-tracking; Claude Code hooks/statusline; `claude-code-guide` sub-agent | Usage is post-hoc, harness-only; agent cannot self-report mid-turn (see below) |
| Claude model pricing + cache multipliers | Anthropic pricing docs | Current per-MTok rates + universal cache multipliers captured |
| Claude Code OpenTelemetry metrics contract | Claude Code monitoring-usage docs; Agent SDK observability + cost-tracking; `claude-code-guide` sub-agent | Metric/attribute contract confirmed; `prompt.id` excluded from metrics; cost is an estimate |
| OTLP receiver in Node.js/TypeScript | OpenTelemetry JS docs; OTLP spec; collector receiver README | Ingesting OTLP means implementing a `/v1/metrics` endpoint (protobuf) or running a collector — real added infra |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| MCP spec — `_meta` | https://modelcontextprotocol.io/specification/2025-06-18/basic/index | `_meta` reserved for clients/servers to attach metadata; reserved prefixes only `…mcp`/`…modelcontextprotocol`; no usage convention | HIGH |
| Installed SDK `@modelcontextprotocol/sdk` 1.25.2 | `node_modules/.../shared/protocol.d.ts:189`, `server/mcp.d.ts:250` | `RequestHandlerExtra._meta?: RequestMeta` IS exposed to handlers via the `extra` arg; request/result carry `_meta?` | HIGH |
| Server handlers today | `src/tools/workflow-tools.ts`, `resource-tools.ts` | Every handler is single-arg `async ({…})`; `extra` is never destructured; nothing reads request `_meta` (only response `_meta` in `logging.ts:58`) | HIGH |
| Claude Messages API `usage` | [Anthropic pricing / API](https://platform.claude.com/docs/en/about-claude/pricing.md) | `usage` returns `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `server_tool_use` — maps 1:1 to RE-1's required figures | HIGH |
| Anthropic pricing | https://platform.claude.com/docs/en/about-claude/pricing.md | Current per-MTok rates (below) + cache multipliers (5m ×1.25, 1h ×2, read ×0.1); Sonnet 5 introductory $2/$10 → $3/$15 on 2026-09-01 | HIGH |
| Claude Code monitoring (OTEL) | https://code.claude.com/docs/en/monitoring-usage | Metric/attribute contract (below); `prompt.id` excluded from metrics; 60s default metric interval; cost is an approximation | HIGH |
| Agent SDK cost-tracking | https://code.claude.com/docs/en/agent-sdk/cost-tracking.md | `total_cost_usd`/`costUSD` are client-side estimates from a build-time price table; per-message `usage` available to the SDK *caller* | HIGH |
| Claude Code costs / subscription | https://code.claude.com/docs/en/costs.md | Session cost figure "isn't relevant for billing" for Max/Pro subscribers | HIGH |

### Current Claude pricing (captured 2026-07-15 — seeds the config price table; re-confirm at build time)

Per-MTok, USD. Cache rates follow the universal multipliers, so the table can store base input + output and derive them.

| Model | Base input | 5m cache write (×1.25) | 1h cache write (×2) | Cache read (×0.1) | Output |
|-------|-----------|------------------------|---------------------|-------------------|--------|
| Claude Opus 4.8 | $5 | $6.25 | $10 | $0.50 | $25 |
| Claude Sonnet 5 (intro, through 2026-08-31) | $2 | $2.50 | $4 | $0.20 | $10 |
| Claude Sonnet 5 (from 2026-09-01) | $3 | $3.75 | $6 | $0.30 | $15 |
| Claude Haiku 4.5 | $1 | $1.25 | $2 | $0.10 | $5 |
| Claude Fable 5 | $10 | $12.50 | $20 | $1 | $50 |

*(Full model list — including deprecated/retired Opus 4.1/4, Sonnet 4.x, Haiku 3.5 — is on the pricing page; seed the table with the models actually in use and mark others as they appear. Data-residency `inference_geo:"us"` adds ×1.1; fast mode and batch are separate modifiers — out of v1 scope.)*

### Claude Code OpenTelemetry contract (user-directed pass)

Verified against [monitoring-usage docs](https://code.claude.com/docs/en/monitoring-usage) and the `claude-code-guide` sub-agent.

**Enable:** `CLAUDE_CODE_ENABLE_TELEMETRY=1`; `OTEL_METRICS_EXPORTER` ∈ {`console`,`otlp`,`prometheus`,`none`}; `OTEL_EXPORTER_OTLP_PROTOCOL` ∈ {`grpc`,`http/json`,`http/protobuf`}; `OTEL_EXPORTER_OTLP_ENDPOINT` (**grpc/4317 is the documented default**; http/protobuf uses 4318 — a correction to the proposing brief, which stated 4318 as default). Default metric export interval **60000 ms (60 s)**.

**Metrics (all Counters):** `claude_code.token.usage` (unit tokens; attribute `type` ∈ {`input`,`output`,`cacheRead`,`cacheCreation`}; incremented after each API request), `claude_code.cost.usage` (unit USD; estimate), plus `session.count`, `lines_of_code.count`, `pull_request.count`, `commit.count`, `code_edit_tool.decision`, `active_time.total`.

**Attributes on metrics:** `session.id` (whole Claude Code session; `OTEL_METRICS_INCLUDE_SESSION_ID`, default true), `user.account_uuid`/`user.account_id`, `user.id`, `organization.id`, `model` (on token/cost), `terminal.type`; optional `app.version`, `app.entrypoint` (values incl. `sdk-ts`,`sdk-py`,`cli`). Cost also attributable by `skill.name`/`plugin.name`/`agent.name`.

**Attribution crux — decisive:** `prompt.id` is **intentionally excluded from metrics** to bound cardinality; metrics carry **no per-request/per-turn/per-activity identifier finer than `session.id`**, and no dimension resembling a workflow-server activity. Per-activity attribution from *metrics* is therefore **not possible**. The beta **traces** signal (`CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`, `OTEL_TRACES_EXPORTER=otlp`) does emit per-turn spans (`claude_code.interaction`, `claude_code.llm_request`, `claude_code.tool`) at a 5 s interval — so per-turn granularity exists in traces, but attributing a turn to a workflow-server *activity* still requires correlating span timestamps to the `next_activity` transition seam and the Claude Code `session.id` (not the server `session_index`).

**Cost caveat (verbatim):** "Cost metrics are approximations. For official billing data, refer to your API provider." Client-side estimates from a bundled price table; **not meaningful for Pro/Max subscription users** (rolling per-seat allowance, not per-token billing). Meaningful for API-key billing only.

### The mid-turn self-report finding (the DI-1 crux)

The Messages API returns `usage` only *after* a request completes; the Agent SDK surfaces per-message `usage` and end-of-run `total_cost_usd` to the **orchestrating caller**, not to the model in-context. Claude Code **hooks do not receive usage**; the **statusline** JSON does (`cost.total_cost_usd`, `context_window.current_usage.{input_tokens,cache_creation_input_tokens,cache_read_input_tokens}`); a per-turn `.session-usage.json` file is only an **open feature request** (anthropics/claude-code #52089), not shipped. **Conclusion: the agent-in-the-loop cannot read its own usage at the moment it calls a tool.** Whatever channel is chosen, the *populator is the orchestrator/harness*, not the worker's self-knowledge. This sharpens RE-4/DP-2's "agent-relayed" to "**orchestrator/harness-relayed**."

### Re-tokenization (rejected path — confirmed)

The server runs no LLM and no tokenizer on the request path, and never sees the agent's full context (only tool-call payloads). Any server-side token count (`count_tokens` or a local tokenizer) is model-specific and would *approximate* a number it cannot faithfully measure, while presenting as authoritative — violating the "native usage" constraint. Confirms out-of-scope #1 and DP-2. Rejected.

### DI-1 channel — head-to-head

| Dimension | Declared `usage` param on `next_activity` | Request `_meta` via SDK `extra` | Claude Code OTEL ingest |
|-----------|-------------------------------------------|---------------------------------|-------------------------|
| Fidelity | Real billing tokens IF orchestrator relays the harness figure | Same (same source; different transport) | Real emitted token counts; cost is an estimate |
| Per-activity attribution | Exact — server owns the `next_activity` seam and receives usage at it | Exact — same seam, read from `extra._meta` | **Weak** — metrics key only on `session.id` (no activity/turn dim); traces (beta) give per-turn but need timestamp↔seam correlation |
| Populator | Orchestrator/harness (worker can't self-measure) | Orchestrator/harness / MCP client | Claude Code runtime (automatic) |
| Infra/setup burden on user | None (a tool param) | None (a request field) | **High** — server must ingest OTLP (`/v1/metrics` endpoint or a collector) + telemetry env vars |
| Testability | High — Zod-validated, unit-testable | Medium — unvalidated by Zod; requires request shaping | Low — needs a live OTLP feed |
| Graceful degradation | Absent → omit (visibly missing) | Absent → omit; silent if `_meta` simply not sent | Absent when telemetry off; time-window approximation only |
| Harness coupling | **None** (harness-agnostic) | None (MCP-generic) | **Couples the feature to Claude Code** |
| Price table needed? | Yes (config table) | Yes | Optional — `cost.usage` emits USD, but it's an estimate from CC's own bundled table |

**Recommendation:** Adopt the **declared `usage` param on `next_activity`** as the v1 primary channel (harness-agnostic, exact per-activity attribution, Zod-validated, testable, degrades visibly), with the **config price table** for cost. Treat **Claude Code OTEL** as an **optional future enrichment/fallback**, not the v1 source: it cannot attribute usage to a workflow *activity* from metrics (only `session.id`), its cost metric is an explicit estimate (and meaningless on Pro/Max subscriptions), and consuming it forces OTLP-ingest infrastructure onto a currently stdio-only MCP server — coupling the feature to one harness. If OTEL is ever adopted, the beta traces signal (not metrics) is the only path to per-turn granularity, and even then activity attribution needs the same `next_activity`-seam correlation the declared param gives directly. A hybrid ("OTEL when a collector is present, declared-param otherwise") is possible but multiplies surface area for marginal v1 benefit — recommend deferring it.

### Open Research Candidates

Research has converged. Remaining items are irreconcilable by research (design/operational) and carry to their handoff targets.

| ID | Candidate | Classification | Rationale | Handoff |
|----|-----------|----------------|-----------|---------|
| RC-1 | Bind the exact channel: declared `usage` param vs request `_meta` vs OTEL ingest (or hybrid) | Irreconcilable — design decision | Both param and `_meta` are viable at the server; OTEL is a harness-coupled complement. Evidence gathered; the *choice* is a design pick, not a researchable fact | stakeholder (settle in implementation-analysis / plan-prepare) |
| RC-4 | Which harness surface actually delivers usage to the orchestrator for relay in the deployment (Agent SDK result message / Claude Code OTEL / statusline) | Irreconcilable — operational fact | Depends on the specific harness running the workflow; graceful degradation covers absence | stakeholder (operational) |

### Alignment with KB Research

All decision-bearing findings are web/SDK-sourced (the KB held no MCP/LLM-usage content — gap noted above). The one KB match (*Observability Engineering*) is consistent with the intended per-event + rolled-up shape; no contradictions.
