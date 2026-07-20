# Portfolio Lens: Rejected Paths — Dual-Transport Extension Points

> Applied to [workflow-server.md § Dual-Transport Extension Points](workflow-server.md#dual-transport-extension-points--2026-07-20) · 2026-07-20

## Concrete Problems and Their Enabling Decisions

| # | Problem the decision addresses | Decision made | Rejected path | What the rejected path would have prevented | Invisible danger the rejected path would have created instead |
|---|---|---|---|---|---|
| 1 | Which MCP-SDK HTTP transport class to use | Use `StreamableHTTPServerTransport` | Follow the plan's `SSEServerTransport` sample literally | Behavioral surprise from an SDK class the plan's authors never validated acceptance criteria against (stateful/stateless session-ID-generator semantics) | Building on `SSEServerTransport`, whose DNS-rebinding-protection options are already `@deprecated` in this SDK version in favor of a separate `hostHeaderValidation` middleware — a security-relevant surface already marked for removal |
| 2 | How to validate the new `--transport`/`--port`/`--host` flags | Extend `config.ts`'s existing manual parsing | Use `zod` for the new flags, per the plan | Type-coercion bugs in a hand-rolled numeric-flag parser (`zod`'s `.coerce.number()` is more robust than a bespoke equivalent) | Two config-construction styles in one file — future config additions have no single obvious convention, and reviewers must know both patterns |
| 3 | How to log HTTP requests | Reuse `logInfo`/`logError` | Add a dedicated request-logging middleware with its own log shape, per the plan | The schema-mixing problem in danger column 3 below | `type: 'info'` entries fork into two field shapes (MCP audit vs. HTTP request) under one tag — a log consumer built against `AuditEvent`'s shape doesn't expect `method`/`path`/`status` fields and may silently misparse or drop them |

## Migration Law

The class of problem that migrates between visible and hidden here is **schema-shape ambiguity**. Each "reuse the existing X" decision converts an up-front, visible integration decision (which logging convention? which config-validation library?) into a downstream, hidden one: how many implicit sub-shapes does the reused convention now carry, and does every future consumer know about all of them? The visible cost (deciding now, consistently) is paid once; the hidden cost (disambiguating later) is paid by whoever builds tooling on top of the now-overloaded convention, without warning that it's overloaded.

## Prediction

The config-style mixing (row 2) is the migration a reviewer catches early — it's visible in the `config.ts` diff during PR review. The logging schema-mixing (row 3) is the migration a practitioner discovers first under pressure: it produces no diff-visible signal, and only surfaces when someone greps the stderr JSON stream during a production incident, expecting `type: 'info'` to mean one field shape, and finds it forks in two depending on which transport emitted the line.
