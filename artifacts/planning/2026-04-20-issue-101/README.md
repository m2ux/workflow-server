# HTTP/SSE Transport — Session Token Context Bloat - April 2026

**Created:** 2026-04-20  
**Status:** In Progress  
**Type:** Feature

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Switch the MCP server from stdio to HTTP/SSE transport so that workflow session tokens are carried in the `Mcp-Session-Id` response header rather than in tool call result content. This eliminates the ~500+ character JWT from the LLM's context window on every tool call, reducing token consumption for the duration of every workflow session. The server remains fully stateless — no changes to JWT signing or verification logic are required.

---

## Problem Overview

*Populated during start-work-package activity.*

---

## Solution Overview

The workflow server currently embeds a signed session token — a 500+ character string — in the text content of every tool response. Because the server uses stdio transport, which has no way to carry data outside the message body, this token is visible to the LLM and accumulates in its context window across every turn of a workflow session. The solution switches the server to HTTP/SSE transport, which provides a separate metadata channel (`_meta`) that is accessible to SDK-level client tooling but not shown to the LLM. The token is removed entirely from response content, eliminating the per-call context bloat while keeping the token available via `_meta.session_token` for clients that need it. The stdio transport is retained for local development via a `TRANSPORT` environment variable.

The fix works by adding `StreamableHTTPServerTransport` (already present in the MCP TypeScript SDK) as an alternative to `StdioServerTransport`, selected by the `TRANSPORT=http` environment variable. In both transport modes, `session_token` and `checkpoint_handle` are removed from all 17 content body locations across the two tool files. The token remains as a required tool parameter that agents pass explicitly, and `_meta.session_token` continues to carry it for SDK-level auto-threading. The server stays fully stateless — no session store is added — and the existing test suite passes without modification because it uses an in-memory transport that is independent of the stdio/HTTP choice.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 01 | [Assumptions log](assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Transport switch, header plumbing, entrypoint config | 1-3h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#101](https://github.com/m2ux/workflow-server/issues/101) |
| PR | [#103](https://github.com/m2ux/workflow-server/pull/103) |

---

**Status:** Plan & Prepare — plan and test plan complete, ready for implementation
