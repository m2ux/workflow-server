# Layer 3 — agent smoke-run

Layers 1–2 (in `tests/e2e/`) drive the workflow with **no LLM**: they prove the
machinery is wired and references resolve. Layer 3 closes the remaining gap —
**can a real agent interpret and execute the migrated workflow?** — which is
where interpretation bugs surface.

## Architecture (true split, deterministic orchestrator)

Both roles talk to the **technique-branch** server and share one session on disk:

```
            ┌─────────────────────────┐
 reads/     │  session.json (sandbox  │   reads/
 writes ───▶│  workspace, HMAC-sealed)│◀─── writes
            └─────────────────────────┘
   ▲                                        ▲
   │ in-memory server                       │ technique dist server (stdio)
┌──┴───────────────┐                   ┌────┴──────────────────────────┐
│ ORCHESTRATOR     │   dispatch        │ WORKER                        │
│ (walker, det.)   │ ────────────────▶ │ headless `claude -p`          │
│ - next_activity  │   per activity    │ - get_activity                │
│ - present/respond│ ◀──────────────── │ - execute steps in sandbox    │
│   checkpoint     │   yield report    │ - yield_checkpoint, then stop │
└──────────────────┘                   └───────────────────────────────┘
```

Why this works without shared memory:
- The server is **stateless between calls** — every tool call loads/saves
  `session.json` from the workspace. So two server instances pointed at the same
  workspace cooperate through disk.
- The seal/HMAC key is **machine-global** (`~/.workflow-server/secret`), so both
  instances verify the same sealed session.
- This mirrors the production orchestrator/worker model exactly; "deterministic"
  only means the orchestrator's transition + checkpoint choices come from a
  Policy (see `tests/e2e/policies.ts`) instead of agent judgment.

## Components

- `worker-brief.md` — instructions handed to each worker dispatch (execute one
  activity, yield at checkpoints, sandbox discipline: no real Jira/PR/push).
- `worker-mcp.template.json` — worker MCP config; `__TECHNIQUE_DIST__` and
  `__SANDBOX_WORKSPACE__` are substituted at runtime.
- `smoke-orchestrator.ts` — the driver (TODO: built/validated against the first
  scoped run). Sets up the sandbox, runs the walker as orchestrator, and spawns
  `/home/mike1/.local/bin/claude -p` workers per activity.

## Prerequisites

- `npm run build` in the worktree (the worker's server is `dist/index.js`).
- `claude` binary at `/home/mike1/.local/bin/claude`.

## Scope & cost

Real agent runs cost tokens. Validate with a **scoped run** (1–2 activities)
before a full 13-activity walk. The full run is the expensive path; gate it
behind an explicit trigger.

## Connection to Layer 2

Layer 2 found that worker bundles omit their core conduct rules (the
`agent-conduct::*` group refs don't resolve post-migration). The smoke-run
worker therefore receives those degraded bundles — so this run also measures the
**agent-facing impact** of that finding: does the worker misbehave without its
conduct disciplines? Capture that in the worker's `notes`.

## Layer 3b (separate)

A variant where BOTH orchestrator and worker are agents (no deterministic
policy) lives separately — same plumbing, orchestrator decisions made by a
second agent. Not built yet.
