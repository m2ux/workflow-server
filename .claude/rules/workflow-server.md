---
description: Workflow server integration for midnight-platform-eng

---

CRITICAL: Parse all rules *before* making *ANY* tool calls

# Trigger Recognition

Activate workflow execution when the user request matches ANY of these patterns:

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

For workflow execution requests, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure.
