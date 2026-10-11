---
name: investigation-plan
description: Creation guide for bare filename `investigation-plan.md` — the reviewable plan the user approves before probing starts, carrying the derived areas, their planned probes, the failure-class discharge, and coverage against the change surface.
metadata:
  order: 9
---

# Investigation Plan Guide

Creation guide for bare filename `investigation-plan.md`. The document a reader approves before any probe runs, so it has to show three things at a glance: which areas the change touches, what will be probed in each, and that nothing in the change surface was left unassigned. Amended in place when the plan changes rather than written again.

## Template

```markdown
# Investigation Plan — {target identity}

**Areas:** {n} · **Probes planned:** {n} · **Budget per area:** {n}

| Area | Subsystems | Changed files | Probes |
|------|------------|---------------|--------|
| `area-id` | subsystem, subsystem | {n} | P7, P8b |

## {Area title}

**Why:** {what makes this area warrant investigation for this change-set}
**Probes:** {catalog probes selected, and any whose toolchain gate is currently false}
**Failure classes:** {each class of every covered subsystem, mapped to a probe or marked not-applicable with a reason}

## Coverage

| Changed file | Areas |
|--------------|-------|
| `path` | `area-id` |

{One line stating that every changed file is assigned, or naming the ones that are not.}
```

## Rules

- **Areas are system-level, not per file.** One area per coherent subsystem impact. A plan with one area per changed file has clustered nothing.
- **A coupled subsystem is an area even with no changed file.** Callers of a changed API, its correlation counterparts, and the release-and-upgrade automation for any ABI, runtime or event-ABI change all qualify.
- **Every failure class is discharged.** Each failure class of every covered subsystem maps to at least one planned probe or is marked not-applicable with a one-line reason. A class left unplanned is a coverage gap to resolve, not a silent omission.
- **A gated probe is planned and flagged.** A probe whose toolchain gate is false stays in the plan, marked, so its degradation is visible before probing rather than discovered during it.
- **Coverage is shown, not asserted.** The coverage table maps changed files to areas; a claim of full coverage without the mapping is not reviewable.
- **Amend in place.** A revised plan updates this document; it does not append a second plan beside the first.
- **Line budget:** ~15 lines per area section, plus the two tables at one row per item.
