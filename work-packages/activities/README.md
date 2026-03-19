# Work Packages — Activities

Sequential activity chain for planning and coordinating multiple related work packages.

| # | Activity | Primary Skill | Description |
|---|----------|---------------|-------------|
| 01 | **Scope Assessment** | `assess-initiative-scope` | Confirm multi-package initiative and identify work packages |
| 02 | **Folder Setup** | `workflow-execution` | Create planning folder structure with documentation skeletons |
| 03 | **Analysis** | `analyze-initiative-context` | Completion or context analysis depending on initiative type |
| 04 | **Package Planning** | `plan-work-package-scope` | Define scope, dependencies, effort, and success criteria per package |
| 05 | **Prioritization** | `prioritize-packages` | Prioritize packages by dependencies, value, risk, and effort |
| 06 | **Finalize Roadmap** | `document-roadmap` | Complete roadmap documentation with timeline and success criteria |
| 07 | **Implementation** | `orchestrate-package-execution` | Execute each package in priority order via the work-package workflow |

## Flow

```
scope-assessment → folder-setup → analysis → package-planning → prioritization → finalize-roadmap → implementation
```

The implementation activity triggers the `work-package` workflow for each planned package in priority order.
