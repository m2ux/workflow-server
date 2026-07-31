# Follow-ups

> Context Fidelity and Observability · #365 · updated 2026-07-31

In-task remainders still inside this package (not out-of-scope — those live in [deferred-items](deferred-items.md)).

| ID | Opened at | Item | Owner / next |
|----|-----------|------|----------------|
| — | — | *(none open)* | Plan-prepare sync-branch and update-pr completed on host (unsandboxed keyring + SSH per AGENTS.md). |

## Retrospective findings (harvest into close-out)

| ID | Opened at | Finding | Carry to |
|----|-----------|---------|----------|
| R-1 | plan-prepare | **AGENTS.md host-auth miss.** A disposable plan-prepare worker reported `gh` / SSH / GPG as broken after sandboxed shell failures (`Bad owner or permissions on …/ssh_config.d/…`, invalid-looking token paths). Root AGENTS.md already states the correct procedure: unset `GH_TOKEN`/`GITHUB_TOKEN`, use keyring, run GitHub and git remote ops **outside** the Cursor sandbox (`required_permissions: ["all"]`). The orchestrator accepted the worker's env failure as host auth failure and filed F-1–F-3 as blocked follow-ups instead of re-running the same ops unsandboxed. On re-run, keyring `gh` and SSH succeeded immediately; feature branch merge+push and PR #366 body PATCH completed. **Lesson:** sandbox denial is not auth failure; AGENTS.md GitHub auth section is mandatory before any "gh broken" claim; false follow-ups must be corrected in-session, not left for humans. | [Close-out retrospective](14-COMPLETE.md) when written |
