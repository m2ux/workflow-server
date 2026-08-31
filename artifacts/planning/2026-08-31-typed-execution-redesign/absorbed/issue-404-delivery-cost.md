## Summary

When the server hands an agent its next piece of work, it decorates each step with provenance — a note, for each input the step consumes, of which earlier step produces it. Building that decoration today means re-reading essentially every technique file in the workflow from disk, and the delivery loop rebuilds it from scratch for every step it inlines — so a single delivery call can walk the entire technique catalog several times over. One observed call walked it 3 times. The catalog this multiplies over currently holds 184 technique files, and it only grows.

That waste has a filed fix (#269), but until now no home: every earlier performance issue — context-cost profiling (#248), token tracking (#232), the re-dispatch overhead measured at 31% of a work-package run (#353) — shipped standalone and closed, leaving the theme scattered across the tracker with nothing tying it together. This epic is that home. It carries the open work — redundant resolve work goes away, every delivery says what it cost, agents learn to fetch cheaply, and the session's setup ceremony stops over-delivering — and future performance and delivery-cost work joins its tracking list as it arises.

## How the cost arises today

The provenance builder walks every activity and step in the whole workflow, not just the activity being delivered; for each bound operation it re-reads the technique file from disk to learn which outputs it produces; and the small memo it keeps lives only inside a single call. The delivery loop then invokes that builder once per ungated step — a step whose full technique text the server inlines up front — so the resolve count per request scales as the count of all workflow techniques multiplied by the count of ungated steps. A delivery still completes in roughly 60–130 ms today; the concern is the growth curve, not the current latency.

Verified against main (7b80fd5a, 2 August 2026): the per-step rebuild, the call-scoped memo, and the uncached disk reads are all still in place. The only change to the provenance module since #269 was filed is an unrelated fix to how optional inputs are recognised. One partial overlap exists: the re-dispatch work (#353) added per-delivery events reporting delivered and saved characters — a slice of the observability this epic wants, but not the per-request summary of resolve work.

## The work

**W1 — Resolve each technique once per delivery.** Build the map from each technique reference to its declared outputs once per request and reuse it across every step decoration; stop rebuilding the producer list per step. The decoration output stays byte-for-byte unchanged, and a regression test counts resolve invocations. (#269, Stages 1–2.)

**W2 — Say what each delivery cost.** One summary line per delivery call: unique techniques resolved, provenance passes, ungated steps bundled, characters spent against the eager budget — extending the delivered-and-saved-characters events #353 already emits. (#269, Stage 4.)

**W3 — Teach agents to fetch cheaply.** Protocol guidance: prefer reference bundles under persistent context after the first full delivery, use the resources map the delivery already bundles instead of probing alternate spellings, and document what a lazy technique fetch costs until W1 lands. (#269, Stage 3.)

**W4 — Startup fixed payloads.** The session bootstrap has the orchestrator read the full workflow schema — about 44 KB, roughly 11 thousand tokens, identical every run — although the orchestrator never authors a workflow definition; with the orchestrating workflow's own delivery and the planning-folder guide, 55–124 KB of fixed content lands before the first decision. Replace the schema read with a delivery sized to what the orchestrator consumes, and hold bootstrap-time fixed content to a stated budget. (Subsumed #406, work item 1.)

**W5 — Ceremony definition weight.** What a setup activity hands its worker ranges from 2 KB to 43 KB — the heaviest delivery belongs to a step whose job is largely one server call — and after every setup activity the orchestrator runs a roughly two-minute commit-and-push cycle. Audit the setup activities' bundled techniques and resources so no activity delivers more content than the work it directs, and batch the ceremony's persist steps into a single commit when the client workflow is dispatched. (Subsumed #406, work item 2.)

**W6 — Report fan-out, without a threshold.** Two ratios are measurable today and neither should gate a build. Rules declared on a container ride along with every operation inside it: 107,572 characters across one work-package walk, 618 entries, of which 8.9% are named in the operation they arrive with. Conventions about how a binding is written reach a runtime reader at 2,957 characters a delivery, five of the six rules being about authoring rather than doing. And 5,439 characters a delivery have no tool, input or observable behaviour behind them at all. A threshold would be wrong here — a container rule is *meant* to be cross-cutting, so a number would fail the corpus on its intended design. Report the two ratios beside `bench:batch` as a warn-only line, so the fan-out is visible and a regression is arguable without a figure pretending to be a fact.

**W7 — Duplicate content inside one delivery.** The same rule and contract blocks repeat inside a single response — 16,453 characters byte-identical in the worst case measured. The pass that would remove them runs only when a delivery is made by reference, so a freshly spawned worker, which is exactly the case the budget is tightest for, pays all of it. Establish whether that pass can run on a full delivery too. This grew after the item was first written: giving client workers the `activity-worker` role technique their stubs had always named added some 5,700 characters to every activity delivery, which is fixed cost on the path this work item is about.

**W8 — A worker never walks more than one activity.** The server holds a limit meant to let one dispatched context take up to three activities in a row, so it pays the harness's context establishment once for the run rather than once an activity, and the dispatch specification names the setup sequence as that limit's first user. On the first work-package run after that limit shipped, no context anywhere took a second activity: four setup activities under four identities, twelve review activities under thirteen. Nothing was refused, because no continuation was ever attempted — the field telling a worker where its context stands was absent from every delivery all session, so no worker could learn it had room. Make that field arrive on every delivery, and then confirm on real sessions that a run actually forms; a limit no worker can read is a limit that cannot bind. The saving at stake is the one the specification already puts at two to four times what collapsing delivered content saves.

**W9 — A repeat fetch is answered in full.** A worker that asks for a technique or resource it already holds receives the whole body a second time. The collapsing that stops this on activity deliveries does not cover fetches made on demand, so nothing recognises the second ask. One setup worker received the same 15,126-character dispatch guidance twice inside 46 seconds, in one uninterrupted run. Across one run that is 18 repeats and 67,772 characters re-sent — roughly 17 thousand tokens, and 12 to 17 per cent of everything that run fetched on demand. Extend the delivered-content ledger to cover fetches, so a repeat arrives as a marker. This is a different defect from W7: that one is a single response carrying the same block twice, this one is two calls each answered in full.

**W10 — The activity body is the one part of a delivery that never collapses.** When a resumed worker asks for its activity again, almost everything can arrive as a short marker instead of the bytes — each bundled technique, the inherited rules block, each shared block of a composed technique, each eagerly-bundled resource. The activity definition itself cannot: it is concatenated onto the response outside the ledger scheme, so no lookup happens and no marker is possible. Measured over eight activities of the main workflow, a resumed delivery totals 184,684 characters of which 70,957 — 38.4% — is the body, and the share runs from 17% on an activity that binds many techniques to 95% on one that binds few. Thirteen of the main workflow's fifteen activities carry a gate, so a worker that pauses at several pays the body at each. One constraint shapes the fix: a worker must confirm that the activity id the server returned matches the one it was dispatched for, and that check reads the body — so the identity fields stay while the step list, outcome, and synthesised artifact contract are keyed separately, the same treatment a composed technique already gets. This is also the floor W8's batching cannot collapse below, since the body is whatever fraction of each payload is definition text.

**W11 — Confirm on real runs that re-delivered characters have fallen.** The delivery-identity fix landed with every acceptance criterion met except the last, which no test can meet: a re-measurement over fresh runs showing the re-delivered character count falling toward zero. The walk over the main workflow crosses thirteen gates under one identity per activity and records no re-delivery event anywhere, with 66.6% of re-requested characters collapsing to markers — strong evidence the mechanism works, and a regression guard, but not evidence about production, because it does not exercise the orchestrator composing a real continuation prompt, which is where the identity was being lost. The instruments are already in place, so this is a read: re-delivery events, expected to be zero, with the two identities on any occurrence distinguishing a genuinely replaced worker from the fault returning; identity changes at gates, against a baseline of twelve of thirty-eight crossings taken over by a different identity, nine re-receiving a full payload; and characters re-delivered, against a baseline of 677,132 on identity changes plus 1,109,551 on same-identity resumes that re-delivered a byte-identical payload. It waits on a sample: the original measurement drew on twelve session records across nine profiled runs, and one or two fresh sessions would not distinguish a fix from a quiet run. Around ten completed gate-crossing sessions is the trigger. The total will not reach zero until W10 lands, and is not expected to.

W6 and W7 come from a review that read the corpus against the SOLID principles during the batched-dispatch work; the measurements and the reasoning behind declining a relevance threshold are in that review's [planning folder](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-04-solid-affinity).

W8 and W9 come from reading a completed session's own record — what the server logged itself delivering — rather than from harness transcripts. That second route also produced a figure worth not repeating: an earlier pass over the same two runs reported delivery per completed activity rising 41 per cent week on week, which turned out to be an artefact of comparing whole-run totals across two runs that recorded resumes differently. Measured per fresh dispatch, delivery is flat at plus 1.8 per cent. The withdrawal and its arithmetic are in the record linked below, so the wrong figure is not re-derived.

W10 and W11 joined on 6 August 2026, and both are about the same payload from opposite ends: W10 removes the last part of a resumed delivery that cannot collapse, and W11 confirms on real sessions that the collapse the walk test records is happening in production. W11 was held out of the epic while it waited on a sample; holding it outside the tracker only risked its being forgotten, which is the thing it was filed to prevent.

W4 and W5 work the content side of a startup window the session-creation epic reshapes from the other side: its bootstrap item (#401 W2) moves the no-judgment setup steps into the session-start call itself, which shrinks the set of setup activities these audits cover. The boundary is drawn there and holds here too — server-side bootstrap belongs to #401, payload and ceremony trimming to this epic.

## Why now is cheap

The evidence is already gathered and re-verified: four sessions' runtime logs profile the waste pattern, and a fresh check against main confirms the code is unchanged since filing, so no re-investigation is needed. The fix is deliberately localized — same decoration output, fewer loads — which keeps the change reviewable. And the multiplier grows with every workflow and technique added to the corpus, so the same fix costs more to validate the longer it waits.

## Acceptance criteria

- [ ] A single delivery call resolves each unique technique at most once, with the provenance decoration byte-for-byte unchanged and a regression test counting resolve invocations.
- [ ] Every delivery call emits one summary line naming what it resolved and what it spent.
- [ ] The protocol documentation tells agents how to fetch under persistent context without re-paying for content they already hold.
- [ ] All four stages of the subsumed provenance-caching item (#269) are dispositioned — delivered, or explicitly declined with the reason recorded.
- [ ] The fixed content delivered to the orchestrator before its first decision has a stated budget, and the full-schema read is replaced by a delivery sized to what the orchestrator consumes.
- [ ] Each setup activity delivers less content than its July baseline, the ceremony produces one planning-artifact commit, and a re-measurement by the recorded method shows both.
- [ ] The two fan-out ratios are reported on every benchmark run as warn-only figures, and no build fails on either.
- [ ] Whether a full delivery can drop content it has already sent once is settled — either the duplication is gone, or the reason it has to stay is recorded.
- [ ] Every delivery tells the receiving context how many activities it has taken and whether it may continue, and a completed real session is reported showing at least one context that walked more than one activity — or the reason a run cannot form on the main workflow is recorded.
- [ ] A context that asks twice for the same technique or resource receives the second answer as a marker, with a regression test that asks twice and measures what came back.
- [ ] A resumed worker's re-request returns the activity's identity in full and the remainder as markers where the bytes are unchanged, the dispatched-activity confirmation still has an id to check on every delivery path, a forced full delivery is unaffected, and the reference walk records a higher collapse figure than the 65.4% it records today with the body share falling.
- [ ] Once around ten gate-crossing sessions have completed since the delivery-identity fix landed, the re-delivery event count across them is reported with any occurrence attributed to a replaced worker or to a lost identity, the characters re-delivered at gate crossings are reported against the 677,132-character baseline, and the figure is recorded where the original measurement lives so the two are read together.

## Non-goals

- Eager-budget defaults and headroom stay as they are (the ground #248 and #232 covered).
- No redesign of which workflow steps are gated versus ungated in the workflow definitions.
- The agent's session-inspection polling chatter is a separate concern.
- The closed lineage (#248, #232, #353) is not reopened; this epic tracks open and future cost work only.
- Moving the client-dispatch activity from a spawned worker to the orchestrator is #436 W1. That removes one of the four setup dispatches; W8 is about the remaining three walking as a single run, and the two hold independently.
- The eager bundle's budget behaviour, which W10 does not change. A resumed delivery can be larger than its collapse suggests because markers cost nothing against the budget, so freed headroom is spent sending resource bodies the first delivery could not afford. That is the budget working, not re-delivery.
- Re-warming a resumed worker's context, which is a consequence of gates waiting on a person.
- Re-running the walk test for W11. It already passes and is not the thing in question; W11 asks about production, which the walk does not exercise. And W8 counts how many activities one context takes, not how much a resumed context receives — the two measure different things on the same sample.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1–W3 — provenance caching, the per-delivery cost line, and cheap-fetch guidance ([capture of #269](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-delivery-cost-epic/issue-269-provenance-caching.md))
- [ ] W4 — startup fixed payloads: bootstrap deliveries sized to what the orchestrator consumes, under a stated budget ([capture of #406](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-workflow-startup-cost/issue-406-startup-delivery-weight.md))
- [ ] W5 — ceremony definition weight: no setup activity delivers more than the work it directs, and the ceremony commits once ([measurement record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-workflow-startup-cost))

- [ ] W6 — fan-out reported as warn-only metrics beside the batch benchmark ([review record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-04-solid-affinity))
- [ ] W7 — duplicate content inside one delivery, and whether the collapse pass can run on a full one ([review record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-04-solid-affinity))

- [ ] W8 — the field a worker reads to know it may continue arrives on every delivery, and a real session is reported showing a run forming ([measurement record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs))
- [ ] W9 — a repeat fetch arrives as a marker rather than as content ([measurement record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs))

- [ ] W10 — the activity body collapses like everything else a resumed delivery carries ([capture of #417](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-delivery-cost-epic/issue-417-activity-body-delivery.md))
- [ ] W11 — re-delivered characters confirmed fallen on real sessions; gated on around ten completed gate-crossing sessions ([capture of #419](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-delivery-cost-epic/issue-419-delivery-identity-confirmation.md))

New performance and delivery-cost work joins this list as it arises — subsumed as work items, with the originating body captured verbatim in a planning folder and linked from its entry.

Subsumes #269 (captured in this epic's planning folder — the issue's own investigation-detail link pointed at a folder that was never pushed) and #406 (the startup delivery-weight item, whose measurement record lives in its own planning folder); both issues are closed and the work items above carry them. Consolidates #417 (W10) and #419 (W11), added and closed on 6 August 2026; both bodies are captured verbatim in the planning folder.

## Investigation detail

Full record — the status check against main with hot-path source locations, the verbatim #269 capture, the closed-lineage rationale, and the key numbers:
**[engineering/artifacts/planning/2026-08-02-delivery-cost-epic](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-delivery-cost-epic)**

W8 and W9 — the minute-by-minute setup timeline, the ceremony duration series across every session record since 25 June, the repeat-fetch tables, the two server builds the measured run straddled, and the withdrawn delivery-growth figure:
**[engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs)**









## A dispatch says what it is doing while it runs (extends W2)

A single dispatch ran fifteen minutes with no progress signal, and the checkpoint it was heading for
arrived unannounced while the user sat waiting on it. The cost of per-activity re-verification — the
thing that makes those minutes worth spending — was never quoted before it was spent.

W2 adds a per-delivery cost line facing the log. The same measurement faces the user as an elapsed
figure and a next-gate signal, so a long dispatch is legible while it runs rather than only in the
trace afterwards.

Source: item 52 of the [July–August retrospective review](https://github.com/shieldedtech/midnight-agent-eng/blob/mike/.engineering/artifacts/planning/2026-08-06-workflow-retrospective-review/03-item-tracker.md).

