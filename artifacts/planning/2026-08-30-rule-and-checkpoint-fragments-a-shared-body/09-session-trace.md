# Session Trace

Mechanical record of the `workflow-authoring` run on issue #519: what was dispatched, what it called, how long it took, and what it left on disk. Cost lives in [`09-token-usage.md`](./09-token-usage.md) and is not restated here.

## Session topology

```
QZAMAD  meta v6.1.0                       5 activities, 5 dispatches, 0 checkpoints
└── 3IXIS7  workflow-authoring v1.6.0     4 activities over 6 entries, 7 dispatches, 5 checkpoints
```

Meta session started 2026-08-30T17:07:32Z; meta elapsed 2,412.9 min (40.2 h). The client session started 2026-08-30T17:11:29Z, raised by a `workflow_triggered` event during `initialize-session`, and elapsed 2,407.3 min (40.1 h).

## Meta session `QZAMAD`

| Activity | Agent | Dispatches | Tool calls | Duration (min) |
|---|---|---|---|---|
| `discover-session` | `worker-QZAMAD-01` | 1 | 12 | 2.1 |
| `initialize-session` | `worker-QZAMAD-01` | 1 | 6 | 0.8 |
| `resolve-target` | `worker-QZAMAD-01` | 1 | 8 | 2.0 |
| `dispatch-client-workflow` | `worker-QZAMAD-02` | 1 | 14 | 21.6 |
| `end-workflow` | `worker-QZAMAD-03` | 1 | — | in flight |

98 events, 40 tool calls across the four exited activities, 12 techniques bundled and 2 fetched lazily, 2 resource fetches, 21 variable writes. No checkpoint was reached on the meta session before `end-workflow`.

## Client session `3IXIS7`

| Activity | Agents | Entries | Ledger rows | Tool calls | Duration (min) |
|---|---|---|---|---|---|
| `intake-and-context` | `worker-3IXIS7-01` | 1 | 2 | 86 | 13.8 |
| `scope-and-draft` | `worker-3IXIS7-01` | 1 | 1 | 43 | 8.1 |
| `quality-review` | `worker-3IXIS7-01`, `worker-3IXIS7-02` | 2 | 2 | 170 | 30.8 |
| `validate-and-commit` | `worker-3IXIS7-02` | 2 | 2 | 197 | 29.6 |

293 events, 496 tool calls, 59 resource fetches, 29 techniques bundled and 12 fetched lazily, 60 variable writes, 5 progress marks published, 1 activity redelivery.

### Checkpoint decisions

| Order | Activity | Checkpoint id | Answer | Responded |
|---|---|---|---|---|
| 1 | `intake-and-context` | `judgements-disposition` | `carry-open` | 2026-08-30T17:30:26Z |
| 2 | `scope-and-draft` | `scope-confirmed#0` | `confirmed` | 2026-08-30T18:48:34Z |
| 3 | `validate-and-commit` | `audit-disposition#0` | `remediate` | 2026-08-31T03:41:29Z |
| 4 | `validate-and-commit` | `audit-disposition#1` | `accept-and-record` | 2026-08-31T04:00:29Z |
| 5 | `validate-and-commit` | `approve-to-commit#1` | `approved` | 2026-09-01T09:12:27Z |

Five gates reached, five answered. `audit-disposition` ran twice under per-pass discriminators; its first answer sent the run back through `quality-review` for remediation round 1, and its second accepted the remaining Low finding on the record.

## Artifacts on disk

Eight files under the planning folder, excluding the server's own `session.json` and `.session-token`. The six below are the client workflow's own output, totalling 39.3 KB; the closing activity added two more — this trace and `09-token-usage.md`.

| Path | Size (KB) |
|---|---|
| `README.md` | 3.7 |
| `01-change-brief.md` | 9.0 |
| `01-impact-analysis.md` | 6.6 |
| `06-scope-manifest.md` | 4.4 |
| `09-findings-register.md` | 8.3 |
| `09-COMPLETE.md` | 7.2 |

## Mechanical notes

**The client's terminal activity left no exit event.** The client session records 6 `activity_entered` against 5 `activity_exited`, holds status `running` with `validate-and-commit` current and `work-package::manage-git::remove-worktree` as its current technique. That dispatch did file a usage row at 2026-09-01T09:18:49Z and its close-out document is on disk, so the work landed; what is absent is the exit that would move the session to a terminal state. In the record a finished terminal activity is indistinguishable from an abandoned one. A terminal activity is not transitioned past, so nothing calls `next_activity` to emit its exit — the gap is structural rather than a lost event.

**Two activities ran twice.** `quality-review` and `validate-and-commit` each entered a second time after `audit-disposition#0` selected `remediate`. The second `quality-review` pass ran under `worker-3IXIS7-02`, and remediation round 1 is where all three delivered files entered — no file entered through the scope gate.

**One meta dispatch is unledgered.** The meta session records 5 dispatches against 4 usage rows; the remainder is `end-workflow`, in flight while these files are written. Meta token totals are labelled a floor accordingly.

**Five client rows report on a cumulative basis, and one agent reports on both.** `worker-3IXIS7-01` filed delta rows for `intake-and-context` and cumulative rows thereafter, so the client's additive subtotal cannot absorb its cumulative figures without risking a double count. The basis question and its arithmetic are set out in the token-usage record.

**One gate held the run open for 29.2 hours.** `audit-disposition#1` was answered 2026-08-31T04:00:29Z and `approve-to-commit#1` 2026-09-01T09:12:27Z. That single wait is most of the 40.2 h between session start and close against 1.8 h of accounted execution.

**Progress marks are unreported.** All four completed meta activities appear under `progress_mark_unreported`, as does the client's `intake-and-context`. No activity on either session appears under `progress_mark_unpublished`.

**No errors and no validation warnings.** No failure event type appears in either session history, and no `_meta.validation` warning was returned to this activity's calls.

**Per-activity exit ids are not projected.** The read surfaces available to this activity return completed-activity lists and checkpoint responses but no exit id per activity, so the tables above carry no Exit column.
