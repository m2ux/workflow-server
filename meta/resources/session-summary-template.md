---
name: session-summary-template
description: Skeleton for the markdown session summary composed at workflow close.
---

# Session Summary

Composed by [`workflow-engine::generate-summary`](../techniques/workflow-engine/generate-summary.md)
from the `workflow` definition (id, title, outcomes) and the run `trace` (completed
activities, checkpoint decisions, artifacts produced), then presented to the user.

## Session Summary Template

```markdown
# {workflow_title} — Session Summary

- **Workflow:** `{workflow_id}`
- **Started:** {start_timestamp}
- **Completed:** {completion_timestamp}

## Activities Completed

- {activity_id} — {one-line result}
- ...

## Key Checkpoint Decisions

- {checkpoint_id}: {decision taken and rationale}
- ...

## Artifacts Produced

| Artifact | Path |
|----------|------|
| {artifact_name} | `{absolute_or_repo_relative_path}` |

## Outcomes

- **Satisfied:** {outcome} — {evidence}
- **Unmet:** {outcome} — {why, if applicable}

## Follow-up Items

- {open task or recommendation}
- ...
```

**What good looks like:** every declared workflow outcome appears under Satisfied or
Unmet (none silently dropped); each produced artifact is listed with a resolvable path;
checkpoint decisions name the choice actually taken. Omit the Follow-up Items section
when there are none rather than leaving an empty heading.
