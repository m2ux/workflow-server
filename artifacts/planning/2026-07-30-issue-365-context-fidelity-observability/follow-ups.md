# Follow-ups

> Context Fidelity and Observability · #365 · updated 2026-07-31

In-task remainders still inside this package (not out-of-scope — those live in [deferred-items](deferred-items.md)).

| ID | Opened at | Item | Owner / next |
|----|-----------|------|----------------|
| F-1 | submit-for-review | **PR #366 still draft after mark-ready.** REST `PATCH repos/…/pulls/366` with `draft=false` returns 200 but leaves `draft: true`. GitHub only undrafts via GraphQL `markPullRequestReadyForReview` or `gh pr ready`; AGENTS.md forbids GraphQL and `gh pr *`. Review is a pass; undraft is a host/human one-liner before merge visibility. | Human: `gh pr ready 366` (or UI Ready for review) once before merge; optional workflow fix later for REST-capable undraft docs |

## Retrospective findings (harvest into close-out)

| ID | Opened at | Finding | Carry to |
|----|-----------|---------|----------|
| R-1 | plan-prepare / implement | **AGENTS.md host-auth / sandbox miss (recurring).** Disposable workers reported `gh` / SSH as broken after sandboxed shell failures (`Bad owner or permissions on …/ssh_config.d/…`). Root AGENTS.md already requires: unset `GH_TOKEN`/`GITHUB_TOKEN`, keyring, GitHub and git remote ops **outside** the Cursor sandbox. Plan-prepare filed false F-1–F-3; implement left feature-branch commits local-only until the orchestrator pushed unsandboxed. On host re-run, keyring `gh` and SSH succeed. **Lesson:** sandbox denial is not auth failure; spawn prompts must mandate unsandboxed remote ops; orchestrator must push when workers cannot. | [Close-out retrospective](14-COMPLETE.md) when written |
