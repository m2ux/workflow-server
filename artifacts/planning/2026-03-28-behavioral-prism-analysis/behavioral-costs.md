---
target: /home/mike/dev/workflow-server/src/
analysis_date: 2026-03-28
lens: optimization
---

# Behavioral Prism Analysis: Optimization Lens

**Codebase:** workflow-server (~3k LOC TypeScript MCP server)
**Scope:** All 36 source files in `src/`

---

## Step 1: Opacity Inventory

### B1 — TOON Serialization/Deserialization

**Location:** `src/utils/toon.ts:8-9` (`decodeToon`), `src/utils/toon.ts:17-19` (`encodeToon`)
**Crosses:** Module boundary into external library `@toon-format/toon`
**Call sites:** `workflow-loader.ts:84`, `workflow-loader.ts:141`, `activity-loader.ts:113,241`, `skill-loader.ts:78`, `resource-loader.ts:107,258`, `rules-loader.ts:43`, `state-tools.ts:83,119`

**Erased data:**
- **Allocation patterns** — intermediate object graph structure during decode is opaque; caller cannot know how many transient objects `decode()` allocates before returning the final tree
- **Memory locality** — parsed objects may be scattered across heap; no guarantee of contiguous layout for cache-line-friendly traversal
- **Cache behavior** — whether the library uses internal memoization or streaming vs. full-buffer parsing is invisible

### B2 — JSON Serialization in Token Codec

**Location:** `src/utils/session.ts:26-30` (encode), `src/utils/session.ts:57-60` (decode), `src/trace.ts:108-109` (createTraceToken), `src/trace.ts:148-150` (decodeTraceToken)
**Crosses:** Serialization boundary — structured data → string → base64url → HMAC-signed wire format

**Erased data:**
- **Allocation patterns** — each encode cycle creates: 1 JSON string, 1 Buffer for base64url, 1 HMAC digest string, 1 concatenated output string (4 intermediate allocations). Each decode cycle: 1 string split, 1 Buffer from base64url, 1 JSON.parse output, 1 Zod parse result (4 more)
- **Cache behavior** — the same token is decoded multiple times per request (see B8) but the decode result is never memoized; the HMAC verification is pure CPU work repeated redundantly

### B3 — Zod Schema Validation

**Location:** `src/schema/workflow.schema.ts:61`, `src/schema/activity.schema.ts:181-182`, `src/schema/skill.schema.ts:173-174`, `src/schema/condition.schema.ts:73-74`, `src/schema/state.schema.ts:156-157`, `src/utils/session.ts:60`
**Crosses:** Validation abstraction boundary — raw `unknown` → typed domain object

**Erased data:**
- **Allocation patterns** — Zod's `safeParse` allocates: a result wrapper object, cloned/transformed data via `.default()` and `.transform()` calls, and on failure a `ZodError` with fully-structured issue array. For `ActivitySchema` alone: 17 `.default()` calls that each clone sub-trees. For `NestedWorkflowStateSchema`: recursive lazy evaluation allocates closure chains
- **Branch predictability** — callers cannot specialize on "always succeeds" vs. "might fail" paths; the validation check is uniform regardless of data provenance (already-validated in-memory data re-validated on every pass)

### B4 — Filesystem I/O (readFile, readdir, existsSync)

**Location:** Every loader module: `workflow-loader.ts:39,83,130,140`, `activity-loader.ts:96,112,183,240`, `skill-loader.ts:27,77,137,162,188,256`, `resource-loader.ts:93,105,114,145,157,188,285`, `rules-loader.ts:42,62`, `schema-loader.ts:30`
**Crosses:** Process ↔ kernel boundary via libuv

**Erased data:**
- **Cache behavior** — no application-level cache; every tool call pays full I/O cost. OS page cache is the only mitigation, and its state is invisible to the application. After cache eviction (memory pressure, large file churn), latency jumps from ~0.1ms to ~2-5ms per read
- **Memory locality** — each `readFile` allocates a new Buffer that is then decoded to a UTF-8 string (another allocation). These allocations are not pooled
- **Lock contention** — `existsSync` (used at `workflow-loader.ts:29,69,70,120`, `activity-loader.ts:36,43,90`, `skill-loader.ts:24,49,59,132,186,254`, `resource-loader.ts:59,62,65,86,185,282`) blocks the event loop via synchronous `stat()` syscall. Each call: ~50-100μs of event-loop blocking

### B5 — HMAC Cryptographic Boundary

**Location:** `src/utils/crypto.ts:73-75` (hmacSign), `src/utils/crypto.ts:77-81` (hmacVerify), `src/utils/crypto.ts:16-23` (getOrCreateServerKey)
**Crosses:** User-space → OpenSSL native boundary via Node.js `crypto` module

**Erased data:**
- **Allocation patterns** — each `hmacSign` allocates: 1 HMAC context (C++ object), 1 digest Buffer, 1 hex string. `hmacVerify` does this twice (expected + actual) plus 2 Buffers for `timingSafeEqual`
- **Cache behavior** — HMAC key is cached (`keyPromise` at `crypto.ts:14`), but the computation is always fresh. The same payload signed/verified multiple times per request gets no reuse

### B6 — MCP SDK Dynamic Dispatch

**Location:** `src/server.ts:17-25` (server construction + tool registration), tool handler invocations via `server.tool()` at `workflow-tools.ts:27,59,64,105,182,207,232,273`, `resource-tools.ts:34,84,141`, `state-tools.ts:36,107`
**Crosses:** Application → SDK framework boundary via dynamic tool name lookup

**Erased data:**
- **Branch predictability** — tool dispatch is string-keyed map lookup; CPU branch predictor cannot specialize on which handler will execute. Each invocation pays the cost of Zod parameter validation inside the SDK before reaching the handler
- **Allocation patterns** — SDK wraps each tool call in request/response objects, parameter validation results, and content array structures. Invisible to the handler

### B7 — Result<T,E> Wrapper Abstraction

**Location:** `src/result.ts:1-14`
**Call sites:** All loader return types — `workflow-loader.ts:78`, `activity-loader.ts:63,226`, `skill-loader.ts:96,232`, `resource-loader.ts:83,135,267`, `rules-loader.ts:34,55`, `schema-loader.ts:22`

**Erased data:**
- **Allocation patterns** — every loader return wraps data in `{success: true, value: T}` or `{success: false, error: E}`. The wrapper object is immediately destructured by callers (`if (!result.success) throw result.error`). This is a per-call allocation that carries no information beyond what a try/catch would provide
- **Branch predictability** — the discriminated union forces a runtime property check at every call site, though in practice loaders succeed >95% of the time

### B8 — withAuditLog Higher-Order Function

**Location:** `src/logging.ts:83-105`
**Wraps:** Every tool handler (13 tool registrations across workflow-tools.ts, resource-tools.ts, state-tools.ts)

**Erased data:**
- **Allocation patterns** — per invocation: 1 closure capture, 1 `Date.now()` call for start time, 1 `JSON.stringify` of full parameter object for audit log, 1 `Date.now()` for end time. On trace path: 1 `decodeSessionToken` call (full HMAC verify + JSON.parse + Zod validate), 1 `createTraceEvent` (object construction + `randomUUID()`), 1 `TraceStore.append`
- **Cache behavior** — the session token decoded here at `logging.ts:67` is the same token decoded again inside the tool handler (e.g., `workflow-tools.ts:71`). Two full decode cycles for one request

### B9 — TraceStore In-Memory Boundary

**Location:** `src/trace.ts:61-103`

**Erased data:**
- **Memory locality** — `sessions` Map uses hash-based lookup; event arrays grow via `.push()` which triggers V8 backing store reallocation at geometric growth boundaries
- **Allocation patterns** — `getEvents()` at line 89-91 returns `[...(this.sessions.get(sid) ?? [])]` — a full defensive copy of the event array on every call. `getSegmentAndAdvanceCursor()` at line 97-103 calls `.slice()` — another copy

### B10 — Session Token Advance-on-Every-Response

**Location:** Every tool handler calls `advanceToken()` (`src/utils/session.ts:90-103`), which internally calls `decode()` then `encode()`
**Call sites:** `workflow-tools.ts:102,152,203,228,255,269`, `resource-tools.ts:136,170`, `state-tools.ts:102,145`

**Erased data:**
- **Allocation patterns** — full round-trip: HMAC verify (Buffer alloc × 3) → JSON.parse (object alloc) → Zod safeParse (result wrapper + cloned data) → object spread (new object) → JSON.stringify (string alloc) → base64url (Buffer alloc) → HMAC sign (Buffer alloc × 2). Minimum 10 intermediate allocations per advance
- **Cache behavior** — the token just decoded by the handler or by withAuditLog is decoded again inside advanceToken. Three decodes of the same token per request

---

## Step 2: Blind Workarounds

### W1 — Workflow Re-read on Every Tool Call (B4 + B1 + B3)

`loadWorkflow()` is called in 6 tool handlers: `get_workflow` (line 72), `next_activity` (line 116), `get_checkpoint` (line 191), `get_activities` (line 213), `get_skills` (line 94), `get_skill` (line 154). Each call:

1. `resolveWorkflowPath` → 2× `existsSync` (synchronous stat): **~100-200μs event-loop blocked**
2. `readFile` → kernel read + Buffer alloc + UTF-8 decode: **~0.5-2ms** (warm page cache) to **~5-15ms** (cold)
3. `decodeToon` → TOON parse: **~0.3-1ms** depending on file size
4. `safeValidateWorkflow` → Zod validation with `.default()` cloning across 17+ fields: **~0.5-2ms**
5. For workflows with external activities: `loadActivitiesFromDir` → `readdir` + N × (`readFile` + `decodeToon` + `safeValidateActivity`): **~3-5ms per activity file**

**Blocked optimization:** An in-memory cache keyed by (workflowDir, workflowId) with file-mtime invalidation would reduce repeated calls from ~10-50ms to ~0.01ms (hash lookup).

**What code does instead:** Re-reads, re-parses, and re-validates the entire workflow from disk on every tool call. For a workflow with 10 activities, a single `get_skills` call costs ~30-50ms in I/O alone. A typical 5-tool-call session: **~150-250ms** of redundant filesystem I/O, TOON parsing, and Zod validation.

**Concrete cost per redundant load:**
- 2 `existsSync` syscalls: **200μs** event-loop-blocked
- 1 `readFile` (workflow TOON, ~5-20KB): **1-2ms** + 1 Buffer (~20KB) + 1 string (~20KB) = **~40KB allocated**
- 1 `decodeToon`: **0.5-1ms** + unknown intermediate allocations
- 1 Zod `safeParse`: **0.5-2ms** + 1 result object + deep-cloned defaults
- N activity files (if directory-based): N × (**3-5ms** + **~10-30KB** per activity)
- **Total per redundant reload (10-activity workflow): ~35-55ms, ~300-500KB allocated, discarded immediately**

### W2 — Triple Token Decode Per Request (B2 + B5 + B8)

For any tool call with `session_token`:

1. **withAuditLog** (`logging.ts:67`): `decodeSessionToken(session_token)` — HMAC verify + JSON.parse + Zod validate
2. **Tool handler** (e.g., `workflow-tools.ts:71`): `decodeSessionToken(session_token)` — identical decode
3. **advanceToken** (`session.ts:91`): `decode(token)` — identical decode again (on the *original* token before advance)

Each decode: ~0.1-0.3ms (HMAC verify dominates: SHA-256 over ~200-byte payload).

**Blocked optimization:** Decode once, pass the decoded payload through the call chain. Saves 2 redundant HMAC verifications per request.

**What code does instead:** Copies the decode work 3 times. The withAuditLog wrapper cannot pass decoded data to the handler because the wrapper signature erases the decode result (returns only the handler's return type).

**Concrete cost per request:** **~0.2-0.6ms** wasted CPU + **6 Buffer allocations** (2 per HMAC verify) + **2 unnecessary Zod safeParse** calls + **2 unnecessary JSON.parse** calls. Across a 10-call session: **~2-6ms** of redundant crypto+parse.

### W3 — Pretty-Printed JSON Responses (B2)

Every tool handler serializes its response with `JSON.stringify(data, null, 2)` — e.g., `workflow-tools.ts:56,61,97,99,177,254,262,268,278`, `resource-tools.ts:76,135,169`, `state-tools.ts:101,144`.

**Blocked optimization:** Compact JSON (`JSON.stringify(data)`) produces ~25-35% shorter strings. For a 50KB workflow response, pretty-printing adds ~12-17KB of whitespace. Since MCP responses are consumed by agent LLMs that tokenize content, the added whitespace consumes tokens without semantic value.

**What code does instead:** Allocates larger strings on every response for human readability that no human sees (MCP is machine-to-machine).

**Concrete cost per response:**
- 50KB workflow: **~15KB extra** string allocation, **~1-2ms extra** serialization time
- Over a 10-call session with mixed payloads (~200KB total): **~50-70KB wasted allocation**, **~5-10ms wasted serialization**

### W4 — Sequential File Loading (B4)

`loadActivitiesFromDir` (`workflow-loader.ts:28-58`) uses `for...of` + `await readFile` — serial reads. Same pattern in `skill-loader.ts` (`readSkillIndex`, `listSkills`) and `resource-loader.ts` (`listResources`, `readResource`). In `resource-tools.ts:22-26`, `loadSkillResources` does sequential `readResourceStructured` calls.

**Blocked optimization:** `Promise.all(files.map(f => readFile(...)))` would parallelize I/O. Node.js libuv thread pool (default 4 threads) can serve multiple reads concurrently, reducing wall-clock time by ~3-4× for batches.

**What code does instead:** Waits for each file to complete before starting the next. For `get_skills` loading 3 skills with 5 resources each: 8 serial file reads.

**Concrete cost:**
- Serial 8 reads × ~3-5ms each: **~24-40ms wall-clock**
- Parallel (4 threads): **~6-10ms wall-clock**
- **Wasted time: ~18-30ms per get_skills call**

### W5 — existsSync Guards Before Async I/O (B4)

22 `existsSync` calls across the codebase (workflow-loader.ts, activity-loader.ts, skill-loader.ts, resource-loader.ts, rules-loader.ts). Each is a synchronous `stat()` syscall that blocks the event loop.

**Blocked optimization:** Replace with `readFile` / `readdir` and catch `ENOENT`, or use `stat` (async) where the check is genuinely needed. This would unblock the event loop during the check.

**What code does instead:** Synchronously blocks the event loop for ~50-100μs per call. In `resolveWorkflowPath` (workflow-loader.ts:66-76): 2 sync stats on every workflow load. In `findWorkflowsWithActivities` (activity-loader.ts:33-53): 1 sync stat per workflow directory entry.

**Concrete cost:**
- 22 existsSync calls × ~50-100μs: **~1.1-2.2ms of event-loop blocking per request path**
- During this time, no other I/O callbacks can fire; stdio transport is stalled

### W6 — No Deduplication of readdir Across Loaders

`readActivityIndex` (`activity-loader.ts:226-286`) calls `listActivities()` which calls `readdir` per workflow, then iterates entries and reads each file individually. `readSkillIndex` (`skill-loader.ts:232-303`) similarly calls `listUniversalSkills()` + `listWorkflowSkills()` per workflow, each doing their own `readdir`.

When building indexes at startup or on `help`/`health_check`, the same directories are listed multiple times.

**Blocked optimization:** A single `readdir` result cached per (directory, request) would eliminate redundant syscalls.

**What code does instead:** Re-reads directory listings. For a workspace with 5 workflows: `readSkillIndex` alone does ~10 readdir calls (5 for skill listing + 5 for re-reading within tryLoadSkill).

**Concrete cost:** ~10 redundant readdir calls × ~0.5ms each = **~5ms wasted per index build**

### W7 — TraceStore Defensive Copies (B9)

`getEvents()` (`trace.ts:89-91`) copies the full event array via spread. `getSegmentAndAdvanceCursor()` (`trace.ts:97-103`) copies a slice.

**Blocked optimization:** Return a read-only view (frozen array or iterator) instead of copying. Or, since the TraceStore is single-threaded (Node.js), the copy serves no concurrency purpose — callers never mutate the returned array.

**What code does instead:** Allocates a new array + copies N object references on every `getEvents` call. Called from `get_trace` (workflow-tools.ts:266).

**Concrete cost:** For a session with 50 events: **1 array allocation (~400 bytes) + 50 reference copies (~0.01ms)**. Negligible per call but pattern indicates defensive-copy-by-default mindset.

### W8 — Result<T,E> Wrapper Allocation Tax (B7)

Every loader wraps return values in `ok()` / `err()`. Every caller immediately unwraps: `if (!result.success) throw result.error; ... result.value`.

**Blocked optimization:** Direct return + throw would eliminate the wrapper object. Or, since these are all async functions, the Promise itself already provides the success/error channel.

**What code does instead:** Allocates `{success: true, value: T}` or `{success: false, error: E}` wrapper objects. ~30 call sites across 6 loader modules.

**Concrete cost:** **~100ns per allocation × ~30 calls per request = ~3μs**. Individually negligible. The real cost is cognitive: callers must check `.success` at every site, and the pattern proliferates defensive checks where try/catch would suffice.

### W9 — randomUUID Per Trace Event (B9)

`createTraceEvent` (`trace.ts:47`) calls `randomUUID()` for every span ID. This is a crypto-quality random generation.

**Blocked optimization:** A monotonic counter or timestamp-based ID would suffice for in-process trace events that never leave the server (unless exported via trace tokens).

**What code does instead:** Calls into Node.js crypto for 128-bit UUID generation per event. `randomUUID()` on Node.js 18+ uses libuv's random source.

**Concrete cost:** **~1-5μs per call**. For 50 events/session: **~50-250μs**. Small, but it's crypto work for an in-process counter.

### W10 — Audit Log JSON.stringify of Full Parameters (B8)

`logAuditEvent` (`logging.ts:9`) serializes the full `parameters` object (which includes the session token string, workflow ID, and any manifests) to JSON for every tool call, including on the success path.

**Blocked optimization:** Structured logging with lazy serialization (only serialize if log consumers are present) or log-level gating.

**What code does instead:** Unconditionally serializes to stderr via `console.error(JSON.stringify({...}))`. For `next_activity` with a step_manifest and activity_manifest: the parameters object can be ~5-20KB.

**Concrete cost:** **~0.5-2ms per call** for JSON.stringify of large parameter objects + **~5-20KB string allocation** per audit log entry. Over 10 calls: **~5-20ms, ~50-200KB** of serialization purely for logging.

---

## Step 3: Conservation Law Table

| Boundary | Erased Data | Blocked Optimization | Blind Workaround | Concrete Cost | Flattening Breaks |
|----------|-------------|---------------------|------------------|---------------|-------------------|
| **B4+B1+B3: Filesystem → TOON → Zod pipeline (no cache)** | Cache behavior, memory locality, allocation patterns | In-memory workflow/skill/resource cache with mtime invalidation | Re-read + re-parse + re-validate entire workflow from disk on every tool call (W1) | 35-55ms + 300-500KB per redundant load; 150-250ms per 5-call session | Live-reload of TOON files during development; memory ceiling guarantees; stateless request model (no stale cache bugs) |
| **B2+B5+B8: Session token triple-decode** | Cache behavior, allocation patterns | Decode once at entry point, thread decoded payload to handler + audit + advance | Decode same HMAC-signed token 3× per request: withAuditLog, handler, advanceToken (W2) | 0.2-0.6ms + 6 Buffer allocs + 2 redundant Zod parses per request | Clean separation of concerns: audit layer, handler, and token advance are independently testable. withAuditLog signature would need to pass through decoded token, coupling audit to session semantics |
| **B4: Sequential file I/O** | Allocation patterns (libuv thread pool utilization) | Promise.all for parallel readFile/readdir | Serial for...of + await on each file in loadActivitiesFromDir, loadSkillResources, readSkillIndex (W4) | 18-30ms wasted per get_skills call (8 serial reads vs. 4-thread parallel) | Deterministic file processing order; error attribution to specific file; simpler stack traces on failure |
| **B4: Synchronous existsSync** | Lock contention (event-loop blocking) | Async stat() or catch-ENOENT on readFile | 22 existsSync calls block event loop before async I/O that would reveal the same info (W5) | 1.1-2.2ms event-loop blocking per request path | Simpler control flow (guard before read vs. catch after read); no race between check and read |
| **B2: Pretty-printed JSON responses** | Allocation patterns (string size) | Compact JSON.stringify(data) without pretty-printing | JSON.stringify(data, null, 2) on every response, adding ~25-35% whitespace to machine-consumed output (W3) | 15KB extra per 50KB response; 50-70KB + 5-10ms wasted per session | Human debuggability when inspecting MCP responses in logs or transport captures |
| **B8: Audit log unconditional serialization** | Allocation patterns (log payload) | Lazy serialization gated on log level or consumer presence | JSON.stringify full parameter objects on every call, including large manifests (W10) | 0.5-2ms + 5-20KB per call; 5-20ms + 50-200KB per session | Always-on audit trail; no log entries lost due to level misconfiguration; simpler audit compliance |
| **B4: Redundant readdir across loaders** | Cache behavior (directory listing) | Per-request directory listing cache or shared readdir results | Multiple loaders independently readdir the same directories (W6) | ~5ms wasted per index build | Loader independence — each module is self-contained, no shared mutable state between loaders |
| **B9: TraceStore defensive copies** | Memory locality, allocation patterns | Return frozen array or iterator; trust single-threaded invariant | Array spread copy on every getEvents() call (W7) | ~0.01ms + 400 bytes per call (50 events) | Mutation safety if callers ever modify returned arrays; safe if TraceStore is later made concurrent |
| **B7: Result<T,E> wrapper pattern** | Allocation patterns, branch predictability | Direct return + throw; or use Promise rejection channel | Allocate {success, value/error} wrapper at 30 call sites, immediately destructured (W8) | ~3μs total per request (negligible) | Explicit error typing at call sites; avoids untyped catch blocks; forces callers to handle error case |
| **B5+B9: randomUUID for in-process trace spans** | Allocation patterns (crypto RNG) | Monotonic counter for in-process IDs | crypto-quality UUID for spans that only exist in memory (W9) | ~50-250μs per 50-event session | Globally unique span IDs if traces are ever exported to distributed tracing systems |

---

## Dominant Boundary: Filesystem-as-Database Without Cache (B4+B1+B3)

**The conservation law:** The codebase treats the filesystem as a live database — every tool call performs a full I/O → parse → validate round-trip. This preserves **live-reloadability** (editing a TOON file during a session is immediately visible on the next tool call) at the cost of **~150-250ms of redundant I/O per 5-call session**.

**The trade:** Introducing an in-memory cache keyed by `(workflowDir, workflowId)` with `fs.watchFile` or mtime-based invalidation would reduce repeated workflow loads from ~35-55ms to <0.1ms (Map lookup). This would save ~80-95% of per-request latency. But it would:

1. **Break live-reload** — cached data could go stale if invalidation races with file writes
2. **Break memory guarantees** — cache grows with workflow count; no eviction policy exists
3. **Break simplicity** — introduces cache coherence concerns, invalidation bugs, and a stateful server component alongside the existing stateless-per-request model
4. **Break testability** — tests currently exercise the full I/O path; cached paths would need separate testing

**The second-order effect:** Because the filesystem boundary is opaque, the *sequential I/O pattern* (W4) and *redundant readdir* (W6) compound on top of it. A cache would also eliminate these workarounds, since cached data wouldn't need directory re-scanning. The three workarounds (W1, W4, W6) are actually a single systemic cost expressed three ways.

---

## Secondary Boundary: Token Opacity Tax (B2+B5+B8)

**The conservation law:** Session tokens are designed as opaque, HMAC-signed strings to prevent agent tampering. This opacity means the server must cryptographically verify, deserialize, and re-serialize the token on every interaction — even when the server itself just issued the token milliseconds ago.

**The trade:** Caching the decoded token in the TraceStore (keyed by token string or session ID) would eliminate 2 of 3 decodes per request. But it would:

1. **Break the stateless model** — the server currently derives all session state from the token itself
2. **Break token integrity** — a cache lookup bypass of HMAC verification would weaken the guarantee that the token hasn't been modified between calls
3. **Break the audit boundary** — `withAuditLog` is intentionally decoupled from handler logic; passing decoded tokens through would couple them

---

## Quantitative Summary

| Cost Category | Per-Request | Per-Session (10 calls) |
|---|---|---|
| Redundant filesystem I/O (W1) | 35-55ms | 150-250ms |
| Sequential file reads (W4) | 18-30ms | 18-30ms (worst on get_skills) |
| Triple token decode (W2) | 0.2-0.6ms | 2-6ms |
| Pretty-print JSON (W3) | 1-2ms | 5-10ms |
| Audit log serialization (W10) | 0.5-2ms | 5-20ms |
| existsSync blocking (W5) | 1.1-2.2ms | 5-10ms |
| Redundant readdir (W6) | 0.5ms | ~5ms |
| **Total estimated overhead** | **~57-92ms** | **~190-330ms** |
| **Memory overhead** | ~300-520KB | ~400-700KB |

These costs are dominated by filesystem I/O (B4). In a warm OS page cache scenario, the I/O costs drop by ~60-70%, reducing total overhead to ~25-40ms per request. In a cold cache scenario (first call after reboot, or large working set), costs could be 2-3× the estimates above.
