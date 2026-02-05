# Knowledge Base Research: Navigation-Based Workflow Engine

**Created:** 2026-01-29
**Issue:** [#34](https://github.com/m2ux/workflow-server/issues/34)

---

## Research Questions

1. What patterns exist for stateless workflow engines with encoded state tokens?
2. How can state be made opaque to prevent agent interpretation/bias?
3. What FSM patterns support server-side enforcement of transitions?
4. How do existing systems handle state serialization and compression?

---

## Knowledge Base Findings

### Pattern-Oriented Software Architecture (POSA4)

| Pattern | Description | Relevance |
|---------|-------------|-----------|
| **Memento** | Capture object state without breaking encapsulation | Opaque state token - agent stores without reading |
| **Collections for States** | Manage objects by lifecycle state | Track workflow position and valid actions |
| **State Machine** | Manage behavior based on current state | Core pattern for navigation engine |

### Blockchain/Distributed Systems

| Concept | Source | Relevance |
|---------|--------|-----------|
| State Machine Replication (SMR) | Mastering Blockchain | Deterministic state transitions with validation |
| State and Nonce Validation | Ethereum patterns | Validate state before accepting transitions |

### Session Management

| Pattern | Source | Relevance |
|---------|--------|-----------|
| Session keys | Applied Cryptography | Stateless communication with encoded tokens |
| Session service | Agentic Design Patterns | Agent-side session storage for resumption |

---

## Web Research Findings

### Temporal Workflow Engine

**Key Patterns:**
- **Task Tokens**: Opaque references for async activity completion
- **Payload Codecs**: Bytes-to-bytes transformation (compress, encrypt)
- **Data Conversion**: Serialize → Codec → Base64 for transport
- **Codec Server**: HTTP endpoints for encode/decode

**State Format:**
```
Compressed data appears as: "H4sIAAAAAAAAAO1d3Xbb.."
```

**Relevance:** Temporal's payload codec pattern directly applies to our opaque state token design.

### XState State Machine Library

**Key Patterns:**
- **Pure transitions**: `Machine.transition(state, event) → newState`
- **Persisted snapshots**: `getPersistedSnapshot()` returns JSON-serializable state
- **State restoration**: `createActor(machine, { snapshot: restoredState })`
- **Deterministic execution**: Same state + events = same result

**Relevance:** XState's stateless transition model aligns with our navigation API design.

### StateWalker FSM Orchestrator

**Key Patterns:**
- Hierarchical FSM with unidirectional data flow
- Process context shared across handlers
- Controllers enforce state-driven behavior
- Server-side validation of allowed transitions

**Relevance:** Demonstrates server-side enforcement of navigation constraints.

### Opaque Token Patterns

| Aspect | Opaque Token | JWT |
|--------|--------------|-----|
| State location | Server-side (or encoded) | Self-contained |
| Revocation | Real-time | Requires infrastructure |
| Privacy | Token is meaningless to holder | Payload visible |
| Scalability | Requires validation | Stateless validation |

**Relevance:** Opaque tokens prevent agent interpretation, aligning with our requirement.

---

## Synthesis: Applied Patterns

### State Token Design

**Format:** `{version}.{encoding}.{payload}`

```
v1.gzB64.H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVR...
```

**Components:**
- `version`: Schema version for migration
- `encoding`: Encoding method (gzB64 = gzip + base64)
- `payload`: Compressed, encoded state data

**Process:**
1. Serialize state to JSON
2. Compress with gzip
3. Encode with base64
4. Prepend version and encoding identifiers

### Navigation API Design

Inspired by XState pure transitions:

```typescript
// Start workflow - returns initial state
start_workflow(workflow_id) → {
  position: { activity, step },
  availableActions: { required, optional, blocked },
  state: "v1.gzB64...."
}

// Navigate - pure transition function
navigate(workflow_id, state, action, params?) → {
  success: boolean,
  position: { activity, step },
  availableActions: { required, optional, blocked },
  state: "v1.gzB64...."  // Updated state
}
```

### Transition Enforcement

Inspired by FSM guard patterns:

```typescript
// Engine computes valid actions
function computeAvailableActions(workflow, decodedState) {
  const current = getCurrentPosition(decodedState);
  const activity = workflow.activities[current.activityId];
  
  return {
    required: getRequiredActions(activity, decodedState),
    optional: getOptionalActions(activity, decodedState),
    blocked: getBlockedActions(activity, decodedState)
  };
}

// Engine validates action before executing
function validateAction(workflow, decodedState, action) {
  const available = computeAvailableActions(workflow, decodedState);
  if (!available.required.includes(action) && !available.optional.includes(action)) {
    throw new InvalidTransitionError(action, available.blocked);
  }
}
```

### Checkpoint Blocking

```typescript
// Checkpoint appears as required action
availableActions: {
  required: [
    { action: "respond_to_checkpoint", checkpoint: "task-complete", options: [...] }
  ],
  blocked: [
    { action: "complete_step", reason: "Checkpoint 'task-complete' requires response" }
  ]
}
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State version incompatibility | Cannot resume old workflows | Include version in token, implement migration handlers |
| State corruption/tampering | Invalid state accepted | Validate structure on decode, optionally sign tokens |
| Large state tokens | Context bloat, latency | Compression reduces size 60-80% |
| Replay attacks | Stale state reused | Include timestamps, sequence numbers |
| Agent attempts to decode | Bias from state contents | Use binary compression (not readable even if decoded) |

---

## Recommendations

1. **Adopt Temporal's Payload Codec pattern** for state encoding
   - Compress with gzip (significant size reduction)
   - Encode with base64 for transport
   - Version prefix for migration support

2. **Implement XState-style pure transitions**
   - `navigate(state, action) → newState`
   - Engine is stateless; state passed in/out
   - Deterministic: same state + action = same result

3. **Enforce transitions server-side**
   - Compute available actions from state + workflow
   - Reject invalid actions with clear error messages
   - Checkpoints block until responded

4. **Design for resumption**
   - Agent stores opaque token to file
   - On resume, pass token to engine
   - Engine validates and returns current position

5. **Apply situated cognition principles**
   - Present affordances (available actions) for direct perception
   - Restrict perceptual field to valid options only
   - Use opaque state to prevent disembodied reasoning
   - Frame API responses as "what you can do" not "what the workflow is"

---

---

## Situated Cognition: Theoretical Foundation

### Knowledge Base Sources

The knowledge base contains two highly relevant sources on situated cognition:

1. **The Cambridge Handbook of Situated Cognition** (Robbins & Aydede, 2008)
   - Comprehensive interdisciplinary exploration of situated cognition
   - Key concepts: affordances, ecological psychology, embodied cognition, direct perception

2. **Situated Cognition: On Human Knowledge and Computer** (Clancey)
   - Focus on AI and cognitive science applications
   - Key concepts: affordances, structural coupling, reactive robotics, subsumption architecture

### Affordances (Gibson)

> "An affordance is what the environment offers the animal, what it provides or furnishes, either for good or ill."

| Property | Description |
|----------|-------------|
| **Relational** | Neither purely objective nor subjective - "cuts across the dichotomy" |
| **Direct perception** | Perceivable without mental representation or inference |
| **Agent-relative** | Measured relative to the animal's capabilities, not absolute units |
| **Action-oriented** | Represents possibilities for action, not abstract properties |

### Effectivities (Turvey)

Effectivities are the **complementary dispositional properties of agents** that pair with affordances:

```
Affordances (Environment)  ←→  Effectivities (Agent)
         ↓                           ↓
    Action Possibilities    +    Capabilities
         ↓                           ↓
              → Actualized Action ←
```

An affordance is actualized when an agent's effectivities match the environmental offering.

### Mapping to Navigation Engine Design

| Situated Cognition | Navigation Engine |
|--------------------|-------------------|
| **Environment** | Workflow definition + current state |
| **Affordances** | `availableActions.required` and `availableActions.optional` |
| **Blocked affordances** | `availableActions.blocked` with reasons |
| **Agent** | LLM executing the workflow |
| **Effectivities** | Agent's capability to perform available actions |
| **Restricted state space** | Only valid actions presented - invalid options not perceivable |
| **Direct perception** | Ready-to-use actions, no schema interpretation |
| **Structural coupling** | State token maintains agent-environment relationship |

### Key Design Insight: Shaping the Perceptual Field

The navigation engine **shapes the agent's perceptual field** by:

1. **Only presenting valid affordances** - Invalid actions are not visible
2. **Blocking includes explanation** - Agent knows *why* something is unavailable
3. **No interpretation required** - Actions are ready to execute
4. **Effectivities are constrained** - Agent can only actualize presented affordances

This creates a **designed ecological niche** for the agent - the environment (engine) determines what actions are perceivable, and the agent can only act on what it perceives.

### Theoretical Justification for Opaque State

| Design Choice | Theoretical Basis |
|---------------|-------------------|
| **Opaque state tokens** | Prevents disembodied reasoning about state |
| **Forces situated action** | Agent acts on presented affordances, not internal models |
| **Matches ecological perception** | Animals perceive affordances, not physics |
| **No state interpretation** | Agent is "in" the situation, not reasoning "about" it |

### Design Decisions with Theoretical Grounding

| Design Decision | Theoretical Basis |
|-----------------|-------------------|
| Navigation API returns available actions | Presenting affordances for direct perception |
| Invalid actions are not shown | Restricting perceptual field to valid affordances |
| Blocked actions explain why | Ecological information about constraints |
| Opaque state tokens | Forcing situated action over abstract reasoning |
| Server computes valid actions | Environment (not agent) determines affordances |
| Agent reports completion | Effectivity actualization |

---

## References

### Technical Patterns
- [Temporal Data Conversion](https://docs.temporal.io/dataconversion)
- [Temporal Payload Codec](https://docs.temporal.io/payload-codec)
- [XState State Persistence](https://stately.ai/docs/persistence)
- [XState Transitions](https://xstate.js.org/docs/guides/transitions.html)
- [Deterministic Hierarchical FSM](https://fsm.statewalker.com/blog/2021-06-08/deterministic-hierarchical-finite-state-machine.html)
- Pattern-Oriented Software Architecture Vol. 4 (POSA4)

### Situated Cognition Theory
- Gibson, J.J. (1979). The Ecological Approach to Visual Perception
- Turvey, M.T. (1992). Affordances and Prospective Control: An Outline of the Ontology
- Robbins, P. & Aydede, M. (Eds.) (2008). The Cambridge Handbook of Situated Cognition
- Clancey, W.J. (1997). Situated Cognition: On Human Knowledge and Computer Representations
- Chemero, A. (2009). Radical Embodied Cognitive Science
