# Meta Workflow Resources

> Part of the [Meta Workflow](../README.md)

Markdown resources providing the bootstrap navigation primer and shared cross-workflow reference structures (such as the canonical planning-folder README guide). Agent entry Protocol lives on workflow-engine techniques ([activity-worker](../techniques/workflow-engine/activity-worker.md), [workflow-orchestrator](../techniques/workflow-engine/workflow-orchestrator.md)); agent stubs are composed by [compose-prompt](../techniques/workflow-engine/compose-prompt.md).

---

## Resource Index

| Resource ID | Resource | Purpose |
|-------------|----------|---------|
| `bootstrap-protocol` | [Bootstrap Protocol](./bootstrap-protocol.md) | Pre-session stub served by `discover`: how a session is named, opened, and advanced onto the activity that walks the client. |
| `session-summary-template` | [Session Summary Template](./session-summary-template.md) | Skeleton for the markdown session summary composed at workflow close |
| `planning-readme` | [Planning Folder README Guide](./planning-readme.md) | Universal Template + Progress Status policy for planning-folder `README.md`; Progress inventory comes from each workflow's readme-seed profile |
| `resume-intent-lexicon` | [Resume Intent Lexicon](./resume-intent-lexicon.md) | Continuation-phrase vocabulary and negative cases `start_session` matches when deciding whether to scan saved sessions |
| `writing-register` | [Artifact Writing Register](./writing-register.md) | Prose, table and link register for any artifact whose declared audience is a person; creation guides keep the sections and budgets |
| `token-usage` | [Token Usage](./token-usage.md) | Creation guide: `token-usage.md` — a run's sole cost home, carrying the per-activity ledger, totals, coverage reconciliation and estimate caveat |
| `session-trace` | [Session Trace](./session-trace.md) | Creation guide: `session-trace.md` — the lean mechanical record of what executed, how long it took, and where it went wrong |
| `run-status` | [Run Status](./run-status.md) | Creation guide: the run status a completed activity emits — the artifact link, its one-line summary, the activity checklist, and the boundaries on what else may appear |

---

## Cross-Workflow Access

Cross-workflow ids use the `meta/<resource-id>` form (e.g. `meta/bootstrap-protocol`, `meta/planning-readme`, `meta/writing-register`). Load via [resource-loading-via-tool](../techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool).
