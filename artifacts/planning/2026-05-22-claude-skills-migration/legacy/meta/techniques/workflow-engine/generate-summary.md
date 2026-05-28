# generate-summary

Compose the markdown session summary presented at workflow close.

## Inputs

- **workflow** — Workflow definition (id, title, outcomes)
- **trace** — Completed activities, checkpoint decisions, artifacts produced

## Output

- **summary_markdown** — Markdown string ready to present to the user

## Procedure

1. Compose sections: workflow id and title, start/completion timestamps, activities completed, key checkpoint decisions, artifacts with paths, outcomes satisfied vs. unmet, follow-up items.
