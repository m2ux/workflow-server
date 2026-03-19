---
id: roadmap-template
version: 1.0.0
---

# Roadmap Template

**Purpose:** Templates and guidance for finalizing roadmap documentation.

---

## START-HERE.md Final Format

Update the START-HERE.md skeleton (created during folder-setup) with completed content:

```markdown
# {Initiative Name}

**Date:** {YYYY-MM-DD}
**Status:** Ready for Implementation
**Progress:** 0/{N} packages complete

---

## Executive Summary

[2-3 sentences describing the initiative's purpose, scope, and expected impact.
What problem does this solve? What will be different when all packages are complete?]

## Work Packages

| # | Package | Status | Priority | Effort | Dependencies | PR |
|---|---------|--------|----------|--------|-------------|-----|
| 1 | [Name] | ⬚ Planned | P1 | X-Yh | None | — |
| 2 | [Name] | ⬚ Planned | P2 | X-Yh | #1 | — |

**Status legend:** ⬚ Planned · ◧ In Progress · ✅ Complete · ⊘ Cancelled

## Timeline

| Phase | Packages | Estimated Duration |
|-------|----------|-------------------|
| Phase 1 | #1, #2 | X-Y days |
| Phase 2 | #3, #4 | X-Y days |
| **Total** | | **X-Y days** |

## Success Criteria

### Initiative-Level
- [ ] All {N} work packages complete with merged PRs
- [ ] [Domain-specific success criterion]
- [ ] [Domain-specific success criterion]

### Per-Package
Each package defines its own success criteria in its plan document.

## Documents

| Document | Purpose |
|----------|---------|
| [START-HERE.md](START-HERE.md) | Executive summary and status tracking |
| [README.md](README.md) | Navigation and document index |
| [NN-package-plan.md](NN-package-plan.md) | Individual package plans |
```

---

## README.md Final Format

Update the README.md skeleton with navigation links to all planning documents:

```markdown
# {Initiative Name} — Planning Documents

> Navigation index for all planning artifacts.

## Status

See [START-HERE.md](START-HERE.md) for current status and progress.

## Analysis

| Document | Description |
|----------|-------------|
| [0N-analysis.md](0N-analysis.md) | Completion or context analysis |

## Work Package Plans

| # | Package | Plan |
|---|---------|------|
| 1 | [Name] | [01-package-plan.md](01-package-plan.md) |
| 2 | [Name] | [02-package-plan.md](02-package-plan.md) |
```

---

## Timeline Estimation

### Approach
- Sum effort estimates from individual package plans
- Add buffer for inter-package context switching (10-20%)
- Account for dependency chains — sequential dependencies extend calendar time
- Group independent packages into parallel phases where possible

### Phases
Group packages into implementation phases:
- **Phase 1:** Foundation packages (no dependencies)
- **Phase 2:** Packages that depend on Phase 1
- **Phase 3:** Packages that depend on Phase 2

### Duration Formula
```
Phase duration = max(effort of packages in phase) + review buffer
Total duration = sum(phase durations) + inter-phase buffer
```
