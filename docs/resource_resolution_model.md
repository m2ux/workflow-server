# Skill & Resource Resolution Architecture

LLM context windows are precious. Loading an entire workflow's worth of instructions, rules, and system prompts into an agent's context window on bootstrap leads to context degradation, high latency, and increased costs.

The Workflow Server solves this via a **Lazy-Loading Resource Architecture**.

## 1. Canonical IDs and Prefix Stripping

Skills and activities are stored on disk with numerical prefixes to enforce ordered visibility for humans (e.g., `10-workflow-orchestrator.toon`).

However, the internal resolution system uses **Canonical IDs**. The server's `filename-utils` strips the `NN-` prefix during parsing.
* File: `10-workflow-orchestrator.toon`
* Canonical ID: `workflow-orchestrator`

Agents must always request skills and activities using their Canonical IDs.

## 2. Universal Skill Fallback

Not every workflow needs to redefine standard agent behaviors (like how to act as a worker, or how to handle Git).

When an agent calls `get_skill({ step_id: "..." })` or `get_skill()` (for the primary skill), the server implements a fallback resolution path:
1. **Local Scope:** It first looks in the current workflow's skill folder (e.g., `workflows/work-package/skills/`).
2. **Universal Scope:** If not found locally, it automatically falls back to the `workflows/meta/skills/` directory.

This allows workflows to inherit standard meta skills for free, while allowing specific workflows to override them if highly specialized behavior is required.

## 3. Workflow-Level Primary Skill

Each workflow defines a `skills` field with a `primary` skill ID. This skill is loaded via `get_skills` and returned at the beginning of `get_workflow` responses as raw TOON content. It provides the orchestration protocol for the workflow (e.g., how to manage activities, how to dispatch workers, how to handle checkpoints).

The primary skill is distinct from step-level skills. Step-level skills are loaded individually via `get_skill(step_id)` as the worker progresses through the activity.

## 4. The `resources` Array in Skills

Even a single `.toon` skill file can be large. To further condense context, `.toon` files do not embed large instructional blocks (like Git CLI tutorials, or Atlassian API guides) directly inside their protocol rules.

Instead, they declare a `resources` array using lightweight index references:
```yaml
resources:
  - "04"
  - "meta/03"
```

When `get_skill` returns the skill to the agent, the server does not automatically bundle resource content. The skill's own protocol instructs the agent to call `get_resource` when it needs specific context.

## 5. Lazy Loading via `get_resource`

When the agent encounters a step that needs a resource, it calls the `get_resource` tool:

```javascript
get_resource({ session_token, resource_id: "meta/03" })
```

The server resolves the reference using `parseResourceRef`:
- Bare indices (e.g., `"04"`) resolve within the session's workflow
- Prefixed references (e.g., `"meta/03"`) resolve from the named workflow

The server then loads the full content from `workflows/{workflow}/resources/{NN}-{name}.md` (or `.toon`) and returns it.

### The Benefits
- **Context Economy:** Agents only load the exact Markdown guides they need for the specific activity they are currently executing.
- **Modularity:** Guides (like how to format a PR) can be updated in a single markdown file, and dynamically pulled in by dozens of different skills across multiple workflows without duplicating the text in every `.toon` file.
- **Cross-workflow sharing:** The `meta/NN` prefix allows skills in one workflow to reference resources from the `meta` workflow, enabling a shared resource library.
