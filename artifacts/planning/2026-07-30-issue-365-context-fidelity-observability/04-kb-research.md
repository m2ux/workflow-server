# Knowledge Base Research - Context Fidelity and Observability

> #365 · 2026-07-31 · Complete

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|------------|-----------------|
| concept-rag catalog / concept / chunks | `identify-best-practices` match → catalog_search, concept_search, chunks_search | Configuration-management and agent cost-monitoring patterns; no library doc on multi-provider token metering. Gap noted. |
| Web — provider usage APIs | Official OpenAI / Anthropic docs + streaming normalizer write-up | Per-request usage is delta; session totals are plain sums; cache field conventions differ by provider. |
| Web — agent harnesses | Cursor SDK + Admin API docs | Per-turn delta events; run-level cumulative is an explicit sum of turn deltas. |
| Web — pricing | OpenAI API pricing + Anthropic Claude pricing (fetched 2026-07-31) | Current list prices for flagship families; cache and tier multipliers matter for estimates. |
| Web — price-table practice | LiteLLM cost map, Langfuse, cost-tracking tool surveys | Externalized, reloadable price maps with config overrides — not hard-coded constants. |

Research focus (from bag + RE-4 residue): (1) external usage-reporting precedent for DELTA, (2) current model pricing for a cost estimate, (3) hard-coded vs config-driven price tables.

## Relevant Concepts Discovered

### Configuration management (prices as configuration)
**Source:** ISO/IEC/IEEE 15288 / Continuous Delivery / Infrastructure as Code (concept-rag `configuration management`)  
**Relevance:** S3's price table is a configuration item with a lifecycle (baseline, change control, status accounting). Hard-coding prices embeds a baseline that cannot be updated without a code release — classic configuration drift.  
**Key Insight:** Treat unit prices like other operable config: externalize, version, and own currency separately from the aggregation algorithm.

### Resource-aware optimization / agent monitoring
**Source:** *Agentic Design Patterns* (Antonio Gulli) — Ch. 16 Resource-Aware Optimization, Ch. 19 Evaluation and Monitoring (concept-rag)  
**Relevance:** Cost and token usage are first-class agent-system concerns alongside correctness; monitoring and resource accounting belong at the orchestration boundary.  
**Key Insight:** The server's `record_usage` → aggregate → derive cost path is the resource-accounting half of agent monitoring; it should not invent a second persistence path for the same magnitudes (#338 W3 owns the planning-artifact record).

### Per-request usage vs conversation growth
**Source:** OpenAI advanced usage / Responses API usage docs; multi-turn cost guides  
**Relevance:** Multi-turn *prompt size* grows because history is re-sent, but each response's `usage` field still describes **that request only**.  
**Key Insight:** DELTA reporting is the provider default. Cumulative spend is always a client-side sum of per-call rows — matching S3's plain-sum aggregate.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Per-call delta usage + client sum | OpenAI usage field; Anthropic Messages usage; Cursor SDK `SDKUsageMessage` vs `run.usage` | Document DELTA on `record_usage`; `projectUsage` aggregate = arithmetic sum of rows | HIGH |
| Normalize-then-price | Spanlens multi-provider write-up; LiteLLM / Langfuse | Normalize harness fields to input/output/(cache) before applying a price map; never price raw `z.record(z.unknown())` blobs | HIGH |
| External cost map + override | LiteLLM `model_prices_and_context_window.json` + reload; Langfuse pricing DB | Ship defaults from config (or bundled JSON loadable from config path); allow override without code change; label estimate as non-invoice | HIGH |
| Dual surface: event delta / rollup total | Cursor SDK docs | Keep history rows as deltas; expose rollup only on `inspect_session view: usage` | HIGH |
| Configuration over hard-code | Continuous Delivery / IaC configuration-drift guidance | Reject hard-coded USD rates in server source for production estimates | HIGH |

## Best Practices Found

### DELTA per dispatch; sum for session totals
**Source:** [OpenAI advanced usage](https://developers.openai.com/api/docs/guides/advanced-usage); [OpenAI token counting](https://developers.openai.com/api/docs/guides/token-counting); [Cursor SDK token usage](https://cursor.com/docs/sdk/python#token-usage)  
**Description:** Provider APIs return usage for the completed request (or turn). Harnesses that expose both surfaces treat turn events as deltas and run totals as sums (`sum_token_usage`). Streaming requires assembling the final usage object once — not summing intermediate stream chunks that restate cumulative fields.  
**Application:** S3's chosen DELTA convention is industry-default. Resume workers must report only the new dispatch's work; a resumed row must not re-include prior-dispatch tokens. Aggregate = plain sum validates SC-4.

### Normalize provider-specific cache fields before cost
**Source:** [Spanlens streaming gotchas](https://dev.to/spanlens/tracking-token-usage-across-openai-anthropic-and-gemini-every-streaming-gotcha-i-hit-4mf3); [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)  
**Description:** OpenAI: `prompt_tokens` already includes cache; cached count is a subset. Anthropic: `input_tokens` is uncached only; total input = `input_tokens + cache_read + cache_creation`. Opposite math — one shared normalizer without provider rules silently mis-prices cache-heavy runs.  
**Application:** Before pricing, map harness payloads into a small internal shape (`model`, `input_tokens`, `output_tokens`, optional `cache_read_tokens` / `cache_write_tokens`). Cost = price-weighted reduction over that shape. Unknown fields pass through unpriced rather than inventing rates.

### Externalized, reloadable price tables
**Source:** [LiteLLM custom pricing](https://docs.litellm.ai/docs/proxy/custom_pricing); [LiteLLM model cost map sync](https://docs.litellm.ai/docs/proxy/sync_models_github); [Langfuse / cost-tool survey](https://leanlm.ai/blog/llm-cost-tracking-tools)  
**Description:** Production tooling keeps a model→rate map outside business logic, supports reload without full redesign, and allows per-deployment overrides for negotiated rates. Hard-coded constants rot on every provider price change.  
**Application:** Research preference when cost is reopened (D-4): prices from config. Not applied in this package. Planning-artifact write remains #338 W3 (D-2).

### Named consumer at the tool boundary
**Source:** Requirements SC-5; deferred-items D-2 / D-4; agent monitoring pattern  
**Description:** Token aggregate is consumed by operators/debuggers via `inspect_session view: usage` (and later by #338 W3 artifact for the token record). Money/cost figure is D-4. This package stops at the token projection.  
**Application:** SC-5 = token aggregate sufficiency; D-2 owns artifact write; D-4 owns any later price capture.

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| Summing cumulative stream chunks (double-count cache) | LangChain Anthropic issue #10249; Spanlens | Take final usage once per call; never sum intermediate `message_delta` cache fields |
| Hard-coded USD rates in source | LiteLLM / FinOps practice; DP-9 / RE-4 | Config table + documented refresh; estimate stamped with price-table version or "as of" date if cheap |
| Pricing without model id | OpenAI/Anthropic multi-model pricing | Normalized usage must carry `model` (or map activity→default model in config); missing model → tokens only, cost null/omitted |
| Treating estimate as invoice | Cursor Admin `chargedCents` vs model cost | Label derived cost as estimate; harness may add platform fees outside provider list prices |
| Cumulative `record_usage` from a harness that already summed | Cursor `run.usage` vs turn event | Protocol: callers pass turn/dispatch delta only; document that harness cumulative totals must not be re-posted as a single row without subtracting prior |

## Recommended Approach

**Package decision (RE-4, 2026-07-31):** stakeholder *"defer price capture. token usage is sufficient."* Cost/price-table work is [deferred-items](deferred-items.md) D-4. Research below retains pricing findings for a later package; **this package applies only the token half.**

1. **Primary Pattern (in-package):** DELTA rows → plain-sum token aggregate on `inspect_session view: usage` (optional `agent_id` attribution).
   - Rationale: Matches provider/harness DELTA defaults and SC-4/SC-5 (token aggregate). Artifact write remains D-2 (#338 W3).

2. **Key Practices to Apply (in-package):**
   - Document DELTA as the cross-harness convention (already settled in requirements).
   - Expose plain-sum token aggregate; no config price table, hard-coded rates, or derived money field in this package.
   - Consumer for SC-5: operator/debugger reading token totals on `inspect_session view: usage`.

3. **Deferred pattern (D-4 — not in-package):** Normalize usage → config-priced estimate (research recommended option (b); list-price snapshot and risks below remain valid seeds when cost is reopened).

4. **Risks to Monitor (token path):**
   - Harness field diversity — keep `usageSchema` permissive at the wire; aggregate documented token fields only.
   - Cumulative `record_usage` misuse — protocol: dispatch delta only.

## Current Model Pricing Snapshot (research feed for RE-4)

Fetched **2026-07-31**. Figures are **list prices in USD per 1M tokens** for seeding a config table — not negotiated rates. Always re-check official pages before shipping a freeze.

### OpenAI (official API pricing)

Source: [https://developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing)

| Model | Input $/M | Cached input $/M | Output $/M | Notes |
|-------|-----------|------------------|------------|-------|
| gpt-5.6-sol | 5.00 | 0.50 | 30.00 | Flagship; long-context tier higher |
| gpt-5.6-terra | 2.00 | 0.20 | 12.00 | Balance tier |
| gpt-5.6-luna | 0.20 | 0.02 | 1.20 | Cost-sensitive |
| gpt-5.5 | 5.00 | 0.50 | 30.00 | |
| gpt-5.4 | 2.50 | 0.25 | 15.00 | |
| gpt-5.4-mini | 0.75 | 0.075 | 4.50 | |
| gpt-5.4-nano | 0.20 | 0.02 | 1.25 | |
| gpt-5.3-codex | 1.75 | 0.175 | 14.00 | Specialized |

Long-context columns on the same page raise input/output for several models; Fast mode / regional uplift exist. Seed config with short-context standard rates unless the harness reports context tier.

### Anthropic (official Claude pricing)

Source: [https://platform.claude.com/docs/en/about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing)

| Model | Input $/M | Cache read $/M | Output $/M | Notes |
|-------|-----------|----------------|------------|-------|
| Claude Opus 5 (and 4.5–4.8) | 5.00 | 0.50 | 25.00 | Cache write 5m 1.25× / 1h 2× base |
| Claude Sonnet 5 | 2.00 | 0.20 | 10.00 | **Intro through 2026-08-31**; then $3 / $15 |
| Claude Sonnet 4.6 / 4.5 | 3.00 | 0.30 | 15.00 | |
| Claude Haiku 4.5 | 1.00 | 0.10 | 5.00 | |

Cache multipliers (Anthropic docs): 5-minute cache write = 1.25× base input; 1-hour write = 2×; cache hit = 0.1× base input.

### Suggested minimal seed for this package

For a first config table aimed at common agent harnesses (not full catalog):

| model_id | input_per_mtok | output_per_mtok |
|----------|----------------|-----------------|
| gpt-5.4 | 2.50 | 15.00 |
| gpt-5.4-mini | 0.75 | 4.50 |
| gpt-5.6-terra | 2.00 | 12.00 |
| claude-sonnet-4-5 | 3.00 | 15.00 |
| claude-sonnet-5 | 2.00 | 10.00 |
| claude-opus-5 | 5.00 | 25.00 |
| claude-haiku-4-5 | 1.00 | 5.00 |

Alias keys should match whatever string harnesses put in usage payloads (implementation-analysis to inventory live shapes). Missing model → aggregate tokens without cost.

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| OpenAI usage multi-turn cumulative vs incremental | developers.openai.com advanced usage, token counting | Per-response usage; client sums for totals |
| Anthropic streaming usage cache | platform.claude.com prompt-caching; Spanlens; LangChain #10249 | Split stream events; opposite cache inclusion; don't double-count deltas |
| Cursor SDK / Admin usage | cursor.com SDK python; Admin filtered-usage-events | Turn delta + run sum; event-level admin tokens |
| OpenAI / Anthropic pricing July 2026 | Official pricing pages | Tables above |
| LiteLLM Langfuse price table config | litellm docs; leanlm cost tools | External map + override, not hard-code |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| OpenAI API Pricing | https://developers.openai.com/api/docs/pricing | Current GPT-5.x family rates | HIGH — seed prices |
| OpenAI Advanced usage | https://developers.openai.com/api/docs/guides/advanced-usage | `usage` on each call | HIGH — DELTA |
| Anthropic Pricing | https://platform.claude.com/docs/en/about-claude/pricing | Sonnet 5 intro window; Opus/Haiku | HIGH — seed prices |
| Anthropic Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | Total input = sum of three fields | HIGH — normalize |
| Cursor SDK Token usage | https://cursor.com/docs/sdk/python | Turn delta vs cumulative run | HIGH — harness precedent |
| Cursor Admin API | https://cursor.com/docs/account/teams/admin-api | Event-level tokens + cents | MEDIUM — billing vs estimate |
| Spanlens streaming gotchas | https://dev.to/spanlens/tracking-token-usage-across-openai-anthropic-and-gemini-every-streaming-gotcha-i-hit-4mf3 | Provider normalizer rules | HIGH |
| LiteLLM cost map | https://docs.litellm.ai/docs/proxy/custom_model_cost_map | External reloadable map | HIGH — RE-4 (b) |
| LiteLLM custom pricing | https://docs.litellm.ai/docs/proxy/custom_pricing | Overrides for negotiated rates | MEDIUM |

### Community Practices

| Practice | Source | Application |
|----------|--------|-------------|
| One parser per provider, then common shape | Spanlens | Normalize at projection, not at `record_usage` wire |
| Assert on aggregate token numbers in tests | Spanlens | SC-4/SC-5 tests with fixture rows (plain sum); cost-bearing asserts only if D-4 reopens |
| Prefer config override over forking entire map | LiteLLM | Small default map in config; override via env if needed |

### Alignment with KB Research

All material KB concepts (configuration management, agent resource monitoring) were **confirmed and extended** by web sources. No KB contradiction.  
**KB gap:** library has no multi-provider LLM metering cookbook — web filled that gap entirely for focus areas 1–3.

## Findings Synthesis (requirements map)

| Requirement / residue | Research conclusion |
|----------------------|---------------------|
| S3 DELTA convention | Supported by OpenAI, Anthropic, Cursor SDK, Admin event model. Resume = new delta row only. |
| SC-4 plain-sum aggregate | Matches how every harness builds run totals from turn deltas. |
| RE-4 price source / cost | **Deferred (D-4).** Stakeholder: token usage sufficient; no price table or money figure in this package. Research still prefers config-driven table if cost is reopened. |
| RE-4 named consumer (tokens) | **Primary:** human/operator via `inspect_session view: usage` (token aggregate). **Secondary (D-2):** #338 W3 planning artifact. |
| SC-5 | Token aggregate only (plain sum of DELTA rows); cost half = D-4. |
| Normalized usage shape | Needed if/when pricing ships (D-4); not required for in-package SC-5. |

## Open Research Candidates

| ID | Statement | Classification | Rationale | Resolution / Handoff | Outcome |
|----|-----------|----------------|-----------|----------------------|---------|
| RC-1 | Does external precedent support DELTA for resumed / multi-turn usage? | Resolved | OpenAI/Anthropic per-request usage; Cursor turn delta + summed run | See Recommended Approach + Web Findings | Resolved |
| RC-2 | What list prices seed a cost estimate table? | Resolved | Official OpenAI + Anthropic pages 2026-07-31; snapshot tables above | Seed config; re-verify at implementation | Resolved |
| RC-3 | Hard-coded vs config-driven price tables? | Resolved | LiteLLM/Langfuse/CD configuration practice → config-driven **if** cost ships | RE-4 deferred price capture (D-4); (b) remains research preference for a later package | Resolved (deferred with D-4) |
| RC-4 | Exact harness field names in live `record_usage` payloads for this repo's callers | Irreconcilable | Not in published docs of this package; needs code/corpus inspection | handoff: **code-analysis** (implementation-analysis) | Irreconcilable (code-analysis) |
| RC-5 | Who is the human owner that *must* refresh the price table, and how often? | Resolved | No price table in this package | D-4 defers ownership with the feature | Resolved (deferred with D-4) |

No reconcilable-by-research candidates remain after this pass (`has_reconcilable_research` = false).

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| OpenAI API Pricing | Price seed | Flagship models table |
| OpenAI Advanced usage | DELTA | usage field |
| Anthropic Pricing | Price seed | Model pricing table |
| Anthropic Prompt caching | Normalize | cache field math |
| Cursor SDK Python | Harness dual surface | Token usage |
| Spanlens DEV article | Cross-provider gotchas | Full article |
| LiteLLM cost map docs | Config practice | custom map + reload |
| Agentic Design Patterns (KB) | Agent cost monitoring | Ch. 16, 19 |
| Configuration management corpus (KB) | Externalize prices | Continuous Delivery / IaC drift |

## Research Assumptions (post-collection)

Assumptions collected for this activity live in [02-assumptions-log.md](02-assumptions-log.md) as RS-1…RS-6 and RE-4. RE-4 closed by stakeholder: *"defer price capture. token usage is sufficient"* — Corrected; price capture = [deferred-items](deferred-items.md) D-4. RS-1 Validated (DELTA + plain sum). RS-2…RS-6 Deferred with D-4 / Corrected (RS-4) for SC-5 token-only. No second copy of assumption prose here.

**Status:** Complete
