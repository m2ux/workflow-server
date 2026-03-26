# Research: Execution Traces for Workflows

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25

---

## Research Questions

1. How do other MCP servers handle execution tracing and observability?
2. What established tracing patterns (OpenTelemetry, structured logging) apply to a TypeScript MCP server?
3. Should the existing agent-side `HistoryEventTypeSchema` be reused or a new server-side schema designed?
4. What are the trade-offs between building custom vs. adopting an existing tracing library?

---

## Web Research Findings

### F1: MCP Observability Is a Recognized Industry Gap

The MCP ecosystem recognizes tracing as essential for production readiness. Key findings:

- **89% of teams** have production observability, but only ~50% can evaluate AI agent quality beyond HTTP status codes ([State of MCP Agent Observability, March 2026](https://dev.to/irparent/the-state-of-mcp-agent-observability-march-2026-3nd2))
- "If you aren't tracing, you aren't production-ready" — tracing is not optional for MCP servers ([Stackademic](https://blog.stackademic.com/the-missing-link-in-mcp-if-you-arent-tracing-you-aren-t-production-ready-2e83a409f27d))
- The observability market is projected to reach $3.35B in 2026, growing to $6.93B by 2031
- Anthropic donated MCP to the Agentic AI Foundation (Linux Foundation) in Dec 2025, solidifying it as an industry standard

### F2: mcp-trace Library Exists

**[mcp-trace-js](https://github.com/ContexaAI/mcp-trace-js)** (v0.2.0, Oct 2025) is a TypeScript tracing middleware for MCP servers:

- **3-line integration**: `TraceMiddleware` wraps the MCP server object
- **Multiple adapters**: File, PostgreSQL, Supabase, OTLP (OpenTelemetry), Console, custom
- **Privacy controls**: Configurable field-level logging, PII redaction
- **Composable**: Multiple adapters can run simultaneously
- **Full TypeScript support** with type safety

```typescript
import { TraceMiddleware, FileAdapter } from "mcp-trace";
const traceMiddleware = new TraceMiddleware({ adapter: new FileAdapter(traceFilePath) });
traceMiddleware.init(server);
```

**Relevance:** This library solves the same problem we're addressing. Key consideration: does it meet our specific requirements (in-process retrieval via MCP tool, session-scoped traces)?

### F3: OpenTelemetry Is the Industry Standard

OpenTelemetry provides the standard trace model for TypeScript/Node.js:

- **Traces** contain **spans** (timed units of work)
- **Context propagation** through async operations is automatic within a process
- **Manual span creation** via `tracer.startActiveSpan()` for custom instrumentation
- **Attributes** attach metadata to spans (tool name, workflow ID, etc.)
- **NodeSDK** with `OTLPTraceExporter` for production export

**Relevance:** Our server is single-process stdio — we don't need distributed context propagation. But adopting OTel-compatible trace format would enable future integration with external observability systems (Grafana, Jaeger, etc.).

### F4: Three Pillars of MCP Observability

Industry consensus identifies three pillars for MCP servers:

1. **Performance & Reliability**: Latency, throughput, error rates (our `withAuditLog` partially covers this)
2. **Resource Efficiency**: Infrastructure consumption monitoring
3. **Tracing & Context Flow**: End-to-end visibility into tool execution patterns, context propagation, error locations

Our issue #63 addresses pillar 3 specifically.

### F5: Production MCP Server Best Practices

From [Building Production-Ready MCP Servers](https://www.mkweb.dev/blog/production-ready-mcp-servers):

- Use **Streamable HTTP transport** for network-facing servers (not relevant — we use stdio)
- Implement **structured error handling** returning error content with `isError: true`
- Tracing should capture: tool calls, parameters, results, timing, errors
- Privacy considerations: redact sensitive parameters before logging

---

## Knowledge Base Findings

### F6: Observability Patterns (Systems Performance, Gregg)

The concept of observability as "understanding system behavior through external outputs" (logs, metrics, traces) is well-established. Key distinction:

- **Counters/Statistics**: Aggregate metrics (request count, error rate)
- **Profiling**: Sampling-based analysis (CPU, memory)
- **Tracing**: Per-event recording of individual operations

Our execution traces fall squarely into the "tracing" category — per-event recording of individual tool calls within a workflow session.

### F7: Event Sourcing Pattern (Multiple Sources)

Event sourcing — "storing all changes to application state as a sequence of events rather than current state snapshots" — is directly applicable. The existing `HistoryEventTypeSchema` in `state.schema.ts` is an event sourcing schema: it defines 21 event types for recording workflow state changes as an ordered sequence.

**Key insight:** The agent-side history schema is conceptually correct but located in the wrong place for server-side tracing. The event types and structure can inform the server-side trace format.

---

## Synthesis: Applicability to Issue #63

### Option Analysis

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Custom TraceStore** (draft plan) | In-process `Map` with `withAuditLog` augmentation | Simple, no dependencies, full control, in-process retrieval via `get_trace` tool | No external export, no adapter ecosystem, custom format |
| **B: Adopt mcp-trace** | Use `mcp-trace-js` library | Industry-tested, multiple adapters, privacy controls, 3-line setup | External dependency, may not support in-process retrieval via MCP tool, adapter-oriented (File/DB/OTLP) rather than in-memory |
| **C: OpenTelemetry native** | Full OTel instrumentation | Industry standard, future-proof, rich tooling ecosystem | Heavy dependency, overkill for single-process stdio server, requires external collector |
| **D: Hybrid — Custom + OTel-compatible format** | Custom TraceStore with OTel-style trace/span structure | In-process retrieval, future OTel export path, lightweight | Slightly more complex than Option A, but preserves future compatibility |

### Recommendation

**Option D (Hybrid)** provides the best balance:

1. **Keep the in-process `Map`-based TraceStore** — essential for `get_trace` MCP tool retrieval (our primary use case)
2. **Structure trace events with OTel-compatible fields** — `traceId` (session ID), `spanId` (per-call ID), `timestamp`, `duration`, `name` (tool name), `attributes` (workflow-semantic fields), `status` (ok/error)
3. **Don't add mcp-trace or OTel as dependencies now** — the server is a lightweight stdio process; adding heavy dependencies is not warranted for the current scope
4. **Design the TraceEvent type to be exportable** — if future work requires OTel export, the in-process events can be converted to OTel spans without changing the core capture mechanism

### Key Design Implications from Research

1. **Privacy**: Tool call parameters may contain session tokens and sensitive data. The trace should either redact session tokens or store only workflow-semantic fields (workflow_id, activity_id, checkpoint_id) rather than raw params.

2. **Trace vs. Span terminology**: Adopt OTel terminology — a "trace" is the full session, each tool call is a "span." This aids communication with the broader observability community.

3. **Session ID**: Research confirms a UUID-based session ID is the right approach (aligns with OTel's `traceId` concept).

4. **get_trace recursion**: The `get_trace` tool should not appear in its own trace output (infinite recursion). Either exclude it from tracing or filter it from results.

5. **Existing schema reuse**: The `HistoryEventTypeSchema` event types can inform naming (e.g., `activity_entered`, `checkpoint_reached`) but the server-side trace captures tool calls, not workflow-semantic events. The server sees `get_activity` calls, not "activity entered" events. Keep these distinct.

---

## Risks and Anti-Patterns

| Risk | Mitigation |
|------|------------|
| **Over-engineering**: Adding OTel/mcp-trace dependencies for a simple use case | Start with custom in-process store; design for future export |
| **Privacy leakage**: Logging raw tool parameters including tokens | Store workflow-semantic fields only; redact session tokens |
| **Memory growth**: Unbounded trace accumulation for long sessions | Consider max event count or age-based pruning |
| **Breaking stateless architecture**: TraceStore is the first mutable runtime state | Document as intentional, isolated concern; keep store separate from workflow logic |
| **get_trace recursion**: Tracing the trace retrieval tool | Exclude `get_trace` from trace capture |

---

## Sources

1. [State of MCP Agent Observability (March 2026)](https://dev.to/irparent/the-state-of-mcp-agent-observability-march-2026-3nd2)
2. [MCP Monitoring & Observability Best Practices](https://www.arsturn.com/blog/the-complete-guide-to-mcp-monitoring-observability-best-practices)
3. [The Missing Link in MCP: Tracing](https://blog.stackademic.com/the-missing-link-in-mcp-if-you-arent-tracing-you-aren-t-production-ready-2e83a409f27d)
4. [Building Production-Ready MCP Servers](https://www.mkweb.dev/blog/production-ready-mcp-servers)
5. [mcp-trace-js (ContexaAI)](https://github.com/ContexaAI/mcp-trace-js)
6. [OpenTelemetry Node.js Instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation)
7. Systems Performance (Gregg) — observability concepts
8. Event sourcing pattern — multiple KB sources (Kleppmann, Richardson, Newman)
