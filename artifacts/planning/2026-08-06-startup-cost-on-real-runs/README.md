# Startup cost on real runs — measurement record

Investigation supporting the startup-cost findings raised after the review of
[midnightntwrk/midnight-node#1938](https://github.com/midnightntwrk/midnight-node/pull/1938), run
2026-08-05. Measured 2026-08-06 from sealed session records rather than from harness transcripts,
which makes it a second route onto the ground the run profiler already covers in
[`2026-08-02-workflow-startup-cost`](../2026-08-02-workflow-startup-cost/README.md).

## Method, and how it differs from the profiler record

The figures here come from the `session.json` history of completed sessions — the server's own
record of what it delivered and when — read directly. Three classes of figure appear, and they are
not equally trustworthy:

- **Server-measured, trustworthy.** Every character count. `activity_dispatched`, `technique_bundled`,
  `technique_fetched` and `resource_fetched` each carry a `chars` field written by the server as it
  hands content over. No harness relay is involved.
- **Clock, trustworthy.** Event timestamps in session history.
- **Harness-relayed, unreliable.** `subagent_tokens`, `tool_uses`, `duration_ms` inside
  `activity_usage`. These reach the ledger only if the orchestrator relays them, and `subagent_tokens`
  is a running context reading rather than a spend — the July 30 run's own artifact plain-sums it to
  2,613,209, which double-counts every continued worker. One row in 42 across the two compared runs
  carried real token fields. **No claim in this record rests on a token figure.**

The profiler record measures from Claude Code transcripts and places five milestones per run. This
record places two: the client session's first `activity_entered` (the profiler's milestone 4, "meta
ceremony done") and the client session's first `activity_dispatched`. The first is directly
comparable to the profiler's figure; the second has no profiler equivalent and is reported alone.

`activity_dispatched` events only carry `chars` from meta 5.14.0 onward, so delivery volumes exist
for the last three runs in the series and event counts for the rest.

## The 5 August run, request to first review worker

Meta session `CRMRHT`, client work-package session `5MRSES`, meta 5.19.0 / work-package 3.42.0.
Request received 10:47:47.243Z; first review worker dispatched 11:02:49.243Z. **15 min 02 s.**

| Elapsed | Clock | Event | Preceding gap |
|---:|---|---|---:|
| 0:00 | 10:47:47 | `workflow_started`, `variables_seeded` | — |
| 0:57 | 10:48:44 | enter `discover-session` | 57 s idle |
| 1:17 | 10:49:04 | dispatch `worker-discover-session-a1`, 62,291 chars | 20 s |
| 3:16 | 10:51:03 | usage: 2.0 min, 10 tool uses | worker 119 s |
| 3:39 | 10:51:26 | exit → enter `initialize-session` | 23 s idle |
| 4:02 | 10:51:49 | dispatch `worker-initialize-session-b1`, 39,368 chars | 23 s |
| 5:01 | 10:52:48 | `workflow_triggered` — client session created | worker 59 s |
| 5:39 | 10:53:26 | usage: 1.8 min, 8 tool uses | — |
| 6:22 | 10:54:10 | exit → enter `resolve-target` | 43 s idle |
| 6:38 | 10:54:25 | dispatch `worker-resolve-target-c1`, 37,339 chars | 16 s |
| 7:43 | 10:55:30 | `checkpoint_reached` | worker 65 s |
| 8:14 | 10:56:01 | `checkpoint_response` | 31 s human |
| 10:14 | 10:58:01 | resume dispatch, 5,503 chars | **120 s idle** |
| 11:19 | 10:59:06 | usage ×2, 15 tool uses | worker 65 s |
| 11:42 | 10:59:29 | exit → enter `dispatch-client-workflow` | 23 s idle |
| 11:55 | 10:59:42 | dispatch `worker-dispatch-client-d1`, 31,990 chars | 13 s |
| 13:55 | 11:01:42 | client enters `start-work-package` | worker 120 s |
| 15:02 | 11:02:49 | **first review worker dispatched** | 67 s |

**Decomposition of 902 s:** ~531 s worker model time (59%), 31 s human (3%), ~340 s orchestrator
handoff with nothing executing (38%). The handoff total is the sum of eight transitions averaging
27 s, plus the two 120 s stalls marked above.

**Delivered into the four setup contexts before the client workflow's first activity:**
238,649 characters. Composition — dispatch payloads 62,291 + 39,368 + 37,339 + 5,503 (resume) +
31,990 = 176,491; lazy technique fetches 5,242 + 4,486 + 5,772 + 15,126 + 15,126 = 45,752; lazy
resource fetches 1,426 + 14,980 = 16,406.

`discover-session` is the largest single delivery at 62,291 chars, of which 27,710 is four eagerly
bundled techniques (`version-control::resolve-host-repo` 7,058, `workflow-engine::list-workflows`
6,313, `workflow-engine::match-target-workflow` 7,710, `workflow-engine::detect-resume-intent`
6,629) for what resolves to a routing decision.

## Ceremony duration across the series

Request to the client session's first `activity_entered`, over every session record since 25 June
that carries a bootstrap walk. Runs whose meta session recorded no activities are resumed sessions
and are excluded. `worker` is only non-zero from meta 5.11.0, when `record_usage` began being called
in the meta session — before that its time is inside the `handoff` column.

| Window | n | Median ceremony | Median human wait |
|---|---:|---:|---:|
| late Jun – 14 Jul | 20 | 11.4 min | 2.2 min |
| 15 – 28 Jul | 5 | 9.7 min | 1.0 min |
| 30 Jul – 5 Aug | 3 | 13.9 min | 1.4 min |

The three most recent runs are 12.2 min (#1877, 28 Jul), 15.1 min (#1922, 30 Jul), 13.9 min (#1938,
5 Aug). The series also contains repeated ceremonies at 3.6, 4.5, 4.7, 6.0, 6.6, 7.1, 7.1, 7.3 and
7.8 minutes through July, so the level demonstrated by this workflow is well under half the current
one.

**Read against the profiler record with care.** That record puts the meta-ceremony phase at
"6.7–9.6 minutes across every clean run regardless of the task" over nine runs between 7 June and
30 July. The three recent runs sit above that band. The two records measure by different routes over
overlapping but not identical run sets, and the profiler is the committed instrument, so the band
comparison is a prompt to re-run `npm run profile:run` rather than a finding on its own.

## Batching formed no run

`BATCH_MAX_ACTIVITIES` defaults to 3 and `BATCH_HEADROOM_FRACTION` to 0.35, giving a 280,000-character
budget at a 200,000-token declared window. `docs/dispatch_model.md` names the setup sequence as
batching's first user.

On this run no context took a second activity:

- **Setup:** four activities, four identities — `worker-discover-session-a1`,
  `worker-initialize-session-b1`, `worker-resolve-target-c1`, `worker-dispatch-client-d1`.
- **Client workflow:** twelve activities, thirteen identities `worker-wp-b1` … `worker-wp-b13`
  (thirteen rather than twelve because `worker-wp-b3` was lost mid-activity and `worker-wp-b4`
  replaced it).
- **No `batch_refused` event anywhere in either session.** Nothing was refused because no
  continuation was ever attempted.

The run's own retrospective records the mechanism: `_meta.batch` was absent from every `get_activity`
response all session, so no worker could read `may_continue`, and
`workflow-engine/dispatch-activity.md#batch-is-bounded-by-the-server` is unenforceable while the
field never arrives.

**The run straddled two server builds.** The batched-dispatch merge (2c6da98c) landed 2026-08-05
09:49:28Z and the `ghcr.io/m2ux/workflow-server:main` image now in use was built 09:50:20Z, 52
seconds later. The container currently serving port 3000 started **17:52:09Z — during the run**,
which began at 10:47:47Z. The container serving the first seven hours is gone (`docker run --rm`) and
its image cannot be established. So the first half of the run may have had no batch code at all,
while the second half certainly did; the retrospective reports the field absent throughout. Either
way the feature returned nothing on this run.

The restart is also the run's largest single cost. `worker-wp-b3` was dispatched at 14:30:13Z and
`worker-wp-b4` replaced it at 17:56:18Z, four minutes after the restart — a 196.8-minute stall, plus
a wasted 84,441-character delivery, 59 tool uses and an orphaned out-of-band challenge that a later
worker had to adjudicate.

## Repeat fetches are re-sent in full

A worker that fetches a technique or resource it already holds receives the whole body again. The
collapsing that covers `get_activity` payloads does not cover `get_technique` or `get_resource`.

Meta session — 2 repeats, 16,065 characters re-sent, 17% of that session's 96,328 characters of lazy
fetching:

| Agent | Item | Times | Re-sent |
|---|---|---:|---:|
| `worker-dispatch-client-d1` | `workflow-engine::dispatch-activity` | 2 | 15,126 |
| `worker-meta-e1` | `session-summary-template#session-summary-template` | 2 | 939 |

The dispatch-activity pair is 46 seconds apart (11:00:15Z and 11:01:01Z), inside one worker's
uninterrupted run.

Client session — 16 repeats, 51,707 characters re-sent, 12% of that session's 414,255 characters of
lazy fetching:

| Agent | Item | Times | Re-sent |
|---|---|---:|---:|
| `worker-wp-b9` | `tdd-concepts-rust` | 2 | 13,533 |
| `worker-wp-b4` | `codebase-comprehension#comprehension-techniques` | 2 | 8,230 |
| `worker-wp-b9` | `rust-substrate-code-review#review-criteria` | 2 | 4,725 |
| `worker-wp-b11` | `architecture-summary#architecture-summary-artifact-template` | 2 | 3,908 |
| `worker-wp-b9` | `test-suite-review#report-template` | 2 | 3,425 |
| `worker-wp-b4` | `codebase-comprehension#artifact-template` | 2 | 2,674 |
| `worker-wp-b11` | `strategic-review#strategic-review-artifact-template` | 2 | 2,545 |
| `worker-wp-b4` | `session-trace` | 2 | 2,206 |
| `worker-wp-b9` | `test-suite-review#review-criteria` | 2 | 1,892 |
| `worker-wp-b4` | `deferred-items` | 2 | 1,793 |
| `worker-wp-b9` | `test-suite-review#anti-patterns` | 2 | 1,802 |
| `worker-wp-b9` | `manual-diff-review#file-index-generation` | 2 | 1,288 |
| `worker-wp-b9` | `rust-substrate-code-review#report-template` | 2 | 1,236 |
| `worker-wp-b4` | `follow-ups` | 2 | 1,304 |
| `worker-wp-b9` | `manual-diff-review#manual-diff-review-section-template` | 2 | 635 |
| `worker-wp-b9` | `manual-diff-review#permanent-blob-citations` | 2 | 511 |

**Total across both sessions: 18 repeats, 67,772 characters.** At the server's own 4 characters per
token that is roughly 17 thousand tokens, on one run.

This is distinct from the duplication [#404](https://github.com/m2ux/workflow-server/issues/404) W7
describes, which is byte-identical blocks repeating *inside a single response*. Here each fetch is a
separate call that the delivery ledger does not cover.

## Client-workflow delivery did not grow — a correction

An earlier pass over these two runs reported delivery per completed activity rising 41% between the
30 July and 5 August runs (89,807 → 126,356 characters). **That figure is an artefact and should not
be quoted.** It compares whole-run totals, and the 5 August run recorded seven resume dispatches, a
duplicate fresh dispatch from the lost worker, and an orchestrator probe, while the 30 July run
recorded no resume dispatch events at all — that recording only arrived with
[#365](https://github.com/m2ux/workflow-server/issues/365). Nine deliveries were counted on one side
that the other never logged.

Per **fresh** dispatch, like for like:

| Per fresh dispatch | #1922 (wp 3.40.0) | #1938 (wp 3.42.0) | Δ |
|---|---:|---:|---|
| Response payload | 63,668 | 72,654 | +14% |
| — eagerly bundled | 28,255 | 30,351 | +7% |
| Eager bundle count | 5.0 | 5.0 | 0% |
| Lazy technique fetches | 10,760 (1.8) | 7,555 (1.3) | −30% |
| Lazy resource fetches | 15,378 (2.8) | 11,241 (2.1) | −27% |
| **All-in delivered** | **89,806** | **91,450** | **+1.8%** |

Two further claims from that pass are withdrawn: the batch headroom did not shrink from ~3.3
activities to ~2.7 (at 280,000 characters it is 3.12 → 3.06, unchanged), and eager bundling has not
failed to substitute for lazy fetching. The substitution is visible earlier in the series, at
work-package 3.28.0 on 11 July, where lazy technique fetches per activity drop from 3.9–5.5 to
1.4–1.6 as eager bundles appear at 4.5 per activity, and they have stayed there since.

Resume collapse is working and measurable: resume payloads on the 5 August run averaged 22,504
characters against 72,654 for a fresh dispatch of the same activities, a 69% collapse across seven
resumes. That is a data point for
[#419](https://github.com/m2ux/workflow-server/issues/419), which needs roughly ten gate-crossing
sessions before its check is worth running.

## Relationship to tracked work

| Finding here | Already tracked | Boundary |
|---|---|---|
| Ceremony payload weight, commit cycle | [#404](https://github.com/m2ux/workflow-server/issues/404) W4, W5 | That work trims what the setup delivers and commits once. This record supplies fresh figures; it does not restate the work. |
| One fewer setup dispatch | [#425](https://github.com/m2ux/workflow-server/issues/425) | Removes the client-dispatch worker by letting the orchestrator run that activity. Independent of, and complementary to, a batch forming across the other three. |
| Re-delivered characters falling | [#419](https://github.com/m2ux/workflow-server/issues/419) | Needs ~10 gate-crossing sessions. The 69% collapse figure above is one of them. |
| Duplicates inside one response | [#404](https://github.com/m2ux/workflow-server/issues/404) W7 | Different defect: that is one response containing the same block twice, this is two calls each answered in full. |
| Cheap-fetch guidance to agents | [#404](https://github.com/m2ux/workflow-server/issues/404) W3 | Guidance tells a worker not to re-ask. Collapsing makes re-asking cheap when it happens anyway. |
| **Batching forms no run in production** | — | Not tracked anywhere. |
| **Repeat fetches answered in full** | — | Not tracked anywhere. |

## Reproduction

Figures above were derived from the sealed session records at
`midnight-agent-eng/.engineering/artifacts/planning/*/session.json` — specifically
`2026-08-05-review-midnight-node-pr-1938` and `2026-07-30-review-midnight-node-pr-1922` for the
paired comparison, and every folder dated 25 June onward for the series. The client work-package
session is nested under `.triggeredWorkflows[0].state.history`; the meta session's own walk is the
top-level `.history`.
