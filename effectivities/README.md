# Effectivities

Effectivities define agent capabilities that can be matched against step requirements for delegation decisions.

## Naming Convention

Effectivity IDs use a hierarchical naming scheme:
- **Base**: `code-review` - general capability
- **Extended**: `code-review_rust` - language-specific extension
- **Further Extended**: `code-review_rust_substrate` - framework-specific extension

The `_` delimiter separates extensions. Extensions inherit from their parent via the `includes` field.

## Matching Rules

**Exact match is required.** If a step requires `code-review_rust`, an agent with only `code-review` cannot perform it. The primary agent must delegate to an agent with the exact effectivity.

## Structure

Each effectivity file defines:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (must match filename) |
| `name` | Human-readable name |
| `version` | Semantic version |
| `description` | What this capability enables |
| `includes` | Parent effectivities inherited |
| `applicability` | When this effectivity applies |
| `execution` | How to execute (resource, flow, tools) |
| `state` | Variables to track |
| `errors` | Error handling patterns |

## Available Effectivities

| ID | Description |
|----|-------------|
| `code-review` | General code review |
| `code-review_rust` | Rust-specific code review |
| `code-review_rust_substrate` | Substrate framework review |
| `test-review` | Test suite quality assessment |
| `pr-review-response` | PR comment analysis and response |

## Usage

Steps can declare required effectivities:

```yaml
steps:
  - id: review-code
    name: Review Code
    effectivities:
      - code-review_rust
```

When the navigation engine presents this step, the `effectivities` field tells the primary agent which sub-agent capability is needed.
