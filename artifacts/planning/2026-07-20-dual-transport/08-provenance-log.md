# Provenance Log

> Dual Transport Support · #skipped · updated 2026-07-20

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| 1 | cursor-agent | claude-sonnet-5 | code-generation | repo-only | Extended `config.ts` with `--transport`/`--port`/`--host` CLI/env parsing (`parseTransportFlag`, `resolvePort`, `resolveHost`), mirroring the existing `parseWorkspaceFlag` convention; extended `tests/config.test.ts` with 12 new cases. |
| 2 | cursor-agent | claude-sonnet-5 | code-generation | repo-only | Extracted stdio startup into `src/transports/stdio.ts` (`startStdioServer`); reduced `src/index.ts` to a CLI router dispatching on `config.transport`. |
| 3 | cursor-agent | claude-sonnet-5 | code-generation | repo-only | Added `src/transports/http.ts` (`createHttpApp`/`startHttpServer`) mounting `StreamableHTTPServerTransport` at `/mcp` with per-session transport map, plus `/health` and `/ready`; added `src/middleware/{request-id,logging,error-handler}.ts` reusing `logInfo`/`logError`; added `tests/http-transport.test.ts` (11 cases incl. a live initialize→tools/list round-trip). |
| 4 | cursor-agent | claude-sonnet-5 | code-generation | repo-only | Added `shutdownHandler`/`installGracefulShutdown` in `src/transports/http.ts` for SIGTERM/SIGINT draining with a bounded force-exit timeout; covered by shutdown cases in `tests/http-transport.test.ts`. |
| 5 | cursor-agent | claude-sonnet-5 | code-generation | repo-only | Added `express`/`@types/express` (+ `supertest`/`@types/supertest` dev-only, for Task 3's route tests) to `package.json`; added `dev:http`/`start:http` npm scripts. |

## Attestation

**Timestamp:** 2026-07-20T13:31:00Z  
**Certifier:** Mike Clay <mike.clay@shielded.io>  
**Certification:** certify — the certifier has the right to submit this contribution under the project's license, did not include code with unclear or incompatible provenance, and accepts responsibility for defects and licensing issues in this patch.
