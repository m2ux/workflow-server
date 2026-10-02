---
name: contract-tests-fan-case-report
description: Case report for the contract-tests fan specimen.
metadata:
  version: 1.0.0
---

# Contract-Tests Fan Case Report

## Template

```markdown
# Work Package Contract-Tests Fan Cases

| Case | Fail on base | Path | Branch |
|---|---|---|---|
| 1 | yes/no | path | branch |
```

## Rules

### a-row-names-the-worktree-the-fan-wrote

Each row records whether the suite failed on the base tree, and the worktree path and branch the fan left. A row that names the path the case was designed to use, rather than the path the walk wrote, has reported the fixture as the result.
