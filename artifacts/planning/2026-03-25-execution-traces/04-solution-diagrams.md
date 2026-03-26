# Solution Diagrams: Execution Traces

**Work Package:** Execution Traces for Workflows  
**Issue:** [#63](https://github.com/m2ux/workflow-server/issues/63)  
**Created:** 2026-03-25

---

## 1. Component Architecture

How the trace system fits into the existing server architecture.

```mermaid
graph TB
    subgraph "AI Agent (Cursor IDE)"
        Agent["Agent / Orchestrator"]
    end

    subgraph "MCP Server Process (stdio)"
        subgraph "Tool Layer"
            ST["start_session"]
            GA["get_activity"]
            GS["get_skills"]
            NA["next_activity"]
            GT["get_trace"]
            OT["other tools..."]
        end

        subgraph "Interception Layer"
            WAL["withAuditLog\n(augmented)"]
        end

        subgraph "Trace Infrastructure (NEW)"
            TS["TraceStore\nMap&lt;sid, TraceEvent[]&gt;"]
        end

        subgraph "Existing Infrastructure"
            SES["Session Utils\n(encode/decode/advance)"]
            VAL["Validation\n(consistency checks)"]
            LOG["Audit Log\n(stderr JSON)"]
            LOAD["Loaders\n(TOON → validated objects)"]
        end
    end

    Agent -->|"MCP tool calls\n(stdio transport)"| ST & GA & GS & NA & GT & OT
    ST & GA & GS & NA & OT -->|"every call"| WAL
    GT -.->|"excluded from\ntrace capture"| WAL
    WAL -->|"append event"| TS
    WAL -->|"log to stderr"| LOG
    WAL -->|"delegate to handler"| SES & VAL & LOAD
    GT -->|"read events"| TS
    ST -->|"init session"| TS

    style TS fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style WAL fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style GT fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

---

## 2. Session Lifecycle — Trace Capture Flow

The full lifecycle from session creation through trace retrieval.

```mermaid
sequenceDiagram
    participant A as Agent
    participant S as MCP Server
    participant W as withAuditLog
    participant TS as TraceStore
    participant H as Tool Handler

    Note over A,TS: Phase 1: Session Initialization

    A->>S: start_session(workflow_id)
    S->>H: createSessionToken(wf, version)
    Note right of H: Generates UUID sid<br/>Encodes into token
    H-->>S: token (with sid)
    S->>TS: initSession(sid)
    Note right of TS: Map.set(sid, [])
    S->>TS: append(sid, {type: "session_started"})
    S-->>A: {session_token, rules, workflow}

    Note over A,TS: Phase 2: Workflow Execution (repeated)

    A->>S: get_activity(token, wf_id, act_id, step_manifest)
    S->>W: intercept(tool="get_activity", params)
    W->>W: Extract sid from token<br/>Extract semantic fields:<br/>workflow_id, activity_id,<br/>step_manifest (redact token)
    W->>H: delegate to handler
    H-->>W: result + advanced token
    W->>TS: append(sid, TraceEvent)
    Note right of TS: {traceId: sid,<br/>spanId: uuid,<br/>name: "get_activity",<br/>attributes: {workflow_id,<br/>activity_id, ...},<br/>duration_ms, status: "ok"}
    W->>W: logAuditEvent (stderr)
    W-->>A: result + _meta.session_token

    A->>S: get_skills(token, wf_id, act_id)
    S->>W: intercept(tool="get_skills", params)
    W->>H: delegate to handler
    H-->>W: result
    W->>TS: append(sid, TraceEvent)
    W-->>A: result + _meta.session_token

    A->>S: next_activity(token, wf_id)
    S->>W: intercept(tool="next_activity", params)
    W->>H: delegate to handler
    H-->>W: transitions list
    W->>TS: append(sid, TraceEvent)
    W-->>A: transitions + _meta.session_token

    Note over A,TS: Phase 3: Trace Retrieval

    A->>S: get_trace(token)
    Note right of S: get_trace is excluded<br/>from trace capture
    S->>TS: getEvents(sid)
    TS-->>S: TraceEvent[]
    S-->>A: {traceId: sid, events: [...]}
```

---

## 3. Trace Event Structure

What each trace event contains, with OTel-compatible naming.

```mermaid
classDiagram
    class TraceEvent {
        +string traceId
        +string spanId
        +string name
        +string timestamp
        +number duration_ms
        +string status
        +string error_message?
        +TraceAttributes attributes
    }

    class TraceAttributes {
        +string workflow_id?
        +string activity_id?
        +string checkpoint_id?
        +string skill_id?
        +string transition_condition?
        +object step_manifest?
        +boolean summary?
    }

    class TraceStore {
        -Map~string, TraceEvent[]~ sessions
        +initSession(sid) void
        +append(sid, event) void
        +getEvents(sid) TraceEvent[]
        +listSessions() string[]
    }

    TraceEvent --> TraceAttributes : attributes
    TraceStore --> TraceEvent : stores
```

---

## 4. Error Handling in Traces

How tool errors appear in the trace.

```mermaid
sequenceDiagram
    participant A as Agent
    participant W as withAuditLog
    participant TS as TraceStore
    participant H as Tool Handler

    A->>W: get_activity(token, wf_id, "nonexistent")
    W->>H: delegate to handler
    H--xW: throw Error("Activity not found")
    W->>TS: append(sid, TraceEvent)
    Note right of TS: {name: "get_activity",<br/>status: "error",<br/>error_message:<br/>"Activity not found",<br/>duration_ms: 2}
    W->>W: logAuditEvent (stderr, error)
    W--xA: MCP error response

    Note over A,TS: Error events are captured<br/>in the trace — partial<br/>traces survive failures
```

---

## 5. Checkpoint Flow in Traces

How checkpoint interactions appear across multiple tool calls.

```mermaid
sequenceDiagram
    participant A as Agent
    participant S as MCP Server
    participant TS as TraceStore

    Note over A,TS: Checkpoint appears as a sequence of tool calls in the trace

    A->>S: get_activity(token, wf_id, "start-work-package")
    S->>TS: append: {name: "get_activity", attributes: {activity_id: "start-work-package"}}
    S-->>A: activity definition (includes checkpoints)

    A->>S: get_checkpoint(token, wf_id, "start-work-package", "issue-verification")
    S->>TS: append: {name: "get_checkpoint", attributes: {checkpoint_id: "issue-verification"}}
    S-->>A: checkpoint details

    Note over A: Agent yields checkpoint<br/>to user, gets response

    A->>S: get_activity(token, wf_id, "start-work-package", step_manifest=[...])
    S->>TS: append: {name: "get_activity", attributes: {activity_id: "start-work-package", step_manifest: [...]}}
    Note right of TS: step_manifest in attributes<br/>shows completed steps +<br/>checkpoint resolutions

    Note over TS: Trace shows the<br/>full checkpoint flow:<br/>1. Activity loaded<br/>2. Checkpoint queried<br/>3. Activity resumed<br/>   with step_manifest
```

---

## 6. Data Flow — Token and Trace Interaction

How session tokens and trace events relate.

```mermaid
flowchart LR
    subgraph "Session Token (HMAC-signed)"
        T[SessionPayload]
        T --- WF["wf: workflow ID"]
        T --- ACT["act: current activity"]
        T --- SID["sid: session UUID ★NEW"]
        T --- SEQ["seq: call counter"]
        T --- TS_F["ts: timestamp"]
        T --- V["v: version"]
    end

    subgraph "TraceStore (in-process)"
        MAP["Map&lt;sid, events[]&gt;"]
        MAP --- E1["Event 1: session_started"]
        MAP --- E2["Event 2: get_activity"]
        MAP --- E3["Event 3: get_skills"]
        MAP --- EN["Event N: ..."]
    end

    SID -.->|"sid keys<br/>the trace"| MAP

    subgraph "withAuditLog (augmented)"
        WAL_I["1. Decode sid from token"]
        WAL_E["2. Extract semantic fields"]
        WAL_R["3. Redact session_token"]
        WAL_A["4. Append TraceEvent"]
        WAL_L["5. Log to stderr (existing)"]
    end

    T -->|"passed in<br/>every call"| WAL_I
    WAL_A --> MAP
    WAL_L --> STDERR["stderr JSON log"]

    style SID fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style MAP fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style WAL_I fill:#fff3e0,stroke:#f57c00
    style WAL_E fill:#fff3e0,stroke:#f57c00
    style WAL_R fill:#fff3e0,stroke:#f57c00
    style WAL_A fill:#fff3e0,stroke:#f57c00
    style WAL_L fill:#fff3e0,stroke:#f57c00
```

---

## 7. Typical Trace Output Example

What `get_trace` returns for a short workflow session.

```json
{
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "workflow_id": "work-package",
  "workflow_version": "3.4.0",
  "started_at": "2026-03-25T18:00:00.000Z",
  "event_count": 6,
  "events": [
    {
      "spanId": "span-001",
      "name": "start_session",
      "timestamp": "2026-03-25T18:00:00.000Z",
      "duration_ms": 45,
      "status": "ok",
      "attributes": { "workflow_id": "work-package" }
    },
    {
      "spanId": "span-002",
      "name": "get_activity",
      "timestamp": "2026-03-25T18:00:01.200Z",
      "duration_ms": 32,
      "status": "ok",
      "attributes": {
        "workflow_id": "work-package",
        "activity_id": "start-work-package"
      }
    },
    {
      "spanId": "span-003",
      "name": "get_skills",
      "timestamp": "2026-03-25T18:00:02.500Z",
      "duration_ms": 28,
      "status": "ok",
      "attributes": {
        "workflow_id": "work-package",
        "activity_id": "start-work-package"
      }
    },
    {
      "spanId": "span-004",
      "name": "get_checkpoint",
      "timestamp": "2026-03-25T18:00:15.000Z",
      "duration_ms": 5,
      "status": "ok",
      "attributes": {
        "workflow_id": "work-package",
        "activity_id": "start-work-package",
        "checkpoint_id": "issue-verification"
      }
    },
    {
      "spanId": "span-005",
      "name": "get_activity",
      "timestamp": "2026-03-25T18:01:30.000Z",
      "duration_ms": 38,
      "status": "ok",
      "attributes": {
        "workflow_id": "work-package",
        "activity_id": "design-philosophy",
        "step_manifest": [
          {"step_id": "check-issue", "output": "Issue verified"},
          {"step_id": "create-branch", "output": "Branch created"}
        ]
      }
    },
    {
      "spanId": "span-006",
      "name": "save_state",
      "timestamp": "2026-03-25T18:02:00.000Z",
      "duration_ms": 120,
      "status": "ok",
      "attributes": {
        "workflow_id": "work-package"
      }
    }
  ]
}
```
