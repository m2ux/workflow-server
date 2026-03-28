# Behavioral Prism Analysis Plan

**Date**: 2026-03-28
**Pipeline Mode**: behavioral (4+1: error-resilience, optimization, evolution, api-surface + synthesis)
**Target Type**: code
**Scope**: codebase

## Target

- **Path**: `/home/mike/dev/workflow-server/src`
- **Language**: TypeScript
- **Role**: MCP server for AI agent workflow orchestration
- **Size**: 36 files, ~3,494 LOC across 7 modules + root

## Module Survey

| Module | Files | LOC | Role |
|--------|-------|-----|------|
| `loaders/` | 8 | 1,289 | Workflow data loading — reads TOON files from the workflows worktree (skills, activities, workflows, rules, resources, schemas) and parses them into validated domain objects |
| `schema/` | 6 | 687 | Zod validation schemas for workflow domain types (skill, activity, workflow, state, condition, common) |
| `tools/` | 4 | 609 | MCP tool handlers — exposes workflow navigation, resource access, and state management operations to connected agents |
| `utils/` | 5 | 418 | Shared utilities — crypto (deterministic IDs), session management, TOON parsing, validation helpers |
| `trace.ts` | 1 | 152 | Request tracing and telemetry infrastructure |
| `logging.ts` | 1 | 105 | Structured logging with level control |
| `errors.ts` | 1 | 48 | Custom error hierarchy (typed application errors) |
| `config.ts` | 1 | 35 | Server configuration loading and defaults |
| `server.ts` | 1 | 28 | MCP server bootstrap and transport wiring |
| `index.ts` | 1 | 32 | Entry point — assembles and starts the server |
| `result.ts` | 1 | 14 | Result/error return type helpers |
| `resources/` | 2 | 32 | MCP resource handlers (schema resource exposure) |
| `types/` | 3 | 45 | TypeScript type definitions (state, workflow) |

## Rationale

This codebase recently completed a 12-work-package quality remediation effort that addressed 140 findings across security hardening, schema alignment, error handling, determinism, session protocol, utilities, tests, server core, scripts, and documentation. That audit was **structural** in nature — it focused on correctness, consistency, and conformance.

The behavioral analysis targets improvement dimensions the structural audit did not cover:

- **Error resilience**: How does the server behave under failure conditions? Are errors propagated consistently? Do loaders degrade gracefully on malformed input? Are there unhandled promise rejections or swallowed errors?
- **Optimization**: Are there unnecessary re-reads of the filesystem, redundant schema validations, or O(n²) patterns in the loader pipeline? Could caching or lazy initialization improve startup or request latency?
- **Evolution**: How tightly coupled are the modules? Would adding a new workflow entity type require changes across many files? Are there hidden dependencies or circular imports that would impede refactoring?
- **API surface**: Is the MCP tool/resource API consistent, well-bounded, and ergonomic for consuming agents? Are there missing capabilities or overly broad tool signatures?

## Analysis Units

```json
[
  {
    "target": "/home/mike/dev/workflow-server/src",
    "target_type": "code",
    "pipeline_mode": "behavioral",
    "lenses": [],
    "role": "mcp-server",
    "risk": "medium",
    "rationale": "Post-remediation behavioral analysis to surface error handling, optimization, evolution, and API surface improvements across a ~3k LOC TypeScript MCP server"
  }
]
```

Single analysis unit covering the full `src/` directory. The behavioral pipeline dispatches 4 independent lenses against this unit, so further subdivision would fragment cross-cutting concerns (e.g., error propagation paths that span loaders → tools → server).

## Pipeline Execution Plan

| Step | Agent | Lens | Input | Output |
|------|-------|------|-------|--------|
| 1 | lens-worker | error-resilience | `src/` | `error-resilience-findings.md` |
| 2 | lens-worker | optimization | `src/` | `optimization-findings.md` |
| 3 | lens-worker | evolution | `src/` | `evolution-findings.md` |
| 4 | lens-worker | api-surface | `src/` | `api-surface-findings.md` |
| 5 | synthesis | — | findings 1–4 | `behavioral-synthesis.md` |

Steps 1–4 execute in parallel. Step 5 runs after all lens workers complete.

## Cost Estimate

- **Sub-agent dispatches**: 5 (4 behavioral lenses + 1 synthesis)
- **Estimated tokens per lens**: ~15k input + ~3k output
- **Total estimated cost**: ~72k input + ~15k output tokens
