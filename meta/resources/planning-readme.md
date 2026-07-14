---
name: planning-readme
description: Canonical structure and rules for the README.md entry-point of any workflow's planning folder — the shared skeleton that per-workflow README templates conform to.
---

# Planning Folder README Guide

The `README.md` is the entry point for a workflow's planning folder (git hosting renders it when browsing). It is an **index** — a hub of links answering "what is this work, and what is its current status?" in under two minutes. Each linked artifact is the single home of its own content; the README links to it (single-source-and-link).

This is the **canonical structure** shared across workflows. Each workflow supplies a concrete seed template that conforms to it (`work-package/readme`, `workflow-design/design-context-readme`), consumed by `work-package::manage-artifacts::create-readme` to seed the file and `verify-readme-conforms` to drift-check it. A workflow may **append domain-specific sections after Solution Overview**; those extra sections are documented in that workflow's own README resource.

## Skeleton

```markdown
# [Descriptive Name] — [Month Year]

> [Classifier] · Created [YYYY-MM-DD] · **Status:** [status]

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences explaining what this delivers and why it matters]

## Problem Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| NN | [Artifact](artifact.md) | 3-8 word summary | 15-30m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| [External reference] | [link] |
```

## Rules

### Header line

- One blockquote line: `[Classifier] · Created [date] · **Status:** [status]`. The **classifier** is the workflow's one-word kind label (e.g. work-package type `Feature`/`Bug-Fix`/`Enhancement`/`Refactor`; workflow-design mode `Create`/`Update`/`Review`).
- State the status once, in this line (state-once-per-artifact). Outcomes live in the completion document, linked from Progress (single-source-and-link).
- When the README is updated after completion, append `· Revised YYYY-MM-DD`.
- The `Note` blockquote is retained whenever the Progress table carries an Estimate column.

### Executive Summary

2-3 sentences answering: what does this deliver, why does it matter, what's the key benefit — with the concrete problem and measurable impact where known.

### Problem Overview / Solution Overview

Plain-language sections for non-technical stakeholders, each exactly two paragraphs, written by the `stakeholder-overview` technique (heading passed as `readme_section_heading`); the placeholder is replaced when the producing step executes.

- **Problem Overview** — what the system currently does and why it's problematic, then the consequences.
- **Solution Overview** — what the change does and how it works at a high level; links the plan for the task breakdown.

### Progress table

The primary navigation for the planning folder.

- Items link their artifact files. An inline item such as Implementation or Validation is plain text with `—` in the # column.
- The # column is the artifact's numbered prefix, matching the producing activity (artifacts from the same activity share the number).
- Description: 3-8 word summary. Estimate: expected agentic time — adjust template defaults to the work's complexity.
- List the items that were or will be produced.
- Status vocabulary: `⬚ Pending`, `◐ In Progress`, `✅ Complete`, `❌ Blocked`, `⊘ Cancelled`.

### Links table

Holds external references — tracker issue, parent epic, PR. Artifact links belong in the Progress table.
