# Requirements-Refinement Design Fixes — July 2026

> Update · Created 2026-07-27 · **Status:** Planning

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

The `requirements-refinement` workflow (v1.1.0) has never been audited against the workflow-design canon, so design-principle violations and schema anti-patterns have accumulated across its five activities, six techniques, and four resources. This session audits the workflow end to end and fixes every violation in place, leaving its purpose and lifecycle unchanged. The result is a workflow whose activity, checkpoint, and technique shapes are conformant, so future changes start from a clean baseline instead of propagating the same defects.

## Problem Overview

This project keeps a library of reusable "workflows" — written procedures that an AI assistant follows step by step to get a job done consistently. One of them, requirements refinement, takes a meeting transcript or a rough document and turns it into a tidy, formal list of requirements. Like any set of written instructions, a workflow can drift out of line with the house style over time: a question asked in the wrong place, a choice offered to the person in charge that quietly leads nowhere, a counter the instructions rely on that nothing ever actually counts. The requirements-refinement workflow has never been checked against the house standards since it was written.

The practical consequence is that the workflow behaves less predictably than it looks. Some of the gaps are cosmetic, but others are real: a safety limit meant to stop the workflow retrying forever is written as a loose number in one place while the setting that was supposed to control it sits unused elsewhere, and at least one option offered to the user has no defined effect. This work reads the whole workflow against the project's written design standards, lists every place it departs from them, and corrects each one — without changing what the workflow is for or the order in which it does its job. Afterwards, the people who rely on it get the same result every time, and the next person to change it starts from a clean, consistent baseline.

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | 01 | [Format conventions](format-conventions.md) | Authoring literacy notes | 5-10m | ✅ |
| 3 | 03 | [Design specification](design-specification.md) | Change goals and constraints | 20-40m | ✅ |
| 4 | 03 | [Assumptions log](assumptions-log.md) | Open and settled assumptions | 10-15m | ✅ |
| 5 | 04 | [Pattern analysis](pattern-analysis.md) | Applicable patterns and practices | 20-40m | ⊘ |
| 6 | 05 | [Impact analysis](impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 7 | 06 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 8 | 06 | [Drafting plan](drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 9 | 06 | [Draft attestation](draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 10 | 06 | [File review note](file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 11 | 08 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 12 | 08 | [Principle findings](principle-findings.md) | Principles audit satellite | 10-20m | ⬚ |
| 13 | 08 | [Anti-pattern findings](anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ⬚ |
| 14 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 15 | 10 | Post-update review | Follow-up after merge path | 15-30m | ⬚ |
| 16 | 11 | Retrospective | Session close-out | 15-30m | ⬚ |
| 17 | 11 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/requirements-refinement/` |
| Structural inventory | [structural-inventory.md](01-structural-inventory.md) |
| Format conventions | [format-conventions.md](01-format-conventions.md) |
| Design specification | [design-specification.md](03-design-specification.md) |
| Assumptions log | [assumptions-log.md](03-assumptions-log.md) |
| Follow-ups | [follow-ups.md](03-follow-ups.md) |

## Design Decisions

Each row points at its canonical home; the statement of the decision lives there.

| Decision | Home |
|----------|------|
| Seven change goals (G1–G7) and the out-of-scope boundary for this update | [design specification](03-design-specification.md#purpose) |
| The correction cap lives in the transition condition, and the parallel `max_correction_iterations` variable is removed | [design specification](03-design-specification.md#rules) |
| Activity files are not renumbered — the `02` gap stays | [design specification](03-design-specification.md#purpose) |
| Technique-surface changes are in scope though the update dimension set omits them | [assumptions log](03-assumptions-log.md) |
