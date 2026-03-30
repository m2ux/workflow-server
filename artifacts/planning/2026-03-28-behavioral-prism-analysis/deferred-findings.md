# Deferred Findings & Required Changes

---

## REQUIRED CHANGE: CR-01 — Structural Validation in decodeToon

**Status:** Required for PR #83 (user decision from assumption interview A-RS-03)

### Background

The PR's current approach adds Zod validation at individual call sites (`safeValidateSkill` in skill-loader, `RulesSchema.safeParse` in rules-loader). The REPORT's CR-01 recommends changing `decodeToon<T>()` itself to require a schema parameter.

### User Decision

The call-site approach is insufficient. The BF-16 resource gap (readResource was missed) is direct evidence that voluntary call-site validation allows callers to be skipped. `decodeToon<T>()` must require a schema parameter to enforce validation structurally.

### Required Change

```typescript
// Current (unsafe):
function decodeToon<T>(content: string): T {
  return decode(content) as T;
}

// Required (safe):
function decodeToon<T>(content: string, schema: ZodType<T>): T {
  const decoded = decode(content);
  return schema.parse(decoded);
}
```

### Impact

- ~10 call sites across 5 loader files must provide a schema parameter
- Eliminates the `as T` cast entirely
- Forces resource-loader (BF-16 gap) to provide a `ResourceSchema`
- Requires creating `ResourceSchema` (does not currently exist)
- Callers that already validate (workflow-loader, activity-loader) can remove their redundant post-decode validation

### Implementation Notes

- Callers needing `.passthrough()` (skill-loader) should pass `SkillSchema.passthrough()` as the schema
- The `safeValidateSkill` and `RulesSchema.safeParse` additions in PR #83 become redundant — validation moves into `decodeToon`
- Consider offering both `decodeToon<T>(content, schema)` (throws) and `safeDecodeToon<T>(content, schema)` (returns Result) variants

---

# Deferred Findings — BF-03 and BF-07

**Work Package:** Behavioral Prism Analysis (Review of PR #83)  
**Created:** 2026-03-29  
**Status:** Deferred to separate PR (stakeholder review pending)

---

## BF-03 — Triple Session Token Decode

### Finding

Every tool call with a `session_token` parameter decodes the same HMAC-signed token three times independently:

1. `withAuditLog` at `src/logging.ts:67` — decodes for trace capture
2. Tool handler (e.g., `workflow-tools.ts:71`) — decodes for business logic
3. `advanceToken` at `src/utils/session.ts:91` — decodes for token advancement

Each decode performs HMAC verification (SHA-256), JSON parsing, and Zod schema validation.

### Performance Impact

- ~0.2–0.6ms + 6 Buffer allocations per request in redundant cryptographic and parsing work
- Over a 10-call session: ~2–6ms wasted, 60 unnecessary Buffer allocations

### PR #83 Partial Fix

`advanceToken` now accepts an optional `decoded?: SessionPayload` third parameter, enabling callers to skip one of the three decode operations. However, no caller currently passes a pre-decoded payload — the parameter exists but is unused.

### Full Fix Requirements

The full fix requires two handler-pattern changes:

**1. Modify `withAuditLog` wrapper (src/logging.ts:83–105)**

Current signature:
```typescript
function withAuditLog<T, R>(toolName: string, handler: (params: T) => Promise<R>, traceOpts?: TraceOptions): (params: T) => Promise<R>
```

The wrapper decodes the session token for trace capture at line 67 but cannot pass the decoded payload to the handler because:
- The handler's type `(params: T) => Promise<R>` has no slot for the decoded payload
- The wrapper's return type erases the decoded payload

Required change: Modify the handler signature to accept an optional decoded payload, or restructure the wrapper to inject the decoded payload into the params object.

Impact: Every tool handler registration call (15+ sites across workflow-tools.ts, resource-tools.ts, state-tools.ts) would need to accept the modified signature.

**2. Thread decoded payload through handler to advanceToken**

Once the handler receives the decoded payload from `withAuditLog`, it must pass it to `advanceToken(token, updates, decoded)`. This requires modifying every handler that calls `advanceToken` (approximately 12 call sites).

### Architectural Reasoning for Deferral

- The change touches the core handler registration pattern used by every tool
- It requires coordinated changes across 3 files (logging.ts, all tool modules)
- The PR's targeted fix approach (one finding per code area) is incompatible with this cross-cutting change
- Risk of merge conflicts with concurrent PRs is high since all tool registrations are affected
- The partial fix (advanceToken accepting decoded) lays groundwork for the full fix in a follow-up PR

---

## BF-07 — Workflow Cache

### Finding

Every tool call re-reads, re-parses, and re-validates the full workflow from disk. `loadWorkflow()` is called by 6 tool handlers. For a workflow with 10 activities, a single call costs ~35–55ms and ~300–500KB in allocations, all discarded immediately.

### Performance Impact

- ~35–55ms per tool call for workflow load (warm filesystem cache)
- ~150–250ms wasted per 5-call session in redundant I/O, TOON parsing, and Zod validation
- 22 `existsSync` calls block the event loop for ~1.1–2.2ms per request path
- File reads are sequential (`for...of` + `await`), not parallelized

### Fix Requirements

**1. In-memory cache with mtime invalidation**

```typescript
interface CacheEntry {
  workflow: Workflow;
  mtimeMs: number;
  loadedAt: number;
}
const cache = new Map<string, CacheEntry>();
```

On each `loadWorkflow()` call, check if the cached mtime matches the current file mtime. If so, return cached workflow. This reduces repeated loads from ~35–55ms to <0.1ms.

Complexity: Cache invalidation must handle:
- File modifications during development
- Git worktree switches (entire directory content changes)
- Multiple workflow files per workflow (workflow.toon + N activity files)
- Directory-based vs. single-file workflows

**2. Parallel I/O for activity loading**

Replace sequential `for...of` + `await` in `loadActivitiesFromDir` with `Promise.all` for parallel file reads. Estimated improvement: ~18–30ms for a 10-activity workflow.

**3. Replace `existsSync` with async alternatives**

Convert 22 `existsSync` calls to `readFile` + `ENOENT` catch or `stat` + async. This unblocks the event loop.

### Architectural Reasoning for Deferral

- Introduces a new subsystem (cache) with state management and invalidation logic
- Cache invalidation in a git worktree environment is non-trivial (switching branches changes all file content but not necessarily mtimes)
- The parallel I/O change touches the core loading pipeline
- The `existsSync` → async conversion is a 22-site change across multiple files
- Combined, these changes represent a significant refactor of the loader layer — larger scope than the targeted fixes in PR #83
- Each of the three sub-fixes (cache, parallel I/O, async stat) could be its own PR for reviewability

---

## Recommendation

Both findings are valid performance improvements. Suggested follow-up approach:

1. **BF-03 follow-up PR:** Thread decoded session payload through `withAuditLog` → handler → `advanceToken`. Eliminates 2 of 3 HMAC verifications per request. Estimated scope: 3 files, ~30 lines changed, but touching all tool registrations.

2. **BF-07 follow-up PR(s):** Split into phases:
   - Phase 1: Add workflow cache with mtime invalidation (~50–80 LOC new)
   - Phase 2: Parallelize activity loading with `Promise.all` (~10 LOC changed)
   - Phase 3: Convert `existsSync` to async (~22 call sites)
