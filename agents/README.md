# Agent Registry

The agent registry maps effectivities to sub-agent configurations for delegation.

## Registry Variants

| Variant | Description |
|---------|-------------|
| `default.toon` | Full registry with specialized agents |
| `minimal.toon` | Minimal registry with consolidated agents |

## Structure

Each registry defines:

```yaml
version: 1.0.0
description: Registry description

agents:
  agent-id:
    effectivities:      # Required: capabilities this agent has
      - effectivity-id
    model: fast         # Optional: fast, default, capable
    instructions: |     # Optional: system instructions
      Agent-specific guidance...
    tools:              # Optional: tools available
      - tool_name
    timeout: 300        # Optional: timeout in seconds
```

## Agent Lookup

When a step requires effectivities, the primary agent:

1. Loads the agent registry from `.engineering/agents/`
2. Finds an agent with the required effectivity
3. Spawns the sub-agent with the registry configuration
4. Passes the step description and context
5. Receives the result and continues navigation

## Usage

Agents checkout the registry to `.engineering/agents/`:

```bash
cd .engineering/agents
git archive --remote=origin registry agents/ | tar -x
```

Then load and query:

```typescript
const registry = await loadDefaultAgentRegistry('.engineering/agents');
const agent = findAgentForEffectivity(registry, 'code-review_rust');
if (agent) {
  // Spawn sub-agent with agent.config
}
```

## Extending

To add new agents:

1. Create or update effectivity in `effectivities/`
2. Add agent entry to `default.toon`
3. Define instructions and tools appropriate for the effectivity
