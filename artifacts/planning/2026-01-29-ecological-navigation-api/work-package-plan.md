# Work Package Plan: Ecological Navigation API

**Work Package:** #36 - Ecological Navigation API  
**Date:** 2026-01-30  
**Branch:** `feat/36-ecological-navigation-api`  
**Parent:** `feat/34-navigation-workflow-engine`

---

## Design Summary

**Problem:** The navigation API (PR #35) validated that server-driven workflow execution improves fidelity, but the situated cognition research was applied post-hoc rather than genuinely shaping the design. The current skills are a mix of workflow execution logic (which should be engine-subsumed) and domain capabilities (which should be agent effectivities).

**Approach:** Restructure the system to genuinely reflect distributed cognition principles:
1. Subsume workflow execution skills into the navigation engine
2. Define remaining skills as workflow-agnostic effectivities
3. Create an effectivity registry for sub-agent delegation
4. Enhance navigation responses with effectivity requirements

**Key Design Decisions:**

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Distributed cognition as primary framework | Explicitly addresses tool-mediated cognition; more applicable than pure ecological psychology |
| 2 | Effectivities at repo root (`effectivities/`) | Workflow-agnostic; cleaner separation |
| 3 | Composition model with `_` delimiter | Allows inheritance chains (e.g., `code-review_rust_substrate`) |
| 4 | Exact effectivity matching required | Enforces capability correctness; delegate if missing |
| 5 | Separate agent registry (`agents/`) | Decouples effectivity definitions from agent configs |
| 6 | Agent registry in server repo, consumed locally | Stored at `workflow-server/agents/`, checked out to `.engineering/agents/` |

**Trade-offs:**

| Pro | Con |
|-----|-----|
| Genuine theoretical grounding | Additional complexity in schema and loaders |
| Clean separation of concerns | Migration effort for existing skills |
| Enables sub-agent delegation | Requires agent-side registry consumption logic |
| Exact matching ensures quality | Less flexible than fallback matching |

---

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Server                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Effectivities  │  │     Agents      │                   │
│  │  (definitions)  │  │   (registry)    │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                            │
│  ┌────────▼────────────────────▼────────┐                   │
│  │         Effectivity Loader           │                   │
│  └────────────────┬─────────────────────┘                   │
│                   │                                         │
│  ┌────────────────▼─────────────────────┐                   │
│  │        Navigation Engine             │                   │
│  │  ┌─────────────┐ ┌─────────────────┐ │                   │
│  │  │ State Codec │ │ Compute/Transit │ │                   │
│  │  └─────────────┘ └─────────────────┘ │                   │
│  └────────────────┬─────────────────────┘                   │
│                   │                                         │
│  ┌────────────────▼─────────────────────┐                   │
│  │         Navigation Tools             │                   │
│  │  start-workflow, resume-workflow,    │                   │
│  │  advance-workflow, end-workflow      │                   │
│  └────────────────┬─────────────────────┘                   │
└───────────────────┼─────────────────────────────────────────┘
                    │ MCP
┌───────────────────▼─────────────────────────────────────────┐
│                    Primary Agent                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Local Registry  │  │ Effectivity     │                   │
│  │ (.engineering/) │  │ Matcher         │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                            │
│  ┌────────▼────────────────────▼────────┐                   │
│  │        Sub-Agent Spawner             │                   │
│  └────────────────┬─────────────────────┘                   │
│                   │                                         │
│  ┌────────────────▼─────────────────────┐                   │
│  │         Sub-Agents                   │                   │
│  │  (code-reviewer, test-reviewer, ...) │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **start-workflow/resume-workflow** returns available actions with `effectivities` field
2. Primary agent checks local registry for matching agents
3. If exact match found → delegate to sub-agent
4. Sub-agent executes task and returns result
5. Primary agent calls **advance-workflow** to complete step

---

## Repository Structure

### `main` branch (Server Code)

```
workflow-server/
├── src/
│   ├── schema/
│   │   ├── effectivity.schema.ts    # NEW: Effectivity schema
│   │   └── agent.schema.ts          # NEW: Agent registry schema
│   ├── loaders/
│   │   ├── effectivity-loader.ts    # NEW: Load effectivity definitions
│   │   └── agent-loader.ts          # NEW: Load agent registry
│   ├── navigation/
│   │   ├── compute.ts               # MODIFY: Include effectivities in actions
│   │   └── types.ts                 # MODIFY: Add effectivities to Action type
│   └── tools/
│       ├── navigation-tools.ts      # MODIFY: Include effectivities in response
│       └── effectivity-tools.ts     # NEW: MCP tools for effectivity queries
└── tests/
    ├── effectivity-loader.test.ts   # NEW
    ├── agent-loader.test.ts         # NEW
    └── navigation/
        └── effectivities.test.ts    # NEW
```

### `registry` branch (Data)

```
workflow-server/
├── agents/                          # NEW: Agent registry
│   ├── default.toml                 # Full agent configurations
│   ├── minimal.toml                 # Minimal variant
│   └── README.md                    # Registry documentation
├── effectivities/                   # NEW: Effectivity definitions
│   ├── code-review.toml
│   ├── code-review_rust.toml
│   ├── code-review_rust_substrate.toml
│   ├── test-review.toml
│   ├── pr-review-response.toml
│   └── README.md                    # Effectivity documentation
├── skills/                          # MAINTAINED: Agent-side skills
│   ├── code-review.toon             # Moved from workflows/work-package/skills/
│   ├── test-review.toon
│   ├── pr-review-response.toon
│   └── README.md                    # Skills documentation
└── workflows/
    ├── meta/
    │   └── skills/                  # MIGRATE: Move to /skills/
    └── work-package/
        ├── activities/              # MODIFY: Add effectivities to steps
        └── skills/                  # MIGRATE: Move to /skills/
```

---

## Implementation Tasks

### Phase 1: Schema & Loaders

| # | Task | Description | Files |
|---|------|-------------|-------|
| 1.1 | Define effectivity schema | Zod schema for effectivity definitions | `src/schema/effectivity.schema.ts` |
| 1.2 | Define agent registry schema | Zod schema for agent configurations | `src/schema/agent.schema.ts` |
| 1.3 | Implement effectivity loader | Load and resolve effectivity includes | `src/loaders/effectivity-loader.ts` |
| 1.4 | Implement agent loader | Load agent registry variants | `src/loaders/agent-loader.ts` |
| 1.5 | Unit tests for loaders | Test loading, includes resolution | `tests/effectivity-loader.test.ts`, `tests/agent-loader.test.ts` |

### Phase 2: Effectivity Definitions

> **Branch:** These files go on `feat/36-registry-effectivities` (to be merged into `registry`)

| # | Task | Description | Files |
|---|------|-------------|-------|
| 2.1 | Create base effectivities | `code-review`, `test-review`, `pr-review-response` | `effectivities/*.toml` |
| 2.2 | Create extended effectivities | `code-review_rust`, `code-review_rust_substrate` | `effectivities/*.toml` |
| 2.3 | Create default agent registry | Map effectivities to agent configurations | `agents/default.toml` |
| 2.4 | Documentation | README files for effectivities and agents | `effectivities/README.md`, `agents/README.md` |

### Phase 3: Navigation Enhancement

| # | Task | Description | Files |
|---|------|-------------|-------|
| 3.1 | Add effectivities to Action type | Extend types with effectivities field | `src/navigation/types.ts` |
| 3.2 | Modify activity schema | Add effectivities field to steps | `src/schema/activity.schema.ts` |
| 3.3 | Update compute functions | Include effectivities in available actions | `src/navigation/compute.ts` |
| 3.4 | Update navigation tools | Include effectivities in response | `src/tools/navigation-tools.ts` |
| 3.5 | Integration tests | Test effectivities in navigation flow | `tests/navigation/effectivities.test.ts` |

### Phase 4: MCP Tools (Optional)

| # | Task | Description | Files |
|---|------|-------------|-------|
| 4.1 | Effectivity query tools | `list_effectivities`, `get_effectivity` | `src/tools/effectivity-tools.ts` |
| 4.2 | Register tools | Add to server registration | `src/server.ts` |

### Phase 5: Workflow Updates

> **Branching Strategy:** The `registry` branch is treated as `main` for data content. All registry modifications must be made on a feature branch and merged into `registry`.

| # | Task | Description | Branch | Files |
|---|------|-------------|--------|-------|
| 5.1 | Create registry feature branch | Branch from `registry` for data changes | `feat/36-registry-effectivities` | N/A |
| 5.2 | Create top-level skills folder | Move skills to `/skills/` | `feat/36-registry-effectivities` | `skills/` |
| 5.3 | Migrate meta skills | Move from `workflows/meta/skills/` to `/skills/` | `feat/36-registry-effectivities` | `skills/*.toon` |
| 5.4 | Migrate work-package skills | Move from `workflows/work-package/skills/` to `/skills/` | `feat/36-registry-effectivities` | `skills/*.toon` |
| 5.5 | Update work-package activities | Add effectivities to steps | `feat/36-registry-effectivities` | `workflows/work-package/activities/*.toon` |
| 5.6 | Create PR to registry | Merge changes into `registry` branch | PR to `registry` | N/A |

### Phase 6: Documentation & Validation

| # | Task | Description | Files |
|---|------|-------------|-------|
| 6.1 | Update API reference | Document effectivity fields in navigation response | `docs/api-reference.md` |
| 6.2 | E2E tests | Test complete workflow with effectivities | `tests/navigation/e2e.test.ts` |
| 6.3 | Update START-HERE | Mark work package complete | Planning folder |

---

## Success Criteria

- [ ] Effectivity schema defined and validated
- [ ] Agent registry schema defined and validated
- [ ] Loaders implemented with includes resolution
- [ ] 3 base effectivities created (`code-review`, `test-review`, `pr-review-response`)
- [ ] 2 extended effectivities created (`code-review_rust`, `code-review_rust_substrate`)
- [ ] Default agent registry created
- [ ] Navigation response includes effectivities for actions
- [ ] At least one activity updated with step-level effectivities
- [ ] All tests passing
- [ ] API documentation updated

---

## Dependencies

- PR #35 (Navigation Workflow Engine) - Must be merged first
- Current branch `feat/36-ecological-navigation-api` is based on `feat/34-navigation-workflow-engine`

## Branching Strategy

```
main                          # Server code (src/, tests/, docs/)
├── feat/36-ecological-...    # This work package (server changes)
│
registry                      # Data: workflows, effectivities, agents
├── feat/36-registry-...      # Registry changes for this work package
```

- **Server code** (schemas, loaders, tools): Develop on `feat/36-ecological-navigation-api`, merge to `main`
- **Registry data** (workflows, effectivities, agents): Develop on `feat/36-registry-effectivities`, merge to `registry`
- **Effectivities folder** (`effectivities/`): On `registry` branch
- **Agents folder** (`agents/`): On `registry` branch (checked out to `.engineering/agents/` by agents)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema complexity | Medium | Start with minimal required fields; extend later |
| Includes resolution cycles | Medium | Add cycle detection in loader |
| Activity migration scope | Low | Phase 5 is optional; can migrate incrementally |
| Agent-side consumption | Low | Out of scope; document expected behavior |

---

## Out of Scope

- Sub-agent spawning protocol implementation → See [Issue #37](https://github.com/m2ux/workflow-server/issues/37)
- Full migration of all activities to use effectivities (incremental)
- Effectivity inheritance beyond composition (future enhancement)

---

## Agent Delegation Guidance

> **Note:** This section provides interim guidance for agents handling effectivities. A formal delegation protocol will be defined in Issue #37.

### When Navigation Response Includes Effectivities

When `resume-workflow` or `start-workflow` returns an action with `effectivities[]`:

1. **Check Own Capabilities**: Does the primary agent possess the required effectivity?
2. **If Yes**: Execute the step directly using the effectivity's execution pattern
3. **If No**: Delegate to a sub-agent

### Delegation Flow (Interim)

```
Primary Agent                          Sub-Agent
     │                                      │
     │  1. Load .engineering/agents/*.toml  │
     │  2. Find agent with effectivity      │
     │  3. Spawn sub-agent with:            │
     │     - model (from registry)          │
     │     - instructions (from registry)   │
     │     - tools (from registry)          │
     │     - task: step description         │
     │     - context: relevant workflow vars│
     │                                      │
     ├─────────────────────────────────────►│
     │                                      │  4. Execute task
     │                                      │  5. Return result
     │◄─────────────────────────────────────┤
     │                                      │
     │  6. Process result                   │
     │  7. Call advance-workflow to advance  │
     │                                      │
```

### Matching Rules (Interim)

- **Exact match**: Required effectivity must be in agent's `effectivities[]`
- **First match wins**: If multiple agents match, use first in registry
- **All required**: If step has multiple effectivities, agent must have ALL

### Failure Handling (Interim)

- **No matching agent**: Block and report to user
- **Sub-agent fails**: Retry once, then escalate to user
- **Timeout**: Use reasonable default (e.g., 5 minutes per step)

### Example Registry Lookup

```toml
# .engineering/agents/default.toml

[agents.code-reviewer]
effectivities = ["code-review", "code-review_rust", "code-review_rust_substrate"]
model = "fast"
instructions = "Perform code review following Rust/Substrate patterns"
tools = ["read_file", "grep", "get_resource"]
```

If step requires `code-review_rust`, match to `code-reviewer` agent.
