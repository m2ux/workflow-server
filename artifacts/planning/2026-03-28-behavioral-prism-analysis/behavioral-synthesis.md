---
target: /home/mike/dev/workflow-server/src/
analysis_date: 2026-03-28
lens: behavioral-synthesis
---

# Behavioral Prism Synthesis

Cross-dimensional analysis of four independent behavioral lenses applied to the workflow-server codebase (~3k LOC TypeScript MCP server). Each lens asked a different question of the same code; this synthesis finds what emerges only at their intersection.

**Source artifacts:**
- ERRORS (`behavioral-errors.md`): 24 error boundaries, 10 failure traces
- COSTS (`behavioral-costs.md`): 10 opacity boundaries, 10 blind workarounds
- CHANGES (`behavioral-changes.md`): 10 hidden contracts, 10 poison paths
- PROMISES (`behavioral-promises.md`): 14 naming lies, conservation law per fix

---

## Step 1: The Convergence Points

### C-1: The Type Erasure Nexus — `decodeToon<T>()` (all four lenses)

**Discovered independently by:**
- ERRORS (EB-17): Unsafe generic cast enables silent propagation of structurally invalid data; field access on missing properties returns `undefined` instead of throwing
- COSTS (B1, B3): TOON decode hides allocation patterns; downstream Zod re-validation compensates with 17+ `.default()` clones per activity, costing ~0.5–2ms per parse
- CHANGES (HC-5): Callers bifurcate into safe (workflow-loader, activity-loader apply Zod) and unsafe (rules-loader, skill-loader, resource-loader do not); three poison paths (P-5, P-6, P-9) flow from the unsafe side
- PROMISES (LIE-05): Generic `<T>` return type promises type-safe decoding; body is `return decode(content) as T` — a bare assertion

**What convergence reveals:** `decodeToon<T>()` at `src/utils/toon.ts:8-9` is the single point where the type system's contract with the runtime collapses. No individual lens captures the full consequence:

- The ERROR lens sees that type information is destroyed, but not *why* some callers compensate and others don't.
- The COST lens sees redundant re-validation overhead, but not that this overhead is a *workaround* for the cast's unsafety.
- The CHANGE lens sees the safe/unsafe caller split, but not the performance tax imposed on the safe side or the error traces created by the unsafe side.
- The PROMISE lens sees the type lie, but not that fixing it (requiring a schema parameter) would eliminate three entire poison paths and six error boundaries simultaneously.

**Unified finding:** The `as T` cast creates a four-dimensional defect: it destroys type errors (allowing `undefined` field access), forces redundant validation cost (callers that compensate pay ~2ms), splits the codebase into two trust populations (an invisible handshake about who validates), and lies about its return type. Every compensating mechanism (Zod validation in safe callers, validation bypass in `readActivityFromWorkflow`, bare catches in unsafe callers) is a downstream expression of this single cast.

---

### C-2: The Aggregation Dilemma — Loader catch-and-suppress patterns (all four lenses)

**Discovered independently by:**
- ERRORS (EB-09): 13 bare `catch {}` blocks across 6 loader files return empty arrays, destroying error type, message, stack, and filesystem code
- COSTS (W1): Re-reading files on every call is partly because failures are invisible — caching would require knowing whether a previous load succeeded or silently failed
- CHANGES (HC-5 callers, P-5, P-6, P-9): Unvalidated data flows through loaders that suppress parse errors, creating poison propagation paths
- PROMISES (LIE-01, LIE-04, LIE-06): `readSkill` returns unvalidated data as `Result<Skill>`; `readRules` masks parse errors as "not found"; `readActivity` returns raw data on validation failure as `ok(...)`

**What convergence reveals:** Error suppression and promise-breaking are the *same phenomenon* viewed from different angles. The loaders suppress errors (ERRORS), which prevents optimization (COSTS — you cannot cache a result you cannot distinguish from a silent failure), creates fragile implicit contracts (CHANGES — the caller must "just know" that empty arrays might mean permission denied), and violates return type contracts (PROMISES — `Result<Skill>` implies validated data).

**Unified finding:** Best-effort aggregation ("return what loaded, swallow what didn't") is structurally incompatible with strong guarantees in any of the four dimensions simultaneously. The ERRORS analysis identified this as the "aggregation contract" invariant. The synthesis confirms it is not merely an error-handling pattern but the codebase's central architectural tension: **partial success is inherently information-destroying, optimization-preventing, contract-creating, and promise-breaking**.

---

### C-3: The Opacity Tax — Session token pipeline (three lenses, partial fourth)

**Discovered independently by:**
- ERRORS (EB-04): Session token `decode()` wraps errors in `new Error()`, destroying `SyntaxError` position data, `ZodError.issues[]`, and original stack traces; double-wrapping on Zod failures
- COSTS (W2): Triple decode per request — `withAuditLog` (logging.ts:67), handler (e.g., workflow-tools.ts:71), `advanceToken` (session.ts:91) — wastes ~0.2–0.6ms + 6 Buffer allocations per call
- CHANGES (HC-4, HC-8): Session token encodes an implicit state machine with uncodified phase transitions; `session_token` parameter name is a stringly-typed contract between Zod schemas and trace extraction
- PROMISES (LIE-14, LIE-11): `decodeSessionToken` name implies parsing but performs HMAC verification + Zod validation; `withAuditLog` name implies logging but performs cryptographic trace capture

**What convergence reveals:** Three concerns — audit logging, business logic, and token advancement — each independently decode the same HMAC-signed token because architectural boundaries prevent sharing the result. The ERRORS analysis sees context destroyed at each re-wrapping. The COSTS analysis sees CPU waste. The CHANGES analysis sees the implicit contracts that *prevent* sharing (the `withAuditLog` wrapper signature erases the decoded payload; the handler cannot pass its decoded result to `advanceToken`). The PROMISES analysis sees that the function names hide the verification cost, making the redundancy invisible at the call site.

**Unified finding:** The separation of concerns that makes the code maintainable is the *exact same boundary* that prevents optimization and compounds error destruction. Each concern boundary (audit | handler | advance) is a clean abstraction individually, but together they create a triple-verification pipeline where information is destroyed, CPU is wasted, implicit ordering is required, and function names lie — all because coupling the concerns would violate the modularity principle that justified the separation.

---

### C-4: The Permissive Default — Validation functions (three lenses)

**Discovered independently by:**
- ERRORS (EB-19, EB-20): `validateActivityTransition` treats empty transitions as unrestricted navigation; `validateSkillAssociation` treats missing activity as valid; three distinct error conditions collapsed into `return null`
- CHANGES (HC-4, P-4): First `next_activity` call bypasses ALL transition validation because `token.act` is empty; `initialActivity` field is advisory only; any activity reachable on first call
- PROMISES (LIE-12): `validateSkillAssociation` name promises association checking; returns `null` (pass) when the activity doesn't exist

**What convergence reveals:** The validation layer has a systematic pattern where "absence of data" is treated as "permission granted." The ERRORS analysis sees constraint information destroyed (three error states collapsed into null). The CHANGES analysis sees the implicit state machine this enables (pre-activity phase grants unrestricted access). The PROMISES analysis sees the naming contradiction (validate = pass-through). No single lens captures the architectural consequence: **the validation layer cannot distinguish between "correctly unconstrained" and "data missing due to error."**

**Unified finding:** Every `return null` in the validation functions serves dual duty: it is both a legitimate "no constraint applies" signal and a silent suppression of missing data. This makes the validation layer structurally incapable of hardening — tightening any individual check would break the first-activity bypass, which is the intended (though undocumented) "session entry" behavior.

---

### C-5: The Observability Paradox — TraceStore (three lenses)

**Discovered independently by:**
- ERRORS (EB-14, EB-15, EB-16): Silent event drop on uninitialized sessions; silent eviction of oldest sessions; trace gaps from missing session tokens
- CHANGES (HC-3, P-3, P-10): Mutable cursor-based segment state creates ordering dependencies; double-call produces empty segments; eviction silently destroys active session history
- PROMISES (LIE-02): `TraceStore.append` promises to store events; silently discards if `initSession` was never called

**What convergence reveals:** The component designed to provide observability over system behavior is itself *unobservable*. Events vanish without signal (ERRORS), cursor state mutates destructively (CHANGES), and the `append` signature promises storage but delivers discard (PROMISES). The COSTS analysis did not flag TraceStore as a significant cost center (W7 notes defensive copies are negligible), which means the TraceStore is the rare case where the *performance is fine but the behavior is broken*.

**Unified finding:** The TraceStore has no failure signal of its own — it cannot trace its own failures. Adding error reporting to the trace system would create infinite recursion (trace failures generate events that fail to trace). This is a fundamental architectural constraint: **the observability layer must be the most reliable component in the system, but it is built with the same error-suppressing patterns as the rest of the codebase.**

---

### C-6: The Bootstrap Cliff — Rules loading and `start_session` (three lenses)

**Discovered independently by:**
- ERRORS (EB-11, Trace D): Rules parse error returns `RulesNotFoundError`; `start_session` throws "Global rules not found"; session startup blocked; wrong remediation path
- CHANGES (HC-5, P-5): `readRules()` calls `decodeToon<Rules>(content)` with no Zod validation; typo in field name (`sectons` for `sections`) produces rules with `sections: undefined`; `sectionCount: 0` logged as normal
- PROMISES (LIE-04): `RulesNotFoundError` returned when file exists but is unparseable; DIRECTION lie — error type contradicts reality

**What convergence reveals:** Rules loading is the single most critical bootstrap failure point because it gates all session creation. The error reclassification (ERRORS), missing validation (CHANGES), and naming lie (PROMISES) compound: a malformed rules file blocks every workflow session, the error message directs toward wrong remediation (creating a new file when the existing one has a syntax error), and even when the file parses successfully, missing validation lets structurally invalid rules flow through to agents who then operate without behavioral constraints.

**Unified finding:** The rules pipeline has zero defensive depth. Every other content type (workflows, activities) has at least one validation checkpoint. Rules have none — they go from raw TOON decode directly to the agent, passing through error boundaries that lie about their failure mode. This makes rules the highest-leverage attack surface and the most fragile bootstrap dependency.

---

## Step 2: The Blind Spots

Properties, defects, or structural features that fall between ALL four lenses.

### BS-1: Concurrency Under MCP Transport

No analysis examines what happens when two tool calls arrive in rapid succession for the same session, or when the stdio transport delivers messages before the previous handler completes. The TraceStore's mutable state (CHANGES/HC-3) and the session token's implicit state machine (CHANGES/HC-4) both assume serial execution, but nothing in the MCP SDK or server construction enforces this. If the SDK dispatches handlers concurrently:

- `advanceToken` could race with itself, producing tokens with the same sequence number
- `TraceStore.append` and `getSegmentAndAdvanceCursor` could interleave, producing corrupt segments
- `existsSync` + `readFile` sequences could experience TOCTOU violations

This is invisible to all four lenses because each analyzes *single-request paths*. The cross-request interaction surface is unexamined.

### BS-2: Shutdown Sequence and Resource Cleanup

The ERRORS lens examines `main()` catch-all (EB-01) and notes that `process.exit(1)` destroys in-flight state. But no analysis examines *graceful* shutdown: what happens when the MCP transport closes, when the parent process sends SIGTERM, or when the SDK calls a cleanup handler. The TraceStore's in-memory data, partially-written state files (via `save_state`), and the stdio transport's buffer state are all abandoned without orderly cleanup. No `process.on('SIGTERM', ...)` handler exists.

### BS-3: Memory Growth Over Long-Running Sessions

The COSTS lens quantifies per-request allocation (~300-520KB) but does not project over time. The TraceStore grows unboundedly within a session (events array has no per-session limit — only session *count* is capped). The `withAuditLog` function serializes full parameter objects to stderr on every call, and stderr writes accumulate in the parent process's buffer. For a long-running server handling hundreds of tool calls across dozens of sessions, the memory profile is uncharacterized.

### BS-4: Schema Evolution and Backward Compatibility

The CHANGES lens identifies implicit contracts (HC-5, HC-6, HC-10) and the PROMISES lens identifies validation lies (LIE-01, LIE-06), but no analysis asks: what happens when Zod schemas add new required fields? The validation-bypass pattern in `readActivityFromWorkflow` (activity-loader.ts:120) — which the PROMISES lens flags as LIE-06 — is *also* the de facto backward compatibility mechanism. When a schema evolution adds `required: z.boolean().default(true)`, old TOON files fail `safeParse` but still load via the raw-data fallback. Removing LIE-06 would simultaneously fix a promise violation and break backward compatibility. No analysis identifies this tension.

### BS-5: External Dependency Risk

The TOON format library (`@toon-format/toon`), MCP SDK (`@modelcontextprotocol/sdk`), and Zod are all treated as opaque boundaries. No analysis examines version pinning, breaking change risk in these dependencies, or what happens if the TOON library changes its output format (e.g., starts returning `Date` objects instead of ISO strings, or changes how it handles numeric-looking strings — directly relevant to EB-23's type mismatch issue).

### BS-6: MCP Protocol Compliance

No analysis verifies that error responses, content types, pagination behavior, or tool registration metadata conform to the MCP specification. The server could be producing responses that a strict MCP client would reject, or omitting required fields in error responses. The `JSON.stringify(data, null, 2)` pattern (COSTS/W3) produces valid JSON, but the MCP spec may have opinions about response envelope structure.

### BS-7: Idempotency of Tool Calls

The CHANGES lens examines the destructive cursor advance in `getSegmentAndAdvanceCursor` (HC-3/P-10), but no analysis systematically examines which tool calls are idempotent and which are not. `next_activity` advances the token, appends trace events, and advances the trace cursor — calling it twice produces different results. But the tool description says "Transition to next activity," implying a repeatable action. Network retries, agent retry loops, and MCP transport-level retries would all produce subtle state corruption without any signal.

---

## Step 3: The Unified Law

### Conservation Law

**At every abstraction boundary in this system, information fidelity and interface simplicity are in zero-sum tension.** Reducing the information that crosses a boundary — simpler return types, fewer error classes, opaque tokens, bare catches — simultaneously destroys error context, hides performance costs, creates implicit contracts, and breaks naming promises. The codebase consistently chooses simplicity over fidelity, producing a system that is easy to read function-by-function but impossible to diagnose end-to-end.

### Unified Law Table

| Location | Error View | Cost View | Change View | Promise View | Unified Finding |
|---|---|---|---|---|---|
| **`decodeToon<T>()`** `toon.ts:8-9` | EB-17: Unsafe cast enables `undefined` field access without throwing | B1/B3: Forces downstream Zod re-validation (~0.5–2ms per parse, 17+ `.default()` clones) | HC-5: Creates safe/unsafe caller bifurcation; 3 poison paths from unsafe side | LIE-05: Generic `T` promises type safety; `as T` delivers `unknown` in costume | **Type erasure nexus** — a single `as T` simultaneously destroys type errors, forces compensating validation cost, splits callers into trust populations, and lies about return guarantees |
| **Loader catch patterns** 6 loader files, 13 catch blocks | EB-09: All error info destroyed; Traces A,B,C,D,F,H flow from here | W1: Cannot cache results because silent failure is indistinguishable from empty success; ~150–250ms/session wasted | HC-5 callers + P-5/P-6/P-9: Unvalidated data flows through suppressed errors | LIE-01/LIE-04/LIE-06: Return types lie about validation; `RulesNotFoundError` on parse failure | **Aggregation dilemma** — partial success is inherently information-destroying, optimization-preventing, contract-creating, and promise-breaking |
| **Session token pipeline** `session.ts`, `logging.ts`, tool handlers | EB-04: Double-wrapped errors lose SyntaxError position, ZodError issues, stack traces | W2: Triple decode per request (audit + handler + advance); 0.2–0.6ms + 6 Buffer allocs | HC-4/HC-8: Implicit state machine; stringly-typed `session_token` contract | LIE-14/LIE-11: "decode" hides verification; "auditLog" hides crypto tracing | **Opacity tax** — separation of concerns prevents sharing decoded state, causing triple verification, triple error destruction, triple naming deception |
| **Validation functions** `validation.ts` | EB-19/EB-20: Three error states collapsed into `return null` (valid); constraints destroyed | B3: Re-validates on every call; validated data gets no fast path | HC-4/P-4: First-activity bypass grants unrestricted access via `null` returns | LIE-12: "validate" = pass-through when data is missing | **Permissive default** — `null` serves dual duty as "no constraint" and "data missing"; cannot distinguish legitimate permission from suppressed error |
| **TraceStore** `trace.ts` | EB-14/EB-15/EB-16: Events dropped silently; sessions evicted silently; trace gaps | W7: Defensive copies on every read (~negligible cost) | HC-3/P-3/P-10: Mutable cursor; destructive segment advance; ordering dependency | LIE-02: `append` promises storage, delivers discard on uninitialized session | **Observability paradox** — the system's observability component is itself unobservable; cannot trace its own failures without recursion |
| **Filesystem I/O layer** all loader modules | EB-09: Errors from filesystem operations (EACCES, EMFILE) suppressed at every read | W1/W4/W5/W6: Full re-read per call, sequential reads, existsSync blocking, redundant readdir — ~57–92ms/request | HC-7/HC-10: `process.cwd()` as security boundary; `activitiesDir` consumed and deleted | LIE-09: "read" index = dynamically build index; "list" = full disk scan | **Database illusion** — filesystem treated as database but offers no database guarantees (no cache, no transactions, no error reporting, no query interface); every function name implies simple retrieval |
| **Rules loading** `rules-loader.ts` | EB-11/Trace D: Parse error → `RulesNotFoundError`; blocks all sessions; wrong remediation | (Not flagged as significant cost) | HC-5/P-5: No validation after decode; typos in field names produce empty sections silently | LIE-04: DIRECTION lie — "not found" when file exists but is unparseable | **Zero defensive depth** — the most critical bootstrap dependency (gates all sessions) has the fewest validation checkpoints of any content type |
| **`readActivityFromWorkflow`** `activity-loader.ts:83-148` | EB-12: Validation bypass produces objects where required fields are `undefined` despite type claims | B3: Zod defaults (17+ `.default()` calls) not applied on fallback path | HC-5/P-6: Raw decoded object used when validation fails; Zod transforms skipped | LIE-06: `ok(...)` returned on validation failure — success result with invalid data | **Compatibility trap** — validation bypass is simultaneously a bug (ERRORS, PROMISES) and a feature (backward compat for schema evolution — see BS-4); fixing it requires solving the schema versioning problem first |

### The Meta-Law

The unified law expressed as a single statement:

> **Every interface simplification in this codebase is an information destruction event that propagates across all four behavioral dimensions simultaneously.** A bare `catch {}` is not just an error-handling choice — it is simultaneously a caching prevention mechanism (COSTS), an implicit contract creation (CHANGES), and a return-type lie (PROMISES). Conversely, any fix that preserves information in one dimension (e.g., typed error propagation) necessarily increases complexity in another (API surface, coupling, naming burden). The system's current equilibrium — simple interfaces, destroyed information — is locally optimal at each function boundary but globally pathological across request paths.

This meta-law explains why the codebase has resisted incremental improvement: fixing any single dimension (adding error types, adding caches, documenting contracts, fixing names) shifts cost to the other three dimensions. The only interventions that reduce total system cost are those that address the information boundary itself — `decodeToon<T>()` with mandatory validation (C-1), auto-initializing TraceStore (C-5), and typed error propagation in loaders (C-2) — because these interventions operate at the *boundary* rather than compensating for it downstream.

---

## Appendix: Evidence Cross-Reference

| Convergence | ERRORS refs | COSTS refs | CHANGES refs | PROMISES refs |
|---|---|---|---|---|
| C-1 (Type Erasure) | EB-17, Traces B,C,G,H | B1, B3, W1 (partial) | HC-5, P-5, P-6, P-9 | LIE-05, LIE-01 |
| C-2 (Aggregation) | EB-09, Traces A,B,C,D,F,H | W1, W4, W6 | HC-5 (callers) | LIE-01, LIE-04, LIE-06 |
| C-3 (Opacity Tax) | EB-04, Trace E | W2, W10, B2, B5, B8 | HC-4, HC-8 | LIE-14, LIE-11 |
| C-4 (Permissive Default) | EB-19, EB-20, Trace F | B3 | HC-4, P-4 | LIE-12 |
| C-5 (Observability Paradox) | EB-14, EB-15, EB-16, Trace J | W7 | HC-3, P-3, P-10 | LIE-02 |
| C-6 (Bootstrap Cliff) | EB-11, Trace D | — | HC-5, P-5 | LIE-04 |

| Blind Spot | Why each lens misses it |
|---|---|
| BS-1 (Concurrency) | All lenses trace single-request paths; cross-request interleaving is outside scope |
| BS-2 (Shutdown) | ERRORS examines crash paths, not graceful termination; others analyze steady-state |
| BS-3 (Memory Growth) | COSTS quantifies per-request, not cumulative; no lens models time-series behavior |
| BS-4 (Schema Evolution) | CHANGES analyzes current coupling; PROMISES flags validation bypass; neither connects to version migration |
| BS-5 (Dependency Risk) | All lenses treat external libraries as opaque; no lens examines supply-chain or API stability |
| BS-6 (Protocol Compliance) | All lenses examine internal behavior; no lens verifies conformance to external specifications |
| BS-7 (Idempotency) | CHANGES examines state mutation; ERRORS examines failure; neither systematically maps repeatable vs. non-repeatable operations |
