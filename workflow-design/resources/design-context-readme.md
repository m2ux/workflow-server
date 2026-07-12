---
name: design-context-readme
description: Template and guidelines for the README.md entry-point of a workflow-design session's planning folder.
metadata:
  order: 5
---

# Design Session README Guide

**Purpose:** Guidelines for creating the `README.md` entry-point document for a workflow-design session's planning folder. It is the workflow-design counterpart of the work-package [readme](../../work-package/resources/readme.md) guide.

---

## Overview

The `README.md` is the entry point and executive summary for a workflow-design session. It answers "which workflow is being created/updated/reviewed, in what mode, and how far along is the work?" in under two minutes, and links the session's planning artifacts (compliance report, review snapshot) by phase.

---

## Template

```markdown
# [Workflow ID] — Design Session

**Created:** [Date]  
**Mode:** [Create/Update/Review]  
**Status:** [Planning/Drafting/Reviewing/Complete]

---

## 🎯 Executive Summary

[2-3 sentences: what this workflow does (or what is changing), and why this session is being run]

---

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses (activity sequencing, checkpoint necessity, technique bindings, rule enforcement). Left as placeholder until requirements refinement populates it.*

---

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run. "No findings" until then.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

---

## Scope Manifest

*Files to create, modify, or remove for this workflow, confirmed during scope-and-draft. Left as placeholder until then.*

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ⬚ Pending |
| 03 | Requirements Refinement | Create, Update | ⬚ Pending |
| 04 | Pattern Analysis / Impact Analysis | Create / Update | ⬚ Pending |
| 06 | Scope and Draft | Create, Update | ⬚ Pending |
| 08 | Quality Review | All | ⬚ Pending |
| 09 | Validate and Commit | All | ⬚ Pending |
| 10 | Post-Update Review | Update | ⬚ Pending |
| 11 | Retrospective | Create, Update | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/[workflow-id]/` |
| Related workflow | [name](../../[related]/README.md) |

---

**Status:** Ready for drafting
```

---

## Section Guidelines

### Header Block

| Field | Description | Example |
|-------|-------------|---------|
| **Workflow ID** | The workflow being created, updated, or reviewed | `incident-response` |
| **Created** | Exact creation date | `2026-06-26` |
| **Mode** | The operation type set at intake | `Create`, `Update`, `Review` |
| **Status** | Current state of the session | `Planning`, `Drafting`, `Reviewing`, `Complete` |

### Executive Summary

Two to three sentences answering: what does this workflow do (or what is changing), and why is this session being run.

### Design Decisions

Capture the non-obvious design choices and their rationale as they are confirmed — activity boundaries, which constraints become checkpoints, technique bindings chosen, rule scope. This is the durable record of *why* the workflow is shaped the way it is.

### Compliance Findings

Populated by the quality-review (create/update) and post-update-review (update) activities. Use the severity ordering Critical → High → Medium → Low, one row per finding. Leave the single "None yet" row until findings exist.

### Scope Manifest

The complete list of files to create, modify, or remove, confirmed before drafting. Mirrors the `scope_manifest` variable.

### Activity Progress

The primary navigation for the planning folder. Use the status indicators ⬚ Pending, ◐ In Progress, ✅ Complete, ❌ Blocked, ⊘ Cancelled. Omit activities that the active mode skips. The # column matches the producing activity's number so artifacts sort by phase.

### Links Table

The target workflow's location in the `workflows/` worktree, plus any related workflows. Planning artifacts (compliance report, review snapshot) are reached from the Activity Progress rows, not here.

---

## Related Guides

- [Work Package README Guide](../../work-package/resources/readme.md) — the work-package counterpart this template parallels
- [Workflow Design Workflow](../README.md)
