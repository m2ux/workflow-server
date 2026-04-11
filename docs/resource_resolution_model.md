# Skill & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs. 

The Workflow Server solves this via a **Lazy-Loading Resource Architecture**.

## 1. Canonical IDs and Prefix Stripping
Skills and activities are stored on disk with numerical prefixes to enforce ordered visibility for humans (e.g., `12-workflow-orchestrator.toon`). 

However, the internal resolution system uses **Canonical IDs**. The server's `filename-utils` strips the `NN-` prefix during parsing.
* File: `12-workflow-orchestrator.toon`
* Canonical ID: `workflow-orchestrator`

Agents must always request skills and activities using their Canonical IDs.

## 2. Universal Skill Fallback
Not every workflow needs to redefine standard agent behaviors (like how to act as a worker, or how to handle Git). 

When an agent calls `get_skill({ step_id: "..." })` or `get_skill()` (for the primary skill), the server implements a fallback resolution path:
1. **Local Scope:** It first looks in the current workflow's skill folder (e.g., `.engineering/workflows/work-package/skills/`).
2. **Universal Scope:** If not found locally, it automatically falls back to the `.engineering/workflows/meta/skills/` directory.

This allows workflows to inherit the standard `meta-orchestrator`, `workflow-orchestrator`, and `activity-worker` skills for free, while allowing specific workflows to override them if highly specialized behavior is required.

## 3. The `_resources` Array
Even a single `.toon` skill file can be large. To further condense context, `.toon` files do not embed large instructional blocks (like Git CLI tutorials, or Atlassian API guides) directly inside their protocol rules.

Instead, they declare a `resources` array using lightweight index references:
```yaml
resources:
  - "meta/04"
  - "meta/06"
```
When `get_skill` returns the JSON representation of the skill to the agent, it bundles these as a `_resources` array.

## 4. Lazy Loading via `get_resource`
When the agent receives its skill payload, it sees the `_resources` array. The agent's protocol explicitly instructs it to call the `get_resource` tool for each of these indices *only* if it needs that specific context.

```javascript
get_resource({ resource_index: "meta/06" })
```
The server resolves the `meta/06` reference, loads the full Markdown text from `.engineering/workflows/meta/resources/06-gitnexus-reference.md`, and returns it to the agent.

### The Benefits
- **Context Economy:** Agents only load the exact Markdown guides they need for the specific activity they are currently executing.
- **Modularity:** Guides (like how to format a PR) can be updated in a single markdown file, and dynamically pulled in by dozens of different skills across multiple workflows without duplicating the text in every `.toon` file.