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

*[What the current workflow does and why this session is needed — filled when known.]*

## Solution Overview

*[What the change does at a high level; link the scope manifest for the file breakdown — filled when known.]*

## Design Decisions

*[Key design decisions and their rationale — activity sequencing, checkpoint necessity, technique bindings, rule enforcement. Placeholder until confirmed.]*

## Compliance Findings

*[Severity-rated findings when audits have run. "No findings" until then.]*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

## Scope Manifest

*[Files to create, modify, or remove — placeholder until confirmed.]*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| … | *[One row per activity the active mode runs — seed from the workflow activity list; do not maintain a parallel inventory in this template.]* | … | … | ⬚ Pending |
| … | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, design decisions, limitations | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/[workflow-id]/` |
| Related workflow | [name](../../[related]/README.md) |
| PR | [#N](https://{repo_host}/{org}/{repo}/pull/N) |
```

## Rules

The shared header-line, Executive Summary, Problem/Solution Overview, Progress-table, and Links-table rules are defined in the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md). Design-session specifics:

- **Classifier** — the session mode: `Create`, `Update`, or `Review`. Status values: `Planning`, `Drafting`, `Reviewing`, `Complete`.
- **Problem Overview** — what the current workflow does and why it needs changing.
- **Solution Overview** — what the change does at a high level; links the scope manifest for the file breakdown.
- **Progress table** — one row per activity the active mode runs, seeded from the workflow definition (not a hard-coded list in this template).

### Design Decisions

Capture the non-obvious design choices and their rationale as they are confirmed — activity boundaries, which constraints become checkpoints, technique bindings chosen, rule scope. This is the durable record of *why* the workflow is shaped the way it is; COMPLETE.md draws its Design Decisions from here.

### Compliance Findings

Use the severity ordering Critical → High → Medium → Low, one row per finding. Leave the single "None yet" row until findings exist.

### Scope Manifest

The complete list of files to create, modify, or remove, confirmed before drafting. Mirrors the `scope_manifest` variable.
