# Fan Conformance Workflow

> Part of the [workflow corpus](../README.md)

Runs both forms of graph fan against a real checkout and reports what happened: one worker per branch, each with an identity and a container slot of its own, entering the activity they converge on once. It exists because the routing is the only thing under test — the surveys the branches run are cheap on purpose, so the run's cost is the routing's cost and the evidence is about the routing.

## The two forms

A destination is one of three things: an activity id, a **list of members** running side by side, or **one activity together with a collection** to run it once per element of. This workflow uses both fanning forms, one after the other, so each is exercised on its own rather than in a mixture where a failure could belong to either.

```
plan-conformance ──┬── survey-files ────┬── choose-probes ──┬── probe-directory#0 ──┬── report-conformance
                   └── survey-history ──┘                   ├── probe-directory#1 ──┤
                                                            └── probe-directory#2 ──┘
    heterogeneous: two different activities        homogeneous: one activity, one instance per element
```

The first fan names two different activities. Both survey the component, neither reads the other's output, and they converge on `choose-probes` when the second of them returns.

The second fan names one activity and the collection `choose-probes` produced. The run opens one instance per entry, each handed its own entry, and they converge on `report-conformance` when the last returns. The width is the collection's length — `probe_budget`, settled before any survey runs.

The meeting point of the first fan is the source of the second. That is legal and deliberate: a fan may not converge on the activity whose exit opens it, but nothing stops a convergence from opening a fan of its own.

## What a run leaves behind

One document, `fan-conformance-report.md`, shaped by [conformance-report](resources/conformance-report.md#template). It answers one question in three sections:

- **Identity** — did each slot report back the designator its unit was handed? A disagreement means a branch was served a sibling's element, and it is printed as a disagreement rather than reconciled.
- **Overlap** — did the branches of each fan run at the same time? Every instant comes from a branch's own record, because the activity writing the report was not running while they were. Overlapping intervals are a batch; abutting ones are a queue, which is a correct result the report states plainly.
- **What the record did not expect** — empty slots, missing intervals, a branch that started before the run did.

## Activities

| # | Activity | Role in the flow |
|---|----------|------------------|
| [01](activities/01-plan-conformance.yaml) | Plan Conformance | Fixes the instant every branch's interval is read against, and settles how wide the instance fan opens |
| [02](activities/02-survey-files.yaml) | Survey Files | One branch of the heterogeneous fan — counts files by extension, ranks directories by size |
| [03](activities/03-survey-history.yaml) | Survey History | The other branch — summarises recent commits and the directories they touched |
| [04](activities/04-choose-probes.yaml) | Choose Probes | Where the first fan converges and the second opens: gathers both surveys, picks the directories to probe |
| [05](activities/05-probe-directory.yaml) | Probe Directory | One instance per picked directory, each describing only its own |
| [06](activities/06-report-conformance.yaml) | Report Conformance | Where the second fan converges: reads both containers whole and writes the report |

## Where a branch's outputs land

Neither meeting point names a slot. Each reads the container whole — `survey_files_outputs`, `survey_history_outputs`, `probe_directory_outputs` — and hands it to `gather-results` with the collection that produced it as the expected ids. The container's own order carries the correspondence, and the width is a run-time value no authored index could be checked against.

## Running it

The instance fan's width is `probe_budget`, three by default. The server refuses a destination wider than its own ceiling at the moment the fan opens, so a run wanting more than that raises `FAN_MAX_BRANCHES` as well as the budget.
