---
name: design-context-readme
description: Template and guidelines for the README.md entry-point of a workflow-design session's planning folder. Conforms to the canonical meta planning-readme guide, with design-session sections appended.
metadata:
  version: 1.0.0
  order: 5
---

# Design Session README Guide

The `README.md` is the entry point for a workflow-design session's planning folder. It follows the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md); this resource supplies the concrete design-session seed template and documents the design-session-specific sections (Design Decisions, Compliance Findings, Scope Manifest) appended after Solution Overview.

## Template

```markdown
# [Descriptive Change Name] — [Month Year]

> [Create/Update/Review] · Created [YYYY-MM-DD] · **Status:** [Planning/Drafting/Reviewing/Complete]

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences: what this workflow does (or what is changing), and why this session is being run]

## Problem Overview

*Populated by the present-problem-overview step (intake-and-context activity).*

## Solution Overview

*Populated by the present-solution-overview step (scope-and-draft activity).*

## Design Decisions

*Key design decisions and their rationale, captured as the session progresses (activity sequencing, checkpoint necessity, technique bindings, rule enforcement). Left as placeholder until requirements refinement populates it.*

## Compliance Findings

*Severity-rated findings from quality review / post-update review, populated when those activities run. "No findings" until then.*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

## Scope Manifest

*Files to create, modify, or remove for this workflow, confirmed during scope-and-draft. Left as placeholder until then.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | Intake and Context | Classify mode; load schema + format baseline | 10-20m | ⬚ Pending |
| 03 | Requirements Refinement | Elicit and refine the change requirements | 20-45m | ⬚ Pending |
| 04 | Pattern Analysis | Corpus reuse survey (create mode) | 15-30m | ⬚ Pending |
| 05 | Impact Analysis | Blast radius of the change (update mode) | 15-30m | ⬚ Pending |
| 06 | Scope and Draft | Confirm scope manifest; draft the definition files | 30-90m | ⬚ Pending |
| 08 | Quality Review | Multi-lens audit vs schema, principles, anti-patterns | 20-45m | ⬚ Pending |
| 09 | Validate and Commit | Verify scope, README, build; commit | 10-20m | ⬚ Pending |
| 10 | Post-Update Review | Update-mode regression review | 15-30m | ⬚ Pending |
| 11 | Retrospective | Session lessons and follow-ups | 10-20m | ⬚ Pending |
| 08 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, design decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/[workflow-id]/` |
| Related workflow | [name](../../[related]/README.md) |
| PR | [#N](https://{repo_host}/{org}/{repo}/pull/N) |
```

## Rules

The shared header-line, Executive Summary, Problem/Solution Overview, Progress-table, Links-table, and layout-discipline rules (status stated once, no footer, no `---`, single-source-and-link) are defined in the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md). Design-session specifics:

- **Classifier** — the session mode: `Create`, `Update`, or `Review`. Status values: `Planning`, `Drafting`, `Reviewing`, `Complete`.
- **Problem Overview** — written by the `present-problem-overview` step (`intake-and-context` activity): what the current workflow does and why it needs changing.
- **Solution Overview** — written by the `present-solution-overview` step (`scope-and-draft` activity): what the change does at a high level; links the scope manifest rather than re-listing it.
- **Progress table** — lists the session's activities as Items; omit activities the active mode skips. Review mode branches straight to quality review and has no planning README.

### Design Decisions

Capture the non-obvious design choices and their rationale as they are confirmed — activity boundaries, which constraints become checkpoints, technique bindings chosen, rule scope. This is the durable record of *why* the workflow is shaped the way it is; COMPLETE.md draws its Design Decisions from here.

### Compliance Findings

Populated by the quality-review (create/update) and post-update-review (update) activities. Use the severity ordering Critical → High → Medium → Low, one row per finding. Leave the single "None yet" row until findings exist.

### Scope Manifest

The complete list of files to create, modify, or remove, confirmed before drafting. Mirrors the `scope_manifest` variable.

## Related Guides

- [Planning Folder README Guide](../../meta/resources/planning-readme.md) — the canonical structure this template conforms to
- [Work Package README Guide](../../work-package/resources/readme.md) — the work-package counterpart, conforming to the same canonical structure
- [Workflow Design Workflow](../README.md)
