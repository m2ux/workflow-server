# Workflow Server — Comprehension Artifact

> **Last updated**: 2026-03-29  
> **Work packages**: [Behavioral Prism Analysis (PR #83)](../planning/2026-03-28-behavioral-prism-analysis/README.md)  
> **Coverage**: Cross-cutting behavioral analysis of loader, validation, error handling, and session layers — focused on the information-destruction pattern at abstraction boundaries  
> **Related artifacts**: [orchestration.md](orchestration.md), [utils-layer.md](utils-layer.md), [state-tools.md](state-tools.md), [zod-schemas.md](zod-schemas.md)

## Architecture Overview

### Project Structure

TypeScript MCP server (`@m2ux/workflow-server` v0.1.0, ~3k LOC, 36 source files). See [orchestration.md](orchestration.md) for the full project structure and module map.

### Layer Summary (PR #83 Scope)

```
┌─────────────────────────────────────┐
│  Tool Handlers (3 modules)          │  BF-15: JSON.stringify pretty-print
│  workflow-tools, resource-tools,    │  BF-03: triple session decode
│  state-tools                        │  BF-14: restore_state error wrapping
├─────────────────────────────────────┤
│  Loaders (5 modules)                │  BF-02: 13 bare catch blocks
│  workflow, activity, skill,         │  BF-01/16: skill validation (not resource)
│  resource, rules                    │  BF-06: rules schema validation
│                                     │  BF-08: activity validation return path
├─────────────────────────────────────┤
│  Schema/Validation (3 modules)      │  BF-04/09: validation missing-data handling
│  condition.schema, skill.schema,    │  BF-12: transition scope
│  validation                         │  BF-13: condition coercion
├─────────────────────────────────────┤
│  Utils/Core (4 modules)             │  BF-10: crypto key length
│  crypto, session, trace, logging    │  BF-05: TraceStore auto-init
│                                     │  BF-11: path security root
└─────────────────────────────────────┘
```

### Data Flow: Tool Call Lifecycle

```
Agent → MCP SDK → tool handler
  → withAuditLog(handler)
    → decodeSessionToken(token)       ← HMAC verify + Zod validate
    → handler(params)
      → loader.readXxx(workflowDir)   ← readFile + decodeToon + Zod safeParse
      → validation.validateXxx(...)   ← consistency checks → warnings
      → JSON.stringify(response)      ← BF-15: was pretty-printed
    → advanceToken(token, updates)    ← HMAC sign new token
    → appendTraceEvent(store, ...)    ← decode token AGAIN for trace
  ← { content: [...], _meta: { session_token, validation } }
```

### Design Patterns

1. **Result Monad**: Loaders return `Result<T, E>` — tools unwrap and throw for MCP error responses. Separates error handling from error presentation.

2. **Best-Effort Aggregation**: List operations (listWorkflows, listSkills, listResources) catch all errors and return partial results. This is the central architectural tension identified by the prism analysis.

3. **TOON → Type Pipeline**: File content goes through `readFile → decodeToon<T> → ZodSchema.safeParse → Result<T>`. The `decodeToon<T>` step uses `as T` cast with no runtime validation — callers must add their own Zod validation afterward.

4. **Session Token Threading**: Every tool call receives a session_token, decodes it, uses the payload for validation/context, advances the token, and returns the new token in `_meta`. The token carries workflow state (wf, act, skill, cond, version, seq, timestamp, session ID).

5. **Validation-as-Metadata**: `validateActivityTransition`, `validateSkillAssociation`, and other checks return `ValidationResult` objects passed through `_meta.validation`. Callers never branch on validation status — it's purely informational for the consuming agent.

## Key Abstractions

### Core Types

| Type | Location | Role |
|------|----------|------|
| `Result<T, E>` | `result.ts` | Sum type: `{ success: true, value: T } \| { success: false, error: E }` |
| `SessionPayload` | `utils/session.ts` | 9-field token payload (wf, act, skill, cond, v, seq, ts, sid, aid) |
| `ValidationResult` | `utils/validation.ts` | `{ status: 'valid'\|'warning', warnings: string[] }` |
| `TraceEvent` | `trace.ts` | Compressed-field event (traceId, spanId, name, ts, ms, s, wf, act, aid) |
| `TraceStore` | `trace.ts` | In-memory per-session event accumulator with cursor-based emission |
| `ServerConfig` | `config.ts` | workflowDir, schemasDir, serverName, serverVersion, schemaPreamble, traceStore |

### Error Types

| Error | Code | Used By |
|-------|------|---------|
| `WorkflowNotFoundError` | WORKFLOW_NOT_FOUND | workflow-loader |
| `ActivityNotFoundError` | ACTIVITY_NOT_FOUND | activity-loader |
| `SkillNotFoundError` | SKILL_NOT_FOUND | skill-loader |
| `ResourceNotFoundError` | RESOURCE_NOT_FOUND | resource-loader |
| `RulesNotFoundError` | RULES_NOT_FOUND | rules-loader (BF-06: now accepts message param) |
| `WorkflowValidationError` | WORKFLOW_VALIDATION_ERROR | workflow-loader |

### Error Handling Strategy

The codebase uses two distinct error patterns:

1. **Result-based**: Loaders return `Result<T, DomainError>`. Tools call `unwrap()` which throws the error for MCP-level handling.
2. **Catch-and-suppress**: List/aggregation operations use `try/catch` with fallback returns (`[]`, `null`). Pre-PR: bare `catch {}`. Post-PR (BF-02): `catch (error) { logWarn(...); return []; }`.

The tension between these patterns is the core behavioral finding: `Result` promises typed errors, but catch-and-suppress destroys error identity before it reaches the Result boundary.

## Design Rationale

### DR-1: Best-Effort Aggregation vs. Fail-Fast
- **Observation**: List operations suppress all errors to return partial results
- **Hypothesized rationale**: An MCP server that returns zero workflows because of a permission error on one subdirectory is worse for agent UX than one that returns the workflows it can access. The server prioritizes availability over correctness.
- **Trade-offs**: Optimizes for agent resilience; sacrifices debuggability, cacheability, and error visibility
- **PR #83 approach**: Adds diagnostic logging to catch blocks (BF-02) — preserves the aggregation pattern but makes failures visible in stderr

### DR-2: Validation-as-Metadata vs. Enforcement
- **Observation**: Validation results are passed through `_meta` without enforcement. No tool rejects a request based on validation warnings.
- **Hypothesized rationale**: The server is a read-only data provider, not an orchestrator. Enforcement is the consuming agent's responsibility. Warnings guide agent behavior without blocking operations.
- **Trade-offs**: Optimizes for agent flexibility; sacrifices safety guarantees
- **PR #83 approach**: BF-04/BF-09 make warnings more informative (warning strings instead of null) and enforce initialActivity on first transition. This is a partial shift toward enforcement.

### DR-3: TOON Decode Trust Boundary
- **Observation**: `decodeToon<T>()` uses `as T` cast. Some callers validate (workflow, activity); others don't (skill, resource, rules pre-fix).
- **Hypothesized rationale**: The TOON library was trusted to produce well-formed output matching the expected type. Zod validation was added incrementally to higher-risk paths (workflows, activities) but never backfilled to lower-risk paths.
- **Trade-offs**: Optimizes for development velocity; sacrifices uniform type safety
- **PR #83 approach**: BF-01/BF-06 add Zod validation to skills and rules. BF-16 claims to address resources but only skills were fixed.

## Data Flow and Operational Context

### Loader Pipeline (All Content Types)

```
readFile(path) → decodeToon<T>(content) → [optional: Schema.safeParse()] → Result<T>
                  ↑ as T cast                ↑ only for workflow, activity,
                  ↑ no validation             ↑ skill (post-PR), rules (post-PR)
                                              ↑ NOT for resources (BF-16 gap)
```

### Session Token Pipeline

```
Tool call received with session_token string
  ├── withAuditLog: decodeSessionToken(token)  ← decode #1 (for trace)
  ├── handler: decodeSessionToken(token)       ← decode #2 (for business logic)
  └── advanceToken(token, updates, decoded?)   ← decode #3 (for advancement)
                                                  ↑ BF-03 partial: can skip if decoded passed
```

### Invariant Alignment

| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| TOON decode produces valid typed data | No (as T cast) | Yes (unsafe callers) | BF-01 gap: resources still unvalidated |
| Loader list operations return complete results | No (catch suppresses) | Partially (agents treat empty as "none exist") | BF-02 mitigated: errors now logged |
| Validation null means "no constraint" | Pre-fix: no (null conflated 3 conditions) | Yes | BF-04/09 fix: distinguishes conditions |
| TraceStore append succeeds for known sessions | Pre-fix: no (silently dropped) | Yes | BF-05 fix: auto-initializes |
| Rules load success means validated data | Pre-fix: no (no schema) | Yes | BF-06 fix: Zod validation added |
| readActivityFromWorkflow ok means validated | Pre-fix: no (ok on failure) | Yes | BF-08 fix: err on failure |
| Key is correct length after race | Pre-fix: no (skipped check) | Yes | BF-10 fix: length validated |

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| Workflow | `Workflow` type, `.toon` file | Structured process definition with activities, variables, transitions |
| Activity | `Activity` type, activity `.toon` file | Single phase of a workflow with steps, checkpoints, skills |
| Skill | `Skill` type, skill `.toon` file | Reusable capability attached to activities |
| Resource | Resource `.toon`/`.md` file | Reference material (templates, guides) attached to skills |
| Rules | `Rules` type, `rules.toon` | Global behavioral guidelines for agents |
| Session Token | HMAC-signed base64url string | Carries workflow state across tool calls |
| Checkpoint | `Checkpoint` in activity schema | User-decision point during activity execution |
| Transition | `Transition` in activity schema | Directed edge between activities with optional conditions |
| TOON | `@toon-format/toon` library | Configuration file format for workflow definitions |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | What callers of `readActivityFromWorkflow` now receive errors instead of raw data? | Resolved | Tool handlers use `getActivity()` via workflow-loader (already validated), not `readActivityFromWorkflow`. BF-08 impact limited to activity-loader standalone paths (index building, direct `readActivity` calls). | Deep-Dive 1 |
| 2 | Does the new `RulesSchema` match the existing `meta/rules.toon` file? | Resolved | Yes — existing file has all 6 required fields. `RulesSectionSchema` uses `.passthrough()` so extra section fields are preserved. No session creation breakage. | Deep-Dive 1 |
| 3 | How do callers of `validateActivityTransition` handle the new warning strings? | Resolved | All callers use `buildValidation()` which treats non-null strings as warnings in `_meta.validation`. No tool rejects requests based on validation status. BF-09 initialActivity enforcement is informational only (warning, not rejection). | Deep-Dive 1 |
| 4 | Is the `readResource` BF-16 gap a regression risk or intentional? | Resolved | Oversight, not intentional deferral. No `ResourceSchema` exists. The PR description claims "Skills were the only content type with no validation checkpoint" which is incorrect — resources also lack validation. | Deep-Dive 1 |

**Remaining follow-up items (out of scope):**
- BF-03 full fix: What handler-pattern changes are needed to thread decoded payload through `withAuditLog`?
- BF-07: What data would the workflow cache need to invalidate? How do mtime checks interact with git worktrees?

## Deep-Dive Sections

### Deep-Dive 1: PR #83 Behavioral Impact Analysis — 2026-03-29

Targeted investigation of 4 open questions about the behavioral impact of PR #83 changes.

#### BF-08 Backward Compatibility (Q1)

`readActivityFromWorkflow` is a private function in `activity-loader.ts`. Its two callers are both within `readActivity()`:
- Line 67: Direct call when `workflowId` is specified — returns the Result directly
- Line 74: Loop iteration when searching all workflows — checks `result.success` and continues to next workflow on failure

**Critical finding**: Tool handlers do NOT call `readActivity()` for serving individual activity requests. Instead, they call `loadWorkflow()` → `getActivity()` from `workflow-loader.ts`, which works on the already-loaded-and-validated workflow object. `readActivityFromWorkflow` is only used in standalone activity-loader paths:
- `readActivity()` — called by `resource-tools.ts` `get_activities` and `get_activity` tools via activity-loader
- `readActivityIndex()` — builds the activity search index

**Impact assessment**: Activities that fail Zod validation are now excluded from the activity index and return errors from `readActivity()`. This is lower risk than initially assessed because the primary tool-serving path (`loadWorkflow → getActivity`) is unaffected. The risk is limited to activity discovery — activities with schema violations become invisible to index search.

#### RulesSchema Compatibility (Q2)

The existing `meta/rules.toon` file structure:
```
id: agent-rules             → RulesSchema.id ✅
version: 1.0.0              → RulesSchema.version ✅
title: AI Agent Guidelines   → RulesSchema.title ✅
description: ...             → RulesSchema.description ✅
precedence: ...              → RulesSchema.precedence ✅
sections[16]:                → RulesSchema.sections ✅ (array of RulesSectionSchema)
  - id, title, priority?, rules?  → RulesSectionSchema fields ✅
```

`RulesSchema` does NOT use `.passthrough()` at the top level. If future rules files add top-level fields, they will fail validation. However, `RulesSectionSchema` does use `.passthrough()`, so section-level extensions are safe. The existing file is compatible.

#### Validation Warning Propagation (Q3)

The validation chain:
```
validateActivityTransition() → returns string | null
  ↓
buildValidation(warning1, warning2, ...) → ValidationResult { status, warnings }
  ↓
_meta: { session_token, validation }
```

`buildValidation()` (line 177) collects all non-null strings into `warnings[]` and sets status to `'warning'`. No tool handler branches on `validation.status` — it is purely informational metadata for the consuming agent. The BF-09 initialActivity warning (`"First activity must be '${workflow.initialActivity}' but '${activityId}' was requested"`) appears as a warning, not a rejection. The agent receives the requested activity data alongside the warning.

This means BF-09's "enforcement" of initialActivity is advisory, not blocking. An agent can still skip to any activity on the first call — it just gets a warning in `_meta.validation`.

#### Resource Validation Gap (Q4)

No `ResourceSchema`, `safeValidateResource`, or any validation infrastructure exists for the Resource type. The `readResource` function at `resource-loader.ts:79` calls `decodeToon<Resource>(content)` and returns the raw cast result wrapped in `ok()`.

The PR description's claim "Skills were the only content type with no validation checkpoint" is factually incorrect:
- Pre-PR: Skills and resources both lacked validation
- Post-PR: Skills have validation via `safeValidateSkill`; resources still have none

This appears to be an oversight during implementation rather than an intentional deferral — there is no comment, commit message, or deferred-item notation explaining why resources were excluded. The deferred items (BF-03 full, BF-07) are explicitly called out in the PR body; BF-16 for resources is not.

### Lens Analysis — 2026-03-29

#### Pedagogy Lens

Three concepts are essential for understanding this codebase and the PR's changes:

1. **The information-destruction pattern**: Every abstraction boundary trades information fidelity for interface simplicity. This is the single organizing principle behind all 16 findings. Understanding this pattern is prerequisite to evaluating any individual fix.

2. **Best-effort aggregation**: The loaders are designed to return partial results rather than fail completely. This isn't a bug — it's a deliberate architectural choice for agent resilience. The PR's catch-block changes (BF-02) add visibility without changing this fundamental contract.

3. **Validation-as-metadata**: The server generates validation warnings but never rejects requests based on them. This is counter-intuitive but intentional — the server is a data provider, not an enforcer. Even the BF-09 initialActivity "enforcement" is a warning, not a gate.

#### Rejected-Paths Lens

The PR makes several implementation choices that differ from the REPORT's recommended corrections:

| REPORT Recommended | PR Implemented | Trade-off |
|-------------------|----------------|-----------|
| CR-01: Require schema parameter in `decodeToon<T>()` itself | Add validation at individual call sites (`safeValidateSkill`, `RulesSchema.safeParse`) | PR approach is less invasive (doesn't change shared function signature) but leaves the `as T` cast in place — future callers can still skip validation |
| CR-02 Option A: `Result<T[], Error>` return types | BF-02: `logWarn()` in catch blocks, preserve fallback returns | PR approach preserves API shape; callers don't need to change. But error information flows to stderr, not to callers |
| BF-16: Fix both readSkill and readResource | Only readSkill fixed | Likely oversight — resources have the same gap |

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
