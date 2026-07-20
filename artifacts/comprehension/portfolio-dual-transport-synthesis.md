# Portfolio Synthesis — Dual-Transport Extension Points

> Lenses: [pedagogy](portfolio-dual-transport-pedagogy.md), [rejected-paths](portfolio-dual-transport-rejected-paths.md) · applied to [workflow-server.md § Dual-Transport Extension Points](workflow-server.md#dual-transport-extension-points--2026-07-20) · 2026-07-20

## Convergent Finding

Both lenses independently flagged the same structural property: reusing `logInfo`/`logError` for HTTP request logging overloads the `type: 'info'` log tag with two different field shapes (MCP audit fields vs. HTTP request fields). Pedagogy names it a silent transferred-pattern cost; rejected-paths names it the invisible danger of the alternative not taken (a dedicated HTTP log shape). Two lenses reaching the same risk via different operations raises confidence this is real, not an artifact of one lens's framing — it is tracked as a deferred item below rather than blocking implementation, since both lenses also agree it fails quietly (discovered under pressure, not in review).

## Unique Findings

- **Pedagogy**: names the deeper, unstated precondition underneath every reuse decision in the deep-dive — `setAuditWorkspaceDir`'s module-level mutable variable assumes exactly one `workspaceDir` per process. This is the lens's top prediction for what breaks first (multi-workspace HTTP deployment) and it is the slowest failure to discover because it produces no error, only mis-attributed trace/audit records.
- **Rejected-paths**: sharpens the transport-class decision (`StreamableHTTPServerTransport` over `SSEServerTransport`) beyond "it's newer" — `SSEServerTransport`'s DNS-rebinding-protection options are already `@deprecated` in the installed SDK version in favor of a separate `hostHeaderValidation` middleware, so the rejected path would have built new code against a security-relevant surface already marked for removal.

## Summary Table

| Finding | Lens(es) | Convergent / Unique |
|---|---|---|
| HTTP-logging reuse overloads `type: 'info'` with two field shapes | pedagogy, rejected-paths | Convergent |
| `setAuditWorkspaceDir` encodes an unstated one-workspace-per-process precondition | pedagogy | Unique |
| `SSEServerTransport`'s security-relevant options are already deprecated in this SDK version | rejected-paths | Unique |
| Config-style mixing (manual parsing vs. `zod`) is a real but review-visible risk, not a silent one | pedagogy, rejected-paths | Convergent |

## Disposition

Both new risks are recorded rather than acted on in this work package, since neither is triggered by the dual-transport work itself (single workspace per process, health/ready endpoints only — no HTTP logging consumer exists yet to be broken by the shape overload). See [deferred-items register](../planning/2026-07-20-dual-transport/deferred-items.md) once created during planning.
