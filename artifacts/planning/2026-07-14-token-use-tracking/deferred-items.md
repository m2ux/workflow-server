# Deferred Items Register

> Token Use Tracking and Cost Estimation · #232 · updated 2026-07-15

Scope items and follow-ups deferred out of the current work. One row per item.

| ID | Item | Deferred from | Reason | Disposition |
|----|------|---------------|--------|-------------|
| DI-1 | Select the exact native-usage channel by which the agent relays model usage to the server | RE (DP-2) → Research (RS-4) | Depends on what the calling harness exposes; an implementation-interface decision, not a stakeholder assumption | **Research complete; decision deferred to implementation-analysis / plan-prepare** (in-workflow handoff, NOT external stakeholder review — do not post to issue tracker). Evidence + full head-to-head in [kb-research](04-kb-research.md#di-1-channel--head-to-head). Options: (a) declared `usage` param on `next_activity` + config price table; (b) request `_meta` via SDK `extra`; (c) Claude Code OTEL ingest; (d) hybrid. **Recommendation carried: (a)** — only option giving exact per-activity attribution under the disposable-worker topology, harness-agnostic, Zod-validated, missing-figure-visible; (b) strictly worse; (c)/(d) deferred (OTEL metrics lack a per-activity/per-turn identifier — only `session.id` — its cost is an estimate meaningless on Pro/Max, and OTLP ingest adds infra + harness coupling). Key constraint: usage is orchestrator/harness-relayed, never worker-self-measured. |
| DI-2 | Finer-than-activity usage attribution — spend during checkpoints, dispatch/child windows, and non-`next_activity` tool calls | RE-3 (Q4) | v1 accepts per-activity granularity captured at the `next_activity` transition seam; finer attribution is added cost not required for the v1 record | Deferred beyond v1. Revisit if per-checkpoint or per-tool-call cost visibility is later needed. |
