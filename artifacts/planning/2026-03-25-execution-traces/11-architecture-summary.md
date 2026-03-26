# Architecture Summary

**Work Package:** Execution Traces for Workflows (#63)  
**Created:** 2026-03-25

---

## System Context

```mermaid
graph TB
    Agent["AI Agent<br/>(Cursor IDE)"]
    Server["MCP Workflow Server<br/>(stdio transport)"]
    Workflows["Workflow Definitions<br/>(TOON files)"]
    Planning["Planning Folder<br/>(.engineering/artifacts/)"]

    Agent -->|"MCP tool calls<br/>(next_activity, get_skills,<br/>get_trace, etc.)"| Server
    Server -->|"Reads definitions"| Workflows
    Agent -->|"Writes semantic trace<br/>+ planning artifacts"| Planning
    Server -->|"Returns trace tokens<br/>in _meta.trace_token"| Agent
```

## Package Diagram — New and Modified Modules

```mermaid
graph LR
    subgraph "New Module"
        trace["src/trace.ts<br/>TraceStore<br/>TraceEvent<br/>TraceToken encode/decode"]
    end

    subgraph "Modified Modules"
        logging["src/logging.ts<br/>withAuditLog<br/>+ TraceOptions<br/>+ validation extraction"]
        session["src/utils/session.ts<br/>SessionPayload<br/>+ sid (UUID)<br/>+ aid (agent ID)"]
        validation["src/utils/validation.ts<br/>+ ActivityManifestEntry<br/>+ validateActivityManifest"]
        wftools["src/tools/workflow-tools.ts<br/>next_activity (renamed)<br/>get_activities (renamed)<br/>+ get_trace tool"]
        restools["src/tools/resource-tools.ts<br/>start_session<br/>+ trace init"]
    end

    logging -->|"imports"| trace
    logging -->|"imports"| session
    wftools -->|"imports"| trace
    restools -->|"imports"| trace
    wftools -->|"imports"| validation

    style trace fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
```

## Key Flow: Trace Token Lifecycle

```mermaid
sequenceDiagram
    participant A as Agent
    participant S as Server
    participant TS as TraceStore

    A->>S: start_session(workflow_id)
    S->>TS: initSession(sid)
    S->>TS: append(session_started)
    S-->>A: token (with sid)

    A->>S: get_skills(token, ...)
    S->>TS: append(get_skills event)
    S-->>A: skills + updated token

    A->>S: next_activity(token, activity_id)
    S->>TS: append(next_activity event)
    S->>TS: getSegmentAndAdvanceCursor(sid)
    Note right of S: Package segment as<br/>HMAC-signed trace token
    S-->>A: activity + _meta.trace_token

    Note over A: Agent accumulates<br/>trace tokens (opaque)

    A->>S: get_trace(token, trace_tokens[])
    Note right of S: Decode + verify HMAC<br/>Concatenate events
    S-->>A: Full mechanical trace
```

## Changes Summary

| Component | Before | After |
|-----------|--------|-------|
| **Tool names** | `get_activity`, `next_activity` | `next_activity` (commit), `get_activities` (query) |
| **Session token** | 7 fields (wf, act, skill, cond, v, seq, ts) | 9 fields (+ sid, aid) |
| **withAuditLog** | stderr JSON logging only | + optional trace capture + validation extraction |
| **Server state** | Fully stateless | + in-process TraceStore (Map-based) |
| **New tool** | — | `get_trace` (trace token resolution) |
| **Manifests** | step_manifest only | + activity_manifest with advisory validation |
| **Test count** | 151 | 187 (+36) |
