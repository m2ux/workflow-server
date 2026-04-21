# Work Packages Skills

> Part of the [Work Packages Workflow](../README.md)

## Skills (6 workflow-specific + 2 universal)

The workflow uses 6 workflow-specific skills for planning and coordination, plus 2 universal skills from `meta/skills/`.

| # | Skill ID | Capability | Used By |
|---|----------|------------|---------|
| 00 | `assess-initiative-scope` | Identify and categorize work packages from initiative description | Scope Assessment |
| 01 | `analyze-initiative-context` | Perform completion or context analysis for multi-package initiative | Analysis |
| 02 | `plan-work-package-scope` | Define scope, dependencies, effort, and success criteria per package | Package Planning |
| 03 | `prioritize-packages` | Evaluate and order packages by dependencies, value, risk, and effort | Prioritization |
| 04 | `document-roadmap` | Produce finalized roadmap documentation | Finalize Roadmap |
| 05 | `orchestrate-package-execution` | Trigger and manage work-package workflow instances | Implementation |

> Universal skills `workflow-orchestrator` and `activity-worker` are in [meta/skills/](../../meta/skills/) — they provide workflow orchestration and activity execution.

---

### Skill Protocol: `assess-initiative-scope` (00)

Decomposes a user's initiative description into distinct, independently deliverable work packages.

| Step Key | Action |
|----------|--------|
| `confirm-multi-package` | Validate this is genuinely multi-package, not a single work package |
| `identify-packages` | Parse description into distinct units of work |
| `present-scope` | Present numbered table of packages for user confirmation |

---

### Skill Protocol: `plan-work-package-scope` (02)

Plans each package during the forEach loop using the package-plan-template resource.

| Step Key | Action |
|----------|--------|
| `present-overview` | Summarize packages and planning approach |
| `define-scope` | Identify in-scope and out-of-scope items |
| `identify-dependencies` | Document hard and soft dependencies |
| `estimate-effort` | Assess complexity and estimate time ranges |
| `define-success` | Establish measurable, verifiable success criteria |
| `document-plan` | Create plan document using resource 03 template |

---

### Skill Protocol: `prioritize-packages` (03)

Evaluates packages using the prioritization-framework resource.

| Step Key | Action |
|----------|--------|
| `analyze-dependencies` | Build dependency graph, perform topological sort |
| `evaluate-criteria` | Assess value, risk, effort per package |
| `propose-order` | Apply ordering rules within dependency constraints |
| `present-prioritization` | Show graph, table, and rationale to user |
