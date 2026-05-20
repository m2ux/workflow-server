# Session Token Size Optimization - May 2026

**Created:** 2026-05-13
**Status:** In Progress
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## Executive Summary

Reduce the MCP session token's on-the-wire size by moving most session state out of the token and into a server-managed `SessionStore`, leaving only a minimal HMAC-signed CBOR envelope on the wire. This addresses token bloat that grows linearly with workflow depth and skill/condition strings, and replaces JSON+hex encoding with a compact CBOR+base64url format bound to the server record via a truncated state hash.

---

## Problem Overview

Every tool call that the workflow server handles carries a session token — a small piece of state that the agent passes back on each request so the server knows which workflow, activity, and step the conversation is on. Until now, that token has carried the entire conversation state directly inside it: the workflow name, the activity name, the skill, any active condition, sequence counters, timestamps, parent-session pointers, and identifiers. Each of those fields was written as plain JSON text, signed, and shipped back to the agent as a long string. As workflows grew deeper and skill or condition names grew more descriptive, that string grew with them — and because the agent has to echo it back on every single call, the cost was paid over and over for the lifetime of a session.

The practical consequences are friction and fragility. Long tokens consume model context the agent could otherwise spend on the user's actual problem, they make logs and traces harder to read, and they bake every piece of state into something that has to be re-signed and re-transmitted whenever any field changes. There is also no way for the server to detect tampering or drift beyond a coarse signature check, because the wire token *is* the state — there is no independent record to compare it against. The longer a workflow runs and the more skills it touches, the more the token costs to carry and the harder it is to reason about what is actually authoritative.

---

## Solution Overview

The session token is the small piece of state that the agent has to hand back to the server on every tool call so the server knows which workflow and activity the conversation is on. Today that token has been carrying the entire conversation state inside it — the workflow name, activity name, skill name, condition, counters, and parent-session pointers — written out as JSON text and signed. The fix moves all of that state into the server, into a record on disk that lives alongside the planning folder for the work package, and shrinks the token down to just a short identifier and a small fingerprint that lets the server confirm the agent and the server still agree on what the session is. The token gets dramatically shorter — about a quarter of its old size — and the server keeps the authoritative copy of the state, not the agent.

The fix works in three layers. First, the on-the-wire format changes from a long JSON-and-hex string to a compact binary format (CBOR with a five-field schema and a base64url-encoded signature), which is the size win on its own. Second, the server now keeps an authoritative record of each session, and the token carries a small hash that ties itself to that record — so if the agent's view drifts from the server's, the server can tell and report exactly which kind of drift happened, instead of the old all-or-nothing "signature failed" error. Third, the server gains a new `bind_session_path` operation that the workflow uses to relocate the session record into the planning folder once the workflow knows where that folder is, so deleting the planning folder cleanly invalidates the session and the server can give a clear error rather than a cryptic one. Old-format tokens still in the wild are migrated on first contact, and the existing 308 tests continue to pass.

---

## Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| -- | Implementation | Code changes per plan (phases 1-2 complete; phases 3-4 pending) | 1-4h | In Progress |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | Pending |
| -- | Validation | Build, test, lint verification | 15-30m | Pending |
| -- | PR review | External review feedback cycle | 30-60m | Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | Pending |

---

## Links

| Resource | Link |
|----------|------|
| Issue | _None — self-targeting work package; issue creation skipped per orchestrator pre-resolution_ |
| Branch | `enhancement/session-token-size-optimization` |
| Workflows submodule branch | `enhancement/session-token-size-optimization-meta` |
| PR | _Pending — will be created during submit-for-review_ |
| Repository | https://github.com/m2ux/workflow-server |

---

**Status:** Ready — work-package plan and test plan complete; phases 1-2 committed on branch; phases 3-6 + E2E ready for implementation.
