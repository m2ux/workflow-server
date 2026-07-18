---
name: design-context-readme
description: Template and guidelines for the README.md entry-point of a workflow-design session's planning folder. Conforms to the canonical meta planning-readme guide, with design-session sections appended.
metadata:
  version: 1.1.0
  order: 5
---

# Design Session README Guide

The `README.md` is the entry point for a workflow-design session's planning folder. It is an **index**: summary plus links to canonical artifacts. It follows the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md); this resource supplies the design-session seed template and the design-session sections (Design Decisions, Compliance Findings, Scope Manifest) after Solution Overview.

## Template

```markdown
# [Descriptive Change Name] — [Month Year]

> [Create/Update/Review] · Created [YYYY-MM-DD] · **Status:** [Planning/Drafting/Reviewing/Complete]

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences: what this workflow does (or what is changing), and why this session is being run]

## Problem Overview

[One-line pointer + link to design-specification.md — do not restate the purpose essay.]

## Solution Overview

[One or two short pointer sentences + links to design-specification.md and scope-manifest.md — do not restate the spec body.]

## Design Decisions

*[Short pointers + links to canonical artifacts (spec, assumptions, impact) — not full rationale restatements.]*

## Compliance Findings

*[Severity-rated findings when audits have run. "No findings" until then.]*

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| — | *None yet* | — | — |

## Scope Manifest

*[Link/pointer to the scope-manifest artifact — not a full file-list mirror.]*

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

The shared header-line, Executive Summary, Progress-table, and Links-table rules are defined in the canonical [Planning Folder README Guide](../../meta/resources/planning-readme.md). Design-session specifics:

- **Classifier** — the session mode: `Create`, `Update`, or `Review`. Status values: `Planning`, `Drafting`, `Reviewing`, `Complete`.
- **Problem Overview** — link-only slot: pointer + link to `design-specification.md` (canonical home for purpose / change goals). Do not restate the purpose essay.
- **Solution Overview** — link-only slot: short pointer + links to `design-specification.md` and `scope-manifest.md` for the file breakdown. Do not restate the spec body.
- **Progress table** — one row per activity the active mode runs, seeded from the workflow definition (not a hard-coded list in this template).

### Design Decisions

Short pointers + links to the canonical artifacts (design specification, assumptions log, impact analysis, and other confirmed surfaces). Do not restate full rationales or choice essays in the README body; COMPLETE.md links here and to those same homes.

### Compliance Findings

Use the severity ordering Critical → High → Medium → Low, one row per finding. Leave the single "None yet" row until findings exist. Detail lives in audit/satellite finding files; this table is the index.

### Scope Manifest

A link/pointer to the confirmed scope-manifest artifact. Do not mirror the complete file list in the README.
