---
description: Workflow server integration
---

CRITICAL: Parse all rules *before* making *ANY* tool calls.

# Trigger Recognition

Engage the workflow-server when the user request matches ANY of these patterns. The patterns activate the rule — they do NOT pre-select a workflow. Meta's `discover-session` activity is responsible for matching the request to a specific target workflow.

## Work Package
- "work package", "start work package", "review work package"
- "new feature", "bug fix", "implement", "enhancement", "refactoring"
- "create issue", "create PR", "plan implementation"

## Work Packages (multi-package)
- "roadmap", "multiple features", "work packages", "initiative"
- "plan and coordinate", "related work items"

## Code Review
- "review pr", "review PR", "PR review"
- "review this pull request", "code review"

## Prism Analysis
- "analyze", "structural analysis", "code analysis", "review code"
- "full prism", "deep analysis", "behavioral analysis"
- "evaluate", "audit code quality"

## Security Audit
- "security audit", "audit codebase", "vulnerability scan"
- "CI/CD audit", "pipeline security", "scan github actions"

## Workflow Lifecycle
- "start workflow", "resume workflow", "continue workflow"
- "where were we", "pick up where I left off"
- "finish workflow", "complete workflow"

## Workflow Design
- "create a workflow", "design a workflow", "update workflow"
- "new workflow", "modify workflow", "review workflow design"

# Bootstrap Sequence

CRITICAL: Do NOT fetch any external resources (GitHub issues, URLs, files, APIs) before completing the bootstrap sequence. The meta workflow's activities define how those resources are accessed; fetching them first violates rule order and may cause tool call failures.

For workflow execution requests, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. The protocol returned by `discover` is a single path — there is no separate START / RESUME branching:

1. Load the five TOON schemas.
2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`.
3. `get_workflow({ session_token })` to load the meta workflow definition and its primary skill.
4. Follow the primary skill's rules and the meta workflow's activities.

Meta's first activity (`discover-session`) calls `list_workflows`, matches the user's request against the catalog, scans `.engineering/artifacts/planning/` for saved client sessions, and presents resume / workflow-selection checkpoints. **Do NOT attempt to identify the target workflow yourself, scan planning folders directly, or read `workflow-state.toon` outside of `restore_state` — meta's activities own all of that.**

# Existing-Session Escape Hatch

If the user provides a `session_token`, explicit bootstrap instructions, or asks you to call a specific tool like `next_activity` directly, follow those instructions — the session is already active and `start_session` must not be called again without passing the existing token.
