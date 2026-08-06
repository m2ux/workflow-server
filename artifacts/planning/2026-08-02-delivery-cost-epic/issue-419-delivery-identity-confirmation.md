# Capture: issue #419 — Delivery identity: confirm on real runs that the re-delivered character count has fallen

Body verbatim as of 6 August 2026 (filed 3 August 2026; subsumed into #404 as W11 and closed on 6 August 2026). It joins this epic because it is a read of the instruments W2 extends, against a baseline this epic's records already carry, and because its sample condition — around ten gate-crossing sessions — is the same accumulation W8's real-session confirmation waits on.

---

## Summary

The delivery-identity fix landed with every acceptance criterion met except the last one, which cannot be met by a test: a re-measurement over fresh runs showing the re-delivered character count falling toward zero. This records that outstanding check so it is not quietly forgotten, and states what has to accumulate before it is worth doing.

## What has already been shown, and what it does not show

A walk over the main workflow crosses thirteen gates under one identity per activity and records no re-delivery event anywhere, with 66.6% of the re-requested characters collapsing to markers. That is strong evidence the mechanism works, and it guards against regression.

What it is not is evidence about production. The walk drives the server directly with a mechanical worker; it does not exercise the orchestrator composing a real continuation prompt, which is where the identity was being lost. The original finding came from sealed session records of real sessions, so the confirmation should come from the same place.

## Why this waits

The original measurement drew on twelve session records carrying dispatch instrumentation, across nine profiled runs. One or two fresh sessions would not distinguish a fix from a quiet run — a session that happens to cross few gates re-delivers little either way. The check needs a comparable sample before its result means anything.

A reasonable trigger is around ten completed sessions that cross gates, at which point the same pass that produced the original figures can be run again.

## What to measure

The instruments are already in place, so this is a read rather than new tooling.

- **Re-delivery events.** Every full delivery of an activity to a second identity within one session now records one, carrying both identities and what the second copy cost. The expected count is zero. Any occurrence is either a genuinely replaced worker or the original fault returning, and the two identities distinguish them.
- **Identity changes at gates.** For each gate followed by another delivery, whether the arriving identity matches the one the dispatch bound. The baseline was twelve of thirty-eight crossings taken over by a different identity, nine of them re-receiving a full payload.
- **Characters re-delivered.** The dispatch events carry the payload size, so the total is summable directly. The baseline was 677,132 characters on identity changes, with a further 1,109,551 on same-identity resumes that re-delivered a byte-identical payload.

## Acceptance criteria

- [ ] Around ten gate-crossing sessions have completed since the fix landed.
- [ ] The re-delivery event count across those sessions is reported, with any occurrence attributed to a replaced worker or to a lost identity.
- [ ] The characters re-delivered at gate crossings are reported against the 677,132-character baseline.
- [ ] The figure is recorded where the original measurement lives, so the two are read together.

## Non-goals

- Re-running the walk test, which already passes and is not the thing in question.
- The activity body's share of a resumed delivery, measured separately in [#417](https://github.com/m2ux/workflow-server/issues/417). A resumed worker still receives its activity definition in full, so the total will not reach zero and is not expected to.

## Investigation detail

Baselines and method come from the forensic pass recorded with the batched-dispatch investigation, and the fix itself is [#408](https://github.com/m2ux/workflow-server/issues/408), delivered by [#410](https://github.com/m2ux/workflow-server/pull/410) and [#411](https://github.com/m2ux/workflow-server/pull/411).

