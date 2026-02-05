# Implementation Analysis: Navigation-Based Workflow Engine

**Created:** 2026-01-29
**Issue:** [#34](https://github.com/m2ux/workflow-server/issues/34)

---

## Current Architecture

### Project Structure

```
src/
├── index.ts           # Entry point, MCP server startup
├── server.ts          # MCP server creation
├── config.ts          # Configuration loading
├── loaders/           # Data loaders
│   ├── workflow-loader.ts   # Load workflows, validate transitions
│   ├── activity-loader.ts   # Load activities
│   ├── skill-loader.ts      # Load skills
│   ├── resource-loader.ts   # Load resources
│   └── rules-loader.ts      # Load rules
├── tools/             # MCP tool definitions
│   ├── workflow-tools.ts    # 6 workflow tools
│   └── resource-tools.ts    # 9 resource tools
├── schema/            # Zod schemas
│   ├── workflow.schema.ts   # Workflow definition schema
│   ├── activity.schema.ts   # Activity definition schema
│   ├── state.schema.ts      # ← State schema EXISTS
│   └── condition.schema.ts  # Condition evaluation schema
└── types/             # Type exports
```

### Current Tools (15 total)

| Category | Tool | Purpose |
|----------|------|---------|
| Workflow | `list_workflows` | List available workflows |
| Workflow | `get_workflow` | Get complete workflow definition |
| Workflow | `validate_transition` | Check if transition is valid |
| Workflow | `get_workflow_activity` | Get activity details |
| Workflow | `get_checkpoint` | Get checkpoint details |
| Workflow | `health_check` | Server health status |
| Resource | `get_activities` | Get activity index (entry point) |
| Resource | `get_activity` | Get specific activity |
| Resource | `get_rules` | Get global agent rules |
| Resource | `get_skills` | Get skill index |
| Resource | `list_skills` | List available skills |
| Resource | `get_skill` | Get specific skill |
| Resource | `list_workflow_resources` | List workflow resources |
| Resource | `get_resource` | Get specific resource |
| Resource | `discover_resources` | Discover all resources |

---

## Key Findings

### Finding 1: State Schema Exists But Is Not Used

The `state.schema.ts` defines a complete `WorkflowState` type:

```typescript
WorkflowState {
  workflowId: string
  workflowVersion: string
  stateVersion: number
  currentActivity: string
  currentStep?: number
  completedActivities: string[]
  completedSteps: Record<string, number[]>
  checkpointResponses: Record<string, CheckpointResponse>
  decisionOutcomes: Record<string, DecisionOutcome>
  activeLoops: LoopState[]
  variables: Record<string, unknown>
  history: HistoryEntry[]
  status: 'running' | 'paused' | 'suspended' | 'completed' | 'aborted' | 'error'
}
```

**Helper functions exist:**
- `createInitialState()` - Create initial workflow state
- `validateState()` - Validate state structure
- `addHistoryEvent()` - Add history entry

**Gap:** No tools accept or return state. The state schema is defined but unused.

### Finding 2: Transition Validation Is Advisory Only

`validateTransition()` in `workflow-loader.ts`:

```typescript
function validateTransition(workflow, fromActivityId, toActivityId) {
  // Returns { valid: boolean, reason?: string }
  // Agent can ignore the result
}
```

**Gap:** Validation is informational. There's no enforcement mechanism.

### Finding 3: All Tools Are Stateless Reads

Current tools return workflow definitions and resources. None:
- Accept state as input
- Return updated state
- Track position
- Enforce checkpoints

**Gap:** Agent is responsible for all state management and schema interpretation.

### Finding 4: No Navigation Computation

There's no function that computes "what actions are available from this state."

**Gap:** Agent must interpret activity definitions to determine valid actions.

---

## Baseline Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Tools accepting state | 0 | 5+ | Count of tools with state parameter |
| State management | Agent-interpreted | Engine-computed | Architecture review |
| Checkpoint enforcement | None | Blocking | Cannot proceed without response |
| Transition validation | Advisory | Enforced | Invalid transitions rejected |
| Loop enforcement | None | Sequential | Batching impossible |
| Navigation computation | None | Available | Engine computes valid actions |

---

## Gaps to Address

### Gap 1: State Encoding Module
**Current:** State schema defined but not serialized
**Needed:** Compress + Base64 encode state for opaque transport

### Gap 2: Navigation Computation Module  
**Current:** None
**Needed:** `computeAvailableActions(workflow, state) → { required, optional, blocked }`

### Gap 3: Navigation API Tools
**Current:** Only schema-retrieval tools
**Needed:** 
- `start_workflow` - Initialize and return first position
- `navigate` - Accept action, return new position
- `get_position` - Return current position from state
- `respond_to_checkpoint` - Record response, advance state

### Gap 4: Enforcement Logic
**Current:** Advisory only
**Needed:** Reject invalid actions, block at checkpoints

---

## Integration Points

### Files to Modify

| File | Changes |
|------|---------|
| `src/tools/workflow-tools.ts` | Add navigation tools |
| `src/loaders/workflow-loader.ts` | Add navigation computation |
| `src/schema/state.schema.ts` | Already complete - reuse |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/navigation/index.ts` | Navigation module exports |
| `src/navigation/state-codec.ts` | State encode/decode (gzip + base64) |
| `src/navigation/compute.ts` | Compute available actions |
| `src/navigation/navigate.ts` | State transition logic |

---

## Success Criteria

- [ ] State tokens are opaque (not human-readable)
- [ ] Checkpoints block until response received
- [ ] Invalid transitions are rejected with errors
- [ ] Loop iterations are enforced sequentially
- [ ] Agent receives available actions, not raw schemas
- [ ] Existing tools continue to work (backward compatibility)

---

## Next Steps

1. **Plan-Prepare** - Create detailed implementation plan with tasks
2. **Implement** - Build navigation module
3. **Validate** - Test enforcement behavior
4. **Document** - Update API documentation
