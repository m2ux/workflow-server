# Test Plan: Dual Transport Support

> **PR:** [#265](https://github.com/m2ux/workflow-server/pull/265)

## Overview

This test plan validates the HTTP/SSE transport added alongside stdio, selected via `--transport`, and its supporting config, middleware, and shutdown behavior.

Key changes to validate:
1. `loadConfig` - `--transport`/`--port`/`--host` parsing and defaults
2. `startHttpServer` - HTTP transport startup, `/health`, `/ready`, request-id propagation, error shape, graceful shutdown
3. `startStdioServer` - stdio path unchanged after the `index.ts` split

## Planned Test Cases

<div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:50px">Type</div>
--- | --- | ---
PR265-TC-01 | Verify `loadConfig` defaults `transport` to `stdio` when `--transport` is absent | Unit
PR265-TC-02 | Verify `loadConfig` parses `--transport=http` and `--transport http` forms | Unit
PR265-TC-03 | Verify `loadConfig` rejects an unrecognized `--transport` value with `WorkspaceConfigError` (or equivalent) | Unit
PR265-TC-04 | Verify `--port`/`--host` CLI values take precedence over env vars, with documented defaults when neither is set | Unit
PR265-TC-05 | Verify `GET /health` returns 200 with a `status: healthy` body | Integration
PR265-TC-06 | Verify `GET /ready` returns 200 (or 503 with detail) reflecting workspace/config resolution | Integration
PR265-TC-07 | Verify every HTTP response carries an `x-request-id` header, generated when absent and propagated when supplied by the caller | Integration
PR265-TC-08 | Verify an unknown HTTP route returns a JSON body shaped `{ error, message, requestId, timestamp }` | Integration
PR265-TC-09 | Verify `SIGTERM` closes the HTTP listener and exits the process without an in-flight request being dropped mid-response | Integration
PR265-TC-10 | Verify `node dist/index.js` (no flag) and `node dist/index.js --transport=stdio` both start on stdio, unchanged from current behavior | Integration
PR265-TC-11 | Verify `npm run build` compiles the new transport/config/middleware modules with zero TypeScript errors | Manual

*Detailed steps, expected results, and source links will be added after implementation.*

## Running Tests

*Commands will be added after implementation.*
