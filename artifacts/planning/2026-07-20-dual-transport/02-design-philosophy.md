# Design Philosophy

> design-philosophy · Dual Transport Support · issue skipped · 2026-07-20

## Problem Statement

The workflow server's MCP transport is stdio-only: `src/index.ts` creates a `Server` and connects a `StdioServerTransport` directly, with tool registration inline and no CLI argument handling. This blocks any client that needs network access — a browser-based client, a shared team deployment, or a future Docker/cloud rollout — and there is no way to select an alternative transport without editing source.

### System Context

Entry point `src/index.ts` builds the `Server` instance, registers `ListToolsRequestSchema`/`CallToolRequestSchema` handlers inline, and connects a `StdioServerTransport`. Workflow, planning, and session logic live under `src/workflows/`, `src/planning/`, and `src/session/` and are transport-agnostic already — they are invoked from the request handlers, not from the transport itself.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — no outage, but blocks any network-reachable deployment mode |
| Scope | Server operators/integrators who need HTTP-reachable clients (browser clients, shared/team deployments) |
| Business Impact | Cannot progress to a future Docker/cloud phase without an HTTP transport, health/readiness endpoints, and graceful shutdown already in place |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Simple

**Rationale:** Nothing is currently broken — this adds a new capability (HTTP/SSE transport) alongside the existing stdio transport, so it classifies as an inventive improvement rather than a specific-problem fix. Complexity is simple: a complete, prescriptive implementation plan already specifies every new file, its contents, and acceptance criteria, following an established pattern (stdio + SSE-over-Express, with the MCP SDK doing the protocol work) with no architectural ambiguity or unresolved trade-off.

## Workflow Path Decision

**Selected Path:** Skip optional discovery activities

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [ ] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** The user-supplied implementation plan (`dual_transport_implementation_plan_v1.1.md`) already fully specifies requirements, file layout, and acceptance criteria, so elicitation, research, and implementation analysis add no new information. Codebase comprehension still runs next (mandatory on every path) to confirm the plan's assumed architecture matches this repository's actual `src/index.ts` and tool registration before planning tasks.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | None specified |
| Technical | stdio's default behavior and wire format must not change; no Docker or cloud infrastructure in this phase |
| Dependencies | Adds `express`, `zod` (runtime) and `@types/express` (dev) |
| Resources | None |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| stdio unaffected | `node dist/index.js` and `node dist/index.js --transport=stdio` | Starts on stdio, identical to current behavior |
| HTTP transport selectable | `node dist/index.js --transport=http` | Starts HTTP server on configured port |
| Shared tool registration | Inspect `src/tools.ts` usage | Both transports call the same `registerTools`; no tool definitions elsewhere |
| Health endpoint | `curl /health` | HTTP 200, `status: healthy` |
| Readiness endpoint | `curl /ready` | HTTP 200 (or 503 with detail) reporting dependency checks |
| Request correlation | `curl -I /health` | Response carries `x-request-id` |
| Structured logging | HTTP request in `--transport=http` mode | Console emits one JSON line per request with method, path, status, duration |
| Structured errors | `curl` an unknown HTTP route | JSON body with `error`, `message`, `requestId`, `timestamp` |
| Graceful shutdown | SIGTERM/SIGINT to HTTP process | Logs shutdown start, closes listener, exits cleanly |
| Build | `npm run build` | Compiles with zero TypeScript errors |
| Existing scripts unaffected | `npm run dev`, `npm start` | Both still start stdio transport |

## Notes

Implementation follows the user-supplied `dual_transport_implementation_plan_v1.1.md` step-for-step, adapted to this repository's actual file layout during planning.
