# Workflow Server — Comprehension Artifact

> **Last updated**: 2026-04-01  
> **Work packages**: [Behavioral Prism Analysis (PR #83)](../planning/2026-03-28-behavioral-prism-analysis/README.md), [Agent-ID Meta-Skill Loading (PR #93)](../planning/2026-03-31-agent-id-meta-skill-loading/README.md), [Optimize Skill Delivery (PR #97)](../planning/2026-04-01-optimize-skill-delivery/README.md)  
> **Coverage**: Cross-cutting behavioral analysis of loader, validation, error handling, and session layers — focused on the information-destruction pattern at abstraction boundaries. PR #93: agent-id based meta-skill loading, cross-workflow resource resolution, and nested skill resources. PR #97: skill delivery mechanism deep-dive — step-scoped resolution, management skill consolidation, and get_skill API evolution.  
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

## Architecture Update: PR #93 — Agent-ID Meta-Skill Loading

### Three-Branch Skill Loading Model

PR #93 restructured the `get_skills` tool handler in `resource-tools.ts` from a two-branch model (workflow scope vs activity scope) to a three-branch model:

```
get_skills(session_token, workflow_id, agent_id?)
  ├── Branch 1: !activityId           → scope: "workflow"
  │   Returns: universal + workflow-specific + workflow-declared skills
  │   When: Before any activity entered (orchestrator bootstrap)
  │
  ├── Branch 2: isNewAgent            → scope: "activity+meta"
  │   Returns: universal meta skills + activity skills
  │   When: agent_id provided AND differs from token.aid
  │   Side-effect: Updates token.aid to the new agent_id
  │
  └── Branch 3: else                  → scope: "activity"
      Returns: activity skills only (primary + supporting)
      When: No agent_id, or agent_id matches token.aid
```

The `isNewAgent` detection uses: `agent_id !== undefined && agent_id !== token.aid`.

### Resource Loading Pipeline (Post-PR #93)

```
Skill TOON file declares:    resources: ["05", "meta/05", "26"]
                                          │        │        │
                              parseResourceRef()   │        │
                                          │        │        │
                              bare index ──┘  cross-wf ──┘  bare ──┘
                                    │              │           │
                              readResourceStructured(workflowDir, "work-package", "05")
                                                   │
                              readResourceStructured(workflowDir, "meta", "05")
                                                               │
                              readResourceStructured(workflowDir, "work-package", "26")
                                          │        │           │
                              bundleSkillWithResources(skillValue, resolvedResources)
                                          │
                              { ...skill_without_resources, _resources: [...] }
```

Key changes from pre-PR #93:
1. **Cross-workflow prefix parsing**: `parseResourceRef("meta/05")` → `{ workflowId: "meta", index: "05" }`. Bare indices fall through unchanged.
2. **Per-skill resource nesting**: Resources are bundled under each skill's `_resources` field, not in a flat root-level array. The raw `resources` array is stripped from the skill.
3. **Resource index preserved**: The `index` field on bundled resources stores the original reference string (e.g., `"meta/05"`), not the normalized numeric index.

### New Abstractions Introduced

| Abstraction | Location | Role |
|-------------|----------|------|
| `parseResourceRef()` | `resource-tools.ts:20` | Splits `"workflow/index"` into parts; bare indices pass through |
| `bundleSkillWithResources()` | `resource-tools.ts:51` | Strips `resources` from skill, attaches `_resources` with resolved content |
| `isNewAgent` | `resource-tools.ts:126` | Boolean: `agent_id !== undefined && agent_id !== token.aid` |
| `SessionAdvance.aid` | `session.ts:22` | Optional agent-id field in token advancement |

### Design Rationale

#### DR-4: Agent-ID Over Alternative Detection Strategies
- **Observation**: The server uses an explicit `agent_id` parameter rather than automatic caller detection or always-include strategies
- **Rationale**: MCP tools have no inherent caller identity. The token's existing `aid` field provides server-side state for comparison. Always-including meta skills wastes context window on returning agents.
- **Trade-offs**: Requires agents to declare identity (minor API surface increase); provides precise control over meta skill inclusion

#### DR-5: Per-Skill Resource Nesting Over Flat Array
- **Observation**: Pre-PR, resources were aggregated into a flat root-level array with de-duplication. Post-PR, each skill carries its own `_resources`.
- **Rationale**: Flat arrays required consumers to correlate resource indices with skill declarations. Nesting makes each skill self-contained — consumers read one object.
- **Trade-offs**: Resources referenced by multiple skills may appear in multiple `_resources` arrays (duplication); eliminates index-based cross-referencing complexity

#### DR-6: Slash Separator for Cross-Workflow References
- **Observation**: Issue #92 described `meta:NN` colon notation, but implementation uses `meta/NN` slash notation
- **Rationale**: Slash is the natural separator for path-like hierarchical references. Colons conflict with Jira-style issue keys (`PROJ-123`). TOON files already use `meta/05`.
- **Trade-offs**: First-slash splitting means workflow IDs cannot contain slashes (not a practical concern)

## Open Questions (PR #93)

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 5 | Does `loadSkillResources` propagate the correct `workflowId` when loading cross-workflow resources? | Resolved | Yes — `parseResourceRef("meta/05")` extracts `workflowId: "meta"`, which is passed as `targetWorkflow` to `readResourceStructured`. | Deep-Dive 2 |
| 6 | What happens when a cross-workflow resource reference targets a nonexistent index? | Resolved | Silent drop — `readResourceRaw` returns `err(ResourceNotFoundError)` with no logging on the "not found" path. `loadSkillResources` skips the resource. Consistent with DR-1 (best-effort aggregation). | Deep-Dive 2 |
| 7 | Does `activity+meta` scope include workflow-specific (non-meta, non-activity) skills? | Resolved | No — the `isNewAgent` branch calls `listUniversalSkillIds` (meta/skills only) + activity's declared skills. `listWorkflowSkillIds` is only called in the workflow scope branch. | Deep-Dive 2 |
| 8 | How does the test suite verify `token.aid` update? | Resolved | Behavioral assertions only — second `get_skills` call with same `agent_id` returns `scope: 'activity'` (no meta skills), proving `aid` was updated. No direct token decoding in tests. | Deep-Dive 2 |
| 9 | Are cross-workflow resources subject to the same TOON-over-markdown preference? | Resolved | Yes — `readResourceRaw` applies identical two-pass logic (TOON first, markdown fallback) regardless of `workflowId`. Cross-workflow and local resources use the same pipeline. | Deep-Dive 2 |

## Deep-Dive Sections (continued)

### Deep-Dive 2: PR #93 Skill Loading and Resource Resolution — 2026-04-01

Targeted investigation of the agent-id meta-skill loading and cross-workflow resource resolution implementation.

#### Cross-Workflow Resource Resolution (Q5, Q6, Q9)

The `parseResourceRef` function (resource-tools.ts:20-26) is minimal: it splits on the first `/` to extract `workflowId` and `index`. Bare indices (no slash) fall through with `workflowId: undefined`, which the caller resolves via nullish coalescing (`parsed.workflowId ?? workflowId`).

The resource resolution chain: `parseResourceRef → readResourceStructured → readResourceRaw → readdir + parseResourceFilename`. The `workflowId` in the cross-workflow case correctly routes to `{workflowDir}/{workflowId}/resources/` — e.g., `workflows/meta/resources/` for `meta/05`.

**Silent failure behavior**: When a cross-workflow reference targets a nonexistent index (e.g., `meta/99`), `readResourceRaw` scans all files in the resources directory, finds no match, and returns `err(ResourceNotFoundError)`. Critically, this "not found" path has no logging — the `logWarn` in the catch block (line 165) only triggers on readdir/readFile errors, not on "no match found." The error propagates back to `loadSkillResources`, which simply skips the resource (line 39: `if (result.success)`). This continues the best-effort aggregation pattern (DR-1) identified in Deep-Dive 1.

**Format preference**: Cross-workflow resources use the identical `readResourceRaw` pipeline as local resources — the two-pass logic (TOON preferred over markdown) is workflow-agnostic.

#### Agent-ID Meta-Skill Scope (Q7)

The three-branch model in `get_skills` has intentionally different skill set compositions:

| Branch | Condition | Skills Included | Not Included |
|--------|-----------|-----------------|--------------|
| Workflow | `!activityId` | `listUniversalSkillIds` + `listWorkflowSkillIds` + `workflow.skills` | — |
| Activity+Meta | `isNewAgent` | `listUniversalSkillIds` + `activity.skills.{primary,supporting}` | Workflow-specific skills not declared by the activity |
| Activity | else | `activity.skills.{primary,supporting}` | Universal and workflow-specific skills |

The `activity+meta` branch does NOT include workflow-level skills (`listWorkflowSkillIds`). This is intentional — workers need foundational protocols (meta skills) plus their activity-specific capabilities, but not the full set of workflow skills that the orchestrator received at bootstrap.

#### Test Coverage Strategy (Q8)

The test suite uses 4 test cases for agent-id meta-skill loading:
1. **New agent**: First call with `agent_id` → expects `scope: 'activity+meta'`, `agent-conduct` present
2. **Same agent**: Second call with same `agent_id` → expects `scope: 'activity'`, `session-protocol` absent
3. **Different agent**: Call with different `agent_id` → expects meta skills re-included
4. **Omitted agent_id**: Call without `agent_id` → expects backward-compatible behavior (activity skills only)

All assertions are behavioral (checking returned scope and skill presence/absence), not structural (no token decoding). This tests the contract but not the mechanism — a regression that returned the right skills for the wrong reason would pass.

Cross-workflow resource resolution has 2 test cases:
1. **Cross-workflow**: `orchestrate-workflow` skill → expects `worker-prompt-template` with `index: 'meta/05'`
2. **Bare index**: `elicit-requirements` skill → expects resource with `index: '05'`

#### Nested Resources Architecture

The `bundleSkillWithResources` function (resource-tools.ts:51-58) performs three operations:
1. Destructures the skill value to strip the `resources` array
2. If resolved resources exist, attaches them as `_resources`
3. If no resources resolved, returns the skill without either field

The `_resources` array preserves the original reference string as `index` (e.g., `"meta/05"`), not the normalized numeric index. This means consumers can identify cross-workflow resources by checking for a slash in the index.

Pre-PR, resources were de-duplicated into a flat root-level array with `seenIndices` tracking. Post-PR, no de-duplication occurs — if two skills reference the same resource, each gets its own copy in `_resources`. The old `duplicate_resource_indices` field in the response is removed.

## Skill Delivery Architecture — PR #97 Scope

### Current Skill Delivery Model

The server provides two skill-loading tools:

```
Agent bootstrap:
  get_skills(session_token, workflow_id)
    → Reads workflow.skills[] (e.g., ["session-protocol", "agent-conduct", "execute-activity", "state-management", "orchestrate-workflow"])
    → Loads ALL 5 skills via readSkill()
    → Resolves and bundles resources for each skill
    → Returns { scope: "workflow", skills: { skill1: {...}, skill2: {...}, ... } }
    → Total payload: ~210 lines of TOON skill content + resources

Per-step skill loading:
  get_skill(session_token, workflow_id, skill_id)
    → Loads ONE skill by explicit skill_id
    → Resolves and bundles resources
    → Returns { skill: { ...skill_without_resources, _resources: [...] } }
    → Agent must know the skill_id from reading the activity definition
```

### Skill Scoping Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ Workflow Level                                                  │
│  workflow.toon: skills: [session-protocol, agent-conduct,       │
│                  execute-activity, state-management,             │
│                  orchestrate-workflow]                           │
│  → Loaded via get_skills at session bootstrap                   │
│  → All 5 delivered in a single bulk payload                     │
├─────────────────────────────────────────────────────────────────┤
│ Activity Level (DEPRECATED in work-package)                     │
│  activity.toon: skills: { primary: "...", supporting: [...] }   │
│  → Schema supports it (SkillsReferenceSchema)                   │
│  → NO work-package activities use this — all migrated to step   │
├─────────────────────────────────────────────────────────────────┤
│ Step Level (CURRENT for work-package)                            │
│  activity.toon: steps[]: { skill: "classify-problem" }          │
│  → Each step declares exactly 0 or 1 skill                      │
│  → Agent calls get_skill(skill_id) per step                     │
│  → All 14 work-package activities use step-level declarations    │
└─────────────────────────────────────────────────────────────────┘
```

### Step-to-Skill Resolution Pipeline

When an agent encounters a step with `skill: "classify-problem"`:

```
Activity definition (from next_activity)
  → steps[n].skill = "classify-problem"       ← Agent reads this
  → Agent calls get_skill(skill_id: "classify-problem")
    → readSkill("classify-problem", workflowDir, "work-package")
      → findSkillFile(workflows/work-package/skills/, "classify-problem")
        → readdir → find 04-classify-problem.toon → match
      → tryLoadSkill → readFile → decodeToon → safeValidateSkill
    → loadSkillResources → for each resource ref → readResourceStructured
    → bundleSkillWithResources → { ...skill, _resources: [...] }
    → validateSkillAssociation(workflow, activity_id, "classify-problem")
      → Checks: activity.skills.primary, activity.skills.supporting,
                 activity.steps[].skill, activity.loops[].steps[].skill
      → Advisory warning if skill not declared
```

### Management Skill Landscape

Five workflow-level skills are loaded in bulk via `get_skills`:

| Skill | Location | Lines | Role | Used By |
|-------|----------|-------|------|---------|
| session-protocol | meta/skills/00 | 35 | Token handling, step manifests, resource usage | Both roles |
| agent-conduct | meta/skills/01 | 27 | Behavioral boundaries, communication tone, attribution rules | Both roles |
| execute-activity | meta/skills/02 | 105 | Goal→Activity→Skill metamodel, step execution, checkpoint yield, tracing | Worker only |
| state-management | meta/skills/03 | 18 | State initialization, update, persistence | Orchestrator only |
| orchestrate-workflow | work-package/skills/24 | ~100 | Activity dispatch, checkpoint presentation, transition evaluation | Orchestrator only |

The execution model (from `workflow.toon`) defines two roles:
- **Orchestrator**: Runs at top-level, dispatches activities, presents checkpoints. Uses: orchestrate-workflow + session-protocol + state-management + agent-conduct.
- **Worker**: Runs as sub-agent, executes activity steps, produces artifacts. Uses: execute-activity + session-protocol + agent-conduct.

### Activity Loader's Next-Action Inference

`readActivityFromWorkflow` (activity-loader.ts:130-144) infers a `next_action` field:

```typescript
const primarySkill = activity.skills?.primary
  ?? activity.steps?.find(s => s.skill)?.skill;
```

This means: if no activity-level primary skill exists, use the first step's skill as the "next action" hint. This heuristic supports the transition from activity-level to step-level skill declarations.

### Validation Infrastructure for Step-Level Skills

`validateSkillAssociation` (validation.ts:41-73) already collects step-level skills:

```typescript
if (activity.steps) {
  for (const step of activity.steps) {
    if (step.skill) declared.add(step.skill);
  }
}
if (activity.loops) {
  for (const loop of activity.loops) {
    if (loop.steps) {
      for (const step of loop.steps) {
        if (step.skill) declared.add(step.skill);
      }
    }
  }
}
```

This means the server already knows all skills declared at the step level for a given activity. The validation is advisory (returns warning strings, not rejections).

### Test Infrastructure

Test files relevant to skill delivery:

| File | Coverage |
|------|----------|
| `tests/skill-loader.test.ts` | Skill loading, resolution chain, cross-workflow search |
| `tests/mcp-server.test.ts` | End-to-end tool handler tests including `get_skill`, `get_skills` |
| `tests/validation.test.ts` | Skill association validation, step manifest validation |

### JSON Schema Definitions

The `schemas/` directory contains JSON Schema equivalents of the Zod schemas:

| Schema File | Governs |
|-------------|---------|
| `schemas/activity.schema.json` | Activity TOON structure including step.skill field |
| `schemas/skill.schema.json` | Skill TOON structure |
| `schemas/workflow.schema.json` | Workflow TOON including workflow.skills[] |

These must be updated if the `get_skill` tool API changes or if step-level skill resolution is added.

## Open Questions (PR #97)

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 10 | Can `get_skill` resolve a skill from `step_id` + `activity_id` (from session token) without requiring the agent to pass `skill_id` explicitly? | Resolved | Yes — the server has `token.act`, can load the activity via `loadWorkflow`+`getActivity`, find the step by ID, and extract `step.skill`. All infrastructure exists; only the lookup glue is missing. | Deep-Dive 3 |
| 11 | What happens to steps that declare no skill — should `get_skill` with a `step_id` that has no skill return an empty response or an error? | Resolved | Return a structured "no skill for this step" response. Consistent with advisory-not-blocking philosophy (DR-2). Some steps (determine-next-activity, check-issue, detect-project-type) are decision logic with no skill. | Deep-Dive 3 |
| 12 | Can management skills be consolidated without exceeding a practical size limit that would negate just-in-time benefits? | Resolved | Yes — per-role consolidation produces ~180 lines (orchestrator) and ~167 lines (worker), comparable to larger step skills (classify-problem ~90, review-code ~150). Resources are the main size contributor and could be trimmed. | Deep-Dive 3 |
| 13 | Does the `get_skills` bulk-load API need to change or be deprecated, or can it coexist with step-scoped `get_skill`? | Resolved | Coexist during migration. `get_skills` continues to serve orchestrator bootstrap (which becomes a single consolidated skill). Deprecation after all consumers migrate to step-scoped loading. | Deep-Dive 3 |
| 14 | How should the session token encode step-level context — should `step_id` be tracked alongside `activity_id`? | Resolved | Defer `token.step`. The `step_id` parameter in `get_skill` calls provides sufficient context without token bloat. The existing `token.skill` field already tracks the last loaded skill. | Deep-Dive 3 |

**Remaining follow-up items (out of scope):**
- Resource validation gap (BF-16 from PR #83) — resources still lack Zod validation
- Full BF-03 fix for triple session decode

### Deep-Dive 3: Skill Delivery Pipeline Analysis — 2026-04-01

Targeted investigation of the 5 open questions about step-scoped skill delivery feasibility.

#### Step-ID to Skill Resolution (Q10)

The `get_skill` handler (resource-tools.ts:152-183) currently requires `skill_id` as a parameter. To support `step_id`-based resolution, the handler would need to:

1. Accept optional `step_id` parameter alongside (or instead of) `skill_id`
2. When `step_id` is provided: extract `token.act` from the session → load the activity definition → find the step by `step_id` → extract `step.skill`
3. If the step has no `skill` field, return an appropriate response (see Q11)

The infrastructure for loading activity definitions is already available in the tool handler module via `loadWorkflow` and `getActivity` (both imported in `workflow-tools.ts`). The `resource-tools.ts` module already imports `loadWorkflow` (line 6) for `get_skills`. Adding `getActivity` is straightforward.

**Feasibility**: High. The server already has all the data needed — it just needs to add the lookup step before calling `readSkill`.

**Token dependency**: The session token's `act` field (set by `next_activity`) tells the server which activity definition to search. No additional token fields are strictly necessary — the activity definition contains all step-to-skill mappings.

#### Skill-less Steps (Q11)

Of the 14 work-package activities, examining several reveals that most steps declare a skill but some do not:

- `determine-next-activity` (start-work-package) — no skill
- `determine-path` (design-philosophy) — no skill
- `check-issue`, `check-branch`, `check-pr` (start-work-package) — no skill
- `detect-project-type` (start-work-package) — no skill

These steps are either decision logic (no external skill needed) or git/CLI operations covered by the step description itself.

**Options**:
1. Return a structured "no skill for this step" response — agent proceeds with step description only
2. Return an error — forces workflow authors to ensure every step has a skill
3. Make `step_id` parameter require that the step has a skill — validation at call time

Option 1 is most consistent with the server's existing advisory-not-blocking philosophy (DR-2).

#### Management Skill Size Analysis (Q12)

Per-role consolidation sizes (estimated with resources):

| Consolidated Skill | Components | Raw Lines | With Resources |
|-------------------|------------|-----------|----------------|
| Orchestrator Management | orchestrate-workflow + session-protocol + state-management + agent-conduct | ~180 | ~300 (resource 29 is large) |
| Worker Management | execute-activity + session-protocol + agent-conduct | ~167 | ~250 (resource 06 is large) |

For comparison, individual step skills range from 50-200 lines of TOON (e.g., classify-problem is ~90 lines, review-code is ~150 lines).

Consolidated management skills would be comparable in size to larger step skills. The key benefit is reducing bootstrap from 5 `get_skill` calls to 1, plus eliminating the need for agents to parse multiple skill payloads to understand their operational capabilities.

**Risk**: Resources attached to management skills (resource 29 for orchestrate-workflow, resource 06 for execute-activity) are the largest contributors. These are implementation guides that could potentially be trimmed or delivered on-demand.

#### get_skills Coexistence (Q13)

The `get_skills` tool currently serves two use cases:
1. **Orchestrator bootstrap**: Load all workflow-level management skills at session start
2. **Activity+meta scope** (PR #93): Load universal meta skills + activity skills for a new worker agent

With step-scoped `get_skill`, use case #1 could be replaced by a single `get_skill` call for the consolidated orchestrator management skill. Use case #2 could be replaced by step-scoped calls as the worker progresses.

**Recommendation**: `get_skills` can coexist during migration. Deprecation can happen once all consumers have migrated to step-scoped loading.

#### Session Token Step Tracking (Q14)

The session token currently tracks: `wf` (workflow), `act` (activity), `skill` (last skill loaded), `cond` (condition), `v` (version), `seq` (sequence), `ts` (timestamp), `sid` (session ID), `aid` (agent ID).

Adding `step` would:
- Enable server-side validation of step-skill consistency (the server could verify that the agent is loading skills in step order)
- Enable trace events to include step context
- Increase token size by ~20 bytes

The current `skill` field already tracks the last loaded skill. Adding `step` would provide more granular context but is not strictly necessary for step-scoped resolution — the `step_id` parameter in the `get_skill` call provides the context directly.

**Recommendation**: Defer `token.step` — the `step_id` parameter approach is sufficient and avoids token bloat.

### Lens Analysis — 2026-04-01 (PR #97)

#### Pedagogy Lens

Three inherited patterns shape the skill delivery mechanism:

1. **Bulk-loading as bootstrap strategy**: `get_skills` delivers all workflow-level skills at once because the original design assumed agents need full context upfront. As workflows grew more complex (work-package has 14 activities, each with multiple steps), this pattern created the exact problem it was meant to prevent — agents drowning in context rather than lacking it.

2. **Advisory validation enables protocol confusion**: The server validates skill association (via `validateSkillAssociation`) but never rejects mismatched requests. An agent can call `get_skill` for any skill at any time, regardless of the current step. This flexibility was appropriate when skill loading was agent-directed, but it also means the server cannot help agents stay on track.

3. **Next-action heuristic masks absent step resolution**: The activity loader infers `next_action` from the first step's skill field (activity-loader.ts:132-133). This is a bridge pattern — it provides a starting point when no step-scoped resolution exists. With step-scoped `get_skill`, this heuristic becomes unnecessary.

#### Rejected-Paths Lens

| Alternative Considered | Rejected In Favor Of | Trade-off |
|------------------------|---------------------|-----------|
| Smart filtering (deliver all skills, mark relevant one) | Step-scoped delivery | Filtering still requires agents to receive and parse all content; step-scoped eliminates the overhead entirely |
| Lazy management loading (agents request individually as needed) | Bulk-load at bootstrap | Lazy loading risks agents forgetting to load a needed skill; consolidated-per-role preserves reliability while reducing to 1 call |
| Implicit step tracking (server auto-delivers next skill) | Explicit `step_id` parameter | Implicit tracking requires server-side step state, complicates session management, and removes agent control over execution order |
| Single monolithic management skill (all roles) | Per-role consolidation | Monolithic includes ~50% irrelevant content per role; per-role keeps payloads focused while still achieving 1-call bootstrap |

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
