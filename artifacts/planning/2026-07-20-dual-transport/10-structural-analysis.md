# Structural Analysis

> Dual Transport Support · issue skipped · updated 2026-07-20

Structural review of the branch diff (`problem_complexity: simple`, inline pass rather than dispatched).

## Layering

```
index.ts (CLI router)
  ├─ config.ts            (pure: argv/env → ServerConfig)
  ├─ transports/stdio.ts  ─┐
  └─ transports/http.ts   ─┴─ both call server.ts's createServer(config)
        └─ middleware/{request-id,logging,error-handler}.ts
```

- **No new circular dependencies.** `transports/*` depend on `server.ts` and `config.ts`; `middleware/*` depend only on `logging.ts` and Express types. Nothing in `server.ts` or `config.ts` depends back on `transports/*` or `middleware/*`.
- **Single responsibility per module** holds: each middleware file does exactly one thing (correlation id, request log line, error shape); `stdio.ts`/`http.ts` each own exactly one transport's lifecycle; `config.ts` owns only argv/env resolution.
- **Symmetric transport modules.** `startStdioServer` and `startHttpServer` have the same shape (build `createServer(config)`, wire it to a transport, log ready) — `index.ts`'s router doesn't need transport-specific knowledge beyond the `switch`.

## Coupling

- Both transports depend directly on `createServer` — intentional and required (Task 2's premise is that tool/resource registration is transport-agnostic and unchanged). This is the one shared dependency the whole feature exists to reuse, not incidental coupling.
- `http.ts` is the only module that imports Express types/SDK HTTP classes; no Express type leaks into `config.ts`, `server.ts`, or the stdio path. A future third transport would not need to know Express exists.
- `ServerConfig` (in `config.ts`) is the sole data contract crossing the `index.ts` → transport boundary — no additional ad hoc parameter passing.

## Findings

None. The change set adds one new layer (`transports/`) and one new cross-cutting concern (`middleware/`), both cleanly separated from existing modules, following the existing `config.ts` conventions rather than introducing a parallel pattern (e.g., no Zod-based config parsing alongside the manual flag parsers — see [02-assumptions-log.md](02-assumptions-log.md) CC-1/CC-2). No structural risk identified; `needs_code_fixes` not set from this step.
