---
target: src/*.ts (root-level files only)
files_analyzed:
  - src/index.ts (33 lines)
  - src/server.ts (32 lines)
  - src/config.ts (22 lines)
  - src/trace.ts (121 lines)
  - src/logging.ts (84 lines)
  - src/errors.ts (39 lines)
  - src/result.ts (7 lines)
total_lines: 338
analysis_date: 2026-03-27
lens: L12 structural (Meta-Conservation Law)
analysis_focus: Quality and consistency audit
---

# L12 Structural Analysis — Server Core (Root-Level `src/*.ts`)

## Claim

**Falsifiable claim:** The server core's deepest structural problem is that `ServerConfig` conflates static configuration (environment-derived settings known at startup) with runtime dependency injection (mutable service objects created during initialization), forcing an implicit temporal initialization protocol that no type, runtime check, or declarative specification captures.

Evidence:
- `config.ts:11` declares `traceStore?: TraceStore` — optional, but required after server creation
- `config.ts:9` declares `schemaPreamble?: string` — optional, but required for correct server behavior
- `server.ts:11` mutates the passed config: `config.traceStore = new TraceStore()`
- `index.ts:22` mutates the config: `config.schemaPreamble = await buildSchemaPreamble(config.schemasDir)`
- `logging.ts:69` checks `traceOpts?.traceStore` defensively, even though after `createServer()` the store always exists

The config object serves three incompatible roles simultaneously: settings bag, service locator, and inter-phase communication channel.

## Dialectic

**Defender:** The config-as-service-locator pattern keeps the API surface minimal. Threading one object through all registrations (`registerWorkflowTools`, `registerResourceTools`, `registerStateTools`, `registerSchemaResources` at `server.ts:18-21`) avoids a proliferation of function parameters. The optionality of `traceStore?` and `schemaPreamble?` accurately reflects the construction timeline — before `createServer` runs, `traceStore` genuinely does not exist.

**Attacker:** The optionality is a type-level lie. After `createServer()` completes at `server.ts:31`, `traceStore` is *always* defined, but every downstream consumer must still guard with `traceOpts?.traceStore` (`logging.ts:69`). The mutation of config in two separate locations (`index.ts:22` and `server.ts:11`) means `ServerConfig` has no stable shape — its contents depend on *when* you read it. The type system cannot distinguish "config before preamble" from "config after preamble."

**Probing assumptions:** Both assume the problem lives in the config object. But the deeper assumption is that the seven root files compose into a single initialization pipeline with a fixed phase order: `loadConfig()` → `buildSchemaPreamble()` → `createServer()` (which creates `TraceStore`) → `connect()`. This phase ordering is implicit — enforced only by the linear control flow in `index.ts:19-31` and by nothing else.

**Transformed claim:** The deepest structural problem is that **the server core relies on an implicit temporal initialization protocol where configuration objects serve as mutable containers for accumulated state across phases, but no mechanism enforces or expresses the phase ordering or the completeness of accumulated state**.

The gap between the original claim (config conflation) and the transformed claim (implicit temporal protocol) is itself a diagnostic: the conflation is a *symptom* of the temporal protocol, not the root cause.

## Concealment Mechanism

**The simplicity of the happy path.** The `main()` function in `index.ts:19-31` reads as clean, linear code:

```
loadConfig → set preamble → createServer → connect
```

There is no branching, no error recovery between phases, no conditional initialization. The clarity of this straight-line code conceals the fragility: any reordering, partial execution, or concurrent access produces undefined behavior silently. The concealment works because good style (short functions, clear names, minimal nesting) makes temporal coupling invisible — the code *looks* like it has no order dependency because it *looks* simple.

## Improvement 1: Factory Function with Defaults

Engineer a legitimate improvement that would pass code review but deepen the concealment:

```typescript
// Proposed refactor of config.ts
interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  serverName: string;
  serverVersion: string;
  schemaPreamble: string;      // no longer optional
  traceStore: TraceStore;       // no longer optional
}

function createServerConfig(overrides?: Partial<ServerConfig>): ServerConfig {
  const base = loadConfig();
  return {
    ...base,
    schemaPreamble: overrides?.schemaPreamble ?? '',
    traceStore: overrides?.traceStore ?? new TraceStore(),
  };
}
```

This passes review: it removes the optional fields, provides sensible defaults, and creates a single construction point. But it deepens the concealment in three ways:

### Three properties visible only through strengthening:

1. **`schemaPreamble` has an async construction dependency.** `buildSchemaPreamble` (`index.ts:22`) is async — it reads schema files from disk. Making `schemaPreamble` a required constructor parameter forces either async config creation (changing the function signature) or a default empty string that silently degrades server output. The empty-string default makes "server works but produces wrong responses" indistinguishable from "server works correctly."

2. **`traceStore` has a lifecycle dependency.** The `TraceStore` accumulates events per-session (`trace.ts:60-61`). Its lifetime must be 1:1 with the server instance, but nothing enforces this. Creating it inside a factory function decouples its lifecycle from the server's, allowing a `TraceStore` to outlive or be shared across servers — a silent correctness violation.

3. **The config object is the only coordination mechanism between `index.ts` and `server.ts`.** There is no explicit handshake confirming all phases completed. The factory function conceals this by making the config *look* complete at creation, even when it isn't semantically complete (empty preamble, fresh trace store with no session context).

## Diagnostic on Improvement 1

**What the improvement conceals:** That `schemaPreamble` needs to be populated with *real data* before the server is useful. The empty-string default makes incompleteness invisible — previously, `undefined` at least marked absence distinctly.

**What property of the original is visible only because the improvement recreates it:** Default values make incompleteness invisible. The original used `undefined` (which marks absence in the type system); the improvement uses `''` (which is indistinguishable from "empty but valid input"). The improvement recreates the concealment at a deeper level: instead of "optional but actually required," it's now "present but actually empty."

## Improvement 2: Builder Pattern with Completeness Enforcement

Address the recreated property with a builder that rejects incomplete construction:

```typescript
class ServerConfigBuilder {
  private workflowDir?: string;
  private schemasDir?: string;
  private schemaPreamble?: string;
  private traceStore?: TraceStore;

  setBase(dir: string, schemas: string, name: string, version: string): this { /* ... */ }
  async buildPreamble(): Promise<this> {
    this.schemaPreamble = await buildSchemaPreamble(this.schemasDir!);
    return this;
  }
  setTraceStore(store: TraceStore): this { this.traceStore = store; return this; }

  build(): ServerConfig {
    if (!this.schemaPreamble) throw new Error('schemaPreamble required');
    if (!this.traceStore) throw new Error('traceStore required');
    return { /* all fields */ } as ServerConfig;
  }
}
```

### Diagnostic on Improvement 2

The builder makes incompleteness visible at runtime (`build()` throws on missing fields), but the phase ordering is now encoded in the builder's *method call sequence*. You can call `setTraceStore` before `buildPreamble` — the builder doesn't enforce order, only completeness. The temporal protocol is still implicit; it has merely migrated from config mutation order to builder method call order.

## Structural Invariant

**The property that persists through every improvement:** The initialization phase ordering is known only to the programmer, not to the code.

Whether the config is:
- Mutated in sequence (current design in `index.ts:19-31`)
- Factory-created with defaults (Improvement 1)
- Builder-constructed with completeness checks (Improvement 2)

...the ordering of `loadConfig → buildSchemaPreamble → createTraceStore → registerTools` exists only in the developer's understanding. No type, no runtime check, no declarative specification captures it.

This is **structural** because it's a property of the problem space: the server has genuine temporal dependencies (schemas must be read from disk before preamble can be built; trace store must exist before tools that record traces can be registered). These dependencies exist regardless of how the config is structured.

**Verdict: STRUCTURAL** — the temporal dependencies are inherent to the problem domain (async I/O before synchronous registration, service creation before service use). They can be made more explicit but cannot be eliminated.

## Inversion

**Invert the invariant:** Design where phase ordering is trivially satisfiable.

```typescript
class LazyServerConfig {
  constructor(private envConfig: { workflowDir: string; schemasDir: string; ... }) {}

  private _preamble?: string;
  private _traceStore?: TraceStore;

  get schemaPreamble(): string {
    if (!this._preamble) this._preamble = buildSchemaPreambleSync(this.schemasDir);
    return this._preamble;
  }

  get traceStore(): TraceStore {
    if (!this._traceStore) this._traceStore = new TraceStore();
    return this._traceStore;
  }
}
```

Phase ordering is now trivially satisfiable — dependencies are computed on first access, in whatever order callers need them.

**New impossibility the inversion creates:** Synchronous, deterministic startup becomes impossible. `buildSchemaPreamble` is async (reads files from disk at `index.ts:22` via `buildSchemaPreamble(config.schemasDir)`). Lazy getters cannot be async without changing every caller to `await config.schemaPreamble`. Even if solved, lazy initialization makes startup errors non-deterministic: the first tool call needing the preamble triggers a filesystem read, and that error surfaces in a tool handler context, not in the startup path. The failure mode shifts from "server fails to start" (deterministic, visible) to "server starts but first schema-dependent request fails" (non-deterministic, delayed).

## Conservation Law

### **Initialization Determinism × Phase Flexibility = Constant**

| Property | Original Design | Inverted Design |
|---|---|---|
| **Determinism** | High — linear startup in `main()`, fails fast on any phase error | Low — errors surface at unpredictable times during first use |
| **Phase Flexibility** | Zero — phases hardcoded in sequence at `index.ts:19-31` | Maximum — lazy computation in any order |
| **Failure Visibility** | Immediate — `process.exit(1)` at `index.ts:29` | Delayed — errors in tool handlers, not startup |
| **Testability** | Rigid — must mock entire startup sequence | Flexible — each lazy getter testable independently |

The seven root files choose maximum determinism (linear startup sequence in `index.ts`) at the cost of rigid phase coupling (any change to initialization order requires modifying the `main()` function).

## Applying the Diagnostic to the Conservation Law

**What does this law conceal?**

It conceals that the real problem isn't about initialization ordering at all — it's about **what the seven root files actually are**. The conservation law frames the problem as "initialization order vs. composition flexibility," but this obscures that these files constitute three fundamentally different architectural concerns forced into a flat namespace:

| Concern | Files | Lifecycle | Initialization Need |
|---|---|---|---|
| **Pure infrastructure** | `result.ts`, `errors.ts` | None — stateless types and constructors | None |
| **Configuration** | `config.ts` | Single read at startup | Environment access only |
| **Runtime services** | `trace.ts`, `logging.ts`, `server.ts`, `index.ts` | Stateful, lifecycle-dependent | Async I/O, service creation, registration |

The conservation law treats them as a unified initialization problem, but `result.ts` (7 lines of pure type definitions) has nothing in common with `trace.ts` (121 lines of stateful session management with HMAC cryptography). They share a directory, not an architectural role.

**Structural invariant of the law:** Any conservation law about these files will describe them as a unified system, concealing that they are three systems with different lifecycle needs forced into a flat module structure.

**Improving the law:** "Architectural Clarity × Minimal API Surface = Constant" — separating the three concerns requires creating module boundaries (packages, barrel exports, separate directories), which increases the API surface consumers must navigate.

**Inverting that invariant:** Make the three-concern structure explicit (separate layers for infrastructure, config, and runtime). The new impossibility: cross-cutting modules must choose a layer. `logging.ts` spans all three — it imports types from `trace.ts` (runtime), functions from `utils/session.ts` (infrastructure), and defines audit events (cross-cutting). Splitting forces `logging.ts` to either pick a layer or become its own cross-cutting module, adding dependency management complexity that the flat structure eliminates for free.

## Meta-Law

### **Flat Module Simplicity × Concern Separation = Constant**

The conservation law ("Initialization Determinism × Phase Flexibility = Constant") conceals that the initialization problem only exists *because* three architecturally distinct concerns share a flat namespace with no layering. The meta-law finds what the conservation law hides about this specific code:

**The initialization protocol is an emergent property of flatness.** In a layered design, pure infrastructure (`result.ts`, `errors.ts`) would have no initialization. Configuration (`config.ts`) would initialize independently. Only runtime services (`trace.ts`, `logging.ts`, `server.ts`) would participate in a phase protocol. The "Initialization Determinism" side of the conservation law would shrink to only the files that actually need it — but at the cost of module boundaries that currently don't exist.

**Concrete, testable prediction:** Any new root-level `.ts` file added to `src/` will be forced to participate in the initialization dependency chain, even if it contains only pure functions with no lifecycle dependencies. This is because the flat structure provides no mechanism to declare "this module has no initialization needs." A new `src/validators.ts` exporting pure validation functions will inevitably import from `config.ts` (for `ServerConfig` type) or `errors.ts` (for error types), creating an import-graph coupling to the initialization chain despite having no initialization requirements.

Second testable prediction: `logging.ts` cannot be cleanly tested in isolation because it imports from both `trace.ts` (runtime layer — `TraceStore`, `createTraceEvent`) and `utils/session.ts` (infrastructure layer — `decodeSessionToken`). Any test must mock both layers, because `logging.ts` sits at the intersection of all three concerns.

## Bug Table

| # | Bug / Edge Case | Location | What Breaks | Severity | Classification |
|---|---|---|---|---|---|
| 1 | **Config mutation overwrites TraceStore** — `config.traceStore = new TraceStore()` mutates the passed config. If `createServer` is called twice with the same config (e.g., in tests), the second call overwrites the first `TraceStore`, silently losing all accumulated trace events from the first server instance. | `server.ts:11` | Trace data loss in multi-server scenarios | Medium | **Fixable** — use a local variable or clone the config |
| 2 | **Optional fields after initialization** — `traceStore?` and `schemaPreamble?` are optional in the type but always defined after startup. Every consumer must guard (`traceOpts?.traceStore` at `logging.ts:69`) even though the value is always present. A tool registered without `traceOpts` silently skips all tracing with no warning. | `config.ts:9,11`; `logging.ts:69` | Silent trace omission; unnecessary null checks | Low | **Fixable** — make fields non-optional after builder/factory; or split config type into phases |
| 3 | **Double error handler in main** — `main()` has an internal `catch` at `index.ts:27-30` that calls `logError` + `process.exit(1)`. The outer `main().catch(...)` at `index.ts:33` duplicates this. If `logError` itself throws (e.g., `JSON.stringify` fails on a circular Error object), the outer catch calls `logError` again, potentially producing an infinite error or swallowing the original cause. | `index.ts:27-30`, `index.ts:33` | Startup error lost or infinite error loop | Low | **Fixable** — remove redundant outer catch, or make outer catch use raw `console.error` |
| 4 | **TraceStore unbounded memory growth** — `TraceStore.sessions` is a `Map<string, TraceEvent[]>` that grows without bound. `initSession` adds entries (`trace.ts:64-67`) but no method ever removes them. For a long-running server, every session's events accumulate indefinitely. | `trace.ts:60-61` | Memory leak proportional to session count × events per session | Medium | **Structural** — session lifecycle management is outside these files' scope; the conservation law predicts that adding cleanup here would require lifecycle coordination that the flat structure doesn't support |
| 5 | **SpanId collision risk** — `randomUUID().slice(0, 8)` at `trace.ts:45` truncates a UUID to 8 hex characters (32 bits of entropy). Birthday-problem collision probability reaches ~0.1% at ~1,000 events per session, ~50% at ~77,000 events. | `trace.ts:45` | Duplicate span IDs in trace data; correlation failures in downstream analysis | Low | **Fixable** — use full UUID or session-scoped counter |
| 6 | **Partial token validation** — `decodeTraceToken` at `trace.ts:115` casts `JSON.parse(json) as TraceTokenPayload` then only validates `sid` (string) and `events` (array). Fields `from`, `to`, `n`, `t0`, `t1`, `ts` are not validated. A tampered-but-validly-signed token with incorrect field types passes verification. | `trace.ts:115-118` | Malformed trace payload accepted; downstream consumers process corrupt data | Medium | **Fixable** — add full schema validation; consider Zod or manual checks |
| 7 | **Trace error indistinguishable from handler error** — In `withAuditLog` (`logging.ts:62-83`), `appendTraceEvent` is awaited inside the `try` block at line 70. If it throws (e.g., session token decode fails in `appendTraceEvent`), the exception is caught at line 73 as if the *tool handler* failed. The catch block then calls `appendTraceEvent` *again* at line 79. If that second call also fails (same bad token), the error propagates to the caller as a tool failure, when it was actually a tracing failure. | `logging.ts:69-71`, `logging.ts:79` | Tool reported as failed when only tracing failed; audit log records wrong error source | Medium | **Structural** — trace errors and handler errors share the same error channel; the conservation law predicts this is unfixable without separating the concern layers |
| 8 | **Empty env var treated as valid config** — `loadConfig` uses `process.env['WORKFLOW_DIR'] ?? './workflows'` (`config.ts:16`). The `??` operator only falls through on `null`/`undefined`. If `WORKFLOW_DIR` is set to an empty string `""`, it's used as-is, causing filesystem operations to resolve against the current working directory instead of a workflows directory. | `config.ts:16-19` | Server starts with wrong workflow directory; tools return wrong data or "not found" errors | Low | **Fixable** — validate non-empty strings: `process.env['WORKFLOW_DIR'] \|\| './workflows'` or explicit empty-check |
| 9 | **Error code strings not type-safe** — Error classes in `errors.ts` define `readonly code = 'WORKFLOW_NOT_FOUND'` etc. as string literals, but no shared union type or enum exists. Consumers matching on error codes use unverified string literals; a typo in a `catch` block (e.g., `'WORKFLOW_NOT_FOND'`) silently fails to match. | `errors.ts:2,8,16,23,29,36` | Silent error handling miss; wrong catch branch taken | Low | **Fixable** — create `type ErrorCode = 'WORKFLOW_NOT_FOUND' \| 'RESOURCE_NOT_FOUND' \| ...` union |
| 10 | **HMAC key race on concurrent startup** — `createTraceToken` and `decodeTraceToken` both call `getOrCreateServerKey()` (`trace.ts:96,109`). If called concurrently before the key is initialized, the implementation may create two keys (depending on `utils/crypto.js` internals), causing signature verification to fail for tokens signed with the other key. | `trace.ts:96`, `trace.ts:109` | Token verification failure; trace data inaccessible | Medium | **Fixable** — depends on `getOrCreateServerKey` using a singleton promise; if not, add one |
| 11 | **logWarn unbounded stderr on invalid tokens** — `appendTraceEvent` logs a warning via `logWarn` at `logging.ts:58` when token decode fails. In a scenario with many requests carrying invalid session tokens, this produces unbounded JSON output to stderr with no rate limiting or deduplication. | `logging.ts:58` | stderr flooding; log storage exhaustion; monitoring noise | Low | **Structural** — no rate-limiting infrastructure exists in these files |
| 12 | **result.ts unwrap wraps non-Error values** — `unwrap` at `result.ts:6` wraps non-Error error values in `new Error(String(result.error))`, losing the original error's type information and any custom properties. A `Result<T, WorkflowNotFoundError>` where the error is accidentally a plain object loses `.code` and `.workflowId`. | `result.ts:6` | Error metadata lost; catch blocks checking `.code` get `undefined` | Low | **Fixable** — use `cause` option: `new Error(String(result.error), { cause: result.error })` |
| 13 | **Audit event timestamp redundancy** — `withAuditLog` creates audit events with `timestamp: new Date().toISOString()` (`logging.ts:68,76`), but `logAuditEvent` serializes the entire event object which already contains this timestamp, and `logInfo`/`logError` also append their own `timestamp`. The same log line contains multiple potentially-different timestamps if the JSON serialization takes measurable time. | `logging.ts:7-10`, `logging.ts:68` | Confusing log entries with multiple timestamps; log parsing ambiguity | Trivial | **Fixable** — use a single timestamp source |
| 14 | **server.ts hardcoded tool list in log** — `server.ts:23-29` logs the tool list as a hardcoded string array. If a new tool is added via `registerWorkflowTools` or another registration function but not added to this array, the startup log is misleading — it reports fewer tools than are actually registered. | `server.ts:23-29` | Misleading startup diagnostics; operator confusion about available tools | Low | **Fixable** — derive the tool list from the registration calls or the MCP server's introspection API |

### Summary Statistics

| Classification | Count |
|---|---|
| **Fixable** | 11 |
| **Structural** | 3 |
| **Total** | 14 |

The conservation law correctly predicts the structural findings: bugs #4 (TraceStore memory), #7 (trace/handler error channel conflation), and #11 (unbounded logging) are all consequences of cross-cutting concerns that span the three architectural layers without explicit boundaries. Fixing any of them requires lifecycle coordination or concern separation that the flat module structure does not provide.
