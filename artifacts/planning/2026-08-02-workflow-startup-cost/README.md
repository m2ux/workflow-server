# Work-package startup cost — measurement record

Investigation supporting the startup-cost issue and the re-prioritisation of the session-presets epic (#401). Measured 2 August 2026 from Claude Code session transcripts of nine work-package runs between 7 June and 30 July 2026.

## Method

Each run's transcript (JSONL, one record per message) was parsed to reconstruct a tool-call timeline with per-turn token usage. Worker (subagent) transcripts stored alongside each session were included, windowed to the same time span. Four milestones were extracted per run:

1. **`start_session` call** — end of the bootstrap-protocol preamble (schema read, repo derivation).
2. **First worker dispatch** — the orchestrator hands the first meta activity to a fresh worker.
3. **Client first activity fetched** — the first `next_activity` call naming `start-work-package`; everything before this is the meta workflow's ceremony (discover-session, initialize-session, resolve-target, dispatch-client-workflow).
4. **`start-work-package` complete** — the `next_activity` call reporting that activity done; the next activity delivered is the first substantive one, so this is where real work begins.

Token figures are split between the orchestrator's main context and the workers' contexts. "Cache-write" is `cache_creation_input_tokens` — input paid at the cache-write rate to build context that wasn't already cached; it dominates because every fresh worker rebuilds its context from nothing. Checkpoint wait is the span between presenting a question to the user and receiving the answer, and is excluded from "active" durations.

> ## ⚠️ Correction, 2 August 2026 — the worker cache-write figures below are inflated
>
> The original analyser summed `cache_creation_input_tokens` once per transcript record. The harness writes one record per content block and repeats the same usage object on each, so a figure must be counted **once per request id**, not once per record. Re-counted that way, the whole of the profiled 27 July run comes to 3,717,424 rather than 7,751,699 — an inflation factor of **2.09×** overall, and **2.42×** across the startup window specifically.
>
> Output-token figures are unaffected (streaming partials are negligible) and the main-context column is close enough to stand, so **only the worker cache-write column below is wrong**. The corrected startup-window figures are:
>
> | Worker | As published | Corrected |
> |---|---:|---:|
> | discover-session | — | 41,509 |
> | initialize-session | — | 28,626 |
> | resolve-target | — | 23,328 |
> | dispatch-client-workflow | — | 30,573 |
> | **the four ceremony workers** | **307,272** | **124,036** |
> | start-work-package | — | 278,550 |
> | **five pre-work workers** | **974,517** | **402,586** |
>
> So the headline should read **roughly 400 thousand tokens of fresh worker context before real work begins, not 974 thousand**, and per-dispatch context establishment for a ceremony worker is **23 to 42 thousand tokens, not 60 to 100 thousand**. Proportions and rankings in the analysis below are unaffected, because the error scales everything alike; absolute magnitudes are roughly halved. Every downstream claim that quoted these figures has been restated — see the batched-dispatch record.

## Per-run results

| Run | Date | Request | Meta ceremony done | Real work begins | Checkpoint wait | Workers | Main out / cache-write | Worker out / cache-write |
|---|---|---|---|---|---|---|---|---|
| 03e43af3 | Jul 27 | issue 141 | +9.6 min | +31.7 min | 1.2 min | 5 | 25.0K / 104.1K | 51.6K / 974.5K |
| f5783c2a | Jul 12 | cluster 3 design | +7.3 min | +18.2 min | 1.0 min | 4 | 29.2K / 111.8K | 32.5K / 543.6K |
| 8e33afd9 | Jul 13 | PR 1 of issue 224 | +8.3 min | +650 min (overnight) | 533 min | 4 | 38.5K / 381.3K | 46.3K / 1,349.2K |
| b5474fca | Jul 14 | token tracking | +8.5 min | +750 min (overnight) | 501 min | 15 | 133.6K / 523.8K | 191.3K / 3,894.7K |
| 7d363a87 | Jul 10 | issue 193 | +7.3 min | (overnight, window ran on) | 432 min | 16 | 118.5K / 1,735.6K | 270.4K / 5,265.1K |
| e0f51155 | Jun 7 | issue 128 | +6.7 min | +1,389 min (overnight) | 308 min | 45 | 294.1K / 1,689.8K | 583.4K / 9,777.1K |
| 8608448b | Jul 28 | issue 327 (after debugging detour) | +18.4 min | +1,173 min (overnight) | 807 min | 20 | 150.3K / 956.8K | 788.6K / 9,125.2K |
| 3a2415c4 | Jul 28 | (mid-session start) | +40.8 min to first activity | — | 0.3 min | 4 | 55.8K / 161.6K | 84.2K / 1,623.5K |
| 7b04f0f4 | Jul 30 | issue 365 | +578 min (long pre-session idle) | +607 min | 66 min | 5 | 37.8K / 288.9K | 85.3K / 1,467.5K |

The two runs without overnight gaps or conversational detours — 03e43af3 and f5783c2a — are the clean bookends: **real work begins 17–31 active minutes after the request, after 0.66–1.08 million cache-write tokens and 61–77 thousand output tokens.** The meta-ceremony phase alone is stable at 6.7–9.6 minutes across every clean run regardless of the task.

## Where the cost sits

**Fixed payloads into the orchestrator, every run.** The bootstrap protocol's step 1 reads `workflow-server://schemas/workflow` — 43,917 bytes (~11K tokens) of full workflow JSON schema — observed identically in every run (43,737 bytes in the July 10–14 runs, 30,881 on June 7). The meta workflow's `get_workflow` delivery added 36,148–77,099 bytes in June–mid-July runs, dropping to 2,788–4,576 bytes in the July 28–30 runs (something already improved here). The planning-folder guide adds 5,052–12,238 bytes via `get_resource`. Total fixed MCP payload in the startup window: 55–124 KB per run (~14–31K tokens).

**Worker re-dispatch is the dominant token cost.** The July 27 run dispatched five workers before real work: discover-session (77 s), initialize-session (65 s), resolve-target (42 s), dispatch-client-workflow (165 s), then start-work-package (~17 min including a 1.2-minute intake question). Together they wrote 974.5K tokens of fresh worker context — nine times the orchestrator's own 104K. Each worker pays 100–300K cache-write to establish context, does a few minutes of work, and reports back.

**Definition weight per ceremony activity.** The worker transcripts of the July 27 run show what each ceremony dispatch pulls in. The `get_activity` delivery — activity text plus eagerly inlined techniques — is 42,547 bytes for initialize-session, 27,383 for resolve-target, and 23,388 plus 10,208 of follow-on technique fetches for dispatch-client-workflow, against a discover-session delivery of only 2,288 bytes. start-work-package adds 20,849 bytes of technique fetches and 17,064 of resources. Separately, every dispatch pays a ~60–100K cache-write baseline (harness context: system prompt, project instructions, tool schemas) before any workflow content arrives — visible in the two ceremony workers whose total cache-write was 59.6K and 67.4K on nearly no turns. Slimming what the ceremony activities bundle attacks the first number; only fewer dispatches (merge or solo) attacks the second.

**Per-activity persist cycles.** After each activity the orchestrator commits and pushes planning artifacts; in the July 27 run the cycle after start-work-package ran 14:11:48–14:13:52 (~2 minutes), and each ceremony activity carries its own.

**What the ceremony actually decides.** Of the four meta activities, the judgment calls are workflow matching (free text → workflow id) and the ambiguity/mismatch gates. Repo derivation (parse origin remote), session creation, and planning-folder resolution are deterministic; the server already performs parts of them inside `start_session`.

## Epic coverage survey (2 August 2026)

- **#401 W2 (context-cost profile, solo return)** — directly addresses worker re-dispatch, the dominant cost. The meta workflow (five small activities, session ends after dispatch) is the canonical short walk solo would clear. Epic was labelled `priority: low`.
- **#401 W1 (profiles)** — pre-seeded execution shape would remove intake questions that stall startup on a four-hop checkpoint relay.
- **#404 (delivery cost)** — server-side resolve waste and per-delivery cost reporting; marginal to startup burn (deliveries complete in 60–130 ms) but the declared home for performance issues as they are filed.
- **#353 (closed)** — precedent: re-dispatch overhead measured at 31% of a work-package run, shipped.
- **Uncovered:** the fixed schema payload, moving deterministic ceremony steps server-side, batching persist cycles — filed as the startup-cost issue this folder supports.

## Raw data

`runs-raw.txt` — analyzer output per run (milestones, token sums, MCP payload bytes by tool).
