# Deferred Items Register

> Token Use Tracking and Cost Estimation · #232 · updated 2026-07-15

Scope items and follow-ups deferred out of the current work. One row per item.

| ID | Item | Deferred from | Reason | Disposition |
|----|------|---------------|--------|-------------|
| DI-1 | Select the exact native-usage channel by which the agent relays model usage to the server | RE (DP-2) → Research (RS-4) → Assumptions Review (PL-1) | Depends on what the calling harness exposes; an implementation-interface decision, not a stakeholder assumption | **Resolved (2026-07-15):** declared `usage` param on `next_activity` + config price table — confirmed at assumptions-review interview (PL-1). OTEL deferred as optional enrichment. Evidence: [kb-research](04-kb-research.md#di-1-channel--head-to-head). |
| DI-2 | Finer-than-activity usage attribution — spend during checkpoints, dispatch/child windows, and non-`next_activity` tool calls | RE-3 (Q4) | v1 accepts per-activity granularity captured at the `next_activity` transition seam; finer attribution is added cost not required for the v1 record | Deferred beyond v1. Revisit if per-checkpoint or per-tool-call cost visibility is later needed. |
| DI-3 | Corpus Task 7 — orchestrator populate instruction (relay harness usage on `next_activity`) | [06-work-package-plan](06-work-package-plan.md) Task 7 | Server param inert without corpus instruction; separate `workflows` worktree deliverable | Open — follow-up work package on `workflows` branch after PR #233 merges |
| DI-4 | Corpus Task 8 — completion usage renderer (`NN-token-usage.md` + README summary) | [06-work-package-plan](06-work-package-plan.md) Task 8 | Agent-owned artifact rendering; depends on Task 7 for populated usage | Open — same follow-up as DI-3 |
| DI-5 | Claude Code OpenTelemetry as automatic usage enrichment | [04-kb-research](04-kb-research.md) | No per-activity identifier; subscription cost meaningless; adds OTLP infra | Deferred — optional future enrichment |
