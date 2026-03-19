---
id: planning-folder-template
version: 1.0.0
---

# Planning Folder Template

**Purpose:** Templates for the initial planning folder structure created during folder-setup.

---

## Folder Location

```
.engineering/artifacts/planning/YYYY-MM-DD-{initiative-name}/
```

Use the current date and a hyphenated initiative name derived from `initiative_name`.

---

## START-HERE.md Skeleton

```markdown
# {Initiative Name}

**Date:** {YYYY-MM-DD}
**Status:** Planning
**Progress:** 0/{N} packages complete

---

## Executive Summary

[To be completed during finalize-roadmap]

## Work Packages

| # | Package | Status | Priority | Effort | Dependencies |
|---|---------|--------|----------|--------|-------------|
| 1 | [Package Name] | Planned | — | — | — |

## Success Criteria

[To be completed during finalize-roadmap]

## Timeline

[To be completed during finalize-roadmap]

## Documents

| Document | Purpose |
|----------|---------|
| START-HERE.md | Executive summary and status tracking |
| README.md | Navigation and document index |
```

---

## README.md Skeleton

```markdown
# {Initiative Name} — Planning Documents

> Navigation index for all planning artifacts.

## Documents

| # | Document | Description |
|---|----------|-------------|
| — | [START-HERE.md](START-HERE.md) | Executive summary and status |

## Work Package Plans

[Plans will be added during package-planning activity]
```
