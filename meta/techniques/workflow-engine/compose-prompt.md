Substitute state variables into a prompt template resource.

## Inputs

### template_ref

Resource ref for the prompt template (e.g., [workflow-orchestrator-prompt](../../resources/workflow-orchestrator-prompt.md))

### substitutions

Map of placeholder name → value

## Output

### prompt

Composed prompt string

## Protocol

1. Load the template via `get_resource`.
2. Replace each `{placeholder}` with its substitution value.
