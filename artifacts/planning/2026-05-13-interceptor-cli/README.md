# MCP-Client Interceptor CLI - May 2026

**Created:** 2026-05-13
**Status:** In Progress
**Type:** Feature

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## Executive Summary

Ship `workflow-server-interceptor` — a TypeScript CLI bundled as a new `bin` entry of the existing `@m2ux/workflow-server` npm package — that hooks into MCP-client lifecycle events (PreToolUse / PostToolUse) to inject and capture the workflow-server `session_token` automatically. The LLM never has to re-type the ~480-character HMAC-signed token, eliminating an entire class of transcription-drift bugs at the structural level rather than mitigating them probabilistically.

---

## Problem Overview

When an agent works through one of the workflows hosted by this server, the server hands it a long, opaque string called a session token on the very first call. Every later call that the agent makes back to the server has to include that exact same string — letter for letter — so the server can confirm the conversation is still the same one. The token is roughly five hundred characters of seemingly random text, and the agent has to copy it into the next call's arguments itself. Most of the time this works fine, but the agent is a language model: it is very good at copying long opaque strings, not perfect. Occasionally it changes one or two characters by mistake. When that happens, the server cannot recognise the token, the workflow stops mid-step, and the user has to start over.

The consequences are larger than a single failed call. A workflow can be twenty or thirty tool calls long; a single mis-typed character anywhere in that chain throws away all the work that came before. Users see a cryptic error about signature verification and have no obvious recovery path. It also discourages the team from making workflows longer or richer, because every extra step is another chance to lose the session. The problem is structural — it stems from putting a fragile human-style copy-paste operation in the middle of an automated pipeline — and so no amount of "be more careful" instruction to the agent makes it go away.

---

## Solution Overview

The fix moves the job of remembering the session token out of the language model and into the tools the model already uses. A small program called `workflow-server-interceptor` ships as part of the `@m2ux/workflow-server` package. Once installed, the user's coding tool (Claude Code, Cursor, OpenCode, Codex CLI, or the Claude Agent SDK) runs this program automatically every time the model talks to the workflow server. The program does two things: when the model is about to send a request, it slips the correct token into the request; when the server sends a reply back, it saves the new token to a small local file for next time. The model never has to copy the token itself, so it can no longer accidentally change a character and break the conversation.

The program is deliberately cautious. It always leaves the very first call (`start_session`) alone, because that is the one place the user might legitimately be supplying their own token. It also leaves any other call alone if the model has already supplied a token or a checkpoint handle of its own. If the local token file is missing or unreadable, or if the program itself is not installed, the system behaves exactly the way it does today — the model carries the token by hand. Nothing the program does can make a working call fail. The token file is created with file permissions that only the current user can read, so the token never leaks to other users on the same machine. The result is that workflows of any length become resilient: the structural source of the "signature verification failed" error is eliminated, not merely mitigated.

---

## Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| -- | Implementation | Code changes per plan | 1-4h | ✅ Complete |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ✅ Complete |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete |
| 06 | [Structural findings](06-structural-findings.md) | L12 single-pass structural analysis | 10-15m | ✅ Complete |
| 06 | [Architecture summary](06-architecture-summary.md) | C4 diagrams and invariant table | 10-15m | ✅ Complete |
| 10 | [Strategic review](10-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| 09 | [Validation report](09-validation-report.md) | Build, test, lint verification | 15-30m | ✅ Complete |
| -- | PR review | External review feedback cycle | 30-60m | Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | Pending |

---

## Implementation outcomes

### Tier-C revert (Task 10)

Decision recorded during the implement activity: **Option 10A** — revert
the two tier-C commits (`f7a4cd8` and `1cd7d56`) on the existing
`enhancement/session-token-size-optimization` branch and abandon the
branch without a PR. The interceptor (this PR) eliminates the
transcription-corruption motivation for tier-C, so the modules
(`SessionStore`, `state-hash`, `wire-token`, CBOR codec) become dead
weight pending a future, separately-motivated need.

The reverts land as two commits on
`enhancement/session-token-size-optimization`:

- `36fb736` — Revert "feat(session): add SessionStore, CBOR wire codec,
  state_hash modules"
- `8c46f8d` — Revert "feat(session): switch wire format to CBOR; move
  state to SessionStore"

Verification on the post-revert branch: `npm run typecheck` clean,
`npm test` reports 256 passing / 2 skipped (the original pre-tier-C
counts; tier-C had added its own test files that were also reverted).
No references to `SessionStore`, `state_hash`, `wire-token`, or the
CBOR codec remain in the post-revert tree (apart from git history).

`main` never saw tier-C, so reverting on the unmerged branch and
closing it (no PR) is the cleanest outcome. Tier-C work may resurrect
later for unrelated reasons (state size on disk, log volume), but its
current branch's motivation no longer holds.

## Links

| Resource | Link |
|----------|------|
| Issue | [#112](https://github.com/m2ux/workflow-server/issues/112) |
| Branch | `feat/112-interceptor-cli` |
| PR | [#113](https://github.com/m2ux/workflow-server/pull/113) |
| Workflows submodule branch | `feat/112-meta-skill-prune` |
| Tier-C revert branch (abandoned) | `enhancement/session-token-size-optimization` |
| Repository | https://github.com/m2ux/workflow-server |

---

**Status:** Ready. Plan and test plan complete; problem classified as `specific-problem-cause-known` / `simple`; workflow path = `skip-optional`. Ready for implementation activity.
