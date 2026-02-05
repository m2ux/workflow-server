# Work Package Plan: Navigation-Based Workflow Engine

**Created:** 2026-01-29
**Issue:** [#34](https://github.com/m2ux/workflow-server/issues/34)
**Branch:** `feat/34-navigation-workflow-engine`

---

## Summary

Implement a navigation-based workflow engine with server-side enforcement to ensure deterministic workflow execution. The engine presents affordances (available actions) to agents, who can only perceive and act on valid options.

---

## Design Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Workflow Engine (stateless)                 │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ State Codec   │  │ Navigation    │  │ Transition      │  │
│  │ encode/decode │  │ Compute       │  │ Validator       │  │
│  └───────────────┘  └───────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ MCP Tools (4 new)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Agent                                 │
│  - Perceives affordances (available actions)                 │
│  - Cannot perceive invalid options                           │
│  - Stores opaque state token                                 │
│  - Reports action completion                                 │
└─────────────────────────────────────────────────────────────┘
```

### Theoretical Foundation

Based on **situated cognition** (Gibson, Turvey):
- **Affordances**: Action possibilities presented by the environment
- **Effectivities**: Agent capabilities that match affordances
- **Restricted perceptual field**: Agent can only perceive valid actions
- **Opaque state**: Prevents disembodied reasoning, forces situated action

### Navigation API (4 tools)

| Tool | Input | Output |
|------|-------|--------|
| `start_workflow` | workflow_id | position, actions, state |
| `get_position` | workflow_id, state | position, actions, state |
| `complete_step` | workflow_id, state, step_id, summary | position, actions, state |
| `respond_to_checkpoint` | workflow_id, state, checkpoint_id, option_id | position, actions, state |

### Response Structure (all tools)

```typescript
interface NavigationResponse {
  success: boolean;
  position: {
    workflow: string;
    activity: { id: string; name: string; };
    step?: { id: string; index: number; name: string; };
    loop?: { id: string; iteration: number; total?: number; item?: string; };
  };
  message: string;  // Human-readable situation description
  availableActions: {
    required: Action[];   // Must do before proceeding
    optional: Action[];   // Can do but not required
    blocked: BlockedAction[];  // Cannot do (with reason)
  };
  checkpoint?: {  // Present if checkpoint is active
    id: string;
    message: string;
    options: CheckpointOption[];
  };
  state: string;  // Opaque token: v1.gzB64.{payload}
}
```

### State Token Format

```
v1.gzB64.H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVR...
```

- **v1**: Schema version for migration
- **gzB64**: Encoding method (gzip + base64)
- **payload**: Compressed JSON state

---

## Implementation Tasks

### Task 1: State Codec Module
**File:** `src/navigation/state-codec.ts`

Create encode/decode functions for opaque state tokens:
- `encodeState(state: WorkflowState): string` - Serialize → Compress → Base64
- `decodeState(token: string): WorkflowState` - Base64 → Decompress → Parse
- `validateToken(token: string): boolean` - Validate format and structure
- Version prefix handling for future migrations

**Dependencies:** zlib (built-in Node.js)

### Task 2: Navigation Computation Module
**File:** `src/navigation/compute.ts`

Compute available actions from workflow definition + current state:
- `computePosition(workflow, state): Position` - Current position details
- `computeAvailableActions(workflow, state): AvailableActions` - Required/optional/blocked
- `getActiveCheckpoint(workflow, state): Checkpoint | null` - Active blocking checkpoint
- `isCheckpointBlocking(workflow, state): boolean` - Check if blocked

Logic must handle:
- Step sequencing within activities
- Loop iteration tracking
- Checkpoint blocking semantics
- Decision branch evaluation

### Task 3: State Transition Module
**File:** `src/navigation/transition.ts`

Apply state transitions and validate:
- `advanceStep(workflow, state, stepId, summary): Result<WorkflowState>` - Complete step
- `respondToCheckpoint(workflow, state, checkpointId, optionId): Result<WorkflowState>` - Record response
- `transitionActivity(workflow, state, toActivityId): Result<WorkflowState>` - Move to next activity
- Validation before each transition
- Error results for invalid transitions

### Task 4: Navigation Tools
**File:** `src/tools/navigation-tools.ts`

Implement 4 MCP tools:
- `start_workflow(workflow_id)` - Initialize and return first situation
- `get_position(workflow_id, state)` - Decode state, return current situation
- `complete_step(workflow_id, state, step_id, summary)` - Advance and return new situation
- `respond_to_checkpoint(workflow_id, state, checkpoint_id, option_id)` - Record and advance

Each tool:
1. Decodes state token
2. Validates current position
3. Applies transition (if mutating)
4. Computes new available actions
5. Encodes new state
6. Returns NavigationResponse

### Task 5: Register Navigation Tools
**File:** `src/server.ts`

Register new tools with MCP server:
- Import `registerNavigationTools`
- Call during server initialization
- Existing tools remain unchanged (backward compatible)

### Task 6: Unit Tests
**Files:** `tests/navigation/*.test.ts`

Test coverage for:
- State codec: encode/decode round-trip, version handling, corruption detection
- Navigation compute: position calculation, action computation, checkpoint detection
- Transitions: valid transitions, invalid rejection, checkpoint blocking
- Integration: full workflow traversal

### Task 7: Documentation
**File:** `docs/navigation-api.md`

Document:
- API reference for 4 new tools
- State token format specification
- Error codes and recovery
- Migration guide from schema-based execution

---

## File Structure

```
src/
├── navigation/
│   ├── index.ts           # Module exports
│   ├── state-codec.ts     # State encode/decode
│   ├── compute.ts         # Navigation computation
│   ├── transition.ts      # State transitions
│   └── types.ts           # Navigation types
├── tools/
│   ├── navigation-tools.ts  # New navigation tools
│   └── ... (existing)
└── server.ts              # Register navigation tools

tests/
├── navigation/
│   ├── state-codec.test.ts
│   ├── compute.test.ts
│   └── transition.test.ts
└── navigation-tools.test.ts
```

---

## Task Summary

| # | Task | Estimated Effort |
|---|------|------------------|
| 1 | State Codec Module | 1-2h |
| 2 | Navigation Computation Module | 2-3h |
| 3 | State Transition Module | 2-3h |
| 4 | Navigation Tools | 1-2h |
| 5 | Register Navigation Tools | 15m |
| 6 | Unit Tests | 2-3h |
| 7 | Documentation | 1h |

**Total Estimated:** 9-14h agentic + review

---

## Success Criteria

- [ ] State tokens are opaque (compressed + base64)
- [ ] `start_workflow` returns initial position and affordances
- [ ] `get_position` decodes state and returns current situation
- [ ] `complete_step` validates and advances state
- [ ] `respond_to_checkpoint` records response and unblocks
- [ ] Invalid transitions rejected with clear errors
- [ ] Checkpoints block until responded
- [ ] All existing tools continue to work
- [ ] Unit tests pass
- [ ] Documentation complete

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State token size | Large context usage | Compression reduces 60-80% |
| Version incompatibility | Cannot resume old sessions | Include version, implement migration |
| Complex loop semantics | Incorrect iteration tracking | Comprehensive test coverage |
| Breaking existing tools | Agents fail | Keep existing tools unchanged |

---

## Dependencies

- Node.js zlib (built-in) - compression
- Existing state.schema.ts - reuse WorkflowState type
- Existing workflow-loader.ts - workflow loading
