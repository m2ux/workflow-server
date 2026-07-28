# Change Brief — Periodic Email Check Workflow

**Workflow:** `periodic-email-check` v1.0.0
**Mode:** Create
**Date:** 2026-07-28
**Change request:** Author a new workflow that checks the user's email periodically.
**Baseline:** none — no workflow in the library reads email or runs on a cadence.

---

## Purpose

A run of `periodic-email-check` makes one pass over the user's mailbox, classifies what has arrived since the previous pass, and leaves a record naming the items that need a human. The user triggers it on a recurring cadence rather than per-message, so the workflow's value over ad-hoc triage is consistency of the classification and a durable, reviewable record of what each pass decided.

This session authors the definition only: the workflow's activities, gates, artifacts and rules. It does not run a triage pass, and it does not stand up the scheduler that would invoke one.

| Goal | Meaning |
|------|---------|
| Recurring pass is unattended | A scheduled run reaches its terminal activity without a human answering a gate mid-flow |
| Classification is auditable | Each run leaves a record of what it saw and how it classified it, readable after the fact |
| Attention is bounded | A run surfaces the items needing a human and stays silent on the rest |
| Definition is library-conformant | The new definition passes the same guards and criteria walk as every other workflow in the library |

**Out of scope:**

- Standing up or configuring the recurring trigger itself (see judgement 2 — the trigger lives outside the definition).
- Authorizing the Gmail connector (see Access precondition below).
- Any change to existing library workflows.

### Access precondition

The mailbox is reachable only through the claude.ai Gmail connector, which is **not authorized** in the environment this session ran in. The workflow can be authored and guard-checked without it, but no run can read mail until the user authorizes that connector from their claude.ai connector settings. Judgement 7 covers whether the definition gates on this or assumes it.

### Platform constraint on "periodically"

`schemas/workflow.schema.json` declares no cron, schedule, interval or recurrence construct — a workflow definition is an activity graph invoked per run. Recurrence therefore cannot live in the definition; it has to be supplied by whatever starts the run. This constrains, but does not by itself settle, judgement 2.

---

## Dimensions

The create set is purpose → activity list → activity model → checkpoints → artifacts → variables → techniques → rules. The request settles purpose and nothing below it, so each remaining dimension names the judgement that must close before it can be shaped.

| Dimension | This run's shape |
|-----------|------------------|
| Purpose | Settled above: one recurring classification pass over the mailbox, leaving a record of what needs a human. |
| Activity list | Open. Its shape follows judgement 1 — a report-only workflow is a two-or-three activity read-classify-record chain; an acting workflow adds a disposition activity and its approval gate. |
| Activity model | Open, and downstream of the activity list. Whether the flow is linear or carries a rework loop depends on whether a run may re-classify after a human corrects it (judgement 4). |
| Checkpoints | Open, and in direct tension with the unattended goal: judgements 1 and 6 decide whether any `blocking: true` gate exists at all, because a blocking gate in a scheduled run stalls until a human arrives. |
| Artifacts | Open — judgement 5 names the destination for a run's output, which determines whether the terminal record is a planning-folder artifact, a notification, or both. |
| Variables | Open. The one variable the request implies is a cross-run watermark (judgement 8); the rest are gate flags that cannot be named before the checkpoints are. |
| Techniques | Open. The mail read is an agent action against the Gmail connector, not an existing library operation; whether the classification rubric is a loadable resource or a technique-internal judgement follows judgement 4. |
| Rules | Open. Two candidate invariants are already visible — a run never writes to the mailbox without an approved disposition (judgement 6), and a run never re-triages a message an earlier run closed (judgement 8) — but neither can be given an enforcement carrier before its judgement closes. |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Does a run report only, or also act on what it finds (label, archive, draft replies)? | "Check my email" names the read but not the disposition. | Report-only yields a short read-classify-record chain with no mailbox write scope and no approval gate. Acting adds a disposition activity, a per-action approval gate, and an undo story — and puts the approval gate in conflict with unattended operation. |
| 2 | What cadence, and what starts each run? | "Periodically" gives no interval, and the workflow schema carries no recurrence construct, so the trigger is necessarily external. | A cron routine (`CronCreate` / the `schedule` skill) makes runs genuinely unattended and forces every soft gate to carry a `defaultOption`. A user-restarted run can keep blocking gates but is no longer periodic in any enforced sense. |
| 3 | Which mailbox, and which subset of it — all new mail, unread only, one label, a sender allowlist? | "My email" names neither an account nor a filter. | An unbounded scope makes a run's duration and token cost unpredictable and forces a paging or batching activity. A narrow filter keeps a run to a single bounded pass. |
| 4 | What counts as needing attention — whose rubric, and is it fixed or learned? | The entire triage value sits in this rubric and none was supplied. | A user-supplied rubric becomes a workflow resource the definition loads and a reviewer can audit. A model-judged rubric needs a calibration gate on early runs and a way to review its misses, which reintroduces a human into the loop. |
| 5 | Where does a run's output go? | No destination was named. | A planning-folder artifact per run is durable and auditable but accumulates a folder per run. A notification (`PushNotification`) or an email digest is timely but leaves no record unless paired with an artifact. |
| 6 | May the workflow write to the mailbox at all — including marking messages read? | Separable from judgement 1: even a report-only pass might mutate read state as a side effect of reading. | Strictly read-only keeps a run safe to leave unattended and needs no approval gate. Any write, however small, needs a gate — and a gate defeats unattended operation unless it auto-advances, which means approving mailbox writes with no human present. |
| 7 | Does the definition preflight the Gmail connector, or assume it is authorized? | The connector is unauthorized in this environment, so the failure mode is real and will recur on any machine that has not authorized it. | A preflight activity turns a missing authorization into a clean terminal outcome with an actionable message. Assuming authorization means a scheduled run fails mid-flow, and on a cadence it fails silently and repeatedly. |
| 8 | Does a run know what earlier runs already triaged? | "Periodically" implies a high-water mark, but none was specified, and session state is per-run — it cannot carry one. | A persisted watermark outside session state avoids re-triaging and makes "since the previous pass" meaningful, at the cost of a store the workflow must own. No watermark means every run re-reads the same window and re-reports the same items. |

---

## Confirmation ask

Approving this brief commits to authoring `periodic-email-check` as a new library workflow whose purpose is a recurring, auditable classification pass over the mailbox — and accepts that all eight judgements above are still open, so the activity list, gates, artifacts, variables, techniques and rules cannot be drafted until they close.
