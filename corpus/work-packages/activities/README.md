# Work Packages — Activities

Sequential activity chain for planning and coordinating multiple related work packages. Each row links to the authoritative activity definition (steps, checkpoints, loops, and transitions live in the YAML).

| # | Activity | Role |
|---|----------|------|
| 01 | **[Scope Assessment](01-scope-assessment.yaml)** | Confirm multi-package initiative and identify work packages |
| 02 | **[Folder Setup](02-folder-setup.yaml)** | Create planning folder structure with documentation skeletons |
| 03 | **[Analysis](03-analysis.yaml)** | Completion or context analysis depending on initiative type |
| 04 | **[Package Planning](04-package-planning.yaml)** | Define scope, dependencies, effort, and success criteria per package |
| 05 | **[Prioritization](05-prioritization.yaml)** | Prioritize packages by dependencies, value, risk, and effort |
| 06 | **[Finalize Roadmap](06-finalize-roadmap.yaml)** | Complete roadmap documentation with timeline and success criteria |
| 07 | **[Implementation](07-implementation.yaml)** | Execute each package in priority order via the work-package workflow |

## Flow

```
scope-assessment → folder-setup → analysis → package-planning → prioritization → finalize-roadmap → implementation
```

The implementation activity triggers the `work-package` workflow for each planned package in priority order.
