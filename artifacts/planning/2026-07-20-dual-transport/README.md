# Dual Transport Support - July 2026

> Feature · Created 2026-07-20 · **Status:** Complete (planning/documentation) — PR #265 ready for review, merge outstanding

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds an HTTP/SSE transport alongside the server's existing stdio transport, selectable via a `--transport` CLI flag, with stdio remaining the default and unchanged. Forward-compatible HTTP-only middleware (request IDs, structured logging, error handling), health/readiness endpoints, and graceful shutdown are included to prepare for a future Docker/cloud phase without altering stdio behavior.

## Problem Overview

Today the workflow server can only be reached over stdio — a mode where an agent harness starts the server as a local subprocess and talks to it over its standard input and output streams. That works well for a single desktop tool talking to a single local process, but it rules out anything that needs to reach the server over a network: a browser-based client, a shared team deployment, or a future containerized/cloud rollout. Without an HTTP option, every one of those scenarios is blocked today.

This work package adds an HTTP transport as a second, opt-in way to run the same server, chosen with a command-line flag, while leaving stdio exactly as it is for everyone who doesn't ask for HTTP. Anyone running the server without changes keeps their current setup working unchanged; anyone who does want HTTP gets health checks, structured logs, and clean shutdown behavior for free, which are exactly the pieces a later move to Docker or the cloud will need.

## Solution Overview

The server will learn a second way to start up: alongside the existing mode (talking to a single local tool over its input/output streams), it can now start as a small local web server that listens on a network port, turned on with one command-line switch. Nothing changes for anyone who doesn't use that switch — the server behaves exactly as it does today. Turning it on adds a health check anyone can ping to confirm the server is alive, readable structured logs for every request, and a clean shutdown when the server is stopped, so it stops mid-task work instead of dropping requests.

This groundwork is deliberately narrow: it does not add user accounts, logins, or network security by itself, and it is meant to run behind existing network protections (a private network or a reverse proxy) rather than being exposed directly to the internet. What it does deliver is the missing piece that was blocking browser-based tools, shared team setups, and a future move to running the server in the cloud — all of which need to reach the server over a network rather than as a local subprocess.

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete (11 assumptions) |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete (initial) |
| 06 | [Deferred items](06-deferred-items.md) | Consciously descoped items (D-1: HTTP auth) | — | ✅ Complete |
| 08 | Implementation | 5 tasks: CLI flags, transports/middleware modules, CLI router, deps/scripts | 4-6h | ✅ Complete |
| 08 | [Provenance log](08-provenance-log.md) | Per-task assistant/model/context provenance | — | ✅ Complete |
| 09 | [Lean-coding audit](09-code-review.md) | Over-engineering findings + applied simplification | 10-20m | ✅ Complete (1 finding, applied, net -46 lines) |
| 09 | [Debt ledger](09-debt-ledger.md) | `ponytail:` deliberate-shortcut markers | — | ✅ Complete (clean, none) |
| 10 | [Change block index](10-change-block-index.md) | Per-block rationale for manual diff review | 5-10m | ✅ Complete |
| 10 | [Code review](09-code-review.md#code-review-post-impl-review) | Correctness/security/maintainability review | 10-20m | ✅ Complete (1 low-severity finding, deferred to D-2) |
| 10 | [Structural analysis](10-structural-analysis.md) | Layering/coupling risk across the change set | 10-15m | ✅ Complete (no findings) |
| 10 | [Test suite review](10-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete (1 gap found and closed) |
| 10 | [Architecture summary](10-architecture-summary.md) | Stakeholder-readable overview of the change | 10-15m | ✅ Complete |
| — | Validation | `npm run build` / `typecheck` / `vitest run` — all green (pre-existing unrelated failures excluded) | 15-30m | ✅ Complete |
| 12 | [Strategic review](12-strategic-review-1.md) | Scope, orphan, minimality, commit-signature, and PR-body checks | 15-30m | ✅ Complete (1 finding: unsigned commits, accepted) |
| — | `Comprehension artifact` | Persistent codebase knowledge | 20-45m | N/A (findings folded into plan/assumptions log instead) |
| — | DCO attestation | [Provenance log](08-provenance-log.md#attestation) | — | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ✅ Marked ready — no reviewer feedback yet |
| — | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ✅ Complete |

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | _skipped_ |
| PR | [#265](https://github.com/m2ux/workflow-server/pull/265) |
