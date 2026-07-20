# Test Plan: Dual Transport Support

> **PR:** [#265](https://github.com/m2ux/workflow-server/pull/265)

## Overview

This test plan validates the HTTP/SSE transport added alongside stdio, selected via `--transport`, and its supporting config, middleware, and shutdown behavior.

Key changes to validate:
1. `loadConfig` - `--transport`/`--port`/`--host` parsing and defaults
2. `startHttpServer` - HTTP transport startup, `/health`, `/ready`, request-id propagation, error shape, graceful shutdown
3. `startStdioServer` - stdio path unchanged after the `index.ts` split

## Planned Test Cases

Source links point at the `feat/dual-transport-support` branch (not yet merged — see [06-deferred-items.md](06-deferred-items.md) for scope and the PR for merge status).

<div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:50px">Type</div> | Source
--- | --- | --- | ---
PR265-TC-01 | Verify `loadConfig` defaults `transport` to `stdio` when `--transport` is absent | Unit | [config.test.ts#L114](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/config.test.ts#L114)
PR265-TC-02 | Verify `loadConfig` parses `--transport=http` and `--transport http` forms | Unit | [config.test.ts#L119](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/config.test.ts#L119), [#L124](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/config.test.ts#L124)
PR265-TC-03 | Verify `loadConfig` rejects an unrecognized `--transport` value with `WorkspaceConfigError` | Unit | [config.test.ts#L141](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/config.test.ts#L141)
PR265-TC-04 | Verify `--port`/`--host` CLI values take precedence over env vars, with documented defaults when neither is set | Unit | [config.test.ts#L146-166](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/config.test.ts#L146)
PR265-TC-05 | Verify `GET /health` returns 200 with a status body | Integration | [http-transport.test.ts#L38](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L38)
PR265-TC-06 | Verify `GET /ready` returns 200 (or 503 with detail) reflecting workspace/config resolution | Integration | [http-transport.test.ts#L44](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L44), [#L51](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L51)
PR265-TC-07 | Verify every HTTP response carries an `x-request-id` header, generated when absent and propagated when supplied by the caller | Integration | [http-transport.test.ts#L62](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L62), [#L67](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L67)
PR265-TC-08 | Verify an unknown HTTP route returns a JSON body shaped `{ error, message, requestId, timestamp }` | Integration | [http-transport.test.ts#L75](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L75)
PR265-TC-09 | Verify `SIGTERM` closes the HTTP listener and exits the process without hanging on a second close | Integration | [http-transport.test.ts#L154](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L154), [#L164](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L164)
PR265-TC-10 | Verify `startHttpServer` binds to `config.host`/`config.port`, and the stdio path (`startStdioServer`) is unchanged from before the `index.ts` split | Integration | [http-transport.test.ts#L132](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L132)
PR265-TC-11 | Verify `npm run build` compiles the new transport/config/middleware modules with zero TypeScript errors | Manual | `npm run build` — clean, per [10-test-suite-review.md](10-test-suite-review.md)

Additional coverage beyond the initial plan, added during implementation and post-impl review: a live `initialize` → `tools/list` round-trip over the real `StreamableHTTPServerTransport` ([http-transport.test.ts#L102](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L102)), and error-shape checks for missing/unknown MCP session ids ([#L84](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L84), [#L91](https://github.com/m2ux/workflow-server/blob/feat/dual-transport-support/tests/http-transport.test.ts#L91)).

## Running Tests

```bash
npx vitest run tests/config.test.ts tests/http-transport.test.ts
```

Full-suite results and the 178 pre-existing unrelated failures are recorded in [10-test-suite-review.md](10-test-suite-review.md).
