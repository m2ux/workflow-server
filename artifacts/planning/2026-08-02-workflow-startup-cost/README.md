# Work-package startup cost — measurement record

Investigation supporting the startup-cost issue and the re-prioritisation of the session-presets epic (#401). Measured from Claude Code session transcripts of nine work-package runs between 7 June and 30 July 2026, first on 2 August 2026 and re-measured on 3 August with the committed run profiler ([#409](https://github.com/m2ux/workflow-server/issues/409)).

## Method

The figures here are the output of `npm run profile:run`, the committed run profiler, over the nine session transcripts. Each transcript (JSONL) is parsed into a tool-call timeline with token usage. A worker (subagent) transcript stored alongside the session joins the run's figures when the **dispatch** falls inside the window, and its whole ledger comes with it — a dispatch made to do startup work costs what it costs, even if its last turn lands after the milestone. No worker in these nine runs overruns its window, so counting whole ledgers and counting only in-window turns give the same answer here. Five milestones are placed per run:

1. **`start_session` call** — end of the bootstrap-protocol preamble (schema read, repo derivation).
2. **First worker dispatch** — the orchestrator hands the first meta activity to a fresh worker.
3. **First checkpoint** — the first `present_checkpoint`.
4. **Client first activity fetched** — the first `next_activity` call against a client session; everything before this is the meta workflow's ceremony (discover-session, initialize-session, resolve-target, dispatch-client-workflow). A session index that never carries a meta activity belongs to the client workflow, and the first call against it names that workflow's `initialActivity` — `start-work-package` on eight of the nine runs, `intake-and-context` on 3a2415c4, which walks workflow-authoring.
5. **Opening activity complete** — the next `next_activity` call after that one. A `next_activity` call names the activity being requested and carries the step manifest of the one just finished, so the call after the opening activity is fetched is the call reporting it done. The next activity delivered is the first substantive one, so this is where real work begins, and it closes the measurement window.

Token figures are split between the orchestrator's main context and the workers' contexts. "Cache-write" is `cache_creation_input_tokens` — input paid at the cache-write rate to build context that wasn't already cached; it dominates because every fresh worker rebuilds its context from nothing. A usage figure belongs to a **response**: the harness writes one transcript record per content block and repeats the same usage object on each, so each field is reduced across a response's records rather than summed over them. Checkpoint wait is the span between putting a question to the user and receiving the answer, and is excluded from "active" durations.

> ## Restatement, 3 August 2026 — measured again with the committed profiler
>
> This record was first written from a throwaway analyser that was never committed, and two faults in it reached the published figures. Both are corrected above and below; the original capture survives in `runs-raw.txt` under its own note.
>
> **Usage was summed once per transcript record.** A figure belongs to a response, and the harness repeats one usage object across every content block of it, so a per-record summation multiplies the figure by however many blocks the response happened to have. Counted **once per request id**, the whole of the profiled 27 July run comes to 3,717,424 rather than 7,751,699 — **2.09×** over the run, and **2.42×** across its startup window. Output-token figures move by well under a percent, because streaming partials are single digits, and the main-context column is unaffected in kind. The worker cache-write column carried the whole of the error:
>
> | Worker | As published | Measured |
> |---|---:|---:|
> | discover-session | — | 41,509 |
> | initialize-session | — | 28,626 |
> | resolve-target | — | 23,328 |
> | dispatch-client-workflow | — | 30,573 |
> | **the four ceremony workers** | **307,272** | **124,036** |
> | start-work-package | — | 278,550 |
> | **five pre-work workers** | **974,517** | **402,586** |
>
> So the headline reads **roughly 400 thousand tokens of fresh worker context before real work begins, not 974 thousand**, and per-dispatch context establishment for a ceremony worker is **23 to 42 thousand tokens, not 60 to 100 thousand**. Proportions and rankings are unaffected, because the error scaled everything alike; absolute magnitudes roughly halve. Every downstream claim that quoted these figures has been restated — see the batched-dispatch record.
>
> **The window closed on the wrong milestone on four runs.** On b5474fca, 7d363a87, e0f51155 and 8608448b, "real work begins" landed on the run's `end-workflow` call, or ran to the end of the transcript. Those rows spanned entire overnight work packages, so their worker counts, checkpoint waits and both token columns described the whole run rather than its startup — which is why they showed worker counts of 15 to 45 where a startup window holds 4 to 7. The five rows that already closed on the opening activity being reported done (03e43af3, f5783c2a, 8e33afd9, 3a2415c4, 7b04f0f4) reproduce to the digit under the committed profiler, and that agreement is what gives confidence in the rest.
>
> Neither fault was visible in the published table. A factor-of-two error in a summation makes every row wrong by the same amount, so nothing looks anomalous; a milestone placed at the end of a run still yields a plausible number in a column of plausible numbers. Both surfaced only when the figures were re-derived by a second route. The profiler exists so that the second route is the first one next time.

## Per-run results

`npm run profile:run`, startup window, usage counted once per response. Raw output beside this file in `runs-profiled.txt`.

| Run | Date | Request | Meta ceremony done | Real work begins | Checkpoint wait | Workers | Main out / cache-write | Worker out / cache-write |
|---|---|---|---|---|---|---|---|---|
| 03e43af3 | Jul 27 | issue 141 | +9.6 min | +31.7 min | 1.2 min | 5 | 25.0K / 104.1K | 51.4K / 402.6K |
| f5783c2a | Jul 12 | cluster 3 design | +7.3 min | +18.2 min | 1.0 min | 4 | 29.2K / 111.8K | 32.3K / 316.3K |
| 8e33afd9 | Jul 13 | PR 1 of issue 224 | +8.3 min | +650 min (overnight) | 533 min | 4 | 38.5K / 381.3K | 46.0K / 690.4K |
| b5474fca | Jul 14 | token tracking | +8.6 min | +671 min (overnight) | 484 min | 5 | 42.7K / 382.2K | 34.2K / 485.3K |
| 7d363a87 | Jul 10 | issue 193 | +7.3 min | +1,077 min (overnight) | 0.8 min | 4 | 22.6K / 213.0K | 46.5K / 382.9K |
| e0f51155 | Jun 7 | issue 128 | +6.7 min | +15.3 min | 0.1 min | 7 | 21.1K / 95.3K | 32.9K / 238.5K |
| 8608448b | Jul 28 | issue 327 (after debugging detour) | +18.4 min | +36.5 min | 0.8 min | 7 | 32.8K / 123.5K | 82.1K / 363.0K |
| 3a2415c4 | Jul 28 | (mid-session start, workflow-authoring) | +19.2 min | +40.8 min | 0.3 min | 6 | 55.8K / 161.6K | 82.1K / 498.6K |
| 7b04f0f4 | Jul 30 | issue 365 | +578 min (long pre-session idle) | +607 min | 66 min | 5 | 37.8K / 288.9K | 83.1K / 571.5K |

**"Real work begins" is elapsed time, not active time, on the four rows marked overnight.** Subtracting checkpoint wait does not recover an active figure there: 7d363a87's window runs 1,077 minutes against a checkpoint wait of 0.8, because its first checkpoint falls at minute 1,067 — after the gap. The idle was someone leaving for the night mid-activity, which is not the run waiting on an answer. Only the rows without an overnight gap support reading the window as active minutes.

Five of the nine reach real work with no overnight gap inside the startup window, at 15 to 41 active minutes. The two of those that also ran clean of conversational detours and mid-session starts — 03e43af3 and f5783c2a — are the bookends: **real work begins 18–32 active minutes after the request, after 0.43–0.51 million cache-write tokens and 62–76 thousand output tokens.** The meta-ceremony phase alone is stable at 6.7–9.6 minutes across every clean run regardless of the task.

## Where the cost sits

**Fixed payloads into the orchestrator, every run.** The bootstrap protocol's step 1 reads `workflow-server://schemas/workflow` — 43,917 bytes (~11K tokens) of full workflow JSON schema — observed identically in every run (43,737 bytes in the July 10–14 runs, 30,881 on June 7). The meta workflow's `get_workflow` delivery added 36,148–77,099 bytes in June–mid-July runs, dropping to 2,788–4,576 bytes in the July 28–30 runs (something already improved here). The planning-folder guide adds 5,052–12,238 bytes via `get_resource`. Total fixed MCP payload in the startup window: 55–124 KB per run (~14–31K tokens).

**Worker re-dispatch is the dominant token cost.** The July 27 run dispatched five workers before real work: discover-session (77 s), initialize-session (65 s), resolve-target (42 s), dispatch-client-workflow (165 s), then start-work-package (~17 min including a 1.2-minute intake question). Together they wrote 402.6K tokens of fresh worker context — nearly four times the orchestrator's own 104K. Each ceremony worker pays 23–42K cache-write to establish context, does a few minutes of work, and reports back; start-work-package, which runs seventeen of those minutes, pays 278.6K.

**Definition weight per ceremony activity.** The worker transcripts of the July 27 run show what each ceremony dispatch pulls in. The `get_activity` delivery — activity text plus eagerly inlined techniques — is 42,547 bytes for initialize-session, 27,383 for resolve-target, and 23,388 plus 10,208 of follow-on technique fetches for dispatch-client-workflow, against a discover-session delivery of only 2,288 bytes. start-work-package adds 20,849 bytes of technique fetches and 17,064 of resources. Separately, every dispatch pays a ~23–42K cache-write baseline (harness context: system prompt, project instructions, tool schemas) before any workflow content arrives — visible in the two ceremony workers whose total cache-write was 23.3K and 28.6K on nearly no turns. Slimming what the ceremony activities bundle attacks the first number; only fewer dispatches (merge or solo) attacks the second.

**Per-activity persist cycles.** After each activity the orchestrator commits and pushes planning artifacts; in the July 27 run the cycle after start-work-package ran 14:11:48–14:13:52 (~2 minutes), and each ceremony activity carries its own.

**What the ceremony actually decides.** Of the four meta activities, the judgment calls are workflow matching (free text → workflow id) and the ambiguity/mismatch gates. Repo derivation (parse origin remote), session creation, and planning-folder resolution are deterministic; the server already performs parts of them inside `start_session`.

## Epic coverage survey (2 August 2026)

- **#401 W2 (context-cost profile, solo return)** — directly addresses worker re-dispatch, the dominant cost. The meta workflow (five small activities, session ends after dispatch) is the canonical short walk solo would clear. Epic was labelled `priority: low`.
- **#401 W1 (profiles)** — pre-seeded execution shape would remove intake questions that stall startup on a four-hop checkpoint relay.
- **#404 (delivery cost)** — server-side resolve waste and per-delivery cost reporting; marginal to startup burn (deliveries complete in 60–130 ms) but the declared home for performance issues as they are filed.
- **#353 (closed)** — precedent: re-dispatch overhead measured at 31% of a work-package run, shipped.
- **Uncovered:** the fixed schema payload, moving deterministic ceremony steps server-side, batching persist cycles — filed as the startup-cost issue this folder supports.

## Raw data

`runs-profiled.txt` — `npm run profile:run` output per run: milestones, per-worker token figures counted once per response, and result characters by tool. This is the source of the table above, and the command at the top of the file reproduces it.

`runs-raw.txt` — the original throwaway analyser's output, kept as the historical capture under a note recording what is wrong with it.
