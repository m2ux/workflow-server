# Implementation Analysis: Skill Restructuring

**Work Package:** #36 - Ecological Navigation API  
**Activity:** Implementation Analysis  
**Date:** 2026-01-30

---

## Executive Summary

This analysis examines the current skill definitions in workflow-server to classify them as:
1. **Engine-Subsumed**: Skills that should be absorbed into the navigation engine
2. **Agent Effectivities**: Domain capabilities that agents possess independent of workflow

---

## 1. Current Skill Inventory

### 1.1 Meta Skills (Workflow Management)

| Skill ID | Version | Capability | Location |
|----------|---------|------------|----------|
| `activity-resolution` | 1.1.0 | Resolve user goals to activities | `meta/skills/` |
| `workflow-execution` | 3.0.0 | Execute workflows from start to completion | `meta/skills/` |
| `state-management` | 2.0.0 | Manage workflow execution state | `meta/skills/` |
| `artifact-management` | 1.0.0 | Initialize and manage planning artifacts folder | `meta/skills/` |

### 1.2 Domain Skills (Work-Package Specific)

| Skill ID | Version | Capability | Location |
|----------|---------|------------|----------|
| `code-review` | 1.0.0 | Rust/Substrate code review | `work-package/skills/` |
| `test-review` | 1.0.0 | Test suite quality review | `work-package/skills/` |
| `pr-review-response` | 1.0.0 | Analyze and respond to PR comments | `work-package/skills/` |

---

## 2. Classification Analysis

### 2.1 Engine-Subsumed Skills

These skills describe workflow navigation and state management that the navigation engine now handles deterministically.

#### `activity-resolution` → **SUBSUME**

**Current Function:**
- Resolve user goals to activities
- Match goals using `quick_match` patterns
- Load activities and their primary skills

**Why Subsume:**
- `start-workflow` now initiates workflows directly
- `resume-workflow` provides available actions (activities become navigation targets)
- User goal matching can remain as agent-side interpretation, but activity resolution is engine-computed

**Navigation Engine Replacement:**
- `start-workflow(workflow_id)` replaces `get_activities` + `get_activity`
- Engine computes available transitions (activities) automatically

---

#### `workflow-execution` → **SUBSUME**

**Current Function:**
- Execute workflows with tool calling patterns
- Track state through activities and steps
- Handle checkpoints, decisions, loops, transitions

**Why Subsume:**
- Navigation API (`start-workflow`, `resume-workflow`, `advance-workflow`, `end-workflow`) handles all execution
- State is managed via opaque token, not agent-maintained
- Engine enforces transitions, blocking checkpoints, loop advancement

**Navigation Engine Replacement:**
- Entire skill replaced by navigation tools
- Agent follows `availableActions` rather than interpreting workflow structure

---

#### `state-management` → **SUBSUME**

**Current Function:**
- Define state schema
- Describe state initialization and update patterns
- Document history event types

**Why Subsume:**
- State codec (`encodeState`, `decodeState`) handles all state management
- Agent receives opaque token, cannot interpret or modify state directly
- Engine maintains state integrity through pure functions

**Navigation Engine Replacement:**
- `state-codec.ts` replaces all state handling
- Schema exists in `state.schema.ts`, enforced by engine

---

#### `artifact-management` → **PARTIAL SUBSUME / EFFECTIVITY**

**Current Function:**
- Create planning artifact folders
- Define folder naming patterns
- Track `planning_folder_path` in context

**Analysis:**
This skill is a hybrid case:
- **Folder creation pattern** is workflow-agnostic (effectivity)
- **Folder path tracking** could be in workflow variables (engine)
- **Initiative name derivation** is agent interpretation (effectivity)

**Recommendation:**
- Keep as effectivity with simplified scope
- Folder path tracking moves to workflow variables (set by engine)
- Agent uses effectivity for the actual file operations

---

### 2.2 Agent Effectivities

These skills represent domain capabilities independent of workflow structure.

#### `code-review` → **EFFECTIVITY**

**Capability:** Perform comprehensive Rust/Substrate code review

**Why Effectivity:**
- Domain skill, not workflow navigation
- Agent applies this capability when workflow step requires "code-review" effectivity
- Workflow-agnostic: could be used in any workflow with code review steps

**Effectivity Definition:**
```toml
[effectivity.code-review]
id = "code-review"
name = "Code Review"
description = "Comprehensive code review following language-specific patterns"
applicability = { project_types = ["rust", "rust-substrate", "typescript"] }
requires_resource = "code-review"  # Load from workflow resources
```

---

#### `test-review` → **EFFECTIVITY**

**Capability:** Review test suite quality, coverage, and anti-patterns

**Why Effectivity:**
- Domain skill, not workflow navigation
- Applicable when workflow step requires "test-review" effectivity
- Reusable across any workflow with testing validation

**Effectivity Definition:**
```toml
[effectivity.test-review]
id = "test-review"
name = "Test Review"
description = "Test suite quality assessment and gap analysis"
requires_resource = "test-review"
```

---

#### `pr-review-response` → **EFFECTIVITY**

**Capability:** Analyze and respond to PR review comments

**Why Effectivity:**
- Domain skill for handling external feedback
- Applicable when workflow step involves PR review response
- Reusable in any PR-based workflow

**Effectivity Definition:**
```toml
[effectivity.pr-review-response]
id = "pr-review-response"
name = "PR Review Response"
description = "Systematic analysis and response to PR feedback"
requires_resource = "pr-review-response"
```

---

## 3. Classification Summary

| Skill | Classification | Action |
|-------|---------------|--------|
| `activity-resolution` | **Engine-Subsumed** | Remove; navigation API provides this |
| `workflow-execution` | **Engine-Subsumed** | Remove; navigation API replaces entirely |
| `state-management` | **Engine-Subsumed** | Remove; state codec handles this |
| `artifact-management` | **Hybrid** | Simplify to effectivity for file ops; path tracking to engine |
| `code-review` | **Effectivity** | Keep as agent capability |
| `test-review` | **Effectivity** | Keep as agent capability |
| `pr-review-response` | **Effectivity** | Keep as agent capability |

---

## 4. Effectivity Schema Proposal

Based on the analysis, effectivities should be defined with:

```toml
[effectivity]
id = "string"           # Unique identifier
name = "string"         # Human-readable name
description = "string"  # What this capability does
version = "semver"      # Version tracking

[effectivity.applicability]
project_types = ["list"]           # Optional: which project types
languages = ["list"]               # Optional: which languages
requires_tools = ["list"]          # Optional: which tools agent needs

[effectivity.execution]
requires_resource = "resource-id"  # Optional: load workflow resource
flow = ["step1", "step2", ...]     # Execution pattern
tools = { ... }                    # Tool usage guidance

[effectivity.state]
track = ["var1", "var2"]           # Variables to track
```

---

## 5. Navigation Response Enhancement

The navigation response should include required effectivities for each action:

```typescript
interface Action {
  type: 'step' | 'transition' | 'loop';
  id: string;
  description: string;
  // NEW: Required effectivities
  effectivities?: string[];  // e.g., ["code-review", "test-review"]
}
```

When an action requires effectivities the agent doesn't have, it can:
1. **Delegate** to a sub-agent with that effectivity
2. **Skip** if the step is optional
3. **Block** if required and no capable agent available

---

## 6. Impact on Existing Workflows

### 6.1 Activities with Skills References

Current activities reference skills via `skills.primary`:

```toml
[skills]
primary = "code-review"
```

**Change Required:**
- Rename to `effectivities.required`
- Engine includes these in action response
- Agent matches against its effectivity registry

### 6.2 Step-Level Effectivities

Some steps implicitly require effectivities:

```toml
[[steps]]
id = "comprehensive-code-review"
name = "Comprehensive code review"
description = "Review all implementation changes..."
```

**Change Required:**
- Add explicit `effectivities` field:

```toml
[[steps]]
id = "comprehensive-code-review"
name = "Comprehensive code review"
description = "Review all implementation changes..."
effectivities = ["code-review"]
```

---

## 7. Next Steps

1. **Define effectivity schema** in `src/schema/effectivity.schema.ts`
2. **Create effectivity loader** to load effectivity definitions
3. **Modify activity schema** to include `effectivities` field on steps
4. **Enhance navigation response** to include required effectivities
5. **Design effectivity registry** format for agent consumption
6. **Define delegation protocol** for sub-agent spawning

---

## 8. Design Decisions

The following decisions were made through discussion:

### 8.1 Effectivity Location

**Decision:** Repo root at `effectivities/`

**Rationale:** Effectivities are workflow-agnostic agent capabilities. Placing them at repo root emphasizes their independence from specific workflows and provides cleaner separation.

### 8.2 Inheritance Model

**Decision:** Composition model via `includes` field, with `_` delimiter for extensions.

**Naming Convention:**
- Base names use `-` (e.g., `code-review`, `test-review`)
- Extensions use `_` delimiter (e.g., `code-review_rust`, `code-review_rust_substrate`)

**Example:**
```toml
# effectivities/code-review_rust_substrate.toml
id = "code-review_rust_substrate"
includes = ["code-review_rust"]
# ... additional Substrate-specific content
```

This allows easy parsing: `code-review_rust_substrate` → includes `code-review_rust` → includes `code-review`

### 8.3 Effectivity Matching

**Decision:** Exact match required.

If agent lacks the exact effectivity, it must delegate to a sub-agent that has it. This enforces capability correctness and prevents suboptimal results from fallback matching.

### 8.4 Sub-Agent Spawning

**Decision:** Separate agent registry (`agents.toml`) maps effectivities to agent configurations.

**Rationale:** Decouples effectivity definitions from agent configs, allowing:
- Different registries for different deployment contexts
- Effectivities to be reused across different agent configurations
- Clean separation of concerns

**Storage Model:**
- **Server repo:** `workflow-server/agents/` - authoritative source
- **Agent side:** `.engineering/agents/` - local checkout that agents read from

This mirrors the existing pattern for engineering resources. Agents read from their local checkout, not via MCP tools.

**Registry Structure:**
```toml
# agents/default.toml (or agents/{variant}.toml for multiple variants)

[agents.code-reviewer]
effectivities = ["code-review_rust", "code-review_rust_substrate"]
model = "fast"
instructions = "Perform code review following Rust/Substrate patterns"
tools = ["read_file", "grep", "get_resource"]

[agents.test-reviewer]
effectivities = ["test-review"]
model = "fast"
instructions = "Review test quality and coverage"
tools = ["shell", "read_file", "grep"]
```

**Variant Examples:**
- `agents/default.toml` - Full agent registry with all effectivities
- `agents/minimal.toml` - Minimal variant for simple workflows
- `agents/rust-only.toml` - Rust-specific agents only

---

## References

- [theoretical-research.md](theoretical-research.md) - Theoretical framework
- Navigation API implementation (PR #35)
- Current skill definitions in `workflows/meta/skills/` and `workflows/work-package/skills/`
