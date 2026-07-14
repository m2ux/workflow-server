# Audience Attribute on Technique Output Declarations - July 2026

> Enhancement · Created 2026-07-13 · **Status:** In Progress

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds an `audience` attribute (`human | agent`) to technique output / `#### artifact` declarations so the intended reader of each artifact is known at authoring time. Agent-audience artifacts are serialized as JSON under the `artifactPrefix` rule, letting later work convert agent-state artifacts to structured data. This is PR #1 of epic #224 (cluster 2 / backlog item V4) and the RC4 enabler for the downstream verbosity-reduction work.

## Problem Overview

The workflow server delivers "techniques" — reusable instruction blocks — to the AI agents doing the work, and each technique names the documents (artifacts) it will produce. Today those declarations say nothing about who the document is really for. Some artifacts are written for people to read and review; others exist only so the agent can hand information to a later step in the same process. Because the two kinds look identical, every artifact is written as free-flowing prose, which is verbose, slow to produce, and awkward for an agent to read back reliably later in the run.

This work package lets each artifact declaration state its intended reader — a person or the agent itself. Knowing the reader up front means agent-only artifacts can be written as compact structured data instead of prose, which is faster to produce, cheaper in tokens, and far more dependable to read back. It is the first, enabling step of a larger effort to reduce planning-artifact verbosity: on its own it changes nothing a reader sees, but it unlocks the later changes that convert agent-only documents to structured form.

## Solution Overview

*Populated during plan-prepare activity.*

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | `Design philosophy` | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | `Assumptions log` | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | `Work package plan` | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Spec, schema, loader, projection, lint changes | 2-4h | ⬚ Pending |
| 06 | `Change block index` | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | `Code review` | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | `Comprehension artifact` | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Close-out (COMPLETE.md)](complete-wp.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ⬚ Pending |

## 🔗 Links

| Resource | Link |
|----------|------|
| Parent Epic | [#224](https://github.com/m2ux/workflow-server/issues/224) — Epic: work-package planning-artifact verbosity reduction |
| PR | [#227](https://github.com/m2ux/workflow-server/pull/227) |
